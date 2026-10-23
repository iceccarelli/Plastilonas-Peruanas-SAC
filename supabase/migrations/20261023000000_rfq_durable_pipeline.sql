-- ============================================================
-- RFQ: entrega durable e idempotente (aplicar DESPUÉS de schema.sql)
-- ------------------------------------------------------------
-- Aditiva e idempotente: no borra ni reescribe filas existentes.
--  * quotes.idempotency_key  -> un reintento del navegador o del proveedor
--                               no crea una segunda solicitud.
--  * quotes.ip_hash          -> límite de tasa compartido entre instancias
--                               serverless (hash con sal, nunca la IP).
--  * lead_deliveries         -> estado de entrega POR CANAL (crm, email),
--                               separado del estado comercial de la venta.
-- ============================================================

alter table public.quotes add column if not exists idempotency_key text;
alter table public.quotes add column if not exists ip_hash text;

create unique index if not exists quotes_idempotency_key_uidx
  on public.quotes(idempotency_key) where idempotency_key is not null;
create index if not exists quotes_ip_hash_created_idx
  on public.quotes(ip_hash, created_at desc) where ip_hash is not null;

create table if not exists public.lead_deliveries (
  id              uuid primary key default gen_random_uuid(),
  quote_id        uuid not null references public.quotes(id) on delete cascade,
  channel         text not null check (channel in ('crm', 'email')),
  -- pending: aún no se intentó o espera reintento; delivered: el proveedor
  -- confirmó (2xx); failed: último intento falló, hay reintento programado;
  -- dead: agotó los reintentos y requiere una persona.
  status          text not null default 'pending'
                  check (status in ('pending', 'delivered', 'failed', 'dead')),
  attempts        integer not null default 0,
  -- Código clasificado (timeout, network, http_5xx...). Nunca datos del cliente.
  last_error      text,
  last_http_status integer,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz default now(),
  delivered_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (quote_id, channel)
);
create index if not exists lead_deliveries_due_idx
  on public.lead_deliveries(next_attempt_at) where status in ('pending', 'failed');
create index if not exists lead_deliveries_dead_idx
  on public.lead_deliveries(status) where status = 'dead';

-- Solo la service-role (servidor) lee o escribe: RLS activa y sin políticas.
alter table public.lead_deliveries enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.lead_deliveries from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.lead_deliveries from authenticated;
  end if;
end $$;
