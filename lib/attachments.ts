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

/** Bytes que se leen del inicio de un objeto para comprobar que es lo que dice ser. */
export const SIGNATURE_BYTES = 1024;

const startsWith = (b: Uint8Array, sig: number[]) => sig.every((v, i) => b[i] === v);
const ascii = (b: Uint8Array) => new TextDecoder('latin1').decode(b);

/**
 * El tipo y la extensión los declara el cliente; la CABECERA del archivo no se
 * puede declarar. Se exige que coincida con la extensión: un HTML o un
 * ejecutable renombrado a .pdf no se asocia a la solicitud. No es un antivirus
 * ni un análisis de contenido: el archivo sigue siendo entrada no confiable y
 * solo se sirve como descarga firmada.
 */
export function matchesSignature(ext: string, head: Uint8Array): boolean {
  if (!head.length) return false;
  switch (ext) {
    case 'pdf':
      // La especificación tolera basura antes de «%PDF-» dentro del primer KB.
      return ascii(head).includes('%PDF-');
    case 'jpg':
    case 'jpeg':
      return startsWith(head, [0xff, 0xd8, 0xff]);
    case 'png':
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'dwg':
      // Versiones AC1002…AC1032: «AC10» + dígitos.
      return /^AC10\d\d/.test(ascii(head.subarray(0, 6)));
    case 'dxf': {
      if (ascii(head.subarray(0, 22)) === 'AutoCAD Binary DXF\r\n') return true;
      if (head.includes(0)) return false;
      return /^\s*0\s*\r?\n\s*SECTION/.test(ascii(head));
    }
    default:
      return false;
  }
}
