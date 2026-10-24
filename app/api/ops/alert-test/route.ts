import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { alertConfigured, sendAlert } from '@/lib/ops';

export const runtime = 'nodejs';
const HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Evento de PRUEBA CONTROLADA: envía un aviso claramente rotulado al destino de
 * alertas configurado y devuelve lo que ocurrió. Demuestra el camino real
 * (URL, red, receptor) sin esperar a una avería. No toca dedupe ni estado.
 */
export async function POST(req: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ ok: false, error: 'cron_not_configured' }, { status: 503, headers: HEADERS });
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: HEADERS });
  if (!alertConfigured()) return NextResponse.json({ ok: false, error: 'alert_destination_not_configured' }, { status: 503, headers: HEADERS });
  const r = await sendAlert({ text: 'Mensaje de PRUEBA del canal de alertas. No requiere ninguna acción.', severity: 'info', condition: 'test', event: 'test' });
  return NextResponse.json({ ok: r.ok, ...(r.reason ? { reason: r.reason } : {}), ...(r.http ? { http: r.http } : {}) }, { status: r.ok ? 200 : 502, headers: HEADERS });
}
