/**
 * REGISTRO DE TOOLS PARA EL ASISTENTE — Fase 1.
 *
 * Cada tool aquí es una envoltura tipada (Zod) sobre una lib de dominio que
 * YA existe (ver docs/entregas/2026-09-21-plastilonas-ai-audit.md). Ninguna
 * tool inventa datos: cada una lee de la lib correspondiente y devuelve `null`
 * / una lista vacía / un mensaje explícito cuando no encuentra algo, en vez
 * de dejar que el modelo rellene el hueco.
 *
 * REGLAS DE HONESTIDAD QUE ESTE ARCHIVO HACE CUMPLIR EN CÓDIGO (no en prompt):
 *  - `getPublishedProjects` usa `projectsPublicados` (solo `verificado: true`),
 *    nunca el arreglo `projects` crudo.
 *  - `getCompanyFact` solo puede devolver números que vienen de `lib/facts.ts`.
 *  - `buildRFQ` NUNCA hace un POST: da forma a un payload para que la UI lo
 *    envíe a `/api/lead` (el único endpoint de creación de leads), y solo con
 *    los campos que el llamador pasó — no inventa nombre, email ni teléfono.
 *  - `runCalculation` no acepta fórmulas nuevas: solo ejecuta las funciones
 *    puras ya publicadas en `lib/calculadoras.ts` para un slug existente.
 *
 * Server-only por convención: este módulo importa libs de servidor y no debe
 * importarse desde un componente de cliente (el paquete `server-only` no es
 * una dependencia de este repo, así que la restricción es documental, igual
 * que en el resto de libs de `lib/`).
 */
import { z } from 'zod';
import { tool } from 'ai';

import { products, productFamilies, sourcingLabels } from '@/lib/products';
import { STATS, YEARS_STATEMENT, COUNT_STATEMENT } from '@/lib/facts';
import { pillars, allCriteria, type PillarId } from '@/lib/framework';
import {
  calculadoras,
  calculadoraPorSlug,
  valoresIniciales,
} from '@/lib/calculadoras';
import { guides, guideBySlug } from '@/lib/guides';
import { applications, applicationBySlug } from '@/lib/applications';
import { terminos, terminoBySlug } from '@/lib/glosario';
import { projectsPublicados } from '@/lib/projects';

// -----------------------------------------------------------------------------
// Helpers de presentación (recortes honestos: solo campos que ya existen).
// -----------------------------------------------------------------------------

function productSummary(p: (typeof products)[number]) {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    sector: p.sector,
    shortDescription: p.shortDescription,
    sourcing: p.sourcing ?? null,
    sourcingLabel: p.sourcing ? sourcingLabels[p.sourcing] ?? null : null,
    availability: p.availability ?? 'a_medida',
    url: `/productos/${p.slug}`,
  };
}

function productDetail(p: (typeof products)[number]) {
  return {
    ...productSummary(p),
    description: p.description,
    specifications: p.specifications,
    applications: p.applications,
    benefits: p.benefits,
    leadTime: p.leadTime ?? null,
    documentation: p.documentation ?? null,
    // Precio: solo si el producto está marcado como comprable en línea. Nunca
    // se inventa ni se estima uno para el resto (regla de "no precios públicos").
    price: p.purchasable && typeof p.price === 'number' ? p.price : null,
    priceUnit: p.purchasable ? p.priceUnit ?? null : null,
  };
}

const CalculatorSlugEnum = z.enum(
  calculadoras.map((c) => c.slug) as [string, ...string[]],
);

// -----------------------------------------------------------------------------
// 1. searchProducts
// -----------------------------------------------------------------------------
export const searchProducts = tool({
  description:
    'Busca productos reales del catálogo de Plastilonas por texto libre, familia (category) o sector. ' +
    'Úsala en vez de recordar el catálogo de memoria: solo devuelve lo que existe en lib/products.ts.',
  parameters: z.object({
    query: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe('Texto libre a buscar en nombre, descripción corta o aplicaciones.'),
    category: z
      .string()
      .trim()
      .optional()
      .describe('Familia exacta, p.ej. "Lonas y Cobertores". Ver getProductFamily para la lista.'),
    sector: z
      .string()
      .trim()
      .optional()
      .describe('Sector exacto, p.ej. "Minería", "Agricultura".'),
    limit: z.number().int().min(1).max(20).optional(),
  }),
  execute: async ({ query, category, sector, limit }) => {
    const q = query?.toLowerCase();
    const results = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (sector && !p.sector.includes(sector)) return false;
      if (q) {
        const haystack = [
          p.name,
          p.shortDescription,
          p.category,
          ...p.applications,
          ...p.sector,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    const capped = results.slice(0, limit ?? 8);
    return {
      count: results.length,
      products: capped.map(productSummary),
    };
  },
});

// -----------------------------------------------------------------------------
// 2. getProduct
// -----------------------------------------------------------------------------
export const getProduct = tool({
  description: 'Devuelve la ficha completa de un producto real por su slug exacto.',
  parameters: z.object({
    slug: z.string().trim().describe('Slug del producto, p.ej. "mallas-antiafidas".'),
  }),
  execute: async ({ slug }) => {
    const p = products.find((item) => item.slug === slug);
    if (!p) {
      return { found: false, slug, message: 'No existe un producto con ese slug en el catálogo.' };
    }
    return { found: true, product: productDetail(p) };
  },
});

// -----------------------------------------------------------------------------
// 3. compareProducts
// -----------------------------------------------------------------------------
export const compareProducts = tool({
  description:
    'Compara 2 a 4 productos reales lado a lado (categoría, sector, sourcing, especificaciones). ' +
    'Nunca compara contra un competidor: solo entre líneas del propio catálogo.',
  parameters: z.object({
    slugs: z.array(z.string().trim()).min(2).max(4),
  }),
  execute: async ({ slugs }) => {
    const found = slugs
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is (typeof products)[number] => Boolean(p));
    const missing = slugs.filter((slug) => !found.some((p) => p.slug === slug));
    return {
      products: found.map(productDetail),
      missing,
    };
  },
});

// -----------------------------------------------------------------------------
// 4. getProductFamily
// -----------------------------------------------------------------------------
export const getProductFamily = tool({
  description:
    'Devuelve una familia de producto (category) con su tagline y los productos reales que contiene. ' +
    'Sin argumentos, lista todas las familias.',
  parameters: z.object({
    category: z
      .string()
      .trim()
      .optional()
      .describe('Nombre exacto de la familia, p.ej. "Envases y Embalaje".'),
  }),
  execute: async ({ category }) => {
    if (!category) {
      return {
        families: productFamilies.map((f) => ({
          ...f,
          productCount: products.filter((p) => p.category === f.name).length,
        })),
      };
    }
    const family = productFamilies.find((f) => f.name === category);
    if (!family) {
      return { found: false, category, message: 'No existe esa familia en el catálogo.' };
    }
    return {
      found: true,
      family,
      products: products.filter((p) => p.category === family.name).map(productSummary),
    };
  },
});

// -----------------------------------------------------------------------------
// 5. getApplication
// -----------------------------------------------------------------------------
export const getApplication = tool({
  description:
    'Devuelve una aplicación/hub real (problema, enfoque, productos asociados y límites declarados: notClaimed). ' +
    'Sin slug, lista las aplicaciones disponibles.',
  parameters: z.object({
    slug: z.string().trim().optional(),
  }),
  execute: async ({ slug }) => {
    if (!slug) {
      return { applications: applications.map((a) => ({ slug: a.slug, name: a.name })) };
    }
    const app = applicationBySlug(slug);
    if (!app) {
      return { found: false, slug, message: 'No existe esa aplicación.' };
    }
    return { found: true, application: app, url: `/aplicaciones/${app.slug}` };
  },
});

// -----------------------------------------------------------------------------
// 6. getGuide
// -----------------------------------------------------------------------------
export const getGuide = tool({
  description:
    'Devuelve una guía técnica real (secciones, productos y sectores relacionados). ' +
    'Sin slug, lista las guías disponibles con su ruta real en /recursos.',
  parameters: z.object({
    slug: z.string().trim().optional(),
  }),
  execute: async ({ slug }) => {
    if (!slug) {
      return {
        guides: guides.map((g) => ({ slug: g.slug, title: g.title, url: `/recursos/${g.slug}` })),
      };
    }
    const guide = guideBySlug(slug);
    if (!guide) {
      return { found: false, slug, message: 'No existe esa guía.' };
    }
    return { found: true, guide, url: `/recursos/${guide.slug}` };
  },
});

// -----------------------------------------------------------------------------
// 7. getCompanyFact
// -----------------------------------------------------------------------------
const CompanyFactKey = z.enum([
  'anios',
  'productos',
  'familias',
  'fabricacionPropia',
  'all',
]);

export const getCompanyFact = tool({
  description:
    'ÚNICA fuente permitida para cifras de la empresa (años operando, cantidad de productos, ' +
    'familias, cuántas líneas se fabrican en planta propia). Nunca afirmes un número que no venga de aquí.',
  parameters: z.object({
    fact: CompanyFactKey.describe('Qué cifra pedir, o "all" para todas.'),
  }),
  execute: async ({ fact }) => {
    if (fact === 'all') {
      return { stats: STATS, yearsStatement: YEARS_STATEMENT, countStatement: COUNT_STATEMENT };
    }
    return { fact, value: STATS[fact as keyof typeof STATS] };
  },
});

// -----------------------------------------------------------------------------
// 8. getFrameworkRequirement
// -----------------------------------------------------------------------------
const PillarIdEnum = z.enum(
  pillars.map((p) => p.id) as [PillarId, ...PillarId[]],
);

export const getFrameworkRequirement = tool({
  description:
    'Devuelve pilares y criterios reales del Marco de Especificación (lib/framework.ts): ' +
    'qué pregunta hacer, por qué importa y qué riesgo corre un proyecto sin ese dato. ' +
    'Sin argumentos, lista los pilares. Con pillarId, devuelve sus criterios.',
  parameters: z.object({
    pillarId: PillarIdEnum.optional(),
    criterionId: z.string().trim().optional().describe('Id de un criterio específico dentro del pilar.'),
  }),
  execute: async ({ pillarId, criterionId }) => {
    if (!pillarId) {
      return {
        pillars: pillars.map((p) => ({ id: p.id, nombre: p.nombre, resumen: p.resumen })),
        totalCriteria: allCriteria().length,
      };
    }
    const pillar = pillars.find((p) => p.id === pillarId);
    if (!pillar) {
      return { found: false, pillarId, message: 'No existe ese pilar.' };
    }
    if (criterionId) {
      const criterion = pillar.criterios.find((c) => c.id === criterionId);
      if (!criterion) {
        return { found: false, pillarId, criterionId, message: 'No existe ese criterio en el pilar.' };
      }
      return { found: true, pillar: { id: pillar.id, nombre: pillar.nombre }, criterion };
    }
    return { found: true, pillar };
  },
});

// -----------------------------------------------------------------------------
// 9. listCalculations
// -----------------------------------------------------------------------------
export const listCalculations = tool({
  description:
    'Lista las calculadoras de predimensionamiento reales (lib/calculadoras.ts): slug, pregunta que ' +
    'responden y los campos numéricos que piden. Úsala antes de runCalculation para saber qué slug y ' +
    'qué campos existen — nunca inventes un slug de calculadora.',
  parameters: z.object({}),
  execute: async () => ({
    calculadoras: calculadoras.map((c) => ({
      slug: c.slug,
      pregunta: c.pregunta,
      resumen: c.resumen,
      area: c.area,
      url: `/calculadoras/${c.slug}`,
      campos: c.campos.map((campo) => ({
        id: campo.id,
        etiqueta: campo.etiqueta,
        unidad: campo.unidad,
        porDefecto: campo.porDefecto,
        esSupuesto: campo.esSupuesto ?? false,
      })),
    })),
  }),
});

// -----------------------------------------------------------------------------
// 10. runCalculation
// -----------------------------------------------------------------------------
export const runCalculation = tool({
  description:
    'Ejecuta una calculadora real de predimensionamiento con los valores que el usuario dio. ' +
    'NO es un cálculo de ingeniería firmado: usa siempre los avisos y noCubre que la calculadora devuelve. ' +
    'Los campos que falten se completan con el valor por defecto publicado de la calculadora, nunca con un ' +
    'número inventado por el modelo — pide el dato real al usuario si es crítico.',
  parameters: z.object({
    slug: CalculatorSlugEnum,
    valores: z
      .record(z.string(), z.number())
      .describe('Mapa campoId -> valor numérico. Los campos omitidos usan su valor por defecto publicado.'),
  }),
  execute: async ({ slug, valores }) => {
    const calc = calculadoraPorSlug(slug);
    if (!calc) {
      return { found: false, slug, message: 'No existe esa calculadora.' };
    }
    const base = valoresIniciales(calc);
    const merged: Record<string, number> = { ...base };
    for (const campo of calc.campos) {
      const v = valores[campo.id];
      if (typeof v === 'number' && Number.isFinite(v)) merged[campo.id] = v;
    }
    const salida = calc.calcular(merged);
    return {
      found: true,
      slug: calc.slug,
      titulo: calc.titulo,
      formula: calc.formula,
      valoresUsados: merged,
      salida,
      noCubre: calc.noCubre,
    };
  },
});

// -----------------------------------------------------------------------------
// 11. getGlossaryTerm
// -----------------------------------------------------------------------------
export const getGlossaryTerm = tool({
  description:
    'Define un término técnico real del glosario (definición corta citable + por qué importa). ' +
    'Úsala para cualquier sigla o palabra técnica en vez de definirla de memoria.',
  parameters: z.object({
    slug: z.string().trim().optional().describe('Slug del término. Si no se sabe, usa "termino" para buscar por texto.'),
    termino: z.string().trim().optional().describe('Texto del término a buscar cuando no se conoce el slug.'),
  }),
  execute: async ({ slug, termino }) => {
    if (slug) {
      const t = terminoBySlug(slug);
      if (!t) return { found: false, slug, message: 'No existe ese término.' };
      return { found: true, termino: t, url: `/glosario/${t.slug}` };
    }
    if (termino) {
      const q = termino.toLowerCase();
      const t = terminos.find(
        (item) =>
          item.termino.toLowerCase().includes(q) ||
          item.siglas?.toLowerCase() === q ||
          item.alias?.some((a) => a.toLowerCase().includes(q)),
      );
      if (!t) return { found: false, termino, message: 'No existe ese término en el glosario.' };
      return { found: true, termino: t, url: `/glosario/${t.slug}` };
    }
    return { found: false, message: 'Provee slug o termino.' };
  },
});

// -----------------------------------------------------------------------------
// 12. getPublishedProjects
// -----------------------------------------------------------------------------
export const getPublishedProjects = tool({
  description:
    'Lista proyectos/obras REALES y verificados (nunca inventes un cliente u obra que no esté aquí). ' +
    'Usa exclusivamente projectsPublicados (verificado=true); puede devolver una lista vacía, y eso es correcto: ' +
    'en ese caso di honestamente que no hay evidencia publicada todavía.',
  parameters: z.object({
    sector: z.string().trim().optional().describe('Filtra por industrySlug si se conoce.'),
  }),
  execute: async ({ sector }) => {
    const list = sector
      ? projectsPublicados.filter((p) => p.industrySlug === sector)
      : projectsPublicados;
    return {
      count: list.length,
      projects: list.map((p) => ({
        slug: p.slug,
        title: p.title,
        client: p.client,
        industrySlug: p.industrySlug,
        country: p.country,
        yearLabel: p.yearLabel,
      })),
      url: '/proyectos',
    };
  },
});

// -----------------------------------------------------------------------------
// 13. buildRFQ
// -----------------------------------------------------------------------------
// Recorte del contrato real de app/api/lead/route.ts (LeadSchema). Se declara
// aparte y no se importa desde la ruta porque esa ruta es 'use server' de
// Next (no exporta el schema) y porque queremos que un cambio de shape en la
// tool sea explícito en el diff, no un import silencioso. Los campos y sus
// límites de longitud deben mantenerse en sync con LeadSchema si esa cambia.
const RFQPayloadSchema = z.object({
  nombre: z.string().trim().min(1).max(120).optional(),
  empresa: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(180).optional(),
  telefono: z.string().trim().min(6).max(40).optional(),
  producto: z.string().trim().max(200).optional(),
  cantidad: z.string().trim().max(80).optional(),
  ciudad: z.string().trim().max(80).optional(),
  mensaje: z.string().trim().max(4000).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
  slug: z.string().trim().max(120).optional(),
  origen: z.literal('chat').default('chat'),
});

export const buildRFQ = tool({
  description:
    'Da FORMA a una solicitud de cotización con los datos que el usuario ya proporcionó en la conversación, ' +
    'lista para que la interfaz la envíe a POST /api/lead. Esta tool NUNCA envía la solicitud ni crea el lead — ' +
    'solo arma el payload. NUNCA inventes nombre, email, teléfono, empresa o ciudad: si el usuario no los dio, ' +
    'déjalos fuera y dilo en missingFields. `ciudad` es la ciudad de ENTREGA del pedido — solo se llena cuando el ' +
    'usuario la dijo explícitamente, nunca se adivina de otro dato (ej. no asumas la ciudad de una obra o sector). ' +
    'El origen siempre es "chat".',
  parameters: RFQPayloadSchema.omit({ origen: true }),
  execute: async (input) => {
    const payload = RFQPayloadSchema.parse({ ...input, origen: 'chat' });
    const missingFields = (['nombre', 'email', 'telefono'] as const).filter(
      (field) => !payload[field],
    );
    return {
      payload,
      readyToSubmit: missingFields.length === 0,
      missingFields,
      submitTo: '/api/lead',
      note: 'La UI debe hacer POST a /api/lead con este payload; esta tool no lo envía.',
    };
  },
});

// -----------------------------------------------------------------------------
// Registro completo — se pasa tal cual a `streamText({ tools: chatTools })`.
// -----------------------------------------------------------------------------
export const chatTools = {
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
};

export type ChatToolName = keyof typeof chatTools;
