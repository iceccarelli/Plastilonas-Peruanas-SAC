import { products } from '@/lib/products';
import { buildDatasheetPdf } from '@/lib/datasheet';
import { SITE } from '@/lib/site';

/**
 * Ficha técnica en PDF por producto: /productos/{slug}/ficha-tecnica.pdf
 *
 * Se prerenderiza en el build (force-static + generateStaticParams), de modo
 * que en producción se sirve como archivo estático pero SIEMPRE refleja el
 * catálogo del último despliegue: no hay PDFs subidos a mano que se
 * desincronicen de lib/products.ts.
 *
 * Cabecera `Link: rel="canonical"`: Google indexa PDFs y un documento con las
 * mismas especificaciones podría competir con la ficha HTML del producto. El
 * canonical declara que la página del producto es la versión principal.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return new Response('Not found', { status: 404 });
  }

  // Fecha del despliegue: el documento declara cuándo se generó, sin fingir una
  // revisión editorial que no existe.
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildDatasheetPdf(product, generatedAt);
  const productUrl = `${SITE.url}/productos/${product.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ficha-tecnica-${product.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${productUrl}>; rel="canonical"`,
    },
  });
}
