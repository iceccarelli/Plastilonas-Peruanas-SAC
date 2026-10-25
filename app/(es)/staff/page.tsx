import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSafeSession } from '@/auth';
import { requireStaff } from '@/lib/staff';
import { supabaseStaffStore } from '@/lib/staff-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { STATUSES, normalizeStatus } from '@/lib/lead-workflow';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Leads — personal',
  robots: { index: false, follow: false, nocache: true },
};

export default async function StaffLeads({ searchParams }: { searchParams: Promise<{ estado?: string; problemas?: string }> }) {
  const session = await getSafeSession();
  if (!session?.user) redirect('/login');
  if (!(await requireStaff())) notFound();
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <main className="mx-auto max-w-5xl px-6 py-14"><h1 className="text-2xl font-semibold">Leads</h1><p className="mt-4">Supabase no está configurado: no hay base de datos de la que leer.</p></main>;
  }
  const sp = await searchParams;
  const estado = sp.estado && (STATUSES as readonly string[]).includes(sp.estado) ? normalizeStatus(sp.estado) : undefined;
  let rows;
  let error = false;
  try {
    rows = await supabaseStaffStore().listLeads({ status: estado, onlyProblems: sp.problemas === '1' });
  } catch {
    error = true;
  }
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-2xl font-semibold">Leads (RFQ)</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Filtros">
        <Link className="underline" href="/staff">Todos</Link>
        <Link className="underline" href="/staff?problemas=1">Con entrega fallida</Link>
        <Link className="underline" href="/staff/embudo">Embudo comercial</Link>
        {STATUSES.map((s) => <Link key={s} className="underline" href={`/staff?estado=${s}`}>{s}</Link>)}
      </nav>
      {error && <p role="alert" className="mt-6 text-red-700">No se pudo leer la base de datos. Revise que la migración esté aplicada.</p>}
      {rows && rows.length === 0 && <p className="mt-6">No hay leads con este filtro.</p>}
      {rows && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="py-2">Código</th><th>Estado</th><th>Responsable</th><th>Empresa</th><th>Producto</th><th>Entrega CRM / correo</th><th>Adj.</th><th>Fecha</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2"><Link className="underline" href={`/staff/${r.id}`}>{r.rfqId}</Link></td>
                  <td>{r.status}</td>
                  <td>{r.assignedTo ?? '—'}</td>
                  <td>{r.company ?? '—'}</td>
                  <td>{r.product ?? '—'}</td>
                  <td>{r.deliveries.crm ?? '—'} / {r.deliveries.email ?? '—'}</td>
                  <td>{r.attachmentCount}</td>
                  <td>{new Date(r.createdAt).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
