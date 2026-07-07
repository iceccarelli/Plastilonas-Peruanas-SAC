-- ============================================================
-- Plastilonas Peruanas SAC — Esquema de base de datos (Supabase / Postgres)
-- ------------------------------------------------------------
-- Aplicar en: Supabase Studio → SQL Editor → pegar y ejecutar.
-- Idempotente en lo posible (IF NOT EXISTS). Incluye RLS.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Clientes ----------
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  full_name    text,
  company      text,
  phone        text,
  ruc          text,               -- para facturación SUNAT
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- Pedidos ----------
do $$ begin
  create type order_status as enum (
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text unique not null default ('PP-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  customer_id    uuid references public.customers(id) on delete set null,
  customer_email text not null,
  status         order_status not null default 'pending',
  -- Montos en céntimos de PEN para evitar errores de coma flotante.
  subtotal_cents integer not null default 0,
  igv_cents      integer not null default 0,   -- IGV 18%
  shipping_cents integer not null default 0,
  total_cents    integer not null default 0,
  currency       text not null default 'PEN',
  -- Envío
  ship_name      text,
  ship_phone     text,
  ship_address   text,
  ship_district  text,
  ship_province  text,
  ship_department text,
  ship_reference text,
  notes          text,
  payment_provider text,           -- 'stripe' | 'culqi' | 'pagoefectivo' | 'yape' | ...
  payment_ref    text,             -- id de la sesión/transacción del proveedor
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_status_idx on public.orders(status);

-- ---------- Líneas de pedido ----------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  unit         text,               -- 'unidad' | 'm2' | 'rollo' | ...
  unit_price_cents integer not null,
  quantity     integer not null check (quantity > 0),
  line_total_cents integer not null,
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- Pagos ----------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references public.orders(id) on delete set null,
  provider     text not null,
  provider_ref text,
  amount_cents integer not null,
  currency     text not null default 'PEN',
  status       text not null default 'pending',  -- pending | succeeded | failed | refunded
  raw          jsonb not null default '{}'::jsonb, -- payload del webhook
  created_at   timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id);
create unique index if not exists payments_provider_ref_idx
  on public.payments(provider, provider_ref) where provider_ref is not null;

-- ---------- Cotizaciones (B2B, quote-first) ----------
create table if not exists public.quotes (
  id           uuid primary key default gen_random_uuid(),
  customer_email text not null,
  full_name    text,
  company      text,
  phone        text,
  product      text,
  quantity     text,
  message      text,
  status       text not null default 'new',  -- new | contacted | quoted | won | lost
  source       text default 'web',
  created_at   timestamptz not null default now()
);

-- ---------- Carritos abandonados (para recuperación por n8n) ----------
create table if not exists public.abandoned_carts (
  id           uuid primary key default gen_random_uuid(),
  email        text,
  phone        text,
  items        jsonb not null default '[]'::jsonb,
  total_cents  integer not null default 0,
  recovered    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists abandoned_carts_recovered_idx on public.abandoned_carts(recovered);

-- ---------- Contenido / noticias ----------
create table if not exists public.news_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body         text,
  cover_image  text,
  tags         text[] default '{}',
  source_url   text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists news_published_idx on public.news_posts(published, published_at desc);

-- ============================================================
-- RLS: por defecto todo cerrado. El acceso de escritura se hace
-- vía service-role (webhooks/servidor), que bypassa RLS.
-- ============================================================
alter table public.customers      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.payments       enable row level security;
alter table public.quotes         enable row level security;
alter table public.abandoned_carts enable row level security;
alter table public.news_posts     enable row level security;

-- Noticias publicadas: lectura pública.
drop policy if exists "news public read" on public.news_posts;
create policy "news public read" on public.news_posts
  for select using (published = true);

-- Un cliente autenticado puede ver sus propios pedidos (match por email del JWT).
drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders
  for select using (auth.jwt() ->> 'email' = customer_email);

drop policy if exists "order_items own read" on public.order_items;
create policy "order_items own read" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Nota: inserción de cotizaciones desde el navegador (anon) puede habilitarse
-- con una policy INSERT explícita si se decide no pasar por un route handler.
