#!/usr/bin/env bash
# =============================================================================
# P1 — SILO DE CONTENIDO TÉCNICO (/recursos)
#
# Plastilonas Peruanas SAC. Aplica sobre main en el commit 167b5a1 o posterior.
# Escribe los archivos, aplica los cambios puntuales a los existentes con
# verificación exacta (si un archivo no está en el estado esperado, aborta sin
# tocar nada más) y corre las mismas puertas de calidad que se verificaron.
#
# Uso:   bash apply-p1-recursos.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Creando directorios"
mkdir -p "app/recursos/[slug]"

echo "==> Escribiendo lib/articles.ts"
cat > 'lib/articles.ts' <<'PP_EOF'
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
PP_EOF

echo "==> Escribiendo lib/schema.ts"
cat > 'lib/schema.ts' <<'PP_EOF'
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
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
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
PP_EOF

echo "==> Escribiendo app/recursos/page.tsx"
cat > 'app/recursos/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { SITE } from '@/lib/site';
import { articles, articleCategories } from '@/lib/articles';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del silo técnico (/recursos).
 *
 * Es el hub de contenido: concentra el enlazado hacia cada artículo y desde
 * cada artículo hacia catálogo y cobertura local. Sin hub, los artículos
 * quedan colgando del sitemap y no reciben ninguna señal interna.
 */

const URL = `${SITE.url}/recursos`;
const TITLE = 'Recursos técnicos: guías de especificación e instalación';
const DESCRIPTION = `Guías técnicas en español para especificar, instalar y auditar soluciones textiles industriales y geosintéticos en el Perú: big bags para minería, geomembranas en pozas y canales, ventilación de labores subterráneas. Escritas por ${SITE.name} con las fuentes citadas.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/recursos' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function RecursosIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
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
              { name: 'Recursos técnicos', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Guías técnicas',
            description: DESCRIPTION,
            items: articles.map((a) => ({
              name: a.title,
              url: `${SITE.url}/recursos/${a.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Recursos técnicos</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Recursos técnicos
      </h1>

      <p className="speakable-intro mb-10 max-w-3xl text-lg text-gray-700">
        Guías de especificación, instalación y auditoría escritas para compradores
        técnicos e ingenieros de proyecto en el Perú. Cada cifra normativa lleva su
        fuente citada al pie del artículo; cuando un dato no se pudo verificar contra el
        texto oficial, se dice explícitamente en lugar de publicarlo como certeza.
      </p>

      <div className="mb-10 flex flex-wrap gap-2">
        {articleCategories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600"
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="space-y-6">
        {articles.map((a) => (
          <article
            key={a.slug}
            className="group rounded-3xl border border-gray-100 p-7 transition-all hover:border-[#059669]/40"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
                {a.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {a.readingMinutes} min
              </span>
              <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
            </div>

            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
              <Link href={`/recursos/${a.slug}`} className="group-hover:text-[#059669]">
                {a.title}
              </Link>
            </h2>

            <p className="mb-4 text-gray-700">{a.description}</p>

            <ul className="mb-5 space-y-1.5 text-sm text-gray-600">
              {a.keyTakeaways.slice(0, 2).map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="mt-0.5 text-[#059669]">→</span>
                  {k}
                </li>
              ))}
            </ul>

            <Link
              href={`/recursos/${a.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
            >
              Leer la guía <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Necesita aplicar esto a un proyecto concreto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales —altitud, geometría, material, ciudad— y le
          devolvemos la especificación y la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/recursos/[slug]/page.tsx"
cat > 'app/recursos/[slug]/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
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
PP_EOF

echo "==> Escribiendo test/articles.test.ts"
cat > 'test/articles.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { articles, articleBySlug, articleUrl } from '@/lib/articles';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';
import { articleSchema, howToSchema } from '@/lib/schema';

const CITY_SLUGS = new Set((ciudades as { slug: string }[]).map((c) => c.slug));
const PRODUCT_SLUGS = new Set(products.map((p) => p.slug));

describe('silo /recursos: integridad', () => {
  it('los slugs son únicos y válidos para URL', () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('cada relatedProducts apunta a un producto que existe', () => {
    for (const a of articles) {
      for (const slug of a.relatedProducts) {
        expect(PRODUCT_SLUGS.has(slug), `${a.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it('cada relatedCities apunta a una ciudad que existe', () => {
    for (const a of articles) {
      for (const slug of a.relatedCities ?? []) {
        expect(CITY_SLUGS.has(slug), `${a.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it('las fechas son ISO y dateModified nunca es anterior a datePublished', () => {
    for (const a of articles) {
      expect(a.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(a.dateModified) >= new Date(a.datePublished)).toBe(true);
    }
  });

  it('todo artículo tiene resumen, secciones y al menos 3 FAQs', () => {
    for (const a of articles) {
      expect(a.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(a.sections.length).toBeGreaterThanOrEqual(3);
      expect(a.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('cada sección aporta contenido real (no solo un encabezado)', () => {
    for (const a of articles) {
      for (const s of a.sections) {
        const tieneContenido =
          (s.body?.length ?? 0) + (s.list?.length ?? 0) + (s.steps?.length ?? 0) > 0 ||
          Boolean(s.table);
        expect(tieneContenido, `${a.slug} → ${s.heading}`).toBe(true);
      }
    }
  });

  it('las tablas tienen todas las filas del ancho de su cabecera', () => {
    for (const a of articles) {
      for (const s of a.sections) {
        if (!s.table) continue;
        for (const row of s.table.rows) {
          expect(row.length, `${a.slug} → ${s.heading}`).toBe(s.table.headers.length);
        }
      }
    }
  });
});

describe('silo /recursos: honestidad editorial', () => {
  it('todo artículo cita al menos una fuente con URL absoluta', () => {
    for (const a of articles) {
      expect(a.sources.length, a.slug).toBeGreaterThanOrEqual(1);
      for (const s of a.sources) {
        expect(() => new URL(s.url)).not.toThrow();
        expect(s.url.startsWith('https://')).toBe(true);
        // Cada fuente declara QUÉ dato respalda: una URL suelta no es una cita.
        expect(s.supports.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it('ningún artículo publica precios ni promete plazos comerciales', () => {
    for (const a of articles) {
      const texto = JSON.stringify(a);
      expect(texto, a.slug).not.toMatch(/S\/\s?\d/);
      expect(texto, a.slug).not.toMatch(/US\$\s?\d/);
    }
  });

  it('ningún artículo se atribuye certificaciones propias', () => {
    for (const a of articles) {
      const texto = JSON.stringify(a).toLowerCase();
      expect(texto, a.slug).not.toContain('estamos certificados');
      expect(texto, a.slug).not.toContain('somos certificados');
      expect(texto, a.slug).not.toContain('empresa certificada');
    }
  });

  it('los pasos de HowTo son accionables, no titulares', () => {
    for (const a of articles.filter((x) => x.howTo)) {
      for (const step of a.howTo!.steps) {
        expect(step.name.trim().length, a.slug).toBeGreaterThan(10);
        expect(step.text.trim().length, a.slug).toBeGreaterThan(60);
      }
    }
  });
});

describe('silo /recursos: schema y sitemap', () => {
  it('TechArticle se ancla al WebPage de su propia URL', () => {
    const a = articles[0];
    const node = articleSchema({
      url: articleUrl(a.slug),
      headline: a.title,
      description: a.description,
      datePublished: a.datePublished,
      dateModified: a.dateModified,
      section: a.category,
    });
    expect(node['@id']).toBe(`${articleUrl(a.slug)}#article`);
    expect(node.mainEntityOfPage).toEqual({ '@id': `${articleUrl(a.slug)}#webpage` });
  });

  it('HowTo numera sus pasos desde 1 y les da URL con ancla', () => {
    const a = articles.find((x) => x.howTo)!;
    const node = howToSchema({
      url: articleUrl(a.slug),
      name: a.howTo!.name,
      description: a.description,
      steps: a.howTo!.steps,
    });
    const steps = node.step as { position: number; url: string }[];
    expect(steps[0].position).toBe(1);
    expect(steps[0].url).toBe(`${articleUrl(a.slug)}#paso-1`);
  });

  it('el sitemap lista el hub y cada artículo', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/recursos`);
    for (const a of articles) expect(urls).toContain(`${SITE.url}/recursos/${a.slug}`);
  });

  it('el sitemap usa la fecha real del artículo, no la del deploy', () => {
    const entry = sitemap().find((e) => e.url === articleUrl(articles[0].slug));
    expect(new Date(entry!.lastModified as Date).toISOString().slice(0, 10)).toBe(
      articles[0].dateModified,
    );
  });

  it('articleBySlug resuelve y falla limpio', () => {
    expect(articleBySlug(articles[0].slug)?.title).toBe(articles[0].title);
    expect(articleBySlug('no-existe')).toBeUndefined();
  });
});
PP_EOF

echo "==> Aplicando cambios puntuales a archivos existentes"
python3 - <<'PP_EOF'
import sys

def edit(path, pairs):
    src = open(path, encoding='utf-8').read()
    for old, new in pairs:
        if new in src and old not in src:
            print(f"   = {path}: ya aplicado, se omite")
            continue
        if old not in src:
            sys.exit(f"ERROR: {path} no está en el estado esperado.\nNo se encontró:\n{old[:160]}")
        src = src.replace(old, new, 1)
    open(path, 'w', encoding='utf-8').write(src)
    print(f"   + {path}")

# --- app/sitemap.ts: hub /recursos + un entry por artículo -------------------
edit('app/sitemap.ts', [
    (
        'import ciudades from "@/data/ciudades.json";',
        'import ciudades from "@/data/ciudades.json";\nimport { articles } from "@/lib/articles";',
    ),
    (
        '    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },',
        '    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },\n'
        '    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },',
    ),
    (
        '  return [...staticRoutes, ...productRoutes, ...localRoutes];',
        '  // Los artículos declaran su propia fecha de modificación: un lastModified\n'
        '  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.\n'
        '  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({\n'
        '    url: `${SITE.url}/recursos/${a.slug}`,\n'
        '    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,\n'
        '  }));\n\n'
        '  return [...staticRoutes, ...productRoutes, ...localRoutes, ...articleRoutes];',
    ),
])

# --- app/llms.txt/route.ts: sección Recursos ---------------------------------
edit('app/llms.txt/route.ts', [
    (
        'import ciudades from "@/data/ciudades.json";',
        'import ciudades from "@/data/ciudades.json";\nimport { articles } from "@/lib/articles";',
    ),
    (
        '  const sectoresLista = sectors.map((s) => `- ${s}`).join("\\n");',
        '  const sectoresLista = sectors.map((s) => `- ${s}`).join("\\n");\n\n'
        '  const recursosLista = articles\n'
        '    .map(\n'
        '      (a) =>\n'
        '        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,\n'
        '    )\n'
        '    .join("\\n");',
    ),
    (
        '## Páginas clave',
        '## Recursos técnicos\n\n'
        'Guías de especificación e instalación, con las fuentes citadas en cada artículo:\n\n'
        '${recursosLista}\n\n'
        '## Páginas clave',
    ),
    (
        '- [Contacto](${base}/contacto)',
        '- [Contacto](${base}/contacto)\\n- [Recursos técnicos](${base}/recursos)',
    ),
])

# --- Navegación: el silo necesita enlaces internos, no solo sitemap ----------
edit('components/Navbar.tsx', [
    (
        "  { href: '/nosotros', label: 'Nosotros' },",
        "  { href: '/recursos', label: 'Recursos' },\n  { href: '/nosotros', label: 'Nosotros' },",
    ),
])

edit('components/Footer.tsx', [
    (
        "      { label: 'Sobre Nosotros', href: '/nosotros' },",
        "      { label: 'Recursos técnicos', href: '/recursos' },\n      { label: 'Sobre Nosotros', href: '/nosotros' },",
    ),
    (
        '              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>',
        '              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>\n'
        '              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>',
    ),
    (
        '              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>',
        '              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>\n'
        '              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>',
    ),
])
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 6 test files / 66 tests, y en el build:"
echo "   o /recursos"
echo "   * /recursos/[slug]  (3 rutas)"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(content): silo tecnico /recursos con 3 guias, TechArticle + HowTo + FAQPage'"
echo "   git push origin main"
echo "=============================================================="
