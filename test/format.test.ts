import { describe, it, expect } from 'vitest';
import { IGV_RATE, formatPEN, formatCents, toCents, withIgv } from '@/lib/format';

describe('format: IGV y conversión de céntimos', () => {
  it('el IGV del Perú es 18%', () => {
    expect(IGV_RATE).toBe(0.18);
  });

  it('toCents convierte soles a céntimos enteros sin errores de coma flotante', () => {
    expect(toCents(45)).toBe(4500);
    expect(toCents(8.5)).toBe(850);
    expect(toCents(25)).toBe(2500);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 -> 30
  });

  it('withIgv desglosa subtotal en IGV(18%) y total', () => {
    expect(withIgv(10000)).toEqual({
      subtotalCents: 10000,
      igvCents: 1800,
      totalCents: 11800,
    });
  });

  it('withIgv redondea el IGV al céntimo', () => {
    // 4500 * 0.18 = 810 exacto
    expect(withIgv(4500).igvCents).toBe(810);
    // 850 * 0.18 = 153 exacto
    expect(withIgv(850).igvCents).toBe(153);
  });

  it('formatPEN produce moneda peruana', () => {
    const s = formatPEN(45);
    expect(s).toContain('45.00');
    expect(s).toMatch(/S\/|PEN/); // símbolo local del Perú
  });

  it('formatCents formatea desde céntimos', () => {
    expect(formatCents(11800)).toContain('118.00');
  });
});
