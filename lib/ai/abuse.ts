/**
 * Control de abuso y de COSTE de los endpoints que llaman a un modelo.
 *
 * Dos capas:
 *  · compartida (Postgres, rate_limit_hit): cuenta entre instancias serverless;
 *  · local (memoria): respaldo cuando no hay base configurada o no responde.
 *    Nunca es peor que el comportamiento anterior (solo memoria), y una caída
 *    de la base NO apaga el asistente ni deja el gasto sin tope.
 *
 * Límites: por IP (hash) y GLOBAL por hora (tope de gasto del endpoint).
 */
import { clientIp, hashIp, logEvent } from '@/lib/lead-service';
import { hitAll, type Rule } from '@/lib/rate-limit';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export interface AiLimits {
  scope: string;
  perIp: { windowSeconds: number; max: number };
  /** Tope global por hora de todo el sitio para este endpoint (control de gasto). */
  globalPerHour: number;
}

type Bucket = { n: number; t: number };
const memory = new Map<string, Bucket>();

function memoryHit(key: string, windowSeconds: number, max: number, now = Date.now()): boolean {
  const hit = memory.get(key);
  if (!hit || now - hit.t > windowSeconds * 1000) {
    memory.set(key, { n: 1, t: now });
    if (memory.size > 5000) for (const [k, v] of memory) if (now - v.t > windowSeconds * 1000) memory.delete(k);
    return false;
  }
  hit.n += 1;
  return hit.n > max;
}

/** Solo para pruebas. */
export function _resetAiLimits() { memory.clear(); }

export const globalCap = (env: Record<string, string | undefined>, name: string, fallback: number) => {
  const n = Number(env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

/** true = bloqueado. */
export async function aiLimited(headers: Headers, l: AiLimits): Promise<boolean> {
  const ip = hashIp(clientIp(headers));
  const rules: Rule[] = [
    { scope: `${l.scope}-ip`, subject: ip, windowSeconds: l.perIp.windowSeconds, max: l.perIp.max },
    { scope: `${l.scope}-global`, subject: 'all', windowSeconds: 3600, max: l.globalPerHour },
  ];
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const v = await hitAll(supabaseAdmin(), rules, 'closed');
    if (v.allowed) return false;
    if (!('unavailable' in v)) return true;
    logEvent('ai_limiter_fallback', { level: 'warn', scope: l.scope });
  }
  const byIp = memoryHit(`${l.scope}:ip:${ip}`, l.perIp.windowSeconds, l.perIp.max);
  const global = memoryHit(`${l.scope}:global`, 3600, l.globalPerHour);
  return byIp || global;
}

/**
 * Qué se registra de un error del proveedor: nombre, código HTTP y un mensaje
 * corto. NUNCA el objeto entero: un APICallError arrastra `requestBodyValues`
 * (el texto del visitante y el prompt) y las cabeceras de la respuesta.
 */
export function safeError(error: unknown): { name: string; status?: number; message: string } {
  const e = error as { name?: unknown; statusCode?: unknown; message?: unknown } | null;
  return {
    name: typeof e?.name === 'string' ? e.name : 'Error',
    ...(typeof e?.statusCode === 'number' ? { status: e.statusCode } : {}),
    message: String(typeof e?.message === 'string' ? e.message : error).slice(0, 160),
  };
}
