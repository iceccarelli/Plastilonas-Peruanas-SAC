import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '@/lib/site';
import { PRODUCT_COUNT, FAMILY_COUNT, COUNT_STATEMENT } from '@/lib/facts';
import { pillars, totalCriteria } from '@/lib/framework';
import { ranurasProceso } from '@/lib/imagenes';

/**
 * NINGUNA CIFRA SE TECLEA DONDE EL DATO PUEDE CALCULARLA.
 *
 * La regla ya existía —lib/facts.ts, y el README la enuncia— pero sólo se
 * vigilaba el catálogo. Fuera de ahí siguieron caducando cifras en silencio, y
 * las tres que se colaron son un catálogo de cómo ocurre:
 *
 *   · /marco titulaba «6 pilares y 27 criterios» mientras su propio cuerpo
 *     renderizaba totalCriteria() = 26, cuatro veces. La pestaña del navegador
 *     y el primer párrafo se contradecían, y el 27 era el que Google indexaba.
 *   · llms.txt anunciaba «36 líneas de producto» donde son 36 soluciones en 11
 *     líneas: derivaba del dato correcto y lo etiquetaba mal, de modo que un
 *     agente que resumiera el catálogo publicaba una cifra que el sitio
 *     desmiente.
 *   · el README citaba «553 pruebas» y «las seis primeras corren en CI». Las
 *     siete corren, y la suite hace tiempo que pasó de 553.
 *
 * Un número escrito a mano no es un error de estilo: es una afirmación que
 * nadie recalcula.
 */

const raiz = process.cwd();

describe('las cifras derivan del dato, no del teclado', () => {
  it('/marco titula con los pilares y criterios que el marco tiene', () => {
    const src = readFileSync(join(raiz, 'app/marco/page.tsx'), 'utf8');
    const literal = /const TITLE = '[^']*\d+[^']*'/.exec(src);
    expect(
      literal?.[0] ?? null,
      'el título de /marco lleva un número escrito a mano: derívelo de pillars/totalCriteria',
    ).toBeNull();
    expect(src).toContain('${pillars.length} pilares');
    expect(src).toContain('${totalCriteria()} criterios');
  });

  it('llms.txt anuncia el catálogo con la frase de facts.ts', () => {
    const src = readFileSync(join(raiz, 'app/llms.txt/route.ts'), 'utf8');
    expect(
      src,
      'llms.txt llamaba «líneas de producto» a los productos: son soluciones en líneas',
    ).not.toMatch(/\$\{products\.length\}\s+líneas de producto/);
    expect(src).toContain('COUNT_STATEMENT');
    // Y la frase misma sigue distinguiendo las dos cosas.
    expect(COUNT_STATEMENT).toBe(
      `${PRODUCT_COUNT} soluciones en ${FAMILY_COUNT} líneas de producto`,
    );
  });

  it('el encargo de una imagen que cuenta elementos deriva ese número', () => {
    /**
     * El encargo de marco-pilares decía «los pilares», sin número. El generador
     * entregó CINCO columnas para una página que dice seis, y las dos tomas
     * coinciden en el error. Un esquema que contradice a su propia página es
     * peor que no tener esquema: el comprador que las cuenta deja de fiarse.
     */
    const r = ranurasProceso().find((x) => x.id === 'proceso:marco-pilares');
    expect(r, 'falta la ranura del marco').toBeDefined();
    expect(
      r!.prompt,
      'el encargo no dice cuántos pilares dibujar, y el generador tuvo que adivinar',
    ).toContain(`${pillars.length} pilares`);
  });

  it('el README no cita cifras que caducan solas', () => {
    const readme = readFileSync(join(raiz, 'README.md'), 'utf8');
    for (const re of [/\b\d{3}\s+pruebas\b/i, /\b\d{3}\s+páginas\b/i, /las seis primeras corren en CI/i]) {
      expect(readme, `el README cita una cifra que nadie recalcula: ${re}`).not.toMatch(re);
    }
  });
});

describe('sólo CANONICAL_ORIGIN mueve el origen canónico', () => {
  /**
   * NEXT_PUBLIC_SITE_URL existe para las URLs de retorno de Stripe y
   * .env.example la trae puesta a http://localhost:3000. Mientras fue el
   * segundo término del fallback de SITE.url, activar pagos siguiendo ese
   * archivo publicaba TODO el sitio —canónicos, sitemap, robots, OG, JSON-LD,
   * llms.txt— apuntando a localhost, sin que middleware.ts se enterara.
   */
  it('SITE.url no se mueve por la variable de Stripe', () => {
    const src = readFileSync(join(raiz, 'lib/site.ts'), 'utf8');
    const fn = /function originFromEnv[\s\S]*?\n}/.exec(src)?.[0] ?? '';
    expect(fn, 'no se encontró originFromEnv').not.toBe('');
    expect(
      fn,
      'NEXT_PUBLIC_SITE_URL volvió al fallback del origen: es la variable de Stripe',
    ).not.toContain('NEXT_PUBLIC_SITE_URL');
    expect(fn).toContain('CANONICAL_ORIGIN');
  });

  it('el origen vigente es https y sin barra final', () => {
    expect(SITE.url.startsWith('https://')).toBe(true);
    expect(SITE.url.endsWith('/')).toBe(false);
    expect(SITE.url).not.toMatch(/localhost/);
  });

  it('ninguna página emite un canónico hacia localhost', () => {
    const culpables: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) recorrer(rel);
        else if (/\.(ts|tsx)$/.test(e.name) && statSync(join(raiz, rel)).size < 2_000_000) {
          const codigo = readFileSync(join(raiz, rel), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*\/\/.*$/gm, '');
          if (/https?:\/\/localhost/.test(codigo)) culpables.push(rel);
        }
      }
    };
    for (const d of ['app', 'components']) recorrer(d);
    expect(culpables, 'localhost escrito en una página servida').toEqual([]);
  });
});
