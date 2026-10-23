import { NextRequest } from 'next/server';
import { z } from 'zod';
import { staffGate, back } from '@/lib/staff-http';
import { staffEmails } from '@/lib/staff-policy';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGate(req, { write: true });
  if (!g.ok) return g.response;
  const { id } = await params;
  const form = await req.formData();
  // Solo se puede asignar a alguien del personal autorizado.
  const assignee = z.string().trim().toLowerCase().safeParse(form.get('assignee'));
  if (!assignee.success || !staffEmails().includes(assignee.data)) return back(req, id, 'assignee_invalid');
  const r = await g.store.assign(id, g.actor, assignee.data);
  return back(req, id, r.ok ? 'assigned' : r.error);
}
