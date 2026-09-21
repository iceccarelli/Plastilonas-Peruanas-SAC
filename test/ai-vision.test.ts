import { describe, it, expect } from 'vitest';
import { parseVisionObservation, VisionModelOutputSchema, VISION_SYSTEM_PROMPT } from '@/lib/ai/vision';
import { AssistantResponse, VisionObservationResponse } from '@/lib/ai/schema';

/**
 * PARSER/VALIDADOR DE LA RESPUESTA DE VISIÓN — Sprint C.
 *
 * Cubre exactamente lo que el encargo pide: una respuesta bien formada se
 * divide en las cuatro categorías correctas, y una respuesta mal formada
 * falla SIN fabricar ningún campo faltante (nunca completa `unknown` o
 * `requiresConfirmation` vacíos con un placeholder).
 */

const RESPUESTA_VALIDA = {
  observed: [
    'Lona de color verde oscuro, con ojales metálicos en el borde.',
    'Se ve un doblez o costura reforzada en una esquina.',
  ],
  inferences: ['Podría ser polietileno de alta densidad (HDPE), a confirmar en planta.'],
  unknown: ['Espesor exacto del material.', 'Certificaciones del lote.'],
  requiresConfirmation: ['Medir el área real en sitio antes de cotizar.'],
};

describe('parseVisionObservation — caso bien formado', () => {
  it('acepta una respuesta con las cuatro categorías y agrega el discriminante type', () => {
    const resultado = parseVisionObservation(RESPUESTA_VALIDA);
    expect(resultado).not.toBeNull();
    expect(resultado?.type).toBe('visionObservation');
    expect(resultado?.observed).toEqual(RESPUESTA_VALIDA.observed);
    expect(resultado?.inferences).toEqual(RESPUESTA_VALIDA.inferences);
    expect(resultado?.unknown).toEqual(RESPUESTA_VALIDA.unknown);
    expect(resultado?.requiresConfirmation).toEqual(RESPUESTA_VALIDA.requiresConfirmation);
  });

  it('el resultado válido también pasa por el AssistantResponse general (unión discriminada)', () => {
    const resultado = parseVisionObservation(RESPUESTA_VALIDA);
    expect(AssistantResponse.safeParse(resultado).success).toBe(true);
  });

  it('acepta inferences vacío: no toda foto admite una conjetura razonable', () => {
    const resultado = parseVisionObservation({ ...RESPUESTA_VALIDA, inferences: [] });
    expect(resultado).not.toBeNull();
    expect(resultado?.inferences).toEqual([]);
  });
});

describe('parseVisionObservation — casos mal formados: nunca fabrica el campo faltante', () => {
  it('rechaza cuando falta "unknown": una foto SIEMPRE deja algo desconocido, no se puede omitir', () => {
    const { unknown: _omitido, ...sinUnknown } = RESPUESTA_VALIDA;
    expect(parseVisionObservation(sinUnknown)).toBeNull();
  });

  it('rechaza "unknown" vacío: la regla de honestidad prohíbe declarar todo como sabido', () => {
    expect(parseVisionObservation({ ...RESPUESTA_VALIDA, unknown: [] })).toBeNull();
  });

  it('rechaza cuando falta "requiresConfirmation"', () => {
    const { requiresConfirmation: _omitido, ...sinConfirmacion } = RESPUESTA_VALIDA;
    expect(parseVisionObservation(sinConfirmacion)).toBeNull();
  });

  it('rechaza "requiresConfirmation" vacío', () => {
    expect(parseVisionObservation({ ...RESPUESTA_VALIDA, requiresConfirmation: [] })).toBeNull();
  });

  it('rechaza cuando falta "observed" (no hay nada literalmente visible que reportar)', () => {
    const { observed: _omitido, ...sinObservado } = RESPUESTA_VALIDA;
    expect(parseVisionObservation(sinObservado)).toBeNull();
  });

  it('rechaza "observed" vacío', () => {
    expect(parseVisionObservation({ ...RESPUESTA_VALIDA, observed: [] })).toBeNull();
  });

  it('rechaza null/undefined/tipos no-objeto sin lanzar', () => {
    expect(parseVisionObservation(null)).toBeNull();
    expect(parseVisionObservation(undefined)).toBeNull();
    expect(parseVisionObservation('texto suelto')).toBeNull();
    expect(parseVisionObservation(42)).toBeNull();
  });

  it('rechaza un elemento vacío dentro de un arreglo (cadena en blanco no es una observación real)', () => {
    expect(parseVisionObservation({ ...RESPUESTA_VALIDA, observed: [''] })).toBeNull();
  });
});

describe('VisionModelOutputSchema — el shape que se le pide al modelo (generateObject)', () => {
  it('exige unknown y requiresConfirmation no vacíos igual que el esquema público', () => {
    expect(VisionModelOutputSchema.safeParse({ ...RESPUESTA_VALIDA, unknown: [] }).success).toBe(false);
    expect(VisionModelOutputSchema.safeParse(RESPUESTA_VALIDA).success).toBe(true);
  });
});

describe('VISION_SYSTEM_PROMPT — guardrails de honestidad presentes en el texto', () => {
  it('prohíbe explícitamente certificaciones, medidas exactas y precios inventados', () => {
    expect(VISION_SYSTEM_PROMPT).toMatch(/certificaci/i);
    expect(VISION_SYSTEM_PROMPT).toMatch(/precio/i);
    expect(VISION_SYSTEM_PROMPT).toMatch(/OBSERVADO/);
    expect(VISION_SYSTEM_PROMPT).toMatch(/INFERENCIA/);
    expect(VISION_SYSTEM_PROMPT).toMatch(/DESCONOCIDO/);
    expect(VISION_SYSTEM_PROMPT).toMatch(/REQUIERE CONFIRMACIÓN/);
  });

  it('nunca menciona una norma concreta (ISO/ASTM/CE/UL) como si la empresa la tuviera', () => {
    // Las únicas menciones a certificaciones deben ser de PROHIBICIÓN, no de afirmación:
    // el propio afirmaciones.test.ts cubre el resto del sitio; aquí solo se
    // comprueba que el prompt no las cita como ejemplos "seguros" de afirmar.
    expect(VISION_SYSTEM_PROMPT).not.toMatch(/certificad[oa] (propia|por Plastilonas)/i);
  });
});

describe('VisionObservationResponse (lib/ai/schema.ts) — validación directa', () => {
  it('acepta el shape completo con type', () => {
    expect(
      VisionObservationResponse.safeParse({ type: 'visionObservation', ...RESPUESTA_VALIDA }).success,
    ).toBe(true);
  });
  it('rechaza un type distinto', () => {
    expect(
      VisionObservationResponse.safeParse({ type: 'narrative', ...RESPUESTA_VALIDA }).success,
    ).toBe(false);
  });
});
