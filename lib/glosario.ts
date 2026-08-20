import type { PillarId } from './framework';

/**
 * GLOSARIO TÉCNICO — la capa definicional.
 *
 * Qué es. Una URL canónica por CONCEPTO, no por producto. "Big bag tipo C" no
 * es una línea de catálogo: es un término del rubro que alguien necesita
 * entender antes de poder comprar nada.
 *
 * Por qué es la pieza que faltaba. El sitio ya responde "¿qué venden?"
 * (catálogo), "¿qué línea me sirve?" (familias), "¿cómo se especifica?"
 * (guías y marco), "¿cómo se arma el conjunto?" (arquitecturas) y "¿qué
 * cambió?" (novedades). No respondía la pregunta anterior a todas ellas:
 * "¿qué significa esta palabra?". Esa es la que un comprador escribe en un
 * buscador a las once de la noche, y la que un agente necesita resolver para
 * poder citar a alguien.
 *
 * Por qué esto es lo que hace citable a una referencia. Una enciclopedia no
 * domina por tener artículos largos: domina porque cada concepto tiene UNA
 * dirección estable a la que todos enlazan. `definicionCorta` existe
 * exactamente para eso — es una frase autosuficiente, sin promoción, que un
 * modelo puede copiar entera y atribuir. Una definición que necesita el
 * párrafo siguiente para entenderse no se cita nunca.
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir un término:
 *  1. La definición describe lo que el término significa EN EL RUBRO, no lo
 *     que vendemos. Debe ser igual de útil para quien compre a un competidor.
 *  2. Ninguna cifra normativa entra acá. Si un número lo respalda una norma,
 *     el término enlaza la guía que lo documenta con su fuente; el glosario
 *     define, no legisla.
 *  3. `comoSeMide` describe la magnitud y su unidad, nunca un valor de un
 *     producto concreto: un valor puesto en una definición se convierte en
 *     una especificación implícita que después nadie puede sostener.
 *  4. `relacionados`, `productos` y `guias` referencian slugs que existen
 *     (hay tests que lo verifican en las tres direcciones).
 *  5. Sin superlativos. "El mejor", "líder" y "único" no son definiciones.
 */

export type TerminoCategoria =
  | 'envases'
  | 'lonas'
  | 'geosinteticos'
  | 'ventilacion'
  | 'mallas'
  | 'estructuras'
  | 'transversal';

export const categoriaLabels: Record<TerminoCategoria, string> = {
  envases: 'Envases y embalaje',
  lonas: 'Lonas y cobertores',
  geosinteticos: 'Geosintéticos',
  ventilacion: 'Ventilación industrial',
  mallas: 'Mallas agrícolas',
  estructuras: 'Estructuras y arquitectura textil',
  transversal: 'Transversal',
};

export interface Termino {
  slug: string;
  /** El término canónico, tal como se dice en obra. */
  termino: string;
  /** Sigla o abreviatura de uso corriente. */
  siglas?: string;
  /** Otras formas de nombrarlo. Sirven para desambiguar y para buscar. */
  alias?: string[];
  categoria: TerminoCategoria;
  /**
   * UNA frase autosuficiente. Es la unidad citable: lo que un modelo copia y
   * atribuye. Si necesita contexto para entenderse, está mal escrita.
   */
  definicionCorta: string;
  /** Desarrollo, en párrafos. */
  definicion: string[];
  /** Qué magnitud lo expresa y en qué unidad. Nunca un valor de producto. */
  comoSeMide?: string;
  /** Qué decide en obra. La razón por la que el término importa. */
  porQueImporta: string;
  /** La confusión que este término resuelve. */
  errorFrecuente?: string;
  /** Slugs de otros términos del glosario. */
  relacionados: string[];
  /** Slugs de lib/products.ts donde el término es determinante. */
  productos?: string[];
  /** Slugs de lib/articles.ts que lo desarrollan con fuentes. */
  guias?: string[];
  /** Pilar del Marco de Especificación al que pertenece la decisión. */
  pilar?: PillarId;
}

const registro: Termino[] = [
  // --- Envases y embalaje ---------------------------------------------------
  {
    slug: 'big-bag-fibc',
    termino: 'Big bag',
    siglas: 'FIBC',
    alias: ['bolsón', 'saco de gran volumen', 'contenedor flexible intermedio'],
    categoria: 'envases',
    definicionCorta:
      'Contenedor flexible de gran volumen, tejido en polipropileno, diseñado para llenar, izar y transportar material a granel en una sola unidad de carga.',
    definicion: [
      'FIBC son las siglas de Flexible Intermediate Bulk Container: un envase intermedio entre el saco manual y el contenedor rígido. Se maneja con montacargas o grúa a través de sus asas, lo que convierte una carga a granel en una unidad manipulable.',
      'Sus variables de especificación no son el color ni el tamaño: son la capacidad de carga declarada, el factor de seguridad, el tipo de descarga electrostática, la configuración de bocas de carga y descarga, y si lleva forro interior.',
    ],
    comoSeMide:
      'Por capacidad de carga segura (kg), volumen útil (litros o m³) y dimensiones de cuerpo y asas (cm).',
    porQueImporta:
      'Es la unidad de carga sobre la que se dimensiona toda la operación: la estiba, el izaje, el almacenamiento y el despacho se planifican alrededor de sus dimensiones y su peso declarado.',
    errorFrecuente:
      'Especificarlo solo por volumen. Dos bolsones del mismo volumen pueden tener capacidades de carga muy distintas según el tejido y el diseño de asas.',
    relacionados: ['carga-de-trabajo-segura', 'factor-de-seguridad', 'tipo-electrostatico-fibc', 'liner-interior', 'denier'],
    productos: ['big-bags-bolsones-polipropileno', 'sacos-polytarp-embarque-granel'],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba'],
    pilar: 'cargas',
  },
  {
    slug: 'carga-de-trabajo-segura',
    termino: 'Carga de trabajo segura',
    siglas: 'SWL',
    alias: ['capacidad de carga', 'safe working load'],
    categoria: 'envases',
    definicionCorta:
      'Peso máximo que un envase o accesorio de izaje está diseñado para soportar en uso normal y repetido, declarado por el fabricante.',
    definicion: [
      'La carga de trabajo segura no es la carga a la que el envase se rompe: es la fracción de esa carga a la que puede trabajar de forma repetida sin degradarse. La relación entre ambas es el factor de seguridad.',
      'Es un dato del fabricante, no una estimación de campo. Un envase sin SWL declarada no tiene especificación de carga, aunque parezca robusto.',
    ],
    comoSeMide: 'En kilogramos, declarada en la etiqueta y en la ficha técnica del envase.',
    porQueImporta:
      'Es el límite que gobierna el llenado y el izaje. Superarla no produce un fallo gradual y visible: produce el desgarro de un asa con la carga suspendida.',
    errorFrecuente:
      'Confundir SWL con el volumen que cabe. Un bolsón puede admitir físicamente más material del que su SWL permite izar, y el material denso llega al límite de peso mucho antes que al de volumen.',
    relacionados: ['big-bag-fibc', 'factor-de-seguridad', 'densidad-aparente'],
    productos: ['big-bags-bolsones-polipropileno'],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba'],
    pilar: 'cargas',
  },
  {
    slug: 'factor-de-seguridad',
    termino: 'Factor de seguridad',
    alias: ['relación de seguridad', 'safety factor', 'SF'],
    categoria: 'envases',
    definicionCorta:
      'Relación entre la carga de rotura de un envase y su carga de trabajo segura, expresada como una proporción del tipo 5:1 o 6:1.',
    definicion: [
      'Un factor 5:1 significa que el envase se ensaya hasta cinco veces su carga de trabajo declarada. El factor no describe cuánto aguanta el bolsón: describe cuánto margen hay entre el uso previsto y el fallo.',
      'El factor exigido depende del uso: el transporte de un solo viaje y el uso repetido no se especifican igual, y el material peligroso tiene sus propios requisitos.',
    ],
    comoSeMide: 'Como una proporción adimensional (por ejemplo 5:1 o 6:1), declarada por el fabricante.',
    porQueImporta:
      'Es el término de la especificación que decide si un envase puede reutilizarse y bajo qué condiciones. Comprar por precio sin comparar factor de seguridad es comparar dos productos distintos.',
    errorFrecuente:
      'Suponer que el factor de seguridad cubre un izaje mal ejecutado. Izar con dos de las cuatro asas concentra la carga y anula el margen que el factor representa.',
    relacionados: ['carga-de-trabajo-segura', 'big-bag-fibc', 'certificado-de-lote'],
    productos: ['big-bags-bolsones-polipropileno'],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba'],
    pilar: 'cargas',
  },
  {
    slug: 'tipo-electrostatico-fibc',
    termino: 'Tipos electrostáticos de FIBC (A, B, C y D)',
    alias: ['tipo A', 'tipo B', 'tipo C', 'tipo D', 'clasificación antiestática'],
    categoria: 'envases',
    definicionCorta:
      'Clasificación de los big bags según cómo controlan la carga electrostática que genera el llenado y el vaciado de material a granel.',
    definicion: [
      'El movimiento de sólidos pulverulentos dentro de un envase textil genera electricidad estática. Los cuatro tipos se distinguen por el mecanismo con que la controlan: el tipo A no incorpora ninguno; el tipo B usa un tejido de baja tensión de ruptura que impide chispas incendiarias; el tipo C incorpora hilos conductores y requiere conexión a tierra durante la operación; el tipo D disipa la carga sin necesidad de conexión a tierra.',
      'La elección no depende del material que se envasa únicamente, sino de la atmósfera del lugar donde se llena y se vacía: la presencia de polvo combustible o de vapores inflamables cambia el tipo requerido.',
    ],
    porQueImporta:
      'Es el criterio que convierte un envase correcto en uno peligroso. Un tipo C sin conectar a tierra se comporta peor que un tipo A, porque acumula carga en los hilos conductores sin ruta de descarga.',
    errorFrecuente:
      'Pedir "antiestático" sin más. Los cuatro tipos responden a escenarios distintos y tres de ellos son inadecuados en cualquier escenario dado.',
    relacionados: ['big-bag-fibc', 'liner-interior', 'certificado-de-lote'],
    productos: ['big-bags-bolsones-polipropileno'],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'liner-interior',
    termino: 'Liner',
    alias: ['forro interior', 'bolsa interior'],
    categoria: 'envases',
    definicionCorta:
      'Bolsa de película plástica colocada dentro de un envase textil para aislar el contenido del tejido exterior.',
    definicion: [
      'El tejido de polipropileno es permeable: deja pasar humedad y polvo fino. El liner resuelve esa limitación aportando una barrera continua, y puede ir suelto, pegado por puntos o cosido al cuerpo del envase.',
      'También cumple la función inversa: retener producto fino que de otro modo se escaparía por la trama.',
    ],
    comoSeMide: 'Por material de la película y su espesor (micras), y por la forma de fijación al envase.',
    porQueImporta:
      'Decide si el contenido llega con la humedad y la granulometría con que salió. En concentrados y en productos higroscópicos es la diferencia entre un despacho conforme y uno rechazado.',
    errorFrecuente:
      'Elegir un liner suelto para un producto que se descarga por gravedad: puede colapsar sobre la boca y bloquear el vaciado.',
    relacionados: ['big-bag-fibc', 'tipo-electrostatico-fibc', 'densidad-aparente'],
    productos: ['big-bags-bolsones-polipropileno', 'bolsas-laminas-pebd-pead'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'densidad-aparente',
    termino: 'Densidad aparente',
    alias: ['densidad a granel', 'bulk density'],
    categoria: 'envases',
    definicionCorta:
      'Masa por unidad de volumen de un material a granel incluyendo los huecos entre partículas, no solo el volumen del sólido.',
    definicion: [
      'Es el dato que convierte volumen en peso. Dos materiales que ocupan el mismo espacio pueden diferir varias veces en masa según su granulometría y su grado de compactación.',
      'Cambia con el manejo: un material vertido y el mismo material asentado por vibración durante el transporte no tienen la misma densidad aparente.',
    ],
    comoSeMide: 'En kilogramos por metro cúbico (kg/m³) o toneladas por metro cúbico.',
    porQueImporta:
      'Es el dato que falta más veces cuando se pide una cotización de envase. Sin él no se puede decidir el tamaño del bolsón: se dimensiona por volumen y se descubre en el patio que el peso excede la carga de trabajo segura.',
    relacionados: ['carga-de-trabajo-segura', 'big-bag-fibc', 'liner-interior'],
    productos: ['big-bags-bolsones-polipropileno', 'sacos-polytarp-embarque-granel'],
    pilar: 'cargas',
  },
  // --- Lonas y cobertores ---------------------------------------------------
  {
    slug: 'gramaje',
    termino: 'Gramaje',
    alias: ['peso por metro cuadrado', 'densidad superficial'],
    categoria: 'lonas',
    definicionCorta:
      'Masa de un tejido o una lámina por unidad de superficie, que expresa cuánto material hay en cada metro cuadrado.',
    definicion: [
      'Es el primer indicador comparable entre lonas: a igualdad de construcción, más gramaje significa más material y, en general, más resistencia y más duración.',
      'No es un indicador universal de calidad. Una lona de gramaje alto con tejido pobre o sin estabilización ultravioleta dura menos a la intemperie que una más ligera bien construida.',
    ],
    comoSeMide: 'En gramos por metro cuadrado (g/m²).',
    porQueImporta:
      'Es el dato que permite comparar ofertas que de otro modo solo se distinguen por el precio. También determina el peso total de la cobertura, que condiciona el manejo y el anclaje.',
    errorFrecuente:
      'Comparar solo gramaje entre una lona plastificada y un tejido recubierto: son construcciones distintas y el mismo número no describe lo mismo.',
    relacionados: ['lona-plastificada', 'denier', 'estabilizacion-uv', 'resistencia-al-desgarro'],
    productos: ['lona-plastificada-rafia-polytarp', 'mantas-cobertores-toldos-camiones'],
    guias: ['cobertores-transporte-concentrado-mineral'],
    pilar: 'cargas',
  },
  {
    slug: 'lona-plastificada',
    termino: 'Lona plastificada',
    alias: ['lona vinílica', 'PVC recubierto', 'lona PVC'],
    categoria: 'lonas',
    definicionCorta:
      'Tejido de fibra sintética recubierto en ambas caras con una capa de material plástico que le da impermeabilidad y resistencia a la intemperie.',
    definicion: [
      'La estructura es de tres partes: un tejido base que aporta la resistencia mecánica, y dos recubrimientos que aportan la barrera. Las propiedades finales dependen de las tres, no de una.',
      'Se distingue de una lámina plástica simple en que el tejido base gobierna la resistencia al desgarro y a la tracción: sin él, un punzonamiento se propaga.',
    ],
    comoSeMide: 'Por gramaje total (g/m²), denier del tejido base y densidad de hilos por pulgada.',
    porQueImporta:
      'Es la familia sobre la que se especifica casi toda la protección de carga y de acopio. Elegir mal el recubrimiento produce fallos por agrietamiento a los pocos meses de exposición.',
    relacionados: ['gramaje', 'denier', 'estabilizacion-uv', 'termosellado', 'ojal'],
    productos: ['lona-plastificada-rafia-polytarp', 'siders-tolderas-camiones'],
    guias: ['cobertores-transporte-concentrado-mineral'],
    pilar: 'exposicion',
  },
  {
    slug: 'denier',
    termino: 'Denier',
    siglas: 'D',
    alias: ['título de hilo', 'decitex'],
    categoria: 'lonas',
    definicionCorta:
      'Unidad que expresa el grosor de un hilo por su masa en gramos cada 9.000 metros de longitud.',
    definicion: [
      'Un hilo de mayor denier es un hilo más grueso. En una lona técnica, el denier del tejido base y la cantidad de hilos por pulgada describen juntos la construcción: el gramaje total no basta para reconstruirla.',
      'Decitex es la misma idea sobre 10.000 metros; ambas unidades conviven en fichas técnicas del rubro.',
    ],
    comoSeMide: 'En denier (g/9.000 m), habitualmente acompañado de la densidad de trama en hilos por pulgada.',
    porQueImporta:
      'Junto con la densidad de hilos determina la resistencia al desgarro, que es el modo real de fallo de una lona en obra: no se rompe de golpe, se rasga desde un punto.',
    relacionados: ['gramaje', 'lona-plastificada', 'resistencia-al-desgarro'],
    productos: ['lona-plastificada-rafia-polytarp', 'mantas-cobertores-toldos-camiones'],
    pilar: 'cargas',
  },
  {
    slug: 'resistencia-al-desgarro',
    termino: 'Resistencia al desgarro',
    alias: ['resistencia al rasgado'],
    categoria: 'lonas',
    definicionCorta:
      'Fuerza necesaria para propagar un corte ya iniciado en un tejido, a diferencia de la fuerza necesaria para romperlo desde intacto.',
    definicion: [
      'Es la propiedad que gobierna la vida útil real de una cobertura. Una lona rara vez falla por tracción pura: falla porque un punto de roce, un ojal sobrecargado o un objeto punzante inician un corte que el viento propaga.',
      'Depende de la construcción del tejido base más que del recubrimiento.',
    ],
    comoSeMide: 'En newtons (N), por métodos de ensayo normalizados de rasgado.',
    porQueImporta:
      'Es lo que separa una lona que dura una temporada de una que dura varias en el mismo servicio. También decide cada cuánto hay que reponer, que es el costo que de verdad importa.',
    relacionados: ['denier', 'gramaje', 'ojal', 'lona-plastificada'],
    productos: ['lona-plastificada-rafia-polytarp', 'cobertores-agricolas-multimaterial'],
    pilar: 'operacion',
  },
  {
    slug: 'estabilizacion-uv',
    termino: 'Estabilización ultravioleta',
    siglas: 'UV',
    alias: ['tratamiento UV', 'aditivo UV', 'protección UV'],
    categoria: 'lonas',
    definicionCorta:
      'Incorporación de aditivos al material plástico para retrasar la degradación que produce la radiación solar sobre los polímeros.',
    definicion: [
      'La radiación ultravioleta rompe las cadenas del polímero: el material se vuelve quebradizo, pierde color y termina fracturándose ante esfuerzos que antes toleraba. Los estabilizadores absorben o neutralizan esa energía y retrasan el proceso.',
      'No lo detienen. Toda estabilización tiene una vida útil, y esa vida depende de la intensidad de radiación del emplazamiento.',
    ],
    porQueImporta:
      'En el Perú la variable no es opcional: la radiación solar en la sierra alta es sustancialmente mayor que a nivel del mar, y un material especificado para costa envejece antes en altura.',
    errorFrecuente:
      'Suponer que un material oscuro está protegido por su color. El pigmento influye, pero no sustituye a la estabilización, y un producto sin ella se degrada aunque no lo aparente al tacto.',
    relacionados: ['gramaje', 'lona-plastificada', 'geomembrana', 'altitud-y-radiacion'],
    productos: ['lona-plastificada-rafia-polytarp', 'malla-raschel-sombra', 'geomembranas-pvc'],
    pilar: 'exposicion',
  },
  {
    slug: 'termosellado',
    termino: 'Termosellado',
    alias: ['soldadura por alta frecuencia', 'unión térmica'],
    categoria: 'lonas',
    definicionCorta:
      'Unión de dos piezas de material termoplástico fundiendo sus superficies con calor y presión, sin hilo ni adhesivo.',
    definicion: [
      'La unión resultante es continua y del mismo material que las piezas, de modo que no introduce perforaciones ni un elemento distinto que envejezca a otro ritmo.',
      'La alternativa clásica es la costura, que perfora el material y depende del hilo: más reparable en campo, pero no estanca por sí misma.',
    ],
    porQueImporta:
      'Decide si una unión es una barrera o solo una sujeción. En cualquier aplicación donde el objetivo sea contener líquido o impedir el paso de finos, la costura no cumple sin sellado adicional.',
    relacionados: ['lona-plastificada', 'soldadura-por-cuna-caliente', 'ojal'],
    productos: ['lona-plastificada-rafia-polytarp', 'coberturas-tensionadas-arquitectura-textil'],
    pilar: 'ejecucion',
  },
  {
    slug: 'ojal',
    termino: 'Ojal',
    alias: ['ojalillo', 'grommet', 'anillo de amarre'],
    categoria: 'lonas',
    definicionCorta:
      'Refuerzo metálico o plástico instalado en el borde de una lona para transmitir el esfuerzo de amarre al tejido sin desgarrarlo.',
    definicion: [
      'El ojal no sujeta la lona: distribuye en un área la fuerza puntual que ejerce la cuerda o el gancho. Por eso su instalación exige un refuerzo local de material bajo el ojal.',
      'Su separación a lo largo del borde es tan determinante como su tipo: espaciados excesivos concentran carga en cada punto.',
    ],
    comoSeMide: 'Por diámetro interior (mm), material y separación entre ojales (cm).',
    porQueImporta:
      'Es el punto por donde falla la mayoría de las coberturas expuestas a viento. La lona sobrevive; el borde se desgarra desde un ojal.',
    errorFrecuente:
      'Pedir más ojales sin reforzar el borde. Multiplicar puntos de amarre sobre un borde débil solo multiplica los puntos por donde empezar a rasgar.',
    relacionados: ['resistencia-al-desgarro', 'lona-plastificada', 'carga-de-viento'],
    productos: ['lona-plastificada-rafia-polytarp', 'toldos-cerramientos'],
    pilar: 'ejecucion',
  },
  // --- Geosintéticos --------------------------------------------------------
  {
    slug: 'geosintetico',
    termino: 'Geosintético',
    alias: ['geosintéticos'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Material polimérico fabricado para instalarse en contacto con suelo o roca y cumplir una función de ingeniería definida: contener, separar, filtrar, drenar, proteger o reforzar.',
    definicion: [
      'La familia agrupa productos muy distintos entre sí — geomembranas, geotextiles, geomallas, geocompuestos — que comparten un rasgo: se especifican por la función que cumplen en la obra, no por su apariencia.',
      'Un mismo problema suele resolverse con dos o tres geosintéticos trabajando juntos. Comprar solo el que se ve —la geomembrana— y omitir el que la protege es el error más caro del rubro.',
    ],
    porQueImporta:
      'Nombrar la función antes que el producto es lo que ordena la especificación. "Necesito impermeabilizar" y "necesito una geomembrana de 1 mm" son dos conversaciones distintas, y solo la primera admite una solución correcta.',
    relacionados: ['geomembrana', 'geotextil', 'geomalla', 'subrasante'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'geotextiles', 'geomallas-geogrids', 'geocompuestos-drenaje'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales', 'como-elegir-geotextil-separacion-drenaje-refuerzo'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'geomembrana',
    termino: 'Geomembrana',
    alias: ['membrana impermeable', 'liner geosintético'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Lámina sintética de muy baja permeabilidad instalada como barrera para impedir el paso de líquidos o gases entre dos medios.',
    definicion: [
      'Su función es una sola: ser una barrera continua. Todo lo demás de su especificación —el polímero, el espesor, la textura de la superficie— existe para que esa continuidad sobreviva a la instalación y al servicio.',
      'La continuidad se pierde en tres lugares, no en la lámina: en las uniones, en las penetraciones y en el anclaje perimetral.',
    ],
    comoSeMide: 'Por polímero, espesor (mm o mils), textura de superficie y ancho de rollo.',
    porQueImporta:
      'Es el componente que da nombre a la obra y el que menos veces falla por sí mismo. Los incidentes se concentran en la ejecución, que es lo que rara vez se especifica al cotizar.',
    errorFrecuente:
      'Pedirla solo por espesor. Un espesor mayor sobre una subrasante mal preparada falla igual, y además es más difícil de acomodar en los detalles.',
    relacionados: ['hdpe', 'geotextil', 'soldadura-por-cuna-caliente', 'zanja-de-anclaje', 'subrasante', 'estabilizacion-uv'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'geomembranas-pvc', 'geomembrana-pe-fortificada', 'geomembrana-bituminosa'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'hdpe',
    termino: 'Polietileno de alta densidad',
    siglas: 'HDPE',
    alias: ['PEAD', 'polietileno alta densidad'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Polímero de cadena lineal y alta cristalinidad, usado en geomembranas y tuberías por su resistencia química y su baja permeabilidad.',
    definicion: [
      'Frente a otros polietilenos, el HDPE ofrece mayor rigidez y mejor resistencia química, y menor flexibilidad. Esa rigidez es una ventaja en el servicio y una dificultad en la instalación: acomoda peor los detalles y las esquinas.',
      'Es sensible a la dilatación térmica: una lámina instalada al mediodía y otra al amanecer no se comportan igual, y el arrugado por temperatura es un fenómeno normal que la instalación debe prever.',
    ],
    porQueImporta:
      'Determina qué se puede almacenar encima y cuánto durará. La resistencia química es la razón por la que se elige en pozas de proceso frente a alternativas más flexibles.',
    relacionados: ['geomembrana', 'soldadura-por-cuna-caliente', 'zanja-de-anclaje'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'tuberias-hdpe'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'geotextil',
    termino: 'Geotextil',
    alias: ['geotextil no tejido', 'geotextil tejido'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Tela permeable de fibras sintéticas que se instala en contacto con el suelo para separar capas, filtrar, drenar, proteger o reforzar.',
    definicion: [
      'Se fabrica en dos construcciones que no son intercambiables. El no tejido, de fibras entrelazadas por punzonado o por calor, destaca en filtración, drenaje y protección. El tejido, de hilos cruzados, destaca en resistencia a la tracción y por tanto en refuerzo y separación bajo carga.',
      'Pedir "geotextil" sin especificar función y construcción es el origen de buena parte de las sustituciones incorrectas en obra.',
    ],
    comoSeMide:
      'Por construcción, gramaje (g/m²), resistencia a la tracción, resistencia al punzonamiento y propiedades hidráulicas de abertura y permitividad.',
    porQueImporta:
      'Es el componente que protege a la geomembrana del punzonamiento y el que impide que dos capas de suelo se mezclen. Omitirlo suele descubrirse cuando ya no se puede corregir sin levantar la obra.',
    errorFrecuente:
      'Elegirlo solo por gramaje. Dos geotextiles del mismo gramaje y distinta construcción resuelven problemas distintos.',
    relacionados: ['geomembrana', 'no-tejido-punzonado', 'permitividad', 'resistencia-al-punzonamiento', 'geosintetico'],
    productos: ['geotextiles', 'geocompuestos-drenaje'],
    guias: ['como-elegir-geotextil-separacion-drenaje-refuerzo'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'no-tejido-punzonado',
    termino: 'No tejido punzonado por agujas',
    alias: ['needle punched', 'punzonado'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Proceso de fabricación que entrelaza mecánicamente las fibras de un velo con agujas de púas, sin tejerlas ni fundirlas.',
    definicion: [
      'El entrelazado mecánico produce una estructura de gran espesor y alta porosidad, con buena capacidad de deformación antes de romper. Esa deformabilidad es justamente lo que le permite absorber punzonamientos.',
      'La alternativa es el termosoldado, que une las fibras por calor y da un material más delgado y rígido, con menor espesor y distinto comportamiento hidráulico.',
    ],
    porQueImporta:
      'Explica por qué un geotextil de protección es grueso y esponjoso, y por qué sustituirlo por uno delgado del mismo gramaje deja la geomembrana desprotegida.',
    relacionados: ['geotextil', 'resistencia-al-punzonamiento', 'permitividad'],
    productos: ['geotextiles'],
    guias: ['como-elegir-geotextil-separacion-drenaje-refuerzo'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'resistencia-al-punzonamiento',
    termino: 'Resistencia al punzonamiento',
    alias: ['punzonamiento CBR', 'resistencia al punzado'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Fuerza que un geosintético soporta antes de ser perforado por un objeto que lo empuja perpendicularmente a su plano.',
    definicion: [
      'Reproduce en laboratorio lo que ocurre cuando una piedra angulosa de la subrasante, o una que cae durante el relleno, empuja contra la lámina.',
      'Es la propiedad que gobierna el dimensionamiento del geotextil de protección bajo una geomembrana.',
    ],
    comoSeMide: 'En newtons (N), por ensayos de punzonamiento normalizados.',
    porQueImporta:
      'Es la traducción numérica del riesgo más común en una obra de impermeabilización: la perforación durante la construcción, no durante el servicio.',
    relacionados: ['geotextil', 'geomembrana', 'no-tejido-punzonado', 'subrasante'],
    productos: ['geotextiles', 'geomembrana-polietileno-pe-hdpe'],
    guias: ['como-elegir-geotextil-separacion-drenaje-refuerzo', 'instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'ejecucion',
  },
  {
    slug: 'permitividad',
    termino: 'Permitividad',
    alias: ['permitividad hidráulica', 'flujo normal al plano'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Capacidad de un geotextil de dejar pasar agua perpendicularmente a su plano, por unidad de diferencia de presión y de tiempo.',
    definicion: [
      'Describe el flujo a través del material. Su contraparte es la transmisividad, que describe el flujo a lo largo del plano del material, es decir el drenaje dentro del propio geotextil.',
      'Ambas se degradan con la colmatación: el suelo fino que queda retenido reduce el paso de agua con el tiempo.',
    ],
    comoSeMide: 'En segundos elevados a menos uno (s⁻¹), por ensayos hidráulicos normalizados.',
    porQueImporta:
      'Es lo que decide si un geotextil filtra o si se convierte en una barrera. Un filtro que se colmata cambia el régimen hidráulico de la obra y puede generar presiones que nadie calculó.',
    relacionados: ['geotextil', 'no-tejido-punzonado', 'geosintetico'],
    productos: ['geotextiles', 'geocompuestos-drenaje'],
    guias: ['como-elegir-geotextil-separacion-drenaje-refuerzo'],
    pilar: 'operacion',
  },
  {
    slug: 'soldadura-por-cuna-caliente',
    termino: 'Soldadura por cuña caliente',
    alias: ['doble pista', 'dual track', 'termofusión'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Técnica de unión de geomembranas termoplásticas que funde dos láminas superpuestas con una cuña calefactada y las presiona con rodillos, dejando dos pistas de soldadura y un canal de aire entre ellas.',
    definicion: [
      'El canal de aire que queda entre las dos pistas es el rasgo que la distingue: permite presurizar la unión y comprobar su estanqueidad sin destruirla.',
      'La alternativa es la soldadura por extrusión, que aporta material fundido y se usa en parches, detalles y penetraciones donde la cuña no entra. No admite ensayo de presión, por lo que se verifica por otros métodos.',
    ],
    porQueImporta:
      'Es lo que convierte una lámina impermeable en una barrera continua. La calidad de la obra se concentra aquí y en el anclaje, no en el espesor comprado.',
    errorFrecuente:
      'Aceptar una instalación sin registro de ensayos de las uniones. Sin ese registro no existe evidencia de estanqueidad, solo la afirmación de que se hizo bien.',
    relacionados: ['geomembrana', 'hdpe', 'zanja-de-anclaje', 'as-built', 'termosellado'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'accesorios-instalacion'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'ejecucion',
  },
  {
    slug: 'zanja-de-anclaje',
    termino: 'Zanja de anclaje',
    alias: ['trinchera de anclaje', 'anchor trench'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Excavación perimetral donde se aloja y se entierra el borde de un geosintético para fijarlo y transmitir al terreno los esfuerzos que recibe la lámina.',
    definicion: [
      'Sin ella, el borde queda libre: el viento levanta la lámina antes de que la obra entre en servicio, y el propio peso del material contenido tiende a arrastrarla hacia el fondo.',
      'Sus dimensiones y su distancia al borde del talud no son un detalle constructivo menor: son parte del diseño.',
    ],
    comoSeMide: 'Por profundidad y ancho de la zanja (m) y por su separación respecto de la corona del talud.',
    porQueImporta:
      'Es, junto con las uniones, donde se juega la obra. Una geomembrana correcta con un anclaje improvisado falla igual que una lámina de menor calidad bien anclada.',
    relacionados: ['geomembrana', 'subrasante', 'soldadura-por-cuna-caliente', 'as-built'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'accesorios-instalacion'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'ejecucion',
  },
  {
    slug: 'subrasante',
    termino: 'Subrasante',
    alias: ['superficie de apoyo', 'base preparada'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Superficie de suelo preparada y aceptada sobre la que se instala un geosintético.',
    definicion: [
      'Preparada significa perfilada, compactada y libre de elementos que puedan perforar la lámina: piedras angulosas, raíces, restos de excavación, encharcamientos.',
      'Aceptada significa que alguien la recibió formalmente antes de empezar a desplegar. Es un hito documental, no una impresión visual.',
    ],
    porQueImporta:
      'Es la única parte de la obra que deja de ser accesible en cuanto empieza la instalación. Todo lo que quede mal debajo se corrige levantando lo que se puso encima.',
    errorFrecuente:
      'Tratar la aceptación de subrasante como un trámite. Es el punto donde el costo de corregir se multiplica por diez si se pasa por alto.',
    relacionados: ['geomembrana', 'geotextil', 'zanja-de-anclaje', 'resistencia-al-punzonamiento', 'as-built'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'geotextiles'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'ejecucion',
  },
  {
    slug: 'geomalla',
    termino: 'Geomalla',
    alias: ['geogrid', 'geomalla de refuerzo'],
    categoria: 'geosinteticos',
    definicionCorta:
      'Estructura sintética de aberturas regulares diseñada para reforzar suelo mediante la trabazón mecánica de las partículas dentro de sus aberturas.',
    definicion: [
      'No trabaja como una tela: trabaja porque el árido se traba en sus aberturas y el conjunto suelo-geomalla se comporta como un material compuesto más rígido que el suelo solo.',
      'Por eso el tamaño de abertura debe guardar relación con la granulometría del material que va a confinar.',
    ],
    comoSeMide: 'Por resistencia a la tracción en cada dirección (kN/m) y por tamaño de abertura.',
    porQueImporta:
      'Es lo que permite construir sobre suelos blandos o reducir espesores de estructura. Especificarla sin considerar el árido disponible anula el mecanismo que la hace funcionar.',
    relacionados: ['geotextil', 'geosintetico', 'subrasante'],
    productos: ['geomallas-geogrids'],
    guias: ['como-elegir-geotextil-separacion-drenaje-refuerzo'],
    pilar: 'cargas',
  },
  // --- Ventilación industrial -----------------------------------------------
  {
    slug: 'manga-de-ventilacion',
    termino: 'Manga de ventilación',
    alias: ['ducto flexible', 'manga minera', 'tubería de ventilación'],
    categoria: 'ventilacion',
    definicionCorta:
      'Conducto flexible de material textil o plástico que transporta aire entre un ventilador y el frente de trabajo de una labor subterránea.',
    definicion: [
      'Es el elemento que hace llegar el aire a donde se trabaja. Su especificación se define por el diámetro, el material, el tipo de refuerzo y, sobre todo, por si trabaja a presión positiva o negativa.',
      'La manga no es un accesorio del ventilador: la pérdida de carga que introduce condiciona qué ventilador se necesita.',
    ],
    comoSeMide: 'Por diámetro nominal (pulgadas o mm), longitud por tramo (m) y presión de trabajo.',
    porQueImporta:
      'Determina cuánto del caudal que entrega el ventilador llega efectivamente al frente. Un sistema bien calculado en el papel se pierde en fugas y en pérdida de carga mal estimadas.',
    relacionados: ['ventilacion-impelente', 'ventilacion-aspirante', 'caudal', 'perdida-de-carga', 'factor-de-fuga'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['calculo-caudal-mangas-ventilacion-mina-subterranea', 'ventilacion-impelente-vs-aspirante-labores-mineras'],
    pilar: 'operacion',
  },
  {
    slug: 'ventilacion-impelente',
    termino: 'Ventilación impelente',
    alias: ['sistema soplante', 'presión positiva'],
    categoria: 'ventilacion',
    definicionCorta:
      'Configuración en la que el ventilador empuja aire limpio hacia el frente de trabajo, de modo que la manga trabaja a presión positiva.',
    definicion: [
      'El aire fresco se lanza contra el frente y barre los contaminantes hacia la labor, que actúa como retorno. Es la configuración que entrega aire limpio directamente donde están las personas.',
      'Como la manga trabaja inflada, no necesita resistir el colapso: puede fabricarse en materiales más ligeros y sin refuerzo espiral.',
    ],
    porQueImporta:
      'La elección entre impelente y aspirante determina el material de la manga, no al revés. Encargar una manga sin decidir antes la configuración es la causa más frecuente de un ducto inservible.',
    relacionados: ['ventilacion-aspirante', 'manga-de-ventilacion', 'refuerzo-espiral', 'caudal'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['ventilacion-impelente-vs-aspirante-labores-mineras'],
    pilar: 'operacion',
  },
  {
    slug: 'ventilacion-aspirante',
    termino: 'Ventilación aspirante',
    alias: ['sistema extractor', 'presión negativa'],
    categoria: 'ventilacion',
    definicionCorta:
      'Configuración en la que el ventilador extrae aire desde el frente de trabajo, de modo que la manga trabaja a presión negativa y tiende a colapsar.',
    definicion: [
      'Retira el aire contaminado directamente desde el punto donde se genera, lo que la hace eficaz para controlar polvo y gases de voladura sin dispersarlos por toda la labor.',
      'Exige una manga capaz de resistir la depresión sin cerrarse: normalmente con refuerzo espiral o de pared rígida. Una manga impelente puesta a aspirar se aplasta y deja de conducir aire.',
    ],
    porQueImporta:
      'Es el caso donde el error de especificación es inmediato y total: el ducto no funciona mal, simplemente no funciona.',
    errorFrecuente:
      'Reutilizar mangas de un sistema impelente en uno aspirante porque "es la misma manga y el mismo diámetro".',
    relacionados: ['ventilacion-impelente', 'manga-de-ventilacion', 'refuerzo-espiral', 'perdida-de-carga'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['ventilacion-impelente-vs-aspirante-labores-mineras'],
    pilar: 'operacion',
  },
  {
    slug: 'refuerzo-espiral',
    termino: 'Refuerzo espiral',
    alias: ['espiral de acero', 'manga espiralada'],
    categoria: 'ventilacion',
    definicionCorta:
      'Alambre o perfil dispuesto helicoidalmente en la pared de una manga para impedir que colapse cuando trabaja a presión negativa.',
    definicion: [
      'Aporta rigidez radial sin quitar flexibilidad longitudinal: la manga sigue plegándose y curvándose, pero conserva su sección abierta.',
      'Añade peso y volumen de almacenamiento, y por eso no se incorpora a mangas que solo van a trabajar infladas.',
    ],
    porQueImporta:
      'Es el rasgo que distingue una manga aspirante de una impelente. Si la configuración cambia en obra, la manga tiene que cambiar con ella.',
    relacionados: ['ventilacion-aspirante', 'manga-de-ventilacion', 'ventilacion-impelente'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['ventilacion-impelente-vs-aspirante-labores-mineras'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'caudal',
    termino: 'Caudal de aire',
    alias: ['flujo de aire', 'volumen de aire'],
    categoria: 'ventilacion',
    definicionCorta:
      'Volumen de aire que atraviesa una sección por unidad de tiempo, y magnitud con la que se dimensiona cualquier sistema de ventilación.',
    definicion: [
      'El caudal requerido en una labor no se elige: se calcula a partir de las personas presentes, los equipos diésel en operación, la dilución de gases y polvo y la sección de la labor. El mayor de esos requerimientos gobierna.',
      'El caudal que entrega el ventilador y el que llega al frente no son el mismo número: la diferencia son las fugas y la pérdida de carga.',
    ],
    comoSeMide: 'En metros cúbicos por minuto (m³/min) o por segundo (m³/s); también en pies cúbicos por minuto.',
    porQueImporta:
      'Es el punto de partida de todo el dimensionamiento. Un diámetro de manga elegido sin calcular caudal es una cifra sin fundamento.',
    relacionados: ['manga-de-ventilacion', 'perdida-de-carga', 'factor-de-fuga', 'ventilacion-impelente'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['calculo-caudal-mangas-ventilacion-mina-subterranea'],
    pilar: 'cargas',
  },
  {
    slug: 'perdida-de-carga',
    termino: 'Pérdida de carga',
    alias: ['caída de presión', 'pérdida de presión'],
    categoria: 'ventilacion',
    definicionCorta:
      'Energía que el aire pierde por rozamiento y turbulencia al recorrer un conducto, expresada como una caída de presión.',
    definicion: [
      'Crece con la longitud del conducto y con la velocidad del aire, y disminuye fuertemente al aumentar el diámetro. Los cambios de dirección, los estrangulamientos y los acoples mal ejecutados añaden pérdidas localizadas.',
      'Es el término que explica por qué alargar una manga sin recalcular deja el frente sin aire.',
    ],
    comoSeMide: 'En pascales (Pa) o en pulgadas de columna de agua.',
    porQueImporta:
      'Determina la presión que debe vencer el ventilador. Un ventilador correcto para el caudal pero insuficiente en presión no entrega ese caudal en la práctica.',
    relacionados: ['caudal', 'manga-de-ventilacion', 'factor-de-fuga'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['calculo-caudal-mangas-ventilacion-mina-subterranea'],
    pilar: 'cargas',
  },
  {
    slug: 'factor-de-fuga',
    termino: 'Factor de fuga',
    alias: ['pérdidas por fuga', 'eficiencia de la manga'],
    categoria: 'ventilacion',
    definicionCorta:
      'Proporción del aire que se escapa por las uniones y las perforaciones de un ducto antes de llegar al punto de entrega.',
    definicion: [
      'Depende del estado del ducto y de la calidad de los acoples más que del material. Una manga nueva mal empalmada fuga más que una usada bien mantenida.',
      'Se acumula a lo largo del recorrido: cuanto más largo el tendido, mayor la diferencia entre lo que se sopla y lo que llega.',
    ],
    porQueImporta:
      'Es la diferencia entre el sistema calculado y el sistema real. Ignorarlo produce instalaciones que cumplen en la memoria de cálculo y no en el frente.',
    relacionados: ['caudal', 'perdida-de-carga', 'manga-de-ventilacion'],
    productos: ['mangas-ventilacion-minas-tuneles'],
    guias: ['calculo-caudal-mangas-ventilacion-mina-subterranea'],
    pilar: 'operacion',
  },

  // --- Mallas agrícolas -----------------------------------------------------
  {
    slug: 'malla-antiafida',
    termino: 'Malla antiáfida',
    alias: ['malla anti-insectos', 'antiáfido'],
    categoria: 'mallas',
    definicionCorta:
      'Tejido de trama cerrada instalado como barrera física para impedir el ingreso de insectos vectores a un cultivo protegido.',
    definicion: [
      'Su eficacia depende del tamaño de paso de la trama frente al tamaño del insecto que se quiere excluir: una malla que detiene mosca blanca no es la misma que detiene trips.',
      'Cerrar la trama tiene un costo físico inevitable: reduce el paso de aire.',
    ],
    comoSeMide: 'Por densidad de trama, expresada en hilos por pulgada (mesh) o en dimensiones de la abertura.',
    porQueImporta:
      'Es el componente que decide si la protección funciona y también si el cultivo se sobrecalienta. Las dos consecuencias vienen del mismo número.',
    errorFrecuente:
      'Pedir la malla más cerrada disponible por precaución, sin recalcular la ventilación. Se excluye al insecto y se pierde la cosecha por temperatura.',
    relacionados: ['mesh', 'porcentaje-de-sombra', 'malla-raschel', 'estabilizacion-uv'],
    productos: ['mallas-antiafidas'],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'mesh',
    termino: 'Mesh',
    alias: ['densidad de trama', 'hilos por pulgada'],
    categoria: 'mallas',
    definicionCorta:
      'Unidad que expresa la densidad de una trama como número de hilos por pulgada lineal, en una o en ambas direcciones.',
    definicion: [
      'Un número mesh mayor indica una trama más cerrada y por tanto aberturas menores. Suele expresarse con dos cifras cuando la densidad difiere entre urdimbre y trama.',
      'El mesh no describe por sí solo la abertura real: el grosor del hilo también la determina. Dos mallas del mismo mesh con hilos distintos dejan pasos distintos.',
    ],
    comoSeMide: 'En hilos por pulgada, habitualmente como un par de valores.',
    porQueImporta:
      'Es el dato que hay que dar para pedir una malla de exclusión. Sin él, la conversación se queda en "una malla fina", que no es una especificación.',
    relacionados: ['malla-antiafida', 'porcentaje-de-sombra', 'malla-raschel'],
    productos: ['mallas-antiafidas'],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion'],
    pilar: 'compatibilidad',
  },
  {
    slug: 'porcentaje-de-sombra',
    termino: 'Porcentaje de sombra',
    alias: ['factor de sombra', 'grado de sombreo'],
    categoria: 'mallas',
    definicionCorta:
      'Proporción de radiación solar que una malla intercepta, expresada como porcentaje de la radiación incidente.',
    definicion: [
      'Depende de la densidad del tejido y del color del hilo. Una malla negra y una blanca del mismo porcentaje interceptan una fracción similar, pero no producen el mismo microclima: difieren en cómo reflejan y reemiten la energía.',
      'El porcentaje adecuado no es una constante del cultivo: cambia con la latitud, la altitud y la estación.',
    ],
    comoSeMide: 'En porcentaje (%) de intercepción de radiación.',
    porQueImporta:
      'Regula al mismo tiempo la luz disponible para la fotosíntesis y la temperatura bajo la malla. Un porcentaje elegido por costumbre y no por emplazamiento penaliza el rendimiento.',
    relacionados: ['malla-raschel', 'malla-antiafida', 'estabilizacion-uv', 'altitud-y-radiacion'],
    productos: ['malla-raschel-sombra'],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion'],
    pilar: 'exposicion',
  },
  {
    slug: 'malla-raschel',
    termino: 'Malla Raschel',
    alias: ['malla de sombreo', 'rachel'],
    categoria: 'mallas',
    definicionCorta:
      'Malla fabricada por tejido de urdimbre tipo Raschel, empleada para sombreo y protección de cultivos y de superficies.',
    definicion: [
      'El tejido Raschel produce una estructura que no se deshilacha al cortarse, lo que la hace práctica de instalar y de reparar en campo.',
      'Se especifica por porcentaje de sombra, color, gramaje y tratamiento ultravioleta, y su vida útil a la intemperie depende sobre todo de este último.',
    ],
    comoSeMide: 'Por porcentaje de sombra (%), gramaje (g/m²) y ancho de rollo (m).',
    porQueImporta:
      'Es la solución de sombreo más extendida y también la más comprada por precio. La diferencia de duración entre dos mallas del mismo porcentaje suele estar en la estabilización, no en la trama.',
    relacionados: ['porcentaje-de-sombra', 'estabilizacion-uv', 'malla-antiafida', 'gramaje'],
    productos: ['malla-raschel-sombra', 'malla-anti-pajaro-anti-granizo'],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion'],
    pilar: 'exposicion',
  },
  // --- Estructuras y arquitectura textil ------------------------------------
  {
    slug: 'arquitectura-textil',
    termino: 'Arquitectura textil',
    alias: ['estructura tensada', 'membrana arquitectónica'],
    categoria: 'estructuras',
    definicionCorta:
      'Construcción cuya envolvente es una membrana flexible que resiste las cargas trabajando a tracción, en lugar de a flexión o a compresión.',
    definicion: [
      'Una membrana no tiene rigidez propia: obtiene su estabilidad de la forma y del pretensado. Por eso una cubierta textil no se diseña dibujando una superficie y fabricándola, sino encontrando la forma que equilibra las fuerzas.',
      'De ahí que las superficies sean curvas en dos direcciones opuestas: esa doble curvatura es lo que impide que el viento la haga aletear.',
    ],
    porQueImporta:
      'Explica por qué una cubierta textil no se puede cotizar por metro cuadrado de tela: el corte de patrones, el pretensado y los anclajes son el proyecto.',
    relacionados: ['pretensado', 'carga-de-viento', 'termosellado', 'lona-plastificada'],
    productos: ['coberturas-tensionadas-arquitectura-textil', 'carpas-lona-estructuras-metalicas'],
    guias: ['carpas-industriales-carga-viento-norma-e020'],
    pilar: 'cargas',
  },
  {
    slug: 'pretensado',
    termino: 'Pretensado',
    alias: ['tensión inicial', 'pretensión'],
    categoria: 'estructuras',
    definicionCorta:
      'Tensión que se introduce deliberadamente en una membrana durante el montaje para que nunca quede floja bajo las cargas de servicio.',
    definicion: [
      'Una membrana sin pretensar aletea con el viento, y el aleteo es un fenómeno de fatiga: destruye el material y los anclajes mucho antes de que se alcance ninguna carga de rotura.',
      'El pretensado se pierde con el tiempo por relajación del material, de modo que un sistema de retensado forma parte del diseño, no del mantenimiento improvisado.',
    ],
    porQueImporta:
      'Es la diferencia entre una cubierta que dura años y una que se destruye sola en la primera temporada de vientos.',
    relacionados: ['arquitectura-textil', 'carga-de-viento', 'ojal'],
    productos: ['coberturas-tensionadas-arquitectura-textil'],
    guias: ['carpas-industriales-carga-viento-norma-e020'],
    pilar: 'ejecucion',
  },
  {
    slug: 'carga-de-viento',
    termino: 'Carga de viento',
    alias: ['presión de viento', 'acción del viento'],
    categoria: 'estructuras',
    definicionCorta:
      'Fuerza que el viento ejerce sobre una superficie, resultado de su velocidad de diseño, la altura, la exposición del emplazamiento y la forma de la construcción.',
    definicion: [
      'Sobre una cubierta ligera el efecto dominante no suele ser la presión sino la succión: el viento tiende a levantarla, no a aplastarla. Los anclajes se dimensionan para arrancamiento.',
      'La velocidad de diseño es un dato del emplazamiento, y la normativa peruana de cargas la establece por zonas.',
    ],
    comoSeMide: 'Como presión, en kilogramos por metro cuadrado o en pascales, a partir de la velocidad de diseño (km/h).',
    porQueImporta:
      'Es la carga que gobierna el dimensionamiento de casi toda estructura ligera en el Perú. Encargar una carpa sin declarar el emplazamiento es encargarla sin la variable que la define.',
    errorFrecuente:
      'Dimensionar por el tamaño de la carpa y no por dónde va a instalarse. La misma carpa en la costa central y en una pampa altoandina requiere anclajes distintos.',
    relacionados: ['arquitectura-textil', 'pretensado', 'ojal', 'altitud-y-radiacion'],
    productos: ['carpas-lona-estructuras-metalicas', 'galpones-invernaderos-estructurados', 'toldos-cerramientos'],
    guias: ['carpas-industriales-carga-viento-norma-e020'],
    pilar: 'cargas',
  },

  // --- Transversales --------------------------------------------------------
  {
    slug: 'altitud-y-radiacion',
    termino: 'Altitud y radiación ultravioleta',
    alias: ['radiación en altura', 'exposición altoandina'],
    categoria: 'transversal',
    definicionCorta:
      'Relación por la cual la radiación ultravioleta que llega a una superficie aumenta con la altitud, al atravesar menos atmósfera.',
    definicion: [
      'Es la variable de exposición más determinante y más ignorada en el Perú, donde una misma empresa puede operar a nivel del mar y por encima de los cuatro mil metros.',
      'Se combina con la amplitud térmica diaria, que en altura es mucho mayor: el material trabaja además a fatiga por dilatación y contracción.',
    ],
    porQueImporta:
      'Un material que rinde bien en costa puede envejecer varias veces más rápido en altura. La especificación tiene que declarar el emplazamiento, no solo el uso.',
    relacionados: ['estabilizacion-uv', 'porcentaje-de-sombra', 'carga-de-viento', 'geomembrana'],
    productos: ['malla-raschel-sombra', 'lona-plastificada-rafia-polytarp', 'geomembrana-polietileno-pe-hdpe'],
    pilar: 'exposicion',
  },
  {
    slug: 'certificado-de-lote',
    termino: 'Certificado de lote',
    alias: ['certificado de calidad', 'certificado del fabricante', 'mill certificate'],
    categoria: 'transversal',
    definicionCorta:
      'Documento emitido por el fabricante que declara los resultados de ensayo del lote concreto de material suministrado.',
    definicion: [
      'No es lo mismo que una ficha técnica. La ficha describe el producto de catálogo; el certificado declara qué se midió en el material que efectivamente llegó a la obra, identificado por número de lote o de rollo.',
      'Es el documento que permite trazar un material instalado hasta su fabricación, y el único que sirve ante una discrepancia.',
    ],
    porQueImporta:
      'Sin él no hay trazabilidad: se puede afirmar qué se compró, no demostrar qué se instaló. En obras auditadas es un requisito de recepción, no un extra.',
    errorFrecuente:
      'Aceptar la ficha técnica del catálogo como si fuera el certificado del lote. Son documentos distintos con valor probatorio distinto.',
    relacionados: ['as-built', 'factor-de-seguridad', 'geomembrana', 'tipo-electrostatico-fibc'],
    productos: ['geomembrana-polietileno-pe-hdpe', 'big-bags-bolsones-polipropileno'],
    pilar: 'documentacion',
  },
  {
    slug: 'as-built',
    termino: 'Plano as-built',
    alias: ['conforme a obra', 'plano de paneles'],
    categoria: 'transversal',
    definicionCorta:
      'Documentación que registra cómo quedó ejecutada la obra realmente, incluida la disposición de paneles, uniones, reparaciones y ensayos.',
    definicion: [
      'En una obra de impermeabilización recoge el despiece real de paneles, la numeración de rollos, la ubicación de cada unión con su registro de ensayo y la posición de las reparaciones.',
      'Se produce durante la ejecución, no después: reconstruirlo al final es escribir una versión plausible de lo que se cree que pasó.',
    ],
    porQueImporta:
      'Es lo que permite reparar años después sin excavar a ciegas, y lo que sostiene cualquier reclamación. Una obra sin as-built es una obra que hay que redescubrir cada vez que falla.',
    relacionados: ['soldadura-por-cuna-caliente', 'certificado-de-lote', 'subrasante', 'zanja-de-anclaje'],
    productos: ['geomembrana-polietileno-pe-hdpe'],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales'],
    pilar: 'documentacion',
  },
  {
    slug: 'fabricacion-a-medida',
    termino: 'Fabricación a medida',
    alias: ['confección a medida', 'hecho a pedido'],
    categoria: 'transversal',
    definicionCorta:
      'Producción de un artículo según las dimensiones y características definidas para un proyecto concreto, en lugar de seleccionarlo de un catálogo de medidas fijas.',
    definicion: [
      'Cambia la naturaleza de la compra: no hay stock que consultar ni precio de lista que comparar, y el plazo depende de la carga de planta y de la disponibilidad de la materia prima.',
      'Exige que la especificación esté cerrada antes de producir, porque una vez cortado el material no hay marcha atrás.',
    ],
    porQueImporta:
      'Explica por qué en este rubro la cotización es un acto técnico y no administrativo: definir bien el pedido es parte del trabajo, y es donde se evitan los errores caros.',
    relacionados: ['certificado-de-lote', 'fabricacion-a-medida-vs-importacion'],
    pilar: 'documentacion',
  },
  {
    slug: 'fabricacion-a-medida-vs-importacion',
    termino: 'Origen de suministro',
    alias: ['fabricación propia', 'importación directa', 'bajo pedido'],
    categoria: 'transversal',
    definicionCorta:
      'Forma en que se obtiene un material —fabricación propia, importación directa o pedido a un aliado técnico— y que determina su plazo, su trazabilidad y su margen de personalización.',
    definicion: [
      'La fabricación propia permite ajustar medidas y detalles y acorta el plazo, pero está limitada a lo que la planta puede producir. La importación directa da acceso a líneas técnicas que no se fabrican localmente, con plazos gobernados por la logística internacional.',
      'Declarar el origen no es un detalle comercial: cambia qué se puede prometer sobre plazo y sobre documentación.',
    ],
    porQueImporta:
      'Es la variable que decide si un proyecto es viable en la fecha en que se necesita. Un material correcto que llega tarde es un material equivocado.',
    relacionados: ['fabricacion-a-medida', 'certificado-de-lote'],
    pilar: 'documentacion',
  },
];

/** Términos ordenados alfabéticamente por su forma canónica (es-PE). */
export const terminos: Termino[] = [...registro].sort((a, b) =>
  a.termino.localeCompare(b.termino, 'es'),
);

export const terminoBySlug = (slug: string): Termino | undefined =>
  terminos.find((t) => t.slug === slug);

export const terminosPorCategoria = (c: TerminoCategoria): Termino[] =>
  terminos.filter((t) => t.categoria === c);

/** Categorías con al menos un término, en el orden en que se declaran. */
export const categoriasPresentes = (): TerminoCategoria[] =>
  (Object.keys(categoriaLabels) as TerminoCategoria[]).filter((c) =>
    terminos.some((t) => t.categoria === c),
  );

/** Términos cuya definición es determinante para un producto del catálogo. */
export const terminosParaProducto = (productoSlug: string): Termino[] =>
  terminos.filter((t) => t.productos?.includes(productoSlug));

/** Términos que una guía desarrolla con sus fuentes. */
export const terminosParaGuia = (guiaSlug: string): Termino[] =>
  terminos.filter((t) => t.guias?.includes(guiaSlug));

/**
 * Índice alfabético: agrupa por letra inicial para la navegación A–Z, que es
 * como se consulta un glosario cuando ya se sabe qué se busca.
 */
export function terminosPorLetra(): { letra: string; items: Termino[] }[] {
  const mapa = new Map<string, Termino[]>();
  for (const t of terminos) {
    // Se normaliza el acento para que "Ó" no abra una letra propia.
    const letra = t.termino
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .charAt(0)
      .toUpperCase();
    const acc = mapa.get(letra);
    if (acc) acc.push(t);
    else mapa.set(letra, [t]);
  }
  return [...mapa.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'es'))
    .map(([letra, items]) => ({ letra, items }));
}

/** Todas las formas de nombrar un término: la canónica, la sigla y los alias. */
export const formasDe = (t: Termino): string[] =>
  [t.termino, ...(t.siglas ? [t.siglas] : []), ...(t.alias ?? [])];

