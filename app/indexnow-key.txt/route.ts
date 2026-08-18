import { isValidIndexNowKey } from '@/lib/indexnow';

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
 * Sin INDEXNOW_KEY configurada responde 404: preferimos una ausencia honesta a
 * publicar una clave de relleno que haría fallar la verificación con un 403.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const key = process.env.INDEXNOW_KEY;

  if (!isValidIndexNowKey(key)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
