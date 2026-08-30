import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HERO_MENSAJES } from '@/lib/hero-mensajes';
import { SITE } from '@/lib/site';

/**
 * EL TEXTO VIVO DEL HERO SE AUDITA COMO DATO.
 *
 * Quince bloques que rotan en la portada son quince oportunidades de
 * publicar una promesa que nadie firmó. Estas pruebas fijan las reglas:
 * mismos hechos en todos, cifras solo interpoladas de la fuente de verdad,
 * y la accesibilidad del tecleo montada como se diseñó, no como quedó.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

describe('los 15 mensajes del hero: forma y honestidad', () => {
  it('hay 15 bloques completos y ningún H1 se repite', () => {
    expect(HERO_MENSAJES.length).toBe(15);
    const h1s = HERO_MENSAJES.map((m) => m.h1);
    expect(new Set(h1s).size).toBe(h1s.length);
    for (const m of HERO_MENSAJES) {
      expect(m.eyebrow.trim().length).toBeGreaterThan(8);
      expect(m.h1.trim().length).toBeGreaterThan(10);
      expect(m.h1.length, m.h1).toBeLessThanOrEqual(60);
      expect(m.sub.trim().length).toBeGreaterThan(10);
      expect(m.productos.trim().length).toBeGreaterThan(10);
    }
  });

  it('ningún mensaje afirma precio, plazo, cliente ni certificación', () => {
    const prohibido = /S\/\s*\d|US?\$|entrega en \d|d[ií]as h[áa]biles|garantizad|certificad|clientes?\b|l[ií]der/i;
    for (const m of HERO_MENSAJES) {
      const texto = `${m.eyebrow} ${m.h1} ${m.sub} ${m.productos}`;
      expect(prohibido.test(texto), texto).toBe(false);
    }
  });

  it('el RUC y el año de fundación se interpolan de SITE, no se teclean', () => {
    const fuente = leer('lib/hero-mensajes.ts');
    // Las cifras aparecen en el resultado…
    expect(HERO_MENSAJES.some((m) => m.eyebrow.includes(SITE.ruc))).toBe(true);
    expect(HERO_MENSAJES.some((m) => m.eyebrow.includes(String(SITE.foundingYear)))).toBe(true);
    // …pero no en el archivo: si se corrigen en lib/site.ts, cambian solas.
    expect(fuente).not.toContain(SITE.ruc);
    expect(fuente).not.toContain(String(SITE.foundingYear));
    expect(fuente).toContain('SITE.ruc');
    expect(fuente).toContain('SITE.foundingYear');
  });

  it('el primer bloque es el mensaje canónico que sirve el SSR', () => {
    // El H1 que ve un rastreador sin JavaScript.
    expect(HERO_MENSAJES[0].h1).toBe('Textil técnico a medida, con instalación propia.');
  });
});

describe('el rotor del hero: accesibilidad y contención', () => {
  const rotor = leer('components/HeroMensaje.tsx');
  const portada = leer('app/(es)/page.tsx');
  const css = leer('app/globals.css');

  it('la portada monta el rotor dentro de la tarjeta del hero', () => {
    expect(portada).toContain('HeroMensaje');
    // Los botones y los chips son el marco constante: viven en la página,
    // no dentro del rotor.
    expect(portada).toContain('Cotizar proyecto');
    expect(portada).toContain('Ver catálogo');
  });

  it('el tecleo es accesible: frase completa para lectores, rotación muda', () => {
    expect(rotor).toContain('aria-live="off"');
    expect(rotor).toContain('sr-only');
    expect(rotor).toContain('prefers-reduced-motion');
    // La copia visual que se teclea no se anuncia dos veces.
    expect(rotor).toContain('aria-hidden');
  });

  it('solo se teclea el H1 y el alto queda reservado', () => {
    // El único setInterval del rotor es el del tecleo del H1.
    expect((rotor.match(/setInterval/g) ?? []).length).toBe(1);
    // La frase completa invisible reserva el alto: la tarjeta no salta.
    expect(rotor).toContain('invisible');
  });

  it('el halo de interacción existe y respeta al táctil', () => {
    expect(css).toContain('AURORA DE INTERACCIÓN');
    expect(css).toContain('@media (hover: hover)');
    expect(css).toContain('focus-visible');
  });
});
