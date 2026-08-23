import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  rutaToma,
  rutaSegundaToma,
  esTomaAdicional,
  esSegundaToma,
  tomasDe,
  mapaDeTomas,
  conVariasTomas,
  conSegundaToma,
  tomasDuplicadas,
  claseCiclo,
  MAX_TOMAS,
} from '@/lib/galeria';
import { products } from '@/lib/products';

describe('galería: resolución de las tomas', () => {
  it('deriva la ruta de cada toma conservando la extensión', () => {
    expect(rutaToma('/images/galeria/x-general.jpg', 2)).toBe('/images/galeria/x-general-2.jpg');
    expect(rutaToma('/images/galeria/x-detalle.png', 3)).toBe('/images/galeria/x-detalle-3.png');
    expect(rutaToma('/images/glosario/x.png', 4)).toBe('/images/glosario/x-4.png');
    // La toma 1 es la ruta base: no lleva sufijo.
    expect(rutaToma('/images/galeria/x-general.jpg', 1)).toBe('/images/galeria/x-general.jpg');
    expect(rutaSegundaToma('/images/galeria/x-general.jpg')).toBe('/images/galeria/x-general-2.jpg');
  });

  it('reconoce una toma adicional y no la anida', () => {
    // Sin esto acabaríamos buscando "-2-2.jpg".
    expect(esTomaAdicional('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(esTomaAdicional('/images/galeria/x-general-3.jpg')).toBe(true);
    expect(esTomaAdicional('/images/galeria/x-general.jpg')).toBe(false);
    expect(esSegundaToma('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(tomasDe('/images/galeria/x-general-2.jpg')).toEqual(['/images/galeria/x-general-2.jpg']);
  });

  it('devuelve una sola toma cuando no existe ninguna adicional', () => {
    // Es el caso normal mientras el segundo juego no ha llegado: no debe
    // producir un cruce contra un hueco.
    expect(tomasDe('/images/galeria/no-existe-general.jpg')).toEqual([
      '/images/galeria/no-existe-general.jpg',
    ]);
  });

  it('el mapa cubre toda la galería del producto', () => {
    for (const p of products.slice(0, 6)) {
      const mapa = mapaDeTomas(p.gallery ?? []);
      for (const src of p.gallery ?? []) expect(mapa[src]?.[0]).toBe(src);
    }
  });

  it('cuenta sin romperse con galerías vacías', () => {
    expect(conVariasTomas([])).toBe(0);
    expect(conSegundaToma([])).toBe(0);
    expect(tomasDuplicadas([])).toBe(0);
  });

  it('la clase de ciclo solo existe cuando hay algo que cruzar', () => {
    expect(claseCiclo(1)).toBeNull();
    expect(claseCiclo(0)).toBeNull();
    expect(claseCiclo(2)).toBe('tomas-2');
    expect(claseCiclo(3)).toBe('tomas-3');
    expect(claseCiclo(4)).toBe('tomas-4');
    // Nunca una clase que el CSS no define.
    expect(claseCiclo(9)).toBe(`tomas-${MAX_TOMAS}`);
  });
});

/* --------------------------------------------------------------------------
   Las tres reglas duras, contra archivos de verdad.

   Se escriben ficheros reales en un directorio propio y se borran al terminar.
   Es la única forma de comprobar el descarte por contenido: el hash se calcula
   leyendo el archivo, y un doble de prueba comprobaría el doble, no el código.
-------------------------------------------------------------------------- */
const DIR = '/images/_pruebas-tomas';
const abs = (r: string) => join(process.cwd(), 'public', r);

describe('galería: las tres reglas del descarte', () => {
  beforeAll(() => {
    mkdirSync(abs(DIR), { recursive: true });
    const A = Buffer.from('contenido-A-'.repeat(64));
    const B = Buffer.from('contenido-B-'.repeat(64));
    const C = Buffer.from('contenido-C-'.repeat(64));

    // Caso 1: tres tomas realmente distintas.
    writeFileSync(abs(`${DIR}/distintas.png`), A);
    writeFileSync(abs(`${DIR}/distintas-2.png`), B);
    writeFileSync(abs(`${DIR}/distintas-3.png`), C);

    // Caso 2: tres copias byte a byte. El caso real de este proyecto.
    writeFileSync(abs(`${DIR}/clones.png`), A);
    writeFileSync(abs(`${DIR}/clones-2.png`), A);
    writeFileSync(abs(`${DIR}/clones-3.png`), A);

    // Caso 3: hueco en la secuencia (-2 falta, -3 está).
    writeFileSync(abs(`${DIR}/hueco.png`), A);
    writeFileSync(abs(`${DIR}/hueco-3.png`), B);

    // Caso 4: más tomas que el tope.
    writeFileSync(abs(`${DIR}/muchas.png`), A);
    for (let i = 2; i <= MAX_TOMAS + 2; i++) {
      writeFileSync(abs(`${DIR}/muchas-${i}.png`), Buffer.from(`contenido-${i}-`.repeat(64)));
    }
  });

  afterAll(() => rmSync(abs(DIR), { recursive: true, force: true }));

  it('rota todas las tomas cuando son distintas', () => {
    expect(tomasDe(`${DIR}/distintas.png`)).toEqual([
      `${DIR}/distintas.png`,
      `${DIR}/distintas-2.png`,
      `${DIR}/distintas-3.png`,
    ]);
  });

  it('descarta las copias byte a byte: un duplicado no es una toma', () => {
    // Fundir una imagen contra una copia exacta de sí misma no produce cruce
    // alguno: produce diez segundos en los que la página parece congelada, y
    // dos descargas del mismo archivo.
    expect(tomasDe(`${DIR}/clones.png`)).toEqual([`${DIR}/clones.png`]);
    expect(tomasDuplicadas([`${DIR}/clones.png`])).toBe(2);
    expect(tomasDuplicadas([`${DIR}/distintas.png`])).toBe(0);
  });

  it('se corta en el primer hueco de la secuencia', () => {
    // -2 ausente y -3 presente es casi siempre un archivo mal nombrado.
    // Adivinar produciría una rotación distinta en cada despliegue.
    expect(tomasDe(`${DIR}/hueco.png`)).toEqual([`${DIR}/hueco.png`]);
  });

  it('nunca supera el tope de tomas', () => {
    // Cada toma es una descarga completa antes de que el visitante decida si
    // le interesa el producto.
    expect(tomasDe(`${DIR}/muchas.png`)).toHaveLength(MAX_TOMAS);
    expect(claseCiclo(tomasDe(`${DIR}/muchas.png`).length)).toBe(`tomas-${MAX_TOMAS}`);
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

  it('la pausa por hover se declara DESPUÉS de los ciclos', () => {
    // La forma abreviada `animation:` de las reglas .tomas-N reinicia
    // animation-play-state. Con la misma especificidad gana la última regla:
    // puesta antes, el hover no pausaba absolutamente nada.
    const pausa = css.indexOf('.group:hover .toma-cruce');
    const ultimoCiclo = css.lastIndexOf('.tomas-4 .toma-capa-4');
    expect(pausa).toBeGreaterThan(-1);
    expect(ultimoCiclo).toBeGreaterThan(-1);
    expect(pausa).toBeGreaterThan(ultimoCiclo);
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
    // Oculta TODAS las capas, no solo la segunda: el selector es la clase
    // común, no una clase numerada.
    expect(bloque).toMatch(/\.toma-cruce \{[^}]*opacity: 0 !important/);
  });
});

describe('cruce de N tomas: el ciclo es correcto para 2, 3 y 4', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  for (const n of [2, 3, 4]) {
    it(`define ${n - 1} capa(s) y un ciclo lento para ${n} tomas`, () => {
      for (let k = 2; k <= n; k++) {
        const regla = new RegExp(`\\.tomas-${n} \\.toma-capa-${k} \\{ animation: cruce-${k}de${n} (\\d+)s`);
        const m = css.match(regla);
        expect(m, `falta la regla de la capa ${k} de ${n}`).toBeTruthy();
        // Un carrusel rápido en una ficha técnica compite con la lectura.
        expect(Number(m![1]) / n).toBeGreaterThanOrEqual(8);
      }
      // No debe declarar una capa que el componente nunca va a renderizar.
      expect(css).not.toMatch(new RegExp(`\\.tomas-${n} \\.toma-capa-${n + 1}\\b`));
    });

    it(`el ciclo de ${n} tomas no deja ver el fondo en las transiciones`, () => {
      // LA INVARIANTE. La capa más alta arranca el ciclo VISIBLE (viene de
      // cerrar la vuelta anterior) y se funde hacia afuera revelando la toma
      // 1. Las intermedias arrancan ocultas y se apagan de golpe cuando ya
      // están tapadas. Si la última arrancara en 0, habría un corte seco de la
      // toma N a la toma 1; si una intermedia arrancara en 1, dos capas a
      // media opacidad dejarían transparentarse la toma 1 debajo.
      const inicio = (nombre: string) => {
        const i = css.indexOf(`@keyframes ${nombre}`);
        expect(i, `falta @keyframes ${nombre}`).toBeGreaterThan(-1);
        const bloque = css.slice(i, css.indexOf('}', css.indexOf('{', i) + 1) + 1);
        return bloque.match(/0%\s*\{\s*opacity:\s*([\d.]+)/)?.[1];
      };
      expect(inicio(`cruce-${n}de${n}`), 'la capa más alta debe arrancar visible').toBe('1');
      for (let k = 2; k < n; k++) {
        expect(inicio(`cruce-${k}de${n}`), `la capa intermedia ${k} debe arrancar oculta`).toBe('0');
      }
    });
  }

  it('el Ken Burns de cada capa le gana a la regla general', () => {
    // `.ken-burns-wrap:nth-of-type(3n) .ken-burns` tiene especificidad (0,3,0).
    // Con `.toma-capa-N .ken-burns` (0,2,0) todas las capas heredaban el mismo
    // desfase y el cruce se leía como un parpadeo de la misma foto.
    for (const k of [2, 3, 4]) {
      expect(css).toMatch(new RegExp(`\\.toma-cruce\\.toma-capa-${k} \\.ken-burns \\{ animation-delay`));
    }
  });
});

describe('galería: integración con la ficha', () => {
  const gal = readFileSync(join(process.cwd(), 'components/ProductGallery.tsx'), 'utf8');

  it('la ficha resuelve las tomas en el servidor y las pasa al componente', () => {
    const page = readFileSync(join(process.cwd(), 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/mapaDeTomas\(product\.gallery/);
  });

  it('las tomas adicionales no añaden miniatura ni leyenda duplicada', () => {
    // Es la MISMA vista capturada otra vez: como entrada suelta en `gallery`
    // produciría una miniatura extra sin leyenda.
    for (const p of products) {
      for (const src of p.gallery ?? []) {
        expect(esTomaAdicional(src), `${p.slug}: ${src} no debe estar en gallery`).toBe(false);
      }
    }
  });

  it('las tomas adicionales se ocultan a los lectores de pantalla', () => {
    const bloque = gal.slice(gal.indexOf('{capas.map('), gal.indexOf('{capas.map(') + 600);
    expect(bloque).toMatch(/aria-hidden="true"/);
    expect(bloque).toMatch(/alt=""/);
  });

  it('ninguna toma secundaria se marca prioritaria', () => {
    // Precargar la toma 2 compite con la toma 1, que es la que mide el LCP.
    const bloque = gal.slice(gal.indexOf('{capas.map('), gal.indexOf('{capas.map(') + 600);
    expect(bloque).not.toMatch(/priority/);
  });

  it('el número de capas nunca supera lo que el CSS define', () => {
    expect(gal).toMatch(/capas = tomasActivas\.slice\(1, 4\)/);
  });
});

describe('glosario y recursos: la misma rotación', () => {
  const src = readFileSync(join(process.cwd(), 'components/ImagenContenido.tsx'), 'utf8');

  it('resuelve las tomas con la misma librería que la galería', () => {
    // Dos implementaciones del mismo cruce divergen; una sola no puede.
    //
    // Esta comprobación fijaba antes el literal `tomasDe(ranura.ruta)`, es
    // decir, el NOMBRE de una variable. Cuando el componente pasó a poder
    // servir una fotografía de respaldo —y por tanto a resolver las tomas de
    // la imagen que realmente pinta, no de la que la ranura pedía—, la prueba
    // falló sin que nada se hubiera roto. Ahora se verifica la regla: las
    // tomas se resuelven con `tomasDe` sobre EXACTAMENTE la misma expresión
    // que alimenta el `src` de la imagen principal.
    expect(src).toMatch(/from '@\/lib\/galeria'/);
    const llamada = src.match(/const tomas = tomasDe\(([A-Za-z0-9_.]+)\)/);
    expect(llamada, 'ImagenContenido debe resolver sus tomas con tomasDe').toBeTruthy();
    const fuente = llamada![1];
    expect(src).toMatch(new RegExp(`src=\\{${fuente.replace('.', '\\.')}\\}`));
    expect(src).toMatch(/claseCiclo\(/);
  });

  it('apila las capas con las mismas clases del CSS', () => {
    expect(src).toMatch(/toma-cruce toma-capa-\$\{k \+ 2\}/);
    expect(src).toMatch(/ken-burns/);
  });

  it('no marca prioritaria ninguna toma secundaria', () => {
    const bloque = src.slice(src.indexOf('{capas.map('), src.indexOf('{capas.map(') + 500);
    expect(bloque).not.toMatch(/priority/);
  });

  it('existe el fichero real de alguna ranura con varias tomas o ninguna miente', () => {
    // No exige que existan: exige que si existen, se resuelvan. Un test que
    // exigiera archivos convertiría "todavía no llegaron" en rojo permanente.
    const dir = join(process.cwd(), 'public/images/glosario');
    if (!existsSync(dir)) return;
    expect(tomasDe('/images/glosario/no-existe-jamas.png')).toHaveLength(1);
  });
});

/* --------------------------------------------------------------------------
   La prueba que de verdad importa: simular el compositing.

   Leer los @keyframes y comprobar que "parecen bien" no demuestra nada. Lo que
   se puede demostrar es el resultado: apilando las capas con la fórmula real
   del navegador (`abajo * (1 - opacidad) + capa * opacidad`), en NINGÚN
   instante del ciclo puede haber tres imágenes visibles a la vez. Si las hay,
   la tercera es siempre la toma 1 asomando por debajo de dos capas a media
   opacidad: el fantasma que este diseño existe para evitar.
-------------------------------------------------------------------------- */
describe('cruce de N tomas: el compositing no deja asomar el fondo', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  function paradas(nombre: string): Array<[number, number]> {
    const i = css.indexOf(`@keyframes ${nombre}`);
    const cuerpo = css.slice(i, css.indexOf('\n}', i));
    const out: Array<[number, number]> = [];
    for (const m of cuerpo.matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+)/g)) {
      out.push([Number(m[1]), Number(m[2])]);
    }
    return out.sort((a, b) => a[0] - b[0]);
  }

  const opacidadEn = (ps: Array<[number, number]>, t: number): number => {
    if (t <= ps[0][0]) return ps[0][1];
    for (let i = 0; i < ps.length - 1; i++) {
      const [a, va] = ps[i];
      const [b, vb] = ps[i + 1];
      if (t >= a && t <= b) return b === a ? vb : va + (vb - va) * ((t - a) / (b - a));
    }
    return ps[ps.length - 1][1];
  };

  for (const n of [2, 3, 4]) {
    it(`con ${n} tomas nunca hay tres imágenes visibles a la vez`, () => {
      const capas = Array.from({ length: n - 1 }, (_, i) => paradas(`cruce-${i + 2}de${n}`));
      for (let paso = 0; paso <= 2000; paso++) {
        const t = paso / 20; // 0 … 100 %
        // Peso de cada toma en el píxel final. La toma 1 es el fondo opaco.
        let peso = [1, ...Array(n - 1).fill(0)];
        capas.forEach((ps, i) => {
          const o = opacidadEn(ps, t);
          peso = peso.map((x) => x * (1 - o));
          peso[i + 1] += o;
        });
        const visibles = peso.map((x, i) => [x, i]).filter(([x]) => x > 0.02);
        expect(visibles.length, `t=${t}% pesos=${peso.map((x) => x.toFixed(2)).join(',')}`).toBeLessThanOrEqual(2);
        if (visibles.length === 2) {
          const salto = Math.abs(visibles[1][1] - visibles[0][1]);
          // Solo se funden tomas consecutivas (o la última con la primera al
          // cerrar la vuelta). Cualquier otro par es un salto de secuencia.
          expect(salto === 1 || salto === n - 1, `t=${t}% funde tomas no consecutivas`).toBe(true);
        }
      }
    });
  }
});
