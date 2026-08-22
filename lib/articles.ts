import { SITE } from './site';

/**
 * SILO DE CONTENIDO TÉCNICO (/recursos).
 *
 * Los artículos son datos tipados, no MDX: el catálogo ya sigue ese patrón
 * (lib/products.ts), evita añadir dependencias de compilación y permite que los
 * tests validen el contenido (slugs, referencias a productos, fuentes, FAQs).
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir un artículo:
 *  1. Toda cifra normativa lleva su fuente en `sources` con URL real. Si no se
 *     pudo verificar el número de artículo de una norma, NO se inventa: se cita
 *     la norma y se indica al lector que confirme contra el texto vigente.
 *  2. Ningún artículo declara certificaciones, ensayos ni proyectos propios que
 *     no existan. La experiencia se expresa como criterio técnico, no como
 *     credencial inventada.
 *  3. Los cálculos publicados son métodos de ingeniería reproducibles; se
 *     presentan como orden de magnitud para prediseño, no como memoria de
 *     cálculo firmada.
 *  4. `relatedProducts` debe referenciar slugs que existan en lib/products.ts
 *     (hay un test que lo verifica).
 */

export interface ArticleTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface ArticleSection {
  heading: string;
  /** Párrafos de texto corrido. */
  body?: string[];
  /** Lista de viñetas. */
  list?: string[];
  /** Lista numerada (pasos, secuencias). */
  steps?: string[];
  table?: ArticleTable;
  /** Nota destacada: advertencia, error frecuente o criterio de decisión. */
  callout?: string;
}

export interface ArticleSource {
  label: string;
  url: string;
  /** Qué dato concreto respalda esta fuente. */
  supports: string;
}

export interface ArticleHowTo {
  name: string;
  /** Duración total en formato ISO 8601 (ej. "PT8H"). Opcional. */
  totalTime?: string;
  steps: { name: string; text: string }[];
}

export interface Article {
  slug: string;
  /** H1 de la página. */
  title: string;
  /** Title de <head>, más corto y con intención de búsqueda. */
  metaTitle: string;
  description: string;
  /** ISO 8601 (YYYY-MM-DD). */
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  category: string;
  sectors: string[];
  /** Resumen ejecutivo: lo primero que un LLM cita. Frases completas. */
  keyTakeaways: string[];
  intro: string[];
  sections: ArticleSection[];
  howTo?: ArticleHowTo;
  faqs: { q: string; a: string }[];
  /** Slugs de lib/products.ts. */
  relatedProducts: string[];
  /** Slugs de data/ciudades.json. */
  relatedCities?: string[];
  sources: ArticleSource[];
}

export const articles: Article[] = [
  // ===========================================================================
  {
    slug: 'big-bags-mineria-peru-normativa-errores-estiba',
    title:
      'Big Bags para minería en el Perú: qué exige la normativa y los 7 errores de estiba que rompen bolsones',
    metaTitle: 'Big Bags en minería: ISO 21898 y errores de estiba',
    description:
      'Factor de seguridad 5:1 vs 6:1, la exigencia de certificación ISO 21898:2004 en el Puerto del Callao desde 2023, y los siete errores de manipulación y estiba que causan la mayoría de las roturas de big bags en operaciones mineras peruanas.',
    datePublished: '2026-08-17',
    dateModified: '2026-08-17',
    readingMinutes: 11,
    category: 'Envases y Embalaje',
    sectors: ['Minería', 'Logística', 'Transporte'],
    keyTakeaways: [
      'El factor de seguridad (5:1 o 6:1) no es una medida de calidad del tejido: define cuántas veces la carga de trabajo segura resiste el bolsón antes de fallar, y qué usos permite (un solo uso vs. uso repetido).',
      'APM Terminals Callao exige, desde el 1 de enero de 2023, certificación de fabricación conforme a ISO 21898:2004 para los bolsones que ingresan al terminal.',
      'La mayoría de las roturas en operación minera no vienen del tejido sino de la manipulación: izaje con una sola asa, uñas de montacargas sin protección, apilado sin arriostre y exposición UV prolongada antes del despacho.',
      'La carga de trabajo segura (SWL) impresa en la etiqueta es el único número que gobierna la operación; el "peso del big bag" que se comenta en planta no es un dato normativo.',
    ],
    intro: [
      'Un big bag roto en cancha no es un problema de empaque: es concentrado en el piso, una parada de despacho, una investigación de seguridad y, si ocurre durante un izaje, un incidente con potencial de lesión grave. En operaciones mineras peruanas el bolsón es un elemento de izaje tanto como un envase, y esa doble naturaleza es exactamente lo que se pierde de vista cuando se compra por precio unitario.',
      'Este artículo separa lo que la normativa exige de lo que la práctica de campo demuestra, con el detalle que necesita un comprador técnico: qué significan realmente 5:1 y 6:1, qué documento pide el terminal portuario, y por qué siete patrones concretos de manipulación explican la mayor parte de las fallas que terminan en un reclamo al proveedor.',
    ],
    sections: [
      {
        heading: 'Qué es realmente el factor de seguridad 5:1 y 6:1',
        body: [
          'El factor de seguridad de un FIBC (Flexible Intermediate Bulk Container, el nombre técnico del big bag) es la relación entre la carga que el bolsón resiste en ensayo antes de fallar y su carga de trabajo segura declarada. Un bolsón 5:1 con SWL de 1000 kg debe soportar 5000 kg en el ensayo de ciclos; uno 6:1, 6000 kg.',
          'La confusión frecuente en planta es tratar el factor como un indicador de "calidad del tejido". No lo es. Es un criterio de uso: la relación 5:1 corresponde a bolsones de un solo uso, mientras que 6:1 es la relación asociada a bolsones diseñados para uso múltiple, donde el envase vuelve a cargarse tras una inspección. Comprar 5:1 y reutilizar es la decisión que precede a la mayoría de las roturas "inexplicables".',
        ],
        table: {
          caption: 'Criterio de selección por relación de seguridad',
          headers: ['Relación', 'Uso previsto', 'Implicancia operativa'],
          rows: [
            [
              '5:1',
              'Un solo uso',
              'Se descarta tras vaciar. Reutilizarlo anula la premisa de diseño y el respaldo del fabricante.',
            ],
            [
              '6:1',
              'Uso múltiple',
              'Requiere procedimiento de inspección documentado antes de cada recarga: asas, costuras, tejido, contaminación.',
            ],
          ],
        },
        callout:
          'El número que gobierna la operación es la SWL (carga de trabajo segura) impresa en la etiqueta, no la capacidad nominal que se menciona en la orden de compra.',
      },
      {
        heading: 'La exigencia documental que sorprende en el Callao',
        body: [
          'Desde el 1 de enero de 2023, APM Terminals Callao requiere que los bolsones que ingresan al terminal cuenten con certificación de fabricación conforme a la norma ISO 21898:2004, junto con el cumplimiento de las disposiciones de seguridad y salud en puertos de la OIT.',
          'La consecuencia práctica es directa: si su cadena de exportación pasa por el terminal, el certificado del fabricante deja de ser un documento "deseable" en la carpeta de calidad y pasa a ser un requisito de ingreso. Conviene exigirlo en la etapa de cotización, no cuando el contenedor ya está en camino.',
        ],
        list: [
          'Solicite el certificado de fabricación referido a ISO 21898 al proveedor, por lote.',
          'Verifique que la etiqueta del bolsón declare SWL, relación de seguridad y fabricante.',
          'Archive la trazabilidad por lote: es lo primero que se pide tras un incidente de izaje.',
        ],
      },
      {
        heading: 'Los 7 errores de estiba y manipulación que rompen bolsones',
        steps: [
          'Izar con menos asas de las diseñadas. Un bolsón de cuatro asas izado de dos concentra el esfuerzo en la mitad de las costuras y en un ángulo para el que no fue ensayado. Es la causa individual más frecuente de rotura por desgarro en el faldón superior.',
          'Ángulo de izaje excesivo. Las asas deben trabajar lo más verticales posible. Un ángulo abierto (eslingas cortas, gancho bajo) aumenta la tensión efectiva sobre cada asa muy por encima del peso izado.',
          'Uñas de montacargas sin protección ni radio. El canto vivo de la uña actúa como cuchilla sobre el tejido cuando el operador introduce las horquillas entre asas con el bolsón cargado.',
          'Apilado sin arriostre lateral. El big bag no es una caja: sin contención lateral, la pila se deforma progresivamente y las capas inferiores trabajan a compresión desigual hasta que una costura cede.',
          'Exposición UV prolongada antes del uso. El polipropileno con tratamiento UV tiene una vida útil de exposición finita. Bolsones almacenados a la intemperie durante meses llegan a la operación con resistencia degradada sin que nada se vea a simple vista.',
          'Llenado descentrado. Una carga excéntrica hace que el bolsón trabaje torsionado durante el izaje y transfiere el esfuerzo a dos asas en lugar de cuatro.',
          'Arrastrar el bolsón en lugar de izarlo. El arrastre sobre concreto o grava abrasiona la base, justo la zona que soportará toda la columna de material en el siguiente llenado.',
        ],
        callout:
          'Ninguno de estos siete errores se detecta en una inspección de recepción del envase: todos ocurren después, en la operación. Por eso el procedimiento de manipulación vale tanto como la especificación de compra.',
      },
      {
        heading: 'Especificar bien: qué debe decir su orden de compra',
        body: [
          'Una orden de compra de big bags que solo dice "bolsón de 1 tonelada" delega en el proveedor decisiones que impactan la seguridad de su operación. La especificación mínima que evita discusiones posteriores incluye seis campos.',
        ],
        list: [
          'Carga de trabajo segura (SWL) en kg y relación de seguridad requerida (5:1 o 6:1).',
          'Dimensiones internas y altura de llenado, no solo "capacidad".',
          'Configuración de boca de carga y de descarga (abierta, con boquilla, con falda, con cierre).',
          'Tratamiento requerido: anti-UV, impermeable, antiestático según el material y el entorno.',
          'Tipo de material a contener y su densidad aparente: define el volumen real, no el peso.',
          'Documentación exigida por lote y requisitos de etiquetado.',
        ],
      },
      {
        heading: 'Densidad aparente: el error de dimensionamiento más caro',
        body: [
          'Un bolsón se compra por peso pero se llena por volumen. Un concentrado denso llena un bolsón de 1 m³ mucho antes de alcanzar la tonelada; un material esponjoso alcanza el tope volumétrico con media carga útil. Especificar sin densidad aparente produce sistemáticamente uno de dos resultados: bolsones que nunca se llenan (se paga volumen que no se usa) o bolsones que se sobrellenan por encima de su SWL para "aprovechar" el envase.',
          'El cálculo de prediseño es directo: volumen requerido (m³) = masa objetivo (kg) ÷ densidad aparente (kg/m³), más un margen de asentamiento del material durante el transporte.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuál es la diferencia entre un big bag 5:1 y uno 6:1?',
        a: 'La relación indica cuántas veces la carga de trabajo segura resiste el bolsón en ensayo. 5:1 corresponde a bolsones de un solo uso y 6:1 a bolsones diseñados para uso múltiple, que requieren un procedimiento de inspección documentado antes de cada recarga. No es un indicador de calidad del tejido, sino un criterio de uso.',
      },
      {
        q: '¿Se exige alguna certificación para big bags en el puerto del Callao?',
        a: 'APM Terminals Callao comunicó que desde el 1 de enero de 2023 los bolsones deben contar con certificación de fabricación conforme a ISO 21898:2004, junto con el cumplimiento de las disposiciones de seguridad y salud en puertos de la OIT. Conviene solicitar ese certificado al proveedor durante la cotización.',
      },
      {
        q: '¿Se puede reutilizar un big bag?',
        a: 'Solo si fue diseñado para uso múltiple (relación 6:1) y existe un procedimiento de inspección previo a cada recarga que verifique asas, costuras, tejido y ausencia de contaminación. Reutilizar un bolsón 5:1, diseñado para un solo uso, invalida la premisa de diseño del envase.',
      },
      {
        q: '¿Por qué se rompen los big bags si el tejido está en buen estado?',
        a: 'Porque la mayoría de las fallas se originan en la manipulación, no en el material: izaje con menos asas de las diseñadas, ángulo de izaje excesivo, uñas de montacargas sin protección, apilado sin arriostre lateral, llenado descentrado, arrastre sobre superficies abrasivas y exposición UV prolongada antes del uso.',
      },
      {
        q: '¿Cómo se calcula el tamaño de big bag que necesito?',
        a: 'Por volumen y no por peso: volumen requerido (m³) = masa objetivo (kg) ÷ densidad aparente del material (kg/m³), añadiendo margen por asentamiento durante el transporte. Especificar solo "1 tonelada" sin densidad aparente lleva a bolsones que no se llenan o que se sobrellenan por encima de su carga de trabajo segura.',
      },
    ],
    relatedProducts: [
      'big-bags-bolsones-polipropileno',
      'sacos-polytarp-embarque-granel',
      'films-termocontraibles-shrink',
    ],
    relatedCities: ['lima', 'arequipa', 'trujillo'],
    sources: [
      {
        label: 'APM Terminals Callao — Estandarización de bolsones',
        url: 'https://www.apmterminals.com/es/callao/customer-zone/news-and-alerts/2022/28112022-recordatorio-estandarizacion-de-bolsones',
        supports:
          'Exigencia de certificación conforme a ISO 21898:2004 y disposiciones OIT desde el 1 de enero de 2023.',
      },
      {
        label: 'ISO 21898 — Flexible intermediate bulk containers (FIBC) for non-dangerous goods',
        url: 'https://www.iso.org/standard/35750.html',
        supports: 'Norma internacional de referencia para fabricación y ensayo de FIBC.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'instalacion-geomembranas-hdpe-pozas-canales',
    title:
      'Instalación de geomembranas HDPE en pozas y canales: secuencia, ensayos de soldadura y los fallos que aparecen recién a los seis meses',
    metaTitle: 'Geomembrana HDPE en pozas y canales: instalación',
    description:
      'Preparación de subrasante, zanja de anclaje, soldadura por cuña caliente y extrusión, ensayos no destructivos (caja de vacío ASTM D5641 y presión de aire en costura doble) y los errores de instalación que provocan filtraciones meses después de la entrega.',
    datePublished: '2026-08-17',
    dateModified: '2026-08-17',
    readingMinutes: 13,
    category: 'Geosintéticos e Impermeabilización',
    sectors: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    keyTakeaways: [
      'La mayoría de las filtraciones en pozas revestidas no vienen de la lámina sino de tres puntos: la soldadura, las penetraciones y la zanja de anclaje.',
      'Toda costura debe ensayarse: la costura doble por cuña caliente permite ensayo de presión de aire en el canal central; los parches y la soldadura por extrusión se verifican con caja de vacío según ASTM D5641.',
      'La subrasante es responsabilidad del proyecto, no del instalador: una superficie con piedra angular o material orgánico perfora la lámina desde abajo y el daño aparece cuando la poza ya está en servicio.',
      'La geomembrana debe instalarse con la holgura térmica correcta: tensada en la hora más fría del día, se rasga sola cuando el sol de la tarde la contrae y expande el ciclo siguiente.',
    ],
    intro: [
      'Una geomembrana bien especificada y mal instalada se comporta peor que una lámina de menor espesor bien instalada. Es la lección más costosa de la impermeabilización: el material se elige en una hoja de cálculo, pero el desempeño se define en obra, en decisiones que casi nunca quedan escritas en el expediente técnico.',
      'Esta guía recorre la secuencia real de instalación en pozas y canales, con el detalle que separa una obra que se entrega de una obra que no vuelve: qué revisar en la subrasante, cómo se ensaya cada tipo de costura, y qué patrones de falla se manifiestan solo después de varios ciclos térmicos o del primer llenado.',
    ],
    sections: [
      {
        heading: 'Antes de desplegar: la subrasante decide el resultado',
        body: [
          'La lámina no falla contra el agua: falla contra lo que tiene debajo. Una subrasante con piedra angular, raíces, material orgánico o irregularidades bruscas genera puntos de punzonamiento que no se manifiestan durante la instalación, sino cuando la columna de líquido presiona la lámina contra el terreno.',
          'La recepción de subrasante es un hito que debe firmarse antes de desplegar el primer rollo. Si la superficie no cumple, la decisión correcta es un geotextil de protección o corregir el terreno, no "desplegar con cuidado".',
        ],
        list: [
          'Superficie compactada, uniforme y libre de material orgánico, raíces y piedra angular.',
          'Sin cambios bruscos de pendiente ni escalones que impidan el contacto continuo de la lámina.',
          'Drenaje de fondo resuelto: presión de agua o gas bajo la lámina la levanta y la desgarra.',
          'Geotextil de protección cuando el terreno es granular grueso o la carga hidráulica es alta.',
        ],
        callout:
          'Regla de campo: si usted no caminaría descalzo sobre esa superficie, la geomembrana tampoco debería apoyarse directamente en ella.',
      },
      {
        heading: 'Zanja de anclaje: el detalle que más se improvisa',
        body: [
          'La zanja de anclaje perimetral fija la lámina en la corona del talud y absorbe los esfuerzos de contracción térmica y de viento. Cuando se ejecuta poco profunda o se rellena sin compactar, la lámina se desliza hacia el interior de la poza en el primer ciclo térmico y aparece tensión donde el diseño previó holgura.',
          'La geometría exacta (profundidad, distancia al borde del talud, forma en L o en V) la define el proyecto según el espesor, la altura del talud y las cargas de viento previstas. Lo que no admite variación es la ejecución: relleno compactado y lámina sin tensión al momento del anclaje.',
        ],
      },
      {
        heading: 'Soldadura: dos técnicas, dos ensayos distintos',
        body: [
          'La unión de paneles de HDPE se ejecuta principalmente por cuña caliente doble (dual hot wedge), que produce dos pistas de soldadura separadas por un canal de aire. Ese canal no es un residuo del proceso: es el mecanismo de ensayo. Se presuriza el canal y se verifica que la presión se mantenga durante el tiempo establecido; una caída indica discontinuidad en alguna de las pistas.',
          'La soldadura por extrusión se usa en detalles, parches, penetraciones y remates donde la cuña no puede operar. Al no generar canal de aire, se ensaya con caja de vacío, práctica normalizada en ASTM D5641/D5641M, aplicando vacío sobre la costura cubierta con solución jabonosa y observando la formación de burbujas.',
          'A esto se suman los ensayos destructivos sobre probetas cortadas de la propia obra, con frecuencia definida en el plan de calidad, para verificar resistencia de la costura en pelado y en corte. Las especificaciones de referencia del sector para geomembranas HDPE y para propiedades de costura las publica el Geosynthetic Institute (GRI-GM13 y GRI-GM19a).',
        ],
        table: {
          caption: 'Ensayo según tipo de unión',
          headers: ['Tipo de unión', 'Dónde se usa', 'Ensayo no destructivo'],
          rows: [
            [
              'Cuña caliente doble',
              'Uniones longitudinales entre paneles',
              'Presión de aire en el canal central: se presuriza y se verifica la caída de presión.',
            ],
            [
              'Extrusión',
              'Parches, penetraciones, remates, detalles',
              'Caja de vacío con solución jabonosa (práctica ASTM D5641/D5641M).',
            ],
          ],
        },
        callout:
          'Una costura sin registro de ensayo es una costura no ejecutada, por bien que se vea. El protocolo de ensayos es el entregable, no la lámina.',
      },
      {
        heading: 'Penetraciones: el punto donde se concentran las filtraciones',
        body: [
          'Tuberías de ingreso, descargas, sumideros y estructuras de concreto atraviesan la lámina y rompen su continuidad. Cada penetración es un detalle de diseño particular que exige collarín, soldadura por extrusión y, cuando corresponde, sello mecánico contra la estructura.',
          'Los tres fallos recurrentes: collarín ejecutado sin holgura (se rasga cuando la lámina se contrae), soldadura de extrusión sobre superficie sucia o húmeda, y sellos contra concreto sin la platina de fijación continua que evita el despegue progresivo.',
        ],
      },
      {
        heading: 'Holgura térmica: por qué una lámina tensada es una lámina condenada',
        body: [
          'El HDPE tiene un coeficiente de dilatación térmica alto. Una lámina instalada y anclada en la hora más fría de la mañana, sin holgura, queda sometida a tracción permanente cuando el sol de la tarde la calienta y luego se contrae. Ese ciclo, repetido, concentra esfuerzo en las costuras y en los puntos de anclaje.',
          'La práctica correcta es dejar la lámina con ondulación controlada ("arrugas de holgura") en las horas frías y ejecutar las soldaduras dentro del rango térmico de trabajo del equipo. En sierra peruana, donde la amplitud térmica diaria supera con holgura la de la costa, este criterio deja de ser recomendación y pasa a ser condición de éxito.',
        ],
        callout:
          'Los fallos por holgura térmica no aparecen en la entrega: aparecen entre el tercer y el sexto mes, y se diagnostican mal como "defecto de fábrica de la lámina".',
      },
      {
        heading: 'Recepción de obra: qué exigir antes de firmar',
        list: [
          'Acta de recepción de subrasante firmada antes del despliegue.',
          'Registro completo de ensayos no destructivos por costura, con identificación de panel.',
          'Resultados de ensayos destructivos según la frecuencia del plan de calidad.',
          'Plano as-built de paneles con numeración y ubicación de reparaciones.',
          'Certificados del material y trazabilidad por rollo.',
        ],
      },
    ],
    howTo: {
      name: 'Secuencia de instalación de geomembrana HDPE en poza',
      totalTime: 'P5D',
      steps: [
        {
          name: 'Recepcionar la subrasante',
          text: 'Verificar compactación, uniformidad y ausencia de material orgánico, raíces y piedra angular. Firmar el acta antes de desplegar cualquier rollo. Instalar geotextil de protección si el terreno lo exige.',
        },
        {
          name: 'Ejecutar la zanja de anclaje perimetral',
          text: 'Excavar según la geometría del proyecto en la corona del talud. La lámina se ancla sin tensión y el relleno se compacta; una zanja mal compactada libera la lámina en el primer ciclo térmico.',
        },
        {
          name: 'Desplegar los paneles con holgura térmica',
          text: 'Desplegar según el plano de paneles, respetando el sentido de traslape y dejando ondulación controlada en las horas frías para absorber la dilatación diurna. No arrastrar la lámina sobre el terreno.',
        },
        {
          name: 'Soldar las uniones longitudinales por cuña caliente doble',
          text: 'Ejecutar la soldadura dentro del rango de temperatura y velocidad calificado en la placa de ensayo del día, sobre superficies limpias y secas, dejando el canal de aire continuo para el ensayo posterior.',
        },
        {
          name: 'Resolver detalles y penetraciones por extrusión',
          text: 'Ejecutar collarines, parches y remates con soldadura de extrusión sobre superficie limpia, seca y esmerilada, dejando holgura suficiente alrededor de cada penetración.',
        },
        {
          name: 'Ensayar todas las costuras',
          text: 'Presurizar el canal de aire de cada costura de cuña doble y verificar la caída de presión admisible. Ensayar con caja de vacío las soldaduras de extrusión, según la práctica ASTM D5641/D5641M. Registrar cada ensayo con identificación de panel.',
        },
        {
          name: 'Levantar observaciones y documentar el as-built',
          text: 'Reparar por parche extruido toda discontinuidad detectada y volver a ensayar. Entregar el plano as-built de paneles, el registro de ensayos y los certificados de material por rollo.',
        },
      ],
    },
    faqs: [
      {
        q: '¿Cómo se comprueba que una soldadura de geomembrana está bien hecha?',
        a: 'Con ensayos no destructivos sobre el 100% de las costuras: las uniones por cuña caliente doble se ensayan presurizando el canal de aire central y verificando la caída de presión; las soldaduras por extrusión (parches, penetraciones, remates) se ensayan con caja de vacío y solución jabonosa, práctica normalizada en ASTM D5641/D5641M. Se complementan con ensayos destructivos sobre probetas de la propia obra según el plan de calidad.',
      },
      {
        q: '¿Por qué aparecen filtraciones meses después de instalar la geomembrana?',
        a: 'Los tres orígenes más frecuentes son: punzonamiento desde la subrasante (piedra angular o material orgánico bajo la lámina), fallas en penetraciones ejecutadas sin holgura o sobre superficie sucia, y esfuerzo por contracción térmica en láminas instaladas tensadas, sin la ondulación de holgura que absorbe el ciclo día-noche.',
      },
      {
        q: '¿Se necesita geotextil debajo de la geomembrana?',
        a: 'Depende del terreno y de la carga hidráulica. Es necesario cuando la subrasante es granular gruesa, contiene material anguloso o la altura de columna de líquido es significativa. Su función es de protección mecánica contra punzonamiento, no de impermeabilización.',
      },
      {
        q: '¿Qué documentación debo exigir al recibir una obra de impermeabilización?',
        a: 'Acta de recepción de subrasante firmada antes del despliegue, registro de ensayos no destructivos por costura con identificación de panel, resultados de ensayos destructivos según el plan de calidad, plano as-built de paneles con ubicación de reparaciones, y certificados de material con trazabilidad por rollo.',
      },
      {
        q: '¿Qué espesor de geomembrana necesito para una poza?',
        a: 'El espesor lo define el proyecto en función de la carga hidráulica, la agresividad química del líquido contenido, la geometría de taludes, el tránsito previsto sobre la lámina y la vida útil requerida. No es una decisión de catálogo: una lámina más gruesa mal instalada rinde menos que una más delgada bien instalada y protegida.',
      },
    ],
    relatedProducts: [
      'geomembranas-pvc',
      'geomembrana-polietileno-pe-hdpe',
      'geotextiles',
    ],
    relatedCities: ['arequipa', 'cusco', 'ica'],
    sources: [
      {
        label: 'GRI-GM13 — Standard Specification for HDPE Geomembranes (Geosynthetic Institute)',
        url: 'https://geosynthetic-institute.org/grispecs/gm13.pdf',
        supports:
          'Especificación de referencia del sector para propiedades de geomembranas HDPE.',
      },
      {
        label: 'GRI-GM19a — Seam Strength and Related Properties of Geomembranes',
        url: 'https://geosynthetic-institute.org/grispecs/gm19pp.pdf',
        supports: 'Propiedades de costura de referencia para soldadura de geomembranas.',
      },
      {
        label: 'ASTM D5641/D5641M — Geomembrane Seam Evaluation by Vacuum Chamber',
        url: 'https://store.astm.org/d5641_d5641m-16.html',
        supports: 'Práctica normalizada del ensayo de caja de vacío sobre costuras.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'calculo-caudal-mangas-ventilacion-mina-subterranea',
    title:
      'Cálculo de caudal para mangas de ventilación en mina subterránea: método, corrección por altitud y por qué su manga entrega menos aire del que promete',
    metaTitle: 'Caudal para mangas de ventilación minera',
    description:
      'Requerimiento de aire por persona y por HP diésel, corrección por altitud sobre los 1500, 3000 y 4000 msnm, pérdidas por fricción y por fugas en la manga, y cómo dimensionar diámetro y tramo para que el aire llegue al frente.',
    datePublished: '2026-08-17',
    dateModified: '2026-08-17',
    readingMinutes: 12,
    category: 'Ventilación Industrial',
    sectors: ['Minería', 'Infraestructura', 'Construcción'],
    keyTakeaways: [
      'El caudal requerido se calcula por la suma de tres demandas —personal, equipo diésel y dilución de gases de voladura— y luego se corrige por altitud, no al revés.',
      'En el Perú el requerimiento por persona escala con la altitud: 3 m³/min hasta 1500 msnm, 4 entre 1500 y 3000, 5 entre 3000 y 4000 y 6 por encima de 4000 msnm; el criterio por equipo diésel es de 3 m³/min por HP.',
      'La manga no transporta el caudal del ventilador: lo entrega menos las fugas. Una instalación con uniones deficientes puede perder una fracción sustancial del caudal antes del frente, y ese aire perdido se paga en energía todos los días del proyecto.',
      'Duplicar el diámetro de la manga reduce drásticamente la pérdida por fricción: es casi siempre más barato que instalar un ventilador mayor.',
    ],
    intro: [
      'En una labor subterránea, la manga de ventilación es el último tramo de una cadena que empieza en el ventilador y termina en el frente de trabajo. Y es, casi siempre, el tramo donde se pierde el aire que el proyecto sí pagó. El síntoma es conocido: el ventilador cumple su curva, el papel dice que hay caudal suficiente, y en el frente la medición no llega.',
      'Este artículo ordena el cálculo tal como se usa en prediseño: cuánto aire exige la normativa peruana, cómo corregirlo por altitud —un factor decisivo en operaciones de sierra—, y qué pierde el sistema entre el ventilador y el frente por fricción y por fugas. El objetivo es que pueda dimensionar diámetro, longitud de tramo y tipo de manga con criterio propio antes de sentarse a cotizar.',
    ],
    sections: [
      {
        heading: 'Paso 1: el caudal exigido por personal',
        body: [
          'El Reglamento de Seguridad y Salud Ocupacional en Minería establece un requerimiento mínimo de aire por persona que aumenta con la altitud, porque el aire más enrarecido de altura entrega menos oxígeno por unidad de volumen. Según la síntesis publicada por Revista Seguridad Minera, la escala aplicable es la siguiente.',
        ],
        table: {
          caption: 'Requerimiento de aire por persona según altitud',
          headers: ['Altitud', 'Aire por persona', 'Incremento respecto de nivel base'],
          rows: [
            ['Hasta 1 500 msnm', '3 m³/min', '—'],
            ['1 500 – 3 000 msnm', '4 m³/min', '+40 %'],
            ['3 000 – 4 000 msnm', '5 m³/min', '+70 %'],
            ['Sobre 4 000 msnm', '6 m³/min', '+100 %'],
          ],
        },
        callout:
          'Verifique siempre estos valores contra el texto vigente del reglamento antes de emitir una memoria de cálculo: aquí se publican como criterio de prediseño, con la fuente citada al pie del artículo.',
      },
      {
        heading: 'Paso 2: el caudal exigido por equipo diésel',
        body: [
          'El equipo diésel es, en la mayoría de las labores mecanizadas, el consumidor dominante: su demanda supera con holgura la del personal. El criterio de referencia es de 3 m³/min por cada HP que desarrollen los equipos operando simultáneamente en la labor.',
          'La palabra clave es "simultáneamente". Sumar la potencia instalada total de la flota sobredimensiona el sistema; considerar solo un equipo lo subdimensiona el día que entran dos. El escenario de cálculo debe ser el de operación simultánea realista del ciclo minero, no el promedio.',
        ],
      },
      {
        heading: 'Paso 3: dilución de gases de voladura y velocidad mínima',
        body: [
          'Después de la voladura, el sistema debe evacuar y diluir los gases en un tiempo compatible con el ciclo de trabajo. Esto define un caudal que muchas veces gobierna el diseño por encima de las dos demandas anteriores, especialmente en labores ciegas de avance.',
          'Adicionalmente, la velocidad del aire en la labor tiene límites: por debajo del mínimo el aire no barre, por encima del máximo levanta polvo y afecta la operación. El criterio citado establece un mínimo de 20 m/min en operación normal, que sube a 25 m/min cuando se emplea ANFO u otros agentes de voladura, con un máximo de 250 m/min. El ambiente de trabajo debe mantener un mínimo de 19,5 % de oxígeno.',
        ],
      },
      {
        heading: 'Paso 4: lo que la manga pierde antes de llegar al frente',
        body: [
          'Aquí es donde el cálculo de gabinete se separa de la realidad de la labor. El ventilador entrega un caudal en su boca; lo que llega al frente es menor por dos mecanismos distintos.',
          'La pérdida por fricción depende fuertemente del diámetro: la resistencia de un ducto crece de forma muy pronunciada al reducir la sección. Por eso, cuando el aire no alcanza, aumentar el diámetro de la manga suele ser la solución más económica frente a instalar un ventilador de mayor potencia, que además consume más energía cada hora de operación.',
          'La pérdida por fugas depende de la instalación: uniones mal ejecutadas, perforaciones por roce contra la caja, empalmes improvisados y tramos colgados con excesiva catenaria. A diferencia de la fricción, la fuga no se calcula bien en gabinete: se controla en obra y se audita midiendo caudal en el frente, no en el ventilador.',
        ],
        list: [
          'Diámetro insuficiente: causa dominante de pérdida por fricción y la más cara de corregir tarde.',
          'Uniones deficientes: la fuga se acumula en cada empalme a lo largo de todo el tramo.',
          'Roce contra la caja de la labor: perfora la manga y genera fugas progresivas que nadie registra.',
          'Catenaria excesiva: reduce la sección efectiva y acumula agua en los puntos bajos.',
          'Cambios bruscos de dirección: introducen pérdidas locales que se suman a la fricción del tramo.',
        ],
        callout:
          'Medir caudal en la boca del ventilador y declarar el sistema conforme es el error de auditoría más común. La medición que importa es la del frente de trabajo.',
      },
      {
        heading: 'Especificar la manga: qué define el precio y qué define el desempeño',
        body: [
          'Dos mangas del mismo diámetro pueden comportarse de forma completamente distinta según su material, su tipo de refuerzo, su sistema de unión y su tratamiento. Especificar solo diámetro y longitud deja fuera lo que determina la vida útil en la labor.',
        ],
        list: [
          'Diámetro y longitud por tramo, con el número de empalmes previsto.',
          'Sistema de ventilación: impelente (sopla hacia el frente) o aspirante (extrae), que define el tipo de manga.',
          'Material y refuerzo según abrasión esperada y condiciones de humedad.',
          'Sistema de unión y accesorios de suspensión.',
          'Requisitos de comportamiento frente al fuego y de resistencia mecánica exigidos por la operación.',
        ],
      },
      {
        heading: 'Cómo se arma el número final',
        steps: [
          'Calcular la demanda por personal: número máximo de personas en la labor × el caudal por persona correspondiente a la altitud de la operación.',
          'Calcular la demanda por equipo diésel: suma de HP de los equipos en operación simultánea × 3 m³/min por HP.',
          'Calcular la demanda por dilución de gases de voladura según el volumen de la labor y el tiempo de reingreso objetivo.',
          'Tomar la demanda gobernante y verificar que la velocidad del aire resultante quede dentro del rango admisible en la sección de la labor.',
          'Añadir el margen por fugas y pérdidas de la instalación para determinar el caudal que debe entregar el ventilador en su boca.',
          'Dimensionar el diámetro de manga que transporta ese caudal con una pérdida de carga aceptable, y recién entonces seleccionar el ventilador.',
        ],
      },
    ],
    howTo: {
      name: 'Dimensionar un sistema de ventilación auxiliar con manga',
      steps: [
        {
          name: 'Determinar la demanda por personal',
          text: 'Multiplicar el número máximo de personas presentes en la labor por el caudal por persona que corresponde a la altitud de la operación (3, 4, 5 o 6 m³/min según el rango de msnm).',
        },
        {
          name: 'Determinar la demanda por equipo diésel',
          text: 'Sumar la potencia en HP de los equipos que operan simultáneamente en la labor y multiplicarla por el criterio de 3 m³/min por HP.',
        },
        {
          name: 'Determinar la demanda por dilución de gases de voladura',
          text: 'Calcular el caudal necesario para evacuar y diluir los gases en el tiempo de reingreso objetivo, en función del volumen de la labor y del explosivo empleado.',
        },
        {
          name: 'Seleccionar la demanda gobernante y verificar velocidades',
          text: 'Tomar el mayor de los tres caudales y comprobar que la velocidad del aire resultante en la sección de la labor respete el mínimo y el máximo admisibles.',
        },
        {
          name: 'Añadir pérdidas por fricción y fugas',
          text: 'Incrementar el caudal requerido en el frente por el margen de fugas de la instalación y calcular la pérdida de carga del tramo de manga para el diámetro considerado.',
        },
        {
          name: 'Definir diámetro de manga y recién después el ventilador',
          text: 'Elegir el diámetro que transporta el caudal con pérdida de carga aceptable —aumentar diámetro suele ser más económico que aumentar potencia— y seleccionar el ventilador que cubra caudal y presión resultantes.',
        },
        {
          name: 'Verificar midiendo en el frente',
          text: 'Auditar el sistema instalado midiendo el caudal en el frente de trabajo, no en la boca del ventilador, y corregir uniones, roces y catenarias donde la fuga sea significativa.',
        },
      ],
    },
    faqs: [
      {
        q: '¿Cuánto aire se requiere por persona en una mina en el Perú?',
        a: 'El requerimiento escala con la altitud: 3 m³/min por persona hasta 1500 msnm, 4 m³/min entre 1500 y 3000 msnm, 5 m³/min entre 3000 y 4000 msnm y 6 m³/min por encima de 4000 msnm. Estos valores se publican aquí como criterio de prediseño según la síntesis de Revista Seguridad Minera del Reglamento de Seguridad y Salud Ocupacional en Minería; deben verificarse contra el texto vigente antes de emitir una memoria de cálculo.',
      },
      {
        q: '¿Cuánto aire consume un equipo diésel en interior mina?',
        a: 'El criterio de referencia es de 3 m³/min por cada HP que desarrollen los equipos. El cálculo debe considerar los equipos que operan simultáneamente en la labor: sumar la flota completa sobredimensiona el sistema y considerar un solo equipo lo subdimensiona.',
      },
      {
        q: '¿Por qué llega menos aire al frente que el que entrega el ventilador?',
        a: 'Por dos mecanismos: la pérdida de carga por fricción a lo largo de la manga, que depende fuertemente del diámetro, y las fugas de la instalación —uniones deficientes, perforaciones por roce contra la caja, catenaria excesiva y empalmes improvisados—. Por eso la auditoría válida mide caudal en el frente de trabajo y no en la boca del ventilador.',
      },
      {
        q: '¿Conviene aumentar el diámetro de la manga o poner un ventilador más potente?',
        a: 'En general conviene aumentar el diámetro. La pérdida por fricción crece de forma muy pronunciada al reducir la sección, de modo que un diámetro mayor baja la resistencia del sistema sin aumentar el consumo energético; un ventilador mayor resuelve el síntoma pero se paga en energía todas las horas de operación del proyecto.',
      },
      {
        q: '¿Qué velocidad de aire es admisible en una labor subterránea?',
        a: 'El criterio citado establece un mínimo de 20 m/min en operación normal, que sube a 25 m/min cuando se emplean ANFO u otros agentes de voladura, y un máximo de 250 m/min. El ambiente de trabajo debe mantener un mínimo de 19,5 % de oxígeno.',
      },
      {
        q: '¿Qué debo especificar al cotizar una manga de ventilación?',
        a: 'Diámetro y longitud por tramo con el número de empalmes, si el sistema es impelente o aspirante, material y refuerzo según abrasión y humedad, sistema de unión y accesorios de suspensión, y los requisitos de comportamiento frente al fuego y resistencia mecánica que exija la operación.',
      },
    ],
    relatedProducts: [
      'mangas-ventilacion-minas-tuneles',
      'geomembrana-polietileno-pe-hdpe',
      'lona-plastificada-rafia-polytarp',
    ],
    relatedCities: ['arequipa', 'cusco', 'huancayo'],
    sources: [
      {
        label: 'Revista Seguridad Minera — Ventilación minera: recomendaciones y reglamento de seguridad',
        url: 'https://revistaseguridadminera.com/operaciones-mineras/ventilacion-minera-7-recomendaciones-y-reglamento-de-seguridad/',
        supports:
          'Requerimiento de aire por persona según altitud, 3 m³/min por HP diésel, velocidades mínima y máxima y porcentaje mínimo de oxígeno.',
      },
      {
        label: 'D.S. N° 024-2016-EM — Reglamento de Seguridad y Salud Ocupacional en Minería (Osinergmin)',
        url: 'https://www.gob.pe/institucion/osinergmin/normas-legales/741887-024-2016-em',
        supports: 'Norma peruana que regula la ventilación en minería subterránea.',
      },
    ],
  },
  // ===========================================================================
  {
    slug: 'ventilacion-impelente-vs-aspirante-labores-mineras',
    title:
      'Impelente o aspirante: cómo elegir el sistema de ventilación auxiliar de una labor y qué manga exige cada uno',
    metaTitle: 'Ventilación impelente vs aspirante en minería',
    description:
      'Diferencias reales entre ventilación impelente, aspirante y mixta en labores ciegas: tiempo de reingreso tras voladura, control de polvo, distancia de la manga al frente y por qué la manga aspirante exige refuerzo antic colapso.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 10,
    category: 'Ventilación Industrial',
    sectors: ['Minería', 'Construcción', 'Infraestructura'],
    keyTakeaways: [
      'El sistema impelente sopla aire limpio hacia el frente y barre bien la última decena de metros; el aspirante extrae el aire contaminado y evita arrastrar gases por toda la labor.',
      'La manga aspirante trabaja a presión negativa y colapsa si no tiene refuerzo en espiral: no es la misma manga que la impelente, aunque tenga el mismo diámetro.',
      'La distancia entre la boca de la manga y el frente es el parámetro operativo que más se descuida: demasiado lejos y el aire no barre el fondo de la labor.',
      'El sistema mixto —impelente para barrer, aspirante para evacuar— resuelve labores largas, pero duplica los puntos de fuga y exige disciplina de instalación.',
    ],
    intro: [
      'Elegir entre impelente y aspirante no es una preferencia de proyectista: cambia el tiempo de reingreso tras la voladura, la exposición del personal a gases y polvo, y el tipo de manga que hay que comprar. La decisión se toma antes de dimensionar y arrastra consecuencias en toda la operación de la labor.',
      'Este artículo compara los tres esquemas con el criterio con el que se decide en terreno, y explica por qué una manga aspirante no es simplemente una manga impelente instalada al revés.',
    ],
    sections: [
      {
        heading: 'Impelente: barre el frente, arrastra el aire sucio por la labor',
        body: [
          'El ventilador toma aire limpio de la galería principal y lo sopla a través de la manga hasta la boca, ubicada cerca del frente. El chorro de aire genera turbulencia en el fondo de la labor, que es exactamente lo que se necesita para diluir y arrastrar gases y polvo acumulados en el rincón ciego.',
          'La contrapartida: ese aire contaminado retorna por la propia labor, atravesando toda la sección donde puede haber personal y equipo. En labores largas, la nube de gases recorre el trayecto completo antes de salir.',
        ],
        list: [
          'Ventaja: excelente barrido del frente, que es donde se acumula lo peor.',
          'Ventaja: la manga trabaja a presión positiva y no colapsa, lo que la hace más simple y económica.',
          'Desventaja: el aire contaminado retorna por la labor y expone el trayecto completo.',
          'Desventaja: en labores largas el tiempo de evacuación de gases crece con la distancia.',
        ],
      },
      {
        heading: 'Aspirante: saca el aire contaminado, pero no barre el rincón',
        body: [
          'Aquí la manga extrae aire desde cerca del frente y lo conduce fuera de la labor. El aire limpio ingresa por la sección de la galería, de modo que el personal trabaja en aire de entrada y no en el retorno contaminado.',
          'El problema es de física, no de equipo: una boca de aspiración genera un campo de succión que decae muy rápidamente con la distancia. Si la boca queda lejos del frente, el aire del fondo simplemente no se mueve y queda una zona muerta que ningún caudal adicional resuelve.',
          'Además, la manga trabaja a presión negativa: sin refuerzo helicoidal o estructura equivalente, colapsa sobre sí misma y estrangula el caudal. Es el error de compra más caro de este esquema, porque se descubre recién en operación.',
        ],
        callout:
          'Una manga aspirante sin refuerzo antic colapso es dinero perdido: se compra por diámetro y se descubre en el primer turno que ese diámetro no existe cuando el ventilador arranca.',
      },
      {
        heading: 'Mixto: lo mejor de ambos, con el doble de disciplina',
        body: [
          'El esquema mixto combina un ramal impelente que barre el frente con un ramal aspirante que evacúa el aire contaminado sin que recorra la labor. Es el esquema que mejor resuelve labores largas de avance y desarrollos con alta carga de equipo diésel.',
          'El costo no es solo de equipos: cada ramal suma empalmes, y cada empalme es un punto de fuga. Un sistema mixto mal instalado rinde peor que un impelente bien ejecutado.',
        ],
        table: {
          caption: 'Comparación operativa de los tres esquemas',
          headers: ['Criterio', 'Impelente', 'Aspirante', 'Mixto'],
          rows: [
            ['Barrido del frente', 'Muy bueno', 'Limitado por la distancia de la boca', 'Muy bueno'],
            ['Exposición del trayecto', 'Alta: el retorno pasa por la labor', 'Baja', 'Baja'],
            ['Exigencia de la manga', 'Presión positiva, sin refuerzo especial', 'Presión negativa, exige refuerzo antic colapso', 'Ambos tipos'],
            ['Puntos de fuga', 'Los de un ramal', 'Los de un ramal', 'Los de dos ramales'],
          ],
        },
      },
      {
        heading: 'El parámetro que decide en obra: distancia de la boca al frente',
        body: [
          'En impelente, la boca debe quedar lo bastante cerca para que el chorro alcance el fondo con energía suficiente para generar turbulencia, y lo bastante lejos para no ser dañada por la voladura. En aspirante la exigencia es más estricta: el campo de succión decae rápido, de modo que alejar la boca equivale a apagar el sistema en el rincón.',
          'Es un parámetro de procedimiento, no de compra: se define en el estándar de la operación y se audita como cualquier otro control crítico. La manga puede ser la correcta y el sistema seguir sin funcionar por esta sola razón.',
        ],
      },
      {
        heading: 'Qué cambia en la especificación de la manga',
        list: [
          'Impelente: prioriza estanqueidad de uniones y resistencia a la abrasión por roce contra la caja.',
          'Aspirante: exige refuerzo helicoidal o estructura equivalente para resistir la presión negativa sin colapsar.',
          'Ambos: el diámetro se deriva del cálculo de caudal y de la pérdida de carga admisible del tramo, nunca del stock disponible.',
          'Ambos: el sistema de suspensión debe evitar catenaria excesiva, que reduce la sección efectiva y acumula agua.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuál es la diferencia entre ventilación impelente y aspirante?',
        a: 'La impelente sopla aire limpio hacia el frente a través de la manga y el aire contaminado retorna por la labor; la aspirante extrae el aire contaminado desde cerca del frente y lo conduce fuera, de modo que el personal trabaja en aire de entrada. La impelente barre mejor el fondo; la aspirante evita exponer todo el trayecto.',
      },
      {
        q: '¿Se puede usar la misma manga para impelente y para aspirante?',
        a: 'No es recomendable. La manga aspirante trabaja a presión negativa y necesita refuerzo helicoidal o una estructura equivalente que impida el colapso; una manga pensada para presión positiva se estrangula al arrancar el ventilador y el caudal real cae muy por debajo del nominal.',
      },
      {
        q: '¿A qué distancia del frente debe quedar la boca de la manga?',
        a: 'Lo bastante cerca para que el sistema actúe sobre el fondo de la labor y lo bastante lejos para no ser dañada por la voladura. En aspirante la exigencia es mayor porque el campo de succión decae muy rápido con la distancia: alejar la boca deja una zona muerta que no se corrige aumentando caudal.',
      },
      {
        q: '¿Cuándo conviene un sistema mixto?',
        a: 'En labores largas de avance y en desarrollos con alta carga de equipo diésel, donde el retorno contaminado por toda la labor es inaceptable pero el barrido del frente sigue siendo necesario. El costo es que duplica empalmes y, con ello, los puntos potenciales de fuga.',
      },
    ],
    relatedProducts: ['mangas-ventilacion-minas-tuneles', 'lona-plastificada-rafia-polytarp', 'accesorios-instalacion'],
    relatedCities: ['arequipa', 'cusco', 'huancayo'],
    sources: [
      {
        label: 'Revista Seguridad Minera — Ventilación minera: recomendaciones y reglamento de seguridad',
        url: 'https://revistaseguridadminera.com/operaciones-mineras/ventilacion-minera-7-recomendaciones-y-reglamento-de-seguridad/',
        supports: 'Requerimientos de aire, velocidades admisibles y porcentaje mínimo de oxígeno en labores subterráneas del Perú.',
      },
      {
        label: 'D.S. N° 024-2016-EM — Reglamento de Seguridad y Salud Ocupacional en Minería (Osinergmin)',
        url: 'https://www.gob.pe/institucion/osinergmin/normas-legales/741887-024-2016-em',
        supports: 'Marco normativo peruano que regula la ventilación en minería subterránea.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'como-elegir-geotextil-separacion-drenaje-refuerzo',
    title:
      'Cómo elegir un geotextil: separación, filtración, drenaje o refuerzo, y por qué el gramaje solo no alcanza',
    metaTitle: 'Cómo elegir un geotextil: función y supervivencia',
    description:
      'Las cuatro funciones del geotextil, por qué comprar por gramaje es la forma más común de equivocarse, qué propiedades exige AASHTO M288 según la severidad de la obra y cómo evitar la colmatación del filtro.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 11,
    category: 'Geosintéticos e Impermeabilización',
    sectors: ['Construcción', 'Minería', 'Infraestructura', 'Saneamiento'],
    keyTakeaways: [
      'El geotextil cumple cuatro funciones distintas —separación, filtración, drenaje y refuerzo— y cada una se especifica con propiedades diferentes: pedir "geotextil de 200 g/m²" no define ninguna de ellas.',
      'AASHTO M288 organiza la selección por función y por clase de supervivencia, que depende de la agresividad de la construcción, no del uso final de la obra.',
      'En filtración, el tamaño de abertura aparente gobierna el resultado: demasiado abierto deja pasar finos, demasiado cerrado se colmata y la presión de poros sube detrás del filtro.',
      'Bajo geomembrana el geotextil no impermeabiliza: protege contra punzonamiento. Confundir las funciones es la causa de reclamos más frecuente en obras de impermeabilización.',
    ],
    intro: [
      'Casi todos los requerimientos de geotextil que llegan a cotización dicen lo mismo: un gramaje y un color. El gramaje describe cuánta materia hay por metro cuadrado, pero no dice si el material va a separar dos suelos, filtrar sin colmatarse, conducir agua en su plano o resistir tracción como refuerzo.',
      'Este artículo ordena la selección por función, explica qué propiedad gobierna cada una y por qué la clase de supervivencia —cuánta agresión resiste durante la construcción— suele decidir más que el desempeño teórico.',
    ],
    sections: [
      {
        heading: 'Las cuatro funciones, y qué propiedad gobierna cada una',
        table: {
          caption: 'Función del geotextil y propiedad determinante',
          headers: ['Función', 'Qué hace', 'Propiedad que gobierna'],
          rows: [
            ['Separación', 'Impide que dos capas de suelo se mezclen (subrasante y base granular)', 'Resistencia al punzonamiento y a la rotura durante la colocación'],
            ['Filtración', 'Deja pasar el agua reteniendo las partículas de suelo', 'Tamaño de abertura aparente y permitividad'],
            ['Drenaje', 'Conduce agua dentro del propio plano del geotextil', 'Transmisividad en el plano y espesor bajo carga'],
            ['Refuerzo', 'Aporta resistencia a tracción al conjunto suelo-geosintético', 'Resistencia a tracción y módulo a deformaciones de servicio'],
          ],
        },
        body: [
          'Un mismo geotextil puede cumplir bien una función y mal otra. El error clásico es usar un no tejido punzonado —excelente en separación y filtración— como elemento de refuerzo, cuando el refuerzo exige rigidez a baja deformación, que es justamente lo que un no tejido no aporta.',
        ],
      },
      {
        heading: 'Clase de supervivencia: el criterio que decide en obra',
        body: [
          'La especificación AASHTO M288 organiza los requisitos por función y por clase de supervivencia, entendida como la agresión que el geotextil recibe durante la construcción: tipo de equipo, espesor de la primera capa de relleno, angulosidad del material y estado de la subrasante.',
          'Esto es contraintuitivo para quien compra: la clase no la define la importancia de la obra, sino cuán brutal es su proceso constructivo. Un geotextil que sobrevive a un relleno fino colocado con equipo liviano puede romperse al descargar piedra angular desde altura.',
        ],
        callout:
          'Un geotextil roto durante la construcción no cumple ninguna función después, por buenas que sean sus propiedades en la ficha técnica.',
      },
      {
        heading: 'Filtración: el equilibrio entre retener y dejar pasar',
        body: [
          'En filtración se piden dos cosas opuestas: retener las partículas del suelo y no oponer resistencia al paso del agua. Un tamaño de abertura demasiado grande deja migrar finos y contamina el material drenante aguas abajo; demasiado pequeño, y el geotextil se colmata y la presión de poros aumenta detrás del filtro.',
          'La granulometría del suelo a filtrar es, por eso, un dato de entrada obligatorio. Sin ella, la selección del geotextil de filtración es una apuesta.',
        ],
        list: [
          'Pida siempre la granulometría del suelo a filtrar antes de definir el geotextil.',
          'Verifique el criterio de retención frente al porcentaje de finos del suelo.',
          'Considere el riesgo de colmatación en suelos con alto contenido de finos o presencia de precipitados.',
          'Contemple la sobrecarga de la capa superior: la transmisividad cae cuando el geotextil trabaja comprimido.',
        ],
      },
      {
        heading: 'Bajo geomembrana: protección, no impermeabilización',
        body: [
          'En pozas y rellenos, el geotextil bajo la geomembrana cumple una única función: proteger la lámina del punzonamiento por el material anguloso de la subrasante cuando la carga hidráulica la presiona contra el terreno.',
          'No aporta impermeabilidad y no sustituye la preparación de la subrasante. Si el terreno tiene piedra angular, la solución correcta es corregir el terreno y además proteger con geotextil, no una de las dos cosas.',
        ],
      },
      {
        heading: 'Qué debe decir su requerimiento',
        list: [
          'Función principal y secundaria del geotextil en esa obra.',
          'Granulometría del suelo en contacto y presencia de finos.',
          'Equipo de construcción y espesor de la primera capa de relleno sobre el geotextil.',
          'Carga de servicio esperada y si trabajará comprimido.',
          'Exposición a radiación UV durante la construcción, y por cuánto tiempo quedará descubierto.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué gramaje de geotextil necesito?',
        a: 'El gramaje no es la variable de selección. Se elige por la función que debe cumplir —separación, filtración, drenaje o refuerzo— y por la clase de supervivencia que exige el proceso constructivo. Dos geotextiles del mismo gramaje pueden comportarse de forma muy distinta en la misma obra.',
      },
      {
        q: '¿El geotextil impermeabiliza?',
        a: 'No. El geotextil es permeable por definición: separa, filtra, drena o refuerza. La barrera impermeable es la geomembrana. Bajo geomembrana, el geotextil cumple función de protección mecánica contra punzonamiento.',
      },
      {
        q: '¿Qué es la colmatación de un geotextil y cómo se evita?',
        a: 'Es la obstrucción progresiva de sus aberturas por partículas finas o precipitados, que reduce el paso de agua y eleva la presión detrás del filtro. Se previene eligiendo el tamaño de abertura aparente en función de la granulometría real del suelo a filtrar, no por catálogo.',
      },
      {
        q: '¿Puedo usar un geotextil no tejido como refuerzo?',
        a: 'Generalmente no es lo adecuado. El refuerzo exige resistencia a tracción y rigidez a deformaciones pequeñas, propiedades típicas de geotextiles tejidos o de geomallas. El no tejido punzonado destaca en separación, filtración y protección.',
      },
      {
        q: '¿Cuánto tiempo puede quedar un geotextil expuesto al sol?',
        a: 'Depende del polímero y del tratamiento, y es un dato que debe pedirse al fabricante. Como criterio de obra, el geotextil se cubre lo antes posible: la exposición prolongada degrada sus propiedades antes de que la obra entre en servicio.',
      },
    ],
    relatedProducts: ['geotextiles', 'geomallas-geogrids', 'geocompuestos-drenaje'],
    relatedCities: ['lima', 'arequipa', 'piura'],
    sources: [
      {
        label: 'AASHTO M288 — Guía de selección de geotextiles por función y clase de supervivencia',
        url: 'https://www.usfabricsinc.com/reference/aashto-m288-selection-guide/',
        supports: 'Organización de la selección por función y por clase de supervivencia según la agresividad del proceso constructivo.',
      },
      {
        label: 'GRI-GM13 — Standard Specification for HDPE Geomembranes (Geosynthetic Institute)',
        url: 'https://geosynthetic-institute.org/grispecs/gm13.pdf',
        supports: 'Especificación de referencia de la geomembrana que el geotextil protege en obras de impermeabilización.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'mallas-antiafidas-densidad-trama-ventilacion',
    title:
      'Mallas antiáfidas: cómo elegir la densidad de trama sin asfixiar el cultivo',
    metaTitle: 'Mallas antiáfidas: densidad de trama y ventilación',
    description:
      'Qué plaga excluye cada densidad de trama, por qué excluir trips puede exigir varias veces más superficie de malla para mantener la ventilación, y cómo decidir entre exclusión total y manejo integrado en valles peruanos.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 9,
    category: 'Mallas y Coberturas Agrícolas',
    sectors: ['Agricultura', 'Comercio'],
    keyTakeaways: [
      'La densidad de trama se elige por el insecto más pequeño que debe excluir, y cada escalón de exclusión se paga en ventilación.',
      'Excluir trips exige aberturas del orden de una décima de milímetro; según la industria de invernaderos, ese nivel de exclusión puede requerir tres o cuatro veces más superficie de malla para mantener el mismo flujo de aire.',
      'Una malla más cerrada sin ampliar el área de ventilación eleva la temperatura y la humedad interior, y puede causar más daño que la plaga que se quería excluir.',
      'La mayoría de las fallas de campo ocurren en el punto de fijación y en los accesos, no en el paño: un tratamiento UV correcto y un borde reforzado deciden cuántas campañas dura.',
    ],
    intro: [
      'La malla antiáfida es una barrera física, y como toda barrera tiene un costo: lo que detiene insectos también detiene aire. La decisión no es "cuál es la mejor malla" sino qué plaga hay que excluir y cuánta superficie de ventilación se está dispuesto a construir para lograrlo.',
      'Este artículo ordena esa decisión con los datos que importan en un valle peruano: plaga objetivo, radiación, ventilación y el punto de fijación donde realmente terminan las mallas.',
    ],
    sections: [
      {
        heading: 'La exclusión se define por el insecto más pequeño, no por el más frecuente',
        body: [
          'Una malla que excluye áfidos no necesariamente excluye trips: la diferencia de tamaño entre ambos es considerable y obliga a aberturas mucho menores. Publicaciones de la industria de invernaderos sitúan la abertura necesaria para excluir trips por debajo de 0,006 pulgadas, del orden de una décima de milímetro.',
          'Por eso la primera pregunta no es de producto sino agronómica: cuál es el vector que se quiere frenar. Si el objetivo es un virus transmitido por trips, la especificación cambia por completo respecto de una barrera pensada para mosca blanca o áfidos.',
        ],
      },
      {
        heading: 'El costo escondido: ventilación',
        body: [
          'La misma fuente de la industria señala que la abertura necesaria para trips puede requerir tres o cuatro veces la superficie de malla respecto de tramas más abiertas, precisamente para no estrangular el flujo de aire.',
          'La consecuencia práctica es que la malla fina no se puede instalar sobre la misma estructura de ventanas: hay que ampliar el área de ventilación. Quien cambia a una trama más cerrada sin tocar la estructura suele terminar con más temperatura y humedad adentro, y con problemas fitosanitarios distintos a los que quería evitar.',
        ],
        callout:
          'Cerrar la trama sin ampliar el área de ventilación no es una mejora de la barrera: es un cambio de clima interior que nadie calculó.',
      },
      {
        heading: 'Radiación y vida útil: el factor peruano',
        body: [
          'En valles de alta radiación, el tratamiento UV del hilo determina cuántas campañas resiste la malla antes de perder resistencia mecánica. Una malla que en una zona de radiación moderada dura varias campañas puede degradarse mucho antes en condiciones de sierra o de costa desértica con alta insolación.',
          'El indicador que importa no es el precio por metro cuadrado sino el costo por campaña, que incluye el desmontaje y la reinstalación cuando la malla falla antes de tiempo.',
        ],
      },
      {
        heading: 'Dónde fallan realmente las mallas',
        list: [
          'En el punto de fijación: sin refuerzo de borde, el paño se desgarra desde el amarre con la primera racha fuerte.',
          'En los accesos: una puerta mal resuelta anula la exclusión de toda la estructura.',
          'En las uniones entre paños: la costura debe tener al menos la resistencia del paño y el mismo tratamiento UV.',
          'En el contacto con la estructura: el roce contra un perfil sin protección abre el paño en pocas semanas.',
        ],
      },
      {
        heading: 'Qué especificar al cotizar',
        list: [
          'Plaga o vector objetivo, que define la densidad de trama.',
          'Superficie de ventilación disponible y si puede ampliarse.',
          'Radiación y exposición de la zona, que definen el tratamiento UV.',
          'Dimensiones de paño, tipo de refuerzo de borde y sistema de fijación.',
          'Cultivo y etapa, cuando la malla cumple además una función de sombra.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué densidad de malla antiáfida necesito?',
        a: 'La define el insecto más pequeño que debe excluir. Excluir trips exige aberturas del orden de una décima de milímetro, bastante menores que las necesarias para áfidos o mosca blanca, y ese salto se paga en ventilación.',
      },
      {
        q: '¿Una malla más cerrada siempre es mejor?',
        a: 'No. Una trama más cerrada reduce el paso de aire, y si no se amplía el área de ventilación sube la temperatura y la humedad interior. El problema fitosanitario que aparece por ese cambio de clima puede superar al que se quería evitar.',
      },
      {
        q: '¿Cuántas campañas dura una malla antiáfida?',
        a: 'Depende del tratamiento UV del hilo y sobre todo de la radiación de la zona. En valles de alta insolación la degradación es mucho más rápida, por lo que conviene comparar costo por campaña y no precio por metro cuadrado.',
      },
      {
        q: '¿La malla antiáfida sirve también como malla de sombra?',
        a: 'Cumplen funciones distintas: la antiáfida es una barrera de exclusión y la raschel controla radiación. Algunas configuraciones aportan algo de sombreo, pero si el objetivo agronómico es manejar radiación, la selección debe hacerse por porcentaje de sombra.',
      },
    ],
    relatedProducts: ['mallas-antiafidas', 'malla-raschel-sombra', 'malla-anti-pajaro-anti-granizo'],
    relatedCities: ['ica', 'trujillo', 'piura'],
    sources: [
      {
        label: 'Greenhouse Management — Insect screening: an ounce of prevention',
        url: 'https://www.greenhousemag.com/article/insect-screening-an-ounce-of-prevention/',
        supports: 'Abertura por debajo de 0,006 pulgadas para excluir trips y necesidad de tres a cuatro veces más superficie de malla para mantener el flujo de aire.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'carpas-industriales-carga-viento-norma-e020',
    title:
      'Carpas y coberturas textiles: cómo se calcula la carga de viento en el Perú según la Norma E.020',
    metaTitle: 'Carga de viento en carpas textiles: Norma E.020',
    description:
      'Velocidad de diseño según altura, presión de viento, factores de forma para superficies inclinadas y cubiertas curvas, y por qué la succión —no la presión— es la que arranca las coberturas textiles.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 12,
    category: 'Estructuras y Arquitectura Textil',
    sectors: ['Construcción', 'Minería', 'Industrial', 'Infraestructura'],
    keyTakeaways: [
      'La Norma E.020 del Reglamento Nacional de Edificaciones define la velocidad de diseño a la altura h como Vh = V (h/10)^0,22, con una velocidad mínima de 75 km/h hasta los 10 metros de altura.',
      'La carga se obtiene con Ph = 0,005 · C · Vh², expresada en kgf/m², donde C es el factor de forma que depende de la geometría y de si la superficie está a barlovento o sotavento.',
      'En sotavento el factor de forma es negativo: la cobertura no recibe presión sino succión, y esa succión es la que arranca lonas y levanta cubiertas.',
      'Como la presión crece con el cuadrado de la velocidad, subestimar la velocidad de diseño en un tercio no reduce la carga un tercio: la reduce a algo más de la mitad, y ese margen desaparece en la primera ráfaga.',
    ],
    intro: [
      'Cuando una carpa industrial falla, casi nunca se rompe la tela. Se sueltan los anclajes, se dobla un pórtico o la cubierta se levanta entera. Todos esos modos de falla comparten un origen: la carga de viento nunca se calculó, o se calculó solo como presión frontal sin considerar la succión.',
      'Este artículo recorre el procedimiento que fija la Norma E.020 del Reglamento Nacional de Edificaciones para cargas de viento, y lo traduce a las decisiones concretas de una cobertura textil: geometría, factor de forma y anclaje.',
    ],
    sections: [
      {
        heading: 'Paso 1: velocidad de diseño según la altura',
        body: [
          'La Norma E.020 establece que la velocidad de diseño del viento a una altura h se obtiene a partir de la velocidad de referencia a 10 metros mediante Vh = V (h/10)^0,22, y fija que la velocidad de diseño no será menor de 75 km/h hasta los 10 metros de altura.',
          'La lectura práctica: una estructura más alta ve más viento, y el mínimo normativo actúa como piso incluso donde el registro local parezca benigno. Para una cobertura textil, esto significa que el mismo diseño no se puede trasladar sin más de un galpón bajo a una cubierta alta.',
        ],
      },
      {
        heading: 'Paso 2: de velocidad a carga',
        body: [
          'La carga exterior de viento se obtiene con Ph = 0,005 · C · Vh², donde Ph resulta en kilogramos-fuerza por metro cuadrado, Vh es la velocidad de diseño en kilómetros por hora y C es el factor de forma.',
          'El término al cuadrado es lo que hace peligrosa cualquier estimación optimista: la carga no crece de forma proporcional a la velocidad, sino con su cuadrado. Es la razón por la que una cobertura que "aguantó bien el año pasado" puede fallar cuando la ráfaga sube un escalón.',
        ],
        callout:
          'Como Ph depende de Vh², reducir la velocidad de diseño de 90 a 75 km/h no baja la carga un 17 %: la baja alrededor de un 30 %. Ese es exactamente el margen que después falta.',
      },
      {
        heading: 'Paso 3: el factor de forma y la succión',
        body: [
          'El factor de forma C depende de la geometría de la superficie y de su posición respecto del viento. La norma diferencia superficies inclinadas hasta 15°, entre 15° y 60°, y entre 60° y la vertical, además de arcos y cubiertas cilíndricas.',
          'El dato decisivo para una cobertura textil es el signo. A sotavento el factor es negativo —la norma indica valores de succión en esas caras—, de modo que la cobertura es empujada hacia afuera. Una lona tensada resiste bien la presión pero es especialmente vulnerable a la succión, que actúa donde los amarres trabajan a extracción.',
        ],
        table: {
          caption: 'Factores de forma de la Norma E.020 para superficies inclinadas y cubiertas curvas',
          headers: ['Geometría', 'Barlovento', 'Sotavento'],
          rows: [
            ['Superficies inclinadas a 15° o menos', '+0,3 a +0,7', '−0,6'],
            ['Superficies inclinadas entre 15° y 60°', '+0,7 a +0,3', '−0,6'],
            ['Superficies inclinadas entre 60° y la vertical', '+0,8', '−0,6'],
            ['Arcos y cubiertas cilíndricas hasta 45° de inclinación', '+0,8', '−0,5'],
          ],
        },
      },
      {
        heading: 'Dónde falla realmente: el anclaje',
        body: [
          'Calculada la carga, el problema se traslada al anclaje. Anclar sobre losa existente, sobre terreno natural o con lastre son tres soluciones estructuralmente distintas, y la succión exige verificar la extracción, no solo la compresión.',
          'En coberturas desmontables el riesgo aumenta: el sistema se monta y desmonta por personal que rota, y un anclaje que depende de la ejecución perfecta terminará mal ejecutado alguna vez. El diseño debe tolerar esa realidad.',
        ],
        list: [
          'Verifique extracción, no solo carga vertical, en cada punto de anclaje.',
          'Considere el caso de cobertura parcialmente abierta: un lateral abierto cambia por completo la presión interior.',
          'Defina un procedimiento de cierre ante alerta de viento y quién lo ejecuta.',
          'Prevea la inspección periódica del tensado: una lona destensada aletea y fatiga sus propios amarres.',
        ],
      },
      {
        heading: 'Qué entregar al proyectista',
        list: [
          'Ubicación exacta del emplazamiento y altura de la estructura.',
          'Geometría de la cubierta y ángulos de inclinación.',
          'Condición de cerramiento: cerrada, abierta en un lado o completamente abierta.',
          'Tipo de piso o terreno disponible para el anclaje.',
          'Permanencia prevista y frecuencia de montaje y desmontaje.',
        ],
      },
    ],
    howTo: {
      name: 'Estimar la carga de viento de una cobertura textil según la Norma E.020',
      steps: [
        {
          name: 'Determinar la velocidad de referencia',
          text: 'Tomar la velocidad del viento a 10 metros de altura correspondiente al emplazamiento, considerando que la Norma E.020 fija una velocidad de diseño no menor de 75 km/h hasta los 10 metros de altura.',
        },
        {
          name: 'Corregir la velocidad por la altura de la estructura',
          text: 'Aplicar Vh = V (h/10)^0,22 con la altura real de la cobertura, de modo que una estructura alta reciba la velocidad que efectivamente le corresponde y no la del nivel del suelo.',
        },
        {
          name: 'Identificar el factor de forma de cada superficie',
          text: 'Clasificar cada paño según su inclinación y su posición respecto del viento, tomando el factor de forma correspondiente y respetando el signo negativo en las caras a sotavento.',
        },
        {
          name: 'Calcular la presión y la succión',
          text: 'Aplicar Ph = 0,005 · C · Vh² para obtener la carga en kilogramos-fuerza por metro cuadrado en cada superficie, distinguiendo las que reciben presión de las que reciben succión.',
        },
        {
          name: 'Verificar el anclaje a extracción',
          text: 'Comprobar que cada punto de anclaje resiste la componente de succión, que es la que arranca coberturas, y no solamente la carga gravitacional del conjunto.',
        },
        {
          name: 'Definir el procedimiento operativo ante viento',
          text: 'Establecer quién cierra o refuerza la cobertura ante alerta de viento, con qué criterio y en cuánto tiempo, e incorporar la inspección periódica del tensado al plan de mantenimiento.',
        },
      ],
    },
    faqs: [
      {
        q: '¿Cómo se calcula la carga de viento de una carpa en el Perú?',
        a: 'Según la Norma E.020 del Reglamento Nacional de Edificaciones: primero se corrige la velocidad por altura con Vh = V (h/10)^0,22, con un mínimo de 75 km/h hasta los 10 metros, y luego se obtiene la carga con Ph = 0,005 · C · Vh² en kgf/m², donde C es el factor de forma de cada superficie.',
      },
      {
        q: '¿Por qué se levantan las coberturas si el viento empuja hacia abajo?',
        a: 'Porque en las caras a sotavento el factor de forma es negativo: la cobertura recibe succión, no presión. Esa succión tira hacia afuera y hace trabajar los anclajes a extracción, que es el modo de falla habitual de lonas y cubiertas textiles.',
      },
      {
        q: '¿Qué velocidad de viento debo usar si no tengo datos del lugar?',
        a: 'La Norma E.020 fija una velocidad de diseño no menor de 75 km/h hasta los 10 metros de altura, que actúa como piso normativo. Para el valor específico del emplazamiento debe consultarse el mapa eólico y el texto vigente de la norma, y encargar la verificación a un profesional responsable del diseño.',
      },
      {
        q: '¿Una carpa desmontable necesita el mismo cálculo que una permanente?',
        a: 'Sí, y además debe tolerar la variabilidad de la ejecución: el montaje y desmontaje repetidos por personal que rota hacen que un anclaje que exige ejecución perfecta falle alguna vez. El diseño debe considerar esa realidad operativa.',
      },
    ],
    relatedProducts: [
      'carpas-lona-estructuras-metalicas',
      'coberturas-tensionadas-arquitectura-textil',
      'modulos-albergues-campamentos',
    ],
    relatedCities: ['lima', 'arequipa', 'cusco'],
    sources: [
      {
        label: 'Norma E.020 Cargas — Reglamento Nacional de Edificaciones (Perú)',
        url: 'https://cdn-web.construccion.org/normas/rne2012/rne2006/files/titulo3/02_E/RNE2006_E_020.pdf',
        supports: 'Artículo 12: velocidad de diseño Vh = V (h/10)^0,22, mínimo de 75 km/h, carga Ph = 0,005 C Vh² y tabla de factores de forma.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'cobertores-transporte-concentrado-mineral',
    title:
      'Cobertores para transporte de concentrado: contención, amarre y el error de comprar por metro cuadrado',
    metaTitle: 'Cobertores para transporte de concentrado mineral',
    description:
      'Qué exige el transporte de concentrados por carretera en el Perú, por qué el cobertor es un elemento de contención y no solo una tapa, y cómo se especifica el amarre para que resista viento a velocidad de ruta.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 10,
    category: 'Lonas y Cobertores',
    sectors: ['Transporte', 'Minería', 'Logística'],
    keyTakeaways: [
      'Un cobertor de tolva no trabaja como una tapa estática: a velocidad de ruta recibe succión, aletea y fatiga sus propios puntos de amarre.',
      'El transporte terrestre de materiales y residuos peligrosos en el Perú está reglamentado por el D.S. 021-2008-MTC; cuando el concentrado califica como mercancía peligrosa, el cobertor forma parte de un sistema de contención sujeto a esas exigencias.',
      'La densidad de amarre importa más que el gramaje: un cobertor pesado con pocos puntos de amarre se desgarra antes que uno más liviano bien fijado.',
      'El diseño debe resolver quién lo coloca y en cuánto tiempo: un cobertor que exige diez minutos y dos personas en una balanza con cola termina mal colocado.',
    ],
    intro: [
      'El cobertor de una tolva con concentrado cumple tres funciones a la vez: evita el derrame y la dispersión del material, protege la carga de la lluvia y forma parte del cumplimiento del transporte. Cuando falla, el costo rara vez es el cobertor: es el material perdido en la ruta, la limpieza y la exposición ante la autoridad.',
      'Este artículo trata el cobertor como lo que es en operación —un elemento de contención sometido a carga dinámica— y ordena su especificación en consecuencia.',
    ],
    sections: [
      {
        heading: 'Qué carga recibe realmente un cobertor en ruta',
        body: [
          'A velocidad de carretera, el aire que pasa sobre la tolva genera succión sobre el cobertor: en lugar de ser presionado contra la carga, tiende a ser levantado. Si queda holgura, empieza a aletear, y el aleteo es un ciclo de fatiga que trabaja precisamente sobre los ojalillos y las costuras del perímetro.',
          'Ese es el mecanismo detrás de la mayoría de las fallas: no una rotura por impacto, sino un desgarro progresivo desde el punto de amarre que aparece semanas después de instalado.',
        ],
        callout:
          'El enemigo no es la lluvia ni el peso: es el aleteo. Un cobertor bien tensado dura varias veces más que el mismo cobertor mal tensado.',
      },
      {
        heading: 'El marco normativo cuando el concentrado es mercancía peligrosa',
        body: [
          'El transporte terrestre de materiales y residuos peligrosos en el Perú se rige por el Reglamento Nacional aprobado mediante D.S. 021-2008-MTC. Varios concentrados minerales pueden quedar comprendidos en esa clasificación según su composición.',
          'La consecuencia práctica para la especificación del cobertor: no basta con que "cubra". Debe formar parte de un sistema de contención coherente con el resto del vehículo y de la operación. Recomendamos verificar con el área de cumplimiento de su empresa qué clasificación aplica a su material específico antes de definir el cobertor.',
        ],
      },
      {
        heading: 'Densidad de amarre: el parámetro que casi nunca se especifica',
        body: [
          'La comparación entre proveedores casi siempre se hace por material y gramaje, que son las variables visibles en una cotización. Pero el punto de falla está en el perímetro: cuántos puntos de amarre hay, cómo están reforzados y con qué elemento se tensan.',
          'Un cobertor de alto gramaje con pocos ojalillos concentra toda la carga de succión en cada punto. Uno más liviano, con refuerzo continuo de borde y una densidad de amarre acorde a la velocidad de operación, se comporta mejor y pesa menos para quien lo coloca.',
        ],
        list: [
          'Refuerzo continuo en todo el perímetro, no solo en las esquinas.',
          'Separación de ojalillos definida por la velocidad de operación, no por costumbre.',
          'Elemento de tensado que mantenga la tensión con la vibración del viaje.',
          'Protección contra el roce en los cantos de la tolva, que es donde se abre el paño.',
        ],
      },
      {
        heading: 'El factor humano: quién lo coloca y en cuánto tiempo',
        body: [
          'Un cobertor que exige demasiado tiempo o demasiadas personas terminará mal colocado en la práctica, sobre todo en balanzas con cola de unidades esperando. El diseño debe considerar el peso manipulable, el sistema de despliegue y el punto donde se para el operador.',
          'Esto no es ergonomía decorativa: un cobertor mal colocado por apuro produce exactamente la holgura que dispara el aleteo y el desgarro.',
        ],
      },
      {
        heading: 'Qué especificar al cotizar',
        list: [
          'Tipo de tolva y dimensiones reales, incluyendo el traslape requerido a cada lado.',
          'Material transportado y si está clasificado como mercancía peligrosa.',
          'Velocidad y perfil de ruta habitual, y exposición a lluvia o a polvo.',
          'Sistema de amarre existente en la unidad y si puede modificarse.',
          'Tiempo objetivo de colocación y cuántas personas lo ejecutan.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Por qué se rompen los cobertores de tolva por los ojalillos?',
        a: 'Porque a velocidad de ruta el cobertor recibe succión y, si tiene holgura, aletea. El aleteo es un ciclo de fatiga que actúa sobre el perímetro, de modo que el desgarro empieza en el punto de amarre y avanza. Un tensado correcto y una densidad de ojalillos adecuada evitan la mayoría de estas fallas.',
      },
      {
        q: '¿Qué norma aplica al transporte de concentrados en el Perú?',
        a: 'El transporte terrestre de materiales y residuos peligrosos está reglamentado por el D.S. 021-2008-MTC. La clasificación de un concentrado concreto depende de su composición, por lo que conviene verificarla con el área de cumplimiento antes de definir el sistema de contención.',
      },
      {
        q: '¿Es mejor un cobertor más pesado?',
        a: 'No necesariamente. Un gramaje alto con pocos puntos de amarre concentra la carga de succión y se desgarra antes que un cobertor más liviano con refuerzo perimetral continuo y densidad de amarre adecuada, que además es más fácil de colocar bien.',
      },
      {
        q: '¿Qué medidas debo dar para cotizar un cobertor de tolva?',
        a: 'Las dimensiones reales de la tolva más el traslape requerido a cada lado, el sistema de amarre existente en la unidad, el material transportado, el perfil de ruta y el tiempo objetivo de colocación con la cantidad de personas que lo ejecutan.',
      },
    ],
    relatedProducts: [
      'mantas-cobertores-toldos-camiones',
      'siders-tolderas-camiones',
      'lona-plastificada-rafia-polytarp',
    ],
    relatedCities: ['lima', 'arequipa', 'chimbote'],
    sources: [
      {
        label: 'D.S. 021-2008-MTC — Reglamento Nacional de Transporte Terrestre de Materiales y Residuos Peligrosos',
        url: 'https://gestop.pe/ds-021-2008-mtc-aprueban-el-reglamento-nacional-de-transporte-terrestre-de-materiales-y-residuos-peligrosos/',
        supports: 'Marco reglamentario peruano aplicable al transporte terrestre de materiales y residuos peligrosos.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'tanques-flexibles-almacenamiento-agua-operaciones-remotas',
    title:
      'Tanques flexibles para agua en operaciones remotas: base, volumen útil y la pregunta del agua potable',
    metaTitle: 'Tanques flexibles de agua: base y potabilidad',
    description:
      'Cómo dimensionar un tanque flexible, por qué la preparación de la base decide su vida útil, y qué preguntar sobre certificación de materiales cuando el contenido es agua para consumo humano.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 9,
    category: 'Soluciones Ambientales y Fluidos',
    sectors: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    keyTakeaways: [
      'El tanque flexible resuelve un problema logístico antes que hidráulico: llega plegado en un camión y se monta sin grúa, que es lo que lo hace viable en operaciones remotas.',
      'La base decide la vida útil: un elemento punzante bajo la membrana produce la misma falla que la piedra angular bajo una geomembrana.',
      'Si el contenido es agua para consumo humano, la pregunta correcta al proveedor es por la certificación de los materiales en contacto; NSF/ANSI 61 es el estándar internacional de referencia para componentes de sistemas de agua potable.',
      'El volumen útil no es el volumen nominal: hay que descontar la altura de desplegado real y prever el área que ocupa el tanque lleno, mayor que la del tanque vacío extendido.',
    ],
    intro: [
      'En un frente remoto, la restricción no suele ser el agua sino cómo almacenarla: un tanque rígido exige transporte especial, obra civil y equipo de montaje que muchas veces no está disponible. El tanque flexible existe para saltarse esa cadena.',
      'Ese ahorro tiene condiciones. Este artículo revisa las tres que deciden si el equipo dura una campaña o varias: la base, el dimensionamiento realista y la definición del contenido.',
    ],
    sections: [
      {
        heading: 'La base es el proyecto',
        body: [
          'Un tanque flexible transmite toda su carga al terreno a través de la membrana. Cualquier elemento punzante —una piedra angular, un resto de fierro, una raíz— se convierte en un concentrador de esfuerzo bajo varias toneladas de agua.',
          'La preparación de la base es, por lo tanto, la parte no negociable de la instalación: superficie nivelada, compactada y libre de elementos punzantes, con la protección adicional que el terreno exija. Es el mismo criterio que rige la subrasante bajo una geomembrana, y se descuida por la misma razón: no se ve una vez lleno el tanque.',
        ],
        callout:
          'Si la base no cumple, el tanque no falla el primer día: falla cuando ya nadie recuerda cómo se preparó el terreno.',
      },
      {
        heading: 'Volumen útil frente a volumen nominal',
        body: [
          'El volumen que figura en la especificación se alcanza con el tanque desplegado en las condiciones previstas por el fabricante. En terreno, la altura real de llenado y la geometría del área disponible pueden reducir el volumen efectivo.',
          'Además, el área ocupada cambia entre el tanque vacío extendido y el tanque lleno. Planificar el emplazamiento con la huella del tanque vacío es un error frecuente que obliga a reubicar el equipo cuando ya está en uso.',
        ],
        list: [
          'Verifique la huella del tanque lleno, no la del tanque extendido en vacío.',
          'Considere el acceso para llenado y descarga, incluyendo el radio de maniobra del vehículo.',
          'Prevea la contención secundaria cuando el contenido lo exija.',
          'Confirme la altura libre disponible si el emplazamiento está bajo cubierta.',
        ],
      },
      {
        heading: 'Agua potable: cómo formular la pregunta correcta',
        body: [
          'Cuando el contenido es agua para consumo humano, la pregunta no es "¿sirve para agua potable?" sino "¿qué certificación tienen los materiales en contacto con el agua?". NSF/ANSI 61 es el estándar internacional de referencia para los efectos en la salud de los componentes de sistemas de agua potable.',
          'Pedirlo por escrito, en la etapa de cotización, evita la situación incómoda de descubrir en obra que el equipo entregado no es apto para el uso previsto. Del mismo modo, no declaramos como propias certificaciones que no podamos respaldar: lo que corresponde es entregar la documentación real del fabricante.',
        ],
      },
      {
        heading: 'Qué especificar al cotizar',
        list: [
          'Fluido a contener y si es para consumo humano.',
          'Volumen requerido y régimen de uso: almacenamiento estático o llenado y vaciado frecuente.',
          'Características y dimensiones del terreno disponible.',
          'Accesorios necesarios: conexiones, válvulas, venteo, sistema de medición.',
          'Ciudad y condiciones de acceso al emplazamiento, que determinan la logística de entrega.',
        ],
      },
    ],
    howTo: {
      name: 'Instalar un tanque flexible en un emplazamiento remoto',
      steps: [
        {
          name: 'Definir volumen y régimen de uso',
          text: 'Establecer el volumen requerido y si el tanque trabajará como almacenamiento estático o con ciclos frecuentes de llenado y vaciado, porque el régimen afecta la selección del equipo y sus accesorios.',
        },
        {
          name: 'Seleccionar y preparar el emplazamiento',
          text: 'Elegir un área que admita la huella del tanque lleno, con acceso para el vehículo de llenado, y nivelar y compactar el terreno retirando piedras angulares, restos metálicos y raíces.',
        },
        {
          name: 'Colocar la protección de base cuando el terreno lo exija',
          text: 'Instalar la capa de protección adecuada si el terreno es granular grueso o presenta material anguloso, con el mismo criterio que se aplica a la subrasante bajo una geomembrana.',
        },
        {
          name: 'Desplegar el tanque y conectar accesorios',
          text: 'Extender el tanque sin arrastrarlo sobre el terreno y montar las conexiones de llenado, descarga y venteo previstas antes de iniciar el llenado, verificando la ausencia de pliegues forzados.',
        },
        {
          name: 'Llenar de forma controlada y verificar',
          text: 'Realizar un primer llenado progresivo, revisando el asentamiento de la base y el comportamiento de las conexiones, y corrigiendo cualquier deformación antes de alcanzar el volumen total.',
        },
        {
          name: 'Establecer la rutina de inspección',
          text: 'Definir la frecuencia de revisión de la base, las conexiones y la membrana, y el procedimiento de reparación con el kit del fabricante ante cualquier daño superficial detectado.',
        },
      ],
    },
    faqs: [
      {
        q: '¿Qué preparación de terreno necesita un tanque flexible?',
        a: 'Una superficie nivelada, compactada y libre de elementos punzantes, dimensionada para la huella del tanque lleno y con protección adicional si el terreno es granular grueso o anguloso. La base es el factor que más determina la vida útil del equipo.',
      },
      {
        q: '¿Un tanque flexible sirve para agua potable?',
        a: 'Depende de los materiales en contacto con el agua y de su certificación. La pregunta correcta al proveedor es qué certificación tienen esos materiales; NSF/ANSI 61 es el estándar internacional de referencia para componentes de sistemas de agua potable. Conviene solicitarlo por escrito en la cotización.',
      },
      {
        q: '¿Cuánto espacio ocupa realmente un tanque flexible?',
        a: 'Más de lo que sugiere el tanque extendido en vacío: la huella cambia al llenarse. El emplazamiento debe planificarse con la geometría del tanque lleno, más el espacio de acceso para el vehículo de llenado y para la operación de descarga.',
      },
      {
        q: '¿Se pueden reparar los tanques flexibles?',
        a: 'Los daños superficiales suelen repararse con el kit y el procedimiento del fabricante. Por eso conviene incorporar la inspección periódica de la membrana y de la base a la rutina de la operación, para detectar el daño cuando todavía es reparable.',
      },
    ],
    relatedProducts: ['tanques-flexibles-bladders', 'tuberias-hdpe', 'geomembrana-polietileno-pe-hdpe'],
    relatedCities: ['arequipa', 'cusco', 'piura'],
    sources: [
      {
        label: 'NSF/ANSI 61 — Drinking Water System Components: Health Effects (NSF)',
        url: 'https://www.nsf.org/knowledge-library/nsf-ansi-standard-61-drinking-water-system-components-health-effects',
        supports: 'Estándar internacional de referencia para los efectos en la salud de los componentes en contacto con agua potable.',
      },
    ],
  },

  // ===========================================================================
  {
    slug: 'mulch-madera-espesor-calculo-cobertura-suelo',
    title:
      'Mulch de madera: cómo calcular el volumen y por qué el espesor decide si funciona o no',
    metaTitle: 'Mulch de madera: cálculo de volumen y espesor',
    description:
      'Fórmula para calcular el volumen de mulch por superficie y espesor, qué rango de espesor recomiendan los servicios de extensión, y los errores de aplicación que anulan el beneficio o dañan la planta.',
    datePublished: '2026-08-18',
    dateModified: '2026-08-18',
    readingMinutes: 8,
    category: 'Especialidades',
    sectors: ['Agricultura', 'Construcción', 'Paisajismo'],
    keyTakeaways: [
      'El volumen de mulch se calcula como superficie por espesor: es una cuenta de tres líneas que evita comprar de más o quedarse a mitad de obra.',
      'Los servicios de extensión universitaria recomiendan capas del orden de unas pocas pulgadas de espesor: por debajo de ese rango el control de malezas es marginal y por encima empiezan los problemas de aireación.',
      'Aplicar de menos es el error más frecuente y el más caro, porque anula el beneficio y hace parecer que el producto no sirve.',
      'El mulch no debe apilarse contra el tallo o el tronco: la humedad permanente en el cuello de la planta favorece pudriciones.',
    ],
    intro: [
      'El mulch es de los pocos insumos donde el desempeño depende casi por completo de cómo se aplica. La misma madera picada, aplicada con la mitad del espesor necesario, no controla malezas ni retiene humedad — y la conclusión que saca el cliente es que el producto no funciona.',
      'Este artículo resuelve la parte aritmética, que casi nadie hace antes de comprar, y ordena los criterios de aplicación que deciden el resultado.',
    ],
    sections: [
      {
        heading: 'El cálculo: superficie por espesor',
        body: [
          'El volumen necesario se obtiene multiplicando la superficie a cubrir por el espesor objetivo, expresados en las mismas unidades. Con la superficie en metros cuadrados y el espesor en metros, el resultado sale directamente en metros cúbicos.',
          'Conviene añadir un margen por asentamiento y por pérdidas de manipulación, y recalcular si el terreno tiene desniveles marcados: una superficie irregular consume más material del que sugiere su proyección en planta.',
        ],
        table: {
          caption: 'Volumen aproximado según espesor objetivo, por cada 100 m² de superficie',
          headers: ['Espesor aplicado', 'Volumen por 100 m²'],
          rows: [
            ['5 cm', '5 m³'],
            ['7,5 cm', '7,5 m³'],
            ['10 cm', '10 m³'],
          ],
        },
        callout:
          'Regla mnemotécnica: cada centímetro de espesor sobre 100 m² consume un metro cúbico de material. El resto es multiplicar.',
      },
      {
        heading: 'Cuánto espesor: el rango que recomienda la extensión agrícola',
        body: [
          'Los servicios de extensión universitaria recomiendan aplicar el mulch orgánico en capas del orden de unas pocas pulgadas de espesor para obtener el beneficio buscado en control de malezas y conservación de humedad.',
          'Por debajo de ese rango, la luz llega al suelo y las malezas germinan igual; muy por encima, la capa puede dificultar el intercambio de gases y la llegada del agua de riego a la zona de raíces. El objetivo es la franja intermedia, no el máximo posible.',
        ],
      },
      {
        heading: 'Los errores que anulan el beneficio',
        list: [
          'Aplicar demasiado delgado: la maleza germina y el cliente concluye que el producto no sirve.',
          'Apilar el material contra el tallo o el tronco: la humedad permanente en el cuello favorece pudriciones.',
          'No corregir las malezas existentes antes de aplicar: el mulch no elimina lo que ya está establecido.',
          'Aplicar sobre suelo seco: conviene regar antes, porque el mulch conserva la humedad que encuentra, no la que falta.',
          'Ignorar el viento: en zonas expuestas la granulometría fina se desplaza y hay que reponer antes de tiempo.',
        ],
      },
      {
        heading: 'Granulometría: permanencia frente a apariencia',
        body: [
          'Una granulometría gruesa permanece mejor frente al viento y al riego, y se degrada más lentamente. Una fina cubre de forma más uniforme y tiene mejor acabado visual, pero se desplaza y se descompone antes.',
          'En paisajismo suele primar el acabado; en cultivo y en obra, la permanencia. Es una decisión explícita, no un detalle del proveedor.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuánto mulch necesito por metro cuadrado?',
        a: 'El volumen es la superficie multiplicada por el espesor objetivo. Como referencia práctica, cada centímetro de espesor sobre 100 m² consume aproximadamente un metro cúbico de material, al que conviene sumar un margen por asentamiento y manipulación.',
      },
      {
        q: '¿Qué espesor de mulch se debe aplicar?',
        a: 'Los servicios de extensión universitaria recomiendan capas del orden de unas pocas pulgadas. Por debajo, el control de malezas es marginal porque la luz sigue llegando al suelo; muy por encima, se dificulta el intercambio de gases y el ingreso del agua de riego.',
      },
      {
        q: '¿El mulch se puede aplicar pegado al tronco?',
        a: 'No conviene. Apilar mulch contra el tallo o el tronco mantiene húmedo el cuello de la planta y favorece pudriciones. La práctica correcta es dejar un espacio libre alrededor de la base.',
      },
      {
        q: '¿El mulch elimina las malezas existentes?',
        a: 'No. Actúa impidiendo que germinen nuevas al bloquear la luz, pero no elimina lo que ya está establecido. Las malezas presentes deben controlarse antes de aplicar la capa.',
      },
    ],
    relatedProducts: ['mulch-madera-picada', 'malla-raschel-sombra', 'geotextiles'],
    relatedCities: ['lima', 'trujillo', 'huancayo'],
    sources: [
      {
        label: 'University of Minnesota Extension — Mulching for soil and garden health',
        url: 'https://extension.umn.edu/managing-soil-and-nutrients/mulching-soil-and-garden-health',
        supports: 'Recomendaciones de espesor de aplicación de mulch orgánico y sus efectos en control de malezas y humedad del suelo.',
      },
    ],
  },
];

export const articleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const articleUrl = (slug: string): string => `${SITE.url}/recursos/${slug}`;

/** Categorías presentes en el silo, en orden de aparición. */
export const articleCategories = Array.from(new Set(articles.map((a) => a.category)));
