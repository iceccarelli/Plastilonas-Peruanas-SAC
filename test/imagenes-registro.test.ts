import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ranurasFamilia,
  ranurasSolucion,
  ranurasGuia,
  todasLasRanuras,
} from '../lib/imagenes';
import { products } from '../lib/products';

const publico = (r: string) => join(process.cwd(), 'public', r);
const hay = (r: string) => existsSync(publico(r));

/**
 * Estas pruebas nacen de un fallo concreto y visible: once portadas de
 * familia, diez de guía y seis de solución mostraban un rectángulo gris con
 * el texto «Imagen pendiente de publicación» — con la ruta del archivo que
 * falta impresa encima. Era el comportamiento diseñado, y como degradación es
 * honesto, pero un comprador industrial que llega a /productos/familia/... y
 * ve un hueco con una ruta de archivo saca conclusiones sobre la empresa que
 * ningún texto de la página desmiente.
 *
 * El arreglo no fue inventar imágenes: fue descubrir que cada familia,
 * solución y guía YA tenía fotografías reales de sus propios productos en el
 * repositorio, y derivar el respaldo de ahí.
 */
describe('registro de imágenes: toda ranura de portada se resuelve', () => {
  const grupos = [
    ['familia', ranurasFamilia()],
    ['solución', ranurasSolucion()],
    ['guía', ranurasGuia()],
  ] as const;

  for (const [nombre, ranuras] of grupos) {
    it(`ninguna ranura de ${nombre} queda en marcador`, () => {
      const enMarcador = ranuras.filter(
        (r) => !hay(r.ruta) && !(r.respaldo && hay(r.respaldo.ruta)),
      );
      expect(
        enMarcador.map((r) => r.ruta),
        `sin archivo ni respaldo: se verían como un rectángulo gris`,
      ).toEqual([]);
      expect(ranuras.length).toBeGreaterThan(0);
    });
  }

  it('todo respaldo apunta a un archivo real y con peso', () => {
    const malos: string[] = [];
    for (const r of todasLasRanuras()) {
      if (!r.respaldo) continue;
      if (!hay(r.respaldo.ruta)) { malos.push(`${r.id} → ${r.respaldo.ruta} no existe`); continue; }
      if (statSync(publico(r.respaldo.ruta)).size < 512) {
        malos.push(`${r.id} → ${r.respaldo.ruta} pesa menos de 512B`);
      }
    }
    expect(malos).toEqual([]);
  });

  it('todo respaldo procede del catálogo, no de una ruta escrita a mano', () => {
    // Si alguien codifica una ruta suelta como respaldo, el día que cambie la
    // foto del producto el respaldo se queda apuntando a la anterior. Debe
    // derivarse siempre de products.
    const delCatalogo = new Set(products.map((p) => p.image).filter(Boolean));
    const ajenos = todasLasRanuras()
      .filter((r) => r.respaldo && !delCatalogo.has(r.respaldo.ruta))
      .map((r) => `${r.id} → ${r.respaldo!.ruta}`);
    expect(ajenos).toEqual([]);
  });

  it('el respaldo nombra el producto que se ve, para poder declararlo al pie', () => {
    for (const r of todasLasRanuras()) {
      if (!r.respaldo) continue;
      expect(r.respaldo.nombre.trim().length, `${r.id} sin nombre de producto`).toBeGreaterThan(0);
      expect(r.respaldo.alt.trim().length, `${r.id} sin alt`).toBeGreaterThan(0);
    }
  });
});

describe('fotos de servicio de la portada', () => {
  const BASES = [
    '/images/servicio-fabricacion.webp',
    '/images/servicio-instalacion.webp',
    '/images/servicio-importacion.webp',
    '/images/servicio-asesoria.webp',
  ];

  it('las cuatro fotos base existen', () => {
    expect(BASES.filter((b) => !hay(b))).toEqual([]);
  });

  it('ServiceTabs ya no construye la ruta de la segunda toma a mano', () => {
    // El fallo original: `/images/${base}${ph === 1 ? '-2' : ''}.jpg` pedía
    // archivos que nunca existieron y el servidor lo registraba como
    // «The requested resource isn't a valid image … received null» en cada
    // carga de la portada. Un componente de cliente no puede comprobar el
    // disco; la resolución tiene que venir del servidor.
    // Se mira el CÓDIGO, no la prosa: el propio archivo cita la expresión
    // vieja en su comentario para explicar qué se corrigió, y buscarla en el
    // texto completo daría un falso positivo eterno.
    const src = sinComentarios(readFileSyncSafe('components/ServiceTabs.tsx'));
    expect(src).not.toMatch(/\$\{base\}\$\{ph === 1/);
    expect(src).not.toMatch(/const PHOTO: Record<string, string>/);
    expect(src).toMatch(/tomas\[ph\]/);
  });

  it('la portada resuelve las tomas en el servidor', () => {
    const src = readFileSyncSafe('app/(es)/page.tsx');
    expect(src).toMatch(/tomasDe\(/);
    expect(src).toMatch(/FOTO_SERVICIO/);
  });
});

/** Quita bloques /* *\/ y líneas // para que las pruebas juzguen código. */
function sinComentarios(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function readFileSyncSafe(rel: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('node:fs').readFileSync(join(process.cwd(), rel), 'utf8');
}
