import { buildJsonFeed } from '@/lib/novedades-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildJsonFeed(), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'all',
    },
  });
}
