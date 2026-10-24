// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver, seedLead } from './helpers/pglite-rpc';
import { captureServer } from './helpers/capture-server';
import { QuoteDraftInput } from '@/lib/quotations';
import { hashToken, mintToken, expiryOf } from '@/lib/quote-token';

/**
 * Los puntos de entrada REALES (página, PDF, decisión, webhook, cron y rutas del
 * personal) contra Postgres real. Solo se sustituyen las fronteras externas:
 * el cliente de Supabase (por PGlite), la sesión del personal y el proveedor de
 * correo (servidor local de captura).
 */
const hoisted = vi.hoisted(() => ({
  db: null as unknown, staff: null as string | null, headers: {} as Record<string, string>,
}));
vi.mock('@/lib/supabase', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase')>()),
  supabaseAdmin: () => hoisted.db,
  isSupabaseConfigured: () => true,
}));
vi.mock('@/lib/staff', async () => ({
  ...(await import('@/lib/staff-policy')),
  requireStaff: async () => hoisted.staff,
}));
vi.mock('next/headers', () => ({ headers: async () => new Headers(hoisted.headers) }));

const SECRET = 'a-very-long-link-secret-0123456789abcdef';
const WH_KEY = Buffer.from('webhook-key-bytes-0123456789abcd').toString('base64');
let db: PGlite;
let cap: Awaited<ReturnType<typeof captureServer>>;

const origin = 'https://app.test';
const post = (path: string, body: string | Record<string, string>, h: Record<string, string> = {}) =>
  new NextRequest(`${origin}${path}`, {
    method: 'POST',
    body: typeof body === 'string' ? body : new URLSearchParams(body),
    headers: { host: 'app.test', origin, 'content-type': 'application/x-www-form-urlencoded', ...h },
  });
const get = (path: string, h: Record<string, string> = {}) => new NextRequest(`${origin}${path}`, { headers: { host: 'app.test', ...h } });

async function newOffer(over: { lead?: Record<string, unknown>; draft?: Record<string, unknown> } = {}) {
  const lead = await seedLead(db, over.lead);
  const { supabaseStaffStore } = await import('@/lib/staff-store');
  const staff = supabaseStaffStore(hoisted.db as never);
  await staff.createQuote(lead.id, 'v@p.com', QuoteDraftInput.parse({
    currency: 'PEN', validUntil: '2099-01-01', summary: 'Mangas Ø600 x 50 m, 12 unidades',
    items: [{ description: 'Manga Ø600', quantity: '12', unit: 'UND', unitPrice: '100.00' }],
    taxTreatment: 'included', taxLabel: 'IGV incluido', terms: 'Pago 50% adelanto.', notes: 'NOTA INTERNA secreta', ...over.draft,
  }));
  const id = ((await db.query(`select id from public.lead_quotes where quote_id=$1 order by version desc limit 1`, [lead.id])).rows[0] as { id: string }).id;
  await staff.issueQuote(id, 'v@p.com');
  const token = mintToken(SECRET, id, 1);
  const { quoteStore } = await import('@/lib/quote-store');
  await quoteStore(hoisted.db as never).registerToken(id, hashToken(token), 1, expiryOf('2099-01-01'));
  return { lead, id, token };
}
const status = async (leadId: string) => ((await db.query(`select status from public.quotes where id=$1`, [leadId])).rows[0] as { status: string }).status;
const qstatus = async (id: string) => ((await db.query(`select status from public.lead_quotes where id=$1`, [id])).rows[0] as { status: string }).status;

beforeAll(async () => {
  cap = await captureServer();
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc-test');
  vi.stubEnv('RESEND_API_KEY', 're_test');
  vi.stubEnv('RESEND_API_BASE', cap.base);
  vi.stubEnv('QUOTE_LINK_SECRET', SECRET);
  vi.stubEnv('CRON_SECRET', 'cron-secret-value');
  vi.stubEnv('RESEND_WEBHOOK_SECRET', `whsec_${WH_KEY}`);
});
afterAll(async () => { await cap.close(); vi.unstubAllEnvs(); });
beforeEach(async () => {
  db = await freshDb();
  hoisted.db = rpcOver(db);
  hoisted.staff = null;
  hoisted.headers = { 'x-real-ip': '203.0.113.50' };
  cap.seen.length = 0;
});

const page = async (token: string, e?: string) => {
  const { default: Page } = await import('@/app/(oferta)/oferta/[token]/page');
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ token }), searchParams: Promise.resolve({ e }) }));
};

describe('página del cliente /oferta/[token]', () => {
  it('muestra la oferta emitida, sin notas internas, con acciones accesibles', async () => {
    const o = await newOffer();
    const html = await page(o.token);
    expect(html).toContain(`${o.lead.rfq_code}-V1`);
    expect(html).toContain('S/ 1,200.00');
    expect(html).toContain('Pago 50% adelanto.');
    expect(html).not.toMatch(/NOTA INTERNA|ventas@p\.com|v@p\.com/);
    expect(html).toMatch(/<table/); expect(html).toMatch(/<caption/); expect(html).toMatch(/scope="col"/);
    expect(html).toContain('Aceptar oferta'); expect(html).toContain('Rechazar oferta');
    expect(html).toMatch(/<label[^>]*for="motivo"/);
    expect(html).toContain(`/api/oferta/${o.token}/decision`);
    expect(html).not.toMatch(/googletagmanager|fbevents|<script/); // sin terceros ni scripts
  });

  it('escapa contenido hostil de la oferta', async () => {
    const o = await newOffer({ draft: { summary: '<script>alert(1)</script> "x" <img src=x onerror=1>', terms: '<b onmouseover=1>t</b>' } });
    const html = await page(o.token);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('enlace inválido, desconocido, vencido, reemplazado: sin datos de la oferta', async () => {
    const o = await newOffer();
    expect(await page('corto')).toContain('Enlace no válido');
    expect(await page(mintToken(SECRET, 'otro', 1))).toContain('Enlace no válido');
    await db.query(`update public.quote_access_tokens set expires_at = now() - interval '1 second'`);
    expect(await page(o.token)).toContain('El enlace venció');
    await db.query(`update public.quote_access_tokens set expires_at = now() + interval '1 day'`);
    // reemplazo
    const { supabaseStaffStore } = await import('@/lib/staff-store');
    const staff = supabaseStaffStore(hoisted.db as never);
    await staff.createQuote(o.lead.id, 'v@p.com', QuoteDraftInput.parse({ currency: 'PEN', validUntil: '2099-01-01', summary: 'Versión dos de la oferta', items: [{ description: 'Otra cosa', quantity: '1', unit: 'UND', unitPrice: '5.00' }], taxTreatment: 'included', taxLabel: 'IGV incl.' }));
    const v2 = ((await db.query(`select id from public.lead_quotes where quote_id=$1 and version=2`, [o.lead.id])).rows[0] as { id: string }).id;
    await staff.issueQuote(v2, 'v@p.com');
    const html = await page(o.token);
    expect(html).toContain('fue reemplazada');
    expect(html).not.toMatch(/Minera Andina|Manga Ø600|Aceptar oferta/);
  });

  it('muestra el resultado REAL tras decidir y deja de ofrecer los botones', async () => {
    const o = await newOffer();
    const { POST } = await import('@/app/api/oferta/[token]/decision/route');
    await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'accepted', key: 'k'.repeat(22) }), { params: Promise.resolve({ token: o.token }) });
    const html = await page(o.token);
    expect(html).toContain('aceptada');
    expect(html).not.toContain('Aceptar oferta');
  });

  it('un código de error desconocido en la URL no se refleja (sin inyección)', async () => {
    const o = await newOffer();
    const html = await page(o.token, '<script>alert(1)</script>');
    expect(html).not.toContain('alert(1)');
  });

  it('límite de tasa: pasado el tope no se sirve la oferta', async () => {
    const o = await newOffer();
    for (let i = 0; i < 120; i++) await page(o.token);
    expect(await page(o.token)).toContain('Demasiadas solicitudes');
  });

  it('si el contador no responde, falla CERRADO (no sirve la oferta a ciegas)', async () => {
    const o = await newOffer();
    const real = hoisted.db as { rpc: (fn: string, a?: Record<string, unknown>) => Promise<unknown> };
    hoisted.db = { rpc: (fn: string, a?: Record<string, unknown>) => (fn === 'rate_limit_hit' ? Promise.resolve({ data: null, error: { message: 'down' } }) : real.rpc(fn, a)) };
    expect(await page(o.token)).toContain('Demasiadas solicitudes');
  });
});

describe('POST /api/oferta/[token]/decision', () => {
  const route = () => import('@/app/api/oferta/[token]/decision/route');
  const ctx = (token: string) => ({ params: Promise.resolve({ token }) });

  it('aceptar: 303 a la página, una sola vez, lead WON', async () => {
    const o = await newOffer();
    const { POST } = await route();
    const res = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'accepted', key: 'a'.repeat(22) }), ctx(o.token));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${origin}/oferta/${o.token}`);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(await status(o.lead.id)).toBe('WON');
    const again = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'accepted', key: 'a'.repeat(22) }), ctx(o.token));
    expect(again.status).toBe(303);
    expect((await db.query(`select count(*)::int n from public.lead_events where quote_id=$1 and to_value='v1 accepted'`, [o.lead.id])).rows[0]).toEqual({ n: 1 });
  });

  it('rechazar sin motivo no cambia nada y lo dice; con motivo → LOST', async () => {
    const o = await newOffer();
    const { POST } = await route();
    const r1 = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'rejected', reason: ' ', key: 'b'.repeat(22) }), ctx(o.token));
    expect(r1.headers.get('location')).toContain('e=reason_required');
    expect(await qstatus(o.id)).toBe('issued');
    await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'rejected', reason: 'Precio alto', key: 'b'.repeat(22) }), ctx(o.token));
    expect(await status(o.lead.id)).toBe('LOST');
  });

  it('sin mismo origen → 403 y sin cambios (CSRF)', async () => {
    const o = await newOffer();
    const { POST } = await route();
    const cross = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'accepted', key: 'c'.repeat(22) }, { origin: 'https://evil.test' }), ctx(o.token));
    expect(cross.status).toBe(403);
    const none = new NextRequest(`${origin}/api/oferta/${o.token}/decision`, { method: 'POST', body: new URLSearchParams({ outcome: 'accepted', key: 'c'.repeat(22) }), headers: { host: 'app.test' } });
    expect((await POST(none, ctx(o.token))).status).toBe(403);
    expect(await qstatus(o.id)).toBe('issued');
  });

  it('GET no decide (los antivirus de correo precargan enlaces)', async () => {
    const o = await newOffer();
    const mod = await route();
    expect((mod as Record<string, unknown>).GET).toBeUndefined();
    await page(o.token);
    expect(await qstatus(o.id)).toBe('issued');
  });

  it('token mal formado → 404; cuerpo enorme → 413; resultado inválido → vuelve con aviso', async () => {
    const o = await newOffer();
    const { POST } = await route();
    expect((await POST(post('/api/oferta/x/decision', { outcome: 'accepted' }), ctx('x'))).status).toBe(404);
    expect((await POST(post(`/api/oferta/${o.token}/decision`, 'outcome=accepted&reason=' + 'x'.repeat(10_000)), ctx(o.token))).status).toBe(413);
    const bad = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'delete', key: 'd'.repeat(22) }), ctx(o.token));
    expect(bad.headers.get('location')).toContain('e=invalid');
    expect(await qstatus(o.id)).toBe('issued');
  });

  it('enlace revocado: no cambia el estado comercial y el cliente lo ve', async () => {
    const o = await newOffer();
    const { quoteStore } = await import('@/lib/quote-store');
    await quoteStore(hoisted.db as never).rotateLink(o.id, 'v@p.com');
    const { POST } = await route();
    const res = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'accepted', key: 'e'.repeat(22) }), ctx(o.token));
    expect(res.headers.get('location')).toContain('e=link_revoked');
    expect(await status(o.lead.id)).toBe('QUOTED');
    expect(await page(o.token, 'link_revoked')).toContain('Este enlace ya no está activo');
  });

  it('límite de tasa por token: tras 12 intentos se niega aunque la clave cambie', async () => {
    const o = await newOffer();
    const { POST } = await route();
    let last = '';
    for (let i = 0; i < 14; i++) {
      const r = await POST(post(`/api/oferta/${o.token}/decision`, { outcome: 'rejected', reason: ' ', key: String(i).padStart(22, 'k') }), ctx(o.token));
      last = r.headers.get('location') ?? '';
    }
    expect(last).toContain('e=rate');
  });

  it('dos clientes en paralelo sobre el mismo enlace: una sola resolución', async () => {
    const o = await newOffer();
    const { POST } = await route();
    await Promise.all(['a', 'b', 'c', 'd'].map((k, i) =>
      POST(post(`/api/oferta/${o.token}/decision`, i % 2 ? { outcome: 'rejected', reason: 'no', key: k.repeat(22) } : { outcome: 'accepted', key: k.repeat(22) }, { 'x-real-ip': `203.0.113.${i}` }), ctx(o.token))));
    const n = (await db.query(`select count(*)::int n from public.lead_events where quote_id=$1 and action='quote' and (to_value like '%accepted' or to_value like '%rejected')`, [o.lead.id])).rows[0] as { n: number };
    expect(n.n).toBe(1);
  });
});

describe('GET /oferta/[token]/documento.pdf', () => {
  it('entrega el PDF de la instantánea exacta, privado y sin caché', async () => {
    const o = await newOffer();
    const { GET } = await import('@/app/(oferta)/oferta/[token]/documento.pdf/route');
    const res = await GET(get(`/oferta/${o.token}/documento.pdf`), { params: Promise.resolve({ token: o.token }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain(`${o.lead.rfq_code}-V1.pdf`);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(Buffer.from(await res.arrayBuffer()).subarray(0, 5).toString()).toBe('%PDF-');
  });
  it('inválido / vencido / reemplazado → 404 sin pistas ni contenido', async () => {
    const o = await newOffer();
    const { GET } = await import('@/app/(oferta)/oferta/[token]/documento.pdf/route');
    for (const t of ['x', mintToken(SECRET, 'nada', 1)]) {
      const r = await GET(get(`/oferta/${t}/documento.pdf`), { params: Promise.resolve({ token: t }) });
      expect(r.status).toBe(404);
      expect((await r.arrayBuffer()).byteLength).toBe(0);
    }
    await db.query(`update public.quote_access_tokens set revoked_at = now(), revoked_reason = 'manual'`);
    expect((await GET(get(`/oferta/${o.token}/documento.pdf`), { params: Promise.resolve({ token: o.token }) })).status).toBe(404);
  });
});

describe('POST /api/webhooks/resend', () => {
  const sign = (id: string, ts: number, body: string) =>
    `v1,${createHmac('sha256', Buffer.from(WH_KEY, 'base64')).update(`${id}.${ts}.${body}`).digest('base64')}`;
  const send = async (id: string, type: string, messageId: string, ts = Math.floor(Date.now() / 1000), sigOverride?: string) => {
    const { POST } = await import('@/app/api/webhooks/resend/route');
    const body = JSON.stringify({ type, data: { email_id: messageId } });
    return POST(new NextRequest(`${origin}/api/webhooks/resend`, {
      method: 'POST', body, headers: { 'svix-id': id, 'svix-timestamp': String(ts), 'svix-signature': sigOverride ?? sign(id, ts, body) },
    }));
  };
  const sentOffer = async () => {
    const o = await newOffer();
    const { runQuoteDeliveries } = await import('@/lib/quote-delivery');
    const { quoteStore } = await import('@/lib/quote-store');
    await runQuoteDeliveries(quoteStore(hoisted.db as never), process.env);
    return o;
  };
  const dstatus = async (id: string) => (await db.query(`select status, last_error from public.quote_deliveries where lead_quote_id=$1`, [id])).rows[0];

  it('«delivered» firmado confirma; repetirlo no cambia nada', async () => {
    const o = await sentOffer();
    expect(await dstatus(o.id)).toMatchObject({ status: 'sent' });
    const r1 = await send('evt_a', 'email.delivered', 'msg_1');
    expect(await r1.json()).toMatchObject({ ok: true, claimed: true, updated: true });
    expect(await dstatus(o.id)).toMatchObject({ status: 'confirmed' });
    const r2 = await send('evt_a', 'email.delivered', 'msg_1');
    expect(await r2.json()).toMatchObject({ claimed: false, updated: false });
  });
  it('rebote → dead; firma inválida → 401; marca de tiempo vieja → 401; sin secreto → 503', async () => {
    const o = await sentOffer();
    expect((await send('evt_b', 'email.delivered', 'msg_1', Math.floor(Date.now() / 1000), 'v1,AAAA')).status).toBe(401);
    expect((await send('evt_c', 'email.delivered', 'msg_1', Math.floor(Date.now() / 1000) - 3600)).status).toBe(401);
    expect(await dstatus(o.id)).toMatchObject({ status: 'sent' });
    await send('evt_d', 'email.bounced', 'msg_1');
    expect(await dstatus(o.id)).toMatchObject({ status: 'dead', last_error: 'bounced' });
    vi.stubEnv('RESEND_WEBHOOK_SECRET', '');
    expect((await send('evt_e', 'email.delivered', 'msg_1')).status).toBe(503);
    vi.stubEnv('RESEND_WEBHOOK_SECRET', `whsec_${WH_KEY}`);
  });
  it('eventos ajenos o sin id se ignoran con 200', async () => {
    const r = await send('evt_f', 'domain.updated', '');
    expect(r.status).toBe(200);
  });
});

describe('cron /api/cron/lead-deliveries — cotizaciones', () => {
  it('envía las entregas en cola, informa y marca ok=false si algo está bloqueado o muerto', async () => {
    const o = await newOffer();
    // El cron también revisa leads: stub mínimo de las tablas de leads (sin filas).
    const real = hoisted.db as ReturnType<typeof rpcOver>;
    const empty = { select: () => empty, in: () => empty, lte: () => empty, order: () => empty, limit: () => empty, eq: () => empty, then: (r: (v: unknown) => unknown) => r({ data: [], error: null, count: 0 }) };
    hoisted.db = Object.assign(real, { from: () => empty, storage: { from: () => ({ list: async () => ({ data: [], error: null }), remove: async () => ({ error: null }) }) } });
    const { GET } = await import('@/app/api/cron/lead-deliveries/route');
    const unauth = await GET(get('/api/cron/lead-deliveries'));
    expect(unauth.status).toBe(401);
    const res = await GET(get('/api/cron/lead-deliveries', { authorization: 'Bearer cron-secret-value' }));
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.quotes.run).toMatchObject({ sent: 1 });
    expect(j.ok).toBe(true);
    expect(cap.seen).toHaveLength(1);
    // Ahora una entrega bloqueada hace ok=false: la alarma del flujo de vigilancia.
    await newOffer();
    vi.stubEnv('RESEND_API_KEY', '');
    const j2 = await (await GET(get('/api/cron/lead-deliveries', { authorization: 'Bearer cron-secret-value' }))).json();
    vi.stubEnv('RESEND_API_KEY', 're_test');
    expect(j2.ok).toBe(false);
    expect(j2.quotes.health.blocked).toBe(1);
    expect(JSON.stringify(j2)).not.toMatch(/compras@minera|Minera Andina/);
  });
});

describe('rutas del personal sobre la cotización', () => {
  const ids = (o: { lead: { id: string }; id: string }) => ({ lead: o.lead.id });
  const call = async (mod: string, req: NextRequest, params: Record<string, string>) => {
    const m = (await import(mod)) as { POST?: (r: NextRequest, c: unknown) => Promise<Response>; GET?: (r: NextRequest, c: unknown) => Promise<Response> };
    return (req.method === 'GET' ? m.GET! : m.POST!)(req, { params: Promise.resolve(params) });
  };

  it('sin sesión de personal: 404 en toda lectura y escritura; origen ajeno: 403', async () => {
    const o = await newOffer();
    hoisted.staff = null;
    const f = { lead: o.lead.id };
    for (const [mod, path] of [
      ['@/app/api/staff/quotes/[qid]/issue/route', `/api/staff/quotes/${o.id}/issue`],
      ['@/app/api/staff/quotes/[qid]/update/route', `/api/staff/quotes/${o.id}/update`],
      ['@/app/api/staff/quotes/[qid]/link/route', `/api/staff/quotes/${o.id}/link`],
      ['@/app/api/staff/quotes/[qid]/delivery/route', `/api/staff/quotes/${o.id}/delivery`],
      ['@/app/api/staff/quotes/[qid]/resolve/route', `/api/staff/quotes/${o.id}/resolve`],
    ] as const) {
      expect((await call(mod, post(path, f), { qid: o.id })).status, mod).toBe(404);
    }
    expect((await call('@/app/api/staff/quotes/[qid]/pdf/route', get(`/api/staff/quotes/${o.id}/pdf?lead=${o.lead.id}`), { qid: o.id })).status).toBe(404);
    hoisted.staff = 'ventas@p.com';
    expect((await call('@/app/api/staff/quotes/[qid]/link/route', post(`/api/staff/quotes/${o.id}/link`, f, { origin: 'https://evil.test' }), { qid: o.id })).status).toBe(403);
    expect(await qstatus(o.id)).toBe('issued');
  });

  it('con personal autorizado: crear → vista previa → emitir (envía) → reintento → rotar → PDF emitido', async () => {
    hoisted.staff = 'ventas@p.com';
    const lead = await seedLead(db);
    const form = {
      currency: 'USD', validUntil: '2099-01-01', summary: 'Mangas Ø600 x 50 m, 12 unidades',
      item_desc_0: 'Manga Ø600', item_qty_0: '12', item_unit_0: 'UND', item_price_0: '100.00',
      taxTreatment: 'excluded', taxLabel: 'IGV 18% no incluido', taxAmount: '216.00', terms: 'Pago 50% adelanto', notes: 'NOTA INTERNA secreta',
    };
    const created = await call('@/app/api/staff/leads/[id]/quotes/route', post(`/api/staff/leads/${lead.id}/quotes`, form), { id: lead.id });
    expect(created.headers.get('location')).toContain('msg=quote_created');
    const qid = ((await db.query(`select id, amount_cents from public.lead_quotes where quote_id=$1`, [lead.id])).rows[0] as { id: string; amount_cents: number });
    expect(Number(qid.amount_cents)).toBe(141600);

    // Entrada incompleta: una fila a medias NO se adivina.
    const half = await call('@/app/api/staff/leads/[id]/quotes/route', post(`/api/staff/leads/${lead.id}/quotes`, { ...form, item_price_0: '' }), { id: lead.id });
    expect(half.headers.get('location')).toContain('msg=quote_invalid');

    const issued = await call('@/app/api/staff/quotes/[qid]/issue/route', post(`/api/staff/quotes/${qid.id}/issue`, { lead: lead.id }), { qid: qid.id });
    expect(issued.headers.get('location')).toContain('msg=quote_issued');
    expect(await qstatus(qid.id)).toBe('issued');
    expect(cap.seen).toHaveLength(1); // primer intento de entrega al emitir
    expect((await db.query(`select status from public.quote_deliveries where lead_quote_id=$1`, [qid.id])).rows[0]).toEqual({ status: 'sent' });

    // Edición de una emitida: rechazada con mensaje claro.
    const upd = await call('@/app/api/staff/quotes/[qid]/update/route', post(`/api/staff/quotes/${qid.id}/update`, { ...form, lead: lead.id }), { qid: qid.id });
    expect(upd.headers.get('location')).toContain('msg=quote_not_draft');

    // Reintento innecesario → aviso; rotar enlace → revoca, se reenvía con enlace nuevo.
    const noop = await call('@/app/api/staff/quotes/[qid]/delivery/route', post(`/api/staff/quotes/${qid.id}/delivery`, { lead: lead.id }), { qid: qid.id });
    expect(noop.headers.get('location')).toContain('msg=delivery_not_retryable');
    const oldLink = /\/oferta\/(\S+)/.exec(JSON.parse(cap.seen[0].body).text)![1];
    const rot = await call('@/app/api/staff/quotes/[qid]/link/route', post(`/api/staff/quotes/${qid.id}/link`, { lead: lead.id }), { qid: qid.id });
    expect(rot.headers.get('location')).toContain('msg=link_rotated');
    expect(cap.seen).toHaveLength(2);
    const newLink = /\/oferta\/(\S+)/.exec(JSON.parse(cap.seen[1].body).text)![1];
    expect(newLink).not.toBe(oldLink);
    const { quoteStore } = await import('@/lib/quote-store');
    const qs = quoteStore(hoisted.db as never);
    expect(await qs.publicView(hashToken(oldLink))).toEqual({ state: 'revoked', reason: 'manual' });
    expect((await qs.publicView(hashToken(newLink))).state).toBe('open');
  });
});
