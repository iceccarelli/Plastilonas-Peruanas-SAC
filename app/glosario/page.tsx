import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import {
  terminos,
  terminosPorLetra,
  terminosPorCategoria,
  categoriasPresentes,
  categoriaLabels,
} from '@/lib/glosario';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';
import { breadcrumbSchema, definedTermSetSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del glosario.
 *
 * Dos ejes de navegación porque hay dos formas de llegar: alfabética, para
 * quien ya sabe la palabra que busca, y por categoría, para quien está
 * explorando un área que no domina. Ninguno de los dos usa parámetros de
 * consulta: una URL sin parámetros es la que se cita y la que se indexa.
 */

const URL = `${SITE.url}/glosario`;
const TITLE = 'Glosario técnico de textiles y geosintéticos';
const DESCRIPTION = `${terminos.length} términos del rubro: qué significan, cómo se miden y qué deciden en obra. Vocabulario de referencia, útil se compre a quien se compre.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/glosario' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function GlosarioPage() {
  // Esquema de esta página. `ImagenContenido` degrada solo: mientras el
  // archivo no exista no se pinta nada roto, y en cuanto se publique
  // aparece aquí sin tocar esta página.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:glosario-mapa');
  const letras = terminosPorLetra();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="glosario" slug="indice" />
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
              { name: 'Glosario', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          definedTermSetSchema({
            url: URL,
            name: 'Glosario técnico de textiles industriales y geosintéticos',
            description: DESCRIPTION,
            terms: terminos.map((t) => ({
              slug: t.slug,
              termino: t.termino,
              definicionCorta: t.definicionCorta,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Glosario</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">Glosario técnico</h1>
      {esquema && (
        <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 1024px) 900px, 100vw" />
      )}

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Antes de elegir un producto hay que entender qué se está pidiendo. Estos{' '}
        {terminos.length} términos son el vocabulario con el que se especifica en este
        rubro: qué significa cada uno, en qué unidad se mide y qué decide en obra.
        Están escritos para ser útiles aunque el proyecto se compre a otro proveedor —
        esa es la única forma de que una definición valga algo.
      </p>

      <p className="mb-10 font-mono text-sm text-gray-500">
        {terminos.length} términos · {categoriasPresentes().length} áreas ·{' '}
        <a href="/glosario/glosario.pdf" className="underline hover:text-[#059669]">
          descargar en PDF
        </a>{' '}
        ·{' '}
        <a href="/glosario/terminos.json" className="underline hover:text-[#059669]">
          versión legible por máquina
        </a>
      </p>

      {/* Salto alfabético: cómo se consulta un glosario cuando ya se sabe qué buscar. */}
      <nav aria-label="Índice alfabético" className="mb-12 flex flex-wrap gap-2">
        {letras.map((l) => (
          <a
            key={l.letra}
            href={`#letra-${l.letra}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-mono text-sm font-semibold text-[#0A2540] transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {l.letra}
          </a>
        ))}
      </nav>

      <section className="mb-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Por área
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categoriasPresentes().map((c) => (
            <a
              key={c}
              href={`#area-${c}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
            >
              <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                {categoriaLabels[c]}
              </span>
              <span className="font-mono text-sm text-gray-500">
                {terminosPorCategoria(c).length}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Eje 1: alfabético. */}
      <section className="mb-16">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          <BookOpen className="h-5 w-5 text-[#059669]" aria-hidden="true" />
          Todos los términos
        </h2>
        {letras.map((l) => (
          <div key={l.letra} id={`letra-${l.letra}`} className="mb-10 scroll-mt-28">
            <h3 className="mb-4 border-b border-gray-100 pb-2 font-mono text-xl font-semibold text-[#059669]">
              {l.letra}
            </h3>
            <ul className="space-y-3">
              {l.items.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/glosario/${t.slug}`}
                    className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                  >
                    <span className="mb-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-[#0A2540] group-hover:text-[#059669]">
                        {t.termino}
                      </span>
                      {t.siglas && (
                        <span className="font-mono text-xs text-gray-500">({t.siglas})</span>
                      )}
                    </span>
                    <span className="block text-sm text-gray-600">{t.definicionCorta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Eje 2: por área, para quien explora un terreno que no domina. */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Términos por área
        </h2>
        {categoriasPresentes().map((c) => (
          <div key={c} id={`area-${c}`} className="mb-8 scroll-mt-28">
            <h3 className="mb-3 border-b border-gray-100 pb-2 text-lg font-semibold text-[#0A2540]">
              {categoriaLabels[c]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {terminosPorCategoria(c).map((t) => (
                <Link
                  key={t.slug}
                  href={`/glosario/${t.slug}`}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
                >
                  {t.termino}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Falta un término que usted sí usa?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Este glosario crece con las preguntas que llegan de obra. Si en su operación
          hay un término que acá no está definido, escríbanos y entra con su desarrollo
          y sus guías.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Escribirnos
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver el Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
