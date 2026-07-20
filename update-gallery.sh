#!/usr/bin/env bash
# ============================================================================
# update-gallery.sh — Rediseña la galería del proceso (carrusel + filmstrip
# amplio con nombres, 2.ª vista al hover). Solo reescribe el componente;
# lib/machinery.ts, las imágenes y el cableado de la home NO se tocan.
# Idempotente: sobrescribe el componente con la versión nueva.
# ============================================================================
set -euo pipefail
[ -f components/MachineryGallery.tsx ] || { echo "MISS: no encuentro components/MachineryGallery.tsx (¿está la galería instalada?)"; exit 1; }
[ -f lib/machinery.ts ] || { echo "MISS: falta lib/machinery.ts"; exit 1; }

cat > components/MachineryGallery.tsx <<'PLASTILONAS_EOF_MARKER_9c3f'
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { machinery } from '@/lib/machinery';
import SectionHeading from '@/components/SectionHeading';

/**
 * Galería ILUSTRATIVA del proceso de fabricación.
 *
 * Educa al comprador sobre CÓMO se fabrican los productos de Plastilonas,
 * mostrando las categorías de maquinaria del sector. Rotulada de forma
 * explícita como ilustrativa (no es foto de planta): esa honestidad es
 * justamente lo que premia un ingeniero de compras.
 *
 * Distribución (estilo corporativo AWS/Square):
 *  - Carrusel protagonista arriba, con swipe/drag, teclado ←/→ y flechas.
 *  - La 2.ª vista de cada máquina se revela al pasar el cursor / mantener
 *    pulsado sobre la imagen (etiqueta "Ver otra vista" como pista).
 *  - Filmstrip inferior amplia: miniaturas grandes CON NOMBRE, desplazable,
 *    que transmite de un vistazo la amplitud (las 12 máquinas). La activa
 *    se autocentra.
 *
 * Robustez: una miniatura que no cargue muestra un marcador con su número y
 * nombre (nunca un ícono roto ni un tile en blanco). `prefers-reduced-motion`
 * lo respeta framer-motion automáticamente en las transiciones.
 */

const SWIPE_CONFIDENCE = 60; // px mínimos de arrastre para cambiar de slide

export default function MachineryGallery() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showAlt, setShowAlt] = useState(false); // 2.ª vista al hover/press
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const regionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  const total = machinery.length;
  const item = machinery[index];
  const primary = item.variants[0];
  const alt = item.variants[1] ?? item.variants[0];
  const hasAlt = item.variants.length > 1;
  const shown = showAlt && hasAlt ? alt : primary;

  const go = useCallback(
    (dir: number) => {
      setShowAlt(false);
      setDirection(dir);
      setIndex((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  const jump = useCallback(
    (target: number) => {
      setShowAlt(false);
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    },
    [index]
  );

  // Teclado solo con foco en la galería (no secuestra la página).
  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [go]);

  // Autocentrar la miniatura activa en el filmstrip.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [index]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_CONFIDENCE) go(1);
    else if (info.offset.x > SWIPE_CONFIDENCE) go(-1);
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Cómo se fabrica"
          title="El proceso, paso a paso"
          description="Doce categorías de maquinaria que intervienen en la fabricación de textiles industriales — para que vea exactamente qué hay detrás de cada Big Bag, geomembrana y carpa."
          className="mb-8"
        />

        {/* Aviso de honestidad: ilustraciones del proceso, no fotos de planta. */}
        <p className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Imágenes ilustrativas de las categorías de maquinaria del sector; no
          corresponden a una fotografía específica de nuestra planta.
        </p>

        {/* ===== Carrusel protagonista ===== */}
        <div
          ref={regionRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carrusel"
          aria-label="Galería del proceso de fabricación"
          className="relative rounded-2xl overflow-hidden bg-[#0A2540] outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:6px_6px] opacity-40" />

          <div
            className="relative aspect-[16/10] md:aspect-[16/7]"
            onMouseEnter={() => setShowAlt(true)}
            onMouseLeave={() => setShowAlt(false)}
            onTouchStart={() => setShowAlt(true)}
            onTouchEnd={() => setShowAlt(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -80 : 80 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                {/* Vista primaria (siempre montada) */}
                {!failed[primary.webp] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primary.webp}
                    alt={item.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    onError={() => setFailed((f) => ({ ...f, [primary.webp]: true }))}
                    className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none"
                  />
                )}
                {/* 2.ª vista, encima, revelada por opacidad al hover/press */}
                {hasAlt && !failed[alt.webp] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={alt.webp}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onError={() => setFailed((f) => ({ ...f, [alt.webp]: true }))}
                    className={`absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none transition-opacity duration-500 ${
                      showAlt ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
                {/* Respaldo si ambas fallan */}
                {failed[primary.webp] && (!hasAlt || failed[alt.webp]) && (
                  <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                    {item.titulo}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/70 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Rótulo */}
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 pointer-events-none">
              <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#34d399] font-semibold mb-1.5">
                Paso {item.orden} de {total} · {item.linea}
              </span>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                {item.titulo}
              </h3>
              <p className="mt-1.5 text-sm md:text-base text-white/80 max-w-2xl">
                {item.caption}
              </p>
            </div>

            {/* Pista de 2.ª vista */}
            {hasAlt && (
              <div className="absolute top-3 right-3 text-xs font-medium bg-white/90 text-[#0A2540] rounded-full px-3 py-1.5 shadow-md pointer-events-none">
                {showAlt ? 'Vista alterna' : 'Ver otra vista'}
              </div>
            )}

            {/* Controles */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Máquina anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-md transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Máquina siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-md transition"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contador + progreso */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <span className="text-xs font-medium text-gray-500 tabular-nums">
            {String(item.orden).padStart(2, '0')} / {total}
          </span>
          <div className="hidden sm:flex gap-1">
            {machinery.map((m, i) => (
              <span
                key={m.slug}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-6 bg-[#059669]' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== Filmstrip amplio: miniaturas grandes con nombre ===== */}
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory
                     [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5
                     [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
          role="tablist"
          aria-label="Seleccionar máquina"
        >
          {machinery.map((m, i) => {
            const t = m.variants[0];
            const active = i === index;
            return (
              <button
                key={m.slug}
                ref={active ? activeThumbRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${m.orden}. ${m.titulo}`}
                onClick={() => jump(i)}
                className={`group relative shrink-0 snap-start w-36 sm:w-44 rounded-xl overflow-hidden text-left
                           ring-1 transition-all ${
                  active
                    ? 'ring-2 ring-[#059669] shadow-md'
                    : 'ring-gray-200 hover:ring-gray-400 hover:shadow-sm'
                }`}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {failed[t.thumb] ? (
                    <span className="absolute inset-0 grid place-items-center text-gray-400 text-xs font-medium px-2 text-center">
                      {m.orden}. {m.titulo}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailed((f) => ({ ...f, [t.thumb]: true }))}
                      className={`h-full w-full object-cover transition ${
                        active ? '' : 'opacity-80 group-hover:opacity-100'
                      }`}
                    />
                  )}
                  <span className="absolute top-1.5 left-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[#0A2540]/85 text-white text-[10px] font-semibold tabular-nums">
                    {m.orden}
                  </span>
                </div>
                <div className={`px-2.5 py-2 ${active ? 'bg-[#059669]/5' : 'bg-white'}`}>
                  <p className={`text-xs font-medium leading-snug line-clamp-2 ${
                    active ? 'text-[#0A2540]' : 'text-gray-600'
                  }`}>
                    {m.titulo}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Deslice para ver las 12 máquinas · pase el cursor sobre la imagen para una vista alterna
        </p>
      </div>
    </section>
  );
}
PLASTILONAS_EOF_MARKER_9c3f
echo "ok   components/MachineryGallery.tsx actualizado (carrusel + filmstrip amplio)"
echo "----"
echo "Verifique:  rm -rf .next && npm run build"
echo "Luego:      git add components/MachineryGallery.tsx && git commit -m \"feat(gallery): filmstrip amplio con nombres + 2.a vista al hover\""
