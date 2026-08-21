import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { rutaSegundaToma, esSegundaToma, tomasDe, mapaDeTomas, conSegundaToma } from '@/lib/galeria';
import { products } from '@/lib/products';

describe('galería: resolución de la segunda toma', () => {
  it('deriva la ruta de la segunda toma conservando la extensión', () => {
    expect(rutaSegundaToma('/images/galeria/x-general.jpg')).toBe('/images/galeria/x-general-2.jpg');
    expect(rutaSegundaToma('/images/galeria/x-detalle.png')).toBe('/images/galeria/x-detalle-2.png');
  });

  it('reconoce una segunda toma y no la anida', () => {
    // Sin esto acabaríamos buscando "-2-2.jpg".
    expect(esSegundaToma('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(esSegundaToma('/images/galeria/x-general.jpg')).toBe(false);
    expect(tomasDe('/images/galeria/x-general-2.jpg')).toEqual(['/images/galeria/x-general-2.jpg']);
  });

  it('devuelve una sola toma cuando el archivo -2 no existe', () => {
    // Es el caso normal mientras el segundo juego no ha llegado: no debe
    // producir un cruce contra un hueco.
    expect(tomasDe('/images/galeria/no-existe-general.jpg')).toEqual([
      '/images/galeria/no-existe-general.jpg',
    ]);
  });

  it('devuelve dos tomas cuando el archivo -2 sí existe', () => {
    const conDos = products
      .flatMap((p) => p.gallery ?? [])
      .filter((s) => existsSync(join(process.cwd(), 'public', rutaSegundaToma(s))));
    // Si algún día no hay ninguna, el test no debe dar un falso verde.
    if (conDos.length === 0) return;
    for (const src of conDos) expect(tomasDe(src)).toHaveLength(2);
  });

  it('el mapa cubre toda la galería del producto', () => {
    for (const p of products.slice(0, 6)) {
      const mapa = mapaDeTomas(p.gallery ?? []);
      for (const src of p.gallery ?? []) expect(mapa[src]?.[0]).toBe(src);
    }
  });

  it('conSegundaToma cuenta sin romperse con galerías vacías', () => {
    expect(conSegundaToma([])).toBe(0);
  });
});

describe('Ken Burns: movimiento que no estorba', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  it('el zoom no recorta el detalle técnico', () => {
    // scale(1.14) se comía la zanja de anclaje del borde, que es exactamente
    // lo que un ingeniero mira en esa foto.
    const kf = css.slice(css.indexOf('@keyframes kenburns'), css.indexOf('@keyframes kenburns') + 200);
    expect(kf).toMatch(/scale\(1\.0[0-9]\)/);
    expect(kf).not.toMatch(/scale\(1\.1[0-9]\)/);
  });

  it('el hover pausa, no acelera', () => {
    // Cambiar animation-duration a mitad de una animación reposiciona el
    // fotograma y la imagen salta al pasar el cursor.
    expect(css).toMatch(/\.group:hover \.ken-burns \{ animation-play-state: paused; \}/);
    expect(css).not.toMatch(/\.group:hover \.ken-burns \{ animation-duration/);
  });

  it('no fuerza una capa de composición permanente', () => {
    // Se afirma sobre la DECLARACIÓN, no sobre la palabra: el comentario del
    // propio bloque menciona will-change para explicar por qué se quitó, y
    // buscar la palabra suelta hacía fallar el test contra su propia prosa.
    const bloque = css.slice(css.indexOf('.ken-burns {'), css.indexOf('@keyframes kenburns'));
    expect(bloque).not.toMatch(/^\s*will-change\s*:/m);
  });

  it('respeta prefers-reduced-motion sin excepciones', () => {
    // El movimiento puede provocar malestar vestibular real. No es una
    // preferencia estética.
    const bloque = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)', css.indexOf('.toma-cruce')));
    expect(bloque).toMatch(/\.ken-burns \{ animation: none !important/);
    expect(bloque).toMatch(/\.toma-cruce \{ animation: none !important/);
  });

  it('el cruce entre tomas es lento', () => {
    // Un carrusel rápido en una ficha técnica compite con la lectura y obliga
    // a esperar para volver a ver lo que uno estaba mirando.
    const m = css.match(/animation: cruce-tomas (\d+)s/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeGreaterThanOrEqual(16);
  });
});

describe('galería: integración con la ficha', () => {
  it('la ficha resuelve las tomas en el servidor y las pasa al componente', () => {
    const page = readFileSync(join(process.cwd(), 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/mapaDeTomas\(product\.gallery/);
  });

  it('la segunda toma no añade una miniatura ni una leyenda duplicada', () => {
    // Es la MISMA vista fotografiada dos veces: como entrada suelta en
    // `gallery` produciría una quinta miniatura sin leyenda.
    for (const p of products) {
      for (const src of p.gallery ?? []) {
        expect(esSegundaToma(src), `${p.slug}: ${src} no debe estar en gallery`).toBe(false);
      }
    }
  });

  it('la segunda toma se oculta a los lectores de pantalla', () => {
    const src = readFileSync(join(process.cwd(), 'components/ProductGallery.tsx'), 'utf8');
    const bloque = src.slice(src.indexOf('toma-cruce'), src.indexOf('toma-cruce') + 400);
    expect(bloque).toMatch(/aria-hidden="true"/);
    expect(bloque).toMatch(/alt=""/);
  });
});
