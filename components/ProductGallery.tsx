'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';

function prettify(src: string): string {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
  return base.replace(/[-_]/g, ' ').trim();
}

// Etiqueta legible por vista, derivada del sufijo del archivo de galería
// (`-general` | `-detalle` | `-instalacion` | `-escala`). Ayuda a que el
// cliente entienda QUÉ muestra cada foto. Devuelve null si no aplica.
const VIEW_CAPTIONS: Record<string, string> = {
  general: 'Vista general del producto',
  detalle: 'Detalle del material y acabado',
  instalacion: 'Instalación / aplicación en obra',
  escala: 'Referencia de escala y dimensiones',
};

function viewKey(src: string): string | null {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
  const suffix = base.split('-').pop() ?? '';
  return VIEW_CAPTIONS[suffix] ? suffix : null;
}

function captionFor(src: string): string | null {
  const k = viewKey(src);
  return k ? VIEW_CAPTIONS[k] : null;
}

export default function ProductGallery({ product }: { product: Product }) {
  const images = (
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [product.image]
        : []
  ).filter(Boolean);

  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);

  const hasMultiple = images.length > 1;

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/11] rounded-3xl overflow-hidden relative border border-gray-100">
        <ProductVisual product={product} variant="hero" />
      </div>
    );
  }

  const activeSrc = images[active];
  const altFor = (i: number, src: string) => {
    const caption = captionFor(src);
    if (caption) return `${product.name} — ${caption}`;
    return i === 0 ? product.name : `${product.name} — ${prettify(src)}`;
  };
  const activeCaption = captionFor(activeSrc);

  return (
    <div>
      <div className="aspect-[16/11] rounded-3xl overflow-hidden relative border border-gray-100 group">
        {failed[active] ? (
          <ProductVisual product={product} variant="hero" />
        ) : (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Ampliar imagen de ${product.name}`}
            className="ken-burns-wrap absolute inset-0 overflow-hidden w-full h-full cursor-zoom-in"
          >
            <Image
              src={activeSrc}
              alt={altFor(active, activeSrc)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 640px"
              className="ken-burns object-cover"
              onError={() => setFailed((f) => ({ ...f, [active]: true }))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Expand className="w-3.5 h-3.5" /> Ampliar
            </span>
          </button>
        )}
      </div>

      {activeCaption && (
        <p
          className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
          aria-live="polite"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
          {activeCaption}
        </p>
      )}

      {hasMultiple && (
        <div
          className="mt-3 flex gap-3 overflow-x-auto pb-1"
          role="listbox"
          aria-label={`Galería de fotos de ${product.name}`}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              role="option"
              aria-selected={i === active}
              aria-label={`Ver foto ${i + 1} de ${images.length} — ${product.name}`}
              className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border transition-all ${
                i === active
                  ? 'border-[#059669] ring-2 ring-[#059669]/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — vista ampliada`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
          >
            <X className="w-7 h-7" />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 text-white/80 hover:text-white p-2"
              >
                <ChevronLeft className="w-9 h-9" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Foto siguiente"
                className="absolute right-3 sm:right-6 text-white/80 hover:text-white p-2"
              >
                <ChevronRight className="w-9 h-9" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl aspect-[16/11]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeSrc}
              alt={altFor(active, activeSrc)}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/80 text-sm">
            {activeCaption && <span className="text-white/90">{activeCaption}</span>}
            {hasMultiple && <span className="text-white/60">{active + 1} / {images.length}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
