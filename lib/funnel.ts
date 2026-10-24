/**
 * EMBUDO COMERCIAL — contrato de datos de punta a punta.
 *
 *   fuente → página de entrada → producto → [inicio del RFQ] → RFQ aceptado →
 *   lead calificado → cotización emitida → cotización enviada → resultado (ganado/perdido)
 *
 * Qué viene de DÓNDE (y por qué importa):
 *  · «inicio del RFQ» es un evento del NAVEGADOR (rfq_start), solo con
 *    consentimiento y solo en el proveedor de analítica configurado. La base de
 *    datos no puede contarlo y este módulo NO lo inventa. Que el navegador lo
 *    emita no prueba que el proveedor lo recibió: se comprueba en su panel.
 *  · desde «RFQ aceptado» TODO sale de la base de datos (la fuente de verdad):
 *    el lead guarda la atribución que el navegador declaró al enviar (canal,
 *    página de entrada, utm); el personal califica; la cotización emitida
 *    guarda su instantánea; la entrega y el resultado quedan auditados.
 *  · el canal es la pista de PRIMER CONTACTO de la sesión, declarada por el
 *    navegador: útil para decidir dónde invertir, no una certeza individual.
 *    Una visita sin consentimiento o con almacenamiento bloqueado llega como
 *    «sin_dato»: se muestra como tal y no se reparte entre los demás canales.
 *  · enviada ≠ entregada: «enviada al proveedor» es que el proveedor aceptó;
 *    «confirmada» solo existe si llegó su webhook firmado.
 *  · los importes se suman por moneda; NUNCA se convierten.
 */
import { supabaseAdmin } from '@/lib/supabase';
import type { RpcClient } from '@/lib/rate-limit';

/** Por debajo de esta muestra no se muestra una tasa: una proporción sobre 3 casos engaña. */
export const MIN_SAMPLE = 5;

export interface Funnel {
  window: { from: string; to: string };
  leads: { accepted: number; qualified: number; quoted: number; won: number; lost: number; open: number };
  quotes: {
    issued: number; sentToProvider: number; confirmedByProvider: number; notDelivered: number;
    accepted: number; rejected: number; superseded: number; decidedByCustomerLink: number; medianDaysToDecision: number | null;
  };
  revenue: Array<{ currency: 'PEN' | 'USD'; wonCents: number; wonOffers: number }>;
  responseTime: { sample: number; medianMinutes: number | null; p90Minutes: number | null; untouchedOver24h: number };
  lostReasons: Array<{ reason: string; n: number }>;
  byChannel: Array<{ channel: string; accepted: number; qualified: number; quoted: number; won: number; lost: number }>;
  byProduct: Array<{ product: string; accepted: number; quoted: number; won: number }>;
  byLanding: Array<{ landing: string; accepted: number; won: number }>;
}

/** Proporción en %, o null si el denominador no alcanza la muestra mínima. */
export function rate(n: number, d: number): number | null {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d < MIN_SAMPLE) return null;
  return Math.round((n / d) * 1000) / 10;
}

export async function loadFunnel(db: RpcClient = supabaseAdmin(), days = 30, now = new Date()): Promise<Funnel> {
  const to = new Date(now.getTime() + 60_000);
  const from = new Date(now.getTime() - days * 86_400_000);
  const { data, error } = await db.rpc('commercial_funnel', { p_from: from.toISOString(), p_to: to.toISOString() });
  if (error || !data) throw new Error('funnel_unavailable');
  return data as Funnel;
}

export const WINDOWS = [30, 90, 365] as const;
export function parseWindow(raw: string | undefined): (typeof WINDOWS)[number] {
  const n = Number(raw);
  return (WINDOWS as readonly number[]).includes(n) ? (n as (typeof WINDOWS)[number]) : 30;
}
