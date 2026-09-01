import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies, sourcingLabels, availabilityLabels } from '@/lib/products';
import { familyContent, resolveFamily, comparableFamilies } from '@/lib/families';
import { articles } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasFamilia } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema, imageObjectSchema } from '@/lib/schema';
import { descripcionDeTexto, OG_IMAGEN } from '@/lib/meta';
import RielComercial from '@/components/RielComercial';

/**
 * Página de familia (/productos/familia/[slug]).
 *
 * Cierra el hueco estructural más caro del sitio: la navegación por familia se
 * resolvía con `?categoria=` sobre un catálogo filtrado en cliente, de modo que
 * once mercados con intención de búsqueda distinta compartían UNA sola URL
 * indexable. Ahora cada familia tiene URL estática, contenido propio, FAQ,
 * ItemList de sus SKUs y enlaces a los artículos y ciudades relacionados.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return familyContent.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { content } = resolved;
  const url = `${SITE.url}/productos/familia/${slug}`;
  // La etiqueta de búsqueda se ajusta al espacio que Google deja de verdad;
  // el texto largo sigue entero en la página y en el JSON-LD, donde no estorba.
  const descripcionBusqueda = descripcionDeTexto(content.metaDescription);

  return {
    title: content.metaTitle,
    description: descripcionBusqueda,
    alternates: { canonical: `/productos/familia/${slug}` },
    openGraph: {
    images: OG_IMAGEN,
      title: content.metaTitle,
      description: descripcionBusqueda,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family, content } = resolved;

  const url = `${SITE.url}/productos/familia/${slug}`;
  const imagen = ranurasFamilia().find((r) => r.id === `familia:${slug}`);
  const items = products.filter((p) => p.category === family.name);
  // ¿Existe /comparar para esta familia? La misma función que genera la ruta.
  const comparable = comparableFamilies().some((f) => f.slug === slug);
  const sectores = Array.from(new Set(items.flatMap((p) => p.sector)));
  const sourcings = Array.from(new Set(items.map((p) => p.sourcing).filter(Boolean))) as string[];
  const disponibilidades = Array.from(
    new Set(items.map((p) => p.availability ?? 'a_medida')),
  );
  const relatedArticles = articles.filter((a) => a.category === family.name);
  const otherFamilies = productFamilies.filter((f) => f.slug !== slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="family" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: content.h1,
            description: content.metaDescription,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: family.name,
            description: content.metaDescription,
            items: items.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
          faqSchema(content.faqs, url),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: false,
              })]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/productos" className="hover:text-[#059669]">
          Catálogo
        </Link>{' '}
        / <span className="text-gray-700">{family.name}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{content.h1}</h1>

      <p className="mb-6 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {family.tagline} · {items.length} {items.length === 1 ? 'línea' : 'líneas'} de producto
      </p>

      {imagen && <ImagenContenido ranura={imagen} prioridad className="mb-10" />}

      <div className="speakable-intro mb-10 max-w-3xl space-y-4 text-lg text-gray-700">
        {content.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Cómo abastecemos y en qué estado está la oferta: dato real del catálogo. */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Cómo lo entregamos
          </h2>
          <p className="text-gray-700">
            {sourcings.map((s) => sourcingLabels[s] ?? s).join(' · ')}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Estado de la oferta
          </h2>
          <p className="text-gray-700">
            {disponibilidades.map((a) => availabilityLabels[a] ?? a).join(' · ')}
          </p>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Productos de esta familia
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              className="group block rounded-3xl border border-gray-100 p-6 transition-all hover:border-[#059669]/40"
            >
              <span className="mb-2 block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {p.name}
              </span>
              <span className="mb-3 block text-sm text-gray-600">{p.shortDescription}</span>
              <span className="flex flex-wrap gap-2 text-xs text-gray-500">
                {p.sector.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-gray-50 px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* El enlace se pinta con EL MISMO predicado que genera la ruta.
          Antes bastaba con `items.length >= 2`, pero /comparar sólo existe
          para las familias que además producen al menos una fila comparable
          (lib/families.ts). `seguridad-industrial` tiene cuatro fichas y
          ninguna especificación compartida: el botón se pintaba y llevaba a
          un 404. Lo encontró el rastreo de enlaces, no una prueba. */}
      {comparable && (
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-6">
          <p className="text-gray-800">
            ¿Está eligiendo entre varias de estas {items.length} alternativas? Véalas con
            sus especificaciones lado a lado.
          </p>
          <Link
            href={`/productos/familia/${slug}/comparar`}
            className="inline-flex items-center gap-1 rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Comparar las {items.length} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué define la especificación
        </h2>
        <dl className="space-y-5">
          {content.selectionCriteria.map((c) => (
            <div key={c.titulo} className="border-l-4 border-[#059669]/30 pl-5">
              <dt className="font-semibold text-[#0A2540]">{c.titulo}</dt>
              <dd className="mt-1 text-gray-700">{c.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Sectores que compran esta familia
        </h2>
        <div className="flex flex-wrap gap-2">
          {sectores.map((s) => (
            <Link
              key={s}
              href={`/productos?sector=${encodeURIComponent(s)}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas de esta familia
          </h2>
          <div className="space-y-4">
            {relatedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/recursos/${a.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {a.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {content.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Otras familias del catálogo
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map((f) => (
            <Link
              key={f.slug}
              href={`/productos/familia/${f.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {f.name}
            </Link>
          ))}
        </div>
      </section>

      <RielComercial ruta={`/productos/familia/${slug}`} className="mb-12" />

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Especificamos su caso?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos medidas, cantidad, aplicación y ciudad de entrega y le devolvemos la
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
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
