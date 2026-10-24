/**
 * Entrega de la cotización por correo, con estados HONESTOS:
 *
 *   queued    la intención está guardada (se creó al emitir, en la misma transacción)
 *   blocked   falta configuración (correo o secreto del enlace): NO se intentó
 *   sent      el proveedor ACEPTÓ el envío (2xx). No significa que llegó al buzón.
 *   confirmed el proveedor informó entrega al buzón (webhook firmado)
 *   failed    el intento falló; hay reintento programado
 *   dead      sin reintentos (agotados o rebote definitivo): requiere una persona
 *
 * Nada de esto se muestra al cliente como «entregado»: es información del personal.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SITE } from '@/lib/site';
import { renderQuotePdf, formatMoney } from '@/lib/quote-document';
import { expiryOf, hashToken, linkSecret, mintToken, quoteUrl } from '@/lib/quote-token';
import type { ClaimedDelivery, QuoteStore } from '@/lib/quote-store';

type Env = Record<string, string | undefined>;

export const QUOTE_MAX_ATTEMPTS = 6;
export const QUOTE_TIMEOUT_MS = 8000;
/** Espera tras el intento n (1-based): 2, 10, 30, 120, 480 min. */
const BACKOFF_MIN = [2, 10, 30, 120, 480];
const BLOCKED_RECHECK_MIN = 15;

export type SendResult = { ok: true; messageId: string | null; http: number } | { ok: false; error: string; http?: number; permanent?: boolean };

export function emailConfigured(env: Env = process.env): boolean {
  return Boolean(env.RESEND_API_KEY);
}

/** 4xx distinto de 408/409/425/429 no mejora reintentando (dirección inválida, clave rechazada…). */
function classifyHttp(status: number): SendResult {
  const permanent = status >= 400 && status < 500 && ![408, 409, 425, 429].includes(status);
  return { ok: false, error: status >= 500 ? 'http_5xx' : status === 429 ? 'http_429' : 'http_4xx', http: status, permanent };
}

export function quoteEmailText(d: ClaimedDelivery, url: string): string {
  const s = d.snapshot;
  const nombre = s.customer.name || s.customer.company || 'cliente';
  return [
    `Estimado/a ${nombre}:`,
    '',
    `Le enviamos nuestra cotización ${s.reference} por ${formatMoney(s.totalCents, s.currency)}, vigente hasta el ${s.validUntil}.`,
    '',
    'Puede revisarla, descargarla y aceptarla o rechazarla desde este enlace personal:',
    url,
    '',
    'También adjuntamos el documento en PDF. El enlace es de uso exclusivo para esta oferta: no lo reenvíe si no desea que otra persona pueda decidir en su nombre.',
    '',
    `Si necesita ajustes, responda a este correo o escríbanos a ${SITE.email}.`,
    '',
    s.issuer.name,
  ].join('\n');
}

export async function sendQuoteEmail(d: ClaimedDelivery, url: string, pdf: Uint8Array, env: Env = process.env): Promise<SendResult> {
  const key = env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'email_not_configured' };
  const base = env.RESEND_API_BASE || 'https://api.resend.com';
  try {
    const res = await fetch(`${base}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // Mismo enlace + misma clave en cada reintento: el proveedor deduplica.
        'Idempotency-Key': `quote-${d.id}-g${d.generation}`,
      },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'Cotizaciones <onboarding@resend.dev>',
        to: [d.recipient],
        reply_to: SITE.email,
        subject: `Cotización ${d.snapshot.reference} — ${d.snapshot.issuer.name}`,
        text: quoteEmailText(d, url),
        attachments: [{ filename: `${d.snapshot.reference}.pdf`, content: Buffer.from(pdf).toString('base64') }],
      }),
      signal: AbortSignal.timeout(Number(env.QUOTE_EMAIL_TIMEOUT_MS) > 0 ? Number(env.QUOTE_EMAIL_TIMEOUT_MS) : QUOTE_TIMEOUT_MS),
    });
    if (res.status >= 200 && res.status < 300) {
      const body = (await res.json().catch(() => null)) as { id?: unknown } | null;
      return { ok: true, http: res.status, messageId: typeof body?.id === 'string' ? body.id : null };
    }
    return classifyHttp(res.status);
  } catch (err) {
    const n = (err as { name?: string })?.name;
    return { ok: false, error: n === 'TimeoutError' || n === 'AbortError' ? 'timeout' : 'network' };
  }
}

export interface QuoteRunSummary { processed: number; sent: number; failed: number; dead: number; blocked: number }

/** Procesa las entregas vencidas. Lo invocan el cron y el reintento manual. */
export async function runQuoteDeliveries(store: QuoteStore, env: Env = process.env, limit = 10, now = () => Date.now()): Promise<QuoteRunSummary> {
  const due = await store.claimDeliveries(limit);
  const out: QuoteRunSummary = { processed: due.length, sent: 0, failed: 0, dead: 0, blocked: 0 };
  const secret = linkSecret(env);
  for (const d of due) {
    // Sin configuración NO se intenta ni se finge: queda bloqueada y visible.
    const missing = !emailConfigured(env) ? 'email_not_configured' : !secret ? 'link_secret_missing' : null;
    if (missing || !secret) {
      await store.recordDelivery(d.id, 'blocked', d.attempts, missing, null, null, new Date(now() + BLOCKED_RECHECK_MIN * 60_000));
      out.blocked++;
      continue;
    }
    const attempts = d.attempts + 1;
    try {
      const token = mintToken(secret, d.leadQuoteId, d.generation);
      await store.registerToken(d.leadQuoteId, hashToken(token), d.generation, expiryOf(d.validUntil));
      const pdf = await renderQuotePdf(d.snapshot, { hash: d.snapshotHash });
      const r = await sendQuoteEmail(d, quoteUrl(token), pdf, env);
      if (r.ok) {
        await store.recordDelivery(d.id, 'sent', attempts, null, r.http, r.messageId, null);
        out.sent++;
        continue;
      }
      const dead = Boolean(r.permanent) || attempts >= QUOTE_MAX_ATTEMPTS;
      await store.recordDelivery(
        d.id, dead ? 'dead' : 'failed', attempts, r.error, r.http ?? null, null,
        dead ? null : new Date(now() + BACKOFF_MIN[Math.min(attempts, BACKOFF_MIN.length) - 1] * 60_000),
      );
      if (dead) out.dead++; else out.failed++;
    } catch {
      // Error interno (base, PDF): cuenta como intento fallido, reintentable, sin datos del cliente.
      const dead = attempts >= QUOTE_MAX_ATTEMPTS;
      await store.recordDelivery(
        d.id, dead ? 'dead' : 'failed', attempts, 'internal', null, null,
        dead ? null : new Date(now() + BACKOFF_MIN[Math.min(attempts, BACKOFF_MIN.length) - 1] * 60_000),
      ).catch(() => undefined);
      if (dead) out.dead++; else out.failed++;
    }
  }
  return out;
}

/**
 * Verifica la firma de un webhook de Resend (Svix): HMAC-SHA256 de
 * `${id}.${timestamp}.${cuerpo}` con la clave base64 de `whsec_…`. Rechaza
 * marcas de tiempo fuera de ±5 min (anti-replay) y compara en tiempo constante.
 */
export function verifySvix(
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  body: string, secret: string, nowSec = Math.floor(Date.now() / 1000),
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  if (!key.length) return false;
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest();
  return signature.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const got = Buffer.from(sig, 'base64');
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}
