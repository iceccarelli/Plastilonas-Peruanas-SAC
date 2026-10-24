import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { quoteStore } from '@/lib/quote-store';
import { runQuoteDeliveries } from '@/lib/quote-delivery';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Revoca el enlace del cliente y emite uno nuevo (p. ej. si se reenvió a quien
 * no debía). El anterior deja de abrir la oferta; el correo nuevo sale por la
 * cola. El enlace en claro NUNCA se muestra aquí ni se guarda.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const lead = String((await req.formData()).get('lead') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return back(req, 'x', 'failed');
  const qs = quoteStore();
  const r = await qs.rotateLink(qid, g.actor);
  if (!r.ok) return back(req, lead, r.error);
  await runQuoteDeliveries(qs, process.env, 3).catch(() => undefined);
  return back(req, lead, 'link_rotated');
}
