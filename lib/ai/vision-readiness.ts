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

// ---------------------------------------------------------------------------
// PUENTE HONESTO FOTO → PROYECTO — Sprint F
// ---------------------------------------------------------------------------
/**
 * La decisión de arriba sigue intacta: NINGUNA foto marca sola un campo del
 * checklist. Lo que este sprint agrega es el único puente admisible — que la
 * PERSONA confirme una observación concreta para adjuntarla a su proyecto.
 *
 * Lo que cambia respecto a la regla de arriba: nada automático. Sigue siendo
 * la persona quien afirma, igual que en el formulario de confirmación de
 * chips (Sprint E.2). Lo que el código hace cumplir aquí:
 *
 *  1. SÓLO se puede confirmar un tick de `observed`. `inferences`, `unknown`
 *     y `requiresConfirmation` no son confirmables — no hay índice que los
 *     alcance, y un índice fuera de `observed` devuelve `null`.
 *  2. Una observación confirmada NUNCA llena `cantidad`, `ciudad`,
 *     `productoSlug`, `productName`, `aplicacion` ni ningún campo de
 *     contacto. El patch que devuelve esta función sólo puede tocar `nota` y
 *     `visionEvidenceIds`: es texto de contexto para quien cotiza, no un
 *     dato estructurado. Una foto no da una medida ni una ciudad, y un
 *     grado de material o una certificación no se leen de una imagen jamás.
 *
 * Ese punto 2 es el que vale dinero: una cantidad sacada de una foto es una
 * cotización equivocada, y una certificación sacada de una foto es una
 * afirmación que la empresa no puede sostener.
 */

/** Recorte de `ProjectDraft` que este puente puede tocar. Nada más existe aquí. */
export interface VisionConfirmationPatch {
  nota: string;
  visionEvidenceIds: string[];
}

/** Prefijo que deja rastro del origen en la nota: quien cotiza sabe que salió de una foto. */
export const VISION_NOTE_PREFIX = 'Observado en foto:';

/**
 * Devuelve el patch para adjuntar UNA observación confirmada al proyecto, o
 * `null` si el índice no corresponde a un tick de `observed` (lo que incluye
 * cualquier intento de confirmar una inferencia o un desconocido).
 *
 * `notaActual` se recibe para poder anexar sin perder lo que ya había, y
 * para no repetir dos veces la misma observación.
 */
export function buildVisionConfirmationPatch(
  card: VisionObservation,
  observedIndex: number,
  evidenceId: string,
  notaActual?: string | null,
): VisionConfirmationPatch | null {
  const texto = card.observed[observedIndex];
  if (typeof texto !== 'string' || !texto.trim()) return null;
  if (!evidenceId.trim()) return null;

  const linea = `${VISION_NOTE_PREFIX} ${texto.trim()}`;
  const previa = (notaActual ?? '').trim();
  if (previa.split('\n').includes(linea)) {
    // Ya estaba adjuntada: se devuelve el mismo estado en vez de duplicarla.
    return { nota: previa, visionEvidenceIds: [evidenceId.trim()] };
  }

  return {
    nota: previa ? `${previa}\n${linea}` : linea,
    visionEvidenceIds: [evidenceId.trim()],
  };
}
