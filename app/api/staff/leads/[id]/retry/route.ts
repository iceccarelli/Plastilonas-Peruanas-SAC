import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { supabaseLeadStore } from '@/lib/lead-store';
import { retryDueDeliveries } from '@/lib/lead-service';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { id } = await params;
  const channel = String((await req.formData()).get('channel') ?? '');
  if (channel !== 'crm' && channel !== 'email') return back(req, id, 'failed');
  const r = await g.store.requeueDelivery(id, g.actor, channel);
  if (!r.ok) return back(req, id, r.error);
  // Reintento inmediato: el resultado queda en lead_deliveries.
  await retryDueDeliveries(supabaseLeadStore(), process.env, 5).catch(() => undefined);
  return back(req, id, 'retried');
}
