/**
 * Servicio de RFQ: guarda primero, confirma después.
 *
 * Orden deliberado:
 *   1. validar -> 2. límite de tasa compartido -> 3. INSERT con clave de
 *      idempotencia y código único -> 4. entregar a CRM/correo y registrar el
 *      resultado POR CANAL -> 5. responder lo que realmente ocurrió.
 *
 * Una solicitud solo se confirma (`accepted`) si quedó en la base o si un
 * canal externo respondió 2xx. Si no, el comprador recibe un 503 y la
 * indicación de usar WhatsApp: nunca un "recibido" falso.
 */
import { createHash, randomInt } from 'node:crypto';
import { SITE } from '@/lib/site';
import { LeadSchema, type LeadInput } from '@/lib/lead-schema';
import type { ChannelState, Durability, LeadResponse } from '@/lib/lead-contract';
import {
  attempt, enabledChannels, toOutcome, type DeliveryContext, type EnvLike,
} from '@/lib/lead-delivery';
import type { Channel, LeadStore } from '@/lib/lead-store';
import type { AttachmentStore } from '@/lib/attachment-store';
import { hitAll, type RpcClient } from '@/lib/rate-limit';
import { leadRules } from '@/lib/lead-abuse';

const SITE_HOST = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const RATE_MAX = 12;

/** Sin 0/O/1/I/L: el código se dicta por teléfono y WhatsApp. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function newRfqCode(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  let r = '';
  for (let i = 0; i < 8; i++) r += ALPHABET[randomInt(ALPHABET.length)];
  return `RFQ-${d}-${r}`;
}

export function fuenteDe(lead: { path?: string; origen?: string }): string {
  const ruta = (lead.path ?? '/cotizacion').split('?')[0];
  return `${SITE_HOST}${ruta}${lead.origen ? ` (${lead.origen})` : ''}`;
}

export function idempotencyKeyFor(lead: LeadInput, now = Date.now()): string {
  if (lead.idempotencyKey) return `c:${lead.idempotencyKey}`;
  const hour = Math.floor(now / 3_600_000);
  const h = createHash('sha256')
    .update([lead.email.toLowerCase(), lead.producto ?? '', lead.cantidad ?? '', lead.mensaje ?? '', hour].join('|'))
    .digest('hex');
  return `d:${h.slice(0, 40)}`;
}

export function hashIp(ip: string, env: EnvLike = process.env): string {
  const salt = env.LEAD_IP_SALT || env.AUTH_SECRET || 'plastilonas-lead';
  return createHash('sha256').update(`${salt}|${ip}`).digest('hex').slice(0, 32);
}

/**
 * IP del cliente. En Vercel la plataforma fija x-vercel-forwarded-for /
 * x-real-ip y descarta lo que traiga el cliente; fuera de Vercel esas
 * cabeceras son falsificables, por eso el límite también se aplica por
 * clave de idempotencia y por tamaño de cuerpo.
 */
export function clientIp(h: Headers): string {
  return (
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function logEvent(event: string, fields: Record<string, string | number | boolean | null | undefined> = {}) {
  // Solo códigos y contadores: nunca email, teléfono ni texto libre.
  console.log(JSON.stringify({ level: fields.level ?? 'info', service: 'lead', event, ...fields }));
}

const burst = new Map<string, { n: number; t: number }>();
function burstLimited(key: string): boolean {
  const now = Date.now();
  const hit = burst.get(key);
  if (!hit || now - hit.t > RATE_WINDOW_MS) {
    burst.set(key, { n: 1, t: now });
    return false;
  }
  hit.n += 1;
  return hit.n > RATE_MAX;
}
/** Solo para pruebas. */
export function _resetBurst() { burst.clear(); }

const NO_DELIVERY: LeadResponse['delivery'] = { crm: 'disabled', email: 'disabled' };

function response(p: Partial<LeadResponse> & { accepted: boolean; durability: Durability }): LeadResponse {
  const delivery = p.delivery ?? NO_DELIVERY;
  return {
    ok: p.accepted,
    customerAction: p.accepted ? 'none' : 'send_via_whatsapp',
    persisted: p.durability === 'database',
    attachments: { requested: 0, attached: 0 },
    forwarded: delivery.crm === 'delivered',
    emailed: delivery.email === 'delivered',
    ...p,
    delivery,
  };
}

export interface ServiceDeps {
  store: LeadStore | null;
  /** Contador atómico compartido entre instancias (rate_limit_hit). Opcional: sin él solo rigen los demás topes. */
  limiter?: RpcClient | null;
  attachments?: AttachmentStore | null;
  env?: EnvLike;
}

export interface ServiceResult {
  status: number;
  body: LeadResponse;
}

function stateOf(s: string | undefined): ChannelState {
  if (s === 'delivered') return 'delivered';
  if (s === 'pending') return 'pending';
  return 'failed';
}

export async function submitLead(
  raw: unknown,
  ip: string,
  deps: ServiceDeps,
): Promise<ServiceResult> {
  const env = deps.env ?? process.env;
  const store = deps.store;

  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 400, body: response({ accepted: false, durability: 'none', error: 'invalid_fields', customerAction: 'retry_later' }) };
  }
  const lead = parsed.data;
  const ipHash = hashIp(ip, env);

  // Límite de tasa: ráfaga local + conteo compartido en la base. Si la base
  // falla se ABRE la compuerta: un comprador legítimo no pierde su RFQ por eso.
  let limited = burstLimited(ipHash);
  if (!limited && store) {
    try {
      limited = (await store.countRecentByIp(ipHash, RATE_WINDOW_MS)) >= RATE_MAX;
    } catch {
      logEvent('rate_check_unavailable', { level: 'warn' });
    }
  }
  // Contador ATÓMICO compartido (por IP y por correo). `countRecentByIp` de arriba
  // lee y decide en dos pasos —ráfagas simultáneas pasan todas—; este incrementa
  // y decide en uno. Si el contador falla se ABRE: el RFQ de un comprador real no
  // se pierde por una caída del limitador (siguen la idempotencia y el tope de cuerpo).
  if (!limited && deps.limiter) {
    const v = await hitAll(deps.limiter, leadRules(ipHash, lead.email), 'open');
    if (!v.allowed) limited = true;
  }
  if (limited) {
    logEvent('rate_limited', { level: 'warn' });
    return { status: 429, body: response({ accepted: false, durability: 'none', error: 'rate_limited', customerAction: 'send_via_whatsapp' }) };
  }

  const idempotencyKey = idempotencyKeyFor(lead);
  const source = fuenteDe(lead);
  const channels = enabledChannels(env);
  const receivedAt = new Date().toISOString();

  let rfqId = newRfqCode();
  let quoteId: string | null = null;
  let persisted = false;

  if (store) {
    try {
      for (let i = 0; i < 5 && !quoteId; i++) {
        const r = await store.insertQuote({ rfqId, idempotencyKey, ipHash, source, lead });
        if (r.kind === 'created') {
          quoteId = r.quote.id;
          rfqId = r.quote.rfqId;
          if (r.degraded) logEvent('migration_pending', { level: 'error', rfq: rfqId });
        } else if (r.kind === 'duplicate') {
          logEvent('lead_duplicate', { rfq: r.quote.rfqId });
          const d = r.deliveries;
          return {
            status: 200,
            body: response({
              accepted: true, durability: 'database', rfqId: r.quote.rfqId, duplicate: true,
              delivery: {
                crm: channels.includes('crm') ? stateOf(d.crm) : 'disabled',
                email: channels.includes('email') ? stateOf(d.email) : 'disabled',
              },
            }),
          };
        } else {
          rfqId = newRfqCode();
        }
      }
      persisted = quoteId !== null;
    } catch (err) {
      logEvent('lead_persist_failed', { level: 'error', reason: (err as Error).message.slice(0, 80) });
    }
  }

  if (persisted && quoteId && store) {
    try {
      await store.createDeliveries(quoteId, channels);
    } catch (err) {
      logEvent('delivery_rows_failed', { level: 'error', rfq: rfqId, reason: (err as Error).message.slice(0, 80) });
    }
  }

  // Adjuntos: solo se asocian rutas que el servidor emitió y cuyo objeto existe.
  // Una referencia inválida o un fallo NO anula la solicitud, pero queda
  // contado para que el comprador sepa que ese archivo no llegó.
  const attachments = { requested: lead.archivos?.length ?? 0, attached: 0 };
  if (persisted && quoteId && deps.attachments && attachments.requested) {
    try {
      attachments.attached = (await deps.attachments.attach(quoteId, lead.archivos!)).attached;
    } catch (err) {
      logEvent('attach_failed', { level: 'error', rfq: rfqId, reason: (err as Error).message.slice(0, 80) });
    }
  }
  if (attachments.attached < attachments.requested) {
    logEvent('attachments_incomplete', { level: 'warn', rfq: rfqId, requested: attachments.requested, attached: attachments.attached });
  }

  // Entrega en paralelo con tiempo acotado. Un fallo queda REGISTRADO para
  // reintento; no se convierte en éxito ni se pierde.
  const ctx: DeliveryContext = { rfqId, lead, source, persisted, receivedAt };
  const delivery: LeadResponse['delivery'] = { ...NO_DELIVERY };
  await Promise.all(
    channels.map(async (channel: Channel) => {
      const r = await attempt(channel, ctx, env);
      const outcome = toOutcome(0, r);
      delivery[channel] = r.ok ? 'delivered' : 'failed';
      if (!r.ok) {
        logEvent('delivery_failed', { level: 'error', rfq: rfqId, channel, reason: r.error, http: r.httpStatus });
      }
      if (persisted && quoteId && store) {
        try {
          await store.recordDelivery(quoteId, channel, outcome);
        } catch (err) {
          logEvent('delivery_record_failed', { level: 'error', rfq: rfqId, channel, reason: (err as Error).message.slice(0, 80) });
        }
      }
    }),
  );

  const anyDelivered = delivery.crm === 'delivered' || delivery.email === 'delivered';
  const durability: Durability = persisted ? 'database' : anyDelivered ? 'forwarded' : 'none';

  if (durability === 'none') {
    logEvent('lead_not_accepted', { level: 'error', store: Boolean(store), channels: channels.length });
    return {
      status: 503,
      body: response({ accepted: false, durability, error: 'not_persisted', delivery, attachments }),
    };
  }
  logEvent('lead_accepted', { rfq: rfqId, durability, crm: delivery.crm, email: delivery.email });
  return { status: 200, body: response({ accepted: true, durability, rfqId, delivery, attachments }) };
}

/** Reintenta entregas vencidas. Lo invoca el cron; devuelve conteos sin PII. */
export async function retryDueDeliveries(store: LeadStore, env: EnvLike = process.env, limit = 25) {
  const due = await store.dueDeliveries(limit);
  let delivered = 0;
  let failed = 0;
  let dead = 0;
  for (const d of due) {
    const r = await attempt(d.channel, {
      rfqId: d.rfqId, lead: d.lead, source: fuenteDe(d.lead), persisted: true, receivedAt: new Date().toISOString(),
    }, env);
    const outcome = toOutcome(d.attempts, r);
    await store.recordDelivery(d.quoteId, d.channel, outcome);
    if (outcome.status === 'delivered') delivered++;
    else if (outcome.status === 'dead') {
      dead++;
      logEvent('delivery_dead', { level: 'error', rfq: d.rfqId, channel: d.channel, reason: outcome.lastError });
    } else failed++;
  }
  return { processed: due.length, delivered, failed, dead };
}
