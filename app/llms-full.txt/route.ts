import { SITE } from '@/lib/site';
import { corpusCompleto } from '@/lib/markdown-espejo';

/**
 * /llms-full.txt — el sitio entero en un archivo, para agentes.
 *
 * llms.txt dice QUÉ hay y dónde. Esto es el texto completo, para el agente que
 * prefiere una descarga a cuarenta. Va con `noindex` deliberado: es el mismo
 * contenido que las páginas HTML, y dos copias del mismo texto compitiendo en
 * el índice se restan. La cabecera `Link: rel="canonical"` manda a llms.txt,
 * que es el índice del que éste es la expansión.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(corpusCompleto(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
      // Rastreable y legible, pero NO indexable: el original es el HTML.
      'X-Robots-Tag': 'noindex, follow',
      Link: `<${SITE.url}/llms.txt>; rel="canonical"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
