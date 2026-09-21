/**
 * ANÁLISIS DE IMAGEN — Sprint C ("subida de imagen que gana una cotización").
 *
 * Todo lo que hace HONESTO un análisis de foto vive aquí, en código, no solo
 * en el prompt:
 *  - `VISION_SYSTEM_PROMPT` se lo repite al modelo en la propia instrucción.
 *  - `VisionModelOutputSchema` es el shape que se le PIDE al modelo
 *    (`generateObject`, app/api/vision/route.ts) — `unknown` y
 *    `requiresConfirmation` son arreglos obligatorios y no vacíos, así que
 *    un modelo que "olvida" declarar lo desconocido produce una respuesta que
 *    `safeParse` rechaza, no una tarjeta a medias.
 *  - `parseVisionObservation` es el único punto por el que una respuesta cruda
 *    del modelo se convierte en `VisionObservationResponse` (lib/ai/schema.ts).
 *    Si no valida, devuelve `null`: la ruta que llama a esto NUNCA debe
 *    fabricar una tarjeta a partir de un `null`.
 */
import { z } from 'zod';
import { VisionObservationResponse, type AssistantResponse } from './schema';

/**
 * REGLA DE HONESTIDAD DE LA FOTO (obligatoria, sin excepciones):
 * nunca se inventan medidas, materiales exactos, espesores ni certificaciones
 * a partir de una imagen. Toda respuesta se separa en cuatro categorías —
 * ver el comentario de `VisionObservationResponse` en lib/ai/schema.ts.
 */
export const VISION_SYSTEM_PROMPT = `Eres el analista de fotos de Plastilonas Peruanas SAC, fabricante peruano de textiles industriales y geosintéticos. Una persona subió una foto para avanzar su cotización.

REGLA CRÍTICA — NUNCA rompible:
- Una foto NUNCA basta para afirmar una medida exacta, un grado de material, un espesor, una resistencia, una certificación (ISO, ASTM, GRI, NFPA, MINEM, etc.) ni un precio. Ninguno de esos campos existe en tu respuesta y no debes escribirlos en ningún texto libre tampoco.
- Divide TODO lo que digas en exactamente cuatro categorías, sin mezclarlas:
  1. OBSERVADO (observed): solo lo literalmente visible en la foto — color, textura aparente, forma aproximada, daño o desgaste visible, contexto de uso aparente. Nunca un número inventado (ni "aprox. 5m", ni "2mm de espesor").
  2. INFERENCIA (inferences): una conjetura razonable, SIEMPRE marcada como tal con palabras como "podría ser", "parece", "a confirmar" — nunca presentada como hecho. Ejemplo correcto: "podría ser polietileno de alta densidad, a confirmar en planta". Puede quedar vacío si no hay ninguna conjetura razonable.
  3. DESCONOCIDO (unknown): nombra explícitamente lo que una foto JAMÁS puede confirmar — dimensiones exactas, grado o especificación exacta del material, certificaciones, resistencia o espesor exactos. Este campo NUNCA puede quedar vacío: una foto siempre deja cosas desconocidas.
  4. REQUIERE CONFIRMACIÓN (requiresConfirmation): qué debe verificar una persona (medir en sitio, pedir ficha técnica, confirmar con el cliente) antes de que esto se convierta en una cotización real. Nunca puede quedar vacío.
- Si la imagen no muestra nada relacionado con textiles industriales o geosintéticos, dilo en "observed" con la misma honestidad — no fuerces una lectura relacionada con el catálogo si no corresponde.
- No recomiendes un producto específico del catálogo por nombre a partir de la foto: eso es trabajo del asistente de texto (app/api/chat/route.ts) una vez que la persona confirme los datos. Tu trabajo es describir la foto, no vender.

Responde siempre en español, en frases cortas y concretas.`;

/**
 * Shape que se le pide al modelo vía `generateObject` — SIN el discriminante
 * `type` (lo añade el endpoint) y sin `followUp` (no aplica a una respuesta
 * de análisis de imagen). Los mínimos no-vacíos son la aplicación en código
 * de la regla de arriba: el modelo no puede devolver un `unknown: []`.
 */
export const VisionModelOutputSchema = z.object({
  observed: z
    .array(z.string().trim().min(1).max(300))
    .min(1)
    .max(8)
    .describe('Solo lo literalmente visible. Nunca una medida, grado o certificación inventada.'),
  inferences: z
    .array(z.string().trim().min(1).max(300))
    .max(5)
    .describe('Conjeturas explícitamente marcadas como tales ("podría ser…, a confirmar"). Puede ir vacío.'),
  unknown: z
    .array(z.string().trim().min(1).max(200))
    .min(1)
    .describe('Lo que una foto nunca puede confirmar: dimensiones exactas, grado de material, certificaciones.'),
  requiresConfirmation: z
    .array(z.string().trim().min(1).max(300))
    .min(1)
    .describe('Qué debe verificar una persona antes de cotizar con esta foto.'),
});

export type VisionModelOutput = z.infer<typeof VisionModelOutputSchema>;

/**
 * Único punto de conversión "lo que devolvió el modelo" -> tarjeta tipada.
 * Nunca completa un campo faltante con un valor por defecto que invente
 * contenido: si `raw` no cumple el esquema (p. ej. `unknown` vacío), devuelve
 * `null` y quien llama debe degradar (WhatsApp), nunca fabricar la tarjeta.
 */
export function parseVisionObservation(raw: unknown): Extract<AssistantResponse, { type: 'visionObservation' }> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const withType = { ...(raw as Record<string, unknown>), type: 'visionObservation' as const };
  const parsed = VisionObservationResponse.safeParse(withType);
  return parsed.success ? parsed.data : null;
}
