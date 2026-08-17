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
    metaTitle: 'Big Bags para minería en Perú: normativa ISO 21898 y errores de estiba',
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
    metaTitle: 'Instalación de geomembranas HDPE en pozas y canales: guía técnica',
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
    metaTitle: 'Cálculo de caudal para mangas de ventilación minera en el Perú',
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
];

export const articleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const articleUrl = (slug: string): string => `${SITE.url}/recursos/${slug}`;

/** Categorías presentes en el silo, en orden de aparición. */
export const articleCategories = Array.from(new Set(articles.map((a) => a.category)));
