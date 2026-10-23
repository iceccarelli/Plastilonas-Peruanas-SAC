/**
 * Reenvía el lead a nuestro endpoint interno (/api/lead), que a su vez lo
 * manda a n8n si está configurado. Best-effort: nunca bloquea ni lanza — el
 * lead ya viajó por WhatsApp. `keepalive` permite que la petición termine
 * aunque la pestaña navegue a WhatsApp justo después.
 */

export interface LeadPayload {
  nombre: string;
  empresa?: string;
  /** RUC ya normalizado a 11 dígitos (ver lib/ruc.ts). */
  ruc?: string;
  email: string;
  telefono: string;
  producto?: string;
  cantidad?: string;
  fechaNecesaria?: string;
  mensaje?: string;
  country?: string;
  city?: string;
  industry?: string;
  application?: string;
  dimensions?: string;
  material?: string;
  deliveryCountry?: string;
  deliveryCity?: string;
  whatsapp?: string;
  language?: 'es' | 'en' | 'pt';
  // ── Atribución (campos ocultos del formulario) ───────────────────────────
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** Ruta (con query) desde la que se envió el RFQ. */
  path?: string;
  /** Slug del producto de origen, si el enlace lo trajo. */
  slug?: string;
  /**
   * Superficie que originó la solicitud: 'chat', 'configurador',
   * 'calculadora'. Llega por ?origen= y permite responder una pregunta que
   * hasta ahora no tenía datos: qué parte del sitio produce RFQ.
   */
  origen?: string;
  /** Referencias de adjuntos: ruta en Storage o nombre del archivo. */
  archivos?: string[];
  /** Ver nuevaClaveIdempotencia(). */
  idempotencyKey?: string;
}

export interface LeadResultado {
  /** La solicitud quedó guardada (o un canal externo confirmó): es recepción. */
  accepted: boolean;
  /** Igual a `accepted`; se conserva por compatibilidad. */
  ok: boolean;
  /** Código RFQ-AAAAMMDD-XXXXXXXX que emite /api/lead; solo si `accepted`. */
  rfqId?: string;
  /** Qué debe hacer el comprador si no hubo recepción. */
  customerAction?: 'none' | 'send_via_whatsapp' | 'retry_later';
}

/** Clave por envío: un reintento del mismo formulario no duplica la solicitud. */
export function nuevaClaveIdempotencia(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '');
  } catch {
    return `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`.padEnd(16, '0');
  }
}

/**
 * Devuelve el resultado REAL en vez de tragárselo. `accepted: true` solo si el
 * servidor confirmó que la solicitud quedó guardada; un fallo de red, un 4xx o
 * un 503 devuelven `accepted: false` y el formulario lo comunica con el canal
 * alterno (WhatsApp) en lugar de decir "registrada". Nunca lanza.
 */
export async function postLead(lead: LeadPayload): Promise<LeadResultado> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      keepalive: true,
    });
    const data = (await res.json().catch(() => ({}))) as {
      accepted?: boolean;
      rfqId?: string;
      customerAction?: LeadResultado['customerAction'];
    };
    const accepted = res.ok && data.accepted === true;
    return {
      accepted,
      ok: accepted,
      rfqId: accepted ? data.rfqId : undefined,
      customerAction: accepted ? 'none' : (data.customerAction ?? 'send_via_whatsapp'),
    };
  } catch {
    return { accepted: false, ok: false, customerAction: 'send_via_whatsapp' };
  }
}
