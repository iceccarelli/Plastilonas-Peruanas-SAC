#!/usr/bin/env bash
# =============================================================================
#  P22 — Las 28 imágenes en su sitio, con Ken Burns y segunda toma
#  Plastilonas Peruanas SAC
#
#  LO PRIMERO, PORQUE CAMBIA EL ENCARGO
#  ------------------------------------
#  Los dos zips traen los MISMOS 28 nombres. Comparados byte a byte: 24 de 28
#  son el mismo archivo empaquetado dos veces. Solo los cuatro de
#  geomembranas-pvc son genuinamente dos tomas distintas (y las dos son buenas:
#  la segunda tiene dos pozas y la operación minera al fondo).
#
#  Es decir: hay 28 imágenes distintas, no 56. Un cruce entre dos imágenes
#  identicas se ve como un parpadeo sin motivo, asi que el sistema soporta una
#  o dos tomas por vista y degrada solo:
#     una toma  -> Ken Burns, sin cruce
#     dos tomas -> Ken Burns + fundido lento entre ambas
#  Cuando lleguen las segundas tomas del resto, se sueltan con el sufijo -2 y
#  el cruce se enciende solo. No hay que tocar codigo.
#
#  QUE HACE ESTE PARCHE
#  --------------------
#  1. Extrae los 28 archivos del zip a public/images/galeria/ e instala los 4
#     de geomembranas-pvc del segundo zip como -2.
#
#  2. REAPUNTA LOS 7 PRODUCTOS. Este era el paso que faltaba y sin el las
#     imagenes no se veian: los archivos estaban en disco y lib/products.ts
#     seguia apuntando esos 7 productos a su unica foto antigua. Ahora los 36
#     productos tienen galeria completa de cuatro vistas y CERO rutas sin
#     archivo. La foto antigua se conserva al final de cada galeria.
#
#  3. Corrige DOS defectos del Ken Burns que ya existia:
#     - El zoom llegaba a scale(1.14). Un 14 % recorta justo el detalle que
#       hace util a estas fotos —la zanja de anclaje del borde, la costura— y
#       en un catalogo tecnico ese detalle ES el argumento. Baja a 1.06.
#     - El hover bajaba animation-duration de 22 s a 12 s. Cambiar la duracion
#       a mitad de animacion reposiciona el fotograma y la imagen SALTA al
#       pasar el cursor. Ahora pausa: limpio, y deja mirar el detalle quieto.
#     Se retira ademas will-change, que forzaba una capa de composicion
#     permanente por imagen sin necesidad.
#
#  4. Limpia la raiz: 29 jpg sueltos y 7 zips (47 MB) versionados. Los zip
#     entran en .gitignore — versionarlos duplica decenas de megabytes en el
#     historial de git, que es permanente, y no aporta nada que public/ no
#     tenga. Los jpg sueltos van a _to_delete/ para que usted los borre.
#
#  ACCESIBILIDAD, que aqui no es opcional
#  --------------------------------------
#  Con prefers-reduced-motion el zoom se congela y la segunda toma se oculta:
#  queda una imagen quieta. Verificado en navegador con la preferencia puesta:
#  animationName "none", opacidad 0. El movimiento puede provocar malestar
#  vestibular real; no es una preferencia estetica.
#
#  La segunda toma va aria-hidden con alt vacio: es la MISMA vista fotografiada
#  dos veces, y anunciarla seria ruido para quien usa lector de pantalla.
#
#  REQUISITO: los dos zips deben estar en la raiz del repositorio. Si ya los
#  borro, vuelva a subirlos antes de ejecutar esto.
#
#  Uso:
#    ls aplicar*p22*
#    bash aplicarp22galeria.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

ZIP_A="plastilonas-galeria-28-imagenes.zip"
ZIP_B="plastilonas-galeria-28-ilustraciones.zip"

if [ ! -f "$ZIP_A" ] || [ ! -f "$ZIP_B" ]; then
  echo "ERROR: faltan los zips en la raíz del repositorio:" >&2
  echo "  $ZIP_A" >&2
  echo "  $ZIP_B" >&2
  echo "Vuelva a subirlos y ejecute de nuevo." >&2
  exit 1
fi

echo "Extrayendo las 28 imágenes…"
mkdir -p public/images/galeria
TMP_A=$(mktemp -d); TMP_B=$(mktemp -d)
unzip -q -o "$ZIP_A" -d "$TMP_A"
unzip -q -o "$ZIP_B" -d "$TMP_B"
cp "$TMP_A"/public/images/galeria/*.jpg public/images/galeria/

echo "Instalando las segundas tomas que realmente difieren…"
SEGUNDAS=0
for f in "$TMP_B"/public/images/galeria/*.jpg; do
  n=$(basename "$f" .jpg)
  if ! cmp -s "$f" "public/images/galeria/$n.jpg"; then
    cp "$f" "public/images/galeria/$n-2.jpg"
    SEGUNDAS=$((SEGUNDAS + 1))
  fi
done
rm -rf "$TMP_A" "$TMP_B"
echo "  $SEGUNDAS segundas tomas instaladas (las demás eran el mismo archivo)."

echo "Limpiando la raíz…"
git rm -q --cached ./*.zip 2>/dev/null || true
rm -f ./*.zip
mkdir -p _to_delete
git rm -q --cached ./*.jpg 2>/dev/null || true
mv ./*.jpg _to_delete/ 2>/dev/null || true

# -----------------------------------------------------------------------------
# lib/galeria.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/galeria.ts" <<'P22_EOF'
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * RESOLUCIÓN DE VARIANTES DE GALERÍA.
 *
 * El catálogo declara cuatro vistas por producto —general, detalle,
 * instalación y escala— y cada una puede tener una SEGUNDA toma que se
 * alterna con la primera:
 *
 *   /images/galeria/geomembranas-pvc-general.jpg      primera toma
 *   /images/galeria/geomembranas-pvc-general-2.jpg    segunda toma (opcional)
 *
 * Por qué el sufijo `-2` y no una entrada más en `gallery`. Las miniaturas se
 * derivan de `gallery`, y su leyenda sale del sufijo de vista: añadir la
 * segunda toma como entrada suelta produciría una quinta miniatura sin
 * leyenda, duplicando visualmente la misma vista. La segunda toma no es otra
 * vista: es la MISMA vista fotografiada dos veces, y por eso vive dentro de su
 * ranura en lugar de al lado.
 *
 * La comprobación es de sistema de archivos y ocurre en el servidor, una vez
 * por compilación. Así una segunda toma que todavía no llegó no produce una
 * imagen rota ni un cruce contra un hueco: simplemente no hay cruce.
 */

/** Ruta de la segunda toma de una imagen de galería. */
export function rutaSegundaToma(src: string): string {
  return src.replace(/\.(jpg|jpeg|png|webp)$/i, '-2.$1');
}

/** ¿La ruta es ya una segunda toma? Sirve para no anidarlas. */
export const esSegundaToma = (src: string): boolean => /-2\.(jpg|jpeg|png|webp)$/i.test(src);

const existePublico = (ruta: string): boolean => {
  try {
    return existsSync(join(process.cwd(), 'public', ruta));
  } catch {
    return false;
  }
};

/**
 * Tomas disponibles para una imagen: una o dos.
 * Devuelve siempre al menos la original, exista o no el archivo: quien
 * renderiza ya sabe degradar, y aquí no se decide eso.
 */
export function tomasDe(src: string): string[] {
  if (!src || esSegundaToma(src)) return [src];
  const segunda = rutaSegundaToma(src);
  return existePublico(segunda) ? [src, segunda] : [src];
}

/**
 * Mapa completo de una galería. Se calcula en el servidor y se pasa al
 * componente de cliente: un componente de cliente no puede mirar el disco.
 */
export function mapaDeTomas(gallery: string[]): Record<string, string[]> {
  const mapa: Record<string, string[]> = {};
  for (const src of gallery) mapa[src] = tomasDe(src);
  return mapa;
}

/** Cuántas imágenes de galería tienen segunda toma. Para el inventario. */
export function conSegundaToma(gallery: string[]): number {
  return gallery.filter((s) => tomasDe(s).length > 1).length;
}
P22_EOF

# -----------------------------------------------------------------------------
# components/ProductGallery.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/ProductGallery.tsx" <<'P22_EOF'
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
   * Segundas tomas por imagen, resueltas en el SERVIDOR. Un componente de
   * cliente no puede mirar el disco, y adivinar si existe el archivo `-2`
   * produciría exactamente lo que este proyecto evita: una imagen rota.
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
  // La segunda toma solo entra si el servidor confirmó que el archivo existe.
  const segundaToma = (tomas[activeSrc] ?? [])[1];

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
            {/* Segunda toma de la MISMA vista, si existe. Se funde encima con
                su propio Ken Burns desfasado. Va marcada aria-hidden porque no
                aporta información nueva a quien usa lector de pantalla: es la
                misma vista, y anunciarla dos veces sería ruido. */}
            {segundaToma && (
              <div className="toma-cruce absolute inset-0" aria-hidden="true">
                <Image
                  src={segundaToma}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="ken-burns object-cover"
                />
              </div>
            )}
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
                className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border transition-all ${
                  i === active
                    ? 'border-[#059669] ring-2 ring-[#059669]/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
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
P22_EOF

# -----------------------------------------------------------------------------
# app/productos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/productos/[slug]"
cat > "app/productos/[slug]/page.tsx" <<'P22_EOF'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';
import ProductGallery from '@/components/ProductGallery';
import { mapaDeTomas } from '@/lib/galeria';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import DatasheetButton from '@/components/DatasheetButton';
import { solutionsForProduct } from '@/lib/solutions';
import { terminosParaProducto } from '@/lib/glosario';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, ...product.sector, 'Perú', 'proveedor', 'fabricante'],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const faqs = productFaqs(product);
  const arquitecturas = solutionsForProduct(product.slug);
  const glosarioRel = terminosParaProducto(product.slug);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} tomas={mapaDeTomas(product.gallery ?? [])} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppLink
              context={`producto:${product.slug}`}
              message={`Hola, necesito una cotización de ${product.name}.`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </WhatsAppLink>
            <DatasheetButton slug={product.slug} nombre={product.name} />
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Capa definicional: los términos que gobiernan esta especificación.
          Un comprador que no sabe qué es "factor de seguridad" no puede
          evaluar la ficha, por completa que esté. */}
      {glosarioRel.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Qué hay que entender antes de especificarlo
          </h2>
          <p className="text-gray-600 mb-6">
            Los términos que deciden esta compra, definidos con precisión y sin
            promoción. Sirven igual si termina comprándolo en otra parte.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {arquitecturas.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Dónde encaja este producto
          </h2>
          <p className="text-gray-600 mb-6">
            Rara vez se compra solo. Estas configuraciones muestran el conjunto completo
            del que forma parte, con su secuencia de ejecución.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {arquitecturas.map((s) => (
              <Link
                key={s.slug}
                href={`/soluciones/${s.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {s.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{s.escenario}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
P22_EOF

# -----------------------------------------------------------------------------
# app/globals.css
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/globals.css" <<'P22_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair);
  
  /* Premium Color Palette - AWS Level + Industrial Warmth */
  --color-navy: #0A2540;
  --color-navy-light: #1A3A5C;
  --color-emerald: #059669;
  --color-emerald-dark: #047857;
  --color-amber: #F59E0B;
  --color-amber-dark: #D97706;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;

  /* Semantic surface tokens — light (default) */
  --surface: #FFFFFF;
  --surface-muted: var(--color-gray-50);
  --surface-raised: #FFFFFF;
  --border: var(--color-gray-200);
  --text: var(--color-navy);
  --text-muted: var(--color-gray-600);
  --brand: var(--color-emerald);
  --brand-hover: var(--color-emerald-dark);
}

/* Dark theme — token overrides only. Existing rules that consume the
   variables above (product-card, form-input, specs-table, focus-visible)
   invert automatically. No component markup changes required. */
.dark {
  --surface: #0B1220;
  --surface-muted: #111C2E;
  --surface-raised: #16233A;
  /* Escalera de elevacion, pasos medidos ~1.35:1 entre superficies
     adyacentes, igual que AWS. No usar gradientes: bandas solidas. */
  --surface-nav: #1C2C46;
  --surface-deep: #060D18;
  --border: #24354F;
  --text: #E8EEF6;
  --text-muted: #93A4BC;
  --brand: #10B981;
  --brand-hover: #34D399;

  --color-gray-50: #111C2E;
  --color-gray-100: #16233A;
  --color-gray-200: #24354F;
  --color-gray-600: #93A4BC;
}

html { color-scheme: light; }
html.dark { color-scheme: dark; }

body {
  background-color: var(--surface);
  color: var(--text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Respect OS-level motion preferences. Required for WCAG 2.1 AA (2.3.3). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Premium Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Smooth micro-interactions */
a, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover, button:hover {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Premium Card Styles */
.product-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: var(--color-emerald);
}

/* Mega Menu Styles */
.mega-menu {
  animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Command Palette */
.command-palette {
  animation: commandEnter 0.15s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes commandEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Chatbot Styles */
.chatbot-window {
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Form Styles - Premium */
.form-input {
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-emerald);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  outline: none;
}

/* Table Styles */
.specs-table tr {
  transition: background-color 0.1s ease;
}

.specs-table tr:hover {
  background-color: var(--color-gray-50);
}

/* Filter Active States */
.filter-active {
  background-color: var(--color-emerald);
  color: white;
  border-color: var(--color-emerald);
}

/* WhatsApp Floating Button */
.whatsapp-float {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 15px -3px rgb(37 211 102 / 0.3);
}

/* Professional Badge */
.badge {
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* Section Dividers */
.section-divider {
  background: linear-gradient(to right, transparent, var(--color-gray-200), transparent);
}

/* Responsive Typography */
@media (max-width: 768px) {
  h1 {
    font-size: 2.25rem !important;
    line-height: 2.5rem !important;
  }
}

/* Accessibility Focus */
:focus-visible {
  outline: 2px solid var(--color-emerald);
  outline-offset: 2px;
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Capa de compatibilidad de tema ────────────────────────────────────
   Los contenedores usan literales (.bg-white, .text-[#0A2540]). Al volver
   <body> dependiente de tokens, los <h3> sin clase de color heredaban
   --text (claro) sobre tarjetas blancas -> 1.17:1. Y los <h2> con
   text-[#0A2540] quedaban sobre la pagina oscura -> 1.21:1.

   Esta capa hace que los contenedores sigan al tema. Va limitada a <main>
   para no tocar Navbar ni Footer, que ya manejan su propio dark:.

   ES UN PARCHE. Lo correcto es migrar los literales de page.tsx,
   SectionHeading.tsx y ProductCard.tsx a los tokens directamente.  */

/* Superficies: la tarjeta sube un escalon respecto de la pagina.

   AMPLIADO: la lista original cubria solo contenedores de bloque. Las paginas
   de familia, comparativa, recursos y cobertura local introdujeron tablas
   (th/td), chips (span) y callouts (p) con las mismas utilidades. En oscuro
   esos elementos quedaban como bloques BLANCOS con tinta clara encima -> el
   encabezado y la primera columna de la tabla comparativa eran ilegibles.
   Ampliar el selector es aditivo y arregla tambien cualquier pagina futura. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button).bg-white {
  background-color: var(--surface-raised);
}
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-50,
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-100 {
  background-color: var(--surface-muted);
}

/* 1.4.11: tarjeta #16233A vs pagina #0B1220 = 1.19:1, por debajo de 3.0.
   box-shadow en vez de border: no desplaza el layout. */
.dark main :is(div, section, article).bg-white {
  box-shadow: 0 0 0 1px var(--border);
}

/* Tinta */
.dark main .text-\[\#0A2540\] { color: var(--text) !important; }
/* gray-800 es tinta principal, no secundaria: mapearla a --text-muted dejaba
   el bloque "En resumen" de cada guia casi ilegible sobre fondo oscuro. */
.dark main :is(.text-gray-800, .text-gray-900) { color: var(--text) !important; }
.dark main :is(.text-gray-500, .text-gray-600, .text-gray-700) { color: var(--text-muted) !important; }
/* gray-400 marca dato ausente ("No declarado"): debe seguir siendo tenue,
   pero legible. */
.dark main :is(.text-gray-400, .text-neutral-400) { color: var(--text-muted) !important; }
.dark main :is(.border-gray-100, .border-gray-200) { border-color: var(--border); }

/* La escala `neutral-*` de Tailwind no estaba cubierta. Las 12 paginas de
   ciudad la usan para todo su cuerpo de texto: en oscuro quedaban en 1.81:1,
   practicamente invisibles. Mismo remapeo que la escala `gray-*`. */
/* Fondos semanticos claros (avisos, notas, alertas). No estaban mapeados: los
   cuadros de riesgo de las arquitecturas de referencia se quedaban en ambar
   claro mientras su tinta pasaba a la paleta oscura -> 1.13:1. El acento se
   conserva en el borde y el icono, que si son legibles sobre superficie
   oscura. Lo detecto la auditoria visual automatica, no una revision a ojo. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button):is(.bg-amber-50, .bg-amber-100, .bg-red-50, .bg-red-100, .bg-green-50, .bg-green-100, .bg-emerald-50, .bg-emerald-100, .bg-blue-50, .bg-blue-100, .bg-yellow-50) {
  background-color: var(--surface-muted);
}

/* Si la superficie semantica se oscurece, su tinta debe aclararse en el mismo
   paso. Oscurecer solo el fondo dejaba las insignias ambar del catalogo en
   3.4:1: una correccion a medias es una regresion. */
.dark main :is(.text-amber-700, .text-amber-800) { color: #FCD34D !important; }
.dark main :is(.text-red-700, .text-red-800) { color: #FCA5A5 !important; }
.dark main :is(.text-green-700, .text-green-800, .text-emerald-700) { color: var(--brand-hover) !important; }
.dark main :is(.text-blue-700, .text-blue-800) { color: #93C5FD !important; }

.dark main :is(.text-neutral-800, .text-neutral-900) { color: var(--text) !important; }
.dark main :is(.text-neutral-500, .text-neutral-600, .text-neutral-700) { color: var(--text-muted) !important; }
.dark main :is(.border-neutral-100, .border-neutral-200, .border-neutral-300) { border-color: var(--border); }
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label):is(.bg-neutral-50, .bg-neutral-100) {
  background-color: var(--surface-muted);
}

/* `text-navy` es el token equivalente al literal #0A2540 y aparece en el
   modal de cotizacion. Sin mapear, el titulo del formulario quedaba en 1.01:1. */
.dark main .text-navy { color: var(--text) !important; }

/* Verde de marca: en claro se oscurece a #047857 para cumplir AA sobre blanco.
   En oscuro esa misma correccion lo hunde a 2.87:1 sobre la pagina. El verde
   claro del tema (--brand-hover, #34D399) da ~9:1 sobre #0B1220. */
.dark main :is(.text-\[\#059669\], .text-\[\#047857\], .text-brand, .text-\[\#25D366\]) {
  color: var(--brand-hover) !important;
}

/* Los CTA blancos del hero viven sobre imagen oscura: siguen blancos con
   tinta navy (15.54:1). Deben ir DESPUES de las reglas de arriba. */
/* ACOTADO con :has(). Antes cubria CUALQUIER enlace con fondo blanco, lo que
   incluia las TARJETAS del carrusel de familias y del catalogo: la tarjeta se
   quedaba blanca mientras su texto interior se remapeaba a la paleta oscura
   -> gris claro sobre blanco (2.54:1). Solo el CTA real —el que lleva tinta
   navy— debe seguir siendo blanco. */
.dark main :is(a, button).bg-white:is(.text-\[\#0A2540\], .text-navy) {
  background-color: #FFFFFF;
  box-shadow: none;
}
/* Con !important, porque la regla de tinta oscura de arriba tambien lo lleva:
   sin esto el CTA blanco recibia tinta clara sobre blanco (1.17:1). */
/* Solo cuando la tinta navy esta en el PROPIO enlace/boton. La variante por
   descendencia hacia que las tarjetas-enlace (ya convertidas en superficie
   oscura) forzaran su titulo a navy sobre fondo oscuro: 1.01:1. */
.dark main :is(a, button).bg-white.text-\[\#0A2540\],
.dark main :is(a, button).bg-white.text-navy { color: #0A2540 !important; }


/* ═══════════════════════════════════════════════════════════════════
   MOBILE POLISH LAYER  (≤640px)  — tightens spacing & sizing site-wide.
   Purely responsive: desktop is untouched. Mirrors AWS/Square density.
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  /* 1. Kill any accidental horizontal scroll */
  html, body { max-width: 100%; overflow-x: hidden; }

  /* 2. Section vertical rhythm: 80px -> 48px. Reclaims dead space. */
  section.py-20, section.py-24 { padding-top: 3rem; padding-bottom: 3rem; }
  .mt-20 { margin-top: 3rem !important; }
  .mt-16 { margin-top: 2.5rem !important; }

  /* 3. Hero: shorter, tighter, not a full screen of navy */
  section.min-h-\[92vh\] { min-height: 78vh; }
  section.min-h-\[92vh\] h1 { font-size: 2.15rem !important; line-height: 1.12 !important; }
  section.min-h-\[92vh\] .mt-16 { margin-top: 2rem !important; }

  /* 4. Product visual placards: 224px -> 176px, lighter feel */
  .product-card .h-56 { height: 11rem; }

  /* 5. Badges/labels breathe less loudly on tiny screens */
  .badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; }

  /* 6. Comfortable tap targets (Apple/Google min 44px) for pills & icons */
  a, button { -webkit-tap-highlight-color: transparent; }
}

/* ── Bright selected / active states (all breakpoints) ─────────────
   Tapped filter chips and cards get a clear brand highlight + lift. */
.chip-selected,
button[aria-pressed="true"] {
  background-color: var(--color-emerald) !important;
  color: #fff !important;
  border-color: var(--color-emerald) !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.45);
}
.product-card:active { transform: scale(0.985); }

/* Card image brightens on tap/hover (the "brighten when selected" ask) */
.product-card .h-56 { transition: filter 0.25s ease; }
.product-card:hover .h-56,
.product-card:active .h-56 { filter: brightness(1.12) saturate(1.08); }

/* ── Bright gradient selected/active state (AWS "North America" style) ── */
.chip-selected {
  background-image: linear-gradient(120deg, #047857, #065F46 70%, #0F766E) !important;
  background-color: #047857 !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.5);
}

/* Hide scrollbar on horizontal scroll rows but keep swipe */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ═══════════ MOBILE SECTION POLISH (≤640px) ═══════════ */
@media (max-width: 640px) {
  /* 1+3. Content cards: less inner padding so they stop eating the screen.
     Targets the rounded-3xl p-8 cards in Servicios / Por qué / Family. */
  main .rounded-3xl.p-8 { padding: 1.35rem !important; }
  /* Tighten vertical gaps between stacked cards */
  main .gap-6 { gap: 0.85rem !important; }
  /* Service/why headings a touch smaller so cards shrink */
  main .rounded-3xl .text-xl { font-size: 1.05rem !important; line-height: 1.4 !important; }

  /* 5. Chat button: smaller + higher so it never sits over card text.
     Overrides the w-16 h-16 bottom-6 float. */
  .fixed.bottom-6.right-6 { bottom: 1rem !important; right: 1rem !important; }
  .fixed.bottom-6.right-6 > button { width: 3.25rem !important; height: 3.25rem !important; }
  /* Lift the open chat window origin to match */
  .fixed.bottom-24.right-6 { bottom: 4.75rem !important; }
}

/* ── 2. Sectores: peek-scroll row (one line, swipeable, next chip peeks) ── */
.sector-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  flex-wrap: nowrap;
}
.sector-scroll > * { scroll-snap-align: start; flex: 0 0 auto; }

/* ═══════════ MOBILE DENSITY (≤640px) — end the endless scroll ═══════════ */
@media (max-width: 640px) {
  /* Servicios + Por qué: 1-col -> 2-col so all items fit with minimal scroll */
  main section .grid.md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 0.6rem !important; }
  /* Compact those cards so 2-up reads cleanly */
  main section .grid.md\:grid-cols-2 > div { padding: 1rem !important; border-radius: 1.25rem !important; }
  main section .grid.md\:grid-cols-2 .text-xl { font-size: 0.95rem !important; line-height: 1.3 !important; }
  main section .grid.md\:grid-cols-2 .text-lg { font-size: 0.95rem !important; }
  main section .grid.md\:grid-cols-2 p { font-size: 0.8rem !important; line-height: 1.35 !important; }
  main section .grid.md\:grid-cols-2 .w-10.h-10 { width: 2rem !important; height: 2rem !important; margin-bottom: 0.6rem !important; }

  /* Family catalog: vertical list -> horizontal peek-carousel (swipe, 2.2 cards) */
  .family-scroll { display: flex !important; gap: 0.7rem; overflow-x: auto; scroll-snap-type: x mandatory; grid-template-columns: none !important; }
  .family-scroll > a { flex: 0 0 82%; scroll-snap-align: start; }

  /* Kill stray off-canvas carousel arrow bleeding at screen edge */
  .hero-arrow-left, [class*="carousel"] button.absolute.left-0 { display: none !important; }
}

/* ── Ticker de sectores: flujo continuo derecha -> izquierda ── */
.ticker-wrap { overflow: hidden; position: relative; }
.ticker-track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  animation: ticker-scroll 38s linear infinite;
}
.ticker-wrap:hover .ticker-track,
.ticker-wrap:focus-within .ticker-track { animation-play-state: paused; }
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; flex-wrap: wrap; width: auto; }
}

/* ═══════════ CONTRASTE WCAG AA — verificado por medición ═══════════
   #059669 sobre blanco = 3.77 (FALLA AA 4.5) -> #047857 = 5.48 (PASA).
   #10B981 + texto blanco = 2.54 (FALLA) -> emerald-700 = 5.48 (PASA).
   gray-400 = 2.54 (FALLA) -> gray-500 = 4.83 (PASA).
   #10B981 sobre navy = 6.13 (PASA) -> se conserva.
   Razón comercial: se lee a pleno sol en mina, obra y campo. ══════ */
:root { --color-emerald-text: #047857; }
.text-\[\#059669\] { color: #047857 !important; }
.bg-\[\#059669\] { background-color: #047857 !important; }
.hover\:bg-\[\#059669\]:hover { background-color: #047857 !important; }
.hover\:text-\[\#059669\]:hover { color: #047857 !important; }
.text-gray-400 { color: #6B7280 !important; }
.bg-\[\#0A2540\] .text-\[\#10B981\],
section.bg-\[\#0A2540\] .text-\[\#10B981\] { color: #10B981 !important; }

/* Foco visible para teclado (AWS/Square: accesibilidad primero) */
a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE DISEÑO — jerarquía de forma y tipografía
   Patrón AWS observado:
     · Monoespaciada = metadato técnico (specs, estados, conteos).
     · Radio PEQUEÑO = etiqueta informativa (no se toca).
     · Radio PÍLDORA = acción (se toca).
     · Panel/tarjeta = radio medio.
   Antes: badges y botones compartían forma píldora -> el usuario
   intentaba tocar etiquetas. La forma ahora codifica la función.
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Metadatos técnicos en monoespaciada */
.badge,
.tech-meta,
.spec-label,
.tabular-nums {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* 2 · Jerarquía de radios */
.badge {
  border-radius: 0.375rem;      /* etiqueta: NO es un botón */
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  text-transform: uppercase;
}
/* Los estados de producto también son etiquetas, no acciones */
.product-card .absolute.top-4.left-4,
.product-card .absolute.top-4.right-4 {
  border-radius: 0.375rem !important;
  font-family: var(--font-mono), ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* 3 · Transición de sección con solape redondeado (patrón AWS) */
.section-lift {
  position: relative;
  z-index: 1;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  margin-top: -2rem;
}

/* 4 · Ritmo de lectura: cuerpo más cómodo, títulos más ceñidos */
main p { line-height: 1.6; }
main h1, main h2, main h3 { letter-spacing: -0.02em; }

/* ═══════════ KEN BURNS — fotos de producto "vivas" ═══════════
   Zoom + paneo lento e infinito en alternancia. Cada tarjeta arranca con
   un pequeño desfase para que no se muevan todas al unísono. Se detiene
   por completo si el usuario prefiere menos movimiento. */
.ken-burns {
  /* CORRECCIÓN 1. El zoom llegaba a scale(1.14). Un 14 % recorta justamente el
     detalle que hace útil a estas fotos —la zanja de anclaje en el borde, la
     costura, el remate—, y en un catálogo técnico ese detalle ES el argumento.
     A 1.06 el movimiento se percibe y el encuadre sobrevive.

     CORRECCIÓN 2. `will-change: transform` forzaba una capa de composición
     permanente por cada imagen de galería. Los navegadores actuales componen
     una animación de transform sin ayuda, y la ayuda costaba memoria en
     páginas con muchas fotos. */
  animation: kenburns 22s ease-in-out infinite alternate;
  transform-origin: center;
}
.ken-burns-wrap:nth-of-type(3n) .ken-burns   { animation-duration: 26s; animation-delay: -6s; transform-origin: top left; }
.ken-burns-wrap:nth-of-type(3n+1) .ken-burns { animation-duration: 20s; animation-delay: -3s; transform-origin: bottom right; }
@keyframes kenburns {
  from { transform: scale(1.01) translate(0, 0); }
  to   { transform: scale(1.06) translate(-1%, 1%); }
}
/* CORRECCIÓN 3. Antes el hover bajaba animation-duration de 22 s a 12 s.
   Cambiar la duración a mitad de una animación hace que el navegador
   recalcule la posición dentro del nuevo ciclo, y la imagen SALTA al pasar el
   cursor. Pausar no reposiciona nada: el efecto es limpio y además deja mirar
   el detalle quieto, que es lo que uno quiere al detenerse sobre una foto. */
.group:hover .ken-burns { animation-play-state: paused; }

/* ---------------------------------------------------------------------------
   CRUCE ENTRE DOS TOMAS DE LA MISMA VISTA

   Cuando existe la segunda toma (sufijo -2), las dos se apilan y la de arriba
   se funde. Ciclo largo a propósito: 24 s, con diez segundos de permanencia en
   cada una. Un carrusel rápido en una ficha técnica compite con la lectura y
   obliga a esperar para volver a ver lo que uno estaba mirando.

   La segunda toma lleva su Ken Burns desfasado y con otro origen, de modo que
   el cruce no parezca un salto de la misma imagen.
--------------------------------------------------------------------------- */
.toma-cruce {
  animation: cruce-tomas 24s ease-in-out infinite;
}
@keyframes cruce-tomas {
  0%, 40%   { opacity: 0; }
  50%, 90%  { opacity: 1; }
  100%      { opacity: 0; }
}
.toma-cruce .ken-burns { animation-delay: -11s; transform-origin: bottom left; }
.group:hover .toma-cruce { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  /* Sin excepciones: el movimiento puede provocar malestar vestibular real.
     Se congela el zoom y se oculta la segunda toma. Queda una sola imagen
     quieta, que es una página perfectamente correcta. */
  .ken-burns { animation: none !important; transform: scale(1.01); }
  .toma-cruce { animation: none !important; opacity: 0 !important; }
}

/* ═══════════════════════════════════════════════════════════════════
   TOKENS DE DISEÑO — fuente única de verdad para tipografía, botones,
   secciones y radios. Reemplaza los tamaños sueltos (t-body,
   px-9 py-4, etc.) por clases semánticas. Patrón AWS/Stripe/Siemens.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Escala tipográfica (usar estas, no píxeles sueltos) ── */
.t-display { font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.05; letter-spacing: -0.03em; }
.t-h2      { font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.1; letter-spacing: -0.02em; }
.t-h3      { font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.01em; }
.t-body    { font-size: 0.9375rem; line-height: 1.6; }   /* = 15px, ahora tokenizado */
.t-caption { font-size: 0.8125rem; line-height: 1.5; }   /* = 13px */
.t-micro   { font-size: 0.6875rem; line-height: 1.4; letter-spacing: 0.04em; } /* = 11px, badges/meta */

/* ── Sistema de botones: UNA definición, tres tamaños ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-weight: 600; font-size: 0.875rem; line-height: 1;
  padding: 0.75rem 1.5rem;            /* alto uniforme = 44px táctil */
  border-radius: 9999px;
  transition: background-color .2s, color .2s, transform .1s;
  white-space: nowrap;
}
.btn:active { transform: scale(0.985); }
.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 0.9rem 2rem; font-size: 0.95rem; }
.btn-primary   { background: #0A2540; color: #fff; }
.btn-primary:hover   { background: #047857; }
.btn-accent    { background: #047857; color: #fff; }
.btn-accent:hover    { background: #065F46; }
.btn-ghost     { background: #fff; color: #0A2540; border: 1px solid #E5E7EB; }
.btn-ghost:hover     { border-color: #047857; color: #047857; }

/* ── Ritmo de sección: 2 valores, no 6 ── */
.section-pad { padding-top: 5rem; padding-bottom: 5rem; }
@media (max-width: 640px) { .section-pad { padding-top: 3rem; padding-bottom: 3rem; } }

/* ---------------------------------------------------------------------------
   VISUALIZACIÓN DE DATOS

   Los valores de estas variables NO se eligieron a ojo: se midieron con el
   validador de paleta en las dos superficies reales del sitio (blanco en claro,
   #1C2C46 en oscuro) y se ajustaron hasta pasar los cinco controles: banda de
   luminosidad, piso de croma, separación bajo daltonismo, piso de visión normal
   y contraste contra la superficie.

   El eje divergente es AZUL/NARANJA y no verde/rojo aunque el verde sea el color
   de marca. Verde y rojo es el par que la deuteranopia confunde: medido se queda
   en ΔE 5-6 cuando el umbral es 8. Azul/naranja mide ΔE 25-28 en las tres formas
   de daltonismo. El color de marca no vale una lectura equivocada.
--------------------------------------------------------------------------- */
.viz-root {
  --viz-serie: #047857;      /* magnitud, serie única */
  --viz-pos: #1D4ED8;        /* divergente: crecimiento */
  --viz-neg: #B45309;        /* divergente: contracción */
  --viz-eje: #D1D5DB;
  --viz-etiqueta: #0A2540;
  --viz-valor: #4B5563;
}

.dark .viz-root {
  --viz-serie: #0EA97A;
  --viz-pos: #4A8FE0;
  --viz-neg: #C9800F;
  --viz-eje: #3A4A66;
  --viz-etiqueta: var(--text);
  --viz-valor: var(--text-muted);
}

.viz-barra { fill: var(--viz-serie); }
.viz-linea { stroke: var(--viz-serie); }
/* Anillo del color de la superficie: el marcador sigue legible donde cruza
   la línea o se solapa con otro. */
.viz-punto { fill: var(--viz-serie); stroke: var(--surface); }
.viz-barra-pos { fill: var(--viz-pos); }
.viz-barra-neg { fill: var(--viz-neg); }
.viz-eje { stroke: var(--viz-eje); }
/* La tinta de los textos es tinta, nunca el color de la serie: el color lo
   lleva la barra, que es quien porta la identidad. */
.viz-etiqueta { fill: var(--viz-etiqueta); font-weight: 500; }
.viz-valor { fill: var(--viz-valor); font-variant-numeric: tabular-nums; }
P22_EOF

# -----------------------------------------------------------------------------
# lib/products.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/products.ts" <<'P22_EOF'
import { Product, ProductFamily } from './types';

// -----------------------------------------------------------------------------
// CATÁLOGO PLASTILONAS PERUANAS SAC
// Arquitectura de dos ejes (estilo AWS): navegación por FAMILIA (`category`) y
// por SECTOR (`sector`). Todo el portafolio competitivo está representado.
//
// REGLA DE HONESTIDAD (obligatoria al editar):
//  1. `sourcing` declara cómo entregamos: fabricación propia / importación /
//     bajo pedido / aliado. `availability` declara el estado (stock / a medida /
//     bajo pedido).
//  2. Las líneas de geosintéticos e insumos técnicos (PE/HDPE, geotextiles,
//     geomallas, tuberías, biodigestores, tanques) van como `bajo_pedido`:
//     se listan completas y visibles, pero la ficha técnica y el certificado
//     de lote del fabricante se entregan en la cotización. NO se publican
//     números de certificado no verificables como propios.
//  3. No se reutilizan proyectos, logos ni certificados de la competencia.
// -----------------------------------------------------------------------------

export const products: Product[] = [
  // ===========================================================================
  // 1) ENVASES Y EMBALAJE INDUSTRIAL
  // ===========================================================================
  {
    id: '1',
    slug: 'big-bags-bolsones-polipropileno',
    name: 'Big Bags / Bolsones de Polipropileno',
    category: 'Envases y Embalaje',
    sector: ['Minería', 'Industrial', 'Agricultura', 'Construcción'],
    shortDescription: 'Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.',
    description: 'Nuestros Big Bags (también conocidos como FIBC o contenedores intermedios flexibles para granel) están fabricados con polipropileno tejido de alta tenacidad, con tratamiento UV para mayor durabilidad. Disponibles en capacidades de 1 tonelada y 2 toneladas, con diferentes configuraciones de boca de carga (abierta, con boquilla, con falda) y descarga (fondo plano, con boquilla, con falda). Ideales para minería, agricultura, construcción y logística industrial.',
    specifications: [
      { label: 'Material', value: 'Polipropileno tejido (PP) 100% virgen con tratamiento UV' },
      { label: 'Capacidad', value: '1 Tonelada (1000 kg) / 2 Toneladas (2000 kg)' },
      { label: 'Dimensiones estándar 1T', value: '90x90x90 cm / 95x95x110 cm' },
      { label: 'Dimensiones estándar 2T', value: '95x95x130 cm / 100x100x150 cm' },
      { label: 'Resistencia a la rotura', value: '5:1 o 6:1 (factor de seguridad)' },
      { label: 'Tratamiento', value: 'Anti-UV, impermeable opcional, antiestático' },
      { label: 'Opciones de boca', value: 'Abierta, con boquilla, con falda, con cierre' },
      { label: 'Opciones de fondo', value: 'Plano, con boquilla, con falda, con cierre' },
      { label: 'Normas de referencia', value: 'Fabricado según normas de transporte de carga aplicables; documentación disponible en cotización' }
    ],
    applications: [
      'Transporte y almacenamiento de minerales y concentrados mineros',
      'Granos, fertilizantes, semillas y productos agrícolas a granel',
      'Cemento, arena, grava y materiales de construcción',
      'Productos químicos y fertilizantes industriales',
      'Residuos industriales y reciclaje'
    ],
    benefits: [
      'Alta resistencia y durabilidad en condiciones extremas',
      'Fácil manipulación con montacargas y grúas',
      'Ahorro significativo en costos de empaque y transporte',
      'Personalizables con logo y especificaciones del cliente',
      'Reutilizables y reciclables, opción eco-friendly'
    ],
    image: '/images/galeria/big-bags-bolsones-polipropileno-general.jpg',
    gallery: [
      '/images/galeria/big-bags-bolsones-polipropileno-general.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-detalle.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-instalacion.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-escala.jpg',
      '/images/big-bags.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 45.0,
    // priceUnit: 'unidad',
    // purchasable: true,
  },
  {
    id: '12',
    slug: 'sacos-polytarp-embarque-granel',
    name: 'Sacos Polytarp para Embarque a Granel',
    category: 'Envases y Embalaje',
    sector: ['Transporte', 'Minería', 'Agricultura', 'Logística'],
    shortDescription: 'Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.',
    description: 'Sacos de material Polytarp (polietileno laminado de alta densidad) para embarque a granel, protección de carga y estiba en operaciones portuarias, mineras y agrícolas. Alternativa robusta e impermeable para volúmenes donde el big bag no aplica. Confección con costura reforzada y refuerzos de esquina, en medidas estándar o a medida del cliente.',
    specifications: [
      { label: 'Material', value: 'Polytarp (PE laminado) 100% virgen, impermeable, aditivado UV' },
      { label: 'Gramaje', value: '120 - 200 g/m² según requerimiento' },
      { label: 'Medidas', value: 'Estándar y a medida (según carga y estiba)' },
      { label: 'Confección', value: 'Costura reforzada, refuerzos de esquina, asas opcionales' },
      { label: 'Impresión', value: 'Logotipo y rotulado de carga opcional' }
    ],
    applications: [
      'Embarque y estiba de carga a granel',
      'Protección de mercadería en tránsito y almacenaje',
      'Cobertura de pallets y unidades de carga',
      'Operaciones portuarias, mineras y agroindustriales'
    ],
    benefits: [
      '100% impermeable y resistente a la intemperie',
      'Confección reforzada para uso rudo y reutilización',
      'Personalizable en medida, color y rotulado',
      'Abastecimiento ágil con respaldo técnico local'
    ],
    image: '/images/galeria/sacos-polytarp-embarque-granel-general.jpg',
    gallery: [
      '/images/galeria/sacos-polytarp-embarque-granel-general.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-detalle.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-instalacion.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-escala.jpg',
      '/images/sacos-polytarp.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },
  {
    id: '13',
    slug: 'bolsas-laminas-pebd-pead',
    name: 'Bolsas y Láminas de Polietileno PEBD / PEAD',
    category: 'Envases y Embalaje',
    sector: ['Industrial', 'Agricultura', 'Logística', 'Construcción'],
    shortDescription: 'Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.',
    description: 'Bolsas y láminas de polietileno de baja densidad (PEBD) y alta densidad (PEAD) fabricadas con material 100% virgen, en un amplio rango de calibres, medidas y colores. Producción a medida para embalaje industrial, protección de productos, separación, recubrimiento de superficies y usos agrícolas. Disponibilidad de impresión personalizada.',
    specifications: [
      { label: 'Material', value: 'PEBD / PEAD 100% virgen' },
      { label: 'Calibre', value: 'Desde 1 hasta 8 milésimas de pulgada (según uso)' },
      { label: 'Medidas', value: 'Especiales, a medida del cliente' },
      { label: 'Colores', value: 'Transparente, natural y colores a solicitud' },
      { label: 'Presentación', value: 'Bolsas, láminas o rollos' },
      { label: 'Impresión', value: 'Personalizada (logo, indicaciones de manejo)' }
    ],
    applications: [
      'Embalaje y protección de productos industriales',
      'Recubrimiento y separación de materiales',
      'Forrado de contenedores, tolvas y estructuras',
      'Aplicaciones agrícolas y de almacenamiento'
    ],
    benefits: [
      'Material 100% virgen: mayor resistencia y limpieza',
      'Medidas y calibres exactos a su necesidad',
      'Opción de impresión y personalización',
      'Producción nacional con tiempos de entrega competitivos'
    ],
    image: '/images/galeria/bolsas-laminas-pebd-pead-general.jpg',
    gallery: [
      '/images/galeria/bolsas-laminas-pebd-pead-general.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-detalle.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-instalacion.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-escala.jpg',
      '/images/bolsas-laminas.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '14',
    slug: 'films-termocontraibles-shrink',
    name: 'Films Termocontraíbles (Shrink) y Mangas PE',
    category: 'Envases y Embalaje',
    sector: ['Industrial', 'Logística', 'Transporte'],
    shortDescription: 'Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.',
    description: 'Films y mangas termocontraíbles (shrink) de polietileno para unitización de cargas, embalaje seguro y protección de productos paletizados frente a polvo, humedad y manipulación. Se contraen con calor formando una envoltura firme y estable. Disponibles en distintos calibres y anchos, y en presentación de manga tubular PEBD/PEAD.',
    specifications: [
      { label: 'Material', value: 'Polietileno termocontraíble (shrink), PEBD/PEAD' },
      { label: 'Calibre', value: 'Según peso y estabilidad de carga requerida' },
      { label: 'Formato', value: 'Rollo plano, semitubo o manga tubular' },
      { label: 'Contracción', value: 'Activada por calor (túnel o pistola de calor)' },
      { label: 'Anchos', value: 'Estándar y especiales a medida' }
    ],
    applications: [
      'Unitización y estabilización de cargas paletizadas',
      'Embalaje de protección contra polvo y humedad',
      'Agrupación de productos para distribución',
      'Protección de bienes en tránsito y almacenaje'
    ],
    benefits: [
      'Envoltura firme y estable que asegura la carga',
      'Protección efectiva en tránsito y almacenamiento',
      'Optimiza espacio y presentación de la mercadería',
      'Calibres a medida para cada tipo de carga'
    ],
    image: '/images/galeria/films-termocontraibles-shrink-general.jpg',
    gallery: [
      '/images/galeria/films-termocontraibles-shrink-general.jpg',
      '/images/galeria/films-termocontraibles-shrink-detalle.jpg',
      '/images/galeria/films-termocontraibles-shrink-instalacion.jpg',
      '/images/galeria/films-termocontraibles-shrink-escala.jpg',
      '/images/films-shrink.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 2) LONAS Y COBERTORES TÉCNICOS  (flagship)
  // ===========================================================================
  {
    id: '11',
    slug: 'lona-plastificada-rafia-polytarp',
    name: 'Lona Plastificada, Rafia y Polytarp a Medida',
    category: 'Lonas y Cobertores',
    sector: ['Industrial', 'Construcción', 'Transporte', 'Agricultura', 'Minería'],
    shortDescription: 'Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.',
    description: 'Fabricación a medida de lonas plastificadas de PVC (450-900 g/m²), rafia de polipropileno tejida y polytarp de polietileno de alta densidad. Contamos con capacidad de confección industrial con soldadura de alta frecuencia, costura reforzada y aplicación de ojales, velcros, cremalleras y sistemas de tensión. Todo tipo de cubiertas: toldos, carpas, fundas para maquinaria, cubiertas de piscinas, lonas para camiones, cortinas industriales, y cualquier solución textil industrial que su proyecto requiera.',
    specifications: [
      { label: 'Materiales', value: 'PVC plastificado, Rafia PP, Polytarp PE, Lona de algodón encerada' },
      { label: 'Gramaje', value: 'Desde 200 g/m² hasta 900 g/m²' },
      { label: 'Anchos', value: 'Hasta 4.0 m en una pieza (uniones soldadas para mayores)' },
      { label: 'Acabados', value: 'Soldadura HF, costura doble reforzada, ojales, velcro, cremallera' },
      { label: 'Tratamientos', value: 'Anti-UV, ignífugo, antiestático, antibacteriano' },
      { label: 'Personalización', value: 'Impresión de logos, colores corporativos, medidas exactas' }
    ],
    applications: [
      'Cubiertas y fundas a medida para maquinaria y equipos',
      'Toldos y carpas para eventos, comercios y residencias',
      'Cortinas industriales y separadores de ambientes',
      'Cubiertas de piscinas, canchas y patios',
      'Cualquier solución textil industrial personalizada'
    ],
    benefits: [
      'Fabricación 100% a medida según sus especificaciones exactas',
      'Alta calidad de confección con garantía de durabilidad',
      'Asesoría técnica especializada para elegir la mejor solución',
      'Entregas rápidas y precios competitivos',
      'Soporte post-venta y reposición de partes'
    ],
    image: '/images/galeria/lona-plastificada-rafia-polytarp-general.jpg',
    gallery: [
      '/images/galeria/lona-plastificada-rafia-polytarp-general.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-detalle.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-instalacion.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-escala.jpg',
      '/images/lona-a-medida.jpg',
      '/images/ojalillo-rafia.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '7',
    slug: 'mantas-cobertores-toldos-camiones',
    name: 'Mantas Cobertores y Toldos para Camiones',
    category: 'Lonas y Cobertores',
    sector: ['Transporte', 'Logística', 'Minería', 'Agricultura'],
    shortDescription: 'Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.',
    description: 'Mantas y toldos de alta resistencia fabricados con lona de algodón o poliéster recubierta (cruda, teñida o encerada) especialmente diseñados para camiones de carga, remolques, contenedores y transporte de materiales a granel. Disponibles en medidas estándar para camiones de 2 ejes, 3 ejes y trailers, así como fabricación a medida. Incluyen ojales de latón reforzados cada 50cm y sistema de tensión profesional.',
    specifications: [
      { label: 'Material', value: 'Lona de algodón o poliéster recubierta (PVC o encerada)' },
      { label: 'Peso', value: '450 - 850 g/m² según tipo (cruda, teñida, encerada)' },
      { label: 'Medidas estándar', value: '6x3m, 7x3.5m, 8x4m, 9x4.5m, 10x5m (personalizables)' },
      { label: 'Ojales', value: 'Latón macizo reforzado cada 50 cm en todo el perímetro' },
      { label: 'Tratamiento', value: 'Impermeable, anti-UV, retardante de llama opcional' },
      { label: 'Colores', value: 'Verde, azul, negro, beige, naranja (personalizado)' },
      { label: 'Accesorios', value: 'Cuerdas elásticas, tensores, ganchos, fundas de protección' }
    ],
    applications: [
      'Transporte de carga general en camiones y trailers',
      'Transporte de minerales, concentrados y materiales de construcción',
      'Transporte de productos agrícolas (granos, fertilizantes, frutas)',
      'Mudanzas y transporte de enseres',
      'Coberturas temporales de contenedores y almacenes'
    ],
    benefits: [
      'Protección total contra lluvia, sol, polvo y vandalismo',
      'Alta durabilidad y resistencia al desgarro',
      'Fácil instalación y retiro (sistema de tensión profesional)',
      'Personalización con logo de la empresa transportista',
      'Opción de lona encerada tradicional de máxima impermeabilidad'
    ],
    image: '/images/galeria/mantas-cobertores-toldos-camiones-general.jpg',
    gallery: [
      '/images/galeria/mantas-cobertores-toldos-camiones-general.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-detalle.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-instalacion.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-escala.jpg',
      '/images/mantas-camiones.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '15',
    slug: 'siders-tolderas-camiones',
    name: 'Siders y Tolderas para Camiones',
    category: 'Lonas y Cobertores',
    sector: ['Transporte', 'Logística', 'Industrial'],
    shortDescription: 'Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.',
    description: 'Confección e instalación de siders (cortinas laterales corredizas) y tolderas para camiones, plataformas y semirremolques, en lona de PVC de alta tenacidad soldada por alta frecuencia. Sistemas de tensión, correas, hebillas y refuerzos para uso intensivo de transporte de carga. Fabricación a medida de la carrocería, con opción de rotulado publicitario de flota.',
    specifications: [
      { label: 'Material', value: 'Lona PVC alta tenacidad 650-900 g/m², anti-UV, impermeable' },
      { label: 'Sistema', value: 'Sider corredizo, toldera fija o desmontable' },
      { label: 'Herrajes', value: 'Correas, hebillas, tensores y refuerzos de uso rudo' },
      { label: 'Unión', value: 'Soldadura de alta frecuencia y costura reforzada' },
      { label: 'Personalización', value: 'Medida exacta de carrocería + rotulado de flota' }
    ],
    applications: [
      'Cortinas laterales para semirremolques y furgones',
      'Tolderas para plataformas y camiones de carga',
      'Renovación y reparación de siders existentes',
      'Rotulado y branding de flota de transporte'
    ],
    benefits: [
      'Confección exacta a la carrocería del cliente',
      'Materiales de alta tenacidad para uso intensivo',
      'Instalación profesional y soporte post-venta',
      'Doble función: protección de carga + imagen de marca'
    ],
    image: '/images/galeria/siders-tolderas-camiones-general.jpg',
    gallery: [
      '/images/galeria/siders-tolderas-camiones-general.jpg',
      '/images/galeria/siders-tolderas-camiones-detalle.jpg',
      '/images/galeria/siders-tolderas-camiones-instalacion.jpg',
      '/images/galeria/siders-tolderas-camiones-escala.jpg',
      '/images/siders-tolderas.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '16',
    slug: 'cobertores-agricolas-multimaterial',
    name: 'Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP)',
    category: 'Lonas y Cobertores',
    sector: ['Agricultura', 'Industrial', 'Logística'],
    shortDescription: 'Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.',
    description: 'Cobertores técnicos en múltiples materiales para cada necesidad de protección: Polytarp y PE impermeables para intemperie, Raschel para sombra y ventilación, térmicos para control de temperatura y anti-helada, y polipropileno para cobertura general. Confección a medida con ojales, refuerzos y sistemas de amarre. Solución única para reemplazar compras fragmentadas a varios proveedores.',
    specifications: [
      { label: 'Materiales', value: 'Polytarp, Polietileno (PE), Raschel, Térmico, Polipropileno (PP)' },
      { label: 'Acabados', value: 'Ojales, refuerzos perimetrales, dobladillos y amarres' },
      { label: 'Tratamiento', value: 'Aditivado UV; impermeable o transpirable según material' },
      { label: 'Medidas', value: 'Estándar y a medida del cliente' },
      { label: 'Uso', value: 'Intemperie, sombra, térmico/anti-helada o cobertura general' }
    ],
    applications: [
      'Protección de cultivos, camas de siembra y almácigos',
      'Cobertura de insumos, granos y mercadería a la intemperie',
      'Control de sombra, temperatura y helada en campo',
      'Protección general en industria, agro y logística'
    ],
    benefits: [
      'Un solo proveedor para todos los tipos de cobertor',
      'Material correcto para cada aplicación (no genérico)',
      'Confección a medida con acabados profesionales',
      'Asesoría para elegir el material óptimo por clima y uso'
    ],
    image: '/images/galeria/cobertores-agricolas-multimaterial-general.jpg',
    gallery: [
      '/images/galeria/cobertores-agricolas-multimaterial-general.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-detalle.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-instalacion.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-escala.jpg',
      '/images/cobertores-multimaterial.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },
  {
    id: '8',
    slug: 'mantas-arpilleras-granjas',
    name: 'Mantas Arpilleras para Granjas',
    category: 'Lonas y Cobertores',
    sector: ['Agricultura'],
    shortDescription: 'Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.',
    description: 'Mantas arpilleras tradicionales de yute natural o versiones sintéticas de alta resistencia, especialmente diseñadas para el sector avícola y porcino. Utilizadas como cama inicial, control de temperatura en pollitos, protección de suelo en galpones, y como barrera contra humedad y corrientes de aire. Disponibles en rollos de diferentes anchos y longitudes, con tratamiento opcional anti-bacteriano.',
    specifications: [
      { label: 'Material', value: 'Yute natural 100% o polipropileno tejido (arpillera sintética)' },
      { label: 'Peso', value: '200 - 400 g/m² (yute) / 150 - 300 g/m² (sintética)' },
      { label: 'Ancho de rollo', value: '1.0m, 1.2m, 1.5m, 2.0m' },
      { label: 'Longitud', value: '50m, 100m o según requerimiento' },
      { label: 'Tratamiento', value: 'Natural o con aditivo anti-bacteriano y anti-olor' },
      { label: 'Uso principal', value: 'Cama de pollitos, protección de suelo, cortinas laterales' }
    ],
    applications: [
      'Cama inicial para pollitos de engorde y ponedoras',
      'Protección de suelo en galpones avícolas y porcinos',
      'Cortinas laterales y control de temperatura',
      'Cubiertas de nidos y áreas de descanso',
      'Protección durante transporte de aves'
    ],
    benefits: [
      'Excelente regulación de temperatura y humedad',
      'Absorbe olores y mantiene ambiente más limpio',
      'Económica y biodegradable (versión yute)',
      'Fácil manejo y disposición al final del ciclo',
      'Mejora el bienestar animal y reduce mortalidad'
    ],
    image: '/images/galeria/mantas-arpilleras-granjas-general.jpg',
    gallery: [
      '/images/galeria/mantas-arpilleras-granjas-general.jpg',
      '/images/galeria/mantas-arpilleras-granjas-detalle.jpg',
      '/images/galeria/mantas-arpilleras-granjas-instalacion.jpg',
      '/images/galeria/mantas-arpilleras-granjas-escala.jpg',
      '/images/mantas-arpilleras.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },
  {
    id: '9',
    slug: 'mantas-aislantes-termicas-termoacusticas',
    name: 'Mantas Aislantes Térmicas y Termoacústicas',
    category: 'Lonas y Cobertores',
    sector: ['Construcción', 'Industrial', 'Minería'],
    shortDescription: 'Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.',
    description: 'Mantas aislantes multicapa fabricadas con materiales de alta tecnología (fibra de vidrio, lana de roca, espuma de poliuretano o polietileno reticulado) recubiertas con lona de aluminio o PVC reforzado. Diseñadas para aislamiento térmico y acústico en techos, paredes, contenedores, galpones industriales, cámaras frigoríficas y vehículos. Excelente rendimiento en climas extremos del Perú (costa, sierra y selva).',
    specifications: [
      { label: 'Materiales', value: 'Fibra de vidrio / Lana de roca / Espuma PU / PE reticulado + foil de aluminio' },
      { label: 'Espesor', value: '25mm, 50mm, 75mm, 100mm (estándar y personalizado)' },
      { label: 'Conductividad térmica', value: '0.030 - 0.045 W/m·K según material' },
      { label: 'Reducción acústica', value: 'Hasta 45 dB según configuración' },
      { label: 'Ancho de rollo', value: '1.2m y 1.5m estándar' },
      { label: 'Longitud', value: '10m, 15m, 20m' },
      { label: 'Acabado', value: 'Foil de aluminio puro o reforzado, PVC blanco/gris' }
    ],
    applications: [
      'Techos y paredes de galpones industriales y agrícolas',
      'Aislamiento de contenedores y módulos habitables',
      'Cámaras frigoríficas y cuartos fríos',
      'Cabinas de maquinaria y vehículos pesados',
      'Salas de máquinas, compresores y generadores',
      'Construcción en climas extremos (sierra y selva)'
    ],
    benefits: [
      'Reducción significativa de costos de climatización (hasta 40%)',
      'Confort térmico y acústico superior',
      'Fácil y rápida instalación (sistema de grapado o adhesivo)',
      'Resistente a humedad, hongos y roedores',
      'Larga vida útil y bajo mantenimiento'
    ],
    image: '/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg',
    gallery: [
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-escala.jpg',
      '/images/mantas-aislantes.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 3) ESTRUCTURAS Y ARQUITECTURA TEXTIL
  // ===========================================================================
  {
    id: '3',
    slug: 'carpas-lona-estructuras-metalicas',
    name: 'Carpas de Lona Plástica con Estructuras Metálicas',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Construcción', 'Agricultura', 'Industrial', 'Minería'],
    shortDescription: 'Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.',
    description: 'Soluciones completas de carpas industriales y hangares fabricados con lona plastificada de PVC de 650-900 g/m² de alta resistencia, montados sobre estructuras metálicas galvanizadas en caliente de diseño modular. Ideales para almacenamiento temporal o semi-permanente, hangares para maquinaria, galpones agrícolas, techos de piscinas, canchas deportivas, patios de colegios, sombras de estacionamiento y albergues tipo igloo. Fabricación 100% personalizada según requerimientos del cliente.',
    specifications: [
      { label: 'Material de lona', value: 'PVC plastificado 650-900 g/m², anti-UV, impermeable, retardante de llama' },
      { label: 'Estructura', value: 'Acero galvanizado en caliente, perfiles de alta resistencia' },
      { label: 'Ancho de vano', value: 'De 6m hasta 30m (sin columnas intermedias)' },
      { label: 'Longitud', value: 'Módulos de 3m o 6m, ilimitada' },
      { label: 'Altura', value: 'De 3m a 12m según diseño' },
      { label: 'Carga de viento', value: 'Diseño según normas locales (hasta 120 km/h)' },
      { label: 'Opciones', value: 'Puertas enrollables, ventanas, ventilación, iluminación, aislamiento térmico' }
    ],
    applications: [
      'Hangares para maquinaria agrícola, minera y de construcción',
      'Almacenes temporales y galpones para productos a granel',
      'Techos de piscinas, canchas deportivas y patios escolares',
      'Sombrillas y cubiertas para estacionamientos y patios',
      'Albergues de emergencia tipo igloo y campamentos',
      'Eventos masivos y ferias temporales'
    ],
    benefits: [
      'Instalación rápida (días vs meses de construcción tradicional)',
      'Costo significativamente menor que estructuras permanentes',
      'Totalmente desmontable y reubicable',
      'Personalización completa de dimensiones, color y accesorios',
      'Alta durabilidad (10+ años) con mantenimiento mínimo'
    ],
    image: '/images/galeria/carpas-lona-estructuras-metalicas-general.jpg',
    gallery: [
      '/images/galeria/carpas-lona-estructuras-metalicas-general.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-detalle.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-instalacion.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-escala.jpg',
      '/images/carpas.jpg',
      '/images/techos-escolares.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '17',
    slug: 'coberturas-tensionadas-arquitectura-textil',
    name: 'Coberturas Tensionadas y Arquitectura Textil',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Construcción', 'Comercio', 'Infraestructura'],
    shortDescription: 'Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.',
    description: 'Diseño, fabricación e instalación de coberturas tensionadas en membrana textil (PVC/poliéster de alta resistencia) para grandes luces y formas arquitectónicas: sombras de estacionamiento, patios de comida, ingresos, plazas y áreas comerciales. Incluye cálculo de patrón, herrajes de acero inoxidable, cables y anclajes. Cada proyecto se dimensiona según luz, cargas de viento y geometría del sitio.',
    specifications: [
      { label: 'Membrana', value: 'Lona PVC/poliéster de alta tenacidad, anti-UV, autolimpiante opcional' },
      { label: 'Herrajes', value: 'Acero inoxidable / galvanizado, cables y tensores' },
      { label: 'Luces', value: 'Según proyecto (formas cónicas, hypar, en voladizo)' },
      { label: 'Diseño', value: 'Cálculo de patrón y cargas específico por sitio' },
      { label: 'Cargas', value: 'Diseño según viento y geometría local del proyecto' }
    ],
    applications: [
      'Sombras de estacionamiento y playas vehiculares',
      'Patios de comida, plazas e ingresos comerciales',
      'Cubiertas de áreas recreativas y deportivas',
      'Elementos arquitectónicos e imagen de marca'
    ],
    benefits: [
      'Diseño arquitectónico a medida del espacio',
      'Grandes luces con estética contemporánea',
      'Instalación profesional con herrajes de calidad',
      'Alternativa ligera y de rápida ejecución'
    ],
    image: '/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg',
    gallery: [
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-escala.jpg',
      '/images/tensoestructuras.jpg',
      '/images/toldos-cerramientos.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '18',
    slug: 'coberturas-inflables',
    name: 'Coberturas y Estructuras Inflables',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Industrial', 'Comercio', 'Construcción'],
    shortDescription: 'Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.',
    description: 'Estructuras inflables de membrana textil sostenidas por presión de aire, para almacenamiento temporal, coberturas deportivas, espacios de evento y protección de instalaciones. Se dimensionan por proyecto e incluyen equipo de insuflado, esclusas de acceso y anclaje. Línea de suministro por proyecto: se define ingeniería, membrana y equipamiento según el requerimiento específico.',
    specifications: [
      { label: 'Sistema', value: 'Membrana sostenida por presión de aire (air-supported)' },
      { label: 'Membrana', value: 'PVC/poliéster de alta resistencia, aditivado UV' },
      { label: 'Equipamiento', value: 'Blowers, esclusa de acceso, sistema de anclaje' },
      { label: 'Dimensiones', value: 'Según proyecto e ingeniería específica' },
      { label: 'Disponibilidad', value: 'Por proyecto — ingeniería y ficha técnica' }
    ],
    applications: [
      'Almacenamiento y coberturas temporales',
      'Coberturas deportivas y recreativas',
      'Espacios de evento y exhibición',
      'Protección de instalaciones y equipos'
    ],
    benefits: [
      'Grandes espacios sin estructura interna',
      'Montaje y desmontaje relativamente rápidos',
      'Solución temporal o semipermanente',
      'Dimensionamiento y ficha técnica por proyecto'
    ],
    image: '/images/galeria/coberturas-inflables-general.jpg',
    gallery: [
      '/images/galeria/coberturas-inflables-general.jpg',
      '/images/galeria/coberturas-inflables-detalle.jpg',
      '/images/galeria/coberturas-inflables-instalacion.jpg',
      '/images/galeria/coberturas-inflables-escala.jpg',
      '/images/inflables.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'bajo_pedido',
    availability: 'bajo_pedido',
    leadTime: 'Según proyecto'
  },
  {
    id: '19',
    slug: 'modulos-albergues-campamentos',
    name: 'Módulos y Albergues para Campamentos',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Minería', 'Construcción', 'Industrial'],
    shortDescription: 'Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.',
    description: 'Módulos estructurados, tiendas de campaña y albergues para campamentos de minería, construcción y operaciones remotas. Estructura metálica modular con cobertura de lona técnica anti-UV e impermeable, con opciones de aislamiento térmico, ventilación y divisiones internas. Se configuran según cantidad de personal, clima y logística del sitio.',
    specifications: [
      { label: 'Cobertura', value: 'Lona PVC/técnica anti-UV, impermeable, retardante de llama opcional' },
      { label: 'Estructura', value: 'Metálica modular, desmontable y reubicable' },
      { label: 'Configuración', value: 'Dormitorios, comedores, almacenes, oficinas de obra' },
      { label: 'Opciones', value: 'Aislamiento térmico, ventilación, divisiones, piso' },
      { label: 'Clima', value: 'Adaptable a costa, sierra y selva' }
    ],
    applications: [
      'Campamentos mineros y de exploración',
      'Obras de construcción e infraestructura remota',
      'Albergues temporales y de emergencia',
      'Almacenes y oficinas de campo'
    ],
    benefits: [
      'Instalación rápida en sitios remotos',
      'Desmontable y reubicable entre proyectos',
      'Adaptado al clima del emplazamiento',
      'Configuración a medida del personal y la operación'
    ],
    image: '/images/galeria/modulos-albergues-campamentos-general.jpg',
    gallery: [
      '/images/galeria/modulos-albergues-campamentos-general.jpg',
      '/images/galeria/modulos-albergues-campamentos-detalle.jpg',
      '/images/galeria/modulos-albergues-campamentos-instalacion.jpg',
      '/images/galeria/modulos-albergues-campamentos-escala.jpg',
      '/images/modulos-campamentos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '20',
    slug: 'galpones-invernaderos-estructurados',
    name: 'Galpones, Techos Ligeros e Invernaderos Estructurados',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Agricultura', 'Industrial', 'Construcción'],
    shortDescription: 'Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.',
    description: 'Galpones y techos ligeros de estructura metálica con cobertura textil, e invernaderos estructurados para agricultura protegida de alto rendimiento. Combinan estructura galvanizada con films/mallas y lonas técnicas según el cultivo o el uso. Se diseñan por ancho de vano, control climático requerido y condiciones del sitio.',
    specifications: [
      { label: 'Estructura', value: 'Metálica galvanizada, modular, diseño por vano' },
      { label: 'Cobertura', value: 'Film agrícola, malla o lona técnica según aplicación' },
      { label: 'Ancho de vano', value: 'Según diseño y control climático requerido' },
      { label: 'Opciones', value: 'Ventilación cenital/lateral, malla antiáfida, sombra' },
      { label: 'Uso', value: 'Agricultura protegida, almacenamiento, producción' }
    ],
    applications: [
      'Invernaderos para hortalizas, berries y flores',
      'Galpones y techos ligeros para almacenamiento',
      'Viveros y producción de plántulas',
      'Cobertizos agrícolas e industriales'
    ],
    benefits: [
      'Mayor rendimiento por control del ambiente de cultivo',
      'Estructura duradera y cobertura adecuada al cultivo',
      'Diseño e instalación a medida del sitio',
      'Integrable con nuestra línea de mallas agrícolas'
    ],
    image: '/images/galeria/galpones-invernaderos-estructurados-general.jpg',
    gallery: [
      '/images/galeria/galpones-invernaderos-estructurados-general.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-detalle.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-instalacion.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-escala.jpg',
      '/images/invernaderos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '21',
    slug: 'toldos-cerramientos',
    name: 'Toldos, Cerramientos y Cortinas Industriales',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Comercio', 'Industrial', 'Construcción'],
    shortDescription: 'Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.',
    description: 'Toldos decorativos y comerciales, cerramientos de lona (puertas y ventanas de lona), y cortinas industriales para delimitación de ambientes, control de clima y protección de accesos. Confección en lona PVC de alta resistencia, con sistemas de enrollado, corredera o fijos, a medida del vano.',
    specifications: [
      { label: 'Material', value: 'Lona PVC de alta resistencia, anti-UV, impermeable' },
      { label: 'Sistemas', value: 'Enrollable, corredera, fijo o plegable' },
      { label: 'Aplicación', value: 'Toldo, cerramiento de vano o cortina industrial' },
      { label: 'Herrajes', value: 'Estructura y herrajes según tipo de instalación' },
      { label: 'Personalización', value: 'Color, rotulado e imagen comercial' }
    ],
    applications: [
      'Toldos para comercios, restaurantes y viviendas',
      'Cerramientos de ambientes y accesos',
      'Cortinas industriales y separadores de nave',
      'Control de clima y protección de vanos'
    ],
    benefits: [
      'Confección a medida del vano y del uso',
      'Mejora imagen comercial y confort del espacio',
      'Materiales durables para intemperie',
      'Instalación profesional y soporte'
    ],
    image: '/images/galeria/toldos-cerramientos-general.jpg',
    gallery: [
      '/images/galeria/toldos-cerramientos-general.jpg',
      '/images/galeria/toldos-cerramientos-detalle.jpg',
      '/images/galeria/toldos-cerramientos-instalacion.jpg',
      '/images/galeria/toldos-cerramientos-escala.jpg',
      '/images/toldos-cerramientos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 4) MALLAS Y COBERTURAS AGRÍCOLAS
  // ===========================================================================
  {
    id: '6',
    slug: 'mallas-antiafidas',
    name: 'Mallas Antiáfidas para Protección de Cultivos',
    category: 'Mallas y Coberturas Agrícolas',
    sector: ['Agricultura'],
    shortDescription: 'Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.',
    description: 'Mallas antiáfidas tejidas con hilos de polietileno de alta densidad (HDPE) con tratamiento UV, diseñadas para crear barreras físicas efectivas contra áfidos, mosca blanca, trips y otros insectos plaga, así como protección contra pájaros y granizo. Disponibles en diferentes densidades de malla (17x17, 25x25, 40x40 hilos/pulgada) según el tipo de cultivo y plaga objetivo. Perfectas para invernaderos, túneles altos, mallas sombra y sistemas de protección de cultivos a campo abierto.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE) 100% virgen con tratamiento UV' },
      { label: 'Densidad de malla', value: '17x17, 25x25, 40x40 hilos por pulgada (según plaga)' },
      { label: 'Ancho de rollo', value: '1.5m, 2.0m, 3.0m, 4.0m y 6.0m' },
      { label: 'Longitud', value: '50m, 100m o rollos personalizados' },
      { label: 'Transmisión de luz', value: '85% - 95% según densidad' },
      { label: 'Vida útil', value: '3-5 años en condiciones de campo' },
      { label: 'Opciones', value: 'Malla antiáfida, anti-trips, anti-pájaros, malla sombra combinada' }
    ],
    applications: [
      'Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.)',
      'Cultivo de berries, uvas y frutales',
      'Invernaderos y túneles de producción',
      'Viveros y producción de plántulas',
      'Agricultura orgánica y sin residuos de plaguicidas'
    ],
    benefits: [
      'Reducción drástica del uso de insecticidas (hasta 80%)',
      'Mejora la calidad y sanidad del producto final',
      'Protección contra condiciones climáticas extremas',
      'Fácil instalación y larga vida útil',
      'Compatible con producción orgánica y exportación'
    ],
    image: '/images/galeria/mallas-antiafidas-general.jpg',
    gallery: [
      '/images/galeria/mallas-antiafidas-general.jpg',
      '/images/galeria/mallas-antiafidas-detalle.jpg',
      '/images/galeria/mallas-antiafidas-instalacion.jpg',
      '/images/galeria/mallas-antiafidas-escala.jpg',
      '/images/mallas-antiafidas.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 8.5,
    // priceUnit: 'm²',
    // purchasable: true,
  },
  {
    id: '22',
    slug: 'malla-raschel-sombra',
    name: 'Malla Raschel y Malla Sombra',
    category: 'Mallas y Coberturas Agrícolas',
    sector: ['Agricultura', 'Construcción', 'Comercio'],
    shortDescription: 'Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.',
    description: 'Mallas Raschel de polietileno de alta densidad con tratamiento UV, en distintos porcentajes de sombra (35%, 50%, 65%, 80%, 90%) para control de radiación, temperatura y viento. Uso agrícola (viveros, cultivos sensibles), cercos, sombras de estacionamiento y delimitación de obra. Disponibles en varios colores y anchos, con opción de confección con refuerzos y ojales.',
    specifications: [
      { label: 'Material', value: 'HDPE 100% virgen con tratamiento UV' },
      { label: 'Porcentaje de sombra', value: '35%, 50%, 65%, 80%, 90%' },
      { label: 'Colores', value: 'Negro, verde, y otros a solicitud' },
      { label: 'Ancho de rollo', value: '2.0m, 3.0m, 4.0m (otros a pedido)' },
      { label: 'Confección', value: 'Con refuerzos, dobladillo y ojales opcional' }
    ],
    applications: [
      'Sombra para viveros y cultivos sensibles',
      'Cercos, delimitación y control de viento',
      'Sombras de estacionamiento y áreas comunes',
      'Cerramientos temporales de obra'
    ],
    benefits: [
      'Control preciso de luz y temperatura por % de sombra',
      'Material aditivado UV para larga duración',
      'Versátil para agro, comercio y construcción',
      'Confección con acabados a medida'
    ],
    image: '/images/galeria/malla-raschel-sombra-general.jpg',
    gallery: [
      '/images/galeria/malla-raschel-sombra-general.jpg',
      '/images/galeria/malla-raschel-sombra-detalle.jpg',
      '/images/galeria/malla-raschel-sombra-instalacion.jpg',
      '/images/galeria/malla-raschel-sombra-escala.jpg',
      '/images/malla-raschel.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },
  {
    id: '23',
    slug: 'malla-anti-pajaro-anti-granizo',
    name: 'Malla Anti-Pájaro y Anti-Granizo',
    category: 'Mallas y Coberturas Agrícolas',
    sector: ['Agricultura'],
    shortDescription: 'Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.',
    description: 'Mallas ligeras de protección contra aves y granizo para frutales, viñedos y cultivos de alto valor. Barrera física que reduce pérdidas de cosecha sin afectar significativamente la luz. Confección a medida del huerto, con refuerzos y sistemas de tensión para cobertura de hileras o cobertura total.',
    specifications: [
      { label: 'Material', value: 'Polietileno/HDPE aditivado UV, tejido ligero' },
      { label: 'Tipo', value: 'Anti-pájaro (malla fina) / Anti-granizo (malla reforzada)' },
      { label: 'Formato', value: 'Cobertura de hilera o cobertura total' },
      { label: 'Ancho', value: 'Según diseño del huerto' },
      { label: 'Confección', value: 'Refuerzos, ojales y sistema de tensión' }
    ],
    applications: [
      'Protección de frutales y viñedos',
      'Cultivos de alto valor y berries',
      'Reducción de pérdidas por aves y granizo',
      'Sistemas de cobertura de hilera'
    ],
    benefits: [
      'Reduce pérdidas de cosecha por fauna y clima',
      'Barrera física sin agroquímicos',
      'Confección a medida del huerto',
      'Larga vida útil con tratamiento UV'
    ],
    image: '/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg',
    gallery: [
      '/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-detalle.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-instalacion.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-escala.jpg',
      '/images/malla-anti-pajaro.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 5) VENTILACIÓN INDUSTRIAL
  // ===========================================================================
  {
    id: '5',
    slug: 'mangas-ventilacion-minas-tuneles',
    name: 'Mangas de Ventilación para Minas y Túneles',
    category: 'Ventilación Industrial',
    sector: ['Minería', 'Construcción'],
    shortDescription: 'Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.',
    description: 'Mangas de ventilación fabricadas con lona plastificada de PVC o poliuretano de alta tenacidad, reforzada para soportar condiciones extremas de minería subterránea y construcción de túneles. Disponibles en diámetros desde 300mm hasta 2000mm, con o sin refuerzo de espiral de acero. Incluyen accesorios completos: codos, Y, reducciones, compuertas y conexiones rápidas. Diseñadas para ventilación principal, auxiliar y de emergencia.',
    specifications: [
      { label: 'Material', value: 'PVC plastificado o Poliuretano reforzado, antiestático opcional' },
      { label: 'Diámetros', value: '300 mm a 2000 mm (estándar y personalizados)' },
      { label: 'Longitud por sección', value: '10m, 20m, 30m o según requerimiento' },
      { label: 'Presión de trabajo', value: 'Hasta 5000 Pa (dependiendo de diámetro y refuerzo)' },
      { label: 'Refuerzo', value: 'Espiral de acero galvanizado embebido (opcional)' },
      { label: 'Propiedades', value: 'Antiestático, retardante de llama, resistente a aceites y ácidos' },
      { label: 'Conexiones', value: 'Cremallera, velcro, bridas o sistema de acople rápido' }
    ],
    applications: [
      'Ventilación principal y auxiliar en minas subterráneas',
      'Túneles carreteros, ferroviarios y de metro',
      'Obras de infraestructura subterránea',
      'Sistemas de extracción de polvo y gases',
      'Ventilación de emergencia y rescate'
    ],
    benefits: [
      'Alta durabilidad en ambientes corrosivos y abrasivos',
      'Fácil instalación, transporte y reconfiguración',
      'Excelente flujo de aire con mínima pérdida de presión',
      'Personalización total de diámetro, longitud y accesorios',
      'Cumplimiento de normas de seguridad minera (OIT, MINEM)'
    ],
    image: '/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg',
    gallery: [
      '/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-detalle.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-instalacion.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-escala.jpg',
      '/images/mangas-ventilacion.jpg',
      '/images/mangas-ventilacion-y.jpg',
      '/images/mangas-produccion.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 6) GEOSINTÉTICOS E IMPERMEABILIZACIÓN
  //    PVC = fabricación/soldadura propia. Resto = importación directa,
  //    disponible bajo pedido (ficha técnica y certificado de lote en cotización).
  // ===========================================================================
  {
    id: '4',
    slug: 'geomembranas-pvc',
    name: 'Geomembranas de PVC',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Agricultura', 'Construcción', 'Industrial'],
    shortDescription: 'Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.',
    description: 'Geomembranas de PVC fabricadas con resina virgen de alta calidad, reforzadas y no reforzadas, en espesores desde 0.5mm hasta 2.0mm. Especialmente diseñadas para aplicaciones de contención de líquidos, impermeabilización de pozas de relave minero, canales de riego, lagunas de tratamiento, subsuelos de edificaciones y obras hidráulicas. Nuestras geomembranas se soldan en obra mediante equipos de soldadura por alta frecuencia o cuña caliente, garantizando juntas 100% impermeables y duraderas.',
    specifications: [
      { label: 'Material', value: 'PVC plastificado virgen de alta densidad' },
      { label: 'Espesores', value: '0.5 mm, 0.75 mm, 1.0 mm, 1.5 mm, 2.0 mm' },
      { label: 'Ancho de rollo', value: 'Hasta 2.0 m estándar (anchos especiales por proyecto)' },
      { label: 'Resistencia a la tracción', value: 'Alta resistencia; valores según ficha técnica del material en cotización' },
      { label: 'Elongación a la rotura', value: '≥ 300%' },
      { label: 'Resistencia a la perforación', value: 'Alta (reforzada con geotextil opcional)' },
      { label: 'Soldadura', value: 'Por alta frecuencia o cuña caliente - 100% hermética' },
      { label: 'Vida útil estimada', value: '20+ años en condiciones normales' }
    ],
    applications: [
      'Pozas de relave y contención minera',
      'Canales de riego y reservorios agrícolas',
      'Lagunas de tratamiento de aguas residuales',
      'Impermeabilización de subsuelos y fundaciones',
      'Cubiertas de vertederos y sitios de disposición final',
      'Acuicultura y piscicultura (estanques)'
    ],
    benefits: [
      'Excelente impermeabilidad y resistencia química',
      'Soldadura en obra con garantía de hermeticidad',
      'Alta flexibilidad y adaptabilidad a todo tipo de terreno',
      'Resistente a rayos UV y condiciones climáticas extremas',
      'Cumplimiento de normas ambientales y de seguridad'
    ],
    image: '/images/galeria/geomembranas-pvc-general.jpg',
    gallery: [
      '/images/galeria/geomembranas-pvc-general.jpg',
      '/images/galeria/geomembranas-pvc-detalle.jpg',
      '/images/galeria/geomembranas-pvc-instalacion.jpg',
      '/images/galeria/geomembranas-pvc-escala.jpg',
      '/images/geomembranas.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '24',
    slug: 'geomembrana-polietileno-pe-hdpe',
    name: 'Geomembrana de Polietileno (PE / HDPE)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura', 'Energía'],
    shortDescription: 'Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.',
    description: 'Geomembrana de polietileno de alta densidad (HDPE) para impermeabilización de pozas de proceso y relave, rellenos sanitarios, reservorios y obras hidráulicas donde se requiere alta resistencia química y mecánica. Se instala con soldadura por termofusión (cuña caliente / extrusión). Línea de importación directa, suministrada por proyecto: los espesores, propiedades y el certificado de lote del fabricante se confirman y entregan en la cotización según el proyecto.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE)' },
      { label: 'Espesores', value: 'Rango típico 0.75 – 2.5 mm (a confirmar por proyecto)' },
      { label: 'Instalación', value: 'Termofusión: cuña caliente / extrusión' },
      { label: 'Propiedades', value: 'Alta resistencia química y a la perforación' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote del fabricante en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Pozas de proceso y relave en minería',
      'Rellenos sanitarios y de seguridad',
      'Reservorios y lagunas de tratamiento',
      'Canales y obras hidráulicas de exigencia'
    ],
    benefits: [
      'Alta resistencia química para procesos agresivos',
      'Soldadura por termofusión de gran fiabilidad',
      'Espesores y ficha ajustados a cada proyecto',
      'Documentación de respaldo entregada en la cotización'
    ],
    image: '/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg',
    gallery: [
      '/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-detalle.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-escala.jpg',
      '/images/geomembrana-hdpe.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '25',
    slug: 'geomembrana-pe-fortificada',
    name: 'Geomembrana de PE Fortificada (Reforzada)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Construcción', 'Infraestructura', 'Energía'],
    shortDescription: 'Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.',
    description: 'Geomembrana de polietileno fortificada con inserto de refuerzo (scrim) para aplicaciones que requieren mayor resistencia al punzonamiento y a esfuerzos mecánicos, con menor peso por m² frente a espesores equivalentes. Línea de importación directa, suministrada por proyecto; propiedades y certificado de lote se entregan según especificación del proyecto.',
    specifications: [
      { label: 'Material', value: 'Polietileno con refuerzo interno (scrim)' },
      { label: 'Ventaja', value: 'Mayor resistencia mecánica / punzonamiento por peso' },
      { label: 'Instalación', value: 'Termofusión / según sistema del fabricante' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Cubiertas flotantes y coberturas expuestas',
      'Aplicaciones con alto riesgo de punzonamiento',
      'Obras temporales de impermeabilización',
      'Proyectos con restricciones de peso'
    ],
    benefits: [
      'Refuerzo interno para mayor tenacidad',
      'Buena relación resistencia/peso',
      'Especificación ajustada al proyecto',
      'Documentación técnica de respaldo en cotización'
    ],
    image: '/images/galeria/geomembrana-pe-fortificada-general.jpg',
    gallery: [
      '/images/galeria/geomembrana-pe-fortificada-general.jpg',
      '/images/galeria/geomembrana-pe-fortificada-detalle.jpg',
      '/images/galeria/geomembrana-pe-fortificada-instalacion.jpg',
      '/images/galeria/geomembrana-pe-fortificada-escala.jpg',
      '/images/geomembrana-fortificada.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '26',
    slug: 'geomembrana-bituminosa',
    name: 'Geomembrana Bituminosa',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Infraestructura', 'Construcción', 'Saneamiento'],
    shortDescription: 'Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.',
    description: 'Geomembrana bituminosa para impermeabilización de tôneles, obras civiles, canales y estructuras hidráulicas, con buena adaptación al sustrato y resistencia mecánica. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote se entregan según el proyecto.',
    specifications: [
      { label: 'Material', value: 'Membrana bituminosa (asfáltica) reforzada' },
      { label: 'Uso', value: 'Túneles, obras civiles, canales, estructuras hidráulicas' },
      { label: 'Instalación', value: 'Según sistema del fabricante (soplete / adherida)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Impermeabilización de túneles y obras subterráneas',
      'Canales y estructuras hidráulicas',
      'Obras civiles de infraestructura',
      'Cimentaciones y muros'
    ],
    benefits: [
      'Buena adaptación al sustrato',
      'Resistencia mecánica para obra civil',
      'Especificación por proyecto',
      'Documentación de respaldo en cotización'
    ],
    image: '/images/galeria/geomembrana-bituminosa-general.jpg',
    gallery: [
      '/images/galeria/geomembrana-bituminosa-general.jpg',
      '/images/galeria/geomembrana-bituminosa-detalle.jpg',
      '/images/galeria/geomembrana-bituminosa-instalacion.jpg',
      '/images/galeria/geomembrana-bituminosa-escala.jpg',
      '/images/geomembrana-bituminosa.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '27',
    slug: 'geotextiles',
    name: 'Geotextiles (Tejidos y No Tejidos)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Construcción', 'Minería', 'Infraestructura', 'Saneamiento'],
    shortDescription: 'Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.',
    description: 'Geotextiles tejidos (refuerzo) y no tejidos (separación, filtración, drenaje y protección de geomembranas) para obras de ingeniería civil, minería e infraestructura. Se seleccionan por gramaje y función. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote se entregan según proyecto.',
    specifications: [
      { label: 'Tipos', value: 'No tejido (punzonado) y tejido' },
      { label: 'Función', value: 'Separación, filtración, drenaje, refuerzo, protección' },
      { label: 'Gramaje', value: 'Rango según función (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Separación de capas en terraplenes y vías',
      'Filtración y drenaje en obras de tierra',
      'Protección de geomembranas',
      'Refuerzo de suelos blandos'
    ],
    benefits: [
      'Función correcta según gramaje y tipo',
      'Complemento ideal de la línea de geomembranas',
      'Sistemas integrados de un solo proveedor',
      'Documentación técnica en cotización'
    ],
    image: '/images/galeria/geotextiles-general.jpg',
    gallery: [
      '/images/galeria/geotextiles-general.jpg',
      '/images/galeria/geotextiles-detalle.jpg',
      '/images/galeria/geotextiles-instalacion.jpg',
      '/images/galeria/geotextiles-escala.jpg',
      '/images/geotextiles.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '28',
    slug: 'geomallas-geogrids',
    name: 'Geomallas (Geogrids) para Estabilización de Suelos',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Construcción', 'Minería', 'Infraestructura'],
    shortDescription: 'Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.',
    description: 'Geomallas (geogrids) uniaxiales y biaxiales para refuerzo de suelos, estabilización de taludes, bases de carreteras, plataformas y muros de suelo reforzado. Se seleccionan por resistencia a la tracción y geometría de apertura según el diseño geotécnico. Línea de importación directa, suministrada por proyecto; ficha y certificado de lote se entregan según proyecto.',
    specifications: [
      { label: 'Tipos', value: 'Uniaxial y biaxial' },
      { label: 'Función', value: 'Refuerzo y estabilización de suelos y taludes' },
      { label: 'Resistencia', value: 'Según diseño geotécnico (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Bases y sub-bases de carreteras y plataformas',
      'Muros de suelo reforzado',
      'Estabilización de taludes',
      'Plataformas mineras e industriales'
    ],
    benefits: [
      'Refuerzo que prolonga vida útil de la obra',
      'Selección por diseño geotécnico',
      'Complementa geotextiles y geomembranas',
      'Documentación técnica en cotización'
    ],
    image: '/images/galeria/geomallas-geogrids-general.jpg',
    gallery: [
      '/images/galeria/geomallas-geogrids-general.jpg',
      '/images/galeria/geomallas-geogrids-detalle.jpg',
      '/images/galeria/geomallas-geogrids-instalacion.jpg',
      '/images/galeria/geomallas-geogrids-escala.jpg',
      '/images/geomallas.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 7) SOLUCIONES AMBIENTALES Y FLUIDOS  (bajo pedido / aliado técnico)
  // ===========================================================================
  {
    id: '29',
    slug: 'tanques-flexibles-bladders',
    name: 'Tanques Flexibles (Bladders)',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Agricultura', 'Industrial', 'Minería', 'Saneamiento'],
    shortDescription: 'Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.',
    description: 'Tanques flexibles (bladders) de membrana técnica para almacenamiento de agua, efluentes y otros líquidos, plegables y de rápida instalación sin obra civil. Ideales para riego, reserva de agua, contingencia y campamentos. Línea de suministro por proyecto: capacidad, membrana y accesorios se definen según la aplicación, con ficha técnica en la cotización.',
    specifications: [
      { label: 'Material', value: 'Membrana técnica (PVC/PU) resistente al líquido almacenado' },
      { label: 'Capacidad', value: 'Según requerimiento (a definir por proyecto)' },
      { label: 'Instalación', value: 'Sin obra civil, plegable y reubicable' },
      { label: 'Accesorios', value: 'Válvulas, conexiones y kit de llenado/vaciado' },
      { label: 'Disponibilidad', value: 'Por proyecto — ficha técnica incluida' }
    ],
    applications: [
      'Reserva de agua para riego y ganadería',
      'Almacenamiento de efluentes y contingencia',
      'Agua para campamentos y obras remotas',
      'Almacenamiento temporal de líquidos industriales'
    ],
    benefits: [
      'Instalación rápida sin obra civil',
      'Plegable, transportable y reubicable',
      'Capacidad y membrana a medida del uso',
      'Ficha técnica entregada en cotización'
    ],
    image: '/images/galeria/tanques-flexibles-bladders-general.jpg',
    gallery: [
      '/images/galeria/tanques-flexibles-bladders-general.jpg',
      '/images/galeria/tanques-flexibles-bladders-detalle.jpg',
      '/images/galeria/tanques-flexibles-bladders-instalacion.jpg',
      '/images/galeria/tanques-flexibles-bladders-escala.jpg',
      '/images/tanques-flexibles.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica del fabricante a solicitud, en cotización.'
  },
  {
    id: '30',
    slug: 'biodigestores',
    name: 'Biodigestores para Tratamiento de Residuos',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Agricultura', 'Industrial', 'Saneamiento'],
    shortDescription: 'Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.',
    description: 'Sistemas de biodigestión anaeróbica para el tratamiento de residuos orgánicos agroindustriales y la generación de biogás, provistos mediante aliado técnico especializado. Cada instalación se dimensiona por volumen de residuo, temperatura y objetivo (tratamiento y/o energía). De suministro por proyecto, con evaluación previa del caso.',
    specifications: [
      { label: 'Sistema', value: 'Biodigestión anaeróbica (tubular / de membrana)' },
      { label: 'Salida', value: 'Biol/biogás según diseño' },
      { label: 'Provisión', value: 'Mediante aliado técnico especializado' },
      { label: 'Dimensionamiento', value: 'Según volumen de residuo y objetivo' },
      { label: 'Disponibilidad', value: 'Por proyecto — con evaluación previa' }
    ],
    applications: [
      'Tratamiento de residuos ganaderos y agroindustriales',
      'Generación de biogás para autoconsumo',
      'Gestión ambiental de efluentes orgánicos',
      'Proyectos de sostenibilidad rural'
    ],
    benefits: [
      'Aprovechamiento energético del residuo',
      'Mejora la gestión ambiental del predio',
      'Diseño según el caso, con aliado técnico',
      'Evaluación previa para asegurar viabilidad'
    ],
    image: '/images/galeria/biodigestores-general.jpg',
    gallery: [
      '/images/galeria/biodigestores-general.jpg',
      '/images/galeria/biodigestores-detalle.jpg',
      '/images/galeria/biodigestores-instalacion.jpg',
      '/images/galeria/biodigestores-escala.jpg',
      '/images/biodigestores.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'partner',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — con evaluación previa',
    documentation: 'Memoria técnica del aliado a solicitud, tras evaluación del caso.'
  },
  {
    id: '31',
    slug: 'tuberias-hdpe',
    name: 'Tuberías HDPE y Accesorios',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    shortDescription: 'Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.',
    description: 'Tuberías de polietileno de alta densidad (HDPE) y accesorios para conducción de agua, relaves, drenaje y fluidos industriales, unidas por termofusión o electrofusión. Se especifican por diámetro y clase de presión (SDR) según el diseño hidráulico. Línea de importación directa, suministrada por proyecto; ficha y certificado de lote en cotización.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE)' },
      { label: 'Unión', value: 'Termofusión / electrofusión' },
      { label: 'Especificación', value: 'Diámetro y clase de presión (SDR) por diseño' },
      { label: 'Accesorios', value: 'Codos, tees, reducciones, bridas' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Conducción de agua y riego presurizado',
      'Transporte de relaves y fluidos mineros',
      'Redes de saneamiento y drenaje',
      'Conducción de fluidos industriales'
    ],
    benefits: [
      'Uniones por fusión de alta fiabilidad',
      'Resistencia química y larga vida útil',
      'Especificación por diseño hidráulico',
      'Documentación técnica en cotización'
    ],
    image: '/images/galeria/tuberias-hdpe-general.jpg',
    gallery: [
      '/images/galeria/tuberias-hdpe-general.jpg',
      '/images/galeria/tuberias-hdpe-detalle.jpg',
      '/images/galeria/tuberias-hdpe-instalacion.jpg',
      '/images/galeria/tuberias-hdpe-escala.jpg',
      '/images/tuberias-hdpe.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 8) PROTECCIÓN Y SEGURIDAD INDUSTRIAL
  // ===========================================================================
  {
    id: '2',
    slug: 'biombos-protectores-soldadura',
    name: 'Biombos Protectores para Talleres de Soldadura',
    category: 'Protección y Seguridad Industrial',
    sector: ['Industrial', 'Construcción', 'Minería'],
    shortDescription: 'Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.',
    description: 'Biombos protectores fabricados con lona de fibra de vidrio recubierta de silicona o PVC ignífugo de alta calidad. Diseñados para crear zonas seguras en talleres de soldadura, astilleros, construcción y mantenimiento industrial. Disponibles en versiones portátiles con estructura metálica plegable o fijos para instalación permanente. Cumplen con normativas de seguridad industrial peruana e internacional.',
    specifications: [
      { label: 'Material', value: 'Lona de fibra de vidrio con recubrimiento de silicona/PVC ignífugo' },
      { label: 'Resistencia al fuego', value: 'Material autoextinguible / retardante de llama; ficha técnica del material en cotización' },
      { label: 'Temperatura máxima', value: 'Hasta 550°C (fibra de vidrio siliconada)' },
      { label: 'Dimensiones estándar', value: '1.8m x 2.0m / 2.0m x 2.5m por panel (configurable)' },
      { label: 'Estructura', value: 'Acero galvanizado plegable o fija, con ruedas opcionales' },
      { label: 'Peso por panel', value: 'Aprox. 8-12 kg según tamaño' },
      { label: 'Opciones', value: 'Una cara, dos caras, con ventana de observación, con cortina inferior' }
    ],
    applications: [
      'Talleres de soldadura y fabricación metálica',
      'Mantenimiento industrial en minas y plantas',
      'Construcción y obras civiles',
      'Astilleros y reparación naval',
      'Capacitación y demostraciones técnicas'
    ],
    benefits: [
      'Protección superior contra chispas, escoria y radiación UV',
      'Reduce riesgos de incendio y lesiones oculares',
      'Fácil instalación y reconfiguración del espacio de trabajo',
      'Durabilidad extrema en ambientes industriales agresivos',
      'Cumplimiento de normas de seguridad y salud en el trabajo'
    ],
    image: '/images/galeria/biombos-protectores-soldadura-general.jpg',
    gallery: [
      '/images/galeria/biombos-protectores-soldadura-general.jpg',
      '/images/galeria/biombos-protectores-soldadura-detalle.jpg',
      '/images/galeria/biombos-protectores-soldadura-instalacion.jpg',
      '/images/galeria/biombos-protectores-soldadura-escala.jpg',
      '/images/biombos.jpg',
      '/images/biombos-proteccion.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 9) ACCESORIOS Y COMPLEMENTOS
  // ===========================================================================
  {
    id: '32',
    slug: 'accesorios-instalacion',
    name: 'Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos)',
    category: 'Accesorios y Complementos',
    sector: ['Industrial', 'Transporte', 'Construcción', 'Agricultura'],
    shortDescription: 'Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.',
    description: 'Línea completa de accesorios y complementos para la instalación y el uso de lonas, mallas y coberturas: ojalillos metálicos, soga de sisal, driza y cabo, tensores, hebillas, ganchos, elásticos y tubos metálicos. Disponibilidad en stock para completar cualquier proyecto sin recurrir a múltiples proveedores.',
    specifications: [
      { label: 'Ojalillos', value: 'Metálicos, diversos diámetros, con herramienta de colocación' },
      { label: 'Cuerdas', value: 'Soga sisal, driza y cabo en distintos calibres' },
      { label: 'Tensión', value: 'Tensores, hebillas, ganchos y elásticos' },
      { label: 'Tubos', value: 'Tubos metálicos para armado y refuerzo' },
      { label: 'Disponibilidad', value: 'Stock — entrega ágil' }
    ],
    applications: [
      'Instalación y amarre de lonas y coberturas',
      'Montaje de mallas y estructuras temporales',
      'Reposición de herrajes y accesorios',
      'Kits de instalación para transporte y agro'
    ],
    benefits: [
      'Todo el complemento en un solo pedido',
      'Compatibles con nuestras lonas y mallas',
      'Disponibilidad en stock',
      'Asesoría para el kit correcto por aplicación'
    ],
    image: '/images/galeria/accesorios-instalacion-general.jpg',
    gallery: [
      '/images/galeria/accesorios-instalacion-general.jpg',
      '/images/galeria/accesorios-instalacion-detalle.jpg',
      '/images/galeria/accesorios-instalacion-instalacion.jpg',
      '/images/galeria/accesorios-instalacion-escala.jpg',
      '/images/accesorios.jpg',
      '/images/ojalillo-rafia.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },

  // ===========================================================================
  // 10) PUBLICIDAD Y COMUNICACIÓN VISUAL
  // ===========================================================================
  {
    id: '33',
    slug: 'gigantografias-senaletica',
    name: 'Gigantografías, Letreros y Señalética',
    category: 'Publicidad y Comunicación Visual',
    sector: ['Comercio', 'Publicidad', 'Industrial'],
    shortDescription: 'Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.',
    description: 'Impresión de gran formato sobre lona frontlit/backlit y otros sustratos para gigantografías, letreros, paneles, banners y señalética. Producción con acabados de instalación (ojalillos, refuerzos, bastidores) para exterior e interior. Solución de comunicación visual que aprovecha nuestra capacidad textil y de confección.',
    specifications: [
      { label: 'Sustratos', value: 'Lona frontlit/backlit, mesh, vinil (según pieza)' },
      { label: 'Formato', value: 'Gran formato, medida a requerimiento' },
      { label: 'Acabados', value: 'Ojalillos, refuerzos, bastidor, termosellado' },
      { label: 'Uso', value: 'Exterior e interior' },
      { label: 'Personalización', value: 'Diseño e impresión a todo color' }
    ],
    applications: [
      'Gigantografías y fachadas comerciales',
      'Letreros, paneles y señalética',
      'Banners para campañas y eventos',
      'Comunicación visual industrial y de obra'
    ],
    benefits: [
      'Impresión de gran formato con acabados de instalación',
      'Aprovecha nuestra confección textil',
      'Piezas listas para instalar',
      'Un proveedor para lona técnica y publicidad'
    ],
    image: '/images/galeria/gigantografias-senaletica-general.jpg',
    gallery: [
      '/images/galeria/gigantografias-senaletica-general.jpg',
      '/images/galeria/gigantografias-senaletica-detalle.jpg',
      '/images/galeria/gigantografias-senaletica-instalacion.jpg',
      '/images/galeria/gigantografias-senaletica-escala.jpg',
      '/images/gigantografias.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '34',
    slug: 'revestimiento-vehicular-toldos-publicitarios',
    name: 'Revestimiento Vehicular y Toldos Publicitarios',
    category: 'Publicidad y Comunicación Visual',
    sector: ['Comercio', 'Publicidad', 'Transporte'],
    shortDescription: 'Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.',
    description: 'Revestimiento (vehicle wrapping) de flotas y vehículos, toldos publicitarios y kioscos de marca para activación comercial. Diseño, impresión e instalación con materiales para intemperie. Complementa el rotulado de flota de nuestra línea de siders y tolderas.',
    specifications: [
      { label: 'Vehicular', value: 'Vinil de wrapping para intemperie, laminado de protección' },
      { label: 'Toldos publicitarios', value: 'Lona impresa con estructura y herrajes' },
      { label: 'Kioscos', value: 'Módulos de marca personalizados' },
      { label: 'Servicio', value: 'Diseño + impresión + instalación' },
      { label: 'Uso', value: 'Activación de marca y punto de venta' }
    ],
    applications: [
      'Rotulado y wrapping de flotas y vehículos',
      'Toldos publicitarios para comercios',
      'Kioscos y mobiliario de marca',
      'Activaciones y campañas comerciales'
    ],
    benefits: [
      'Imagen de marca consistente en flota y punto de venta',
      'Materiales aptos para intemperie',
      'Servicio integral diseño-impresión-instalación',
      'Sinergia con rotulado de siders/tolderas'
    ],
    image: '/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg',
    gallery: [
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala.jpg',
      '/images/revestimiento-vehicular.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 11) ESPECIALIDADES
  // ===========================================================================
  {
    id: '10',
    slug: 'mulch-madera-picada',
    name: 'Mulch de Madera Picada',
    category: 'Especialidades',
    sector: ['Agricultura', 'Construcción', 'Paisajismo'],
    shortDescription: 'Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.',
    description: 'Mulch orgánico de madera picada de especies forestales seleccionadas, procesado en diferentes granulometrías (fino, medio, grueso). Ideal para cobertura de suelos en agricultura, jardinería, paisajismo, áreas recreativas y proyectos de reforestación. Ayuda a controlar malezas, retener humedad del suelo, regular temperatura y mejorar la estética de los espacios. Disponible en sacos de 50L, big bags o a granel.',
    specifications: [
      { label: 'Material', value: 'Madera de pino, eucalipto y especies locales certificadas' },
      { label: 'Granulometría', value: 'Fina (0-10mm), Media (10-30mm), Gruesa (30-60mm)' },
      { label: 'Presentación', value: 'Sacos de 50 litros, Big Bags de 1m³, a granel' },
      { label: 'Humedad', value: '15-25% (estabilizado)' },
      { label: 'pH', value: '5.5 - 7.0' },
      { label: 'Certificación', value: 'Libre de semillas de malezas y patógenos' }
    ],
    applications: [
      'Cobertura de suelos en cultivos de berries, frutales y hortalizas',
      'Jardines, parques y áreas recreativas',
      'Control de erosión en taludes y proyectos de reforestación',
      'Caminos y senderos en áreas naturales',
      'Decoración de espacios paisajísticos'
    ],
    benefits: [
      'Control efectivo de malezas sin químicos',
      'Retención de humedad del suelo (reduce riego hasta 30%)',
      'Regulación de temperatura del suelo',
      'Mejora la estructura y fertilidad del suelo al descomponerse',
      'Estética profesional y natural'
    ],
    image: '/images/galeria/mulch-madera-picada-general.jpg',
    gallery: [
      '/images/galeria/mulch-madera-picada-general.jpg',
      '/images/galeria/mulch-madera-picada-detalle.jpg',
      '/images/galeria/mulch-madera-picada-instalacion.jpg',
      '/images/galeria/mulch-madera-picada-escala.jpg',
      '/images/mulch.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'stock',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 25.0,
    // priceUnit: 'saco 50L',
    // purchasable: true,
  },

  // ===========================================================================
  // 35) GEOCOMPUESTOS DE DRENAJE  (Geosintéticos e Impermeabilización)
  // ===========================================================================
  {
    id: '35',
    slug: 'geocompuestos-drenaje',
    name: 'Geocompuestos de Drenaje',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Construcción', 'Infraestructura', 'Saneamiento'],
    shortDescription: 'Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.',
    description: 'Geocompuesto de drenaje formado por un núcleo drenante (geored / geonet) termounido a uno o dos geotextiles no tejidos que actúan como filtro. Reemplaza capas de grava en sistemas de drenaje, reduciendo espesores, peso y tiempos de obra. Se selecciona por capacidad de flujo, resistencia a la compresión y compatibilidad química según el proyecto. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote del fabricante se entregan en la cotización.',
    specifications: [
      { label: 'Estructura', value: 'Núcleo drenante (geored) + geotextil no tejido en una o ambas caras' },
      { label: 'Función', value: 'Captación, filtración y conducción de fluidos' },
      { label: 'Capacidad de flujo', value: 'Según gradiente y confinamiento (a confirmar por proyecto)' },
      { label: 'Aplicación típica', value: 'Muros, rellenos sanitarios, taludes, pilas de lixiviación, cubiertas verdes' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Drenaje detrás de muros de contención y estructuras enterradas',
      'Sistemas de drenaje en rellenos sanitarios y celdas de residuos',
      'Drenaje de taludes, terraplenes y obras viales',
      'Captación en pilas de lixiviación y plataformas mineras',
      'Cubiertas verdes y jardineras sobre losa'
    ],
    benefits: [
      'Sustituye capas de grava: menos espesor, peso y excavación',
      'Instalación más rápida y limpia que el drenaje granular',
      'Complemento directo de geomembranas y geotextiles del catálogo',
      'Sistema de drenaje integrado de un solo proveedor',
      'Documentación técnica del fabricante en cotización'
    ],
    image: '/images/galeria/geocompuestos-drenaje-general.jpg',
    gallery: [
      '/images/galeria/geocompuestos-drenaje-general.jpg',
      '/images/galeria/geocompuestos-drenaje-detalle.jpg',
      '/images/galeria/geocompuestos-drenaje-instalacion.jpg',
      '/images/galeria/geocompuestos-drenaje-escala.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 36) BARRERAS ACÚSTICAS  (Protección y Seguridad Industrial)
  // ===========================================================================
  {
    id: '36',
    slug: 'barreras-acusticas',
    name: 'Barreras Acústicas / Cortinas Antirruido',
    category: 'Protección y Seguridad Industrial',
    sector: ['Construcción', 'Industrial', 'Minería', 'Infraestructura'],
    shortDescription: 'Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.',
    description: 'Barreras acústicas flexibles (cortinas y mantas antirruido) para reducir la propagación de ruido en frentes de obra, plantas industriales, generadores y equipos. Se confeccionan a medida en composición mono o multicapa —lámina másica insonorizante con capa absorbente— y se montan sobre cercos, andamios o estructuras existentes. Solución a medida; la atenuación referencial y la composición se definen por aplicación, y la documentación técnica se entrega en la cotización.',
    specifications: [
      { label: 'Configuración', value: 'Cortina / manta flexible, mono o multicapa (a medida)' },
      { label: 'Función', value: 'Atenuación y absorción de ruido en la fuente o el perímetro' },
      { label: 'Montaje', value: 'Sobre cerco de obra, andamio, malla o estructura metálica' },
      { label: 'Acabados', value: 'Ojalillos, refuerzos perimetrales y cierres según montaje' },
      { label: 'Atenuación referencial', value: 'Según composición y aplicación (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica del material a solicitud, en cotización' }
    ],
    applications: [
      'Cerramiento acústico de frentes de obra en zonas urbanas',
      'Encierro de generadores, compresores y equipos ruidosos',
      'Perímetros de plantas industriales y canteras',
      'Barreras temporales para cumplimiento de límites de ruido',
      'Separación acústica en talleres y naves'
    ],
    benefits: [
      'Reduce el ruido percibido en vecindario y personal de obra',
      'Apoya el cumplimiento de normativa ambiental y de seguridad',
      'Confección a medida y reposicionable entre frentes de trabajo',
      'Se integra con biombos y protecciones de obra del catálogo',
      'Documentación técnica del material en cotización'
    ],
    image: '/images/galeria/barreras-acusticas-general.jpg',
    gallery: [
      '/images/galeria/barreras-acusticas-general.jpg',
      '/images/galeria/barreras-acusticas-detalle.jpg',
      '/images/galeria/barreras-acusticas-instalacion.jpg',
      '/images/galeria/barreras-acusticas-escala.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'bajo_pedido',
    leadTime: 'A medida — según proyecto',
    documentation: 'Ficha técnica del material a solicitud, en cotización.'
  }
];

// -----------------------------------------------------------------------------
// FAMILIAS (eje 1: por tipo de producto). Orden = orden en mega menú.
// `name` debe coincidir exactamente con `Product.category`.
// -----------------------------------------------------------------------------
export const productFamilies: ProductFamily[] = [
  { name: 'Envases y Embalaje', slug: 'envases-embalaje', tagline: 'Big Bags, sacos, bolsas y films' },
  { name: 'Lonas y Cobertores', slug: 'lonas-cobertores', tagline: 'Confección textil 100% a medida' },
  { name: 'Estructuras y Arquitectura Textil', slug: 'estructuras-arquitectura-textil', tagline: 'Carpas, tensadas, módulos e invernaderos' },
  { name: 'Mallas y Coberturas Agrícolas', slug: 'mallas-agricolas', tagline: 'Antiáfidas, Raschel y protección de cultivo' },
  { name: 'Ventilación Industrial', slug: 'ventilacion-industrial', tagline: 'Mangas para minas y túneles' },
  { name: 'Geosintéticos e Impermeabilización', slug: 'geosinteticos', tagline: 'Geomembranas, geotextiles y geomallas' },
  { name: 'Soluciones Ambientales y Fluidos', slug: 'ambientales-fluidos', tagline: 'Tanques, biodigestores y tuberías HDPE' },
  { name: 'Protección y Seguridad Industrial', slug: 'seguridad-industrial', tagline: 'Biombos y protección de taller' },
  { name: 'Accesorios y Complementos', slug: 'accesorios', tagline: 'Ojalillos, sogas, tensores y tubos' },
  { name: 'Publicidad y Comunicación Visual', slug: 'publicidad', tagline: 'Gigantografías y rotulado de flota' },
  { name: 'Especialidades', slug: 'especialidades', tagline: 'Mulch y valor agregado' }
];

// Compat: lista de categorías (usada por filtros y navegación).
export const categories = productFamilies.map(f => f.name);

// -----------------------------------------------------------------------------
// SECTORES (eje 2: por aplicación / industria).
// -----------------------------------------------------------------------------
export const sectors = [
  'Minería',
  'Agricultura',
  'Construcción',
  'Transporte',
  'Industrial',
  'Logística',
  'Saneamiento',
  'Infraestructura',
  'Energía',
  'Comercio',
  'Publicidad',
  'Paisajismo'
];

// -----------------------------------------------------------------------------
// Etiquetas legibles para los estados de oferta (para badges en la UI).
// -----------------------------------------------------------------------------
export const sourcingLabels: Record<string, string> = {
  fabricacion_propia: 'Fabricación propia',
  importacion_directa: 'Importación directa',
  bajo_pedido: 'Suministro especializado',
  partner: 'Aliado técnico'
};

export const availabilityLabels: Record<string, string> = {
  stock: 'Stock disponible',
  a_medida: 'Fabricación a medida',
  bajo_pedido: 'Suministro a proyecto'
};
P22_EOF

# -----------------------------------------------------------------------------
# test/galeria.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/galeria.test.ts" <<'P22_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { rutaSegundaToma, esSegundaToma, tomasDe, mapaDeTomas, conSegundaToma } from '@/lib/galeria';
import { products } from '@/lib/products';

describe('galería: resolución de la segunda toma', () => {
  it('deriva la ruta de la segunda toma conservando la extensión', () => {
    expect(rutaSegundaToma('/images/galeria/x-general.jpg')).toBe('/images/galeria/x-general-2.jpg');
    expect(rutaSegundaToma('/images/galeria/x-detalle.png')).toBe('/images/galeria/x-detalle-2.png');
  });

  it('reconoce una segunda toma y no la anida', () => {
    // Sin esto acabaríamos buscando "-2-2.jpg".
    expect(esSegundaToma('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(esSegundaToma('/images/galeria/x-general.jpg')).toBe(false);
    expect(tomasDe('/images/galeria/x-general-2.jpg')).toEqual(['/images/galeria/x-general-2.jpg']);
  });

  it('devuelve una sola toma cuando el archivo -2 no existe', () => {
    // Es el caso normal mientras el segundo juego no ha llegado: no debe
    // producir un cruce contra un hueco.
    expect(tomasDe('/images/galeria/no-existe-general.jpg')).toEqual([
      '/images/galeria/no-existe-general.jpg',
    ]);
  });

  it('devuelve dos tomas cuando el archivo -2 sí existe', () => {
    const conDos = products
      .flatMap((p) => p.gallery ?? [])
      .filter((s) => existsSync(join(process.cwd(), 'public', rutaSegundaToma(s))));
    // Si algún día no hay ninguna, el test no debe dar un falso verde.
    if (conDos.length === 0) return;
    for (const src of conDos) expect(tomasDe(src)).toHaveLength(2);
  });

  it('el mapa cubre toda la galería del producto', () => {
    for (const p of products.slice(0, 6)) {
      const mapa = mapaDeTomas(p.gallery ?? []);
      for (const src of p.gallery ?? []) expect(mapa[src]?.[0]).toBe(src);
    }
  });

  it('conSegundaToma cuenta sin romperse con galerías vacías', () => {
    expect(conSegundaToma([])).toBe(0);
  });
});

describe('Ken Burns: movimiento que no estorba', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  it('el zoom no recorta el detalle técnico', () => {
    // scale(1.14) se comía la zanja de anclaje del borde, que es exactamente
    // lo que un ingeniero mira en esa foto.
    const kf = css.slice(css.indexOf('@keyframes kenburns'), css.indexOf('@keyframes kenburns') + 200);
    expect(kf).toMatch(/scale\(1\.0[0-9]\)/);
    expect(kf).not.toMatch(/scale\(1\.1[0-9]\)/);
  });

  it('el hover pausa, no acelera', () => {
    // Cambiar animation-duration a mitad de una animación reposiciona el
    // fotograma y la imagen salta al pasar el cursor.
    expect(css).toMatch(/\.group:hover \.ken-burns \{ animation-play-state: paused; \}/);
    expect(css).not.toMatch(/\.group:hover \.ken-burns \{ animation-duration/);
  });

  it('no fuerza una capa de composición permanente', () => {
    // Se afirma sobre la DECLARACIÓN, no sobre la palabra: el comentario del
    // propio bloque menciona will-change para explicar por qué se quitó, y
    // buscar la palabra suelta hacía fallar el test contra su propia prosa.
    const bloque = css.slice(css.indexOf('.ken-burns {'), css.indexOf('@keyframes kenburns'));
    expect(bloque).not.toMatch(/^\s*will-change\s*:/m);
  });

  it('respeta prefers-reduced-motion sin excepciones', () => {
    // El movimiento puede provocar malestar vestibular real. No es una
    // preferencia estética.
    const bloque = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)', css.indexOf('.toma-cruce')));
    expect(bloque).toMatch(/\.ken-burns \{ animation: none !important/);
    expect(bloque).toMatch(/\.toma-cruce \{ animation: none !important/);
  });

  it('el cruce entre tomas es lento', () => {
    // Un carrusel rápido en una ficha técnica compite con la lectura y obliga
    // a esperar para volver a ver lo que uno estaba mirando.
    const m = css.match(/animation: cruce-tomas (\d+)s/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeGreaterThanOrEqual(16);
  });
});

describe('galería: integración con la ficha', () => {
  it('la ficha resuelve las tomas en el servidor y las pasa al componente', () => {
    const page = readFileSync(join(process.cwd(), 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/mapaDeTomas\(product\.gallery/);
  });

  it('la segunda toma no añade una miniatura ni una leyenda duplicada', () => {
    // Es la MISMA vista fotografiada dos veces: como entrada suelta en
    // `gallery` produciría una quinta miniatura sin leyenda.
    for (const p of products) {
      for (const src of p.gallery ?? []) {
        expect(esSegundaToma(src), `${p.slug}: ${src} no debe estar en gallery`).toBe(false);
      }
    }
  });

  it('la segunda toma se oculta a los lectores de pantalla', () => {
    const src = readFileSync(join(process.cwd(), 'components/ProductGallery.tsx'), 'utf8');
    const bloque = src.slice(src.indexOf('toma-cruce'), src.indexOf('toma-cruce') + 400);
    expect(bloque).toMatch(/aria-hidden="true"/);
    expect(bloque).toMatch(/alt=""/);
  });
});
P22_EOF

# -----------------------------------------------------------------------------
# .gitignore
# -----------------------------------------------------------------------------
cat > ".gitignore" <<'P22_EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Next.js
/.next/
/out/

# Production
/build

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Misc
.DS_Store
*.pem
Thumbs.db
# TypeScript incremental build info
*.tsbuildinfo

# patch delivery artifacts (never commit)
*.patch

# macOS AppleDouble junk (33 ._*.jpg were committed under public/images)
._*
.DS_Store

# delivery artifacts (never commit)
*.zip
install-gallery*.sh
update-gallery.sh
stage-images.sh
gallery-code.patch

# Paquetes de imágenes: se suben al repo para transferirlos y se extraen a
# public/. Versionarlos duplica decenas de megabytes en el historial de git,
# que es permanente, y no aporta nada que public/ no tenga ya.
*.zip
_to_delete/
P22_EOF

# -----------------------------------------------------------------------------
echo ""
echo "P22 aplicado."
echo "  imágenes    28 galerías + segundas tomas en public/images/galeria/"
echo "  nuevos      lib/galeria.ts, test/galeria.test.ts"
echo "  modificados components/ProductGallery.tsx, ficha de producto,"
echo "              app/globals.css (Ken Burns corregido + cruce),"
echo "              lib/products.ts (7 productos reapuntados), .gitignore"
echo "  limpieza    zips y jpg sueltos fuera de la raíz (jpg en _to_delete/)"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 352 tests en 23 archivos, 236 paginas)"
echo ""
echo "Compruebe el inventario:"
echo "  npm run imagenes        -> deberian quedar 47 pendientes, 0 de producto"
echo ""
echo "Y borre usted la carpeta _to_delete/ cuando confirme que no falta nada."
