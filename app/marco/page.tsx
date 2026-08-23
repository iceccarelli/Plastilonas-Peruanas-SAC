import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  pillars,
  totalCriteria,
  FRAMEWORK_VERSION,
  FRAMEWORK_UPDATED,
} from '@/lib/framework';
import { articleBySlug } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

/**
 * Marco de Especificación Plastilonas — el documento público.
 *
 * Es el peldaño que ningún competidor del rubro ocupa: no vende un producto,
 * publica el criterio con el que se juzga cualquier proyecto del rubro. Quien
 * adopta el vocabulario de un marco termina comparando dentro de él.
 *
 * Sigue siendo honesto porque es útil aunque el proyecto se compre a otro: los
 * criterios describen decisiones de ingeniería, no ventajas nuestras.
 */

const URL = `${SITE.url}/marco`;
const TITLE = 'Marco de Especificación: 6 pilares y 27 criterios';
const DESCRIPTION = `${totalCriteria()} criterios verificables para definir un proyecto antes de cotizarlo: compatibilidad, cargas, exposición, ejecución, documentación y operación.`;

const FAQS = [
  {
    q: '¿Qué es el Marco de Especificación Plastilonas?',
    a: `Un conjunto público de ${totalCriteria()} criterios, agrupados en seis pilares, para definir un proyecto de solución textil o geosintética antes de pedir precio. Cada criterio indica qué decide técnicamente y qué ocurre en obra cuando el dato no existe.`,
  },
  {
    q: '¿Sirve si finalmente compro a otro proveedor?',
    a: 'Sí, y está escrito para que así sea. Los criterios describen decisiones de ingeniería, no ventajas comerciales nuestras. Un proyecto bien definido recibe cotizaciones comparables entre sí, que es exactamente lo que un comprador técnico necesita.',
  },
  {
    q: '¿De dónde salen los criterios?',
    a: 'De los modos de falla documentados en nuestras guías técnicas, cada una con su fuente citada: la Norma E.020 para cargas de viento, ISO 21898 y el requisito de APM Terminals Callao para big bags, las prácticas de ensayo de costura para geomembranas, y el reglamento de seguridad minera para ventilación.',
  },
  {
    q: '¿La autoevaluación puntúa a los proveedores?',
    a: 'No. Puntúa cuán definido está su proyecto, es decir, cuánta información existe para especificar sin adivinar. No compara marcas ni productos.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/marco' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'article',
  },
};

export default function MarcoPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:marco-pilares');
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="framework" slug="marco" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Marco de Especificación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Pilares del Marco de Especificación',
            items: pillars.map((p) => ({ name: p.nombre, url: `${URL}#${p.id}` })),
          }),
          faqSchema(FAQS, URL),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <span className="text-gray-700">Marco de Especificación</span>
      </nav>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#059669]">
        <ShieldCheck className="h-3.5 w-3.5" /> Versión {FRAMEWORK_VERSION} · {FRAMEWORK_UPDATED}
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        Marco de Especificación: seis pilares para definir un proyecto antes de cotizarlo
      </h1>
      {/* Diagrama del registro. Degrada solo: sin archivo no se pinta nada,
          y en cuanto se publique aparece sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 768px) 860px, 100vw" />}


      {/* El marco solo cambia la posición de quien lo publica si CIRCULA, y los
          estándares circulan en PDF: se adjuntan a un requerimiento y se usan
          para evaluar tres propuestas a la vez. */}
      <a
        href="/marco/marco.pdf"
        className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar el Marco completo en PDF
      </a>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        <p>
          Los proyectos de esta industria rara vez fallan por el material. Fallan por lo
          que nadie definió: la densidad del contenido, la succión en sotavento, la
          holgura térmica, quién firma la recepción de subrasante, qué certificado exige
          el terminal. El material se lleva la culpa mucho después.
        </p>
        <p>
          Este marco reúne {totalCriteria()} criterios en seis pilares. Cada uno indica
          qué decide técnicamente y qué ocurre en obra cuando el dato no existe, con la
          guía que lo documenta. Está escrito para ser útil aunque el proyecto se compre
          a otro proveedor — un proyecto bien definido recibe cotizaciones comparables,
          y eso es lo que necesita un comprador técnico.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-7 py-3.5 font-semibold text-white hover:bg-[#059669]"
        >
          Evaluar mi proyecto <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-7 py-3.5 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
        >
          Ver las guías que lo respaldan
        </Link>
      </div>

      {/* Índice de pilares */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Los seis pilares
        </h2>
        <ol className="space-y-2 text-sm">
          {pillars.map((p, i) => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {p.nombre} — <span className="text-gray-500">{p.resumen}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {pillars.map((p, i) => (
        <section key={p.id} id={p.id} className="mb-14 scroll-mt-24">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {i + 1}. {p.nombre}
          </h2>
          <p className="mb-6 text-gray-700">{p.intro}</p>

          <div className="space-y-5">
            {p.criterios.map((c) => {
              const guia = c.evidencia ? articleBySlug(c.evidencia) : undefined;
              return (
                <div key={c.id} className="rounded-2xl border border-gray-100 p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold text-[#0A2540]">{c.pregunta}</h3>
                    {c.peso === 2 && (
                      <span className="shrink-0 rounded-full bg-[#059669]/10 px-3 py-1 text-xs font-semibold text-[#059669]">
                        Crítico
                      </span>
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-600">Qué decide</dt>
                      <dd className="text-gray-700">{c.porQue}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">Si el dato no existe</dt>
                      <dd className="text-gray-700">{c.riesgo}</dd>
                    </div>
                  </dl>
                  {guia && (
                    <Link
                      href={`/recursos/${guia.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
                    >
                      Guía que lo documenta: {guia.metaTitle} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Evalúe su proyecto contra los {totalCriteria()} criterios
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Toma unos minutos, no pide datos personales y genera un brief técnico
          descargable con los criterios que le faltan por cerrar.
        </p>
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
        >
          Comenzar la evaluación <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
