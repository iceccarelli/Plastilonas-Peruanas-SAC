import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * RESOLUCIÓN DE VARIANTES DE GALERÍA.
 *
 * El catálogo declara cuatro vistas por producto —general, detalle,
 * instalación y escala— y cada una puede tener una SEGUNDA toma que se
 * alterna con la primera:
 *
 *   /images/galeria/geomembranas-pvc-general.jpg      primera toma
 *   /images/galeria/geomembranas-pvc-general-2.jpg    segunda toma (opcional)
 *
 * Por qué el sufijo `-2` y no una entrada más en `gallery`. Las miniaturas se
 * derivan de `gallery`, y su leyenda sale del sufijo de vista: añadir la
 * segunda toma como entrada suelta produciría una quinta miniatura sin
 * leyenda, duplicando visualmente la misma vista. La segunda toma no es otra
 * vista: es la MISMA vista fotografiada dos veces, y por eso vive dentro de su
 * ranura en lugar de al lado.
 *
 * La comprobación es de sistema de archivos y ocurre en el servidor, una vez
 * por compilación. Así una segunda toma que todavía no llegó no produce una
 * imagen rota ni un cruce contra un hueco: simplemente no hay cruce.
 */

/** Ruta de la segunda toma de una imagen de galería. */
export function rutaSegundaToma(src: string): string {
  return src.replace(/\.(jpg|jpeg|png|webp)$/i, '-2.$1');
}

/** ¿La ruta es ya una segunda toma? Sirve para no anidarlas. */
export const esSegundaToma = (src: string): boolean => /-2\.(jpg|jpeg|png|webp)$/i.test(src);

const existePublico = (ruta: string): boolean => {
  try {
    return existsSync(join(process.cwd(), 'public', ruta));
  } catch {
    return false;
  }
};

/**
 * Tomas disponibles para una imagen: una o dos.
 * Devuelve siempre al menos la original, exista o no el archivo: quien
 * renderiza ya sabe degradar, y aquí no se decide eso.
 */
export function tomasDe(src: string): string[] {
  if (!src || esSegundaToma(src)) return [src];
  const segunda = rutaSegundaToma(src);
  return existePublico(segunda) ? [src, segunda] : [src];
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

/** Cuántas imágenes de galería tienen segunda toma. Para el inventario. */
export function conSegundaToma(gallery: string[]): number {
  return gallery.filter((s) => tomasDe(s).length > 1).length;
}
