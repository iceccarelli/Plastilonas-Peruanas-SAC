/**
 * DE LA ESPECIFICACIÓN AL DIBUJO — una función pura y nada más.
 *
 * `components/LonaExploded.tsx` dibujaba y decidía a la vez: qué color, qué
 * grosor, qué trama. Mientras eso vivió dentro del SVG no había forma de
 * comprobar que mover el gramaje movía algo: había que renderizar framer-motion
 * en jsdom y medir un atributo. Aquí la decisión es una función de datos a
 * datos —`specToVisualState`— y `test/lona-visual.test.ts` la interroga sin
 * navegador.
 *
 * TODO NÚMERO SALE DE LA FICHA REAL de `lona-plastificada-rafia-polytarp`:
 * gramaje de 200 a 900 g/m², ancho hasta 4.0 m en una pieza y unión soldada por
 * encima, los tres acabados que ya existían y los CUATRO tratamientos que la
 * ficha declara. Aquí no se inventa un rango ni un acabado con nombre
 * comercial: se traduce a píxeles lo que el comprador eligió.
 */

import {
  lonaAnchoLabel,
  lonaColorHex,
  lonaColorLabel,
  lonaGramajeLabel,
  lonaMaterialLabel,
  lonaTexturaLabel,
  LONA_CONFECCION,
  LONA_TRATAMIENTO,
  type LonaSpec,
} from '@/lib/lona-config';

/** Aspecto de la cara superior según el material. */
export type CaraMaterial = 'gloss' | 'tejido' | 'mate' | 'lienzo';

export interface EstadoVisual {
  /** Cómo se ve la cara 02. */
  cara: CaraMaterial;
  /** Id del `<pattern>` que dibuja la trama del material, o null si es liso. */
  patronMaterial: string | null;
  /** Hex orientativo del color elegido. */
  colorCara: string;
  /** g/m² medio del rango elegido — el centro del rango real de la ficha. */
  gramajeMedio: number;
  /** Extrusión en px de la capa 3: el gramaje se ve, no se lee. */
  espesorNucleo: number;
  /** Opacidad de la trama tejida: más gramaje, trama más marcada. */
  opacidadTrama: number;
  /** Ancho del paño en metros. */
  anchoMetros: number;
  /** Fracción del ancho máximo dibujable (0..1). */
  factorAncho: number;
  /** Semiancho en px del paralelogramo isométrico. */
  medioAncho: number;
  /** Por encima de 4.0 m el paño lleva unión soldada: se dibuja la costura. */
  unionSoldada: boolean;
  /** Intensidad del brillo del acabado (0..1). */
  brillo: number;
  /** El acabado esmerilado se dibuja con un punteado fino. */
  estipulado: boolean;
  /** Ids de confección elegidos, en el orden del catálogo. */
  pictogramas: string[];
  /** Ids de tratamiento elegidos, en el orden de la ficha. */
  tratamientos: string[];
  /** Opacidad de la capa de acabado 01: sube con cada tratamiento pedido. */
  opacidadTratamiento: number;
}

/** Rango real de la ficha. No se sale de aquí. */
export const GRAMAJE_MIN = 200;
export const GRAMAJE_MAX = 900;

/** Extrusión en px de la capa 3 entre el gramaje mínimo y el máximo. */
const ESPESOR_MIN = 4;
const ESPESOR_MAX = 16;

/** Semiancho en px de la capa más estrecha y de la más ancha. */
const MEDIO_ANCHO_MIN = 82;
const MEDIO_ANCHO_MAX = 130;

/** Centro del rango de gramaje pedido; el centro del rango real si está «a definir». */
export function gramajeMedio(valor: string): number {
  const partes = valor.split('-').map(Number);
  if (partes.length === 2 && partes.every((n) => Number.isFinite(n))) {
    return (partes[0] + partes[1]) / 2;
  }
  return (GRAMAJE_MIN + GRAMAJE_MAX) / 2;
}

/** Metros de ancho pedidos. «union» es el tope de una pieza: 4.0 m. */
export function anchoMetros(valor: string): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 4;
}

const entre = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

const interpolar = (t: number, a: number, b: number) => a + entre(t, 0, 1) * (b - a);

const CARA_POR_MATERIAL: Record<string, { cara: CaraMaterial; patron: string | null }> = {
  pvc: { cara: 'gloss', patron: null },
  rafia: { cara: 'tejido', patron: 'lona-trama-rafia' },
  polytarp: { cara: 'mate', patron: null },
  algodon: { cara: 'lienzo', patron: 'lona-trama-lienzo' },
};

const BRILLO_POR_TEXTURA: Record<string, number> = {
  mate: 0,
  brillante: 0.55,
  esmerilado: 0.14,
};

/**
 * La única traducción de especificación a dibujo. Determinista: la misma
 * especificación da siempre el mismo estado, que es lo que permite probarla.
 */
export function specToVisualState(spec: LonaSpec): EstadoVisual {
  const material = CARA_POR_MATERIAL[spec.material] ?? CARA_POR_MATERIAL.pvc;

  const g = gramajeMedio(spec.gramaje);
  const tGramaje = (g - GRAMAJE_MIN) / (GRAMAJE_MAX - GRAMAJE_MIN);

  const metros = anchoMetros(spec.ancho);
  const tAncho = (metros - 1.5) / (4 - 1.5);

  const tratamientos = LONA_TRATAMIENTO.map((t) => t.id).filter((id) =>
    spec.tratamientos.includes(id),
  );
  const pictogramas = LONA_CONFECCION.map((c) => c.id).filter((id) =>
    spec.confeccion.includes(id),
  );

  return {
    cara: material.cara,
    patronMaterial: material.patron,
    colorCara: lonaColorHex(spec.color) || '#94A3B8',
    gramajeMedio: g,
    espesorNucleo: Math.round(interpolar(tGramaje, ESPESOR_MIN, ESPESOR_MAX) * 10) / 10,
    opacidadTrama: Math.round(interpolar(tGramaje, 0.35, 0.95) * 100) / 100,
    anchoMetros: metros,
    factorAncho: Math.round(entre(tAncho, 0, 1) * 100) / 100,
    medioAncho: Math.round(interpolar(tAncho, MEDIO_ANCHO_MIN, MEDIO_ANCHO_MAX)),
    unionSoldada: spec.ancho === 'union',
    brillo: BRILLO_POR_TEXTURA[spec.textura] ?? 0,
    estipulado: spec.textura === 'esmerilado',
    pictogramas,
    tratamientos,
    // Cada tratamiento suma capa. El tope evita que cuatro tratamientos
    // conviertan la cara en un espejo blanco y escondan el color elegido.
    opacidadTratamiento: tratamientos.length
      ? Math.round(Math.min(0.1 + 0.07 * tratamientos.length, 0.34) * 100) / 100
      : 0,
  };
}

/**
 * Fracción (0..1) de una opción dentro de su rango real. Alimenta las barras
 * de proporción de las píldoras: el comprador ve la magnitud relativa, no sólo
 * el número.
 */
export function fraccionGramaje(valor: string): number {
  return Math.round(((gramajeMedio(valor) - GRAMAJE_MIN) / (GRAMAJE_MAX - GRAMAJE_MIN)) * 100) / 100;
}

export function fraccionAncho(valor: string): number {
  return Math.round(entre(anchoMetros(valor) / 4, 0, 1) * 100) / 100;
}

/**
 * Las cuatro capas y lo que cada una dice, ya con las etiquetas de la
 * especificación dentro. Vivía dentro del SVG; se saca para que la lista se
 * pueda colocar donde haga falta —en móvil debajo, en escritorio al lado— sin
 * renderizar el dibujo dos veces.
 */
export function capasDeLona(spec: LonaSpec): { n: 1 | 2 | 3 | 4; titulo: string; texto: string }[] {
  const esTejido = spec.material === 'rafia' || spec.material === 'algodon';
  const tratamientos = LONA_TRATAMIENTO.filter((t) => spec.tratamientos.includes(t.id));
  const confeccion = LONA_CONFECCION.filter((c) => spec.confeccion.includes(c.id));

  return [
    {
      n: 1,
      titulo: 'Acabado / tratamiento superficial',
      texto: tratamientos.length
        ? `${tratamientos.map((t) => t.label).join(', ')} — se piden uno a uno; ninguno viene incluido por defecto.`
        : 'Anti-UV, ignífugo, antiestático o antibacteriano — se piden uno a uno, no vienen incluidos por defecto.',
    },
    {
      n: 2,
      titulo: 'Cara plastificada',
      texto: `${lonaMaterialLabel(spec.material)} · color ${lonaColorLabel(spec.color).toLowerCase()} · acabado ${lonaTexturaLabel(spec.textura).toLowerCase()}. Es la cara que recibe sol, lluvia y logo impreso.`,
    },
    {
      n: 3,
      titulo: 'Núcleo tejido / trama',
      texto: `${esTejido ? 'Trama tejida' : 'Base de rafia PP tejida'} · ${lonaGramajeLabel(spec.gramaje)}. El gramaje es lo que aguanta el desgarro; el rango de trabajo va de 200 a 900 g/m².`,
    },
    {
      n: 4,
      titulo: 'Cara inferior y confección',
      texto: `${confeccion.length ? confeccion.map((c) => c.label).join(', ') : 'Backing, borde reforzado, ojales y cierre'} · ${lonaAnchoLabel(spec.ancho).toLowerCase()}. Hasta 4.0 m en una pieza; por encima, unión soldada.`,
    },
  ];
}
