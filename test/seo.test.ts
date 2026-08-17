import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';
import { products } from '@/lib/products';
import { productFaqs } from '@/lib/product-faq';
import {
  BUSINESS_ID,
  ORGANIZATION_ID,
  WEBSITE_ID,
  businessRef,
  localBusinessSchema,
  faqSchema,
  itemListSchema,
  serviceSchema,
  webPageSchema,
} from '@/lib/schema';
import ciudades from '@/data/ciudades.json';

const OLD_DOMAIN = 'www.plastilonas.com';

describe('SITE: fuente única de verdad del dominio', () => {
  it('SITE.url no termina en barra (rompería toda concatenación)', () => {
    expect(SITE.url.endsWith('/')).toBe(false);
  });

  it('SITE.url es https absoluto', () => {
    expect(() => new URL(SITE.url)).not.toThrow();
    expect(SITE.url.startsWith('https://')).toBe(true);
  });

  it('sameAs solo contiene URLs absolutas (nunca perfiles inventados vacíos)', () => {
    for (const url of SITE.sameAs) {
      expect(() => new URL(url)).not.toThrow();
    }
  });
});

describe('robots.txt', () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it('sitemap y host derivan de SITE.url', () => {
    expect(r.sitemap).toBe(`${SITE.url}/sitemap.xml`);
    expect(r.host).toBe(SITE.url);
  });

  it('los crawlers de IA que importan están permitidos explícitamente', () => {
    const agents = rules.map((rule) => rule.userAgent);
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
      expect(agents).toContain(bot);
    }
  });

  it('NINGÚN agente —ni los de IA— puede rastrear rutas privadas', () => {
    for (const rule of rules) {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      for (const priv of ['/dashboard', '/login', '/api/', '/carrito', '/checkout']) {
        expect(disallow).toContain(priv);
      }
    }
  });
});

describe('sitemap.xml', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it('no hay URLs duplicadas', () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('todas las URLs cuelgan de SITE.url', () => {
    for (const url of urls) expect(url.startsWith(SITE.url)).toBe(true);
  });

  it('ninguna URL apunta al dominio antiguo', () => {
    for (const url of urls) expect(url).not.toContain(OLD_DOMAIN);
  });

  it('cada producto y cada ciudad tienen entrada', () => {
    for (const p of products) expect(urls).toContain(`${SITE.url}/productos/${p.slug}`);
    for (const c of ciudades as { slug: string }[]) {
      expect(urls).toContain(`${SITE.url}/local/${c.slug}`);
    }
  });

  it('el hub /local está listado (su página existe y el breadcrumb apunta ahí)', () => {
    expect(urls).toContain(`${SITE.url}/local`);
  });
});

describe('grafo de entidad JSON-LD', () => {
  it('los @id canónicos derivan de SITE.url', () => {
    expect(BUSINESS_ID).toBe(`${SITE.url}/#business`);
    expect(ORGANIZATION_ID).toBe(`${SITE.url}/#organization`);
    expect(WEBSITE_ID).toBe(`${SITE.url}/#website`);
  });

  it('localBusinessSchema() ya NO redeclara el nodo: solo lo referencia', () => {
    const node = localBusinessSchema();
    expect(node).toEqual(businessRef());
    expect(node['@type']).toBeUndefined();
  });

  it('las páginas internas se anclan al WebSite y a la empresa', () => {
    const page = webPageSchema({ url: `${SITE.url}/local`, name: 'Cobertura' });
    expect(page.isPartOf).toEqual({ '@id': WEBSITE_ID });
    expect(page.about).toEqual({ '@id': BUSINESS_ID });
  });

  it('Service declara la ciudad como areaServed y la empresa como provider', () => {
    const s = serviceSchema({
      name: 'x', description: 'y', url: `${SITE.url}/local/lima`,
      cityName: 'Lima', regionName: 'Lima',
    });
    expect(s.provider).toEqual({ '@id': BUSINESS_ID });
    expect((s.areaServed as Record<string, unknown>)['@type']).toBe('City');
  });

  it('ItemList cuenta correctamente sus elementos', () => {
    const list = itemListSchema({
      url: `${SITE.url}/productos`, name: 'Catálogo',
      items: products.map((p) => ({ name: p.name, url: `${SITE.url}/productos/${p.slug}` })),
    });
    expect(list.numberOfItems).toBe(products.length);
  });

  it('FAQPage nunca se emite vacío', () => {
    const f = faqSchema(productFaqs(products[0]), `${SITE.url}/productos/${products[0].slug}`);
    expect((f.mainEntity as unknown[]).length).toBeGreaterThan(0);
  });
});

describe('FAQs de producto: honestidad estructural', () => {
  it('todo producto genera al menos 3 preguntas', () => {
    for (const p of products) expect(productFaqs(p).length).toBeGreaterThanOrEqual(3);
  });

  it('las preguntas no se repiten dentro de un producto', () => {
    for (const p of products) {
      const qs = productFaqs(p).map((f) => f.q);
      expect(new Set(qs).size).toBe(qs.length);
    }
  });

  it('NUNCA se declara un precio si el producto no tiene precio real', () => {
    for (const p of products) {
      if (p.price != null && p.purchasable) continue;
      for (const f of productFaqs(p)) expect(f.a).not.toMatch(/S\/\s?\d/);
    }
  });

  it('no se afirma plazo de entrega si el catálogo no lo declara', () => {
    for (const p of products.filter((x) => !x.leadTime)) {
      for (const f of productFaqs(p)) expect(f.q).not.toContain('plazo de entrega');
    }
  });

  it('no se afirma documentación si el catálogo no la declara', () => {
    for (const p of products.filter((x) => !x.documentation)) {
      for (const f of productFaqs(p)) expect(f.q).not.toContain('ficha técnica o certificado');
    }
  });

  it('ninguna respuesta queda vacía o truncada', () => {
    for (const p of products) {
      for (const f of productFaqs(p)) {
        expect(f.a.trim().length).toBeGreaterThan(20);
        expect(f.q.trim().length).toBeGreaterThan(10);
      }
    }
  });
});
