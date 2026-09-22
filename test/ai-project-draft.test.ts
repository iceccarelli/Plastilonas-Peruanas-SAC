// @vitest-environment jsdom
/**
 * BORRADOR DE PROYECTO — Sprint E.2, tarea 1.
 *
 * Lo que estas pruebas protegen no es "que guarde": es que NUNCA pueda
 * guardar un dato que nadie dio. Un chip en verde es una promesa de que el
 * dato es correcto, y un `''` guardado —o un patch vacío que borra una
 * ciudad ya confirmada— rompe esa promesa en silencio.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  PROJECT_DRAFT_FIELDS,
  PROJECT_DRAFT_STORAGE_KEY,
  clearProjectDraft,
  clearProjectDraftField,
  mergeProjectDraft,
  normalizeDraftValue,
  patchProjectDraft,
  readProjectDraft,
  sanitizeProjectDraft,
  writeProjectDraft,
} from '@/lib/ai/project-draft';

beforeEach(() => {
  window.localStorage.clear();
});

describe('normalizeDraftValue', () => {
  it('recorta espacios y conserva el dato', () => {
    expect(normalizeDraftValue('ciudad', '  Arequipa  ')).toBe('Arequipa');
  });

  it('descarta vacíos, espacios y no-strings', () => {
    expect(normalizeDraftValue('ciudad', '')).toBeUndefined();
    expect(normalizeDraftValue('ciudad', '   ')).toBeUndefined();
    expect(normalizeDraftValue('ciudad', 42)).toBeUndefined();
    expect(normalizeDraftValue('ciudad', null)).toBeUndefined();
    expect(normalizeDraftValue('ciudad', { toString: () => 'Lima' })).toBeUndefined();
  });

  it('recorta al tope de LeadSchema en vez de producir un payload que /api/lead rechace', () => {
    expect(normalizeDraftValue('ciudad', 'x'.repeat(200))).toHaveLength(80);
    expect(normalizeDraftValue('telefono', '9'.repeat(100))).toHaveLength(40);
    expect(normalizeDraftValue('nota', 'x'.repeat(5000))).toHaveLength(4000);
  });
});

describe('sanitizeProjectDraft', () => {
  it('ignora entradas que no son objetos', () => {
    expect(sanitizeProjectDraft(null)).toEqual({});
    expect(sanitizeProjectDraft('Lima')).toEqual({});
    expect(sanitizeProjectDraft(['Lima'])).toEqual({});
  });

  it('descarta campos desconocidos y valores vacíos', () => {
    const limpio = sanitizeProjectDraft({
      ciudad: 'Lima',
      cantidad: '  ',
      precio: '90 soles/m²', // campo inventado: no existe en el borrador
      verificado: true,
    });
    expect(limpio).toEqual({ ciudad: 'Lima' });
    expect('precio' in limpio).toBe(false);
    expect('verificado' in limpio).toBe(false);
  });

  it('deduplica y acota las evidencias de foto', () => {
    const limpio = sanitizeProjectDraft({
      visionEvidenceIds: ['a', 'a', ' b ', '', 42],
    });
    expect(limpio.visionEvidenceIds).toEqual(['a', 'b']);
  });
});

describe('mergeProjectDraft', () => {
  it('un patch vacío nunca borra lo ya confirmado', () => {
    const base = { ciudad: 'Cusco', cantidad: '300 m²' };
    expect(mergeProjectDraft(base, {})).toMatchObject(base);
    expect(mergeProjectDraft(base, { ciudad: undefined })).toMatchObject(base);
    expect(mergeProjectDraft(base, { ciudad: '' })).toMatchObject(base);
    expect(mergeProjectDraft(base, { ciudad: '   ' })).toMatchObject(base);
  });

  it('un valor nuevo sí reemplaza al anterior', () => {
    expect(mergeProjectDraft({ ciudad: 'Cusco' }, { ciudad: 'Piura' }).ciudad).toBe('Piura');
  });

  it('acumula evidencias de foto sin duplicar', () => {
    const uno = mergeProjectDraft({}, { visionEvidenceIds: ['v1'] });
    const dos = mergeProjectDraft(uno, { visionEvidenceIds: ['v1', 'v2'] });
    expect(dos.visionEvidenceIds).toEqual(['v1', 'v2']);
  });

  it('sella updatedAt sólo cuando algo cambió de verdad', () => {
    const base = mergeProjectDraft({}, { ciudad: 'Lima' });
    expect(typeof base.updatedAt).toBe('number');
    const sinCambio = mergeProjectDraft({ ciudad: 'Lima' }, { ciudad: 'Lima' });
    expect(sinCambio.updatedAt).toBeUndefined();
  });
});

describe('persistencia en localStorage', () => {
  it('escribe, lee y sobrevive a una recarga', () => {
    writeProjectDraft({ ciudad: 'Trujillo', productoSlug: 'lona-plastificada' });
    expect(readProjectDraft()).toMatchObject({ ciudad: 'Trujillo', productoSlug: 'lona-plastificada' });
  });

  it('patchProjectDraft funde sobre lo guardado en vez de reemplazarlo', () => {
    patchProjectDraft({ ciudad: 'Trujillo' }, 'confirmado');
    patchProjectDraft({ cantidad: '500 m²' }, 'rfq');
    expect(readProjectDraft()).toMatchObject({ ciudad: 'Trujillo', cantidad: '500 m²' });
  });

  it('un buildRFQ posterior sin ciudad no tumba la ciudad ya confirmada', () => {
    patchProjectDraft({ ciudad: 'Trujillo' }, 'confirmado');
    patchProjectDraft({ productName: 'Lona plastificada', ciudad: undefined }, 'rfq');
    expect(readProjectDraft().ciudad).toBe('Trujillo');
  });

  it('clearProjectDraftField borra un solo campo; es el único camino para borrar', () => {
    patchProjectDraft({ ciudad: 'Trujillo', cantidad: '500 m²' }, 'confirmado');
    const tras = clearProjectDraftField('ciudad');
    expect(tras.ciudad).toBeUndefined();
    expect(tras.cantidad).toBe('500 m²');
    expect(readProjectDraft().ciudad).toBeUndefined();
  });

  it('clearProjectDraft deja el borrador vacío', () => {
    patchProjectDraft({ ciudad: 'Trujillo' }, 'confirmado');
    clearProjectDraft();
    expect(readProjectDraft()).toEqual({});
  });

  it('no lanza ni contagia basura si localStorage trae JSON inválido', () => {
    window.localStorage.setItem(PROJECT_DRAFT_STORAGE_KEY, '{no es json');
    expect(() => readProjectDraft()).not.toThrow();
    expect(readProjectDraft()).toEqual({});
  });

  it('no lanza si localStorage está bloqueado (modo privado)', () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => writeProjectDraft({ ciudad: 'Lima' })).not.toThrow();
    window.localStorage.setItem = original;
  });

  it('guarda bajo su propia clave, sin pisar el borrador del formulario ni el id de proyecto', () => {
    window.localStorage.setItem('pp_rfq_borrador', '{"producto":"otro"}');
    window.localStorage.setItem('pp_asistente_project_id', 'proj_abc');
    patchProjectDraft({ ciudad: 'Lima' }, 'confirmado');
    expect(window.localStorage.getItem('pp_rfq_borrador')).toBe('{"producto":"otro"}');
    expect(window.localStorage.getItem('pp_asistente_project_id')).toBe('proj_abc');
    expect(PROJECT_DRAFT_STORAGE_KEY).toBe('pp_asistente_project_draft');
  });
});

describe('contrato de campos', () => {
  it('expone exactamente los campos que el sprint pidió, sin colarse un precio', () => {
    expect([...PROJECT_DRAFT_FIELDS]).toEqual([
      'productoSlug',
      'productName',
      'cantidad',
      'ciudad',
      'aplicacion',
      'nombre',
      'telefono',
      'email',
      'nota',
    ]);
    expect(PROJECT_DRAFT_FIELDS).not.toContain('precio');
    expect(PROJECT_DRAFT_FIELDS).not.toContain('certificacion');
  });
});
