import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { parseQuoteForm } from '@/lib/quote-form';

export const runtime = 'nodejs';

/** Edita un BORRADOR. Una oferta emitida no se edita: se crea otra versión. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const f = await req.formData();
  const lead = String(f.get('lead') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  const parsed = parseQuoteForm(f);
  if (!parsed.success) return back(req, lead, 'quote_invalid');
  const r = await g.store.updateQuote(qid, g.actor, parsed.data);
  return back(req, lead, r.ok ? 'quote_updated' : r.error);
}
