/**
 * CUÑAS COMERCIALES — los tres frentes donde esta empresa quiere ser la
 * respuesta por defecto en el Perú:
 *
 *   1. /lonas-camiones     — lonas, toldos y siders para camión + instalación
 *   2. /ventilacion-minera — mangas de ventilación para minas y túneles
 *   3. /big-bags           — big bags / FIBC de 1–2 t confeccionados en Lima
 *
 * Cada hub agrupa las fichas hijas, el checklist de especificación, la guía
 * de la biblioteca y el hub de industria que ya existen. REGLA DE HONESTIDAD:
 * el bloque `queHacemos`/`queNoAfirmamos` sale del `sourcing` real del
 * catálogo — un hub no puede atribuir fabricación propia a una línea que la
 * ficha declara de otro modo, y no afirma certificaciones, clientes ni obras.
 */

export interface Cuna {
  slug: string;
  /** H1 con la forma de la consulta del comprador. */
  h1: string;
  titulo: string;
  descripcion: string;
  intro: string[];
  /** Checklist de especificación: qué debe traer el RFQ. */
  checklist: { dato: string; detalle: string }[];
  /** Slugs de lib/products.ts que este hub agrupa. */
  productSlugs: string[];
  /** Honestidad fabricación vs. suministro. */
  queHacemos: string[];
  queNoAfirmamos: string[];
  faqs: { q: string; a: string }[];
  /** Guía de /biblioteca que gobierna la especificación. */
  guiaSlug: string;
  /** Hub de industria relacionado. */
  industriaSlug: string;
  /** Calculadora relacionada, si existe. */
  calculadoraSlug?: string;
  /** Mensaje de WhatsApp prellenado (guion de los 4 datos). */
  whatsapp: string;
  /** Fotografía ilustrativa del frente. Referencial: la etiqueta lo declara. */
  foto: { src: string; alt: string };
}

export const cunas: Cuna[] = [
  {
    slug: 'lonas-camiones',
    h1: 'Lonas, toldos y siders para camión a medida, con instalación',
    titulo: 'Lonas y toldos para camión a medida en Perú',
    descripcion:
      'Confeccionamos lonas, toldos, cobertores y siders para camión en nuestra planta de Chorrillos, con instalación propia. Se cotiza con medidas y ciudad.',
    intro: [
      'Una lona de camión se compra dos veces: la primera por precio y la segunda por haber comprado por precio. Lo que decide la vida útil no es el catálogo sino la especificación: el gramaje correcto para la ruta, la confección reforzada donde la carga roza y un sistema de tensado que un solo conductor pueda operar.',
      'Confeccionamos cobertores, toldos y siders contra las medidas reales de la carrocería, y los instalamos con equipo propio en Lima. Para flotas, el mismo plano se repite en cada unidad: la pieza de la unidad 12 es idéntica a la de la unidad 1.',
    ],
    checklist: [
      { dato: 'Medidas de la carrocería', detalle: 'largo × ancho × alto útil, o el plano si existe' },
      { dato: 'Tipo de carga', detalle: 'granel, paletizada, concentrado, agrícola' },
      { dato: 'Sistema', detalle: 'cobertor simple, toldo con arcos, sider corredizo' },
      { dato: 'Cantidad de unidades', detalle: 'una unidad o flota (el plano se repite)' },
      { dato: 'Ciudad de entrega o instalación', detalle: 'instalación propia en Lima; despacho nacional' },
    ],
    productSlugs: [
      'mantas-cobertores-toldos-camiones',
      'siders-tolderas-camiones',
      'lona-plastificada-rafia-polytarp',
      'revestimiento-vehicular-toldos-publicitarios',
      'accesorios-instalacion',
    ],
    queHacemos: [
      'Confección en planta propia (Chorrillos): mantas, cobertores, toldos, siders y lona plastificada a medida.',
      'Instalación con equipo propio en Lima y coordinación de despacho al resto del país.',
      'Reposición por plano: guardamos la especificación de su flota para repetirla.',
    ],
    queNoAfirmamos: [
      'No publicamos precios: cada pieza depende de medidas, gramaje y confección.',
      'Los accesorios de instalación (ojalillos, tensores, tubos) son importación directa, no fabricación propia.',
      'No afirmamos certificaciones de producto que no podamos respaldar con documento en la cotización.',
    ],
    faqs: [
      {
        q: '¿Fabrican la lona o la revenden?',
        a: 'La confección es propia: cortamos y sellamos en la planta de Chorrillos sobre lona plastificada y rafia. Los accesorios metálicos de instalación son importación directa y así lo declara cada ficha.',
      },
      {
        q: '¿Instalan el toldo o sider en el camión?',
        a: 'Sí, con equipo propio en Lima. Para otras ciudades se coordina el despacho de la pieza confeccionada con su plano de instalación.',
      },
      {
        q: '¿Qué necesito enviar para que me coticen?',
        a: 'Las medidas de la carrocería (largo, ancho, alto útil), el tipo de carga, el sistema que busca y la ciudad. Con esos datos respondemos con ficha técnica en horario comercial.',
      },
      {
        q: '¿Atienden flotas?',
        a: 'Sí. El plano de la primera unidad queda registrado y la reposición o ampliación de flota se fabrica idéntica, sin volver a medir.',
      },
    ],
    guiaSlug: 'gramaje-lona-industrial',
    industriaSlug: 'transporte-logistica',
    whatsapp:
      'Hola, quiero cotizar lonas/toldos/siders para camión. Medidas de carrocería: ___. Cantidad de unidades: ___. Ciudad de entrega: ___.',
    foto: {
      src: '/images/hero/hero-08.webp',
      alt: 'Camión con siders y tolderas de lona en una carretera peruana.',
    },
  },
  {
    slug: 'ventilacion-minera',
    h1: 'Mangas de ventilación para minas y túneles, fabricadas a medida',
    titulo: 'Mangas de ventilación minera a medida en Perú',
    descripcion:
      'Fabricamos mangas de ventilación para minas y túneles en Chorrillos: diámetro y largo de tramo contra especificación. RFQ con checklist técnico.',
    intro: [
      'El diámetro es el dato fácil de una manga de ventilación. Lo que decide el consumo del ventilador durante toda la vida del frente es la calidad de las uniones, la rugosidad interior y cuántas fugas tiene el tramo instalado.',
      'Fabricamos mangas para ventilación de minas y túneles contra especificación —diámetro, largo de tramo, régimen de impulsión o extracción— en la planta de Chorrillos, con los accesorios que completan el sistema.',
    ],
    checklist: [
      { dato: 'Diámetro interior', detalle: 'en mm; por tramo si varía' },
      { dato: 'Largo de cada tramo', detalle: 'y metraje total requerido' },
      { dato: 'Régimen', detalle: 'impelente (impulsión) o aspirante (extracción)' },
      { dato: 'Ambiente', detalle: 'humedad, abrasión, requisito antiestático si la operación lo exige' },
      { dato: 'Caudal de diseño', detalle: 'si existe memoria de ventilación, adjúntela' },
      { dato: 'Sitio y ciudad de entrega', detalle: 'para plazo y flete' },
    ],
    productSlugs: ['mangas-ventilacion-minas-tuneles', 'accesorios-instalacion'],
    queHacemos: [
      'Fabricación propia de mangas de ventilación en Chorrillos, contra diámetro y largo de tramo.',
      'Accesorios del sistema (uniones, abrazaderas, sogas) para que el tramo llegue completo al frente.',
      'Cotización con ficha técnica del material ofertado.',
    ],
    queNoAfirmamos: [
      'No entregamos memoria de cálculo de ventilación ni certificación de cumplimiento de norma de mina: eso pertenece al área de ventilación de la operación.',
      'No publicamos tablas de pérdida de carga certificadas: el ensayo pertenece a la operación y a su expediente.',
      'Sin precios de lista: cada tramo depende de diámetro, largo y régimen.',
    ],
    faqs: [
      {
        q: '¿Qué datos necesita el RFQ de una manga de ventilación?',
        a: 'Diámetro interior, largo de cada tramo, si el régimen es impulsión o extracción, y el ambiente (humedad, abrasión, requisito antiestático). Sin esos cuatro datos cualquier precio es inventado.',
      },
      {
        q: '¿La manga cumple la norma de mi mina?',
        a: 'La norma interna de la operación manda: adjúntela al RFQ y la cotización responde contra ella. No afirmamos cumplimientos genéricos sin documento.',
      },
      {
        q: '¿Venden solo la manga o el sistema completo?',
        a: 'El tramo útil es un sistema: manga, uniones y accesorios de suspensión. Cotizamos el conjunto para que no falte una pieza a 4 000 metros.',
      },
      {
        q: '¿Fabrican en el Perú?',
        a: 'Sí: la confección es propia, en la planta de Chorrillos (Lima), lo que acorta la reposición de tramos frente a la importación.',
      },
    ],
    guiaSlug: 'seleccion-mangas-ventilacion',
    industriaSlug: 'mineria',
    calculadoraSlug: 'caudal-ventilacion-mina',
    whatsapp:
      'Hola, quiero cotizar mangas de ventilación. Diámetro y largo de tramo: ___. Metraje total: ___. Ciudad de entrega: ___.',
    foto: {
      src: '/images/hero/hero-09.webp',
      alt: 'Mangas de ventilación industrial dispuestas en planta.',
    },
  },
  {
    slug: 'big-bags',
    h1: 'Big bags / FIBC de 1 y 2 toneladas, confeccionados en Lima',
    titulo: 'Big bags / FIBC confeccionados en Lima, Perú',
    descripcion:
      'Big bags (FIBC) de 1 y 2 toneladas cortados y cosidos en Chorrillos: faldón, válvula de descarga, liner. Se cotiza con capacidad, cantidad y ciudad.',
    intro: [
      'Un big bag se especifica por lo que va a contener y por cómo se va a izar, no por su foto. La capacidad (1 o 2 toneladas), el factor de seguridad, el tipo de boca y descarga, y si la carga exige liner interior: esas cuatro decisiones definen el bolsón correcto.',
      'Cortamos y cosemos big bags en la planta de Chorrillos, con los formatos que la operación pida: faldón, válvula de descarga, liner de polietileno. Para embarques a granel, los sacos Polytarp complementan la línea como importación directa declarada.',
    ],
    checklist: [
      { dato: 'Capacidad', detalle: '1 t o 2 t, y densidad del material si la conoce' },
      { dato: 'Medidas', detalle: 'base × base × alto (p. ej. 90×90×90 cm) o el estándar que usa' },
      { dato: 'Factor de seguridad', detalle: '5:1 uso único · 6:1 multiuso, según su operación' },
      { dato: 'Boca y descarga', detalle: 'faldón, boca abierta, válvula de descarga, liner interior' },
      { dato: 'Cantidad y ciudad de entrega', detalle: 'lote y destino, para plazo y flete' },
    ],
    productSlugs: [
      'big-bags-bolsones-polipropileno',
      'sacos-polytarp-embarque-granel',
      'bolsas-laminas-pebd-pead',
    ],
    queHacemos: [
      'Corte y confección de big bags / FIBC en la planta de Chorrillos, sobre tejido de polipropileno.',
      'Configuración por uso: faldón, válvula de descarga, liner interior de polietileno.',
      'Lotes repetibles: la especificación del primer lote queda registrada para reposición.',
    ],
    queNoAfirmamos: [
      'No afirmamos certificación ISO 21898 propia: la documentación disponible del tejido y del lote se entrega en la cotización.',
      'Los sacos Polytarp de embarque son importación directa, no confección propia, y su ficha lo declara.',
      'Sin precios de lista: capacidad, tejido, liner y cantidad definen cada lote.',
    ],
    faqs: [
      {
        q: '¿Qué diferencia hay entre factor de seguridad 5:1 y 6:1?',
        a: 'El 5:1 corresponde a bolsones de un solo uso; el 6:1, a bolsones reutilizables. La elección depende de si su operación reutiliza el envase y de lo que exija su protocolo de izaje.',
      },
      {
        q: '¿Los fabrican en el Perú?',
        a: 'Sí: el corte y la costura se hacen en la planta de Chorrillos, Lima. Eso permite medidas fuera de estándar y reposición más corta que la importación.',
      },
      {
        q: '¿Qué necesito indicar para cotizar?',
        a: 'Capacidad (1 o 2 t), medidas o el estándar que usa, tipo de boca y descarga, si requiere liner, la cantidad del lote y la ciudad de entrega.',
      },
      {
        q: '¿Entregan ficha técnica?',
        a: 'Cada cotización sale con ficha técnica del bolsón ofertado y la documentación disponible del tejido y del lote.',
      },
    ],
    guiaSlug: 'especificacion-fibc',
    industriaSlug: 'mineria',
    calculadoraSlug: 'big-bags-por-viaje',
    whatsapp:
      'Hola, quiero cotizar big bags / FIBC. Capacidad y medidas: ___. Cantidad: ___. Ciudad de entrega: ___.',
    foto: {
      src: '/images/hero/hero-02.webp',
      alt: 'Carga de big bags (FIBC) en una planta industrial.',
    },
  },
];

export function cunaPorSlug(slug: string): Cuna | undefined {
  return cunas.find((c) => c.slug === slug);
}

/** La cuña a la que pertenece una ficha de producto, si alguna la agrupa. */
export function cunaDeProducto(productSlug: string): Cuna | undefined {
  return cunas.find((c) => c.productSlugs.includes(productSlug));
}

/**
 * Enlaces de las tres cuñas, listos para pintar en pie, hubs de ciudad y
 * cualquier sitio que deba empujar peso interno hacia ellas.
 */
export const ENLACES_CUNAS = cunas.map((c) => ({
  href: `/${c.slug}`,
  label: c.titulo,
}));
