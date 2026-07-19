'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowRight, Phone } from 'lucide-react';
import { useExitIntent } from '@/lib/useExitIntent';

export default function ExitIntentModal() {
  const { open, close } = useExitIntent();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key === 'Tab' && focusables && focusables.length) {
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus.current?.focus();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-[#0A2540]/70 backdrop-blur-sm" aria-hidden="true" onClick={close} />
          <motion.div
            ref={panelRef}
            role="dialog" aria-modal="true" aria-labelledby="exit-title"
            className="relative w-full max-w-[440px] bg-white rounded-[24px] shadow-2xl p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
          >
            <button onClick={close} aria-label="Cerrar" className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-[#047857]" />
              <span className="t-micro font-semibold text-[#047857] uppercase tracking-[0.12em]">Antes de irse</span>
            </div>

            <h2 id="exit-title" className="font-[family-name:var(--font-display)] text-2xl md:text-[1.75rem] leading-tight text-[#0A2540] mb-4">
              La mayoría se va sin saber si fabricamos su especificación exacta.
            </h2>

            <p className="text-gray-600 leading-relaxed mb-7 text-[0.95rem]">
              Lo hacemos — a medida, con ficha técnica del fabricante en cada cotización. Cuéntenos qué necesita y le respondemos con un rango y disponibilidad, sin formularios largos ni llamadas de venta.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/cotizacion" onClick={close} className="btn btn-accent w-full justify-center">
                Cotización en 1 minuto <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://wa.me/51946085270" target="_blank" rel="noopener noreferrer" onClick={close} className="btn btn-ghost w-full justify-center">
                Hablar por WhatsApp
              </a>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              O llame al <a href="tel:+51998117065" className="text-[#047857] font-semibold hover:underline">+51 998 117 065</a> · Lun–Sáb, 8 AM – 7 PM
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
