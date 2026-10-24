import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseLeadStore } from '@/lib/lead-store';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { logEvent, retryDueDeliveries } from '@/lib/lead-service';
import { quoteStore } from '@/lib/quote-store';
import { runQuoteDeliveries } from '@/lib/quote-delivery';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchAlerts, evaluateConditions, recordHeartbeat } from '@/lib/ops';

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

    // Cotizaciones al cliente: independientes de los leads. Un fallo aquí no tapa el estado de los RFQ.
    const qs = quoteStore();
    const quotesRun = await runQuoteDeliveries(qs).catch((err) => {
      logEvent('quote_delivery_run_failed', { level: 'error', reason: (err as Error).message.slice(0, 80) });
      return null;
    });
    const quotes = await qs.health().catch(() => null);
    if (quotes && quotes.dead > 0) logEvent('quote_delivery_dead', { level: 'error', dead: quotes.dead });
    if (quotes && quotes.blocked > 0) logEvent('quote_delivery_blocked', { level: 'warn', blocked: quotes.blocked });
    // Contadores de límite de tasa caducados.
    await supabaseAdmin().rpc('rate_limit_purge', { p_older_than_seconds: 86400 }).then(() => undefined, () => undefined);

    const ok = health.dead === 0 && quotesRun !== null && quotes !== null && quotes.dead === 0 && quotes.blocked === 0;

    // Operación: latido (prueba de que ESTE proceso corre), evaluación de condiciones y alertas sin ruido.
    const db = supabaseAdmin();
    await recordHeartbeat(db, ok, { dead: health.dead, quoteDead: quotes?.dead ?? null, quoteBlocked: quotes?.blocked ?? null }).catch(() => undefined);
    const evaluated = await evaluateConditions(db, { leads: async () => health, quotes: async () => quotes ?? Promise.reject(new Error('no quotes')) }).catch(() => null);
    const alerts = evaluated ? await dispatchAlerts(db, evaluated.active, evaluated.unknown).catch(() => null) : null;
    return NextResponse.json(
      { ok, run, health, purge, quotes: { run: quotesRun, health: quotes }, alerts: { active: evaluated?.active.map((c) => c.id) ?? null, ...(alerts ?? {}) } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    logEvent('cron_failed', { level: 'error', reason: (err as Error).message.slice(0, 80) });
    return NextResponse.json({ ok: false, error: 'store_unavailable' }, { status: 503 });
  }
}
