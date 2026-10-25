-- ============================================================
-- Observabilidad operativa: latido del cron, sonda de escritura, alertas sin
-- ruido, integridad de las ofertas y contador de lectura.
-- Aplicar tras 20261024000000_quotation_customer_journey.sql. Aditiva e idempotente.
-- Solo guarda nombres, contadores y marcas de tiempo: NUNCA datos de clientes.
-- ============================================================

create table if not exists public.ops_heartbeats (
  name        text primary key,
  last_run_at timestamptz not null default now(),
  last_ok_at  timestamptz,
  last_ok     boolean not null default false,
  detail      jsonb not null default '{}'::jsonb
);

-- Registra que un proceso programado (p. ej. el cron de reintentos) SE EJECUTÓ y cómo terminó.
create or replace function public.ops_heartbeat(p_name text, p_ok boolean, p_detail jsonb default '{}'::jsonb)
returns void language sql as $$
  insert into public.ops_heartbeats(name, last_run_at, last_ok_at, last_ok, detail)
  values (p_name, now(), case when p_ok then now() end, p_ok, coalesce(p_detail, '{}'::jsonb))
  on conflict (name) do update set
    last_run_at = now(),
    last_ok_at = case when p_ok then now() else public.ops_heartbeats.last_ok_at end,
    last_ok = p_ok,
    detail = coalesce(p_detail, '{}'::jsonb)
$$;

-- Edad (segundos) del último latido correcto; null si nunca hubo uno.
create or replace function public.ops_heartbeat_age(p_name text) returns integer language sql stable as $$
  select extract(epoch from (now() - last_ok_at))::integer from public.ops_heartbeats where name = p_name
$$;

-- Sonda de ESCRITURA: demuestra que la base acepta escrituras (no solo lecturas).
create or replace function public.ops_write_probe() returns timestamptz language sql as $$
  insert into public.ops_heartbeats(name, last_run_at, last_ok_at, last_ok)
  values ('write_probe', now(), now(), true)
  on conflict (name) do update set last_run_at = now(), last_ok_at = now(), last_ok = true
  returning last_run_at
$$;

-- Qué piezas del esquema existen. Nombres, nunca datos.
create or replace function public.ops_schema_markers() returns jsonb language sql stable as $$
  select jsonb_build_object(
    'pipeline',      to_regclass('public.lead_deliveries') is not null
                     and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'quotes' and column_name = 'idempotency_key'),
    'attachments',   to_regclass('public.lead_attachments') is not null,
    'quotations',    to_regclass('public.lead_quotes') is not null,
    'quote_journey', to_regclass('public.quote_deliveries') is not null
                     and to_regprocedure('public.quote_customer_decide(text, text, text, text)') is not null,
    'ops',           true
  )
$$;

-- Alertas SIN RUIDO: una condición avisa una vez, repite solo tras el enfriamiento
-- y avisa su recuperación una vez.
create table if not exists public.ops_alerts (
  condition     text primary key,
  severity      text not null default 'error' check (severity in ('warn', 'error')),
  first_seen_at timestamptz not null default now(),
  last_sent_at  timestamptz not null default now(),
  resolved_at   timestamptz,
  times_sent    integer not null default 1
);

-- ¿Debe enviarse ahora el aviso de esta condición? Atómico: dos ejecuciones simultáneas no duplican.
create or replace function public.ops_alert_claim(p_condition text, p_severity text, p_cooldown_seconds integer)
returns boolean language plpgsql as $$
declare r public.ops_alerts;
begin
  insert into public.ops_alerts(condition, severity) values (p_condition, p_severity)
  on conflict (condition) do nothing;
  if found then return true; end if;
  select * into r from public.ops_alerts where condition = p_condition for update;
  if r.resolved_at is not null then
    update public.ops_alerts set resolved_at = null, first_seen_at = now(), last_sent_at = now(), times_sent = 1, severity = p_severity
      where condition = p_condition;
    return true;
  end if;
  if r.last_sent_at <= now() - make_interval(secs => p_cooldown_seconds) then
    update public.ops_alerts set last_sent_at = now(), times_sent = times_sent + 1, severity = p_severity where condition = p_condition;
    return true;
  end if;
  return false;
end $$;

-- La condición ya no se cumple: true si estaba activa (hay que avisar la recuperación).
create or replace function public.ops_alert_resolve(p_condition text) returns boolean language plpgsql as $$
declare n integer;
begin
  update public.ops_alerts set resolved_at = now() where condition = p_condition and resolved_at is null;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Lectura sin incrementar de un contador del limitador (para contar anomalías de seguridad).
create or replace function public.rate_limit_peek(p_key text, p_window_seconds integer) returns integer language sql stable as $$
  select coalesce((select count from public.rate_limits
                   where key = p_key and window_start > now() - make_interval(secs => p_window_seconds)), 0)
$$;

-- Integridad de las ofertas: toda oferta emitida debe conservar su instantánea y su huella.
create or replace function public.quote_integrity_report() returns jsonb language sql stable as $$
  select jsonb_build_object(
    'checked', count(*) filter (where snapshot_hash is not null),
    'issuedWithoutSnapshot', count(*) filter (where status in ('issued', 'accepted', 'rejected', 'superseded') and snapshot_hash is null and issued_at is not null),
    'hashMismatch', count(*) filter (where snapshot_hash is not null and snapshot_hash <> encode(sha256(convert_to(snapshot::text, 'UTF8')), 'hex')))
  from public.lead_quotes
$$;

alter table public.ops_heartbeats enable row level security;
alter table public.ops_alerts enable row level security;
do $$
declare t text; f text;
begin
  foreach t in array array['ops_heartbeats', 'ops_alerts'] loop
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on public.%I from anon', t); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke all on public.%I from authenticated', t); end if;
  end loop;
  foreach f in array array[
    'ops_heartbeat(text, boolean, jsonb)', 'ops_heartbeat_age(text)', 'ops_write_probe()', 'ops_schema_markers()',
    'ops_alert_claim(text, text, integer)', 'ops_alert_resolve(text)', 'rate_limit_peek(text, integer)', 'quote_integrity_report()'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke execute on function public.%s from anon', f); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke execute on function public.%s from authenticated', f); end if;
  end loop;
end $$;
