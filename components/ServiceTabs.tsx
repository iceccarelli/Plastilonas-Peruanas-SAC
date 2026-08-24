'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, HardHat, Ship, Lightbulb, ArrowRight, Check, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { ruler: Ruler, hardhat: HardHat, ship: Ship, lightbulb: Lightbulb };

/**
 * FOTOS DE SERVICIO — resueltas en el servidor, no adivinadas aquí.
 *
 * La versión anterior construía la ruta con `/images/${base}${ph === 1 ? '-2' : ''}.jpg`
 * y un comentario prometía que «si alguna falta, cae con elegancia (sin ícono
 * roto)». No caía: nunca existieron servicio-fabricacion-2.jpg ni
 * servicio-instalacion-2.jpg, y cada carga de la portada lanzaba
 *
 *   ⨯ The requested resource isn't a valid image for /images/servicio-instalacion-2.webp
 *
 * Un componente de cliente no puede mirar el disco, así que la promesa era
 * imposible de cumplir desde aquí. Ahora el servidor resuelve qué tomas
 * existen —con `tomasDe`, el mismo mecanismo de la galería de producto, que
 * además descarta las copias byte a byte— y las pasa ya resueltas. Si un
 * servicio tiene una sola foto, se muestra fija; si aparece una segunda, el
 * cruce se activa solo con dejar el archivo en su sitio.
 */
type Svc = { title: string; desc: string; icon: string; tomas: string[] };

export default function ServiceTabs({ services }: { services: Svc[] }) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);      // 0 = foto A, 1 = foto B (crossfade Ken Burns)
  const [hover, setHover] = useState(false);
  const svc = services[active];
  const Icon = ICONS[svc.icon] ?? Ruler;
  const tomas = svc.tomas?.length ? svc.tomas : [];

  // Auto-avance de pestañas cada 5s (pausa al pasar el cursor / prefiere menos movimiento).
  useEffect(() => {
    if (hover) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % services.length), 5000);
    return () => clearInterval(id);
  }, [hover, services.length]);

  // Cruce entre las tomas del servicio activo cada 3.5s.
  useEffect(() => {
    setPhase(0);
    // Con una sola toma no hay nada que alternar: mantener el intervalo solo
    // gastaría renders y provocaría un cruce de la imagen contra sí misma.
    if (tomas.length < 2) return;
    const id = setInterval(() => setPhase((p) => (p + 1) % tomas.length), 3500);
    return () => clearInterval(id);
  }, [active, tomas.length]);

  return (
    <div
      className="grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-10"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Pestañas */}
      <div className="no-scrollbar flex lg:flex-col gap-2 overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
        {services.map((s, i) => {
          const I = ICONS[s.icon] ?? Ruler;
          const on = i === active;
          return (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              aria-pressed={on}
              className={`shrink-0 lg:shrink text-left flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 ${
                on ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-lg shadow-[#0A2540]/15'
                   : 'bg-white border-gray-200 text-[#0A2540] hover:border-[#047857]'
              }`}
            >
              <I className={`w-5 h-5 shrink-0 ${on ? 'text-[#10B981]' : 'text-gray-400'}`} />
              <span className="font-medium text-sm whitespace-nowrap lg:whitespace-normal">{s.title}</span>
              {on && <span className="ml-auto hidden lg:block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Panel con fotos de fondo (Ken Burns + crossfade) y texto sobre velo */}
      <div className="relative rounded-3xl overflow-hidden min-h-[22rem] flex border border-gray-100 bg-[#0A2540]">
        {/* Capa de fotos */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {tomas.map((_, ph) =>
              ph === phase ? (
                <motion.div
                  key={`${svc.icon}-${ph}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  className="absolute inset-0 ken-burns-wrap"
                >
                  <Image
                    src={tomas[ph] ?? tomas[0]}
                    alt={svc.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="ken-burns object-cover"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
          {/* Velo para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540]/95 via-[#0A2540]/80 to-[#0A2540]/40" />
        </div>

        {/* Texto */}
        <div className="relative z-10 p-8 md:p-10 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col w-full max-w-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#047857] text-white flex items-center justify-center mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-2xl md:text-3xl tracking-tight text-white mb-3">{svc.title}</h3>
              <p className="text-white/80 leading-relaxed t-body md:text-base mb-6">{svc.desc}</p>
              <div className="flex items-center gap-2 text-sm text-white/70 mb-8">
                <Check className="w-4 h-4 text-[#10B981]" /> Incluido en todos nuestros proyectos
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link href="/cotizacion" className="inline-flex items-center gap-2 bg-white text-[#0A2540] hover:bg-[#10B981] hover:text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-colors">
                  Solicitar cotización <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/servicios" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-colors">
                  Ver todos los servicios
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
