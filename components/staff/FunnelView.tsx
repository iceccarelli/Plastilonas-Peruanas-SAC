import { MIN_SAMPLE, rate, WINDOWS, type Funnel } from '@/lib/funnel';

const money = (cents: number, cur: string) => `${cur === 'PEN' ? 'S/' : 'US$'} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number, d: number) => {
  const r = rate(n, d);
  return r === null ? <span title={`Muestra menor a ${MIN_SAMPLE}: no se calcula tasa`}>n&lt;{MIN_SAMPLE}</span> : <>{r}%</>;
};

const CHANNEL: Record<string, string> = {
  ai_assistant: 'Asistentes de IA', organic_search: 'Búsqueda orgánica', social: 'Redes sociales', paid: 'Pago',
  campaign: 'Campaña (utm)', referral: 'Referido', direct: 'Directo', sin_dato: 'Sin dato (sin consentimiento o sin almacenamiento)',
};

/** Vista del embudo. Solo muestra lo medido; lo que no se puede medir lo dice. */
export default function FunnelView({ f, days }: { f: Funnel; days: number }) {
  const th = 'py-2 pr-3 text-left font-medium';
  const td = 'py-1 pr-3';
  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-3 text-sm" aria-label="Ventana de tiempo">
        {WINDOWS.map((w) => (
          <a key={w} className={w === days ? 'font-semibold underline' : 'underline'} aria-current={w === days ? 'page' : undefined} href={`/staff/embudo?dias=${w}`}>
            Últimos {w} días
          </a>
        ))}
      </nav>
      <p className="max-w-3xl text-sm text-gray-700">
        Cohorte: solicitudes <b>creadas</b> en la ventana; los resultados se cuentan como están hoy. El canal es la pista de primer contacto que declaró el
        navegador al enviar (no una certeza). «Inicio del formulario» no aparece aquí: es un evento del navegador que vive en el proveedor de analítica, solo con
        consentimiento. Los importes se suman por moneda, sin convertir.
      </p>

      <section aria-labelledby="etapas">
        <h2 id="etapas" className="text-lg font-semibold">Etapas</h2>
        <div className="mt-2 overflow-x-auto">
        <table className="w-full max-w-3xl min-w-[26rem] text-sm">
          <caption className="sr-only">Etapas del embudo comercial</caption>
          <thead><tr><th scope="col" className={th}>Etapa</th><th scope="col" className={th}>Cantidad</th><th scope="col" className={th}>% de la etapa anterior</th></tr></thead>
          <tbody>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Solicitudes aceptadas (RFQ)</th><td>{f.leads.accepted}</td><td>—</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Calificadas</th><td>{f.leads.qualified}</td><td>{pct(f.leads.qualified, f.leads.accepted)}</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Con cotización emitida</th><td>{f.leads.quoted}</td><td>{pct(f.leads.quoted, f.leads.qualified)}</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Cotización enviada al cliente (aceptada por el proveedor)</th><td>{f.quotes.sentToProvider}</td><td>{pct(f.quotes.sentToProvider, f.quotes.issued)}</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Ganadas</th><td>{f.leads.won}</td><td>{pct(f.leads.won, f.leads.quoted)}</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Perdidas</th><td>{f.leads.lost}</td><td>{pct(f.leads.lost, f.leads.accepted)}</td></tr>
            <tr className="border-t"><th scope="row" className={td + ' font-normal'}>Abiertas</th><td>{f.leads.open}</td><td>—</td></tr>
          </tbody>
        </table>
        </div>
      </section>

      <section aria-labelledby="cot">
        <h2 id="cot" className="text-lg font-semibold">Cotizaciones</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Emitidas: <b>{f.quotes.issued}</b> · reemplazadas: {f.quotes.superseded}</li>
          <li>Enviadas al proveedor: {f.quotes.sentToProvider} · <b>confirmadas por el proveedor</b>: {f.quotes.confirmedByProvider}</li>
          <li className={f.quotes.notDelivered > 0 ? 'font-semibold text-red-800' : ''}>Vigentes SIN entregar (en cola, bloqueadas, fallidas o muertas): {f.quotes.notDelivered}</li>
          <li>Aceptadas: {f.quotes.accepted} · rechazadas: {f.quotes.rejected} · decididas por el enlace del cliente: {f.quotes.decidedByCustomerLink}</li>
          <li>Mediana de días hasta la decisión: {f.quotes.medianDaysToDecision === null ? 'sin decisiones aún' : f.quotes.medianDaysToDecision}</li>
        </ul>
      </section>

      <section aria-labelledby="ing">
        <h2 id="ing" className="text-lg font-semibold">Ingresos ganados (ofertas aceptadas)</h2>
        {f.revenue.length === 0 ? <p className="mt-2 text-sm">Ninguna oferta aceptada en esta cohorte.</p> : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {f.revenue.map((r) => <li key={r.currency}>{money(r.wonCents, r.currency)} en {r.wonOffers} oferta(s)</li>)}
          </ul>
        )}
      </section>

      <section aria-labelledby="resp">
        <h2 id="resp" className="text-lg font-semibold">Tiempo de primera respuesta del equipo</h2>
        <p className="mt-2 text-sm">
          {f.responseTime.sample === 0 ? 'Sin solicitudes atendidas aún.' : (
            <>Mediana: <b>{f.responseTime.medianMinutes} min</b> · p90: {f.responseTime.p90Minutes} min (sobre {f.responseTime.sample} atendidas).</>
          )}{' '}
          <span className={f.responseTime.untouchedOver24h > 0 ? 'font-semibold text-red-800' : ''}>Sin tocar hace más de 24 h: {f.responseTime.untouchedOver24h}.</span>
        </p>
      </section>

      <section aria-labelledby="canal">
        <h2 id="canal" className="text-lg font-semibold">Por canal de primer contacto</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Solicitudes y resultados por canal</caption>
            <thead><tr><th scope="col" className={th}>Canal</th><th scope="col" className={th}>RFQ</th><th scope="col" className={th}>Calificadas</th><th scope="col" className={th}>Cotizadas</th><th scope="col" className={th}>Ganadas</th><th scope="col" className={th}>Perdidas</th><th scope="col" className={th}>RFQ→ganada</th></tr></thead>
            <tbody>
              {f.byChannel.map((c) => (
                <tr key={c.channel} className="border-t">
                  <th scope="row" className={td + ' font-normal'}>{CHANNEL[c.channel] ?? c.channel}</th>
                  <td>{c.accepted}</td><td>{c.qualified}</td><td>{c.quoted}</td><td>{c.won}</td><td>{c.lost}</td><td>{pct(c.won, c.accepted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="prod">
        <h2 id="prod" className="text-lg font-semibold">Por producto</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <caption className="sr-only">Solicitudes por producto</caption>
            <thead><tr><th scope="col" className={th}>Producto</th><th scope="col" className={th}>RFQ</th><th scope="col" className={th}>Cotizadas</th><th scope="col" className={th}>Ganadas</th></tr></thead>
            <tbody>{f.byProduct.map((p) => <tr key={p.product} className="border-t"><th scope="row" className={td + ' font-normal'}>{p.product}</th><td>{p.accepted}</td><td>{p.quoted}</td><td>{p.won}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="land">
        <h2 id="land" className="text-lg font-semibold">Por página de entrada</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <caption className="sr-only">Solicitudes por página de entrada</caption>
            <thead><tr><th scope="col" className={th}>Página</th><th scope="col" className={th}>RFQ</th><th scope="col" className={th}>Ganadas</th></tr></thead>
            <tbody>{f.byLanding.map((p) => <tr key={p.landing} className="border-t"><th scope="row" className={td + ' font-normal'}>{p.landing}</th><td>{p.accepted}</td><td>{p.won}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="lost">
        <h2 id="lost" className="text-lg font-semibold">Motivos de pérdida</h2>
        {f.lostReasons.length === 0 ? <p className="mt-2 text-sm">Sin pérdidas con motivo en esta cohorte.</p> : (
          <ul className="mt-2 list-disc pl-5 text-sm">{f.lostReasons.map((r) => <li key={r.reason}>{r.reason} — {r.n}</li>)}</ul>
        )}
      </section>
    </div>
  );
}
