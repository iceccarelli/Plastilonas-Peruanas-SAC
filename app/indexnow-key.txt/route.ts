import { INDEXNOW_KEY, isValidIndexNowKey } from '@/lib/indexnow';

/**
 * Prueba de propiedad para IndexNow.
 *
 * IndexNow exige que el sitio publique un archivo de texto con la clave para
 * demostrar control del dominio. La especificación admite dos ubicaciones: la
 * raíz como `{clave}.txt`, o una ruta propia declarada con `keyLocation` en el
 * envío. Usamos la segunda porque la primera exigiría una ruta dinámica en la
 * raíz de la app, que capturaría cualquier URL de primer nivel.
 *
 * Sobre el alcance: la carpeta donde vive el archivo determina qué URLs valida.
 * Al servirlo en la raíz (`/indexnow-key.txt`) la clave cubre todo el sitio; en
 * un subdirectorio solo validaría ese subárbol.
 *
 * ANTES ESTO RESPONDÍA 404. La clave salía de una variable de entorno que
 * nadie había configurado, así que la prueba de propiedad no existía, el envío
 * habría obtenido 403 y el flujo de GitHub ni siquiera arrancaba. El sitio
 * entero era invisible para Bing, Yandex, Seznam, Naver y Yep —y, por la vía
 * de Bing, para la búsqueda de ChatGPT— por una variable sin poner.
 *
 * Ahora la clave vive en lib/indexnow.ts, que es donde debe estar: el
 * protocolo obliga a publicarla igualmente en esta misma URL. Ver la nota
 * larga en ese archivo.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  // Una clave mal formada haría fallar la verificación con 403 sin decir por
  // qué. Se comprueba aquí y hay un test que lo comprueba al compilar.
  if (!isValidIndexNowKey(INDEXNOW_KEY)) {
    return new Response('Clave IndexNow con formato invalido', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
