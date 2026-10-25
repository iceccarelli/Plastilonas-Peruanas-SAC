import type { StaffStore } from '@/lib/staff-store';
import { parseSnapshot, previewSnapshot } from '@/lib/quote-snapshot';
import type { QuoteSnapshotT } from '@/lib/quote-snapshot';

type Render = (s: QuoteSnapshotT, o: { hash: string | null; draft?: boolean }) => Promise<Uint8Array>;

/** PDF de una cotización de un lead para el personal. null si no existe (o no pertenece a ese lead). */
export async function buildStaffQuotePdf(
  store: Pick<StaffStore, 'getLead'>, leadId: string, quoteId: string, render: Render,
): Promise<{ bytes: Uint8Array; filename: string } | null> {
  const lead = await store.getLead(leadId);
  const q = lead?.quotes.find((x) => x.id === quoteId);
  if (!lead || !q) return null;
  const snap = parseSnapshot(q.snapshot);
  if (snap && q.snapshotHash) {
    return { bytes: await render(snap, { hash: q.snapshotHash }), filename: `${snap.reference}.pdf` };
  }
  if (q.status !== 'draft' || !q.validUntil || !q.taxTreatment) return null;
  const subtotal = q.subtotalCents ?? q.amountCents;
  const draft = previewSnapshot(
    lead,
    { version: q.version, currency: q.currency as 'PEN' | 'USD', validUntil: q.validUntil, summary: q.summary, taxTreatment: q.taxTreatment, taxLabel: q.taxLabel, terms: q.terms },
    { items: q.lineItems, subtotalCents: subtotal, taxCents: q.taxCents, totalCents: q.amountCents },
  );
  return { bytes: await render(draft, { hash: null, draft: true }), filename: `BORRADOR-${draft.reference}.pdf` };
}
