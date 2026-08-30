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

/**
 * Página de cuña comercial (ver lib/cunas.ts). Server component compartido
 * por /big-bags, /lonas-camiones y /ventilacion-minera: un solo template, tres
 * hubs, cero divergencia. El H1 tiene la forma de la consulta; el resto es el
 * embudo completo — checklist, fichas hijas, honestidad hacemos/no afirmamos,
 * FAQ (visible + FAQPage), guía de biblioteca y CTA doble.
 */
export default function CunaHub({ cuna }: { cuna: Cuna }) {
  const url = `${SITE.url}/${cuna.slug}`;
  const hijos = cuna.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const guia = guides.find((g) => g.slug === cuna.guiaSlug);
  const industria = INDUSTRIAS.find((i) => i.slug === cuna.industriaSlug);
  const calculadora = cuna.calculadoraSlug
    ? calculadoras.find((c) => c.slug === cuna.calculadoraSlug)
    : undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <JsonLd
        data={[
          webPageSchema({ url, name: cuna.titulo, description: cuna.descripcion }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: cuna.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(cuna.faqs, url),
        ]}
      />

      <div className="max-w-3xl">
        <div className="text-xs tracking-[2px] text-[#047857] font-semibold uppercase mb-3">
          Fabricación propia en Chorrillos · RFQ con ficha técnica
        </div>
        <h1 className="text-3xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight mb-6">
          {cuna.h1}
        </h1>
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

      <div className="mt-12">
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
