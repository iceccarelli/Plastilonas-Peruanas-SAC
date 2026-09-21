import { describe, it, expect } from 'vitest';
import { buildReadinessChecklist, isReadyToQuote, type ReadinessSignals } from '@/lib/ai/readiness';

/**
 * CHECKLIST DETERMINISTA, NO UN PUNTAJE.
 *
 * Cada prueba da señales estructuradas concretas (las mismas formas que
 * `buildRFQ`/`getApplication` ya devuelven) y comprueba qué campos quedan
 * conocidos — nunca a partir de adivinar texto libre.
 */

const SIN_SEÑALES: ReadinessSignals = {};

describe('buildReadinessChecklist', () => {
  it('sin ninguna señal real, los cinco campos quedan desconocidos', () => {
    const campos = buildReadinessChecklist(SIN_SEÑALES);
    expect(campos).toHaveLength(5);
    expect(campos.every((c) => c.known === false)).toBe(true);
    expect(isReadyToQuote(campos)).toBe(false);
  });

  it('producto conocido solo cuando hay un nombre real (de buildRFQ, getProduct o PageContext)', () => {
    const campos = buildReadinessChecklist({ productName: 'Malla antiáfida' });
    const producto = campos.find((c) => c.id === 'producto')!;
    expect(producto.known).toBe(true);
    expect(producto.detail).toBe('Malla antiáfida');
  });

  it('cantidad conocida solo con el campo cantidad de buildRFQ', () => {
    const campos = buildReadinessChecklist({ cantidad: '500 m2' });
    const cantidad = campos.find((c) => c.id === 'cantidad')!;
    expect(cantidad.known).toBe(true);
    expect(cantidad.detail).toBe('500 m2');
  });

  it('ciudad queda desconocida mientras el usuario no la haya dado (no se infiere de otras señales)', () => {
    const campos = buildReadinessChecklist({
      productName: 'Big bag',
      cantidad: '200 unidades',
      nombre: 'Juan Pérez',
      telefono: '+51999999999',
    });
    const ciudad = campos.find((c) => c.id === 'ciudad')!;
    expect(ciudad.known).toBe(false);
    expect(isReadyToQuote(campos)).toBe(false);
  });

  it('ciudad conocida solo con el campo ciudad de buildRFQ, nunca adivinada del resto', () => {
    const campos = buildReadinessChecklist({ ciudad: 'Arequipa' });
    const ciudad = campos.find((c) => c.id === 'ciudad')!;
    expect(ciudad.known).toBe(true);
    expect(ciudad.detail).toBe('Arequipa');
  });

  it('aplicación conocida solo cuando getApplication encontró un hub real', () => {
    const campos = buildReadinessChecklist({ aplicacion: 'Cobertura de acopio' });
    const aplicacion = campos.find((c) => c.id === 'aplicacion')!;
    expect(aplicacion.known).toBe(true);
  });

  it('contacto requiere nombre Y (teléfono o email) — ninguno solo no basta', () => {
    expect(buildReadinessChecklist({ nombre: 'Ana' }).find((c) => c.id === 'contacto')!.known).toBe(false);
    expect(
      buildReadinessChecklist({ telefono: '+51999999999' }).find((c) => c.id === 'contacto')!.known,
    ).toBe(false);
    expect(
      buildReadinessChecklist({ nombre: 'Ana', email: 'ana@example.com' }).find((c) => c.id === 'contacto')!.known,
    ).toBe(true);
    expect(
      buildReadinessChecklist({ nombre: 'Ana', telefono: '+51999999999' }).find((c) => c.id === 'contacto')!.known,
    ).toBe(true);
  });

  it('isReadyToQuote es true solo cuando los cinco campos son conocidos', () => {
    const casiCompleto = buildReadinessChecklist({
      productName: 'Malla antiáfida',
      cantidad: '500 m2',
      aplicacion: 'Cultivo protegido',
      nombre: 'Ana',
      email: 'ana@example.com',
    });
    expect(isReadyToQuote(casiCompleto)).toBe(false); // falta ciudad

    const completo = buildReadinessChecklist({
      productName: 'Malla antiáfida',
      cantidad: '500 m2',
      ciudad: 'Trujillo',
      aplicacion: 'Cultivo protegido',
      nombre: 'Ana',
      email: 'ana@example.com',
    });
    expect(isReadyToQuote(completo)).toBe(true);
  });

  it('cada campo desconocido trae una pregunta concreta y no vacía', () => {
    const campos = buildReadinessChecklist(SIN_SEÑALES);
    for (const c of campos) {
      expect(c.question.trim().length).toBeGreaterThan(0);
      expect(c.question.endsWith('?')).toBe(true);
    }
  });
});
