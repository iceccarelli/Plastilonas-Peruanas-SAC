import Stripe from 'stripe';
import { SITE } from './site';

/**
 * Cliente de Stripe (solo servidor). Devuelve null si no hay clave, para que
 * el build y las rutas degraden con un error controlado en vez de romper.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) {
    // Sin apiVersion explícita: usa la versión por defecto de la cuenta.
    client = new Stripe(key);
  }
  return client;
}

/**
 * Origen para las URLs de retorno de Stripe (success_url / cancel_url).
 *
 * El fallback anterior era 'http://localhost:3000': si NEXT_PUBLIC_SITE_URL no
 * estaba definida en producción, un cliente que completaba el pago terminaba
 * redirigido a su propia máquina. El respaldo correcto es el origen canónico
 * del sitio; localhost solo cuando se está desarrollando de verdad.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return SITE.url;
}
