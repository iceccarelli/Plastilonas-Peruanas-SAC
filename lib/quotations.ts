/**
 * Cotizaciones comerciales: validación de entrada (el precio lo digita una
 * PERSONA del personal; nada aquí calcula ni sugiere importes) y traducción de
 * los errores de las funciones SQL a códigos estables.
 */
import { z } from 'zod';

export const QuoteInput = z.object({
  /** Importe en la unidad de la moneda («12500.50»); se convierte a céntimos sin coma flotante. */
  amount: z.string().trim().regex(/^\d{1,10}(\.\d{1,2})?$/, 'amount'),
  currency: z.enum(['PEN', 'USD']),
  validUntil: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'validUntil'),
  summary: z.string().trim().min(10).max(4000),
  notes: z.string().trim().max(4000).optional(),
});
export type QuoteInputT = z.infer<typeof QuoteInput>;

/** «12500.5» -> 1250050 (céntimos). Sin Number(): evita 0.1+0.2. */
export function toCents(amount: string): number {
  const [int, dec = ''] = amount.split('.');
  return Number(int) * 100 + Number(dec.padEnd(2, '0'));
}

export type QuoteError =
  | 'lead_not_found' | 'lead_not_ready' | 'quote_not_found' | 'quote_not_draft'
  | 'validity_required' | 'quote_not_issued' | 'reason_required' | 'invalid_outcome' | 'failed';

const KNOWN: QuoteError[] = [
  'lead_not_found', 'lead_not_ready', 'quote_not_found', 'quote_not_draft',
  'validity_required', 'quote_not_issued', 'reason_required', 'invalid_outcome',
];

/** Las funciones SQL hacen `raise exception '<codigo>'`; el código viaja en el mensaje. */
export function quoteErrorOf(message: string | undefined): QuoteError {
  return KNOWN.find((k) => (message ?? '').includes(k)) ?? 'failed';
}
