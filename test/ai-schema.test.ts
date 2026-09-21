import { describe, it, expect } from 'vitest';
import { AssistantResponse } from '@/lib/ai/schema';

/**
 * `AssistantResponse` es la unión discriminada que tipa lo que una superficie
 * estructurada (Fase 2/3) podría pedir al modelo o validar de una tool. Estas
 * pruebas cubren un caso válido y uno inválido por variante, más el corte
 * "no hay más variantes de las que las tools pueden alimentar" (regresión
 * contra agregar un shape sin datos reales detrás).
 */

describe('AssistantResponse: narrative', () => {
  it('acepta texto no vacío', () => {
    expect(AssistantResponse.safeParse({ type: 'narrative', text: 'Hola' }).success).toBe(true);
  });
  it('rechaza texto vacío', () => {
    expect(AssistantResponse.safeParse({ type: 'narrative', text: '' }).success).toBe(false);
  });
});

describe('AssistantResponse: recommendation', () => {
  const base = {
    type: 'recommendation' as const,
    productSlug: 'mallas-antiafidas',
    productName: 'Mallas Antiáfidas',
    url: '/productos/mallas-antiafidas',
    reason: 'Protege el cultivo de insectos plaga.',
  };
  it('acepta una recomendación con ruta interna', () => {
    expect(AssistantResponse.safeParse(base).success).toBe(true);
  });
  it('rechaza una URL que no es una ruta del sitio', () => {
    expect(
      AssistantResponse.safeParse({ ...base, url: 'https://otro-sitio.com/x' }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: product', () => {
  it('acepta availability real', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'product',
        slug: 'big-bags-bolsones-polipropileno',
        name: 'Big Bags',
        url: '/productos/big-bags-bolsones-polipropileno',
        summary: 'Contenedores flexibles.',
        availability: 'a_medida',
      }).success,
    ).toBe(true);
  });
  it('rechaza un valor de availability inventado', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'product',
        slug: 'x',
        name: 'X',
        url: '/productos/x',
        summary: 'x',
        availability: 'entrega-inmediata-mundial',
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: comparison', () => {
  it('exige al menos 2 productos', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'comparison',
        products: [{ slug: 'a', name: 'A', url: '/productos/a' }],
        criteria: [{ label: 'Material', values: { a: 'PVC' } }],
      }).success,
    ).toBe(false);
  });
  it('acepta 2 productos con al menos un criterio', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'comparison',
        products: [
          { slug: 'a', name: 'A', url: '/productos/a' },
          { slug: 'b', name: 'B', url: '/productos/b' },
        ],
        criteria: [{ label: 'Material', values: { a: 'PVC', b: 'PE' } }],
      }).success,
    ).toBe(true);
  });
});

describe('AssistantResponse: evidence', () => {
  it('exige un sourceType conocido', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'evidence',
        claim: '18 de 36 líneas se fabrican en planta.',
        sourceType: 'facts',
        sourceRef: 'FABRICACION_PROPIA_COUNT',
      }).success,
    ).toBe(true);
    expect(
      AssistantResponse.safeParse({
        type: 'evidence',
        claim: 'x',
        sourceType: 'wikipedia',
        sourceRef: 'x',
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: risk', () => {
  it('exige un pillarId real del Marco de Especificación', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'risk',
        pillarId: 'compatibilidad',
        criterionId: 'contenido',
        pregunta: '¿Qué contiene el material?',
        riesgo: 'Deterioro químico no detectado en recepción.',
      }).success,
    ).toBe(true);
    expect(
      AssistantResponse.safeParse({
        type: 'risk',
        pillarId: 'pilar-inventado',
        criterionId: 'x',
        pregunta: 'x',
        riesgo: 'x',
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: calculation', () => {
  it('exige al menos un resultado principal', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'calculation',
        calculatorSlug: 'geomembrana-poza',
        principales: [{ etiqueta: 'Área', valor: 180, unidad: 'm²' }],
      }).success,
    ).toBe(true);
    expect(
      AssistantResponse.safeParse({
        type: 'calculation',
        calculatorSlug: 'geomembrana-poza',
        principales: [],
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: missingInformation', () => {
  it('exige al menos un campo faltante', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'missingInformation',
        question: '¿Cuántos metros cuadrados necesita?',
        fieldsNeeded: ['metraje'],
      }).success,
    ).toBe(true);
    expect(
      AssistantResponse.safeParse({
        type: 'missingInformation',
        question: 'x',
        fieldsNeeded: [],
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: rfq', () => {
  const base = {
    type: 'rfq' as const,
    payload: { origen: 'chat' as const, producto: 'mallas-antiafidas' },
    readyToSubmit: false,
    missingFields: ['nombre', 'email', 'telefono'],
    submitTo: '/api/lead' as const,
  };
  it('acepta un payload parcial de cotización con origen chat', () => {
    expect(AssistantResponse.safeParse(base).success).toBe(true);
  });
  it('rechaza un email con formato inválido', () => {
    expect(
      AssistantResponse.safeParse({
        ...base,
        payload: { ...base.payload, email: 'no-es-un-email' },
      }).success,
    ).toBe(false);
  });
  it('rechaza submitTo apuntando a otro endpoint', () => {
    expect(
      AssistantResponse.safeParse({ ...base, submitTo: '/api/otro-endpoint' }).success,
    ).toBe(false);
  });
  it('acepta ciudad de entrega en el payload', () => {
    expect(
      AssistantResponse.safeParse({ ...base, payload: { ...base.payload, ciudad: 'Piura' } }).success,
    ).toBe(true);
  });
});

describe('AssistantResponse: nextAction', () => {
  it('exige una acción conocida', () => {
    expect(
      AssistantResponse.safeParse({
        type: 'nextAction',
        action: 'cotizar',
        url: '/cotizacion',
        label: 'Solicitar cotización',
      }).success,
    ).toBe(true);
    expect(
      AssistantResponse.safeParse({
        type: 'nextAction',
        action: 'llamar-inmediatamente',
        url: '/cotizacion',
        label: 'x',
      }).success,
    ).toBe(false);
  });
});

describe('AssistantResponse: discriminación por type', () => {
  it('rechaza un type desconocido', () => {
    expect(AssistantResponse.safeParse({ type: 'projectAssessment' }).success).toBe(false);
  });
});
