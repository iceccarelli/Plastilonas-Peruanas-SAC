'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * EXPLORAR CATÁLOGO — un solo bloque donde antes había dos.
 *
 * QUÉ SUSTITUYE. La portada tenía dos secciones seguidas que hacían la misma
 * pregunta con distinta ropa:
 *
 *   1. «Explore el catálogo por familia» — `FamilyCarousel`, un carrusel de
 *      tarjetas de familia que avanzaba solo cada 4 s.
 *   2. «Nuestras líneas insignia» — `FeaturedDeck`, una baraja de las 36
 *      fichas del catálogo que TAMBIÉN avanzaba sola cada 4 s.
 *
 * Los dos componentes quedaron sin una sola importación tras la fusión y una
 * limpieza posterior los borró. Se nombran aquí como HISTORIA —para que se
 * entienda qué sustituyó este fichero—, no como código vivo: no existen.
 *
 * Las dos estaban siempre renderizadas enteras, las dos se movían solas, y
 * ninguna respondía a la otra: elegir «Geosintéticos» en la primera no
 * cambiaba nada en la segunda. Medido a 390 px, entre las dos y sus dos
 * encabezados ocupaban 1378 px de desplazamiento para no dejar al comprador
 * más cerca de su producto que un enlace genérico a /productos.
 *
 * QUÉ HACE AHORA. Una fila de fichas —las familias reales de
 * `productFamilies`, en un carril horizontal— y debajo un panel que muestra
 * las líneas destacadas DE LA FAMILIA ELEGIDA. El carril usa el mismo lenguaje
 * de píldora que `SectorTicker` (redonda, borde gris, verde de marca al
 * activarse), así que no es un patrón nuevo: es el que la portada ya tenía.
 *
 * NADA SE BORRA. Todas las familias siguen enlazadas, con su tagline; las líneas
 * destacadas siguen ahí, ahora agrupadas por familia en vez de barajadas; y
 * el enlace al catálogo completo sigue en el encabezado. Lo que desaparece es
 * la repetición y los 4 s de rotación automática.
 *
 * SIN JAVASCRIPT TAMBIÉN SE LEE: la familia inicial viene renderizada del
 * servidor con sus productos, así que el primer HTML ya trae contenido real y
 * los enlaces de familia son `<Link>` de verdad, no botones falsos.
 */

export type FamiliaResumen = {
  name: string;
  slug: string;
  tagline: string;
  /** Cuántas soluciones tiene la familia en el catálogo. Contado, no escrito. */
  total: number;
  /** Hasta 3 líneas destacadas de la familia. */
  destacados: { slug: string; name: string; shortDescription: string }[];
};

export default function ExplorarCatalogo({ familias }: { familias: FamiliaResumen[] }) {
  const [activa, setActiva] = useState(0);
  const fam = familias[activa];
  if (!fam) return null;

  return (
    <div>
      {/* Carril de familias. `-mx-6 px-6` para que el desplazamiento se
          coma el margen de la portada y no parezca que la fila se corta. */}
      <div
        role="tablist"
        aria-label="Familias de producto"
        className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1"
        onKeyDown={(e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          const sig = (activa + d + familias.length) % familias.length;
          setActiva(sig);
          document.getElementById(`ficha-familia-${sig}`)?.focus();
        }}
      >
        {familias.map((f, i) => {
          const on = i === activa;
          return (
            <button
              key={f.slug}
              id={`ficha-familia-${i}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="panel-familia"
              tabIndex={on ? 0 : -1}
              onClick={() => setActiva(i)}
              className={`shrink-0 inline-flex min-h-[40px] items-center rounded-full border px-4 text-[13px] font-medium whitespace-nowrap transition-colors active:scale-[0.97] ${
                on
                  ? 'border-[#0A2540] bg-[#0A2540] text-white'
                  : 'border-gray-200 bg-white text-[#0A2540] hover:border-[#059669]'
              }`}
            >
              {f.name}
            </button>
          );
        })}
      </div>

      {/* Panel de la familia elegida. */}
      <div
        id="panel-familia"
        role="tabpanel"
        aria-labelledby={`ficha-familia-${activa}`}
        className="mt-4 rounded-3xl border border-gray-100 bg-gray-50 p-5 md:p-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="t-h3 font-semibold tracking-tight text-[#0A2540]">{fam.name}</h3>
          <span className="t-micro tabular-nums text-gray-500">
            {fam.total} {fam.total === 1 ? 'solución' : 'soluciones'}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{fam.tagline}</p>

        {fam.destacados.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
            {fam.destacados.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/productos/${p.slug}`}
                  className="group flex items-center gap-3 py-3 min-h-[44px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-[#0A2540] group-hover:text-[#059669]">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block line-clamp-1 text-xs text-gray-500">
                      {p.shortDescription}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#059669]" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/productos/familia/${fam.slug}`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#059669] hover:underline"
        >
          Ver toda la familia <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
