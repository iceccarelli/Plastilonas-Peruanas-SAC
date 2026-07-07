'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart, cartSubtotal } from '@/lib/cart-store';
import { formatPEN, IGV_RATE } from '@/lib/format';

export default function CarritoPage() {
  const { items, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  if (!mounted) {
    return <div className="max-w-5xl mx-auto px-6 py-20" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link href="/productos" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Seguir comprando
      </Link>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="mb-6">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="inline-block bg-[#0A2540] hover:bg-[#059669] text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Líneas */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex-1">
                  <p className="font-medium text-[#0A2540]">{item.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {formatPEN(item.price)}{item.unit ? ` / ${item.unit}` : ''}
                  </p>
                </div>
                <div className="inline-flex items-center border border-gray-200 rounded-full">
                  <button onClick={() => setQuantity(item.slug, item.quantity - 1)} className="p-2 text-gray-500 hover:text-[#0A2540]" aria-label="Disminuir">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => setQuantity(item.slug, item.quantity + 1)} className="p-2 text-gray-500 hover:text-[#0A2540]" aria-label="Aumentar">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-28 text-right font-semibold text-[#0A2540]">
                  {formatPEN(item.price * item.quantity)}
                </div>
                <button onClick={() => remove(item.slug)} className="text-gray-300 hover:text-red-500" aria-label="Quitar">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl p-7 sticky top-28">
              <h2 className="font-semibold text-lg text-[#0A2540] mb-5">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-[#0A2540] font-medium">{formatPEN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IGV (18%)</span>
                  <span className="text-[#0A2540] font-medium">{formatPEN(igv)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Envío</span>
                  <span>Se calcula en el checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold text-[#0A2540]">Total</span>
                  <span className="text-2xl font-semibold text-[#0A2540]">{formatPEN(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full text-center bg-[#0A2540] hover:bg-[#059669] text-white font-semibold py-3.5 rounded-2xl transition-colors active:scale-[0.99]"
              >
                Ir a pagar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
