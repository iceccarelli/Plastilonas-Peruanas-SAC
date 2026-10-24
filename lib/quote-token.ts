/**
 * Enlace seguro de la cotización.
 *
 * El token es HMAC-SHA256(secreto del servidor, id de la oferta + generación):
 *  · 256 bits: no se adivina ni se enumera;
 *  · DETERMINISTA: un reintento de envío produce el MISMO enlace, así la clave
 *    de idempotencia del proveedor sigue valiendo y no se duplica el correo;
 *  · no se guarda en claro en ningún sitio: la base solo tiene su SHA-256, y
 *    quien lea la base no puede reconstruir un enlace sin el secreto;
 *  · rotar = nueva generación: el enlace anterior se revoca y deja de abrir.
 */
import { createHash, createHmac } from 'node:crypto';
import { SITE } from '@/lib/site';

export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const MIN_SECRET = 32;

type Env = Record<string, string | undefined>;

export function linkSecret(env: Env = process.env): string | null {
  const s = env.QUOTE_LINK_SECRET?.trim() ?? '';
  return s.length >= MIN_SECRET ? s : null;
}

export function mintToken(secret: string, leadQuoteId: string, generation: number): string {
  return createHmac('sha256', secret).update(`quote-link:v1:${leadQuoteId}:${generation}`).digest('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Fin del día de vigencia en Lima (UTC-5, sin horario de verano), como instante. */
export function expiryOf(validUntil: string): Date {
  const [y, m, d] = validUntil.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 5, 0, 0));
}

export function quoteUrl(token: string, origin: string = SITE.url): string {
  return `${origin}/oferta/${token}`;
}
