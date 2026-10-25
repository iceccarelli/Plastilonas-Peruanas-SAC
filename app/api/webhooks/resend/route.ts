import { NextRequest, NextResponse } from 'next/server';
import { readBoundedText } from '@/lib/http-limits';
import { verifySvix } from '@/lib/quote-delivery';
import { quoteStore } from '@/lib/quote-store';
import { logEvent } from '@/lib/lead-service';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };

/**
 * Eventos del proveedor de correo (Resend/Svix). Único camino por el que una
 * entrega pasa a «confirmed» (llegó al buzón) o a «dead» (rebote/queja).
 * Firma obligatoria, marca de tiempo acotada y cada evento se procesa UNA vez.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: 'webhook_not_configured' }, { status: 503, headers });
  const body = await readBoundedText(req, 64 * 1024);
  if (!body.ok) return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413, headers });
  const ok = verifySvix(
    { id: req.headers.get('svix-id'), timestamp: req.headers.get('svix-timestamp'), signature: req.headers.get('svix-signature') },
    body.text, secret,
  );
  if (!ok) return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401, headers });

  let evt: { type?: unknown; data?: { email_id?: unknown } };
  try { evt = JSON.parse(body.text); } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400, headers }); }
  const type = typeof evt.type === 'string' ? evt.type : '';
  const messageId = typeof evt.data?.email_id === 'string' ? evt.data.email_id : '';
  const eventId = req.headers.get('svix-id')!;
  if (!messageId || !type.startsWith('email.')) return NextResponse.json({ ok: true, ignored: true }, { headers });
  try {
    const r = await quoteStore().providerEvent(eventId, messageId, type);
    logEvent('quote_email_event', { type, claimed: r.claimed, updated: r.updated });
    return NextResponse.json({ ok: true, ...r }, { headers });
  } catch {
    // 5xx: el proveedor reintenta; el evento no se marcó como procesado si la base falló.
    return NextResponse.json({ ok: false, error: 'store_unavailable' }, { status: 503, headers });
  }
}
