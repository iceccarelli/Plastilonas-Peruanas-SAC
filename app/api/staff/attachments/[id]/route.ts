import { NextRequest, NextResponse } from 'next/server';
import { staffGate } from '@/lib/staff-http';

export const runtime = 'nodejs';

/** Descarga de un adjunto: URL firmada de 5 min, forzada a descarga y auditada. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGate(req, { write: false });
  if (!g.ok) return g.response;
  const { id } = await params;
  const url = await g.store.attachmentUrl(id, g.actor);
  if (!url) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}
