/**
 * ESQUEMA DE RESPUESTA ESTRUCTURADA DEL ASISTENTE — Fase 1.
 *
 * Unión discriminada por `type`. Cada variante existe porque hay una tool
 * real en `lib/ai/tools.ts` que puede alimentarla — no se agrega una variante
 * "por si acaso" sin una tool detrás (ver notas al final para lo que se
 * dejó fuera a propósito).
 *
 * Esto NO reemplaza el streaming de texto de `app/api/chat/route.ts` (el
 * widget flotante sigue leyendo texto/Markdown vía `useChat`). Es el
 * contrato que usaría una superficie estructurada (p.ej. una Fase 2 con
 * tarjetas de producto o de comparación) para pedir/validar una respuesta
 * con `generateObject`/`streamObject`, o para tipar lo que una tool ya
 * devolvió antes de mostrarlo.
 */
import { z } from 'zod';

const BaseFields = {
  /** Paso siguiente en Markdown+enlace, mismo formato que ya usa el widget. */
  followUp: z.string().trim().max(400).optional(),
};

export const NarrativeResponse = z.object({
  type: z.literal('narrative'),
  text: z.string().trim().min(1).max(2000),
  ...BaseFields,
});

export const RecommendationResponse = z.object({
  type: z.literal('recommendation'),
  productSlug: z.string().trim(),
  productName: z.string().trim(),
  url: z.string().trim().startsWith('/'),
  reason: z.string().trim().min(1).max(600),
  ...BaseFields,
});

export const ProductResponse = z.object({
  type: z.literal('product'),
  slug: z.string().trim(),
  name: z.string().trim(),
  url: z.string().trim().startsWith('/'),
  summary: z.string().trim().max(600),
  sourcingLabel: z.string().trim().nullable().optional(),
  availability: z.enum(['stock', 'a_medida', 'bajo_pedido']).optional(),
  ...BaseFields,
});

export const ComparisonResponse = z.object({
  type: z.literal('comparison'),
  products: z
    .array(
      z.object({
        slug: z.string().trim(),
        name: z.string().trim(),
        url: z.string().trim().startsWith('/'),
      }),
    )
    .min(2)
    .max(4),
  criteria: z
    .array(
      z.object({
        label: z.string().trim(),
        // slug del producto -> valor de esa fila para ese producto.
        values: z.record(z.string(), z.string()),
      }),
    )
    .min(1),
  ...BaseFields,
});

export const EvidenceResponse = z.object({
  type: z.literal('evidence'),
  claim: z.string().trim().min(1).max(400),
  sourceType: z.enum(['facts', 'framework', 'guide', 'glossary', 'project']),
  /** slug/id de la fuente dentro de esa lib (p.ej. slug de guía o id de criterio). */
  sourceRef: z.string().trim(),
  detail: z.string().trim().max(1000).optional(),
  ...BaseFields,
});

export const RiskResponse = z.object({
  type: z.literal('risk'),
  pillarId: z.enum([
    'compatibilidad',
    'cargas',
    'exposicion',
    'ejecucion',
    'documentacion',
    'operacion',
  ]),
  criterionId: z.string().trim(),
  pregunta: z.string().trim(),
  riesgo: z.string().trim(),
  ...BaseFields,
});

export const CalculationResponse = z.object({
  type: z.literal('calculation'),
  calculatorSlug: z.string().trim(),
  principales: z
    .array(
      z.object({
        etiqueta: z.string().trim(),
        valor: z.number(),
        unidad: z.string().trim(),
      }),
    )
    .min(1),
  avisos: z.array(z.string().trim()).default([]),
  noCubre: z.array(z.string().trim()).default([]),
  ...BaseFields,
});

export const MissingInformationResponse = z.object({
  type: z.literal('missingInformation'),
  question: z.string().trim().min(1).max(300),
  fieldsNeeded: z.array(z.string().trim()).min(1),
  ...BaseFields,
});

/** Debe coincidir con el subconjunto de LeadSchema que expone buildRFQ. */
export const RFQResponse = z.object({
  type: z.literal('rfq'),
  payload: z.object({
    nombre: z.string().trim().max(120).optional(),
    empresa: z.string().trim().max(160).optional(),
    email: z.string().trim().email().max(180).optional(),
    telefono: z.string().trim().max(40).optional(),
    producto: z.string().trim().max(200).optional(),
    cantidad: z.string().trim().max(80).optional(),
    mensaje: z.string().trim().max(4000).optional(),
    language: z.enum(['es', 'en', 'pt']).optional(),
    slug: z.string().trim().max(120).optional(),
    origen: z.literal('chat'),
  }),
  readyToSubmit: z.boolean(),
  missingFields: z.array(z.string().trim()).default([]),
  submitTo: z.literal('/api/lead'),
  ...BaseFields,
});

/**
 * OBSERVACIÓN DE IMAGEN — Sprint C (subida de foto que gana una cotización).
 *
 * Alimentada por `app/api/vision/route.ts`, que llama a un modelo con visión
 * de Anthropic sobre una foto que la persona subió en /asistente. La regla de
 * negocio que este esquema hace cumplir EN CÓDIGO, no solo en el prompt:
 *
 *  - `observed`: solo lo literalmente visible (color, textura aparente,
 *    daño/desgaste visible, forma aproximada) — nunca una medida exacta.
 *  - `inference`: una conjetura EXPLÍCITAMENTE marcada como tal (p. ej.
 *    "podría ser polietileno de alta densidad, a confirmar"). Nunca se
 *    presenta como hecho.
 *  - `unknown`: obligatorio y NUNCA vacío — dimensiones exactas, grado de
 *    material, certificaciones son SIEMPRE desconocidas desde una foto. Si el
 *    modelo devolviera un arreglo vacío aquí, `safeParse` rechaza la
 *    respuesta completa: no hay forma de "olvidar" declarar lo desconocido.
 *  - `requiresConfirmation`: obligatorio y nunca vacío — qué debe verificar
 *    una persona antes de cotizar con esta foto.
 *
 * Ninguna certificación ni precio puede aparecer aquí: no hay campo para
 * ellos, y `VISION_SYSTEM_PROMPT` (lib/ai/vision.ts) lo prohíbe explícitamente.
 */
export const VisionObservationResponse = z.object({
  type: z.literal('visionObservation'),
  observed: z.array(z.string().trim().min(1).max(300)).min(1).max(8),
  inferences: z.array(z.string().trim().min(1).max(300)).max(5).default([]),
  unknown: z.array(z.string().trim().min(1).max(200)).min(1),
  requiresConfirmation: z.array(z.string().trim().min(1).max(300)).min(1),
  ...BaseFields,
});

export const NextActionResponse = z.object({
  type: z.literal('nextAction'),
  action: z.enum(['cotizar', 'whatsapp', 'contacto']),
  url: z.string().trim(),
  label: z.string().trim().max(120),
});

export const AssistantResponse = z.discriminatedUnion('type', [
  NarrativeResponse,
  RecommendationResponse,
  ProductResponse,
  ComparisonResponse,
  EvidenceResponse,
  RiskResponse,
  CalculationResponse,
  MissingInformationResponse,
  RFQResponse,
  NextActionResponse,
  VisionObservationResponse,
]);

export type AssistantResponse = z.infer<typeof AssistantResponse>;

/**
 * DEJADO FUERA A PROPÓSITO (gap para Fase 2/3, ver informe de entrega):
 * no hay variantes `projectAssessment`, `uploadRequest` ni `projectBrief`
 * porque no existe ninguna tool en `lib/ai/tools.ts` que las alimente hoy
 * (no hay `buildProjectBrief`/`validateProjectBrief` — lib/framework.ts da
 * pilares y criterios individuales vía `getFrameworkRequirement`, pero no
 * un ensamblador de "brief" completo). Agregar la variante antes que la tool
 * es exactamente el error que este documento evita: un shape que el modelo
 * puede rellenar sin datos reales detrás.
 *
 * `visionObservation` SÍ tiene un endpoint real detrás (`app/api/vision/
 * route.ts`) — no es un adelanto sin datos. No reutiliza `evidence` porque
 * `EvidenceResponse.sourceType` es un enum cerrado de fuentes YA verificadas
 * del sitio (facts/framework/guide/glossary/project); una foto no es
 * ninguna de esas, y forzarla ahí borraría la distinción observado/inferido/
 * desconocido que este sprint existe para proteger.
 */
