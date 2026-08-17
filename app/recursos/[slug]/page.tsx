import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Plantilla de artículo técnico.
 *
 * Emite TechArticle + WebPage + BreadcrumbList + FAQPage y, cuando el artículo
 * define una secuencia real, HowTo. Todo el contenido estructurado tiene
 * contraparte visible en la página: schema sin contenido visible es una
 * infracción de las directrices de resultados enriquecidos.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const url = `${SITE.url}/recursos/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: [a.category, ...a.sectors, 'Perú', 'guía técnica'],
    alternates: { canonical: `/recursos/${a.slug}` },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.description,
    },
  };
}

function countWords(text: string[]): number {
  return text.join(' ').split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const url = `${SITE.url}/recursos/${a.slug}`;
  const relatedProducts = a.relatedProducts
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedCities = (a.relatedCities ?? [])
    .map((s) => (ciudades as { slug: string; ciudad: string }[]).find((c) => c.slug === s))
    .filter((c): c is { slug: string; ciudad: string } => Boolean(c));

  const wordCount = countWords([
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.body ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
    ]),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: a.title,
            description: a.description,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: a.title,
            description: a.description,
            datePublished: a.datePublished,
            dateModified: a.dateModified,
            section: a.category,
            keywords: [a.category, ...a.sectors],
            wordCount,
            citations: a.sources.map((s) => ({ label: s.label, url: s.url })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: `${SITE.url}/recursos` },
              { name: a.title, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(a.faqs, url),
          ...(a.howTo
            ? [
                howToSchema({
                  url,
                  name: a.howTo.name,
                  description: a.description,
                  totalTime: a.howTo.totalTime,
                  steps: a.howTo.steps,
                }),
              ]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/recursos" className="hover:text-[#059669]">
          Recursos técnicos
        </Link>{' '}
        / <span className="text-gray-700">{a.category}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
          {a.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {a.readingMinutes} min de lectura
        </span>
        <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {a.title}
      </h1>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        {a.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Resumen ejecutivo: lo primero que un motor o un agente extrae. */}
      <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          En resumen
        </h2>
        <ul className="space-y-3 text-gray-800">
          {a.keyTakeaways.map((k) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1 text-[#059669]">→</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {/* Índice */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Contenido
        </h2>
        <ol className="space-y-2 text-sm">
          {a.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#seccion-${i + 1}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#preguntas-frecuentes" className="text-gray-700 hover:text-[#059669]">
              Preguntas frecuentes
            </a>
          </li>
        </ol>
      </nav>

      {a.sections.map((s, i) => (
        <section key={s.heading} id={`seccion-${i + 1}`} className="mb-12 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.body?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.list && (
            <ul className="mb-4 space-y-2 text-gray-700">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#059669]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="mb-4 space-y-3 text-gray-700">
              {s.steps.map((item, n) => (
                <li key={item} id={`paso-${n + 1}`} className="flex gap-3 scroll-mt-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-semibold text-[#059669]">
                    {n + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {s.table.caption && (
                  <caption className="mb-2 text-left text-xs text-gray-500">
                    {s.table.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-gray-200">
                    {s.table.headers.map((h) => (
                      <th key={h} className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-gray-100 last:border-none">
                      {row.map((cell) => (
                        <td key={cell} className="py-3 pr-6 align-top text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.callout && (
            <p className="rounded-2xl border-l-4 border-[#059669] bg-gray-50 p-5 text-gray-800">
              {s.callout}
            </p>
          )}
        </section>
      ))}

      <section id="preguntas-frecuentes" className="mb-12 scroll-mt-24 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {a.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-12 border-t pt-10">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Cada fuente indica qué dato concreto respalda. Las cifras normativas deben
          verificarse contra el texto oficial vigente antes de usarse en una memoria de
          cálculo o en un expediente técnico.
        </p>
        <ol className="space-y-4 text-sm">
          {a.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-gray-600">{s.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Productos relacionados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/productos/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {p.shortDescription}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Cobertura relacionada
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {c.ciudad}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Lo aplicamos a su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales de su operación y le devolvemos la
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
            href="/recursos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Más recursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
