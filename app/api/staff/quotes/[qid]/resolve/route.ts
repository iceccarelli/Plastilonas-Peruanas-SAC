import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const f = await req.formData();
  const lead = String(f.get('lead') ?? '');
  const outcome = String(f.get('outcome') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  if (outcome !== 'accepted' && outcome !== 'rejected') return back(req, lead, 'invalid_outcome');
  const r = await g.store.resolveQuote(qid, g.actor, outcome, String(f.get('reason') ?? '').slice(0, 500));
  return back(req, lead, r.ok ? `quote_${outcome}` : r.error);
}
