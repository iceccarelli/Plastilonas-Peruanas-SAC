import { describe, it, expect } from 'vitest';
import {
  rucValido,
  errorRuc,
  normalizarRuc,
  digitoVerificadorRuc,
  esPersonaJuridica,
} from '@/lib/ruc';
import { SITE } from '@/lib/site';

/**
 * La prueba que da autoridad al algoritmo: el RUC de la propia empresa.
 * Si alguien cambia los factores del módulo 11, esta prueba cae primero.
 */
describe('RUC — dígito verificador', () => {
  it('valida el RUC de la propia empresa', () => {
    expect(rucValido(SITE.ruc)).toBe(true);
    expect(esPersonaJuridica(SITE.ruc)).toBe(true);
  });

  it('rechaza el relleno que una expresión regular de 11 dígitos aceptaría', () => {
    // Estos son exactamente los números que un formulario con /^\d{11}$/ deja pasar.
    for (const basura of ['12345678901', '00000000000', '11111111111', '99999999999']) {
      expect(rucValido(basura)).toBe(false);
    }
  });

  it('rechaza prefijos que SUNAT no asigna', () => {
    // Se construye un número con dígito verificador correcto pero prefijo inválido.
    const cuerpo = '3052313538';
    const n = `${cuerpo}${digitoVerificadorRuc(cuerpo)}`;
    expect(n).toHaveLength(11);
    expect(rucValido(n)).toBe(false);
  });

  it('rechaza un solo dígito cambiado', () => {
    const d = SITE.ruc.split('');
    d[4] = String((Number(d[4]) + 1) % 10);
    expect(rucValido(d.join(''))).toBe(false);
  });

  it('acepta el número escrito con guiones o espacios', () => {
    expect(normalizarRuc(' 20-52313538 5 ')).toBe(SITE.ruc);
    expect(rucValido('20-52313538-5')).toBe(true);
  });

  it('no reclama cuando el campo está vacío: es opcional', () => {
    expect(errorRuc('')).toBeNull();
    expect(errorRuc('   ')).toBeNull();
  });

  it('explica qué corregir en vez de decir «inválido»', () => {
    expect(errorRuc('2052313')).toMatch(/11 dígitos/);
    expect(errorRuc('30523135385')).toMatch(/10, 15, 17 o 20/);
    expect(errorRuc('20523135380')).toMatch(/verificador/);
    expect(errorRuc(SITE.ruc)).toBeNull();
  });

  it('el dígito verificador siempre queda entre 0 y 9', () => {
    for (let i = 0; i < 400; i++) {
      const cuerpo = String(20_000_000_000 + i * 7919).slice(0, 10);
      const dv = digitoVerificadorRuc(cuerpo);
      expect(dv).toBeGreaterThanOrEqual(0);
      expect(dv).toBeLessThanOrEqual(9);
      expect(rucValido(`${cuerpo}${dv}`)).toBe(true);
    }
  });
});
