import { describe, it, expect } from 'vitest';
import { products, productFamilies } from '@/lib/products';
import { familyContent, resolveFamily, familyHrefByName } from '@/lib/families';
import { articles } from '@/lib/articles';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

describe('páginas de familia: cobertura y consistencia', () => {
  it('existe contenido editorial para TODAS las familias del catálogo', () => {
    for (const f of productFamilies) {
      expect(familyContent.some((c) => c.slug === f.slug), f.slug).toBe(true);
    }
  });

  it('no hay contenido huérfano apuntando a familias inexistentes', () => {
    const slugs = new Set(productFamilies.map((f) => f.slug));
    for (const c of familyContent) expect(slugs.has(c.slug), c.slug).toBe(true);
  });

  it('cada familia tiene al menos un producto (una página vacía no debe indexarse)', () => {
    for (const f of productFamilies) {
      const n = products.filter((p) => p.category === f.name).length;
      expect(n, f.name).toBeGreaterThan(0);
    }
  });

  it('resolveFamily une taxonomía y contenido, y falla limpio', () => {
    const r = resolveFamily(productFamilies[0].slug);
    expect(r?.family.name).toBe(productFamilies[0].name);
    expect(resolveFamily('no-existe')).toBeNull();
  });

  it('familyHrefByName devuelve la URL estática, nunca el filtro por query', () => {
    for (const f of productFamilies) {
      expect(familyHrefByName(f.name)).toBe(`/productos/familia/${f.slug}`);
    }
    // Nombre desconocido cae al catálogo, no a una URL rota.
    expect(familyHrefByName('Familia Inventada')).toBe('/productos');
  });
});

describe('páginas de familia: contenido', () => {
  it('cada familia declara título, descripción, intro, criterios y FAQs', () => {
    for (const c of familyContent) {
      expect(c.h1.length, c.slug).toBeGreaterThan(20);
      expect(c.metaTitle.length, c.slug).toBeGreaterThan(20);
      expect(c.metaTitle.length, `${c.slug}: metaTitle demasiado largo`).toBeLessThan(75);
      expect(c.metaDescription.length, c.slug).toBeGreaterThan(80);
      // Google trunca alrededor de 160 caracteres: más allá es texto que nadie lee.
      expect(c.metaDescription.length, `${c.slug}: description larga`).toBeLessThan(175);
      expect(c.intro.length, c.slug).toBeGreaterThanOrEqual(2);
      expect(c.selectionCriteria.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it('los metaTitle son únicos: dos páginas no pueden competir por lo mismo', () => {
    const titles = familyContent.map((c) => c.metaTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('ninguna familia publica precios ni certificaciones propias', () => {
    for (const c of familyContent) {
      const texto = JSON.stringify(c);
      expect(texto, c.slug).not.toMatch(/S\/\s?\d/);
      expect(texto.toLowerCase(), c.slug).not.toContain('estamos certificados');
      expect(texto.toLowerCase(), c.slug).not.toContain('empresa certificada');
    }
  });

  it('cada artículo se ancla a una familia real del catálogo', () => {
    const names = new Set(productFamilies.map((f) => f.name));
    for (const a of articles) expect(names.has(a.category), a.slug).toBe(true);
  });
});

describe('páginas de familia: sitemap', () => {
  it('las 11 familias están en el sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    for (const c of familyContent) {
      expect(urls).toContain(`${SITE.url}/productos/familia/${c.slug}`);
    }
  });

  it('el sitemap sigue sin duplicados tras añadir las familias', () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
