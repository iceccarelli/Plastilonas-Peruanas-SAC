-- ============================================================
-- Cotizaciones comerciales por lead: versiones, emisión y resultado.
-- Aplicar tras 20261023010000_rfq_attachments_staff.sql. Aditiva e idempotente.
--
-- El precio lo fija una PERSONA del personal (nunca un modelo ni una fórmula
-- del sitio): aquí solo se registra, se versiona y se audita. Un borrador es
-- interno; solo una cotización EMITIDA es una oferta comercial.
-- ============================================================

create table if not exists public.lead_quotes (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references public.quotes(id) on delete cascade,
  version      integer not null check (version > 0),
  status       text not null default 'draft'
               check (status in ('draft', 'issued', 'accepted', 'rejected', 'superseded')),
  -- Céntimos para evitar coma flotante; moneda explícita.
  amount_cents bigint not null check (amount_cents >= 0),
  currency     text not null default 'PEN' check (currency in ('PEN', 'USD')),
  valid_until  date,
  summary      text not null check (length(btrim(summary)) > 0),
  notes        text,
  created_by   text not null,
  issued_by    text,
  issued_at    timestamptz,
  resolved_at  timestamptz,
  resolution_reason text,
  created_at   timestamptz not null default now(),
  unique (quote_id, version)
);
-- A lo sumo UNA oferta vigente (emitida) por lead.
create unique index if not exists lead_quotes_one_issued_uidx
  on public.lead_quotes(quote_id) where status = 'issued';
create index if not exists lead_quotes_quote_idx on public.lead_quotes(quote_id, version desc);

alter table public.lead_quotes enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.lead_quotes from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.lead_quotes from authenticated;
  end if;
end $$;

-- La auditoría ahora registra también las acciones de cotización.
alter table public.lead_events drop constraint if exists lead_events_action_check;
alter table public.lead_events add constraint lead_events_action_check
  check (action in ('assign', 'status', 'note', 'download', 'retry_delivery', 'quote'));

-- Crear un borrador: bloquea el lead y asigna la siguiente versión sin carreras.
create or replace function public.lead_quote_create(
  p_quote uuid, p_actor text, p_amount bigint, p_currency text,
  p_valid_until date, p_summary text, p_notes text
) returns public.lead_quotes language plpgsql as $$
declare
  q public.quotes; v integer; r public.lead_quotes;
begin
  select * into q from public.quotes where id = p_quote for update;
  if not found then raise exception 'lead_not_found'; end if;
  if upper(coalesce(q.status, 'NEW')) not in ('QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED') then
    raise exception 'lead_not_ready';  -- no se cotiza un lead sin calificar
  end if;
  select coalesce(max(version), 0) + 1 into v from public.lead_quotes where quote_id = p_quote;
  insert into public.lead_quotes(quote_id, version, amount_cents, currency, valid_until, summary, notes, created_by)
  values (p_quote, v, p_amount, p_currency, p_valid_until, p_summary, p_notes, p_actor)
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

-- Emitir: el borrador pasa a oferta vigente y la anterior queda reemplazada.
create or replace function public.lead_quote_issue(p_id uuid, p_actor text)
returns public.lead_quotes language plpgsql as $$
declare
  r public.lead_quotes; q public.quotes;
begin
  select * into r from public.lead_quotes where id = p_id;
  if not found then raise exception 'quote_not_found'; end if;
  select * into q from public.quotes where id = r.quote_id for update;
  select * into r from public.lead_quotes where id = p_id for update;
  if r.status <> 'draft' then raise exception 'quote_not_draft'; end if;
  if r.valid_until is null or r.valid_until < current_date then raise exception 'validity_required'; end if;
  update public.lead_quotes set status = 'superseded', resolved_at = now()
    where quote_id = r.quote_id and status = 'issued';
  update public.lead_quotes set status = 'issued', issued_by = p_actor, issued_at = now()
    where id = p_id returning * into r;
  if upper(q.status) = 'QUOTE_PREPARATION' then
    update public.quotes set status = 'QUOTED', updated_at = now() where id = q.id;
    insert into public.lead_events(quote_id, actor, action, from_value, to_value)
    values (q.id, p_actor, 'status', 'QUOTE_PREPARATION', 'QUOTED');
  end if;
  insert into public.lead_events(quote_id, actor, action, to_value)
  values (q.id, p_actor, 'quote', 'v' || r.version || ' issued');
  return r;
end $$;

-- Registrar el resultado del cliente sobre la oferta vigente.
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
  update public.lead_quotes set status = p_outcome, resolved_at = now(), resolution_reason = nullif(btrim(p_reason), '')
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

-- Solo el servidor (service-role) ejecuta las funciones.
revoke all on function public.lead_quote_create(uuid, text, bigint, text, date, text, text) from public;
revoke all on function public.lead_quote_issue(uuid, text) from public;
revoke all on function public.lead_quote_resolve(uuid, text, text, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function public.lead_quote_create(uuid, text, bigint, text, date, text, text) from anon;
    revoke execute on function public.lead_quote_issue(uuid, text) from anon;
    revoke execute on function public.lead_quote_resolve(uuid, text, text, text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke execute on function public.lead_quote_create(uuid, text, bigint, text, date, text, text) from authenticated;
    revoke execute on function public.lead_quote_issue(uuid, text) from authenticated;
    revoke execute on function public.lead_quote_resolve(uuid, text, text, text) from authenticated;
  end if;
end $$;
