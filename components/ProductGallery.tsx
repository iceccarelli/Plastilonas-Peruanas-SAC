'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';
import { LEYENDA_REFERENCIAL } from '@/lib/leyendas';

/**
 * Vistas que se leen como obra y por eso llevan leyenda.
 *
 * `general` y `detalle` muestran el producto: una lona doblada, un ojal, un
 * tramo de manga. Nadie las confunde con una obra. `instalacion` y `escala`
 * muestran el producto PUESTO —un talud revestido, un patio de secado, una
 * playa de estacionamiento cubierta— y ahí sí: sin decir nada, la foto pasa
 * por caso de éxito. Es exactamente lo que /confianza promete no hacer, y la
 * rotación de tomas lo agravó, porque ahora esas vistas traen además la toma
 * con gente trabajando.
 */
const VISTAS_CON_LEYENDA = new Set(['instalacion', 'escala']);

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

// Etiqueta corta para la miniatura, para que el cliente sepa QUÉ vista es
// antes de hacer clic (mejor comprensión y recorrido de la galería).
const VIEW_SHORT: Record<string, string> = {
  general: 'General',
  detalle: 'Detalle',
  instalacion: 'En obra',
  escala: 'Escala',
};

function shortLabel(src: string): string | null {
  const k = viewKey(src);
  return k ? VIEW_SHORT[k] : null;
}

function viewKey(src: string): string | null {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
  const suffix = base.split('-').pop() ?? '';
  return VIEW_CAPTIONS[suffix] ? suffix : null;
}

function captionFor(src: string): string | null {
  const k = viewKey(src);
  return k ? VIEW_CAPTIONS[k] : null;
}

export default function ProductGallery({
  product,
  tomas = {},
}: {
  product: Product;
  /**
   * Tomas por imagen, resueltas en el SERVIDOR. Un componente de cliente no
   * puede mirar el disco, y adivinar si existe el archivo `-2` produciría
   * exactamente lo que este proyecto evita: una imagen rota. El servidor
   * además ya descartó las tomas que son copias byte a byte de otra, así que
   * lo que llega acá son variantes realmente distintas.
   */
  tomas?: Record<string, string[]>;
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
      <div className="aspect-[3/2] rounded-3xl overflow-hidden relative border border-gray-100">
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
  // Solo entran las tomas que el servidor confirmó que existen Y que son
  // distintas entre sí. `slice(1)` porque la toma 1 es la imagen de abajo.
  const tomasActivas = tomas[activeSrc] ?? [activeSrc];
  const capas = tomasActivas.slice(1, 4);
  const claseCiclo = capas.length > 0 ? `tomas-${capas.length + 1}` : '';

  return (
    <div>
      {/*
        EL ENCUADRE ES EL DE LAS FOTOS, NO UN NÚMERO ELEGIDO.

        Aquí había `aspect-[16/11]` = 1.4545. Las 228 fotos de
        `public/images/galeria` miden TODAS exactamente 3:2 = 1.5 (comprobado
        archivo por archivo con sharp, no supuesto). Un contenedor a 1.4545
        con `object-cover` recorta ~3 % del ancho de cada foto para siempre, y
        encima de eso venía el Ken Burns. En una toma `-detalle` —un ojal, una
        costura, un remate— ese 3 % es exactamente el borde que la foto existe
        para enseñar.

        Se descartó `aspect-auto` con medidas intrínsecas: obligaría a leer el
        tamaño de cada archivo en servidor por ficha y, con tomas que se
        cruzan apiladas en `position: absolute`, la altura del contenedor
        dejaría de estar reservada antes de la descarga. Un ratio fijo
        IGUAL al del material reserva el espacio exacto, recorta cero y no
        introduce desplazamiento de maquetación.
      */}
      <div className="aspect-[3/2] rounded-3xl overflow-hidden relative border border-gray-100 group">
        {failed[active] ? (
          <ProductVisual product={product} variant="hero" />
        ) : (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Ampliar imagen de ${product.name}`}
            className={`ken-burns-wrap ${claseCiclo} absolute inset-0 overflow-hidden w-full h-full cursor-zoom-in`}
          >
            <Image
              src={activeSrc}
              alt={altFor(active, activeSrc)}
              fill
              priority
              /* Anchos REALES medidos en el navegador tras corregir el
                 desborde: 342 px a 390, 720 px a 768, 522 px a 1440. El valor
                 anterior —`(max-width: 768px) 100vw, 640px`— servía 640 px
                 justo donde hacían falta 720 (una tableta veía la foto
                 interpolada) y 640 donde bastaban 522. */
              sizes="(max-width: 1023px) 100vw, 576px"
              className="ken-burns object-cover"
              onError={() => setFailed((f) => ({ ...f, [active]: true }))}
            />
            {/* Tomas adicionales de la MISMA vista. Se apilan en orden de DOM
                —la última queda arriba, que es justo lo que el ciclo de cruce
                asume— y cada una lleva su Ken Burns desfasado. Van marcadas
                aria-hidden porque no aportan información nueva a quien usa
                lector de pantalla: es la misma vista, y anunciarla tres veces
                sería ruido. Sin `priority`: la primera toma es la que decide
                el LCP, y precargar las demás competiría con ella. */}
            {capas.map((toma, k) => (
              <div
                key={toma}
                className={`toma-cruce toma-capa-${k + 2} absolute inset-0`}
                aria-hidden="true"
              >
                <Image
                  src={toma}
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 100vw, 576px"
                  className="ken-burns object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            {/* «Ampliar» es la ÚNICA señal de que esta foto se abre a pantalla
                completa. Estaba en `opacity-0 group-hover:opacity-100`, o sea
                invisible para siempre en un teléfono —medido: opacity 0 a
                390 px—, justo donde la foto sale más pequeña. La clase
                `.pista-ampliar` (globals.css) la deja visible de entrada en
                punteros gruesos y conserva el revelado por hover donde hay
                ratón. */}
            <span className="pista-ampliar absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 pointer-events-none">
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

      {VISTAS_CON_LEYENDA.has(viewKey(activeSrc) ?? '') && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {LEYENDA_REFERENCIAL.es}
        </p>
      )}

      {hasMultiple && (
        /* Tira de miniaturas: 72 px de alto (era 64) y deslizamiento con
           imán. En un teléfono cabían tres y media y la cuarta quedaba
           cortada por el borde sin señal de que se pudiera arrastrar; con
           `snap-x` cada miniatura se detiene alineada y se entiende que la
           fila continúa. El estado seleccionado no depende del hover: lleva
           anillo permanente, que es la única forma de que un táctil sepa qué
           foto está mirando. */
        <div
          className="mt-3 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
          role="listbox"
          aria-label={`Galería de fotos de ${product.name}`}
        >
          {images.map((src, i) => {
            const label = shortLabel(src);
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                role="option"
                aria-selected={i === active}
                aria-label={
                  label
                    ? `Ver ${captionFor(src)} — foto ${i + 1} de ${images.length}, ${product.name}`
                    : `Ver foto ${i + 1} de ${images.length} — ${product.name}`
                }
                title={label ?? undefined}
                className={`relative h-[72px] w-[108px] shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all active:scale-[0.97] ${
                  i === active
                    ? 'border-[#047857] ring-2 ring-[#047857]/35 ring-offset-1'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                <Image src={src} alt="" fill sizes="108px" className="object-cover" />
                {label && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] leading-none py-1 text-center font-medium tracking-wide">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center px-3 sm:px-8"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — vista ampliada`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur transition-transform active:scale-[0.92] hover:bg-white/20 hover:text-white"
          >
            <X className="w-7 h-7" />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur transition-transform active:scale-[0.92] hover:bg-white/20 hover:text-white"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Foto siguiente"
                className="absolute right-2 sm:right-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur transition-transform active:scale-[0.92] hover:bg-white/20 hover:text-white"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* LA VISTA AMPLIADA NO RECORTA NUNCA. Aquí había otro
              `aspect-[16/11]` fijo: en una pantalla de 390×844 eso dejaba la
              foto en una franja corta en medio de una pantalla negra, con el
              resto del área segura desperdiciada. Ahora la caja ocupa todo el
              hueco disponible (`flex-1`, `min-h-0`) y `object-contain` decide
              el tamaño: la foto entra ENTERA y lo más grande que quepa. En una
              vista que el usuario ha pedido expresamente para ver la foto
              completa, forzar un encuadre es contradecir el gesto. */}
          <div
            className="relative w-full max-w-5xl flex-1 min-h-0 my-10 sm:my-12"
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
