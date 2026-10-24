import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { quoteStore } from '@/lib/quote-store';
import { runQuoteDeliveries } from '@/lib/quote-delivery';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** Reintento manual y seguro: devuelve la entrega a la cola (mismo enlace) y la ejecuta. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const f = await req.formData();
  const lead = String(f.get('lead') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  const qs = quoteStore();
  const r = await qs.requeueDelivery(qid, g.actor);
  if (!r.ok) return back(req, lead, r.error);
  if (!r.requeued) return back(req, lead, 'delivery_not_retryable');
  await runQuoteDeliveries(qs, process.env, 3).catch(() => undefined);
  return back(req, lead, 'delivery_retried');
}
