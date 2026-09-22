import { describe, it, expect } from 'vitest';
import {
  VISION_NOTE_PREFIX,
  buildVisionConfirmationPatch,
  deriveReadinessSignalFromVision,
} from '@/lib/ai/vision-readiness';
import { buildReadinessChecklist, isReadyToQuote, mergeReadinessSignals } from '@/lib/ai/readiness';
import type { AssistantResponse } from '@/lib/ai/schema';

/**
 * DECISIÓN DE LA TAREA 5: la foto NO alimenta el checklist "Mi proyecto".
 * Ver el comentario de cabecera de lib/ai/vision-readiness.ts para el porqué.
 * Esta prueba existe para que esa decisión quede PROBADA, no solo escrita en
 * un comentario: aunque una tarjeta de visión tenga una observación con
 * pinta de respuesta real, o una inferencia o un desconocido con pinta de
 * dato concreto, la función nunca debe convertir ninguno de los tres en una
 * señal de `ReadinessSignals`.
 */

function tarjeta(overrides: Partial<Extract<AssistantResponse, { type: 'visionObservation' }>> = {}) {
  return {
    type: 'visionObservation' as const,
    observed: ['Se ve una malla verde tejida, aparentemente para sombra o cobertura agrícola.'],
    inferences: ['Podría ser malla raschel, a confirmar.'],
    unknown: ['Densidad exacta del tejido.', 'Certificaciones.'],
    requiresConfirmation: ['Confirmar el uso real con el cliente.'],
    ...overrides,
  };
}

describe('deriveReadinessSignalFromVision — nunca marca un campo como conocido', () => {
  it('con una observación que menciona una aplicación reconocible, igual devuelve {}', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta());
    expect(resultado).toEqual({});
  });

  it('con una inferencia que parece un dato concreto de material, igual devuelve {}', () => {
    const resultado = deriveReadinessSignalFromVision(
      tarjeta({ inferences: ['Podría ser polietileno de alta densidad (HDPE), a confirmar.'] }),
    );
    expect(resultado).toEqual({});
    // Ninguna clave del objeto vacío puede haberse poblado desde "inferences".
    expect(Object.keys(resultado)).toHaveLength(0);
  });

  it('sin ninguna inferencia (arreglo vacío), sigue devolviendo {} — nunca infiere de "unknown" tampoco', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta({ inferences: [] }));
    expect(resultado).toEqual({});
  });

  it('el resultado nunca incluye producto/cantidad/ciudad/aplicacion/contacto', () => {
    const resultado = deriveReadinessSignalFromVision(tarjeta());
    expect(resultado.productName).toBeUndefined();
    expect(resultado.cantidad).toBeUndefined();
    expect(resultado.ciudad).toBeUndefined();
    expect(resultado.aplicacion).toBeUndefined();
    expect(resultado.nombre).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PUENTE FOTO → PROYECTO — Sprint F
// ---------------------------------------------------------------------------
describe('buildVisionConfirmationPatch: sólo lo observado, y sólo como nota', () => {
  const tarjeta: Extract<AssistantResponse, { type: 'visionObservation' }> = {
    type: 'visionObservation',
    observed: ['Lona verde con desgaste visible en un borde', 'Ojales metálicos cada ~50 cm'],
    inferences: ['Podría ser polietileno de alta densidad, a confirmar'],
    unknown: ['Dimensiones exactas', 'Gramaje', 'Certificaciones'],
    requiresConfirmation: ['Medir el ancho real en obra'],
  };

  it('adjunta un tick de OBSERVADO como nota con rastro de su origen', () => {
    const patch = buildVisionConfirmationPatch(tarjeta, 0, 'vision-1');
    expect(patch).not.toBeNull();
    expect(patch!.nota).toBe(`${VISION_NOTE_PREFIX} Lona verde con desgaste visible en un borde`);
    expect(patch!.visionEvidenceIds).toEqual(['vision-1']);
  });

  it('NUNCA devuelve cantidad, ciudad, producto, aplicación ni contacto', () => {
    const patch = buildVisionConfirmationPatch(tarjeta, 0, 'vision-1')!;
    // El punto que vale dinero: una medida o una ciudad sacadas de una foto
    // serían una cotización equivocada. El patch sólo puede tocar dos campos.
    expect(Object.keys(patch).sort()).toEqual(['nota', 'visionEvidenceIds']);
    for (const campo of ['cantidad', 'ciudad', 'productoSlug', 'productName', 'aplicacion', 'nombre', 'telefono', 'email']) {
      expect(patch).not.toHaveProperty(campo);
    }
  });

  it('no hay índice que alcance una INFERENCIA o un DESCONOCIDO', () => {
    // `observed` tiene 2 elementos: cualquier índice mayor cae fuera y
    // devuelve null, aunque `inferences`/`unknown` sí tengan contenido ahí.
    expect(buildVisionConfirmationPatch(tarjeta, 2, 'vision-1')).toBeNull();
    expect(buildVisionConfirmationPatch(tarjeta, 3, 'vision-1')).toBeNull();
    expect(buildVisionConfirmationPatch(tarjeta, -1, 'vision-1')).toBeNull();
    expect(buildVisionConfirmationPatch(tarjeta, 99, 'vision-1')).toBeNull();
  });

  it('ninguna nota confirmada puede contener el texto de una inferencia o un desconocido', () => {
    const notas = tarjeta.observed.map((_, i) => buildVisionConfirmationPatch(tarjeta, i, 'v')!.nota);
    for (const prohibido of [...tarjeta.inferences, ...tarjeta.unknown]) {
      expect(notas.some((n) => n.includes(prohibido))).toBe(false);
    }
  });

  it('anexa sin perder la nota anterior y sin duplicar la misma observación', () => {
    const primera = buildVisionConfirmationPatch(tarjeta, 0, 'v1')!;
    const segunda = buildVisionConfirmationPatch(tarjeta, 1, 'v1', primera.nota)!;
    expect(segunda.nota.split('\n')).toHaveLength(2);

    const repetida = buildVisionConfirmationPatch(tarjeta, 0, 'v1', segunda.nota)!;
    expect(repetida.nota).toBe(segunda.nota);
  });

  it('respeta una nota que la persona ya había escrito en el proyecto', () => {
    const patch = buildVisionConfirmationPatch(tarjeta, 0, 'v1', 'Entrega en obra, coordinar con almacén')!;
    expect(patch.nota.startsWith('Entrega en obra, coordinar con almacén')).toBe(true);
  });

  it('rechaza un id de evidencia vacío en vez de guardar una evidencia sin origen', () => {
    expect(buildVisionConfirmationPatch(tarjeta, 0, '   ')).toBeNull();
  });

  it('confirmar una observación NO enciende ningún campo del checklist', () => {
    // La decisión original sigue intacta: la foto no marca chips. Lo
    // confirmado viaja como NOTA, no como señal estructurada.
    //
    // El propio compilador lo garantiza: `VisionConfirmationPatch` no
    // comparte ninguna propiedad con `ProjectDraftSignals`, así que
    // `mergeReadinessSignals({ draft: patch })` ni siquiera compila (TS2559).
    // Aquí se comprueba la misma invariante en tiempo de ejecución, para que
    // siga protegida si alguien ampliara alguno de los dos tipos.
    const patch = buildVisionConfirmationPatch(tarjeta, 0, 'v1')!;
    const señalesDelChecklist = [
      'productName',
      'productoSlug',
      'cantidad',
      'ciudad',
      'aplicacion',
      'nombre',
      'telefono',
      'email',
    ];
    expect(Object.keys(patch).filter((k) => señalesDelChecklist.includes(k))).toEqual([]);

    // Y con el proyecto sin más datos que esa foto, sigue sin estar listo.
    const señales = mergeReadinessSignals({ draft: {} });
    expect(señales.cantidad).toBeNull();
    expect(señales.ciudad).toBeNull();
    expect(señales.productName).toBeNull();
    expect(señales.aplicacion).toBeNull();
    expect(isReadyToQuote(buildReadinessChecklist(señales))).toBe(false);
  });
});
