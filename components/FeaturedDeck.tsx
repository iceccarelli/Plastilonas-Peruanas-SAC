'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

/**
 * Desktop (md+): CADENA de 3 tarjetas que avanza DE UNA EN UNA cada 4s
 *   — la tarjeta 1 sale por la izquierda y la siguiente entra por la derecha,
 *   en bucle infinito sobre TODO el catálogo. El usuario va atrás/adelante.
 * Mobile: baraja de una tarjeta que se auto-desliza al fondo cada 4s; el
 *   usuario desliza en ambos sentidos; siempre muestra "n / total".
 */
export default function FeaturedDeck({ products }: { products: Product[] }) {
  const total = products.length;

  // ── índice de la cabeza de la cadena (compartido web/mobile) ──
  const [head, setHead] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const step = (d: number) => { setDir(d); setHead((h) => (h + d + total) % total); };

  useEffect(() => {
    if (paused || total <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => { setDir(1); setHead((h) => (h + 1) % total); }, 4000);
    return () => clearInterval(id);
  }, [paused, total]);

  // 3 visibles en desktop, empezando por la cabeza (envuelve al final)
  const visible = [0, 1, 2].map((k) => products[(head + k) % total]);

  return (
    <>
      {/* ---------- DESKTOP: cadena de 3, avance de a 1 ---------- */}
      <div
        className="hidden md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-3 gap-6">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: dir * -80, scale: 0.96, position: 'absolute' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5">
          <button onClick={() => step(-1)} aria-label="Anterior" className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#047857] hover:text-[#047857] text-[#0A2540] flex items-center justify-center transition active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-[#0A2540] tabular-nums min-w-[5rem] text-center">
            {head + 1}–{((head + 2) % total) + 1} / {total}
          </div>
          <button onClick={() => step(1)} aria-label="Siguiente" className="w-11 h-11 rounded-full border border-gray-200 hover:border-[#047857] hover:text-[#047857] text-[#0A2540] flex items-center justify-center transition active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ---------- MOBILE: baraja auto-deslizante, todo el catálogo ---------- */}
      <div
        className="md:hidden"
        onTouchStart={() => setPaused(true)}
      >
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.div
              key={products[head].id}
              initial={{ opacity: 0, x: dir * 60, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -60, scale: 0.97, position: 'absolute' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                setPaused(true);
                if (info.offset.x < -60) step(1);
                else if (info.offset.x > 60) step(-1);
              }}
              className="px-1 cursor-grab active:cursor-grabbing"
            >
              <ProductCard product={products[head]} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <button onClick={() => step(-1)} aria-label="Anterior" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-[#0A2540] tabular-nums min-w-[4rem] text-center">{head + 1} / {total}</div>
          <button onClick={() => step(1)} aria-label="Siguiente" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progreso (36 puntos serían demasiados) */}
        <div className="mt-4 mx-auto max-w-[12rem] h-1 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-[#047857] transition-all duration-300" style={{ width: `${((head + 1) / total) * 100}%` }} />
        </div>
      </div>
    </>
  );
}
