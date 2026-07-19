'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

/**
 * Desktop (md+): carrusel paginado de 3 tarjetas que AVANZA SOLO cada 4s
 * (patrón tipo Amazon "productos relacionados", pero sin estilo de descuento).
 * El usuario puede ir atrás/adelante; al interactuar se pausa unos segundos.
 * Mobile: una tarjeta deslizable con paginador.
 */
export default function FeaturedDeck({ products }: { products: Product[] }) {
  const perView = 3;
  const pages = Math.ceil(products.length / perView);

  // ── Desktop ──
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const goPage = (d: number) => { setDir(d); setPage((p) => (p + d + pages) % pages); };

  useEffect(() => {
    if (paused || pages <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => { setDir(1); setPage((p) => (p + 1) % pages); }, 4000);
    return () => clearInterval(id);
  }, [paused, pages]);

  const pageItems = products.slice(page * perView, page * perView + perView);

  // ── Mobile ──
  const [i, setI] = useState(0);
  const total = products.length;
  const go = (d: number) => setI((p) => (p + d + total) % total);

  return (
    <>
      {/* ---------- DESKTOP ---------- */}
      <div
        className="hidden md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controles: ‹  ●●●  ›  con paginador */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button onClick={() => goPage(-1)} aria-label="Anteriores" className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#047857] hover:text-[#047857] text-[#0A2540] flex items-center justify-center transition active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, p) => (
              <button
                key={p}
                onClick={() => { setDir(p > page ? 1 : -1); setPage(p); }}
                aria-label={`Página ${p + 1}`}
                className={`h-2 rounded-full transition-all ${p === page ? 'w-8 bg-[#047857]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
          <button onClick={() => goPage(1)} aria-label="Siguientes" className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#047857] hover:text-[#047857] text-[#0A2540] flex items-center justify-center transition active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ---------- MOBILE ---------- */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={products[i].id}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }}
              className="px-1 cursor-grab active:cursor-grabbing"
            >
              <ProductCard product={products[i]} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-5 flex items-center justify-center gap-4">
          <button onClick={() => go(-1)} aria-label="Anterior" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-[#0A2540] tabular-nums min-w-[3.5rem] text-center">{i + 1} / {total}</div>
          <button onClick={() => go(1)} aria-label="Siguiente" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {products.map((_, d) => (
            <button key={d} onClick={() => setI(d)} aria-label={`Producto ${d + 1}`} className={`h-1.5 rounded-full transition-all ${d === i ? 'w-6 bg-[#047857]' : 'w-1.5 bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </>
  );
}
