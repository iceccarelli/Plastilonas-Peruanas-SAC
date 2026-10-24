-- ============================================================
-- Cotización al cliente: partidas, instantánea inmutable, acceso por enlace,
-- decisión del cliente, entrega con estados y límite de tasa compartido.
-- Aplicar tras 20261023020000_rfq_quotations.sql. Aditiva e idempotente
-- (las dos funciones de cotización cambian de firma: se reemplazan).
--
-- Principios:
--  * El precio y los impuestos los fija una PERSONA. Emitir sin tratamiento de
--    impuestos explícito falla (`tax_required`): nada se asume.
--  * Emitir congela una INSTANTÁNEA (jsonb) y su SHA-256. Después, ninguna
--    columna que define la oferta puede cambiar: otra oferta = otra versión.
--  * El cliente no tiene cuenta: entra con un enlace cuyo token NUNCA se guarda
--    (solo su hash). Todo el acceso es por funciones que ejecuta el servidor.
-- ============================================================

alter table public.lead_quotes add column if not exists line_items jsonb not null default '[]'::jsonb;
alter table public.lead_quotes add column if not exists subtotal_cents bigint;
alter table public.lead_quotes add column if not exists tax_treatment text;
alter table public.lead_quotes add column if not exists tax_label text;
alter table public.lead_quotes add column if not exists tax_cents bigint;
alter table public.lead_quotes add column if not exists customer_terms text;
alter table public.lead_quotes add column if not exists snapshot jsonb;
alter table public.lead_quotes add column if not exists snapshot_hash text;
alter table public.lead_quotes add column if not exists resolved_via text;
alter table public.lead_quotes add column if not exists resolution_request_key text;

do $$ begin
  alter table public.lead_quotes add constraint lead_quotes_tax_treatment_check
    check (tax_treatment is null or tax_treatment in ('included', 'excluded', 'exempt'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.lead_quotes add constraint lead_quotes_tax_cents_check check (tax_cents is null or tax_cents >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.lead_quotes add constraint lead_quotes_resolved_via_check
    check (resolved_via is null or resolved_via in ('staff', 'customer'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.lead_quotes add constraint lead_quotes_items_array_check
    check (jsonb_typeof(line_items) = 'array' and jsonb_array_length(line_items) <= 40);
exception when duplicate_object then null; end $$;
-- Una oferta emitida con el flujo nuevo siempre lleva instantánea y huella: lo garantiza
-- lead_quote_issue (única vía de emisión) y lo vigila quote_integrity_report. NO es una
-- restricción CHECK a propósito: una oferta emitida ANTES de esta migración no tiene
-- instantánea y debe poder seguir resolviéndose (aceptada/rechazada) sin error.
alter table public.lead_quotes drop constraint if exists lead_quotes_snapshot_check;

-- ---------------------------------------------------------------- validación
create or replace function public.lead_quote_check_totals(
  p_items jsonb, p_amount bigint, p_tax_treatment text, p_tax_label text, p_tax_cents bigint
) returns bigint language plpgsql immutable as $$
declare
  sub bigint; expected bigint;
begin
  if p_tax_treatment is not null and length(btrim(coalesce(p_tax_label, ''))) = 0 then
    raise exception 'tax_label_required';
  end if;
  if p_tax_treatment = 'excluded' and p_tax_cents is null then
    raise exception 'tax_amount_required';
  end if;
  if jsonb_array_length(p_items) = 0 then
    -- Cotización heredada sin partidas: el total es lo único que hay.
    return p_amount;
  end if;
  select coalesce(sum((i->>'amount_cents')::bigint), 0) into sub from jsonb_array_elements(p_items) i;
  -- (el CASE va fuera del IF: plpgsql cierra la condición en el primer THEN)
  expected := sub + (case when p_tax_treatment = 'excluded' then p_tax_cents else 0 end);
  if p_amount <> expected then
    raise exception 'totals_mismatch';
  end if;
  return sub;
end $$;

drop function if exists public.lead_quote_create(uuid, text, bigint, text, date, text, text);
create or replace function public.lead_quote_create(
  p_quote uuid, p_actor text, p_amount bigint, p_currency text,
  p_valid_until date, p_summary text, p_notes text,
  p_items jsonb default '[]'::jsonb, p_tax_treatment text default null,
  p_tax_label text default null, p_tax_cents bigint default null, p_terms text default null
) returns public.lead_quotes language plpgsql as $$
declare
  q public.quotes; v integer; r public.lead_quotes; sub bigint;
begin
  select * into q from public.quotes where id = p_quote for update;
  if not found then raise exception 'lead_not_found'; end if;
  if upper(coalesce(q.status, 'NEW')) not in ('QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED') then
    raise exception 'lead_not_ready';  -- no se cotiza un lead sin calificar
  end if;
  sub := public.lead_quote_check_totals(p_items, p_amount, p_tax_treatment, p_tax_label, p_tax_cents);
  select coalesce(max(version), 0) + 1 into v from public.lead_quotes where quote_id = p_quote;
  insert into public.lead_quotes(quote_id, version, amount_cents, currency, valid_until, summary, notes, created_by,
                                 line_items, subtotal_cents, tax_treatment, tax_label, tax_cents, customer_terms)
  values (p_quote, v, p_amount, p_currency, p_valid_until, p_summary, p_notes, p_actor,
          p_items, sub, p_tax_treatment, nullif(btrim(p_tax_label), ''), p_tax_cents, nullif(btrim(p_terms), ''))
  returning * into r;
  if upper(q.status) = 'QUALIFIED' then
    update public.quotes set status = 'QUOTE_PREPARATION', updated_at = now() where id = p_quote;
    insert into public.lead_events(quote_id, actor, action, from_value, to_value)
    values (p_quote, p_actor, 'status', 'QUALIFIED', 'QUOTE_PREPARATION');
  end if;
  insert into public.lead_events(quote_id, actor, action, to_value, note)
  values (p_quote, p_actor, 'quote', 'v' || v || ' draft', null);
  return r;
end $$;

-- Editar un BORRADOR (nunca una oferta emitida: esa se reemplaza con otra versión).
create or replace function public.lead_quote_update_draft(
  p_id uuid, p_actor text, p_amount bigint, p_currency text,
  p_valid_until date, p_summary text, p_notes text,
  p_items jsonb default '[]'::jsonb, p_tax_treatment text default null,
  p_tax_label text default null, p_tax_cents bigint default null, p_terms text default null
) returns public.lead_quotes language plpgsql as $$
declare
  r public.lead_quotes; q public.quotes; sub bigint;
begin
  select * into r from public.lead_quotes where id = p_id;
  if not found then raise exception 'quote_not_found'; end if;
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = p_id for update;
  if r.status <> 'draft' then raise exception 'quote_not_draft'; end if;
  sub := public.lead_quote_check_totals(p_items, p_amount, p_tax_treatment, p_tax_label, p_tax_cents);
  update public.lead_quotes set
    amount_cents = p_amount, currency = p_currency, valid_until = p_valid_until, summary = p_summary,
    notes = p_notes, line_items = p_items, subtotal_cents = sub, tax_treatment = p_tax_treatment,
    tax_label = nullif(btrim(p_tax_label), ''), tax_cents = p_tax_cents, customer_terms = nullif(btrim(p_terms), '')
  where id = p_id returning * into r;
  insert into public.lead_events(quote_id, actor, action, to_value)
  values (r.quote_id, p_actor, 'quote', 'v' || r.version || ' draft edited');
  return r;
end $$;

-- ------------------------------------------------------ emisión + instantánea
drop function if exists public.lead_quote_issue(uuid, text);
create or replace function public.lead_quote_issue(p_id uuid, p_actor text, p_issuer jsonb default '{}'::jsonb)
returns public.lead_quotes language plpgsql as $$
declare
  r public.lead_quotes; q public.quotes; snap jsonb; ts timestamptz := now();
begin
  select * into r from public.lead_quotes where id = p_id;
  if not found then raise exception 'quote_not_found'; end if;
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = p_id for update;
  if r.status <> 'draft' then raise exception 'quote_not_draft'; end if;
  if r.valid_until is null or r.valid_until < (ts at time zone 'America/Lima')::date then
    raise exception 'validity_required';
  end if;
  if r.tax_treatment is null then raise exception 'tax_required'; end if;
  if coalesce(q.rfq_code, '') = '' then raise exception 'lead_not_found'; end if;

  -- Solo lo que el CLIENTE debe ver: nunca notas internas ni datos del personal.
  snap := jsonb_build_object(
    'schema', 1,
    'reference', q.rfq_code || '-V' || r.version,
    'rfq', q.rfq_code,
    'version', r.version,
    'issuedAt', to_char(ts at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'validUntil', r.valid_until,
    'currency', r.currency,
    'issuer', coalesce(p_issuer, '{}'::jsonb),
    'customer', jsonb_build_object(
      'name', q.full_name, 'company', q.company, 'email', q.customer_email, 'ruc', q.payload->>'ruc'),
    'request', jsonb_build_object(
      'product', q.product, 'quantity', q.quantity, 'deliveryCity', q.payload->>'deliveryCity'),
    'summary', r.summary,
    'items', r.line_items,
    'subtotalCents', coalesce(r.subtotal_cents, r.amount_cents),
    'tax', jsonb_build_object('treatment', r.tax_treatment, 'label', r.tax_label, 'cents', r.tax_cents),
    'totalCents', r.amount_cents,
    'terms', r.customer_terms
  );

  update public.lead_quotes set status = 'superseded', resolved_at = ts
    where quote_id = r.quote_id and status = 'issued';
  -- Los enlaces de la oferta anterior dejan de abrir la oferta: quedan «reemplazados».
  update public.quote_access_tokens set revoked_at = ts, revoked_reason = 'superseded'
    where revoked_at is null and lead_quote_id in
      (select id from public.lead_quotes where quote_id = r.quote_id and status = 'superseded');

  update public.lead_quotes set
    status = 'issued', issued_by = p_actor, issued_at = ts,
    snapshot = snap, snapshot_hash = encode(sha256(convert_to(snap::text, 'UTF8')), 'hex')
  where id = p_id returning * into r;

  -- Intención de entrega persistida en la MISMA transacción: emitir sin cola es imposible.
  insert into public.quote_deliveries(lead_quote_id, channel, status, next_attempt_at)
  values (r.id, 'email', 'queued', ts)
  on conflict (lead_quote_id, channel) do nothing;

  if upper(q.status) = 'QUOTE_PREPARATION' then
    update public.quotes set status = 'QUOTED', updated_at = now() where id = q.id;
    insert into public.lead_events(quote_id, actor, action, from_value, to_value)
    values (q.id, p_actor, 'status', 'QUOTE_PREPARATION', 'QUOTED');
  end if;
  insert into public.lead_events(quote_id, actor, action, to_value)
  values (q.id, p_actor, 'quote', 'v' || r.version || ' issued');
  return r;
end $$;

-- Comprueba que la instantánea guardada sigue siendo la que se emitió.
create or replace function public.lead_quote_verify(p_id uuid) returns boolean language sql stable as $$
  select snapshot is not null
     and snapshot_hash = encode(sha256(convert_to(snapshot::text, 'UTF8')), 'hex')
  from public.lead_quotes where id = p_id
$$;

-- ----------------------------------------------------------- inmutabilidad
create or replace function public.lead_quotes_guard() returns trigger language plpgsql as $$
begin
  if old.status = 'draft' then
    return new;
  end if;
  if new.quote_id is distinct from old.quote_id or new.version is distinct from old.version
     or new.amount_cents is distinct from old.amount_cents or new.currency is distinct from old.currency
     or new.valid_until is distinct from old.valid_until or new.summary is distinct from old.summary
     or new.notes is distinct from old.notes or new.created_by is distinct from old.created_by
     or new.line_items is distinct from old.line_items or new.subtotal_cents is distinct from old.subtotal_cents
     or new.tax_treatment is distinct from old.tax_treatment or new.tax_label is distinct from old.tax_label
     or new.tax_cents is distinct from old.tax_cents or new.customer_terms is distinct from old.customer_terms
     or new.snapshot is distinct from old.snapshot or new.snapshot_hash is distinct from old.snapshot_hash
     or new.issued_by is distinct from old.issued_by or new.issued_at is distinct from old.issued_at then
    raise exception 'quote_immutable';
  end if;
  if new.status is distinct from old.status
     and not (old.status = 'issued' and new.status in ('accepted', 'rejected', 'superseded')) then
    raise exception 'quote_status_invalid';
  end if;
  return new;
end $$;
drop trigger if exists lead_quotes_guard_trg on public.lead_quotes;
create trigger lead_quotes_guard_trg before update on public.lead_quotes
  for each row execute function public.lead_quotes_guard();

-- ---------------------------------------------------- tokens de acceso (hash)
create table if not exists public.quote_access_tokens (
  id            uuid primary key default gen_random_uuid(),
  lead_quote_id uuid not null references public.lead_quotes(id) on delete cascade,
  -- SHA-256 hex del token. El token en claro no se guarda en ninguna parte.
  token_hash    text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  generation    integer not null check (generation > 0),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  revoked_reason text check (revoked_reason is null or revoked_reason in ('superseded', 'manual')),
  created_at    timestamptz not null default now(),
  unique (lead_quote_id, generation)
);
create index if not exists quote_access_tokens_quote_idx on public.quote_access_tokens(lead_quote_id);

-- Registra el hash del enlace de una oferta VIGENTE (idempotente por generación).
create or replace function public.quote_token_register(p_quote uuid, p_hash text, p_generation integer, p_expires timestamptz)
returns boolean language plpgsql as $$
declare r public.lead_quotes;
begin
  select * into r from public.lead_quotes where id = p_quote for update;
  if not found then raise exception 'quote_not_found'; end if;
  if r.status <> 'issued' then raise exception 'quote_not_issued'; end if;
  insert into public.quote_access_tokens(lead_quote_id, token_hash, generation, expires_at)
  values (p_quote, p_hash, p_generation, p_expires)
  on conflict (lead_quote_id, generation) do nothing;
  return true;
end $$;

-- Revoca todos los enlaces de una oferta y abre la siguiente generación.
create or replace function public.quote_token_rotate(p_quote uuid, p_actor text)
returns integer language plpgsql as $$
declare r public.lead_quotes; q public.quotes; g integer;
begin
  select * into r from public.lead_quotes where id = p_quote;
  if not found then raise exception 'quote_not_found'; end if;
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = p_quote for update;
  if r.status <> 'issued' then raise exception 'quote_not_issued'; end if;
  update public.quote_access_tokens set revoked_at = now(), revoked_reason = 'manual'
    where lead_quote_id = p_quote and revoked_at is null;
  select coalesce(max(generation), 0) + 1 into g from public.quote_access_tokens where lead_quote_id = p_quote;
  -- La entrega vuelve a la cola con el enlace nuevo.
  update public.quote_deliveries set status = 'queued', attempts = 0, last_error = null, last_http_status = null,
      provider_message_id = null, sent_at = null, confirmed_at = null, next_attempt_at = now(), generation = g, updated_at = now()
    where lead_quote_id = p_quote and channel = 'email';
  insert into public.lead_events(quote_id, actor, action, to_value)
  values (q.id, p_actor, 'quote', 'v' || r.version || ' link rotated');
  return g;
end $$;

-- Lo que el cliente puede ver de un enlace. SIN efectos secundarios (un GET de
-- un antivirus de correo no cambia nada). Devuelve solo la instantánea y el estado.
create or replace function public.quote_public_view(p_hash text) returns jsonb language plpgsql stable as $$
declare t public.quote_access_tokens; r public.lead_quotes;
begin
  select * into t from public.quote_access_tokens where token_hash = p_hash;
  if not found then return jsonb_build_object('state', 'not_found'); end if;
  if t.revoked_at is not null then
    return jsonb_build_object('state', 'revoked', 'reason', coalesce(t.revoked_reason, 'manual'));
  end if;
  if now() > t.expires_at then return jsonb_build_object('state', 'expired'); end if;
  select * into r from public.lead_quotes where id = t.lead_quote_id;
  if r.status = 'superseded' then return jsonb_build_object('state', 'revoked', 'reason', 'superseded'); end if;
  return jsonb_build_object(
    'state', case when r.status = 'issued' then 'open' else 'resolved' end,
    'outcome', case when r.status in ('accepted', 'rejected') then r.status else null end,
    'resolvedAt', r.resolved_at,
    'snapshot', r.snapshot,
    'snapshotHash', r.snapshot_hash,
    'quoteId', r.id
  );
end $$;

-- Decisión del cliente: atómica, exactamente una vez, con repetición inocua.
create or replace function public.quote_customer_decide(p_hash text, p_outcome text, p_reason text, p_request_key text)
returns jsonb language plpgsql as $$
declare t public.quote_access_tokens; r public.lead_quotes; q public.quotes; reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if p_outcome not in ('accepted', 'rejected') then raise exception 'invalid_outcome'; end if;
  if p_request_key is null or p_request_key !~ '^[A-Za-z0-9_-]{16,64}$' then raise exception 'invalid_request'; end if;
  if reason is not null and length(reason) > 500 then raise exception 'reason_too_long'; end if;
  select * into t from public.quote_access_tokens where token_hash = p_hash;
  if not found then raise exception 'link_invalid'; end if;
  select * into r from public.lead_quotes where id = t.lead_quote_id;
  -- Mismo orden de bloqueo que el personal: primero el lead, luego la cotización.
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = t.lead_quote_id for update;
  select * into t from public.quote_access_tokens where id = t.id;
  if t.revoked_at is not null then raise exception 'link_revoked'; end if;
  if now() > t.expires_at then raise exception 'link_expired'; end if;
  if r.status in ('accepted', 'rejected') then
    if r.status = p_outcome then
      return jsonb_build_object('outcome', r.status, 'replayed', true, 'resolvedAt', r.resolved_at);
    end if;
    raise exception 'already_resolved';
  end if;
  if r.status <> 'issued' then raise exception 'quote_not_current'; end if;
  if r.valid_until < (now() at time zone 'America/Lima')::date then raise exception 'offer_expired'; end if;
  if p_outcome = 'rejected' and reason is null then raise exception 'reason_required'; end if;

  perform public.lead_quote_resolve(r.id, 'cliente (enlace seguro)', p_outcome, reason);
  update public.lead_quotes set resolved_via = 'customer', resolution_request_key = p_request_key
    where id = r.id returning * into r;
  return jsonb_build_object('outcome', r.status, 'replayed', false, 'resolvedAt', r.resolved_at);
end $$;

-- ------------------------------------------------------ entrega de cotización
create table if not exists public.quote_deliveries (
  id            uuid primary key default gen_random_uuid(),
  lead_quote_id uuid not null references public.lead_quotes(id) on delete cascade,
  channel       text not null default 'email' check (channel in ('email')),
  -- queued: intención guardada · blocked: falta configuración (no se intentó) ·
  -- sent: el proveedor ACEPTÓ el envío (2xx) · confirmed: el proveedor informó
  -- entrega al buzón (webhook firmado) · failed: reintento programado ·
  -- dead: sin reintentos (agotado o rebote definitivo).
  status        text not null default 'queued'
                check (status in ('queued', 'blocked', 'sent', 'confirmed', 'failed', 'dead')),
  generation    integer not null default 1 check (generation > 0),
  attempts      integer not null default 0,
  last_error    text,
  last_http_status integer,
  provider_message_id text,
  next_attempt_at timestamptz default now(),
  sent_at       timestamptz,
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (lead_quote_id, channel)
);
create index if not exists quote_deliveries_due_idx
  on public.quote_deliveries(next_attempt_at) where status in ('queued', 'failed', 'blocked');
create index if not exists quote_deliveries_message_idx
  on public.quote_deliveries(provider_message_id) where provider_message_id is not null;

-- Eventos de proveedor ya procesados: una repetición (replay) no cambia nada.
create table if not exists public.webhook_events (
  provider    text not null,
  event_id    text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);
create or replace function public.webhook_event_claim(p_provider text, p_event text) returns boolean
language plpgsql as $$
begin
  insert into public.webhook_events(provider, event_id) values (p_provider, p_event);
  return true;
exception when unique_violation then
  return false;
end $$;

-- ---------------------------------------------- límite de tasa compartido
create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 0
);
create index if not exists rate_limits_window_idx on public.rate_limits(window_start);

-- Ventana fija ATÓMICA: una sola sentencia INSERT .. ON CONFLICT serializa las
-- ráfagas simultáneas de instancias distintas sobre la misma fila.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns jsonb language plpgsql as $$
declare c integer; ws timestamptz;
begin
  if p_window_seconds <= 0 or p_max <= 0 or length(p_key) = 0 or length(p_key) > 200 then
    raise exception 'invalid_rate_limit';
  end if;
  insert into public.rate_limits as t(key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when t.window_start <= now() - make_interval(secs => p_window_seconds) then now() else t.window_start end,
    count = case when t.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else t.count + 1 end
  returning count, window_start into c, ws;
  return jsonb_build_object(
    'allowed', c <= p_max, 'count', c, 'remaining', greatest(p_max - c, 0),
    'retryAfterSeconds', greatest(ceil(extract(epoch from (ws + make_interval(secs => p_window_seconds) - now())))::integer, 1));
end $$;

create or replace function public.rate_limit_purge(p_older_than_seconds integer default 86400) returns integer
language plpgsql as $$
declare n integer;
begin
  delete from public.rate_limits where window_start < now() - make_interval(secs => p_older_than_seconds);
  get diagnostics n = row_count;
  return n;
end $$;

-- ------------------------------------------------------------ permisos y RLS
alter table public.quote_access_tokens enable row level security;
alter table public.quote_deliveries enable row level security;
alter table public.webhook_events enable row level security;
alter table public.rate_limits enable row level security;
do $$
declare t text; f text;
begin
  foreach t in array array['quote_access_tokens', 'quote_deliveries', 'webhook_events', 'rate_limits'] loop
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on public.%I from anon', t); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke all on public.%I from authenticated', t); end if;
  end loop;
  foreach f in array array[
    'lead_quote_check_totals(jsonb, bigint, text, text, bigint)',
    'lead_quote_create(uuid, text, bigint, text, date, text, text, jsonb, text, text, bigint, text)',
    'lead_quote_update_draft(uuid, text, bigint, text, date, text, text, jsonb, text, text, bigint, text)',
    'lead_quote_issue(uuid, text, jsonb)',
    'lead_quote_verify(uuid)',
    'quote_token_register(uuid, text, integer, timestamptz)',
    'quote_token_rotate(uuid, text)',
    'quote_public_view(text)',
    'quote_customer_decide(text, text, text, text)',
    'webhook_event_claim(text, text)',
    'rate_limit_hit(text, integer, integer)',
    'rate_limit_purge(integer)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke execute on function public.%s from anon', f); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke execute on function public.%s from authenticated', f); end if;
  end loop;
end $$;

-- ------------------------------------------- funciones de entrega (cola segura)
-- Reclama entregas vencidas con SKIP LOCKED y un arrendamiento de 3 minutos:
-- dos ejecuciones simultáneas (cron + reintento manual) nunca toman la misma.
create or replace function public.quote_delivery_claim(p_limit integer default 10) returns jsonb
language plpgsql as $$
declare
  d record; q public.lead_quotes; l public.quotes; out jsonb := '[]'::jsonb;
begin
  for d in
    select * from public.quote_deliveries
    where status in ('queued', 'failed', 'blocked') and next_attempt_at <= now()
    order by next_attempt_at
    limit greatest(least(p_limit, 50), 1)
    for update skip locked
  loop
    select * into q from public.lead_quotes where id = d.lead_quote_id;
    if q.status <> 'issued' then
      -- Ya no es la oferta vigente (reemplazada o resuelta): no se envía.
      update public.quote_deliveries set status = 'dead', last_error = 'not_current', next_attempt_at = null, updated_at = now()
        where id = d.id;
      continue;
    end if;
    select * into l from public.quotes where id = q.quote_id;
    update public.quote_deliveries set next_attempt_at = now() + interval '3 minutes', updated_at = now() where id = d.id;
    out := out || jsonb_build_array(jsonb_build_object(
      'id', d.id, 'leadQuoteId', q.id, 'generation', d.generation, 'attempts', d.attempts,
      'recipient', l.customer_email, 'reference', q.snapshot->>'reference',
      'validUntil', q.valid_until, 'snapshot', q.snapshot, 'snapshotHash', q.snapshot_hash));
  end loop;
  return out;
end $$;

create or replace function public.quote_delivery_record(
  p_id uuid, p_status text, p_attempts integer, p_error text, p_http integer, p_message_id text, p_next timestamptz
) returns boolean language plpgsql as $$
declare n integer;
begin
  if p_status not in ('blocked', 'sent', 'failed', 'dead') then raise exception 'invalid_status'; end if;
  update public.quote_deliveries set
    status = p_status, attempts = p_attempts, last_error = p_error, last_http_status = p_http,
    provider_message_id = coalesce(p_message_id, provider_message_id),
    sent_at = case when p_status = 'sent' then now() else sent_at end,
    next_attempt_at = p_next, updated_at = now()
  where id = p_id and status <> 'confirmed';  -- una confirmación del proveedor no se degrada
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Eventos firmados del proveedor: «entregado al buzón» confirma; rebote o queja matan.
create or replace function public.quote_delivery_provider_event(p_event text, p_message_id text, p_type text)
returns jsonb language plpgsql as $$
declare claimed boolean; n integer := 0;
begin
  claimed := public.webhook_event_claim('resend', p_event);
  if not claimed then return jsonb_build_object('claimed', false, 'updated', false); end if;
  if p_type = 'email.delivered' then
    update public.quote_deliveries set status = 'confirmed', confirmed_at = now(), updated_at = now()
      where provider_message_id = p_message_id and status in ('sent', 'failed');
    get diagnostics n = row_count;
  elsif p_type in ('email.bounced', 'email.complained') then
    update public.quote_deliveries set status = 'dead', next_attempt_at = null, updated_at = now(),
        last_error = case when p_type = 'email.bounced' then 'bounced' else 'complained' end
      where provider_message_id = p_message_id and status <> 'dead';
    get diagnostics n = row_count;
  end if;
  return jsonb_build_object('claimed', true, 'updated', n > 0);
end $$;

create or replace function public.quote_delivery_health() returns jsonb language sql stable as $$
  select jsonb_build_object(
    'queued', count(*) filter (where status = 'queued'),
    'blocked', count(*) filter (where status = 'blocked'),
    'sent', count(*) filter (where status = 'sent'),
    'confirmed', count(*) filter (where status = 'confirmed'),
    'failed', count(*) filter (where status = 'failed'),
    'dead', count(*) filter (where status = 'dead'),
    'oldestDueAgeSec', (select greatest(extract(epoch from (now() - min(next_attempt_at)))::integer, 0)
                        from public.quote_deliveries where status in ('queued', 'failed', 'blocked')))
  from public.quote_deliveries
$$;

-- Reintento manual del personal: vuelve a la cola sin cambiar el enlace.
create or replace function public.quote_delivery_requeue(p_lead_quote uuid, p_actor text) returns boolean
language plpgsql as $$
declare n integer; r public.lead_quotes;
begin
  select * into r from public.lead_quotes where id = p_lead_quote;
  if not found then raise exception 'quote_not_found'; end if;
  if r.status <> 'issued' then raise exception 'quote_not_issued'; end if;
  update public.quote_deliveries set status = 'queued', attempts = 0, last_error = null, last_http_status = null,
      next_attempt_at = now(), updated_at = now()
    where lead_quote_id = p_lead_quote and status in ('blocked', 'failed', 'dead');
  get diagnostics n = row_count;
  if n > 0 then
    insert into public.lead_events(quote_id, actor, action, to_value)
    values (r.quote_id, p_actor, 'quote', 'v' || r.version || ' delivery requeued');
  end if;
  return n > 0;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'quote_delivery_claim(integer)',
    'quote_delivery_record(uuid, text, integer, text, integer, text, timestamptz)',
    'quote_delivery_provider_event(text, text, text)',
    'quote_delivery_health()',
    'quote_delivery_requeue(uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke execute on function public.%s from anon', f); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke execute on function public.%s from authenticated', f); end if;
  end loop;
end $$;

-- El resultado registra QUIÉN lo decidió (personal o cliente) para el panel y la auditoría.
create or replace function public.lead_quote_resolve(p_id uuid, p_actor text, p_outcome text, p_reason text)
returns public.lead_quotes language plpgsql as $$
declare
  r public.lead_quotes; q public.quotes;
begin
  if p_outcome not in ('accepted', 'rejected') then raise exception 'invalid_outcome'; end if;
  select * into r from public.lead_quotes where id = p_id;
  if not found then raise exception 'quote_not_found'; end if;
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = p_id for update;
  if r.status <> 'issued' then raise exception 'quote_not_issued'; end if;
  if p_outcome = 'rejected' and length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'reason_required';
  end if;
  update public.lead_quotes set status = p_outcome, resolved_at = now(), resolved_via = 'staff',
      resolution_reason = nullif(btrim(p_reason), '')
    where id = p_id returning * into r;
  if p_outcome = 'accepted' and upper(q.status) = 'QUOTED' then
    update public.quotes set status = 'WON', loss_reason = null, updated_at = now() where id = q.id;
    insert into public.lead_events(quote_id, actor, action, from_value, to_value)
    values (q.id, p_actor, 'status', 'QUOTED', 'WON');
  elsif p_outcome = 'rejected' and upper(q.status) = 'QUOTED' then
    update public.quotes set status = 'LOST', loss_reason = btrim(p_reason), updated_at = now() where id = q.id;
    insert into public.lead_events(quote_id, actor, action, from_value, to_value, note)
    values (q.id, p_actor, 'status', 'QUOTED', 'LOST', btrim(p_reason));
  end if;
  insert into public.lead_events(quote_id, actor, action, to_value, note)
  values (q.id, p_actor, 'quote', 'v' || r.version || ' ' || p_outcome, nullif(btrim(p_reason), ''));
  return r;
end $$;
