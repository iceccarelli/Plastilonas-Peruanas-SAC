import { describe, it, expect } from 'vitest';
import { products, productFamilies } from '@/lib/products';
import { COUNT_STATEMENT, FAMILY_COUNT, PRODUCT_COUNT, YEARS_OPERATING, YEARS_STATEMENT } from '@/lib/facts';
import { SITE } from '@/lib/site';

describe('hechos únicos — sin contradicciones de catálogo ni antigüedad', () => {
  it('PRODUCT_COUNT es products.length', () => {
    expect(PRODUCT_COUNT).toBe(products.length);
    expect(PRODUCT_COUNT).toBeGreaterThanOrEqual(36);
  });

  it('FAMILY_COUNT es productFamilies.length', () => {
    expect(FAMILY_COUNT).toBe(productFamilies.length);
    expect(FAMILY_COUNT).toBe(11);
  });

  it('el enunciado de conteo no hardcodea 34', () => {
    expect(COUNT_STATEMENT).toContain(String(PRODUCT_COUNT));
    expect(COUNT_STATEMENT).not.toMatch(/\b34\b/);
  });

  it('la antigüedad se deriva de 2009, no de eslóganes', () => {
    expect(SITE.foundingYear).toBe('2009');
    expect(YEARS_OPERATING).toBe(new Date().getFullYear() - 2009);
    expect(YEARS_STATEMENT).toBe('Fabricación en el Perú desde 2009');
    expect(YEARS_STATEMENT.toLowerCase()).not.toContain('más de 15');
  });
});
