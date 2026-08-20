import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildGuiaPdf } from '@/lib/doc-guia';
import { buildArquitecturaPdf } from '@/lib/doc-arquitectura';
import { buildGlosarioPdf } from '@/lib/doc-glosario';
import { buildMarcoPdf } from '@/lib/doc-marco';
import { buildCatalogoJson, CATALOGO_VERSION } from '@/lib/catalogo-feed';
import { grupos, todasLasDescargas, formatoLabels } from '@/lib/descargas';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { products } from '@/lib/products';
import { terminos } from '@/lib/glosario';
import { SITE } from '@/lib/site';
import sitemap from '@/app/sitemap';

/**
 * Un documento que no abre, o que promete algo que la fuente no dice, es peor
 * que no publicarlo: circula dentro de la empresa del cliente cuando nosotros
 * ya no estamos para corregirlo.
 */

const FECHA = '2026-08-20';

describe('documentos PDF: se generan y abren', () => {
  it('genera un PDF válido para CADA guía técnica', async () => {
    for (const a of articles) {
      const bytes = await buildGuiaPdf(a, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), a.slug).toBeGreaterThan(0);
      expect(doc.getTitle(), a.slug).toContain(SITE.name);
    }
  }, 30000);

  it('genera un PDF válido para CADA arquitectura de referencia', async () => {
    for (const s of solutions) {
      const bytes = await buildArquitecturaPdf(s, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), s.slug).toBeGreaterThan(0);
    }
  }, 30000);

  it('genera el glosario y el marco completos', async () => {
    const glosario = await PDFDocument.load(await buildGlosarioPdf(FECHA));
    const marco = await PDFDocument.load(await buildMarcoPdf(FECHA));
    // Documentos largos: si salieran de una página, algo se perdió por el camino.
    expect(glosario.getPageCount()).toBeGreaterThan(3);
    expect(marco.getPageCount()).toBeGreaterThan(3);
  }, 30000);

  it('la generación es determinista: misma entrada, mismos bytes', async () => {
    // La fecha se inyecta justamente para esto. Si el PDF cambiara en cada
    // build, las cachés y los hashes dejarían de servir para nada.
    const a = await buildGuiaPdf(articles[0], FECHA);
    const b = await buildGuiaPdf(articles[0], FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  }, 20000);

  it('el motor de PDF vive en un solo lugar', () => {
    // Cuatro maquetadores copiados divergen: cuatro cabeceras distintas y
    // cuatro sitios donde corregir el RUC.
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts', 'lib/datasheet.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).toMatch(/from '\.\/pdf-kit'/);
      expect(src, f).not.toMatch(/from ['"]pdf-lib['"]/);
    }
  });

  it('ningún documento inventa precio ni certificación', () => {
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).not.toMatch(/S\/\s*\d|USD\s*\d|precio de \d/i);
      expect(src, f).not.toMatch(/certificad[oa]s? (ISO|bajo la norma)/i);
    }
  });
});

describe('catálogo en formato de datos', () => {
  const feed = JSON.parse(buildCatalogoJson());

  it('publica todas las líneas del catálogo', () => {
    expect(feed['@type']).toBe('DataCatalog');
    expect(feed.version).toBe(CATALOGO_VERSION);
    expect(feed.dataset).toHaveLength(products.length);
    expect(feed.totalProductos).toBe(products.length);
  });

  it('cada producto trae URL canónica y ficha en PDF', () => {
    for (const [i, item] of feed.dataset.entries()) {
      expect(item.slug).toBe(products[i].slug);
      expect(item.url).toBe(`${SITE.url}/productos/${products[i].slug}`);
      expect(item.fichaTecnicaPdf).toBe(
        `${SITE.url}/productos/${products[i].slug}/ficha-tecnica.pdf`,
      );
    }
  });

  it('NO publica precios ni existencias', () => {
    // Un precio en datos abiertos que la cotización no sostiene es la forma
    // más rápida de perder credibilidad ante un comprador y ante un modelo.
    const texto = JSON.stringify(feed.dataset);
    expect(texto).not.toMatch(/"precio"|"price"|"offers"|"stock"|"existencias"/i);
    expect(feed.uso.sinPrecios).toBeTruthy();
  });

  it('declara cómo atribuir la cita y cómo cotizar', () => {
    expect(feed.uso.atribucionSugerida).toContain(SITE.ruc);
    expect(feed.uso.comoCotizar).toContain(SITE.phoneWhatsApp);
    expect(feed.uso.datosParaCotizar.length).toBeGreaterThan(3);
  });

  it('todas las URLs heredan de SITE.url', () => {
    const urls = (JSON.stringify(feed).match(/https?:\/\/[^"]+/g) ?? []).filter(
      (u) => !u.startsWith('https://schema.org'),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });
});

describe('centro de documentación', () => {
  const items = todasLasDescargas();

  it('cada descarga apunta a una ruta interna con formato declarado', () => {
    for (const d of items) {
      expect(d.href.startsWith('/'), d.titulo).toBe(true);
      expect(formatoLabels[d.formato], d.titulo).toBeTruthy();
      expect(d.volumen.length, d.titulo).toBeGreaterThan(0);
      expect(d.paraQuien.length, d.titulo).toBeGreaterThan(20);
    }
  });

  it('los volúmenes se derivan de las fuentes y no están escritos a mano', () => {
    // Un inventario a mano miente en cuanto se agrega un producto.
    const src = readFileSync(join(process.cwd(), 'lib/descargas.ts'), 'utf8');
    expect(src).toMatch(/\$\{products\.length\}/);
    expect(src).toMatch(/\$\{articles\.length\}/);
    expect(src).toMatch(/\$\{terminos\.length\}/);
    expect(src).toMatch(/\$\{solutions\.length\}/);
  });

  it('los conteos publicados coinciden con las fuentes reales', () => {
    const texto = items.map((d) => d.volumen).join(' ');
    expect(texto).toContain(`${products.length} fichas`);
    expect(texto).toContain(`${articles.length} guías`);
    expect(texto).toContain(`${terminos.length} términos`);
    expect(texto).toContain(`${solutions.length} configuraciones`);
  });

  it('no hay href duplicados entre grupos', () => {
    const hrefs = items.map((d) => d.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('declara los dos grupos: documentos y datos', () => {
    expect(grupos().map((g) => g.id)).toEqual(['documentos', 'datos']);
    for (const g of grupos()) expect(g.items.length).toBeGreaterThan(0);
  });

  it('el sitemap publica el centro de documentación', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/descargas`)).toBe(true);
  });
});

describe('404 útil', () => {
  const src = readFileSync(join(process.cwd(), 'app/not-found.tsx'), 'utf8');
  /**
   * Se asevera sobre el CÓDIGO, no sobre los comentarios: el comentario que
   * documenta el fallo original cita literalmente el texto que el test
   * prohíbe. Aseverar sobre prosa hace fallar al archivo por explicarse bien.
   */
  const codigo = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('existe una página propia y no el 404 en inglés de Next', () => {
    expect(codigo).toMatch(/Esta página no existe/);
    expect(codigo).not.toMatch(/This page could not be found/);
  });

  it('no se indexa pero sí deja seguir los enlaces', () => {
    expect(src).toMatch(/index: false/);
    expect(src).toMatch(/follow: true/);
  });

  it('ofrece salidas con conteos reales, no un callejón sin salida', () => {
    for (const destino of ['/productos', '/glosario', '/recursos', '/soluciones', '/descargas']) {
      expect(codigo, destino).toContain(`'${destino}'`);
    }
    expect(codigo).toMatch(/products\.length|terminos\.length/);
  });
});
