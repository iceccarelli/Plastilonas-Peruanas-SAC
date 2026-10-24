import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver, seedLead } from './helpers/pglite-rpc';
import { captureServer } from './helpers/capture-server';
import { quoteStore } from '@/lib/quote-store';
import { supabaseStaffStore } from '@/lib/staff-store';
import { QuoteDraftInput } from '@/lib/quotations';
import { runQuoteDeliveries, verifySvix, QUOTE_MAX_ATTEMPTS } from '@/lib/quote-delivery';
import { hashToken, TOKEN_RE } from '@/lib/quote-token';

const SECRET = 'a-very-long-link-secret-0123456789abcdef';

describe('entrega de la cotización (proveedor local de captura)', () => {
  let db: PGlite;
  let qs: ReturnType<typeof quoteStore>;
  let leadId: string;
  let qid: string;
  let cap: Awaited<ReturnType<typeof captureServer>> | undefined;

  const env = (over: Record<string, string | undefined> = {}) => ({
    RESEND_API_KEY: 're_test_key', RESEND_API_BASE: cap?.base, QUOTE_LINK_SECRET: SECRET, LEAD_EMAIL_FROM: 'Ventas <ventas@example.test>', ...over,
  });
  const row = async () => (await db.query(`select status, attempts, last_error, last_http_status, provider_message_id, next_attempt_at from public.quote_deliveries where lead_quote_id=$1`, [qid])).rows[0] as Record<string, any>;
  /** Hace vencer la entrega para el siguiente ciclo (el arrendamiento y el retroceso son reales). */
  const due = () => db.query(`update public.quote_deliveries set next_attempt_at = now() - interval '1 second' where lead_quote_id=$1`, [qid]);

  beforeEach(async () => {
    db = await freshDb();
    const rpc = rpcOver(db);
    qs = quoteStore(rpc);
    const l = await seedLead(db);
    leadId = l.id;
    const staff = supabaseStaffStore(rpc as never);
    await staff.createQuote(l.id, 'v@p.com', QuoteDraftInput.parse({
      currency: 'USD', validUntil: '2099-01-01', summary: 'Mangas Ø600 x 50 m, 12 unidades',
      items: [{ description: 'Manga Ø600', quantity: '12', unit: 'UND', unitPrice: '100.00' }], taxTreatment: 'included', taxLabel: 'IGV incluido',
    }));
    qid = ((await db.query(`select id from public.lead_quotes where quote_id=$1`, [leadId])).rows[0] as { id: string }).id;
    await staff.issueQuote(qid, 'v@p.com');
  });
  afterEach(async () => { await cap?.close(); cap = undefined; });

  it('envía el correo con enlace personal y el PDF exacto; queda «sent», NO «confirmed»', async () => {
    cap = await captureServer();
    const r = await runQuoteDeliveries(qs, env());
    expect(r).toMatchObject({ processed: 1, sent: 1, failed: 0, dead: 0, blocked: 0 });
    expect(cap.seen).toHaveLength(1);
    const mail = JSON.parse(cap.seen[0].body);
    expect(mail.to).toEqual(['compras@minera.example']);
    expect(cap.seen[0].headers.authorization).toBe('Bearer re_test_key');
    const url = /https?:\/\/\S+\/oferta\/(\S+)/.exec(mail.text)!;
    const token = url[1];
    expect(token).toMatch(TOKEN_RE);
    expect(mail.attachments).toHaveLength(1);
    const pdf = Buffer.from(mail.attachments[0].content, 'base64');
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(mail.text).toContain('US$ 1,200.00');
    // El correo no promete nada que no exista: sin precios/fechas inventados.
    expect(mail.text).not.toMatch(/entrega en \d+|garant/i);
    // El enlace del correo abre ESA oferta, y la fila quedó «sent» con id de proveedor.
    const v = await qs.publicView(hashToken(token));
    expect(v.state).toBe('open');
    expect(await row()).toMatchObject({ status: 'sent', attempts: 1, provider_message_id: 'msg_1', last_error: null });
  });

  it('sin RESEND_API_KEY: BLOQUEADA y visible; no se intenta ni se finge', async () => {
    cap = await captureServer();
    const r = await runQuoteDeliveries(qs, env({ RESEND_API_KEY: undefined }));
    expect(r).toMatchObject({ processed: 1, blocked: 1, sent: 0 });
    expect(cap.seen).toHaveLength(0);
    expect(await row()).toMatchObject({ status: 'blocked', last_error: 'email_not_configured', attempts: 0 });
  });

  it('sin secreto de enlace (o demasiado corto): bloqueada, y se desbloquea al configurarlo', async () => {
    cap = await captureServer();
    await runQuoteDeliveries(qs, env({ QUOTE_LINK_SECRET: 'corto' }));
    expect(await row()).toMatchObject({ status: 'blocked', last_error: 'link_secret_missing' });
    await due();
    const r = await runQuoteDeliveries(qs, env());
    expect(r.sent).toBe(1);
    expect(await row()).toMatchObject({ status: 'sent' });
  });

  it('error 5xx: falla con reintento programado y MISMO enlace + MISMA clave de idempotencia', async () => {
    cap = await captureServer((n) => (n === 1 ? { status: 503, body: { message: 'x' } } : {}));
    const r1 = await runQuoteDeliveries(qs, env());
    expect(r1).toMatchObject({ failed: 1, sent: 0 });
    const f = await row();
    expect(f).toMatchObject({ status: 'failed', attempts: 1, last_error: 'http_5xx', last_http_status: 503 });
    expect(new Date(f.next_attempt_at).getTime()).toBeGreaterThan(Date.now());
    // Todavía no vence: nada que hacer (y nada se envía de más).
    expect((await runQuoteDeliveries(qs, env())).processed).toBe(0);
    await due();
    expect((await runQuoteDeliveries(qs, env())).sent).toBe(1);
    expect(cap.seen).toHaveLength(2);
    expect(cap.seen[0].headers['idempotency-key']).toBe(cap.seen[1].headers['idempotency-key']);
    const link = (i: number) => /\/oferta\/(\S+)/.exec(JSON.parse(cap!.seen[i].body).text)![1];
    expect(link(0)).toBe(link(1));
    expect(await row()).toMatchObject({ status: 'sent', attempts: 2, last_error: null });
  });

  it('tiempo de espera agotado: «failed» con código timeout', async () => {
    cap = await captureServer(() => ({ hang: true }));
    const r = await runQuoteDeliveries(qs, env({ QUOTE_EMAIL_TIMEOUT_MS: '150' }));
    expect(r.failed).toBe(1);
    expect(await row()).toMatchObject({ status: 'failed', last_error: 'timeout' });
  });

  it('4xx permanente (dirección inválida): muerta de inmediato, sin insistir', async () => {
    cap = await captureServer(() => ({ status: 422, body: { message: 'invalid to' } }));
    const r = await runQuoteDeliveries(qs, env());
    expect(r).toMatchObject({ dead: 1, failed: 0 });
    expect(await row()).toMatchObject({ status: 'dead', last_error: 'http_4xx', last_http_status: 422, next_attempt_at: null });
    await due();
    expect((await runQuoteDeliveries(qs, env())).processed).toBe(0);
  });

  it('429 es reintentable; tras agotar los intentos pasa a dead-letter', async () => {
    cap = await captureServer(() => ({ status: 429 }));
    for (let i = 1; i <= QUOTE_MAX_ATTEMPTS; i++) {
      await due();
      await runQuoteDeliveries(qs, env());
      const s = await row();
      expect(s.attempts).toBe(i);
      expect(s.status).toBe(i < QUOTE_MAX_ATTEMPTS ? 'failed' : 'dead');
    }
    expect(cap.seen).toHaveLength(QUOTE_MAX_ATTEMPTS);
    expect((await qs.health()).dead).toBe(1);
  });

  it('solicitudes duplicadas: dos ejecuciones simultáneas envían UN solo correo', async () => {
    cap = await captureServer();
    const [a, b] = await Promise.all([runQuoteDeliveries(qs, env()), runQuoteDeliveries(qs, env())]);
    expect(a.sent + b.sent).toBe(1);
    expect(cap.seen).toHaveLength(1);
  });

  it('no envía una oferta que dejó de ser la vigente', async () => {
    cap = await captureServer();
    const staff = supabaseStaffStore(rpcOver(db) as never);
    await staff.resolveQuote(qid, 'v@p.com', 'accepted');
    const r = await runQuoteDeliveries(qs, env());
    expect(r.processed).toBe(0);
    expect(cap.seen).toHaveLength(0);
    expect(await row()).toMatchObject({ status: 'dead', last_error: 'not_current' });
  });

  it('reintento manual tras agotarse: vuelve a la cola, mismo enlace, y se envía', async () => {
    cap = await captureServer((n) => (n <= QUOTE_MAX_ATTEMPTS ? { status: 500 } : {}));
    for (let i = 0; i < QUOTE_MAX_ATTEMPTS; i++) { await due(); await runQuoteDeliveries(qs, env()); }
    expect((await row()).status).toBe('dead');
    expect(await qs.requeueDelivery(qid, 'v@p.com')).toEqual({ ok: true, requeued: true });
    expect((await runQuoteDeliveries(qs, env())).sent).toBe(1);
    expect((await row()).status).toBe('sent');
  });

  it('datos hostiles del cliente y de las partidas: el PDF se genera y el correo es texto plano', async () => {
    cap = await captureServer();
    await db.query(`delete from public.quote_deliveries`); // solo la oferta hostil
    const rpc = rpcOver(db);
    const staff = supabaseStaffStore(rpc as never);
    const l = await seedLead(db, { full_name: '<img src=x onerror=alert(1)>\u0081 Ana ✓ 😀', company: 'ACME "; DROP TABLE x; --' });
    await staff.createQuote(l.id, 'v@p.com', QuoteDraftInput.parse({
      currency: 'PEN', validUntil: '2099-01-01', summary: '<script>alert(1)</script>\n\n{{7*7}} ${process.env.X} \u202e',
      items: [{ description: '</td><svg onload=alert(1)> Ø600 → ≥ 5 m²', quantity: '1', unit: 'UND', unitPrice: '10.00' }],
      taxTreatment: 'exempt', taxLabel: 'Exonerado <b>x</b>', terms: 'Línea 1\nLínea 2 \u0007',
    }));
    const hid = ((await db.query(`select id from public.lead_quotes where quote_id=$1`, [l.id])).rows[0] as { id: string }).id;
    await staff.issueQuote(hid, 'v@p.com');
    const r = await runQuoteDeliveries(qs, env());
    expect(r).toMatchObject({ sent: 1, dead: 0, failed: 0 });
    const mail = JSON.parse(cap.seen[0].body);
    expect(mail.html).toBeUndefined(); // solo texto plano: no hay marcado que interpretar
    expect(Buffer.from(mail.attachments[0].content, 'base64').subarray(0, 5).toString()).toBe('%PDF-');
  });
});

describe('firma de webhooks (Svix)', () => {
  const key = Buffer.from('super-secret-key-bytes-123456789').toString('base64');
  const secret = `whsec_${key}`;
  const sign = (id: string, ts: number, body: string) =>
    `v1,${createHmac('sha256', Buffer.from(key, 'base64')).update(`${id}.${ts}.${body}`).digest('base64')}`;
  const now = 1_800_000_000;
  const body = '{"type":"email.delivered","data":{"email_id":"msg_1"}}';

  it('acepta una firma válida (y entre varias firmas)', () => {
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: sign('evt_1', now, body) }, body, secret, now)).toBe(true);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: `v1,AAAA ${sign('evt_1', now, body)}` }, body, secret, now)).toBe(true);
  });
  it('rechaza cuerpo alterado, id distinto, secreto ajeno y cabeceras ausentes', () => {
    const sig = sign('evt_1', now, body);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: sig }, body + ' ', secret, now)).toBe(false);
    expect(verifySvix({ id: 'evt_2', timestamp: String(now), signature: sig }, body, secret, now)).toBe(false);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: sig }, body, 'whsec_' + Buffer.from('otro').toString('base64'), now)).toBe(false);
    expect(verifySvix({ id: null, timestamp: String(now), signature: sig }, body, secret, now)).toBe(false);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: null }, body, secret, now)).toBe(false);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now), signature: 'v2,' + sig.slice(3) }, body, secret, now)).toBe(false);
  });
  it('rechaza marcas de tiempo viejas o futuras (anti-replay)', () => {
    const sig = sign('evt_1', now - 301, body);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now - 301), signature: sig }, body, secret, now)).toBe(false);
    const sig2 = sign('evt_1', now + 301, body);
    expect(verifySvix({ id: 'evt_1', timestamp: String(now + 301), signature: sig2 }, body, secret, now)).toBe(false);
    expect(verifySvix({ id: 'evt_1', timestamp: 'abc', signature: sig }, body, secret, now)).toBe(false);
  });
});
