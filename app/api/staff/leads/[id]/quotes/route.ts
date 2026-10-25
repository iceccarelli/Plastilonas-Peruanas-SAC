import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { parseQuoteForm } from '@/lib/quote-form';

export const runtime = 'nodejs';

/** Crea un BORRADOR de cotización (versión siguiente). Interno: aún no es una oferta. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { id } = await params;
  const parsed = parseQuoteForm(await req.formData());
  if (!parsed.success) return back(req, id, 'quote_invalid');
  const r = await g.store.createQuote(id, g.actor, parsed.data);
  return back(req, id, r.ok ? 'quote_created' : r.error);
}
