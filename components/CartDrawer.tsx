'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart, cartSubtotal } from '@/lib/cart-store';
import { formatPEN } from '@/lib/format';

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);

  return (
    <AnimatePresence>
      {mounted && isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#0A2540] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Tu carrito
              </h2>
              <button onClick={close} aria-label="Cerrar" className="text-gray-400 hover:text-[#0A2540]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-gray-400">
                <ShoppingCart className="w-10 h-10 mb-4 opacity-40" />
                <p>Tu carrito está vacío.</p>
                <Link href="/productos" onClick={close} className="mt-6 text-sm font-medium text-[#059669] hover:underline">
                  Ver catálogo
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.slug} className="flex gap-4 border-b border-gray-50 pb-4">
                      <div className="flex-1">
                        <p className="font-medium text-[#0A2540] text-sm leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPEN(item.price)}
                          {item.unit ? ` / ${item.unit}` : ''}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="inline-flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => setQuantity(item.slug, item.quantity - 1)}
                              className="p-1.5 text-gray-500 hover:text-[#0A2540]"
                              aria-label="Disminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.slug, item.quantity + 1)}
                              className="p-1.5 text-gray-500 hover:text-[#0A2540]"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.slug)}
                            className="text-gray-300 hover:text-red-500"
                            aria-label="Quitar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#0A2540] whitespace-nowrap">
                        {formatPEN(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Subtotal (sin IGV)</span>
                    <span className="font-semibold text-[#0A2540]">{formatPEN(subtotal)}</span>
                  </div>
                  <p className="text-xs text-gray-400">El IGV (18%) y el envío se calculan en el checkout.</p>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="block w-full text-center bg-[#0A2540] hover:bg-[#059669] text-white font-semibold py-3.5 rounded-2xl transition-colors active:scale-[0.99]"
                  >
                    Ir a pagar
                  </Link>
                  <Link
                    href="/carrito"
                    onClick={close}
                    className="block text-center text-sm text-gray-400 hover:text-[#0A2540]"
                  >
                    Ver carrito completo
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
