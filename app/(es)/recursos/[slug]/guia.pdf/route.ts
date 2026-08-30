import { articles } from '@/lib/articles';
import { buildGuiaPdf } from '@/lib/doc-guia';
import { SITE } from '@/lib/site';

/**
 * Guía técnica en PDF: /recursos/{slug}/guia.pdf
 *
 * Prerenderizada en el build desde lib/articles.ts: corregir una guía corrige
 * también su PDF en el siguiente despliegue, sin documentos subidos a mano que
 * se desincronicen.
 *
 * Cabecera Link rel="canonical": Google indexa PDFs y este documento repite el
 * contenido del artículo. El canonical declara que la versión HTML es la
 * principal, de modo que el PDF suma descargas sin competir consigo mismo.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildGuiaPdf(article, generatedAt);
  const url = `${SITE.url}/recursos/${article.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="guia-${article.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
