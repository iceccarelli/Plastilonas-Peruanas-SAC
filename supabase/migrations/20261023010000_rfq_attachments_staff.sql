-- ============================================================
-- RFQ: adjuntos privados, flujo de ventas y auditoría (aplicar tras
-- 20261023000000_rfq_durable_pipeline.sql). Aditiva e idempotente.
-- ============================================================

-- Bucket PRIVADO. Sin políticas anónimas: los navegadores suben con URLs
-- firmadas de un solo uso emitidas por el servidor (/api/lead/upload-url) y el
-- personal descarga con URLs firmadas de 5 minutos. Se omite si el esquema
-- `storage` no existe (Postgres sin Supabase, p. ej. las pruebas).
do $$ begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'rfq-adjuntos', 'rfq-adjuntos', false, 20971520,
      array['application/pdf', 'image/jpeg', 'image/png',
            'application/acad', 'image/vnd.dwg', 'application/dxf',
            'image/vnd.dxf', 'application/octet-stream']
    )
    on conflict (id) do update
      set public = false, file_size_limit = 20971520;
  end if;
end $$;

alter table public.quotes add column if not exists assigned_to text;
alter table public.quotes add column if not exists loss_reason text;
alter table public.quotes add column if not exists updated_at timestamptz not null default now();
create index if not exists quotes_assigned_idx on public.quotes(assigned_to) where assigned_to is not null;

create table if not exists public.lead_attachments (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  path        text not null,
  filename    text not null,
  size_bytes  bigint,
  mime_type   text,
  created_at  timestamptz not null default now(),
  unique (path)
);
create index if not exists lead_attachments_quote_idx on public.lead_attachments(quote_id);

-- Historial auditable de acciones del personal: quién, cuándo, qué cambió.
create table if not exists public.lead_events (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  actor       text not null,
  action      text not null check (action in ('assign', 'status', 'note', 'download', 'retry_delivery')),
  from_value  text,
  to_value    text,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists lead_events_quote_idx on public.lead_events(quote_id, created_at desc);

alter table public.lead_attachments enable row level security;
alter table public.lead_events enable row level security;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.lead_attachments, public.lead_events from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.lead_attachments, public.lead_events from authenticated;
  end if;
end $$;
