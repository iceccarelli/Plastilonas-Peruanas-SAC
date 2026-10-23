import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { buildStamp } from '@/lib/version';
import { configReport } from '@/lib/config';
import { deepChecks } from '@/lib/health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Público: liveness mínimo (la aplicación responde y qué commit sirve).
 * `?deep=1` con `Authorization: Bearer $CRON_SECRET`: estado de cada
 * integración y verificaciones reales (migraciones, bucket, entregas). Nunca
 * devuelve valores de variables, solo nombres y estados.
 */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('deep') !== '1') {
    return NextResponse.json({ status: 'ok', ...buildStamp() }, { headers: NO_STORE });
  }
  if (!authorized(req)) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401, headers: NO_STORE });
  }
  const integrations = configReport();
  const checks = await deepChecks();
  const failing = checks.filter((c) => c.status === 'fail').length;
  const misconfigured = integrations.filter((i) => i.state === 'misconfigured').length;
  const status = failing || misconfigured ? 'degraded' : 'ok';
  return NextResponse.json(
    { status, ...buildStamp(), integrations, checks },
    { status: status === 'ok' ? 200 : 503, headers: NO_STORE },
  );
}
