import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { supabaseLeadStore } from '@/lib/lead-store';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { readBoundedText } from '@/lib/http-limits';
import { clientIp, logEvent, submitLead } from '@/lib/lead-service';

export const runtime = 'nodejs';
// Dos entregas en paralelo con tope de 6 s cada una caben de sobra.
export const maxDuration = 20;

const MAX_BODY_BYTES = 32 * 1024;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(req: NextRequest) {
  // Tope de cuerpo REAL (no solo Content-Length): el formulario pesa ~2 KB.
  const raw = await readBoundedText(req, MAX_BODY_BYTES);
  if (!raw.ok) {
    return raw.reason === 'too_large'
      ? NextResponse.json({ ok: false, accepted: false, error: 'payload_too_large' }, { status: 413, headers })
      : NextResponse.json({ ok: false, accepted: false, error: 'invalid_json' }, { status: 400, headers });
  }
  const text = raw.text;
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, accepted: false, error: 'invalid_json' }, { status: 400, headers });
  }

  let store = null;
  let attachments = null;
  let limiter = null;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      store = supabaseLeadStore();
      attachments = supabaseAttachmentStore();
      limiter = supabaseAdmin();
    } catch {
      logEvent('store_unavailable', { level: 'error' });
    }
  }
  const { status, body } = await submitLead(json, clientIp(req.headers), { store, attachments, limiter });
  return NextResponse.json(body, { status, headers });
}
