import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver } from './helpers/pglite-rpc';
import { memoryLeadStore } from './helpers/memory-lead-store';
import { limitKey } from '@/lib/rate-limit';
import { UPLOAD_MAX_PER_DAY, UPLOAD_MAX_PER_WINDOW, LEAD_MAX_PER_EMAIL_HOUR, LEAD_MAX_PER_IP } from '@/lib/lead-abuse';

/**
 * ABUSO EN EL RFQ Y EN LAS SUBIDAS, contra Postgres real y "instancias"
 * independientes (módulos recargados = memoria vacía, misma base).
 */
const hoisted = vi.hoisted(() => ({ db: null as unknown, signed: 0 }));
vi.mock('@/lib/supabase', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase')>()),
  supabaseAdmin: () => hoisted.db,
  isSupabaseConfigured: () => true,
}));
vi.mock('@/lib/attachment-store', () => ({
  supabaseAttachmentStore: () => ({
    createUpload: async (filename: string) => {
      hoisted.signed++;
      return { path: `incoming/${'a'.repeat(32)}/${filename}`, token: 'tok' };
    },
  }),
}));

let db: PGlite;
beforeAll(async () => { db = await freshDb(); });
beforeEach(async () => {
  await db.exec('delete from public.rate_limits');
  hoisted.db = rpcOver(db);
  hoisted.signed = 0;
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
});

const body = (over: Record<string, unknown> = {}) => JSON.stringify({ name: 'plano.pdf', type: 'application/pdf', size: 12_345, ...over });
const upReq = (b: string, ip: string) =>
  new NextRequest('https://app.test/api/lead/upload-url', { method: 'POST', body: b, headers: { 'x-real-ip': ip, 'content-type': 'application/json' } });
async function instancia() {
  vi.resetModules();
  const { _resetBurst } = await import('@/lib/lead-service');
  _resetBurst();
  return (await import('@/app/api/lead/upload-url/route')).POST;
}

describe('POST /api/lead/upload-url — límite compartido', () => {
  it('un comprador legítimo sube sus 5 archivos sin fricción', async () => {
    const POST = await instancia();
    for (let i = 0; i < 5; i++) {
      const r = await POST(upReq(body({ name: `plano-${i}.pdf` }), '203.0.113.5'));
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ ok: true, token: 'tok' });
    }
    expect(hoisted.signed).toBe(5);
  });

  it('repartir las peticiones entre instancias NO multiplica el tope', async () => {
    const insts = await Promise.all([instancia(), instancia(), instancia()]);
    // instancia() recarga módulos: la última recarga gana el "mock"; cada POST usa su copia.
    const codes: number[] = [];
    for (let i = 0; i < UPLOAD_MAX_PER_WINDOW + 5; i++) {
      codes.push((await insts[i % 3](upReq(body(), '198.51.100.20'))).status);
    }
    expect(codes.filter((c) => c === 200)).toHaveLength(UPLOAD_MAX_PER_WINDOW);
    expect(codes.filter((c) => c === 429)).toHaveLength(5);
    expect(hoisted.signed).toBe(UPLOAD_MAX_PER_WINDOW);
  });

  it('ráfaga simultánea desde instancias distintas: nunca se firman más URLs que el tope', async () => {
    const insts = await Promise.all(Array.from({ length: 4 }, instancia));
    const rs = await Promise.all(Array.from({ length: 40 }, (_, i) => insts[i % 4](upReq(body(), '203.0.113.99'))));
    expect(rs.filter((r) => r.status === 200)).toHaveLength(UPLOAD_MAX_PER_WINDOW);
    expect(hoisted.signed).toBe(UPLOAD_MAX_PER_WINDOW);
  });

  it('el 429 trae Retry-After; otra IP no se ve afectada', async () => {
    const POST = await instancia();
    for (let i = 0; i < UPLOAD_MAX_PER_WINDOW; i++) await POST(upReq(body(), '203.0.113.1'));
    const blocked = await POST(upReq(body(), '203.0.113.1'));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await POST(upReq(body(), '203.0.113.2'))).status).toBe(200);
  });

  it('tope diario por IP: tras agotar el día, aunque la ventana corta esté libre', async () => {
    const POST = await instancia();
    const key = limitKey('upload-ip-dia', (await import('@/lib/lead-service')).hashIp('203.0.113.3'));
    for (let i = 0; i < UPLOAD_MAX_PER_DAY; i++) await (hoisted.db as ReturnType<typeof rpcOver>).rpc('rate_limit_hit', { p_key: key, p_window_seconds: 86_400, p_max: UPLOAD_MAX_PER_DAY });
    expect((await POST(upReq(body(), '203.0.113.3'))).status).toBe(429);
    expect(hoisted.signed).toBe(0);
  });

  it('si el contador no responde NO se firman URLs (cerrado) y se avisa 503', async () => {
    const POST = await instancia();
    hoisted.db = { rpc: async () => ({ data: null, error: { message: 'down' } }) };
    const r = await POST(upReq(body(), '203.0.113.4'));
    expect(r.status).toBe(503);
    expect(await r.json()).toMatchObject({ error: 'limiter_unavailable' });
    expect(r.headers.get('retry-after')).toBeTruthy();
    expect(hoisted.signed).toBe(0);
  });

  it('cuerpos hostiles también gastan cupo, y no firman nada: tipo falso, tamaño excesivo, JSON roto, cuerpo enorme', async () => {
    const POST = await instancia();
    expect((await POST(upReq(body({ name: 'x.exe', type: 'application/octet-stream' }), '203.0.113.6'))).status).toBe(400);
    expect((await POST(upReq(body({ size: 21 * 1024 * 1024 }), '203.0.113.6'))).status).toBe(400);
    expect((await POST(upReq('{roto', '203.0.113.6'))).status).toBe(400);
    expect((await POST(upReq('x'.repeat(5000), '203.0.113.6'))).status).toBe(413);
    expect((await POST(upReq(body({ name: '../../etc/passwd.pdf' }), '203.0.113.6'))).status).toBe(200); // el nombre se reconstruye
    expect(hoisted.signed).toBe(1);
    const used = await db.query(`select count from public.rate_limits where key = $1`, [limitKey('upload-ip', (await import('@/lib/lead-service')).hashIp('203.0.113.6'))]);
    expect((used.rows[0] as { count: number }).count).toBe(5);
  });
});

describe('POST /api/lead — límite atómico por IP y por correo', () => {
  const lead = (email: string) => ({ nombre: 'Ana', email, telefono: '999000111', mensaje: 'Necesito mantas cobertoras', idempotencyKey: undefined });
  async function submit(email: string, ip: string, limiter: unknown = hoisted.db) {
    const { submitLead } = await import('@/lib/lead-service');
    const store = memoryLeadStore();
    return submitLead(lead(email) as never, ip, { store, limiter: limiter as never, env: { CRM_WEBHOOK_URL: '' } });
  }

  it('RFQ normales de un comprador: pasan', async () => {
    const { _resetBurst } = await import('@/lib/lead-service'); _resetBurst();
    const r = await submit('compras@minera.example', '203.0.113.30');
    expect([200, 503]).toContain(r.status); // sin canal de entrega el store en memoria persiste → 200
    expect(r.status).not.toBe(429);
  });

  it('el mismo correo desde muchas IP se frena por correo (spam de un destinatario)', async () => {
    const { _resetBurst } = await import('@/lib/lead-service'); _resetBurst();
    const out: number[] = [];
    for (let i = 0; i < LEAD_MAX_PER_EMAIL_HOUR + 3; i++) out.push((await submit('victima@empresa.example', `192.0.2.${i + 10}`)).status);
    expect(out.filter((s) => s === 429)).toHaveLength(3);
    expect(out.slice(0, LEAD_MAX_PER_EMAIL_HOUR).every((s) => s !== 429)).toBe(true);
  });

  it('el correo se compara sin mayúsculas ni espacios y nunca se guarda en claro', async () => {
    const { _resetBurst } = await import('@/lib/lead-service'); _resetBurst();
    for (let i = 0; i < LEAD_MAX_PER_EMAIL_HOUR; i++) await submit(i % 2 ? ' Mixto@Empresa.Example ' : 'mixto@empresa.example', `192.0.2.${i + 100}`);
    expect((await submit('MIXTO@empresa.example', '192.0.2.200')).status).toBe(429);
    expect(JSON.stringify((await db.query('select * from public.rate_limits')).rows)).not.toMatch(/mixto|empresa\.example/i);
  });

  it('ráfaga simultánea desde instancias distintas: SOLO el contador atómico compartido la frena', async () => {
    // Una copia nueva de los módulos por petición = memoria vacía: ninguna instancia ve a las otras.
    const submits: Array<(typeof import('@/lib/lead-service'))['submitLead']> = [];
    for (let i = 0; i < LEAD_MAX_PER_IP + 8; i++) {
      vi.resetModules();
      submits.push((await import('@/lib/lead-service')).submitLead);
    }
    const rs = await Promise.all(submits.map((submitLead, i) =>
      submitLead(lead(`c${i}@x.example`) as never, '203.0.113.77', { store: memoryLeadStore(), limiter: hoisted.db as never, env: {} })));
    expect(rs.filter((r) => r.status === 429)).toHaveLength(8);
    expect(rs.filter((r) => r.status !== 429)).toHaveLength(LEAD_MAX_PER_IP);
  });

  it('si el limitador falla se ABRE: el RFQ del comprador no se pierde', async () => {
    const { _resetBurst } = await import('@/lib/lead-service'); _resetBurst();
    const broken = { rpc: async () => ({ data: null, error: { message: 'down' } }) };
    const r = await submit('ok@empresa.example', '203.0.113.88', broken);
    expect(r.status).not.toBe(429);
  });
});
