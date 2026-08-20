import { buildCatalogoJson } from '@/lib/catalogo-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildCatalogoJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // Existe para ser leído por agentes e integraciones: se permite y se
      // habilita el acceso desde otros orígenes.
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
