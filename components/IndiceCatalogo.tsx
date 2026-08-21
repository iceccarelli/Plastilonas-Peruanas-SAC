import Link from 'next/link';
import { products, productFamilies, availabilityLabels } from '@/lib/products';
import { familyHrefByName } from '@/lib/families';

/**
 * ÍNDICE COMPLETO DEL CATÁLOGO, RENDERIZADO EN EL SERVIDOR.
 *
 * El defecto que resuelve, medido sobre el HTML realmente servido: /productos
 * llegaba con CERO enlaces `<a href="/productos/…">`. Toda la rejilla vivía
 * detrás de un <Suspense> cuyo contenido depende de `useSearchParams`, así que
 * lo único prerenderizado era el texto «Cargando catálogo…». El /glosario, que
 * es un componente de servidor, servía 43 enlaces desde el primer byte.
 *
 * Por qué importa más de lo que parece. El ItemList de JSON-LD ya declaraba las
 * 36 URLs, y por eso las fichas se indexaban igual desde el sitemap. Pero un
 * ItemList NO es un grafo de enlaces: no transmite señal interna. El catálogo
 * —la página que debería concentrar y repartir autoridad hacia las 36 fichas—
 * no le pasaba ninguna a ninguna. Y cualquier agente que lea HTML sin ejecutar
 * JavaScript (que son casi todos los rastreadores de IA) veía una página vacía
 * donde debería estar el portafolio entero.
 *
 * Por qué un índice y no mover la rejilla al servidor. La rejilla es filtrable
 * y eso es una función de cliente legítima. Duplicarla en el servidor daría dos
 * copias del mismo contenido. Un índice agrupado por familia es otra cosa: es
 * más denso, se recorre de un vistazo y es lo que un comprador técnico que ya
 * sabe lo que busca prefiere usar. Sirve a las personas y resuelve el rastreo
 * con la misma pieza.
 */

export default function IndiceCatalogo() {
  const porFamilia = productFamilies
    .map((f) => ({
      familia: f,
      items: products.filter((p) => p.category === f.name),
    }))
    .filter((g) => g.items.length > 0);

  const enFamilia = new Set(porFamilia.flatMap((g) => g.items.map((p) => p.slug)));
  const sueltos = products.filter((p) => !enFamilia.has(p.slug));

  return (
    <section
      id="indice-catalogo"
      className="max-w-7xl mx-auto px-6 pb-20 pt-4 scroll-mt-24"
      aria-labelledby="indice-catalogo-titulo"
    >
      <div className="border-t border-gray-200 pt-10">
        <h2 id="indice-catalogo-titulo" className="text-2xl font-semibold tracking-tight text-[#0A2540]">
          Índice completo del catálogo
        </h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          Las {products.length} líneas de producto, agrupadas por familia. Si ya sabe qué busca, este
          índice es más rápido que los filtros.
        </p>

        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {porFamilia.map(({ familia, items }) => (
            <div key={familia.slug}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Link href={familyHrefByName(familia.name)} className="hover:text-[#059669]">
                  {familia.name}
                </Link>
              </h3>
              <ul className="mt-3 space-y-2">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/productos/${p.slug}`}
                      className="text-sm text-[#0A2540] hover:text-[#059669] hover:underline"
                    >
                      {p.name}
                    </Link>
                    {/* El modo de suministro es un dato estable y es lo primero
                        que pregunta un comprador. El precio no: ése se
                        establece en la cotización. Puede faltar, y entonces no
                        se inventa una etiqueta: simplemente no se muestra. */}
                    {p.availability && (
                      <span className="ml-1.5 text-xs text-gray-400">
                        {availabilityLabels[p.availability]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {sueltos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Otras líneas</h3>
              <ul className="mt-3 space-y-2">
                {sueltos.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/productos/${p.slug}`}
                      className="text-sm text-[#0A2540] hover:text-[#059669] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
