/**
 * Canal de leads vía WhatsApp — funciona sin backend ni variables de entorno.
 *
 * En lugar de simular un envío (el sitio anterior hacía console.log y mentía
 * al cliente con un toast de éxito), construimos un mensaje estructurado y
 * abrimos WhatsApp con el texto listo para enviar al número comercial real.
 * El lead llega de verdad, con un clic, al canal que la empresa ya atiende.
 */

export const WHATSAPP_NUMBER = '51946085270';
export const WHATSAPP_DISPLAY = '+51 946 085 270';

export interface QuoteLead {
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  producto?: string;
  cantidad?: string;
  mensaje?: string;
}

export function buildQuoteMessage(lead: QuoteLead): string {
  const lines = [
    '*SOLICITUD DE COTIZACIÓN — plastilonas.com*',
    '',
    `*Nombre:* ${lead.nombre}`,
    lead.empresa ? `*Empresa:* ${lead.empresa}` : null,
    `*Email:* ${lead.email}`,
    `*Teléfono:* ${lead.telefono}`,
    lead.producto ? `*Producto de interés:* ${lead.producto}` : null,
    lead.cantidad ? `*Cantidad aproximada:* ${lead.cantidad}` : null,
    lead.mensaje ? `*Detalles:* ${lead.mensaje}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildContactMessage(data: {
  nombre: string;
  email: string;
  asunto?: string;
  mensaje: string;
}): string {
  return [
    '*CONSULTA — plastilonas.com*',
    '',
    `*Nombre:* ${data.nombre}`,
    `*Email:* ${data.email}`,
    data.asunto ? `*Asunto:* ${data.asunto}` : null,
    `*Mensaje:* ${data.mensaje}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
}

/* ------------------------------------------------------------------ */
/* Historial local de cotizaciones (se muestra en /dashboard).         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'pp_cotizaciones';

export interface SavedQuote extends QuoteLead {
  fecha: string; // ISO
}

export function saveQuoteLocally(lead: QuoteLead): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: SavedQuote[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ...lead, fecha: new Date().toISOString() });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // localStorage puede no estar disponible; el envío por WhatsApp no depende de esto.
  }
}

export function getSavedQuotes(): SavedQuote[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
