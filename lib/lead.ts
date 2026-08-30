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
  /** Referencias de adjuntos: ruta en Storage o nombre del archivo. */
  archivos?: string[];
}

export async function postLead(lead: LeadPayload): Promise<void> {
  try {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      keepalive: true,
    });
  } catch {
    /* best-effort: el lead ya fue a WhatsApp */
  }
}
