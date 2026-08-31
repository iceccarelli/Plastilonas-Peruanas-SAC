import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { Cuna } from '@/lib/cunas';
import { products, sourcingLabels } from '@/lib/products';
import { guides } from '@/lib/guides';
import { INDUSTRIAS } from '@/lib/industrias';
import { calculadoras } from '@/lib/calculadoras';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import WhatsAppLink from '@/components/WhatsAppLink';
import DatosParaCotizar from '@/components/DatosParaCotizar';
import FotoReferencial from '@/components/FotoReferencial';
import CostoEnVivo from '@/components/CostoEnVivo';
import { construirComparativa } from '@/lib/comparativa';
import { respuestaDirectaCuna } from '@/lib/respuesta-directa';
import { ACTUALIZADO } from '@/lib/sitemaps';
import { RUTA_ES } from '@/lib/fabricar-o-importar';

/**
 * Página de cuña comercial (ver lib/cunas.ts). Server component compartido
 * por /big-bags, /lonas-camiones y /ventilacion-minera: un solo template, tres
 * hubs, cero divergencia. El H1 tiene la forma de la consulta; el resto es el
 * embudo completo — checklist, fichas hijas, honestidad hacemos/no afirmamos,
 * FAQ (visible + FAQPage), guía de biblioteca y CTA doble.
 */
export default async function CunaHub({ cuna }: { cuna: Cuna }) {
  const url = `${SITE.url}/${cuna.slug}`;
  const hijos = cuna.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const guia = guides.find((g) => g.slug === cuna.guiaSlug);
  const industria = INDUSTRIAS.find((i) => i.slug === cuna.industriaSlug);
  const calculadora = cuna.calculadoraSlug
    ? calculadoras.find((c) => c.slug === cuna.calculadoraSlug)
    : undefined;
  const respuestaDirecta = respuestaDirectaCuna(cuna, hijos);
  // Matriz honesta: una fila solo si dos o más líneas declaran esa
  // especificación; los huecos dicen «No declarado» (lib/comparativa.ts).
  const comparativa = hijos.length >= 2 ? construirComparativa(hijos) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: cuna.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(cuna.faqs, url),
          /**
           * Service de alcance NACIONAL. No se usa `serviceSchema` de
           * lib/schema.ts porque ese ancla `areaServed` a una City —correcto
           * para /local/[ciudad], falso aquí: estas tres páginas se despachan
           * a todo el país desde una sola planta. El canal declarado es el
           * que existe de verdad: cotización, no compra en línea.
           */
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${url}#service`,
            name: cuna.titulo,
            description: cuna.descripcion,
            url,
            provider: { '@id': `${SITE.url}/#business` },
            areaServed: { '@type': 'Country', name: 'Perú' },
            serviceType: hijos.map((p) => p.name),
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: `${SITE.url}/cotizacion`,
              availableLanguage: ['es-PE'],
            },
          },
        ]}
      />

      <div className="max-w-3xl">
        <div className="text-xs tracking-[2px] text-[#047857] font-semibold uppercase mb-3">
          Fabricación propia en Chorrillos · RFQ con ficha técnica
        </div>
        <h1 className="text-3xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight mb-6">
          {cuna.h1}
        </h1>
        {/* RAMPA. El 44 % de las citas de los motores de respuesta sale del
            primer 30 % del contenido, y lo que se recupera son bloques
            autocontenidos y densos en entidades. Este es ese bloque, y está
            compuesto de campos reales (lib/respuesta-directa.ts). */}
        <p className="respuesta-directa text-[15px] leading-relaxed text-[#0A2540] bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mb-6">
          {respuestaDirecta}
        </p>

        {cuna.intro.map((p) => (
          <p key={p.slice(0, 24)} className="text-lg text-gray-600 leading-relaxed mb-4">
            {p}
          </p>
        ))}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            href={`/cotizacion?producto=${encodeURIComponent(hijos[0]?.slug ?? '')}`}
            className="inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-8 py-3.5 rounded-2xl font-semibold transition-colors"
          >
            Cotizar ahora <ArrowRight className="w-4 h-4" />
          </Link>
          <WhatsAppLink
            context={`cuna:${cuna.slug}`}
            message={cuna.whatsapp}
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-[#059669] text-[#047857] px-8 py-3.5 rounded-2xl font-medium transition-colors"
          >
            Cotizar por WhatsApp
          </WhatsAppLink>
        </div>
      </div>

      <FotoReferencial src={cuna.foto.src} alt={cuna.foto.alt} className="mt-10 max-w-4xl" />

      {/* Checklist de especificación */}
      <section className="mt-14">
        <h2 className="font-semibold tracking-tight text-2xl mb-2">Qué debe traer su RFQ</h2>
        <p className="text-gray-600 mb-6 max-w-2xl">
          Con estos datos la primera respuesta ya es una cotización con ficha técnica, no una lista
          de preguntas.
        </p>
        <ol className="grid gap-3 sm:grid-cols-2 max-w-4xl">
          {cuna.checklist.map((c, i) => (
            <li key={c.dato} className="flex gap-3 rounded-2xl border border-gray-100 p-4">
              <span className="font-mono text-[#059669]">{i + 1}.</span>
              <span>
                <span className="font-medium text-[#0A2540]">{c.dato}</span>
                <span className="block text-sm text-gray-500">{c.detalle}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Fichas hijas */}
      <section className="mt-14">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Las líneas de este frente</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hijos.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors"
            >
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                {p.name}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                {p.shortDescription}
              </span>
              {p.sourcing && (
                <span className="mt-3 inline-block rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                  {sourcingLabels[p.sourcing] ?? p.sourcing}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* TABLA COMPARATIVA. Las tablas son de lo que más se recupera y se cita,
          y aquí además es la pregunta real del comprador: en qué se diferencian
          estas líneas. Se construye con la misma matriz que /comparar. */}
      {comparativa && comparativa.filas.length > 0 && (
        <section className="mt-14">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            ¿En qué se diferencian estas líneas?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Especificación declarada por cada ficha. Donde una línea no la declara dice «No
            declarado»: no se rellena ni se infiere del vecino.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Comparación de especificaciones de {hijos.length} líneas de {cuna.titulo}
              </caption>
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">
                    Especificación
                  </th>
                  {hijos.map((p) => (
                    <th key={p.slug} scope="col" className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                      <Link href={`/productos/${p.slug}`} className="hover:text-[#059669]">
                        {p.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparativa.filas.map((label) => (
                  <tr key={label} className="border-b border-gray-100 last:border-none align-top">
                    <th scope="row" className="py-3 pr-6 text-left font-medium text-gray-600">
                      {label}
                    </th>
                    {hijos.map((p) => (
                      <td key={p.slug} className="py-3 pr-6 text-[#0A2540]">
                        {comparativa.valor(p.slug, label)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Señal de costo en vivo, donde se decide la compra. */}
      <CostoEnVivo codigos={cuna.indicadores} />

      {/* Honestidad: hacemos / no afirmamos */}
      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7">
          <h2 className="font-semibold tracking-tight text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" /> Qué hacemos nosotros
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {cuna.queHacemos.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-2">
                <span className="text-[#059669]">→</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-gray-50/60 p-7">
          <h2 className="font-semibold tracking-tight text-xl mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-400" /> Qué no afirmamos
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {cuna.queNoAfirmamos.map((t) => (
              <li key={t.slice(0, 24)} className="flex gap-2">
                <span className="text-gray-400">—</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Profundizar: guía, industria, calculadora */}
      <section className="mt-14">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Para especificar con criterio</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guia && (
            <Link href={`/biblioteca/${guia.slug}`} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
              <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Guía técnica</span>
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{guia.title}</span>
            </Link>
          )}
          {industria && (
            <Link href={`/industria/${industria.slug}`} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
              <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Industria</span>
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{industria.nombre}</span>
            </Link>
          )}
          {calculadora && (
            <Link href={`/calculadoras/${calculadora.slug}`} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
              <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Calculadora</span>
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{calculadora.titulo}</span>
            </Link>
          )}
          {/* La decisión que se toma ANTES de esta página. Va aquí porque el
              lector que llegó a especificar todavía puede estar comparando
              contra un contenedor importado, y esa tabla la publicamos entera. */}
          <Link href={RUTA_ES} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
            <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Decisión de abastecimiento</span>
            <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
              ¿Fabricar en Lima o importar?
            </span>
          </Link>
        </div>
      </section>

      {/* FAQ visible = FAQPage emitido arriba */}
      <section className="mt-14 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes</h2>
        <dl className="space-y-6 max-w-3xl">
          {cuna.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-sm text-gray-500">
        Página revisada el{' '}
        <time dateTime={ACTUALIZADO.paginas}>{ACTUALIZADO.paginas}</time>. Las especificaciones
        provienen del catálogo publicado; los indicadores de costo, del BCRP, con la fecha de cada
        lectura a la vista.
      </p>

      <div className="mt-8">
        <DatosParaCotizar />
      </div>

      {/* CTA final */}
      <div className="mt-14 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h2 className="text-3xl tracking-tight font-semibold mb-3">Cotice con ficha técnica</h2>
        <p className="text-white/80 mb-7 max-w-md mx-auto">
          Diga producto, medidas y ciudad. Respondemos en horario comercial con especificación, no
          con evasivas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/cotizacion?producto=${encodeURIComponent(hijos[0]?.slug ?? '')}`}
            className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold"
          >
            Solicitar cotización
          </Link>
          <WhatsAppLink
            context={`cuna-final:${cuna.slug}`}
            message={cuna.whatsapp}
            className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium"
          >
            WhatsApp comercial
          </WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
