import { Suspense } from 'react';
import { products } from '@/lib/products';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import CatalogoFiltrado from '@/components/CatalogoFiltrado';
import IndiceCatalogo from '@/components/IndiceCatalogo';

/**
 * CATÁLOGO — ahora un componente de SERVIDOR.
 *
 * Antes este archivo era 'use client' entero y envolvía todo su contenido en
 * un <Suspense>. Como la rejilla lee `useSearchParams`, Next solo podía
 * prerenderizar el fallback, así que el HTML servido de la página comercial
 * más importante del sitio contenía exactamente esto:
 *
 *   «Cargando catálogo…»
 *
 * Sin <h1>. Sin un solo enlace a las 36 fichas. Medido sobre el HTML generado:
 * 0 enlaces `/productos/…` aquí, contra 43 enlaces `/glosario/…` en el
 * glosario, que sí es un componente de servidor.
 *
 * El reparto ahora es explícito:
 *   · SERVIDOR — el <h1>, la entrada, el JSON-LD y el índice completo con las
 *     36 fichas enlazadas. Está en el primer byte, para todo el mundo.
 *   · CLIENTE  — solo la rejilla filtrable, que es lo único que de verdad
 *     necesita leer la URL.
 */

const CATALOGO_URL = `${SITE.url}/productos`;

// ISR: catálogo, 1 hora.
export const revalidate = 3600;

export default function ProductosPage() {
  return (
    <>
      {/* Un ItemList de las 36 fichas le da a los buscadores y a los agentes el
          mapa completo del portafolio desde una sola URL. Se emite aquí y no en
          app/productos/layout.tsx porque ese layout también envuelve
          /productos/[slug], donde este bloque sería ruido duplicado.

          Ojo con la lectura fácil: este ItemList NO sustituye a los enlaces.
          Declara URLs; no transmite señal interna. Por eso existe además
          <IndiceCatalogo />. */}
      <JsonLd
        data={[
          webPageSchema({
            url: CATALOGO_URL,
            name: `Catálogo de ${products.length} soluciones textiles industriales`,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${CATALOGO_URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: CATALOGO_URL },
            ],
            `${CATALOGO_URL}#breadcrumb`,
          ),
          itemListSchema({
            url: CATALOGO_URL,
            name: 'Catálogo Plastilonas Peruanas SAC',
            items: products.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="text-xs tracking-[0.15em] text-[#059669] font-semibold">CATÁLOGO COMPLETO</div>
        <h1 className="t-display font-semibold text-[#0A2540]">Productos Industriales</h1>
        <p className="speakable-intro text-gray-600 mt-2 max-w-3xl">
          {products.length} líneas de producto para minería, agroindustria, construcción e industria
          en el Perú: envases y embalaje, lonas y cobertores, geosintéticos, estructuras textiles,
          ventilación y mallas agrícolas. Fabricación propia, importación directa e instalación.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6 py-20 text-gray-400">Cargando filtros…</div>
        }
      >
        <CatalogoFiltrado />
      </Suspense>

      <IndiceCatalogo />
    </>
  );
}
