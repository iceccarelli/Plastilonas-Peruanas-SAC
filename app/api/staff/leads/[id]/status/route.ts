import { NextRequest } from 'next/server';
import { staffGate, back } from '@/lib/staff-http';
import { STATUSES, type LeadStatus } from '@/lib/lead-workflow';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { id } = await params;
  const form = await req.formData();
  const to = String(form.get('to') ?? '');
  if (!(STATUSES as readonly string[]).includes(to)) return back(req, id, 'invalid_transition');
  const reason = String(form.get('reason') ?? '').slice(0, 500);
  const r = await g.store.transition(id, g.actor, to as LeadStatus, reason);
  return back(req, id, r.ok ? 'status_updated' : r.error);
}
