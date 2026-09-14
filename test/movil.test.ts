import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EL CONTRATO DEL PULGAR.
 *
 * La mayoría de las consultas comerciales de este rubro en el Perú entran desde
 * un teléfono, y las 897 pruebas de este repositorio leen archivos: ninguna
 * abre un navegador. Hay un arné que sí lo hace —`npm run diagnostico`, con
 * Playwright— pero necesita el sitio compilado y levantado, así que no corre en
 * el gate de entregas. Entre una entrega y la siguiente, nada vigilaba esto.
 *
 * Lo que sigue son las tres cosas que SÍ se pueden demostrar leyendo el código
 * y que un teléfono castiga sin avisar:
 *
 *   1. Una tabla sin contenedor con scroll propio mueve de lado la PÁGINA, no
 *      la tabla. El comprador pierde el sitio donde estaba leyendo.
 *   2. Un objetivo táctil por debajo de 44 px se falla con el pulgar. WCAG
 *      2.5.8, y en un botón de cotizar eso es una consulta perdida.
 *   3. Una fila de acciones que no envuelve se sale del ancho en 360 px.
 *
 * No sustituye a medir en el navegador. Impide que lo medido vuelva.
 */

const raiz = process.cwd();

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) tsx(rel, out);
    else if (e.name.endsWith('.tsx')) out.push(rel);
  }
  return out;
}

const ARCHIVOS = [...tsx('app'), ...tsx('components')];
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

/** Líneas que el usuario ve: los comentarios explican, no maquetan. */
const sinComentarios = (src: string) =>
  src
    .split('\n')
    .map((texto, i) => ({ n: i + 1, texto }))
    .filter(({ texto }) => {
      const t = texto.trim();
      return !(t.startsWith('*') || t.startsWith('//') || t.startsWith('/*') || t.startsWith('{/*'));
    });

describe('ninguna tabla mueve la página de lado', () => {
  it('cada <table> vive dentro de un contenedor con scroll propio', () => {
    const sueltas: string[] = [];
    for (const f of ARCHIVOS) {
      const src = leer(f);
      for (const m of src.matchAll(/<table\b/g)) {
        // El envoltorio va inmediatamente antes: 600 caracteres cubren de sobra
        // el div contenedor y sus atributos.
        const antes = src.slice(Math.max(0, m.index - 600), m.index);
        if (!/overflow-x-(auto|scroll)/.test(antes)) {
          sueltas.push(`${f}:${src.slice(0, m.index).split('\n').length}`);
        }
      }
    }
    expect(
      sueltas,
      'envuélvala en <div className="overflow-x-auto">: sin eso se desplaza la página entera',
    ).toEqual([]);
  });
});

describe('lo que se toca se puede tocar', () => {
  /**
   * Un `py-1.5` da unos 30 px de alto. El padding además depende de que nadie
   * lo cambie; `min-h-[44px]` lo declara y sobrevive a un rediseño.
   */
  it('ningún enlace ni botón se queda por debajo de 44 px de alto', () => {
    const flojos: string[] = [];
    for (const f of ARCHIVOS) {
      for (const { n, texto } of sinComentarios(leer(f))) {
        const esInteractivo = /<(Link|button)\b/.test(texto) || /className=.*\b(href|onClick)=/.test(texto);
        if (!esInteractivo) continue;
        if (!/\bpy-(0|0\.5|1|1\.5)\b/.test(texto)) continue;
        if (/min-h-\[|h-\d|aspect-/.test(texto)) continue;
        flojos.push(`${f}:${n}`);
      }
    }
    expect(flojos, 'declare min-h-[44px]: el padding solo no es un objetivo táctil').toEqual([]);
  });

  it('el botón de cotizar de cada ficha del catálogo declara su altura', () => {
    // Se repite en las 36 fichas: es la superficie comercial con más tráfico.
    const src = leer('components/CatalogoFiltrado.tsx');
    const i = src.indexOf('ACCIONES.cotizarProducto.href');
    expect(i, 'el catálogo debe enlazar la acción canónica, no una URL a mano').toBeGreaterThan(-1);
    expect(src.slice(i, i + 400)).toContain('min-h-[44px]');
  });
});

describe('las acciones que van juntas se agrupan y envuelven', () => {
  it('toda fila con dos o más BOTONES se anuncia como grupo y envuelve', () => {
    /**
     * Dos botones en una fila `flex` sin `flex-wrap` se salen del ancho en un
     * teléfono de 360 px. Y sin `role="group"` un lector de pantalla los lee
     * como dos enlaces sueltos en vez de como una decisión con opciones.
     *
     * LA REGLA MIRA EL ASPECTO, NO LA ETIQUETA. Dos enlaces de texto seguidos
     * —los avisos legales del pie, tres enlaces «→» al final de un apartado—
     * son una lista de enlaces y agruparlos sería mentirle al lector de
     * pantalla. Lo que es una decisión con opciones es una fila de BOTONES: con
     * fondo o borde y con padding horizontal. Ésos sí.
     */
    const pareceBoton = (linea: string) =>
      /px-\d/.test(linea) && /\b(bg-|border\b|border-)/.test(linea) && /rounded/.test(linea);
    const malas: string[] = [];
    for (const f of ARCHIVOS) {
      const src = leer(f);
      for (const m of src.matchAll(
        /<div\s+[^>]*className="([^"]*\bflex\b[^"]*\bgap-[^"]*)"[^>]*>\s*\n((?:\s*<Link[^>]*\n(?:[^<]*\n)*?\s*<\/Link>\s*\n|\s*<Link[^>]*>[^<]*<\/Link>\s*\n){2,})/g,
      )) {
        const clases = m[1] as string;
        const linea = src.slice(0, m.index).split('\n').length;
        const contexto = src.slice(Math.max(0, m.index - 260), m.index + 120);
        const botones = (m[2] as string).split('\n').filter(pareceBoton).length;
        if (botones < 2) continue;
        const envuelve = /flex-wrap|flex-col/.test(clases);
        const agrupa = /role="group"/.test(contexto);
        if (!envuelve || !agrupa) {
          malas.push(`${f}:${linea} (${envuelve ? '' : 'sin flex-wrap '}${agrupa ? '' : 'sin role=group'})`);
        }
      }
    }
    expect(
      malas,
      'añada flex-wrap y role="group" con su aria-label: dos acciones juntas son una decisión, no dos enlaces',
    ).toEqual([]);
  });
});

describe('el catálogo usa el vocabulario comercial, no uno propio', () => {
  it('la ficha no reescribe el nombre del botón de cotizar', () => {
    // Era el NOVENO nombre del mismo botón, y en las 36 fichas a la vez.
    const src = leer('components/CatalogoFiltrado.tsx');
    expect(src).not.toContain('Cotizar este producto<');
    expect(src).toContain('ACCIONES.cotizarProducto.label');
  });
});
