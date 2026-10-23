import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer, type Server } from 'node:http';
import { createHmac } from 'node:crypto';
import { AddressInfo } from 'node:net';
import {
  submitLead, retryDueDeliveries, newRfqCode, _resetBurst, RATE_MAX,
} from '@/lib/lead-service';
import { toOutcome, MAX_ATTEMPTS } from '@/lib/lead-delivery';
import { memoryLeadStore } from './helpers/memory-lead-store';

/**
 * PIPELINE DEL RFQ: contrato de recepción honesto, idempotencia, entrega por
 * canal y reintentos. El CRM y Resend son servidores HTTP REALES en localhost:
 * lo probado es la petición que sale, no un mock de fetch.
 */

const lead = (over: Record<string, unknown> = {}) => ({
  nombre: 'Prueba Sintética', empresa: 'ACME Test SAC', email: 'qa+rfq@example.com',
  telefono: '+51 999 000 111', producto: 'Big bag 1 t', cantidad: '40 unidades',
  mensaje: 'Solicitud sintética de prueba', path: '/cotizacion?utm_source=x', origen: 'chat',
  utm_source: 'linkedin', language: 'es', ...over,
});

interface Hit { path: string; headers: Record<string, string | string[] | undefined>; body: string }
let servers: Server[] = [];
function listen(handler: (hit: Hit) => number): Promise<{ url: string; hits: Hit[] }> {
  const hits: Hit[] = [];
  const srv = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const hit = { path: req.url ?? '', headers: req.headers, body };
      hits.push(hit);
      const code = handler(hit);
      if (code === -1) return; // cuelga: simula timeout
      res.statusCode = code;
      res.end('{}');
    });
  });
  servers.push(srv);
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r({ url: `http://127.0.0.1:${(srv.address() as AddressInfo).port}`, hits })));
}
afterEach(() => { servers.forEach((s) => s.closeAllConnections?.() ?? s.close()); servers.forEach((s) => s.close()); servers = []; });
beforeEach(() => _resetBurst());

describe('contrato de recepción', () => {
  it('persiste, asigna código único y confirma con durabilidad "database"', async () => {
    const store = memoryLeadStore();
    const r = await submitLead(lead(), '1.1.1.1', { store, env: {} });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, accepted: true, durability: 'database', persisted: true, customerAction: 'none' });
    expect(r.body.rfqId).toMatch(/^RFQ-\d{8}-[A-HJ-NP-Z2-9]{8}$/);
    expect(store.quotes).toHaveLength(1);
    expect(store.quotes[0].source).toMatch(/\/cotizacion \(chat\)$/);
    // Atribución conservada en el registro durable.
    expect(store.quotes[0].lead.utm_source).toBe('linkedin');
    expect(r.body.delivery).toEqual({ crm: 'disabled', email: 'disabled' });
  });

  it('SIN base y SIN canal externo: 503, accepted=false, canal alterno WhatsApp (nunca un falso éxito)', async () => {
    const r = await submitLead(lead(), '2.2.2.2', { store: null, env: {} });
    expect(r.status).toBe(503);
    expect(r.body).toMatchObject({ ok: false, accepted: false, durability: 'none', customerAction: 'send_via_whatsapp', error: 'not_persisted' });
    expect(r.body.rfqId).toBeUndefined();
  });

  it('la base falla y no hay canal confirmado: 503, no 200', async () => {
    const r = await submitLead(lead(), '3.3.3.3', { store: memoryLeadStore({ failInsert: true }), env: {} });
    expect(r.status).toBe(503);
    expect(r.body.accepted).toBe(false);
  });

  it('la base falla pero el CRM confirmó 2xx: accepted con durabilidad "forwarded", persisted=false', async () => {
    const crm = await listen(() => 200);
    const r = await submitLead(lead(), '4.4.4.4', { store: memoryLeadStore({ failInsert: true }), env: { CRM_WEBHOOK_URL: crm.url } });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ accepted: true, durability: 'forwarded', persisted: false });
    expect(r.body.delivery.crm).toBe('delivered');
  });

  it('entrada inválida: 400 y nada se guarda', async () => {
    const store = memoryLeadStore();
    const r = await submitLead({ email: 'no-es-email', telefono: '1' }, '5.5.5.5', { store, env: {} });
    expect(r.status).toBe(400);
    expect(r.body.accepted).toBe(false);
    expect(store.quotes).toHaveLength(0);
  });
});

describe('idempotencia y códigos', () => {
  it('el mismo envío dos veces (misma clave) no duplica ni vuelve a entregar', async () => {
    const crm = await listen(() => 200);
    const store = memoryLeadStore();
    const env = { CRM_WEBHOOK_URL: crm.url };
    const k = { idempotencyKey: 'abcd1234abcd1234abcd' };
    const a = await submitLead(lead(k), '6.6.6.6', { store, env });
    const b = await submitLead(lead(k), '6.6.6.6', { store, env });
    expect(b.body.rfqId).toBe(a.body.rfqId);
    expect(b.body.duplicate).toBe(true);
    expect(b.body.delivery.crm).toBe('delivered');
    expect(store.quotes).toHaveLength(1);
    expect(crm.hits).toHaveLength(1);
  });

  it('sin clave del cliente, un doble clic idéntico también se deduplica', async () => {
    const store = memoryLeadStore();
    await submitLead(lead(), '7.7.7.7', { store, env: {} });
    const b = await submitLead(lead(), '7.7.7.7', { store, env: {} });
    expect(b.body.duplicate).toBe(true);
    expect(store.quotes).toHaveLength(1);
  });

  it('una colisión de código se reintenta con otro código en vez de fallar', async () => {
    const store = memoryLeadStore();
    store.forceRfqCollisions = 2;
    const r = await submitLead(lead(), '8.8.8.8', { store, env: {} });
    expect(r.body.accepted).toBe(true);
    expect(store.quotes).toHaveLength(1);
  });

  it('1000 códigos no colisionan (espacio de 31^8 por día)', () => {
    const s = new Set(Array.from({ length: 1000 }, () => newRfqCode()));
    expect(s.size).toBe(1000);
  });

  it('10 envíos concurrentes con la misma clave producen una sola solicitud', async () => {
    const store = memoryLeadStore();
    const rs = await Promise.all(
      Array.from({ length: 10 }, () => submitLead(lead({ idempotencyKey: 'concurrente-12345678' }), '9.9.9.9', { store, env: {} })),
    );
    expect(store.quotes).toHaveLength(1);
    expect(new Set(rs.map((r) => r.body.rfqId)).size).toBe(1);
  });
});

describe('entrega por canal', () => {
  it('CRM recibe el evento esperado, firmado, con Idempotency-Key = código RFQ', async () => {
    const crm = await listen(() => 200);
    const store = memoryLeadStore();
    const r = await submitLead(lead(), '10.0.0.1', { store, env: { CRM_WEBHOOK_URL: crm.url, CRM_WEBHOOK_SECRET: 's3cret' } });
    expect(crm.hits).toHaveLength(1);
    const hit = crm.hits[0];
    expect(hit.headers['idempotency-key']).toBe(r.body.rfqId);
    expect(hit.headers['x-plastilonas-signature']).toBe(`sha256=${createHmac('sha256', 's3cret').update(hit.body).digest('hex')}`);
    const payload = JSON.parse(hit.body);
    expect(payload).toMatchObject({ rfqId: r.body.rfqId, email: 'qa+rfq@example.com', persisted: true, utm_source: 'linkedin' });
    expect([...store.deliveries.values()][0]).toMatchObject({ channel: 'crm', status: 'delivered', attempts: 1 });
  });

  it('Resend recibe asunto con el código y autenticación', async () => {
    const mail = await listen(() => 200);
    const r = await submitLead(lead(), '10.0.0.2', {
      store: memoryLeadStore(),
      env: { RESEND_API_KEY: 'rk_test', RESEND_API_BASE: mail.url, LEAD_EMAIL_TO: 'ventas@example.com' },
    });
    expect(mail.hits[0].path).toBe('/emails');
    expect(mail.hits[0].headers.authorization).toBe('Bearer rk_test');
    const body = JSON.parse(mail.hits[0].body);
    expect(body.to).toEqual(['ventas@example.com']);
    expect(body.subject).toContain(r.body.rfqId);
    expect(r.body.delivery.email).toBe('delivered');
  });

  it('CRM 500: el lead se acepta (base) pero el canal queda "failed" y registrado para reintento', async () => {
    const crm = await listen(() => 500);
    const store = memoryLeadStore();
    const r = await submitLead(lead(), '10.0.0.3', { store, env: { CRM_WEBHOOK_URL: crm.url } });
    expect(r.status).toBe(200);
    expect(r.body.delivery.crm).toBe('failed');
    expect(r.body.forwarded).toBe(false);
    const d = [...store.deliveries.values()][0];
    expect(d).toMatchObject({ status: 'failed', attempts: 1, lastError: 'http_5xx' });
    expect(d.next!.getTime()).toBeGreaterThan(Date.now());
  });

  it('un CRM que no responde se corta por tiempo y no cuelga la petición', async () => {
    const crm = await listen(() => -1);
    const t0 = Date.now();
    const r = await submitLead(lead(), '10.0.0.4', { store: memoryLeadStore(), env: { CRM_WEBHOOK_URL: crm.url } });
    expect(Date.now() - t0).toBeLessThan(9000);
    expect(r.body.delivery.crm).toBe('failed');
  }, 15000);

  it('el error registrado nunca contiene datos del cliente', async () => {
    const crm = await listen(() => 500);
    const store = memoryLeadStore();
    await submitLead(lead(), '10.0.0.5', { store, env: { CRM_WEBHOOK_URL: crm.url } });
    expect(JSON.stringify([...store.deliveries.values()])).not.toContain('qa+rfq@example.com');
  });
});

describe('reintentos y recuperación', () => {
  it('una entrega fallida se recupera cuando el CRM vuelve', async () => {
    let up = false;
    const crm = await listen(() => (up ? 200 : 503));
    const store = memoryLeadStore();
    const env = { CRM_WEBHOOK_URL: crm.url };
    await submitLead(lead(), '11.0.0.1', { store, env });
    const d = [...store.deliveries.values()][0];
    expect(d.status).toBe('failed');
    d.next = new Date(Date.now() - 1000); // vence el backoff
    up = true;
    const run = await retryDueDeliveries(store, env);
    expect(run).toMatchObject({ processed: 1, delivered: 1 });
    expect(d).toMatchObject({ status: 'delivered', attempts: 2 });
    expect(crm.hits).toHaveLength(2);
    expect(crm.hits[0].headers['idempotency-key']).toBe(crm.hits[1].headers['idempotency-key']);
  });

  it('tras MAX_ATTEMPTS pasa a "dead" (requiere una persona) y deja de reintentarse', () => {
    let prev = 0;
    let last = toOutcome(prev, { ok: false, error: 'timeout' });
    for (let i = 1; i < MAX_ATTEMPTS; i++) { prev = last.attempts; last = toOutcome(prev, { ok: false, error: 'timeout' }); }
    expect(last.status).toBe('dead');
    expect(last.nextAttemptAt).toBeNull();
  });

  it('entregas aún no vencidas no se reintentan', async () => {
    const crm = await listen(() => 500);
    const store = memoryLeadStore();
    await submitLead(lead(), '11.0.0.2', { store, env: { CRM_WEBHOOK_URL: crm.url } });
    const run = await retryDueDeliveries(store, { CRM_WEBHOOK_URL: crm.url });
    expect(run.processed).toBe(0);
  });
});

describe('límite de tasa', () => {
  it(`la solicitud ${RATE_MAX + 1} desde la misma IP recibe 429 con canal alterno`, async () => {
    const store = memoryLeadStore();
    let last;
    for (let i = 0; i <= RATE_MAX; i++) {
      last = await submitLead(lead({ mensaje: `m${i}` }), '12.0.0.1', { store, env: {} });
    }
    expect(last!.status).toBe(429);
    expect(last!.body.customerAction).toBe('send_via_whatsapp');
  });

  it('el conteo compartido en la base limita aunque otra instancia tenga memoria vacía', async () => {
    const store = memoryLeadStore();
    for (let i = 0; i < RATE_MAX; i++) await submitLead(lead({ mensaje: `a${i}` }), '12.0.0.2', { store, env: {} });
    _resetBurst(); // "otra instancia serverless"
    const r = await submitLead(lead({ mensaje: 'otra' }), '12.0.0.2', { store, env: {} });
    expect(r.status).toBe(429);
  });

  it('si el conteo en la base falla, el comprador legítimo NO queda bloqueado', async () => {
    const r = await submitLead(lead(), '12.0.0.3', { store: memoryLeadStore({ failCount: true }), env: {} });
    expect(r.status).toBe(200);
  });

  it('IPs distintas no se afectan entre sí', async () => {
    const store = memoryLeadStore();
    for (let i = 0; i < RATE_MAX; i++) await submitLead(lead({ mensaje: `b${i}` }), '12.0.0.4', { store, env: {} });
    const r = await submitLead(lead({ mensaje: 'c' }), '12.0.0.5', { store, env: {} });
    expect(r.status).toBe(200);
  });
});
