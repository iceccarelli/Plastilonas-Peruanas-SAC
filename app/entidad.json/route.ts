import { buildEntidadJson } from '@/lib/entidad-feed';

export const dynamic = 'force-static';

/**
 * /entidad.json — la tarjeta de identidad legible por máquina.
 *
 * Sustituye al antiguo archivo estático de public/, que declaraba otro dominio
 * y cinco países de cobertura. La razón de que ahora sea una ruta y no un
 * archivo es que una ruta puede derivar de lib/site.ts; un archivo en public/
 * sólo puede copiarlo, y una copia se queda atrás sin avisar.
 */
export async function GET(): Promise<Response> {
  return new Response(buildEntidadJson(), {
    headers: {
      'Content-Type': 'application/ld+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
