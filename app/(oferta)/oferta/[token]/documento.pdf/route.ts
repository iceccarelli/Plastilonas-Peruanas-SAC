import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { quoteStore } from '@/lib/quote-store';
import { renderQuotePdf } from '@/lib/quote-document';
import { NO_STORE_HEADERS, limitView, tokenFrom } from '@/lib/oferta-http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const gone = (status: number) =>
  new NextResponse(null, { status, headers: NO_STORE_HEADERS });

/** PDF de la instantánea EXACTA que recibió el cliente. Mismo control de acceso que la página. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const t = tokenFrom((await params).token);
  if (!t) return gone(404);
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return gone(503);
  const db = supabaseAdmin();
  const verdict = await limitView(db, req.headers, t.hash);
  if (!verdict.allowed) {
    return new NextResponse(null, {
      status: 'unavailable' in verdict ? 503 : 429,
      headers: { ...NO_STORE_HEADERS, 'Retry-After': String(verdict.retryAfterSeconds) },
    });
  }
  try {
    const view = await quoteStore(db).publicView(t.hash);
    // Un enlace inválido, vencido o reemplazado no entrega NI el PDF ni pistas sobre por qué.
    if (view.state !== 'open' && view.state !== 'resolved') return gone(404);
    const bytes = await renderQuotePdf(view.snapshot, { hash: view.snapshotHash });
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        ...NO_STORE_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${view.snapshot.reference}.pdf"`,
      },
    });
  } catch {
    return gone(503);
  }
}
