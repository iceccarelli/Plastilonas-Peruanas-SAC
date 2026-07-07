import Stripe from 'stripe';

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

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
