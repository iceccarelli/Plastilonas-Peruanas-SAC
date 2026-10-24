import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { hitAll } from '@/lib/rate-limit';
import { uploadRules } from '@/lib/lead-abuse';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { checkUpload } from '@/lib/attachments';
import { readBoundedText } from '@/lib/http-limits';
import { clientIp, hashIp, logEvent } from '@/lib/lead-service';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };

const Body = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().trim().max(120).default(''),
  size: z.number().int().positive(),
});

// Límites COMPARTIDOS entre instancias (lib/lead-abuse.ts, Postgres): un Map en
// memoria deja pasar N× el tope, una vez por instancia en caliente. Falla
// CERRADO: sin contador no se emiten URLs (sin base tampoco hay Storage).

/** Emite una URL firmada de subida para un archivo ya validado en el servidor. */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: 'storage_not_configured' }, { status: 503, headers });
  }
  const verdict = await hitAll(supabaseAdmin(), uploadRules(hashIp(clientIp(req.headers))), 'closed');
  if (!verdict.allowed) {
    const unavailable = 'unavailable' in verdict;
    logEvent('upload_url_limited', { level: 'warn', unavailable });
    return NextResponse.json(
      { ok: false, error: unavailable ? 'limiter_unavailable' : 'rate_limited' },
      { status: unavailable ? 503 : 429, headers: { ...headers, 'Retry-After': String(verdict.retryAfterSeconds) } },
    );
  }
  const body = await readBoundedText(req, 2048);
  if (!body.ok) return NextResponse.json({ ok: false, error: body.reason === 'too_large' ? 'payload_too_large' : 'invalid_json' }, { status: body.reason === 'too_large' ? 413 : 400, headers });
  const text = body.text;
  let parsed;
  try { parsed = Body.safeParse(JSON.parse(text)); } catch { parsed = null; }
  if (!parsed?.success) return NextResponse.json({ ok: false, error: 'invalid_fields' }, { status: 400, headers });

  const check = checkUpload(parsed.data.name, parsed.data.type, parsed.data.size);
  if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400, headers });
  try {
    const up = await supabaseAttachmentStore().createUpload(check.filename);
    return NextResponse.json({ ok: true, ...up }, { headers });
  } catch (err) {
    logEvent('upload_url_failed', { level: 'error', reason: (err as Error).message.slice(0, 80) });
    return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503, headers });
  }
}
