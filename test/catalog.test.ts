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

  // Reencuadre de disponibilidad: los 3 SKUs antes comprables en línea pasaron a
  // "solo cotización" (ver `// purchasable: true` comentado en lib/products.ts).
  // Este test refleja el estado DESPLEGADO. Si se reactiva la compra en línea,
  // restaurar `purchasable: true` en products.ts y volver a `.toBe(true)` aquí.
  it('los 3 SKUs estandarizados están en modo cotización (compra en línea desactivada)', () => {
    const purchasable = new Set(
      products.filter((p) => p.purchasable).map((p) => p.slug)
    );
    expect(purchasable.has('big-bags-bolsones-polipropileno')).toBe(false);
    expect(purchasable.has('mallas-antiafidas')).toBe(false);
    expect(purchasable.has('mulch-madera-picada')).toBe(false);
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
