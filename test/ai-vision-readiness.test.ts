import { describe, it, expect } from 'vitest';
import { deriveReadinessSignalFromVision } from '@/lib/ai/vision-readiness';
import type { AssistantResponse } from '@/lib/ai/schema';

/**
 * DECISIÓN DE LA TAREA 5: la foto NO alimenta el checklist "Mi proyecto".
 * Ver el comentario de cabecera de lib/ai/vision-readiness.ts para el porqué.
 * Esta prueba existe para que esa decisión quede PROBADA, no solo escrita en
 * un comentario: aunque una tarjeta de visión tenga una observación con
 * pinta de respuesta real, o una inferencia o un desconocido con pinta de
 * dato concreto, la función nunca debe convertir ninguno de los tres en una
 * señal de `ReadinessSignals`.
 */

function tarjeta(overrides: Partial<Extract<AssistantResponse, { type: 'visionObservation' }>> = {}) {
  return {
    type: 'visionObservation' as const,
    observed: ['Se ve una malla verde tejida, aparentemente para sombra o cobertura agrícola.'],
    inferences: ['Podría ser malla raschel, a confirmar.'],
    unknown: ['Densidad exacta del tejido.', 'Certificaciones.'],
    requiresConfirmation: ['Confirmar el uso real con el cliente.'],
    ...overrides,
  };
}

describe('deriveReadinessSignalFromVision — nunca marca un campo como conocido', () => {
  it('con una observación que menciona una aplicación reconocible, igual devuelve {}', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta());
    expect(resultado).toEqual({});
  });

  it('con una inferencia que parece un dato concreto de material, igual devuelve {}', () => {
    const resultado = deriveReadinessSignalFromVision(
      tarjeta({ inferences: ['Podría ser polietileno de alta densidad (HDPE), a confirmar.'] }),
    );
    expect(resultado).toEqual({});
    // Ninguna clave del objeto vacío puede haberse poblado desde "inferences".
    expect(Object.keys(resultado)).toHaveLength(0);
  });

  it('sin ninguna inferencia (arreglo vacío), sigue devolviendo {} — nunca infiere de "unknown" tampoco', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta({ inferences: [] }));
    expect(resultado).toEqual({});
  });

  it('el resultado nunca incluye producto/cantidad/ciudad/aplicacion/contacto', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta());
    expect(resultado.productName).toBeUndefined();
    expect(resultado.cantidad).toBeUndefined();
    expect(resultado.ciudad).toBeUndefined();
    expect(resultado.aplicacion).toBeUndefined();
    expect(resultado.nombre).toBeUndefined();
  });
});
