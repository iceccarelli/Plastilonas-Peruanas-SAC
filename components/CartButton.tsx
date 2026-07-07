'use client';

import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart, cartCount } from '@/lib/cart-store';

/**
 * Botón de carrito con contador. Evita el mismatch de hidratación
 * (localStorage) renderizando el badge solo tras el montaje.
 */
export default function CartButton({ className = '' }: { className?: string }) {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Abrir carrito"
      className={`relative inline-flex items-center justify-center hover:text-white transition-colors ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#059669] text-white text-[10px] font-bold leading-none">
          {count}
        </span>
      )}
    </button>
  );
}
