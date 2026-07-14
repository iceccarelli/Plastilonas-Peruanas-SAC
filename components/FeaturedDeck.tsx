'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

/**
 * Mobile: paged swipe carousel (one card + peek + N/total pager, AWS-style).
 * Desktop (md+): the normal responsive grid. Desktop is untouched.
 */
export default function FeaturedDeck({ products }: { products: Product[] }) {
  const [i, setI] = useState(0);
  const total = products.length;
  const go = (dir: number) => setI((p) => (p + dir + total) % total);

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Mobile swipe deck */}
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
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="px-1 cursor-grab active:cursor-grabbing"
            >
              <ProductCard product={products[i]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pager: ‹  n / total  › */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-[#0A2540] tabular-nums min-w-[3.5rem] text-center">
            {i + 1} / {total}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {products.map((_, d) => (
            <button
              key={d}
              onClick={() => setI(d)}
              aria-label={`Ir a producto ${d + 1}`}
              className={`h-1.5 rounded-full transition-all ${d === i ? 'w-6 bg-[#059669]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
