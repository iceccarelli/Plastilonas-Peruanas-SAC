import { buildMarcoPdf } from '@/lib/doc-marco';
import { SITE } from '@/lib/site';

/**
 * Marco de Especificación en PDF: /marco/marco.pdf
 *
 * El documento que se adjunta a un requerimiento y se usa para evaluar tres
 * propuestas a la vez. Publicar el estándar solo cambia la posición de quien lo
 * publica si el estándar circula, y los estándares circulan en PDF.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildMarcoPdf(generatedAt);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="marco-de-especificacion-plastilonas.pdf"',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${SITE.url}/marco>; rel="canonical"`,
    },
  });
}
