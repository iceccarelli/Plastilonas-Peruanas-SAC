/**
 * Reglas de adjuntos del RFQ. Los archivos son ENTRADA NO CONFIABLE: nunca se
 * sirven en línea (solo descarga firmada), nunca se pasan a un modelo de IA
 * desde aquí y su nombre se reconstruye, no se confía en el del cliente.
 */
export const BUCKET = 'rfq-adjuntos';
export const MAX_FILES = 5;
export const MAX_BYTES = 20 * 1024 * 1024;

const EXT: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  // Los navegadores no tienen un tipo estable para planos CAD.
  dwg: ['application/acad', 'image/vnd.dwg', 'application/octet-stream', ''],
  dxf: ['application/dxf', 'image/vnd.dxf', 'application/octet-stream', 'text/plain', ''],
};

export function extensionOf(name: string): string {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(name.trim());
  return m ? m[1].toLowerCase() : '';
}

export function sanitizeFilename(name: string): string {
  const ext = extensionOf(name);
  const base = name
    .replace(/\.[A-Za-z0-9]{1,5}$/, '')
    .normalize('NFKD')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'archivo';
  return ext ? `${base}.${ext}` : base;
}

export type UploadCheck = { ok: true; filename: string } | { ok: false; error: 'type' | 'size' | 'empty' };

export function checkUpload(name: string, type: string, size: number): UploadCheck {
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: 'empty' };
  if (size > MAX_BYTES) return { ok: false, error: 'size' };
  const allowed = EXT[extensionOf(name)];
  if (!allowed || !allowed.includes(type.toLowerCase())) return { ok: false, error: 'type' };
  return { ok: true, filename: sanitizeFilename(name) };
}

const REF = /^incoming\/([0-9a-f]{32})\/([\w\-]{1,60}\.[a-z0-9]{1,5})$/;

export function buildPath(id: string, filename: string): string {
  return `incoming/${id}/${filename}`;
}

/** Una referencia válida es EXACTAMENTE una ruta emitida por upload-url. */
export function parseRef(ref: string): { dir: string; filename: string; path: string } | null {
  const m = REF.exec(ref.trim());
  return m ? { dir: `incoming/${m[1]}`, filename: m[2], path: ref.trim() } : null;
}
