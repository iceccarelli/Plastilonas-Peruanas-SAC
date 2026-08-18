/**
 * Utilidades de IndexNow compartidas por la ruta de prueba de propiedad
 * (app/indexnow-key.txt/route.ts) y por los tests.
 *
 * Viven aquí y no en la propia ruta porque un route handler de Next solo puede
 * exportar los símbolos que el framework reconoce (GET, POST, dynamic…);
 * cualquier export adicional rompe el contrato de tipos del build.
 */

/**
 * La especificación de IndexNow admite claves de 8 a 128 caracteres, formadas
 * por letras, números y guiones. El patrón está anclado a propósito: una clave
 * válida incrustada en basura no es una clave válida.
 */
export const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

export function isValidIndexNowKey(key: string | undefined): key is string {
  return typeof key === 'string' && INDEXNOW_KEY_PATTERN.test(key);
}

/**
 * Ruta pública donde el sitio publica la clave. Se declara con `keyLocation`
 * en cada envío: al vivir en la raíz, la clave valida todas las URLs del sitio.
 */
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt';
