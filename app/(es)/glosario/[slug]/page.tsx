import type { Metadata } from 'next';
import { tituloAjustado, descripcionAjustada, OG_IMAGEN } from '@/lib/meta';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Ruler } from 'lucide-react';
import {
  terminos,
  terminoBySlug,
  terminosPorCategoria,
  categoriaLabels,
  formasDe,
} from '@/lib/glosario';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasGlosario } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, definedTermSchema, webPageSchema, imageObjectSchema } from '@/lib/schema';

/**
 * Página de un término.
 *
 * La unidad citable del sitio. Un modelo que necesita definir "geotextil" debe
 * poder copiar UNA frase de acá y atribuirla sin leer el resto. Por eso la
 * definición corta va sola, arriba, marcada como speakable y replicada en el
 * DefinedTerm: si hay que reconstruirla juntando párrafos, no se cita.
 *
 * Y por eso cada término enlaza hacia los productos donde manda, las guías que
 * lo desarrollan y el pilar del marco al que pertenece: la definición es la
 * puerta de entrada al resto del sitio, no un callejón sin salida.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return terminos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) return {};
  const url = `${SITE.url}/glosario/${slug}`;
  const title = t.siglas ? `${t.termino} (${t.siglas})` : t.termino;
  return {
    // El complemento entra solo si cabe entero: «HDPE: qué es y cómo se
    // especifica» sí, «Tipos electrostáticos de FIBC (A, B, C y D)» se queda
    // con el nombre solo. Nunca una frase partida por la mitad.
    title: tituloAjustado(title, 'qué es y cómo se especifica'),
    description: descripcionAjustada([t.definicionCorta]),
    alternates: { canonical: `/glosario/${slug}` },
    openGraph: {
    images: OG_IMAGEN,
      title: `${title} | Glosario técnico de ${SITE.name}`,
      description: t.definicionCorta,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function TerminoPage({ params }: Props) {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) notFound();

  const url = `${SITE.url}/glosario/${slug}`;
  const setUrl = `${SITE.url}/glosario`;
  const imagen = ranurasGlosario().find((r) => r.id === `glosario:${slug}`);
  const relacionados = t.relacionados.map(terminoBySlug).filter(Boolean) as NonNullable<
    ReturnType<typeof terminoBySlug>
  >[];
  const productosRel = (t.productos ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean);
  const guiasRel = (t.guias ?? [])
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean);
  const pilar = t.pilar ? pillars.find((p) => p.id === t.pilar) : undefined;
  const hermanos = terminosPorCategoria(t.categoria).filter((x) => x.slug !== t.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="glosario" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: t.termino,
            description: t.definicionCorta,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          definedTermSchema({
            url,
            setUrl,
            termino: t.termino,
            definicionCorta: t.definicionCorta,
            termCode: t.slug,
            alternateNames: formasDe(t).slice(1),
          }),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: true,
              })]
            : []),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Glosario', url: setUrl },
              { name: t.termino, url },
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
        <Link href="/glosario" className="hover:text-[#059669]">
          Glosario
        </Link>{' '}
        / <span className="text-gray-700">{t.termino}</span>
      </nav>

      <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {categoriaLabels[t.categoria]}
      </p>

      <h1 className="mb-2 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {t.termino}
      </h1>

      {(t.siglas || t.alias?.length) && (
        <p className="mb-6 text-gray-500">
          También: {formasDe(t).slice(1).join(' · ')}
        </p>
      )}

      {/* La unidad citable. Va sola, sin nada que la interrumpa. */}
      <p className="speakable-intro mb-10 border-l-4 border-[#059669] pl-6 text-xl leading-relaxed text-gray-800">
        {t.definicionCorta}
      </p>

      {/* El esquema tras la definición corta y antes del desarrollo: es la
          posición en que el dibujo ayuda a leer el texto, y no al revés. */}
      {imagen && <ImagenContenido ranura={imagen} className="mb-10" sizes="(min-width: 768px) 720px, 100vw" />}

      <div className="mb-12 space-y-5 text-gray-700">
        {t.definicion.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {t.comoSeMide && (
        <section className="mb-12 rounded-3xl border border-gray-100 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            <Ruler className="h-4 w-4" aria-hidden="true" /> Cómo se mide
          </h2>
          <p className="text-gray-800">{t.comoSeMide}</p>
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Por qué importa
        </h2>
        <p className="text-gray-700">{t.porQueImporta}</p>
      </section>

      {t.errorFrecuente && (
        <section className="mb-12 rounded-3xl bg-amber-50 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Error frecuente
          </h2>
          <p className="text-gray-800">{t.errorFrecuente}</p>
        </section>
      )}

      {pilar && (
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            En el Marco de Especificación
          </h2>
          <p className="mb-4 text-gray-700">
            Esta decisión pertenece al pilar <strong>{pilar.nombre}</strong>: {pilar.resumen}
          </p>
          <Link
            href="/marco"
            className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
          >
            Ver los criterios del marco <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos relacionados
          </h2>
          <ul className="space-y-3">
            {relacionados.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/glosario/${r.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                >
                  <span className="mb-1 block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                    {r.termino}
                  </span>
                  <span className="block text-sm text-gray-600">{r.definicionCorta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guiasRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías que lo desarrollan
          </h2>
          <div className="space-y-3">
            {guiasRel.map((a) => (
              <Link
                key={a!.slug}
                href={`/recursos/${a!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {a!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {productosRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Dónde este término decide la especificación
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {productosRel.map((p) => (
              <li key={p!.slug}>
                <Link
                  href={`/productos/${p!.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {p!.name}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {p!.shortDescription}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hermanos.length > 0 && (
        <section className="mb-14 border-t border-gray-100 pt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Más de {categoriaLabels[t.categoria].toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {hermanos.map((h) => (
              <Link
                key={h.slug}
                href={`/glosario/${h.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {h.termino}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl border border-gray-100 p-8 text-center">
        <p className="mb-5 text-gray-700">
          ¿Necesita aplicar este criterio a un proyecto concreto? Envíenos la
          especificación y le devolvemos la propuesta técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/glosario"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Volver al glosario
          </Link>
        </div>
      </div>
    </article>
  );
}
