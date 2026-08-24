import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

/**
 * PRESUPUESTO DE PESO DE LAS IMÁGENES.
 *
 * El repositorio llegó a tener 128 MB de imágenes, de los cuales 70 eran PNG:
 * 126 archivos con una media de 560 KB y picos de 1,9 MB. Ninguno era una
 * fotografía que necesitara PNG — son ilustraciones y esquemas generados, que
 * en WebP pesan la décima parte sin diferencia visible: 548 KB pasaron a 53 KB.
 *
 * Por qué importa más allá del disco. El optimizador de Next lee el archivo
 * ORIGEN para cada transformación; un origen de 1,9 MB tarda y consume memoria
 * en cada ancho que se pida, en cada despliegue que invalide la caché. Y 48 de
 * aquellos PNG ni siquiera se usaban: eran los originales que quedaron detrás
 * de una conversión anterior, 20 MB que nadie referenciaba y que igualmente se
 * clonaban, se subían y se desplegaban.
 *
 * Esta prueba mide el disco, no el HTML. Es la única que se entera de un
 * archivo pesado ANTES de que llegue a un navegador, y de un archivo huérfano
 * que no aparecería en ninguna otra comprobación porque, precisamente, no lo
 * cita nadie.
 */

const RAIZ = join(process.cwd(), 'public');

/** Techo por archivo. Generoso: una foto de catálogo bien comprimida no pasa de 300 KB. */
const MAXIMO_KB = 700;

/** Formatos que no deberían aparecer para contenido nuevo. */
const DESACONSEJADOS = new Set(['.png', '.bmp', '.tiff']);

/** Excepciones con motivo escrito. */
const PERMITIDOS_PNG = new Set(['logo.png', 'icon.png', 'apple-icon.png']);

function archivos(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) archivos(p, out);
    else out.push(p);
  }
  return out;
}

const imagenes = archivos(RAIZ).filter((f) =>
  ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp', '.tiff'].includes(extname(f).toLowerCase()),
);

describe('peso de las imágenes en disco', () => {
  it('ninguna imagen supera el presupuesto por archivo', () => {
    const pesadas = imagenes
      .map((f) => ({ f: f.replace(RAIZ, ''), kb: Math.round(statSync(f).size / 1024) }))
      .filter((x) => x.kb > MAXIMO_KB)
      .sort((a, b) => b.kb - a.kb);
    expect(
      pesadas.map((x) => `${x.kb}KB ${x.f}`),
      `comprima o convierta a WebP: el máximo son ${MAXIMO_KB} KB`,
    ).toEqual([]);
  });

  it('no se usan formatos desaconsejados para contenido', () => {
    const malos = imagenes
      .filter((f) => DESACONSEJADOS.has(extname(f).toLowerCase()))
      .filter((f) => !PERMITIDOS_PNG.has(f.split('/').pop() ?? ''))
      .map((f) => f.replace(RAIZ, ''));
    expect(malos, 'use WebP: pesa una décima parte con la misma calidad visible').toEqual([]);
  });

  it('el total de imágenes se mantiene bajo control', () => {
    const mb = imagenes.reduce((t, f) => t + statSync(f).size, 0) / 1048576;
    // 90 MB deja sitio de sobra para crecer; a 128 MB el repositorio ya
    // molestaba en cada clon y en cada build.
    expect(Math.round(mb), `el repositorio sirve ${Math.round(mb)} MB de imágenes`).toBeLessThan(90);
  });
});
