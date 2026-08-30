import { informes } from '@/lib/informes';
import { buildInformePdf } from '@/lib/doc-informe';
import { SITE } from '@/lib/site';

/**
 * Informe del sector en PDF: /informes/{slug}/informe.pdf
 *
 * El formato en que un informe llega a un comité: adjunto, no enlace.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return informes.map((i) => ({ slug: i.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const informe = informes.find((i) => i.slug === slug);
  if (!informe) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildInformePdf(informe, generatedAt);
  const url = `${SITE.url}/informes/${informe.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="informe-${informe.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
