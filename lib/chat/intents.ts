/**
 * INTENCIONES DEL ASISTENTE — los botones son datos, no decoración.
 *
 * El patrón es el del widget «Ask AWS»: el estado vacío no es un pozo en
 * blanco sino tres o seis caminos tocables, y después de cada respuesta el
 * asistente ofrece los dos o tres pasos siguientes más probables. El visitante
 * nunca tiene que inventar una frase para empezar ni para continuar.
 *
 * Por qué vive en lib/ y no dentro del componente: quien mantiene el sitio
 * puede añadir o retirar un botón de temporada editando ESTE archivo, sin
 * tocar el widget; y las pruebas pueden validar cada intención (texto no
 * vacío, sin promesas prohibidas, sin precios) sin montar React.
 *
 * REGLAS DE HONESTIDAD (las mismas del resto del sitio):
 *  - Ningún mensaje afirma certificaciones propias, precios ni plazos.
 *  - Las normas ajenas (p. ej. ISO 21898) solo aparecen como PREGUNTA del
 *    comprador, que es exactamente lo que son.
 *  - Cada chip envía el mensaje tal cual como turno del usuario: lo que se
 *    pulsa es lo que se pregunta, sin texto oculto.
 */

export interface ChipIntencion {
  /** Texto corto visible en el botón. */
  etiqueta: string;
  /** Mensaje completo que se envía como turno del usuario al pulsarlo. */
  mensaje: string;
}

export interface Seguimiento {
  /** Se evalúa contra el último intercambio (usuario + asistente). */
  claves: RegExp;
  chips: ChipIntencion[];
}

/** Botones del estado vacío: los trabajos que la gente realmente trae. */
export const INICIOS: ChipIntencion[] = [
  {
    etiqueta: 'Cubrir carga u obra',
    mensaje: 'Necesito cubrir carga, acopio u obra con lona o cobertor a medida.',
  },
  {
    etiqueta: 'Big bags o envases',
    mensaje: 'Necesito big bags o envases para carga a granel.',
  },
  {
    etiqueta: 'Impermeabilizar poza o canal',
    mensaje: 'Necesito geomembrana para impermeabilizar una poza o un canal.',
  },
  {
    etiqueta: 'Ventilación de mina',
    mensaje: 'Necesito mangas de ventilación para mina subterránea.',
  },
  {
    etiqueta: 'Proteger cultivo',
    mensaje: 'Necesito malla para proteger cultivo: sombra, antigranizo o antiáfida.',
  },
  {
    etiqueta: '¿Qué fabrican ustedes?',
    mensaje: '¿Qué fabrican en su planta de Chorrillos y qué importan directamente?',
  },
];

/**
 * Chips de seguimiento por intención. La PRIMERA regla cuyo patrón calce con
 * el último intercambio gana: el orden importa (lo específico antes que lo
 * general). Si ninguna calza, se ofrecen los pasos por defecto.
 */
export const SEGUIMIENTOS: Seguimiento[] = [
  {
    claves: /big\s?-?bag|bols[oó]n|fibc|saco|granel/i,
    chips: [
      { etiqueta: '1 tonelada, boca abierta', mensaje: 'Necesito big bags de aproximadamente 1 tonelada con boca abierta. ¿Qué datos necesitan para cotizar?' },
      { etiqueta: '2 toneladas con válvula', mensaje: 'Necesito big bags de aproximadamente 2 toneladas con válvula de descarga. ¿Qué datos necesitan para cotizar?' },
      { etiqueta: 'Norma ISO 21898', mensaje: '¿Cómo especifico big bags según la norma ISO 21898 para embarque por el Callao?' },
    ],
  },
  {
    claves: /geomembrana|impermeabiliz|poza|canal\b|hdpe|revesti/i,
    chips: [
      { etiqueta: 'PVC para poza de riego', mensaje: 'Necesito geomembrana de PVC para una poza de riego. ¿Qué datos necesitan?' },
      { etiqueta: 'HDPE por proyecto', mensaje: '¿Cómo manejan la geomembrana HDPE? Entiendo que es suministro por proyecto.' },
      { etiqueta: '¿Instalan en obra?', mensaje: '¿Ustedes instalan la geomembrana en obra con equipo propio?' },
    ],
  },
  {
    claves: /manga|ventilaci[oó]n|mina|socav[oó]n|t[uú]nel/i,
    chips: [
      { etiqueta: 'Diámetro y longitud', mensaje: 'Tengo el diámetro y la longitud de la manga de ventilación. ¿Qué más necesitan para cotizar?' },
      { etiqueta: 'Calcular caudal', mensaje: '¿Cómo calculo el caudal de ventilación que necesita mi frente de avance?' },
      { etiqueta: 'Pedir cotización', mensaje: 'Quiero cotizar mangas de ventilación. Le paso medidas, cantidad y ciudad.' },
    ],
  },
  {
    claves: /malla|raschel|anti[aá]fida|antigranizo|invernadero|cultivo|sombra/i,
    chips: [
      { etiqueta: 'Porcentaje de sombra', mensaje: '¿Qué porcentaje de sombra me conviene para mi cultivo?' },
      { etiqueta: 'Malla antiáfida', mensaje: 'Necesito malla antiáfida para invernadero. ¿Qué datos necesitan?' },
      { etiqueta: 'Pedir cotización', mensaje: 'Quiero cotizar malla agrícola. Le paso hectáreas o medidas, cantidad y ciudad.' },
    ],
  },
  {
    claves: /lona|cobertor|toldo|sider|carpa|acopio|cubrir/i,
    chips: [
      { etiqueta: 'Toldos para camión', mensaje: 'Necesito toldos o siders para camión. ¿Qué datos de la caja necesitan?' },
      { etiqueta: 'Cobertor de acopio', mensaje: 'Necesito cubrir un acopio a la intemperie. ¿Qué material me recomiendan?' },
      { etiqueta: 'Pedir cotización', mensaje: 'Quiero cotizar. Le paso medidas, cantidad y ciudad de entrega.' },
    ],
  },
  {
    claves: /precio|costo|cu[aá]nto (cuesta|vale|sale)|tarifa/i,
    chips: [
      { etiqueta: '¿Por qué no hay lista?', mensaje: '¿Por qué no publican lista de precios?' },
      { etiqueta: 'Cotizar con ficha técnica', mensaje: 'Entiendo. Quiero una cotización formal: le paso producto, medidas, cantidad y ciudad.' },
    ],
  },
  {
    claves: /plazo|entrega|demora|despacho|env[ií]o|provincia/i,
    chips: [
      { etiqueta: '¿Despachan a mi ciudad?', mensaje: '¿Despachan a todo el país? Mi obra está en provincia.' },
      { etiqueta: '¿Instalan en provincias?', mensaje: '¿Su equipo instala también fuera de Lima?' },
      { etiqueta: 'Pedir cotización', mensaje: 'Quiero cotizar con plazo incluido. Le paso producto, cantidad y ciudad.' },
    ],
  },
];

/** Pasos por defecto cuando el intercambio no calza con ninguna intención. */
export const SEGUIMIENTO_DEFECTO: ChipIntencion[] = [
  { etiqueta: 'Pedir cotización', mensaje: 'Quiero una cotización. Le paso producto, medidas, cantidad y ciudad.' },
  { etiqueta: '¿Qué fabrican ustedes?', mensaje: '¿Qué fabrican en su planta de Chorrillos y qué importan directamente?' },
  { etiqueta: '¿Instalan en obra?', mensaje: '¿Ustedes instalan en obra con equipo propio?' },
];

/**
 * Chips de seguimiento para el último intercambio. Devuelve siempre 2–3
 * chips: la conversación nunca termina en un callejón sin salida.
 */
export function seguimientosPara(texto: string): ChipIntencion[] {
  for (const s of SEGUIMIENTOS) {
    if (s.claves.test(texto)) return s.chips;
  }
  return SEGUIMIENTO_DEFECTO;
}
