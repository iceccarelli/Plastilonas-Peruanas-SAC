import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { CunaEn } from '@/lib/cunas-en';
import { cunaEsDeEn } from '@/lib/cunas-en';
import { products, sourcingLabelsEn } from '@/lib/products';
import { SITE, HORARIO, TELEFONOS } from '@/lib/site';
import { INCOTERMS_SALIDA } from '@/lib/exportacion';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import WhatsAppLink from '@/components/WhatsAppLink';
import FotoReferencial from '@/components/FotoReferencial';
import CostoEnVivo from '@/components/CostoEnVivo';
import { ACTUALIZADO } from '@/lib/sitemaps';
import { RUTA_EN } from '@/lib/fabricar-o-importar';

/**
 * PÁGINA DE CUÑA EN INGLÉS (ver lib/cunas-en.ts).
 *
 * Es la gemela de components/CunaHub.tsx, no su copia traducida a mano: el
 * contenido viene de `CUNAS_EN` y los datos duros —productos hijos, foto,
 * indicadores del BCRP— se leen de la cuña española por `cunaEsDeEn`. Así la
 * página inglesa no puede afirmar que agrupa una línea que la española no
 * agrupa, ni mostrar un indicador distinto para el mismo frente.
 *
 * TRES DIFERENCIAS DELIBERADAS CON LA PLANTILLA ESPAÑOLA:
 *
 * 1. NO lleva la tabla comparativa. Las etiquetas de esa matriz son las
 *    especificaciones declaradas en el catálogo, que están en español. Una
 *    tabla mitad inglesa y mitad española es peor que ninguna tabla: parece
 *    un descuido justo en el bloque que más se cita. En su lugar va la tabla
 *    de origen (fabricación propia / importación / suministro), que es
 *    íntegramente traducible y es LA pregunta del comprador extranjero.
 *
 * 2. Lleva los Incoterms. La cuña española no los necesita —se despacha
 *    dentro del Perú—; la inglesa existe precisamente para carga que cruza
 *    una frontera, y el Incoterm se acuerda antes que el precio.
 *
 * 3. Cada enlace al catálogo avisa de que la ficha está en español ANTES del
 *    clic. Es el defecto que esta etapa vino a cerrar; no se repite hacia
 *    dentro.
 *
 * El `Service` declara `availableLanguage: ['en', 'es-PE']` y su canal es
 * /en/rfq: el formulario que sí contesta en inglés (etapa 11).
 */
export default async function CunaHubEn({ cuna }: { cuna: CunaEn }) {
  const es = cunaEsDeEn(cuna);
  const url = `${SITE.url}/en/${cuna.slug}`;
  const hijos = es.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const propias = hijos.filter((p) => p.sourcing === 'fabricacion_propia').length;
  const origen =
    propias === hijos.length
      ? `all ${hijos.length} are cut and sewn at our own plant in Chorrillos, Lima, Peru`
      : `${propias} of ${hijos.length} are cut and sewn at our own plant in Chorrillos, Lima, Peru, ` +
        `and the ${hijos.length - propias === 1 ? 'remaining one is' : 'rest are'} supply declared on its product page`;

  const respuestaDirecta =
    `${cuna.titulo}: ${origen}. ${SITE.legalName}, Peruvian tax ID (RUC) ${SITE.ruc}, has ` +
    `manufactured industrial textiles in Peru since ${SITE.foundingYear}. Quotation is against ` +
    `specification — ${cuna.checklist.map((c) => c.dato.toLowerCase()).join(', ')} — and there is ` +
    `no price list on made-to-measure lines. Export terms quoted are ` +
    `${INCOTERMS_SALIDA.map((i) => i.codigo).join(', ')} from Lima and the Port of Callao. ` +
    `Replies arrive with a technical datasheet within business hours (${HORARIO.corto}, Lima time).`;

  const rfq = `/en/rfq?product=${encodeURIComponent(hijos[0]?.slug ?? '')}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: cuna.titulo,
            description: respuestaDirecta,
            speakable: ['.respuesta-directa'],
          }),
          breadcrumbSchema(
            [
              { name: 'Home', url: `${SITE.url}/` },
              { name: 'English', url: `${SITE.url}/en` },
              { name: cuna.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(cuna.faqs, url),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${url}#service`,
            name: cuna.titulo,
            description: cuna.descripcion,
            url,
            provider: { '@id': `${SITE.url}/#business` },
            areaServed: { '@type': 'Country', name: 'Peru' },
            serviceType: hijos.map((p) => p.name),
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: `${SITE.url}/en/rfq`,
              availableLanguage: ['en', 'es-PE'],
            },
          },
        ]}
      />

      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/en" className="hover:text-[#059669]">English</Link>
        {' / '}
        <span className="text-gray-700 dark:text-gray-300">{cuna.titulo}</span>
      </nav>

      <div className="max-w-3xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#047857]">
          Manufactured in Lima, Peru · RFQ answered in English
        </div>
        <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tighter text-[#0A2540] dark:text-inherit md:text-5xl">
          {cuna.h1}
        </h1>

        {/* Bloque citable, arriba. Compuesto de campos reales, igual que su
            equivalente en español: nada aquí está escrito a mano dos veces. */}
        <p className="respuesta-directa mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-[15px] leading-relaxed text-[#0A2540]">
          {respuestaDirecta}
        </p>

        {cuna.intro.map((p) => (
          <p key={p.slice(0, 24)} className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {p}
          </p>
        ))}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={rfq}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#059669]"
          >
            Request a quotation <ArrowRight className="h-4 w-4" />
          </Link>
          <WhatsAppLink
            context={`cuna-en:${cuna.slug}`}
            message={cuna.whatsapp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-8 py-3.5 font-medium text-[#047857] transition-colors hover:border-[#059669]"
          >
            WhatsApp sales
          </WhatsAppLink>
        </div>
      </div>

      <FotoReferencial src={es.foto.src} alt={es.foto.alt} idioma="en" className="mt-10 max-w-4xl" />

      {/* Checklist de especificación */}
      <section className="mt-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">What your RFQ should contain</h2>
        <p className="mb-6 max-w-2xl text-gray-600 dark:text-gray-400">
          With these, the first reply is already a quotation with a datasheet rather than a list of
          questions.
        </p>
        <ol className="grid max-w-4xl gap-3 sm:grid-cols-2">
          {cuna.checklist.map((c, i) => (
            <li key={c.dato} className="flex gap-3 rounded-2xl border border-gray-100 p-4 dark:border-[var(--border)]">
              <span className="font-mono text-[#059669]">{i + 1}.</span>
              <span>
                <span className="font-medium text-[#0A2540] dark:text-inherit">{c.dato}</span>
                <span className="block text-sm text-gray-500">{c.detalle}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* TABLA DE ORIGEN. La pregunta que abre toda auditoría de proveedor:
          ¿esto lo fabrica usted o lo compra? Se responde línea por línea, con
          el mismo campo `sourcing` que gobierna la ficha en español. */}
      <section className="mt-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">
          Which of these do we manufacture ourselves?
        </h2>
        <p className="mb-6 max-w-2xl text-gray-600 dark:text-gray-400">
          Line by line, from the same catalogue field the Spanish product pages use. A supplier that
          blurs manufacturing and supply is a supplier you cannot audit.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Sourcing mode declared for each line of {cuna.titulo}
            </caption>
            <thead>
              <tr className="border-b border-gray-200 dark:border-[var(--border)]">
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">Line</th>
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">Sourcing</th>
                <th scope="col" className="py-3 text-left font-medium text-gray-500">Datasheet</th>
              </tr>
            </thead>
            <tbody>
              {hijos.map((p) => (
                <tr key={p.slug} className="border-b border-gray-100 last:border-none dark:border-[var(--border)]">
                  <th scope="row" className="py-3 pr-6 text-left font-medium text-[#0A2540] dark:text-inherit">
                    {p.name}
                  </th>
                  <td className="py-3 pr-6 text-gray-600 dark:text-gray-400">
                    {p.sourcing ? (sourcingLabelsEn[p.sourcing] ?? p.sourcing) : 'Not declared'}
                  </td>
                  <td className="py-3">
                    <Link href={`/productos/${p.slug}`} className="text-[#047857] hover:underline">
                      Open datasheet (in Spanish) →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incoterms: la cuña española no los necesita, ésta existe para carga
          que cruza una frontera. */}
      <section className="mt-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">Where the cargo changes hands</h2>
        <p className="mb-6 max-w-2xl text-gray-600 dark:text-gray-400">
          The Incoterm decides where responsibility for the cargo passes to you, so it is agreed
          before the price, not after. Each shipment is still assessed by tariff heading, minimum
          volume and destination.
        </p>
        <dl className="grid gap-3 sm:grid-cols-3">
          {INCOTERMS_SALIDA.map((i) => (
            <div key={i.codigo} className="rounded-2xl border border-gray-100 p-4 dark:border-[var(--border)]">
              <dt className="font-semibold text-[#0A2540] dark:text-inherit">
                {i.codigo} — {i.punto}
              </dt>
              <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">{i.nota}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Señal de costo en vivo, en el idioma y el formato numérico del lector. */}
      <CostoEnVivo codigos={es.indicadores} idioma="en" />

      {/* Honestidad: hacemos / no afirmamos */}
      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <CheckCircle2 className="h-5 w-5 text-[#059669]" /> What we do ourselves
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {cuna.queHacemos.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-2">
                <span className="text-[#059669]">→</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-gray-50/60 p-7 dark:border-[var(--border)] dark:bg-white/5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <XCircle className="h-5 w-5 text-gray-400" /> What we do not claim
          </h2>
          <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            {cuna.queNoAfirmamos.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-2">
                <span className="text-gray-400">—</span> {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            The same limits are published in Spanish at{' '}
            <Link href="/confianza" className="text-[#047857] hover:underline">/confianza</Link>.
          </p>
        </div>
      </section>

      {/* Rutas hacia el resto del inglés que sí existe */}
      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Before you send the RFQ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href={RUTA_EN}
            className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40 dark:border-[var(--border)]"
          >
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Sourcing decision</span>
            <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669] dark:text-inherit">
              Manufacture in Peru, or import?
            </span>
            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">
              Ten criteria including the three importing wins, and what an import really costs.
            </span>
          </Link>
          <Link
            href="/en/sourcing-from-peru"
            className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40 dark:border-[var(--border)]"
          >
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Procurement brief</span>
            <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669] dark:text-inherit">
              Sourcing industrial textiles from Peru
            </span>
            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">
              Identity and how to verify it, Incoterms, markets, and what we do not claim.
            </span>
          </Link>
          <Link
            href={`/${es.slug}`}
            className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40 dark:border-[var(--border)]"
          >
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Same page, in Spanish</span>
            <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669] dark:text-inherit">
              {es.titulo}
            </span>
            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">
              With the full comparison table, the technical guide and the local calculator.
            </span>
          </Link>
        </div>
      </section>

      {/* FAQ visible = FAQPage emitido arriba */}
      <section className="mt-14 border-t pt-10 dark:border-[var(--border)]">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Frequently asked</h2>
        <dl className="max-w-3xl space-y-6">
          {cuna.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540] dark:text-inherit">{f.q}</dt>
              <dd className="mt-1 text-gray-700 dark:text-gray-300">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-sm text-gray-500">
        Page reviewed on <time dateTime={ACTUALIZADO.paginas}>{ACTUALIZADO.paginas}</time>.
        Specifications come from the published catalogue; cost indicators come from the Central
        Reserve Bank of Peru, each with the date of its own reading.
      </p>

      {/* CTA final */}
      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">Send the four data points</h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Product, dimensions or quantity, destination city or port, and the date you need it. We
          reply within business hours ({HORARIO.corto}, Lima time) with a datasheet, or with the
          questions still missing.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={rfq}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            RFQ form (in English)
          </Link>
          <WhatsAppLink
            context={`cuna-en-final:${cuna.slug}`}
            message={cuna.whatsapp}
            className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            WhatsApp sales
          </WhatsAppLink>
        </div>
        <p className="mt-5 text-sm text-white/60">
          {SITE.email} · {TELEFONOS.central.display} · {SITE.legalName} · RUC {SITE.ruc} ·
          Chorrillos, Lima, Peru
        </p>
      </div>
    </div>
  );
}
