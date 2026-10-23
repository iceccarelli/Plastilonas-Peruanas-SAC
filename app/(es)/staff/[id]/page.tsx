import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSafeSession } from '@/auth';
import { requireStaff } from '@/lib/staff';
import { staffEmails } from '@/lib/staff-policy';
import { supabaseStaffStore } from '@/lib/staff-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { allowedTransitions } from '@/lib/lead-workflow';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Lead — personal',
  robots: { index: false, follow: false, nocache: true },
};

const MSG: Record<string, string> = {
  assigned: 'Responsable asignado.', status_updated: 'Estado actualizado.', retried: 'Reintento ejecutado: revise el estado de entrega.',
  invalid_transition: 'Transición no permitida desde el estado actual.', reason_required: 'Perder un lead exige un motivo.',
  conflict: 'Otra persona cambió este lead mientras tanto. Recargue e intente de nuevo.', assignee_invalid: 'Responsable no autorizado.',
  quote_created: 'Borrador de cotización creado (aún NO es una oferta).', quote_issued: 'Cotización emitida: es la oferta vigente.',
  quote_accepted: 'Aceptación registrada: lead ganado.', quote_rejected: 'Rechazo registrado: lead perdido.',
  quote_invalid: 'Datos de cotización inválidos (importe, moneda, vigencia o resumen).', lead_not_ready: 'Califique el lead antes de cotizar.',
  quote_not_draft: 'Solo un borrador puede emitirse.', validity_required: 'La vigencia debe ser una fecha futura.',
  quote_not_issued: 'Solo la oferta vigente admite resultado.', invalid_outcome: 'Resultado inválido.', lead_not_found: 'Lead no encontrado.',
  quote_not_found: 'Cotización no encontrada.',
  not_found: 'No encontrado.', failed: 'No se pudo completar la acción.',
};

export default async function StaffLead({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const session = await getSafeSession();
  if (!session?.user) redirect('/login');
  if (!(await requireStaff())) notFound();
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) notFound();
  const { id } = await params;
  const { msg } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const lead = await supabaseStaffStore().getLead(id);
  if (!lead) notFound();
  const next = allowedTransitions(lead.status);
  const box = 'rounded border px-3 py-2 text-sm';

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <Link className="text-sm underline" href="/staff">← Leads</Link>
      <h1 className="mt-3 text-2xl font-semibold">{lead.rfqId} · {lead.status}</h1>
      {msg && MSG[msg] && <p role="status" className="mt-3 rounded bg-amber-50 px-3 py-2 text-sm">{MSG[msg]}</p>}

      <section className="mt-6 grid gap-1 text-sm">
        <div><b>Contacto:</b> {lead.fullName ?? '—'} · {lead.email} · {lead.phone ?? '—'}</div>
        <div><b>Empresa:</b> {lead.company ?? '—'} {typeof lead.payload.ruc === 'string' ? `· RUC ${lead.payload.ruc}` : ''}</div>
        <div><b>Producto:</b> {lead.product ?? '—'} · <b>Cantidad:</b> {lead.quantity ?? '—'}</div>
        <div><b>Origen:</b> {lead.source ?? '—'}</div>
        <div><b>Atribución:</b> {['channel', 'referrer_host', 'utm_source', 'utm_medium', 'utm_campaign'].map((k) => (lead.payload[k] ? `${k}=${String(lead.payload[k])}` : null)).filter(Boolean).join(' · ') || '—'}</div>
        <div><b>Responsable:</b> {lead.assignedTo ?? 'sin asignar'}</div>
        {lead.lossReason && <div><b>Motivo de pérdida:</b> {lead.lossReason}</div>}
        <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-3">{lead.message ?? ''}</pre>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Entrega a canales</h2>
        {lead.deliveryDetail.length === 0 ? <p className="text-sm">Sin canales configurados al recibir este lead.</p> : (
          <ul className="mt-2 space-y-2 text-sm">
            {lead.deliveryDetail.map((d) => (
              <li key={d.channel} className="flex flex-wrap items-center gap-3">
                <b>{d.channel}</b> {d.status} · intentos {d.attempts}{d.lastError ? ` · ${d.lastError}${d.lastHttpStatus ? ` (${d.lastHttpStatus})` : ''}` : ''}
                {(d.status === 'failed' || d.status === 'dead') && (
                  <form method="post" action={`/api/staff/leads/${lead.id}/retry`}>
                    <input type="hidden" name="channel" value={d.channel} />
                    <button className={box}>Reintentar ahora</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Adjuntos</h2>
        {lead.attachments.length === 0 ? <p className="text-sm">Sin adjuntos asociados.</p> : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {lead.attachments.map((a) => (
              <li key={a.id}><a className="underline" href={`/api/staff/attachments/${a.id}`}>{a.filename}</a> {a.sizeBytes ? `· ${Math.round(a.sizeBytes / 1024)} KB` : ''} <span className="text-gray-500">(archivo no verificado: descargar, no abrir en línea)</span></li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <form method="post" action={`/api/staff/leads/${lead.id}/assign`} className="grid gap-2">
          <h2 className="text-lg font-semibold">Asignar</h2>
          <select name="assignee" className={box} defaultValue={lead.assignedTo ?? ''}>
            {staffEmails().map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button className={box}>Asignar</button>
        </form>
        {next.length > 0 && (
          <form method="post" action={`/api/staff/leads/${lead.id}/status`} className="grid gap-2">
            <h2 className="text-lg font-semibold">Cambiar estado</h2>
            <select name="to" className={box}>{next.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <input name="reason" maxLength={500} placeholder="Motivo (obligatorio para LOST)" className={box} />
            <button className={box}>Actualizar</button>
          </form>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Cotizaciones</h2>
        <p className="text-sm text-gray-600">El importe lo fija una persona del personal; el sitio no calcula precios. Solo una cotización <b>emitida</b> es una oferta.</p>
        {lead.quotes.length === 0 && <p className="mt-2 text-sm">Sin cotizaciones.</p>}
        <ul className="mt-2 space-y-3 text-sm">
          {lead.quotes.map((q) => (
            <li key={q.id} className="rounded border p-3">
              <div><b>v{q.version}</b> · {q.status} · {(q.amountCents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })} {q.currency}{q.validUntil ? ` · vigente hasta ${q.validUntil}` : ''}</div>
              <div className="whitespace-pre-wrap">{q.summary}</div>
              {q.resolutionReason && <div>Motivo: {q.resolutionReason}</div>}
              {q.status === 'draft' && (
                <form method="post" action={`/api/staff/quotes/${q.id}/issue`} className="mt-2">
                  <input type="hidden" name="lead" value={lead.id} />
                  <button className={box}>Emitir como oferta</button>
                </form>
              )}
              {q.status === 'issued' && (
                <form method="post" action={`/api/staff/quotes/${q.id}/resolve`} className="mt-2 flex flex-wrap gap-2">
                  <input type="hidden" name="lead" value={lead.id} />
                  <input name="reason" maxLength={500} placeholder="Motivo (obligatorio si rechaza)" className={box} />
                  <button name="outcome" value="accepted" className={box}>El cliente aceptó</button>
                  <button name="outcome" value="rejected" className={box}>El cliente rechazó</button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {['QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED'].includes(lead.status) && (
          <form method="post" action={`/api/staff/leads/${lead.id}/quotes`} className="mt-4 grid gap-2 sm:grid-cols-2">
            <h3 className="sm:col-span-2 font-semibold">Nueva versión (borrador)</h3>
            <input name="amount" required inputMode="decimal" placeholder="Importe, p. ej. 12500.50" className={box} />
            <select name="currency" className={box}><option>PEN</option><option>USD</option></select>
            <input name="validUntil" type="date" required className={box} />
            <textarea name="summary" required minLength={10} maxLength={4000} placeholder="Especificación cotizada (producto, medidas, cantidad, condiciones de entrega)" className={`${box} sm:col-span-2`} />
            <textarea name="notes" maxLength={4000} placeholder="Notas internas (opcional)" className={`${box} sm:col-span-2`} />
            <button className={`${box} sm:col-span-2`}>Crear borrador</button>
          </form>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Historial</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {lead.events.length === 0 && <li>Sin acciones registradas.</li>}
          {lead.events.map((e, i) => (
            <li key={i}>{new Date(e.at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} · {e.actor} · {e.action} {e.from ?? ''}{e.to ? ` → ${e.to}` : ''}{e.note ? ` (${e.note})` : ''}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
