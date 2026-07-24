import { Product, ProductFamily } from './types';

// -----------------------------------------------------------------------------
// CATÁLOGO PLASTILONAS PERUANAS SAC
// Arquitectura de dos ejes (estilo AWS): navegación por FAMILIA (`category`) y
// por SECTOR (`sector`). Todo el portafolio competitivo está representado.
//
// REGLA DE HONESTIDAD (obligatoria al editar):
//  1. `sourcing` declara cómo entregamos: fabricación propia / importación /
//     bajo pedido / aliado. `availability` declara el estado (stock / a medida /
//     bajo pedido).
//  2. Las líneas de geosintéticos e insumos técnicos (PE/HDPE, geotextiles,
//     geomallas, tuberías, biodigestores, tanques) van como `bajo_pedido`:
//     se listan completas y visibles, pero la ficha técnica y el certificado
//     de lote del fabricante se entregan en la cotización. NO se publican
//     números de certificado no verificables como propios.
//  3. No se reutilizan proyectos, logos ni certificados de la competencia.
// -----------------------------------------------------------------------------

export const products: Product[] = [
  // ===========================================================================
  // 1) ENVASES Y EMBALAJE INDUSTRIAL
  // ===========================================================================
  {
    id: '1',
    slug: 'big-bags-bolsones-polipropileno',
    name: 'Big Bags / Bolsones de Polipropileno',
    category: 'Envases y Embalaje',
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
      { label: 'Normas de referencia', value: 'Fabricado según normas de transporte de carga aplicables; documentación disponible en cotización' }
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
    image: '/images/galeria/big-bags-bolsones-polipropileno-general.jpg',
    gallery: [
      '/images/galeria/big-bags-bolsones-polipropileno-general.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-detalle.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-instalacion.jpg',
      '/images/galeria/big-bags-bolsones-polipropileno-escala.jpg',
      '/images/big-bags.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 45.0,
    // priceUnit: 'unidad',
    // purchasable: true,
  },
  {
    id: '12',
    slug: 'sacos-polytarp-embarque-granel',
    name: 'Sacos Polytarp para Embarque a Granel',
    category: 'Envases y Embalaje',
    sector: ['Transporte', 'Minería', 'Agricultura', 'Logística'],
    shortDescription: 'Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.',
    description: 'Sacos de material Polytarp (polietileno laminado de alta densidad) para embarque a granel, protección de carga y estiba en operaciones portuarias, mineras y agrícolas. Alternativa robusta e impermeable para volúmenes donde el big bag no aplica. Confección con costura reforzada y refuerzos de esquina, en medidas estándar o a medida del cliente.',
    specifications: [
      { label: 'Material', value: 'Polytarp (PE laminado) 100% virgen, impermeable, aditivado UV' },
      { label: 'Gramaje', value: '120 - 200 g/m² según requerimiento' },
      { label: 'Medidas', value: 'Estándar y a medida (según carga y estiba)' },
      { label: 'Confección', value: 'Costura reforzada, refuerzos de esquina, asas opcionales' },
      { label: 'Impresión', value: 'Logotipo y rotulado de carga opcional' }
    ],
    applications: [
      'Embarque y estiba de carga a granel',
      'Protección de mercadería en tránsito y almacenaje',
      'Cobertura de pallets y unidades de carga',
      'Operaciones portuarias, mineras y agroindustriales'
    ],
    benefits: [
      '100% impermeable y resistente a la intemperie',
      'Confección reforzada para uso rudo y reutilización',
      'Personalizable en medida, color y rotulado',
      'Abastecimiento ágil con respaldo técnico local'
    ],
    image: '/images/galeria/sacos-polytarp-embarque-granel-general.jpg',
    gallery: [
      '/images/galeria/sacos-polytarp-embarque-granel-general.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-detalle.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-instalacion.jpg',
      '/images/galeria/sacos-polytarp-embarque-granel-escala.jpg',
      '/images/sacos-polytarp.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },
  {
    id: '13',
    slug: 'bolsas-laminas-pebd-pead',
    name: 'Bolsas y Láminas de Polietileno PEBD / PEAD',
    category: 'Envases y Embalaje',
    sector: ['Industrial', 'Agricultura', 'Logística', 'Construcción'],
    shortDescription: 'Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.',
    description: 'Bolsas y láminas de polietileno de baja densidad (PEBD) y alta densidad (PEAD) fabricadas con material 100% virgen, en un amplio rango de calibres, medidas y colores. Producción a medida para embalaje industrial, protección de productos, separación, recubrimiento de superficies y usos agrícolas. Disponibilidad de impresión personalizada.',
    specifications: [
      { label: 'Material', value: 'PEBD / PEAD 100% virgen' },
      { label: 'Calibre', value: 'Desde 1 hasta 8 milésimas de pulgada (según uso)' },
      { label: 'Medidas', value: 'Especiales, a medida del cliente' },
      { label: 'Colores', value: 'Transparente, natural y colores a solicitud' },
      { label: 'Presentación', value: 'Bolsas, láminas o rollos' },
      { label: 'Impresión', value: 'Personalizada (logo, indicaciones de manejo)' }
    ],
    applications: [
      'Embalaje y protección de productos industriales',
      'Recubrimiento y separación de materiales',
      'Forrado de contenedores, tolvas y estructuras',
      'Aplicaciones agrícolas y de almacenamiento'
    ],
    benefits: [
      'Material 100% virgen: mayor resistencia y limpieza',
      'Medidas y calibres exactos a su necesidad',
      'Opción de impresión y personalización',
      'Producción nacional con tiempos de entrega competitivos'
    ],
    image: '/images/galeria/bolsas-laminas-pebd-pead-general.jpg',
    gallery: [
      '/images/galeria/bolsas-laminas-pebd-pead-general.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-detalle.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-instalacion.jpg',
      '/images/galeria/bolsas-laminas-pebd-pead-escala.jpg',
      '/images/bolsas-laminas.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '14',
    slug: 'films-termocontraibles-shrink',
    name: 'Films Termocontraíbles (Shrink) y Mangas PE',
    category: 'Envases y Embalaje',
    sector: ['Industrial', 'Logística', 'Transporte'],
    shortDescription: 'Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.',
    description: 'Films y mangas termocontraíbles (shrink) de polietileno para unitización de cargas, embalaje seguro y protección de productos paletizados frente a polvo, humedad y manipulación. Se contraen con calor formando una envoltura firme y estable. Disponibles en distintos calibres y anchos, y en presentación de manga tubular PEBD/PEAD.',
    specifications: [
      { label: 'Material', value: 'Polietileno termocontraíble (shrink), PEBD/PEAD' },
      { label: 'Calibre', value: 'Según peso y estabilidad de carga requerida' },
      { label: 'Formato', value: 'Rollo plano, semitubo o manga tubular' },
      { label: 'Contracción', value: 'Activada por calor (túnel o pistola de calor)' },
      { label: 'Anchos', value: 'Estándar y especiales a medida' }
    ],
    applications: [
      'Unitización y estabilización de cargas paletizadas',
      'Embalaje de protección contra polvo y humedad',
      'Agrupación de productos para distribución',
      'Protección de bienes en tránsito y almacenaje'
    ],
    benefits: [
      'Envoltura firme y estable que asegura la carga',
      'Protección efectiva en tránsito y almacenamiento',
      'Optimiza espacio y presentación de la mercadería',
      'Calibres a medida para cada tipo de carga'
    ],
    image: '/images/galeria/films-termocontraibles-shrink-general.jpg',
    gallery: [
      '/images/galeria/films-termocontraibles-shrink-general.jpg',
      '/images/galeria/films-termocontraibles-shrink-detalle.jpg',
      '/images/galeria/films-termocontraibles-shrink-instalacion.jpg',
      '/images/galeria/films-termocontraibles-shrink-escala.jpg',
      '/images/films-shrink.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 2) LONAS Y COBERTORES TÉCNICOS  (flagship)
  // ===========================================================================
  {
    id: '11',
    slug: 'lona-plastificada-rafia-polytarp',
    name: 'Lona Plastificada, Rafia y Polytarp a Medida',
    category: 'Lonas y Cobertores',
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
    image: '/images/galeria/lona-plastificada-rafia-polytarp-general.jpg',
    gallery: [
      '/images/galeria/lona-plastificada-rafia-polytarp-general.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-detalle.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-instalacion.jpg',
      '/images/galeria/lona-plastificada-rafia-polytarp-escala.jpg',
      '/images/lona-a-medida.jpg',
      '/images/ojalillo-rafia.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '7',
    slug: 'mantas-cobertores-toldos-camiones',
    name: 'Mantas Cobertores y Toldos para Camiones',
    category: 'Lonas y Cobertores',
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
    image: '/images/galeria/mantas-cobertores-toldos-camiones-general.jpg',
    gallery: [
      '/images/galeria/mantas-cobertores-toldos-camiones-general.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-detalle.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-instalacion.jpg',
      '/images/galeria/mantas-cobertores-toldos-camiones-escala.jpg',
      '/images/mantas-camiones.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '15',
    slug: 'siders-tolderas-camiones',
    name: 'Siders y Tolderas para Camiones',
    category: 'Lonas y Cobertores',
    sector: ['Transporte', 'Logística', 'Industrial'],
    shortDescription: 'Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.',
    description: 'Confección e instalación de siders (cortinas laterales corredizas) y tolderas para camiones, plataformas y semirremolques, en lona de PVC de alta tenacidad soldada por alta frecuencia. Sistemas de tensión, correas, hebillas y refuerzos para uso intensivo de transporte de carga. Fabricación a medida de la carrocería, con opción de rotulado publicitario de flota.',
    specifications: [
      { label: 'Material', value: 'Lona PVC alta tenacidad 650-900 g/m², anti-UV, impermeable' },
      { label: 'Sistema', value: 'Sider corredizo, toldera fija o desmontable' },
      { label: 'Herrajes', value: 'Correas, hebillas, tensores y refuerzos de uso rudo' },
      { label: 'Unión', value: 'Soldadura de alta frecuencia y costura reforzada' },
      { label: 'Personalización', value: 'Medida exacta de carrocería + rotulado de flota' }
    ],
    applications: [
      'Cortinas laterales para semirremolques y furgones',
      'Tolderas para plataformas y camiones de carga',
      'Renovación y reparación de siders existentes',
      'Rotulado y branding de flota de transporte'
    ],
    benefits: [
      'Confección exacta a la carrocería del cliente',
      'Materiales de alta tenacidad para uso intensivo',
      'Instalación profesional y soporte post-venta',
      'Doble función: protección de carga + imagen de marca'
    ],
    image: '/images/galeria/siders-tolderas-camiones-general.jpg',
    gallery: [
      '/images/galeria/siders-tolderas-camiones-general.jpg',
      '/images/galeria/siders-tolderas-camiones-detalle.jpg',
      '/images/galeria/siders-tolderas-camiones-instalacion.jpg',
      '/images/galeria/siders-tolderas-camiones-escala.jpg',
      '/images/siders-tolderas.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '16',
    slug: 'cobertores-agricolas-multimaterial',
    name: 'Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP)',
    category: 'Lonas y Cobertores',
    sector: ['Agricultura', 'Industrial', 'Logística'],
    shortDescription: 'Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.',
    description: 'Cobertores técnicos en múltiples materiales para cada necesidad de protección: Polytarp y PE impermeables para intemperie, Raschel para sombra y ventilación, térmicos para control de temperatura y anti-helada, y polipropileno para cobertura general. Confección a medida con ojales, refuerzos y sistemas de amarre. Solución única para reemplazar compras fragmentadas a varios proveedores.',
    specifications: [
      { label: 'Materiales', value: 'Polytarp, Polietileno (PE), Raschel, Térmico, Polipropileno (PP)' },
      { label: 'Acabados', value: 'Ojales, refuerzos perimetrales, dobladillos y amarres' },
      { label: 'Tratamiento', value: 'Aditivado UV; impermeable o transpirable según material' },
      { label: 'Medidas', value: 'Estándar y a medida del cliente' },
      { label: 'Uso', value: 'Intemperie, sombra, térmico/anti-helada o cobertura general' }
    ],
    applications: [
      'Protección de cultivos, camas de siembra y almácigos',
      'Cobertura de insumos, granos y mercadería a la intemperie',
      'Control de sombra, temperatura y helada en campo',
      'Protección general en industria, agro y logística'
    ],
    benefits: [
      'Un solo proveedor para todos los tipos de cobertor',
      'Material correcto para cada aplicación (no genérico)',
      'Confección a medida con acabados profesionales',
      'Asesoría para elegir el material óptimo por clima y uso'
    ],
    image: '/images/galeria/cobertores-agricolas-multimaterial-general.jpg',
    gallery: [
      '/images/galeria/cobertores-agricolas-multimaterial-general.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-detalle.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-instalacion.jpg',
      '/images/galeria/cobertores-agricolas-multimaterial-escala.jpg',
      '/images/cobertores-multimaterial.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },
  {
    id: '8',
    slug: 'mantas-arpilleras-granjas',
    name: 'Mantas Arpilleras para Granjas',
    category: 'Lonas y Cobertores',
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
    image: '/images/galeria/mantas-arpilleras-granjas-general.jpg',
    gallery: [
      '/images/galeria/mantas-arpilleras-granjas-general.jpg',
      '/images/galeria/mantas-arpilleras-granjas-detalle.jpg',
      '/images/galeria/mantas-arpilleras-granjas-instalacion.jpg',
      '/images/galeria/mantas-arpilleras-granjas-escala.jpg',
      '/images/mantas-arpilleras.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },
  {
    id: '9',
    slug: 'mantas-aislantes-termicas-termoacusticas',
    name: 'Mantas Aislantes Térmicas y Termoacústicas',
    category: 'Lonas y Cobertores',
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
    image: '/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg',
    gallery: [
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion.jpg',
      '/images/galeria/mantas-aislantes-termicas-termoacusticas-escala.jpg',
      '/images/mantas-aislantes.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 3) ESTRUCTURAS Y ARQUITECTURA TEXTIL
  // ===========================================================================
  {
    id: '3',
    slug: 'carpas-lona-estructuras-metalicas',
    name: 'Carpas de Lona Plástica con Estructuras Metálicas',
    category: 'Estructuras y Arquitectura Textil',
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
    image: '/images/galeria/carpas-lona-estructuras-metalicas-general.jpg',
    gallery: [
      '/images/galeria/carpas-lona-estructuras-metalicas-general.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-detalle.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-instalacion.jpg',
      '/images/galeria/carpas-lona-estructuras-metalicas-escala.jpg',
      '/images/carpas.jpg',
      '/images/techos-escolares.jpg',
    ],
    featured: true,
    popular: true,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '17',
    slug: 'coberturas-tensionadas-arquitectura-textil',
    name: 'Coberturas Tensionadas y Arquitectura Textil',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Construcción', 'Comercio', 'Infraestructura'],
    shortDescription: 'Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.',
    description: 'Diseño, fabricación e instalación de coberturas tensionadas en membrana textil (PVC/poliéster de alta resistencia) para grandes luces y formas arquitectónicas: sombras de estacionamiento, patios de comida, ingresos, plazas y áreas comerciales. Incluye cálculo de patrón, herrajes de acero inoxidable, cables y anclajes. Cada proyecto se dimensiona según luz, cargas de viento y geometría del sitio.',
    specifications: [
      { label: 'Membrana', value: 'Lona PVC/poliéster de alta tenacidad, anti-UV, autolimpiante opcional' },
      { label: 'Herrajes', value: 'Acero inoxidable / galvanizado, cables y tensores' },
      { label: 'Luces', value: 'Según proyecto (formas cónicas, hypar, en voladizo)' },
      { label: 'Diseño', value: 'Cálculo de patrón y cargas específico por sitio' },
      { label: 'Cargas', value: 'Diseño según viento y geometría local del proyecto' }
    ],
    applications: [
      'Sombras de estacionamiento y playas vehiculares',
      'Patios de comida, plazas e ingresos comerciales',
      'Cubiertas de áreas recreativas y deportivas',
      'Elementos arquitectónicos e imagen de marca'
    ],
    benefits: [
      'Diseño arquitectónico a medida del espacio',
      'Grandes luces con estética contemporánea',
      'Instalación profesional con herrajes de calidad',
      'Alternativa ligera y de rápida ejecución'
    ],
    image: '/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg',
    gallery: [
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion.jpg',
      '/images/galeria/coberturas-tensionadas-arquitectura-textil-escala.jpg',
      '/images/tensoestructuras.jpg',
      '/images/toldos-cerramientos.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '18',
    slug: 'coberturas-inflables',
    name: 'Coberturas y Estructuras Inflables',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Industrial', 'Comercio', 'Construcción'],
    shortDescription: 'Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.',
    description: 'Estructuras inflables de membrana textil sostenidas por presión de aire, para almacenamiento temporal, coberturas deportivas, espacios de evento y protección de instalaciones. Se dimensionan por proyecto e incluyen equipo de insuflado, esclusas de acceso y anclaje. Línea de suministro por proyecto: se define ingeniería, membrana y equipamiento según el requerimiento específico.',
    specifications: [
      { label: 'Sistema', value: 'Membrana sostenida por presión de aire (air-supported)' },
      { label: 'Membrana', value: 'PVC/poliéster de alta resistencia, aditivado UV' },
      { label: 'Equipamiento', value: 'Blowers, esclusa de acceso, sistema de anclaje' },
      { label: 'Dimensiones', value: 'Según proyecto e ingeniería específica' },
      { label: 'Disponibilidad', value: 'Por proyecto — ingeniería y ficha técnica' }
    ],
    applications: [
      'Almacenamiento y coberturas temporales',
      'Coberturas deportivas y recreativas',
      'Espacios de evento y exhibición',
      'Protección de instalaciones y equipos'
    ],
    benefits: [
      'Grandes espacios sin estructura interna',
      'Montaje y desmontaje relativamente rápidos',
      'Solución temporal o semipermanente',
      'Dimensionamiento y ficha técnica por proyecto'
    ],
    image: '/images/galeria/coberturas-inflables-general.jpg',
    gallery: [
      '/images/galeria/coberturas-inflables-general.jpg',
      '/images/galeria/coberturas-inflables-detalle.jpg',
      '/images/galeria/coberturas-inflables-instalacion.jpg',
      '/images/galeria/coberturas-inflables-escala.jpg',
      '/images/inflables.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'bajo_pedido',
    availability: 'bajo_pedido',
    leadTime: 'Según proyecto'
  },
  {
    id: '19',
    slug: 'modulos-albergues-campamentos',
    name: 'Módulos y Albergues para Campamentos',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Minería', 'Construcción', 'Industrial'],
    shortDescription: 'Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.',
    description: 'Módulos estructurados, tiendas de campaña y albergues para campamentos de minería, construcción y operaciones remotas. Estructura metálica modular con cobertura de lona técnica anti-UV e impermeable, con opciones de aislamiento térmico, ventilación y divisiones internas. Se configuran según cantidad de personal, clima y logística del sitio.',
    specifications: [
      { label: 'Cobertura', value: 'Lona PVC/técnica anti-UV, impermeable, retardante de llama opcional' },
      { label: 'Estructura', value: 'Metálica modular, desmontable y reubicable' },
      { label: 'Configuración', value: 'Dormitorios, comedores, almacenes, oficinas de obra' },
      { label: 'Opciones', value: 'Aislamiento térmico, ventilación, divisiones, piso' },
      { label: 'Clima', value: 'Adaptable a costa, sierra y selva' }
    ],
    applications: [
      'Campamentos mineros y de exploración',
      'Obras de construcción e infraestructura remota',
      'Albergues temporales y de emergencia',
      'Almacenes y oficinas de campo'
    ],
    benefits: [
      'Instalación rápida en sitios remotos',
      'Desmontable y reubicable entre proyectos',
      'Adaptado al clima del emplazamiento',
      'Configuración a medida del personal y la operación'
    ],
    image: '/images/galeria/modulos-albergues-campamentos-general.jpg',
    gallery: [
      '/images/galeria/modulos-albergues-campamentos-general.jpg',
      '/images/galeria/modulos-albergues-campamentos-detalle.jpg',
      '/images/galeria/modulos-albergues-campamentos-instalacion.jpg',
      '/images/galeria/modulos-albergues-campamentos-escala.jpg',
      '/images/modulos-campamentos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '20',
    slug: 'galpones-invernaderos-estructurados',
    name: 'Galpones, Techos Ligeros e Invernaderos Estructurados',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Agricultura', 'Industrial', 'Construcción'],
    shortDescription: 'Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.',
    description: 'Galpones y techos ligeros de estructura metálica con cobertura textil, e invernaderos estructurados para agricultura protegida de alto rendimiento. Combinan estructura galvanizada con films/mallas y lonas técnicas según el cultivo o el uso. Se diseñan por ancho de vano, control climático requerido y condiciones del sitio.',
    specifications: [
      { label: 'Estructura', value: 'Metálica galvanizada, modular, diseño por vano' },
      { label: 'Cobertura', value: 'Film agrícola, malla o lona técnica según aplicación' },
      { label: 'Ancho de vano', value: 'Según diseño y control climático requerido' },
      { label: 'Opciones', value: 'Ventilación cenital/lateral, malla antiáfida, sombra' },
      { label: 'Uso', value: 'Agricultura protegida, almacenamiento, producción' }
    ],
    applications: [
      'Invernaderos para hortalizas, berries y flores',
      'Galpones y techos ligeros para almacenamiento',
      'Viveros y producción de plántulas',
      'Cobertizos agrícolas e industriales'
    ],
    benefits: [
      'Mayor rendimiento por control del ambiente de cultivo',
      'Estructura duradera y cobertura adecuada al cultivo',
      'Diseño e instalación a medida del sitio',
      'Integrable con nuestra línea de mallas agrícolas'
    ],
    image: '/images/galeria/galpones-invernaderos-estructurados-general.jpg',
    gallery: [
      '/images/galeria/galpones-invernaderos-estructurados-general.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-detalle.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-instalacion.jpg',
      '/images/galeria/galpones-invernaderos-estructurados-escala.jpg',
      '/images/invernaderos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '21',
    slug: 'toldos-cerramientos',
    name: 'Toldos, Cerramientos y Cortinas Industriales',
    category: 'Estructuras y Arquitectura Textil',
    sector: ['Comercio', 'Industrial', 'Construcción'],
    shortDescription: 'Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.',
    description: 'Toldos decorativos y comerciales, cerramientos de lona (puertas y ventanas de lona), y cortinas industriales para delimitación de ambientes, control de clima y protección de accesos. Confección en lona PVC de alta resistencia, con sistemas de enrollado, corredera o fijos, a medida del vano.',
    specifications: [
      { label: 'Material', value: 'Lona PVC de alta resistencia, anti-UV, impermeable' },
      { label: 'Sistemas', value: 'Enrollable, corredera, fijo o plegable' },
      { label: 'Aplicación', value: 'Toldo, cerramiento de vano o cortina industrial' },
      { label: 'Herrajes', value: 'Estructura y herrajes según tipo de instalación' },
      { label: 'Personalización', value: 'Color, rotulado e imagen comercial' }
    ],
    applications: [
      'Toldos para comercios, restaurantes y viviendas',
      'Cerramientos de ambientes y accesos',
      'Cortinas industriales y separadores de nave',
      'Control de clima y protección de vanos'
    ],
    benefits: [
      'Confección a medida del vano y del uso',
      'Mejora imagen comercial y confort del espacio',
      'Materiales durables para intemperie',
      'Instalación profesional y soporte'
    ],
    image: '/images/galeria/toldos-cerramientos-general.jpg',
    gallery: [
      '/images/galeria/toldos-cerramientos-general.jpg',
      '/images/galeria/toldos-cerramientos-detalle.jpg',
      '/images/galeria/toldos-cerramientos-instalacion.jpg',
      '/images/galeria/toldos-cerramientos-escala.jpg',
      '/images/toldos-cerramientos.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 4) MALLAS Y COBERTURAS AGRÍCOLAS
  // ===========================================================================
  {
    id: '6',
    slug: 'mallas-antiafidas',
    name: 'Mallas Antiáfidas para Protección de Cultivos',
    category: 'Mallas y Coberturas Agrícolas',
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
    image: '/images/galeria/mallas-antiafidas-general.jpg',
    gallery: [
      '/images/galeria/mallas-antiafidas-general.jpg',
      '/images/galeria/mallas-antiafidas-detalle.jpg',
      '/images/galeria/mallas-antiafidas-instalacion.jpg',
      '/images/galeria/mallas-antiafidas-escala.jpg',
      '/images/mallas-antiafidas.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 8.5,
    // priceUnit: 'm²',
    // purchasable: true,
  },
  {
    id: '22',
    slug: 'malla-raschel-sombra',
    name: 'Malla Raschel y Malla Sombra',
    category: 'Mallas y Coberturas Agrícolas',
    sector: ['Agricultura', 'Construcción', 'Comercio'],
    shortDescription: 'Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.',
    description: 'Mallas Raschel de polietileno de alta densidad con tratamiento UV, en distintos porcentajes de sombra (35%, 50%, 65%, 80%, 90%) para control de radiación, temperatura y viento. Uso agrícola (viveros, cultivos sensibles), cercos, sombras de estacionamiento y delimitación de obra. Disponibles en varios colores y anchos, con opción de confección con refuerzos y ojales.',
    specifications: [
      { label: 'Material', value: 'HDPE 100% virgen con tratamiento UV' },
      { label: 'Porcentaje de sombra', value: '35%, 50%, 65%, 80%, 90%' },
      { label: 'Colores', value: 'Negro, verde, y otros a solicitud' },
      { label: 'Ancho de rollo', value: '2.0m, 3.0m, 4.0m (otros a pedido)' },
      { label: 'Confección', value: 'Con refuerzos, dobladillo y ojales opcional' }
    ],
    applications: [
      'Sombra para viveros y cultivos sensibles',
      'Cercos, delimitación y control de viento',
      'Sombras de estacionamiento y áreas comunes',
      'Cerramientos temporales de obra'
    ],
    benefits: [
      'Control preciso de luz y temperatura por % de sombra',
      'Material aditivado UV para larga duración',
      'Versátil para agro, comercio y construcción',
      'Confección con acabados a medida'
    ],
    image: '/images/galeria/malla-raschel-sombra-general.jpg',
    gallery: [
      '/images/galeria/malla-raschel-sombra-general.jpg',
      '/images/galeria/malla-raschel-sombra-detalle.jpg',
      '/images/galeria/malla-raschel-sombra-instalacion.jpg',
      '/images/galeria/malla-raschel-sombra-escala.jpg',
      '/images/malla-raschel.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },
  {
    id: '23',
    slug: 'malla-anti-pajaro-anti-granizo',
    name: 'Malla Anti-Pájaro y Anti-Granizo',
    category: 'Mallas y Coberturas Agrícolas',
    sector: ['Agricultura'],
    shortDescription: 'Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.',
    description: 'Mallas ligeras de protección contra aves y granizo para frutales, viñedos y cultivos de alto valor. Barrera física que reduce pérdidas de cosecha sin afectar significativamente la luz. Confección a medida del huerto, con refuerzos y sistemas de tensión para cobertura de hileras o cobertura total.',
    specifications: [
      { label: 'Material', value: 'Polietileno/HDPE aditivado UV, tejido ligero' },
      { label: 'Tipo', value: 'Anti-pájaro (malla fina) / Anti-granizo (malla reforzada)' },
      { label: 'Formato', value: 'Cobertura de hilera o cobertura total' },
      { label: 'Ancho', value: 'Según diseño del huerto' },
      { label: 'Confección', value: 'Refuerzos, ojales y sistema de tensión' }
    ],
    applications: [
      'Protección de frutales y viñedos',
      'Cultivos de alto valor y berries',
      'Reducción de pérdidas por aves y granizo',
      'Sistemas de cobertura de hilera'
    ],
    benefits: [
      'Reduce pérdidas de cosecha por fauna y clima',
      'Barrera física sin agroquímicos',
      'Confección a medida del huerto',
      'Larga vida útil con tratamiento UV'
    ],
    image: '/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg',
    gallery: [
      '/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-detalle.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-instalacion.jpg',
      '/images/galeria/malla-anti-pajaro-anti-granizo-escala.jpg',
      '/images/malla-anti-pajaro.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 5) VENTILACIÓN INDUSTRIAL
  // ===========================================================================
  {
    id: '5',
    slug: 'mangas-ventilacion-minas-tuneles',
    name: 'Mangas de Ventilación para Minas y Túneles',
    category: 'Ventilación Industrial',
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
    image: '/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg',
    gallery: [
      '/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-detalle.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-instalacion.jpg',
      '/images/galeria/mangas-ventilacion-minas-tuneles-escala.jpg',
      '/images/mangas-ventilacion.jpg',
      '/images/mangas-ventilacion-y.jpg',
      '/images/mangas-produccion.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 6) GEOSINTÉTICOS E IMPERMEABILIZACIÓN
  //    PVC = fabricación/soldadura propia. Resto = importación directa,
  //    disponible bajo pedido (ficha técnica y certificado de lote en cotización).
  // ===========================================================================
  {
    id: '4',
    slug: 'geomembranas-pvc',
    name: 'Geomembranas de PVC',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Agricultura', 'Construcción', 'Industrial'],
    shortDescription: 'Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.',
    description: 'Geomembranas de PVC fabricadas con resina virgen de alta calidad, reforzadas y no reforzadas, en espesores desde 0.5mm hasta 2.0mm. Especialmente diseñadas para aplicaciones de contención de líquidos, impermeabilización de pozas de relave minero, canales de riego, lagunas de tratamiento, subsuelos de edificaciones y obras hidráulicas. Nuestras geomembranas se soldan en obra mediante equipos de soldadura por alta frecuencia o cuña caliente, garantizando juntas 100% impermeables y duraderas.',
    specifications: [
      { label: 'Material', value: 'PVC plastificado virgen de alta densidad' },
      { label: 'Espesores', value: '0.5 mm, 0.75 mm, 1.0 mm, 1.5 mm, 2.0 mm' },
      { label: 'Ancho de rollo', value: 'Hasta 2.0 m estándar (anchos especiales por proyecto)' },
      { label: 'Resistencia a la tracción', value: 'Alta resistencia; valores según ficha técnica del material en cotización' },
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
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '24',
    slug: 'geomembrana-polietileno-pe-hdpe',
    name: 'Geomembrana de Polietileno (PE / HDPE)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura', 'Energía'],
    shortDescription: 'Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.',
    description: 'Geomembrana de polietileno de alta densidad (HDPE) para impermeabilización de pozas de proceso y relave, rellenos sanitarios, reservorios y obras hidráulicas donde se requiere alta resistencia química y mecánica. Se instala con soldadura por termofusión (cuña caliente / extrusión). Línea de importación directa, suministrada por proyecto: los espesores, propiedades y el certificado de lote del fabricante se confirman y entregan en la cotización según el proyecto.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE)' },
      { label: 'Espesores', value: 'Rango típico 0.75 – 2.5 mm (a confirmar por proyecto)' },
      { label: 'Instalación', value: 'Termofusión: cuña caliente / extrusión' },
      { label: 'Propiedades', value: 'Alta resistencia química y a la perforación' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote del fabricante en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Pozas de proceso y relave en minería',
      'Rellenos sanitarios y de seguridad',
      'Reservorios y lagunas de tratamiento',
      'Canales y obras hidráulicas de exigencia'
    ],
    benefits: [
      'Alta resistencia química para procesos agresivos',
      'Soldadura por termofusión de gran fiabilidad',
      'Espesores y ficha ajustados a cada proyecto',
      'Documentación de respaldo entregada en la cotización'
    ],
    image: '/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg',
    gallery: [
      '/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-detalle.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion.jpg',
      '/images/galeria/geomembrana-polietileno-pe-hdpe-escala.jpg',
      '/images/geomembrana-hdpe.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '25',
    slug: 'geomembrana-pe-fortificada',
    name: 'Geomembrana de PE Fortificada (Reforzada)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Construcción', 'Infraestructura', 'Energía'],
    shortDescription: 'Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.',
    description: 'Geomembrana de polietileno fortificada con inserto de refuerzo (scrim) para aplicaciones que requieren mayor resistencia al punzonamiento y a esfuerzos mecánicos, con menor peso por m² frente a espesores equivalentes. Línea de importación directa, suministrada por proyecto; propiedades y certificado de lote se entregan según especificación del proyecto.',
    specifications: [
      { label: 'Material', value: 'Polietileno con refuerzo interno (scrim)' },
      { label: 'Ventaja', value: 'Mayor resistencia mecánica / punzonamiento por peso' },
      { label: 'Instalación', value: 'Termofusión / según sistema del fabricante' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Cubiertas flotantes y coberturas expuestas',
      'Aplicaciones con alto riesgo de punzonamiento',
      'Obras temporales de impermeabilización',
      'Proyectos con restricciones de peso'
    ],
    benefits: [
      'Refuerzo interno para mayor tenacidad',
      'Buena relación resistencia/peso',
      'Especificación ajustada al proyecto',
      'Documentación técnica de respaldo en cotización'
    ],
    image: '/images/geomembrana-fortificada.jpg',
    gallery: ['/images/geomembrana-fortificada.jpg'],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '26',
    slug: 'geomembrana-bituminosa',
    name: 'Geomembrana Bituminosa',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Infraestructura', 'Construcción', 'Saneamiento'],
    shortDescription: 'Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.',
    description: 'Geomembrana bituminosa para impermeabilización de tôneles, obras civiles, canales y estructuras hidráulicas, con buena adaptación al sustrato y resistencia mecánica. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote se entregan según el proyecto.',
    specifications: [
      { label: 'Material', value: 'Membrana bituminosa (asfáltica) reforzada' },
      { label: 'Uso', value: 'Túneles, obras civiles, canales, estructuras hidráulicas' },
      { label: 'Instalación', value: 'Según sistema del fabricante (soplete / adherida)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Impermeabilización de túneles y obras subterráneas',
      'Canales y estructuras hidráulicas',
      'Obras civiles de infraestructura',
      'Cimentaciones y muros'
    ],
    benefits: [
      'Buena adaptación al sustrato',
      'Resistencia mecánica para obra civil',
      'Especificación por proyecto',
      'Documentación de respaldo en cotización'
    ],
    image: '/images/geomembrana-bituminosa.jpg',
    gallery: ['/images/geomembrana-bituminosa.jpg'],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '27',
    slug: 'geotextiles',
    name: 'Geotextiles (Tejidos y No Tejidos)',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Construcción', 'Minería', 'Infraestructura', 'Saneamiento'],
    shortDescription: 'Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.',
    description: 'Geotextiles tejidos (refuerzo) y no tejidos (separación, filtración, drenaje y protección de geomembranas) para obras de ingeniería civil, minería e infraestructura. Se seleccionan por gramaje y función. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote se entregan según proyecto.',
    specifications: [
      { label: 'Tipos', value: 'No tejido (punzonado) y tejido' },
      { label: 'Función', value: 'Separación, filtración, drenaje, refuerzo, protección' },
      { label: 'Gramaje', value: 'Rango según función (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Separación de capas en terraplenes y vías',
      'Filtración y drenaje en obras de tierra',
      'Protección de geomembranas',
      'Refuerzo de suelos blandos'
    ],
    benefits: [
      'Función correcta según gramaje y tipo',
      'Complemento ideal de la línea de geomembranas',
      'Sistemas integrados de un solo proveedor',
      'Documentación técnica en cotización'
    ],
    image: '/images/galeria/geotextiles-general.jpg',
    gallery: [
      '/images/galeria/geotextiles-general.jpg',
      '/images/galeria/geotextiles-detalle.jpg',
      '/images/galeria/geotextiles-instalacion.jpg',
      '/images/galeria/geotextiles-escala.jpg',
      '/images/geotextiles.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },
  {
    id: '28',
    slug: 'geomallas-geogrids',
    name: 'Geomallas (Geogrids) para Estabilización de Suelos',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Construcción', 'Minería', 'Infraestructura'],
    shortDescription: 'Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.',
    description: 'Geomallas (geogrids) uniaxiales y biaxiales para refuerzo de suelos, estabilización de taludes, bases de carreteras, plataformas y muros de suelo reforzado. Se seleccionan por resistencia a la tracción y geometría de apertura según el diseño geotécnico. Línea de importación directa, suministrada por proyecto; ficha y certificado de lote se entregan según proyecto.',
    specifications: [
      { label: 'Tipos', value: 'Uniaxial y biaxial' },
      { label: 'Función', value: 'Refuerzo y estabilización de suelos y taludes' },
      { label: 'Resistencia', value: 'Según diseño geotécnico (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Bases y sub-bases de carreteras y plataformas',
      'Muros de suelo reforzado',
      'Estabilización de taludes',
      'Plataformas mineras e industriales'
    ],
    benefits: [
      'Refuerzo que prolonga vida útil de la obra',
      'Selección por diseño geotécnico',
      'Complementa geotextiles y geomembranas',
      'Documentación técnica en cotización'
    ],
    image: '/images/geomallas.jpg',
    gallery: ['/images/geomallas.jpg'],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 7) SOLUCIONES AMBIENTALES Y FLUIDOS  (bajo pedido / aliado técnico)
  // ===========================================================================
  {
    id: '29',
    slug: 'tanques-flexibles-bladders',
    name: 'Tanques Flexibles (Bladders)',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Agricultura', 'Industrial', 'Minería', 'Saneamiento'],
    shortDescription: 'Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.',
    description: 'Tanques flexibles (bladders) de membrana técnica para almacenamiento de agua, efluentes y otros líquidos, plegables y de rápida instalación sin obra civil. Ideales para riego, reserva de agua, contingencia y campamentos. Línea de suministro por proyecto: capacidad, membrana y accesorios se definen según la aplicación, con ficha técnica en la cotización.',
    specifications: [
      { label: 'Material', value: 'Membrana técnica (PVC/PU) resistente al líquido almacenado' },
      { label: 'Capacidad', value: 'Según requerimiento (a definir por proyecto)' },
      { label: 'Instalación', value: 'Sin obra civil, plegable y reubicable' },
      { label: 'Accesorios', value: 'Válvulas, conexiones y kit de llenado/vaciado' },
      { label: 'Disponibilidad', value: 'Por proyecto — ficha técnica incluida' }
    ],
    applications: [
      'Reserva de agua para riego y ganadería',
      'Almacenamiento de efluentes y contingencia',
      'Agua para campamentos y obras remotas',
      'Almacenamiento temporal de líquidos industriales'
    ],
    benefits: [
      'Instalación rápida sin obra civil',
      'Plegable, transportable y reubicable',
      'Capacidad y membrana a medida del uso',
      'Ficha técnica entregada en cotización'
    ],
    image: '/images/tanques-flexibles.jpg',
    gallery: ['/images/tanques-flexibles.jpg'],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica del fabricante a solicitud, en cotización.'
  },
  {
    id: '30',
    slug: 'biodigestores',
    name: 'Biodigestores para Tratamiento de Residuos',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Agricultura', 'Industrial', 'Saneamiento'],
    shortDescription: 'Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.',
    description: 'Sistemas de biodigestión anaeróbica para el tratamiento de residuos orgánicos agroindustriales y la generación de biogás, provistos mediante aliado técnico especializado. Cada instalación se dimensiona por volumen de residuo, temperatura y objetivo (tratamiento y/o energía). De suministro por proyecto, con evaluación previa del caso.',
    specifications: [
      { label: 'Sistema', value: 'Biodigestión anaeróbica (tubular / de membrana)' },
      { label: 'Salida', value: 'Biol/biogás según diseño' },
      { label: 'Provisión', value: 'Mediante aliado técnico especializado' },
      { label: 'Dimensionamiento', value: 'Según volumen de residuo y objetivo' },
      { label: 'Disponibilidad', value: 'Por proyecto — con evaluación previa' }
    ],
    applications: [
      'Tratamiento de residuos ganaderos y agroindustriales',
      'Generación de biogás para autoconsumo',
      'Gestión ambiental de efluentes orgánicos',
      'Proyectos de sostenibilidad rural'
    ],
    benefits: [
      'Aprovechamiento energético del residuo',
      'Mejora la gestión ambiental del predio',
      'Diseño según el caso, con aliado técnico',
      'Evaluación previa para asegurar viabilidad'
    ],
    image: '/images/biodigestores.jpg',
    gallery: ['/images/biodigestores.jpg'],
    featured: false,
    popular: false,
    sourcing: 'partner',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — con evaluación previa',
    documentation: 'Memoria técnica del aliado a solicitud, tras evaluación del caso.'
  },
  {
    id: '31',
    slug: 'tuberias-hdpe',
    name: 'Tuberías HDPE y Accesorios',
    category: 'Soluciones Ambientales y Fluidos',
    sector: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    shortDescription: 'Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.',
    description: 'Tuberías de polietileno de alta densidad (HDPE) y accesorios para conducción de agua, relaves, drenaje y fluidos industriales, unidas por termofusión o electrofusión. Se especifican por diámetro y clase de presión (SDR) según el diseño hidráulico. Línea de importación directa, suministrada por proyecto; ficha y certificado de lote en cotización.',
    specifications: [
      { label: 'Material', value: 'Polietileno de alta densidad (HDPE)' },
      { label: 'Unión', value: 'Termofusión / electrofusión' },
      { label: 'Especificación', value: 'Diámetro y clase de presión (SDR) por diseño' },
      { label: 'Accesorios', value: 'Codos, tees, reducciones, bridas' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Conducción de agua y riego presurizado',
      'Transporte de relaves y fluidos mineros',
      'Redes de saneamiento y drenaje',
      'Conducción de fluidos industriales'
    ],
    benefits: [
      'Uniones por fusión de alta fiabilidad',
      'Resistencia química y larga vida útil',
      'Especificación por diseño hidráulico',
      'Documentación técnica en cotización'
    ],
    image: '/images/tuberias-hdpe.jpg',
    gallery: ['/images/tuberias-hdpe.jpg'],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 8) PROTECCIÓN Y SEGURIDAD INDUSTRIAL
  // ===========================================================================
  {
    id: '2',
    slug: 'biombos-protectores-soldadura',
    name: 'Biombos Protectores para Talleres de Soldadura',
    category: 'Protección y Seguridad Industrial',
    sector: ['Industrial', 'Construcción', 'Minería'],
    shortDescription: 'Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.',
    description: 'Biombos protectores fabricados con lona de fibra de vidrio recubierta de silicona o PVC ignífugo de alta calidad. Diseñados para crear zonas seguras en talleres de soldadura, astilleros, construcción y mantenimiento industrial. Disponibles en versiones portátiles con estructura metálica plegable o fijos para instalación permanente. Cumplen con normativas de seguridad industrial peruana e internacional.',
    specifications: [
      { label: 'Material', value: 'Lona de fibra de vidrio con recubrimiento de silicona/PVC ignífugo' },
      { label: 'Resistencia al fuego', value: 'Material autoextinguible / retardante de llama; ficha técnica del material en cotización' },
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
    image: '/images/galeria/biombos-protectores-soldadura-general.jpg',
    gallery: [
      '/images/galeria/biombos-protectores-soldadura-general.jpg',
      '/images/galeria/biombos-protectores-soldadura-detalle.jpg',
      '/images/galeria/biombos-protectores-soldadura-instalacion.jpg',
      '/images/galeria/biombos-protectores-soldadura-escala.jpg',
      '/images/biombos.jpg',
      '/images/biombos-proteccion.jpg',
    ],
    featured: true,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 9) ACCESORIOS Y COMPLEMENTOS
  // ===========================================================================
  {
    id: '32',
    slug: 'accesorios-instalacion',
    name: 'Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos)',
    category: 'Accesorios y Complementos',
    sector: ['Industrial', 'Transporte', 'Construcción', 'Agricultura'],
    shortDescription: 'Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.',
    description: 'Línea completa de accesorios y complementos para la instalación y el uso de lonas, mallas y coberturas: ojalillos metálicos, soga de sisal, driza y cabo, tensores, hebillas, ganchos, elásticos y tubos metálicos. Disponibilidad en stock para completar cualquier proyecto sin recurrir a múltiples proveedores.',
    specifications: [
      { label: 'Ojalillos', value: 'Metálicos, diversos diámetros, con herramienta de colocación' },
      { label: 'Cuerdas', value: 'Soga sisal, driza y cabo en distintos calibres' },
      { label: 'Tensión', value: 'Tensores, hebillas, ganchos y elásticos' },
      { label: 'Tubos', value: 'Tubos metálicos para armado y refuerzo' },
      { label: 'Disponibilidad', value: 'Stock — entrega ágil' }
    ],
    applications: [
      'Instalación y amarre de lonas y coberturas',
      'Montaje de mallas y estructuras temporales',
      'Reposición de herrajes y accesorios',
      'Kits de instalación para transporte y agro'
    ],
    benefits: [
      'Todo el complemento en un solo pedido',
      'Compatibles con nuestras lonas y mallas',
      'Disponibilidad en stock',
      'Asesoría para el kit correcto por aplicación'
    ],
    image: '/images/galeria/accesorios-instalacion-general.jpg',
    gallery: [
      '/images/galeria/accesorios-instalacion-general.jpg',
      '/images/galeria/accesorios-instalacion-detalle.jpg',
      '/images/galeria/accesorios-instalacion-instalacion.jpg',
      '/images/galeria/accesorios-instalacion-escala.jpg',
      '/images/accesorios.jpg',
      '/images/ojalillo-rafia.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'stock'
  },

  // ===========================================================================
  // 10) PUBLICIDAD Y COMUNICACIÓN VISUAL
  // ===========================================================================
  {
    id: '33',
    slug: 'gigantografias-senaletica',
    name: 'Gigantografías, Letreros y Señalética',
    category: 'Publicidad y Comunicación Visual',
    sector: ['Comercio', 'Publicidad', 'Industrial'],
    shortDescription: 'Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.',
    description: 'Impresión de gran formato sobre lona frontlit/backlit y otros sustratos para gigantografías, letreros, paneles, banners y señalética. Producción con acabados de instalación (ojalillos, refuerzos, bastidores) para exterior e interior. Solución de comunicación visual que aprovecha nuestra capacidad textil y de confección.',
    specifications: [
      { label: 'Sustratos', value: 'Lona frontlit/backlit, mesh, vinil (según pieza)' },
      { label: 'Formato', value: 'Gran formato, medida a requerimiento' },
      { label: 'Acabados', value: 'Ojalillos, refuerzos, bastidor, termosellado' },
      { label: 'Uso', value: 'Exterior e interior' },
      { label: 'Personalización', value: 'Diseño e impresión a todo color' }
    ],
    applications: [
      'Gigantografías y fachadas comerciales',
      'Letreros, paneles y señalética',
      'Banners para campañas y eventos',
      'Comunicación visual industrial y de obra'
    ],
    benefits: [
      'Impresión de gran formato con acabados de instalación',
      'Aprovecha nuestra confección textil',
      'Piezas listas para instalar',
      'Un proveedor para lona técnica y publicidad'
    ],
    image: '/images/galeria/gigantografias-senaletica-general.jpg',
    gallery: [
      '/images/galeria/gigantografias-senaletica-general.jpg',
      '/images/galeria/gigantografias-senaletica-detalle.jpg',
      '/images/galeria/gigantografias-senaletica-instalacion.jpg',
      '/images/galeria/gigantografias-senaletica-escala.jpg',
      '/images/gigantografias.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },
  {
    id: '34',
    slug: 'revestimiento-vehicular-toldos-publicitarios',
    name: 'Revestimiento Vehicular y Toldos Publicitarios',
    category: 'Publicidad y Comunicación Visual',
    sector: ['Comercio', 'Publicidad', 'Transporte'],
    shortDescription: 'Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.',
    description: 'Revestimiento (vehicle wrapping) de flotas y vehículos, toldos publicitarios y kioscos de marca para activación comercial. Diseño, impresión e instalación con materiales para intemperie. Complementa el rotulado de flota de nuestra línea de siders y tolderas.',
    specifications: [
      { label: 'Vehicular', value: 'Vinil de wrapping para intemperie, laminado de protección' },
      { label: 'Toldos publicitarios', value: 'Lona impresa con estructura y herrajes' },
      { label: 'Kioscos', value: 'Módulos de marca personalizados' },
      { label: 'Servicio', value: 'Diseño + impresión + instalación' },
      { label: 'Uso', value: 'Activación de marca y punto de venta' }
    ],
    applications: [
      'Rotulado y wrapping de flotas y vehículos',
      'Toldos publicitarios para comercios',
      'Kioscos y mobiliario de marca',
      'Activaciones y campañas comerciales'
    ],
    benefits: [
      'Imagen de marca consistente en flota y punto de venta',
      'Materiales aptos para intemperie',
      'Servicio integral diseño-impresión-instalación',
      'Sinergia con rotulado de siders/tolderas'
    ],
    image: '/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg',
    gallery: [
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion.jpg',
      '/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala.jpg',
      '/images/revestimiento-vehicular.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'a_medida'
  },

  // ===========================================================================
  // 11) ESPECIALIDADES
  // ===========================================================================
  {
    id: '10',
    slug: 'mulch-madera-picada',
    name: 'Mulch de Madera Picada',
    category: 'Especialidades',
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
    image: '/images/galeria/mulch-madera-picada-general.jpg',
    gallery: [
      '/images/galeria/mulch-madera-picada-general.jpg',
      '/images/galeria/mulch-madera-picada-detalle.jpg',
      '/images/galeria/mulch-madera-picada-instalacion.jpg',
      '/images/galeria/mulch-madera-picada-escala.jpg',
      '/images/mulch.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'stock',
    // PRECIO PENDIENTE DE VERIFICACIÓN — producto en modo cotización hasta fijar el precio de lista real.
    // Reactivar compra en línea: descomentar price + priceUnit y restaurar `purchasable: true`.
    // price: 25.0,
    // priceUnit: 'saco 50L',
    // purchasable: true,
  },

  // ===========================================================================
  // 35) GEOCOMPUESTOS DE DRENAJE  (Geosintéticos e Impermeabilización)
  // ===========================================================================
  {
    id: '35',
    slug: 'geocompuestos-drenaje',
    name: 'Geocompuestos de Drenaje',
    category: 'Geosintéticos e Impermeabilización',
    sector: ['Minería', 'Construcción', 'Infraestructura', 'Saneamiento'],
    shortDescription: 'Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.',
    description: 'Geocompuesto de drenaje formado por un núcleo drenante (geored / geonet) termounido a uno o dos geotextiles no tejidos que actúan como filtro. Reemplaza capas de grava en sistemas de drenaje, reduciendo espesores, peso y tiempos de obra. Se selecciona por capacidad de flujo, resistencia a la compresión y compatibilidad química según el proyecto. Línea de importación directa, suministrada por proyecto; ficha técnica y certificado de lote del fabricante se entregan en la cotización.',
    specifications: [
      { label: 'Estructura', value: 'Núcleo drenante (geored) + geotextil no tejido en una o ambas caras' },
      { label: 'Función', value: 'Captación, filtración y conducción de fluidos' },
      { label: 'Capacidad de flujo', value: 'Según gradiente y confinamiento (a confirmar por proyecto)' },
      { label: 'Aplicación típica', value: 'Muros, rellenos sanitarios, taludes, pilas de lixiviación, cubiertas verdes' },
      { label: 'Documentación', value: 'Ficha técnica y certificado de lote en cotización' },
      { label: 'Disponibilidad', value: 'Importación directa — por proyecto' }
    ],
    applications: [
      'Drenaje detrás de muros de contención y estructuras enterradas',
      'Sistemas de drenaje en rellenos sanitarios y celdas de residuos',
      'Drenaje de taludes, terraplenes y obras viales',
      'Captación en pilas de lixiviación y plataformas mineras',
      'Cubiertas verdes y jardineras sobre losa'
    ],
    benefits: [
      'Sustituye capas de grava: menos espesor, peso y excavación',
      'Instalación más rápida y limpia que el drenaje granular',
      'Complemento directo de geomembranas y geotextiles del catálogo',
      'Sistema de drenaje integrado de un solo proveedor',
      'Documentación técnica del fabricante en cotización'
    ],
    image: '/images/galeria/geocompuestos-drenaje-general.jpg',
    gallery: [
      '/images/galeria/geocompuestos-drenaje-general.jpg',
      '/images/galeria/geocompuestos-drenaje-detalle.jpg',
      '/images/galeria/geocompuestos-drenaje-instalacion.jpg',
      '/images/galeria/geocompuestos-drenaje-escala.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'importacion_directa',
    availability: 'bajo_pedido',
    leadTime: 'Por proyecto — según especificación',
    documentation: 'Ficha técnica y certificado de lote del fabricante a solicitud, en cotización.'
  },

  // ===========================================================================
  // 36) BARRERAS ACÚSTICAS  (Protección y Seguridad Industrial)
  // ===========================================================================
  {
    id: '36',
    slug: 'barreras-acusticas',
    name: 'Barreras Acústicas / Cortinas Antirruido',
    category: 'Protección y Seguridad Industrial',
    sector: ['Construcción', 'Industrial', 'Minería', 'Infraestructura'],
    shortDescription: 'Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.',
    description: 'Barreras acústicas flexibles (cortinas y mantas antirruido) para reducir la propagación de ruido en frentes de obra, plantas industriales, generadores y equipos. Se confeccionan a medida en composición mono o multicapa —lámina másica insonorizante con capa absorbente— y se montan sobre cercos, andamios o estructuras existentes. Solución a medida; la atenuación referencial y la composición se definen por aplicación, y la documentación técnica se entrega en la cotización.',
    specifications: [
      { label: 'Configuración', value: 'Cortina / manta flexible, mono o multicapa (a medida)' },
      { label: 'Función', value: 'Atenuación y absorción de ruido en la fuente o el perímetro' },
      { label: 'Montaje', value: 'Sobre cerco de obra, andamio, malla o estructura metálica' },
      { label: 'Acabados', value: 'Ojalillos, refuerzos perimetrales y cierres según montaje' },
      { label: 'Atenuación referencial', value: 'Según composición y aplicación (a confirmar por proyecto)' },
      { label: 'Documentación', value: 'Ficha técnica del material a solicitud, en cotización' }
    ],
    applications: [
      'Cerramiento acústico de frentes de obra en zonas urbanas',
      'Encierro de generadores, compresores y equipos ruidosos',
      'Perímetros de plantas industriales y canteras',
      'Barreras temporales para cumplimiento de límites de ruido',
      'Separación acústica en talleres y naves'
    ],
    benefits: [
      'Reduce el ruido percibido en vecindario y personal de obra',
      'Apoya el cumplimiento de normativa ambiental y de seguridad',
      'Confección a medida y reposicionable entre frentes de trabajo',
      'Se integra con biombos y protecciones de obra del catálogo',
      'Documentación técnica del material en cotización'
    ],
    image: '/images/galeria/barreras-acusticas-general.jpg',
    gallery: [
      '/images/galeria/barreras-acusticas-general.jpg',
      '/images/galeria/barreras-acusticas-detalle.jpg',
      '/images/galeria/barreras-acusticas-instalacion.jpg',
      '/images/galeria/barreras-acusticas-escala.jpg',
    ],
    featured: false,
    popular: false,
    sourcing: 'fabricacion_propia',
    availability: 'bajo_pedido',
    leadTime: 'A medida — según proyecto',
    documentation: 'Ficha técnica del material a solicitud, en cotización.'
  }
];

// -----------------------------------------------------------------------------
// FAMILIAS (eje 1: por tipo de producto). Orden = orden en mega menú.
// `name` debe coincidir exactamente con `Product.category`.
// -----------------------------------------------------------------------------
export const productFamilies: ProductFamily[] = [
  { name: 'Envases y Embalaje', slug: 'envases-embalaje', tagline: 'Big Bags, sacos, bolsas y films' },
  { name: 'Lonas y Cobertores', slug: 'lonas-cobertores', tagline: 'Confección textil 100% a medida' },
  { name: 'Estructuras y Arquitectura Textil', slug: 'estructuras-arquitectura-textil', tagline: 'Carpas, tensadas, módulos e invernaderos' },
  { name: 'Mallas y Coberturas Agrícolas', slug: 'mallas-agricolas', tagline: 'Antiáfidas, Raschel y protección de cultivo' },
  { name: 'Ventilación Industrial', slug: 'ventilacion-industrial', tagline: 'Mangas para minas y túneles' },
  { name: 'Geosintéticos e Impermeabilización', slug: 'geosinteticos', tagline: 'Geomembranas, geotextiles y geomallas' },
  { name: 'Soluciones Ambientales y Fluidos', slug: 'ambientales-fluidos', tagline: 'Tanques, biodigestores y tuberías HDPE' },
  { name: 'Protección y Seguridad Industrial', slug: 'seguridad-industrial', tagline: 'Biombos y protección de taller' },
  { name: 'Accesorios y Complementos', slug: 'accesorios', tagline: 'Ojalillos, sogas, tensores y tubos' },
  { name: 'Publicidad y Comunicación Visual', slug: 'publicidad', tagline: 'Gigantografías y rotulado de flota' },
  { name: 'Especialidades', slug: 'especialidades', tagline: 'Mulch y valor agregado' }
];

// Compat: lista de categorías (usada por filtros y navegación).
export const categories = productFamilies.map(f => f.name);

// -----------------------------------------------------------------------------
// SECTORES (eje 2: por aplicación / industria).
// -----------------------------------------------------------------------------
export const sectors = [
  'Minería',
  'Agricultura',
  'Construcción',
  'Transporte',
  'Industrial',
  'Logística',
  'Saneamiento',
  'Infraestructura',
  'Energía',
  'Comercio',
  'Publicidad',
  'Paisajismo'
];

// -----------------------------------------------------------------------------
// Etiquetas legibles para los estados de oferta (para badges en la UI).
// -----------------------------------------------------------------------------
export const sourcingLabels: Record<string, string> = {
  fabricacion_propia: 'Fabricación propia',
  importacion_directa: 'Importación directa',
  bajo_pedido: 'Suministro especializado',
  partner: 'Aliado técnico'
};

export const availabilityLabels: Record<string, string> = {
  stock: 'Stock disponible',
  a_medida: 'Fabricación a medida',
  bajo_pedido: 'Suministro a proyecto'
};
