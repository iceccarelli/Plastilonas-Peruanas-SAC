import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { quoteStore, type PublicQuoteView } from '@/lib/quote-store';
import { formatMoney } from '@/lib/quote-document';
import { limitView, tokenFrom } from '@/lib/oferta-http';
import { SITE } from '@/lib/site';
import { whatsappUrl } from '@/lib/whatsapp';
import ImprimirBoton from '@/components/oferta/ImprimirBoton';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  rate: 'Demasiados intentos seguidos. Espere unos minutos e inténtelo de nuevo.',
  unavailable: 'El servicio no está disponible en este momento. Su respuesta NO se registró; inténtelo de nuevo o escríbanos.',
  reason_required: 'Para rechazar la oferta necesitamos conocer el motivo.',
  already_resolved: 'Esta oferta ya tiene una respuesta registrada distinta. No se modificó nada.',
  quote_not_current: 'Esta oferta ya no está vigente.',
  offer_expired: 'La vigencia de esta oferta terminó. No se registró su respuesta.',
  link_expired: 'Este enlace venció. No se registró su respuesta.',
  link_revoked: 'Este enlace fue reemplazado. No se registró su respuesta.',
  invalid: 'No se pudo interpretar su respuesta. No se registró nada.',
  failed: 'No pudimos registrar su respuesta. Inténtelo de nuevo o escríbanos.',
};

const box = 'rounded-lg border border-gray-300 bg-white p-4 sm:p-6';
const btn = 'inline-flex min-h-11 items-center justify-center rounded px-5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function Contact() {
  return (
    <p className="mt-4 text-sm">
      Escríbanos a <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> o por WhatsApp al{' '}
      <a className="underline" href={whatsappUrl('Hola, escribo por mi cotización.')}>{SITE.phoneWhatsApp}</a>.
    </p>
  );
}

function Unavailable({ title, text }: { title: string; text: string }) {
  return (
    <section className={box} aria-labelledby="t">
      <h1 id="t" className="text-xl font-semibold">{title}</h1>
      <p className="mt-2">{text}</p>
      <Contact />
    </section>
  );
}

export default async function OfertaPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ e?: string }> }) {
  const raw = (await params).token;
  const { e } = await searchParams;
  const t = tokenFrom(raw);
  if (!t) return <Unavailable title="Enlace no válido" text="Este enlace no corresponde a ninguna oferta." />;
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <Unavailable title="Servicio no disponible" text="No podemos mostrar su oferta en este momento." />;
  }
  const db = supabaseAdmin();
  const verdict = await limitView(db, await headers(), t.hash);
  if (!verdict.allowed) {
    return <Unavailable title="Demasiadas solicitudes" text="Espere unos minutos e inténtelo de nuevo." />;
  }
  let view: PublicQuoteView;
  try {
    view = await quoteStore(db).publicView(t.hash);
  } catch {
    return <Unavailable title="Servicio no disponible" text="No pudimos consultar su oferta. Inténtelo de nuevo en unos minutos." />;
  }
  if (view.state === 'not_found') return <Unavailable title="Enlace no válido" text="Este enlace no corresponde a ninguna oferta." />;
  if (view.state === 'expired') return <Unavailable title="El enlace venció" text="La vigencia de esta oferta terminó. Solicite una actualización a nuestro equipo comercial." />;
  if (view.state === 'revoked') {
    return view.reason === 'superseded'
      ? <Unavailable title="Esta oferta fue reemplazada" text="Emitimos una versión posterior. Use el enlace del correo más reciente o solicítelo a nuestro equipo comercial." />
      : <Unavailable title="Este enlace ya no está activo" text="Solicite un enlace nuevo a nuestro equipo comercial." />;
  }

  const s = view.snapshot;
  const money = (c: number) => formatMoney(c, s.currency);
  const key = randomBytes(16).toString('base64url');
  const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short' }) : '');
  const errorMsg = e ? ERRORS[e] : undefined;
  const taxName = { included: 'Impuestos incluidos', excluded: 'Impuestos adicionales', exempt: 'Operación exonerada' }[s.tax.treatment];

  return (
    <article className="space-y-6" aria-labelledby="titulo">
      <header>
        <p className="text-sm text-gray-600">{s.issuer.name} · RUC {s.issuer.ruc}</p>
        <h1 id="titulo" className="mt-1 text-2xl font-bold">Cotización {s.reference}</h1>
        <p className="mt-1 text-sm">Emitida el {s.issuedAt.slice(0, 10)} · Válida hasta el <b>{s.validUntil}</b> (fin del día, hora de Lima)</p>
      </header>

      {errorMsg && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">{errorMsg}</p>}

      {view.state === 'resolved' && view.outcome && (
        <p role="status" className={`rounded border p-3 text-sm ${view.outcome === 'accepted' ? 'border-green-400 bg-green-50 text-green-900' : 'border-gray-400 bg-gray-50'}`}>
          {view.outcome === 'accepted'
            ? <>Oferta <b>aceptada</b>{view.resolvedAt ? ` el ${fecha(view.resolvedAt)}` : ''}. Nuestro equipo comercial se pondrá en contacto para coordinar los siguientes pasos.</>
            : <>Oferta <b>rechazada</b>{view.resolvedAt ? ` el ${fecha(view.resolvedAt)}` : ''}. Gracias por avisarnos.</>}
        </p>
      )}

      <section className={box} aria-labelledby="cli">
        <h2 id="cli" className="text-lg font-semibold">Cliente y solicitud</h2>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">
          {s.customer.company && <><dt className="font-medium">Empresa</dt><dd>{s.customer.company}</dd></>}
          {s.customer.ruc && <><dt className="font-medium">RUC</dt><dd>{s.customer.ruc}</dd></>}
          {s.customer.name && <><dt className="font-medium">Atención</dt><dd>{s.customer.name}</dd></>}
          {s.request.product && <><dt className="font-medium">Producto solicitado</dt><dd>{s.request.product}</dd></>}
          {s.request.quantity && <><dt className="font-medium">Cantidad / medidas</dt><dd>{s.request.quantity}</dd></>}
          {s.request.deliveryCity && <><dt className="font-medium">Ciudad de entrega</dt><dd>{s.request.deliveryCity}</dd></>}
        </dl>
        <h3 className="mt-4 font-medium">Especificación cotizada</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm">{s.summary}</p>
      </section>

      <section className={box} aria-labelledby="det">
        <h2 id="det" className="text-lg font-semibold">Detalle de la oferta ({s.currency})</h2>
        <div className="mt-2 overflow-x-auto" role="region" aria-label="Partidas de la cotización (desplazable)" tabIndex={0}>
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Partidas de la cotización {s.reference}</caption>
            <thead>
              <tr className="border-b border-gray-300">
                <th scope="col" className="py-2 pr-2">Descripción</th>
                <th scope="col" className="py-2 pr-2 text-right">Cant.</th>
                <th scope="col" className="py-2 pr-2">Unid.</th>
                <th scope="col" className="py-2 pr-2 text-right">P. unit.</th>
                <th scope="col" className="py-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {(s.items.length ? s.items : [{ description: 'Según especificación cotizada', quantity: '1', unit: 'glb', unit_price_cents: s.subtotalCents, amount_cents: s.subtotalCents }]).map((it, i) => (
                <tr key={i} className="border-b border-gray-200 align-top">
                  <td className="py-2 pr-2">{it.description}</td>
                  <td className="py-2 pr-2 text-right">{it.quantity}</td>
                  <td className="py-2 pr-2">{it.unit}</td>
                  <td className="py-2 pr-2 text-right">{money(it.unit_price_cents)}</td>
                  <td className="py-2 text-right">{money(it.amount_cents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><th scope="row" colSpan={4} className="pt-3 text-right font-normal">Subtotal</th><td className="pt-3 text-right">{money(s.subtotalCents)}</td></tr>
              {s.tax.treatment === 'excluded' && s.tax.cents !== null && (
                <tr><th scope="row" colSpan={4} className="text-right font-normal">{s.tax.label}</th><td className="text-right">{money(s.tax.cents)}</td></tr>
              )}
              <tr><th scope="row" colSpan={4} className="pt-1 text-right text-base">Total</th><td className="pt-1 text-right text-base font-bold">{money(s.totalCents)}</td></tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-sm"><b>{taxName}:</b> {s.tax.label}</p>
      </section>

      {s.terms && (
        <section className={box} aria-labelledby="cond">
          <h2 id="cond" className="text-lg font-semibold">Condiciones comerciales</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{s.terms}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3 print:hidden">
        <a className={`${btn} border border-gray-400`} href={`/oferta/${raw}/documento.pdf`}>Descargar PDF</a>
        <ImprimirBoton />
      </div>

      {view.state === 'open' && (
        <section className={`${box} print:hidden`} aria-labelledby="dec">
          <h2 id="dec" className="text-lg font-semibold">Su respuesta</h2>
          <p className="mt-1 text-sm">Su decisión queda registrada una sola vez y avisa a nuestro equipo comercial.</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <form method="post" action={`/api/oferta/${raw}/decision`} className="space-y-3">
              <input type="hidden" name="outcome" value="accepted" />
              <input type="hidden" name="key" value={key} />
              <fieldset>
                <legend className="font-medium">Aceptar la oferta</legend>
                <label className="mt-2 flex items-start gap-2 text-sm">
                  <input type="checkbox" required className="mt-1 h-5 w-5" />
                  <span>Confirmo que acepto la oferta {s.reference} por {money(s.totalCents)}, con las condiciones indicadas.</span>
                </label>
              </fieldset>
              <button className={`${btn} bg-green-700 text-white`}>Aceptar oferta</button>
            </form>
            <form method="post" action={`/api/oferta/${raw}/decision`} className="space-y-3">
              <input type="hidden" name="outcome" value="rejected" />
              <input type="hidden" name="key" value={key} />
              <fieldset>
                <legend className="font-medium">Rechazar la oferta</legend>
                <label htmlFor="motivo" className="mt-2 block text-sm">Motivo (obligatorio)</label>
                <textarea id="motivo" name="reason" required minLength={3} maxLength={500} rows={3} className="mt-1 w-full rounded border border-gray-400 p-2 text-sm" />
              </fieldset>
              <button className={`${btn} border border-gray-500`}>Rechazar oferta</button>
            </form>
          </div>
        </section>
      )}

      <footer className="text-xs text-gray-600">
        <p>Huella SHA-256 de la oferta emitida: <code className="break-all">{view.snapshotHash}</code></p>
        <Contact />
      </footer>
    </article>
  );
}
