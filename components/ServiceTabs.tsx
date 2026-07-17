'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, HardHat, Ship, Lightbulb, ArrowRight, Check, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { ruler: Ruler, hardhat: HardHat, ship: Ship, lightbulb: Lightbulb };

type Svc = { title: string; desc: string; icon: string };

/**
 * Explorador de servicios por pestañas (patrón tipo AWS).
 * Desktop: lista vertical de pestañas + panel de detalle.
 * Mobile: pestañas en fila deslizable + panel debajo.
 */
export default function ServiceTabs({ services }: { services: Svc[] }) {
  const [active, setActive] = useState(0);
  const svc = services[active];
  const Icon = ICONS[svc.icon] ?? Ruler;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-10">
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
              className={`shrink-0 lg:shrink text-left flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-200 ${
                on
                  ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-lg shadow-[#0A2540]/15'
                  : 'bg-white border-gray-200 text-[#0A2540] hover:border-[#059669]'
              }`}
            >
              <I className={`w-5 h-5 shrink-0 ${on ? 'text-[#10B981]' : 'text-gray-400'}`} />
              <span className="font-medium text-sm whitespace-nowrap lg:whitespace-normal">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Panel de detalle */}
      <div className="relative bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 min-h-[16rem] flex">
        <AnimatePresence mode="wait">
          <motion.div
            key={svc.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col w-full"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white flex items-center justify-center mb-5">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-2xl md:text-3xl tracking-tight text-[#0A2540] mb-3">{svc.title}</h3>
            <p className="text-gray-600 leading-relaxed text-[15px] md:text-base max-w-2xl mb-6">{svc.desc}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Check className="w-4 h-4 text-[#059669]" /> Incluido en todos nuestros proyectos
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/cotizacion" className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-colors">
                Solicitar cotización <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/servicios" className="inline-flex items-center gap-2 border border-gray-200 hover:border-[#059669] text-[#0A2540] px-6 py-3 rounded-2xl text-sm font-medium transition-colors">
                Ver todos los servicios
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
