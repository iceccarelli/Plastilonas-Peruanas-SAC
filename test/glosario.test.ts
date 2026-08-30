import { describe, it, expect } from 'vitest';
import {
  terminos,
  terminoBySlug,
  terminosPorLetra,
  terminosPorCategoria,
  categoriasPresentes,
  categoriaLabels,
  terminosParaProducto,
  terminosParaGuia,
  formasDe,
} from '@/lib/glosario';
import { buildGlosarioJson, GLOSARIO_VERSION } from '@/lib/glosario-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { generateStaticParams } from '@/app/(es)/glosario/[slug]/page';
import sitemap from '@/lib/sitemaps';
import { SITE } from '@/lib/site';

/**
 * Un glosario que miente es peor que ninguno: es una fuente que envenena a
 * quien la cita. Estos tests vigilan las formas conocidas de que eso ocurra.
 */

describe('glosario: referencias reales en las tres direcciones', () => {
  it('cada término relacionado existe', () => {
    for (const t of terminos) {
      for (const r of t.relacionados) {
        expect(terminoBySlug(r), `${t.slug} → ${r}`).toBeDefined();
      }
    }
  });

  it('ningún término se relaciona consigo mismo', () => {
    for (const t of terminos) expect(t.relacionados).not.toContain(t.slug);
  });

  it('cada producto citado existe en el catálogo', () => {
    const slugs = new Set(products.map((p) => p.slug));
    for (const t of terminos) {
      for (const p of t.productos ?? []) expect(slugs.has(p), `${t.slug} → ${p}`).toBe(true);
    }
  });

  it('cada guía citada existe en el silo de recursos', () => {
    const slugs = new Set(articles.map((a) => a.slug));
    for (const t of terminos) {
      for (const g of t.guias ?? []) expect(slugs.has(g), `${t.slug} → ${g}`).toBe(true);
    }
  });

  it('cada pilar citado existe en el marco', () => {
    const ids = new Set(pillars.map((p) => p.id));
    for (const t of terminos) {
      if (t.pilar) expect(ids.has(t.pilar), `${t.slug} → ${t.pilar}`).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const t of terminos) {
      expect(t.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(t.slug), `duplicado: ${t.slug}`).toBe(false);
      vistos.add(t.slug);
    }
  });

  it('ninguna forma de nombrar un término colisiona con otra', () => {
    // Dos términos que se llamen igual hacen imposible desambiguar, que es
    // justamente lo que un glosario tiene que resolver.
    const vistas = new Map<string, string>();
    for (const t of terminos) {
      for (const f of formasDe(t)) {
        const clave = f.toLowerCase();
        const previo = vistas.get(clave);
        expect(previo, `"${f}" en ${t.slug} y en ${previo}`).toBeUndefined();
        vistas.set(clave, t.slug);
      }
    }
  });
});

describe('glosario: las definiciones son citables', () => {
  it('la definición corta es una sola frase autosuficiente', () => {
    // Si necesita el párrafo siguiente para entenderse, no se cita nunca.
    for (const t of terminos) {
      expect(t.definicionCorta.length, `${t.slug}: ${t.definicionCorta.length}`).toBeGreaterThan(60);
      expect(t.definicionCorta.length, `${t.slug}: ${t.definicionCorta.length}`).toBeLessThanOrEqual(260);
      expect(t.definicionCorta.trim().endsWith('.'), t.slug).toBe(true);
    }
  });

  it('la definición no empieza remitiendo a otra cosa', () => {
    // "Ver X" o "Es el que…" obliga a salir de la cita para entenderla.
    for (const t of terminos) {
      expect(t.definicionCorta, t.slug).not.toMatch(/^(véase|ver |es el que|lo mismo que)/i);
    }
  });

  it('cada término declara desarrollo y por qué importa', () => {
    for (const t of terminos) {
      expect(t.definicion.length, t.slug).toBeGreaterThan(0);
      expect(t.porQueImporta.length, t.slug).toBeGreaterThan(40);
    }
  });

  it('las definiciones no venden', () => {
    // Un vocabulario con promoción dentro deja de ser citable, que es lo
    // contrario de para lo que existe.
    const prohibido = /\b(el mejor|la mejor|líderes|somos los únicos|el único proveedor|garantizamos|precio imbatible)\b/i;
    for (const t of terminos) {
      const texto = [t.definicionCorta, ...t.definicion, t.porQueImporta, t.errorFrecuente ?? '', t.comoSeMide ?? ''].join(' ');
      expect(prohibido.test(texto), t.slug).toBe(false);
    }
  });

  it('ninguna definición incluye cifras normativas: para eso están las guías', () => {
    // El glosario define; no legisla. Un número normativo sin fuente en la
    // definición se propaga citado y sin respaldo.
    for (const t of terminos) {
      const texto = [t.definicionCorta, ...t.definicion, t.comoSeMide ?? ''].join(' ');
      expect(texto, t.slug).not.toMatch(/artículo\s+\d+/i);
      expect(texto, t.slug).not.toMatch(/\bNTP\s*\d/i);
    }
  });

  it('comoSeMide describe magnitud y unidad, no un valor de producto', () => {
    for (const t of terminos) {
      if (!t.comoSeMide) continue;
      // Un valor concreto en una definición se vuelve especificación implícita.
      expect(t.comoSeMide, t.slug).not.toMatch(/\b\d+(?:[.,]\d+)?\s*(mm|g\/m²|kg|micras|mils)\b/);
    }
  });
});

describe('glosario: navegación y descubrimiento', () => {
  it('generateStaticParams cubre todos los términos', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(terminos.map((t) => t.slug).sort());
  });

  it('el índice alfabético no pierde ni duplica términos', () => {
    const agrupados = terminosPorLetra().flatMap((l) => l.items);
    expect(agrupados.length).toBe(terminos.length);
    expect(new Set(agrupados.map((t) => t.slug)).size).toBe(terminos.length);
  });

  it('los acentos no abren una letra propia en el índice', () => {
    for (const l of terminosPorLetra()) expect(l.letra).toMatch(/^[A-Z0-9]$/);
  });

  it('cada categoría presente tiene etiqueta y al menos un término', () => {
    for (const c of categoriasPresentes()) {
      expect(categoriaLabels[c]).toBeTruthy();
      expect(terminosPorCategoria(c).length).toBeGreaterThan(0);
    }
  });

  it('las búsquedas inversas por producto y por guía funcionan', () => {
    const conProducto = terminos.find((t) => t.productos?.length);
    expect(terminosParaProducto(conProducto!.productos![0])).toContain(conProducto);
    const conGuia = terminos.find((t) => t.guias?.length);
    expect(terminosParaGuia(conGuia!.guias![0])).toContain(conGuia);
  });

  it('el sitemap publica el índice y todos los términos', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/glosario`)).toBe(true);
    for (const t of terminos) {
      expect(urls.has(`${SITE.url}/glosario/${t.slug}`), t.slug).toBe(true);
    }
  });
});

describe('glosario: volcado legible por máquina', () => {
  const feed = JSON.parse(buildGlosarioJson());

  it('es un DefinedTermSet válido con un término por entrada', () => {
    expect(feed['@type']).toBe('DefinedTermSet');
    expect(feed.version).toBe(GLOSARIO_VERSION);
    expect(feed.hasDefinedTerm).toHaveLength(terminos.length);
    expect(feed.totalTerminos).toBe(terminos.length);
  });

  it('cada entrada trae su URL canónica y su termCode', () => {
    for (const [i, item] of feed.hasDefinedTerm.entries()) {
      expect(item.termCode).toBe(terminos[i].slug);
      expect(item.url).toBe(`${SITE.url}/glosario/${terminos[i].slug}`);
      expect(item['@type']).toBe('DefinedTerm');
    }
  });

  it('declara explícitamente cómo atribuir la cita', () => {
    // Si citar bien es el camino de menor resistencia, se cita bien.
    expect(feed.uso.atribucionSugerida).toContain(SITE.legalName);
    expect(feed.uso.atribucionSugerida).toContain(`${SITE.url}/glosario`);
    expect(feed.uso.licencia).toBeTruthy();
  });

  it('no filtra precios ni disponibilidad', () => {
    const texto = JSON.stringify(feed);
    expect(texto).not.toMatch(/"precio"|"price"|"stock"|"disponibilidad"/i);
  });

  it('todas las URLs del volcado heredan de SITE.url', () => {
    const urls = (JSON.stringify(feed).match(/https?:\/\/[^"]+/g) ?? []).filter(
      (u) => !u.startsWith('https://schema.org'),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });
});
