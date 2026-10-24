/**
 * Límite de tasa COMPARTIDO entre instancias serverless.
 *
 * Una instancia no ve a las demás: un Map en memoria deja pasar N× el límite
 * (una vez por instancia en caliente). Aquí cada golpe es UNA sentencia atómica
 * en Postgres (rate_limit_hit): las ráfagas simultáneas se serializan sobre la
 * misma fila y el contador nunca se pierde ni se cuenta dos veces.
 *
 * Las claves son hashes: la base nunca guarda una IP en claro.
 *
 * Fallo de la dependencia: cada uso declara su política.
 *  · 'closed' — operaciones caras o con efecto (decidir una oferta, emitir URLs
 *    firmadas de subida): sin base no hay forma de contar, se niega con 503.
 *  · 'open'   — el comprador legítimo no pierde su RFQ por una caída del
 *    contador; el resto de defensas (tope de cuerpo, idempotencia) siguen.
 */
import { createHash } from 'node:crypto';

export interface RpcClient {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>;
}

export type Verdict =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number }
  | { allowed: false; unavailable: true; retryAfterSeconds: number };

export interface Rule { scope: string; subject: string; windowSeconds: number; max: number }

/** Clave opaca: el sujeto (IP, token, sesión) nunca llega en claro a la base. */
export function limitKey(scope: string, subject: string): string {
  return `${scope}:${createHash('sha256').update(subject).digest('hex').slice(0, 32)}`;
}

export async function hit(db: RpcClient, rule: Rule, onError: 'open' | 'closed'): Promise<Verdict> {
  try {
    const { data, error } = await db.rpc('rate_limit_hit', {
      p_key: limitKey(rule.scope, rule.subject), p_window_seconds: rule.windowSeconds, p_max: rule.max,
    });
    const d = data as { allowed?: boolean; remaining?: number; retryAfterSeconds?: number } | null;
    if (error || !d || typeof d.allowed !== 'boolean') throw new Error('rate store error');
    return d.allowed
      ? { allowed: true, remaining: d.remaining ?? 0 }
      : { allowed: false, retryAfterSeconds: d.retryAfterSeconds ?? rule.windowSeconds };
  } catch {
    return onError === 'open'
      ? { allowed: true, remaining: 0 }
      : { allowed: false, unavailable: true, retryAfterSeconds: 30 };
  }
}

/** Aplica varias reglas en orden; se detiene en la primera que niega. */
export async function hitAll(db: RpcClient, rules: Rule[], onError: 'open' | 'closed'): Promise<Verdict> {
  let last: Verdict = { allowed: true, remaining: Infinity };
  for (const r of rules) {
    last = await hit(db, r, onError);
    if (!last.allowed) return last;
  }
  return last;
}
