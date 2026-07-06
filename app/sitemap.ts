import type { MetadataRoute } from 'next';
import { products } from '@/lib/products';

const BASE = 'https://www.plastilonas.com';

/**
 * Sitemap generado desde las rutas reales y el catálogo. Antes inexistente:
 * los buscadores no tenían un mapa explícito de las páginas de producto, que
 * son justamente las que capturan búsquedas de alta intención ("big bags lima",
 * "geomembranas pvc perú").
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/productos`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contacto`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/cotizacion`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/productos/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
