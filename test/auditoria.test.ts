import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LO QUE SOLO SE VE EN EL HTML SERVIDO.
 *
 * El defecto que estas pruebas custodian se midió, no se supuso. Sobre el HTML
 * realmente generado, /productos —la página comercial más importante del
 * sitio— contenía:
 *
 *   · ningún <h1>
 *   · CERO enlaces `href="/productos/…"`, de 36 fichas
 *   · como texto del cuerpo: «Cargando catálogo…»
 *
 * Causa: la página era 'use client' entera y envolvía todo en <Suspense>. Como
 * la rejilla lee `useSearchParams`, Next solo podía prerenderizar el fallback.
 * El mismo patrón dejaba /cotizacion —la página de conversión— sin encabezado
 * y sin una línea de texto.
 *
 * Lo insidioso es que NADA fallaba: compilaba, pasaba los tipos, pasaba las
 * 440 pruebas, y el ItemList de JSON-LD declaraba las 36 URLs, así que las
 * fichas se indexaban igual desde el sitemap. Pero un ItemList no es un grafo
 * de enlaces: el catálogo no le pasaba señal interna a ninguna ficha, y
 * cualquier agente que lea HTML sin ejecutar JavaScript veía una página vacía
 * donde debería estar el portafolio entero.
 */

import { tituloAjustado, descripcionAjustada, tituloCabe } from '@/lib/meta';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { novedades } from '@/lib/novedades';

const raiz = process.cwd();
const leer = (r: string) => readFileSync(join(raiz, r), 'utf8');

/**
 * Solo el cuerpo del componente exportado.
 *
 * Comparar posiciones sobre el archivo entero mide la prosa y los imports:
 * `import { Suspense }` aparece en la línea 5 y un comentario que EXPLICA por
 * qué el encabezado va fuera del Suspense lo menciona otra vez. Ya se cayó en
 * esta trampa antes en este repositorio, con `will-change` y con
 * `toLocaleString`. Se afirma sobre el JSX.
 */
const jsx = (src: string) => src.slice(src.lastIndexOf('export default function'));

describe('el catálogo se sirve como HTML, no como promesa', () => {
  it('/productos es un componente de SERVIDOR', () => {
    const src = leer('app/(es)/productos/page.tsx');
    expect(src.startsWith("'use client'"), '/productos volvió a ser cliente entero').toBe(false);
    expect(src).toMatch(/import IndiceCatalogo/);
    expect(src).toMatch(/<IndiceCatalogo \/>/);
  });

  it('el <h1> y la entrada están fuera del Suspense', () => {
    // Dentro del Suspense, lo único que se prerenderiza es el fallback.
    const cuerpo = jsx(leer('app/(es)/productos/page.tsx'));
    expect(cuerpo.indexOf('<h1 className')).toBeGreaterThan(-1);
    expect(cuerpo.indexOf('<h1 className')).toBeLessThan(cuerpo.indexOf('<Suspense'));
  });

  it('el índice enlaza a TODAS las fichas del catálogo', () => {
    const src = leer('components/IndiceCatalogo.tsx');
    // Se deriva del catálogo: no puede quedarse corto al añadir un producto.
    expect(src).toMatch(/products\.filter/);
    expect(src).toMatch(/href=\{`\/productos\/\$\{p\.slug\}`\}/);
    expect(src).not.toMatch(/^'use client'/);
  });

  it('la rejilla filtrable ya no arrastra el encabezado', () => {
    // Dos <h1> en la misma página compiten por decir de qué trata.
    const src = leer('components/CatalogoFiltrado.tsx');
    expect(src).not.toMatch(/<h1\s+className/);
    expect(src.startsWith("'use client'")).toBe(true);
  });

  it('/cotizacion tiene su encabezado fuera del Suspense', () => {
    const cuerpo = jsx(leer('app/(es)/cotizacion/page.tsx'));
    const h1 = cuerpo.indexOf('<h1 className');
    const suspense = cuerpo.indexOf('<Suspense');
    expect(h1).toBeGreaterThan(-1);
    expect(suspense).toBeGreaterThan(-1);
    expect(h1, 'el <h1> volvió a caer dentro del Suspense').toBeLessThan(suspense);
  });

  it('carrito y checkout emiten encabezado antes de montar', () => {
    // Devolvían un div vacío: la página se servía literalmente sin contenido.
    for (const r of ['app/(es)/carrito/page.tsx', 'app/(es)/checkout/page.tsx']) {
      const src = leer(r);
      const guarda = src.indexOf('if (!mounted)');
      expect(guarda, r).toBeGreaterThan(-1);
      const bloque = src.slice(guarda, guarda + 700);
      expect(bloque, `${r}: sigue devolviendo un contenedor vacío`).toMatch(/<h1\s+className/);
    }
  });

  it('las páginas transaccionales declaran título propio y noindex', () => {
    // Tres URLs distintas compartían el MISMO <title> por defecto del sitio,
    // que es exactamente la señal de duplicado que se quiere evitar.
    const titulos = new Set<string>();
    for (const r of ['app/(es)/carrito/layout.tsx', 'app/(es)/checkout/layout.tsx', 'app/(es)/checkout/exito/layout.tsx']) {
      const src = leer(r);
      const t = src.match(/title:\s*'([^']+)'/)?.[1];
      expect(t, `${r} sin título propio`).toBeTruthy();
      titulos.add(t!);
      expect(src, `${r} sin canónico`).toMatch(/alternates:\s*\{\s*canonical/);
      // robots.txt impide el rastreo, pero una URL enlazada desde fuera puede
      // indexarse sin haber sido rastreada. El meta lo cierra.
      expect(src, `${r} sin noindex`).toMatch(/robots:\s*\{\s*index:\s*false/);
    }
    expect(titulos.size, 'los tres títulos deben ser distintos entre sí').toBe(3);
  });
});

describe('el auditor del HTML es un mecanismo, no un script suelto', () => {
  it('está enlazado en package.json y corre en CI después del build', () => {
    const pkg = JSON.parse(leer('package.json'));
    expect(pkg.scripts.auditar).toContain('auditar-html.mjs');
    const ci = leer('.github/workflows/ci.yml');
    const pasos = ci.slice(ci.indexOf('    steps:'));
    expect(pasos).toMatch(/npm run auditar/);
    // Audita la salida del build: antes del build no hay nada que auditar.
    expect(pasos.indexOf('next build')).toBeLessThan(pasos.indexOf('npm run auditar'));
  });

  it('conoce las rutas dinámicas y no grita por ellas', () => {
    // Sin esto daba 167 falsos positivos de golpe por /login, que existe y es
    // dinámica. Un auditor que grita por lo que está bien deja de mirarse.
    const src = leer('scripts/auditar-html.mjs');
    expect(src).toMatch(/rutaDeclarada/);
    expect(src).toMatch(/patronesDeclarados/);
  });

  it('distingue error de aviso y solo falla por errores', () => {
    const src = leer('scripts/auditar-html.mjs');
    expect(src).toMatch(/process\.exit\(errores\.length \? 1 : 0\)/);
    for (const tipo of ['enlace-roto', 'sin-h1', 'sin-canonico', 'titulo-duplicado', 'jsonld-id-colgante', 'marca-duplicada']) {
      expect(src, `${tipo} debería ser error`).toMatch(new RegExp(`'error', '${tipo}'`));
    }
  });

  it('el título de la plantilla no se come el espacio del clic', () => {
    // El sufijo de 27 caracteres causaba por sí solo 67 de los 100 títulos
    // recortados. La razón social exacta sigue en el JSON-LD y en llms.txt,
    // que es donde de verdad desambigua la entidad.
    const src = leer('app/(es)/layout.tsx');
    const plantilla = src.match(/template:\s*'([^']+)'/)?.[1] ?? '';
    expect(plantilla).toBeTruthy();
    expect(plantilla.replace('%s', '').length, `sufijo demasiado largo: «${plantilla}»`).toBeLessThanOrEqual(16);
  });

  it('ninguna calculadora usa su pregunta como <title>', () => {
    const src = leer('app/(es)/calculadoras/[slug]/page.tsx');
    expect(src).toMatch(/title: calc\.tituloSeo/);
    expect(src).not.toMatch(/title: calc\.pregunta/);
  });
});

describe('el ajuste de metadatos: el complemento entra solo si cabe', () => {
  it('un título corto se lleva su explicación; uno largo se queda con el nombre', () => {
    // Truncar produce «Tipos electrostáticos de FIBC (A, B, C y…», que se lee
    // como un error del sitio. Aquí no hay nunca una frase partida.
    expect(tituloAjustado('HDPE', 'qué es y cómo se especifica')).toBe('HDPE: qué es y cómo se especifica');
    expect(tituloAjustado('Tipos electrostáticos de FIBC (A, B, C y D)', 'qué es y cómo se especifica')).toBe(
      'Tipos electrostáticos de FIBC (A, B, C y D)',
    );
    expect(tituloAjustado('Geotextil')).toBe('Geotextil');
  });

  it('el resultado cabe en el resultado de búsqueda siempre que la base quepa', () => {
    for (const base of ['HDPE', 'Geomembrana', 'Zanja de anclaje', 'Permitividad']) {
      const t = tituloAjustado(base, 'qué es y cómo se especifica');
      expect(tituloCabe(t), `«${t}» no cabe`).toBe(true);
    }
  });

  it('la descripción se arma con frases completas y para', () => {
    const d = descripcionAjustada([
      'Primera frase que siempre sobrevive.',
      'Segunda frase que cabe.',
      'Una tercera frase larguísima que ya no cabe de ninguna manera dentro del presupuesto disponible para la descripción.',
    ]);
    expect(d).toBe('Primera frase que siempre sobrevive. Segunda frase que cabe.');
    expect(d.endsWith('.')).toBe(true);
  });

  it('si ni la primera frase cabe, recorta por palabra y nunca parte una', () => {
    const d = descripcionAjustada(['Una frase muy larga que no cabe de ninguna manera'], 30);
    expect(d.length).toBeLessThanOrEqual(30);
    expect(d.endsWith('…')).toBe(true);
    expect(d).not.toMatch(/\s…$/);
  });

  it('ninguna ciudad vuelve a meter la marca en su propio título', () => {
    // La plantilla ya la añade: ponerla aquí producía la marca dos veces.
    const src = readFileSync(join(raiz, 'app/(es)/local/[ciudad]/page.tsx'), 'utf8');
    const meta = src.slice(src.indexOf('export async function generateMetadata'));
    const cuerpo = meta.slice(0, meta.indexOf('\n}'));
    expect(cuerpo.replace(/\/\/.*$/gm, '')).not.toMatch(/title = `[^`]*\$\{SITE\.name\}/);
  });

  it('los títulos autorales caben en el presupuesto', () => {
    // Llevaban un « | Perú» que, con la marca de la plantilla, daba dos
    // separadores seguidos y se comía siete caracteres del espacio útil.
    for (const a of articles) expect(tituloCabe(a.metaTitle), `recurso: ${a.metaTitle}`).toBe(true);
    for (const s of solutions) expect(tituloCabe(s.metaTitle), `solución: ${s.metaTitle}`).toBe(true);
    for (const n of novedades) expect(tituloCabe(n.titulo), `novedad: ${n.titulo}`).toBe(true);
  });
});
