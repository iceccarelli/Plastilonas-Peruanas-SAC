/**
 * Destinos salientes configurables (webhook del CRM, de alertas): SSRF.
 *
 * Quien configura la URL es el propietario, no un visitante, pero una URL mal
 * pegada o un secreto de entorno filtrado no deben convertir al servidor en un
 * cliente HTTP hacia la red interna o hacia el servicio de metadatos del
 * proveedor (169.254.169.254). Se exige:
 *  · https (http solo con ALLOW_PRIVATE_WEBHOOKS=true, para pruebas locales);
 *  · sin credenciales en la URL;
 *  · host que no sea localhost / .local / .internal / literal de IP privada;
 *  · y, al enviar, que el DNS resuelva SOLO a direcciones públicas.
 * Limitación declarada: entre la resolución y la conexión un DNS hostil podría
 * cambiar de respuesta (rebinding). Cerrarlo del todo exige un agente HTTP que
 * fije la IP resuelta; aquí se reduce el riesgo, no se elimina.
 */
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

type Env = Record<string, string | undefined>;

function ipv4Private(a: number[]): boolean {
  const [p, q] = a;
  return (
    p === 0 || p === 10 || p === 127 || p >= 224 ||
    (p === 100 && q >= 64 && q <= 127) ||
    (p === 169 && q === 254) ||
    (p === 172 && q >= 16 && q <= 31) ||
    (p === 192 && q === 168) ||
    (p === 192 && q === 0 && a[2] === 0) ||
    (p === 198 && (q === 18 || q === 19))
  );
}

/** true si la dirección NO es de internet pública. */
export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return ipv4Private(ip.split('.').map(Number));
  if (v === 6) {
    const s = ip.toLowerCase();
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(s);
    if (mapped) return ipv4Private(mapped[1].split('.').map(Number));
    // El analizador de URL normaliza ::ffff:10.0.0.1 a ::ffff:a00:1 (dos grupos hexadecimales).
    const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(s);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      return ipv4Private([hi >> 8, hi & 255, lo >> 8, lo & 255]);
    }
    return s === '::' || s === '::1' || s.startsWith('fc') || s.startsWith('fd') || /^fe[89ab]/.test(s);
  }
  return true; // no es una IP válida: no se asume pública
}

export type OutboundCheck = { ok: true; url: URL } | { ok: false; reason: string };

export function checkOutboundUrl(raw: string, env: Env = process.env): OutboundCheck {
  const allowPrivate = env.ALLOW_PRIVATE_WEBHOOKS === 'true';
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, reason: 'invalid_url' }; }
  if (u.username || u.password) return { ok: false, reason: 'credentials_in_url' };
  if (u.protocol !== 'https:' && !(allowPrivate && u.protocol === 'http:')) return { ok: false, reason: 'https_required' };
  if (allowPrivate) return { ok: true, url: u };
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.') && !isIP(host)) {
    return { ok: false, reason: 'private_host' };
  }
  if (isIP(host) && isPrivateAddress(host)) return { ok: false, reason: 'private_address' };
  return { ok: true, url: u };
}

/** Comprobación completa antes de enviar: sintaxis + DNS público. */
export async function assertPublicDestination(
  raw: string, env: Env = process.env, resolve: (h: string) => Promise<string[]> = defaultResolve,
): Promise<OutboundCheck> {
  const c = checkOutboundUrl(raw, env);
  if (!c.ok || env.ALLOW_PRIVATE_WEBHOOKS === 'true') return c;
  const host = c.url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) return c;
  try {
    const addrs = await resolve(host);
    if (addrs.length === 0 || addrs.some(isPrivateAddress)) return { ok: false, reason: 'resolves_to_private' };
    return c;
  } catch {
    return { ok: false, reason: 'dns_failed' };
  }
}

async function defaultResolve(host: string): Promise<string[]> {
  return (await lookup(host, { all: true })).map((r) => r.address);
}
