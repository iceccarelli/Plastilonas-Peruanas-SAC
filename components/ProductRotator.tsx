'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';

export default function ProductRotator({
  product,
  intervalMs = 3500,
  sizes = '(max-width: 768px) 40vw, 160px',
}: {
  product: Product;
  intervalMs?: number;
  sizes?: string;
}) {
  const images = (
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [product.image]
        : []
  ).filter(Boolean);

  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused || images.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, paused, images.length, intervalMs]);

  if (images.length === 0) {
    return <ProductVisual product={product} variant="card" />;
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) =>
        failed[i] ? null : (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={i === 0 ? product.name : `${product.name} — foto ${i + 1}`}
            fill
            sizes={sizes}
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              reduceMotion ? '' : 'ken-burns'
            } ${i === active ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setFailed((f) => ({ ...f, [i]: true }))}
          />
        ),
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
