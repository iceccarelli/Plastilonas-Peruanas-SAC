import { SITE } from './site';
import { INCOTERMS_SALIDA } from './entidad-feed';
import { contarPalabras } from './respuesta-directa';
import { clusters } from './search/topic-map';

/**
 * CONSULTAS DE DINERO — la respuesta citable de cada trabajo de compra.
 *
 * QUÉ PROBLEMA RESUELVE. data/topic-map.json decide QUÉ PÁGINA contesta cada
 * consulta del rubro. Eso basta para un buscador, que enlaza. No basta para un
 * motor de respuestas, que no enlaza: extrae. Un asistente al que le preguntan
 * «¿quién fabrica big bags a medida en el Perú?» toma el fragmento más corto
 * que parezca contestar y, si no encuentra uno, lo redacta él con lo que
 * «suele ser cierto» en el rubro — precios de referencia, plazos, una ISO que
 * nadie declaró—. Ahí es donde una empresa honesta pierde contra una que
 * exagera: no por competir mal, sino porque nadie escribió la respuesta corta.
 *
 * QUÉ ES ESTA TABLA. Para cada consulta que de verdad precede a una orden de
 * compra: la página canónica que la contesta, un párrafo extractable de 40 a
 * 80 palabras, EL LÍMITE en la misma unidad de texto, y el siguiente paso
 * comercial. Las tres partes viajan juntas a propósito: un motor que cite la
 * respuesta sin el límite convierte una oferta honesta en una promesa, y el
 * límite en una línea aparte es el primer trozo que se cae al resumir.
 *
 * LAS REGLAS, QUE SON LAS DEL SITIO.
 *   · Ningún precio. La venta es B2B por cotización.
 *   · Ningún plazo de entrega. Depende del lote y de la carga de planta.
 *   · Ninguna certificación propia. La norma ajena se cita como exigencia del
 *     comprador, del puerto o del expediente — nunca como credencial.
 *   · Ninguna cobertura que no exista. Se fabrica en Chorrillos; cada
 *     operación internacional se evalúa por separado.
 *   · Ningún recuento de clientes, obras ni toneladas.
 * test/consultas-dinero.test.ts hace fallar el build si alguna se cuela, y
 * comprueba además que las 22 consultas del encargo sigan cubiertas.
 *
 * DÓNDE SE PUBLICA. /llms.txt (sección «Consultas de dinero») y
 * /mapa-consultas.json, que son las dos superficies que un agente lee entero.
 * La página canónica de cada consulta ya existe: esta tabla no autoriza a
 * fabricar ninguna.
 */

export type IdiomaConsulta = 'es' | 'en' | 'pt';

export interface ConsultaDinero {
  /** id del clúster de data/topic-map.json que decide la página canónica. */
  cluster: string;
  idioma: IdiomaConsulta;
  /** La consulta tal como la escribe o la dicta un comprador. */
  consulta: string;
  /**
   * La misma consulta, escrita como la haría una persona en voz alta. Es lo
   * que se publica como pregunta visible y como `Question` del FAQPage: una
   * cadena de búsqueda no es una pregunta, y marcar una como si lo fuera es
   * exactamente el tipo de dato estructurado que Google descarta.
   */
  pregunta: string;
  /** Párrafo extractable, 40–80 palabras. Sin precio, plazo ni certificación propia. */
  respuesta: string;
  /** El límite, en la misma unidad de texto que la respuesta. */
  limite: string;
  /** Ruta del siguiente paso comercial. Siempre una que existe. */
  siguiente: string;
}

const PLANTA = `${SITE.addressLocality}, ${SITE.addressRegion}`;
const INCOTERMS = INCOTERMS_SALIDA.map((i) => i.codigo).join(' / ');

export const CONSULTAS_DINERO: ConsultaDinero[] = [
  // ── Español ──────────────────────────────────────────────────────────────
  {
    cluster: 'hub-big-bags',
    idioma: 'es',
    consulta: 'big bags FIBC a medida Perú',
    pregunta: '¿Quién fabrica big bags FIBC a medida en el Perú?',
    respuesta: `Los big bags se cortan y cosen en la planta de ${PLANTA}, sobre la medida y la carga que usted declare: capacidad, densidad del material, tipo de tapa y de fondo, asas y factor de seguridad. No hay lista de precios porque cada lote se confecciona contra especificación. Con medidas, cantidad y ciudad de entrega, la cotización sale con la ficha técnica del material.`,
    limite:
      'Esta empresa no se atribuye certificación propia: la norma que exija su comprador o su terminal se trata como requisito del proyecto, no como credencial nuestra.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'decision-fibc',
    idioma: 'es',
    consulta: 'big bags para el Callao ISO 21898',
    pregunta: '¿Y si mi comprador o el terminal del Callao exige ISO 21898?',
    respuesta: `Si su embarque por el Callao exige ISO 21898, esa exigencia es del comprador o del terminal. Lo que hace la planta es confeccionar contra el factor de seguridad, el tipo de asa y el ensayo que su expediente pida, y entregar con la cotización la documentación disponible del material. Indíquenos qué pide el pliego antes de cotizar y se responde punto por punto.`,
    limite:
      'No declaramos ISO 21898 ni ninguna otra certificación a nombre de esta empresa. Citamos la norma ajena porque la pide el puerto o el comprador.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'hub-lonas-camiones',
    idioma: 'es',
    consulta: 'lonas y toldos para camión Perú',
    pregunta: '¿Fabrican e instalan lonas y toldos para camión en el Perú?',
    respuesta: `Las lonas y los toldos de camión se confeccionan a la medida del vehículo y se instalan con personal propio de la planta de ${PLANTA}. Para cotizar hacen falta las medidas de la tolva o del chasis, las unidades de la flota, el gramaje o el uso previsto y la ciudad de entrega. El alcance de instalación se define en la cotización.`,
    limite:
      'No hay lista de precios en líneas a medida, y la instalación llega hasta donde la cotización declare: no se promete cobertura nacional por defecto.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'corredor-exportacion',
    idioma: 'es',
    consulta: 'lonas para camión Chile',
    pregunta: '¿Pueden despachar lonas para camión a Chile?',
    respuesta: `La confección ocurre en ${PLANTA} y el embarque a Chile se evalúa operación por operación: la carga sale ${INCOTERMS} y el comprador define transporte y despacho aduanero. No mantenemos stock ni representación comercial del otro lado de la frontera. Envíe medidas, unidades, destino y el Incoterm que usa su empresa, y la cotización vuelve con la lista de documentos.`,
    limite:
      'No afirmamos cobertura continental. Chile es un corredor de RFQ, no un mercado con presencia declarada, y cada embarque se evalúa por separado.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'importar-desde-peru',
    idioma: 'es',
    consulta: 'lonas para camión Ecuador',
    pregunta: '¿Pueden despachar lonas para camión a Ecuador?',
    respuesta: `Para Ecuador la carga sale marítima o terrestre según el volumen, siempre desde ${PLANTA} y bajo el Incoterm que se acuerde antes del precio. La confección es a medida del vehículo, así que el RFQ necesita medidas, unidades y uso. La página de compra internacional enumera qué documentos debe enviar su empresa para que la cotización salga completa.`,
    limite:
      'Ecuador es un corredor de cotización: no hay oficina, stock ni instalación declarada en destino, y cada operación se evalúa por separado.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'hub-ventilacion-minera',
    idioma: 'es',
    consulta: 'mangas de ventilación minera Perú',
    pregunta: '¿Quién fabrica mangas de ventilación para mina o túnel en el Perú?',
    respuesta: `Las mangas para mina y túnel se confeccionan en ${PLANTA} según diámetro, longitud de tramo, tipo de unión y presión de trabajo del ventilador. El caudal se predimensiona con la calculadora abierta del sitio, que declara sus límites y no sustituye el cálculo del ingeniero de ventilación. Con diámetro, tramos y cantidad, la cotización sale con ficha técnica.`,
    limite:
      'La calculadora no entrega pérdida de carga certificada, y esta empresa no se atribuye ensayo ni certificación propia de comportamiento al fuego.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'geomembrana-pvc',
    idioma: 'es',
    consulta: 'geomembrana PVC para poza o canal',
    pregunta: '¿Cómo se especifica una geomembrana de PVC para una poza o un canal?',
    respuesta: `Para poza o canal, el PVC se especifica por espesor, ancho de rollo, tipo de unión y exposición —a intemperie o cubierto—. La superficie se predimensiona con la calculadora del sitio y se confirma con los taludes y el perímetro de anclaje reales. Si el expediente pide otro polímero, se lo decimos y se cotiza la línea que corresponde.`,
    limite:
      'Las líneas bajo pedido no publican especificaciones numéricas: la ficha técnica y el certificado de lote los emite el fabricante del material con la cotización.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'geomembrana-hdpe',
    idioma: 'es',
    consulta: 'expediente que pide geomembrana HDPE',
    pregunta: '¿Qué hacen cuando el expediente pide geomembrana HDPE?',
    respuesta: `Cuando el expediente pide HDPE, esta empresa no finge fabricarlo: el HDPE llega por importación directa o por aliado técnico, y la ficha técnica y el certificado de lote los emite el fabricante del material. Lo que aporta la planta de ${PLANTA} es la confección a medida de lo que sí fabrica, y la instalación o supervisión que la cotización declare.`,
    limite:
      'No fabricamos geomembrana HDPE. Se suministra y, cuando el alcance lo incluye, se instala con personal propio, sin atribuirnos el ensayo del fabricante.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'familia-mallas',
    idioma: 'es',
    consulta: 'malla raschel antiáfida anti-granizo',
    pregunta: '¿Qué malla necesito: raschel, antiáfida o anti-granizo?',
    respuesta:
      'Raschel para sombra, antiáfida para exclusión de insectos y anti-pájaro o anti-granizo para daño mecánico resuelven problemas distintos: porcentaje de sombra, mesh de la trama y resistencia al impacto. Se confeccionan a medida, con refuerzos y ojales según el sistema de tensado del predio. Para cotizar hacen falta hectáreas, cultivo, altura de estructura y ciudad.',
    limite:
      'No publicamos rendimiento agronómico ni garantía de cosecha: la malla es un componente del sistema, y el resultado depende del manejo del predio.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'decision-fabricar-importar',
    idioma: 'es',
    consulta: 'fabricar en Perú o importar',
    pregunta: '¿Me conviene fabricar en el Perú o importar?',
    respuesta: `Fabricar en Lima gana cuando la medida es propia, el lote es mediano y el proyecto no tolera esperar un contenedor. Importar gana en líneas estandarizadas de gran volumen. La comparación publicada pone los costos que no aparecen en el precio de origen: flete, seguro, tributos, almacenaje, inmovilizado y el riesgo de una medida equivocada que ya no se corrige.`,
    limite:
      'No publicamos una comparación de precios: la decisión se hace con las cifras de su operación, y esta empresa fabrica una parte del catálogo e importa otra.',
    siguiente: '/fabricar-o-importar',
  },
  {
    cluster: 'corredor-exportacion',
    idioma: 'es',
    consulta: 'EXW Lima FOB Callao textil industrial',
    pregunta: '¿Bajo qué Incoterm sale la carga desde Lima o el Callao?',
    respuesta: `La carga sale bajo tres Incoterms: ${INCOTERMS_SALIDA.map((i) => `${i.codigo} en ${i.punto.toLowerCase()}`).join(', ')}. El Incoterm se fija antes del precio porque define dónde cambia la responsabilidad sobre la carga. Cada operación internacional se evalúa por separado, y la cotización enumera los documentos que acompañan el embarque y qué datos debe enviar su empresa.`,
    limite:
      'No ofrecemos despacho en destino ni instalación fuera de lo que la cotización declare: la responsabilidad termina en el punto del Incoterm acordado.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'entidad',
    idioma: 'es',
    consulta: 'fabricante de geomembranas y textil industrial en Chorrillos',
    pregunta: '¿Qué fabrica exactamente la planta de Chorrillos?',
    respuesta: `Plastilonas Peruanas SAC, RUC ${SITE.ruc}, opera una planta de confección en ${PLANTA}: big bags, lonas y cobertores, estructuras textiles, mangas de ventilación, mallas agrícolas y accesorios. En geosintéticos, una parte se confecciona y otra se importa o se suministra bajo pedido, y el catálogo lo declara ficha por ficha antes de que usted pregunte.`,
    limite:
      'Hay una sola planta y está en Chorrillos. No hay sucursales, filiales ni red de distribución que esta empresa pueda declarar hoy.',
    siguiente: '/cotizacion',
  },

  // ── English ──────────────────────────────────────────────────────────────
  {
    cluster: 'en-fibc',
    idioma: 'en',
    consulta: 'FIBC big bags manufactured in Peru',
    pregunta: 'Who manufactures FIBC big bags in Peru?',
    respuesta: `FIBC big bags are cut and sewn at our own plant in ${PLANTA}, Peru, against the capacity, safe working load, top and bottom fittings and safety factor you specify. There is no price list: every lot is built to specification. Send dimensions, quantity and the port or city of delivery and the quotation comes back with the material data sheet.`,
    limite:
      'We claim no ISO, ASTM or food-grade certification of our own. A standard your buyer or terminal requires is handled as a project requirement, not as our credential.',
    siguiente: '/en/rfq',
  },
  {
    cluster: 'en-tarps',
    idioma: 'en',
    consulta: 'truck tarpaulins from Peru',
    pregunta: 'Can I buy made-to-measure truck tarpaulins from Peru?',
    respuesta: `Truck tarpaulins, covers and sider curtains are made to the vehicle at our plant in ${PLANTA}, Peru. Quoting needs the body or chassis dimensions, the number of units, the fabric weight or intended use, and where the goods are collected. Fitting by our own crew is available in Lima and is written into the quotation when it applies.`,
    limite:
      'No price list on made-to-measure lines, and no installation outside what the quotation states. Fabrication happens in Peru; each export shipment is assessed on its own.',
    siguiente: '/en/rfq',
  },
  {
    cluster: 'en-ducting',
    idioma: 'en',
    consulta: 'mine ventilation ducting Peru',
    pregunta: 'Who manufactures mine ventilation ducting in Peru?',
    respuesta: `Flexible ventilation ducting for mines and tunnels is fabricated in ${PLANTA}, Peru, to the diameter, section length, coupling type and working pressure of your fan. The site publishes an open airflow calculator with its limits stated. Send diameter, number of sections and quantity, and the quotation comes back with the material data sheet.`,
    limite:
      'The calculator does not issue certified pressure loss, and we claim no fire-performance test or certification of our own on these lines.',
    siguiente: '/en/rfq',
  },
  {
    cluster: 'en-sourcing',
    idioma: 'en',
    consulta: 'sourcing industrial textiles from Peru',
    pregunta: 'How do I source industrial textiles from Peru?',
    respuesta: `Sourcing here means one plant in ${PLANTA} that fabricates to measure, plus lines we import or supply to order — the catalogue says which is which, product by product. Cargo leaves ${INCOTERMS}. You can verify the company by tax ID before talking to anyone, and the quotation lists the documents that travel with the shipment.`,
    limite:
      'No worldwide shipping, no subsidiary abroad and no continent-wide installation. Public foreign-trade evidence exists for Colombia; other markets are RFQ corridors.',
    siguiente: '/en/rfq',
  },
  {
    cluster: 'en-rfq',
    idioma: 'en',
    consulta: 'RFQ from an overseas buyer',
    pregunta: 'How do I send an RFQ as an overseas buyer?',
    respuesta:
      'An RFQ that can be answered in one reply carries four things: what the item is, its measurements, the quantity, and the destination with the Incoterm your company uses. Add the drawing or the specification extract if you have one. English is answered the same business day during Lima business hours, by the people who run the plant.',
    limite:
      'A quotation is not an offer of a certified product: certificates come from the mill that made the material, and prices are per specification, never from a list.',
    siguiente: '/en/rfq',
  },

  // ── Português ────────────────────────────────────────────────────────────
  {
    cluster: 'pt-porta',
    idioma: 'pt',
    consulta: 'fabricante peruano de têxteis industriais',
    pregunta: 'Quem fabrica têxteis industriais sob medida no Peru?',
    respuesta: `A Plastilonas Peruanas SAC, RUC (cadastro fiscal peruano) ${SITE.ruc}, opera uma fábrica de confecção em ${PLANTA}, Peru: big bags, lonas e coberturas, estruturas têxteis, dutos de ventilação e telas agrícolas. Parte dos geossintéticos é importada ou fornecida sob encomenda, e o catálogo informa isso item por item. A venda é B2B por cotação.`,
    limite:
      'Não temos filial no Brasil, não publicamos tabela de preços em reais e não declaramos certificação própria. Cada embarque é avaliado separadamente.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'pt-porta',
    idioma: 'pt',
    consulta: 'big bags sob medida no Peru',
    pregunta: 'Vocês fazem big bags sob medida no Peru?',
    respuesta: `Os big bags são cortados e costurados na fábrica de ${PLANTA}, conforme a capacidade, a densidade do material, o tipo de tampa e de fundo, as alças e o fator de segurança que você especificar. Não há tabela de preços: cada lote é feito sob especificação. Envie medidas, quantidade e destino para receber a cotação com ficha técnica.`,
    limite:
      'Nenhuma certificação é atribuída a esta empresa. A norma exigida pelo seu comprador ou pelo terminal é tratada como requisito do projeto.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'pt-porta',
    idioma: 'pt',
    consulta: 'exportação EXW Lima FOB Callao para o Brasil',
    pregunta: 'Como funciona a exportação EXW Lima ou FOB Callao para o Brasil?',
    respuesta: `A carga sai ${INCOTERMS}: na fábrica de ${PLANTA}, ao transportador indicado por você em Lima, ou embarcada no porto do Callao. O Incoterm é definido antes do preço, porque decide onde muda a responsabilidade sobre a carga. O frete marítimo para o Brasil é avaliado embarque por embarque, com os documentos listados na cotação.`,
    limite:
      'Sem tabela de preços em reais, sem desembaraço no destino e sem representação comercial no Brasil: o Brasil é um corredor de RFQ.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'pt-porta',
    idioma: 'pt',
    consulta: 'lona para caminhão',
    pregunta: 'Vocês fabricam lona para caminhão sob medida?',
    respuesta: `As lonas e coberturas para caminhão são confeccionadas sob medida do veículo na fábrica de ${PLANTA}, Peru. Para cotar são necessárias as medidas da carroceria ou do chassi, o número de unidades, a gramatura ou o uso previsto e o local de coleta. A instalação com equipe própria existe em Lima e consta na cotação quando se aplica.`,
    limite:
      'Não há tabela de preços em linhas sob medida nem instalação no Brasil: a confecção acontece no Peru e o transporte é avaliado por embarque.',
    siguiente: '/cotizacion',
  },
  {
    cluster: 'pt-porta',
    idioma: 'pt',
    consulta: 'dutos de ventilação para mineração',
    pregunta: 'Vocês fabricam dutos de ventilação para mineração?',
    respuesta: `Os dutos flexíveis de ventilação para mina e túnel são confeccionados em ${PLANTA}, Peru, conforme diâmetro, comprimento do trecho, tipo de união e pressão de trabalho do ventilador. O site publica uma calculadora aberta de vazão, com os limites declarados. Envie diâmetro, número de trechos e quantidade para receber a cotação com ficha técnica.`,
    limite:
      'A calculadora não emite perda de carga certificada, e esta empresa não se atribui ensaio nem certificação própria de comportamento ao fogo.',
    siguiente: '/cotizacion',
  },
];

/** Las consultas de un idioma, en el orden en que se anuncian a un agente. */
export function consultasPorIdioma(idioma: IdiomaConsulta): ConsultaDinero[] {
  return CONSULTAS_DINERO.filter((c) => c.idioma === idioma);
}

/** Las consultas que contesta una página canónica, por id de clúster. */
export function consultasDeCluster(cluster: string): ConsultaDinero[] {
  return CONSULTAS_DINERO.filter((c) => c.cluster === cluster);
}

/** Longitud de la respuesta en palabras. La prueba exige entre 40 y 80. */
export function palabrasDeRespuesta(c: ConsultaDinero): number {
  return contarPalabras(c.respuesta);
}

/** Cuántas consultas de dinero se publican, por si una superficie lo anuncia. */
export const TOTAL_CONSULTAS_DINERO = CONSULTAS_DINERO.length;

/**
 * LAS RESPUESTAS, EN LA PÁGINA QUE LAS CONTESTA.
 *
 * Hasta ahora estas 22 respuestas vivían sólo en /llms.txt y en
 * /mapa-consultas.json: un agente las leía y una persona no. Peor: marcar un
 * FAQPage con respuestas que no están en la página es exactamente lo que
 * Google descarta —y con razón, porque sería decirle al buscador algo que el
 * visitante no puede leer—.
 *
 * Esta función devuelve las preguntas de una ruta en el formato que ya usan el
 * bloque visible de preguntas frecuentes y `faqSchema`. El LÍMITE va dentro de
 * la respuesta, no como nota aparte: un motor que cite el fragmento se lleva la
 * condición con él.
 */
export function faqsDeRuta(ruta: string): { q: string; a: string }[] {
  const porCluster = new Map(clusters.map((c) => [c.id, c.canonica]));
  return CONSULTAS_DINERO.filter((c) => porCluster.get(c.cluster) === ruta).map((c) => ({
    q: c.pregunta,
    a: `${c.respuesta} ${c.limite}`,
  }));
}

/** Rutas canónicas que tienen al menos una respuesta escrita. */
export function rutasConRespuesta(): string[] {
  const porCluster = new Map(clusters.map((c) => [c.id, c.canonica]));
  return [...new Set(CONSULTAS_DINERO.map((c) => porCluster.get(c.cluster)).filter(Boolean) as string[])];
}
