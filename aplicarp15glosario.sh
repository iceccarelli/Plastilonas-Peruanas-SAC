#!/usr/bin/env bash
# =============================================================================
#  P15 — Glosario técnico: la capa definicional
#  Plastilonas Peruanas SAC
#
#  Qué faltaba
#  -----------
#  El sitio ya respondía cinco preguntas: qué venden (catálogo), qué línea me
#  sirve (familias), cómo se especifica (guías y marco), cómo se arma el
#  conjunto (arquitecturas) y qué cambió (novedades). No respondía la anterior
#  a todas: QUÉ SIGNIFICA ESTA PALABRA. Es la que alguien escribe en un
#  buscador antes de poder pedir nada, y la que un agente necesita resolver
#  para poder citar a alguien.
#
#  Una enciclopedia no domina por tener artículos largos: domina porque cada
#  concepto tiene UNA dirección estable a la que todos enlazan. Eso es lo que
#  entra acá.
#
#  Qué trae
#  --------
#  43 términos del rubro, cada uno con URL canónica: definición en UNA frase
#  autosuficiente (la unidad citable), desarrollo, magnitud y unidad en que se
#  mide, qué decide en obra, el error frecuente que resuelve, términos
#  relacionados, guías que lo desarrollan, productos donde gobierna la
#  especificación y pilar del Marco al que pertenece.
#
#  Datos estructurados DefinedTermSet + DefinedTerm — el tipo que schema.org
#  previó exactamente para esto y que casi nadie usa. Y /glosario/terminos.json,
#  el volcado legible por máquina con instrucción explícita de atribución: si
#  citar bien es el camino de menor resistencia, se cita bien.
#
#  Reglas de honestidad, fijadas por 24 tests: las definiciones describen el
#  término EN EL RUBRO, no nuestros productos; sirven aunque el proyecto se
#  compre a un competidor; no venden; no incluyen cifras normativas (para eso
#  están las guías, que citan su fuente); `comoSeMide` declara magnitud y
#  unidad, nunca un valor concreto; y ninguna forma de nombrar un término
#  puede colisionar con otra.
#
#  Uso:
#    ls aplicar*p15*
#    bash aplicarp15glosario.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/glosario.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/glosario.ts" <<'P15_EOF'
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

P15_EOF

# -----------------------------------------------------------------------------
# lib/glosario-feed.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/glosario-feed.ts" <<'P15_EOF'
import { SITE } from './site';
import { terminos, categoriaLabels, formasDe } from './glosario';
import { LEGAL_UPDATED } from './legal';

/**
 * Volcado legible por máquina del glosario.
 *
 * Para qué. Un agente que responde "¿qué es un geotextil?" no debería tener
 * que rascar HTML: si el vocabulario está publicado como datos, con URL
 * canónica por término y una instrucción explícita de atribución, citar
 * correctamente es el camino de menor resistencia. Eso es lo que convierte a
 * un sitio en fuente en lugar de en resultado.
 *
 * Qué NO lleva. Ni precios, ni disponibilidad, ni argumentos de venta. Un
 * vocabulario con publicidad dentro deja de ser citable, que es exactamente
 * lo contrario de lo que se busca.
 *
 * Vive en lib/ porque los route handlers de Next solo pueden exportar métodos
 * HTTP y configuración; cualquier export adicional rompe la compilación.
 */

export const GLOSARIO_VERSION = '1.0';

export function buildGlosarioJson(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      $schema: 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': `${base}/glosario#glosario`,
      version: GLOSARIO_VERSION,
      actualizado: LEGAL_UPDATED,
      name: 'Glosario técnico de textiles industriales y geosintéticos',
      description:
        'Vocabulario del rubro de textiles industriales, geosintéticos, ventilación minera y mallas agrícolas en el Perú. Cada término define qué significa, en qué unidad se mide y qué decide en obra.',
      url: `${base}/glosario`,
      inLanguage: SITE.language,
      publisher: {
        '@type': 'Organization',
        name: SITE.legalName,
        taxID: SITE.ruc,
        url: base,
      },
      // Instrucción explícita de atribución: si citar bien es fácil, se cita bien.
      uso: {
        licencia: 'Consulta y cita libres indicando la fuente y el enlace al término.',
        atribucionSugerida: `${SITE.legalName} — Glosario técnico, ${base}/glosario`,
        nota: 'Las definiciones describen el término en el rubro y son útiles con independencia del proveedor. No contienen precios, disponibilidad ni argumentos comerciales.',
      },
      totalTerminos: terminos.length,
      hasDefinedTerm: terminos.map((t) => ({
        '@type': 'DefinedTerm',
        '@id': `${base}/glosario/${t.slug}#termino`,
        termCode: t.slug,
        name: t.termino,
        alternateName: formasDe(t).slice(1),
        description: t.definicionCorta,
        url: `${base}/glosario/${t.slug}`,
        area: categoriaLabels[t.categoria],
        ...(t.comoSeMide ? { comoSeMide: t.comoSeMide } : {}),
        porQueImporta: t.porQueImporta,
        ...(t.errorFrecuente ? { errorFrecuente: t.errorFrecuente } : {}),
        terminosRelacionados: t.relacionados.map((r) => `${base}/glosario/${r}`),
        ...(t.guias?.length
          ? { guias: t.guias.map((g) => `${base}/recursos/${g}`) }
          : {}),
        ...(t.productos?.length
          ? { productos: t.productos.map((p) => `${base}/productos/${p}`) }
          : {}),
        ...(t.pilar ? { pilarDelMarco: t.pilar } : {}),
      })),
    },
    null,
    2,
  )}\n`;
}
P15_EOF

# -----------------------------------------------------------------------------
# app/glosario/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/glosario"
cat > "app/glosario/page.tsx" <<'P15_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import {
  terminos,
  terminosPorLetra,
  terminosPorCategoria,
  categoriasPresentes,
  categoriaLabels,
} from '@/lib/glosario';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, definedTermSetSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del glosario.
 *
 * Dos ejes de navegación porque hay dos formas de llegar: alfabética, para
 * quien ya sabe la palabra que busca, y por categoría, para quien está
 * explorando un área que no domina. Ninguno de los dos usa parámetros de
 * consulta: una URL sin parámetros es la que se cita y la que se indexa.
 */

const URL = `${SITE.url}/glosario`;
const TITLE = 'Glosario técnico de textiles industriales y geosintéticos';
const DESCRIPTION = `${terminos.length} términos del rubro definidos con precisión: qué significan, cómo se miden y qué deciden en obra. Vocabulario de referencia para especificar big bags, lonas, geosintéticos, ventilación minera y mallas agrícolas en el Perú.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/glosario' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function GlosarioPage() {
  const letras = terminosPorLetra();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="glosario" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Glosario', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          definedTermSetSchema({
            url: URL,
            name: 'Glosario técnico de textiles industriales y geosintéticos',
            description: DESCRIPTION,
            terms: terminos.map((t) => ({
              slug: t.slug,
              termino: t.termino,
              definicionCorta: t.definicionCorta,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Glosario</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">Glosario técnico</h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Antes de elegir un producto hay que entender qué se está pidiendo. Estos{' '}
        {terminos.length} términos son el vocabulario con el que se especifica en este
        rubro: qué significa cada uno, en qué unidad se mide y qué decide en obra.
        Están escritos para ser útiles aunque el proyecto se compre a otro proveedor —
        esa es la única forma de que una definición valga algo.
      </p>

      <p className="mb-10 font-mono text-sm text-gray-500">
        {terminos.length} términos · {categoriasPresentes().length} áreas ·{' '}
        <a href="/glosario/terminos.json" className="underline hover:text-[#059669]">
          versión legible por máquina
        </a>
      </p>

      {/* Salto alfabético: cómo se consulta un glosario cuando ya se sabe qué buscar. */}
      <nav aria-label="Índice alfabético" className="mb-12 flex flex-wrap gap-2">
        {letras.map((l) => (
          <a
            key={l.letra}
            href={`#letra-${l.letra}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-mono text-sm font-semibold text-[#0A2540] transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {l.letra}
          </a>
        ))}
      </nav>

      <section className="mb-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Por área
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categoriasPresentes().map((c) => (
            <a
              key={c}
              href={`#area-${c}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
            >
              <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                {categoriaLabels[c]}
              </span>
              <span className="font-mono text-sm text-gray-500">
                {terminosPorCategoria(c).length}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Eje 1: alfabético. */}
      <section className="mb-16">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          <BookOpen className="h-5 w-5 text-[#059669]" aria-hidden="true" />
          Todos los términos
        </h2>
        {letras.map((l) => (
          <div key={l.letra} id={`letra-${l.letra}`} className="mb-10 scroll-mt-28">
            <h3 className="mb-4 border-b border-gray-100 pb-2 font-mono text-xl font-semibold text-[#059669]">
              {l.letra}
            </h3>
            <ul className="space-y-3">
              {l.items.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/glosario/${t.slug}`}
                    className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                  >
                    <span className="mb-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-[#0A2540] group-hover:text-[#059669]">
                        {t.termino}
                      </span>
                      {t.siglas && (
                        <span className="font-mono text-xs text-gray-500">({t.siglas})</span>
                      )}
                    </span>
                    <span className="block text-sm text-gray-600">{t.definicionCorta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Eje 2: por área, para quien explora un terreno que no domina. */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Términos por área
        </h2>
        {categoriasPresentes().map((c) => (
          <div key={c} id={`area-${c}`} className="mb-8 scroll-mt-28">
            <h3 className="mb-3 border-b border-gray-100 pb-2 text-lg font-semibold text-[#0A2540]">
              {categoriaLabels[c]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {terminosPorCategoria(c).map((t) => (
                <Link
                  key={t.slug}
                  href={`/glosario/${t.slug}`}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
                >
                  {t.termino}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Falta un término que usted sí usa?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Este glosario crece con las preguntas que llegan de obra. Si en su operación
          hay un término que acá no está definido, escríbanos y entra con su desarrollo
          y sus guías.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Escribirnos
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver el Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# app/glosario/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/glosario/[slug]"
cat > "app/glosario/[slug]/page.tsx" <<'P15_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Ruler } from 'lucide-react';
import {
  terminos,
  terminoBySlug,
  terminosPorCategoria,
  categoriaLabels,
  formasDe,
} from '@/lib/glosario';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, definedTermSchema, webPageSchema } from '@/lib/schema';

/**
 * Página de un término.
 *
 * La unidad citable del sitio. Un modelo que necesita definir "geotextil" debe
 * poder copiar UNA frase de acá y atribuirla sin leer el resto. Por eso la
 * definición corta va sola, arriba, marcada como speakable y replicada en el
 * DefinedTerm: si hay que reconstruirla juntando párrafos, no se cita.
 *
 * Y por eso cada término enlaza hacia los productos donde manda, las guías que
 * lo desarrollan y el pilar del marco al que pertenece: la definición es la
 * puerta de entrada al resto del sitio, no un callejón sin salida.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return terminos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) return {};
  const url = `${SITE.url}/glosario/${slug}`;
  const title = t.siglas ? `${t.termino} (${t.siglas})` : t.termino;
  return {
    title: `${title}: qué es y cómo se especifica`,
    description: t.definicionCorta,
    keywords: formasDe(t),
    alternates: { canonical: `/glosario/${slug}` },
    openGraph: {
      title: `${title} | Glosario técnico de ${SITE.name}`,
      description: t.definicionCorta,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function TerminoPage({ params }: Props) {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) notFound();

  const url = `${SITE.url}/glosario/${slug}`;
  const setUrl = `${SITE.url}/glosario`;
  const relacionados = t.relacionados.map(terminoBySlug).filter(Boolean) as NonNullable<
    ReturnType<typeof terminoBySlug>
  >[];
  const productosRel = (t.productos ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean);
  const guiasRel = (t.guias ?? [])
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean);
  const pilar = t.pilar ? pillars.find((p) => p.id === t.pilar) : undefined;
  const hermanos = terminosPorCategoria(t.categoria).filter((x) => x.slug !== t.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="glosario" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: t.termino,
            description: t.definicionCorta,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          definedTermSchema({
            url,
            setUrl,
            termino: t.termino,
            definicionCorta: t.definicionCorta,
            termCode: t.slug,
            alternateNames: formasDe(t).slice(1),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Glosario', url: setUrl },
              { name: t.termino, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/glosario" className="hover:text-[#059669]">
          Glosario
        </Link>{' '}
        / <span className="text-gray-700">{t.termino}</span>
      </nav>

      <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {categoriaLabels[t.categoria]}
      </p>

      <h1 className="mb-2 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {t.termino}
      </h1>

      {(t.siglas || t.alias?.length) && (
        <p className="mb-6 text-gray-500">
          También: {formasDe(t).slice(1).join(' · ')}
        </p>
      )}

      {/* La unidad citable. Va sola, sin nada que la interrumpa. */}
      <p className="speakable-intro mb-10 border-l-4 border-[#059669] pl-6 text-xl leading-relaxed text-gray-800">
        {t.definicionCorta}
      </p>

      <div className="mb-12 space-y-5 text-gray-700">
        {t.definicion.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {t.comoSeMide && (
        <section className="mb-12 rounded-3xl border border-gray-100 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            <Ruler className="h-4 w-4" aria-hidden="true" /> Cómo se mide
          </h2>
          <p className="text-gray-800">{t.comoSeMide}</p>
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Por qué importa
        </h2>
        <p className="text-gray-700">{t.porQueImporta}</p>
      </section>

      {t.errorFrecuente && (
        <section className="mb-12 rounded-3xl bg-amber-50 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Error frecuente
          </h2>
          <p className="text-gray-800">{t.errorFrecuente}</p>
        </section>
      )}

      {pilar && (
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            En el Marco de Especificación
          </h2>
          <p className="mb-4 text-gray-700">
            Esta decisión pertenece al pilar <strong>{pilar.nombre}</strong>: {pilar.resumen}
          </p>
          <Link
            href="/marco"
            className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
          >
            Ver los criterios del marco <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos relacionados
          </h2>
          <ul className="space-y-3">
            {relacionados.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/glosario/${r.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                >
                  <span className="mb-1 block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                    {r.termino}
                  </span>
                  <span className="block text-sm text-gray-600">{r.definicionCorta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guiasRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías que lo desarrollan
          </h2>
          <div className="space-y-3">
            {guiasRel.map((a) => (
              <Link
                key={a!.slug}
                href={`/recursos/${a!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {a!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {productosRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Dónde este término decide la especificación
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {productosRel.map((p) => (
              <li key={p!.slug}>
                <Link
                  href={`/productos/${p!.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {p!.name}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {p!.shortDescription}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hermanos.length > 0 && (
        <section className="mb-14 border-t border-gray-100 pt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Más de {categoriaLabels[t.categoria].toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {hermanos.map((h) => (
              <Link
                key={h.slug}
                href={`/glosario/${h.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {h.termino}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl border border-gray-100 p-8 text-center">
        <p className="mb-5 text-gray-700">
          ¿Necesita aplicar este criterio a un proyecto concreto? Envíenos la
          especificación y le devolvemos la propuesta técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/glosario"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Volver al glosario
          </Link>
        </div>
      </div>
    </article>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# app/glosario/terminos.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/glosario/terminos.json"
cat > "app/glosario/terminos.json/route.ts" <<'P15_EOF'
import { buildGlosarioJson } from '@/lib/glosario-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildGlosarioJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // Se permite explícitamente: este archivo existe para ser leído por
      // agentes y rastreadores.
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
P15_EOF

# -----------------------------------------------------------------------------
# test/glosario.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/glosario.test.ts" <<'P15_EOF'
import { describe, it, expect } from 'vitest';
import {
  terminos,
  terminoBySlug,
  terminosPorLetra,
  terminosPorCategoria,
  categoriasPresentes,
  categoriaLabels,
  terminosParaProducto,
  terminosParaGuia,
  formasDe,
} from '@/lib/glosario';
import { buildGlosarioJson, GLOSARIO_VERSION } from '@/lib/glosario-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { generateStaticParams } from '@/app/glosario/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * Un glosario que miente es peor que ninguno: es una fuente que envenena a
 * quien la cita. Estos tests vigilan las formas conocidas de que eso ocurra.
 */

describe('glosario: referencias reales en las tres direcciones', () => {
  it('cada término relacionado existe', () => {
    for (const t of terminos) {
      for (const r of t.relacionados) {
        expect(terminoBySlug(r), `${t.slug} → ${r}`).toBeDefined();
      }
    }
  });

  it('ningún término se relaciona consigo mismo', () => {
    for (const t of terminos) expect(t.relacionados).not.toContain(t.slug);
  });

  it('cada producto citado existe en el catálogo', () => {
    const slugs = new Set(products.map((p) => p.slug));
    for (const t of terminos) {
      for (const p of t.productos ?? []) expect(slugs.has(p), `${t.slug} → ${p}`).toBe(true);
    }
  });

  it('cada guía citada existe en el silo de recursos', () => {
    const slugs = new Set(articles.map((a) => a.slug));
    for (const t of terminos) {
      for (const g of t.guias ?? []) expect(slugs.has(g), `${t.slug} → ${g}`).toBe(true);
    }
  });

  it('cada pilar citado existe en el marco', () => {
    const ids = new Set(pillars.map((p) => p.id));
    for (const t of terminos) {
      if (t.pilar) expect(ids.has(t.pilar), `${t.slug} → ${t.pilar}`).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const t of terminos) {
      expect(t.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(t.slug), `duplicado: ${t.slug}`).toBe(false);
      vistos.add(t.slug);
    }
  });

  it('ninguna forma de nombrar un término colisiona con otra', () => {
    // Dos términos que se llamen igual hacen imposible desambiguar, que es
    // justamente lo que un glosario tiene que resolver.
    const vistas = new Map<string, string>();
    for (const t of terminos) {
      for (const f of formasDe(t)) {
        const clave = f.toLowerCase();
        const previo = vistas.get(clave);
        expect(previo, `"${f}" en ${t.slug} y en ${previo}`).toBeUndefined();
        vistas.set(clave, t.slug);
      }
    }
  });
});

describe('glosario: las definiciones son citables', () => {
  it('la definición corta es una sola frase autosuficiente', () => {
    // Si necesita el párrafo siguiente para entenderse, no se cita nunca.
    for (const t of terminos) {
      expect(t.definicionCorta.length, `${t.slug}: ${t.definicionCorta.length}`).toBeGreaterThan(60);
      expect(t.definicionCorta.length, `${t.slug}: ${t.definicionCorta.length}`).toBeLessThanOrEqual(260);
      expect(t.definicionCorta.trim().endsWith('.'), t.slug).toBe(true);
    }
  });

  it('la definición no empieza remitiendo a otra cosa', () => {
    // "Ver X" o "Es el que…" obliga a salir de la cita para entenderla.
    for (const t of terminos) {
      expect(t.definicionCorta, t.slug).not.toMatch(/^(véase|ver |es el que|lo mismo que)/i);
    }
  });

  it('cada término declara desarrollo y por qué importa', () => {
    for (const t of terminos) {
      expect(t.definicion.length, t.slug).toBeGreaterThan(0);
      expect(t.porQueImporta.length, t.slug).toBeGreaterThan(40);
    }
  });

  it('las definiciones no venden', () => {
    // Un vocabulario con promoción dentro deja de ser citable, que es lo
    // contrario de para lo que existe.
    const prohibido = /\b(el mejor|la mejor|líderes|somos los únicos|el único proveedor|garantizamos|precio imbatible)\b/i;
    for (const t of terminos) {
      const texto = [t.definicionCorta, ...t.definicion, t.porQueImporta, t.errorFrecuente ?? '', t.comoSeMide ?? ''].join(' ');
      expect(prohibido.test(texto), t.slug).toBe(false);
    }
  });

  it('ninguna definición incluye cifras normativas: para eso están las guías', () => {
    // El glosario define; no legisla. Un número normativo sin fuente en la
    // definición se propaga citado y sin respaldo.
    for (const t of terminos) {
      const texto = [t.definicionCorta, ...t.definicion, t.comoSeMide ?? ''].join(' ');
      expect(texto, t.slug).not.toMatch(/artículo\s+\d+/i);
      expect(texto, t.slug).not.toMatch(/\bNTP\s*\d/i);
    }
  });

  it('comoSeMide describe magnitud y unidad, no un valor de producto', () => {
    for (const t of terminos) {
      if (!t.comoSeMide) continue;
      // Un valor concreto en una definición se vuelve especificación implícita.
      expect(t.comoSeMide, t.slug).not.toMatch(/\b\d+(?:[.,]\d+)?\s*(mm|g\/m²|kg|micras|mils)\b/);
    }
  });
});

describe('glosario: navegación y descubrimiento', () => {
  it('generateStaticParams cubre todos los términos', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(terminos.map((t) => t.slug).sort());
  });

  it('el índice alfabético no pierde ni duplica términos', () => {
    const agrupados = terminosPorLetra().flatMap((l) => l.items);
    expect(agrupados.length).toBe(terminos.length);
    expect(new Set(agrupados.map((t) => t.slug)).size).toBe(terminos.length);
  });

  it('los acentos no abren una letra propia en el índice', () => {
    for (const l of terminosPorLetra()) expect(l.letra).toMatch(/^[A-Z0-9]$/);
  });

  it('cada categoría presente tiene etiqueta y al menos un término', () => {
    for (const c of categoriasPresentes()) {
      expect(categoriaLabels[c]).toBeTruthy();
      expect(terminosPorCategoria(c).length).toBeGreaterThan(0);
    }
  });

  it('las búsquedas inversas por producto y por guía funcionan', () => {
    const conProducto = terminos.find((t) => t.productos?.length);
    expect(terminosParaProducto(conProducto!.productos![0])).toContain(conProducto);
    const conGuia = terminos.find((t) => t.guias?.length);
    expect(terminosParaGuia(conGuia!.guias![0])).toContain(conGuia);
  });

  it('el sitemap publica el índice y todos los términos', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/glosario`)).toBe(true);
    for (const t of terminos) {
      expect(urls.has(`${SITE.url}/glosario/${t.slug}`), t.slug).toBe(true);
    }
  });
});

describe('glosario: volcado legible por máquina', () => {
  const feed = JSON.parse(buildGlosarioJson());

  it('es un DefinedTermSet válido con un término por entrada', () => {
    expect(feed['@type']).toBe('DefinedTermSet');
    expect(feed.version).toBe(GLOSARIO_VERSION);
    expect(feed.hasDefinedTerm).toHaveLength(terminos.length);
    expect(feed.totalTerminos).toBe(terminos.length);
  });

  it('cada entrada trae su URL canónica y su termCode', () => {
    for (const [i, item] of feed.hasDefinedTerm.entries()) {
      expect(item.termCode).toBe(terminos[i].slug);
      expect(item.url).toBe(`${SITE.url}/glosario/${terminos[i].slug}`);
      expect(item['@type']).toBe('DefinedTerm');
    }
  });

  it('declara explícitamente cómo atribuir la cita', () => {
    // Si citar bien es el camino de menor resistencia, se cita bien.
    expect(feed.uso.atribucionSugerida).toContain(SITE.legalName);
    expect(feed.uso.atribucionSugerida).toContain(`${SITE.url}/glosario`);
    expect(feed.uso.licencia).toBeTruthy();
  });

  it('no filtra precios ni disponibilidad', () => {
    const texto = JSON.stringify(feed);
    expect(texto).not.toMatch(/"precio"|"price"|"stock"|"disponibilidad"/i);
  });

  it('todas las URLs del volcado heredan de SITE.url', () => {
    const urls = (JSON.stringify(feed).match(/https?:\/\/[^"]+/g) ?? []).filter(
      (u) => !u.startsWith('https://schema.org'),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });
});
P15_EOF

# -----------------------------------------------------------------------------
# lib/schema.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/schema.ts" <<'P15_EOF'
/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(offers ? { offers } : {}),
  };
}

/**
 * Glosario como conjunto de términos definidos.
 *
 * DefinedTermSet + DefinedTerm es el tipo que schema.org previó exactamente
 * para esto y que casi nadie usa. Declara que el sitio publica un vocabulario
 * del rubro con una URL estable por concepto: es la forma legible por máquina
 * de decir "acá se define este término", que es justo lo que un agente
 * necesita resolver antes de poder citar a alguien.
 */
export function definedTermSetSchema(set: {
  url: string;
  name: string;
  description: string;
  terms: { slug: string; termino: string; definicionCorta: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${set.url}#glosario`,
    name: set.name,
    description: set.description,
    url: set.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    hasDefinedTerm: set.terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${set.url}/${t.slug}#termino`,
      name: t.termino,
      description: t.definicionCorta,
      url: `${set.url}/${t.slug}`,
      termCode: t.slug,
      inDefinedTermSet: { "@id": `${set.url}#glosario` },
    })),
  };
}

/** Un término del glosario, citable por sí solo. */
export function definedTermSchema(t: {
  url: string;
  setUrl: string;
  termino: string;
  definicionCorta: string;
  termCode: string;
  /** Sigla y otras formas de nombrarlo: ayudan a resolver la desambiguación. */
  alternateNames?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${t.url}#termino`,
    name: t.termino,
    description: t.definicionCorta,
    url: t.url,
    termCode: t.termCode,
    inLanguage: SITE.language,
    inDefinedTermSet: { "@id": `${t.setUrl}#glosario` },
    ...(t.alternateNames?.length ? { alternateName: t.alternateNames } : {}),
  };
}
P15_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P15_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/**
 * Vista del registro fechado. Mide lo que ninguna otra métrica del sitio mide:
 * si la frescura sostiene el retorno de un comprador que ya nos conoce.
 */
export function trackNovedadView(slug: string): void {
  trackEvent('novedad_view', { slug });
}

/**
 * Vista de un término del glosario. Es el evento que revela intención
 * temprana: quien busca qué significa "geotextil" está especificando, no
 * comparando precios todavía.
 */
export function trackGlosarioView(slug: string): void {
  trackEvent('glosario_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P15_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P15_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackNovedadView,
  trackGlosarioView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'novedades'; slug: string }
  | { kind: 'glosario'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
      case 'novedades':
        trackNovedadView(props.slug);
        break;
      case 'glosario':
        trackGlosarioView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P15_EOF

# -----------------------------------------------------------------------------
# lib/novedades.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades.ts" <<'P15_EOF'
import { SITE } from './site';

/**
 * NOVEDADES — el registro fechado de lo que cambia en esta referencia.
 *
 * Qué es. Un feed cronológico de cada cambio publicado que altera lo que un
 * comprador puede especificar, comparar o descargar. Es el equivalente del
 * "What's New" de un proveedor de infraestructura: no es un blog, no opina,
 * no anuncia intenciones. Cada entrada apunta a algo que YA está en línea y
 * que el lector puede abrir en el mismo clic.
 *
 * Por qué existe. Una referencia sin fecha no se distingue de un folleto. El
 * comprador técnico que vuelve al sitio necesita responder en diez segundos
 * "¿qué hay acá que no estaba la última vez?", y los agentes y rastreadores
 * necesitan una señal de frescura que no sea un `lastmod` movido a mano en
 * cada deploy. Este archivo es esa señal, y es verificable: si una entrada
 * miente, el enlace la delata.
 *
 * Por qué es un MECANISMO y no una campaña. La regla es de proceso, no de
 * voluntad: todo cambio que agregue, modifique o retire una línea de producto,
 * una guía, un criterio del marco o una arquitectura de referencia entra acá
 * el mismo día, con su enlace. Nada más entra. Un feed que también publica
 * "felices fiestas" deja de ser consultable en tres meses.
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir una entrada:
 *  1. `fecha` es la fecha real de publicación del cambio. No se antedata para
 *     simular actividad ni se agrupa un mes de trabajo en un solo día.
 *  2. Toda entrada enlaza a la página que cambió. Sin enlace verificable no
 *     hay entrada (hay un test que valida cada href contra las rutas reales).
 *  3. No se anuncia lo que todavía no está desplegado. Nada de "próximamente".
 *  4. Las cifras históricas se congelan a propósito: "36 líneas" en una
 *     entrada de agosto describe el catálogo de ese día, no el de hoy. Por eso
 *     NO se derivan de lib/products.ts — un registro fechado que se reescribe
 *     solo deja de ser un registro.
 *  5. No se publican obras ejecutadas, clientes ni cifras de negocio. Este
 *     feed documenta la referencia pública, no la operación comercial.
 */

export type NovedadTipo = 'catalogo' | 'guia' | 'herramienta' | 'referencia';

export const tipoLabels: Record<NovedadTipo, string> = {
  catalogo: 'Catálogo',
  guia: 'Guía técnica',
  herramienta: 'Herramienta',
  referencia: 'Referencia del rubro',
};

/** Qué significa cada tipo, para que la etiqueta no dependa del contexto. */
export const tipoDescripciones: Record<NovedadTipo, string> = {
  catalogo: 'Cambios en las líneas de producto publicadas y en cómo se navegan.',
  guia: 'Guías de especificación e instalación nuevas o revisadas, con sus fuentes.',
  herramienta: 'Utilidades que producen un documento o una decisión: fichas, comparadores, autoevaluaciones.',
  referencia: 'Material que define criterios del rubro y es útil aunque el proyecto se compre a otro proveedor.',
};

export interface NovedadEnlace {
  label: string;
  href: string;
}

export interface Novedad {
  slug: string;
  /** Fecha real de publicación, ISO (YYYY-MM-DD). */
  fecha: string;
  tipo: NovedadTipo;
  titulo: string;
  /** Una frase. Alimenta la meta description, el RSS y el JSON Feed. */
  resumen: string;
  /** Qué cambia para quien especifica o compra. La razón para leer la entrada. */
  queCambia: string;
  detalle: string[];
  enlaces: NovedadEnlace[];
}

/**
 * Orden de escritura: cronológico ascendente (se agrega al final).
 * La exportación `novedades` lo invierte, de modo que agregar una entrada
 * nunca obliga a tocar las anteriores.
 */
const registro: Novedad[] = [
  {
    slug: 'silo-tecnico-recursos-primeras-guias',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Abre /recursos: guías de especificación con las fuentes a la vista',
    resumen:
      'Publicamos las primeras tres guías técnicas sobre big bags en minería, instalación de geomembranas HDPE y cálculo de caudal en mangas de ventilación.',
    queCambia:
      'Las decisiones que antes se resolvían por teléfono quedan escritas, con la norma o el método que las respalda citado y enlazado.',
    detalle: [
      'El catálogo respondía qué vendemos, no cómo se especifica. Las primeras tres guías cubren los tres puntos donde vimos fallar más proyectos: la estiba y el izaje de big bags en operación minera, el anclaje y la soldadura de geomembrana HDPE en pozas y canales, y el cálculo de caudal para dimensionar una manga de ventilación en labor subterránea.',
      'Cada cifra normativa lleva su fuente con URL. Donde no pudimos verificar el número de artículo de una norma vigente, la guía lo dice y remite al texto oficial en lugar de inventarlo. Los cálculos se publican como método reproducible de prediseño, no como memoria firmada.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Big bags en minería: normativa y errores de estiba',
        href: '/recursos/big-bags-mineria-peru-normativa-errores-estiba',
      },
      {
        label: 'Instalación de geomembranas HDPE en pozas y canales',
        href: '/recursos/instalacion-geomembranas-hdpe-pozas-canales',
      },
    ],
  },
  {
    slug: 'paginas-de-familia-con-criterios',
    fecha: '2026-08-17',
    tipo: 'catalogo',
    titulo: 'Las once familias del catálogo pasan a tener página propia',
    resumen:
      'Cada familia de producto tiene ahora URL estable, criterios de especificación, sectores que la compran y sus guías relacionadas.',
    queCambia:
      'Se puede enviar el enlace de una familia completa —con lo que gobierna su elección— en vez de once fichas sueltas o un catálogo filtrado que no se puede compartir.',
    detalle: [
      'La navegación por familia se resolvía filtrando el catálogo en el navegador, de modo que once mercados con intención distinta compartían una sola dirección. Ahora cada familia tiene su página: qué resuelve, qué define su especificación, con qué sectores se usa, cómo la abastecemos y en qué estado está la oferta.',
      'El dato de abastecimiento y disponibilidad sale del catálogo, no de una redacción de marketing: si una línea es de fabricación propia, importación directa o bajo pedido, la página lo declara.',
    ],
    enlaces: [
      { label: 'Catálogo por familia', href: '/productos' },
      { label: 'Envases y embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y cobertores', href: '/productos/familia/lonas-cobertores' },
    ],
  },
  {
    slug: 'siete-guias-nuevas-silo-a-diez',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Siete guías nuevas: el silo técnico llega a diez',
    resumen:
      'Ventilación impelente frente a aspirante, elección de geotextil, densidad de malla antiáfida, carga de viento en carpas, transporte de concentrado, tanques flexibles y cálculo de mulch.',
    queCambia:
      'Las siete decisiones que más veces nos llegan mal definidas quedan documentadas con su criterio y su fuente, disponibles antes de pedir cotización.',
    detalle: [
      'Cada guía nueva nació de un modo de falla real observado en obra, no de una lista de palabras clave: la manga aspirante sin refuerzo que colapsa, la malla cerrada que sube la temperatura del cultivo porque nadie recalculó la ventilación, la carpa dimensionada sin la carga de viento de la norma E.020.',
      'Ese mismo patrón es el que después se formalizó como Marco de Especificación: un modo de falla documentado se convierte en un criterio verificable.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Ventilación impelente vs. aspirante en labores mineras',
        href: '/recursos/ventilacion-impelente-vs-aspirante-labores-mineras',
      },
      {
        label: 'Carpas industriales: carga de viento y norma E.020',
        href: '/recursos/carpas-industriales-carga-viento-norma-e020',
      },
    ],
  },
  {
    slug: 'fichas-tecnicas-pdf-descargables',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Ficha técnica en PDF descargable para las 36 líneas del catálogo',
    resumen:
      'Cada producto genera su ficha en PDF desde el mismo catálogo que alimenta la web: especificaciones, aplicaciones, sectores, abastecimiento y disponibilidad.',
    queCambia:
      'El expediente técnico se arma sin esperar respuesta comercial, y la ficha nunca contradice a la página porque ambas salen de la misma fuente.',
    detalle: [
      'En una compra industrial la ficha se adjunta a un expediente, se reenvía a un jefe de planta y se archiva. Pedirla por correo agrega un día al ciclo y produce versiones que se desactualizan solas.',
      'El PDF se genera desde lib/products.ts en tiempo de compilación, así que no existe una versión "de marketing" divergente. La ficha no declara certificaciones ni números de lote: esos documentos los emite el fabricante y se entregan con la cotización.',
    ],
    enlaces: [
      { label: 'Catálogo completo', href: '/productos' },
      {
        label: 'Ejemplo: ficha de big bags de polipropileno',
        href: '/productos/big-bags-bolsones-polipropileno',
      },
    ],
  },
  {
    slug: 'comparador-lado-a-lado-por-familia',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Comparador lado a lado dentro de cada familia',
    resumen:
      'Las familias con dos o más líneas tienen una tabla comparativa con las especificaciones enfrentadas y el criterio que decide entre ellas.',
    queCambia:
      'La comparación deja de hacerse abriendo pestañas en paralelo, y la cotización se arma con las alternativas ya seleccionadas.',
    detalle: [
      'Comparar era el paso que el sitio dejaba al cliente: abrir varias fichas, copiar especificaciones a una hoja y perder por el camino el criterio que realmente decide. La tabla enfrenta las líneas de una misma familia campo por campo.',
      'Desde la comparativa se pasa a la cotización con las alternativas ya cargadas, de modo que la consulta llega con la especificación puesta y no como "necesito lonas".',
    ],
    enlaces: [
      {
        label: 'Comparar lonas y cobertores',
        href: '/productos/familia/lonas-cobertores/comparar',
      },
      { label: 'Catálogo por familia', href: '/productos' },
    ],
  },
  {
    slug: 'marco-de-especificacion-v1',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Publicamos el Marco de Especificación v1.0: 26 criterios en 6 pilares',
    resumen:
      'Un conjunto público de criterios para definir un proyecto textil industrial o geosintético antes de cotizarlo, con autoevaluación y brief descargable.',
    queCambia:
      'Existe un estándar escrito contra el cual medir cualquier propuesta —incluida la nuestra— y una autoevaluación que dice qué falta definir antes de pedir precios.',
    detalle: [
      'Los proyectos rara vez fallan por el material: fallan por lo que nadie definió. El marco convierte cada modo de falla documentado en nuestras guías en una pregunta verificable, agrupada en seis pilares: compatibilidad, cargas, exposición, ejecución, documentación y operación.',
      'La autoevaluación puntúa cuán definido está el proyecto del cliente, no a los proveedores: no es un ranking disfrazado. El brief se genera en el navegador y las respuestas no se envían a ningún servidor.',
      'Es útil aunque el proyecto termine comprándose a un competidor. Esa es exactamente la razón por la que un criterio publicado se convierte en referencia y una lista de ventajas propias no.',
    ],
    enlaces: [
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Autoevaluación con brief descargable', href: '/marco/evaluacion' },
    ],
  },
  {
    slug: 'seis-arquitecturas-de-referencia',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Seis arquitecturas de referencia: el conjunto armado, no la pieza suelta',
    resumen:
      'Poza revestida, frente de avance ventilado, despacho de concentrado a granel, protección de cultivo, almacenamiento de agua en operación remota y campamento con almacén temporal.',
    queCambia:
      'Quien necesita resolver un escenario completo ve la lista de materiales entera, el orden de ejecución y qué falla al comprar por piezas sueltas.',
    detalle: [
      'El catálogo vendía componentes y nunca mostraba el conjunto montado. Un jefe de proyecto que debe revestir una poza de proceso no busca "geomembrana HDPE 1.5 mm": busca la poza, y descubre tarde que faltaba el geotextil de protección o el detalle de anclaje.',
      'Cada arquitectura publica su escenario, la lista de materiales donde cada componente declara el criterio que lo gobierna, la secuencia de ejecución, los riesgos frecuentes y las guías que documentan cada paso.',
      'No son casos de estudio. No declaran obras ejecutadas, clientes ni cifras: describen configuraciones técnicas verificables contra el catálogo.',
    ],
    enlaces: [
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      {
        label: 'Poza de proceso revestida',
        href: '/soluciones/poza-revestida-impermeabilizacion',
      },
      { label: 'Frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    ],
  },
  {
    slug: 'glosario-tecnico-del-rubro',
    fecha: '2026-08-20',
    tipo: 'referencia',
    titulo: 'Publicamos el glosario técnico: 43 términos con URL propia',
    resumen:
      'Vocabulario del rubro definido con precisión —qué significa cada término, en qué unidad se mide y qué decide en obra— con versión legible por máquina.',
    queCambia:
      'Deja de hacer falta deducir el vocabulario del contexto: cada término tiene su definición canónica, su unidad de medida y el enlace a las guías y productos donde manda.',
    detalle: [
      'El sitio respondía qué vendemos, qué línea sirve, cómo se especifica, cómo se arma el conjunto y qué cambió. No respondía la pregunta anterior a todas: qué significa esta palabra. Es la que alguien escribe en un buscador antes de poder pedir nada.',
      'Cada término declara su definición en una sola frase autosuficiente, su desarrollo, la magnitud y unidad con que se expresa, qué decide en obra y el error frecuente que resuelve. Los términos se enlazan entre sí, con las guías que los desarrollan y con los productos donde gobiernan la especificación.',
      'Las definiciones describen el término en el rubro, no nuestros productos: son útiles aunque el proyecto se compre a otro proveedor. Ninguna incluye cifras normativas — para eso están las guías, que citan su fuente.',
      'Se publica además en formato de datos, con instrucción explícita de atribución, para que citarlo correctamente sea el camino de menor resistencia.',
    ],
    enlaces: [
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Geotextil', href: '/glosario/geotextil' },
      { label: 'Tipos electrostáticos de FIBC', href: '/glosario/tipo-electrostatico-fibc' },
      { label: 'Ventilación impelente', href: '/glosario/ventilacion-impelente' },
    ],
  },
];

/** Novedades de la más reciente a la más antigua. */
export const novedades: Novedad[] = [...registro].sort((a, b) =>
  a.fecha === b.fecha ? registro.indexOf(b) - registro.indexOf(a) : b.fecha.localeCompare(a.fecha),
);

export const novedadBySlug = (slug: string): Novedad | undefined =>
  novedades.find((n) => n.slug === slug);

/** Fecha de la última novedad: señal de frescura para sitemap y feeds. */
export const NOVEDADES_UPDATED: string = novedades[0]?.fecha ?? '';

/** Tipos presentes, en el orden en que se declaran las etiquetas. */
export const tiposPresentes = (): NovedadTipo[] =>
  (Object.keys(tipoLabels) as NovedadTipo[]).filter((t) => novedades.some((n) => n.tipo === t));

export const novedadesPorTipo = (tipo: NovedadTipo): Novedad[] =>
  novedades.filter((n) => n.tipo === tipo);

/** Agrupa por mes para el índice, conservando el orden descendente. */
export function novedadesPorMes(): { mes: string; etiqueta: string; items: Novedad[] }[] {
  const meses = new Map<string, Novedad[]>();
  for (const n of novedades) {
    const mes = n.fecha.slice(0, 7);
    const acc = meses.get(mes);
    if (acc) acc.push(n);
    else meses.set(mes, [n]);
  }
  return [...meses.entries()].map(([mes, items]) => ({
    mes,
    etiqueta: etiquetaDeMes(mes),
    items,
  }));
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-08" → "agosto de 2026". Setiembre con "t": uso peruano. */
export function etiquetaDeMes(mes: string): string {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} de ${anio}`;
}

/** "2026-08-19" → "19 de agosto de 2026". Sin Intl: la salida debe ser estable. */
export function fechaLarga(fecha: string): string {
  const [anio, m, d] = fecha.split('-');
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${anio}`;
}

export const novedadUrl = (slug: string): string => `${SITE.url}/novedades/${slug}`;
P15_EOF

# -----------------------------------------------------------------------------
# test/novedades.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/novedades.test.ts" <<'P15_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  novedades,
  novedadBySlug,
  novedadesPorMes,
  novedadesPorTipo,
  tipoLabels,
  tipoDescripciones,
  tiposPresentes,
  fechaLarga,
  etiquetaDeMes,
  NOVEDADES_UPDATED,
} from '@/lib/novedades';
import { buildRss, buildJsonFeed, escapeXml, toRfc822 } from '@/lib/novedades-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { familyContent, comparableFamilies } from '@/lib/families';
import { terminos } from '@/lib/glosario';
import { generateStaticParams } from '@/app/novedades/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El registro fechado sólo vale si no se puede mentir en él sin romper la
 * compilación. Estos tests son el mecanismo: validan que cada enlace resuelva
 * a una ruta real del sitio, que ninguna entrada esté fechada en el futuro y
 * que los feeds sean documentos válidos.
 */

/** Todas las rutas internas que el sitio realmente publica. */
const rutasValidas = new Set<string>([
  '/',
  '/productos',
  '/servicios',
  '/nosotros',
  '/contacto',
  '/cotizacion',
  '/local',
  '/recursos',
  '/marco',
  '/marco/evaluacion',
  '/soluciones',
  '/novedades',
  '/glosario',
  ...products.map((p) => `/productos/${p.slug}`),
  ...articles.map((a) => `/recursos/${a.slug}`),
  ...solutions.map((s) => `/soluciones/${s.slug}`),
  ...familyContent.map((f) => `/productos/familia/${f.slug}`),
  ...comparableFamilies().map((f) => `/productos/familia/${f.slug}/comparar`),
  ...novedades.map((n) => `/novedades/${n.slug}`),
  ...terminos.map((t) => `/glosario/${t.slug}`),
]);

describe('novedades: el registro no puede mentir', () => {
  it('cada enlace de cada entrada resuelve a una ruta que existe', () => {
    // Sin esto, una entrada puede anunciar algo que no se desplegó. El enlace
    // roto es exactamente la forma en que un registro fechado pierde su valor.
    for (const n of novedades) {
      expect(n.enlaces.length, `${n.slug} sin enlaces`).toBeGreaterThan(0);
      for (const e of n.enlaces) {
        expect(rutasValidas.has(e.href), `${n.slug} → ${e.href}`).toBe(true);
      }
    }
  });

  it('ninguna entrada está fechada en el futuro', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    for (const n of novedades) {
      expect(n.fecha <= hoy, `${n.slug} fechada ${n.fecha}`).toBe(true);
    }
  });

  it('las fechas son ISO estrictas (YYYY-MM-DD) y parseables', () => {
    for (const n of novedades) {
      expect(n.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${n.fecha}T12:00:00Z`))).toBe(false);
    }
  });

  it('el orden es estrictamente descendente por fecha', () => {
    for (let i = 1; i < novedades.length; i++) {
      expect(novedades[i - 1].fecha >= novedades[i].fecha).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const n of novedades) {
      expect(n.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(n.slug), `slug duplicado: ${n.slug}`).toBe(false);
      vistos.add(n.slug);
    }
  });

  it('cada entrada declara qué cambia para quien especifica', () => {
    // Un registro que sólo dice "publicamos X" obliga al lector a deducir por
    // qué debería importarle. Ese campo es obligatorio por eso.
    for (const n of novedades) {
      expect(n.queCambia.length, n.slug).toBeGreaterThan(40);
      expect(n.detalle.length, n.slug).toBeGreaterThan(0);
    }
  });

  it('el resumen cabe como meta description', () => {
    for (const n of novedades) {
      expect(n.resumen.length, `${n.slug}: ${n.resumen.length}`).toBeLessThanOrEqual(200);
      expect(n.resumen.length).toBeGreaterThan(50);
    }
  });

  it('no se anuncia lo que todavía no está publicado', () => {
    // "Próximamente" convierte el registro en una lista de intenciones.
    const prohibido = /pr[óo]ximamente|muy pronto|estamos trabajando|en desarrollo|pr[óo]xima versi[óo]n/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('no se declaran obras ejecutadas, clientes ni cifras de negocio', () => {
    const prohibido = /nuestro cliente|caso de éxito|caso de exito|facturaci[óo]n|ventas por|premio|certificad[oa]s? por/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('cada tipo declarado tiene etiqueta y descripción', () => {
    for (const n of novedades) {
      expect(tipoLabels[n.tipo], n.slug).toBeTruthy();
      expect(tipoDescripciones[n.tipo], n.slug).toBeTruthy();
    }
    for (const t of tiposPresentes()) {
      expect(novedadesPorTipo(t).length).toBeGreaterThan(0);
    }
  });
});

describe('novedades: rutas y descubrimiento', () => {
  it('generateStaticParams cubre todas las entradas', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(novedades.map((n) => n.slug).sort());
  });

  it('novedadBySlug encuentra cada entrada y rechaza las inexistentes', () => {
    for (const n of novedades) expect(novedadBySlug(n.slug)?.titulo).toBe(n.titulo);
    expect(novedadBySlug('no-existe')).toBeUndefined();
  });

  it('el sitemap incluye el índice y todas las entradas con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/novedades`)).toBe(true);
    for (const n of novedades) {
      const lastMod = urls.get(`${SITE.url}/novedades/${n.slug}`);
      expect(lastMod, n.slug).toBeDefined();
      // La fecha del sitemap es la de publicación, no la del despliegue: un
      // lastmod movido en cada deploy le enseña a Google a ignorarlo.
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(n.fecha);
    }
  });

  it('el índice agrupa por mes sin perder ni duplicar entradas', () => {
    const agrupadas = novedadesPorMes().flatMap((m) => m.items);
    expect(agrupadas.map((n) => n.slug)).toEqual(novedades.map((n) => n.slug));
  });

  it('NOVEDADES_UPDATED es la fecha de la entrada más reciente', () => {
    expect(NOVEDADES_UPDATED).toBe(novedades[0].fecha);
  });

  it('las fechas se formatean en español peruano sin depender de Intl', () => {
    expect(fechaLarga('2026-08-19')).toBe('19 de agosto de 2026');
    expect(fechaLarga('2026-09-01')).toBe('1 de setiembre de 2026');
    expect(etiquetaDeMes('2026-08')).toBe('agosto de 2026');
  });
});

describe('novedades: descubrimiento del feed en todo el sitio', () => {
  const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

  it('el <head> raíz declara el feed RSS en JSX, no en metadata.alternates', () => {
    // Cada página define su propio alternates.canonical y Next reemplaza el
    // objeto entero: puesto en metadata, el enlace del feed sólo sobrevivía en
    // /novedades. Se verificó midiendo el HTML renderizado, no leyendo la API.
    expect(layout).toMatch(/rel="alternate"/);
    expect(layout).toMatch(/type="application\/rss\+xml"/);
    expect(layout).toMatch(/novedades\/rss\.xml/);
  });

  it('la URL del feed se deriva de SITE.url y no está escrita a mano', () => {
    expect(layout).toMatch(/\$\{SITE\.url\}\/novedades\/rss\.xml/);
    expect(layout).not.toContain('https://plastilonas.com');
  });
});

describe('novedades: feeds', () => {
  const rss = buildRss();

  it('escapa los caracteres que rompen el XML', () => {
    expect(escapeXml('Lonas & "cobertores" <1.5 mm>')).toBe(
      'Lonas &amp; &quot;cobertores&quot; &lt;1.5 mm&gt;',
    );
  });

  it('el RSS declara cabecera, canal y un item por entrada', () => {
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain('<rss version="2.0"');
    expect((rss.match(/<item>/g) ?? []).length).toBe(novedades.length);
    expect((rss.match(/<\/item>/g) ?? []).length).toBe(novedades.length);
  });

  it('el RSS no contiene ampersands sin escapar', () => {
    // Un solo & crudo invalida el documento entero para cualquier lector.
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it('todas las URLs del feed heredan de SITE.url', () => {
    // Nunca se codifica el dominio a mano: el día de la migración a
    // plastilonas.com debe bastar con cambiar lib/site.ts. Se exceptúan los
    // espacios de nombres XML, que son identificadores y no direcciones.
    const NAMESPACES = ['http://www.w3.org/'];
    for (const n of novedades) {
      expect(rss).toContain(`${SITE.url}/novedades/${n.slug}`);
    }
    const urls = (rss.match(/https?:\/\/[^\s"'<>]+/g) ?? []).filter(
      (u) => !NAMESPACES.some((ns) => u.startsWith(ns)),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });

  it('las fechas del RSS son RFC 822 y no se corren de día en Lima', () => {
    // Con 00:00Z un lector en UTC-5 muestra la entrada el día anterior.
    expect(toRfc822('2026-08-19')).toBe('Wed, 19 Aug 2026 12:00:00 GMT');
    for (const n of novedades) expect(rss).toContain(toRfc822(n.fecha));
  });

  it('el JSON Feed es válido y expone las mismas entradas', () => {
    const feed = JSON.parse(buildJsonFeed());
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.items).toHaveLength(novedades.length);
    expect(feed.feed_url).toBe(`${SITE.url}/novedades/feed.json`);
    for (const [i, item] of feed.items.entries()) {
      expect(item.id).toBe(`${SITE.url}/novedades/${novedades[i].slug}`);
      expect(item.date_published).toBe(`${novedades[i].fecha}T12:00:00Z`);
      expect(item.content_text.length).toBeGreaterThan(0);
    }
  });
});
P15_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P15_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";
import { terminos } from "@/lib/glosario";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  // Glosario: la capa definicional. Prioridad alta en el índice porque es la
  // puerta de entrada de las búsquedas de definición, y media en cada término.
  const glosarioRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/glosario`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t) => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: now, changeFrequency: "yearly" as const, priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...glosarioRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P15_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P15_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";
import { terminos, categoriaLabels, categoriasPresentes, terminosPorCategoria } from "@/lib/glosario";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Glosario técnico (vocabulario del rubro)

${terminos.length} términos con URL canónica por concepto: qué significa cada uno, en
qué unidad se mide y qué decide en obra. Las definiciones describen el término
en el rubro, no nuestros productos, y son útiles con independencia del
proveedor. Versión legible por máquina, con instrucción de atribución
incluida: ${base}/glosario/terminos.json

- [Glosario completo](${base}/glosario)
${categoriasPresentes()
  .map((c) => `- ${categoriaLabels[c]}: ${terminosPorCategoria(c).map((t) => `[${t.termino}](${base}/glosario/${t.slug})`).join(", ")}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Política de privacidad](${base}/privacidad)
- [Términos y condiciones](${base}/terminos)
- [Novedades](${base}/novedades)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Glosario en JSON](${base}/glosario/terminos.json)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P15_EOF

# -----------------------------------------------------------------------------
# app/productos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/productos/[slug]"
cat > "app/productos/[slug]/page.tsx" <<'P15_EOF'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';
import ProductGallery from '@/components/ProductGallery';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import DatasheetButton from '@/components/DatasheetButton';
import { solutionsForProduct } from '@/lib/solutions';
import { terminosParaProducto } from '@/lib/glosario';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, ...product.sector, 'Perú', 'proveedor', 'fabricante'],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const faqs = productFaqs(product);
  const arquitecturas = solutionsForProduct(product.slug);
  const glosarioRel = terminosParaProducto(product.slug);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppLink
              context={`producto:${product.slug}`}
              message={`Hola, necesito una cotización de ${product.name}.`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </WhatsAppLink>
            <DatasheetButton slug={product.slug} nombre={product.name} />
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Capa definicional: los términos que gobiernan esta especificación.
          Un comprador que no sabe qué es "factor de seguridad" no puede
          evaluar la ficha, por completa que esté. */}
      {glosarioRel.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Qué hay que entender antes de especificarlo
          </h2>
          <p className="text-gray-600 mb-6">
            Los términos que deciden esta compra, definidos con precisión y sin
            promoción. Sirven igual si termina comprándolo en otra parte.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {arquitecturas.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Dónde encaja este producto
          </h2>
          <p className="text-gray-600 mb-6">
            Rara vez se compra solo. Estas configuraciones muestran el conjunto completo
            del que forma parte, con su secuencia de ejecución.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {arquitecturas.map((s) => (
              <Link
                key={s.slug}
                href={`/soluciones/${s.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {s.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{s.escenario}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# app/recursos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/recursos/[slug]"
cat > "app/recursos/[slug]/page.tsx" <<'P15_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { terminosParaGuia } from '@/lib/glosario';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Plantilla de artículo técnico.
 *
 * Emite TechArticle + WebPage + BreadcrumbList + FAQPage y, cuando el artículo
 * define una secuencia real, HowTo. Todo el contenido estructurado tiene
 * contraparte visible en la página: schema sin contenido visible es una
 * infracción de las directrices de resultados enriquecidos.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const url = `${SITE.url}/recursos/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: [a.category, ...a.sectors, 'Perú', 'guía técnica'],
    alternates: { canonical: `/recursos/${a.slug}` },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.description,
    },
  };
}

function countWords(text: string[]): number {
  return text.join(' ').split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const url = `${SITE.url}/recursos/${a.slug}`;
  const relatedProducts = a.relatedProducts
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const glosarioRel = terminosParaGuia(slug);
  const relatedCities = (a.relatedCities ?? [])
    .map((s) => (ciudades as { slug: string; ciudad: string }[]).find((c) => c.slug === s))
    .filter((c): c is { slug: string; ciudad: string } => Boolean(c));

  const wordCount = countWords([
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.body ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
    ]),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="article" slug={a.slug} categoria={a.category} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: a.title,
            description: a.description,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: a.title,
            description: a.description,
            datePublished: a.datePublished,
            dateModified: a.dateModified,
            section: a.category,
            keywords: [a.category, ...a.sectors],
            wordCount,
            citations: a.sources.map((s) => ({ label: s.label, url: s.url })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: `${SITE.url}/recursos` },
              { name: a.title, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(a.faqs, url),
          ...(a.howTo
            ? [
                howToSchema({
                  url,
                  name: a.howTo.name,
                  description: a.description,
                  totalTime: a.howTo.totalTime,
                  steps: a.howTo.steps,
                }),
              ]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/recursos" className="hover:text-[#059669]">
          Recursos técnicos
        </Link>{' '}
        / <span className="text-gray-700">{a.category}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
          {a.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {a.readingMinutes} min de lectura
        </span>
        <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {a.title}
      </h1>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        {a.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Resumen ejecutivo: lo primero que un motor o un agente extrae. */}
      <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          En resumen
        </h2>
        <ul className="space-y-3 text-gray-800">
          {a.keyTakeaways.map((k) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1 text-[#059669]">→</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {/* Índice */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Contenido
        </h2>
        <ol className="space-y-2 text-sm">
          {a.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#seccion-${i + 1}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#preguntas-frecuentes" className="text-gray-700 hover:text-[#059669]">
              Preguntas frecuentes
            </a>
          </li>
        </ol>
      </nav>

      {a.sections.map((s, i) => (
        <section key={s.heading} id={`seccion-${i + 1}`} className="mb-12 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.body?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.list && (
            <ul className="mb-4 space-y-2 text-gray-700">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#059669]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="mb-4 space-y-3 text-gray-700">
              {s.steps.map((item, n) => (
                <li key={item} id={`paso-${n + 1}`} className="flex gap-3 scroll-mt-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-semibold text-[#059669]">
                    {n + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {s.table.caption && (
                  <caption className="mb-2 text-left text-xs text-gray-500">
                    {s.table.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-gray-200">
                    {s.table.headers.map((h) => (
                      <th key={h} className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-gray-100 last:border-none">
                      {row.map((cell) => (
                        <td key={cell} className="py-3 pr-6 align-top text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.callout && (
            <p className="rounded-2xl border-l-4 border-[#059669] bg-gray-50 p-5 text-gray-800">
              {s.callout}
            </p>
          )}
        </section>
      ))}

      <section id="preguntas-frecuentes" className="mb-12 scroll-mt-24 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {a.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-12 border-t pt-10">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Cada fuente indica qué dato concreto respalda. Las cifras normativas deben
          verificarse contra el texto oficial vigente antes de usarse en una memoria de
          cálculo o en un expediente técnico.
        </p>
        <ol className="space-y-4 text-sm">
          {a.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-gray-600">{s.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vocabulario de la guía: la definición canónica de cada término que el
          artículo usa, para que no haya que deducirla del contexto. */}
      {glosarioRel.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos de esta guía
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Cada uno tiene su definición canónica, con la unidad en que se mide y lo
            que decide en obra.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Productos relacionados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/productos/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {p.shortDescription}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Cobertura relacionada
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {c.ciudad}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Lo aplicamos a su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales de su operación y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/recursos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Más recursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# components/Navbar.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Navbar.tsx" <<'P15_EOF'
'use client';

import React, { useState } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/glosario', label: 'Glosario' },
  { href: '/marco', label: 'Marco' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                                  {fam.name}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                                  {fam.tagline}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
                        <button
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P15_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/glosario" className="hover:text-white transition-colors">Glosario técnico</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P15_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P15_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['glosario', '/glosario'],
  ['termino', '/glosario/geotextil'],
  ['novedades', '/novedades'],
  ['privacidad', '/privacidad'],
  ['terminos', '/terminos'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P15_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P15_EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo "  Revise el build en el panel de Vercel antes de dar nada por roto."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /privacidad /terminos; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /version.json

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"
contiene "/glosario" '"@type":"DefinedTermSet"' "el glosario emite DefinedTermSet"
contiene "/glosario/geotextil" '"@type":"DefinedTerm"' "cada término emite DefinedTerm"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"
contiene "/llms.txt" 'Glosario técnico' "llms.txt declara el glosario"
contiene "/glosario/terminos.json" 'atribucionSugerida' "el volcado declara cómo citarlo"

echo "— Ningún dato inventado a la vista —"
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P15_EOF

chmod +x scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
echo ""
echo "P15 aplicado."
echo "  nuevos      lib/glosario.ts (43 terminos), lib/glosario-feed.ts"
echo "              app/glosario/page.tsx"
echo "              app/glosario/[slug]/page.tsx"
echo "              app/glosario/terminos.json/route.ts"
echo "              test/glosario.test.ts"
echo "  modificados lib/schema.ts (DefinedTermSet), lib/analytics.ts,"
echo "              components/TrackView.tsx, lib/novedades.ts,"
echo "              test/novedades.test.ts, app/sitemap.ts,"
echo "              app/llms.txt/route.ts, ficha de producto, pagina de guia,"
echo "              Navbar, Footer, audit-ui.mjs, verificar-despliegue.sh"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 242 tests en 18 archivos, 206 paginas)"
echo ""
echo "Y despues del push:"
echo "  npm run verify:deploy      (esperado: 38 correctas, 0 fallos)"
