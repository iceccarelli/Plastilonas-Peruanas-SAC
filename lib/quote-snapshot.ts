/**
 * Instantánea de la oferta: lo que el cliente RECIBIÓ, congelado al emitir.
 *
 * La construye la base de datos (lead_quote_issue) con su SHA-256; este módulo
 * solo la valida al leerla (nunca se confía en JSON que viene de fuera del
 * tipo esperado) y construye la vista previa de un borrador con la misma forma.
 */
import { z } from 'zod';
import { SITE } from '@/lib/site';
import type { DraftComputed } from '@/lib/quotations';

const Str = z.string().max(5000).nullable().optional();

export const QuoteSnapshot = z.object({
  schema: z.literal(1),
  reference: z.string().min(3).max(80),
  rfq: z.string().max(80),
  version: z.number().int().positive(),
  issuedAt: z.string().max(40),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.enum(['PEN', 'USD']),
  issuer: z.object({
    name: z.string().max(200), legalName: z.string().max(200), ruc: z.string().max(20),
    address: z.string().max(400), email: z.string().max(200),
    phones: z.array(z.string().max(40)).max(4), website: z.string().max(200),
  }),
  customer: z.object({ name: Str, company: Str, email: Str, ruc: Str }),
  request: z.object({ product: Str, quantity: Str, deliveryCity: Str }),
  summary: z.string().max(4000),
  items: z.array(z.object({
    description: z.string().max(300), quantity: z.string().max(20), unit: z.string().max(20),
    unit_price_cents: z.number().int().nonnegative(), amount_cents: z.number().int().nonnegative(),
  })).max(40),
  subtotalCents: z.number().int().nonnegative(),
  tax: z.object({
    treatment: z.enum(['included', 'excluded', 'exempt']),
    label: z.string().max(160).nullable(),
    cents: z.number().int().nonnegative().nullable(),
  }),
  totalCents: z.number().int().nonnegative(),
  terms: Str,
});
export type QuoteSnapshotT = z.infer<typeof QuoteSnapshot>;

export function parseSnapshot(raw: unknown): QuoteSnapshotT | null {
  const r = QuoteSnapshot.safeParse(raw);
  return r.success ? r.data : null;
}

/** Identidad del emisor tomada de la fuente de verdad del sitio (lib/site.ts). */
export function issuerFromSite() {
  return {
    name: SITE.name,
    legalName: SITE.legalName,
    ruc: SITE.ruc,
    address: `${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`,
    email: SITE.email,
    phones: [`WhatsApp ${SITE.phoneWhatsApp}`, `Central ${SITE.phoneCentral}`],
    website: SITE.url,
  };
}

export interface PreviewLead {
  rfqId: string; fullName: string | null; company: string | null; email: string;
  product: string | null; quantity: string | null; payload: Record<string, unknown>;
}

/** Vista previa de un BORRADOR con la forma de la instantánea (no es una oferta). */
export function previewSnapshot(
  lead: PreviewLead,
  d: { version: number; currency: 'PEN' | 'USD'; validUntil: string; summary: string; taxTreatment: 'included' | 'excluded' | 'exempt'; taxLabel: string | null; terms: string | null },
  c: Pick<DraftComputed, 'items' | 'subtotalCents' | 'taxCents' | 'totalCents'>,
  now = new Date(),
): QuoteSnapshotT {
  const s = (v: unknown) => (typeof v === 'string' ? v : null);
  return {
    schema: 1,
    reference: `${lead.rfqId}-V${d.version}`,
    rfq: lead.rfqId, version: d.version,
    issuedAt: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    validUntil: d.validUntil, currency: d.currency, issuer: issuerFromSite(),
    customer: { name: lead.fullName, company: lead.company, email: lead.email, ruc: s(lead.payload.ruc) },
    request: { product: lead.product, quantity: lead.quantity, deliveryCity: s(lead.payload.deliveryCity) },
    summary: d.summary, items: c.items, subtotalCents: c.subtotalCents,
    tax: { treatment: d.taxTreatment, label: d.taxLabel, cents: c.taxCents },
    totalCents: c.totalCents, terms: d.terms,
  };
}
