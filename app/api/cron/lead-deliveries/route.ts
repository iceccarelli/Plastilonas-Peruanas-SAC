import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseLeadStore } from '@/lib/lead-store';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { logEvent, retryDueDeliveries } from '@/lib/lead-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Reintenta las entregas de RFQ pendientes y reporta el estado del backlog.
 * Vercel Cron envía `Authorization: Bearer $CRON_SECRET`. Sin CRON_SECRET el
 * endpoint se niega (503): no hay reintentos "silenciosamente apagados".
 */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'cron_not_configured' }, { status: 503 });
  }
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const store = supabaseLeadStore();
    const run = await retryDueDeliveries(store);
    // Subidas que nunca se asociaron a un RFQ (7 días): se borran.
    const purge = await supabaseAttachmentStore().purgeAbandoned(7).catch(() => ({ removed: -1 }));
    const health = await store.deliveryHealth();
    if (health.dead > 0) logEvent('delivery_backlog_dead', { level: 'error', dead: health.dead });
    return NextResponse.json({ ok: health.dead === 0, run, health, purge }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    logEvent('cron_failed', { level: 'error', reason: (err as Error).message.slice(0, 80) });
    return NextResponse.json({ ok: false, error: 'store_unavailable' }, { status: 503 });
  }
}
