import { buildGlosarioPdf } from '@/lib/doc-glosario';
import { SITE } from '@/lib/site';

/**
 * Glosario completo en PDF: /glosario/glosario.pdf
 *
 * Un solo documento con los términos del rubro. Se consulta entero: se
 * imprime, se deja en la oficina técnica y se reparte al equipo nuevo.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildGlosarioPdf(generatedAt);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="glosario-tecnico-plastilonas.pdf"',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${SITE.url}/glosario>; rel="canonical"`,
    },
  });
}
