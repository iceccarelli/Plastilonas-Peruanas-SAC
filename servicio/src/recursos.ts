import { leerDelSitio, catalogo } from './sitio';
import { catalogoDeCalculos, ADVERTENCIA_CALCULO } from './calculos';
import { SITIO } from './config';
import { LIMITES_GLOBALES } from './contrato';

/**
 * RECURSOS MCP — lo que un cliente puede LEER sin gastar una llamada a
 * herramienta, y cachear.
 *
 * Un servidor MCP tiene tres primitivas, y casi todos los que circulan publican
 * sólo una. La diferencia importa:
 *
 *   HERRAMIENTAS. El modelo decide llamarlas. Cada llamada cuesta un turno y
 *   una decisión, y el modelo sólo llama lo que cree que necesita.
 *   RECURSOS. El CLIENTE los lee y los adjunta al contexto. No hay decisión que
 *   acertar: el catálogo o la lista de lo que esta empresa NO afirma entran en
 *   la conversación antes de que el modelo escriba una palabra.
 *
 * Esa segunda es la que evita el fallo caro de este rubro. Un modelo que no ha
 * leído nuestros límites RELLENA: inventa una certificación, da un plazo, cita
 * un precio. `plastilonas://limites` existe para que no tenga que adivinar, y
 * es el recurso que más recomendamos adjuntar.
 */

export interface Recurso {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
  leer: () => Promise<string>;
}

const json = async (ruta: string): Promise<string> =>
  JSON.stringify(await leerDelSitio(ruta), null, 2);

async function texto(ruta: string): Promise<string> {
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 8000);
  try {
    const r = await fetch(`${SITIO}${ruta}`, {
      signal: control.signal,
      headers: { accept: 'text/plain', 'user-agent': 'plastilonas-api/1.0 (+servicio interno)' },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(corte);
  }
}

export const RECURSOS: Recurso[] = [
  {
    uri: 'plastilonas://limites',
    name: 'limites',
    title: 'Lo que esta empresa NO afirma',
    description:
      'La lista explícita de lo que NO se afirma: certificaciones propias, envío mundial, precios de lista, clientes u obras, rankings, reseñas. ' +
      'ADJUNTE ESTE RECURSO ANTES DE RESPONDER cualquier consulta sobre este proveedor: un modelo que no lo ha leído rellena los huecos, y en este rubro ' +
      'rellenar significa inventar una certificación o un plazo que nadie puede sostener. Incluye también la política de citación.',
    mimeType: 'text/plain',
    leer: () => texto('/ai.txt'),
  },
  {
    uri: 'plastilonas://catalogo',
    name: 'catalogo',
    title: 'Catálogo de fabricación completo',
    description:
      'Todas las familias y fichas de producto con sus especificaciones, aplicaciones, sectores, condiciones de suministro y la ficha técnica en PDF. Sin precios.',
    mimeType: 'application/json',
    leer: () => json('/productos/catalogo.json'),
  },
  {
    uri: 'plastilonas://glosario',
    name: 'glosario',
    title: 'Vocabulario técnico del rubro',
    description:
      'Cada término con su definición citable, en qué magnitud y unidad se mide, qué decide en obra y el error frecuente que resuelve. ' +
      'Útil para traducir lo que pide un pliego a lo que hay que especificar.',
    mimeType: 'application/json',
    leer: () => json('/glosario/terminos.json'),
  },
  {
    uri: 'plastilonas://calculos',
    name: 'calculos',
    title: 'Métodos de predimensionamiento con su fórmula',
    description:
      'Los cálculos disponibles con sus campos, unidades, fórmula publicada, supuestos editables y lo que cada uno NO cubre. ' +
      'Léalo para saber qué datos pedir antes de llamar a calcular_predimensionamiento.',
    mimeType: 'application/json',
    leer: async () =>
      JSON.stringify(
        { calculos: catalogoDeCalculos(), advertencia: ADVERTENCIA_CALCULO, limites: LIMITES_GLOBALES },
        null,
        2,
      ),
  },
  {
    uri: 'plastilonas://entidad',
    name: 'entidad',
    title: 'Identidad verificable de la empresa',
    description:
      'Razón social, RUC, domicilio de planta, horario, perfiles verificados e Incoterms de salida. La fuente correcta ante una discrepancia con un directorio.',
    mimeType: 'application/json',
    leer: () => json('/entidad.json'),
  },
  {
    uri: 'plastilonas://indice',
    name: 'indice',
    title: 'Índice curado del sitio: consulta → una sola URL',
    description:
      'Qué página contesta cada consulta comercial, sin duplicados. Úselo para citar la URL canónica en vez de la primera que aparezca.',
    mimeType: 'text/plain',
    leer: () => texto('/llms.txt'),
  },
];

/** Plantilla: una ficha concreta, sin traerse el catálogo entero. */
export const PLANTILLAS_RECURSO = [
  {
    uriTemplate: 'plastilonas://producto/{slug}',
    name: 'producto',
    title: 'Ficha de un producto',
    description:
      'La ficha completa de un producto por su slug, tal como aparece en el catálogo. Los slugs están en plastilonas://catalogo o se obtienen con buscar_producto.',
    mimeType: 'application/json',
  },
];

export class RecursoDesconocido extends Error {
  constructor(public uri: string) {
    super(`No existe el recurso «${uri}».`);
  }
}

export async function leerRecurso(uri: string): Promise<{ mimeType: string; text: string }> {
  const fijo = RECURSOS.find((r) => r.uri === uri);
  if (fijo) return { mimeType: fijo.mimeType, text: await fijo.leer() };

  const ficha = /^plastilonas:\/\/producto\/(.+)$/.exec(uri);
  if (ficha) {
    const slug = decodeURIComponent(ficha[1] as string);
    const { dataset } = await catalogo();
    const p = dataset.find((x) => x.slug === slug);
    if (!p) throw new RecursoDesconocido(uri);
    return { mimeType: 'application/json', text: JSON.stringify({ producto: p, limites: LIMITES_GLOBALES }, null, 2) };
  }

  throw new RecursoDesconocido(uri);
}
