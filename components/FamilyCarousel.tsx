'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type Fam = { name: string; slug: string; tagline: string };

/**
 * Carrusel de familias: avanza solo cada 4s (derecha -> izquierda) para dar
 * sensación de sitio "vivo". El usuario puede adelantar/retroceder cuando
 * quiera; al interactuar, la reproducción automática se pausa y se reanuda.
 * Respeta prefers-reduced-motion.
 */
export default function FamilyCarousel({ families }: { families: Fam[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const step = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const w = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * w, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => step(1), 4000);
    return () => clearInterval(id);
  }, [paused]);

  const hold = () => setPaused(true);
  const release = () => setTimeout(() => setPaused(false), 6000);

  return (
    <div className="relative">
      <div
        ref={ref}
        onMouseEnter={hold}
        onMouseLeave={release}
        onTouchStart={hold}
        onTouchEnd={release}
        className="no-scrollbar flex gap-4 overflow-x-auto -mx-6 px-6 pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {families.map((fam) => (
          <Link
            key={fam.slug}
            data-card
            href={`/productos?categoria=${encodeURIComponent(fam.name)}`}
            className="group shrink-0 basis-[82%] sm:basis-[46%] lg:basis-[31%] bg-white border border-gray-100 hover:border-[#059669] hover:shadow-lg rounded-3xl p-6 flex items-center justify-between gap-4 transition-all duration-300"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div>
              <div className="font-semibold text-lg tracking-tight text-[#0A2540] group-hover:text-[#059669] transition-colors">{fam.name}</div>
              <div className="text-sm text-gray-500 mt-1">{fam.tagline}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#059669] group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button onClick={() => { hold(); step(-1); release(); }} aria-label="Anterior" className="w-9 h-9 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400">{paused ? 'en pausa' : 'avanza solo'}</span>
        <button onClick={() => { hold(); step(1); release(); }} aria-label="Siguiente" className="w-9 h-9 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
