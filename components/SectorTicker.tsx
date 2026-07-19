'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

/**
 * Marquee de sectores: fluye de derecha a izquierda, en bucle continuo.
 * El número mostrado es REAL: la cantidad de soluciones de nuestro catálogo
 * disponibles para ese sector (calculada desde lib/products.ts). No son
 * métricas inventadas — se actualiza solo al agregar productos.
 */
export default function SectorTicker({
  items,
}: {
  items: { sector: string; count: number }[];
}) {
  // Duplicamos la lista para lograr un bucle sin costuras.
  const loop = [...items, ...items];

  return (
    <div className="ticker-wrap group -mx-6 px-6 mb-8" aria-label="Sectores atendidos">
      <div className="ticker-track">
        {loop.map((it, i) => (
          <Link
            key={`${it.sector}-${i}`}
            href={`/productos?sector=${encodeURIComponent(it.sector)}`}
            className="ticker-item inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-[#059669] transition-colors"
            aria-hidden={i >= items.length}
            tabIndex={i >= items.length ? -1 : 0}
          >
            <span className="text-sm font-medium text-[#0A2540] whitespace-nowrap">{it.sector}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] tabular-nums">
              <TrendingUp className="w-3 h-3" />
              {it.count}
            </span>
            <span className="t-micro text-gray-400 whitespace-nowrap">soluciones</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
