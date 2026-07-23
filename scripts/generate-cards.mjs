#!/usr/bin/env node
/**
 * Generate branded non-photographic spec/diagram cards for Plastilonas Peruanas SAC
 * gallery fill. Strict integrity: NO photorealistic product imagery.
 * Output: 1200x900 sRGB JPEG (mozjpeg q80), EXIF stripped, progressive.
 * ≥12% safe margin for Ken Burns overscan.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/images');
mkdirSync(OUT_DIR, { recursive: true });

const W = 1200;
const H = 900;
const SAFE = 0.12; // 12% margin
const CONTENT_W = Math.round(W * (1 - 2 * SAFE));
const CONTENT_H = Math.round(H * (1 - 2 * SAFE));
const OX = Math.round(W * SAFE);
const OY = Math.round(H * SAFE);

// Brand tokens
const NAVY = '#0A2540';
const EMERALD = '#059669';
const EMERALD_LIGHT = '#10B981';
const WHITE = '#FFFFFF';
const MUTED = '#94A3B8';
const CARD_BG = '#0F2D4A';

/**
 * Product data extracted from products.ts (only real fields).
 * Only include what is verified; cards draw exclusively from this.
 */
const PRODUCTS = [
  {
    slug: 'big-bags-bolsones-polipropileno',
    name: 'Big Bags / Bolsones de Polipropileno',
    primary: 'big-bags.jpg',
    existing: ['/images/big-bags.jpg', '/images/big-bags-2.jpg'],
    sector: ['Minería', 'Industrial', 'Agricultura', 'Construcción'],
    specs: [
      ['Material', 'PP tejido 100% virgen + UV'],
      ['Capacidad', '1T / 2T'],
      ['Dim. 1T', '90×90×90 / 95×95×110 cm'],
      ['Factor seguridad', '5:1 o 6:1'],
      ['Opciones boca', 'Abierta, boquilla, falda'],
      ['Opciones fondo', 'Plano, boquilla, falda'],
    ],
    apps: [
      'Minerales y concentrados',
      'Granos y fertilizantes',
      'Cemento y áridos',
      'Productos químicos',
      'Residuos y reciclaje',
    ],
  },
  {
    slug: 'biombos-protectores-soldadura',
    name: 'Biombos Protectores para Soldadura',
    primary: 'biombos.jpg',
    existing: ['/images/biombos.jpg', '/images/biombos-proteccion.jpg'],
    sector: ['Industrial', 'Construcción', 'Minería'],
    specs: [
      ['Material', 'Lona PVC o cortina transparente'],
      ['Estructura', 'Marco metálico plegable'],
      ['Altura', '2.0 – 2.5 m'],
      ['Ancho panel', '1.0 – 1.5 m'],
      ['Protección', 'Radiación UV, chispas, proyección'],
    ],
    apps: [
      'Talleres de soldadura',
      'Zonas de esmerilado',
      'Separación de áreas de trabajo',
      'Protección de operadores',
    ],
  },
  {
    slug: 'carpas-lona-estructuras-metalicas',
    name: 'Carpas de Lona con Estructuras Metálicas',
    primary: 'carpas.jpg',
    existing: ['/images/carpas.jpg', '/images/carpas-2.jpg', '/images/techos-escolares.jpg'],
    sector: ['Construcción', 'Agricultura', 'Industrial', 'Minería'],
    specs: [
      ['Lona', 'PVC 650–900 g/m² anti-UV'],
      ['Estructura', 'Acero galvanizado'],
      ['Vano', '6 m – 30 m'],
      ['Altura', '3 m – 12 m'],
      ['Viento', 'Diseño hasta 120 km/h'],
    ],
    apps: [
      'Hangares y almacenes',
      'Techos deportivos y escolares',
      'Campamentos y albergues',
      'Eventos y ferias',
    ],
  },
  {
    slug: 'geomembranas-pvc',
    name: 'Geomembranas de PVC',
    primary: 'geomembranas.jpg',
    existing: ['/images/geomembranas.jpg'],
    sector: ['Minería', 'Construcción', 'Agricultura', 'Medio Ambiente'],
    specs: [
      ['Material', 'PVC plastificado'],
      ['Espesor', '0.5 – 2.0 mm'],
      ['Ancho', 'Hasta 2.0 m'],
      ['Unión', 'Soldadura térmica / HF'],
      ['Uso', 'Impermeabilización'],
    ],
    apps: [
      'Lagunas de relaves',
      'Canales y reservorios',
      'Cubiertas de rellenos',
      'Contención de efluentes',
    ],
  },
  {
    slug: 'mangas-ventilacion-minas-tuneles',
    name: 'Mangas de Ventilación para Minas y Túneles',
    primary: 'mangas-ventilacion.jpg',
    existing: ['/images/mangas-ventilacion.jpg', '/images/mangas-ventilacion-y.jpg', '/images/mangas-produccion.jpg'],
    sector: ['Minería', 'Construcción', 'Túneles'],
    specs: [
      ['Material', 'Lona PVC / PE reforzado'],
      ['Diámetro', '300 – 1500 mm'],
      ['Presión', 'Positiva / negativa'],
      ['Tratamiento', 'Antiestático, anti-UV'],
      ['Conexión', 'Acoples rápidos / bridas'],
    ],
    apps: [
      'Ventilación primaria y secundaria',
      'Túneles y galerías',
      'Obra civil subterránea',
      'Extracción de gases',
    ],
  },
  {
    slug: 'mallas-antiafidas',
    name: 'Mallas Antiafidas',
    primary: 'mallas-antiafidas.jpg',
    existing: ['/images/mallas-antiafidas.jpg'],
    sector: ['Agricultura'],
    specs: [
      ['Material', 'Polietileno de alta densidad'],
      ['Malla', '50 – 60 mesh'],
      ['Ancho', 'Hasta 4.0 m'],
      ['Tratamiento', 'Anti-UV estabilizado'],
      ['Color', 'Transparente / blanco'],
    ],
    apps: [
      'Invernaderos y túneles',
      'Protección de cultivos',
      'Control de plagas',
      'Casas malla',
    ],
  },
  {
    slug: 'mantas-cobertores-toldos-camiones',
    name: 'Mantas Cobertores y Toldos para Camiones',
    primary: 'mantas-camiones.jpg',
    existing: ['/images/mantas-camiones.jpg'],
    sector: ['Transporte', 'Logística', 'Minería', 'Agricultura'],
    specs: [
      ['Material', 'Lona algodón/poliéster + PVC'],
      ['Peso', '450 – 850 g/m²'],
      ['Medidas', '6×3 a 10×5 m (a medida)'],
      ['Ojales', 'Latón cada 50 cm'],
      ['Tratamiento', 'Impermeable + anti-UV'],
    ],
    apps: [
      'Cobertura de carga en camiones',
      'Protección en tránsito',
      'Flotas mineras y agrícolas',
      'Toldos de plataforma',
    ],
  },
  {
    slug: 'mantas-arpilleras-granjas',
    name: 'Mantas Arpilleras para Granjas',
    primary: 'mantas-arpilleras.jpg',
    existing: ['/images/mantas-arpilleras.jpg'],
    sector: ['Agricultura'],
    specs: [
      ['Material', 'Yute natural o PP tejido'],
      ['Peso', '150 – 400 g/m²'],
      ['Ancho', '1.0 – 2.0 m'],
      ['Longitud', '50 / 100 m o a medida'],
      ['Uso', 'Cama de aves, cortinas'],
    ],
    apps: [
      'Cama de pollitos',
      'Galpones avícolas',
      'Cortinas laterales',
      'Protección de nidos',
    ],
  },
  {
    slug: 'mantas-aislantes-termicas-termoacusticas',
    name: 'Mantas Aislantes Térmicas y Termoacústicas',
    primary: 'mantas-aislantes.jpg',
    existing: ['/images/mantas-aislantes.jpg'],
    sector: ['Construcción', 'Industrial', 'Minería'],
    specs: [
      ['Materiales', 'Fibra vidrio / lana roca / PE'],
      ['Espesor', '25 – 100 mm'],
      ['Conductividad', '0.030 – 0.045 W/m·K'],
      ['Acústica', 'Hasta 45 dB'],
      ['Acabado', 'Foil aluminio / PVC'],
    ],
    apps: [
      'Techos y paredes industriales',
      'Contenedores y módulos',
      'Cámaras frigoríficas',
      'Salas de máquinas',
    ],
  },
  {
    slug: 'mulch-madera-picada',
    name: 'Mulch de Madera Picada',
    primary: 'mulch.jpg',
    existing: ['/images/mulch.jpg'],
    sector: ['Agricultura', 'Paisajismo', 'Reforestación'],
    specs: [
      ['Material', 'Madera forestal seleccionada'],
      ['Granulometría', 'Fino / medio / grueso'],
      ['Presentación', 'Sacos 50 L, big bags, granel'],
      ['Uso', 'Cobertura de suelos'],
    ],
    apps: [
      'Control de malezas',
      'Retención de humedad',
      'Regulación de temperatura',
      'Paisajismo y reforestación',
    ],
  },
  {
    slug: 'lona-plastificada-rafia-polytarp',
    name: 'Lona Plastificada, Rafia y Polytarp a Medida',
    primary: 'lona-a-medida.jpg',
    existing: ['/images/lona-a-medida.jpg', '/images/ojalillo-rafia.jpg'],
    sector: ['Industrial', 'Construcción', 'Transporte', 'Agricultura', 'Minería'],
    specs: [
      ['Materiales', 'PVC, Rafia PP, Polytarp PE'],
      ['Gramaje', '200 – 900 g/m²'],
      ['Anchos', 'Hasta 4.0 m'],
      ['Acabados', 'Soldadura HF, ojales, velcro'],
      ['Tratamientos', 'Anti-UV, ignífugo, antiestático'],
    ],
    apps: [
      'Fundas de maquinaria',
      'Toldos y carpas',
      'Cortinas industriales',
      'Cubiertas de piscinas',
    ],
  },
  {
    slug: 'sacos-polytarp-embarque-granel',
    name: 'Sacos Polytarp para Embarque a Granel',
    primary: 'sacos-polytarp.jpg',
    existing: ['/images/sacos-polytarp.jpg'],
    sector: ['Transporte', 'Minería', 'Agricultura', 'Logística'],
    specs: [
      ['Material', 'Polytarp PE laminado + UV'],
      ['Gramaje', '120 – 200 g/m²'],
      ['Medidas', 'Estándar y a medida'],
      ['Confección', 'Costura reforzada + esquinas'],
    ],
    apps: [
      'Embarque a granel',
      'Protección de mercadería',
      'Cobertura de pallets',
      'Operaciones portuarias',
    ],
  },
  {
    slug: 'bolsas-laminas-pebd-pead',
    name: 'Bolsas y Láminas PEBD / PEAD',
    primary: 'bolsas-laminas.jpg',
    existing: ['/images/bolsas-laminas.jpg'],
    sector: ['Industrial', 'Agricultura', 'Logística', 'Construcción'],
    specs: [
      ['Material', 'PEBD / PEAD 100% virgen'],
      ['Calibre', '1 – 8 mil'],
      ['Presentación', 'Bolsas, láminas, rollos'],
      ['Colores', 'Transparente / a solicitud'],
    ],
    apps: [
      'Embalaje industrial',
      'Recubrimiento de superficies',
      'Forrado de contenedores',
      'Uso agrícola',
    ],
  },
  {
    slug: 'films-termocontraibles-shrink',
    name: 'Films Termocontraíbles (Shrink)',
    primary: 'films-shrink.jpg',
    existing: ['/images/films-shrink.jpg'],
    sector: ['Industrial', 'Logística', 'Transporte'],
    specs: [
      ['Material', 'PE termocontraíble'],
      ['Formato', 'Rollo / semitubo / manga'],
      ['Activación', 'Calor (túnel o pistola)'],
      ['Anchos', 'Estándar y a medida'],
    ],
    apps: [
      'Unitización de pallets',
      'Protección contra polvo',
      'Agrupación de productos',
      'Estabilización de carga',
    ],
  },
  {
    slug: 'siders-tolderas-camiones',
    name: 'Siders y Tolderas para Camiones',
    primary: 'siders-tolderas.jpg',
    existing: ['/images/siders-tolderas.jpg'],
    sector: ['Transporte', 'Logística', 'Industrial'],
    specs: [
      ['Material', 'Lona PVC 650–900 g/m²'],
      ['Sistema', 'Sider corredizo / toldera'],
      ['Herrajes', 'Correas, tensores, hebillas'],
      ['Unión', 'Soldadura HF + costura'],
    ],
    apps: [
      'Cortinas laterales de remolques',
      'Tolderas de plataformas',
      'Renovación de flotas',
      'Rotulado de flota',
    ],
  },
  {
    slug: 'cobertores-agricolas-multimaterial',
    name: 'Cobertores Agrícolas Multimaterial',
    primary: 'cobertores-multimaterial.jpg',
    existing: ['/images/cobertores-multimaterial.jpg'],
    sector: ['Agricultura', 'Industrial', 'Logística'],
    specs: [
      ['Materiales', 'Polytarp, PE, Raschel, Térmico, PP'],
      ['Acabados', 'Ojales, refuerzos, amarres'],
      ['Tratamiento', 'Anti-UV; impermeable o transpirable'],
      ['Medidas', 'Estándar y a medida'],
    ],
    apps: [
      'Protección de cultivos',
      'Cobertura de insumos',
      'Control de sombra y helada',
      'Uso industrial general',
    ],
  },
  {
    slug: 'coberturas-tensionadas-arquitectura-textil',
    name: 'Coberturas Tensionadas / Arquitectura Textil',
    primary: 'tensoestructuras.jpg',
    existing: ['/images/tensoestructuras.jpg', '/images/toldos-cerramientos.jpg'],
    sector: ['Construcción', 'Comercio', 'Infraestructura'],
    specs: [
      ['Membrana', 'PVC/poliéster alta tenacidad'],
      ['Tratamiento', 'Anti-UV, autolimpiante opcional'],
      ['Estructura', 'Cables / mástiles / arcos'],
      ['Diseño', 'Form-finding y análisis estructural'],
    ],
    apps: [
      'Cubiertas de plazas y estacionamientos',
      'Fachadas y toldos comerciales',
      'Espacios públicos',
      'Arquitectura temporal',
    ],
  },
  {
    slug: 'coberturas-inflables',
    name: 'Coberturas Inflables',
    primary: 'inflables.jpg',
    existing: ['/images/inflables.jpg'],
    sector: ['Construcción', 'Eventos', 'Deportes'],
    specs: [
      ['Material', 'PVC o PE de alta resistencia'],
      ['Sistema', 'Presión positiva continua'],
      ['Anclaje', 'Perimetral + lastre'],
      ['Opciones', 'Iluminación, accesos, climatización'],
    ],
    apps: [
      'Cubiertas temporales de canchas',
      'Almacenes de emergencia',
      'Eventos y ferias',
      'Espacios deportivos',
    ],
  },
  {
    slug: 'modulos-albergues-campamentos',
    name: 'Módulos, Albergues y Campamentos',
    primary: 'modulos-campamentos.jpg',
    existing: ['/images/modulos-campamentos.jpg'],
    sector: ['Minería', 'Construcción', 'Emergencia'],
    specs: [
      ['Estructura', 'Metálica o mixta'],
      ['Cubierta', 'Lona PVC o panel'],
      ['Capacidad', 'Según diseño (individual / colectivo)'],
      ['Opciones', 'Aislamiento, sanitarios, electricidad'],
    ],
    apps: [
      'Campamentos mineros',
      'Albergues de obra',
      'Respuesta a emergencias',
      'Vivienda temporal',
    ],
  },
  {
    slug: 'galpones-invernaderos-estructurados',
    name: 'Galpones e Invernaderos Estructurados',
    primary: 'invernaderos.jpg',
    existing: ['/images/invernaderos.jpg'],
    sector: ['Agricultura', 'Industrial'],
    specs: [
      ['Estructura', 'Acero galvanizado / aluminio'],
      ['Cubierta', 'Polietileno / policarbonato / malla'],
      ['Ancho', 'Según cultivo o uso'],
      ['Ventilación', 'Lateral y cenital'],
    ],
    apps: [
      'Producción agrícola protegida',
      'Almacenes agrícolas',
      'Viveros',
      'Galpones de crianza',
    ],
  },
  {
    slug: 'toldos-cerramientos',
    name: 'Toldos y Cerramientos',
    primary: 'toldos-cerramientos.jpg',
    existing: ['/images/toldos-cerramientos.jpg'],
    sector: ['Construcción', 'Comercio', 'Residencial'],
    specs: [
      ['Material', 'Lona PVC / acrílico / poliéster'],
      ['Sistema', 'Fijo, enrollable o corredizo'],
      ['Herrajes', 'Aluminio o acero inox'],
      ['Personalización', 'Color, impresión, medidas'],
    ],
    apps: [
      'Terrazas y patios',
      'Locales comerciales',
      'Cerramientos de balcones',
      'Protección solar',
    ],
  },
  {
    slug: 'malla-raschel-sombra',
    name: 'Malla Raschel de Sombra',
    primary: 'malla-raschel.jpg',
    existing: ['/images/malla-raschel.jpg'],
    sector: ['Agricultura', 'Construcción', 'Paisajismo'],
    specs: [
      ['Material', 'Polietileno HDPE'],
      ['Sombra', '30% – 90%'],
      ['Ancho', 'Hasta 8 m'],
      ['Tratamiento', 'Anti-UV estabilizado'],
    ],
    apps: [
      'Sombreado de cultivos',
      'Estacionamientos',
      'Áreas de descanso',
      'Viveros y almácigos',
    ],
  },
  {
    slug: 'malla-anti-pajaro-anti-granizo',
    name: 'Malla Anti-Pájaro y Anti-Granizo',
    primary: 'malla-anti-pajaro.jpg',
    existing: ['/images/malla-anti-pajaro.jpg'],
    sector: ['Agricultura'],
    specs: [
      ['Material', 'Polietileno de alta densidad'],
      ['Malla', 'Según amenaza (pájaro / granizo)'],
      ['Ancho', 'Hasta 4–6 m'],
      ['Tratamiento', 'Anti-UV'],
    ],
    apps: [
      'Huertos y viñedos',
      'Protección de frutales',
      'Control de aves',
      'Prevención de daño por granizo',
    ],
  },
  {
    slug: 'geomembrana-polietileno-pe-hdpe',
    name: 'Geomembrana de Polietileno PE / HDPE',
    primary: 'geomembrana-hdpe.jpg',
    existing: ['/images/geomembrana-hdpe.jpg'],
    sector: ['Minería', 'Construcción', 'Medio Ambiente'],
    specs: [
      ['Material', 'HDPE / LLDPE'],
      ['Espesor', '0.5 – 2.5 mm'],
      ['Ancho', 'Hasta 7–8 m (según fabricante)'],
      ['Unión', 'Extrusión / cuña caliente'],
    ],
    apps: [
      'Relaves mineros',
      'Rellenos sanitarios',
      'Lagunas de oxidación',
      'Canales de riego',
    ],
  },
  {
    slug: 'geomembrana-pe-fortificada',
    name: 'Geomembrana PE Fortificada',
    primary: 'geomembrana-fortificada.jpg',
    existing: ['/images/geomembrana-fortificada.jpg'],
    sector: ['Minería', 'Construcción', 'Medio Ambiente'],
    specs: [
      ['Material', 'PE reforzado / compuesto'],
      ['Espesor', 'Según especificación'],
      ['Resistencia', 'Mayor a punzonamiento'],
      ['Uso', 'Sitios de alta exigencia'],
    ],
    apps: [
      'Áreas de alto tráfico',
      'Relaves con sólidos',
      'Obras de contención',
      'Proyectos de infraestructura',
    ],
  },
  {
    slug: 'geomembrana-bituminosa',
    name: 'Geomembrana Bituminosa',
    primary: 'geomembrana-bituminosa.jpg',
    existing: ['/images/geomembrana-bituminosa.jpg'],
    sector: ['Construcción', 'Infraestructura'],
    specs: [
      ['Material', 'Asfáltico / bituminoso modificado'],
      ['Espesor', 'Según norma'],
      ['Aplicación', 'Impermeabilización de obras'],
      ['Adhesión', 'Al sustrato de concreto'],
    ],
    apps: [
      'Cubiertas de concreto',
      'Túneles y puentes',
      'Sótanos y estacionamientos',
      'Obras hidráulicas',
    ],
  },
  {
    slug: 'geotextiles',
    name: 'Geotextiles',
    primary: 'geotextiles.jpg',
    existing: ['/images/geotextiles.jpg'],
    sector: ['Construcción', 'Minería', 'Infraestructura'],
    specs: [
      ['Tipo', 'No tejido / tejido'],
      ['Material', 'PP o PET'],
      ['Gramaje', '100 – 600 g/m²'],
      ['Funciones', 'Separación, filtración, refuerzo'],
    ],
    apps: [
      'Caminos y plataformas',
      'Drenajes',
      'Refuerzo de suelos',
      'Protección de geomembranas',
    ],
  },
  {
    slug: 'geomallas-geogrids',
    name: 'Geomallas / Geogrids',
    primary: 'geomallas.jpg',
    existing: ['/images/geomallas.jpg'],
    sector: ['Construcción', 'Minería', 'Infraestructura'],
    specs: [
      ['Material', 'PP / PET / HDPE'],
      ['Tipo', 'Uniaxial / biaxial'],
      ['Resistencia', 'Según diseño'],
      ['Uso', 'Refuerzo de suelos y taludes'],
    ],
    apps: [
      'Muros de contención',
      'Taludes reforzados',
      'Bases de caminos',
      'Estabilización de suelos',
    ],
  },
  {
    slug: 'tanques-flexibles-bladders',
    name: 'Tanques Flexibles / Bladders',
    primary: 'tanques-flexibles.jpg',
    existing: ['/images/tanques-flexibles.jpg'],
    sector: ['Minería', 'Agricultura', 'Industrial', 'Emergencia'],
    specs: [
      ['Material', 'PVC o TPU reforzado'],
      ['Capacidad', 'Desde 1 m³ hasta cientos'],
      ['Forma', 'Pillow / cilindro / a medida'],
      ['Accesorios', 'Válvulas, mangueras, anclajes'],
    ],
    apps: [
      'Almacenamiento de agua',
      'Combustible y químicos',
      'Campamentos remotos',
      'Respuesta a emergencias',
    ],
  },
  {
    slug: 'biodigestores',
    name: 'Biodigestores',
    primary: 'biodigestores.jpg',
    existing: ['/images/biodigestores.jpg'],
    sector: ['Agricultura', 'Saneamiento', 'Energía'],
    specs: [
      ['Material', 'Geomembrana / PE'],
      ['Capacidad', 'Según carga orgánica'],
      ['Tipo', 'Tubular / laguna'],
      ['Producto', 'Biogás + efluente'],
    ],
    apps: [
      'Tratamiento de estiércol',
      'Generación de biogás',
      'Saneamiento rural',
      'Granjas y agroindustria',
    ],
  },
  {
    slug: 'tuberias-hdpe',
    name: 'Tuberías HDPE',
    primary: 'tuberias-hdpe.jpg',
    existing: ['/images/tuberias-hdpe.jpg'],
    sector: ['Minería', 'Construcción', 'Agricultura', 'Saneamiento'],
    specs: [
      ['Material', 'HDPE PE100 / PE80'],
      ['Diámetros', 'Según norma (SDR)'],
      ['Unión', 'Termofusión / electrofusión'],
      ['Presión', 'Según clase'],
    ],
    apps: [
      'Conducción de agua',
      'Minería (relaves, proceso)',
      'Riego y drenaje',
      'Redes de alcantarillado',
    ],
  },
  {
    slug: 'accesorios-instalacion',
    name: 'Accesorios de Instalación',
    primary: 'accesorios.jpg',
    existing: ['/images/accesorios.jpg', '/images/ojalillo-rafia.jpg'],
    sector: ['Industrial', 'Construcción', 'Transporte'],
    specs: [
      ['Tipos', 'Ojales, tensores, herrajes'],
      ['Material', 'Latón, acero, aluminio, plástico'],
      ['Uso', 'Lonas, carpas, geomembranas'],
      ['Disponibilidad', 'Stock y a medida'],
    ],
    apps: [
      'Confección de lonas',
      'Montaje de estructuras',
      'Reparaciones en obra',
      'Sistemas de tensión',
    ],
  },
  {
    slug: 'gigantografias-senaletica',
    name: 'Gigantografías y Señalética',
    primary: 'gigantografias.jpg',
    existing: ['/images/gigantografias.jpg'],
    sector: ['Comercio', 'Industrial', 'Eventos'],
    specs: [
      ['Soportes', 'Lona, vinilo, mesh, backlit'],
      ['Impresión', 'Solvente / UV / látex'],
      ['Acabados', 'Ojales, bastidores, adhesivo'],
      ['Medidas', 'A medida'],
    ],
    apps: [
      'Publicidad exterior',
      'Señalética industrial',
      'Eventos y stands',
      'Branding de flota',
    ],
  },
  {
    slug: 'revestimiento-vehicular-toldos-publicitarios',
    name: 'Revestimiento Vehicular y Toldos Publicitarios',
    primary: 'revestimiento-vehicular.jpg',
    existing: ['/images/revestimiento-vehicular.jpg'],
    sector: ['Transporte', 'Comercio', 'Publicidad'],
    specs: [
      ['Material', 'Vinilo cast / calandrado'],
      ['Aplicación', 'Vehículos, toldos, paneles'],
      ['Durabilidad', '3–7 años exterior'],
      ['Acabado', 'Laminado protector'],
    ],
    apps: [
      'Rotulado de flotas',
      'Toldos publicitarios',
      'Publicidad móvil',
      'Identidad visual de empresa',
    ],
  },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeSpecsCard(p) {
  const rows = (p.specs || []).slice(0, 6).map(
    ([k, v], i) => `
    <text x="${OX + 40}" y="${OY + 220 + i * 52}" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" fill="${MUTED}">${escapeXml(k)}</text>
    <text x="${OX + 320}" y="${OY + 220 + i * 52}" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" fill="${WHITE}" font-weight="600">${escapeXml(v)}</text>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <!-- subtle grid -->
  <g stroke="${CARD_BG}" stroke-width="1" opacity="0.5">
    ${Array.from({length: 12}, (_,i) => `<line x1="${i*100}" y1="0" x2="${i*100}" y2="${H}"/>`).join('')}
    ${Array.from({length: 9}, (_,i) => `<line x1="0" y1="${i*100}" x2="${W}" y2="${i*100}"/>`).join('')}
  </g>
  <!-- accent bar -->
  <rect x="${OX}" y="${OY}" width="8" height="${CONTENT_H}" fill="${EMERALD}"/>
  <!-- header -->
  <text x="${OX + 40}" y="${OY + 48}" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="${EMERALD}" letter-spacing="3">ESPECIFICACIONES TÉCNICAS</text>
  <text x="${OX + 40}" y="${OY + 100}" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" fill="${WHITE}" font-weight="700">${escapeXml(p.name.length > 42 ? p.name.slice(0,40)+'…' : p.name)}</text>
  <line x1="${OX + 40}" y1="${OY + 130}" x2="${OX + CONTENT_W - 40}" y2="${OY + 130}" stroke="${EMERALD}" stroke-width="2" opacity="0.6"/>
  ${rows}
  <!-- footer -->
  <text x="${OX + 40}" y="${H - OY - 30}" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="${MUTED}">Plastilonas Peruanas SAC · Datos verificados del catálogo</text>
  <text x="${W - OX - 40}" y="${H - OY - 30}" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="${EMERALD}" text-anchor="end">Ficha técnica completa en cotización</text>
</svg>`;
}

function makeAppsCard(p) {
  const items = (p.apps || p.sector || []).slice(0, 6);
  const bullets = items.map(
    (a, i) => `
    <circle cx="${OX + 55}" cy="${OY + 210 + i * 58}" r="6" fill="${EMERALD}"/>
    <text x="${OX + 80}" y="${OY + 218 + i * 58}" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" fill="${WHITE}">${escapeXml(a)}</text>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <g stroke="${CARD_BG}" stroke-width="1" opacity="0.4">
    ${Array.from({length: 12}, (_,i) => `<line x1="${i*100}" y1="0" x2="${i*100}" y2="${H}"/>`).join('')}
  </g>
  <rect x="${OX}" y="${OY}" width="8" height="${CONTENT_H}" fill="${EMERALD}"/>
  <text x="${OX + 40}" y="${OY + 48}" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="${EMERALD}" letter-spacing="3">APLICACIONES / SECTORES</text>
  <text x="${OX + 40}" y="${OY + 100}" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" fill="${WHITE}" font-weight="700">${escapeXml(p.name.length > 42 ? p.name.slice(0,40)+'…' : p.name)}</text>
  <line x1="${OX + 40}" y1="${OY + 130}" x2="${OX + CONTENT_W - 40}" y2="${OY + 130}" stroke="${EMERALD}" stroke-width="2" opacity="0.6"/>
  ${bullets}
  <text x="${OX + 40}" y="${H - OY - 30}" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="${MUTED}">Plastilonas Peruanas SAC · Fabricación e instalación propias</text>
</svg>`;
}

function makeFormatsCard(p) {
  const sectors = (p.sector || []).join('  ·  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <!-- schematic frame -->
  <rect x="${OX + 20}" y="${OY + 20}" width="${CONTENT_W - 40}" height="${CONTENT_H - 40}" fill="none" stroke="${EMERALD}" stroke-width="2" stroke-dasharray="8 6" opacity="0.5" rx="8"/>
  <rect x="${OX}" y="${OY}" width="8" height="${CONTENT_H}" fill="${EMERALD}"/>
  <text x="${OX + 40}" y="${OY + 48}" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="${EMERALD}" letter-spacing="3">FORMATOS · OPCIONES · SUMINISTRO</text>
  <text x="${OX + 40}" y="${OY + 110}" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="${WHITE}" font-weight="700">${escapeXml(p.name.length > 40 ? p.name.slice(0,38)+'…' : p.name)}</text>
  <line x1="${OX + 40}" y1="${OY + 140}" x2="${OX + CONTENT_W - 40}" y2="${OY + 140}" stroke="${EMERALD}" stroke-width="2" opacity="0.6"/>
  
  <text x="${OX + 40}" y="${OY + 200}" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" fill="${MUTED}">SECTORES DE APLICACIÓN</text>
  <text x="${OX + 40}" y="${OY + 245}" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" fill="${WHITE}">${escapeXml(sectors)}</text>
  
  <text x="${OX + 40}" y="${OY + 330}" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" fill="${MUTED}">SUMINISTRO</text>
  <text x="${OX + 40}" y="${OY + 375}" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" fill="${WHITE}">Fabricación a medida · Importación directa · Bajo pedido</text>
  <text x="${OX + 40}" y="${OY + 420}" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" fill="${EMERALD_LIGHT}">Ficha técnica y certificado de lote en cotización</text>
  
  <text x="${OX + 40}" y="${OY + 520}" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" fill="${MUTED}">PERSONALIZACIÓN</text>
  <text x="${OX + 40}" y="${OY + 565}" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" fill="${WHITE}">Medidas exactas · Colores · Logos · Acabados especiales</text>
  
  <text x="${OX + 40}" y="${H - OY - 30}" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" fill="${MUTED}">Plastilonas Peruanas SAC · RUC 20523135385 · Chorrillos, Lima</text>
</svg>`;
}

async function renderCard(svg, outPath) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(W, H, { fit: 'fill' })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .withMetadata({}) // strip
    .toFile(outPath);
}

async function main() {
  console.log('Generating cards for', PRODUCTS.length, 'products…');
  const manifest = {};
  let totalCards = 0;

  for (const p of PRODUCTS) {
    const base = p.primary.replace(/\.jpg$/i, '');
    const need = 4 - p.existing.length;
    const gallery = [...p.existing];
    const tags = p.existing.map(() => 'real');

    const cardFns = [makeSpecsCard, makeAppsCard, makeFormatsCard];
    for (let i = 0; i < need; i++) {
      const idx = p.existing.length + i + 1; // -2, -3, -4
      const fname = `${base}-${idx}.jpg`;
      const path = `/images/${fname}`;
      const out = join(OUT_DIR, fname);
      const svg = cardFns[i % 3](p);
      await renderCard(svg, out);
      gallery.push(path);
      tags.push('card');
      totalCards++;
      console.log('  +', fname);
    }

    // pad if somehow over (shouldn't)
    while (gallery.length < 4) {
      const idx = gallery.length + 1;
      const fname = `${base}-${idx}.jpg`;
      const path = `/images/${fname}`;
      await renderCard(makeFormatsCard(p), join(OUT_DIR, fname));
      gallery.push(path);
      tags.push('card');
      totalCards++;
    }

    manifest[p.slug] = {
      gallery: gallery.slice(0, 4),
      tags: tags.slice(0, 4),
      primary: p.existing[0],
    };
  }

  writeFileSync(join(__dirname, '../manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Done. Cards generated:', totalCards);
  console.log('Manifest written.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
