import { describe, it, expect } from 'vitest';
import { buildPageContext, findProductSnapshot, inferPageType } from '@/lib/ai/context';
import { products } from '@/lib/products';

describe('findProductSnapshot: recorte honesto contra el catálogo real', () => {
  it('resuelve un slug real con los mismos campos que el catálogo', () => {
    const real = products[0];
    const snap = findProductSnapshot(real.slug);
    expect(snap).toBeDefined();
    expect(snap!.name).toBe(real.name);
    expect(snap!.category).toBe(real.category);
    expect(snap!.url).toBe(`/productos/${real.slug}`);
  });

  it('un slug inexistente no produce un snapshot fabricado', () => {
    expect(findProductSnapshot('no-existe')).toBeUndefined();
    expect(findProductSnapshot(undefined)).toBeUndefined();
  });
});

describe('inferPageType: heurístico sobre rutas reales', () => {
  it('reconoce las secciones principales del sitio', () => {
    expect(inferPageType('/')).toBe('home');
    expect(inferPageType('/productos')).toBe('catalog');
    expect(inferPageType(`/productos/${products[0].slug}`)).toBe('product');
    expect(inferPageType('/calculadoras/geomembrana-poza')).toBe('calculator');
    expect(inferPageType('/cotizacion')).toBe('quote');
    expect(inferPageType('/glosario/geomembrana')).toBe('glossary');
    expect(inferPageType('/ruta-que-no-existe')).toBe('other');
  });
});

describe('buildPageContext', () => {
  it('resuelve product a partir del pathname cuando pageType es product', () => {
    const real = products[0];
    const ctx = buildPageContext({ pathname: `/productos/${real.slug}` });
    expect(ctx.pageType).toBe('product');
    expect(ctx.productSlug).toBe(real.slug);
    expect(ctx.product?.name).toBe(real.name);
  });

  it('language cae a "es" ante un valor no soportado', () => {
    const ctx = buildPageContext({ pathname: '/', language: 'fr' });
    expect(ctx.language).toBe('es');
  });

  it('genera un projectId cuando no se pasa uno', () => {
    const ctx = buildPageContext({ pathname: '/' });
    expect(typeof ctx.projectId).toBe('string');
    expect(ctx.projectId.length).toBeGreaterThan(0);
  });

  it('respeta un pageType explícito por encima del heurístico de pathname', () => {
    const ctx = buildPageContext({ pathname: '/productos', pageType: 'home' });
    expect(ctx.pageType).toBe('home');
  });
});
