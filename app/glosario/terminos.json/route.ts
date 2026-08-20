import { buildGlosarioJson } from '@/lib/glosario-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildGlosarioJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // Se permite explícitamente: este archivo existe para ser leído por
      // agentes y rastreadores.
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
