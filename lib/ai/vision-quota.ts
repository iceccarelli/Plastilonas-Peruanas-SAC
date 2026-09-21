/**
 * CUOTA DE FOTOS POR SESIÓN DE NAVEGADOR — Sprint C.
 *
 * Mismo tipo de persistencia efímera que `lib/ai/project-id.ts`
 * (localStorage, nunca lanza, se resetea sola sin backend). Es una defensa
 * simple contra el abuso del lado del cliente — el límite real, que no se
 * puede evadir borrando localStorage, es el rate limit por IP del servidor
 * en `app/api/vision/route.ts`. No hay estado nuevo en el backend para esto
 * a propósito: es una cuota de UX ("ya subió varias fotos, quizá prefiera
 * WhatsApp"), no un control de seguridad.
 */

const STORAGE_KEY = 'pp_asistente_vision_count';

/** Fotos por sesión de navegador. Simple y visible, no una heurística de costo. */
export const MAX_VISION_UPLOADS_PER_SESSION = 6;

export function getVisionUploadCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function canUploadVisionImage(): boolean {
  return getVisionUploadCount() < MAX_VISION_UPLOADS_PER_SESSION;
}

/** Incrementa la cuota. Best-effort: sin localStorage, simplemente no cuenta (el límite del servidor sigue vigente). */
export function registerVisionUpload(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(getVisionUploadCount() + 1));
  } catch {
    /* sin localStorage no hay cuota de cliente; el límite por IP sigue aplicando */
  }
}
