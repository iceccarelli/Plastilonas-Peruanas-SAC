import { NextRequest, NextResponse } from 'next/server';
import { staffGate } from '@/lib/staff-http';
import { renderQuotePdf } from '@/lib/quote-document';
import { buildStaffQuotePdf } from '@/lib/quote-staff-pdf';

export const runtime = 'nodejs';

/**
 * PDF para el personal. Emitida/resuelta/reemplazada: la instantánea inmutable
 * (la misma que recibió el cliente). Borrador: vista previa marcada, sin valor de oferta.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const g = await staffGate(req, { write: false });
  if (!g.ok) return g.response;
  const { qid } = await params;
  const lead = new URL(req.url).searchParams.get('lead') ?? '';
  if (!/^[0-9a-f-]{36}$/.test(qid) || !/^[0-9a-f-]{36}$/.test(lead)) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  const built = await buildStaffQuotePdf(g.store, lead, qid, renderQuotePdf);
  if (!built) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new NextResponse(Buffer.from(built.bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${built.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
