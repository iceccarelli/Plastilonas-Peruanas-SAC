import type { MetadataRoute } from 'next';

const BASE = 'https://www.plastilonas.com';

/**
 * robots.txt: permite el rastreo público del catálogo y bloquea rutas privadas
 * (dashboard, login, api). Declara el sitemap para acelerar la indexación.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/login', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
