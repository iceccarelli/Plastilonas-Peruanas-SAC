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
    expect(css).toMatch(/\.dark main :is\(\.text-gray-800, \.text-gray-900\) \{ color: var\(--text\)/);
  });

  it('text-gray-400 sigue siendo tenue pero legible', () => {
    expect(css).toMatch(/\.dark main :is\(\.text-gray-400, \.text-neutral-400\)/);
  });

  it('los fondos semánticos de aviso también siguen al tema', () => {
    // Los cuadros de riesgo en ámbar quedaban claros con tinta clara encima.
    expect(css).toMatch(/\.bg-amber-50, \.bg-amber-100, \.bg-red-50/);
  });

  it('la escala neutral está cubierta igual que la gray', () => {
    // Las 12 páginas de ciudad usan neutral-*: sin esto, su cuerpo de texto
    // quedaba en 1.81:1 sobre fondo oscuro.
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-500, \.text-neutral-600, \.text-neutral-700\)/);
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-800, \.text-neutral-900\)/);
    expect(css).toContain('.border-neutral-300');
  });

  it('la capa oscura iguala la fuerza de la capa AA de modo claro', () => {
    // La capa AA de claro usa !important. Sin !important, las reglas oscuras
    // perdían y el texto conservaba el color pensado para fondo blanco.
    const oscuras = css.match(/\.dark main :is\(\.text-gray-500[^\n]*/)?.[0] ?? '';
    expect(oscuras).toContain('!important');
  });

  it('el verde de marca se aclara en oscuro en vez de oscurecerse', () => {
    // #047857 cumple AA sobre blanco y falla (2.87:1) sobre la página oscura.
    expect(css).toMatch(/\.dark main :is\(\.text-\\\[\\#059669\\\]/);
    expect(css).toContain('var(--brand-hover) !important');
  });

  it('la excepción del CTA blanco exige la tinta navy en el PROPIO elemento', () => {
    // Con selector por descendencia, las tarjetas-enlace forzaban su título a
    // navy sobre superficie oscura (1.01:1).
    expect(css).not.toMatch(/\.dark main :is\(a, button\)\.bg-white \.text-/);
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
