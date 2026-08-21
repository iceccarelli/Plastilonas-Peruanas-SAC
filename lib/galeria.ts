import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

/**
 * RESOLUCIÓN DE TOMAS (VARIANTES) DE UNA MISMA IMAGEN.
 *
 * El catálogo declara cuatro vistas por producto —general, detalle,
 * instalación y escala— y el glosario declara un diagrama por término. Cada
 * una de esas ranuras puede tener VARIAS TOMAS que se alternan entre sí:
 *
 *   /images/galeria/geomembranas-pvc-general.jpg      toma 1
 *   /images/galeria/geomembranas-pvc-general-2.jpg    toma 2 (opcional)
 *   /images/galeria/geomembranas-pvc-general-3.jpg    toma 3 (opcional)
 *
 * Por qué el sufijo numérico y no una entrada más en `gallery`. Las
 * miniaturas se derivan de `gallery`, y su leyenda sale del sufijo de vista:
 * añadir la toma 2 como entrada suelta produciría una miniatura extra sin
 * leyenda, duplicando visualmente la misma vista. Una toma adicional no es
 * otra vista: es la MISMA vista capturada otra vez, y por eso vive dentro de
 * su ranura en lugar de al lado.
 *
 * TRES REGLAS QUE NO SON NEGOCIABLES
 *
 * 1. Se corta en el primer hueco. Si existen -2 y -4 pero no -3, se usan la 1
 *    y la 2. Una secuencia con agujeros es casi siempre un archivo mal
 *    nombrado, y adivinar produce rotaciones distintas en cada despliegue.
 *
 * 2. Se descartan las tomas IDÉNTICAS byte a byte. Es el caso real de este
 *    proyecto: los juegos de diagramas del glosario llegaron por triplicado
 *    con el mismo contenido. Fundir una imagen contra una copia exacta de sí
 *    misma no produce ningún cruce —produce diez segundos en los que la
 *    página parece congelada— y además descarga el archivo dos veces. Una
 *    copia no es una toma.
 *
 * 3. Tope de MAX_TOMAS. Cada toma es una descarga completa antes de que el
 *    visitante haya decidido si le interesa el producto. Cuatro ya es un
 *    ciclo de 40 s: nadie va a esperarlo entero.
 *
 * Todo esto ocurre en el SERVIDOR, una vez por compilación, y con caché en
 * memoria: una toma que todavía no llegó no produce una imagen rota ni un
 * cruce contra un hueco, simplemente no hay cruce.
 */

/** Máximo de tomas que se rotan por ranura. Ver regla 3 arriba. */
export const MAX_TOMAS = 4;

const EXT = /\.(jpg|jpeg|png|webp|avif)$/i;

/** Ruta de la toma n (n ≥ 2) de una imagen. La toma 1 es la ruta base. */
export function rutaToma(src: string, n: number): string {
  if (n <= 1) return src;
  return src.replace(EXT, `-${n}.$1`);
}

/** Compatibilidad: la toma 2 es el caso que ya existía por nombre propio. */
export function rutaSegundaToma(src: string): string {
  return rutaToma(src, 2);
}

/** ¿La ruta es ya una toma adicional? Sirve para no anidarlas (`-2-2.jpg`). */
export const esTomaAdicional = (src: string): boolean => /-[2-9]\.(jpg|jpeg|png|webp|avif)$/i.test(src);

/** Compatibilidad con el nombre anterior. */
export const esSegundaToma = esTomaAdicional;

const rutaAbsoluta = (ruta: string): string => join(process.cwd(), 'public', ruta);

const existePublico = (ruta: string): boolean => {
  try {
    return existsSync(rutaAbsoluta(ruta));
  } catch {
    return false;
  }
};

/**
 * Huella del contenido, cacheada. Se lee el archivo entero: son ficheros de
 * cientos de kilobytes y esto ocurre una vez por compilación, no por visita.
 * Un hash parcial (tamaño, primeros bytes) daría falsos negativos justamente
 * con imágenes generadas por el mismo modelo, que comparten cabecera.
 */
const huellas = new Map<string, string | null>();
function huellaPublica(ruta: string): string | null {
  if (huellas.has(ruta)) return huellas.get(ruta)!;
  let h: string | null = null;
  try {
    h = createHash('sha256').update(readFileSync(rutaAbsoluta(ruta))).digest('hex');
  } catch {
    h = null;
  }
  huellas.set(ruta, h);
  return h;
}

const cacheTomas = new Map<string, string[]>();

/**
 * Tomas realmente distintas de una ranura, en orden, de 1 a MAX_TOMAS.
 * Devuelve siempre al menos la ruta original, exista o no el archivo: quien
 * renderiza ya sabe degradar, y esa decisión no se toma acá.
 */
export function tomasDe(src: string): string[] {
  if (!src || esTomaAdicional(src)) return [src];
  const cacheado = cacheTomas.get(src);
  if (cacheado) return cacheado;

  const tomas = [src];
  const vistas = new Set<string>();
  const primera = huellaPublica(src);
  if (primera) vistas.add(primera);

  for (let n = 2; n <= MAX_TOMAS; n++) {
    const candidata = rutaToma(src, n);
    if (!existePublico(candidata)) break; // regla 1: se corta en el primer hueco
    const h = huellaPublica(candidata);
    if (h && vistas.has(h)) continue; // regla 2: una copia exacta no es una toma
    if (h) vistas.add(h);
    tomas.push(candidata);
  }

  cacheTomas.set(src, tomas);
  return tomas;
}

/**
 * Mapa completo de una galería. Se calcula en el servidor y se pasa al
 * componente de cliente: un componente de cliente no puede mirar el disco.
 */
export function mapaDeTomas(gallery: string[]): Record<string, string[]> {
  const mapa: Record<string, string[]> = {};
  for (const src of gallery) mapa[src] = tomasDe(src);
  return mapa;
}

/** Cuántas ranuras de la galería rotan más de una toma. Para el inventario. */
export function conVariasTomas(gallery: string[]): number {
  return gallery.filter((s) => tomasDe(s).length > 1).length;
}

/** Compatibilidad con el nombre anterior. */
export const conSegundaToma = conVariasTomas;

/**
 * Cuántos archivos `-n` existen pero se descartaron por ser copias exactas.
 * No es cosmético: es la diferencia entre «faltan tomas» y «llegaron
 * duplicadas», y sin este número el informe de imágenes miente por omisión.
 */
export function tomasDuplicadas(gallery: string[]): number {
  let n = 0;
  for (const src of gallery) {
    if (!src || esTomaAdicional(src)) continue;
    let enDisco = 0;
    for (let i = 2; i <= MAX_TOMAS; i++) {
      if (!existePublico(rutaToma(src, i))) break;
      enDisco++;
    }
    n += enDisco - (tomasDe(src).length - 1);
  }
  return n;
}

/**
 * Clase CSS del ciclo de cruce para un conjunto de N tomas. Devuelve null
 * cuando no hay nada que cruzar. El ciclo se define en `globals.css` y la
 * duración total crece con N para que cada toma se vea el mismo tiempo.
 */
export function claseCiclo(total: number): string | null {
  if (total < 2) return null;
  return `tomas-${Math.min(total, MAX_TOMAS)}`;
}
