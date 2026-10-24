import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver } from './helpers/pglite-rpc';

/**
 * El tope de /api/chat y /api/vision se cuenta en Postgres, no por instancia.
 * "Instancia" = una copia nueva de los módulos (memoria vacía) contra la MISMA base.
 */
const hoisted = vi.hoisted(() => ({ db: null as unknown }));
vi.mock('@/lib/supabase', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase')>()),
  supabaseAdmin: () => hoisted.db,
  isSupabaseConfigured: () => true,
}));

let db: PGlite;
const LIMITS = { scope: 'chat', perIp: { windowSeconds: 600, max: 5 }, globalPerHour: 8 } as const;
const h = (ip: string) => new Headers({ 'x-real-ip': ip });

async function instancia() {
  vi.resetModules();
  const mod = await import('@/lib/ai/abuse');
  mod._resetAiLimits();
  return mod.aiLimited;
}

beforeAll(async () => { db = await freshDb(); });
beforeEach(async () => {
  await db.exec('delete from public.rate_limits');
  hoisted.db = rpcOver(db);
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
});

describe('límite de IA compartido entre instancias', () => {
  it('cinco peticiones repartidas en dos instancias cuentan juntas para la misma IP', async () => {
    const a = await instancia();
    const b = await instancia();
    const out: boolean[] = [];
    for (let i = 0; i < 6; i++) out.push(await (i % 2 ? b : a)(h('203.0.113.1'), LIMITS));
    expect(out).toEqual([false, false, false, false, false, true]);
  });

  it('el tope global del sitio entero se agota con IP distintas y vale para todas las instancias', async () => {
    const a = await instancia();
    const b = await instancia();
    const out: boolean[] = [];
    for (let i = 0; i < 10; i++) out.push(await (i % 2 ? b : a)(h(`198.51.100.${i + 1}`), LIMITS));
    expect(out.filter((x) => !x)).toHaveLength(8);
    expect(out.slice(8)).toEqual([true, true]);
  });

  it('ráfaga simultánea desde instancias distintas: nunca pasa más del tope', async () => {
    const insts = await Promise.all(Array.from({ length: 4 }, instancia));
    const rs = await Promise.all(Array.from({ length: 20 }, (_, i) => insts[i % 4](h('203.0.113.77'), LIMITS)));
    expect(rs.filter((blocked) => !blocked)).toHaveLength(5);
  });

  it('si la base falla, cae a memoria: sigue limitando y NO bloquea al comprador legítimo', async () => {
    hoisted.db = { rpc: async () => ({ data: null, error: { message: 'down' } }) };
    const a = await instancia();
    const warn = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const out: boolean[] = [];
    for (let i = 0; i < 6; i++) out.push(await a(h('203.0.113.9'), LIMITS));
    expect(out).toEqual([false, false, false, false, false, true]); // memoria por IP
    expect(await a(h('203.0.113.10'), LIMITS)).toBe(false); // otra IP, intacta
    warn.mockRestore();
  });

  it('la base solo guarda hashes: ninguna IP en claro', async () => {
    const a = await instancia();
    await a(h('203.0.113.250'), LIMITS);
    expect(JSON.stringify((await db.query('select * from public.rate_limits')).rows)).not.toContain('203.0.113.250');
  });
});
