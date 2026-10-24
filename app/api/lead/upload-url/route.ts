import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/supabase';
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

// Tope por IP en memoria: una URL firmada solo permite UNA ruta y caduca, así
// que el riesgo es volumen de objetos, no acceso.
const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX = 20;
function limited(key: string): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > WINDOW) { hits.set(key, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > MAX;
}

/** Emite una URL firmada de subida para un archivo ya validado en el servidor. */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: 'storage_not_configured' }, { status: 503, headers });
  }
  if (limited(hashIp(clientIp(req.headers)))) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers });
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
