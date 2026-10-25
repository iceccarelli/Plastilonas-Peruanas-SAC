import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { BUCKET } from '@/lib/attachments';
import { readiness, type ReadyFunction, type Readiness } from '@/lib/ops';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

const FUNCTIONS: ReadyFunction[] = ['rfq', 'quote', 'upload'];
/** Un monitor puede sondear cada pocos segundos: la sonda de escritura no debe golpear la base cada vez. */
const TTL_MS = 10_000;
const cache = new Map<string, { at: number; value: Readiness }>();
const hits = new Map<string, { n: number; t: number }>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > 120;
}

/**
 * PREPARACIÓN (readiness), distinta de la vivacidad (/api/health):
 *   /api/health          ¿el proceso responde?
 *   /api/ready?function= ¿puede este sitio SERVIR esa función ahora mismo?
 *                        rfq (por defecto) · quote · upload
 * Escribe de verdad en la base, mira el esquema y el bucket. Público: solo
 * estados ok/fail/skip, sin versiones, hosts, nombres de tablas ni errores.
 * El detalle está en /api/health?deep=1, protegido.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (tooMany(ip)) return NextResponse.json({ status: 'rate_limited' }, { status: 429, headers: HEADERS });
  const raw = req.nextUrl.searchParams.get('function') ?? 'rfq';
  if (!FUNCTIONS.includes(raw as ReadyFunction)) return NextResponse.json({ status: 'invalid_function' }, { status: 400, headers: HEADERS });
  const fn = raw as ReadyFunction;

  const hit = cache.get(fn);
  if (hit && Date.now() - hit.at < TTL_MS) return respond(hit.value);

  const configured = isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const db = configured ? supabaseAdmin() : null;
  const value = await readiness(fn, db, process.env, async () => {
    const { data, error } = await supabaseAdmin().storage.getBucket(BUCKET);
    if (error || !data) return { exists: false, isPublic: false };
    return { exists: true, isPublic: Boolean(data.public) };
  });
  cache.set(fn, { at: Date.now(), value });
  return respond(value);
}

function respond(v: Readiness) {
  return NextResponse.json(v, { status: v.status === 'not_ready' ? 503 : 200, headers: HEADERS });
}
