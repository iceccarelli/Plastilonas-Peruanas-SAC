import { describe, it, expect } from 'vitest';
import { products } from '@/lib/products';
import { PERU_DEPARTMENTS } from '@/lib/peru';

describe('catálogo: integridad de datos', () => {
  it('todos los slugs son únicos', () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('todos los ids son únicos', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('un producto comprable SIEMPRE tiene precio numérico > 0 y unidad', () => {
    for (const p of products.filter((x) => x.purchasable)) {
      expect(typeof p.price).toBe('number');
      expect(p.price!).toBeGreaterThan(0);
      expect(p.priceUnit && p.priceUnit.length).toBeTruthy();
    }
  });

  it('los 3 SKUs estandarizados están marcados como comprables', () => {
    const purchasable = new Set(
      products.filter((p) => p.purchasable).map((p) => p.slug)
    );
    expect(purchasable.has('big-bags-bolsones-polipropileno')).toBe(true);
    expect(purchasable.has('mallas-antiafidas')).toBe(true);
    expect(purchasable.has('mulch-madera-picada')).toBe(true);
  });

  it('los productos a medida siguen siendo cotizar (no comprables)', () => {
    const custom = products.find((p) => p.slug === 'geomembranas-pvc');
    expect(custom?.purchasable).toBeFalsy();
  });
});

describe('Perú: departamentos', () => {
  it('hay 25 departamentos y son únicos', () => {
    expect(PERU_DEPARTMENTS).toHaveLength(25);
    expect(new Set(PERU_DEPARTMENTS).size).toBe(25);
  });

  it('incluye Lima, Cusco y Arequipa', () => {
    expect(PERU_DEPARTMENTS).toContain('Lima');
    expect(PERU_DEPARTMENTS).toContain('Cusco');
    expect(PERU_DEPARTMENTS).toContain('Arequipa');
  });
});
