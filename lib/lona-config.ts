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

export const LONA_CONFECCION = [
  { id: 'ojales', label: 'Ojales' },
  { id: 'velcro', label: 'Velcro' },
  { id: 'cremallera', label: 'Cremallera' },
  { id: 'costura', label: 'Costura reforzada' },
  { id: 'hf', label: 'Soldadura HF' },
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
  confeccion: ['ojales', 'hf'],
  tratamientos: ['uv'],
  medidas: '',
  cantidad: '',
  uso: '',
});

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
    s.medidas ? `Medidas del paño: ${s.medidas}` : '',
    s.cantidad ? `Cantidad: ${s.cantidad}` : '',
    s.uso ? `Uso previsto: ${s.uso}` : '',
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
    // Los tres campos libres no se precargan desde la URL: son datos del
    // comprador, no de la pieza, y prellenarlos sería ponerle palabras.
    medidas: base.medidas,
    cantidad: base.cantidad,
    uso: base.uso,
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
