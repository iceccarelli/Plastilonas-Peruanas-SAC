import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { quoteStore } from '@/lib/quote-store';
import { NO_STORE_HEADERS, limitDecide, sameSite, tokenFrom } from '@/lib/oferta-http';
import { readBoundedText } from '@/lib/http-limits';
import { logEvent } from '@/lib/lead-service';
import { bumpCounter } from '@/lib/ops';

export const runtime = 'nodejs';

/**
 * Decisión del cliente (POST de formulario). Nunca responde «éxito» por sí
 * misma: redirige a la página, que lee el estado REAL de la base de datos.
 * Un GET jamás decide (los antivirus de correo precargan enlaces).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const raw = (await params).token;
  const t = tokenFrom(raw);
  const back = (code: string, status = 303) => {
    const url = new URL(`/oferta/${raw}`, req.url);
    url.searchParams.set('e', code);
    return NextResponse.redirect(url, { status, headers: NO_STORE_HEADERS });
  };
  if (!t) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: NO_STORE_HEADERS });
  if (!sameSite(req.headers)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403, headers: NO_STORE_HEADERS });
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return back('unavailable');

  const body = await readBoundedText(req, 4096);
  if (!body.ok) return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413, headers: NO_STORE_HEADERS });
  const form = new URLSearchParams(body.text);
  const outcome = form.get('outcome');
  if (outcome !== 'accepted' && outcome !== 'rejected') return back('invalid');
  const reason = (form.get('reason') ?? '').trim().slice(0, 500) || null;
  const key = form.get('key') ?? '';

  const db = supabaseAdmin();
  const verdict = await limitDecide(db, req.headers, t.hash);
  if (!verdict.allowed) {
    logEvent('oferta_rate_limited', { level: 'warn', unavailable: 'unavailable' in verdict });
    return back('rate');
  }
  const r = await quoteStore(db).decide(t.hash, outcome, reason, key);
  if (!r.ok) {
    logEvent('oferta_decision_rejected', { level: 'warn', error: r.error });
    if (r.error === 'link_invalid' || r.error === 'link_revoked' || r.error === 'link_expired') await bumpCounter(db, 'oferta-invalid');
    return back(r.error);
  }
  logEvent('oferta_decision', { outcome: r.outcome, replayed: r.replayed });
  const url = new URL(`/oferta/${raw}`, req.url);
  return NextResponse.redirect(url, { status: 303, headers: NO_STORE_HEADERS });
}
