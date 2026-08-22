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

/**
 * LA CLAVE VIVE EN EL REPOSITORIO, A PROPÓSITO. NO ES UN DESCUIDO.
 *
 * Antes salía de `process.env.INDEXNOW_KEY`, y sin esa variable el archivo de
 * prueba respondía 404 y el flujo de GitHub no llegaba a ejecutarse. El
 * resultado real, medido: el sitio llevaba semanas publicando 163 URLs,
 * ocho tipos de PDF y tres volcados JSON, y NINGÚN buscador se estaba
 * enterando de nada. La verificación decía «todo correcto» porque todo estaba
 * correcto — salvo que el canal de distribución estaba apagado esperando a que
 * un humano entrara a dos consolas.
 *
 * POR QUÉ NO ES UN SECRETO. El mecanismo de IndexNow consiste, literalmente,
 * en PUBLICAR la clave en una URL del propio dominio: así es como se demuestra
 * el control del sitio. Cualquiera puede leerla en
 * https://…/indexnow-key.txt. Guardarla en un gestor de secretos protegía
 * algo que el propio protocolo obliga a difundir.
 *
 * QUÉ PODRÍA HACER UN TERCERO CON ELLA. Enviar a los buscadores URLs de ESTE
 * dominio — que es exactamente lo que queremos que ocurra. No puede usarla
 * para otro host: IndexNow valida que `host`, `keyLocation` y las URLs del
 * envío pertenezcan al mismo dominio. El peor caso es que alguien nos haga el
 * favor de pedir que nos rastreen.
 *
 * TAMPOCO HAY VARIABLE DE ENTORNO QUE LA SOBRESCRIBA, y eso también es
 * deliberado. Con dos orígenes posibles, el día que la clave se configure en
 * Vercel pero no en GitHub Actions, el archivo publicaría una y el envío usaría
 * otra: 403 silencioso y ninguna señal de que algo va mal. Una sola fuente de
 * verdad elimina esa clase entera de fallo. Rotarla es cambiar esta línea.
 */
export const INDEXNOW_KEY = 'a4e07c5b9d2f4813ae6b0c37f5192d8e';

/** La clave efectiva del sitio. Existe para que nadie lea la constante suelta. */
export function claveIndexNow(): string {
  return INDEXNOW_KEY;
}
