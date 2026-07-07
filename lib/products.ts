import { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    slug: 'big-bags-bolsones-polipropileno',
    name: 'Big Bags / Bolsones de Polipropileno',
    category: 'Big Bags',
    sector: ['Minería', 'Industrial', 'Agricultura', 'Construcción'],
    shortDescription: 'Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.',
    description: 'Nuestros Big Bags (también conocidos como FIBC o contenedores intermedios flexibles para granel) están fabricados con polipropileno tejido de alta tenacidad, con tratamiento UV para mayor durabilidad. Disponibles en capacidades de 1 tonelada y 2 toneladas, con diferentes configuraciones de boca de carga (abierta, con boquilla, con falda) y descarga (fondo plano, con boquilla, con falda). Ideales para minería, agricultura, construcción y logística industrial.',
    specifications: [
      { label: 'Material', value: 'Polipropileno tejido (PP) 100% virgen con tratamiento UV' },
      { label: 'Capacidad', value: '1 Tonelada (1000 kg) / 2 Toneladas (2000 kg)' },
      { label: 'Dimensiones estándar 1T', value: '90x90x90 cm / 95x95x110 cm' },
      { label: 'Dimensiones estándar 2T', value: '95x95x130 cm / 100x100x150 cm' },
      { label: 'Resistencia a la rotura', value: '5:1 o 6:1 (factor de seguridad)' },
      { label: 'Tratamiento', value: 'Anti-UV, impermeable opcional, antiestático' },
      { label: 'Opciones de boca', value: 'Abierta, con boquilla, con falda, con cierre' },
      { label: 'Opciones de fondo', value: 'Plano, con boquilla, con falda, con cierre' },
      { label: 'Certificaciones', value: 'ISO 9001, normas de transporte internacional' }
    ],
    applications: [
      'Transporte y almacenamiento de minerales y concentrados mineros',
      'Granos, fertilizantes, semillas y productos agrícolas a granel',
      'Cemento, arena, grava y materiales de construcción',
      'Productos químicos y fertilizantes industriales',
      'Residuos industriales y reciclaje'
    ],
    benefits: [
      'Alta resistencia y durabilidad en condiciones extremas',
      'Fácil manipulación con montacargas y grúas',
      'Ahorro significativo en costos de empaque y transporte',
      'Personalizables con logo y especificaciones del cliente',
      'Reutilizables y reciclables, opción eco-friendly'
    ],
    image: '/images/big-bags.jpg',
    gallery: ['/images/big-bags.jpg', '/images/big-bags-2.jpg'],
    featured: true,
    popular: true,
    // PLACEHOLDER: reemplazar por el precio de lista real antes de producción.
    price: 45.0,
    priceUnit: 'unidad',
    purchasable: true
  },
  {
    id: '2',
    slug: 'biombos-protectores-soldadura',
    name: 'Biombos Protectores para Talleres de Soldadura',
    category: 'Biombos',
    sector: ['Industrial', 'Construcción', 'Minería'],
    shortDescription: 'Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.',
    description: 'Biombos protectores fabricados con lona de fibra de vidrio recubierta de silicona o PVC ignífugo de alta calidad. Diseñados para crear zonas seguras en talleres de soldadura, astilleros, construcción y mantenimiento industrial. Disponibles en versiones portátiles con estructura metálica plegable o fijos para instalación permanente. Cumplen con normativas de seguridad industrial peruana e internacional.',
    specifications: [
      { label: 'Material', value: 'Lona de fibra de vidrio con recubrimiento de silicona/PVC ignífugo' },
      { label: 'Resistencia al fuego', value: 'Clase A / Autoextinguible (norma NFPA / ASTM)' },
      { label: 'Temperatura máxima', value: 'Hasta 550°C (fibra de vidrio siliconada)' },
      { label: 'Dimensiones estándar', value: '1.8m x 2.0m / 2.0m x 2.5m por panel (configurable)' },
      { label: 'Estructura', value: 'Acero galvanizado plegable o fija, con ruedas opcionales' },
      { label: 'Peso por panel', value: 'Aprox. 8-12 kg según tamaño' },
      { label: 'Opciones', value: 'Una cara, dos caras, con ventana de observación, con cortina inferior' }
    ],
    applications: [
      'Talleres de soldadura y fabricación metálica',
      'Mantenimiento industrial en minas y plantas',
      'Construcción y obras civiles',
      'Astilleros y reparación naval',
      'Capacitación y demostraciones técnicas'
    ],
    benefits: [
      'Protección superior contra chispas, escoria y radiación UV',
      'Reduce riesgos de incendio y lesiones oculares',
      'Fácil instalación y reconfiguración del espacio de trabajo',
      'Durabilidad extrema en ambientes industriales agresivos',
      'Cumplimiento de normas de seguridad y salud en el trabajo'
    ],
    image: '/images/biombos.jpg',
    gallery: ['/images/biombos.jpg'],
    featured: true,
    popular: false
  },
  {
    id: '3',
    slug: 'carpas-lona-estructuras-metalicas',
    name: 'Carpas de Lona Plástica con Estructuras Metálicas',
    category: 'Carpas y Estructuras',
    sector: ['Construcción', 'Agricultura', 'Industrial', 'Minería'],
    shortDescription: 'Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.',
    description: 'Soluciones completas de carpas industriales y hangares fabricados con lona plastificada de PVC de 650-900 g/m² de alta resistencia, montados sobre estructuras metálicas galvanizadas en caliente de diseño modular. Ideales para almacenamiento temporal o semi-permanente, hangares para maquinaria, galpones agrícolas, techos de piscinas, canchas deportivas, patios de colegios, sombras de estacionamiento y albergues tipo igloo. Fabricación 100% personalizada según requerimientos del cliente.',
    specifications: [
      { label: 'Material de lona', value: 'PVC plastificado 650-900 g/m², anti-UV, impermeable, retardante de llama' },
      { label: 'Estructura', value: 'Acero galvanizado en caliente, perfiles de alta resistencia' },
      { label: 'Ancho de vano', value: 'De 6m hasta 30m (sin columnas intermedias)' },
      { label: 'Longitud', value: 'Módulos de 3m o 6m, ilimitada' },
      { label: 'Altura', value: 'De 3m a 12m según diseño' },
      { label: 'Carga de viento', value: 'Diseño según normas locales (hasta 120 km/h)' },
      { label: 'Opciones', value: 'Puertas enrollables, ventanas, ventilación, iluminación, aislamiento térmico' }
    ],
    applications: [
      'Hangares para maquinaria agrícola, minera y de construcción',
      'Almacenes temporales y galpones para productos a granel',
      'Techos de piscinas, canchas deportivas y patios escolares',
      'Sombrillas y cubiertas para estacionamientos y patios',
      'Albergues de emergencia tipo igloo y campamentos',
      'Eventos masivos y ferias temporales'
    ],
    benefits: [
      'Instalación rápida (días vs meses de construcción tradicional)',
      'Costo significativamente menor que estructuras permanentes',
      'Totalmente desmontable y reubicable',
      'Personalización completa de dimensiones, color y accesorios',
      'Alta durabilidad (10+ años) con mantenimiento mínimo'
    ],
    image: '/images/carpas.jpg',
    gallery: ['/images/carpas.jpg', '/images/carpas-2.jpg'],
    featured: true,
    popular: true
  },
  {
    id: '4',
    slug: 'geomembranas-pvc',
    name: 'Geomembranas de PVC',
    category: 'Geomembranas',
    sector: ['Minería', 'Agricultura', 'Construcción', 'Industrial'],
    shortDescription: 'Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.',
    description: 'Geomembranas de PVC fabricadas con resina virgen de alta calidad, reforzadas y no reforzadas, en espesores desde 0.5mm hasta 2.0mm. Especialmente diseñadas para aplicaciones de contención de líquidos, impermeabilización de pozas de relave minero, canales de riego, lagunas de tratamiento, subsuelos de edificaciones y obras hidráulicas. Nuestras geomembranas se soldan en obra mediante equipos de soldadura por alta frecuencia o cuña caliente, garantizando juntas 100% impermeables y duraderas.',
    specifications: [
      { label: 'Material', value: 'PVC plastificado virgen de alta densidad' },
      { label: 'Espesores', value: '0.5 mm, 0.75 mm, 1.0 mm, 1.5 mm, 2.0 mm' },
      { label: 'Ancho de rollo', value: 'Hasta 2.0 m estándar (anchos especiales bajo pedido)' },
      { label: 'Resistencia a la tracción', value: '≥ 20 MPa (según norma ASTM D638)' },
      { label: 'Elongación a la rotura', value: '≥ 300%' },
      { label: 'Resistencia a la perforación', value: 'Alta (reforzada con geotextil opcional)' },
      { label: 'Soldadura', value: 'Por alta frecuencia o cuña caliente - 100% hermética' },
      { label: 'Vida útil estimada', value: '20+ años en condiciones normales' }
    ],
    applications: [
      'Pozas de relave y contención minera',
      'Canales de riego y reservorios agrícolas',
      'Lagunas de tratamiento de aguas residuales',
      'Impermeabilización de subsuelos y fundaciones',
      'Cubiertas de vertederos y sitios de disposición final',
      'Acuicultura y piscicultura (estanques)'
    ],
    benefits: [
      'Excelente impermeabilidad y resistencia química',
      'Soldadura en obra con garantía de hermeticidad',
      'Alta flexibilidad y adaptabilidad a todo tipo de terreno',
      'Resistente a rayos UV y condiciones climáticas extremas',
      'Cumplimiento de normas ambientales y de seguridad'
    ],
    image: '/images/geomembranas.jpg',
    gallery: ['/images/geomembranas.jpg'],
    featured: true,
    popular: true
  },
  {
    id: '5',
    slug: 'mangas-ventilacion-minas-tuneles',
    name: 'Mangas de Ventilación para Minas y Túneles',
    category: 'Mangas de Ventilación',
    sector: ['Minería', 'Construcción'],
    shortDescription: 'Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.',
    description: 'Mangas de ventilación fabricadas con lona plastificada de PVC o poliuretano de alta tenacidad, reforzada para soportar condiciones extremas de minería subterránea y construcción de túneles. Disponibles en diámetros desde 300mm hasta 2000mm, con o sin refuerzo de espiral de acero. Incluyen accesorios completos: codos, Y, reducciones, compuertas y conexiones rápidas. Diseñadas para ventilación principal, auxiliar y de emergencia.',
    specifications: [
      { label: 'Material', value: 'PVC plastificado o Poliuretano reforzado, antiestático opcional' },
      { label: 'Diámetros', value: '300 mm a 2000 mm (estándar y personalizados)' },
      { label: 'Longitud por sección', value: '10m, 20m, 30m o según requerimiento' },
      { label: 'Presión de trabajo', value: 'Hasta 5000 Pa (dependiendo de diámetro y refuerzo)' },
      { label: 'Refuerzo', value: 'Espiral de acero galvanizado embebido (opcional)' },
      { label: 'Propiedades', value: 'Antiestático, retardante de llama, resistente a aceites y ácidos' },
      { label: 'Conexiones', value: 'Cremallera, velcro, bridas o sistema de acople rápido' }
    ],
    applications: [
      'Ventilación principal y auxiliar en minas subterráneas',
      'Túneles carreteros, ferroviarios y de metro',
      'Obras de infraestructura subterránea',
      'Sistemas de extracción de polvo y gases',
      'Ventilación de emergencia y rescate'
    ],
    benefits: [
      'Alta durabilidad en ambientes corrosivos y abrasivos',
      'Fácil instalación, transporte y reconfiguración',
      'Excelente flujo de aire con mínima pérdida de presión',
      'Personalización total de diámetro, longitud y accesorios',
      'Cumplimiento de normas de seguridad minera (OIT, MINEM)'
    ],
    image: '/images/mangas-ventilacion.jpg',
    gallery: ['/images/mangas-ventilacion.jpg'],
    featured: false,
    popular: false
  },
  {
    id: '6',
    slug: 'mallas-antiafidas',
    name: 'Mallas Antiáfidas para Protección de Cultivos',
    category: 'Mallas Agrícolas',
    sector: ['Agricultura'],
    shortDescription: 'Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.',
    description: 'Mallas antiáfidas tejidas con hilos de polietileno de alta densidad (HDPE) con tratamiento UV, diseñadas para crear barreras físicas efectivas contra áfidos, mosca blanca, trips y otros insectos plaga, así como protección contra pájaros y granizo. Disponibles en diferentes densidades de malla (17x17, 25x25, 40x40 hilos/pulgada) según el tipo de cultivo y plaga objetivo. Perfectas para invernaderos, túneles altos, mallas sombra y sistemas de protección de cultivos a campo abierto.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE) 100% virgen con tratamiento UV' },
      { label: 'Densidad de malla', value: '17x17, 25x25, 40x40 hilos por pulgada (según plaga)' },
      { label: 'Ancho de rollo', value: '1.5m, 2.0m, 3.0m, 4.0m y 6.0m' },
      { label: 'Longitud', value: '50m, 100m o rollos personalizados' },
      { label: 'Transmisión de luz', value: '85% - 95% según densidad' },
      { label: 'Vida útil', value: '3-5 años en condiciones de campo' },
      { label: 'Opciones', value: 'Malla antiáfida, anti-trips, anti-pájaros, malla sombra combinada' }
    ],
    applications: [
      'Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.)',
      'Cultivo de berries, uvas y frutales',
      'Invernaderos y túneles de producción',
      'Viveros y producción de plántulas',
      'Agricultura orgánica y sin residuos de plaguicidas'
    ],
    benefits: [
      'Reducción drástica del uso de insecticidas (hasta 80%)',
      'Mejora la calidad y sanidad del producto final',
      'Protección contra condiciones climáticas extremas',
      'Fácil instalación y larga vida útil',
      'Compatible con producción orgánica y exportación'
    ],
    image: '/images/mallas-antiafidas.jpg',
    gallery: ['/images/mallas-antiafidas.jpg'],
    featured: true,
    popular: false,
    // PLACEHOLDER: reemplazar por el precio de lista real antes de producción.
    price: 8.5,
    priceUnit: 'm²',
    purchasable: true
  },
  {
    id: '7',
    slug: 'mantas-cobertores-toldos-camiones',
    name: 'Mantas Cobertores y Toldos para Camiones',
    category: 'Mantas para Transporte',
    sector: ['Transporte', 'Logística', 'Minería', 'Agricultura'],
    shortDescription: 'Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.',
    description: 'Mantas y toldos de alta resistencia fabricados con lona de algodón o poliéster recubierta (cruda, teñida o encerada) especialmente diseñados para camiones de carga, remolques, contenedores y transporte de materiales a granel. Disponibles en medidas estándar para camiones de 2 ejes, 3 ejes y trailers, así como fabricación a medida. Incluyen ojales de latón reforzados cada 50cm y sistema de tensión profesional.',
    specifications: [
      { label: 'Material', value: 'Lona de algodón o poliéster recubierta (PVC o encerada)' },
      { label: 'Peso', value: '450 - 850 g/m² según tipo (cruda, teñida, encerada)' },
      { label: 'Medidas estándar', value: '6x3m, 7x3.5m, 8x4m, 9x4.5m, 10x5m (personalizables)' },
      { label: 'Ojales', value: 'Latón macizo reforzado cada 50 cm en todo el perímetro' },
      { label: 'Tratamiento', value: 'Impermeable, anti-UV, retardante de llama opcional' },
      { label: 'Colores', value: 'Verde, azul, negro, beige, naranja (personalizado)' },
      { label: 'Accesorios', value: 'Cuerdas elásticas, tensores, ganchos, fundas de protección' }
    ],
    applications: [
      'Transporte de carga general en camiones y trailers',
      'Transporte de minerales, concentrados y materiales de construcción',
      'Transporte de productos agrícolas (granos, fertilizantes, frutas)',
      'Mudanzas y transporte de enseres',
      'Coberturas temporales de contenedores y almacenes'
    ],
    benefits: [
      'Protección total contra lluvia, sol, polvo y vandalismo',
      'Alta durabilidad y resistencia al desgarro',
      'Fácil instalación y retiro (sistema de tensión profesional)',
      'Personalización con logo de la empresa transportista',
      'Opción de lona encerada tradicional de máxima impermeabilidad'
    ],
    image: '/images/mantas-camiones.jpg',
    gallery: ['/images/mantas-camiones.jpg'],
    featured: false,
    popular: true
  },
  {
    id: '8',
    slug: 'mantas-arpilleras-granjas',
    name: 'Mantas Arpilleras para Granjas',
    category: 'Mantas para Granjas',
    sector: ['Agricultura'],
    shortDescription: 'Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.',
    description: 'Mantas arpilleras tradicionales de yute natural o versiones sintéticas de alta resistencia, especialmente diseñadas para el sector avícola y porcino. Utilizadas como cama inicial, control de temperatura en pollitos, protección de suelo en galpones, y como barrera contra humedad y corrientes de aire. Disponibles en rollos de diferentes anchos y longitudes, con tratamiento opcional anti-bacteriano.',
    specifications: [
      { label: 'Material', value: 'Yute natural 100% o polipropileno tejido (arpillera sintética)' },
      { label: 'Peso', value: '200 - 400 g/m² (yute) / 150 - 300 g/m² (sintética)' },
      { label: 'Ancho de rollo', value: '1.0m, 1.2m, 1.5m, 2.0m' },
      { label: 'Longitud', value: '50m, 100m o según requerimiento' },
      { label: 'Tratamiento', value: 'Natural o con aditivo anti-bacteriano y anti-olor' },
      { label: 'Uso principal', value: 'Cama de pollitos, protección de suelo, cortinas laterales' }
    ],
    applications: [
      'Cama inicial para pollitos de engorde y ponedoras',
      'Protección de suelo en galpones avícolas y porcinos',
      'Cortinas laterales y control de temperatura',
      'Cubiertas de nidos y áreas de descanso',
      'Protección durante transporte de aves'
    ],
    benefits: [
      'Excelente regulación de temperatura y humedad',
      'Absorbe olores y mantiene ambiente más limpio',
      'Económica y biodegradable (versión yute)',
      'Fácil manejo y disposición al final del ciclo',
      'Mejora el bienestar animal y reduce mortalidad'
    ],
    image: '/images/mantas-arpilleras.jpg',
    gallery: ['/images/mantas-arpilleras.jpg'],
    featured: false,
    popular: false
  },
  {
    id: '9',
    slug: 'mantas-aislantes-termicas-termoacusticas',
    name: 'Mantas Aislantes Térmicas y Termoacústicas',
    category: 'Mantas Aislantes',
    sector: ['Construcción', 'Industrial', 'Minería'],
    shortDescription: 'Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.',
    description: 'Mantas aislantes multicapa fabricadas con materiales de alta tecnología (fibra de vidrio, lana de roca, espuma de poliuretano o polietileno reticulado) recubiertas con lona de aluminio o PVC reforzado. Diseñadas para aislamiento térmico y acústico en techos, paredes, contenedores, galpones industriales, cámaras frigoríficas y vehículos. Excelente rendimiento en climas extremos del Perú (costa, sierra y selva).',
    specifications: [
      { label: 'Materiales', value: 'Fibra de vidrio / Lana de roca / Espuma PU / PE reticulado + foil de aluminio' },
      { label: 'Espesor', value: '25mm, 50mm, 75mm, 100mm (estándar y personalizado)' },
      { label: 'Conductividad térmica', value: '0.030 - 0.045 W/m·K según material' },
      { label: 'Reducción acústica', value: 'Hasta 45 dB según configuración' },
      { label: 'Ancho de rollo', value: '1.2m y 1.5m estándar' },
      { label: 'Longitud', value: '10m, 15m, 20m' },
      { label: 'Acabado', value: 'Foil de aluminio puro o reforzado, PVC blanco/gris' }
    ],
    applications: [
      'Techos y paredes de galpones industriales y agrícolas',
      'Aislamiento de contenedores y módulos habitables',
      'Cámaras frigoríficas y cuartos fríos',
      'Cabinas de maquinaria y vehículos pesados',
      'Salas de máquinas, compresores y generadores',
      'Construcción en climas extremos (sierra y selva)'
    ],
    benefits: [
      'Reducción significativa de costos de climatización (hasta 40%)',
      'Confort térmico y acústico superior',
      'Fácil y rápida instalación (sistema de grapado o adhesivo)',
      'Resistente a humedad, hongos y roedores',
      'Larga vida útil y bajo mantenimiento'
    ],
    image: '/images/mantas-aislantes.jpg',
    gallery: ['/images/mantas-aislantes.jpg'],
    featured: false,
    popular: false
  },
  {
    id: '10',
    slug: 'mulch-madera-picada',
    name: 'Mulch de Madera Picada',
    category: 'Mulch y Cubiertas',
    sector: ['Agricultura', 'Construcción', 'Paisajismo'],
    shortDescription: 'Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.',
    description: 'Mulch orgánico de madera picada de especies forestales seleccionadas, procesado en diferentes granulometrías (fino, medio, grueso). Ideal para cobertura de suelos en agricultura, jardinería, paisajismo, áreas recreativas y proyectos de reforestación. Ayuda a controlar malezas, retener humedad del suelo, regular temperatura y mejorar la estética de los espacios. Disponible en sacos de 50L, big bags o a granel.',
    specifications: [
      { label: 'Material', value: 'Madera de pino, eucalipto y especies locales certificadas' },
      { label: 'Granulometría', value: 'Fina (0-10mm), Media (10-30mm), Gruesa (30-60mm)' },
      { label: 'Presentación', value: 'Sacos de 50 litros, Big Bags de 1m³, a granel' },
      { label: 'Humedad', value: '15-25% (estabilizado)' },
      { label: 'pH', value: '5.5 - 7.0' },
      { label: 'Certificación', value: 'Libre de semillas de malezas y patógenos' }
    ],
    applications: [
      'Cobertura de suelos en cultivos de berries, frutales y hortalizas',
      'Jardines, parques y áreas recreativas',
      'Control de erosión en taludes y proyectos de reforestación',
      'Caminos y senderos en áreas naturales',
      'Decoración de espacios paisajísticos'
    ],
    benefits: [
      'Control efectivo de malezas sin químicos',
      'Retención de humedad del suelo (reduce riego hasta 30%)',
      'Regulación de temperatura del suelo',
      'Mejora la estructura y fertilidad del suelo al descomponerse',
      'Estética profesional y natural'
    ],
    image: '/images/mulch.jpg',
    gallery: ['/images/mulch.jpg'],
    featured: false,
    popular: false,
    // PLACEHOLDER: reemplazar por el precio de lista real antes de producción.
    price: 25.0,
    priceUnit: 'saco 50L',
    purchasable: true
  },
  {
    id: '11',
    slug: 'lona-plastificada-rafia-polytarp',
    name: 'Lona Plastificada, Rafia y Polytarp a Medida',
    category: 'Lonas y Soluciones a Medida',
    sector: ['Industrial', 'Construcción', 'Transporte', 'Agricultura', 'Minería'],
    shortDescription: 'Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.',
    description: 'Fabricación a medida de lonas plastificadas de PVC (450-900 g/m²), rafia de polipropileno tejida y polytarp de polietileno de alta densidad. Contamos con capacidad de confección industrial con soldadura de alta frecuencia, costura reforzada y aplicación de ojales, velcros, cremalleras y sistemas de tensión. Todo tipo de cubiertas: toldos, carpas, fundas para maquinaria, cubiertas de piscinas, lonas para camiones, cortinas industriales, y cualquier solución textil industrial que su proyecto requiera.',
    specifications: [
      { label: 'Materiales', value: 'PVC plastificado, Rafia PP, Polytarp PE, Lona de algodón encerada' },
      { label: 'Gramaje', value: 'Desde 200 g/m² hasta 900 g/m²' },
      { label: 'Anchos', value: 'Hasta 4.0 m en una pieza (uniones soldadas para mayores)' },
      { label: 'Acabados', value: 'Soldadura HF, costura doble reforzada, ojales, velcro, cremallera' },
      { label: 'Tratamientos', value: 'Anti-UV, ignífugo, antiestático, antibacteriano' },
      { label: 'Personalización', value: 'Impresión de logos, colores corporativos, medidas exactas' }
    ],
    applications: [
      'Cubiertas y fundas a medida para maquinaria y equipos',
      'Toldos y carpas para eventos, comercios y residencias',
      'Cortinas industriales y separadores de ambientes',
      'Cubiertas de piscinas, canchas y patios',
      'Cualquier solución textil industrial personalizada'
    ],
    benefits: [
      'Fabricación 100% a medida según sus especificaciones exactas',
      'Alta calidad de confección con garantía de durabilidad',
      'Asesoría técnica especializada para elegir la mejor solución',
      'Entregas rápidas y precios competitivos',
      'Soporte post-venta y reposición de partes'
    ],
    image: '/images/lona-a-medida.jpg',
    gallery: ['/images/lona-a-medida.jpg'],
    featured: true,
    popular: true
  }
];

export const categories = [
  'Big Bags',
  'Biombos',
  'Carpas y Estructuras',
  'Geomembranas',
  'Mangas de Ventilación',
  'Mallas Agrícolas',
  'Mantas para Transporte',
  'Mantas para Granjas',
  'Mantas Aislantes',
  'Mulch y Cubiertas',
  'Lonas y Soluciones a Medida'
];

export const sectors = [
  'Minería',
  'Agricultura',
  'Construcción',
  'Transporte',
  'Industrial',
  'Logística'
];
