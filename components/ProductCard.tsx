'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { Product } from '@/lib/types';
import { availabilityLabels } from '@/lib/products';
import { motion } from 'framer-motion';
import ProductImage from '@/components/ProductImage';
import ProductRotator from '@/components/ProductRotator';
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
      /* `whileTap` y no solo `whileHover`: en un teléfono el hover no ocurre
         NUNCA, así que una tarjeta con solo hover es una tarjeta que no
         responde al dedo. El hundimiento de 0.97 es el mismo de `.btn`, para
         que todo lo pulsable del sitio se sienta igual. */
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      /* `whileTap` hace que Framer Motion ponga `tabIndex={0}` en el <div>
         (ver `makeRenderlessComponent` → `props.whileTap` en su fuente), y eso
         mete en el orden de tabulación un contenedor SIN rol, SIN nombre
         accesible y SIN acción: se anunciaba como un bloque de texto de
         342×560 justo antes del título, y pulsar Intro sobre él no hacía
         nada. Medido en el recorrido de tabulación a 390 px. El hundimiento
         al pulsar es decoración; el camino real a la ficha es el enlace del
         título. `tabIndex={-1}` quita el tope fantasma y no quita nada más. */
      tabIndex={-1}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="product-card group relative bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col h-full"
    >
      {/* ENCUADRE 3:2, NO ALTURA FIJA.

          Antes: `h-56` (224 px) más el recorte a 176 px en ≤640. Con la
          columna de 340 px de un teléfono eso pedía 1.93:1 a unas fotos que
          son todas 3:2, y `object-cover` se comía el 22 % del cuadro por
          arriba y por abajo. Medido: 340×176 antes, 340×227 ahora.

          Se comparó 3:2 contra 4:3 en la rejilla real del catálogo. 4:3 lee
          bien en la ficha suelta, pero en la lista de una columna del teléfono
          deja tarjetas de 255 px de foto que empujan el nombre y el precio
          fuera de pantalla: hay que desplazar para leer lo que se compra. 3:2
          es además el ratio nativo de los 228 archivos, así que recorta cero.
          Gana 3:2. */}
      <div className="product-card-media relative aspect-[3/2] w-full overflow-hidden">
        {/* La foto ocupa un tercio del alto de la pantalla en un teléfono
            (340 px de ancho) y un cuarto de columna en escritorio (286 px):
            el `100vw` anterior en todo lo que bajara de 768 servía un archivo
            del doble de lo necesario en la tableta. */}
        <ProductRotator
          product={product}
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, (max-width: 1279px) 31vw, 300px"
        />

        <div
          className={`absolute top-4 left-4 t-micro font-bold tracking-wider px-3 py-1 rounded-full shadow-sm ${AVAILABILITY_STYLES[availability]}`}
        >
          {availabilityLabels[availability]?.toUpperCase()}
        </div>

        {product.popular && (
          <div className="absolute top-4 right-4 bg-[#059669] text-white t-micro font-bold tracking-wider px-3.5 py-1 rounded-full">MÁS VENDIDO</div>
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
          
          {/* EL NOMBRE ES EL ENLACE, Y ESE ENLACE ES TODA LA TARJETA.

              Antes había un <Link> superpuesto sobre la foto con
              `aria-hidden` + `tabIndex={-1}`: la parte grande y obvia de la
              tarjeta sí llevaba a la ficha con el dedo o el ratón, pero para
              el teclado y el lector de pantalla ese destino no existía, y el
              título —que es el nombre accesible natural de la tarjeta— era
              texto muerto.

              Ahora el enlace real envuelve el título y se estira con
              `after:absolute after:inset-0` sobre la tarjeta entera (que es
              `relative`). Un solo elemento interactivo para «ir a este
              producto»: un solo tope de tabulación, con nombre accesible
              correcto, y la foto sigue siendo pulsable. No se anida nada
              dentro del <a> —anidar interactivos sería HTML inválido—: las
              acciones de abajo (Agregar / Cotizar / Ver especificaciones)
              son HERMANAS y suben a `z-[2]` para quedar por encima de la
              capa estirada y seguir pulsándose por separado. */}
          <h3 className="font-semibold text-xl tracking-tight text-[#0A2540] leading-tight mb-3 group-hover:text-[#059669] transition-colors">
            <Link
              href={`/productos/${product.slug}`}
              className="after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
            >
              {product.name}
            </Link>
          </h3>
          
          <p className="text-gray-600 t-body line-clamp-3 leading-snug">
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
              <span className="ml-2 t-micro text-gray-400">+ IGV</span>
            </p>
          )}
        </div>

        {/* LA FILA DE ACCIONES, ORDENADA PARA UN PULGAR.

            En 390 px los dos elementos no caben en una línea y `flex-wrap`
            los partía dejando el botón principal colgando a la derecha, a
            media anchura. Ahora por debajo de `sm` la fila es una columna y
            la acción principal ocupa el ancho completo —es la que se pulsa—,
            con el enlace de especificaciones debajo. Desde `sm` vuelve la
            fila de dos.

            `min-h-[44px]` en el enlace: medía 28 px de alto reales. No es un
            botón, pero es un destino táctil y el mínimo es el mismo. */}
        <div className="relative z-[2] pt-5 mt-auto flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-x-3 gap-y-2 border-t border-gray-100">
          <Link
            href={`/productos/${product.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center sm:justify-start text-sm font-medium text-[#047857] hover:underline whitespace-nowrap active:opacity-70 transition-opacity"
          >
            Ver especificaciones <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>

          {isPurchasable ? (
            <button
              type="button"
              onClick={() => add(product)}
              className="btn btn-sm btn-accent w-full sm:w-auto sm:shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Agregar
            </button>
          ) : (
            <Link
              href={`/cotizacion?producto=${encodeURIComponent(product.name)}`}
              className="btn btn-sm btn-primary w-full sm:w-auto sm:shrink-0"
            >
              Cotizar
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
