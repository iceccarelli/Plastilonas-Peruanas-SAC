/**
 * CONFIGURADOR DE LONA PLASTIFICADA / RAFIA / POLYTARP — arma un RFQ.
 *
 * Mismo patrón que `lib/fibc.ts` y por la misma razón: el resumen que sale de
 * aquí viaja como texto plano en `?notas=` hasta el formulario de cotización,
 * así que tiene que leerse igual de bien en un correo que en una pantalla.
 *
 * NO ES UN MOTOR DE PRECIO. No calcula, no estima y no insinúa importes. La
 * pieza que falta —cuánto cuesta— la pone una persona, por escrito, en la
 * cotización.
 *
 * DE DÓNDE SALEN LAS OPCIONES. De la ficha real de
 * `lona-plastificada-rafia-polytarp` en `lib/products.ts`: materiales, gramaje
 * de 200 a 900 g/m², anchos hasta 4.0 m con uniones soldadas por encima,
 * confección (soldadura HF, costura reforzada, ojales, velcro, cremallera) y
 * los CUATRO tratamientos que la ficha declara. Ni un rango inventado ni un
 * acabado con nombre comercial que no exista.
 */

export const LONA_MATERIAL = [
  { value: 'pvc', label: 'PVC plastificado' },
  { value: 'rafia', label: 'Rafia PP tejida' },
  { value: 'polytarp', label: 'Polytarp PE' },
  { value: 'algodon', label: 'Lona de algodón encerada' },
] as const;

/**
 * Colores. Deliberadamente genéricos: el color exacto se casa contra una
 * muestra física, no contra un hex de pantalla. El swatch es orientativo y la
 * opción «a medida» existe justamente para no fingir un catálogo cerrado.
 */
export const LONA_COLOR = [
  { value: 'verde', label: 'Verde', hex: '#166534' },
  { value: 'azul', label: 'Azul', hex: '#1E3A8A' },
  { value: 'negro', label: 'Negro', hex: '#111827' },
  { value: 'blanco', label: 'Blanco', hex: '#F3F4F6' },
  { value: 'traslucido', label: 'Traslúcido', hex: '#D9E6E4' },
  { value: 'medida', label: 'A medida', hex: '' },
] as const;

export const LONA_GRAMAJE = [
  { value: '200-350', label: '200 – 350 g/m²' },
  { value: '350-500', label: '350 – 500 g/m²' },
  { value: '500-700', label: '500 – 700 g/m²' },
  { value: '700-900', label: '700 – 900 g/m²' },
  { value: 'definir', label: 'A definir en cotización' },
] as const;

export const LONA_ANCHO = [
  { value: '1.5', label: 'Hasta 1.5 m' },
  { value: '2.0', label: 'Hasta 2.0 m' },
  { value: '3.0', label: 'Hasta 3.0 m' },
  { value: '4.0', label: 'Hasta 4.0 m en una pieza' },
  { value: 'union', label: 'Más de 4.0 m (unión soldada)' },
] as const;

export const LONA_TEXTURA = [
  { value: 'mate', label: 'Mate' },
  { value: 'brillante', label: 'Brillante' },
  { value: 'esmerilado', label: 'Esmerilado' },
] as const;

/**
 * Confección, SIN ojales. Los ojales salieron de esta fila multiselección y
 * tienen bloque propio (`LONA_OJALES` y sus tres filas): estaban compitiendo
 * con él por ser la fuente de verdad de «¿lleva ojales?», y dos controles que
 * pueden discrepar sobre lo mismo es un defecto, no una comodidad. Lo que
 * queda aquí son las otras uniones y cierres de la ficha real.
 */
export const LONA_CONFECCION = [
  { id: 'velcro', label: 'Velcro' },
  { id: 'cremallera', label: 'Cremallera' },
  { id: 'costura', label: 'Costura reforzada' },
  { id: 'hf', label: 'Soldadura HF' },
] as const;

/* ------------------------------------------------------------------ */
/* OJALES — bloque propio, y ni un dato de herraje inventado            */
/* ------------------------------------------------------------------ */

/**
 * LO QUE ESTE BLOQUE SÍ DICE Y LO QUE NO. Dice cuántos ojales quiere el
 * comprador, cada cuánto y con qué doblez de borde: tres decisiones que el
 * comprador toma y que la cotización tiene que recoger. NO dice diámetro, ni
 * material del aro, ni referencia de herraje: eso lo fija la planta contra la
 * pieza, y aquí inventarlo sería ponerle un SKU a algo que no se ha elegido.
 * El dibujo que acompaña sigue siendo esquemático por la misma razón.
 */
export const LONA_OJALES = [
  { value: 'sin', label: 'Sin ojales' },
  { value: 'con', label: 'Con ojales' },
] as const;

/**
 * Cantidad de ojales. Cerrada a propósito: un campo libre aquí acaba llegando
 * al RFQ como «los que hagan falta», que no es un dato. «A definir» existe
 * para el comprador que todavía no lo sabe, y es el valor por defecto: no se
 * le pone en la boca un número que no ha dicho.
 */
export const LONA_OJALES_CANTIDAD = [
  { value: '4', label: '4 ojales' },
  { value: '6', label: '6 ojales' },
  { value: '8', label: '8 ojales' },
  { value: '10', label: '10 ojales' },
  { value: '12', label: '12 ojales' },
  { value: '16', label: '16 ojales' },
  { value: 'definir', label: 'A definir en cotización' },
] as const;

/**
 * Distancia entre ojales. El paso de 50 cm no es un invento de esta pantalla:
 * es el que ya declara la ficha de mantas y cobertores para camión en
 * `lib/products.ts` («cada 50 cm en todo el perímetro»), y por eso es el valor
 * por defecto — esta fila no puede contradecir al catálogo.
 */
export const LONA_OJALES_DISTANCIA = [
  { value: '25', label: 'Cada 25 cm' },
  { value: '50', label: 'Cada 50 cm' },
  { value: '75', label: 'Cada 75 cm' },
  { value: '100', label: 'Cada 100 cm' },
  { value: 'definir', label: 'A definir en cotización' },
] as const;

/**
 * Acabado del borde donde se clava el ojal. Los cuatro acabados salen de la
 * ficha real (soldadura HF, costura doble reforzada) y del doblez de toda la
 * vida, reforzado con cinta o soga. El valor por defecto es el DOBLADILLO
 * SIMPLE: el refuerzo se pide, no se supone.
 */
export const LONA_BORDE = [
  { value: 'dobladillo', label: 'Dobladillo simple' },
  { value: 'dobladillo-reforzado', label: 'Dobladillo reforzado con cinta o soga' },
  { value: 'hf', label: 'Orilla soldada HF' },
  { value: 'costura-doble', label: 'Orilla con costura doble reforzada' },
  { value: 'definir', label: 'A definir en cotización' },
] as const;

/* ------------------------------------------------------------------ */
/* MEDIDAS, CANTIDAD Y USO — tres listas cerradas, ni un campo libre    */
/* ------------------------------------------------------------------ */

/**
 * POR QUÉ DEJARON DE SER TEXTO LIBRE. Los tres eran `<input>` y llegaban al
 * RFQ como cadenas sin forma —«unos 6 por 12», «varios», «para el camión»—:
 * el comercial tenía que volver a preguntar las tres cosas, que es justo lo
 * que un configurador existe para evitar. Cerrarlas también cierra la puerta a
 * que texto tecleado por un desconocido viaje sin validar hasta un correo.
 *
 * ORDEN: por tamaños de paño ascendente, que es como los catálogos públicos de
 * PVC y tolderas listan sus medidas de referencia y que en ellos coincide con
 * las medidas más pedidas primero. NO es un ranking de ventas de esta empresa:
 * aquí no hay cifras propias de venta, ni las habrá. El valor por defecto es
 * la cabeza de ese orden, no una preferencia declarada.
 */
export const LONA_MEDIDAS = [
  { value: '4x8', label: '4 × 8 m' },
  { value: '4x10', label: '4 × 10 m' },
  { value: '5x10', label: '5 × 10 m' },
  { value: '5x12', label: '5 × 12 m' },
  { value: '6x12', label: '6 × 12 m' },
  { value: '6x15', label: '6 × 15 m' },
  { value: '7x16', label: '7 × 16 m' },
  { value: '8x18', label: '8 × 18 m' },
  { value: 'medida', label: 'Rollo/paño a medida (cotización)' },
] as const;

/**
 * Cantidad, por tramos. Por defecto «2 – 5»: el tramo de una flota pequeña o
 * de un primer pedido de prueba, que es el arranque razonable de un RFQ sin
 * suponer ni una unidad suelta ni un contrato.
 */
export const LONA_CANTIDAD = [
  { value: '1', label: '1 paño' },
  { value: '2-5', label: '2 – 5 paños' },
  { value: '6-10', label: '6 – 10 paños' },
  { value: '11-20', label: '11 – 20 paños' },
  { value: '21-50', label: '21 – 50 paños' },
  // `mas-50` y no `50+`: en una query string un `+` se decodifica como espacio
  // y la precarga por URL perdería el tramo más grande en silencio.
  { value: 'mas-50', label: 'Más de 50 (cotización)' },
] as const;

/**
 * Uso previsto. Por defecto «Tolderas/cobertores de camión» porque es la línea
 * que el propio sitio declara prioritaria en primer lugar
 * (`PRODUCTOS_PRIORITARIOS` en `lib/products.ts`, orden 1: mantas cobertoras
 * para camión). Es coherencia con una decisión comercial ya publicada, no una
 * estadística de pedidos.
 */
export const LONA_USO = [
  { value: 'tolderas', label: 'Tolderas/cobertores de camión' },
  { value: 'obra', label: 'Cobertura de obra/almacén' },
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'mineria', label: 'Minería/campamento' },
  { value: 'cerramiento', label: 'Cerramiento/cortina industrial' },
  { value: 'otro', label: 'Otro (cotización)' },
] as const;

/** Los CUATRO de la ficha. No se añade un quinto. */
export const LONA_TRATAMIENTO = [
  { id: 'uv', label: 'Anti-UV' },
  { id: 'ignifugo', label: 'Ignífugo' },
  { id: 'antiestatico', label: 'Antiestático' },
  { id: 'antibacteriano', label: 'Antibacteriano' },
] as const;

export interface LonaSpec {
  material: string;
  color: string;
  gramaje: string;
  ancho: string;
  textura: string;
  confeccion: string[];
  tratamientos: string[];
  /** `sin` | `con` — la ÚNICA fuente de verdad de si el paño lleva ojales. */
  ojales: string;
  ojalesCantidad: string;
  ojalesDistancia: string;
  ojalesBorde: string;
  /** Los tres de abajo son valores de enum, no texto tecleado. */
  medidas: string;
  cantidad: string;
  uso: string;
}

export const emptyLona = (): LonaSpec => ({
  material: 'pvc',
  color: 'verde',
  gramaje: '500-700',
  ancho: '3.0',
  textura: 'mate',
  confeccion: ['hf'],
  tratamientos: ['uv'],
  ojales: 'con',
  // «A definir» de salida: el dibujo cae entonces a la heurística por ancho y
  // el RFQ no afirma una cantidad que el comprador no ha elegido.
  ojalesCantidad: 'definir',
  ojalesDistancia: '50',
  ojalesBorde: 'dobladillo',
  medidas: '4x8',
  cantidad: '2-5',
  uso: 'tolderas',
});

/** ¿Este paño lleva ojales? Se pregunta AQUÍ y en ningún otro sitio. */
export const llevaOjales = (s: Pick<LonaSpec, 'ojales'>): boolean => s.ojales === 'con';

/** Etiqueta legible de una opción simple; el valor crudo si no se reconoce. */
function etiqueta(
  opciones: readonly { value: string; label: string }[],
  value: string,
): string {
  return opciones.find((o) => o.value === value)?.label ?? value;
}

function etiquetas(
  opciones: readonly { id: string; label: string }[],
  ids: readonly string[],
): string[] {
  return ids.map((id) => opciones.find((o) => o.id === id)?.label ?? id);
}

export const lonaMaterialLabel = (v: string) => etiqueta(LONA_MATERIAL, v);
export const lonaGramajeLabel = (v: string) => etiqueta(LONA_GRAMAJE, v);
export const lonaColorLabel = (v: string) => etiqueta(LONA_COLOR, v);
export const lonaAnchoLabel = (v: string) => etiqueta(LONA_ANCHO, v);
export const lonaTexturaLabel = (v: string) => etiqueta(LONA_TEXTURA, v);
export const lonaOjalesCantidadLabel = (v: string) => etiqueta(LONA_OJALES_CANTIDAD, v);
export const lonaOjalesDistanciaLabel = (v: string) => etiqueta(LONA_OJALES_DISTANCIA, v);
export const lonaBordeLabel = (v: string) => etiqueta(LONA_BORDE, v);
export const lonaMedidasLabel = (v: string) => etiqueta(LONA_MEDIDAS, v);
export const lonaCantidadLabel = (v: string) => etiqueta(LONA_CANTIDAD, v);
export const lonaUsoLabel = (v: string) => etiqueta(LONA_USO, v);

/**
 * El sub-pliego de ojales en UNA frase en español, o cadena vacía si el paño
 * va sin ellos. Se omite entero —no se manda «Ojales: no»— porque el RFQ es
 * una lista de lo que se pide, no de lo que no.
 */
export function lonaOjalesResumen(s: LonaSpec): string {
  if (!llevaOjales(s)) return '';
  const cantidad =
    s.ojalesCantidad === 'definir'
      ? 'cantidad a definir en cotización'
      : lonaOjalesCantidadLabel(s.ojalesCantidad).toLowerCase();
  const distancia =
    s.ojalesDistancia === 'definir'
      ? 'paso a definir en cotización'
      : `${lonaOjalesDistanciaLabel(s.ojalesDistancia).toLowerCase()} entre ojales`;
  const borde =
    s.ojalesBorde === 'definir'
      ? 'acabado de borde a definir en cotización'
      : `borde en ${lonaBordeLabel(s.ojalesBorde).toLowerCase()}`;
  return `Ojales: ${cantidad}, ${distancia}, ${borde}.`;
}

/** Hex orientativo del color elegido; vacío cuando es «a medida». */
export const lonaColorHex = (v: string): string =>
  LONA_COLOR.find((c) => c.value === v)?.hex ?? '';

/**
 * Resumen en texto plano para el RFQ. Sin importes, sin sellos ajenos y sin
 * promesas de plazo: lo que hay es lo que el comprador eligió.
 */
export function lonaSummary(s: LonaSpec): string {
  return [
    'Configuración de lona a medida (preliminar, sin precio)',
    `Material: ${lonaMaterialLabel(s.material)}`,
    `Gramaje pedido: ${lonaGramajeLabel(s.gramaje)}`,
    `Ancho: ${lonaAnchoLabel(s.ancho)}`,
    `Color: ${lonaColorLabel(s.color)}`,
    `Acabado: ${lonaTexturaLabel(s.textura)}`,
    s.confeccion.length
      ? `Confección: ${etiquetas(LONA_CONFECCION, s.confeccion).join(', ')}`
      : 'Confección: a definir',
    s.tratamientos.length
      ? `Tratamientos: ${etiquetas(LONA_TRATAMIENTO, s.tratamientos).join(', ')}`
      : '',
    // El sub-pliego de ojales va entero o no va: nunca a medias.
    lonaOjalesResumen(s),
    s.medidas ? `Medidas del paño: ${lonaMedidasLabel(s.medidas)}` : '',
    s.cantidad ? `Cantidad: ${lonaCantidadLabel(s.cantidad)}` : '',
    s.uso ? `Uso previsto: ${lonaUsoLabel(s.uso)}` : '',
    'El gramaje y el ancho finales se confirman por escrito en la cotización.',
  ]
    .filter(Boolean)
    .join('\n');
}

/* ------------------------------------------------------------------ */
/* PRECARGA POR URL — un enlace que llega con la mitad del RFQ hecha     */
/* ------------------------------------------------------------------ */

/**
 * POR QUÉ EXISTE. La ficha de la lona y el hub de lonas de camión ya saben qué
 * va a configurar el visitante: quien llega desde /lonas-camiones quiere PVC
 * de gramaje alto, no el valor por defecto genérico. Mandarlo al configurador
 * con las píldoras ya puestas ahorra el paso que más gente abandona.
 *
 * REGLA: nada de confiar en la query. Cada valor se coteja contra el enum real
 * de este archivo; lo que no exista se ignora y cae al valor por defecto. Un
 * `?gramaje=9999` no rompe la página ni mete una etiqueta inventada en el
 * resumen que viaja al RFQ.
 */
export type LonaParams = Record<string, string | string[] | undefined>;

/** Primer valor de un parámetro, normalizado; `undefined` si no vino. */
function crudo(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = typeof s === 'string' ? s.trim().toLowerCase() : '';
  return t ? t : undefined;
}

/** Valor de una fila de selección única, o el de por defecto si no encaja. */
function valido(
  opciones: readonly { value: string }[],
  v: string | string[] | undefined,
  porDefecto: string,
): string {
  const s = crudo(v);
  return s && opciones.some((o) => o.value === s) ? s : porDefecto;
}

/**
 * Lista de una fila de selección múltiple (`?confeccion=ojales,hf`). Se
 * descartan los ids desconocidos y los repetidos; si no queda ninguno válido
 * se conserva la selección por defecto en vez de dejar la fila vacía.
 */
function validos(
  opciones: readonly { id: string }[],
  v: string | string[] | undefined,
  porDefecto: string[],
): string[] {
  const s = crudo(v);
  if (!s) return porDefecto;
  const ids = [
    ...new Set(
      s
        .split(',')
        .map((x) => x.trim())
        .filter((x) => opciones.some((o) => o.id === x)),
    ),
  ];
  return ids.length ? ids : porDefecto;
}

/**
 * Especificación inicial del configurador a partir de la query. Todo lo que no
 * se reconozca cae a `emptyLona()`: la función NO lanza y NO inventa opciones.
 */
export function lonaDesdeParams(params: LonaParams = {}): LonaSpec {
  const base = emptyLona();
  return {
    material: valido(LONA_MATERIAL, params.material, base.material),
    color: valido(LONA_COLOR, params.color, base.color),
    gramaje: valido(LONA_GRAMAJE, params.gramaje, base.gramaje),
    ancho: valido(LONA_ANCHO, params.ancho, base.ancho),
    textura: valido(LONA_TEXTURA, params.textura, base.textura),
    confeccion: validos(LONA_CONFECCION, params.confeccion, base.confeccion),
    tratamientos: validos(LONA_TRATAMIENTO, params.tratamientos, base.tratamientos),
    ojales: valido(LONA_OJALES, params.ojales, base.ojales),
    ojalesCantidad: valido(
      LONA_OJALES_CANTIDAD,
      params.ojales_cantidad,
      base.ojalesCantidad,
    ),
    ojalesDistancia: valido(
      LONA_OJALES_DISTANCIA,
      params.ojales_distancia,
      base.ojalesDistancia,
    ),
    ojalesBorde: valido(LONA_BORDE, params.ojales_borde, base.ojalesBorde),
    // Ya NO son campos libres: son enums, así que se precargan como cualquier
    // otra fila y con el mismo filtro. Lo que no exista cae al valor por
    // defecto — un `?cantidad=<script>` no llega al dibujo ni al RFQ.
    medidas: valido(LONA_MEDIDAS, params.medidas, base.medidas),
    cantidad: valido(LONA_CANTIDAD, params.cantidad, base.cantidad),
    uso: valido(LONA_USO, params.uso, base.uso),
  };
}

/**
 * Enlace al configurador con las píldoras ya puestas. Se construye desde aquí
 * —y no a mano en cada página— para que un enlace no pueda quedar apuntando a
 * un valor que este archivo ya no ofrece: `lonaDesdeParams` y este generador
 * leen el MISMO enum.
 */
export function hrefConfiguradorLona(
  preseleccion: Partial<Pick<LonaSpec, 'material' | 'gramaje' | 'ancho' | 'color' | 'textura'>> = {},
): string {
  const qs = new URLSearchParams();
  const filas = [
    ['material', LONA_MATERIAL, preseleccion.material],
    ['gramaje', LONA_GRAMAJE, preseleccion.gramaje],
    ['ancho', LONA_ANCHO, preseleccion.ancho],
    ['color', LONA_COLOR, preseleccion.color],
    ['textura', LONA_TEXTURA, preseleccion.textura],
  ] as const;
  for (const [clave, opciones, valor] of filas) {
    if (valor && (opciones as readonly { value: string }[]).some((o) => o.value === valor)) {
      qs.set(clave, valor);
    }
  }
  const cola = qs.toString();
  return cola ? `/configurador/lona?${cola}` : '/configurador/lona';
}

/**
 * LO QUE HAY QUE PREGUNTARLE A CUALQUIER PROVEEDOR.
 *
 * No son ventajas: son las cuatro preguntas cuya respuesta separa un paño que
 * dura de uno que no, y que cualquiera puede hacerle también a esta empresa.
 * Cada una apunta a un dato verificable de la ficha, ninguna a un sello.
 */
export const LONA_PREGUNTAS = [
  {
    n: '01',
    pregunta: '¿Qué gramaje tiene la trama y a cuántos g/m² lo garantiza por escrito?',
    porque:
      'El rango de trabajo va de 200 a 900 g/m². «Lona reforzada» no es un número; el g/m² de la cotización sí.',
  },
  {
    n: '02',
    pregunta: '¿La unión es soldadura de alta frecuencia o costura?',
    porque:
      'Hasta 4.0 m sale en una sola pieza. Por encima hay unión: conviene saber cuál, dónde cae y cómo se comporta al tensar.',
  },
  {
    n: '03',
    pregunta: '¿Cuáles de los cuatro tratamientos lleva realmente este paño?',
    porque:
      'Anti-UV, ignífugo, antiestático y antibacteriano se piden uno a uno. Ninguno viene «de fábrica» por el hecho de ser PVC.',
  },
  {
    n: '04',
    pregunta: '¿Quién confecciona: el mismo que vende el rollo, o un tercero?',
    porque:
      'Ojales, velcro, cremallera y borde reforzado son donde falla un paño. Aquí el corte y la confección se hacen en la planta de Chorrillos.',
  },
] as const;
