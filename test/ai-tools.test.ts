import { describe, it, expect } from 'vitest';
import {
  chatTools,
  searchProducts,
  getProduct,
  compareProducts,
  getProductFamily,
  getApplication,
  getGuide,
  getCompanyFact,
  getFrameworkRequirement,
  listCalculations,
  runCalculation,
  getGlossaryTerm,
  getPublishedProjects,
  buildRFQ,
} from '@/lib/ai/tools';
import { products, productFamilies } from '@/lib/products';
import { STATS } from '@/lib/facts';
import { pillars } from '@/lib/framework';
import { calculadoras } from '@/lib/calculadoras';
import { projects, projectsPublicados } from '@/lib/projects';
import { terminos } from '@/lib/glosario';

/**
 * LAS TOOLS SOLO PUEDEN DEVOLVER LO QUE YA EXISTE EN LAS LIBS DE DOMINIO.
 *
 * Estas pruebas no verifican "¿el modelo eligió bien la tool?" (eso es un
 * comportamiento del LLM, no de este código) sino la garantía que SÍ puede
 * comprobarse en CI: cada tool, dado un input, responde con datos que están
 * en la lib real y nunca con un campo fabricado por la tool misma.
 */

// Cada tool exportada por `tool()` de la AI SDK trae `execute`; helper para no
// repetir el `!` en cada test.
function exec<T extends { execute?: (...args: any[]) => any }>(t: T) {
  if (!t.execute) throw new Error('tool sin execute');
  return t.execute;
}

describe('registro de tools: forma general', () => {
  it('expone exactamente las tools documentadas para el chat', () => {
    expect(Object.keys(chatTools).sort()).toEqual(
      [
        'searchProducts',
        'getProduct',
        'compareProducts',
        'getProductFamily',
        'getApplication',
        'getGuide',
        'getCompanyFact',
        'getFrameworkRequirement',
        'listCalculations',
        'runCalculation',
        'getGlossaryTerm',
        'getPublishedProjects',
        'buildRFQ',
      ].sort(),
    );
  });
});

describe('searchProducts', () => {
  it('solo devuelve productos que existen en lib/products.ts', async () => {
    const out = await exec(searchProducts)({ query: 'malla' }, {} as any);
    expect(out.products.length).toBeGreaterThan(0);
    for (const p of out.products) {
      const real = products.find((item) => item.slug === p.slug);
      expect(real, `slug fabricado: ${p.slug}`).toBeDefined();
      expect(p.name).toBe(real!.name);
      expect(p.url).toBe(`/productos/${real!.slug}`);
    }
  });

  it('una búsqueda sin coincidencias devuelve una lista vacía, no resultados inventados', async () => {
    const out = await exec(searchProducts)({ query: 'xyz-inexistente-000' }, {} as any);
    expect(out.count).toBe(0);
    expect(out.products).toEqual([]);
  });

  it('filtra por categoría real', async () => {
    const categoria = productFamilies[0].name;
    const out = await exec(searchProducts)({ category: categoria, limit: 20 }, {} as any);
    for (const p of out.products) expect(p.category).toBe(categoria);
  });
});

describe('getProduct', () => {
  it('devuelve la ficha real para un slug existente, sin inventar precio', async () => {
    const real = products.find((p) => !p.purchasable)!;
    const out = await exec(getProduct)({ slug: real.slug }, {} as any);
    expect(out.found).toBe(true);
    expect(out.product.name).toBe(real.name);
    expect(out.product.price).toBeNull();
  });

  it('un slug inexistente responde found:false, nunca una ficha fabricada', async () => {
    const out = await exec(getProduct)({ slug: 'no-existe-este-producto' }, {} as any);
    expect(out.found).toBe(false);
    expect(out.product).toBeUndefined();
  });
});

describe('compareProducts', () => {
  it('compara solo productos reales y reporta los que faltan', async () => {
    const [a, b] = products;
    const out = await exec(compareProducts)({ slugs: [a.slug, b.slug, 'inexistente'] }, {} as any);
    expect(out.products.map((p: any) => p.slug).sort()).toEqual([a.slug, b.slug].sort());
    expect(out.missing).toEqual(['inexistente']);
  });
});

describe('getProductFamily', () => {
  it('sin argumentos, lista exactamente las familias reales', async () => {
    const out = await exec(getProductFamily)({}, {} as any);
    expect(out.families.map((f: any) => f.name).sort()).toEqual(
      productFamilies.map((f) => f.name).sort(),
    );
  });

  it('con una familia real, los productos devueltos pertenecen a ella', async () => {
    const categoria = productFamilies[0].name;
    const out = await exec(getProductFamily)({ category: categoria }, {} as any);
    expect(out.found).toBe(true);
    for (const p of out.products) expect(p.category).toBe(categoria);
  });

  it('una familia inexistente responde found:false', async () => {
    const out = await exec(getProductFamily)({ category: 'Familia Que No Existe' }, {} as any);
    expect(out.found).toBe(false);
  });
});

describe('getApplication / getGuide / getGlossaryTerm', () => {
  it('getApplication sin slug lista aplicaciones reales', async () => {
    const out = await exec(getApplication)({}, {} as any);
    expect(Array.isArray(out.applications)).toBe(true);
    expect(out.applications.length).toBeGreaterThan(0);
  });

  it('getGuide con slug inexistente no inventa una guía', async () => {
    const out = await exec(getGuide)({ slug: 'guia-inventada-xyz' }, {} as any);
    expect(out.found).toBe(false);
  });

  it('getGlossaryTerm por texto encuentra un término real del glosario', async () => {
    const t = terminos[0];
    const fragmento = t.termino.slice(0, Math.min(4, t.termino.length)).toLowerCase();
    const out = await exec(getGlossaryTerm)({ termino: fragmento }, {} as any);
    expect(out.found).toBe(true);
    expect(terminos.some((item) => item.slug === out.termino.slug)).toBe(true);
  });
});

describe('getCompanyFact: única fuente de cifras', () => {
  it('devuelve exactamente los valores de lib/facts.ts, nunca un número aparte', async () => {
    const out = await exec(getCompanyFact)({ fact: 'all' }, {} as any);
    expect(out.stats).toEqual(STATS);
  });

  it('un fact individual coincide con STATS', async () => {
    const out = await exec(getCompanyFact)({ fact: 'productos' }, {} as any);
    expect(out.value).toBe(STATS.productos);
  });
});

describe('getFrameworkRequirement', () => {
  it('sin argumentos, lista los pilares reales', async () => {
    const out = await exec(getFrameworkRequirement)({}, {} as any);
    expect(out.pillars.map((p: any) => p.id).sort()).toEqual(pillars.map((p) => p.id).sort());
  });

  it('con un pillarId real, devuelve sus criterios reales', async () => {
    const pillar = pillars[0];
    const out = await exec(getFrameworkRequirement)({ pillarId: pillar.id }, {} as any);
    expect(out.found).toBe(true);
    expect(out.pillar.criterios.length).toBe(pillar.criterios.length);
  });
});

describe('listCalculations / runCalculation', () => {
  it('listCalculations enumera exactamente las calculadoras reales', async () => {
    const out = await exec(listCalculations)({}, {} as any);
    expect(out.calculadoras.map((c: any) => c.slug).sort()).toEqual(
      calculadoras.map((c) => c.slug).sort(),
    );
  });

  it('runCalculation usa la fórmula pura real y respeta noCubre publicado', async () => {
    const calc = calculadoras[0];
    const out = await exec(runCalculation)({ slug: calc.slug, valores: {} }, {} as any);
    expect(out.found).toBe(true);
    expect(out.noCubre).toEqual(calc.noCubre);
    expect(out.salida.principales.length).toBeGreaterThan(0);
  });

  it('un slug de calculadora inexistente no calcula nada (degrada found:false)', async () => {
    const out = await exec(runCalculation)({ slug: 'no-existe' as any, valores: {} }, {} as any);
    expect(out.found).toBe(false);
  });
});

describe('getPublishedProjects: solo obras verificadas', () => {
  it('nunca devuelve un proyecto con verificado:false', async () => {
    const out = await exec(getPublishedProjects)({}, {} as any);
    for (const p of out.projects) {
      const real = projects.find((item) => item.slug === p.slug);
      expect(real?.verificado).toBe(true);
    }
    expect(out.count).toBe(projectsPublicados.length);
  });
});

describe('buildRFQ: nunca inventa datos de contacto ni hace un POST', () => {
  it('no incluye execute con efectos de red: solo arma el payload', async () => {
    const out = await exec(buildRFQ)(
      { producto: 'mallas-antiafidas', cantidad: '10 rollos' },
      {} as any,
    );
    expect(out.payload.origen).toBe('chat');
    expect(out.payload.nombre).toBeUndefined();
    expect(out.payload.email).toBeUndefined();
    expect(out.readyToSubmit).toBe(false);
    expect(out.missingFields).toEqual(expect.arrayContaining(['nombre', 'email', 'telefono']));
    expect(out.submitTo).toBe('/api/lead');
  });

  it('con los tres campos de contacto, queda listo para enviar', async () => {
    const out = await exec(buildRFQ)(
      {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+51999999999',
        producto: 'lona-plastificada-rafia-polytarp',
      },
      {} as any,
    );
    expect(out.readyToSubmit).toBe(true);
    expect(out.missingFields).toEqual([]);
  });
});
