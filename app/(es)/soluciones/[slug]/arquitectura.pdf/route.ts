import { solutions } from '@/lib/solutions';
import { buildArquitecturaPdf } from '@/lib/doc-arquitectura';
import { SITE } from '@/lib/site';

/**
 * Arquitectura de referencia en PDF: /soluciones/{slug}/arquitectura.pdf
 *
 * Es el documento que se adjunta a un requerimiento de compra interno: lista
 * de materiales completa, criterio que gobierna cada componente y secuencia de
 * ejecución.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const solution = solutions.find((s) => s.slug === slug);
  if (!solution) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildArquitecturaPdf(solution, generatedAt);
  const url = `${SITE.url}/soluciones/${solution.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="arquitectura-${solution.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
