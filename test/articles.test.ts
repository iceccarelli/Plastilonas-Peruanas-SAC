import { describe, it, expect } from 'vitest';
import { articles, articleBySlug, articleUrl } from '@/lib/articles';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';
import { articleSchema, howToSchema } from '@/lib/schema';

const CITY_SLUGS = new Set((ciudades as { slug: string }[]).map((c) => c.slug));
const PRODUCT_SLUGS = new Set(products.map((p) => p.slug));

describe('silo /recursos: integridad', () => {
  it('los slugs son únicos y válidos para URL', () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('cada relatedProducts apunta a un producto que existe', () => {
    for (const a of articles) {
      for (const slug of a.relatedProducts) {
        expect(PRODUCT_SLUGS.has(slug), `${a.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it('cada relatedCities apunta a una ciudad que existe', () => {
    for (const a of articles) {
      for (const slug of a.relatedCities ?? []) {
        expect(CITY_SLUGS.has(slug), `${a.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it('las fechas son ISO y dateModified nunca es anterior a datePublished', () => {
    for (const a of articles) {
      expect(a.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(a.dateModified) >= new Date(a.datePublished)).toBe(true);
    }
  });

  it('todo artículo tiene resumen, secciones y al menos 3 FAQs', () => {
    for (const a of articles) {
      expect(a.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(a.sections.length).toBeGreaterThanOrEqual(3);
      expect(a.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('cada sección aporta contenido real (no solo un encabezado)', () => {
    for (const a of articles) {
      for (const s of a.sections) {
        const tieneContenido =
          (s.body?.length ?? 0) + (s.list?.length ?? 0) + (s.steps?.length ?? 0) > 0 ||
          Boolean(s.table);
        expect(tieneContenido, `${a.slug} → ${s.heading}`).toBe(true);
      }
    }
  });

  it('las tablas tienen todas las filas del ancho de su cabecera', () => {
    for (const a of articles) {
      for (const s of a.sections) {
        if (!s.table) continue;
        for (const row of s.table.rows) {
          expect(row.length, `${a.slug} → ${s.heading}`).toBe(s.table.headers.length);
        }
      }
    }
  });
});

describe('silo /recursos: honestidad editorial', () => {
  it('todo artículo cita al menos una fuente con URL absoluta', () => {
    for (const a of articles) {
      expect(a.sources.length, a.slug).toBeGreaterThanOrEqual(1);
      for (const s of a.sources) {
        expect(() => new URL(s.url)).not.toThrow();
        expect(s.url.startsWith('https://')).toBe(true);
        // Cada fuente declara QUÉ dato respalda: una URL suelta no es una cita.
        expect(s.supports.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it('ningún artículo publica precios ni promete plazos comerciales', () => {
    for (const a of articles) {
      const texto = JSON.stringify(a);
      expect(texto, a.slug).not.toMatch(/S\/\s?\d/);
      expect(texto, a.slug).not.toMatch(/US\$\s?\d/);
    }
  });

  it('ningún artículo se atribuye certificaciones propias', () => {
    for (const a of articles) {
      const texto = JSON.stringify(a).toLowerCase();
      expect(texto, a.slug).not.toContain('estamos certificados');
      expect(texto, a.slug).not.toContain('somos certificados');
      expect(texto, a.slug).not.toContain('empresa certificada');
    }
  });

  it('los pasos de HowTo son accionables, no titulares', () => {
    for (const a of articles.filter((x) => x.howTo)) {
      for (const step of a.howTo!.steps) {
        expect(step.name.trim().length, a.slug).toBeGreaterThan(10);
        expect(step.text.trim().length, a.slug).toBeGreaterThan(60);
      }
    }
  });
});

describe('silo /recursos: schema y sitemap', () => {
  it('TechArticle se ancla al WebPage de su propia URL', () => {
    const a = articles[0];
    const node = articleSchema({
      url: articleUrl(a.slug),
      headline: a.title,
      description: a.description,
      datePublished: a.datePublished,
      dateModified: a.dateModified,
      section: a.category,
    });
    expect(node['@id']).toBe(`${articleUrl(a.slug)}#article`);
    expect(node.mainEntityOfPage).toEqual({ '@id': `${articleUrl(a.slug)}#webpage` });
  });

  it('HowTo numera sus pasos desde 1 y les da URL con ancla', () => {
    const a = articles.find((x) => x.howTo)!;
    const node = howToSchema({
      url: articleUrl(a.slug),
      name: a.howTo!.name,
      description: a.description,
      steps: a.howTo!.steps,
    });
    const steps = node.step as { position: number; url: string }[];
    expect(steps[0].position).toBe(1);
    expect(steps[0].url).toBe(`${articleUrl(a.slug)}#paso-1`);
  });

  it('el sitemap lista el hub y cada artículo', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/recursos`);
    for (const a of articles) expect(urls).toContain(`${SITE.url}/recursos/${a.slug}`);
  });

  it('el sitemap usa la fecha real del artículo, no la del deploy', () => {
    const entry = sitemap().find((e) => e.url === articleUrl(articles[0].slug));
    expect(new Date(entry!.lastModified as Date).toISOString().slice(0, 10)).toBe(
      articles[0].dateModified,
    );
  });

  it('articleBySlug resuelve y falla limpio', () => {
    expect(articleBySlug(articles[0].slug)?.title).toBe(articles[0].title);
    expect(articleBySlug('no-existe')).toBeUndefined();
  });
});
