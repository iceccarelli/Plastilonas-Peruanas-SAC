import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { supabaseLeadStore } from '@/lib/lead-store';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { clientIp, logEvent, submitLead } from '@/lib/lead-service';

export const runtime = 'nodejs';
// Dos entregas en paralelo con tope de 6 s cada una caben de sobra.
export const maxDuration = 20;

const MAX_BODY_BYTES = 32 * 1024;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(req: NextRequest) {
  // Tope de cuerpo ANTES de parsear: el formulario real pesa unos 2 KB.
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, accepted: false, error: 'payload_too_large' }, { status: 413, headers });
  }
  let text: string;
  try {
    text = await req.text();
  } catch {
    return NextResponse.json({ ok: false, accepted: false, error: 'invalid_json' }, { status: 400, headers });
  }
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, accepted: false, error: 'payload_too_large' }, { status: 413, headers });
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, accepted: false, error: 'invalid_json' }, { status: 400, headers });
  }

  let store = null;
  let attachments = null;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      store = supabaseLeadStore();
      attachments = supabaseAttachmentStore();
    } catch {
      logEvent('store_unavailable', { level: 'error' });
    }
  }
  const { status, body } = await submitLead(json, clientIp(req.headers), { store, attachments });
  return NextResponse.json(body, { status, headers });
}
