import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

/**
 * El modo oscuro del sitio funciona con una capa de compatibilidad en
 * globals.css: los componentes escriben utilidades literales (bg-white,
 * text-gray-800…) y esa capa las remapea a los tokens del tema dentro de
 * <main>. Si la capa no cubre un tipo de elemento, ese elemento se queda
 * BLANCO sobre página oscura y su texto desaparece.
 *
 * Ocurrió de verdad: el encabezado y la primera columna de las tablas
 * comparativas (th) y el bloque "En resumen" de las guías (text-gray-800)
 * quedaban ilegibles. Estos tests fijan la cobertura.
 */
describe('modo oscuro: cobertura de la capa de compatibilidad', () => {
  const surfaceRule =
    css.match(/\.dark main :is\(([^)]*)\)\.bg-white \{/)?.[1] ?? '';

  it('la regla de superficie cubre tablas, celdas, chips y párrafos', () => {
    for (const tag of ['div', 'section', 'article', 'li', 'p', 'span', 'th', 'td', 'table', 'tr']) {
      expect(surfaceRule, `falta ${tag} en la capa oscura`).toContain(tag);
    }
  });

  it('bg-gray-50 y bg-gray-100 tienen la misma cobertura que bg-white', () => {
    const grayRule = css.match(/\.dark main :is\(([^)]*)\)\.bg-gray-50/)?.[1] ?? '';
    for (const tag of ['th', 'td', 'span', 'p']) {
      expect(grayRule, `falta ${tag} en bg-gray-50`).toContain(tag);
    }
  });

  it('text-gray-800 es tinta principal, no secundaria', () => {
    // Mapearla a --text-muted dejaba el resumen de cada guía casi ilegible.
    expect(css).toMatch(/\.dark main :is\(\.text-gray-800, \.text-gray-900\) \{ color: var\(--text\); \}/);
  });

  it('text-gray-400 sigue siendo tenue pero legible', () => {
    expect(css).toContain('.dark main .text-gray-400');
  });

  it('los CTA blancos sobre bloques oscuros siguen siendo blancos', () => {
    // Esta excepción debe ir DESPUÉS de la regla general o el botón blanco
    // del hero y de los CTA se volvería una superficie oscura.
    const generic = css.indexOf('.dark main :is(div, section, article, aside, li, p, span');
    const exception = css.indexOf('.dark main :is(a, button).bg-white');
    expect(generic).toBeGreaterThan(-1);
    expect(exception).toBeGreaterThan(generic);
  });
});
