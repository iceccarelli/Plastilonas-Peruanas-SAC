'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';

export default function ProductImage({
  product,
  variant = 'card',
  priority = false,
  enableHover = false,
}: {
  product: Product;
  variant?: 'card' | 'hero';
  priority?: boolean;
  enableHover?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!product.image || failed) {
    return <ProductVisual product={product} variant={variant} />;
  }

  const sizes =
    variant === 'hero'
      ? '(max-width: 768px) 100vw, 640px'
      : '(max-width: 768px) 100vw, 380px';

  const hoverSrc = enableHover
    ? product.gallery?.find((g) => g && g !== product.image)
    : undefined;

  return (
    <div className="ken-burns-wrap absolute inset-0 overflow-hidden">
      <Image
        src={product.image}
        alt={product.name}
        fill
        priority={priority}
        sizes={sizes}
        className={`ken-burns object-cover ${
          hoverSrc ? 'transition-opacity duration-500 group-hover:opacity-0' : ''
        }`}
        onError={() => setFailed(true)}
      />

      {hoverSrc && (
        <Image
          src={hoverSrc}
          alt={`${product.name} — instalación real`}
          fill
          sizes={sizes}
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
