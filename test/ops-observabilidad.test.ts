import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { freshDb, rpcOver, seedLead } from './helpers/pglite-rpc';
import { captureServer } from './helpers/capture-server';
import { checkOutboundUrl, assertPublicDestination, isPrivateAddress } from '@/lib/outbound';
import {
  ALERT_COOLDOWN_S, HEARTBEAT_STALE_S, bumpCounter, dispatchAlerts, evaluateConditions, readiness, recordHeartbeat, sendAlert,
} from '@/lib/ops';
import { deliverCrm } from '@/lib/lead-delivery';

const hoisted = vi.hoisted(() => ({ db: null as unknown }));
vi.mock('@/lib/supabase', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase')>()),
  supabaseAdmin: () => hoisted.db,
  isSupabaseConfigured: () => true,
}));

let db: PGlite;
let cap: Awaited<ReturnType<typeof captureServer>> | undefined;
beforeEach(async () => {
  db = await freshDb();
  hoisted.db = rpcOver(db);
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
});
afterEach(async () => { await cap?.close(); cap = undefined; vi.unstubAllEnvs(); });

const env = (o: Record<string, string | undefined> = {}) => ({ ...o });

describe('SSRF: destinos salientes configurables', () => {
  it('rechaza lo que no es internet pública', () => {
    const bad = [
      'http://hooks.example.com/x', 'https://user:pw@hooks.example.com/x', 'https://localhost/x', 'https://app.localhost/x',
      'https://127.0.0.1/x', 'https://10.0.0.5/x', 'https://172.16.0.1/x', 'https://172.31.255.1/x', 'https://192.168.1.1/x',
      'https://169.254.169.254/latest/meta-data', 'https://100.64.0.1/x', 'https://0.0.0.0/x', 'https://[::1]/x', 'https://[fd00::1]/x',
      'https://[fe80::1]/x', 'https://[::ffff:10.0.0.1]/x', 'https://servicio.internal/x', 'https://impresora.local/x', 'https://intranet/x',
      'ftp://hooks.example.com/x', 'no es una url', 'file:///etc/passwd',
    ];
    for (const u of bad) expect(checkOutboundUrl(u, env()).ok, u).toBe(false);
  });
  it('acepta https público (incluido 172.32 y 100.63, que NO son privadas)', () => {
    for (const u of ['https://hooks.slack.com/services/T/B/X', 'https://n8n.example.com/webhook/abc', 'https://8.8.8.8/x', 'https://172.32.0.1/x', 'https://100.63.0.1/x']) {
      expect(checkOutboundUrl(u, env()).ok, u).toBe(true);
    }
    expect(isPrivateAddress('172.15.0.1')).toBe(false);
  });
  it('ALLOW_PRIVATE_WEBHOOKS=true (solo pruebas locales) permite http y loopback', () => {
    expect(checkOutboundUrl('http://127.0.0.1:9000/x', env({ ALLOW_PRIVATE_WEBHOOKS: 'true' })).ok).toBe(true);
    expect(checkOutboundUrl('http://127.0.0.1:9000/x', env({ ALLOW_PRIVATE_WEBHOOKS: '1' })).ok).toBe(false);
  });
  it('un nombre público que RESUELVE a una dirección privada se bloquea; fallo de DNS también', async () => {
    const priv = async () => ['10.1.2.3'];
    const mixed = async () => ['93.184.216.34', '169.254.169.254'];
    const pub = async () => ['93.184.216.34'];
    const none = async () => { throw new Error('ENOTFOUND'); };
    expect(await assertPublicDestination('https://rebind.example.com/x', env(), priv)).toEqual({ ok: false, reason: 'resolves_to_private' });
    expect(await assertPublicDestination('https://rebind.example.com/x', env(), mixed)).toEqual({ ok: false, reason: 'resolves_to_private' });
    expect(await assertPublicDestination('https://rebind.example.com/x', env(), none)).toEqual({ ok: false, reason: 'dns_failed' });
    expect((await assertPublicDestination('https://ok.example.com/x', env(), pub)).ok).toBe(true);
  });
  it('el CRM configurado hacia la red interna NO recibe el lead (y no se hace ninguna petición)', async () => {
    const f = vi.spyOn(globalThis, 'fetch');
    const r = await deliverCrm({ rfqId: 'R', lead: { email: 'a@b.co', telefono: '999000111' } as never, source: 's', persisted: true, receivedAt: 'x' }, { CRM_WEBHOOK_URL: 'https://169.254.169.254/latest' });
    expect(r).toEqual({ ok: false, error: 'destination_blocked' });
    expect(f).not.toHaveBeenCalled();
    f.mockRestore();
  });
});

describe('preparación (readiness) por función', () => {
  const rpc = () => rpcOver(db);
  const full = { RESEND_API_KEY: 're_x', QUOTE_LINK_SECRET: 'x'.repeat(40), CRON_SECRET: 'c' };

  it('sin base: not_ready (el RFQ no se puede guardar) y lo dice sin detalles', async () => {
    const r = await readiness('rfq', null, env());
    expect(r).toEqual({ status: 'not_ready', function: 'rfq', checks: { database: 'skip', migrations: 'skip' } });
  });
  it('base sana con todas las migraciones: ready para rfq y quote', async () => {
    expect((await readiness('rfq', rpc(), env())).status).toBe('ready');
    expect((await readiness('quote', rpc(), env(full))).status).toBe('ready');
  });
  it('la sonda ESCRIBE: una base de solo lectura es not_ready aunque responda a SELECT', async () => {
    const readonly = { rpc: async (fn: string, a?: Record<string, unknown>) => (fn === 'ops_write_probe' ? { data: null, error: { message: 'read-only transaction' } } : rpc().rpc(fn, a)) };
    expect(await readiness('rfq', readonly, env())).toMatchObject({ status: 'not_ready', checks: { database: 'fail' } });
  });
  it('falta una migración: not_ready SOLO para la función que la necesita', async () => {
    await db.exec('drop table public.quote_deliveries cascade');
    expect((await readiness('rfq', rpc(), env())).status).toBe('ready');
    expect(await readiness('quote', rpc(), env(full))).toMatchObject({ status: 'not_ready', checks: { migrations: 'fail' } });
  });
  it('cotizaciones: sin correo o sin secreto del enlace no está lista', async () => {
    expect(await readiness('quote', rpc(), env({ ...full, RESEND_API_KEY: '' }))).toMatchObject({ status: 'not_ready', checks: { email: 'fail' } });
    expect(await readiness('quote', rpc(), env({ ...full, QUOTE_LINK_SECRET: 'corto' }))).toMatchObject({ status: 'not_ready', checks: { link_secret: 'fail' } });
  });
  it('subidas: exige un bucket PRIVADO que exista', async () => {
    expect((await readiness('upload', rpc(), env(), async () => ({ exists: true, isPublic: false }))).status).toBe('ready');
    expect((await readiness('upload', rpc(), env(), async () => ({ exists: true, isPublic: true }))).status).toBe('not_ready');
    expect((await readiness('upload', rpc(), env(), async () => ({ exists: false, isPublic: false }))).status).toBe('not_ready');
    expect((await readiness('upload', rpc(), env(), async () => { throw new Error('x'); })).status).toBe('not_ready');
  });
  it('latido: sin latido aún no es fallo; correcto = ok; viejo = degraded (no tumba el RFQ)', async () => {
    expect(await readiness('rfq', rpc(), env({ CRON_SECRET: 'c' }))).toMatchObject({ status: 'ready', checks: { retries: 'skip' } });
    await recordHeartbeat(rpc(), true);
    expect(await readiness('rfq', rpc(), env({ CRON_SECRET: 'c' }))).toMatchObject({ status: 'ready', checks: { retries: 'ok' } });
    await db.query(`update public.ops_heartbeats set last_ok_at = now() - make_interval(secs => $1) where name = 'lead-retry'`, [HEARTBEAT_STALE_S + 60]);
    expect(await readiness('rfq', rpc(), env({ CRON_SECRET: 'c' }))).toMatchObject({ status: 'degraded', checks: { retries: 'fail' } });
  });
});

describe('GET /api/ready (público)', () => {
  const get = async (q = '', ip = '203.0.113.5') => {
    vi.resetModules();
    const { GET } = await import('@/app/api/ready/route');
    return GET(new NextRequest(`https://app.test/api/ready${q}`, { headers: { 'x-real-ip': ip } }));
  };
  it('devuelve solo estados: sin versiones, hosts, tablas ni errores', async () => {
    const res = await get();
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(Object.keys(j).sort()).toEqual(['checks', 'function', 'status']);
    expect(JSON.stringify(j)).not.toMatch(/supabase|postgres|quote_|lead_|http|key|secret|error/i);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
  it('función inválida → 400; not_ready → 503; resultados se reutilizan 10 s', async () => {
    expect((await get('?function=otra')).status).toBe(400);
    await db.exec('drop table public.quote_deliveries cascade');
    expect((await get('?function=quote')).status).toBe(503);
  });
  it('limita sondeos abusivos por IP', async () => {
    vi.resetModules();
    const { GET } = await import('@/app/api/ready/route');
    let last = 200;
    for (let i = 0; i < 125; i++) last = (await GET(new NextRequest('https://app.test/api/ready', { headers: { 'x-real-ip': '198.51.100.9' } }))).status;
    expect(last).toBe(429);
  });
});

describe('alertas sin ruido', () => {
  const sendTo = (base: string) => ({ ALERT_WEBHOOK_URL: `${base}/alert`, ALLOW_PRIVATE_WEBHOOKS: 'true' });
  const dead = [{ id: 'quote_dead_letters', severity: 'error' as const, summary: '2 cotización(es) emitida(s) NO llegaron al cliente.' }];

  it('camino real: la alerta llega al receptor con texto legible y SIN datos de clientes', async () => {
    cap = await captureServer();
    const r = await sendAlert({ text: dead[0].summary, severity: 'error', condition: dead[0].id, event: 'alert' }, env(sendTo(cap.base)));
    expect(r).toMatchObject({ ok: true, http: 200 });
    const body = JSON.parse(cap.seen[0].body);
    expect(body).toMatchObject({ event: 'alert', condition: 'quote_dead_letters', service: 'plastilonas-web' });
    expect(body.text).toContain('🚨 Alerta');
    expect(JSON.stringify(body)).not.toMatch(/@|compras|Minera/);
  });
  it('avisa una vez, calla durante el enfriamiento, repite después y avisa la recuperación UNA vez', async () => {
    cap = await captureServer();
    const e = env(sendTo(cap.base));
    const rpc = rpcOver(db);
    expect((await dispatchAlerts(rpc, dead, [], e)).sent).toEqual(['quote_dead_letters']);
    expect((await dispatchAlerts(rpc, dead, [], e)).suppressed).toEqual(['quote_dead_letters']);
    expect(cap.seen).toHaveLength(1);
    await db.query(`update public.ops_alerts set last_sent_at = now() - make_interval(secs => $1)`, [ALERT_COOLDOWN_S + 5]);
    expect((await dispatchAlerts(rpc, dead, [], e)).sent).toEqual(['quote_dead_letters']);
    expect(cap.seen).toHaveLength(2);
    const rec = await dispatchAlerts(rpc, [], [], e);
    expect(rec.recovered).toEqual(['quote_dead_letters']);
    expect(JSON.parse(cap.seen[2].body)).toMatchObject({ event: 'recovery' });
    expect((await dispatchAlerts(rpc, [], [], e)).recovered).toEqual([]); // ya no hay nada que recuperar
    expect(cap.seen).toHaveLength(3);
  });
  it('una lectura que FALLÓ no cuenta como recuperación (no se sabe)', async () => {
    cap = await captureServer();
    const e = env(sendTo(cap.base));
    const rpc = rpcOver(db);
    await dispatchAlerts(rpc, dead, [], e);
    const r = await dispatchAlerts(rpc, [], ['quotes'], e);
    expect(r.recovered).toEqual([]);
    expect(cap.seen).toHaveLength(1);
  });
  it('si el destino falla, la condición NO queda silenciada: se reintenta en la siguiente ejecución', async () => {
    cap = await captureServer(() => ({ status: 500 }));
    const e = env(sendTo(cap.base));
    const rpc = rpcOver(db);
    expect((await dispatchAlerts(rpc, dead, [], e)).failed).toEqual(['quote_dead_letters']);
    expect((await dispatchAlerts(rpc, dead, [], e)).failed).toEqual(['quote_dead_letters']);
    expect(cap.seen).toHaveLength(2); // dos intentos reales, no un silencio de 6 h
  });
  it('sin ALERT_WEBHOOK_URL no hay envío (y se dice) ; destino interno bloqueado', async () => {
    expect(await sendAlert({ text: 'x', severity: 'error', condition: 'c', event: 'alert' }, env())).toEqual({ ok: false, reason: 'not_configured' });
    expect(await sendAlert({ text: 'x', severity: 'error', condition: 'c', event: 'alert' }, env({ ALERT_WEBHOOK_URL: 'https://169.254.169.254/x' }))).toEqual({ ok: false, reason: 'private_address' });
  });
});

describe('evaluación de condiciones', () => {
  const quiet = { dead: 0, blocked: 0, oldestDueAgeSec: null };
  const rpc = () => rpcOver(db);
  it('todo sano → ninguna condición', async () => {
    const r = await evaluateConditions(rpc(), { leads: async () => quiet, quotes: async () => quiet });
    expect(r).toEqual({ active: [], unknown: [] });
  });
  it('detecta dead-letters, bloqueo, atrasos y lo reporta con cuentas, no con datos', async () => {
    const r = await evaluateConditions(rpc(), {
      leads: async () => ({ dead: 2, oldestDueAgeSec: 7200 }), quotes: async () => ({ dead: 1, blocked: 3, oldestDueAgeSec: 9000 }),
    });
    expect(r.active.map((c) => c.id).sort()).toEqual(['quote_blocked', 'quote_dead_letters', 'quote_retry_backlog', 'rfq_dead_letters', 'rfq_retry_backlog']);
    expect(JSON.stringify(r.active)).not.toMatch(/@/);
  });
  it('una fuente que falla queda como «desconocida», no como sana', async () => {
    const r = await evaluateConditions(rpc(), { leads: async () => { throw new Error('x'); }, quotes: async () => quiet });
    expect(r.unknown).toEqual(['rfq']);
  });
  it('integridad: una instantánea alterada o una oferta emitida sin instantánea disparan la condición', async () => {
    const { supabaseStaffStore } = await import('@/lib/staff-store');
    const { QuoteDraftInput } = await import('@/lib/quotations');
    const staff = supabaseStaffStore(rpc() as never);
    const l = await seedLead(db);
    await staff.createQuote(l.id, 'v@p.com', QuoteDraftInput.parse({ currency: 'PEN', validUntil: '2099-01-01', summary: 'Resumen suficiente', items: [{ description: 'Item', quantity: '1', unit: 'UND', unitPrice: '10.00' }], taxTreatment: 'included', taxLabel: 'IGV incl.' }));
    const id = ((await db.query(`select id from public.lead_quotes`)).rows[0] as { id: string }).id;
    await staff.issueQuote(id, 'v@p.com');
    expect((await evaluateConditions(rpc(), { leads: async () => quiet, quotes: async () => quiet })).active).toEqual([]);
    await db.exec('alter table public.lead_quotes disable trigger lead_quotes_guard_trg');
    await db.query(`update public.lead_quotes set snapshot = jsonb_set(snapshot, '{totalCents}', '1') where id=$1`, [id]);
    expect((await evaluateConditions(rpc(), { leads: async () => quiet, quotes: async () => quiet })).active.map((c) => c.id)).toEqual(['quote_integrity']);
  });
  it('ráfagas de accesos denegados al personal: aviso por encima del umbral', async () => {
    for (let i = 0; i < 51; i++) await bumpCounter(rpc(), 'staff-denied');
    const r = await evaluateConditions(rpc(), { leads: async () => quiet, quotes: async () => quiet });
    expect(r.active.map((c) => c.id)).toEqual(['staff_denied_burst']);
  });
  it('latido ausente o viejo → retry_stale', async () => {
    const opts = { includeHeartbeat: true };
    const src = { leads: async () => quiet, quotes: async () => quiet };
    expect((await evaluateConditions(rpc(), src, opts)).active.map((c) => c.id)).toEqual(['retry_stale']);
    await recordHeartbeat(rpc(), true);
    expect((await evaluateConditions(rpc(), src, opts)).active).toEqual([]);
  });
});

describe('cron + alertas + prueba controlada (rutas reales)', () => {
  const stubLeadTables = () => {
    const real = hoisted.db as ReturnType<typeof rpcOver>;
    const empty: Record<string, unknown> = { select: () => empty, in: () => empty, lte: () => empty, order: () => empty, limit: () => empty, eq: () => empty, then: (r: (v: unknown) => unknown) => r({ data: [], error: null, count: 0 }) };
    hoisted.db = Object.assign(real, { from: () => empty, storage: { from: () => ({ list: async () => ({ data: [], error: null }), remove: async () => ({ error: null }) }) } });
  };
  const cronReq = () => new NextRequest('https://app.test/api/cron/lead-deliveries', { headers: { authorization: 'Bearer cron-secret' } });

  it('el cron deja latido y, ante una cotización bloqueada, alerta UNA vez aunque corra dos veces', async () => {
    cap = await captureServer();
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    vi.stubEnv('ALERT_WEBHOOK_URL', `${cap.base}/alert`);
    vi.stubEnv('ALLOW_PRIVATE_WEBHOOKS', 'true');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://x');
    stubLeadTables();
    const { supabaseStaffStore } = await import('@/lib/staff-store');
    const { QuoteDraftInput } = await import('@/lib/quotations');
    const staff = supabaseStaffStore(hoisted.db as never);
    const l = await seedLead(db);
    await staff.createQuote(l.id, 'v@p.com', QuoteDraftInput.parse({ currency: 'PEN', validUntil: '2099-01-01', summary: 'Resumen suficiente', items: [{ description: 'Item', quantity: '1', unit: 'UND', unitPrice: '10.00' }], taxTreatment: 'included', taxLabel: 'IGV incl.' }));
    const id = ((await db.query(`select id from public.lead_quotes`)).rows[0] as { id: string }).id;
    await staff.issueQuote(id, 'v@p.com');

    const { GET } = await import('@/app/api/cron/lead-deliveries/route');
    const j1 = await (await GET(cronReq())).json();
    expect(j1.ok).toBe(false);
    expect(j1.alerts.active).toContain('quote_blocked');
    expect(j1.alerts.sent).toContain('quote_blocked');
    const j2 = await (await GET(cronReq())).json();
    expect(j2.alerts.suppressed).toContain('quote_blocked');
    expect(cap.seen.filter((c) => c.url === '/alert')).toHaveLength(1);
    expect((await db.query(`select last_ok from public.ops_heartbeats where name='lead-retry'`)).rows[0]).toEqual({ last_ok: false });
  });

  it('POST /api/ops/alert-test: protegido, y demuestra el camino real hasta el receptor', async () => {
    cap = await captureServer();
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    const { POST } = await import('@/app/api/ops/alert-test/route');
    const req = (auth?: string) => new NextRequest('https://app.test/api/ops/alert-test', { method: 'POST', headers: auth ? { authorization: auth } : {} });
    expect((await POST(req())).status).toBe(401);
    expect((await POST(req('Bearer incorrecto'))).status).toBe(401);
    expect((await POST(req('Bearer cron-secret'))).status).toBe(503); // sin destino configurado
    vi.stubEnv('ALERT_WEBHOOK_URL', `${cap.base}/alert`);
    vi.stubEnv('ALLOW_PRIVATE_WEBHOOKS', 'true');
    const ok = await POST(req('Bearer cron-secret'));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ ok: true, http: 200 });
    const sent = JSON.parse(cap.seen[0].body);
    expect(sent).toMatchObject({ event: 'test' });
    expect(sent.text).toContain('PRUEBA');
    vi.stubEnv('ALERT_WEBHOOK_URL', 'https://169.254.169.254/x');
    expect((await POST(req('Bearer cron-secret'))).status).toBe(502);
  });
});

describe('cabeceras del enlace de la oferta', () => {
  it('/oferta/* nunca se indexa, cachea ni filtra su URL por Referer', async () => {
    const { default: cfg } = await import('../next.config');
    const rules = await cfg.headers!();
    const r = rules.find((x) => x.source === '/oferta/:path*');
    const h = Object.fromEntries((r?.headers ?? []).map((x) => [x.key, x.value]));
    expect(h['X-Robots-Tag']).toMatch(/noindex/);
    expect(h['Referrer-Policy']).toBe('no-referrer');
    expect(h['Cache-Control']).toMatch(/no-store/);
  });
});

describe('migraciones: actualización con datos y recuperación', () => {
  const sql = (f: string) => readFileSync(`supabase/${f}`, 'utf8');
  async function dbUntil(last: string) {
    const d = new PGlite();
    await d.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
    await d.exec(sql('schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
    for (const f of readdirSync('supabase/migrations').sort()) { if (f > last) break; await d.exec(sql(`migrations/${f}`)); }
    return d;
  }

  it('una base ya en producción (migraciones 1-3, con una oferta emitida) se actualiza sin pérdida ni bloqueo', async () => {
    const old = await dbUntil('20261023020000_rfq_quotations.sql');
    const l = (await old.query(`insert into public.quotes(customer_email, full_name, status, rfq_code, payload) values ('a@b.co','Ana','QUALIFIED','RFQ-OLD-1','{}'::jsonb) returning id`)).rows[0] as { id: string };
    await old.query(`select * from public.lead_quote_create($1,'v@p.com',5000,'PEN','2099-01-01','Oferta heredada completa',null)`, [l.id]);
    const q = (await old.query(`select id from public.lead_quotes`)).rows[0] as { id: string };
    await old.query(`select * from public.lead_quote_issue($1,'v@p.com')`, [q.id]);
    expect((await old.query(`select status from public.lead_quotes`)).rows[0]).toEqual({ status: 'issued' });

    for (const f of readdirSync('supabase/migrations').sort()) if (f > '20261023020000_rfq_quotations.sql') await old.exec(sql(`migrations/${f}`));
    // La oferta heredada sigue ahí, es la vigente y el personal puede resolverla como antes.
    expect((await old.query(`select status, amount_cents::int as a from public.lead_quotes`)).rows[0]).toEqual({ status: 'issued', a: 5000 });
    const rpc = rpcOver(old);
    const rs = await rpc.rpc('lead_quote_resolve', { p_id: q.id, p_actor: 'v@p.com', p_outcome: 'accepted', p_reason: null });
    expect(rs.error).toBeNull();
    expect((await old.query(`select status from public.quotes`)).rows[0]).toEqual({ status: 'WON' });
    // El informe de integridad señala la oferta heredada sin instantánea (hay que revisarla), sin romper nada.
    expect(((await old.query(`select public.quote_integrity_report() as r`)).rows[0] as { r: { issuedWithoutSnapshot: number } }).r.issuedWithoutSnapshot).toBe(1);
    // Y se puede seguir cotizando con el flujo nuevo en el mismo lead.
    const again = await old.query(`select public.lead_quote_create($1,'v@p.com',1000,'PEN','2099-01-01','Nueva versión completa',null,'[]'::jsonb,'included','IGV incl.',null,null) as r`, [l.id]).catch((e) => e);
    expect(String(again.message ?? '')).toMatch(/lead_not_ready/); // el lead ya está WON: no se cotiza de nuevo
  });

  it('restauración: tras volcar y recargar la base, toda oferta emitida conserva una huella verificable', async () => {
    const d = await freshDb();
    const rpc = rpcOver(d);
    const { supabaseStaffStore } = await import('@/lib/staff-store');
    const { QuoteDraftInput } = await import('@/lib/quotations');
    const staff = supabaseStaffStore(rpc as never);
    for (let i = 0; i < 3; i++) {
      const l = await seedLead(d, { company: `Cliente ${i}` });
      await staff.createQuote(l.id, 'v@p.com', QuoteDraftInput.parse({ currency: 'USD', validUntil: '2099-01-01', summary: 'Resumen suficiente', items: [{ description: 'Item', quantity: '2', unit: 'UND', unitPrice: '10.50' }], taxTreatment: 'exempt', taxLabel: 'Exonerado' }));
      const id = ((await d.query(`select id from public.lead_quotes where quote_id=$1`, [l.id])).rows[0] as { id: string }).id;
      await staff.issueQuote(id, 'v@p.com');
    }
    // «Backup»: se vuelcan las filas y se cargan en una base nueva con el mismo esquema.
    const rows = (await d.query(`select * from public.lead_quotes`)).rows as Array<Record<string, unknown>>;
    const quotes = (await d.query(`select * from public.quotes`)).rows as Array<Record<string, unknown>>;
    const restored = await freshDb();
    for (const r of quotes) await restored.query(`insert into public.quotes(id, customer_email, full_name, company, product, quantity, status, rfq_code, payload) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`, [r.id, r.customer_email, r.full_name, r.company, r.product, r.quantity, r.status, r.rfq_code, JSON.stringify(r.payload)]);
    await restored.exec('alter table public.lead_quotes disable trigger lead_quotes_guard_trg');
    for (const r of rows) {
      await restored.query(
        `insert into public.lead_quotes(id, quote_id, version, status, amount_cents, currency, valid_until, summary, created_by, issued_by, issued_at, line_items, subtotal_cents, tax_treatment, tax_label, snapshot, snapshot_hash)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16::jsonb,$17)`,
        [r.id, r.quote_id, r.version, r.status, r.amount_cents, r.currency, r.valid_until, r.summary, r.created_by, r.issued_by, r.issued_at, JSON.stringify(r.line_items), r.subtotal_cents, r.tax_treatment, r.tax_label, JSON.stringify(r.snapshot), r.snapshot_hash],
      );
    }
    await restored.exec('alter table public.lead_quotes enable trigger lead_quotes_guard_trg');
    const rep = ((await restored.query(`select public.quote_integrity_report() as r`)).rows[0] as { r: { checked: number; hashMismatch: number; issuedWithoutSnapshot: number } }).r;
    expect(rep).toEqual({ checked: 3, hashMismatch: 0, issuedWithoutSnapshot: 0 });
  });
});
