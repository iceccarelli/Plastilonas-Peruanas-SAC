import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  novedades,
  novedadBySlug,
  tipoLabels,
  fechaLarga,
} from '@/lib/novedades';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { articleSchema, breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { descripcionDeTexto } from '@/lib/meta';

/**
 * Entrada del registro fechado.
 *
 * Una entrada es citable por sí sola: título, fecha, qué cambia para quien
 * especifica, el detalle y los enlaces a lo publicado. Emite Article (no
 * TechArticle: esto es un anuncio de cambio, no una guía) con datePublished
 * real — la señal de frescura que un `lastmod` movido a mano no da.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return novedades.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = novedadBySlug(slug);
  if (!n) return {};
  const url = `${SITE.url}/novedades/${slug}`;
  // La etiqueta de búsqueda se ajusta al espacio que Google deja de verdad;
  // el texto largo sigue entero en la página y en el JSON-LD, donde no estorba.
  const descripcionBusqueda = descripcionDeTexto(n.resumen);

  return {
    title: n.titulo,
    description: descripcionBusqueda,
    alternates: { canonical: `/novedades/${slug}` },
    openGraph: {
      title: `${n.titulo} | ${SITE.name}`,
      description: descripcionBusqueda,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: n.fecha,
    },
  };
}

export default async function NovedadPage({ params }: Props) {
  const { slug } = await params;
  const n = novedadBySlug(slug);
  if (!n) notFound();

  const url = `${SITE.url}/novedades/${slug}`;
  const indice = novedades.findIndex((x) => x.slug === slug);
  const anterior = novedades[indice + 1];
  const siguiente = novedades[indice - 1];

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="novedades" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: n.titulo,
            description: n.resumen,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: n.titulo,
            description: n.resumen,
            datePublished: n.fecha,
            dateModified: n.fecha,
            section: tipoLabels[n.tipo],
            articleType: 'Article',
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Novedades', url: `${SITE.url}/novedades` },
              { name: n.titulo, url },
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
        <Link href="/novedades" className="hover:text-[#059669]">
          Novedades
        </Link>{' '}
        / <span className="text-gray-700">{fechaLarga(n.fecha)}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <time dateTime={n.fecha} className="font-mono text-sm text-gray-500">
          {n.fecha}
        </time>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {tipoLabels[n.tipo]}
        </span>
      </div>

      <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {n.titulo}
      </h1>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{n.resumen}</p>

      <div className="mb-10 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Qué cambia
        </h2>
        <p className="text-gray-800">{n.queCambia}</p>
      </div>

      <div className="mb-12 space-y-5 text-gray-700">
        {n.detalle.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Lo publicado
        </h2>
        <ul className="space-y-3">
          {n.enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                  {e.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#059669]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mb-14 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/novedades/${anterior.slug}`}
            className="group rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
          >
            <span className="mb-1 flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-gray-500">
              <ArrowLeft className="h-3 w-3" /> Anterior
            </span>
            <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
              {anterior.titulo}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link
            href={`/novedades/${siguiente.slug}`}
            className="group rounded-2xl border border-gray-100 p-5 text-right transition-colors hover:border-[#059669]/40 sm:col-start-2"
          >
            <span className="mb-1 flex items-center justify-end gap-1 text-xs uppercase tracking-[0.12em] text-gray-500">
              Siguiente <ArrowRight className="h-3 w-3" />
            </span>
            <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
              {siguiente.titulo}
            </span>
          </Link>
        )}
      </nav>

      <div className="rounded-3xl border border-gray-100 p-8 text-center">
        <p className="mb-5 text-gray-700">
          El registro completo, con feed para suscribirse sin dejar un correo.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/novedades"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Ver todas las novedades
          </Link>
          <a
            href="/novedades/rss.xml"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Feed RSS
          </a>
        </div>
      </div>
    </article>
  );
}
