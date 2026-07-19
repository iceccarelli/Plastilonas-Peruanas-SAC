import type { Product } from '@/lib/types';

const BASE = 'https://www.plastilonas.com';

/**
 * JSON-LD por producto: Product + BreadcrumbList.
 *
 * Regla de honestidad: solo datos REALES del catálogo. NO se declaran precios,
 * reseñas ni calificaciones (el negocio es por cotización) — inventarlos rompería
 * el rich result de Google y sería fabricación. Las especificaciones técnicas sí
 * son reales y se exponen como additionalProperty para enriquecer el entendimiento.
 */
export default function ProductStructuredData({ product }: { product: Product }) {
  const url = `${BASE}/productos/${product.slug}`;

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: `${BASE}${product.image}`,
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
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Productos', item: `${BASE}/productos` },
      { '@type': 'ListItem', position: 3, name: product.name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
