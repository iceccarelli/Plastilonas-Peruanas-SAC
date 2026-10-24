/**
 * Piezas compartidas de la página, el PDF y la decisión del cliente.
 * Sin efectos: los límites se aplican en cada punto de entrada.
 */
import { clientIp, hashIp } from '@/lib/lead-service';
import { TOKEN_RE, hashToken } from '@/lib/quote-token';
import { hitAll, type RpcClient, type Rule, type Verdict } from '@/lib/rate-limit';

export function tokenFrom(raw: string): { token: string; hash: string } | null {
  return TOKEN_RE.test(raw) ? { token: raw, hash: hashToken(raw) } : null;
}

/** Mismo sitio: Origin coincide con Host, o el navegador declara Sec-Fetch-Site same-origin. */
export function sameSite(h: Headers): boolean {
  if (h.get('sec-fetch-site') === 'same-origin') return true;
  const origin = h.get('origin');
  const host = h.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

const VIEW_WINDOW = 600;

export function viewRules(h: Headers, tokenHash: string): Rule[] {
  const ip = hashIp(clientIp(h));
  return [
    { scope: 'oferta-ver-ip', subject: ip, windowSeconds: VIEW_WINDOW, max: 120 },
    { scope: 'oferta-ver-tok', subject: tokenHash, windowSeconds: VIEW_WINDOW, max: 120 },
  ];
}

export function decideRules(h: Headers, tokenHash: string): Rule[] {
  const ip = hashIp(clientIp(h));
  return [
    { scope: 'oferta-dec-ip', subject: ip, windowSeconds: VIEW_WINDOW, max: 20 },
    { scope: 'oferta-dec-tok', subject: tokenHash, windowSeconds: VIEW_WINDOW, max: 12 },
  ];
}

/** Ver/descargar fallan CERRADO: sin contador no se sirve una oferta a ciegas. */
export const limitView = (db: RpcClient, h: Headers, tokenHash: string): Promise<Verdict> =>
  hitAll(db, viewRules(h, tokenHash), 'closed');
export const limitDecide = (db: RpcClient, h: Headers, tokenHash: string): Promise<Verdict> =>
  hitAll(db, decideRules(h, tokenHash), 'closed');

export const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
} as const;
