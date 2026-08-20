import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  IGV_RATE, formatPEN, formatCents, toCents, withIgv, numeroPE, numeroConSigno,
} from '@/lib/format';

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

describe('formato numérico peruano sin depender de Intl', () => {
  it('usa coma decimal y espacio fino inquebrantable de millares', () => {
    // U+202F y no un espacio normal: un espacio corriente permite que
    // "2 769 794" se parta al final de una línea y se lea como dos cifras.
    expect(numeroPE(2769794)).toBe('2\u202f769\u202f794');
    expect(numeroPE(18.6)).toBe('18,6');
    expect(numeroPE(64071)).toBe('64\u202f071');
  });

  it('usa el signo menos tipográfico, no el guion', () => {
    // U+2212. Es lo correcto en una cifra y se alinea con los dígitos.
    expect(numeroPE(-0.7)).toBe('\u22120,7');
    expect(numeroPE(-0.7).startsWith('-')).toBe(false);
  });

  it('numeroConSigno antepone + solo a los positivos', () => {
    expect(numeroConSigno(18.6)).toBe('+18,6');
    expect(numeroConSigno(-0.7)).toBe('\u22120,7');
    expect(numeroConSigno(0)).toBe('0');
  });

  it('no delega en toLocaleString', () => {
    // El fallo que motivó esta función: con datos ICU reducidos,
    // toLocaleString('es-PE') devuelve en silencio el formato inglés y el
    // mismo código produce "-0.7" en un contenedor y "−0,7" en otro.
    const src = readFileSync(join(process.cwd(), 'lib/format.ts'), 'utf8');
    const impl = src.slice(src.indexOf('export function numeroPE'));
    expect(impl).not.toMatch(/toLocaleString/);
  });
});
