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
  /**
   * Firma editorial visible. Sin nombres inventados: la autoría es del área,
   * no de una persona ficticia. Si se omite, components/Byline.tsx usa la
   * firma por defecto «Área técnica · Plastilonas Peruanas SAC».
   */
  byline?: string;
}

export const articles: Article[] = [
  // ===========================================================================
  {
    slug: 'big-bags-mineria-peru-normativa-errores-estiba',
    title:
      'Big Bags para minería en el Perú: qué exige la normativa y los 7 errores de estiba que rompen bolsones',
    metaTitle: 'Big Bags en minería: ISO 21898 y errores de estiba',
    description:
      'Factor de seguridad 5:1 frente a 6:1, la ISO 21898 que el Callao exige desde 2023, y los siete errores de estiba que rompen bolsones en mina.',
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
      'Subrasante, zanja de anclaje, soldadura por cuña y extrusión, y los ensayos que delatan la costura que filtrará meses después de la entrega.',
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
      'Aire por persona y por HP diésel, corrección por altitud hasta 4000 msnm, y cómo dimensionar diámetro y tramo para que el aire llegue al frente.',
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
      'Impelente, aspirante o mixta en labor ciega: tiempo de reingreso tras voladura, control de polvo y por qué la aspirante exige refuerzo anticolapso.',
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
      'Las cuatro funciones del geotextil, por qué comprarlo por gramaje es el error más común, y qué exige AASHTO M288 según la severidad de la obra.',
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
      'Qué plaga excluye cada densidad de trama, y por qué excluir trips puede multiplicar la superficie de malla necesaria para no perder ventilación.',
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
      'Velocidad de diseño, presión de viento y factores de forma según la norma E.020, y por qué es la succión —no la presión— la que arranca la cubierta.',
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
      'El cobertor de concentrado es contención, no una tapa: qué exige el transporte por carretera en el Perú y cómo se especifica el amarre.',
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
      'Cómo dimensionar un tanque flexible, por qué la base decide su vida útil, y qué certificación pedir si el agua es para consumo humano.',
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
      'Cómo calcular el volumen de mulch por superficie y espesor, qué espesor recomienda la extensión agrícola, y los errores que anulan el beneficio.',
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
  // ═══════════════════════════════════════════════════════════════════════════
  // SERIE «EL ECOSISTEMA» — de dónde sale este rubro y cómo se decide en él.
  //
  // Estos cinco artículos no venden un SKU: explican la industria en la que
  // los SKU existen. Son la respuesta a las preguntas que un comprador hace
  // ANTES de saber qué producto necesita —de qué está hecho esto, por qué el
  // material importa, qué pasa al final de la vida útil, cómo se compra desde
  // otro país— y por eso son los primeros artículos del silo cuya página es
  // canónica en el mapa de consultas en vez de apoyo.
  //
  // REGLA DE LA SERIE, más estricta que la general: aquí no hay ninguna cifra
  // de mercado. Ni toneladas importadas, ni cuota, ni tamaño del sector. Cada
  // número que aparece es una propiedad física o una relación normativa con su
  // fuente citada. Un artículo de ecosistema con estadísticas inventadas es el
  // camino más corto para que un modelo de lenguaje cite basura con nuestro
  // nombre al lado.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: 'de-la-resina-a-la-rafia-cadena-productiva-textil-industrial',
    title: 'De la resina a la rafia: la cadena productiva del textil industrial, etapa por etapa',
    metaTitle: 'De la resina a la rafia: cómo se fabrica',
    description:
      'El recorrido completo: gránulo de polipropileno, extrusión de cinta, estiraje, telar circular, laminado y confección. Qué gobierna la calidad en cada etapa.',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readingMinutes: 12,
    category: 'Especialidades',
    sectors: ['Industrial', 'Minería', 'Agricultura'],
    keyTakeaways: [
      'La rafia no es un plástico distinto: es polipropileno cuya resistencia se construye mecánicamente, estirando la cinta extruida para orientar las cadenas del polímero en la dirección de la carga.',
      'La calidad de un tejido de rafia se decide en cuatro variables que rara vez aparecen en una orden de compra: título de la cinta (denier), relación de estiraje, densidad de trama y tratamiento ultravioleta.',
      'El gramaje por sí solo no describe un tejido: dos telas del mismo peso por metro cuadrado pueden diferir en resistencia real según cómo se repartió ese peso entre urdimbre y trama.',
      'Cada etapa de la cadena —extrusión, tejido, laminado, confección— tiene un defecto típico que se detecta en planta y no en el producto terminado; por eso la trazabilidad por lote importa más que la marca.',
    ],
    intro: [
      'Casi todo lo que este rubro vende —big bags, lonas de rafia, mallas, sacos— empieza igual: un gránulo de polipropileno del tamaño de una lenteja. Entre ese gránulo y un bolsón capaz de izar una tonelada hay cuatro transformaciones, y en cada una se decide una parte de la calidad que el comprador después no puede ver.',
      'Este artículo recorre la cadena completa tal como ocurre en una planta de textiles industriales, con las variables que gobiernan cada etapa y el defecto típico que produce cada una cuando se hace mal. No hace falta ser ingeniero de polímeros para comprarlo bien: hace falta saber qué preguntar.',
    ],
    sections: [
      {
        heading: 'Qué es exactamente la rafia (y qué no es)',
        body: [
          'La rafia industrial es una cinta plana de polipropileno de unos pocos milímetros de ancho, obtenida por extrusión y estirada en caliente. El estiraje es el paso decisivo: al traccionar la cinta a temperatura controlada, las cadenas moleculares del polímero se orientan en la dirección del estiramiento, y la resistencia a tracción en esa dirección se multiplica respecto a la del film sin orientar.',
          'Por eso un tejido de rafia resiste tanto pesando tan poco: la resistencia no viene de acumular material sino de ordenarlo. Y por eso mismo la rafia es fuerte a lo largo de la cinta y comparativamente débil en el sentido transversal — el tejido posterior, cruzando urdimbre y trama, es lo que reparte esa resistencia en las dos direcciones.',
        ],
        callout:
          'Consecuencia práctica: una cinta mal estirada produce un tejido que pesa lo mismo y resiste menos. El gramaje de la ficha técnica no detecta este defecto; el ensayo de tracción, sí.',
      },
      {
        heading: 'Etapa 1 — Extrusión: del gránulo a la cinta',
        body: [
          'La resina llega a la planta como gránulo y se funde en una extrusora junto con los aditivos que definen el comportamiento del producto final: masterbatch de color, estabilizantes ultravioleta y, según el uso, antiestáticos o retardantes. La masa fundida sale como un film plano que se enfría en agua, se corta en cintas y se estira en un horno de orientación.',
          'En el Perú esta etapa parte de resina importada: el país no cuenta con producción petroquímica de polipropileno a escala industrial, de modo que el gránulo entra por puerto —principalmente el Callao— y la transformación local comienza en la extrusión. Es un dato de estructura, no de coyuntura: condiciona plazos, lotes mínimos y la lógica de fabricar localmente frente a importar tejido o producto terminado.',
        ],
        table: {
          caption: 'Variables de extrusión y su efecto en el producto final',
          headers: ['Variable', 'Qué define', 'Defecto típico si falla'],
          rows: [
            ['Relación de estiraje', 'Resistencia a tracción de la cinta', 'Cinta que pesa igual y resiste menos; rotura prematura en servicio'],
            ['Título (denier)', 'Peso por longitud de cinta; junto a la trama, el gramaje', 'Tejido fuera de especificación aunque «se vea igual»'],
            ['Dosis de estabilizante UV', 'Vida útil a la intemperie', 'Fragilización y cuarteo acelerados bajo sol de altura'],
            ['Homogeneidad del fundido', 'Regularidad de la cinta', 'Puntos débiles aleatorios que ningún control visual detecta'],
          ],
        },
      },
      {
        heading: 'Etapa 2 — Telar circular: el tejido tubular',
        body: [
          'Las bobinas de cinta alimentan telares circulares, donde un conjunto de cintas longitudinales (urdimbre) se cruza con una cinta transversal (trama) que gira insertándose entre ellas. El resultado es un tejido tubular continuo — ideal para sacos y cuerpos de big bag porque el tubo no tiene costura lateral.',
          'La variable comercial aquí es la densidad de trama: cuántas cintas por pulgada en cada dirección. Con el mismo denier, más trama significa más resistencia, más peso y más costo. Dos proveedores pueden cotizar «el mismo» tejido de idéntico gramaje con densidades distintas, y el comportamiento en servicio no será el mismo.',
        ],
        list: [
          'Pida la especificación como denier × trama (por ejemplo, cintas por pulgada en urdimbre y trama), no solo el gramaje.',
          'En productos de izaje, la resistencia de costura importa tanto como la del tejido: pregunte por ambas.',
          'Un tejido tubular sin costura lateral no es automáticamente mejor: depende de si el diseño del producto aprovecha esa continuidad.',
        ],
      },
      {
        heading: 'Etapa 3 — Laminado y acabados',
        body: [
          'El tejido de rafia respira: entre cinta y cinta quedan microaberturas. Cuando el producto exige estanqueidad al polvo o barrera a la humedad —concentrados finos, fertilizantes, harinas— el tejido se lamina con una película delgada de polipropileno fundido que sella la superficie. La lona de rafia laminada de uso general en el Perú se conoce comercialmente como polytarp.',
          'El laminado añade función, no resistencia estructural: la carga la sigue llevando el tejido orientado. Por eso evaluar una lona laminada solo por su espesor total confunde dos cosas distintas — cuánta película tiene y cuánto tejido tiene.',
        ],
      },
      {
        heading: 'Etapa 4 — Corte, confección y soldadura: donde el tejido se vuelve producto',
        body: [
          'La última etapa convierte metros de tejido en un producto con geometría y costuras: corte según patrón, confección con hilo de alta tenacidad y, en productos que exigen continuidad de barrera, unión por soldadura térmica en lugar de costura.',
          'Es la etapa con más intervención humana y, en productos de izaje, la más crítica para la seguridad: la mayoría de los ensayos de un FIBC fallan por costura o por asa antes que por tejido. Un certificado de fabricación por lote existe precisamente porque la confección puede variar de lote a lote aunque el tejido sea idéntico.',
        ],
        callout:
          'La regla de compra que resume toda la cadena: especifique el tejido por sus variables (denier, trama, estiraje, UV), el producto por su ensayo (tracción, costura, izaje) y el lote por su documento. Marca y gramaje, solos, no aseguran ninguna de las tres cosas.',
      },
    ],
    faqs: [
      {
        q: '¿Por qué la rafia de polipropileno resiste tanto si pesa tan poco?',
        a: 'Porque su resistencia se construye orientando las cadenas moleculares del polímero durante el estiraje en caliente, no acumulando espesor. Una cinta bien orientada multiplica la resistencia a tracción del film original en la dirección de la carga, y el tejido cruza cintas en dos direcciones para repartir esa resistencia.',
      },
      {
        q: '¿Qué debo pedir en una cotización de tejido de rafia además del gramaje?',
        a: 'Denier de la cinta, densidad de trama en ambas direcciones, tratamiento ultravioleta declarado y, si el producto se iza o soporta carga, la resistencia de costura junto a la del tejido. El gramaje solo dice cuánto material hay, no cómo está ordenado ni cosido.',
      },
      {
        q: '¿La resina de polipropileno se produce en el Perú?',
        a: 'No a escala industrial: la resina llega importada, principalmente por el puerto del Callao, y la transformación local comienza en la extrusión de la cinta. Por eso la cadena local convive con la importación directa de tejido o producto terminado, y un catálogo honesto declara qué línea sigue cada camino.',
      },
      {
        q: '¿Qué es el polytarp?',
        a: 'Es el nombre comercial de la lona de rafia de polipropileno laminada: un tejido de cintas orientadas que aporta la resistencia, sellado con una película delgada del mismo polímero que aporta estanqueidad al polvo y barrera a la humedad. Se evalúa por las variables del tejido y del laminado por separado.',
      },
    ],
    relatedProducts: [
      'big-bags-bolsones-polipropileno',
      'lona-plastificada-rafia-polytarp',
      'sacos-polytarp-embarque-granel',
      'malla-raschel-sombra',
    ],
    relatedCities: ['lima', 'callao'],
    sources: [
      {
        label: 'FPI — proceso estándar de fabricación de FIBC (extrusión de cinta, tejido, confección)',
        url: 'https://fpi-bd.com/manufacturing-process/',
        supports: 'La secuencia de etapas descrita: extrusión y estiraje de cintas de PP, tejido en telar y confección del producto.',
      },
      {
        label: 'Encyclopaedia Britannica — Polypropylene',
        url: 'https://www.britannica.com/science/polypropylene',
        supports: 'Naturaleza del polipropileno y el papel de la orientación molecular en las propiedades de fibras y cintas.',
      },
      {
        label: 'APM Terminals Callao — estandarización de bolsones (ISO 21898)',
        url: 'https://www.apmterminals.com/es/callao/customer-zone/news-and-alerts/2022/28112022-recordatorio-estandarizacion-de-bolsones',
        supports: 'Por qué la certificación de fabricación por lote es un requisito operativo real en la cadena de exportación peruana.',
      },
    ],
  },
  {
    slug: 'ecosistema-plastico-industrial-peru-quien-fabrica-quien-compra',
    title: 'El ecosistema del plástico industrial en el Perú: quién fabrica, quién importa y quién compra',
    metaTitle: 'Plástico industrial en el Perú: el ecosistema',
    description:
      'Cómo se estructura el rubro: resina importada, transformación local, importación directa de líneas terminadas, y los sectores que demandan cada cosa.',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readingMinutes: 11,
    category: 'Especialidades',
    sectors: ['Industrial', 'Minería', 'Agricultura', 'Construcción'],
    keyTakeaways: [
      'El rubro peruano del textil plástico industrial se organiza en tres eslabones: resina importada que entra por puerto, transformadores locales que extruyen, tejen y confeccionan, e importación directa de líneas terminadas que no se fabrican localmente a escala.',
      'La pregunta correcta ante un proveedor no es «¿lo fabrican ustedes?» sino «¿qué camino sigue esta línea y qué documento lo respalda?» — fabricación propia, importación directa y suministro bajo pedido tienen ventajas distintas y verificaciones distintas.',
      'La demanda se concentra por sectores con lógicas de compra diferentes: la minería compra contra especificación y normativa, la agroexportación contra campaña y clima, la construcción contra cronograma de obra.',
      'La geografía del ecosistema es asimétrica: la transformación se concentra en Lima y el Callao por el acceso al puerto y a la resina, mientras la demanda se reparte por corredores mineros y agrícolas de todo el país.',
    ],
    intro: [
      'Quien compra textil plástico industrial en el Perú está comprando, sin verlo, una cadena que empieza en una planta petroquímica de otro continente y termina en un taller de confección de Lima o en un contenedor que llega directo de fábrica asiática. Entender esa cadena no es cultura general: cambia qué se le exige a cada proveedor y qué documento respalda cada afirmación.',
      'Este artículo describe la estructura del ecosistema —sin cifras de mercado, porque las publicables con fuente no existen a nivel del rubro— y ofrece el mapa de decisión que un área de compras puede aplicar: qué conviene que sea de fabricación local, qué conviene que sea importación directa, y qué preguntas separan a un proveedor integrado de un revendedor.',
    ],
    sections: [
      {
        heading: 'Los tres eslabones del ecosistema',
        body: [
          'Primer eslabón: la materia prima. El Perú no produce resina de polipropileno ni de polietileno a escala industrial, de modo que el gránulo llega importado y entra principalmente por el Callao. Todo transformador local está, por estructura, aguas abajo de una cadena logística internacional.',
          'Segundo eslabón: la transformación local. Extrusión de cinta y film, telares circulares y planos, laminadoras, y el eslabón de más valor para el comprador a medida: corte, confección y soldadura. Aquí es donde «a la medida del proyecto» es posible — un paño con la geometría exacta de la caja del camión, una manga al diámetro del tramo de mina.',
          'Tercer eslabón: la importación directa de producto terminado. Hay líneas —geomembranas de gran ancho, geomallas, algunas familias técnicas— cuya escala eficiente de producción no existe localmente. Para esas líneas, el valor del proveedor local no está en fabricar sino en especificar, verificar el certificado del fabricante y responder por el conjunto.',
        ],
      },
      {
        heading: 'Fabricar, importar o ambas: el mapa de decisión',
        table: {
          caption: 'Qué camino conviene a qué necesidad',
          headers: ['Situación de compra', 'Camino natural', 'Qué verificar'],
          rows: [
            ['Geometría a medida (toldos de flota, mangas por tramo, paños de cuadro agrícola)', 'Fabricación local', 'Capacidad real de confección: máquinas, soldadura, control dimensional'],
            ['Línea técnica estandarizada de gran escala (geomembrana, geomalla)', 'Importación directa', 'Ficha técnica y certificado de lote del fabricante, entregados con la cotización'],
            ['Volumen estandarizado con especificación normativa (FIBC para exportación)', 'Cualquiera de los dos', 'Certificación de fabricación conforme a la norma que el terminal exige, por lote'],
            ['Urgencia de reposición sobre medida existente', 'Stock local', 'Que el proveedor conserve el patrón y la trazabilidad del pedido anterior'],
          ],
        },
        callout:
          'Un proveedor que declara qué camino sigue cada línea de su catálogo está entregando información de compra, no una debilidad. El que presenta todo como «fabricación propia» sin distinguir, obliga a verificar todo dos veces.',
      },
      {
        heading: 'Quién demanda: cuatro sectores, cuatro lógicas',
        list: [
          'Minería: compra contra especificación y contra normativa —ventilación de labor, contención, izaje— y castiga la falla con paradas cuyo costo no guarda proporción con el precio del textil. Exige documento por lote y trazabilidad.',
          'Agroexportación: compra contra campaña y contra clima. La malla se especifica por plaga, radiación y viento del fundo; el calendario agrícola no negocia con el plazo de importación.',
          'Construcción e infraestructura: compra contra cronograma de obra. Cerramientos, techos temporales y geosintéticos entran y salen del proyecto en fechas que definen si conviene comprar o alquilar, fabricar o traer.',
          'Logística y comercio: compra reposición —cobertura de carga, embalaje de granel— donde la variable dominante es la disponibilidad y la consistencia entre lotes.',
        ],
      },
      {
        heading: 'La geografía: transformación concentrada, demanda repartida',
        body: [
          'La transformación se concentra donde está el puerto y la resina: Lima y el Callao. La demanda, en cambio, vive donde están las operaciones — los corredores mineros del centro y del sur, los valles agroexportadores de la costa, la obra pública en todo el territorio.',
          'Esa asimetría define el modelo de despacho del rubro: fabricación centralizada y envío nacional, con instalación que se coordina por proyecto. Un proveedor que afirme presencia fabril en cada región está describiendo un ecosistema que en este rubro no existe; lo verificable es planta única y logística de alcance nacional.',
        ],
      },
      {
        heading: 'Cómo distinguir a un proveedor integrado de un revendedor',
        steps: [
          'Pida la especificación del tejido en variables de proceso (denier, trama, tratamiento UV), no solo el nombre comercial. Quien fabrica, las conoce; quien revende sin control técnico, suele no poder responderlas.',
          'Pida un producto con una medida no estándar. La respuesta —«se puede, con este plazo y este patrón» frente a «solo tenemos lo del catálogo»— revela si hay confección real detrás.',
          'Pida el documento del lote en la cotización, no en la entrega. El proveedor integrado con su cadena lo obtiene antes de vender; el intermediario lo persigue después.',
          'Verifique la identidad fiscal y la planta declarada por fuentes que el proveedor no controla: el registro tributario público y la dirección física contrastable.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Por qué en el Perú conviven fabricación local e importación directa en el mismo catálogo?',
        a: 'Porque la estructura del ecosistema lo impone: la resina es importada y hay líneas técnicas cuya escala eficiente de producción no existe en el país. La fabricación local aporta la medida exacta y el plazo corto; la importación directa aporta líneas que localmente no se producen. Un catálogo que declara qué camino sigue cada línea está siendo preciso, no débil.',
      },
      {
        q: '¿Qué sector es más exigente al comprar textil industrial?',
        a: 'Exigen cosas distintas. La minería exige documento y trazabilidad porque su costo de falla es el mayor; la agroexportación exige calendario porque la campaña no espera; la construcción exige coordinación con obra. El error es tratarlas igual: la misma lona puede ser una compra correcta para un sector y una imprudencia para otro.',
      },
      {
        q: '¿Cómo verifico que un proveedor peruano de este rubro existe de verdad?',
        a: 'Con fuentes que él no controla: el RUC en el padrón público de SUNAT, la dirección de planta contrastable en un mapa, y el catálogo con especificaciones que respondan a variables de proceso. La verificación de identidad es el primer paso de cualquier homologación, y en este rubro se puede hacer completa sin pedirle nada al proveedor.',
      },
    ],
    relatedProducts: [
      'big-bags-bolsones-polipropileno',
      'geomembrana-polietileno-pe-hdpe',
      'mangas-ventilacion-minas-tuneles',
      'mallas-antiafidas',
      'mantas-cobertores-toldos-camiones',
    ],
    relatedCities: ['lima', 'callao', 'arequipa', 'cajamarca'],
    sources: [
      {
        label: 'APM Terminals Callao — requisitos de ingreso para bolsones',
        url: 'https://www.apmterminals.com/es/callao/customer-zone/news-and-alerts/2022/28112022-recordatorio-estandarizacion-de-bolsones',
        supports: 'El papel del terminal portuario como eslabón normativo real de la cadena de exportación del rubro.',
      },
      {
        label: 'FPI — proceso de fabricación de FIBC',
        url: 'https://fpi-bd.com/manufacturing-process/',
        supports: 'Qué etapas componen la transformación local: extrusión, tejido, laminado y confección.',
      },
      {
        label: 'SUNAT — consulta pública de RUC',
        url: 'https://e-consultaruc.sunat.gob.pe/',
        supports: 'La verificación de identidad fiscal de un proveedor por una fuente que el proveedor no controla.',
      },
    ],
  },
  {
    slug: 'polipropileno-polietileno-pvc-que-material-para-que-trabajo',
    title: 'Polipropileno, polietileno o PVC: qué material para qué trabajo',
    metaTitle: 'PP, PE o PVC: qué plástico para qué trabajo',
    description:
      'Los tres polímeros del textil industrial comparados por lo que decide una compra: comportamiento mecánico, química, soldadura, sol de altura y fin de vida.',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readingMinutes: 10,
    category: 'Especialidades',
    sectors: ['Industrial', 'Minería', 'Construcción', 'Saneamiento'],
    keyTakeaways: [
      'No existe el «mejor plástico»: existe el polímero cuya combinación de rigidez, química, soldabilidad y comportamiento al sol corresponde al trabajo. Los tres dominantes del rubro —PP, PE y PVC— fallan cuando se usan fuera de su terreno.',
      'El polipropileno domina donde la relación resistencia/peso manda (rafia, tejidos, izaje); el polietileno donde manda la barrera y la química (geomembranas, contención); el PVC donde manda la flexibilidad permanente y la confección soldada de precisión (lonas técnicas, ductos flexibles).',
      'La soldadura no es un detalle de fábrica sino un criterio de diseño: PP y PE se unen por termofusión, el PVC admite además alta frecuencia — y esa diferencia decide qué geometrías y qué reparaciones en campo son posibles.',
      'Ninguno de los tres sobrevive al sol de altura peruano sin estabilización ultravioleta declarada: la pregunta «¿qué tratamiento UV tiene?» aplica a los tres por igual.',
    ],
    intro: [
      'Tres polímeros concentran casi todo el textil plástico industrial que se compra en el Perú: polipropileno, polietileno y PVC. Se parecen lo bastante para confundirse en una orden de compra y se comportan lo bastante distinto para que esa confusión termine en una poza que filtra o una lona que se agrieta en su primera temporada en sierra.',
      'Esta guía los compara por los criterios que de verdad deciden una compra industrial — no por sus fichas de polímero, sino por lo que hacen bajo carga, bajo químico, bajo soldadora y bajo el sol.',
    ],
    sections: [
      {
        heading: 'El mapa de los tres, en una tabla',
        table: {
          caption: 'Comparación orientativa por criterio de compra (el proyecto concreto manda)',
          headers: ['Criterio', 'Polipropileno (PP)', 'Polietileno (PE/HDPE)', 'PVC flexible'],
          rows: [
            ['Terreno natural', 'Tejidos y rafia: sacos, big bags, mallas', 'Barreras y contención: geomembranas, tanques', 'Lonas técnicas soldadas, ductos flexibles, cobertores'],
            ['Carácter mecánico', 'Rígido y liviano; excelente relación resistencia/peso orientado', 'Tenaz y flexible; alta resistencia a punzonado en espesores de membrana', 'Flexible de forma permanente por plastificantes; muy confeccionable'],
            ['Resistencia química general', 'Muy buena a ácidos y álcalis', 'Referencia del rubro para contención', 'Buena, con sensibilidad a algunos solventes'],
            ['Unión', 'Termofusión y costura', 'Termofusión (cuña caliente, extrusión)', 'Termofusión y alta frecuencia'],
            ['Comportamiento al frío de altura', 'Se fragiliza antes que el PE', 'El mejor de los tres a baja temperatura', 'Depende fuertemente de la formulación'],
            ['Reciclabilidad práctica', 'Alta en mono-material (clase 5)', 'Alta en mono-material (clases 2 y 4)', 'Más limitada; cadena separada'],
          ],
        },
        callout:
          'Esta tabla orienta la conversación técnica; no reemplaza la ficha del material del lote. Los tres polímeros se formulan: dos PVC o dos PE de distinta receta no se comportan igual.',
      },
      {
        heading: 'Polipropileno: el rey del tejido',
        body: [
          'El PP es el polímero del textil propiamente dicho. Orientado en cinta, ofrece la mejor relación resistencia/peso de los tres, y por eso domina todo lo que se teje: sacos, big bags, mallas agrícolas, lonas de rafia. Flota en agua —dato útil en faena— y resiste bien ácidos y álcalis.',
          'Sus límites: se fragiliza a baja temperatura antes que el polietileno —relevante en operaciones altoandinas— y sin estabilización es de los más sensibles a la fotodegradación. Un tejido de PP para sierra se especifica con el tratamiento UV como variable de primera línea, no como acabado opcional.',
        ],
      },
      {
        heading: 'Polietileno: el rey de la barrera',
        body: [
          'El PE de alta densidad es el material de referencia mundial para geomembranas de contención: combina resistencia química amplia, tenacidad a baja temperatura y un cuerpo de especificación técnica maduro —la serie GRI-GM del Geosynthetic Institute— que permite comprarlo contra ensayo y no contra promesa.',
          'Su lógica es distinta a la del tejido: en membrana no hay trama que reparta esfuerzos, de modo que el espesor, la resina y la soldadura en obra concentran toda la función. De ahí que en PE la instalación certificada pese tanto como el material.',
        ],
      },
      {
        heading: 'PVC: el rey de la confección',
        body: [
          'El PVC flexible debe su lugar a dos propiedades: permanece flexible sin memoria de pliegue y admite soldadura por alta frecuencia, que produce uniones limpias y repetibles en geometrías complejas. Por eso domina la lona técnica confeccionada —cobertores de precisión, ductos de ventilación flexibles, estructuras tensadas de detalle fino.',
          'Sus contrapartes: la flexibilidad viene de plastificantes que forman parte de la receta —dos PVC del mismo espesor pueden envejecer muy distinto—, su química tiene sensibilidades que el PE no tiene, y su cadena de reciclaje es separada y más limitada que la de las poliolefinas.',
        ],
      },
      {
        heading: 'Cómo se elige, en la práctica',
        steps: [
          'Nombre primero la función dominante: ¿carga tejida, barrera continua o confección flexible? Esa respuesta sola descarta a uno o dos candidatos.',
          'Cruce con el ambiente: altitud y frío favorecen al PE; sol intenso exige declarar UV en cualquiera; contacto químico se verifica contra tabla de compatibilidad del material concreto, no del polímero genérico.',
          'Cruce con la unión: si el producto vivirá de reparaciones en campo, pregunte con qué se suelda y quién puede soldarlo allí.',
          'Cierre con el documento: ficha técnica del material del lote y, en contención, especificación de ensayo reconocida. El nombre del polímero no es una especificación.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué es mejor para una lona: PP, PE o PVC?',
        a: 'Depende de qué trabajo hace la lona. Si es cobertura liviana de gran superficie, la rafia de PP laminada ofrece la mejor relación resistencia/peso/costo. Si es contención o barrera continua, el terreno es del PE. Si es confección de precisión con soldaduras complejas o un producto que vive plegándose, el PVC flexible es el candidato natural.',
      },
      {
        q: '¿Por qué importa tanto el frío de altura al elegir el polímero?',
        a: 'Porque los plásticos se fragilizan al bajar la temperatura y no todos al mismo ritmo: el PE conserva tenacidad donde el PP ya se vuelve quebradizo, y el PVC depende de su formulación. En operaciones sobre los tres o cuatro mil metros, el ciclo diario de helada y sol convierte esa diferencia en vida útil real.',
      },
      {
        q: '¿Se pueden soldar entre sí el PP, el PE y el PVC?',
        a: 'No de forma confiable: la soldadura térmica une material con material compatible. PP con PP, PE con PE, PVC con PVC. Esa restricción es un criterio de diseño — un sistema que mezcle polímeros necesitará uniones mecánicas en las transiciones, y cada unión mecánica es un punto de mantenimiento.',
      },
      {
        q: '¿El polímero define la calidad del producto?',
        a: 'Define el terreno de juego, no el resultado. Dentro de cada polímero, la resina concreta, los aditivos, el proceso y la confección separan un producto correcto de uno mediocre. Por eso la pregunta útil no es «¿es HDPE?» sino «¿qué ficha técnica y qué ensayo respaldan este HDPE?».',
      },
    ],
    relatedProducts: [
      'lona-plastificada-rafia-polytarp',
      'geomembrana-polietileno-pe-hdpe',
      'geomembranas-pvc',
      'mangas-ventilacion-minas-tuneles',
      'tuberias-hdpe',
    ],
    sources: [
      {
        label: 'Encyclopaedia Britannica — Polypropylene',
        url: 'https://www.britannica.com/science/polypropylene',
        supports: 'Propiedades generales del PP: rigidez, baja densidad, uso dominante en fibras y cintas.',
      },
      {
        label: 'Encyclopaedia Britannica — Polyethylene',
        url: 'https://www.britannica.com/science/polyethylene',
        supports: 'Propiedades generales del PE y su tenacidad, base de su uso en membranas de contención.',
      },
      {
        label: 'Encyclopaedia Britannica — Polyvinyl chloride (PVC)',
        url: 'https://www.britannica.com/science/polyvinyl-chloride',
        supports: 'El papel de los plastificantes en el PVC flexible y sus implicancias de formulación.',
      },
      {
        label: 'GRI-GM13 — especificación de geomembranas HDPE (Geosynthetic Institute)',
        url: 'https://geosynthetic-institute.org/grispecs/gm13.pdf',
        supports: 'La existencia de un cuerpo de especificación por ensayo para PE de contención, citado como criterio de compra.',
      },
    ],
  },
  {
    slug: 'vida-util-degradacion-uv-reciclaje-textil-industrial',
    title: 'Vida útil, sol de altura y fin de vida: lo que le pasa al textil industrial con los años',
    metaTitle: 'Vida útil y reciclaje del textil industrial',
    description:
      'Cómo degrada el sol a los plásticos industriales, qué señales anuncian el fin de la vida útil, qué se recicla de verdad y qué no — sin promesas verdes.',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readingMinutes: 10,
    category: 'Especialidades',
    sectors: ['Industrial', 'Agricultura', 'Minería'],
    keyTakeaways: [
      'El enemigo principal del textil plástico a la intemperie no es la lluvia ni el uso: es la radiación ultravioleta, que rompe las cadenas del polímero y convierte un material tenaz en uno quebradizo. En la sierra peruana este proceso se acelera por altitud y cielo despejado.',
      'La estabilización UV es una decisión de fórmula que se toma en la extrusión y no puede añadirse después: dos productos idénticos a la vista pueden tener vidas útiles muy distintas según su dosis de estabilizante.',
      'Las señales de fin de vida se pueden inspeccionar sin laboratorio: pérdida de color con superficie tiza, rigidez nueva donde había flexibilidad, y cuarteo fino en pliegues y bordes son avisos de retiro, no defectos cosméticos.',
      'La durabilidad es la primera política ambiental honesta de un plástico industrial: cada temporada adicional de servicio es material que no se repone. El reciclaje real depende del diseño mono-material y de la cadena local, y prometerlo en genérico es marketing, no gestión.',
    ],
    intro: [
      'Un plástico industrial no se gasta como un metal: no se oxida, no se corroe, y durante años parece intacto. Después, en apariencia de golpe, se agrieta al doblarlo. Ese comportamiento —degradación silenciosa y falla súbita— es la razón por la que la vida útil del textil plástico se gestiona con inspección y criterio, no con la memoria de cuándo se compró.',
      'Este artículo explica el mecanismo de esa degradación, las señales que la anuncian, y la parte del final de la vida útil de la que un proveedor puede hablar con honestidad: qué se recicla de verdad en la práctica, qué no, y por qué la durabilidad —no el eslogan— es la primera variable ambiental de esta industria.',
    ],
    sections: [
      {
        heading: 'El mecanismo: qué le hace el sol a un polímero',
        body: [
          'La radiación ultravioleta aporta energía suficiente para romper enlaces en las cadenas del polímero. Con cada corte, las cadenas se acortan; el material pierde la capacidad de deformarse sin romperse y gana rigidez y fragilidad. El proceso es acumulativo e invisible durante la mayor parte de su desarrollo — el material «funciona» hasta que deja de hacerlo.',
          'En el Perú este mecanismo tiene geografía: a mayor altitud, más radiación; a cielo más despejado, más horas efectivas de exposición. La misma lona no envejece igual en la garúa de Lima que en una cancha de acopio a cuatro mil metros — y por eso la ciudad de destino es una variable de especificación, no un dato logístico.',
        ],
        callout:
          'La estabilización UV se decide en la fórmula, durante la extrusión. No existe el «tratamiento posterior» que rescate un material que se extruyó sin protección: lo que se compra sin UV, se reemplaza antes.',
      },
      {
        heading: 'Las señales de fin de vida que cualquiera puede inspeccionar',
        list: [
          'Superficie tiza: el color pierde intensidad y al pasar el dedo queda polvillo del propio material. Es la capa superficial ya degradada.',
          'Rigidez nueva: un paño que antes caía flexible y ahora se sostiene tieso ha perdido plastificante o acortado cadenas. En PVC es la señal dominante.',
          'Cuarteo fino en pliegues y bordes: las microgrietas aparecen primero donde el material se dobla, porque la flexión exige la elasticidad que la degradación quitó.',
          'Rasgado fácil desde un corte: si una incisión pequeña se propaga con poca fuerza, la tenacidad estructural ya no está. En productos de izaje, esta señal exige retiro inmediato.',
        ],
      },
      {
        heading: 'Reutilizar no siempre es la opción segura',
        body: [
          'La intuición ambiental dice que reutilizar es siempre mejor. En textil industrial de carga, la regla es más fina: los productos de izaje se diseñan para un régimen de uso declarado, y reutilizar fuera de ese régimen traslada el riesgo al operario. Un bolsón concebido para un solo uso que se recarga «porque se ve bien» es exactamente el caso donde la apariencia no informa del estado de las costuras ni del historial de carga.',
          'La reutilización segura existe, pero es un procedimiento: productos diseñados para uso múltiple, inspección documentada entre ciclos, y retiro ante cualquiera de las señales de la sección anterior. Lo demás no es economía circular; es transferencia de riesgo.',
        ],
      },
      {
        heading: 'Qué se recicla de verdad, y qué no',
        body: [
          'Las poliolefinas del rubro —polipropileno y polietileno— son termoplásticos reciclables por refundido, identificados en el sistema internacional de códigos de resina (clase 5 el PP; clases 2 y 4 el PE). Un producto mono-material limpio es el mejor candidato: un big bag íntegramente de PP puede volver a ser gránulo.',
          'Los límites son igual de reales: los compuestos multicapa y los productos con inserciones de otro material complican la separación; la contaminación con el contenido transportado puede excluir un lote entero del reciclado; y la existencia de cadena de acopio y molienda depende de cada ciudad. Por eso la afirmación honesta de un fabricante no es «nuestros productos se reciclan» sino «diseñamos mono-material donde el producto lo permite, y el destino final depende de la cadena local del comprador».',
        ],
      },
      {
        heading: 'La política ambiental que sí se puede verificar',
        body: [
          'En esta industria, el impacto ambiental por año de servicio se reduce sobre todo alargando el servicio: especificar el UV correcto para la zona, elegir el polímero del terreno adecuado, inspeccionar a tiempo y reparar lo reparable. Una lona que cumple ocho temporadas donde otra cumple tres ha evitado más plástico que cualquier eslogan.',
          'Lo que este rubro no puede afirmar con honestidad: porcentajes de reciclado sin cadena documentada, biodegradabilidad de poliolefinas convencionales, o neutralidad de ninguna clase. Cuando un proveedor los afirme, pida el documento; cuando no exista, ya sabe qué clase de proveedor es.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuánto dura una lona industrial a la intemperie en el Perú?',
        a: 'No hay un número honesto sin conocer la zona y la fórmula: la vida útil depende de la dosis de estabilizante UV, del polímero y de la exposición real — y entre la costa con garúa y la sierra sobre cuatro mil metros la radiación cambia drásticamente. La pregunta correcta al cotizar es qué tratamiento UV lleva el material y qué experiencia hay en la zona de destino.',
      },
      {
        q: '¿Cómo sé si un textil plástico ya debe retirarse?',
        a: 'Cuatro señales inspeccionables: superficie que entiza al pasar el dedo, rigidez donde había flexibilidad, cuarteo fino en pliegues y bordes, y rasgado que se propaga con poca fuerza desde un corte. En productos de izaje, cualquiera de ellas exige retiro; en cobertura general, anuncian que la reposición debe programarse.',
      },
      {
        q: '¿Los big bags se pueden reciclar?',
        a: 'Un big bag mono-material de polipropileno, limpio, es técnicamente reciclable por refundido (clase 5 del código de resinas). En la práctica depende de dos cosas que el fabricante no controla: qué transportó —la contaminación puede excluir el lote— y si existe cadena de acopio y molienda en la zona. Lo verificable es el diseño mono-material; el destino final es del comprador y su cadena local.',
      },
      {
        q: '¿Existe la lona biodegradable industrial?',
        a: 'Para las cargas y exposiciones de este rubro, no como producto establecido: la biodegradabilidad y la durabilidad estructural a la intemperie son objetivos en tensión. La vía ambiental real del textil industrial es durar más, diseñarse mono-material y entrar a reciclado mecánico donde la cadena existe.',
      },
    ],
    relatedProducts: [
      'big-bags-bolsones-polipropileno',
      'lona-plastificada-rafia-polytarp',
      'malla-raschel-sombra',
      'geomembrana-polietileno-pe-hdpe',
    ],
    relatedCities: ['puno', 'pasco', 'lima'],
    sources: [
      {
        label: 'Resin identification code — sistema internacional de clases de resina',
        url: 'https://en.wikipedia.org/wiki/Resin_identification_code',
        supports: 'Las clases citadas: PP clase 5, HDPE clase 2, LDPE clase 4, y el papel del código en la separación para reciclado.',
      },
      {
        label: 'GRI-GM13 (Geosynthetic Institute) — especificación HDPE, requisitos de estabilización',
        url: 'https://geosynthetic-institute.org/grispecs/gm13.pdf',
        supports: 'Que la resistencia UV y oxidativa se especifica y ensaya como propiedad de fórmula del material.',
      },
      {
        label: 'Encyclopaedia Britannica — Polypropylene',
        url: 'https://www.britannica.com/science/polypropylene',
        supports: 'La sensibilidad del PP a la degradación y la necesidad de estabilización para uso a la intemperie.',
      },
    ],
  },
  {
    slug: 'comprar-textil-industrial-peru-sudamerica-incoterms-homologacion',
    title: 'Comprar textil industrial desde Sudamérica: homologación, Incoterms y el pedido que sí llega',
    metaTitle: 'Importar textil industrial desde el Perú',
    description:
      'La ruta para un comprador andino: verificar al proveedor peruano, especificar sin ambigüedad, elegir el Incoterm y documentar el lote antes del embarque.',
    datePublished: '2026-08-27',
    dateModified: '2026-08-27',
    readingMinutes: 11,
    category: 'Especialidades',
    sectors: ['Logística', 'Industrial', 'Minería'],
    keyTakeaways: [
      'Comprar textil industrial a través de una frontera falla casi siempre en tres puntos evitables: identidad del proveedor sin verificar, especificación ambigua que cada parte entiende distinto, e Incoterm elegido por costumbre y no por capacidad logística real del comprador.',
      'La verificación de un proveedor peruano puede completarse con fuentes públicas que él no controla: el padrón de SUNAT para la identidad fiscal, la dirección de planta contrastable, y el catálogo con especificaciones que respondan a variables técnicas.',
      'El Incoterm no es una formalidad del contrato: define físicamente dónde deja de ser problema del vendedor y empieza a serlo del comprador. EXW, FCA y FOB trasladan ese punto de la planta al transportista y al buque, y cada traslado cambia quién contrata qué.',
      'El documento del lote —ficha técnica y certificado del fabricante— se exige en la cotización. Pedirlo con la carga ya embarcada convierte cualquier discrepancia en un problema sin buena solución.',
    ],
    intro: [
      'Un comprador industrial de Quito, La Paz o Santiago que evalúa proveedor peruano enfrenta el mismo problema tres veces: no puede caminar la planta, no puede tocar el material y no puede resolver un malentendido con una visita. Todo lo que en una compra local se arregla con presencia, en una compra transfronteriza se arregla con documento — o no se arregla.',
      'Esta guía ordena el proceso completo desde el lado del comprador: cómo verificar que el proveedor existe y es quien dice ser, cómo especificar para que ambas partes entiendan lo mismo, qué decide de verdad la elección del Incoterm, y qué papeles deben existir antes de que el contenedor se cierre. No promete plazos ni tarifas: cada operación se cotiza contra su partida, su volumen y su destino.',
    ],
    sections: [
      {
        heading: 'Paso previo: verificar sin viajar',
        body: [
          'La homologación a distancia empieza por fuentes que el proveedor no controla. En el Perú, la identidad fiscal es pública: el RUC se consulta en el padrón de SUNAT, que devuelve razón social, estado del contribuyente y domicilio fiscal. Una dirección de planta verificable en un mapa, un catálogo cuyas fichas respondan variables técnicas y no adjetivos, y la disposición a entregar documentación en la etapa de cotización completan el cuadro mínimo.',
          'La señal de alarma más fiable es la asimetría entre lo que el proveedor afirma y lo que puede documentar: certificaciones nombradas sin número ni emisor, obras enumeradas sin autorización verificable del cliente, cobertura continental declarada sin estructura que la explique.',
        ],
      },
      {
        heading: 'La especificación que cruza fronteras sin romperse',
        list: [
          'Especifique en variables, no en nombres comerciales: gramaje con tolerancia, denier y trama en tejidos, espesor y resina en membranas, tratamiento UV declarado. Los nombres comerciales cambian de país a país; las variables no.',
          'Fije unidades y norma de ensayo para cada valor: un mismo número medido con métodos distintos no es el mismo número.',
          'Adjunte el uso final y la zona de destino: altitud, radiación y química de contacto cambian la fórmula correcta, y el proveedor solo puede advertirlo si lo sabe.',
          'Acuerde el criterio de aceptación antes de producir: qué se mide en recepción, con qué tolerancia, y qué pasa si un valor sale fuera.',
        ],
        callout:
          'La regla de oro transfronteriza: todo lo que no esté escrito en la especificación no existe. La versión hablada de la videollamada no cruza la aduana.',
      },
      {
        heading: 'Incoterms: dónde cambia de manos el problema',
        body: [
          'Los Incoterms de la Cámara de Comercio Internacional definen el punto físico donde el riesgo y el costo pasan del vendedor al comprador. Para carga peruana de este rubro, tres términos concentran la práctica: EXW (el comprador recoge en planta y asume todo desde ahí), FCA (el vendedor entrega al transportista designado) y FOB (el vendedor pone la carga a bordo en el puerto de embarque, típicamente el Callao).',
          'La elección correcta depende de la estructura del comprador, no de la costumbre: EXW solo conviene a quien tiene operador logístico propio en el Perú; FOB conviene a quien controla el flete marítimo; FCA es el punto medio para carga consolidada. Elegir EXW «porque es más barato» y descubrir después que nadie de su lado puede gestionar el transporte interno peruano es el error clásico de la primera importación.',
        ],
        table: {
          caption: 'Los tres términos habituales para carga de este rubro desde el Perú',
          headers: ['Término', 'El vendedor entrega', 'El comprador asume desde', 'Conviene cuando'],
          rows: [
            ['EXW', 'En su planta (Chorrillos, Lima)', 'La puerta de la planta: transporte interno, aduana, flete', 'El comprador tiene operador logístico propio en el Perú'],
            ['FCA', 'Al transportista designado, en Lima', 'La entrega al transportista', 'Carga consolidada o forwarder del comprador con presencia local'],
            ['FOB', 'A bordo del buque, puerto del Callao', 'El flete marítimo y el destino', 'El comprador controla su flete marítimo y su aduana de llegada'],
          ],
        },
      },
      {
        heading: 'Los papeles que deben existir antes de cerrar el contenedor',
        list: [
          'Ficha técnica del material del lote, no del catálogo genérico.',
          'Certificado del fabricante por lote cuando la línea lo tiene — y la exigencia normativa del punto de llegada verificada antes de producir, no después.',
          'Factura y packing list coherentes con la especificación acordada, partida arancelaria incluida.',
          'El criterio de aceptación en destino, por escrito, con el procedimiento pactado para discrepancias.',
        ],
      },
      {
        heading: 'Lo que un proveedor honesto no le va a prometer',
        body: [
          'Desconfíe de las promesas que la estructura del rubro no sostiene: cobertura continental automática, tarifas planas a cualquier destino, plazos garantizados sin conocer la partida ni el volumen. La operación transfronteriza seria se evalúa caso por caso, y el proveedor que lo dice está describiendo cómo funciona el comercio real, no poniendo obstáculos.',
          'La contraparte de esa honestidad es la exigencia simétrica: el comprador que especifica en variables, elige el Incoterm según su capacidad real y pide los documentos en la cotización, convierte una primera importación en una operación repetible. Los desastres transfronterizos de este rubro casi nunca son de mala fe — son de ambigüedad.',
        ],
      },
    ],
    howTo: {
      name: 'Homologar un proveedor peruano de textil industrial a distancia',
      steps: [
        {
          name: 'Verifique la identidad fiscal',
          text: 'Consulte el RUC del proveedor en el padrón público de SUNAT y contraste razón social, estado activo y domicilio fiscal con lo que el proveedor declara en su sitio.',
        },
        {
          name: 'Contraste la planta',
          text: 'Ubique la dirección declarada en un mapa y verifique que corresponde a una instalación industrial plausible, no a una oficina virtual.',
        },
        {
          name: 'Audite el catálogo con tres preguntas técnicas',
          text: 'Pida denier y trama de un tejido, el tratamiento UV de una lona y la resistencia de costura de un producto de izaje. Las respuestas separan fabricante de revendedor.',
        },
        {
          name: 'Exija el documento en la cotización',
          text: 'Solicite ficha técnica del material y certificado del fabricante por lote como condición de la oferta, no como trámite posterior al embarque.',
        },
        {
          name: 'Elija el Incoterm según su estructura',
          text: 'Decida EXW, FCA o FOB en función de qué puede gestionar realmente su organización en el Perú, y deje el punto de traspaso escrito en la orden.',
        },
        {
          name: 'Pacte el criterio de aceptación',
          text: 'Acuerde por escrito qué se mide en destino, con qué tolerancia y qué ocurre ante una discrepancia, antes de autorizar producción.',
        },
      ],
    },
    faqs: [
      {
        q: '¿Cómo verifico a un proveedor peruano sin viajar al Perú?',
        a: 'Con fuentes públicas que el proveedor no controla: el RUC en el padrón de SUNAT (razón social, estado, domicilio fiscal), la dirección de planta contrastada en un mapa, y un catálogo que responda preguntas técnicas en variables — denier, trama, tratamiento UV, resistencia de costura. Un proveedor serio además entrega la documentación del material en la etapa de cotización.',
      },
      {
        q: '¿Qué Incoterm conviene para importar textil industrial desde el Perú?',
        a: 'El que corresponda a su capacidad logística real: EXW solo si tiene operador propio en el Perú, FCA si trabaja con un forwarder con presencia local, FOB Callao si controla su flete marítimo. El error habitual es elegir por precio aparente un término cuyas obligaciones el comprador no puede ejecutar.',
      },
      {
        q: '¿Un proveedor peruano puede garantizarme plazo y tarifa a cualquier país de Sudamérica?',
        a: 'No con honestidad: cada operación depende de la partida arancelaria, el volumen, el destino y el Incoterm, y la estructura del rubro —fabricación concentrada en Lima, salida por el Callao o por frontera terrestre— hace que la promesa de cobertura continental automática sea una señal de alarma, no de capacidad.',
      },
      {
        q: '¿Qué documento es imprescindible pedir antes del embarque?',
        a: 'La ficha técnica del material del lote y, donde la línea lo tiene, el certificado del fabricante por lote — además de verificar la exigencia normativa del punto de llegada antes de producir. Con la carga embarcada, cualquier discrepancia documental se convierte en un problema sin buena solución.',
      },
    ],
    relatedProducts: [
      'sacos-polytarp-embarque-granel',
      'big-bags-bolsones-polipropileno',
      'mangas-ventilacion-minas-tuneles',
      'geomembrana-polietileno-pe-hdpe',
    ],
    relatedCities: ['callao', 'lima', 'tacna', 'puno'],
    sources: [
      {
        label: 'ICC — Incoterms® rules (Cámara de Comercio Internacional)',
        url: 'https://iccwbo.org/business-solutions/incoterms-rules/',
        supports: 'La definición y el propósito de los términos EXW, FCA y FOB citados: puntos de traspaso de riesgo y costo.',
      },
      {
        label: 'SUNAT — consulta pública de RUC',
        url: 'https://e-consultaruc.sunat.gob.pe/',
        supports: 'La verificación de identidad fiscal del proveedor descrita en el paso 1 de la homologación.',
      },
      {
        label: 'APM Terminals Callao — requisitos documentales para bolsones',
        url: 'https://www.apmterminals.com/es/callao/customer-zone/news-and-alerts/2022/28112022-recordatorio-estandarizacion-de-bolsones',
        supports: 'Un ejemplo real de exigencia normativa del punto de tránsito que debe verificarse antes de producir.',
      },
    ],
  },

  // ===========================================================================
  // Serie «guía RFQ» (Etapa 3): un artículo por cuña comercial. Cada uno
  // enseña a armar el pedido de cotización completo — el contenido que un
  // comprador guarda y reenvía, que es la forma honesta de ser recomendable.
  // ===========================================================================
  {
    slug: 'rfq-manga-ventilacion-minera-datos-completos',
    title: 'RFQ de mangas de ventilación minera: los datos que convierten una consulta en una cotización',
    metaTitle: 'RFQ de mangas de ventilación: qué datos enviar',
    description:
      'Qué debe traer un pedido de cotización de mangas de ventilación para mina o túnel: diámetro, tramos, régimen, ambiente y accesorios.',
    datePublished: '2026-08-30',
    dateModified: '2026-08-30',
    readingMinutes: 8,
    category: 'Ventilación Industrial',
    sectors: ['Minería', 'Construcción'],
    byline: 'Área técnica · Plastilonas Peruanas SAC',
    keyTakeaways: [
      'Un RFQ de ventilación con diámetro, largo de tramo, régimen y ambiente se responde con cotización; uno con solo el diámetro se responde con preguntas.',
      'El régimen —impulsión o extracción— cambia la construcción de la manga: una manga aspirante necesita refuerzo espiral para no colapsar.',
      'Los accesorios de unión y suspensión pertenecen al mismo RFQ: un tramo sin uniones es un tramo incompleto en el frente.',
      'La memoria de ventilación de la operación, si existe, viaja adjunta: el proveedor cotiza contra ella, no la reemplaza.',
    ],
    intro: [
      'La consulta más frecuente de ventilación llega con un solo dato: «necesito manga de 800». Con eso no se puede cotizar: falta saber cuánto tramo, en qué régimen trabajará y en qué ambiente. Cada dato que falta es una ida y vuelta con el área comercial, y cada ida y vuelta es un día menos de ventilación en el frente.',
      'Este artículo es la lista completa: qué datos lleva un RFQ de mangas de ventilación, por qué cada uno cambia la especificación, y qué puede dejar fuera sin perder precisión. Sirve igual si termina comprando a otro proveedor.',
    ],
    sections: [
      {
        heading: 'Los cuatro datos sin los cuales no hay cotización',
        body: [
          'El diámetro interior define el área de paso y, con el caudal, la velocidad del aire. El largo de cada tramo define la confección y el manejo en interior mina. El régimen —impelente o aspirante— define la construcción: la impulsión infla la manga y la mantiene abierta; la extracción la colapsa, así que exige refuerzo espiral. El ambiente —humedad, abrasión de la roca, requisito antiestático de la operación— define el material y el acabado.',
        ],
        list: [
          'Diámetro interior, en milímetros, por tramo si varía a lo largo de la labor.',
          'Largo de cada tramo y metraje total, con el sobrante de empalme que use la operación.',
          'Régimen: impulsión (impelente) o extracción (aspirante, con refuerzo espiral).',
          'Ambiente: humedad, abrasión, exigencia antiestática del reglamento interno.',
        ],
      },
      {
        heading: 'Los datos que afinan el precio y el plazo',
        body: [
          'Con los cuatro datos anteriores la cotización existe. Los siguientes la vuelven exacta: el caudal de diseño si hay memoria de ventilación; el tipo de unión que ya usa la mina, para que el tramo nuevo empalme con el existente; los accesorios de suspensión —sogas, ganchos, abrazaderas—; y la altitud y vía de acceso del sitio, que definen el flete y el embalaje.',
        ],
      },
      {
        heading: 'Qué NO pedirle al proveedor de la manga',
        body: [
          'La memoria de cálculo de ventilación pertenece al área de ventilación de la operación y a su consultor: el fabricante de la manga cotiza contra ella, no la sustituye. Lo mismo con la certificación de cumplimiento del reglamento de seguridad minera: el reglamento obliga a la operación, y el proveedor responde con la ficha técnica y la documentación del material, que es lo que el expediente puede citar.',
        ],
        callout:
          'Desconfíe del proveedor que «certifica» el cumplimiento normativo de su mina sin haber visto la memoria de ventilación: está firmando algo que no puede saber.',
      },
      {
        heading: 'El RFQ completo, listo para copiar',
        steps: [
          'Indique diámetro interior y largo de cada tramo, con el metraje total.',
          'Declare el régimen: impulsión o extracción (y si necesita refuerzo espiral).',
          'Describa el ambiente: humedad, abrasión, requisito antiestático si aplica.',
          'Adjunte la memoria de ventilación o el caudal de diseño, si existen.',
          'Liste accesorios: uniones, abrazaderas, sogas de suspensión.',
          'Cierre con cantidad, sitio de entrega y fecha en que lo necesita.',
        ],
      },
    ],
    howTo: {
      name: 'Cómo armar el RFQ de una manga de ventilación',
      steps: [
        { name: 'Mida la labor', text: 'Anote el diámetro interior requerido y el largo de cada tramo, con el metraje total de la labor.' },
        { name: 'Defina el régimen', text: 'Indique si la manga trabajará en impulsión o extracción; la extracción exige refuerzo espiral.' },
        { name: 'Describa el ambiente', text: 'Humedad, abrasión y requisito antiestático del reglamento interno de la operación.' },
        { name: 'Adjunte la evidencia', text: 'Memoria de ventilación o caudal de diseño si existen; el proveedor cotiza contra ese expediente.' },
        { name: 'Complete la logística', text: 'Cantidad, accesorios de unión y suspensión, sitio de entrega y fecha requerida.' },
      ],
    },
    faqs: [
      {
        q: '¿Qué pasa si solo tengo el diámetro?',
        a: 'Se puede abrir la conversación, pero no cerrar un precio: el largo de tramo, el régimen y el ambiente cambian el material y la confección. Espere preguntas antes que números.',
      },
      {
        q: '¿La manga impelente y la aspirante son la misma?',
        a: 'No. La impulsión mantiene la manga inflada; la extracción la colapsa, por lo que la manga aspirante lleva refuerzo espiral. Especificar el régimen equivocado compra el producto equivocado.',
      },
      {
        q: '¿Debo pedir los accesorios en el mismo RFQ?',
        a: 'Sí. Uniones, abrazaderas y sogas de suspensión completan el tramo; pedirlos aparte arriesga llegar al frente con la manga y sin cómo colgarla.',
      },
      {
        q: '¿El proveedor certifica que cumplo el reglamento de seguridad minera?',
        a: 'No puede: el reglamento obliga a la operación. El proveedor entrega ficha técnica y documentación del material para su expediente.',
      },
    ],
    relatedProducts: ['mangas-ventilacion-minas-tuneles', 'accesorios-instalacion'],
    sources: [
      {
        label: 'OSINERGMIN — D.S. 024-2016-EM, Reglamento de Seguridad y Salud Ocupacional en Minería',
        url: 'https://www.gob.pe/institucion/osinergmin/normas-legales/741887-024-2016-em',
        supports: 'La obligación normativa de ventilación recae en el titular de la operación minera, no en el proveedor del ducto.',
      },
      {
        label: 'Revista Seguridad Minera — ventilación minera: recomendaciones y reglamento',
        url: 'https://revistaseguridadminera.com/operaciones-mineras/ventilacion-minera-7-recomendaciones-y-reglamento-de-seguridad/',
        supports: 'El papel del caudal de diseño y del estado de las mangas en el desempeño real del circuito de ventilación.',
      },
    ],
  },
  {
    slug: 'fibc-factor-seguridad-5-1-vs-6-1',
    title: 'Factor de seguridad 5:1 vs 6:1 en big bags: qué significa y cuál pedir',
    metaTitle: 'Big bags: factor de seguridad 5:1 vs 6:1',
    description:
      'El factor de seguridad de un FIBC no es un número de catálogo: 5:1 corresponde a uso único y 6:1 a bolsón multiuso. Cómo decidirlo en el RFQ.',
    datePublished: '2026-08-30',
    dateModified: '2026-08-30',
    readingMinutes: 8,
    category: 'Envases y Embalaje',
    sectors: ['Minería', 'Agroindustria', 'Construcción'],
    byline: 'Área técnica · Plastilonas Peruanas SAC',
    keyTakeaways: [
      'El factor de seguridad (SF) es la relación entre la carga de rotura del bolsón y su carga de trabajo: un FIBC 5:1 de 1 000 kg debe resistir 5 000 kg en ensayo.',
      'La práctica normativa asocia 5:1 al bolsón de un solo uso y 6:1 al bolsón reutilizable; reutilizar un 5:1 traslada el riesgo al izaje.',
      'El SF no sustituye al protocolo de izaje: un 6:1 izado de una sola asa o con carga descentrada falla igual.',
      'En el RFQ, el SF se decide junto con la capacidad, el tipo de boca y descarga y si la carga exige liner interior.',
    ],
    intro: [
      'En las fichas de big bags conviven dos cifras que parecen intercambiables: 5:1 y 6:1. No lo son. El factor de seguridad dice cuántas veces la carga de trabajo debe resistir el tejido en ensayo de rotura, y la diferencia entre ambos números es la diferencia entre un envase de un solo viaje y uno diseñado para reutilizarse.',
      'Elegir mal en cualquiera de las dos direcciones cuesta: pedir 6:1 para un despacho de un solo viaje encarece el lote sin ganar seguridad; reutilizar bolsones 5:1 porque «se ven bien» traslada el riesgo a la maniobra de izaje, que es donde un FIBC falla con consecuencias.',
    ],
    sections: [
      {
        heading: 'Qué mide exactamente el factor de seguridad',
        body: [
          'El SF relaciona la carga de rotura con la carga de trabajo segura (SWL). Un bolsón de SWL 1 000 kg con SF 5:1 debe soportar 5 000 kg en el ensayo cíclico y de rotura; con SF 6:1, 6 000 kg. El margen no existe para cargar de más: existe para absorber el desgaste del tejido, las asimetrías del izaje real y la degradación UV entre llenado y vaciado.',
        ],
      },
      {
        heading: '5:1 o 6:1: la decisión en una tabla',
        table: {
          headers: ['Criterio', 'FIBC 5:1', 'FIBC 6:1'],
          rows: [
            ['Uso previsto', 'Un solo viaje (single trip)', 'Multiuso, con inspección entre ciclos'],
            ['Costo relativo del lote', 'Menor', 'Mayor (más tejido y confección)'],
            ['Reutilización', 'No prevista por diseño', 'Prevista, con protocolo de inspección'],
            ['Caso típico', 'Despacho de concentrado o exportación', 'Circuito interno que llena y vacía el mismo envase'],
          ],
        },
        body: [
          'La regla corta: si el bolsón hace un viaje y se retira, 5:1; si vuelve a llenarse, 6:1 con inspección documentada entre ciclos. La decisión pertenece al protocolo de la operación, no al catálogo del proveedor.',
        ],
      },
      {
        heading: 'Lo que el factor de seguridad no arregla',
        body: [
          'El SF supone un izaje correcto: las asas verticales, la carga centrada, el equipo con los puntos de toma que el bolsón trae. Izar un 6:1 de una sola asa, arrastrarlo cargado o exponerlo meses al sol de altura antes del izaje anula el margen que se pagó. El factor de seguridad es una propiedad del envase; la seguridad del izaje es una propiedad de la maniobra.',
        ],
        callout:
          'Error frecuente: comprar 6:1 «por seguridad» para uso único, y reutilizarlo después precisamente porque era 6:1 — sin protocolo de inspección. El número correcto sin el protocolo no protege nada.',
      },
      {
        heading: 'Cómo pedirlo en el RFQ',
        steps: [
          'Declare la capacidad (1 t o 2 t) y la densidad del material si la conoce.',
          'Diga si el bolsón hace un viaje o se reutiliza: eso decide 5:1 o 6:1.',
          'Especifique boca y descarga: faldón, boca abierta, válvula, liner interior.',
          'Indique las medidas o el estándar que su operación ya usa (p. ej. 90×90×90 cm).',
          'Cierre con cantidad del lote, ciudad de entrega y fecha requerida.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Puedo reutilizar un big bag 5:1 si se ve en buen estado?',
        a: 'El diseño de un 5:1 no prevé la reutilización: el margen se calculó para un ciclo. Si su circuito reutiliza envases, la especificación correcta es 6:1 con inspección documentada entre usos.',
      },
      {
        q: '¿El 6:1 aguanta más carga que el 5:1?',
        a: 'No es su propósito. Ambos se especifican para la misma carga de trabajo; el 6:1 reserva más margen de rotura para sobrevivir varios ciclos. La carga de trabajo no debe superarse en ningún caso.',
      },
      {
        q: '¿Quién decide el factor de seguridad: el proveedor o el comprador?',
        a: 'El comprador, porque depende de cómo usa el envase su operación. El proveedor confecciona contra esa decisión y entrega la documentación del tejido y del lote.',
      },
      {
        q: '¿El factor de seguridad viene certificado?',
        a: 'La trazabilidad honesta es la del ensayo del tejido y la documentación del lote, que se entregan en la cotización. Un número impreso sin documentación detrás no es una certificación.',
      },
    ],
    relatedProducts: ['big-bags-bolsones-polipropileno', 'sacos-polytarp-embarque-granel'],
    sources: [
      {
        label: 'ISO 21898 — Packaging: Flexible intermediate bulk containers (FIBCs) for non-dangerous goods',
        url: 'https://www.iso.org/standard/35750.html',
        supports: 'La definición del ensayo del FIBC y la asociación entre factor de seguridad y uso único o multiuso.',
      },
      {
        label: 'APM Terminals Callao — estandarización de bolsones para embarque',
        url: 'https://www.apmterminals.com/es/callao/customer-zone/news-and-alerts/2022/28112022-recordatorio-estandarizacion-de-bolsones',
        supports: 'Un punto de tránsito real que exige especificación estandarizada del bolsón antes del embarque.',
      },
    ],
  },
  {
    slug: 'medidas-lona-toldo-sider-camion-rfq',
    title: 'Cómo tomar las medidas de una lona, toldo o sider de camión para cotizar sin errores',
    metaTitle: 'Medidas de lona y sider de camión para cotizar',
    description:
      'Largo, ancho, alto útil y sistema de tensado: las medidas que un RFQ de lona o sider de camión debe traer, y los errores de medición que cuestan.',
    datePublished: '2026-08-30',
    dateModified: '2026-08-30',
    readingMinutes: 9,
    category: 'Lonas y Cobertores',
    sectors: ['Transporte y Logística', 'Minería', 'Agroindustria'],
    byline: 'Área técnica · Plastilonas Peruanas SAC',
    keyTakeaways: [
      'La lona se cotiza contra la carrocería real, no contra el modelo del camión: dos unidades del mismo modelo pueden medir distinto tras años de trabajo.',
      'Las tres medidas base son largo, ancho y alto útil de la carrocería; el sistema (cobertor simple, toldo con arcos, sider) decide qué medidas adicionales hacen falta.',
      'El traslape y el faldón no los estima el comprador: salen del sistema de sujeción, y por eso el RFQ debe decir cómo se amarra hoy la carga.',
      'Para flotas conviene medir una unidad de referencia y declarar cuántas repiten el plano.',
    ],
    intro: [
      'El error más caro en lonas de camión no es el gramaje: es la medida. Una lona corta no cubre; una excesiva embolsa aire en ruta, golpea y se rasga por donde flamea. Y la medida correcta no está en el catálogo del fabricante del camión, sino en la carrocería concreta, con sus barandas, arcos y ganchos reales.',
      'Esta guía explica qué medir para cada sistema —cobertor simple, toldo con arcos, sider— y cómo declarar el resultado en el RFQ para que la primera respuesta sea una cotización con ficha técnica.',
    ],
    sections: [
      {
        heading: 'Las tres medidas que todo RFQ lleva',
        list: [
          'Largo útil de la carrocería, de cara interna a cara interna.',
          'Ancho útil, medido en la parte superior de las barandas.',
          'Alto: de la base de la baranda al punto más alto que la carga o los arcos alcanzan.',
        ],
        body: [
          'Con esas tres medidas y el tipo de carga, el confeccionista calcula el desarrollo de la pieza: cuánto material cae por los costados, cuánto traslapa en la trasera y dónde se refuerza. Declarar también cómo se amarra hoy la carga —ganchos, sogas, ratchets, riel— evita que la lona llegue con los ojalillos donde el camión no tiene puntos de anclaje.',
        ],
      },
      {
        heading: 'Cobertor simple, toldo con arcos o sider: qué cambia en la medición',
        table: {
          headers: ['Sistema', 'Medidas adicionales', 'Dato crítico'],
          rows: [
            ['Cobertor simple (manta)', 'Caída lateral deseada y traslape trasero', 'Puntos de anclaje existentes'],
            ['Toldo con arcos', 'Cantidad, separación y flecha (altura) de los arcos', 'Perfil del arco: la lona copia esa curva'],
            ['Sider (cortina lateral)', 'Altura de baranda a riel y largo por paño', 'Sistema de riel y tensores del semirremolque'],
          ],
        },
      },
      {
        heading: 'Los cuatro errores de medición que más lonas arruinan',
        list: [
          'Medir sobre la lona vieja: la pieza gastada está estirada o encogida; se mide la carrocería.',
          'Ignorar la flecha del arco: un toldo medido «plano» queda corto en cuanto sube la curva.',
          'Olvidar el traslape trasero: la compuerta queda descubierta y la carga expuesta.',
          'Confundir alto de baranda con alto de carga: la lona debe cubrir lo que viaja, no solo la carrocería vacía.',
        ],
        callout:
          'Si existe el plano de la carrocería o del carrocero, adjúntelo al RFQ: reemplaza media docena de medidas y elimina la ambigüedad de dónde se midió.',
      },
      {
        heading: 'El RFQ completo para una unidad o una flota',
        steps: [
          'Mida largo, ancho y alto útil de la carrocería de referencia.',
          'Declare el sistema: cobertor simple, toldo con arcos (con su separación y flecha) o sider.',
          'Describa el tipo de carga y cómo se amarra hoy (ganchos, riel, ratchets).',
          'Adjunte plano o fotos de la carrocería si existen.',
          'Indique cuántas unidades repiten el plano, la ciudad de entrega o instalación y la fecha.',
        ],
      },
    ],
    howTo: {
      name: 'Cómo medir una carrocería para cotizar su lona o sider',
      steps: [
        { name: 'Mida la carrocería, no la lona vieja', text: 'Tome largo y ancho útiles de cara interna a cara interna, sobre la baranda.' },
        { name: 'Capture el alto real', text: 'De la base de la baranda al punto más alto de la carga o del arco, incluida la flecha de la curva.' },
        { name: 'Registre el sistema de sujeción', text: 'Ganchos, sogas, ratchets o riel: define ojalillos, faldón y refuerzos de la pieza.' },
        { name: 'Documente con fotos o plano', text: 'Una foto por costado y la trasera, o el plano del carrocero si existe.' },
        { name: 'Declare la flota', text: 'Cuántas unidades repiten el plano de la unidad medida, con ciudad y fecha de entrega.' },
      ],
    },
    faqs: [
      {
        q: '¿Puedo mandar las medidas de la lona que ya tengo?',
        a: 'Como referencia sirve, pero la pieza gastada está deformada. La medida que gobierna es la de la carrocería; la lona vieja se usa para confirmar el sistema de sujeción.',
      },
      {
        q: '¿Cuánto traslape debo pedir?',
        a: 'No lo estime: el traslape y la caída salen del sistema de sujeción y del uso. Declare cómo amarra la carga y el desarrollo lo calcula la confección.',
      },
      {
        q: '¿Sirve el mismo plano para toda mi flota?',
        a: 'Si las carrocerías son del mismo carrocero y no han sido modificadas, sí: se mide una unidad de referencia y se declara cuántas repiten. Ante duda, se verifican las unidades más antiguas.',
      },
      {
        q: '¿Qué pasa con el transporte de materiales peligrosos?',
        a: 'El reglamento de transporte de materiales y residuos peligrosos impone condiciones a la unidad y su cobertura; su área de operaciones debe declararlo en el RFQ para que la especificación lo considere.',
      },
    ],
    relatedProducts: ['mantas-cobertores-toldos-camiones', 'siders-tolderas-camiones', 'lona-plastificada-rafia-polytarp'],
    relatedCities: ['lima', 'arequipa', 'trujillo'],
    sources: [
      {
        label: 'MTC — D.S. 021-2008-MTC, Reglamento Nacional de Transporte Terrestre de Materiales y Residuos Peligrosos',
        url: 'https://gestop.pe/ds-021-2008-mtc-aprueban-el-reglamento-nacional-de-transporte-terrestre-de-materiales-y-residuos-peligrosos/',
        supports: 'La existencia de condiciones normativas sobre la unidad y su cobertura cuando la carga es material peligroso.',
      },
      {
        label: 'RNE E.020 — cargas (referencia de criterio estructural)',
        url: 'https://cdn-web.construccion.org/normas/rne2012/rne2006/files/titulo3/02_E/RNE2006_E_020.pdf',
        supports: 'El criterio general de que la succión y la presión del viento sobre superficies flexibles dependen de la geometría expuesta.',
      },
    ],
  },

];

export const articleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const articleUrl = (slug: string): string => `${SITE.url}/recursos/${slug}`;

/** Categorías presentes en el silo, en orden de aparición. */
export const articleCategories = Array.from(new Set(articles.map((a) => a.category)));
