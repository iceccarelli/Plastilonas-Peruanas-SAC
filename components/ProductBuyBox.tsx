'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-store';
import { formatPEN } from '@/lib/format';

export default function ProductBuyBox({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product.purchasable || typeof product.price !== 'number') return null;

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mb-8 rounded-3xl border border-gray-100 bg-gray-50 p-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-sm text-gray-500 mb-1">Precio de lista</div>
          <div className="text-[#0A2540]">
            <span className="text-4xl font-semibold tracking-tight">{formatPEN(product.price)}</span>
            {product.priceUnit && <span className="text-gray-400 text-base"> / {product.priceUnit}</span>}
          </div>
          <div className="text-xs text-gray-400 mt-1">IGV (18%) calculado al pagar</div>
        </div>
        <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <ShoppingCart className="w-3 h-3" /> Compra en línea
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center border border-gray-200 rounded-full bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-gray-500 hover:text-[#0A2540]" aria-label="Disminuir">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="p-2.5 text-gray-500 hover:text-[#0A2540]" aria-label="Aumentar">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]"
        >
          {added ? (
            <><Check className="w-4 h-4" /> Agregado</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Agregar al carrito</>
          )}
        </button>
      </div>

      <Link href="/carrito" className="mt-3 block text-center text-sm text-gray-500 hover:text-[#059669]">
        Ver carrito e ir a pagar
      </Link>
    </div>
  );
}
