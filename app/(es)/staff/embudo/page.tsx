import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSafeSession } from '@/auth';
import { requireStaff } from '@/lib/staff';
import { isSupabaseConfigured } from '@/lib/supabase';
import { loadFunnel, parseWindow, type Funnel } from '@/lib/funnel';
import FunnelView from '@/components/staff/FunnelView';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Embudo comercial — personal',
  robots: { index: false, follow: false, nocache: true },
};

export default async function Embudo({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const session = await getSafeSession();
  if (!session?.user) redirect('/login');
  if (!(await requireStaff())) notFound();
  const days = parseWindow((await searchParams).dias);
  let funnel: Funnel | null = null;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try { funnel = await loadFunnel(undefined, days); } catch { funnel = null; }
  }
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <Link className="text-sm underline" href="/staff">← Leads</Link>
      <h1 className="mt-3 text-2xl font-semibold">Embudo comercial</h1>
      {funnel ? <div className="mt-6"><FunnelView f={funnel} days={days} /></div> : (
        <p role="alert" className="mt-6 text-red-700">No se pudo calcular el embudo: falta la base de datos o la migración 20261024020000_commercial_funnel.sql.</p>
      )}
    </main>
  );
}
