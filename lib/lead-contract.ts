/**
 * Contrato de respuesta de POST /api/lead. Seguro para el cliente: solo tipos.
 *
 * `accepted` significa UNA cosa: la solicitud quedó guardada de forma que una
 * persona de ventas puede encontrarla. HTTP 200, un webhook intentado o una
 * ventana de WhatsApp abierta NO son recepción.
 */

/** Dónde quedó guardada la solicitud. */
export type Durability =
  /** Fila en nuestra base de datos: la fuente de verdad. */
  | 'database'
  /** Sin base, pero el CRM o el correo confirmaron recepción (2xx). */
  | 'forwarded'
  /** En ningún sitio que controlemos: NO está recibida. */
  | 'none';

/** disabled: sin configurar · pending: reintento programado · delivered: el proveedor confirmó 2xx. */
export type ChannelState = 'disabled' | 'pending' | 'delivered' | 'failed';

export interface LeadResponse {
  /** Igual a `accepted`; se conserva por compatibilidad con clientes previos. */
  ok: boolean;
  accepted: boolean;
  durability: Durability;
  rfqId?: string;
  /** La misma solicitud ya existía (reintento): no se duplicó ni se re-entregó. */
  duplicate?: boolean;
  delivery: { crm: ChannelState; email: ChannelState };
  /** Qué debe hacer el comprador: nada, o usar el canal alterno. */
  customerAction: 'none' | 'send_via_whatsapp' | 'retry_later';
  error?: string;
  // Compatibilidad con el contrato anterior.
  persisted: boolean;
  forwarded: boolean;
  emailed: boolean;
}
