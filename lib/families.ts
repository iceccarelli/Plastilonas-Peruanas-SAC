import { productFamilies } from './products';

/**
 * CONTENIDO EDITORIAL POR FAMILIA (/productos/familia/[slug]).
 *
 * Por qué existe esta capa: hasta ahora la navegación por familia se resolvía
 * con `?categoria=` sobre el catálogo filtrado en cliente. Eso funciona para el
 * usuario pero deja UNA sola URL indexable para once mercados distintos: quien
 * busca "geomembranas Perú" y quien busca "big bags minería" aterrizan en la
 * misma página genérica. Cada familia necesita su propia URL estática con
 * contenido propio, schema propio y enlazado propio.
 *
 * REGLA DE HONESTIDAD: el texto describe criterios técnicos de especificación y
 * cómo abastecemos cada línea (dato que ya vive en `sourcing`/`availability`).
 * No declara certificaciones, proyectos, capacidades de planta ni volúmenes que
 * el catálogo no respalde.
 */

export interface FamilyContent {
  /** Debe coincidir con ProductFamily.slug de lib/products.ts. */
  slug: string;
  /** H1 de la página de familia, con intención de búsqueda. */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  /** Qué define realmente la especificación en esta familia. */
  selectionCriteria: { titulo: string; detalle: string }[];
  faqs: { q: string; a: string }[];
}

export const familyContent: FamilyContent[] = [
  {
    slug: 'envases-embalaje',
    h1: 'Envases y embalaje industrial a medida en el Perú',
    metaTitle: 'Envases y embalaje industrial: big bags, sacos y films | Perú',
    metaDescription:
      'Big Bags FIBC, sacos polytarp, bolsas y láminas de polietileno y films termocontraíbles fabricados a medida para minería, agroexportación y logística en el Perú.',
    intro: [
      'El envase industrial es el último eslabón entre su producto terminado y el cliente, y el primero que falla cuando se especifica por precio unitario. Un bolsón que se rompe en cancha, un film que no unitiza la paleta o un saco que no resiste la estiba convierten un ahorro de céntimos por unidad en pérdida de producto, parada de despacho e incidente de seguridad.',
      'Esta familia cubre el envase de material a granel y la protección de carga paletizada. Todo se define por especificación: capacidad real según densidad aparente, configuración de boca y fondo, tratamientos y documentación exigida por el destino.',
    ],
    selectionCriteria: [
      {
        titulo: 'Densidad aparente del material',
        detalle:
          'El envase se compra por peso pero se llena por volumen. Sin densidad aparente, el dimensionamiento sale mal en una de dos direcciones: se paga volumen que nunca se usa o se sobrellena por encima de la carga de trabajo segura.',
      },
      {
        titulo: 'Carga de trabajo segura y relación de seguridad',
        detalle:
          'En big bags, la relación 5:1 corresponde a un solo uso y 6:1 a uso múltiple con inspección documentada. Es un criterio de uso, no un grado de calidad del tejido.',
      },
      {
        titulo: 'Configuración de carga y descarga',
        detalle:
          'Boca abierta, con boquilla, con falda o con cierre; fondo plano o con descarga. Define la velocidad de llenado y vaciado en su operación, no la resistencia.',
      },
      {
        titulo: 'Exposición y tratamiento',
        detalle:
          'Anti-UV, impermeabilidad y antiestático según dónde se almacena y qué contiene. El polipropileno expuesto a la intemperie durante meses llega degradado a la operación sin que se note a simple vista.',
      },
      {
        titulo: 'Documentación exigida por el destino',
        detalle:
          'Terminales portuarios y clientes de exportación piden certificación de fabricación por lote. Ese requisito debe entrar en la cotización, no aparecer cuando el contenedor ya está en camino.',
      },
    ],
    faqs: [
      {
        q: '¿Fabrican big bags a medida en el Perú?',
        a: 'Sí. Los Big Bags y sacos de esta familia son de fabricación propia y se producen según la especificación del cliente: dimensiones, capacidad, configuración de boca y fondo, y tratamientos. Las bolsas, láminas y films de polietileno se abastecen por importación directa bajo nuestro control.',
      },
      {
        q: '¿Cuál es el pedido mínimo de envases industriales?',
        a: 'Depende del producto y de la configuración: un bolsón a medida con boca y fondo especiales tiene una cantidad mínima distinta a la de un film estándar. Se confirma en la cotización junto con el plazo, según especificación y ciudad de entrega.',
      },
      {
        q: '¿Pueden imprimir el logo de mi empresa en los big bags?',
        a: 'Sí, los Big Bags admiten personalización con logo y especificaciones del cliente. La cantidad de colores y la ubicación de la impresión se definen al cotizar, ya que afectan el proceso de fabricación.',
      },
    ],
  },
  {
    slug: 'lonas-cobertores',
    h1: 'Lonas, cobertores y mantas industriales confeccionadas a medida',
    metaTitle: 'Lonas y cobertores industriales a medida | Perú',
    metaDescription:
      'Lona plastificada, mantas y cobertores para camiones, siders, cobertores agrícolas y mantas aislantes, confeccionados a medida en el Perú con refuerzos y ojalillos según uso.',
    intro: [
      'La lona es el producto donde la confección pesa más que el material. Dos cobertores del mismo rollo se comportan de forma completamente distinta según el paso de costura, el refuerzo del perímetro, la distancia entre ojalillos y el tratamiento del borde: ahí es donde una lona dura tres temporadas o se rasga en la primera tormenta.',
      'Esta familia cubre desde el cobertor de camión que trabaja a 90 km/h con carga viva hasta la manta térmica de proceso industrial. Todo se confecciona a la medida real del elemento a cubrir, no a medidas de catálogo.',
    ],
    selectionCriteria: [
      {
        titulo: 'Gramaje y material según exposición',
        detalle:
          'El gramaje se elige por la combinación de radiación UV, abrasión y carga de viento del uso real. Sobredimensionar encarece y agrega peso que el operario no querrá manipular; subdimensionar acorta la vida útil a una temporada.',
      },
      {
        titulo: 'Refuerzo perimetral y densidad de ojalillos',
        detalle:
          'El perímetro es donde se concentra el esfuerzo. Un refuerzo continuo y una distancia de ojalillos adecuada a la carga de viento evitan el desgarro progresivo desde el punto de amarre.',
      },
      {
        titulo: 'Tipo de unión',
        detalle:
          'Costura, termosellado o alta frecuencia según estanqueidad requerida y esfuerzo mecánico. Una unión cosida filtra por la perforación de la aguja cuando la aplicación exige impermeabilidad total.',
      },
      {
        titulo: 'Sistema de amarre y manipulación',
        detalle:
          'Quién y cómo lo va a colocar determina el diseño: un cobertor que dos personas no pueden tender en cinco minutos termina mal colocado o directamente sin usar.',
      },
    ],
    faqs: [
      {
        q: '¿Hacen lonas y cobertores en medidas especiales?',
        a: 'Sí, es el modo estándar de trabajo en esta familia: la confección es propia y se ejecuta a la medida real del elemento a cubrir, con el refuerzo perimetral, la densidad de ojalillos y el sistema de amarre definidos según el uso.',
      },
      {
        q: '¿Qué información necesitan para cotizar una lona a medida?',
        a: 'Las dimensiones exactas del elemento a cubrir, el uso (transporte, obra, almacenamiento, agrícola), la exposición esperada al sol y al viento, si requiere impermeabilidad total, y el sistema de amarre disponible. Con eso se define material, gramaje y confección.',
      },
      {
        q: '¿Cuánto dura una lona industrial a la intemperie?',
        a: 'Depende del material, del gramaje, del tratamiento UV y sobre todo de la exposición real: la radiación de sierra sobre 3000 msnm degrada mucho más rápido que la garúa costera. Por eso la especificación parte de dónde va a trabajar la lona, no de un plazo genérico.',
      },
    ],
  },
  {
    slug: 'estructuras-arquitectura-textil',
    h1: 'Carpas, coberturas tensadas y arquitectura textil en el Perú',
    metaTitle: 'Carpas industriales y arquitectura textil a medida | Perú',
    metaDescription:
      'Carpas con estructura metálica, coberturas tensadas, módulos para campamento, galpones e invernaderos y toldos, diseñados, fabricados e instalados a medida en el Perú.',
    intro: [
      'Una cobertura textil es una estructura, no una lona grande. El textil trabaja a tracción y transmite las cargas de viento y de nieve a un sistema estructural que debe estar dimensionado para recibirlas: cuando falla una carpa industrial, casi nunca falla la tela, falla el anclaje o el cálculo de la carga que nadie hizo.',
      'Esta familia cubre desde el módulo de campamento minero hasta la cubierta tensada arquitectónica. Cada proyecto parte de la geometría, la ubicación y las cargas del sitio.',
    ],
    selectionCriteria: [
      {
        titulo: 'Cargas de viento del emplazamiento',
        detalle:
          'La zona, la altura sobre el terreno y la exposición definen la presión de diseño. Es el dato que gobierna la estructura y el que más se omite en un requerimiento inicial.',
      },
      {
        titulo: 'Sistema de anclaje disponible',
        detalle:
          'Anclar sobre losa existente, sobre terreno natural o con lastre son tres proyectos distintos. El anclaje define el sistema, no al revés.',
      },
      {
        titulo: 'Permanencia y desmontabilidad',
        detalle:
          'Una cobertura permanente y una que se monta y desmonta cada campaña se diseñan distinto en uniones, tratamiento y logística.',
      },
      {
        titulo: 'Uso interior',
        detalle:
          'Almacenamiento, taller, comedor, invernadero o albergue determinan requisitos de luz, ventilación, aislamiento y comportamiento frente al fuego.',
      },
    ],
    faqs: [
      {
        q: '¿Instalan las carpas y estructuras que fabrican?',
        a: 'Sí. Esta familia incluye fabricación e instalación: la cobertura textil y su sistema estructural se entregan montados, porque el desempeño depende tanto del textil como del anclaje y del tensado.',
      },
      {
        q: '¿Qué datos necesitan para cotizar una carpa industrial?',
        a: 'Superficie a cubrir y geometría, altura libre requerida, ubicación exacta (define cargas de viento), tipo de piso o terreno disponible para el anclaje, uso interior previsto, y si la estructura será permanente o desmontable.',
      },
      {
        q: '¿Sirven para campamentos mineros en altura?',
        a: 'Los módulos, albergues y carpas de esta familia se especifican según el emplazamiento. En altura, la radiación UV, la amplitud térmica y las cargas de viento son más exigentes y elevan los requisitos de material y de anclaje, lo que se refleja en el diseño y en la cotización.',
      },
    ],
  },
  {
    slug: 'mallas-agricolas',
    h1: 'Mallas agrícolas: antiáfidas, raschel y antipájaro para el agro peruano',
    metaTitle: 'Mallas agrícolas antiáfidas, raschel y antipájaro | Perú',
    metaDescription:
      'Mallas antiáfidas para control de plagas, malla raschel de sombra y mallas antipájaro y antigranizo para protección de cultivos en la costa, sierra y selva del Perú.',
    intro: [
      'En agroexportación la malla no es un insumo de ferretería: es una barrera sanitaria y un instrumento de manejo de radiación. La densidad de trama de una antiáfida determina qué insecto pasa y cuál no; el porcentaje de sombra de una raschel cambia la temperatura de hoja y, con ella, el comportamiento del cultivo.',
      'Esta familia se abastece por importación directa, lo que permite mantener densidades y porcentajes consistentes entre lotes: un cambio de trama entre campañas invalida la comparación agronómica del ciclo anterior.',
    ],
    selectionCriteria: [
      {
        titulo: 'Densidad de trama (mesh) según la plaga objetivo',
        detalle:
          'La malla antiáfida se elige por el tamaño del insecto que debe excluir. Una trama más cerrada excluye más, pero también reduce el intercambio de aire y eleva la temperatura interior.',
      },
      {
        titulo: 'Porcentaje de sombra',
        detalle:
          'Se define por cultivo, etapa fenológica y radiación de la zona. La misma malla que protege en Ica puede sombrear de más en un valle con menor radiación.',
      },
      {
        titulo: 'Resistencia UV y vida útil esperada',
        detalle:
          'El tratamiento UV determina cuántas campañas resiste antes de perder resistencia mecánica. En zonas de alta radiación es el factor dominante del costo por campaña.',
      },
      {
        titulo: 'Sistema de fijación y tensado',
        detalle:
          'La mayoría de las fallas ocurren en el punto de amarre, no en el paño. El refuerzo de borde y la separación de los puntos de fijación deben corresponder al viento de la zona.',
      },
    ],
    faqs: [
      {
        q: '¿Qué malla antiáfida necesito para mi cultivo?',
        a: 'Se define por la plaga que debe excluir, que determina la densidad de trama, y por el compromiso con la ventilación: a mayor cierre de trama, mayor exclusión pero menor intercambio de aire y mayor temperatura interior. La radiación de la zona y el cultivo terminan de definir la selección.',
      },
      {
        q: '¿Qué porcentaje de sombra debe tener la malla raschel?',
        a: 'Depende del cultivo, la etapa del ciclo y la radiación del valle. No hay un porcentaje universal: la misma malla puede ser adecuada en una zona de alta radiación e insuficiente o excesiva en otra.',
      },
      {
        q: '¿Venden mallas por rollo completo o cortadas a medida?',
        a: 'Ambas modalidades existen en esta familia según el producto: hay líneas en stock por rollo y líneas que se cortan y confeccionan a medida con refuerzo de borde. La disponibilidad exacta se confirma en la cotización.',
      },
    ],
  },
  {
    slug: 'ventilacion-industrial',
    h1: 'Mangas de ventilación para minería subterránea y túneles',
    metaTitle: 'Mangas de ventilación minera y de túneles a medida | Perú',
    metaDescription:
      'Mangas de ventilación impelente y aspirante para labores subterráneas y túneles, fabricadas a medida en el Perú según diámetro, tramo y sistema de unión.',
    intro: [
      'La manga es el último tramo del sistema de ventilación y el punto donde se pierde el aire que el proyecto ya pagó. El síntoma es siempre el mismo: el ventilador cumple su curva, el cálculo dice que hay caudal suficiente y la medición en el frente no llega.',
      'Se fabrican a medida porque el diámetro, la longitud de tramo, el sistema de unión y el refuerzo se derivan del cálculo de caudal y de las condiciones reales de la labor, no de un catálogo de medidas estándar.',
    ],
    selectionCriteria: [
      {
        titulo: 'Caudal requerido y diámetro',
        detalle:
          'La pérdida por fricción crece de forma muy pronunciada al reducir la sección. Aumentar el diámetro suele ser más barato que instalar un ventilador mayor, que además consume más energía cada hora de operación.',
      },
      {
        titulo: 'Sistema impelente o aspirante',
        detalle:
          'Soplar hacia el frente o extraer desde él exige mangas distintas: la aspirante trabaja a presión negativa y debe resistir el colapso.',
      },
      {
        titulo: 'Longitud de tramo y número de empalmes',
        detalle:
          'Cada empalme es un punto potencial de fuga. Menos uniones y mejor ejecutadas valen más que un material superior mal empalmado.',
      },
      {
        titulo: 'Abrasión y humedad de la labor',
        detalle:
          'El roce contra la caja perfora la manga y genera fugas progresivas que nadie registra. El refuerzo y el sistema de suspensión se eligen por esa realidad.',
      },
    ],
    faqs: [
      {
        q: '¿Cómo se calcula el diámetro de una manga de ventilación?',
        a: 'A partir del caudal requerido en el frente —determinado por personal, equipo diésel y dilución de gases de voladura, corregido por altitud— y de la pérdida de carga admisible en el tramo. El diámetro se elige antes de seleccionar el ventilador, no después.',
      },
      {
        q: '¿Fabrican mangas de ventilación a medida?',
        a: 'Sí, son de fabricación propia y se producen según diámetro, longitud de tramo, sistema de unión y condiciones de la labor. Las especificaciones exactas se definen en la cotización.',
      },
      {
        q: '¿Por qué llega menos aire al frente que el que entrega el ventilador?',
        a: 'Por pérdida de carga por fricción a lo largo de la manga, que depende fuertemente del diámetro, y por fugas de la instalación: uniones deficientes, perforaciones por roce, catenaria excesiva y empalmes improvisados. Por eso la auditoría válida mide caudal en el frente, no en la boca del ventilador.',
      },
    ],
  },
  {
    slug: 'geosinteticos',
    h1: 'Geosintéticos e impermeabilización: geomembranas, geotextiles y geomallas',
    metaTitle: 'Geomembranas HDPE y PVC, geotextiles y geomallas | Perú',
    metaDescription:
      'Geomembranas de PVC, HDPE, PE fortificado y bituminosas, geotextiles, geomallas y geocompuestos de drenaje para pozas, canales, rellenos y obras en el Perú.',
    intro: [
      'En impermeabilización, el material es la parte fácil. Una geomembrana bien especificada y mal instalada se comporta peor que una lámina más delgada bien instalada: las filtraciones aparecen en la soldadura, en las penetraciones y en la zanja de anclaje, casi nunca en el centro del panel.',
      'Esta familia cubre la barrera (geomembranas), la protección y separación (geotextiles), el refuerzo (geomallas) y el drenaje (geocompuestos). Las líneas técnicas se abastecen bajo pedido con ficha y certificado de lote del fabricante entregados en la cotización: no publicamos como propios números de certificado que no podemos respaldar.',
    ],
    selectionCriteria: [
      {
        titulo: 'Qué contiene y con qué agresividad',
        detalle:
          'Agua, solución de proceso o lixiviado no exigen la misma barrera. La compatibilidad química con el líquido contenido precede a cualquier decisión de espesor.',
      },
      {
        titulo: 'Carga hidráulica y geometría de taludes',
        detalle:
          'La altura de columna y la pendiente definen el esfuerzo sobre la lámina y sobre su anclaje, y determinan si hace falta protección adicional.',
      },
      {
        titulo: 'Calidad de la subrasante',
        detalle:
          'Una superficie con material anguloso perfora la lámina desde abajo cuando el líquido la presiona contra el terreno. Si el terreno no cumple, la respuesta correcta es geotextil de protección o corregirlo, no "desplegar con cuidado".',
      },
      {
        titulo: 'Plan de ensayos de costura',
        detalle:
          'Toda costura debe ensayarse: presión de aire en el canal central de la soldadura por cuña doble, caja de vacío en las soldaduras por extrusión. Una costura sin registro de ensayo es una costura no ejecutada.',
      },
      {
        titulo: 'Exposición y vida útil requerida',
        detalle:
          'Una lámina expuesta y una enterrada envejecen de forma distinta. La vida útil requerida cambia el material antes que el espesor.',
      },
    ],
    faqs: [
      {
        q: '¿Qué geomembrana conviene para una poza: PVC o HDPE?',
        a: 'Depende del líquido contenido y su agresividad química, de la geometría y pendiente de los taludes, de la carga hidráulica, de si la lámina quedará expuesta o enterrada y de la vida útil requerida. Son criterios de proyecto: no existe una respuesta de catálogo válida para todos los casos.',
      },
      {
        q: '¿Instalan las geomembranas o solo venden el material?',
        a: 'Ofrecemos fabricación e instalación. En impermeabilización, el desempeño depende críticamente de la ejecución —recepción de subrasante, zanja de anclaje, soldadura y ensayos—, por lo que el suministro sin instalación traslada ese riesgo al cliente.',
      },
      {
        q: '¿Entregan ficha técnica y certificado del material?',
        a: 'Sí. Las líneas de geosintéticos se manejan bajo pedido y la ficha técnica junto con el certificado de lote del fabricante se entregan en la cotización. No publicamos como propios números de certificado que no podamos respaldar con documento.',
      },
    ],
  },
  {
    slug: 'ambientales-fluidos',
    h1: 'Soluciones ambientales y manejo de fluidos: tanques flexibles, biodigestores y tuberías HDPE',
    metaTitle: 'Tanques flexibles, biodigestores y tuberías HDPE | Perú',
    metaDescription:
      'Tanques flexibles y bladders para almacenamiento de agua y combustible, biodigestores y tuberías HDPE para saneamiento, agricultura y operaciones mineras en el Perú.',
    intro: [
      'Almacenar y conducir fluidos en operaciones remotas plantea un problema distinto al de la obra urbana: la solución tiene que llegar en camión, montarse sin grúa y funcionar sin mantenimiento especializado durante toda la campaña.',
      'Esta familia se abastece por importación directa y mediante aliados técnicos especializados, en modalidad bajo pedido. Se declara así de forma explícita: preferimos decir cómo abastecemos cada línea antes que presentar todo como fabricación propia.',
    ],
    selectionCriteria: [
      {
        titulo: 'Fluido contenido',
        detalle:
          'Agua de consumo, agua de proceso, combustible o efluente exigen compatibilidad de material distinta y, en algunos casos, documentación específica.',
      },
      {
        titulo: 'Volumen y logística de traslado',
        detalle:
          'El volumen útil se define junto con cómo llega el equipo al emplazamiento. Un tanque que no entra al acceso disponible no es una solución.',
      },
      {
        titulo: 'Terreno y preparación de base',
        detalle:
          'Los tanques flexibles requieren una base preparada y libre de elementos punzantes: es el equivalente a la subrasante en impermeabilización.',
      },
      {
        titulo: 'Presión y diámetro en conducción',
        detalle:
          'En tuberías HDPE, la clase de presión y el diámetro se derivan del caudal y del perfil hidráulico, no de la disponibilidad de stock.',
      },
    ],
    faqs: [
      {
        q: '¿Los tanques flexibles sirven para agua potable?',
        a: 'Depende del material y de la documentación de la línea específica. Es exactamente el tipo de requisito que debe declararse al cotizar, porque determina qué producto se ofrece y qué documentación acompaña la entrega.',
      },
      {
        q: '¿Cómo se abastecen estos productos?',
        a: 'Esta familia se maneja por importación directa y mediante aliados técnicos especializados, en modalidad bajo pedido: se confirma disponibilidad, plazo y documentación al cotizar. Lo declaramos de forma explícita en cada ficha.',
      },
      {
        q: '¿Qué se necesita para instalar un tanque flexible?',
        a: 'Una base preparada, nivelada y libre de elementos punzantes, con el área suficiente para el volumen desplegado, más los accesos de llenado y descarga previstos. La preparación de la base es determinante para la vida útil del equipo.',
      },
    ],
  },
  {
    slug: 'seguridad-industrial',
    h1: 'Protección y seguridad industrial: biombos de soldadura y barreras acústicas',
    metaTitle: 'Biombos de soldadura y barreras acústicas industriales | Perú',
    metaDescription:
      'Biombos y cortinas de protección para soldadura y barreras acústicas para obra e industria, fabricados a medida en el Perú según el espacio y el riesgo a controlar.',
    intro: [
      'Los elementos de protección colectiva se especifican por el riesgo que controlan, no por su apariencia. Un biombo de soldadura existe para que la radiación del arco no alcance a quien pasa al lado; una barrera acústica, para que el nivel de presión sonora baje del otro lado de la línea de propiedad.',
      'Se fabrican a medida porque el espacio que deben proteger y la fuente que deben contener son siempre particulares.',
    ],
    selectionCriteria: [
      {
        titulo: 'Riesgo a controlar',
        detalle:
          'Radiación de arco, proyección de partículas, ruido o combinación. Determina material, opacidad y densidad superficial.',
      },
      {
        titulo: 'Geometría del espacio',
        detalle:
          'Altura libre, longitud a cubrir y espacio de circulación definen módulos, apertura y si la solución es fija o móvil.',
      },
      {
        titulo: 'Frecuencia de movimiento',
        detalle:
          'Una protección que se mueve varias veces por turno se diseña distinto que una instalación permanente, en peso, ruedas y sistema de unión.',
      },
    ],
    faqs: [
      {
        q: '¿Fabrican biombos de protección a medida?',
        a: 'Sí, es fabricación propia y se ejecuta a la medida del espacio y del riesgo a controlar: altura, longitud, modulación y sistema de soporte se definen en el requerimiento.',
      },
      {
        q: '¿Qué información necesitan para cotizar una barrera acústica?',
        a: 'La fuente de ruido y su ubicación, la longitud y altura a cubrir, el objetivo de atenuación buscado y las condiciones del emplazamiento (viento, anclaje disponible, permanencia).',
      },
      {
        q: '¿Las cortinas de soldadura cumplen alguna norma?',
        a: 'Los requisitos aplicables dependen de la norma que exija su operación o su cliente. Le indicamos qué documentación puede entregar el fabricante de cada material en la cotización, sin atribuirnos certificaciones que no podamos respaldar.',
      },
    ],
  },
  {
    slug: 'accesorios',
    h1: 'Accesorios y complementos para instalación de lonas y coberturas',
    metaTitle: 'Accesorios de instalación: ojalillos, sogas y tensores | Perú',
    metaDescription:
      'Ojalillos, sogas, tensores, tubos y accesorios de instalación para lonas, cobertores, mallas y estructuras textiles. Disponibles en stock en el Perú.',
    intro: [
      'La mayoría de las fallas de una cobertura ocurren en el punto de amarre, no en el paño. Un cobertor de alto gramaje amarrado con soga inadecuada o con ojalillos demasiado separados se rasga desde el borde en la primera carga de viento seria.',
      'Esta familia existe para cerrar esa brecha: los accesorios se manejan en stock por importación directa y acompañan a las líneas de lonas, mallas y estructuras.',
    ],
    selectionCriteria: [
      {
        titulo: 'Carga en el punto de amarre',
        detalle:
          'El accesorio debe estar por encima de la carga esperada en el punto, no del promedio del conjunto.',
      },
      {
        titulo: 'Compatibilidad con el material',
        detalle:
          'El herraje debe convivir con el textil sin producir abrasión ni corrosión en el punto de contacto.',
      },
      {
        titulo: 'Frecuencia de montaje y desmontaje',
        detalle:
          'Un sistema que se abre a diario exige un accesorio distinto al de una instalación permanente.',
      },
    ],
    faqs: [
      {
        q: '¿Venden accesorios por separado, sin la lona?',
        a: 'Sí. Los accesorios de instalación se manejan en stock y pueden adquirirse de forma independiente, aunque lo habitual es especificarlos junto con la cobertura para que la carga del punto de amarre sea coherente con el paño.',
      },
      {
        q: '¿Cada cuánto deben ir los ojalillos en una lona?',
        a: 'La separación se define por la carga de viento esperada y por el gramaje del material: a mayor exposición, menor separación y mayor refuerzo perimetral. Es parte de la especificación de confección, no un valor fijo.',
      },
      {
        q: '¿Tienen stock disponible de accesorios?',
        a: 'Esta línea se maneja como stock por importación directa. La disponibilidad puntual por cantidad y medida se confirma al cotizar.',
      },
    ],
  },
  {
    slug: 'publicidad',
    h1: 'Publicidad y comunicación visual: gigantografías y rotulado de flota',
    metaTitle: 'Gigantografías, señalética y rotulado vehicular | Perú',
    metaDescription:
      'Gigantografías, señalética y revestimiento vehicular con toldos publicitarios impresos, fabricados a medida en el Perú para comercio, industria y flotas de transporte.',
    intro: [
      'Una gigantografía a la intemperie y una gráfica de flota son problemas de material antes que de diseño: el sustrato debe resistir radiación, lluvia y velocidad sin que la tinta se degrade ni el borde se despegue.',
      'Esta familia es de fabricación propia y aprovecha la misma capacidad de confección de las lonas: refuerzo perimetral, ojalillos y terminaciones pensadas para instalación real a la intemperie, no solo para la impresión.',
    ],
    selectionCriteria: [
      {
        titulo: 'Exposición e iluminación',
        detalle:
          'Interior, exterior o retroiluminado cambian el sustrato y la tinta antes que el diseño.',
      },
      {
        titulo: 'Sistema de montaje',
        detalle:
          'Tensado en bastidor, amarrado con ojalillos o adherido: define terminación, refuerzo y tolerancias de medida.',
      },
      {
        titulo: 'Vida útil esperada de la campaña',
        detalle:
          'Una campaña de tres meses y una señalética permanente no justifican el mismo material.',
      },
      {
        titulo: 'Superficie a rotular en flota',
        detalle:
          'La curvatura, el estado de la superficie y la velocidad de operación determinan el sistema y su durabilidad.',
      },
    ],
    faqs: [
      {
        q: '¿Imprimen gigantografías con refuerzo para exteriores?',
        a: 'Sí. Al ser fabricación propia con la misma capacidad de confección de lonas, las piezas para exterior se entregan con refuerzo perimetral, ojalillos y terminaciones aptas para instalación a la intemperie.',
      },
      {
        q: '¿Qué necesitan para cotizar el rotulado de una flota?',
        a: 'Modelo y cantidad de unidades, superficies a intervenir con sus medidas, el arte o su nivel de avance, si la aplicación es total o parcial, y la vida útil esperada de la campaña.',
      },
      {
        q: '¿Cuánto dura una gigantografía a la intemperie?',
        a: 'Depende del sustrato, del sistema de impresión y de la exposición real del emplazamiento. Se define junto con la duración prevista de la campaña, porque especificar para diez años una campaña de tres meses es dinero perdido.',
      },
    ],
  },
  {
    slug: 'especialidades',
    h1: 'Especialidades: mulch de madera picada para paisajismo y agricultura',
    metaTitle: 'Mulch de madera picada para agricultura y paisajismo | Perú',
    metaDescription:
      'Mulch de madera picada para cobertura de suelo en agricultura, paisajismo y obras: control de malezas, retención de humedad y regulación térmica del suelo.',
    intro: [
      'La cobertura de suelo cumple tres funciones simultáneas —reducir evaporación, controlar malezas y amortiguar la oscilación térmica del suelo— y su rendimiento depende del espesor aplicado y de la granulometría, no solo del volumen comprado.',
      'Esta línea es de fabricación propia y se maneja en stock, con entrega según volumen y ciudad de destino.',
    ],
    selectionCriteria: [
      {
        titulo: 'Espesor de aplicación',
        detalle:
          'Determina el control efectivo de malezas y la retención de humedad. Aplicar de menos es el error más frecuente y anula el beneficio.',
      },
      {
        titulo: 'Granulometría',
        detalle:
          'Define la permanencia frente a viento y riego, y el aspecto final en aplicaciones de paisajismo.',
      },
      {
        titulo: 'Volumen y logística',
        detalle:
          'El volumen se calcula por superficie y espesor objetivo; el flete suele pesar tanto como el producto en el costo total entregado.',
      },
    ],
    faqs: [
      {
        q: '¿Cuánto mulch necesito por metro cuadrado?',
        a: 'El volumen se obtiene multiplicando la superficie a cubrir por el espesor de aplicación objetivo. El espesor lo define la función buscada: controlar malezas exige más espesor que solo reducir evaporación.',
      },
      {
        q: '¿El mulch de madera sirve para paisajismo y para cultivo?',
        a: 'Sí, se usa en ambos: en cultivo prima la retención de humedad y el control de malezas; en paisajismo pesa además la granulometría por su permanencia y su aspecto final.',
      },
      {
        q: '¿Hacen entregas fuera de Lima?',
        a: 'Sí, con despacho nacional. En productos de volumen como el mulch conviene evaluar el flete desde el inicio, porque puede representar una parte importante del costo entregado.',
      },
    ],
  },
];

export const familyContentBySlug = (slug: string): FamilyContent | undefined =>
  familyContent.find((f) => f.slug === slug);

/** Familia (taxonomía) + su contenido editorial, resueltos juntos. */
export function resolveFamily(slug: string) {
  const family = productFamilies.find((f) => f.slug === slug);
  const content = familyContentBySlug(slug);
  return family && content ? { family, content } : null;
}

/** URL canónica de la página de familia. Reemplaza a `/productos?categoria=`. */
export function familyHrefByName(name: string): string {
  const family = productFamilies.find((f) => f.name === name);
  return family ? `/productos/familia/${family.slug}` : '/productos';
}
