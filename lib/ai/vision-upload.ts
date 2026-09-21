/**
 * SUBIDA DE FOTOS EN /asistente — Sprint C.
 *
 * MISMO patrón que `components/CotizacionForm.tsx#subirArchivos` (la ÚNICA
 * otra subida a Supabase Storage del repo): `import()` perezoso de
 * `@/lib/supabase`, bucket `rfq-adjuntos` (no uno nuevo — ver
 * docs/HUMAN-GATES.md §2, que ya documenta ese bucket como no provisionado
 * en producción), `supabaseBrowser()` — NUNCA `supabaseAdmin` en código de
 * cliente — y degrade silencioso si Storage no está configurado o falla.
 *
 * DECISIÓN DE ARQUITECTURA (documentada porque se aparta de "sube y luego
 * referencia la ruta"): el análisis de la foto (`/api/vision`) no depende de
 * que esta subida tenga éxito. La foto se envía en base64 directo al
 * endpoint de visión (ver `uploadAndAnalyzeImage` en el componente) porque
 * ESA es la parte que gana la cotización, y el bucket `rfq-adjuntos` hoy NO
 * existe en producción (docs/HUMAN-GATES.md §2) — atar el análisis a esa
 * subida habría dejado Sprint C completo pero inutilizable hasta que una
 * persona cree el bucket. La subida a Storage de este archivo es un
 * best-effort de archivo (igual que en el formulario de RFQ): si falla o no
 * está configurada, el análisis igual se muestra; solo no queda copia en
 * Storage para revisión posterior.
 */

/** Igual que `CotizacionForm.EXTENSIONES`, recortado a los formatos de imagen que soporta la API de visión. */
export const VISION_MIME_ALLOWLIST = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Mismo umbral que `CotizacionForm.MAX_BYTES` (20 MB): no se inventa un
 * segundo número. Si un archivo pasa este límite pero la API de Anthropic lo
 * rechaza igual por peso, `/api/vision` degrada con el mismo mensaje de
 * WhatsApp que cualquier otro fallo del análisis — nunca un error críptico.
 */
export const VISION_MAX_BYTES = 20 * 1024 * 1024;

export type VisionMimeType = (typeof VISION_MIME_ALLOWLIST)[number];

export function isVisionMimeAllowed(mime: string): mime is VisionMimeType {
  return (VISION_MIME_ALLOWLIST as readonly string[]).includes(mime);
}

export function validateVisionFile(file: File): string | null {
  if (!isVisionMimeAllowed(file.type)) {
    return `Formato no admitido: ${file.name}. Use JPG, PNG o WEBP.`;
  }
  if (file.size > VISION_MAX_BYTES) {
    return `${file.name} supera los 20 MB.`;
  }
  return null;
}

/** Lee el archivo como base64 puro (sin el prefijo `data:...;base64,`). */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Lectura de archivo inválida'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Copia best-effort a Supabase Storage (bucket `rfq-adjuntos`, prefijo
 * `asistente/`). Nunca lanza y nunca bloquea el análisis: quien llama debe
 * seguir adelante con la foto aunque esto devuelva `null`.
 */
export async function archiveVisionImage(file: File, projectId: string): Promise<string | null> {
  try {
    const { supabaseBrowser } = await import('@/lib/supabase');
    const sb = supabaseBrowser();
    if (!sb) return null;
    const ruta = `asistente/${projectId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error } = await sb.storage.from('rfq-adjuntos').upload(ruta, file);
    return error ? null : ruta;
  } catch {
    return null;
  }
}
