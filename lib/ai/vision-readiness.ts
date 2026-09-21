/**
 * DECISIÓN: LA FOTO NO ALIMENTA EL CHECKLIST — Sprint C, tarea 5.
 *
 * `lib/ai/readiness.ts` exige que "conocido" signifique una señal real y
 * segura: hoy viene de `buildRFQ` o de una tool que devolvió un dato exacto
 * (`getApplication` con `found: true`, etc.). Una observación de foto NUNCA
 * cumple ese estándar de la misma forma:
 *
 *  - `observed` es lo más cercano a un hecho, pero es texto libre generado
 *    por un modelo sobre una imagen — no el mismo tipo de certeza que "la
 *    tool devolvió este slug exacto". Tratar "se ve un toldo de color verde"
 *    como si fuera el mismo dato que `getApplication` encontrando el hub
 *    "Cobertura agrícola" sería inflar la confianza del checklist.
 *  - `inferences` y `unknown` NUNCA deben marcar un campo como conocido —
 *    eso es precisamente lo que este sprint prohíbe.
 *
 * Por eso esta función existe y siempre devuelve `{}`: es la aplicación en
 * código de "en caso de duda, no lo marques hecho" (ver instrucción de la
 * tarea 5). La tarjeta de visión se muestra sola en /asistente
 * (VisionObservationCard) y nunca toca `ReadinessSignals`. Si en el futuro
 * se decide mapear ALGO, este es el único punto que debe cambiar — y aun
 * así, jamás debe leer `inferences` ni `unknown` para decidir un `known`.
 */
import type { ReadinessSignals } from './readiness';
import type { AssistantResponse } from './schema';

type VisionObservation = Extract<AssistantResponse, { type: 'visionObservation' }>;

/**
 * Siempre devuelve un objeto vacío: ninguna observación de foto marca un
 * campo del checklist como conocido, ni siquiera `observed`. Existe como
 * función (en vez de simplemente no llamar a nada) para que la decisión
 * quede probada por un test (`test/ai-vision-readiness.test.ts`) y no solo
 * documentada en un comentario que alguien podría dejar de leer.
 */
export function deriveReadinessSignalFromVision(_card: VisionObservation): Partial<ReadinessSignals> {
  return {};
}
