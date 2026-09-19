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
  llevaOjales,
  lonaAnchoLabel,
  lonaBordeLabel,
  lonaColorHex,
  lonaColorLabel,
  lonaGramajeLabel,
  lonaMaterialLabel,
  lonaOjalesCantidadLabel,
  lonaOjalesDistanciaLabel,
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
  /**
   * Id del `<linearGradient>` que da la RESPUESTA A LA LUZ de la cara 02. Es
   * lo que separa un PVC —que espejea— de un polytarp —que apenas devuelve
   * luz— cuando los dos son del mismo color: sin esto, cambiar de material
   * sólo cambiaba una etiqueta.
   */
  gradienteCara: string;
  /**
   * Lado en px del azulejo de la trama del núcleo 03. MÁS GRAMAJE, AZULEJO MÁS
   * PEQUEÑO: la trama se cierra. Es un atributo del `<pattern>`, no una
   * animación: se recalcula al cambiar la especificación, nunca por fotograma.
   */
  pasoTramaNucleo: number;
  /** Cuántos ojales se dibujan en el canto de la capa 04 (0 si no se piden). */
  ojales: number;
  /**
   * Fracción (0..1) del canto inferior que ocupa la hilera de ojales. Es como
   * se ve la DISTANCIA elegida: a 25 cm la hilera se cierra sobre sí misma y a
   * 100 cm se estira de esquina a esquina. No pretende ser una conversión
   * cm→px: es una diferencia relativa legible, igual que el swatch de color.
   */
  extensionOjales: number;
  /**
   * Acabado del borde de la capa 04, o `null` cuando el paño va sin ojales
   * (entonces el bloque de ojales no se ha contestado y no hay doblez que
   * dibujar).
   */
  borde: string | null;
  /**
   * Escala del ESCENARIO entero. Depende sólo de la cantidad pedida y se
   * aplica como transformación exterior: no toca la geometría por campo
   * —ancho, gramaje— que sigue calculándose igual.
   */
  escala: number;
  /** Tinte del barniz de la capa 01 según los tratamientos pedidos. */
  tinteAcabado: string;
  /** El acabado mate APLANA cualquier reflejo: no hay banda de brillo. */
  aplanado: boolean;
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

const CARA_POR_MATERIAL: Record<
  string,
  { cara: CaraMaterial; patron: string | null; gradiente: string }
> = {
  // PVC: lámina plastificada, reflejo especular marcado.
  pvc: { cara: 'gloss', patron: null, gradiente: 'lona-luz-gloss' },
  // Rafia PP: tejido plano; la luz la rompe el hilo, no una banda.
  rafia: { cara: 'tejido', patron: 'lona-trama-rafia', gradiente: 'lona-luz-tejido' },
  // Polytarp PE: respuesta apagada, casi sin reflejo.
  polytarp: { cara: 'mate', patron: null, gradiente: 'lona-luz-mate' },
  // Algodón encerado: lienzo cálido, brillo de cera muy bajo.
  algodon: { cara: 'lienzo', patron: 'lona-trama-lienzo', gradiente: 'lona-luz-lienzo' },
};

const BRILLO_POR_TEXTURA: Record<string, number> = {
  mate: 0,
  brillante: 0.55,
  esmerilado: 0.14,
};

/* ------------------------------------------------------------------ */
/* TRAMA DEL NÚCLEO — el gramaje también CIERRA el tejido               */
/* ------------------------------------------------------------------ */

/** Lado del azulejo de la trama con el gramaje mínimo y con el máximo. */
const PASO_TRAMA_ABIERTA = 7.2;
const PASO_TRAMA_CERRADA = 3.6;

/**
 * Lado en px del azulejo de la trama del núcleo. Estrictamente DECRECIENTE con
 * el gramaje: 200 g/m² es un tejido abierto y 900 uno cerrado. Antes el núcleo
 * llevaba siempre la misma rejilla y el gramaje sólo movía la opacidad.
 */
export function pasoTramaNucleo(gramaje: string): number {
  const t = (gramajeMedio(gramaje) - GRAMAJE_MIN) / (GRAMAJE_MAX - GRAMAJE_MIN);
  return Math.round(interpolar(t, PASO_TRAMA_ABIERTA, PASO_TRAMA_CERRADA) * 10) / 10;
}

/* ------------------------------------------------------------------ */
/* OJALES — cuántos se DIBUJAN, que no es cuántos lleva el paño         */
/* ------------------------------------------------------------------ */

/**
 * Tope de ojales dibujados. ESTO ES UNA ILUSTRACIÓN: un paño de 4 m no lleva
 * diez ojales por norma alguna, y dibujar treinta puntos sólo produciría ruido.
 * El tope declara que la cantidad es orientativa, igual que el swatch de color.
 */
export const OJALES_MAX = 10;
const OJALES_MIN = 4;

/**
 * Ojales visibles en el canto de la capa 04. 0 si no se han pedido —y cero
 * significa CERO: la capa 04 no dibuja ni un aro, no dibuja aros invisibles.
 *
 * Manda la CANTIDAD elegida cuando hay una: si el comprador pide 12, se ven 12
 * (topados por `OJALES_MAX`, que es lo que declara que el dibujo ilustra y no
 * despieza). Con «A definir» no hay cantidad que respetar y se vuelve a la
 * heurística de siempre, la del ancho.
 */
export function numeroDeOjales(
  ancho: string,
  lleva: boolean,
  cantidad: string = 'definir',
): number {
  if (!lleva) return 0;
  const pedidos = Number(cantidad);
  if (Number.isFinite(pedidos) && pedidos > 0) {
    return Math.min(OJALES_MAX, Math.max(OJALES_MIN, Math.round(pedidos)));
  }
  const bruto = Math.round(anchoMetros(ancho) * 2.5);
  return Math.min(OJALES_MAX, Math.max(OJALES_MIN, bruto));
}

/**
 * Fracción del canto que ocupa la hilera de ojales según la distancia pedida.
 * Estrictamente CRECIENTE con los centímetros: más paso, hilera más abierta.
 * Con «A definir» se usa el reparto de siempre, ni el más cerrado ni el más
 * abierto.
 */
const EXTENSION_POR_DISTANCIA: Record<string, number> = {
  '25': 0.45,
  '50': 0.66,
  '75': 0.83,
  '100': 1,
};

/** Reparto por defecto, el que había antes de que la distancia fuera un dato. */
export const EXTENSION_OJALES_DEFECTO = 0.88;

export function extensionOjales(distancia: string): number {
  return EXTENSION_POR_DISTANCIA[distancia] ?? EXTENSION_OJALES_DEFECTO;
}

/* ------------------------------------------------------------------ */
/* ESCALA DEL ESCENARIO — la cantidad pedida se ve en el tamaño         */
/* ------------------------------------------------------------------ */

/**
 * Factor de escala del conjunto según el tramo de cantidad. NO es una
 * proporción de nada —un pedido de 50 paños no es 1.12 veces uno de 1—: es una
 * señal de magnitud, la misma idea que la barra de proporción de las píldoras.
 *
 * MONÓTONA NO DECRECIENTE en el orden de `LONA_CANTIDAD`: los dos tramos
 * centrales comparten factor a propósito (son «lo normal» y deben verse igual),
 * pero la escala no puede bajar cuando la cantidad sube.
 *
 * SE COMPONE, NO COMPITE. Se aplica como `transform` de un grupo EXTERIOR en
 * el SVG; el ancho del paño, el espesor del núcleo y el paso de la trama se
 * siguen calculando igual y ninguno los pisa.
 */
const ESCALA_POR_CANTIDAD: Record<string, number> = {
  '1': 0.85,
  '2-5': 1,
  '6-10': 1,
  '11-20': 1.06,
  '21-50': 1.12,
  'mas-50': 1.12,
};

export const ESCALA_DEFECTO = 1;

export function escalaEscenario(cantidad: string): number {
  return ESCALA_POR_CANTIDAD[cantidad] ?? ESCALA_DEFECTO;
}

/* ------------------------------------------------------------------ */
/* TINTE DEL ACABADO — la capa 01 no es un cristal incoloro             */
/* ------------------------------------------------------------------ */

/**
 * Tinte del barniz por tratamiento. Son tonos PÁLIDOS a propósito: el barniz
 * tiñe, no tapa, y el color que el comprador eligió tiene que seguir leyéndose
 * por debajo. No hay aquí ningún código de color normativo: es ilustración.
 */
const TINTE_POR_TRATAMIENTO: Record<string, string> = {
  uv: '#FDE68A',
  ignifugo: '#FCA5A5',
  antiestatico: '#BFDBFE',
  antibacteriano: '#A7F3D0',
};

/** Tinte neutro cuando no se pidió ningún tratamiento. */
const TINTE_SIN_TRATAMIENTO = '#E2E8F0';

function aRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const aHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0').toUpperCase()).join('')}`;

/**
 * Mezcla de los tintes pedidos. Dos tratamientos no pintan dos barnices: el
 * paño sale con UN acabado, y su color es la mezcla de lo que lleva.
 */
export function tinteAcabado(ids: readonly string[]): string {
  const tintes = ids.map((id) => TINTE_POR_TRATAMIENTO[id]).filter(Boolean);
  if (!tintes.length) return TINTE_SIN_TRATAMIENTO;
  const suma = tintes.map(aRgb).reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
  return aHex(suma.map((v) => v / tintes.length));
}

/* ------------------------------------------------------------------ */
/* AISLAR UNA CAPA — qué capa mira cada control                         */
/* ------------------------------------------------------------------ */

/** Las cuatro capas, por índice. `null` = ninguna en particular. */
export type Capa = 1 | 2 | 3 | 4;

/**
 * QUÉ CAPA ENSEÑA CADA CONTROL. El comprador pasa el ratón —o el tabulador—
 * por la fila de «Gramaje» y el despiece se queda con la capa 03 a la vista y
 * las otras tres desvanecidas. El mapa vive aquí, fuera del JSX, porque es una
 * decisión de producto y se puede interrogar sin renderizar nada.
 *
 * Es PURAMENTE VISUAL: aislar no selecciona. El `aria-pressed` de las píldoras
 * no lo toca nadie desde aquí.
 */
const CAPA_POR_CONTROL: Record<string, Capa> = {
  material: 2,
  color: 2,
  textura: 2,
  gramaje: 3,
  ancho: 4,
  confeccion: 4,
  tratamientos: 1,
  // El bloque de ojales entero vive en la capa 04 —borde y confección—, que es
  // donde se ven los aros y el doblez.
  ojales: 4,
  ojalesCantidad: 4,
  ojalesDistancia: 4,
  ojalesBorde: 4,
  medidas: 4,
};

/**
 * CONTROLES DE ESCENARIO, no de capa. «Cantidad» escala el conjunto y «Uso
 * previsto» no toca el dibujo: aislar una capa al señalarlos MENTIRÍA sobre
 * qué gobierna cada fila. Se declaran aquí para que la prueba de fuente
 * distinga «sin capa a propósito» de «alguien se olvidó de mapearlo».
 */
export const CONTROLES_SIN_CAPA = ['cantidad', 'uso'] as const;

export function layerParaControl(controlId: string): Capa | null {
  return CAPA_POR_CONTROL[controlId] ?? null;
}

/** Opacidad a la que se apaga una capa que NO es la aislada. */
export const OPACIDAD_APAGADA = 0.12;

/** Opacidad de la capa `n` cuando el foco de aislamiento está en `aislada`. */
export function opacidadCapa(n: Capa, aislada: Capa | null): number {
  if (aislada === null) return 1;
  return aislada === n ? 1 : OPACIDAD_APAGADA;
}

/** Desplazamiento lateral en px de una capa apagada: se aparta, no sólo se apaga. */
export function apartadoCapa(n: Capa, aislada: Capa | null): number {
  if (aislada === null || aislada === n) return 0;
  return (n - aislada) * 6;
}

/* ------------------------------------------------------------------ */
/* GIRO DE PLATAFORMA — el bloque se mira, no gira                      */
/* ------------------------------------------------------------------ */

/**
 * Oscilación de guiñada del conjunto. NO es un giro continuo: va y vuelve
 * entre dos topes, que es la diferencia entre una plataforma de producto y un
 * mareo. Se implementa como desplazamiento lateral DIFERENCIAL por capa —la de
 * arriba se va a un lado y la de abajo al contrario—, que es `transform` puro:
 * ni una geometría se recalcula por fotograma.
 */
export const GIRO_SEGUNDOS = 16;

/** Separación vertical entre la capa 01 y la 04, en px del viewBox. */
const ALTO_PILA = 180;

/** Amplitud lateral en px de la capa más extrema. */
const GIRO_AMPLITUD = 12;

/** Grados aparentes de guiñada a un lado. Conservador a propósito. */
export const GIRO_GRADOS =
  Math.round(((Math.atan((2 * GIRO_AMPLITUD) / ALTO_PILA) * 180) / Math.PI) * 10) / 10;

/**
 * Amplitud lateral de la capa `n`. El centro de la pila queda quieto y los
 * extremos se abren en sentidos opuestos: eso es lo que se lee como giro.
 */
export function amplitudGiro(n: Capa): number {
  return Math.round(((n - 2.5) / 1.5) * GIRO_AMPLITUD * 10) / 10;
}

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
    gradienteCara: material.gradiente,
    pasoTramaNucleo: pasoTramaNucleo(spec.gramaje),
    // UNA sola fuente de verdad: `spec.ojales`. La fila de confección ya no
    // tiene voz aquí, así que no hay dos controles que puedan discrepar.
    ojales: numeroDeOjales(spec.ancho, llevaOjales(spec), spec.ojalesCantidad),
    extensionOjales: extensionOjales(spec.ojalesDistancia),
    borde: llevaOjales(spec) ? spec.ojalesBorde : null,
    escala: escalaEscenario(spec.cantidad),
    tinteAcabado: tinteAcabado(tratamientos),
    aplanado: spec.textura === 'mate',
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
 * NOMBRE COMERCIAL DE CADA CAPA — una sola fuente para el dibujo y la lista.
 *
 * Antes la llamada del SVG decía «01» a secas y la lista de al lado decía
 * «Acabado / tratamiento superficial»: dos rótulos para la misma capa, y nada
 * que impidiera que uno de los dos se quedara atrás. Ahora los dos salen de
 * `capasDeLona` y no hay forma de que discrepen.
 *
 * El ORDEN de este array es el orden de la pila: 01 ARRIBA (la cara que mira
 * al tiempo) y 04 ABAJO (el borde y la confección). `ALTURA` en
 * `components/LonaExploded.tsx` es creciente por la misma razón.
 */
export const NOMBRES_DE_CAPA = [
  'Acabado superficial',
  'Cara plastificada',
  'Núcleo tejido (trama)',
  'Borde y confección',
] as const;

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
  // Las etiquetas van TAL CUAL las declara el enum: bajarlas a minúsculas
  // convertía «Orilla soldada HF» en «orilla soldada hf», que ya no es el
  // nombre de nada.
  const bordeYOjales = llevaOjales(spec)
    ? `${lonaOjalesCantidadLabel(spec.ojalesCantidad)} · ${lonaOjalesDistanciaLabel(spec.ojalesDistancia)} · ${lonaBordeLabel(spec.ojalesBorde)}`
    : 'Sin ojales';

  return [
    {
      n: 1,
      titulo: NOMBRES_DE_CAPA[0],
      texto: tratamientos.length
        ? `${tratamientos.map((t) => t.label).join(', ')} — se piden uno a uno; ninguno viene incluido por defecto.`
        : 'Anti-UV, ignífugo, antiestático o antibacteriano — se piden uno a uno, no vienen incluidos por defecto.',
    },
    {
      n: 2,
      titulo: NOMBRES_DE_CAPA[1],
      texto: `${lonaMaterialLabel(spec.material)} · color ${lonaColorLabel(spec.color).toLowerCase()} · acabado ${lonaTexturaLabel(spec.textura).toLowerCase()}. Es la cara que recibe sol, lluvia y logo impreso.`,
    },
    {
      n: 3,
      titulo: NOMBRES_DE_CAPA[2],
      texto: `${esTejido ? 'Trama tejida' : 'Base de rafia PP tejida'} · ${lonaGramajeLabel(spec.gramaje)}. El gramaje es lo que aguanta el desgarro; el rango de trabajo va de 200 a 900 g/m².`,
    },
    {
      n: 4,
      titulo: NOMBRES_DE_CAPA[3],
      texto: `${bordeYOjales}${confeccion.length ? ` · ${confeccion.map((c) => c.label).join(', ')}` : ''} · ${lonaAnchoLabel(spec.ancho).toLowerCase()}. Hasta 4.0 m en una pieza; por encima, unión soldada.`,
    },
  ];
}
