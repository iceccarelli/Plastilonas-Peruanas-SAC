import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { quoteStore } from '@/lib/quote-store';
import { runQuoteDeliveries } from '@/lib/quote-delivery';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const lead = String((await req.formData()).get('lead') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  const r = await g.store.issueQuote(qid, g.actor);
  if (!r.ok) return back(req, lead, r.error);
  // Primer intento de entrega YA, acotado. El resultado (enviado, bloqueado o
  // fallido) queda en quote_deliveries y el panel lo muestra; el cron reintenta.
  await runQuoteDeliveries(quoteStore(), process.env, 3).catch(() => undefined);
  return back(req, lead, 'quote_issued');
}
