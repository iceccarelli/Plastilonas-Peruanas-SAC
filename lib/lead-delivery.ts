/**
 * Adaptadores de entrega del lead: CRM (webhook) y correo (Resend).
 *
 * Cada intento devuelve un resultado CLASIFICADO, nunca lanza y nunca incluye
 * datos del cliente en el error. "Entregado" significa que el proveedor
 * respondió 2xx; no significa que alguien lo leyó.
 */
import { createHmac } from 'node:crypto';
import { SITE } from '@/lib/site';
import type { LeadInput } from '@/lib/lead-schema';
import type { Channel, DeliveryOutcome } from '@/lib/lead-store';

export type EnvLike = Record<string, string | undefined>;

export const DELIVERY_TIMEOUT_MS = 6000;
export const MAX_ATTEMPTS = 6;
/** Espera tras el intento n (1-based): 1, 5, 15, 60, 240 min. */
const BACKOFF_MIN = [1, 5, 15, 60, 240];

export interface AttemptResult {
  ok: boolean;
  error?: string;
  httpStatus?: number;
}

export interface DeliveryContext {
  rfqId: string;
  lead: LeadInput;
  source: string;
  persisted: boolean;
  receivedAt: string;
}

export function enabledChannels(env: EnvLike = process.env): Channel[] {
  const out: Channel[] = [];
  if (env.CRM_WEBHOOK_URL || env.N8N_WEBHOOK_URL) out.push('crm');
  if (env.RESEND_API_KEY) out.push('email');
  return out;
}

function classify(err: unknown): string {
  const name = (err as { name?: string })?.name;
  return name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
}

function httpResult(status: number): AttemptResult {
  if (status >= 200 && status < 300) return { ok: true, httpStatus: status };
  const klass = status >= 500 ? 'http_5xx' : status === 429 ? 'http_429' : 'http_4xx';
  return { ok: false, error: klass, httpStatus: status };
}

export function crmBody(ctx: DeliveryContext): string {
  return JSON.stringify({
    ...ctx.lead,
    rfqId: ctx.rfqId,
    persisted: ctx.persisted,
    source: ctx.source,
    receivedAt: ctx.receivedAt,
  });
}

export async function deliverCrm(ctx: DeliveryContext, env: EnvLike = process.env): Promise<AttemptResult> {
  const url = env.CRM_WEBHOOK_URL || env.N8N_WEBHOOK_URL;
  if (!url) return { ok: false, error: 'not_configured' };
  const body = crmBody(ctx);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // El receptor puede deduplicar: un reintento lleva el mismo identificador.
    'Idempotency-Key': ctx.rfqId,
  };
  if (env.CRM_WEBHOOK_SECRET) {
    headers['X-Plastilonas-Signature'] = `sha256=${createHmac('sha256', env.CRM_WEBHOOK_SECRET).update(body).digest('hex')}`;
  }
  try {
    const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS) });
    return httpResult(res.status);
  } catch (err) {
    return { ok: false, error: classify(err) };
  }
}

export function emailText(ctx: DeliveryContext): string {
  const { lead, rfqId } = ctx;
  return [
    `RFQ ${rfqId}`,
    `Nombre: ${lead.nombre || lead.contact || ''}`,
    `Empresa: ${lead.empresa || '—'}`,
    lead.ruc ? `RUC: ${lead.ruc}` : null,
    `Email: ${lead.email}`,
    `Teléfono: ${lead.telefono}`,
    lead.producto ? `Producto: ${lead.producto}` : null,
    lead.cantidad ? `Medidas/cantidad: ${lead.cantidad}` : null,
    lead.deliveryCity ? `Ciudad de entrega: ${lead.deliveryCity}` : null,
    lead.fechaNecesaria ? `Fecha requerida: ${lead.fechaNecesaria}` : null,
    lead.mensaje ? `Detalle: ${lead.mensaje}` : null,
    lead.archivos?.length ? `Adjuntos: ${lead.archivos.join(', ')}` : null,
    lead.path ? `Página de origen: ${lead.path}` : null,
    lead.slug ? `Slug de producto: ${lead.slug}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function deliverEmail(ctx: DeliveryContext, env: EnvLike = process.env): Promise<AttemptResult> {
  const key = env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'not_configured' };
  const base = env.RESEND_API_BASE || 'https://api.resend.com';
  try {
    const res = await fetch(`${base}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `rfq-${ctx.rfqId}`,
      },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'RFQ Web <onboarding@resend.dev>',
        to: [env.LEAD_EMAIL_TO || SITE.email],
        subject: `${ctx.rfqId} — ${ctx.lead.producto || 'consulta general'} (${ctx.lead.deliveryCity || 'sin ciudad'})`,
        text: emailText(ctx),
      }),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    return httpResult(res.status);
  } catch (err) {
    return { ok: false, error: classify(err) };
  }
}

export function attempt(channel: Channel, ctx: DeliveryContext, env: EnvLike = process.env) {
  return channel === 'crm' ? deliverCrm(ctx, env) : deliverEmail(ctx, env);
}

/** Traduce un intento al estado persistido, con reintento acotado. */
export function toOutcome(prevAttempts: number, r: AttemptResult, now = Date.now()): DeliveryOutcome {
  const attempts = prevAttempts + 1;
  if (r.ok) {
    return { status: 'delivered', attempts, lastError: null, lastHttpStatus: r.httpStatus ?? null, nextAttemptAt: null };
  }
  const dead = attempts >= MAX_ATTEMPTS;
  const wait = BACKOFF_MIN[Math.min(attempts, BACKOFF_MIN.length) - 1] * 60_000;
  return {
    status: dead ? 'dead' : 'failed',
    attempts,
    lastError: r.error ?? 'unknown',
    lastHttpStatus: r.httpStatus ?? null,
    nextAttemptAt: dead ? null : new Date(now + wait),
  };
}
