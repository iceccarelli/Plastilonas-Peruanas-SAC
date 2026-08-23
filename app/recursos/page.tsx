import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { SITE } from '@/lib/site';
import { articles, articleCategories } from '@/lib/articles';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasGuia } from '@/lib/imagenes';
import { familyHrefByName } from '@/lib/families';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del silo técnico (/recursos).
 *
 * Es el hub de contenido: concentra el enlazado hacia cada artículo y desde
 * cada artículo hacia catálogo y cobertura local. Sin hub, los artículos
 * quedan colgando del sitemap y no reciben ninguna señal interna.
 */

const URL = `${SITE.url}/recursos`;
const TITLE = 'Recursos técnicos: especificación e instalación';
const DESCRIPTION = `Guías para especificar, instalar y auditar textil industrial y geosintéticos en el Perú, con las fuentes citadas en cada una.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/recursos' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function RecursosIndexPage() {
  const portadas = ranurasGuia();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Guías técnicas',
            description: DESCRIPTION,
            items: articles.map((a) => ({
              name: a.title,
              url: `${SITE.url}/recursos/${a.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Recursos técnicos</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Recursos técnicos
      </h1>

      <p className="speakable-intro mb-10 max-w-3xl text-lg text-gray-700">
        Guías de especificación, instalación y auditoría escritas para compradores
        técnicos e ingenieros de proyecto en el Perú. Cada cifra normativa lleva su
        fuente citada al pie del artículo; cuando un dato no se pudo verificar contra el
        texto oficial, se dice explícitamente en lugar de publicarlo como certeza.
      </p>

      {/* Los chips enlazan a la página de familia: el silo de contenido y el
          silo de catálogo deben alimentarse mutuamente, no vivir separados. */}
      <div className="mb-10 flex flex-wrap gap-2">
        {articleCategories.map((cat) => (
          <Link
            key={cat}
            href={familyHrefByName(cat)}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {articles.map((a) => (
          <article
            key={a.slug}
            className="group overflow-hidden rounded-3xl border border-gray-100 transition-all hover:border-[#059669]/40"
          >
            <Link href={`/recursos/${a.slug}`} aria-hidden="true" tabIndex={-1}>
              <MiniaturaRanura
                ranura={portadas.find((r) => r.id === `guia:${a.slug}`)}
                className="w-full rounded-none"
                sizes="(min-width: 768px) 760px, 100vw"
              />
            </Link>
            <div className="p-7">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <Link
                href={familyHrefByName(a.category)}
                className="font-medium uppercase tracking-[0.12em] text-[#059669] hover:underline"
              >
                {a.category}
              </Link>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {a.readingMinutes} min
              </span>
              <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
            </div>

            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
              <Link href={`/recursos/${a.slug}`} className="group-hover:text-[#059669]">
                {a.title}
              </Link>
            </h2>

            <p className="mb-4 text-gray-700">{a.description}</p>

            <ul className="mb-5 space-y-1.5 text-sm text-gray-600">
              {a.keyTakeaways.slice(0, 2).map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="mt-0.5 text-[#059669]">→</span>
                  {k}
                </li>
              ))}
            </ul>

            <Link
              href={`/recursos/${a.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
            >
              Leer la guía <ArrowRight className="h-4 w-4" />
            </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Necesita aplicar esto a un proyecto concreto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales —altitud, geometría, material, ciudad— y le
          devolvemos la especificación y la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
