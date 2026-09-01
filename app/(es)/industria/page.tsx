import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/site';
import {
  INDUSTRIAS,
  productosDe,
  tituloIndustria,
  descripcionIndustria,
} from '@/lib/industrias';
import { descripcionAjustada, OG_IMAGEN } from '@/lib/meta';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasErrorCompra } from '@/lib/imagenes';

/**
 * Índice de sectores (/industria).
 *
 * Es el quinto eje de navegación del sitio, junto a familia, arquitectura,
 * marco y ciudad. Responde a la pregunta con la que empieza de verdad una
 * compra industrial: «soy de este sector, ¿qué me sirve?».
 */

const url = `${SITE.url}/industria`;

export const metadata: Metadata = {
  title: 'Soluciones por industria',
  // Por el mismo presupuesto que el resto del sitio: frases completas hasta
  // donde quepa, nunca una idea partida por la mitad.
  description: descripcionAjustada([
    'Minería, agroexportación, transporte, construcción y saneamiento.',
    'Qué se fabrica para cada sector, con qué criterio se especifica y a dónde se despacha.',
  ]),
  alternates: { canonical: '/industria' },
  openGraph: {
    images: OG_IMAGEN,
    title: `Soluciones por industria | ${SITE.name}`,
    description:
      'Qué fabricamos para minería, agroexportación, transporte, construcción y saneamiento en el Perú.',
    url,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function IndustriaIndexPage() {
  const errores = ranurasErrorCompra();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: 'Soluciones por industria',
            description:
              'Índice de sectores compradores de textiles industriales y geosintéticos en el Perú.',
            type: 'CollectionPage',
            breadcrumbId: `${url}#breadcrumb`,
            speakable: ['.speakable-intro'],
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Industrias', url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: 'Sectores atendidos',
            description: 'Hubs por industria compradora.',
            items: INDUSTRIAS.map((i) => ({
              name: i.nombre,
              url: `${SITE.url}/industria/${i.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span>Industrias</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A2540] mb-5">
        Soluciones por industria
      </h1>
      <p className="speakable-intro text-lg text-gray-600 max-w-3xl mb-4">
        Nadie en una minera busca «geosintéticos»: busca resolver una poza. El
        catálogo está ordenado por material y por familia, que es como se
        fabrica; esta sección lo ordena por sector, que es como se compra.
      </p>
      <p className="text-gray-600 max-w-3xl mb-12">
        Cada página reúne lo que se fabrica para ese sector, el criterio con el
        que se especifica, qué se rompe cuando se compra sin criterio y a qué
        regiones se despacha. Los productos salen del propio catálogo: no hay
        una lista paralela que pueda quedar desfasada.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {INDUSTRIAS.map((ind) => {
          const n = productosDe(ind).length;
          return (
            <Link
              key={ind.slug}
              href={`/industria/${ind.slug}`}
              className="group overflow-hidden rounded-3xl border border-gray-200 transition-all hover:border-[#059669]/50 hover:shadow-sm"
            >
              {/* El primer error de compra documentado del sector. Es el
                  contenido que distingue este hub de una categoría más del
                  catálogo, y conviene que se vea antes de entrar. */}
              <MiniaturaRanura
                ranura={errores.find((r) => r.id.startsWith(`error:${ind.slug}:`))}
                className="w-full rounded-none"
                sizes="(min-width: 640px) 480px, 100vw"
              />
              <div className="p-7">
              <div className="mb-2 font-mono text-xs uppercase tracking-wider text-[#059669]">
                {n} productos del catálogo
              </div>
              <h2 className="mb-3 text-xl font-semibold text-[#0A2540] group-hover:text-[#059669]">
                {tituloIndustria(ind)}
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-gray-600">
                {descripcionIndustria(ind)}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#059669]">
                Ver el sector <ArrowRight className="h-4 w-4" />
              </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
