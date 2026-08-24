import { SITE } from '@/lib/site';
import { products } from '@/lib/products';
import { productoMarkdown } from '@/lib/markdown-espejo';

/**
 * /productos/[slug]/contenido.md — espejo en texto plano de la ficha.
 *
 * Existe para que un agente lea la ficha sin descargar la aplicación entera:
 * mismo contenido, cero marcado. NUNCA compite en búsqueda —`noindex` explícito
 * y `Link: rel="canonical"` hacia el HTML—, porque si el buscador eligiera el
 * .md el usuario aterrizaría en un archivo de texto en lugar de en la página
 * que cotiza.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return new Response('No encontrado', { status: 404 });

  return new Response(productoMarkdown(product), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex, follow',
      Link: `<${SITE.url}/productos/${product.slug}>; rel="canonical"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
