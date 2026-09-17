import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * /CARRITO Y /CHECKOUT SON RUTAS PRIVADAS, NO PÁGINAS HUÉRFANAS.
 *
 * `scripts/auditar-html.mjs` marcaba estas tres rutas como "huérfana" —
 * ninguna página del sitio enlaza aquí— porque mide el grafo de enlaces
 * PÚBLICOS del HTML generado, y estas rutas son deliberadamente invisibles
 * desde la navegación: son estado del comprador (carrito, pasarela), no
 * contenido editorial. Enlazarlas desde el menú o el pie solo para que el
 * auditor deje de quejarse sería fabricar un enlace falso; la corrección
 * real es que el auditor sepa distinguir "nadie lo enlaza porque es privado"
 * de "nadie lo enlaza porque se olvidó".
 *
 * Esta prueba fija esa distinción: la lista de excepción del auditor
 * (RUTAS_PRIVADAS) tiene que ser exactamente las rutas que robots.ts
 * declara DISALLOW por la misma razón. Si alguna vez divergen —se agrega una
 * ruta transaccional nueva a robots.ts y no al auditor, o al revés—, esta
 * prueba lo señala antes de que alguien la use para esconder una huérfana
 * pública de verdad.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

describe('rutas privadas: carrito y checkout', () => {
  it('robots.ts las declara DISALLOW', () => {
    const robots = leer('app/robots.ts');
    expect(robots).toContain('"/carrito"');
    expect(robots).toContain('"/checkout"');
  });

  it('el auditor de HTML las excluye explícitamente del chequeo de huérfanas, no las ignora en silencio', () => {
    const auditor = leer('scripts/auditar-html.mjs');
    expect(auditor).toContain('RUTAS_PRIVADAS');
    expect(auditor).toContain("'/carrito'");
    expect(auditor).toContain("'/checkout'");
    expect(auditor).toContain("'/checkout/exito'");
    // La excepción vive junto al bucle que emite 'huerfana', no en otro sitio
    // desconectado del chequeo real.
    const idxExcepcion = auditor.indexOf('RUTAS_PRIVADAS');
    const idxChequeo = auditor.indexOf("anota('aviso', 'huerfana'");
    expect(idxExcepcion).toBeGreaterThan(-1);
    expect(idxChequeo).toBeGreaterThan(idxExcepcion);
  });

  it('el mega menú y el pie no fabrican un enlace falso hacia el carrito solo para el auditor', () => {
    // CART_ENABLED gobierna si el carrito aparece en la navegación; cuando
    // está apagado (el caso normal en un B2B por RFQ), no debe existir un
    // enlace de relleno hacia /carrito en ninguna plantilla.
    const navbar = leer('components/Navbar.tsx');
    const enlacesCarrito = navbar.match(/href="\/carrito"/g) ?? [];
    // El único enlace permitido va detrás de CART_ENABLED, nunca suelto.
    for (const _ of enlacesCarrito) {
      expect(navbar).toMatch(/CART_ENABLED\s*&&[\s\S]{0,200}href="\/carrito"/);
    }
  });
});
