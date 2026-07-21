'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info, Pause, Play } from 'lucide-react';
import { machinery } from '@/lib/machinery';
import SectionHeading from '@/components/SectionHeading';

/**
 * Galería ILUSTRATIVA del proceso — estilo aws.amazon.com.
 *
 * - Escenario central dominante con tarjetas vecinas asomando (solo escritorio).
 * - Deslizamiento tipo Tinder/Bumble: arrastre horizontal con umbral + inercia.
 * - Ken Burns sobre la imagen; las vistas de una misma máquina rotan cada 3 s.
 * - La diapositiva (máquina) avanza sola cada 5 s. Se PAUSA al pasar el cursor
 *   o mantener pulsado, para no molestar a quien lee la ficha.
 * - Móvil: una sola tarjeta, sin vecinos.
 *
 * Honestidad: rotulada como ilustrativa; no es foto de la planta.
 * Robustez: una imagen que no cargue no rompe el escenario (respaldo con título).
 */

const SLIDE_MS = 5000; // avance automático de máquina
const KENBURNS_MS = 3000; // rotación de vista dentro de la máquina
const SWIPE_DISTANCE = 60; // px
const SWIPE_VELOCITY = 400; // px/s

export default function MachineryGallery() {
  const total = machinery.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [view, setView] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const regionRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const didMountRef = useRef(false);

  const item = machinery[index];
  const views = item.views;
  const current = views[view % views.length];

  const paginate = useCallback(
    (d: number) => {
      setDir(d);
      setView(0);
      setIndex((p) => (p + d + total) % total);
    },
    [total]
  );

  const goTo = useCallback(
    (target: number) => {
      if (target === index) return;
      setDir(target > index ? 1 : -1);
      setView(0);
      setIndex(target);
    },
    [index]
  );

  const running = autoplay && !paused;

  // Avance de máquina cada 5 s.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => paginate(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [running, index, paginate]);

  // Rotación de vista (Ken Burns) cada 3 s dentro de la máquina activa.
  useEffect(() => {
    if (!running || views.length <= 1) return;
    const t = setInterval(() => setView((v) => (v + 1) % views.length), KENBURNS_MS);
    return () => clearInterval(t);
  }, [running, views.length, index]);

  // Teclado ←/→ con foco en la galería.
  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); paginate(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); paginate(-1); }
      if (e.key === ' ') { e.preventDefault(); setAutoplay((a) => !a); }
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [paginate]);

  // Autocentrar miniatura activa — SOLO tras interacción del usuario, nunca en
  // el montaje. Y el desplazamiento se limita al carril del filmstrip (eje X),
  // para que jamás mueva la página en vertical al cargar.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // no hacer scroll en la carga inicial
    }
    const thumb = activeThumbRef.current;
    const strip = thumb?.parentElement;
    if (!thumb || !strip) return;
    const target =
      thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({ left: target, behavior: 'smooth' });
  }, [index]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (!swipe) return;
    paginate(info.offset.x < 0 ? 1 : -1);
  };

  // Vecinos para el efecto AWS (asoman a los lados, solo escritorio).
  const prevItem = machinery[(index - 1 + total) % total];
  const nextItem = machinery[(index + 1) % total];

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d >= 0 ? '60%' : '-60%', opacity: 0, scale: 0.96 }),
      center: { x: 0, opacity: 1, scale: 1 },
      exit: (d: number) => ({ x: d >= 0 ? '-60%' : '60%', opacity: 0, scale: 0.96 }),
    }),
    []
  );

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Cómo se fabrica"
          title="El proceso, paso a paso"
          description="Doce categorías de maquinaria que intervienen en la fabricación de textiles industriales — para que vea exactamente qué hay detrás de cada Big Bag, geomembrana y carpa."
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-5">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Imágenes ilustrativas de las categorías de maquinaria del sector; no
            corresponden a una fotografía específica de nuestra planta.
          </p>
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            aria-label={autoplay ? 'Pausar reproducción' : 'Reproducir'}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0A2540] transition"
          >
            {autoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoplay ? 'Pausar' : 'Reproducir'}
          </button>
        </div>

        {/* ===== Escenario estilo AWS ===== */}
        <div
          ref={regionRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carrusel"
          aria-label="Galería del proceso de fabricación"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-4 rounded-2xl"
        >
          <div className="relative flex items-stretch justify-center gap-4">
            {/* Vecino izquierdo (asoma, solo escritorio) */}
            <NeighborCard item={prevItem} side="left" onClick={() => paginate(-1)} failed={failed} setFailed={setFailed} />

            {/* Tarjeta central */}
            <div className="relative w-full lg:w-[68%] shrink-0">
              <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A2540] shadow-xl">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={index}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  >
                    {/* Ken Burns: cross-fade + lento zoom/pan por vista */}
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={view % views.length}
                        initial={{ opacity: 0, scale: 1.12 }}
                        animate={{ opacity: 1, scale: 1.0 }}
                        exit={{ opacity: 0 }}
                        transition={{ opacity: { duration: 0.9 }, scale: { duration: KENBURNS_MS / 1000 + 1, ease: 'linear' } }}
                        className="absolute inset-0"
                      >
                        {failed[current.webp] ? (
                          <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                            {item.titulo}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={current.webp}
                            alt={item.alt}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            onError={() => setFailed((f) => ({ ...f, [current.webp]: true }))}
                            className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/70 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 pointer-events-none">
                      <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#34d399] font-semibold mb-2">
                        Paso {item.orden} de {total} · {item.linea}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                        {item.titulo}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-white/85 max-w-2xl">
                        {item.caption}
                      </p>
                      {/* Puntos de vista (Ken Burns) */}
                      {views.length > 1 && (
                        <div className="flex gap-1.5 mt-4">
                          {views.map((_, vi) => (
                            <span
                              key={vi}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                vi === view % views.length ? 'w-5 bg-[#34d399]' : 'w-1.5 bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controles */}
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Máquina anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Máquina siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-lg transition"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Vecino derecho */}
            <NeighborCard item={nextItem} side="right" onClick={() => paginate(1)} failed={failed} setFailed={setFailed} />
          </div>
        </div>

        {/* Contador + barra de progreso de máquinas */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <span className="text-xs font-medium text-gray-500 tabular-nums">
            {String(item.orden).padStart(2, '0')} / {total}
          </span>
          <div className="hidden sm:flex gap-1">
            {machinery.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                aria-label={`Ir a ${m.titulo}`}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all ${i === index ? 'w-6 bg-[#059669]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Filmstrip con nombres */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x
                     [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5
                     [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
          role="tablist"
          aria-label="Seleccionar máquina"
        >
          {machinery.map((m, i) => {
            const t = m.views[0];
            const active = i === index;
            return (
              <button
                key={m.slug}
                ref={active ? activeThumbRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${m.orden}. ${m.titulo}`}
                onClick={() => goTo(i)}
                className={`group relative shrink-0 snap-start w-36 sm:w-44 rounded-xl overflow-hidden text-left ring-1 transition-all ${
                  active ? 'ring-2 ring-[#059669] shadow-md' : 'ring-gray-200 hover:ring-gray-400 hover:shadow-sm'
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
                      className={`h-full w-full object-cover transition ${active ? '' : 'opacity-80 group-hover:opacity-100'}`}
                    />
                  )}
                  <span className="absolute top-1.5 left-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[#0A2540]/85 text-white text-[10px] font-semibold tabular-nums">
                    {m.orden}
                  </span>
                </div>
                <div className={`px-2.5 py-2 ${active ? 'bg-[#059669]/5' : 'bg-white'}`}>
                  <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-[#0A2540]' : 'text-gray-600'}`}>
                    {m.titulo}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Deslice para explorar · las vistas rotan solas · pase el cursor para pausar
        </p>
      </div>
    </section>
  );
}

/* Tarjeta vecina que asoma a los lados (solo escritorio, estilo AWS). */
function NeighborCard({
  item,
  side,
  onClick,
  failed,
  setFailed,
}: {
  item: (typeof machinery)[number];
  side: 'left' | 'right';
  onClick: () => void;
  failed: Record<string, boolean>;
  setFailed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const v = item.views[0];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver ${item.titulo}`}
      tabIndex={-1}
      className={`relative hidden lg:block w-[16%] shrink-0 rounded-2xl overflow-hidden opacity-55 hover:opacity-80 transition ${
        side === 'left' ? 'origin-right' : 'origin-left'
      }`}
    >
      <div className="relative aspect-[16/9] h-full bg-[#0A2540]">
        {!failed[v.webp] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.webp}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed((f) => ({ ...f, [v.webp]: true }))}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[#0A2540]/30" />
      </div>
    </button>
  );
}
