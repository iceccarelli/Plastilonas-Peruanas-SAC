import { QuoteDraftInput } from '@/lib/quotations';

export const FORM_ITEM_ROWS = 8;

/**
 * Convierte el formulario del personal (filas fijas de partidas) en la entrada
 * validada. Una fila totalmente vacía se ignora; una a medias es un error, no
 * se adivina lo que falta.
 */
export function parseQuoteForm(f: FormData) {
  const get = (k: string) => String(f.get(k) ?? '').trim();
  const items: Array<{ description: string; quantity: string; unit: string; unitPrice: string }> = [];
  for (let i = 0; i < FORM_ITEM_ROWS; i++) {
    const row = { description: get(`item_desc_${i}`), quantity: get(`item_qty_${i}`), unit: get(`item_unit_${i}`), unitPrice: get(`item_price_${i}`) };
    if (Object.values(row).every((v) => v === '')) continue;
    items.push(row);
  }
  return QuoteDraftInput.safeParse({
    currency: get('currency'), validUntil: get('validUntil'), summary: get('summary'), items,
    taxTreatment: get('taxTreatment'), taxLabel: get('taxLabel'),
    taxAmount: get('taxAmount') || undefined, terms: get('terms') || undefined, notes: get('notes') || undefined,
  });
}
