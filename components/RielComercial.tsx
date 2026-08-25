import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { rielPara, clusterDeRuta, type Cluster } from '@/lib/search/topic-map';

/**
 * RIEL DE TÉRMINOS COMERCIALES.
 *
 * QUÉ RESUELVE. El grafo interno de este sitio va de arriba abajo: la portada
 * enlaza el catálogo, el catálogo la familia, la familia la ficha. Lo que casi
 * no existía era el enlace LATERAL —de la ficha de geomembrana HDPE a la de
 * geotextiles, que es lo siguiente que compra la misma persona— y ése es
 * precisamente el que reparte autoridad entre páginas comerciales en vez de
 * acumularla en la portada.
 *
 * DE DÓNDE SALEN LOS DESTINOS. De data/topic-map.json, no de una lista escrita
 * a mano en cada página: se enlaza la página CANÓNICA de cada clúster vecino, y
 * el texto del enlace es el término por el que esa página compite. Eso hace dos
 * cosas a la vez —da al lector la salida que necesita y le dice al buscador por
 * qué término entiende esta página a aquélla— sin repetir una palabra clave en
 * el cuerpo del texto.
 *
 * LO QUE NO HACE. No vuelca términos. Un bloque con las 647 variantes del mapa
 * sería relleno de palabras clave, y hoy eso no posiciona: se descuenta. Se
 * enlazan como mucho seis vecinos, con su nombre normal.
 */

interface Props {
  /** Ruta de la página que monta el riel, sin dominio. */
  ruta: string;
  /** Cuántos vecinos como máximo. Seis caben en dos filas sin empujar nada. */
  limite?: number;
  titulo?: string;
  className?: string;
}

const ETIQUETA: Record<Cluster['intencion'], string> = {
  comercial: 'Producto',
  sector: 'Sector',
  decision: 'Cómo elegir',
  calculo: 'Calcular',
  transaccional: 'Cotizar',
  local: 'Cobertura',
  entidad: 'La empresa',
};

export default function RielComercial({
  ruta,
  limite = 6,
  titulo = 'Relacionado en el catálogo',
  className = '',
}: Props) {
  const vecinos = rielPara(ruta, limite);
  if (vecinos.length === 0) return null;

  const propio = clusterDeRuta(ruta);

  return (
    <nav
      aria-label="Soluciones relacionadas"
      className={`mt-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 ${className}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {titulo}
      </h2>
      {propio ? (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Esta página es la respuesta de referencia para <strong>{propio.termino}</strong>. Lo que
          suele necesitarse junto a ella:
        </p>
      ) : null}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {vecinos.map((c) => (
          <li key={c.id}>
            <Link
              href={c.canonica}
              className="group flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white dark:hover:bg-white/10"
            >
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-[#059669] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
              <span>
                <span className="block font-medium text-[#0A2540] dark:text-white">{c.termino}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {ETIQUETA[c.intencion]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
