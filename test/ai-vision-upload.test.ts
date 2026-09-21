import { describe, it, expect } from 'vitest';
import {
  isVisionMimeAllowed,
  validateVisionFile,
  VISION_MAX_BYTES,
  VISION_MIME_ALLOWLIST,
} from '@/lib/ai/vision-upload';

/**
 * VALIDACIÓN CLIENTE DE FOTOS — mismos valores que CotizacionForm.MAX_BYTES
 * (20 MB), recortados a los tres formatos de imagen reales.
 */

function archivo(nombre: string, tipo: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], nombre, { type: tipo });
}

describe('VISION_MIME_ALLOWLIST / isVisionMimeAllowed', () => {
  it('admite jpeg, png y webp', () => {
    expect(VISION_MIME_ALLOWLIST).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    expect(isVisionMimeAllowed('image/jpeg')).toBe(true);
    expect(isVisionMimeAllowed('image/png')).toBe(true);
    expect(isVisionMimeAllowed('image/webp')).toBe(true);
  });

  it('rechaza PDF/DWG (válidos en CotizacionForm, pero no para el analizador de visión)', () => {
    expect(isVisionMimeAllowed('application/pdf')).toBe(false);
    expect(isVisionMimeAllowed('image/vnd.dwg')).toBe(false);
  });
});

describe('validateVisionFile', () => {
  it('acepta un JPG dentro del límite', () => {
    expect(validateVisionFile(archivo('foto.jpg', 'image/jpeg', 1024))).toBeNull();
  });

  it('rechaza un formato no admitido con un mensaje que nombra el archivo', () => {
    const error = validateVisionFile(archivo('plano.pdf', 'application/pdf', 1024));
    expect(error).toContain('plano.pdf');
  });

  it(`rechaza un archivo que supera los ${VISION_MAX_BYTES / (1024 * 1024)} MB`, () => {
    const error = validateVisionFile(archivo('grande.png', 'image/png', VISION_MAX_BYTES + 1));
    expect(error).toContain('20 MB');
  });

  it('acepta exactamente en el límite', () => {
    expect(validateVisionFile(archivo('limite.png', 'image/png', VISION_MAX_BYTES))).toBeNull();
  });
});
