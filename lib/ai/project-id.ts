/**
 * ID DE PROYECTO ANÓNIMO — panel "Mi proyecto" de /asistente.
 *
 * No es autenticación: es un identificador efímero que vive solo en el
 * navegador (localStorage), igual de "de cliente" que `pp_rfq_borrador` en
 * CotizacionForm.tsx o `pp_cotizaciones` en lib/whatsapp.ts. Ningún backend lo
 * valida ni lo asocia a una cuenta; sirve para que el panel lateral pueda
 * agrupar lo que el visitante ya contó en ESTA conversación y, si el
 * navegador soporta `crypto.randomUUID`, para pasarlo como `projectId` al
 * `PageContext` de lib/ai/context.ts (que ya sabe generar uno propio si falta).
 *
 * No lanza nunca: en SSR, en modo privado o con localStorage bloqueado,
 * simplemente genera un id en memoria para esa carga de página.
 */

const STORAGE_KEY = 'pp_asistente_project_id';

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // sigue al fallback
  }
  return `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Lee el id existente o crea uno nuevo y lo persiste. Seguro en SSR. */
export function getOrCreateProjectId(): string {
  if (typeof window === 'undefined') return randomId();
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const created = randomId();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return randomId();
  }
}
