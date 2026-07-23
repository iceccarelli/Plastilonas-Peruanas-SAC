'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FilterSheet({
  open, onClose, resultCount, hasActiveFilters, onClear, children,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <motion.div className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-white rounded-t-3xl shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
            <div className="shrink-0 pt-3">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300" />
              <div className="flex items-center justify-between px-6 pb-3 border-b border-gray-100">
                <div className="font-semibold tracking-tight text-[#0A2540]">Filtros</div>
                <div className="flex items-center gap-4">
                  {hasActiveFilters && (
                    <button onClick={onClear} className="text-xs flex items-center gap-1 text-[#059669] hover:underline">
                      <X className="w-3 h-3" /> Limpiar
                    </button>
                  )}
                  <button onClick={onClose} aria-label="Cerrar filtros" className="text-gray-400 hover:text-[#0A2540] p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            <div className="shrink-0 border-t border-gray-100 p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
              <button onClick={onClose}
                className="w-full bg-[#0A2540] hover:bg-[#059669] text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors active:scale-[0.99]">
                Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
