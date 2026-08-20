import { buildStamp } from '@/lib/version';

/**
 * /version.json — qué commit está sirviendo este despliegue.
 *
 * Existe por un fallo de proceso que se repitió tres rondas seguidas: se hace
 * push, se corren los curls de verificación y la respuesta viene del
 * despliegue ANTERIOR, porque Vercel todavía estaba construyendo. El
 * resultado es un 404 que parece un defecto del código y no lo es — y peor,
 * enseña a desconfiar de la verificación.
 *
 * Con este endpoint la verificación deja de ser una cuestión de esperar lo
 * suficiente: se pregunta al sitio qué commit está sirviendo y se compara con
 * el que se acaba de subir. Es la diferencia entre "creo que ya desplegó" y
 * saberlo.
 *
 * No se indexa: es un endpoint de operación, no contenido.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(`${JSON.stringify(buildStamp(), null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Sin caché: si esta respuesta se sirve desde caché deja de responder
      // la única pregunta que se le hace.
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex',
    },
  });
}
