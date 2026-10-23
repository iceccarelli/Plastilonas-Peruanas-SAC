import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff';
import { supabaseStaffStore, type StaffStore } from '@/lib/staff-store';
import { isSupabaseConfigured } from '@/lib/supabase';

/** CSRF: un POST de formulario solo vale si su Origin es este mismo sitio. */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type StaffGate =
  | { ok: true; actor: string; store: StaffStore }
  | { ok: false; response: NextResponse };

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function staffGate(req: NextRequest, opts: { write: boolean }): Promise<StaffGate> {
  if (opts.write && !sameOrigin(req)) {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403, headers: NO_STORE }) };
  }
  const actor = await requireStaff();
  // 404 y no 403: el área del personal no revela que existe.
  if (!actor) return { ok: false, response: NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: NO_STORE }) };
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, response: NextResponse.json({ ok: false, error: 'store_not_configured' }, { status: 503, headers: NO_STORE }) };
  }
  return { ok: true, actor, store: supabaseStaffStore() };
}

export function back(req: NextRequest, id: string, msg: string) {
  const url = new URL(`/staff/${id}`, req.url);
  url.searchParams.set('msg', msg);
  return NextResponse.redirect(url, 303);
}
