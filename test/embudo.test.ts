import { describe, it, expect, beforeAll, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver } from './helpers/pglite-rpc';
import { loadFunnel, rate, parseWindow, MIN_SAMPLE, type Funnel } from '@/lib/funnel';
import { supabaseStaffStore } from '@/lib/staff-store';
import { quoteStore } from '@/lib/quote-store';
import { QuoteDraftInput } from '@/lib/quotations';
import { hashToken, mintToken, expiryOf } from '@/lib/quote-token';
import FunnelView from '@/components/staff/FunnelView';

const hoisted = vi.hoisted(() => ({ staff: null as string | null, session: null as unknown }));
vi.mock('@/auth', () => ({ getSafeSession: async () => hoisted.session }));
vi.mock('@/lib/staff', async () => ({ ...(await import('@/lib/staff-policy')), requireStaff: async () => hoisted.staff }));

const SECRET = 'x'.repeat(40);
let db: PGlite;
let f: Funnel;

async function lead(o: { channel?: string | null; landing?: string; product?: string; ageDays?: number; email: string; status?: string }) {
  const payload: Record<string, unknown> = { ruc: '20123456786' };
  if (o.channel) payload.channel = o.channel;
  if (o.landing) payload.landing_path = o.landing;
  const r = await db.query(
    `insert into public.quotes(customer_email, full_name, company, product, status, rfq_code, payload, created_at)
     values ($1,'Persona Real','Empresa Real SAC',$2,$3,'RFQ-' || upper(substr(gen_random_uuid()::text,1,10)),$4::jsonb, now() - make_interval(days => $5::int)) returning id`,
    [o.email, o.product ?? 'Mallas antiáfidas', o.status ?? 'NEW', JSON.stringify(payload), o.ageDays ?? 1],
  );
  return (r.rows[0] as { id: string }).id;
}
const touch = (id: string, hoursAfter: number, action = 'status', to = 'ASSIGNED') =>
  db.query(`insert into public.lead_events(quote_id, actor, action, to_value, created_at) select id, 'ventas@p.com', $2, $3, created_at + make_interval(hours => $4::int) from public.quotes where id=$1`, [id, action, to, hoursAfter]);
async function quoteIt(id: string, currency: 'PEN' | 'USD', unitPrice: string) {
  const staff = supabaseStaffStore(rpcOver(db) as never);
  await staff.createQuote(id, 'v@p.com', QuoteDraftInput.parse({ currency, validUntil: '2099-01-01', summary: 'Resumen suficiente de la oferta', items: [{ description: 'Item', quantity: '10', unit: 'UND', unitPrice }], taxTreatment: 'included', taxLabel: 'IGV incl.' }));
  const q = (await db.query(`select id from public.lead_quotes where quote_id=$1 order by version desc limit 1`, [id])).rows[0] as { id: string };
  await staff.issueQuote(q.id, 'v@p.com');
  return q.id;
}

beforeAll(async () => {
  db = await freshDb();
  const staff = supabaseStaffStore(rpcOver(db) as never);
  const qs = quoteStore(rpcOver(db));

  // A: IA → calificada → oferta → enviada → el CLIENTE acepta (PEN 1,000.00)
  const a = await lead({ channel: 'ai_assistant', landing: '/productos/mallas-antiafidas', email: 'a@real.example', status: 'QUALIFIED' });
  await touch(a, 2, 'assign', 'x'); await touch(a, 3, 'status', 'QUALIFIED');
  const qa = await quoteIt(a, 'PEN', '100.00');
  const [claim] = await qs.claimDeliveries(1);
  await qs.recordDelivery(claim.id, 'sent', 1, null, 200, 'msg_a', null);
  const tok = mintToken(SECRET, qa, 1);
  await qs.registerToken(qa, hashToken(tok), 1, expiryOf('2099-01-01'));
  await qs.decide(hashToken(tok), 'accepted', null, 'k'.repeat(22));

  // B: búsqueda → oferta que NO llegó → rechazada por el personal (motivo con mayúsculas) (USD)
  const b = await lead({ channel: 'organic_search', landing: '/productos/mangas-ventilacion-minas-tuneles', product: 'Mangas de ventilación', email: 'b@real.example', status: 'QUALIFIED' });
  await touch(b, 30, 'status', 'QUALIFIED');
  const qb = await quoteIt(b, 'USD', '50.00');
  await db.query(`update public.quote_deliveries set status='dead' where lead_quote_id=$1`, [qb]);
  await staff.resolveQuote(qb, 'v@p.com', 'rejected', '  Precio SUPERIOR al presupuesto ');

  // C: sin dato, sin tocar hace 48 h · D: directo, nuevo · E: otra moneda ganada · F: fuera de ventana
  await lead({ channel: null, email: 'c@real.example', ageDays: 2 });
  await lead({ channel: 'direct', email: 'd@real.example', ageDays: 0 });
  const e = await lead({ channel: 'ai_assistant', landing: '/productos/mallas-antiafidas', email: 'e@real.example', status: 'QUALIFIED' });
  await touch(e, 1, 'status', 'QUALIFIED');
  const qe = await quoteIt(e, 'USD', '25.00');
  await staff.resolveQuote(qe, 'v@p.com', 'accepted');
  await lead({ channel: 'social', email: 'f@real.example', ageDays: 200 });

  f = await loadFunnel(rpcOver(db), 30);
});

describe('embudo comercial (Postgres real)', () => {
  it('cohorte: solo leads creados en la ventana; la de 200 días queda fuera', () => {
    expect(f.leads.accepted).toBe(5);
    expect(f.byChannel.map((c) => c.channel)).not.toContain('social');
  });
  it('etapas: aceptadas → calificadas → cotizadas → ganadas/perdidas/abiertas', () => {
    expect(f.leads).toEqual({ accepted: 5, qualified: 3, quoted: 3, won: 2, lost: 1, open: 2 });
  });
  it('cotizaciones: enviada ≠ confirmada; las vigentes sin entregar no se esconden', () => {
    expect(f.quotes).toMatchObject({ issued: 3, sentToProvider: 1, confirmedByProvider: 0, accepted: 2, rejected: 1, decidedByCustomerLink: 1 });
    // E se aceptó a mano y B estaba «dead» pero ya no está vigente: nada vigente queda sin entregar.
    expect(f.quotes.notDelivered).toBe(0);
  });
  it('ingresos por moneda, SIN convertir', () => {
    expect(f.revenue).toEqual([
      { currency: 'PEN', wonCents: 100_000, wonOffers: 1 },
      { currency: 'USD', wonCents: 25_000, wonOffers: 1 },
    ]);
  });
  it('tiempo de primera respuesta y leads sin tocar', () => {
    expect(f.responseTime.sample).toBe(3);
    expect(f.responseTime.medianMinutes).toBe(120); // A: 2 h; B: 30 h; E: 1 h → mediana 2 h
    expect(f.responseTime.untouchedOver24h).toBe(1); // C
  });
  it('motivos de pérdida normalizados (minúsculas, sin espacios sobrantes)', () => {
    expect(f.lostReasons).toEqual([{ reason: 'precio superior al presupuesto', n: 1 }]);
  });
  it('por canal: «sin_dato» se muestra aparte y no se reparte', () => {
    const by = Object.fromEntries(f.byChannel.map((c) => [c.channel, c]));
    expect(by.ai_assistant).toMatchObject({ accepted: 2, won: 2, quoted: 2 });
    expect(by.organic_search).toMatchObject({ accepted: 1, lost: 1 });
    expect(by.sin_dato).toMatchObject({ accepted: 1, won: 0 });
    expect(by.direct).toMatchObject({ accepted: 1 });
  });
  it('por producto y página de entrada', () => {
    expect(f.byProduct.find((p) => p.product === 'Mallas antiáfidas')).toMatchObject({ accepted: 4, won: 2 });
    expect(f.byLanding.find((l) => l.landing === '/productos/mallas-antiafidas')).toMatchObject({ accepted: 2, won: 2 });
  });
  it('la salida no contiene datos personales', () => {
    const json = JSON.stringify(f);
    expect(json).not.toMatch(/@real\.example|Persona Real|Empresa Real|20123456786/);
  });
  it('ventana inválida o enorme se rechaza', async () => {
    const rpc = rpcOver(db);
    expect((await rpc.rpc('commercial_funnel', { p_from: '2026-01-02', p_to: '2026-01-01' })).error).not.toBeNull();
    expect((await rpc.rpc('commercial_funnel', { p_from: '2020-01-01', p_to: '2026-01-01' })).error).not.toBeNull();
  });
  it('rate(): con muestra menor a la mínima no hay tasa; parseWindow solo admite ventanas conocidas', () => {
    expect(rate(1, MIN_SAMPLE - 1)).toBeNull();
    expect(rate(1, 4)).toBeNull();
    expect(rate(2, 8)).toBe(25);
    expect(rate(1, 3)).toBeNull();
    expect(parseWindow('90')).toBe(90);
    for (const bad of ['7', '999', 'x', '', undefined, '30; drop']) expect(parseWindow(bad as never)).toBe(30);
  });
});

describe('vista del embudo y acceso', () => {
  it('la vista dice qué no mide, marca n<5 en vez de inventar tasas y alerta lo no entregado', () => {
    const html = renderToStaticMarkup(FunnelView({ f: { ...f, quotes: { ...f.quotes, notDelivered: 2 } }, days: 30 }));
    expect(html).toContain('n&lt;5');
    expect(html).toContain('Sin dato (sin consentimiento');
    expect(html).toMatch(/Inicio del formulario/);
    expect(html).toContain('SIN entregar');
    expect(html).toMatch(/<caption/); expect(html).toMatch(/scope="row"/);
    expect(html).toContain('US$ 250.00');
    expect(html).toContain('S/ 1,000.00');
  });
  it('la página: sin sesión redirige; con sesión pero sin ser personal es 404; sin base lo dice', async () => {
    vi.resetModules();
    const { default: Page } = await import('@/app/(es)/staff/embudo/page');
    hoisted.session = null; hoisted.staff = null;
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(/NEXT_REDIRECT/);
    hoisted.session = { user: { email: 'x@y.z' } };
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK|NEXT_NOT_FOUND/);
    hoisted.staff = 'ventas@p.com';
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ dias: '90' }) }));
    expect(html).toContain('No se pudo calcular el embudo');
    vi.unstubAllEnvs();
  });
});
