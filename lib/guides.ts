/**
 * Technical guides. HTML first so search and AI can read them.
 * No invented standards. Reviewer is commercial-technical, not a named engineer.
 */
export interface Guide {
  slug: string;
  title: string;
  titleEn: string;
  revised: string;
  reviewer: string;
  summary: string;
  relatedProductSlugs: string[];
  industrySlugs: string[];
  sections: { heading: string; body: string }[];
  questions: string[];
  disclaimer: string;
}

export const guides: Guide[] = [
  {
    slug: "seleccion-mangas-ventilacion",
    title: "Cómo especificar una manga de ventilación minera",
    titleEn: "How to specify a mining ventilation duct",
    revised: "2026-08-01",
    reviewer: "Equipo técnico-comercial Plastilonas",
    summary:
      "Diámetro, largo de tramo, régimen, uniones y lo que no debe faltar en un RFQ de ventilación subterránea.",
    relatedProductSlugs: ["mangas-ventilacion-minas-tuneles"],
    industrySlugs: ["mineria"],
    sections: [
      {
        heading: "Qué decide el ducto",
        body: "El diámetro interior, el largo de cada tramo, si el régimen es impulsión o extracción, y el ambiente (humedad, abrasión, requisito antiestático). Sin esos cuatro datos, cualquier precio es inventado.",
      },
      {
        heading: "Material",
        body: "PVC y PU se cotizan según el expediente. No publicamos una tabla de equivalencia que sustituya al ensayo de la operación. Si hay norma interna de mina, adjúntela al RFQ.",
      },
      {
        heading: "Uniones y accesorios",
        body: "Mangas, codos, reducciones y abrazaderas son un sistema. Pedir solo «manga de 800 mm» sin uniones deja el tramo incompleto.",
      },
      {
        heading: "Cálculo preliminar",
        body: "La calculadora de ventilación estima área de paño y largo. No entrega pérdida de carga certificada ni cumple NFPA u otra norma de mina.",
      },
    ],
    questions: [
      "Diámetro y largo por tramo",
      "Caudal de diseño, si existe",
      "Sitio y fecha",
      "¿Instalación o solo suministro?",
    ],
    disclaimer:
      "Guía de especificación comercial. No es memoria de cálculo ni documento de seguridad de la operación.",
  },
  {
    slug: "gramaje-lona-industrial",
    title: "Guía de gramaje y material de lona industrial",
    titleEn: "Industrial tarpaulin GSM and material guide",
    revised: "2026-08-01",
    reviewer: "Equipo técnico-comercial Plastilonas",
    summary:
      "PVC, rafia y polytarp: cuándo pedir cada uno, qué datos mandan y por qué no hay un «mejor gramaje» universal.",
    relatedProductSlugs: [
      "lona-plastificada-rafia-polytarp",
      "mantas-cobertores-toldos-camiones",
      "cobertores-agricolas-multimaterial",
    ],
    industrySlugs: ["transporte-logistica", "construccion", "agroexportacion", "mineria"],
    sections: [
      {
        heading: "El gramaje no es el producto",
        body: "GSM describe masa por área, no resistencia al viento, al UV ni a la abrasión. Un 650 g/m² mal confeccionado falla antes que un paño más liviano bien ojeteado y reforzado.",
      },
      {
        heading: "Familias de material",
        body: "Lona plastificada PVC: coberturas de obra, camión y minería cuando se pide soldadura o estanqueidad. Rafia: cubiertas agrícolas y de acopio. Polytarp: embarque y estiba. La elección se confirma en cotización.",
      },
      {
        heading: "Qué pedir en el RFQ",
        body: "Uso, L×A (y caída), exposición UV, si hay soldadura o químicos, cantidad y ciudad de entrega. El gramaje puede ser un punto de partida, no un dogma.",
      },
    ],
    questions: ["Uso", "Dimensiones y caída", "Exposición", "Cantidad"],
    disclaimer: "No hay tabla de precios por GSM. La confección a medida se cotiza por proyecto.",
  },
  {
    slug: "especificacion-fibc",
    title: "Cómo especificar un Big Bag / FIBC",
    titleEn: "How to specify an FIBC / bulk bag",
    revised: "2026-08-01",
    reviewer: "Equipo técnico-comercial Plastilonas",
    summary:
      "Capacidad, factor de seguridad, boca, fondo, liner y lo que un comprador industrial debe escribir en el RFQ.",
    relatedProductSlugs: ["big-bags-bolsones-polipropileno"],
    industrySlugs: ["mineria", "agroexportacion", "transporte-logistica"],
    sections: [
      {
        heading: "Capacidad y factor de seguridad",
        body: "1 t y 2 t son presentaciones habituales. El factor 5:1 o 6:1 se confirma en cotización; no se imprime un certificado que no exista.",
      },
      {
        heading: "Boca y fondo",
        body: "Abierta, con boquilla o con falda arriba; plano, con boquilla o con falda abajo. La descarga define el fondo tanto como el producto.",
      },
      {
        heading: "Liner y antiestático",
        body: "Liner de PE, recubrimiento y opción antiestática se piden, no se asumen. Si el producto es combustible o fino, dígalo.",
      },
      {
        heading: "Configurador",
        body: "El configurador de esta web arma un resumen de RFQ. No genera un plano de fabricación ni un precio.",
      },
    ],
    questions: ["Producto y peso", "Dimensiones", "Boca / fondo", "Volumen mensual", "Destino"],
    disclaimer: "Sin certificación UN de mercancías peligrosas publicada. Cada lote se documenta en cotización.",
  },
  {
    slug: "seleccion-geomembrana",
    title: "Cómo seleccionar geomembrana para poza o canal",
    titleEn: "Geomembrane selection for ponds and canals",
    revised: "2026-08-01",
    reviewer: "Equipo técnico-comercial Plastilonas",
    summary:
      "PVC frente a PE, qué datos de talud y fluido pedir, y por qué no afirmamos agua potable ni GRI sin ficha.",
    relatedProductSlugs: [
      "geomembranas-pvc",
      "geomembrana-polietileno-pe-hdpe",
      "geomembrana-pe-fortificada",
      "geotextiles",
    ],
    industrySlugs: ["saneamiento-y-agua", "agroexportacion", "mineria"],
    sections: [
      {
        heading: "Polímero",
        body: "PVC y PE cubren expedientes distintos. Si el proyecto ya especifica espesor y norma, adjúntela. Si no, describa fluido, taludes y clima.",
      },
      {
        heading: "Área",
        body: "Área de membrana ≈ área de fondo + taludes + anclaje + traslape. La calculadora estima; el corte real lo define el replanteo.",
      },
      {
        heading: "Lo que no publicamos",
        body: "No hay ficha NSF, GRI o potable-water en este sitio. Si un lote trae ensayo, se entrega en la cotización de ese lote.",
      },
    ],
    questions: ["L×A×H y taludes", "Fluido", "Espesor pedido", "Sitio"],
    disclaimer: "Estimación preliminar. Instalación internacional no está afirmada.",
  },
  {
    slug: "seleccion-malla-agricola",
    title: "Cómo elegir malla agrícola",
    titleEn: "Agricultural mesh selection guide",
    revised: "2026-08-01",
    reviewer: "Equipo técnico-comercial Plastilonas",
    summary:
      "Antiáfida, raschel, sombra, anti-pájaro y anti-granizo: qué problema cubre cada una y qué medir en el fundo.",
    relatedProductSlugs: [
      "mallas-antiafidas",
      "malla-raschel-sombra",
      "malla-anti-pajaro-anti-granizo",
    ],
    industrySlugs: ["agroexportacion"],
    sections: [
      {
        heading: "El problema define la malla",
        body: "Insecto, radiación, pájaro o granizo. Pedir «malla agrícola» sin el fenómeno produce una cotización incompleta.",
      },
      {
        heading: "Sombra",
        body: "El porcentaje de sombra se pide. No hay un valor universal para uva, arándano o hortaliza.",
      },
      {
        heading: "Medida",
        body: "Cuadro L×A, altura de estructura y tipo de anclaje. Confección a medida del paño.",
      },
    ],
    questions: ["Cultivo", "Fenómeno", "Área", "Región y mes"],
    disclaimer: "No sustituye el diseño agronómico ni afirma registro sanitario de cultivo.",
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
