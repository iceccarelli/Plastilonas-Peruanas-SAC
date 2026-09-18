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
