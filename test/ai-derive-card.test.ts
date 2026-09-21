import { describe, it, expect } from 'vitest';
import { deriveCardsFromToolResult, deriveCardFromToolResult } from '@/lib/ai/derive-card';
import {
  getProduct,
  searchProducts,
  compareProducts,
  runCalculation,
  getFrameworkRequirement,
  getCompanyFact,
  getPublishedProjects,
  buildRFQ,
} from '@/lib/ai/tools';
import { products } from '@/lib/products';
import { pillars } from '@/lib/framework';
import { calculadoras } from '@/lib/calculadoras';

/**
 * `lib/ai/derive-card.ts` — CONFIANZA DE LA TARJETA. Fase 4.
 *
 * `deriveCardsFromToolResult` es el único puente entre lo que una tool de
 * `lib/ai/tools.ts` YA devolvió (datos reales, ver test/ai-tools.test.ts) y
 * lo que `components/ai/AssistantCard.tsx` renderiza. Esta prueba no repite
 * las afirmaciones de "la tool no inventa datos" (eso ya lo cubre
 * ai-tools.test.ts): comprueba la propiedad propia del adaptador —
 *   1. Con un resultado REAL de tool, produce la tarjeta correspondiente,
 *      con exactamente los campos que esa tool calculó (nunca un valor
 *      puesto a mano en el adaptador).
 *   2. Con un resultado vacío/"no encontrado" (found:false, count:0, lista
 *      de pilares sin criterio, fact:'all'), no fabrica una tarjeta: la
 *      llamada degrada a un arreglo vacío -> el llamador cae al texto
 *      narrativo del modelo (NarrativeCard), nunca a una tarjeta con campos
 *      inventados.
 *   3. Nunca lanza, ni con basura de forma inesperada (protegido por el
 *      try/catch documentado en el propio derive-card.ts).
 */

function exec<T extends { execute?: (...args: any[]) => any }>(t: T) {
  if (!t.execute) throw new Error('tool sin execute');
  return t.execute;
}

describe('deriveCardsFromToolResult: tool con dato real -> tarjeta real', () => {
  it('getProduct encontrado -> ProductResponse con los mismos campos que la tool devolvió', async () => {
    const real = products[0];
    const out = await exec(getProduct)({ slug: real.slug }, {} as any);
    const cards = deriveCardsFromToolResult({ toolName: 'getProduct', result: out });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      type: 'product',
      slug: real.slug,
      name: real.name,
      url: `/productos/${real.slug}`,
    });
  });

  it('searchProducts con resultados -> una ProductResponse por cada producto real encontrado', async () => {
    const out = await exec(searchProducts)({ query: 'malla' }, {} as any);
    expect(out.products.length).toBeGreaterThan(0);
    const cards = deriveCardsFromToolResult({ toolName: 'searchProducts', result: out });
    expect(cards).toHaveLength(out.products.length);
    for (const card of cards) {
      expect(card.type).toBe('product');
      if (card.type === 'product') {
        expect(products.some((p) => p.slug === card.slug)).toBe(true);
      }
    }
  });

  it('compareProducts con 2+ productos reales -> ComparisonResponse con esos mismos slugs', async () => {
    const [a, b] = products;
    const out = await exec(compareProducts)({ slugs: [a.slug, b.slug] }, {} as any);
    const cards = deriveCardsFromToolResult({ toolName: 'compareProducts', result: out });
    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card.type).toBe('comparison');
    if (card.type === 'comparison') {
      expect(card.products.map((p) => p.slug).sort()).toEqual([a.slug, b.slug].sort());
    }
  });

  it('runCalculation exitosa -> CalculationResponse con la salida real de la calculadora', async () => {
    const calc = calculadoras[0];
    const out = await exec(runCalculation)({ slug: calc.slug, valores: {} }, {} as any);
    expect(out.found).toBe(true);
    const cards = deriveCardsFromToolResult({ toolName: 'runCalculation', result: out });
    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card.type).toBe('calculation');
    if (card.type === 'calculation') {
      expect(card.calculatorSlug).toBe(calc.slug);
      expect(card.principales.length).toBeGreaterThan(0);
    }
  });

  it('getFrameworkRequirement con pillarId+criterionId -> RiskResponse con ese criterio real', async () => {
    const pilar = pillars[0];
    const criterio = pilar.criterios[0];
    const out = await exec(getFrameworkRequirement)(
      { pillarId: pilar.id, criterionId: criterio.id },
      {} as any,
    );
    expect(out.found).toBe(true);
    const cards = deriveCardsFromToolResult({ toolName: 'getFrameworkRequirement', result: out });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      type: 'risk',
      pillarId: pilar.id,
      criterionId: criterio.id,
      pregunta: criterio.pregunta,
      riesgo: criterio.riesgo,
    });
  });

  it('getCompanyFact con una cifra puntual -> EvidenceResponse citando esa cifra real', async () => {
    const out = await exec(getCompanyFact)({ fact: 'productos' }, {} as any);
    const cards = deriveCardsFromToolResult({ toolName: 'getCompanyFact', result: out });
    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card.type).toBe('evidence');
    if (card.type === 'evidence') {
      expect(card.sourceType).toBe('facts');
      expect(card.claim).toContain(String(out.value));
    }
  });

  it('getPublishedProjects con al menos un proyecto verificado -> EvidenceResponse con esos títulos', async () => {
    const out = await exec(getPublishedProjects)({}, {} as any);
    const cards = deriveCardsFromToolResult({ toolName: 'getPublishedProjects', result: out });
    if (out.count > 0) {
      expect(cards).toHaveLength(1);
      expect(cards[0].type).toBe('evidence');
    } else {
      // Catálogo de proyectos verificados vacío hoy: la degradación es
      // igual de correcta y se cubre en el bloque de abajo.
      expect(cards).toEqual([]);
    }
  });

  it('buildRFQ -> RFQResponse con el mismo payload y submitTo que la tool arma', async () => {
    const out = await exec(buildRFQ)({ producto: products[0].name, ciudad: 'Cusco' }, {} as any);
    const cards = deriveCardsFromToolResult({ toolName: 'buildRFQ', result: out });
    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card.type).toBe('rfq');
    if (card.type === 'rfq') {
      expect(card.submitTo).toBe('/api/lead');
      expect(card.readyToSubmit).toBe(out.readyToSubmit);
      expect(card.payload.producto).toBe(products[0].name);
      expect(card.payload.ciudad).toBe('Cusco');
    }
  });
});

describe('deriveCardsFromToolResult: resultado vacío o no-encontrado degrada, nunca fabrica', () => {
  it('getProduct found:false -> ninguna tarjeta (el texto del modelo cubre el caso)', async () => {
    const out = await exec(getProduct)({ slug: 'slug-que-no-existe-nunca' }, {} as any);
    expect(out.found).toBe(false);
    expect(deriveCardsFromToolResult({ toolName: 'getProduct', result: out })).toEqual([]);
  });

  it('searchProducts sin coincidencias -> ninguna tarjeta', async () => {
    const out = await exec(searchProducts)({ query: 'xyz-inexistente-000' }, {} as any);
    expect(out.products).toEqual([]);
    expect(deriveCardsFromToolResult({ toolName: 'searchProducts', result: out })).toEqual([]);
  });

  it('compareProducts con un solo slug real -> ninguna tarjeta (no hay comparación con 1)', async () => {
    const out = await exec(compareProducts)({ slugs: [products[0].slug, 'no-existe'] }, {} as any);
    expect(out.products.length).toBe(1);
    expect(deriveCardsFromToolResult({ toolName: 'compareProducts', result: out })).toEqual([]);
  });

  it('runCalculation con slug inexistente -> ninguna tarjeta', async () => {
    const out = await exec(runCalculation)({ slug: 'no-existe' as any, valores: {} }, {} as any);
    expect(out.found).toBe(false);
    expect(deriveCardsFromToolResult({ toolName: 'runCalculation', result: out })).toEqual([]);
  });

  it('getFrameworkRequirement sin pillarId (listado de pilares) -> ninguna tarjeta', async () => {
    const out = await exec(getFrameworkRequirement)({}, {} as any);
    expect(deriveCardsFromToolResult({ toolName: 'getFrameworkRequirement', result: out })).toEqual([]);
  });

  it("getCompanyFact con fact:'all' -> ninguna tarjeta (no es una afirmación puntual)", async () => {
    const out = await exec(getCompanyFact)({ fact: 'all' }, {} as any);
    expect(deriveCardsFromToolResult({ toolName: 'getCompanyFact', result: out })).toEqual([]);
  });

  it('getPublishedProjects vacío (filtrado a un sector inexistente) -> ninguna tarjeta', async () => {
    const out = await exec(getPublishedProjects)({ sector: 'sector-que-no-existe' }, {} as any);
    expect(out.count).toBe(0);
    expect(deriveCardsFromToolResult({ toolName: 'getPublishedProjects', result: out })).toEqual([]);
  });

  it('una tool sin adaptador (getGlossaryTerm) -> ninguna tarjeta, nunca lanza', () => {
    expect(deriveCardsFromToolResult({ toolName: 'getGlossaryTerm', result: { found: true } })).toEqual([]);
  });

  it('un resultado con forma inesperada (basura) nunca lanza: degrada a arreglo vacío', () => {
    expect(() =>
      deriveCardsFromToolResult({ toolName: 'getProduct', result: 'no-es-un-objeto' as any }),
    ).not.toThrow();
    expect(deriveCardsFromToolResult({ toolName: 'getProduct', result: null })).toEqual([]);
    expect(deriveCardsFromToolResult({ toolName: 'buildRFQ', result: { payload: {} } })).toEqual([]);
  });

  it('el wrapper singular deprecado sigue degradando a null sin lanzar', () => {
    const out = deriveCardFromToolResult({ toolName: 'getProduct', result: { found: false } });
    expect(out).toBeNull();
  });
});
