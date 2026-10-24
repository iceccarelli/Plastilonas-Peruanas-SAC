import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSafeSession } from '@/auth';
import { requireStaff } from '@/lib/staff';
import { staffEmails } from '@/lib/staff-policy';
import { supabaseStaffStore } from '@/lib/staff-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { allowedTransitions } from '@/lib/lead-workflow';
import { FORM_ITEM_ROWS } from '@/lib/quote-form';
import type { StaffQuote } from '@/lib/staff-store';

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
  quote_not_found: 'Cotización no encontrada.', quote_updated: 'Borrador actualizado.',
  tax_required: 'Indique el tratamiento de impuestos antes de emitir: no se presupone.', tax_label_required: 'Redacte la leyenda de impuestos (p. ej. «IGV incluido»).',
  tax_amount_required: 'Si el impuesto es adicional, indique su importe.', totals_mismatch: 'Los importes no cuadran con las partidas.',
  quote_immutable: 'Una oferta emitida no se edita: cree una nueva versión.',
  delivery_retried: 'Reintento de envío ejecutado: revise el estado de entrega.', delivery_not_retryable: 'Esa entrega no necesita reintento.',
  link_rotated: 'Enlace anterior revocado; se generó y se puso en cola uno nuevo.',
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
        <p className="text-sm text-gray-600">El importe lo fija una persona del personal; el sitio no calcula precios ni presupone impuestos. Solo una cotización <b>emitida</b> es una oferta; al emitir se congela una instantánea con su huella SHA-256 y se encola el envío al cliente.</p>
        {lead.quotes.length === 0 && <p className="mt-2 text-sm">Sin cotizaciones.</p>}
        <ul className="mt-2 space-y-3 text-sm">
          {lead.quotes.map((q) => (
            <li key={q.id} className="rounded border p-3">
              <div>
                <b>v{q.version}</b> · <b>{QSTATUS[q.status] ?? q.status}</b> · {(q.amountCents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })} {q.currency}
                {q.validUntil ? ` · vigente hasta ${q.validUntil}` : ''}
                {q.taxTreatment ? ` · ${TAX[q.taxTreatment]}${q.taxLabel ? ` (${q.taxLabel})` : ''}` : ' · impuestos sin definir'}
              </div>
              <div className="whitespace-pre-wrap">{q.summary}</div>
              {q.lineItems.length > 0 && (
                <ul className="list-disc pl-5">
                  {q.lineItems.map((it, i) => <li key={i}>{it.description} — {it.quantity} {it.unit} × {(it.unit_price_cents / 100).toFixed(2)} = {(it.amount_cents / 100).toFixed(2)}</li>)}
                </ul>
              )}
              {q.terms && <div><b>Condiciones (visibles al cliente):</b> <span className="whitespace-pre-wrap">{q.terms}</span></div>}
              {q.notes && <div className="text-gray-600"><b>Notas internas:</b> {q.notes}</div>}
              {q.snapshotHash && <div className="break-all text-xs text-gray-600">Huella SHA-256: {q.snapshotHash}</div>}
              {q.status === 'superseded' && <div className="text-gray-600">Reemplazada por una versión posterior: su enlace ya no abre la oferta.</div>}
              {(q.status === 'accepted' || q.status === 'rejected') && (
                <div><b>Resultado:</b> {q.status === 'accepted' ? 'aceptada' : 'rechazada'}{q.resolvedAt ? ` el ${new Date(q.resolvedAt).toLocaleString('es-PE', { timeZone: 'America/Lima' })}` : ''}{q.resolvedVia ? ` · registrada por ${q.resolvedVia === 'customer' ? 'el cliente (enlace seguro)' : 'el personal'}` : ''}{q.resolutionReason ? ` · motivo: ${q.resolutionReason}` : ''}</div>
              )}
              {q.delivery && <DeliveryLine q={q} leadId={lead.id} />}
              <div className="mt-2 flex flex-wrap gap-2">
                <a className={box} href={`/api/staff/quotes/${q.id}/pdf?lead=${lead.id}`}>{q.status === 'draft' ? 'Vista previa PDF (borrador)' : 'Descargar PDF emitido'}</a>
              </div>
              {q.status === 'draft' && (
                <>
                  <form method="post" action={`/api/staff/quotes/${q.id}/issue`} className="mt-2">
                    <input type="hidden" name="lead" value={lead.id} />
                    <button className={box}>Emitir como oferta y enviar al cliente</button>
                  </form>
                  <details className="mt-2">
                    <summary className="cursor-pointer">Editar borrador</summary>
                    <form method="post" action={`/api/staff/quotes/${q.id}/update`} className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input type="hidden" name="lead" value={lead.id} />
                      <QuoteFields q={q} />
                      <button className={`${box} sm:col-span-2`}>Guardar cambios</button>
                    </form>
                  </details>
                </>
              )}
              {q.status === 'issued' && (
                <>
                  <form method="post" action={`/api/staff/quotes/${q.id}/link`} className="mt-2">
                    <input type="hidden" name="lead" value={lead.id} />
                    <button className={box}>Revocar enlace y enviar uno nuevo</button>
                  </form>
                  <form method="post" action={`/api/staff/quotes/${q.id}/resolve`} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="lead" value={lead.id} />
                    <input name="reason" maxLength={500} placeholder="Motivo (obligatorio si rechaza)" className={box} />
                    <button name="outcome" value="accepted" className={box}>Registrar: el cliente aceptó (por otro medio)</button>
                    <button name="outcome" value="rejected" className={box}>Registrar: el cliente rechazó (por otro medio)</button>
                  </form>
                </>
              )}
            </li>
          ))}
        </ul>
        {['QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED'].includes(lead.status) && (
          <form method="post" action={`/api/staff/leads/${lead.id}/quotes`} className="mt-4 grid gap-2 sm:grid-cols-2">
            <h3 className="sm:col-span-2 font-semibold">Nueva versión (borrador){lead.quotes[0] ? ` — parte de la v${lead.quotes[0].version}` : ''}</h3>
            <QuoteFields q={lead.quotes[0]} />
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

const QSTATUS: Record<string, string> = { draft: 'borrador (interno)', issued: 'EMITIDA — oferta vigente', accepted: 'aceptada', rejected: 'rechazada', superseded: 'reemplazada' };
const TAX = { included: 'impuestos incluidos', excluded: 'impuestos adicionales', exempt: 'exonerado' } as const;
const DSTATE: Record<string, string> = {
  queued: 'en cola (aún no se intentó)', blocked: 'BLOQUEADO: falta configuración — el cliente NO ha recibido la oferta',
  sent: 'enviado al proveedor (aceptado; aún sin confirmación de entrega al buzón)', confirmed: 'entrega al buzón confirmada por el proveedor',
  failed: 'falló; reintento programado', dead: 'FALLÓ definitivamente — el cliente NO ha recibido la oferta',
};
const DERR: Record<string, string> = {
  email_not_configured: 'falta RESEND_API_KEY', link_secret_missing: 'falta QUOTE_LINK_SECRET (≥32 caracteres)',
  bounced: 'rebotó', complained: 'el destinatario lo marcó como no deseado', not_current: 'ya no era la oferta vigente',
  timeout: 'tiempo de espera agotado', network: 'error de red', http_5xx: 'error del proveedor (5xx)', http_4xx: 'rechazado por el proveedor (4xx)',
  http_429: 'límite del proveedor', internal: 'error interno',
};

function DeliveryLine({ q, leadId }: { q: StaffQuote; leadId: string }) {
  const d = q.delivery!;
  const retryable = q.status === 'issued' && ['blocked', 'failed', 'dead'].includes(d.status);
  return (
    <div className="mt-1">
      <b>Envío al cliente:</b> {DSTATE[d.status] ?? d.status} · intentos {d.attempts}
      {d.lastError ? ` · ${DERR[d.lastError] ?? d.lastError}${d.lastHttpStatus ? ` (${d.lastHttpStatus})` : ''}` : ''}
      {d.sentAt ? ` · enviado ${new Date(d.sentAt).toLocaleString('es-PE', { timeZone: 'America/Lima' })}` : ''}
      {d.confirmedAt ? ` · confirmado ${new Date(d.confirmedAt).toLocaleString('es-PE', { timeZone: 'America/Lima' })}` : ''}
      {retryable && (
        <form method="post" action={`/api/staff/quotes/${q.id}/delivery`} className="mt-1 inline-block">
          <input type="hidden" name="lead" value={leadId} />
          <button className="min-h-[44px] rounded border px-3 py-1 text-sm">Reintentar envío ahora</button>
        </form>
      )}
    </div>
  );
}

function QuoteFields({ q }: { q?: StaffQuote }) {
  const box = 'rounded border px-3 py-2 text-sm';
  const rows = Array.from({ length: FORM_ITEM_ROWS }, (_, i) => q?.lineItems[i]);
  return (
    <>
      <select name="currency" className={box} defaultValue={q?.currency ?? 'PEN'} aria-label="Moneda"><option>PEN</option><option>USD</option></select>
      <label className="text-sm">Vigente hasta <input name="validUntil" type="date" required defaultValue={q?.validUntil ?? ''} className={box} /></label>
      <textarea name="summary" required minLength={10} maxLength={4000} defaultValue={q?.summary ?? ''} placeholder="Especificación cotizada (producto, medidas, normas aplicables)" className={`${box} sm:col-span-2`} />
      <fieldset className="sm:col-span-2 grid gap-1">
        <legend className="text-sm font-medium">Partidas (descripción · cantidad · unidad · precio unitario)</legend>
        {rows.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_5rem_5rem_6rem] gap-1">
            <input name={`item_desc_${i}`} maxLength={300} defaultValue={it?.description ?? ''} placeholder={`Partida ${i + 1}`} aria-label={`Descripción de la partida ${i + 1}`} className={box} />
            <input name={`item_qty_${i}`} inputMode="decimal" defaultValue={it?.quantity ?? ''} placeholder="Cant." aria-label={`Cantidad de la partida ${i + 1}`} className={box} />
            <input name={`item_unit_${i}`} maxLength={20} defaultValue={it?.unit ?? ''} placeholder="Unid." aria-label={`Unidad de la partida ${i + 1}`} className={box} />
            <input name={`item_price_${i}`} inputMode="decimal" defaultValue={it ? (it.unit_price_cents / 100).toFixed(2) : ''} placeholder="P. unit." aria-label={`Precio unitario de la partida ${i + 1}`} className={box} />
          </div>
        ))}
      </fieldset>
      <select name="taxTreatment" required defaultValue={q?.taxTreatment ?? ''} className={box} aria-label="Tratamiento de impuestos">
        <option value="" disabled>Impuestos: elija (obligatorio)</option>
        <option value="included">Incluidos en los precios</option>
        <option value="excluded">Adicionales (indicar importe)</option>
        <option value="exempt">Operación exonerada</option>
      </select>
      <input name="taxLabel" required maxLength={160} defaultValue={q?.taxLabel ?? ''} placeholder="Leyenda de impuestos (redactada por usted)" aria-label="Leyenda de impuestos" className={box} />
      <input name="taxAmount" inputMode="decimal" defaultValue={q?.taxCents != null ? (q.taxCents / 100).toFixed(2) : ''} placeholder="Importe del impuesto (solo si es adicional)" aria-label="Importe del impuesto" className={box} />
      <textarea name="terms" maxLength={4000} defaultValue={q?.terms ?? ''} placeholder="Condiciones comerciales que verá el cliente (plazo, entrega, pago, garantía… solo lo que usted confirme)" className={`${box} sm:col-span-2`} />
      <textarea name="notes" maxLength={4000} defaultValue={q?.notes ?? ''} placeholder="Notas INTERNAS (nunca salen al cliente)" className={`${box} sm:col-span-2`} />
    </>
  );
}
