import { calculadoras } from '../../lib/calculadoras';
import { catalogo, buscarConPuntaje, certezaDe, leerDelSitio, type Certeza, type ProductoDelSitio } from './sitio';
import { SITIO } from './config';
import { enlaceCotizacion, LIMITES_GLOBALES } from './contrato';
import { DATOS_QUE_EVITAN_REPREGUNTAR } from './cotizaciones';

/**
 * ESPECIFICAR ANTES DE COTIZAR — el trabajo que hoy hace una persona por
 * teléfono y que se pierde en cuanto cuelga.
 *
 * Un comprador industrial casi nunca llega sabiendo qué pedir. Llega con un
 * problema: «poza de relaves a 4.100 msnm, contacto con solución ácida, ocho
 * años de vida útil». Lo que falta entre ese problema y una cotización es el
 * trabajo de un ingeniero de aplicaciones: traducirlo a una familia de
 * producto, enumerar las variables que hay que fijar, y decir cuáles siguen sin
 * respuesta.
 *
 * ESTE MÓDULO NO ENTIENDE LENGUAJE, Y NO LE HACE FALTA. Quien lo llama —un
 * agente— ya entiende el lenguaje. Lo que ese agente no tiene es el libro de
 * reglas del rubro: qué variables gobiernan un big bag frente a una
 * geomembrana, en qué unidad se miden, por qué importan y qué cálculo
 * corresponde. Ese libro sí está aquí, y está DERIVADO del catálogo y del
 * glosario del sitio, no escrito de memoria:
 *
 *   - las variables salen de las especificaciones reales de los productos
 *     candidatos, no de una lista redactada a mano;
 *   - cómo se mide cada una y por qué importa salen del glosario publicado;
 *   - el cálculo sugerido se empareja por área contra las calculadoras
 *     existentes, así que añadir una calculadora la pone en circulación sola.
 *
 * Lo que NO hace, a propósito: recomendar un material concreto para una
 * condición química o una vida útil. Eso es una decisión de ingeniería que se
 * firma, y aquí no se firma nada. Se dice qué hay que definir y quién lo define.
 */

const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const VACIAS_FAMILIA = new Set(['y', 'e', 'de', 'la', 'el', 'los', 'las']);
const tokens = (s: string) =>
  normalizar(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !VACIAS_FAMILIA.has(w));

/* ── Glosario: cómo se mide una variable y por qué importa ───────────── */

interface TerminoDelSitio {
  termCode: string;
  name: string;
  description: string;
  url: string;
  comoSeMide?: string;
  porQueImporta?: string;
}

interface GlosarioDelSitio {
  hasDefinedTerm: TerminoDelSitio[];
}

async function terminosPorUrl(): Promise<Map<string, TerminoDelSitio>> {
  const g = await leerDelSitio<GlosarioDelSitio>('/glosario/terminos.json');
  return new Map((g.hasDefinedTerm ?? []).map((t) => [t.url, t]));
}

/* ── El resultado ────────────────────────────────────────────────────── */

export interface DatosConocidos {
  producto?: string;
  medidas?: string;
  cantidad?: string;
  ciudad_entrega?: string;
  pais_entrega?: string;
  fecha_necesaria?: string;
}

export interface Requerimiento {
  descripcion: string;
  sector?: string;
  aplicacion?: string;
  datos?: DatosConocidos;
}

export interface VariableADefinir {
  variable: string;
  /** En qué magnitud y unidad se expresa. Del glosario, cuando existe. */
  como_se_mide?: string;
  /** Qué decide en obra. Del glosario, cuando existe. */
  por_que_importa?: string;
  fuente?: string;
}

export interface Especificacion {
  entendido: { descripcion: string; sector?: string; aplicacion?: string };
  /**
   * Cuánto se puede fiar el agente de la lista de candidatos. Con «baja», lo
   * primero que hay que preguntar no es la fecha de entrega: es qué se va a
   * contener, cubrir o impermeabilizar.
   */
  certeza: Certeza;
  candidatos: { slug: string; nombre: string; familia: string; url: string; por_que: string }[];
  variables_a_definir: VariableADefinir[];
  preguntas_pendientes: string[];
  calculo_sugerido: { calculo: string; pregunta: string; url: string } | null;
  lo_que_no_decidimos_por_usted: string[];
}

export class RequerimientoVacio extends Error {
  constructor() {
    super('Describa el requerimiento: qué se contiene, se cubre o se impermeabiliza, y en qué condiciones.');
  }
}

/** Los cinco datos, en forma de pregunta y en el orden en que se preguntan. */
const PREGUNTAS: { campo: keyof DatosConocidos; pregunta: string }[] = [
  { campo: 'producto', pregunta: '¿Qué producto o familia? Si aún no está decidido, dígalo: se define con la aplicación.' },
  { campo: 'medidas', pregunta: '¿Qué medidas o especificación? Gramaje, espesor, diámetro o capacidad, según el producto.' },
  { campo: 'cantidad', pregunta: '¿Qué cantidad, en qué unidad, y es un pedido único o recurrente?' },
  { campo: 'ciudad_entrega', pregunta: '¿A qué ciudad o puerto se entrega?' },
  { campo: 'fecha_necesaria', pregunta: '¿Para qué fecha se necesita en destino?' },
];

export async function especificar(req: Requerimiento): Promise<Especificacion> {
  const descripcion = (req.descripcion ?? '').trim();
  if (descripcion.length < 8) throw new RequerimientoVacio();

  const consulta = [descripcion, req.aplicacion, req.sector].filter(Boolean).join(' ');
  const { dataset } = await catalogo();
  const conPuntaje = buscarConPuntaje(dataset, consulta, 4);
  const candidatos = conPuntaje.map((c) => c.producto);
  const certeza = certezaDe(conPuntaje);

  const glosario = await terminosPorUrl().catch(() => new Map<string, TerminoDelSitio>());

  /**
   * LAS VARIABLES SALEN DE UNA SOLA FAMILIA, Y CABEN EN UNA CONVERSACIÓN.
   *
   * Uno especifica DENTRO de una familia: las variables de una geomembrana y
   * las de un big bag no se mezclan en el mismo cuestionario. Mezclarlas daba
   * treinta y dos, que no es una guía sino un inventario, y un inventario no lo
   * lee nadie: el agente escoge tres al azar y pregunta lo que no toca.
   *
   * Primero las que el glosario respalda —ésas traen en qué unidad se miden y
   * qué deciden en obra—, después el resto. Y con techo: catorce.
   */
  const familiaPrincipal = candidatos[0]?.familia;
  const delMismoFrente = candidatos.filter((p) => p.familia === familiaPrincipal);

  const conGlosario = new Map<string, VariableADefinir>();
  const sinGlosario = new Map<string, VariableADefinir>();
  for (const p of delMismoFrente) {
    for (const t of p.terminosClave) {
      const g = glosario.get(t.url);
      conGlosario.set(t.termino, {
        variable: t.termino,
        como_se_mide: g?.comoSeMide,
        por_que_importa: g?.porQueImporta,
        fuente: t.url,
      });
    }
    for (const e of p.especificaciones) {
      if (!conGlosario.has(e.nombre) && !sinGlosario.has(e.nombre)) {
        sinGlosario.set(e.nombre, { variable: e.nombre });
      }
    }
  }
  const variables = new Map<string, VariableADefinir>([...conGlosario, ...sinGlosario]);

  const datos = req.datos ?? {};
  const pendientes = PREGUNTAS.filter(({ campo }) => !String(datos[campo] ?? '').trim()).map((p) => p.pregunta);
  if (!req.sector) pendientes.push('¿En qué sector opera? Minería, agroexportación, transporte, construcción o saneamiento cambian la exigencia.');
  if (!datos.pais_entrega && /export|fuera del per|internacional|puerto/i.test(descripcion)) {
    pendientes.push('¿A qué país se entrega? Fuera del Perú el suministro se evalúa por operación bajo EXW Lima, FCA Lima o FOB Callao.');
  }

  if (certeza === 'baja' && candidatos.length > 1) {
    pendientes.unshift(
      'Antes que nada: ¿qué se va a contener, cubrir o impermeabilizar exactamente? La descripción admite varias familias y conviene cerrar ésa primero.',
    );
  }

  return {
    entendido: { descripcion, sector: req.sector, aplicacion: req.aplicacion },
    certeza,
    candidatos: candidatos.map((p) => ({
      slug: p.slug,
      nombre: p.name,
      familia: p.familia,
      url: p.url,
      por_que: porQue(p, consulta),
    })),
    variables_a_definir: [...variables.values()].slice(0, 14),
    preguntas_pendientes: pendientes,
    calculo_sugerido: calculoPara(candidatos[0]),
    lo_que_no_decidimos_por_usted: [
      'La compatibilidad química de un material con un fluido concreto: la declara la ficha del fabricante del material, para ese fluido y esa concentración.',
      'La vida útil esperada bajo una exposición determinada: depende de radiación, temperatura, abrasión y mantenimiento del sitio.',
      'El diseño estructural, el anclaje y la estabilidad de taludes: son memoria de cálculo firmada por un profesional colegiado.',
      'Las certificaciones que exige su comprador, su puerto o su proyecto: las fija el pliego, y se atienden por operación.',
    ],
  };
}

/** Por qué este producto aparece: la frase que un agente puede leer en voz alta. */
function porQue(p: ProductoDelSitio, consulta: string): string {
  const q = new Set(tokens(consulta));
  const aplicacion = p.aplicaciones.find((a) => tokens(a).some((w) => q.has(w)));
  const sector = p.sectores.find((s) => tokens(s).some((w) => q.has(w)));
  const razones = [
    aplicacion ? `cubre la aplicación «${aplicacion}»` : null,
    sector ? `se usa en ${sector}` : null,
  ].filter(Boolean);
  return razones.length ? razones.join(' y ') : `pertenece a ${p.familia}`;
}

/**
 * El cálculo que corresponde a la familia del primer candidato. Se empareja por
 * palabras del área contra palabras de la familia —«Geosintéticos» contra
 * «Geosintéticos e Impermeabilización»— en vez de con una tabla escrita a mano,
 * para que añadir una calculadora la ponga en circulación sin tocar esto.
 */
function calculoPara(p: ProductoDelSitio | undefined): Especificacion['calculo_sugerido'] {
  if (!p) return null;
  const familia = new Set(tokens(p.familia));
  const casa = calculadoras.find((c) => tokens(c.area).some((w) => familia.has(w)));
  if (!casa) return null;
  return { calculo: casa.slug, pregunta: casa.pregunta, url: `${SITIO}/calculadoras/${casa.slug}` };
}

/** El sobre que acompaña a una especificación, allí donde se sirva. */
export function envoltorioDeEspecificacion(e: Especificacion) {
  return {
    limites: [
      'Esto es una guía de especificación, no una recomendación de ingeniería: dice qué hay que definir, no qué material elegir para una condición concreta.',
      ...LIMITES_GLOBALES,
    ],
    siguiente_paso: {
      accion: e.preguntas_pendientes.length ? 'completar_datos' : 'solicitar_cotizacion',
      descripcion: e.preguntas_pendientes.length
        ? `Faltan ${e.preguntas_pendientes.length} respuestas. Con ellas la cotización sale el mismo día; sin ellas, son correos de ida y vuelta.`
        : `Están los cinco datos (${DATOS_QUE_EVITAN_REPREGUNTAR.length}). Envíe la solicitud.`,
      url: enlaceCotizacion({
        producto: e.candidatos[0]?.slug,
        nota: `Requerimiento: ${e.entendido.descripcion}`,
        origen: 'api:especificar',
      }),
    },
  };
}
