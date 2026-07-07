/**
 * Clientes de Supabase — persistencia de pedidos, pagos y leads.
 *
 * Coherente con la filosofía del proyecto: el sitio funciona SIN estas
 * variables. Si Supabase no está configurado, las funciones que lo usan
 * devuelven null / lanzan un error controlado en el servidor, nunca rompen
 * el render del sitio público.
 *
 * - `supabaseAdmin()` usa la service-role key y SOLO debe llamarse en el
 *   servidor (route handlers, webhooks). Nunca importar en un componente
 *   cliente.
 * - `supabaseBrowser()` usa la anon key y respeta RLS.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** ¿Está Supabase configurado? Útil para degradar con elegancia. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let browserClient: SupabaseClient | null = null;

/** Cliente para el navegador (respeta RLS). Devuelve null si falta config. */
export function supabaseBrowser(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return browserClient;
}

/**
 * Cliente de servidor con service-role (bypassa RLS). Solo servidor.
 * Lanza si falta configuración: quien lo llama (webhooks, etc.) debe
 * manejar el error y responder apropiadamente.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase no está configurado (falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
