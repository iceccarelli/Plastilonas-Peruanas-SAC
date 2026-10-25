/**
 * Cotizaciones comerciales: validación de entrada (el precio lo digita una
 * PERSONA del personal; nada aquí calcula ni sugiere importes) y traducción de
 * los errores de las funciones SQL a códigos estables.
 */
import { z } from 'zod';

const MONEY = /^\d{1,10}(\.\d{1,2})?$/;
const QTY = /^\d{1,7}(\.\d{1,3})?$/;

const Item = z.object({
  description: z.string().trim().min(3).max(300),
  /** Cantidad decimal (hasta 3 decimales) como texto: nunca Number(). */
  quantity: z.string().trim().regex(QTY, 'quantity').refine((q) => Number(q) > 0, 'quantity'),
  unit: z.string().trim().min(1).max(20),
  /** Precio unitario en la unidad de la moneda («12.35»). */
  unitPrice: z.string().trim().regex(MONEY, 'unitPrice'),
});

/**
 * Borrador de cotización. NADA aquí calcula ni sugiere precios: la persona del
 * personal digita cantidades y precios unitarios; el sistema solo multiplica y
 * suma con enteros. El tratamiento de impuestos es OBLIGATORIO y explícito
 * (no se presupone IGV): incluido, adicional (con su importe) o exonerado,
 * siempre con la leyenda que la persona redacta.
 */
export const QuoteDraftInput = z
  .object({
    currency: z.enum(['PEN', 'USD']),
    validUntil: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'validUntil'),
    summary: z.string().trim().min(10).max(4000),
    items: z.array(Item).min(1).max(40),
    taxTreatment: z.enum(['included', 'excluded', 'exempt']),
    taxLabel: z.string().trim().min(2).max(160),
    /** Obligatorio solo si el impuesto se suma al subtotal. */
    taxAmount: z.string().trim().regex(MONEY, 'taxAmount').optional(),
    /** Condiciones comerciales redactadas por el personal; las ve el cliente. */
    terms: z.string().trim().max(4000).optional(),
    /** Notas INTERNAS: jamás salen en el documento ni en la página del cliente. */
    notes: z.string().trim().max(4000).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.taxTreatment === 'excluded' && !v.taxAmount) {
      ctx.addIssue({ code: 'custom', path: ['taxAmount'], message: 'taxAmount' });
    }
  });
export type QuoteDraftInputT = z.infer<typeof QuoteDraftInput>;

export interface LineItem {
  description: string;
  /** Cantidad con hasta 3 decimales, tal cual la escribió la persona. */
  quantity: string;
  unit: string;
  unit_price_cents: number;
  amount_cents: number;
}

/** Cantidad × precio unitario con enteros (milésimas) y redondeo medio hacia arriba. */
export function lineAmountCents(quantity: string, unitPriceCents: number): number {
  const [i, d = ''] = quantity.split('.');
  const milli = BigInt(i) * BigInt(1000) + BigInt(d.padEnd(3, '0'));
  return Number((milli * BigInt(unitPriceCents) + BigInt(500)) / BigInt(1000));
}

export interface DraftComputed {
  items: LineItem[];
  subtotalCents: number;
  taxCents: number | null;
  /** Total que verá el cliente (subtotal + impuesto SOLO si es adicional). */
  totalCents: number;
}

export function computeDraft(i: QuoteDraftInputT): DraftComputed {
  const items = i.items.map((it) => {
    const unit = toCents(it.unitPrice);
    return {
      description: it.description, quantity: it.quantity, unit: it.unit,
      unit_price_cents: unit, amount_cents: lineAmountCents(it.quantity, unit),
    };
  });
  const subtotalCents = items.reduce((n, x) => n + x.amount_cents, 0);
  const taxCents = i.taxAmount ? toCents(i.taxAmount) : null;
  const totalCents = subtotalCents + (i.taxTreatment === 'excluded' ? (taxCents ?? 0) : 0);
  return { items, subtotalCents, taxCents, totalCents };
}

/** «12500.5» -> 1250050 (céntimos). Sin Number(): evita 0.1+0.2. */
export function toCents(amount: string): number {
  const [int, dec = ''] = amount.split('.');
  return Number(int) * 100 + Number(dec.padEnd(2, '0'));
}

export type QuoteError =
  | 'lead_not_found' | 'lead_not_ready' | 'quote_not_found' | 'quote_not_draft'
  | 'validity_required' | 'quote_not_issued' | 'reason_required' | 'invalid_outcome'
  | 'tax_required' | 'tax_label_required' | 'tax_amount_required' | 'totals_mismatch'
  | 'quote_immutable' | 'failed';

const KNOWN: QuoteError[] = [
  'lead_not_found', 'lead_not_ready', 'quote_not_found', 'quote_not_draft',
  'validity_required', 'quote_not_issued', 'reason_required', 'invalid_outcome',
  'tax_required', 'tax_label_required', 'tax_amount_required', 'totals_mismatch', 'quote_immutable',
];

/** Las funciones SQL hacen `raise exception '<codigo>'`; el código viaja en el mensaje. */
export function quoteErrorOf(message: string | undefined): QuoteError {
  return KNOWN.find((k) => (message ?? '').includes(k)) ?? 'failed';
}
