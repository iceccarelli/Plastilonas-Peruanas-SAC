'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';

/**
 * Muestra la foto real del producto con efecto Ken Burns (zoom/paneo lento,
 * "vivo"). Si el archivo no existe todavía (p. ej. los 4 productos sin foto),
 * cae automáticamente al placard de marca <ProductVisual> — nunca un ícono roto.
 * Respeta prefers-reduced-motion vía la clase .ken-burns en globals.css.
 */
export default function ProductImage({
  product,
  variant = 'card',
  priority = false,
}: {
  product: Product;
  variant?: 'card' | 'hero';
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!product.image || failed) {
    return <ProductVisual product={product} variant={variant} />;
  }

  return (
    <div className="ken-burns-wrap absolute inset-0 overflow-hidden">
      <Image
        src={product.image}
        alt={product.name}
        fill
        priority={priority}
        sizes={variant === 'hero' ? '(max-width: 768px) 100vw, 640px' : '(max-width: 768px) 100vw, 380px'}
        className="ken-burns object-cover"
        onError={() => setFailed(true)}
      />
      {/* Velo sutil para que los badges e íconos encima siempre se lean */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
