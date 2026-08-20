import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { informes, informeBySlug, fuenteDe } from '@/lib/informes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import { numeroConSigno } from '@/lib/format';
import { articleSchema, breadcrumbSchema, datasetSchema, webPageSchema } from '@/lib/schema';

/**
 * Página de informe.
 *
 * Tres separaciones visuales que son decisiones editoriales, no estéticas:
 *
 *  1. El indicador muestra SIEMPRE su periodo y su organismo junto al número.
 *     Una cifra sin periodo no es una cifra, es una impresión.
 *  2. La lectura técnica va en un bloque etiquetado "Lo que implica", separado
 *     del dato. El lector tiene derecho a distinguir lo que dice MINEM de lo
 *     que decimos nosotros.
 *  3. Las limitaciones tienen su propia sección, con el mismo peso visual que
 *     los hallazgos. Un estudio que esconde sus límites es publicidad.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return informes.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = informeBySlug(slug);
  if (!i) return {};
  const url = `${SITE.url}/informes/${slug}`;
  return {
    title: i.metaTitle,
    description: i.metaDescription,
    alternates: { canonical: `/informes/${slug}` },
    openGraph: {
      title: `${i.titulo} | ${SITE.name}`,
      description: i.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: i.fecha,
    },
  };
}

export default async function InformePage({ params }: Props) {
  const { slug } = await params;
  const i = informeBySlug(slug);
  if (!i) notFound();

  const url = `${SITE.url}/informes/${slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="informe" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: i.titulo,
            description: i.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: i.titulo,
            description: i.metaDescription,
            datePublished: i.fecha,
            dateModified: i.fecha,
            section: 'Informes del sector',
            articleType: 'Article',
            citations: i.fuentes.map((f) => ({
              label: `${f.organismo} — ${f.titulo}`,
              url: f.url,
            })),
          }),
          // Dataset: declara que el informe publica datos con procedencia, no
          // solo prosa. Es lo que permite a un agente citar la cifra y su fuente.
          datasetSchema({
            url,
            name: i.titulo,
            description: i.metaDescription,
            fecha: i.fecha,
            version: i.version,
            fuentes: i.fuentes.map((f) => ({
              nombre: `${f.organismo} — ${f.titulo}`,
              url: f.url,
            })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Informes', url: `${SITE.url}/informes` },
              { name: i.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/informes" className="hover:text-[#059669]">
          Informes
        </Link>{' '}
        / <span className="text-gray-700">{i.fecha}</span>
      </nav>

      <p className="mb-3 font-mono text-sm text-gray-500">
        Informe v{i.version} · {i.fecha} · {i.fuentes.length} fuentes oficiales
      </p>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {i.titulo}
      </h1>

      <p className="mb-8 text-lg text-gray-700">{i.subtitulo}</p>

      <a
        href={`/informes/${slug}/informe.pdf`}
        className="mb-12 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar el informe completo en PDF
      </a>

      {/* Resumen ejecutivo: frases autosuficientes. Es lo que se cita. */}
      <section className="speakable-intro mb-14 rounded-3xl border border-gray-100 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Resumen ejecutivo
        </h2>
        <ul className="space-y-3">
          {i.resumenEjecutivo.map((r) => (
            <li key={r} className="border-l-4 border-[#059669]/30 pl-5 text-gray-800">
              {r}
            </li>
          ))}
        </ul>
      </section>

      {i.secciones.map((s) => (
        <section key={s.heading} className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.cuerpo?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.indicadores && (
            <dl className="my-8 grid gap-4 sm:grid-cols-2">
              {s.indicadores.map((ind) => {
                const f = fuenteDe(i, ind.fuenteId);
                return (
                  <div
                    key={`${ind.etiqueta}-${ind.periodo}`}
                    className="rounded-2xl border border-gray-100 p-5"
                  >
                    <dt className="mb-2 text-sm text-gray-600">{ind.etiqueta}</dt>
                    <dd>
                      <span className="block font-mono text-3xl font-semibold tracking-tight text-[#0A2540]">
                        {ind.valor}
                      </span>
                      {ind.unidad && (
                        <span className="mt-1 block text-sm text-gray-500">{ind.unidad}</span>
                      )}
                      {ind.variacion && (
                        <span className="mt-2 block text-sm text-gray-700">
                          {numeroConSigno(ind.variacion.pct)} % frente a{' '}
                          {ind.variacion.base}
                        </span>
                      )}
                      {/* Periodo y organismo junto al número, siempre: una cifra
                          sin periodo no es una cifra, es una impresión. */}
                      <span className="mt-3 block border-t border-gray-100 pt-2 text-xs text-gray-500">
                        {ind.periodo} · {f?.organismo ?? 'fuente no declarada'}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          {/* La forma la decide el trabajo del dato: trayectoria en el tiempo
              pide línea; comparación de magnitudes pide barras. */}
          {s.grafico &&
            (s.grafico.tipo === 'serie-temporal' ? (
              <LineChart grafico={s.grafico} />
            ) : (
              <BarChart grafico={s.grafico} />
            ))}

          {s.implicacion && (
            <div className="mt-8 rounded-3xl bg-gray-50 p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
                Lo que implica · lectura de {SITE.name}
              </h3>
              <p className="text-gray-800">{s.implicacion}</p>
            </div>
          )}
        </section>
      ))}

      {/* Mismo peso visual que los hallazgos. Deliberado. */}
      <section className="mb-14 border-t pt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué NO afirma este informe
        </h2>
        <p className="mb-5 text-gray-600">
          Un estudio que no declara sus límites es publicidad con formato de estudio.
        </p>
        <ul className="space-y-4">
          {i.limitaciones.map((l) => (
            <li key={l} className="border-l-4 border-gray-300 pl-5 text-gray-700">
              {l}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-6 text-gray-600">
          Cada fuente indica qué dato concreto respalda y cuándo lo verificamos. Los
          organismos revisan sus series: antes de usar una cifra en un expediente,
          confírmela contra la publicación vigente.
        </p>
        <ol className="space-y-6">
          {i.fuentes.map((f) => (
            <li key={f.id}>
              <p className="font-semibold text-[#0A2540]">{f.organismo}</p>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {f.titulo} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-sm text-gray-700">{f.respalda}</p>
              <p className="mt-1 font-mono text-xs text-gray-500">
                Publicado {f.publicado} · verificado por nosotros el {f.consultado}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Aplicamos esto a su operación?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Envíenos el emplazamiento, la aplicación y el plazo, y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
