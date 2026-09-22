/**
 * FUSIÓN DE SEÑALES DE READINESS — Sprint E.2, tarea 3.
 *
 * El requisito literal: "Fixture test: all 5 fields known → isReadyToQuote
 * true without depending on a live LLM call". Por eso aquí no hay ningún
 * mock de `useChat`, ni de `/api/chat`, ni del SDK de Anthropic: se le dan a
 * `mergeReadinessSignals` las mismas cuatro fuentes que el workspace le pasa
 * en producción, como objetos planos, y se comprueba el resultado. Si este
 * archivo necesitara alguna vez una clave de API para pasar, la señal
 * habría dejado de ser estructurada.
 */
import { describe, it, expect } from 'vitest';
import {
  buildReadinessChecklist,
  isReadyToQuote,
  mergeReadinessSignals,
  resolveProductSlug,
  type ReadinessSources,
} from '@/lib/ai/readiness';

/** Atajo: de fuentes a "¿enciende Listo para cotizar?". El camino real completo. */
function listo(sources: ReadinessSources): boolean {
  return isReadyToQuote(buildReadinessChecklist(mergeReadinessSignals(sources)));
}

describe('mergeReadinessSignals: los cinco campos', () => {
  it('con los 5 campos conocidos enciende "Listo para cotizar" sin tocar el modelo', () => {
    const sources: ReadinessSources = {
      draft: {
        productName: 'Lona plastificada',
        productoSlug: 'lona-plastificada',
        cantidad: '450 m²',
        ciudad: 'Arequipa',
        aplicacion: 'Cobertura agrícola',
        nombre: 'Rosa Quispe',
        telefono: '+51 999 888 777',
      },
      rfq: null,
      tools: null,
      pageContext: null,
    };

    const señales = mergeReadinessSignals(sources);
    const checklist = buildReadinessChecklist(señales);

    expect(checklist.every((c) => c.known)).toBe(true);
    expect(isReadyToQuote(checklist)).toBe(true);
  });

  it('reparte las fuentes entre las cuatro capas y aun así enciende', () => {
    // Cada campo viene de una capa distinta: es el caso real de una
    // conversación que empezó en una ficha, usó tools y terminó confirmando.
    expect(
      listo({
        pageContext: { product: { name: 'Geomembrana HDPE', slug: 'geomembrana-hdpe' } },
        tools: { aplicacion: 'Impermeabilización de pozas' },
        rfq: { cantidad: '1200 m²', nombre: 'Luis Tapia', email: 'luis@obra.pe' },
        draft: { ciudad: 'Trujillo' },
      }),
    ).toBe(true);
  });

  it('sin ninguna fuente, ningún campo se marca conocido', () => {
    const checklist = buildReadinessChecklist(mergeReadinessSignals({}));
    expect(checklist.some((c) => c.known)).toBe(false);
    expect(isReadyToQuote(checklist)).toBe(false);
  });
});

describe('mergeReadinessSignals: precedencia', () => {
  it('el borrador confirmado gana sobre buildRFQ, tools y pageContext', () => {
    const señales = mergeReadinessSignals({
      draft: { ciudad: 'Cusco', productName: 'Malla raschel' },
      rfq: { ciudad: 'Lima', producto: 'Lona plastificada' },
      tools: { productName: 'Geotextil' },
      pageContext: { product: { name: 'Big bag' } },
    });
    expect(señales.ciudad).toBe('Cusco');
    expect(señales.productName).toBe('Malla raschel');
  });

  it('buildRFQ gana sobre tools y pageContext cuando no hay borrador', () => {
    const señales = mergeReadinessSignals({
      rfq: { producto: 'Lona plastificada' },
      tools: { productName: 'Geotextil' },
      pageContext: { product: { name: 'Big bag' } },
    });
    expect(señales.productName).toBe('Lona plastificada');
  });

  it('pageContext es la última capa, no la primera', () => {
    const señales = mergeReadinessSignals({
      pageContext: { product: { name: 'Big bag' } },
    });
    expect(señales.productName).toBe('Big bag');
  });
});

describe('mergeReadinessSignals: nunca inventa', () => {
  it('una cadena vacía o de espacios no cuenta como dato conocido', () => {
    const señales = mergeReadinessSignals({
      draft: { ciudad: '   ', cantidad: '' },
      rfq: { ciudad: '', cantidad: '   ' },
    });
    expect(señales.ciudad).toBeNull();
    expect(señales.cantidad).toBeNull();

    const checklist = buildReadinessChecklist(señales);
    expect(checklist.find((c) => c.id === 'ciudad')?.known).toBe(false);
    expect(checklist.find((c) => c.id === 'cantidad')?.known).toBe(false);
  });

  it('un campo vacío en una capa cae a la siguiente, no anula la fuente', () => {
    const señales = mergeReadinessSignals({
      draft: { ciudad: '' },
      rfq: { ciudad: 'Piura' },
    });
    expect(señales.ciudad).toBe('Piura');
  });

  it('la ciudad NUNCA sale del producto, la aplicación ni el contexto de página', () => {
    // Ninguna capa tiene ciudad: aunque haya producto, hub y página, el
    // campo se queda desconocido. Adivinarla es el error que se prohíbe.
    const señales = mergeReadinessSignals({
      pageContext: { product: { name: 'Lona para Lima', slug: 'lona-lima' } },
      tools: { aplicacion: 'Cobertura en Arequipa' },
      rfq: { producto: 'Lona plastificada' },
    });
    expect(señales.ciudad).toBeNull();
  });

  it('contacto exige nombre + (teléfono o email), nunca uno solo', () => {
    const soloNombre = buildReadinessChecklist(mergeReadinessSignals({ draft: { nombre: 'Ana' } }));
    expect(soloNombre.find((c) => c.id === 'contacto')?.known).toBe(false);

    const soloTelefono = buildReadinessChecklist(
      mergeReadinessSignals({ draft: { telefono: '+51 900 000 000' } }),
    );
    expect(soloTelefono.find((c) => c.id === 'contacto')?.known).toBe(false);

    const completo = buildReadinessChecklist(
      mergeReadinessSignals({ draft: { nombre: 'Ana', email: 'ana@obra.pe' } }),
    );
    expect(completo.find((c) => c.id === 'contacto')?.known).toBe(true);
  });

  it('cuatro campos conocidos y uno desconocido NO encienden el estado listo', () => {
    expect(
      listo({
        draft: {
          productName: 'Lona plastificada',
          cantidad: '450 m²',
          aplicacion: 'Cobertura agrícola',
          nombre: 'Rosa Quispe',
          telefono: '+51 999 888 777',
          // falta ciudad
        },
      }),
    ).toBe(false);
  });
});

describe('resolveProductSlug: el slug no se pierde', () => {
  it('sigue la misma precedencia que las señales', () => {
    expect(
      resolveProductSlug({
        draft: { productoSlug: 'malla-raschel' },
        rfq: { slug: 'lona-plastificada' },
        pageContext: { product: { slug: 'big-bag' } },
      }),
    ).toBe('malla-raschel');
  });

  it('cae a buildRFQ y luego al contexto de página', () => {
    expect(resolveProductSlug({ rfq: { slug: 'lona-plastificada' }, pageContext: { product: { slug: 'big-bag' } } })).toBe(
      'lona-plastificada',
    );
    expect(resolveProductSlug({ pageContext: { product: { slug: 'big-bag' } } })).toBe('big-bag');
  });

  it('sin ninguna fuente devuelve null en vez de un slug inventado', () => {
    expect(resolveProductSlug({})).toBeNull();
    expect(resolveProductSlug({ rfq: { producto: 'Lona plastificada' } })).toBeNull();
  });
});
