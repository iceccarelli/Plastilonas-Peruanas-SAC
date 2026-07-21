/**
 * Galería ILUSTRATIVA del proceso de fabricación — Plastilonas Peruanas SAC.
 *
 * Imágenes EDUCATIVAS y FOTORREALISTAS de las categorías de maquinaria del
 * sector (Big Bags, geomembranas, carpas, mallas, lonas). NO son fotografías
 * de la planta de Plastilonas; la UI las rotula siempre como "ilustrativa".
 *
 * Solo se usan los DOS lotes fotorrealistas v2 (4 vistas por máquina). Los
 * renders CGI anteriores fueron retirados. El carrusel (estilo AWS) rota las
 * vistas de una misma máquina cada ~3 s con Ken Burns y avanza de máquina en
 * máquina cada ~5 s; el usuario puede deslizar y se pausa al pasar el cursor.
 */

export interface MachineryView {
  webp: string;
  thumb: string;
}

export interface MachineryItem {
  slug: string;
  orden: number;
  titulo: string;
  alt: string;
  caption: string;
  linea: string;
  fuente: string;
  /** 4 vistas fotorrealistas de la misma máquina (rotan con Ken Burns). */
  views: MachineryView[];
}

const BASE = '/images/maquinaria';

export const machinery: MachineryItem[] = [
  {
    slug: '01-extrusion-rafia',
    orden: 1,
    titulo: 'Línea de extrusión de rafia',
    alt: 'Ilustración de una línea de extrusión de cintas de polipropileno (rafia) con extrusora, baño de enfriamiento, horno de estirado y bobinadoras, típica en la fabricación de Big Bags y lonas',
    caption: 'Convierte gránulos de PP en cintas orientadas de alta resistencia: el punto de partida de Big Bags, mallas y lonas de rafia.',
    linea: 'Big Bags / FIBC, mallas, lonas rafia',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (proceso estándar de extrusión de cintas PP para FIBC)',
    views: [
      { webp: `${BASE}/01-extrusion-rafia-c.webp`, thumb: `${BASE}/01-extrusion-rafia-c-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-d.webp`, thumb: `${BASE}/01-extrusion-rafia-d-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-e.webp`, thumb: `${BASE}/01-extrusion-rafia-e-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-f.webp`, thumb: `${BASE}/01-extrusion-rafia-f-thumb.webp` },
    ],
  },
  {
    slug: '02-telar-circular',
    orden: 2,
    titulo: 'Telar circular de tejido',
    alt: 'Ilustración de un telar circular tubular que teje cintas de polipropileno en tela tubular continua para el cuerpo de Big Bags',
    caption: 'Teje las cintas de PP en tela tubular: el corazón de la fabricación de Big Bags / FIBC.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://fpi-bd.com/manufacturing-process/ y https://www.global-pak.com/blog/how-bulk-bags-are-manufactured',
    views: [
      { webp: `${BASE}/02-telar-circular-c.webp`, thumb: `${BASE}/02-telar-circular-c-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-d.webp`, thumb: `${BASE}/02-telar-circular-d-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-e.webp`, thumb: `${BASE}/02-telar-circular-e-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-f.webp`, thumb: `${BASE}/02-telar-circular-f-thumb.webp` },
    ],
  },
  {
    slug: '03-laminado-recubrimiento',
    orden: 3,
    titulo: 'Línea de laminado / extrusión-recubrimiento',
    alt: 'Ilustración de una línea de laminado o extrusión-recubrimiento que aplica film de PP sobre tela tejida para crear barrera de humedad',
    caption: 'Aplica una capa de film polimérico sobre la tela tejida para obtener Big Bags impermeables y lonas plastificadas.',
    linea: 'Big Bags impermeables, lonas plastificadas',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (paso opcional de laminación/coating)',
    views: [
      { webp: `${BASE}/03-laminado-recubrimiento-c.webp`, thumb: `${BASE}/03-laminado-recubrimiento-c-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-d.webp`, thumb: `${BASE}/03-laminado-recubrimiento-d-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-e.webp`, thumb: `${BASE}/03-laminado-recubrimiento-e-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-f.webp`, thumb: `${BASE}/03-laminado-recubrimiento-f-thumb.webp` },
    ],
  },
  {
    slug: '04-impresora-flexografica',
    orden: 4,
    titulo: 'Impresora flexográfica',
    alt: 'Ilustración de una impresora flexográfica industrial de varios colores para marcar y personalizar tela de polipropileno tejido',
    caption: 'Imprime logos, datos de carga y marcas en los paneles de tela tejida de los Big Bags.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://www.qianfeng-machine.com/printing-machines/woven-bag-stack-type-flexographic-printing-machine (flexografía estándar para PP tejido)',
    views: [
      { webp: `${BASE}/04-impresora-flexografica-c.webp`, thumb: `${BASE}/04-impresora-flexografica-c-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-d.webp`, thumb: `${BASE}/04-impresora-flexografica-d-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-e.webp`, thumb: `${BASE}/04-impresora-flexografica-e-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-f.webp`, thumb: `${BASE}/04-impresora-flexografica-f-thumb.webp` },
    ],
  },
  {
    slug: '05-corte-automatico',
    orden: 5,
    titulo: 'Máquina de corte automático de tela técnica',
    alt: 'Ilustración de una máquina de corte automático con mesa y cabezal de precisión para cortar paneles de tela técnica de polipropileno',
    caption: 'Corta con precisión los rollos de tela tejida a las dimensiones requeridas para cada producto.',
    linea: 'Big Bags, mallas, lonas y productos tejidos',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (cutting stage en proceso FIBC)',
    views: [
      { webp: `${BASE}/05-corte-automatico-c.webp`, thumb: `${BASE}/05-corte-automatico-c-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-d.webp`, thumb: `${BASE}/05-corte-automatico-d-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-e.webp`, thumb: `${BASE}/05-corte-automatico-e-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-f.webp`, thumb: `${BASE}/05-corte-automatico-f-thumb.webp` },
    ],
  },
  {
    slug: '06-coser-bigbags',
    orden: 6,
    titulo: 'Máquina de coser industrial para Big Bags',
    alt: 'Ilustración de una máquina de coser industrial pesada para confeccionar Big Bags, unir paneles y fijar asas de elevación',
    caption: 'Une paneles, cose costuras de refuerzo y fija las asas (webbing) que dan la capacidad de carga al FIBC.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://fibcbigbags.com/fibc-making.php (sewing unit)',
    views: [
      { webp: `${BASE}/06-coser-bigbags-c.webp`, thumb: `${BASE}/06-coser-bigbags-c-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-d.webp`, thumb: `${BASE}/06-coser-bigbags-d-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-e.webp`, thumb: `${BASE}/06-coser-bigbags-e-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-f.webp`, thumb: `${BASE}/06-coser-bigbags-f-thumb.webp` },
    ],
  },
  {
    slug: '07-calandra-pvc',
    orden: 7,
    titulo: 'Calandra de PVC',
    alt: 'Ilustración de una calandra industrial de rodillos para producir lámina continua de PVC utilizada en geomembranas y lonas',
    caption: 'Forma la lámina de PVC de espesor controlado que sirve de base a geomembranas, carpas y toldos.',
    linea: 'Geomembranas de PVC, carpas, toldos, lonas',
    fuente: 'https://www.geomembrane.com/post/calendering-is-king y https://haogenplast.com/pvc-manufacturing-process/',
    views: [
      { webp: `${BASE}/07-calandra-pvc-c.webp`, thumb: `${BASE}/07-calandra-pvc-c-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-d.webp`, thumb: `${BASE}/07-calandra-pvc-d-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-e.webp`, thumb: `${BASE}/07-calandra-pvc-e-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-f.webp`, thumb: `${BASE}/07-calandra-pvc-f-thumb.webp` },
    ],
  },
  {
    slug: '08-soldadora-alta-frecuencia',
    orden: 8,
    titulo: 'Soldadora de PVC por alta frecuencia (HF/RF)',
    alt: 'Ilustración de una soldadora de alta frecuencia (RF) con electrodo de barra para unir paneles de lámina o lona PVC de forma hermética en fábrica',
    caption: 'Une paneles de PVC en fábrica mediante radiofrecuencia, creando costuras estancas para geomembranas y carpas.',
    linea: 'Geomembranas, carpas de lona PVC',
    fuente: 'https://skytop.me/products/high-frequency-pvc-welding-machines.html (HF welding para PVC technical textiles)',
    views: [
      { webp: `${BASE}/08-soldadora-alta-frecuencia-c.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-c-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-d.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-d-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-e.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-e-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-f.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-f-thumb.webp` },
    ],
  },
  {
    slug: '09-soldadora-cuna-caliente',
    orden: 9,
    titulo: 'Soldadora de cuña caliente',
    alt: 'Ilustración de una soldadora de cuña caliente autopropulsada para realizar costuras largas de geomembrana de PVC en obra',
    caption: 'Solda solapes largos de geomembrana en campo mediante cuña metálica calentada y rodillos de presión.',
    linea: 'Geomembranas de PVC (instalación en obra)',
    fuente: 'https://waterproofspecialist.com/pvc-geomembrane-welding-hdpe-lldpe/ (hot wedge welding)',
    views: [
      { webp: `${BASE}/09-soldadora-cuna-caliente-c.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-c-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-d.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-d-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-e.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-e-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-f.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-f-thumb.webp` },
    ],
  },
  {
    slug: '10-soldadora-aire-caliente',
    orden: 10,
    titulo: 'Soldadora de aire caliente / extrusión',
    alt: 'Ilustración de una soldadora de aire caliente o de extrusión portátil para detalle, parches y reparaciones de geomembranas de PVC',
    caption: 'Permite uniones de detalle, parches y reparaciones en geomembranas y lonas mediante aire caliente o extrusión de cordón.',
    linea: 'Geomembranas, carpas (detalle y reparación)',
    fuente: 'https://waterproofspecialist.com/pvc-geomembrane-welding-hdpe-lldpe/ (hot air welding)',
    views: [
      { webp: `${BASE}/10-soldadora-aire-caliente-c.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-c-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-d.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-d-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-e.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-e-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-f.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-f-thumb.webp` },
    ],
  },
  {
    slug: '11-curvadora-tubo',
    orden: 11,
    titulo: 'Curvadora / dobladora de tubo',
    alt: 'Ilustración de una máquina curvadora de tubo industrial para formar arcos y estructuras de acero galvanizado destinadas a carpas y hangares',
    caption: 'Dobla tubos de acero galvanizado para crear los arcos y armazones de las carpas y galpones con lona PVC.',
    linea: 'Carpas de lona PVC con estructura metálica galvanizada',
    fuente: 'Equipos estándar de curvatura de tubo para estructuras de invernadero y carpas (proceso típico de fabricación de estructuras ligeras galvanizadas)',
    views: [
      { webp: `${BASE}/11-curvadora-tubo-c.webp`, thumb: `${BASE}/11-curvadora-tubo-c-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-d.webp`, thumb: `${BASE}/11-curvadora-tubo-d-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-e.webp`, thumb: `${BASE}/11-curvadora-tubo-e-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-f.webp`, thumb: `${BASE}/11-curvadora-tubo-f-thumb.webp` },
    ],
  },
  {
    slug: '12-telar-raschel',
    orden: 12,
    titulo: 'Telar Raschel',
    alt: 'Ilustración de un telar Raschel de punto por urdimbre que produce mallas de polipropileno o polietileno para uso agrícola y mangas de ventilación',
    caption: 'Teje mallas de punto por urdimbre (Raschel) para mallas antiáfidas, redes agrícolas y mangas de ventilación.',
    linea: 'Mallas antiáfidas / agrícolas, mangas de ventilación',
    fuente: 'https://www.sciencedirect.com/science/article/abs/pii/S1537511021001124 y máquinas Raschel para redes agrícolas',
    views: [
      { webp: `${BASE}/12-telar-raschel-c.webp`, thumb: `${BASE}/12-telar-raschel-c-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-d.webp`, thumb: `${BASE}/12-telar-raschel-d-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-e.webp`, thumb: `${BASE}/12-telar-raschel-e-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-f.webp`, thumb: `${BASE}/12-telar-raschel-f-thumb.webp` },
    ],
  },
];
