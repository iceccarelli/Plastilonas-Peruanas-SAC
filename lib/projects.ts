/**
 * EVIDENCIA DE PROYECTO — con interruptor por caso.
 *
 * Estas fichas describen suministros reales de la empresa, pero este
 * repositorio no puede comprobar ninguna de ellas. Publicar evidencia sin
 * confirmar es exactamente el fallo que un comprador industrial castiga: basta
 * una ficha inexacta para que un jefe de compras descarte el resto del sitio.
 *
 * Por eso cada ficha lleva `verificado`. En false —el valor por defecto— la
 * ficha NO se renderiza, NO entra al sitemap y NO se enlaza desde ningún sitio.
 * Vive en el repositorio como borrador, no como afirmación pública.
 *
 * PARA PUBLICAR UNA: confirme con el área comercial que el suministro ocurrió y
 * que el texto es exacto, y ponga `verificado: true`. Si el cliente autorizó su
 * nombre, reemplace también `client`. Si no lo autorizó, la fórmula genérica
 * («Contratista minero en el Perú») es legítima y suficiente.
 *
 * test/proyectos.test.ts impide que una ficha llegue al público sin ese paso.
 */
export interface Project {
  slug: string;
  title: string;
  client: string;
  industrySlug: string;
  country: string;
  region: string;
  productSlugs: string[];
  applicationSlug: string;
  challenge: string;
  solution: string;
  result: string;
  yearLabel: string;
  /** Solo true tras confirmación del área comercial. Ver cabecera. */
  verificado: boolean;
}

export const projects: Project[] = [
  {
    slug: "ventilacion-contratista-minero-peru",
    title: "Mangas de ventilación para tramos subterráneos",
    client: "Contratista minero en el Perú (nombre bajo acuerdo)",
    industrySlug: "mineria",
    country: "Perú",
    region: "Sierra peruana",
    productSlugs: ["mangas-ventilacion-minas-tuneles"],
    applicationSlug: "ventilacion-subterranea",
    challenge:
      "Tramos de impulsión con diámetro y largo definidos por la operación, con uniones que debían armarse en sitio.",
    solution:
      "Confección de mangas a medida de tramo y accesorios de unión. Alcance de instalación definido en cotización, no como cobertura nacional automática.",
    result:
      "Suministro a especificación del expediente. Detalle de cantidades y diametros permanece en el archivo del proyecto.",
    yearLabel: "Operación continua — año no publicado",
    verificado: false,
  },
  {
    slug: "malla-fundo-costa",
    title: "Malla de protección de cultivo en costa",
    client: "Fundo agroexportador (nombre bajo acuerdo)",
    industrySlug: "agroexportacion",
    country: "Perú",
    region: "Costa peruana",
    productSlugs: ["mallas-antiafidas", "malla-raschel-sombra"],
    applicationSlug: "proteccion-cultivo",
    challenge:
      "Cubrir cuadros con malla según plaga y radiación, a medida de la estructura existente.",
    solution:
      "Antiáfida y raschel dimensionadas al cuadro. Porcentaje de sombra confirmado en cotización.",
    result: "Paños entregados a medida. Ensayos agronómicos los define el fundo, no este sitio.",
    yearLabel: "Campañas sucesivas — año no publicado",
    verificado: false,
  },
  {
    slug: "toldos-flota-lima",
    title: "Toldos a medida para flota de carga",
    client: "Operador logístico en Lima (nombre bajo acuerdo)",
    industrySlug: "transporte-logistica",
    country: "Perú",
    region: "Lima",
    productSlugs: ["mantas-cobertores-toldos-camiones", "siders-tolderas-camiones"],
    applicationSlug: "toldos-camion",
    challenge:
      "Unidades con cajas de distinta geometría. Un paño estándar dejaba vanos o sobrantes.",
    solution:
      "Levantamiento de L×A×H por tipo de unidad y confección de mantas / siders a medida.",
    result: "Flota cubierta por tipo de caja. Rotulado se cotiza aparte cuando se pide.",
    yearLabel: "Reposición periódica — año no publicado",
    verificado: false,
  },
  {
    slug: "almacen-temporal-infraestructura",
    title: "Almacén textil temporal de obra",
    client: "Contratista de infraestructura (nombre bajo acuerdo)",
    industrySlug: "construccion",
    country: "Perú",
    region: "Perú",
    productSlugs: ["carpas-lona-estructuras-metalicas", "galpones-invernaderos-estructurados"],
    applicationSlug: "campamentos-mineros",
    challenge:
      "Almacén temporal con estructura y paño, con plazo de obra y acceso de camión.",
    solution:
      "Galpón / carpa con estructura metálica. Instalación propia según alcance del sitio.",
    result: "Espacio de acopio operativo durante la obra. No se publica como caso nominado.",
    yearLabel: "Proyecto de obra — año no publicado",
    verificado: false,
  },
  {
    slug: "exportacion-colombia-senal",
    title: "Suministro internacional con señal hacia Colombia",
    client: "Operación de comercio exterior (detalle comercial no publicado)",
    industrySlug: "mineria",
    country: "Colombia",
    region: "Exportación desde Callao / Lima",
    productSlugs: ["lona-plastificada-rafia-polytarp", "big-bags-bolsones-polipropileno"],
    applicationSlug: "granel-embalaje",
    challenge:
      "Un comprador andino necesita producto peruano con documentación de exportación, no una tienda mundial.",
    solution:
      "Evaluación por RFQ: partida, MOQ, Incoterm de partida EXW/FOB Callao, packing list y factura.",
    result:
      "Existe evidencia pública de comercio exterior hacia Colombia. Cada operación posterior se evalúa de nuevo.",
    yearLabel: "Señal pública de comercio — no es una cuenta abierta",
    verificado: false,
  },
];

/** Lo único que puede llegar al público. Úsese siempre esta, nunca `projects`. */
export const projectsPublicados: Project[] = projects.filter((p) => p.verificado);

export function projectBySlug(slug: string): Project | undefined {
  return projectsPublicados.find((p) => p.slug === slug);
}
