'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { Product } from '@/lib/types';
import { availabilityLabels } from '@/lib/products';
import { motion } from 'framer-motion';
import ProductImage from '@/components/ProductImage';
import { formatPEN } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  showSector?: boolean;
}

const AVAILABILITY_STYLES: Record<string, string> = {
  stock: 'bg-emerald-700 text-white',
  a_medida: 'bg-white/90 text-[#0A2540]',
  bajo_pedido: 'bg-amber-400/95 text-[#0A2540]',
};

export default function ProductCard({ product, showSector = true }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const isPurchasable = product.purchasable === true && typeof product.price === 'number';
  const availability = product.availability ?? 'a_medida';

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="product-card group bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden">
        <ProductImage product={product} variant="card" />

        <div
          className={`absolute top-4 left-4 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-sm ${AVAILABILITY_STYLES[availability]}`}
        >
          {availabilityLabels[availability]?.toUpperCase()}
        </div>

        {product.popular && (
          <div className="absolute top-4 right-4 bg-[#059669] text-white text-[10px] font-bold tracking-wider px-3.5 py-1 rounded-full">MÁS VENDIDO</div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-gray-100 text-gray-600">{product.category}</span>
            {showSector && product.sector.length > 0 && (
              <span className="text-xs text-gray-400">• {product.sector[0]}</span>
            )}
          </div>
          
          <h3 className="font-semibold text-xl tracking-tight text-[#0A2540] leading-tight mb-3 group-hover:text-[#059669] transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-[15px] line-clamp-3 leading-snug">
            {product.shortDescription}
          </p>

          {typeof product.price === 'number' && (
            <p className="mt-4 text-[#0A2540]">
              <span className="text-2xl font-semibold tracking-tight">
                {formatPEN(product.price)}
              </span>
              {product.priceUnit && (
                <span className="text-sm text-gray-400"> / {product.priceUnit}</span>
              )}
              <span className="ml-2 text-[11px] text-gray-400">+ IGV</span>
            </p>
          )}
        </div>

        <div className="pt-5 mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-gray-100">
          <Link 
            href={`/productos/${product.slug}`} 
            className="inline-flex items-center text-sm font-medium text-[#047857] hover:underline whitespace-nowrap"
          >
            Ver especificaciones <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
          
          {isPurchasable ? (
            <button
              type="button"
              onClick={() => add(product)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white rounded-full transition-colors active:scale-[0.985] whitespace-nowrap shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Agregar
            </button>
          ) : (
            <Link
              href={`/cotizacion?producto=${encodeURIComponent(product.name)}`}
              className="text-xs font-semibold px-4 py-2 bg-[#0A2540] hover:bg-[#047857] text-white rounded-full transition-colors active:scale-[0.985] whitespace-nowrap shrink-0"
            >
              Cotizar
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
