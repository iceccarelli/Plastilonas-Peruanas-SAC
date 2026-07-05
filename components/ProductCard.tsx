'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  showSector?: boolean;
}

export default function ProductCard({ product, showSector = true }: ProductCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="product-card group bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {/* Placeholder for image - In production replace with real photos */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540]/5 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
          {product.category === 'Big Bags' && '📦'}
          {product.category === 'Geomembranas' && '💧'}
          {product.category === 'Carpas y Estructuras' && '🏗️'}
          {product.category.includes('Mantas') && '🧥'}
          {product.category === 'Mallas Agrícolas' && '🌿'}
          {!['Big Bags', 'Geomembranas', 'Carpas y Estructuras'].some(c => product.category.includes(c)) && '🛠️'}
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
        </div>

        <div className="pt-5 mt-auto flex items-center justify-between border-t border-gray-100">
          <Link 
            href={`/productos/${product.slug}`} 
            className="inline-flex items-center text-sm font-medium text-[#059669] hover:underline"
          >
            Ver especificaciones <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
          
          <Link 
            href={`/cotizacion?producto=${encodeURIComponent(product.name)}`}
            className="text-xs font-semibold px-5 py-2 bg-[#0A2540] hover:bg-[#059669] text-white rounded-full transition-colors active:scale-[0.985]"
          >
            Cotizar
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
