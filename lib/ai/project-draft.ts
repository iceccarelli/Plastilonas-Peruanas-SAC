/**
 * BORRADOR DE PROYECTO DEL VISITANTE — Sprint E.2.
 *
 * El checklist de `lib/ai/readiness.ts` sólo sabía leer el último `buildRFQ`
 * de la conversación. Eso dejaba el bucle a medias: si la persona ya había
 * dicho la ciudad en un turno anterior y el modelo no volvía a llamar la
 * tool, el chip seguía en "desconocido" y "Listo para cotizar" no encendía
 * nunca. Este módulo es el estado estructurado que faltaba — lo que el
 * proyecto sabe de verdad, persistido entre recargas.
 *
 * VIVE EN EL NAVEGADOR, igual que `pp_asistente_project_id`
 * (lib/ai/project-id.ts), `pp_rfq_borrador` (components/CotizacionForm.tsx) y
 * `pp_cotizaciones` (lib/whatsapp.ts). No es autenticación ni un CRM: ningún
 * backend lo lee ni lo valida. Se guarda al lado del id de proyecto, con el
 * mismo contrato de "nunca lanza": en SSR, en modo privado o con
 * localStorage bloqueado simplemente se comporta como un borrador vacío.
 *
 * ────────────────────────────────────────────────────────────────────────
 * REGLA QUE NO SE ROMPE: NADA ENTRA AQUÍ QUE NO SEA UN DATO REAL.
 *
 * Las ÚNICAS cuatro fuentes admitidas (ver `ProjectDraftSource`) son:
 *   1. `pageContext`  — el producto de la página desde la que se abrió
 *      /asistente, ya resuelto en el servidor contra el catálogo real.
 *   2. `tool`         — el resultado de una tool que devolvió un dato exacto
 *      (`getProduct` con un slug real, `getApplication` con `found: true`).
 *   3. `rfq`          — `buildRFQ`, que sólo llena un campo cuando la persona
 *      lo dijo explícitamente en el chat (ver RFQPayloadSchema).
 *   4. `confirmado`   — la persona lo escribió y pulsó "Confirmar" en la UI.
 *
 * NUNCA se infiere un campo leyendo texto libre con regex ni adivinando la
 * ciudad a partir de otro dato (un sector, una obra, un código postal). Ese
 * es exactamente el error que el checklist existe para no cometer: un chip
 * en verde es una promesa de que el dato es correcto, y un dato de entrega
 * equivocado se paga en un flete perdido, no en una métrica.
 * ────────────────────────────────────────────────────────────────────────
 */

/** De dónde vino un valor. Documenta la procedencia; nunca la inventa. */
export type ProjectDraftSource = 'pageContext' | 'tool' | 'rfq' | 'confirmado';

/**
 * Campos de texto del borrador. `visionEvidenceIds` se maneja aparte porque
 * es una lista acumulativa, no un valor que se reemplaza.
 */
export interface ProjectDraft {
  /** Slug exacto del catálogo. Nunca un nombre libre: es lo que precarga /cotizacion. */
  productoSlug?: string;
  productName?: string;
  cantidad?: string;
  ciudad?: string;
  aplicacion?: string;
  nombre?: string;
  telefono?: string;
  email?: string;
  nota?: string;
  /** Ids de observaciones de foto que la persona confirmó para el proyecto (Sprint F). */
  visionEvidenceIds?: string[];
  /** Epoch ms de la última escritura. Sólo para depurar/ordenar, nunca se muestra como dato. */
  updatedAt?: number;
}

export type ProjectDraftField = Exclude<keyof ProjectDraft, 'visionEvidenceIds' | 'updatedAt'>;

export const PROJECT_DRAFT_FIELDS: readonly ProjectDraftField[] = [
  'productoSlug',
  'productName',
  'cantidad',
  'ciudad',
  'aplicacion',
  'nombre',
  'telefono',
  'email',
  'nota',
] as const;

/**
 * Topes de longitud espejo de `RFQPayloadSchema` (lib/ai/tools.ts) y de
 * `LeadSchema` (app/api/lead/route.ts). Si un valor llegara más largo se
 * recorta aquí, para que el borrador nunca pueda producir un payload que la
 * ruta de lead vaya a rechazar al final del embudo.
 */
const MAX_LEN: Record<ProjectDraftField, number> = {
  productoSlug: 120,
  productName: 200,
  cantidad: 80,
  ciudad: 80,
  aplicacion: 160,
  nombre: 120,
  telefono: 40,
  email: 180,
  nota: 4000,
};

const STORAGE_KEY = 'pp_asistente_project_draft';
/** Tope duro de evidencias: una lista sin límite es una fuga de memoria y de ruido. */
const MAX_VISION_EVIDENCE = 20;

/**
 * Normaliza un valor entrante. Devuelve `undefined` para todo lo que no sea
 * un dato utilizable — cadena vacía, sólo espacios, o no-string. Un campo
 * vacío NUNCA debe quedar guardado: `known` se calcula con `Boolean(valor)`,
 * así que un `''` guardado sería un chip en verde sin dato detrás.
 */
export function normalizeDraftValue(field: ProjectDraftField, value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_LEN[field]);
}

/** Borrador vacío, seguro de usar en SSR y en el primer render del cliente. */
export const EMPTY_PROJECT_DRAFT: ProjectDraft = {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Saca un `ProjectDraft` limpio de cualquier cosa que haya en localStorage.
 * Exportado aparte de `readProjectDraft` para poder probarlo sin DOM: el
 * contenido de localStorage es entrada no confiable (otra pestaña, una
 * versión anterior del sitio, alguien editándolo a mano en la consola), así
 * que se valida campo por campo en vez de confiar en el JSON.
 */
export function sanitizeProjectDraft(raw: unknown): ProjectDraft {
  if (!isRecord(raw)) return {};
  const draft: ProjectDraft = {};

  for (const field of PROJECT_DRAFT_FIELDS) {
    const value = normalizeDraftValue(field, raw[field]);
    if (value !== undefined) draft[field] = value;
  }

  if (Array.isArray(raw.visionEvidenceIds)) {
    const ids = raw.visionEvidenceIds
      .filter((id): id is string => typeof id === 'string')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_VISION_EVIDENCE);
    if (ids.length > 0) draft.visionEvidenceIds = [...new Set(ids)];
  }

  if (typeof raw.updatedAt === 'number' && Number.isFinite(raw.updatedAt)) {
    draft.updatedAt = raw.updatedAt;
  }

  return draft;
}

/**
 * Funde `patch` sobre `base` sin destruir nada. Un `undefined`/vacío en el
 * patch NO borra lo que ya estaba: las fuentes automáticas (`buildRFQ` con
 * menos campos que la vez anterior, un `pageContext` sin producto) no deben
 * poder tumbar un dato que la persona ya confirmó. Para borrar de verdad
 * está `clearProjectDraftField`.
 */
export function mergeProjectDraft(base: ProjectDraft, patch: Partial<ProjectDraft>): ProjectDraft {
  const next: ProjectDraft = { ...base };
  let cambio = false;

  for (const field of PROJECT_DRAFT_FIELDS) {
    const value = normalizeDraftValue(field, patch[field]);
    if (value !== undefined && value !== next[field]) {
      next[field] = value;
      cambio = true;
    }
  }

  if (patch.visionEvidenceIds?.length) {
    const previos = next.visionEvidenceIds ?? [];
    const unidos = [...new Set([...previos, ...patch.visionEvidenceIds.filter(Boolean)])].slice(
      0,
      MAX_VISION_EVIDENCE,
    );
    if (unidos.length !== previos.length) {
      next.visionEvidenceIds = unidos;
      cambio = true;
    }
  }

  if (cambio) next.updatedAt = Date.now();
  return next;
}

// ---------------------------------------------------------------------------
// Persistencia — todo lo de abajo toca `window` y nunca lanza.
// ---------------------------------------------------------------------------

export function readProjectDraft(): ProjectDraft {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitizeProjectDraft(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function writeProjectDraft(draft: ProjectDraft): ProjectDraft {
  const limpio = sanitizeProjectDraft(draft);
  if (typeof window === 'undefined') return limpio;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(limpio));
  } catch {
    // Modo privado o cuota llena: el borrador sigue vivo en memoria para
    // esta carga de página. Perder la persistencia no debe romper el chat.
  }
  return limpio;
}

/**
 * Aplica un patch al borrador persistido y devuelve el resultado.
 * `source` se recibe para que cada llamada tenga que declarar de dónde viene
 * el dato (las cuatro fuentes admitidas del encabezado). Hoy no se guarda:
 * un campo de procedencia que nadie muestra sería estado muerto. Lo que sí
 * hace es obligar a que el autor de cada llamada responda la pregunta.
 */
export function patchProjectDraft(patch: Partial<ProjectDraft>, source: ProjectDraftSource): ProjectDraft {
  void source;
  return writeProjectDraft(mergeProjectDraft(readProjectDraft(), patch));
}

/** Borra UN campo. Único camino para quitar un dato: un patch vacío nunca borra. */
export function clearProjectDraftField(field: ProjectDraftField): ProjectDraft {
  const actual = readProjectDraft();
  if (actual[field] === undefined) return actual;
  const { [field]: _quitado, ...resto } = actual;
  return writeProjectDraft({ ...resto, updatedAt: Date.now() });
}

export function clearProjectDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ver writeProjectDraft
  }
}

export const PROJECT_DRAFT_STORAGE_KEY = STORAGE_KEY;
