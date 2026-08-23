/**
 * Application-first hubs. Buyers search problem + industry, not SKU.
 * Only applications we can actually supply.
 */
export interface Application {
  slug: string;
  name: string;
  nameEn: string;
  industrySlugs: string[];
  productSlugs: string[];
  problem: string;
  approach: string;
  questions: string[];
  notClaimed: string[];
}

export const applications: Application[] = [
  {
    slug: "ventilacion-subterranea",
    name: "Ventilación de mina y túnel",
    nameEn: "Underground mine and tunnel ventilation",
    industrySlugs: ["mineria"],
    productSlugs: ["mangas-ventilacion-minas-tuneles", "accesorios-instalacion"],
    problem:
      "El tramo necesita un ducto flexible a diámetro, largo y régimen de impulsión o extracción. Un catálogo genérico no sirve.",
    approach:
      "Confeccionamos mangas de ventilación a medida de tramo. Uniones, reducciones y accesorios se cotizan con el ducto. El cálculo preliminar de la calculadora no sustituye la memoria de mina.",
    questions: [
      "Diámetro interior y largo de cada tramo",
      "Impulsión o extracción, caudal de diseño si existe",
      "Mineral, humedad, requisito antiestático",
      "Cota / región y fecha de movilización",
      "¿Suministro o también instalación?",
    ],
    notClaimed: [
      "No publicamos caudales certificados ni ensayos que no podamos entregar",
      "No sustituimos al ingeniero de ventilación de la operación",
    ],
  },
  {
    slug: "toldos-camion",
    name: "Toldos y siders para flota",
    nameEn: "Truck tarps and side curtains",
    industrySlugs: ["transporte-logistica"],
    productSlugs: [
      "mantas-cobertores-toldos-camiones",
      "siders-tolderas-camiones",
      "revestimiento-vehicular-toldos-publicitarios",
      "lona-plastificada-rafia-polytarp",
    ],
    problem:
      "La plataforma, el sider y el rotulado son un sistema. Medidas de caja y ciclo de uso definen el paño.",
    approach:
      "Tomamos largo, ancho, altura y tipo de unidad. Confeccionamos manta, sider o toldería a medida. El rotulado de flota es línea complementaria, no un estudio de marca.",
    questions: [
      "Tipo de unidad (plataforma, furgón, semi)",
      "Medidas de caja L×A×H",
      "Material preferido (PVC, rafia, polytarp) si lo hay",
      "Cantidad de unidades y plazo",
    ],
    notClaimed: ["No hay tarifa pública por m² en líneas a medida", "No afirmamos homologación vehicular extranjera"],
  },
  {
    slug: "proteccion-cultivo",
    name: "Protección de cultivo",
    nameEn: "Crop protection mesh",
    industrySlugs: ["agroexportacion"],
    productSlugs: [
      "mallas-antiafidas",
      "malla-raschel-sombra",
      "malla-anti-pajaro-anti-granizo",
      "cobertores-agricolas-multimaterial",
    ],
    problem:
      "El fundo necesita malla que cubra el cuadro: plaga, radiación o granizo, no un rollo anónimo.",
    approach:
      "Antiáfida, raschel, sombra, anti-pájaro y anti-granizo a medida del cuadro. El porcentaje de sombra y el tipo de tejido se confirman en cotización.",
    questions: [
      "Cultivo y región",
      "Área y geometría del cuadro",
      "Plaga o fenómeno a controlar",
      "Porcentaje de sombra si aplica",
      "Mes de instalación",
    ],
    notClaimed: ["No hay certificación de inocuidad alimentaria publicada", "No sustituimos el diseño agronómico del fundo"],
  },
  {
    slug: "impermeabilizacion-pozas",
    name: "Impermeabilización de pozas y canales",
    nameEn: "Pond and canal lining",
    industrySlugs: ["saneamiento-y-agua", "agroexportacion", "mineria"],
    productSlugs: [
      "geomembranas-pvc",
      "geomembrana-polietileno-pe-hdpe",
      "geomembrana-pe-fortificada",
      "geotextiles",
    ],
    problem:
      "La poza pierde agua o el expediente pide un liner. Espesor, polímero y taludes no se improvisan.",
    approach:
      "Cotizamos PVC o PE según el expediente. Área estimada con la calculadora (preliminar). Ficha de lote cuando el material la tiene. Sin certificaciones de agua potable inventadas.",
    questions: [
      "Largo, ancho, profundidad y taludes",
      "Fluido (agua de riego, efluente, relave — describir, no asumir)",
      "Espesor / polímero especificado si existe",
      "Sitio y cronograma",
    ],
    notClaimed: [
      "No afirmamos GRI / NSF / potable-water sin documento",
      "La calculadora no es memoria de movimiento de tierras",
    ],
  },
  {
    slug: "coberturas-obra",
    name: "Coberturas y cerramientos de obra",
    nameEn: "Construction covers and enclosures",
    industrySlugs: ["construccion"],
    productSlugs: [
      "lona-plastificada-rafia-polytarp",
      "toldos-cerramientos",
      "carpas-lona-estructuras-metalicas",
      "biombos-protectores-soldadura",
    ],
    problem:
      "El frente de obra necesita cerrar, cubrir acopio o proteger andamio. El vano y el viento mandan.",
    approach:
      "Lonas, cerramientos y estructuras temporales a medida. Instalación propia en el Perú cuando el alcance lo permite.",
    questions: [
      "Vano L×A×H",
      "Exposición (viento, UV, soldadura)",
      "Suministro o instalación",
      "Ciudad y fecha",
    ],
    notClaimed: ["No hay cálculo estructural de viento publicado", "No afirmamos instalación en toda Sudamérica"],
  },
  {
    slug: "campamentos-mineros",
    name: "Campamentos y almacenes temporales",
    nameEn: "Mining camps and temporary warehouses",
    industrySlugs: ["mineria", "construccion"],
    productSlugs: [
      "modulos-albergues-campamentos",
      "carpas-lona-estructuras-metalicas",
      "galpones-invernaderos-estructurados",
      "coberturas-tensionadas-arquitectura-textil",
    ],
    problem:
      "El campamento o el almacén temporal es un sistema: paño, estructura y anclaje.",
    approach:
      "Módulos, carpas y galpones con estructura metálica. El alcance de instalación se define en cotización según sitio.",
    questions: [
      "Uso (albergue, almacén, comedor, taller)",
      "Dimensiones y ocupación",
      "Sitio, cota y acceso",
      "Duración prevista de la instalación",
    ],
    notClaimed: ["No publicamos capacidad de planta ni plazos estándar de campamento"],
  },
  {
    slug: "granel-embalaje",
    name: "Granel y embalaje industrial",
    nameEn: "Bulk packaging and FIBC",
    industrySlugs: ["mineria", "transporte-logistica", "agroexportacion"],
    productSlugs: [
      "big-bags-bolsones-polipropileno",
      "sacos-polytarp-embarque-granel",
      "bolsas-laminas-pebd-pead",
    ],
    problem:
      "El concentrado, el grano o el cemento necesita un contenedor flexible a peso, descarga y ciclo.",
    approach:
      "Big bags FIBC y sacos polytarp a medida. El configurador arma la especificación; el factor de seguridad y el liner se confirman en cotización.",
    questions: [
      "Producto, densidad aparente y peso por unidad",
      "Boca de carga y de descarga",
      "Liner, recubrimiento, antiestático",
      "Volumen mensual y destino",
    ],
    notClaimed: ["No hay UN / hazardous certification publicada", "No inventamos SKU ni modelo"],
  },
  {
    slug: "contencion-fluidos",
    name: "Contención de fluidos",
    nameEn: "Flexible fluid containment",
    industrySlugs: ["agroexportacion", "saneamiento-y-agua"],
    productSlugs: ["tanques-flexibles-bladders", "biodigestores", "tuberias-hdpe"],
    problem:
      "Reservorio flexible, biodigestor o tubería HDPE se define por proyecto, no por ficha de e-commerce.",
    approach:
      "Suministro especializado. Ficha de lote y alcance se confirman en RFQ. Sin capacidades de planta inventadas.",
    questions: [
      "Volumen y fluido",
      "Sitio y acceso",
      "Norma interna si existe",
      "¿Suministro o instalación?",
    ],
    notClaimed: ["Líneas bajo pedido: no hay stock publicitado ni plazos estándar"],
  },
];

export function applicationBySlug(slug: string): Application | undefined {
  return applications.find((a) => a.slug === slug);
}
