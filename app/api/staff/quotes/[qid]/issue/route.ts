import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const lead = String((await req.formData()).get('lead') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  const r = await g.store.issueQuote(qid, g.actor);
  return back(req, lead, r.ok ? 'quote_issued' : r.error);
}
