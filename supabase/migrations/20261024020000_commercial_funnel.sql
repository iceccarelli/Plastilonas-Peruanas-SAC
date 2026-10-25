-- ============================================================
-- Embudo comercial: de la solicitud aceptada al resultado, por canal y producto.
-- Aplicar tras 20261024010000_ops_observability.sql. Solo lectura (una función).
--
-- COHORTE: los leads CREADOS en la ventana; sus resultados se cuentan tal como
-- están hoy. Así un lead no se cuenta dos veces ni un mes “gana” lo que se
-- cotizó en otro. No hay datos personales en la salida: ni correos, ni nombres,
-- ni teléfonos; solo conteos, importes agregados y textos de motivo normalizados.
--
-- LO QUE ESTO NO PUEDE SABER: cuántas personas empezaron el formulario (eso es
-- un evento del navegador, con consentimiento, que vive en el proveedor de
-- analítica). El canal es el que el navegador declaró al enviar: es una pista
-- de primer contacto, no una certeza.
-- ============================================================

create or replace function public.commercial_funnel(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable as $$
declare
  res jsonb;
begin
  if p_from is null or p_to is null or p_to <= p_from then raise exception 'invalid_window'; end if;
  if p_to - p_from > interval '800 days' then raise exception 'window_too_large'; end if;

  with cohort as (
    select q.id, q.created_at, upper(coalesce(q.status, 'NEW')) as status,
           coalesce(nullif(btrim(q.payload->>'channel'), ''), 'sin_dato') as channel,
           nullif(btrim(q.product), '') as product,
           nullif(btrim(q.payload->>'landing_path'), '') as landing,
           nullif(lower(btrim(q.loss_reason)), '') as loss_reason,
           (select min(e.created_at) from public.lead_events e
              where e.quote_id = q.id and e.action in ('assign', 'status', 'note', 'quote')) as first_touch,
           (upper(coalesce(q.status, 'NEW')) in ('QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED', 'WON')
              or exists (select 1 from public.lead_events e where e.quote_id = q.id and e.action = 'status' and e.to_value = 'QUALIFIED')) as qualified
    from public.quotes q
    where q.created_at >= p_from and q.created_at < p_to and q.rfq_code is not null
  ),
  oferta as (
    select c.id as lead, lq.id as lq_id, lq.status, lq.currency, lq.amount_cents, lq.issued_at, lq.resolved_at, lq.resolved_via,
           d.status as delivery
    from cohort c
    join public.lead_quotes lq on lq.quote_id = c.id and lq.issued_at is not null
    left join public.quote_deliveries d on d.lead_quote_id = lq.id
  ),
  por_lead as (
    select c.*,
           exists (select 1 from oferta o where o.lead = c.id) as quoted,
           exists (select 1 from oferta o where o.lead = c.id and o.status = 'accepted') as won_quote
    from cohort c
  )
  select jsonb_build_object(
    'window', jsonb_build_object('from', p_from, 'to', p_to),
    'leads', jsonb_build_object(
      'accepted', (select count(*) from cohort),
      'qualified', (select count(*) filter (where qualified) from cohort),
      'quoted', (select count(*) filter (where quoted) from por_lead),
      'won', (select count(*) filter (where status = 'WON') from cohort),
      'lost', (select count(*) filter (where status = 'LOST') from cohort),
      'open', (select count(*) filter (where status not in ('WON', 'LOST')) from cohort)),
    'quotes', jsonb_build_object(
      'issued', (select count(*) from oferta),
      'sentToProvider', (select count(*) filter (where delivery in ('sent', 'confirmed')) from oferta),
      'confirmedByProvider', (select count(*) filter (where delivery = 'confirmed') from oferta),
      'notDelivered', (select count(*) filter (where delivery in ('blocked', 'failed', 'dead', 'queued') and status = 'issued') from oferta),
      'accepted', (select count(*) filter (where status = 'accepted') from oferta),
      'rejected', (select count(*) filter (where status = 'rejected') from oferta),
      'superseded', (select count(*) filter (where status = 'superseded') from oferta),
      'decidedByCustomerLink', (select count(*) filter (where resolved_via = 'customer') from oferta),
      'medianDaysToDecision', (select round((percentile_cont(0.5) within group (order by extract(epoch from (resolved_at - issued_at)) / 86400))::numeric, 1)
                                 from oferta where status in ('accepted', 'rejected') and resolved_at is not null)),
    'revenue', coalesce((select jsonb_agg(jsonb_build_object('currency', currency, 'wonCents', s, 'wonOffers', n) order by currency)
                          from (select currency, sum(amount_cents)::bigint as s, count(*) as n from oferta where status = 'accepted' group by currency) t), '[]'::jsonb),
    'responseTime', (select jsonb_build_object(
        'sample', count(*) filter (where first_touch is not null),
        'medianMinutes', round((percentile_cont(0.5) within group (order by extract(epoch from (first_touch - created_at)) / 60))::numeric, 0),
        'p90Minutes', round((percentile_cont(0.9) within group (order by extract(epoch from (first_touch - created_at)) / 60))::numeric, 0),
        'untouchedOver24h', count(*) filter (where first_touch is null and created_at < now() - interval '24 hours'))
      from cohort),
    'lostReasons', coalesce((select jsonb_agg(jsonb_build_object('reason', loss_reason, 'n', n) order by n desc, loss_reason)
                              from (select left(loss_reason, 120) as loss_reason, count(*) as n from cohort where status = 'LOST' and loss_reason is not null group by 1 order by n desc limit 10) t), '[]'::jsonb),
    'byChannel', coalesce((select jsonb_agg(jsonb_build_object('channel', channel, 'accepted', a, 'qualified', qd, 'quoted', qt, 'won', w, 'lost', l) order by a desc, channel)
                            from (select channel, count(*) as a, count(*) filter (where qualified) as qd, count(*) filter (where quoted) as qt,
                                         count(*) filter (where status = 'WON') as w, count(*) filter (where status = 'LOST') as l
                                  from por_lead group by channel) t), '[]'::jsonb),
    'byProduct', coalesce((select jsonb_agg(jsonb_build_object('product', product, 'accepted', a, 'quoted', qt, 'won', w) order by a desc, product)
                            from (select left(coalesce(product, 'sin_dato'), 120) as product, count(*) as a, count(*) filter (where quoted) as qt, count(*) filter (where status = 'WON') as w
                                  from por_lead group by 1 order by a desc limit 15) t), '[]'::jsonb),
    'byLanding', coalesce((select jsonb_agg(jsonb_build_object('landing', landing, 'accepted', a, 'won', w) order by a desc, landing)
                            from (select left(coalesce(landing, 'sin_dato'), 160) as landing, count(*) as a, count(*) filter (where status = 'WON') as w
                                  from por_lead group by 1 order by a desc limit 15) t), '[]'::jsonb)
  ) into res;
  return res;
end $$;

revoke all on function public.commercial_funnel(timestamptz, timestamptz) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke execute on function public.commercial_funnel(timestamptz, timestamptz) from anon; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then revoke execute on function public.commercial_funnel(timestamptz, timestamptz) from authenticated; end if;
end $$;
