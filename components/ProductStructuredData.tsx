import type { Product } from '@/lib/types';
import { SITE } from '@/lib/site';

// Origen canónico único: nunca hard-codear el dominio (ver lib/site.ts).
const BASE = SITE.url;

/**
 * JSON-LD por producto: nodo Product.
 *
 * Regla de honestidad: solo datos REALES del catálogo. NO se declaran precios,
 * reseñas ni calificaciones (el negocio es por cotización) — inventarlos rompería
 * el rich result de Google y sería fabricación. Las especificaciones técnicas sí
 * son reales y se exponen como additionalProperty para enriquecer el entendimiento.
 *
 * La Offer se emite SIN precio: dice dónde se cotiza (`url` → /cotizacion) y en
 * qué moneda se cotizaría, y declara `availability` solo cuando el estado del
 * catálogo lo respalda (stock). Un precio inventado o un InStock genérico en
 * líneas a medida sería exactamente la fabricación que este sitio no hace.
 *
 * El BreadcrumbList vive en app/(es)/productos/[slug]/page.tsx (4 niveles, con
 * la familia). Aquí se emitía OTRO de 3 niveles: dos migas de pan distintas en
 * la misma página compiten y Google descarta ambas.
 */
export default function ProductStructuredData({ product }: { product: Product }) {
  const url = `${BASE}/productos/${product.slug}`;

  // Imagen enriquecida: Google admite un arreglo de imágenes en Product y lo usa
  // para carruseles en resultados enriquecidos. Exponemos toda la galería real
  // (hero + detalle + instalación + escala + fotos heredadas), deduplicada y en
  // URL absoluta. Solo rutas reales del catálogo — sin fabricación.
  const galleryImages = Array.from(
    new Set([product.image, ...(product.gallery ?? [])].filter(Boolean)),
  ).map((src) => `${BASE}${src}`);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.shortDescription,
    image: galleryImages.length ? galleryImages : `${BASE}${product.image}`,
    category: product.category,
    sku: product.id,
    url,
    brand: { '@type': 'Brand', name: 'Plastilonas Peruanas SAC' },
    manufacturer: {
      '@type': 'Organization',
      name: 'Plastilonas Peruanas SAC',
      '@id': `${BASE}/#business`,
    },
    ...(product.specifications?.length
      ? {
          additionalProperty: product.specifications.map((s) => ({
            '@type': 'PropertyValue',
            name: s.label,
            value: s.value,
          })),
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: `${BASE}/cotizacion?producto=${encodeURIComponent(product.slug)}`,
      priceCurrency: 'PEN',
      // Sin `price`: negocio B2B por cotización, sin lista pública en líneas
      // a medida. `availability` solo cuando el catálogo declara stock real.
      ...(product.availability === 'stock'
        ? { availability: 'https://schema.org/InStock' }
        : {}),
      description:
        'Sin lista de precios en líneas a medida: se cotiza con producto, medidas o cantidad, ciudad de entrega y plazo.',
      seller: { '@id': `${BASE}/#business` },
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
  );
}
