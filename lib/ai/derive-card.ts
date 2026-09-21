/**
 * ADAPTADOR TOOL RESULT -> TARJETA — el puente honesto entre el chat de hoy
 * (texto libre vía `streamText`, ver app/api/chat/route.ts) y las tarjetas
 * tipadas de components/ai/cards.
 *
 * CONTEXTO (Fase 2, ver informe de entrega): `app/api/chat/route.ts` sigue
 * usando `streamText`, no `generateObject` contra `AssistantResponse`
 * (lib/ai/schema.ts) — cambiarlo hoy habría significado reescribir el
 * endpoint que ya usa el widget flotante, con el riesgo de romperlo. En vez de
 * fabricar una tarjeta con datos inventados para "aparentar" estructura,
 * este archivo solo construye una tarjeta cuando el AI SDK YA devolvió, en el
 * mismo mensaje, el resultado real de una tool de lib/ai/tools.ts (expuesto
 * por `useChat` en `message.parts` como `tool-invocation` con
 * `state: 'result'`). Cada mapeo de abajo es una copia literal de campos que
 * la tool ya calculó contra una lib de dominio real — nunca un valor puesto a
 * mano.
 *
 * Deliberadamente cubre solo las tools cuyo resultado calza EXACTO con una
 * variante de AssistantResponse sin inventar ninguna transformación:
 *  - getProduct            -> ProductResponse (product.summary = shortDescription real)
 *  - searchProducts        -> ProductResponse[] (una tarjeta por resultado; cada una
 *                             es el mismo recorte de productSummary que ya usa getProduct)
 *  - compareProducts       -> ComparisonResponse (products.slug/name/url + una fila
 *                             "Sector"/"Origen"/"Disponibilidad" por producto, todo
 *                             copiado literal de productDetail — ninguna heurística de
 *                             "mejor opción")
 *  - runCalculation        -> CalculationResponse (found:true únicamente; salida.principales
 *                             y calc.noCubre ya vienen con el shape exacto)
 *  - getFrameworkRequirement -> RiskResponse (solo cuando la tool devolvió UN criterio
 *                             concreto, es decir llamada con pillarId+criterionId; la
 *                             respuesta "lista de pilares" no tiene pregunta/riesgo y se
 *                             deja sin tarjeta)
 *  - getCompanyFact        -> EvidenceResponse (fact !== 'all'; claim se arma con el
 *                             mismo yearsStatement/countStatement que STATS ya declara,
 *                             sourceRef = el nombre del fact)
 *  - getPublishedProjects  -> EvidenceResponse cuando count > 0 (claim lista los títulos
 *                             reales de projectsPublicados); count === 0 se deja sin
 *                             tarjeta — el propio texto del modelo ya dice honestamente
 *                             que no hay evidencia publicada, una EvidenceCard vacía no
 *                             suma nada
 *  - buildRFQ              -> RFQResponse (mismo shape, la tool ya lo arma así)
 *
 * NO mapeadas a propósito:
 *  - getProductFamily, getApplication, getGuide, getGlossaryTerm, listCalculations:
 *    sus resultados no calzan con ninguna variante existente de AssistantResponse
 *    (p.ej. una familia con su lista de productos no es un ProductResponse ni una
 *    ComparisonResponse) y forzarlos exigiría o bien inventar campos que la tool no
 *    da, o agregar una variante nueva al esquema — eso es decisión de esquema, no de
 *    este adaptador. El texto narrativo del modelo sigue cubriéndolos.
 *  - getFrameworkRequirement sin criterionId (lista de pilares): no hay pregunta/riesgo
 *    concretos que mostrar en una RiskCard.
 */
import type { z } from 'zod';
import type { AssistantResponse, RFQResponse } from '@/lib/ai/schema';

type RFQPayload = z.infer<typeof RFQResponse>['payload'];

interface ToolInvocationResult {
  toolName: string;
  result: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Recorte de un `productSummary`/`productDetail` (lib/ai/tools.ts) a los campos de ProductResponse. */
function productToResponse(p: Record<string, unknown>): AssistantResponse | null {
  if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.url !== 'string') return null;
  return {
    type: 'product',
    slug: p.slug,
    name: p.name,
    url: p.url,
    summary: typeof p.shortDescription === 'string' ? p.shortDescription.slice(0, 600) : '',
    sourcingLabel: typeof p.sourcingLabel === 'string' ? p.sourcingLabel : null,
    availability:
      p.availability === 'stock' || p.availability === 'a_medida' || p.availability === 'bajo_pedido'
        ? p.availability
        : undefined,
  };
}

function deriveFromGetProduct(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || result.found !== true || !isRecord(result.product)) return null;
  return productToResponse(result.product);
}

/** Una tarjeta de producto por resultado real de búsqueda — nunca un resumen inventado del set. */
function deriveFromSearchProducts(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || !Array.isArray(result.products)) return null;
  const cards = result.products
    .filter(isRecord)
    .map((p) => productToResponse(p))
    .filter((c): c is AssistantResponse => c !== null);
  return cards.length > 0 ? cards : null;
}

/** Fila por especificación disponible en AMBOS productos comparados — sin inventar criterios. */
function deriveFromCompareProducts(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || !Array.isArray(result.products) || result.products.length < 2) return null;
  const items = result.products.filter(isRecord);
  const products = items
    .map((p) =>
      typeof p.slug === 'string' && typeof p.name === 'string' && typeof p.url === 'string'
        ? { slug: p.slug, name: p.name, url: p.url }
        : null,
    )
    .filter((p): p is { slug: string; name: string; url: string } => p !== null);
  if (products.length < 2) return null;

  const row = (label: string, pick: (p: Record<string, unknown>) => string | null) => {
    const values: Record<string, string> = {};
    for (const p of items) {
      if (typeof p.slug !== 'string') continue;
      const v = pick(p);
      if (v) values[p.slug] = v;
    }
    return Object.keys(values).length > 0 ? { label, values } : null;
  };

  const criteria = [
    row('Familia', (p) => (typeof p.category === 'string' ? p.category : null)),
    row('Sector', (p) => (Array.isArray(p.sector) ? p.sector.join(', ') : null)),
    row('Origen', (p) => (typeof p.sourcingLabel === 'string' ? p.sourcingLabel : null)),
    row('Disponibilidad', (p) => (typeof p.availability === 'string' ? p.availability : null)),
  ].filter((r): r is { label: string; values: Record<string, string> } => r !== null);
  if (criteria.length === 0) return null;

  return { type: 'comparison', products, criteria };
}

/** Salida real de una calculadora de lib/calculadoras.ts (nunca de un cálculo fallido). */
function deriveFromRunCalculation(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || result.found !== true) return null;
  if (typeof result.slug !== 'string' || !isRecord(result.salida)) return null;
  const salida = result.salida;
  if (!Array.isArray(salida.principales) || salida.principales.length === 0) return null;
  const principales = salida.principales
    .filter(isRecord)
    .map((m) =>
      typeof m.etiqueta === 'string' && typeof m.valor === 'number' && typeof m.unidad === 'string'
        ? { etiqueta: m.etiqueta, valor: m.valor, unidad: m.unidad }
        : null,
    )
    .filter((m): m is { etiqueta: string; valor: number; unidad: string } => m !== null);
  if (principales.length === 0) return null;
  return {
    type: 'calculation',
    calculatorSlug: result.slug,
    principales,
    avisos: Array.isArray(salida.avisos) ? salida.avisos.filter((a): a is string => typeof a === 'string') : [],
    noCubre: Array.isArray(result.noCubre)
      ? result.noCubre.filter((n): n is string => typeof n === 'string')
      : [],
  };
}

/** Un criterio concreto del Marco de Especificación (pillarId + criterionId), no el listado de pilares. */
function deriveFromGetFrameworkRequirement(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || result.found !== true) return null;
  if (!isRecord(result.pillar) || !isRecord(result.criterion)) return null;
  const pillarId = result.pillar.id;
  const criterion = result.criterion;
  const VALID_PILLARS = [
    'compatibilidad',
    'cargas',
    'exposicion',
    'ejecucion',
    'documentacion',
    'operacion',
  ] as const;
  if (typeof pillarId !== 'string' || !(VALID_PILLARS as readonly string[]).includes(pillarId)) return null;
  if (
    typeof criterion.id !== 'string' ||
    typeof criterion.pregunta !== 'string' ||
    typeof criterion.riesgo !== 'string'
  ) {
    return null;
  }
  return {
    type: 'risk',
    pillarId: pillarId as (typeof VALID_PILLARS)[number],
    criterionId: criterion.id,
    pregunta: criterion.pregunta,
    riesgo: criterion.riesgo,
  };
}

/** Cifra real de lib/facts.ts (nunca `fact: 'all'`, que no es una afirmación puntual). */
function deriveFromGetCompanyFact(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || result.fact === 'all' || typeof result.fact !== 'string') return null;
  if (result.value === undefined || result.value === null) return null;
  const FACT_LABEL: Record<string, string> = {
    anios: 'años operando',
    productos: 'productos en catálogo',
    familias: 'familias de producto',
    fabricacionPropia: 'líneas de fabricación propia',
  };
  const label = FACT_LABEL[result.fact] ?? result.fact;
  return {
    type: 'evidence',
    claim: `${result.value} ${label}`,
    sourceType: 'facts',
    sourceRef: result.fact,
  };
}

/** Proyectos verificados reales (nunca cuando la lista viene vacía: eso no es evidencia). */
function deriveFromGetPublishedProjects(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || typeof result.count !== 'number' || result.count <= 0) return null;
  if (!Array.isArray(result.projects)) return null;
  const titles = result.projects
    .filter(isRecord)
    .map((p) => (typeof p.title === 'string' ? p.title : null))
    .filter((t): t is string => t !== null);
  if (titles.length === 0) return null;
  return {
    type: 'evidence',
    claim: `Proyectos verificados publicados: ${titles.join(', ')}`,
    sourceType: 'project',
    sourceRef: 'proyectos',
  };
}

function deriveFromBuildRFQ(result: unknown): AssistantResponse | AssistantResponse[] | null {
  if (!isRecord(result) || !isRecord(result.payload)) return null;
  const raw = result.payload;
  if (raw.origen !== 'chat') return null;
  if (typeof result.readyToSubmit !== 'boolean') return null;
  const missingFields = Array.isArray(result.missingFields)
    ? result.missingFields.filter((f): f is string => typeof f === 'string')
    : [];
  // `raw` ya viajó por JSON desde la tool (lib/ai/tools.ts#buildRFQ), que
  // construye este shape exacto con RFQPayloadSchema.parse(). La aserción es
  // sobre el LÍMITE de red (unknown -> tipo esperado), no una invención de
  // datos: los valores en sí son los que la tool ya calculó server-side.
  const payload = { ...raw, origen: 'chat' } as unknown as RFQPayload;
  return {
    type: 'rfq',
    payload,
    readyToSubmit: result.readyToSubmit,
    missingFields,
    submitTo: '/api/lead',
  };
}

type Deriver = (result: unknown) => AssistantResponse | AssistantResponse[] | null;

const DERIVERS: Record<string, Deriver> = {
  getProduct: deriveFromGetProduct,
  searchProducts: deriveFromSearchProducts,
  compareProducts: deriveFromCompareProducts,
  runCalculation: deriveFromRunCalculation,
  getFrameworkRequirement: deriveFromGetFrameworkRequirement,
  getCompanyFact: deriveFromGetCompanyFact,
  getPublishedProjects: deriveFromGetPublishedProjects,
  buildRFQ: deriveFromBuildRFQ,
};

/**
 * Intenta construir tarjeta(s) tipada(s) a partir de UN resultado real de tool.
 * Nunca inventa un campo. Devuelve siempre un arreglo (vacío si no aplica) para
 * que un resultado como `searchProducts` pueda producir varias tarjetas sin que
 * el llamador tenga que distinguir singular de plural.
 */
export function deriveCardsFromToolResult(invocation: ToolInvocationResult): AssistantResponse[] {
  const deriver = DERIVERS[invocation.toolName];
  if (!deriver) return [];
  try {
    const out = deriver(invocation.result);
    if (!out) return [];
    return Array.isArray(out) ? out : [out];
  } catch {
    return [];
  }
}

/** @deprecated usar `deriveCardsFromToolResult` — se mantiene para no romper llamadores existentes. */
export function deriveCardFromToolResult(invocation: ToolInvocationResult): AssistantResponse | null {
  const [first] = deriveCardsFromToolResult(invocation);
  return first ?? null;
}
