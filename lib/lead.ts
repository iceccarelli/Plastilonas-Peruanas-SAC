/**
 * Reenvía el lead a nuestro endpoint interno (/api/lead), que a su vez lo
 * manda a n8n si está configurado. Best-effort: nunca bloquea ni lanza — el
 * lead ya viajó por WhatsApp. `keepalive` permite que la petición termine
 * aunque la pestaña navegue a WhatsApp justo después.
 */

export interface LeadPayload {
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  producto?: string;
  cantidad?: string;
  fechaNecesaria?: string;
  mensaje?: string;
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
