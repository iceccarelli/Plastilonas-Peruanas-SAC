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
 *  - getProduct   -> ProductResponse (product.summary = shortDescription real)
 *  - buildRFQ     -> RFQResponse (mismo shape, la tool ya lo arma así)
 *
 * El resto de tools (searchProducts, compareProducts, runCalculation, etc.)
 * queda sin tarjeta por ahora: mapearlas requeriría decisiones de diseño
 * (¿qué fila de una calculadora es "principal"?) que no corresponden a este
 * adaptador. Ver gaps de la Fase 2 para Fase 3.
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

function deriveFromGetProduct(result: unknown): AssistantResponse | null {
  if (!isRecord(result) || result.found !== true || !isRecord(result.product)) return null;
  const p = result.product;
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

function deriveFromBuildRFQ(result: unknown): AssistantResponse | null {
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

const DERIVERS: Record<string, (result: unknown) => AssistantResponse | null> = {
  getProduct: deriveFromGetProduct,
  buildRFQ: deriveFromBuildRFQ,
};

/** Intenta construir una tarjeta tipada a partir de UN resultado real de tool. Nunca inventa un campo. */
export function deriveCardFromToolResult(invocation: ToolInvocationResult): AssistantResponse | null {
  const deriver = DERIVERS[invocation.toolName];
  if (!deriver) return null;
  try {
    return deriver(invocation.result);
  } catch {
    return null;
  }
}
