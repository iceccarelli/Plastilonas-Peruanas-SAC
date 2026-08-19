import { products } from './products';
import { articles } from './articles';
import { pillars, type PillarId } from './framework';

/**
 * ARQUITECTURAS DE REFERENCIA (/soluciones)
 *
 * El peldaño que convierte a un proveedor de componentes en un proveedor de
 * soluciones. El catálogo responde "¿qué venden?"; las familias, "¿qué línea
 * me sirve?"; el marco, "¿qué debo definir?". Falta la pregunta que de verdad
 * hace un jefe de proyecto: "muéstrenme el conjunto armado".
 *
 * Una poza revestida no es una geomembrana: es subrasante aceptada, geotextil
 * de protección, lámina, zanja de anclaje, detalles de penetración, ensayos de
 * costura y un as-built. Vender solo la lámina y callar lo demás es lo que
 * produce las filtraciones que después se atribuyen al material.
 *
 * MECANISMO, no campaña: cada proyecto real que ejecutamos puede sumar una
 * arquitectura o corregir una existente. El archivo crece con la operación.
 *
 * REGLAS DE HONESTIDAD:
 *  1. Todo componente referencia un SKU que existe en lib/products.ts. Nada de
 *     piezas genéricas que después no podemos suministrar.
 *  2. No se declara ninguna obra ejecutada, cliente ni volumen. Estas son
 *     configuraciones de referencia, no casos de estudio: cuando existan casos
 *     reales con permiso y cifras, irán en su propia sección.
 *  3. Cada arquitectura enlaza los criterios del marco que la gobiernan y las
 *     guías que documentan sus modos de falla.
 */

export interface SolutionComponent {
  /** Slug existente en lib/products.ts. */
  producto: string;
  /** Qué función cumple esta pieza dentro del conjunto. */
  funcion: string;
  /** Qué decide su especificación en este contexto. */
  criterio: string;
  /** Si la pieza es opcional según el caso. */
  opcional?: boolean;
}

export interface Solution {
  slug: string;
  titulo: string;
  metaTitle: string;
  metaDescription: string;
  /** Situación real en la que aparece esta arquitectura. */
  escenario: string;
  /** Qué se rompe cuando se compra por piezas sin visión de conjunto. */
  problema: string[];
  sectores: string[];
  componentes: SolutionComponent[];
  /** Orden de ejecución. Alimenta el HowTo. */
  secuencia: { paso: string; detalle: string }[];
  /** Pilares del marco que gobiernan esta arquitectura. */
  pilaresClave: PillarId[];
  /** Modos de falla documentados. */
  riesgos: { titulo: string; detalle: string }[];
  /** Slugs de lib/articles.ts. */
  guias: string[];
  faqs: { q: string; a: string }[];
}

export const solutions: Solution[] = [
  {
    slug: 'poza-revestida-impermeabilizacion',
    titulo: 'Poza revestida: el conjunto completo, no solo la lámina',
    metaTitle: 'Poza revestida: geomembrana, geotextil y anclaje | Perú',
    metaDescription:
      'Arquitectura de referencia para revestir una poza o canal: protección de subrasante, barrera impermeable, anclaje perimetral, detalles de penetración y plan de ensayos de costura.',
    escenario:
      'Una poza de proceso, de agua o de almacenamiento que debe contener su contenido durante toda la vida del proyecto, en un terreno que rara vez es el ideal.',
    problema: [
      'La compra se hace por metro cuadrado de lámina y el resto del conjunto queda fuera del alcance: la protección de la subrasante, el anclaje, los detalles de penetración y los ensayos. Cada uno de esos elementos es un modo de falla independiente.',
      'Cuando aparece la filtración, el diagnóstico habitual culpa al material. En la práctica, la lámina rara vez falla en el centro del panel: falla en la costura, en la penetración o por punzonamiento desde abajo.',
    ],
    sectores: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    componentes: [
      {
        producto: 'geotextiles',
        funcion: 'Protección mecánica entre la subrasante y la barrera impermeable.',
        criterio:
          'Se elige por clase de supervivencia frente al proceso constructivo y por la granulometría del suelo, no por gramaje de catálogo.',
      },
      {
        producto: 'geomembrana-polietileno-pe-hdpe',
        funcion: 'Barrera impermeable principal.',
        criterio:
          'Compatibilidad química con el líquido contenido, carga hidráulica, exposición y vida útil requerida.',
      },
      {
        producto: 'geomembranas-pvc',
        funcion: 'Alternativa de barrera cuando la geometría exige mayor flexibilidad.',
        criterio:
          'Se evalúa frente a HDPE según agresividad del contenido, detalles y condiciones de instalación.',
        opcional: true,
      },
      {
        producto: 'geocompuestos-drenaje',
        funcion: 'Alivio de presión bajo la lámina y conducción de fluidos.',
        criterio:
          'Necesario cuando hay riesgo de presión de agua o gas bajo el revestimiento, que levanta y desgarra la lámina.',
        opcional: true,
      },
      {
        producto: 'accesorios-instalacion',
        funcion: 'Fijación, remates y elementos de detalle.',
        criterio: 'Compatibilidad con el material y con la carga del punto de anclaje.',
      },
    ],
    secuencia: [
      {
        paso: 'Recepción de subrasante',
        detalle:
          'Verificar compactación, uniformidad y ausencia de material orgánico y piedra angular, y firmar el acta antes de desplegar cualquier rollo. Si el terreno no cumple, se corrige o se protege: no se despliega "con cuidado".',
      },
      {
        paso: 'Instalación de la capa de protección',
        detalle:
          'Colocar el geotextil donde la subrasante lo exija, con los traslapes definidos, de modo que la barrera no apoye directamente sobre material anguloso.',
      },
      {
        paso: 'Excavación y ejecución de la zanja de anclaje',
        detalle:
          'Ejecutar la zanja perimetral según la geometría del proyecto y rellenarla compactada, anclando la lámina sin tensión para que absorba la contracción térmica.',
      },
      {
        paso: 'Despliegue de paneles con holgura térmica',
        detalle:
          'Desplegar según el plano de paneles dejando ondulación controlada en las horas frías: una lámina anclada tensada trabaja a tracción permanente en cada ciclo día-noche.',
      },
      {
        paso: 'Soldadura y resolución de detalles',
        detalle:
          'Unir paneles por cuña caliente doble y resolver penetraciones, parches y remates por extrusión, sobre superficie limpia, seca y con holgura alrededor de cada penetración.',
      },
      {
        paso: 'Ensayo del 100% de las costuras',
        detalle:
          'Presurizar el canal de aire de cada costura de cuña doble y ensayar con caja de vacío las soldaduras de extrusión, registrando cada ensayo con identificación de panel.',
      },
      {
        paso: 'Levantamiento de observaciones y as-built',
        detalle:
          'Reparar por parche extruido toda discontinuidad y volver a ensayar. Entregar el plano as-built con la ubicación de cada reparación y los certificados por rollo.',
      },
    ],
    pilaresClave: ['compatibilidad', 'cargas', 'ejecucion', 'documentacion'],
    riesgos: [
      {
        titulo: 'Punzonamiento desde la subrasante',
        detalle:
          'El daño no se ve durante la instalación: aparece cuando la columna de líquido presiona la lámina contra el material anguloso del terreno.',
      },
      {
        titulo: 'Costuras sin registro de ensayo',
        detalle:
          'Una costura sin protocolo es una costura no ejecutada, por bien que se vea. La filtración se manifiesta con la poza ya en servicio.',
      },
      {
        titulo: 'Anclaje tensado sin holgura térmica',
        detalle:
          'La falla aparece entre el tercer y el sexto mes y suele diagnosticarse mal como defecto de fábrica de la lámina.',
      },
    ],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales', 'como-elegir-geotextil-separacion-drenaje-refuerzo'],
    faqs: [
      {
        q: '¿Puedo comprar solo la geomembrana e instalarla con personal propio?',
        a: 'Puede, y a veces es lo correcto. Lo que no conviene es hacerlo sin resolver la recepción de subrasante, el plan de ensayos de costura y los detalles de penetración: son los tres puntos donde se origina la mayoría de las filtraciones, y ninguno depende del espesor de la lámina.',
      },
      {
        q: '¿Siempre hace falta geotextil bajo la geomembrana?',
        a: 'No siempre. Es necesario cuando la subrasante es granular gruesa, contiene material anguloso o la carga hidráulica es alta. Su función es protección mecánica contra punzonamiento, no impermeabilización.',
      },
      {
        q: '¿Qué debo exigir al recibir la obra?',
        a: 'Acta de recepción de subrasante firmada antes del despliegue, registro de ensayos no destructivos por costura, resultados de ensayos destructivos según el plan de calidad, plano as-built de paneles con las reparaciones ubicadas y certificados de material por rollo.',
      },
    ],
  },

  {
    slug: 'frente-avance-ventilado',
    titulo: 'Frente de avance ventilado: del cálculo de caudal a la manga instalada',
    metaTitle: 'Ventilación de frente de avance: caudal, manga e instalación | Perú',
    metaDescription:
      'Arquitectura de referencia para ventilar una labor subterránea: demanda por personal y equipo diésel corregida por altitud, elección de esquema, diámetro de manga y verificación en el frente.',
    escenario:
      'Una labor ciega en avance, con personal y equipo diésel operando, donde el aire debe llegar al fondo y los gases de voladura evacuarse dentro del ciclo de trabajo.',
    problema: [
      'El sistema se compra por partes: alguien elige el ventilador, alguien compra "manga de tantas pulgadas" y nadie cierra el cálculo completo. El resultado es un sistema que cumple en papel y no en el frente.',
      'La verificación se hace donde es cómodo medir —la boca del ventilador— y no donde importa, que es la condición de aire del trabajador en el fondo de la labor.',
    ],
    sectores: ['Minería', 'Construcción', 'Infraestructura'],
    componentes: [
      {
        producto: 'mangas-ventilacion-minas-tuneles',
        funcion: 'Conducción del aire entre el ventilador y el frente.',
        criterio:
          'Diámetro derivado del caudal y de la pérdida de carga admisible; refuerzo antic colapso si el esquema es aspirante; longitud de tramo que minimice empalmes.',
      },
      {
        producto: 'accesorios-instalacion',
        funcion: 'Suspensión, empalmes y fijación a lo largo de la labor.',
        criterio:
          'Debe evitar catenaria excesiva y roce contra la caja, que son las dos fuentes de fuga progresiva que nadie registra.',
      },
      {
        producto: 'lona-plastificada-rafia-polytarp',
        funcion: 'Cortinas y tabiques de control de flujo cuando el circuito lo requiere.',
        criterio: 'Resistencia a abrasión y facilidad de reposición en labor.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Calcular la demanda por personal',
        detalle:
          'Número máximo de personas en la labor por el caudal por persona correspondiente a la altitud de la operación, que escala de 3 a 6 m³/min según el rango de msnm.',
      },
      {
        paso: 'Calcular la demanda por equipo diésel',
        detalle:
          'Sumar la potencia en HP de los equipos que operan simultáneamente en la labor y aplicar el criterio de 3 m³/min por HP. La palabra clave es simultáneamente.',
      },
      {
        paso: 'Calcular la dilución de gases de voladura',
        detalle:
          'Determinar el caudal que evacúa y diluye los gases en el tiempo de reingreso objetivo, según el volumen de la labor y el explosivo empleado.',
      },
      {
        paso: 'Elegir el esquema: impelente, aspirante o mixto',
        detalle:
          'Impelente barre bien el frente pero devuelve el aire contaminado por la labor; aspirante protege el trayecto pero exige la boca cerca del frente y manga reforzada contra colapso.',
      },
      {
        paso: 'Dimensionar el diámetro y recién después el ventilador',
        detalle:
          'Elegir el diámetro que transporta el caudal con pérdida de carga aceptable: aumentar diámetro suele ser más económico que aumentar potencia, que se paga en energía todas las horas del proyecto.',
      },
      {
        paso: 'Instalar controlando fugas',
        detalle:
          'Minimizar empalmes, suspender sin catenaria excesiva y proteger del roce contra la caja. La fuga no se calcula bien en gabinete: se controla en obra.',
      },
      {
        paso: 'Verificar midiendo en el frente',
        detalle:
          'Auditar el caudal en el frente de trabajo, no en la boca del ventilador, y corregir uniones y roces donde la pérdida sea significativa.',
      },
    ],
    pilaresClave: ['cargas', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Manga aspirante sin refuerzo',
        detalle:
          'Trabaja a presión negativa y colapsa sobre sí misma al arrancar el ventilador: el diámetro comprado deja de existir en el primer turno.',
      },
      {
        titulo: 'Boca demasiado lejos del frente',
        detalle:
          'En aspirante, el campo de succión decae muy rápido con la distancia y queda una zona muerta que ningún caudal adicional resuelve.',
      },
      {
        titulo: 'Auditoría en la boca del ventilador',
        detalle:
          'Declara conforme un sistema que no representa la condición real del trabajador en el fondo de la labor.',
      },
    ],
    guias: [
      'calculo-caudal-mangas-ventilacion-mina-subterranea',
      'ventilacion-impelente-vs-aspirante-labores-mineras',
    ],
    faqs: [
      {
        q: '¿Qué dato necesitan para dimensionar la manga?',
        a: 'Altitud de la operación, número máximo de personas en la labor, potencia en HP de los equipos diésel que operan simultáneamente, sección y longitud de la labor, tiempo de reingreso objetivo tras voladura, y si el esquema será impelente, aspirante o mixto.',
      },
      {
        q: '¿Conviene aumentar el diámetro o el ventilador?',
        a: 'En general, el diámetro. La pérdida por fricción crece de forma muy pronunciada al reducir la sección, de modo que un diámetro mayor baja la resistencia sin aumentar el consumo energético; un ventilador mayor resuelve el síntoma y se paga en energía cada hora de operación.',
      },
      {
        q: '¿Fabrican la manga a medida del tramo?',
        a: 'Sí. Diámetro, longitud de tramo, sistema de unión y refuerzo se definen según el cálculo y las condiciones de la labor, precisamente para reducir el número de empalmes, que es donde se acumulan las fugas.',
      },
    ],
  },

  {
    slug: 'despacho-concentrado-granel',
    titulo: 'Despacho de concentrado a granel: del llenado al puerto',
    metaTitle: 'Despacho de concentrado a granel: envase, estiba y cobertura | Perú',
    metaDescription:
      'Arquitectura de referencia para despachar material a granel: envase con carga de trabajo segura declarada, unitización, cobertura de tolva y la documentación que exige el terminal.',
    escenario:
      'Material a granel que sale de operación, pasa por balanza, viaja por carretera y llega a un terminal portuario con requisitos documentales propios.',
    problema: [
      'Cada eslabón se compra por separado y con criterios distintos: el envase por precio unitario, el cobertor por metro cuadrado, y la documentación se recuerda cuando el contenedor ya está en camino.',
      'El envase es un elemento de izaje además de un envase, y el cobertor es un elemento de contención además de una tapa. Tratarlos como consumibles es lo que produce el derrame en ruta y el rechazo en el terminal.',
    ],
    sectores: ['Minería', 'Logística', 'Transporte'],
    componentes: [
      {
        producto: 'big-bags-bolsones-polipropileno',
        funcion: 'Envase y elemento de izaje del material a granel.',
        criterio:
          'Carga de trabajo segura y relación de seguridad según uso único o múltiple; volumen calculado por densidad aparente, no por peso nominal.',
      },
      {
        producto: 'sacos-polytarp-embarque-granel',
        funcion: 'Alternativa de envase para embarque y estiba.',
        criterio: 'Resistencia de confección y comportamiento en estiba.',
        opcional: true,
      },
      {
        producto: 'films-termocontraibles-shrink',
        funcion: 'Unitización y protección de la carga paletizada.',
        criterio: 'Capacidad de sujeción del conjunto y protección frente a humedad en tránsito.',
        opcional: true,
      },
      {
        producto: 'mantas-cobertores-toldos-camiones',
        funcion: 'Contención y protección de la carga durante el transporte.',
        criterio:
          'Refuerzo perimetral continuo y densidad de amarre acorde a la velocidad de operación; el enemigo es la succión y el aleteo, no el peso.',
      },
      {
        producto: 'siders-tolderas-camiones',
        funcion: 'Cerramiento lateral de la unidad cuando el tipo de carrocería lo requiere.',
        criterio: 'Compatibilidad con la unidad y tiempo de operación por parte del chofer.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir envase por densidad aparente',
        detalle:
          'Calcular el volumen requerido dividiendo la masa objetivo entre la densidad aparente del material, y añadir margen por asentamiento durante el transporte.',
      },
      {
        paso: 'Fijar carga de trabajo segura y relación de seguridad',
        detalle:
          'Declarar SWL y relación 5:1 o 6:1 según sea uso único o múltiple. Si habrá reutilización, definir el procedimiento de inspección previo a cada recarga.',
      },
      {
        paso: 'Confirmar la documentación que exige el destino',
        detalle:
          'Verificar con el terminal y con el cliente final qué certificación de fabricación por lote se exigirá, y solicitarla en la etapa de cotización.',
      },
      {
        paso: 'Definir el procedimiento de llenado e izaje',
        detalle:
          'Llenado centrado, izaje con todas las asas diseñadas y ángulo lo más vertical posible, con protección en las uñas del montacargas.',
      },
      {
        paso: 'Especificar la cobertura de la unidad',
        detalle:
          'Dimensionar el cobertor con el traslape real de la tolva, refuerzo perimetral continuo y una densidad de ojalillos acorde al perfil de ruta.',
      },
      {
        paso: 'Definir el tiempo objetivo de colocación',
        detalle:
          'Establecer cuántas personas colocan el cobertor y en cuánto tiempo: un cobertor que exige demasiado termina mal colocado, y esa holgura es la que dispara el aleteo.',
      },
    ],
    pilaresClave: ['compatibilidad', 'cargas', 'documentacion', 'operacion'],
    riesgos: [
      {
        titulo: 'Reutilizar un envase de un solo uso',
        detalle:
          'Comprar 5:1 y recargar anula la premisa de diseño; es la decisión que precede a la mayoría de las roturas "inexplicables" en cancha.',
      },
      {
        titulo: 'Documentación pedida tarde',
        detalle:
          'El certificado exigido por el terminal deja de ser un trámite y se convierte en un problema de embarque cuando se descubre con la carga en camino.',
      },
      {
        titulo: 'Cobertor con holgura',
        detalle:
          'A velocidad de ruta aletea y fatiga sus propios amarres: el desgarro empieza en el ojalillo semanas después, sin ningún impacto que lo explique.',
      },
    ],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba', 'cobertores-transporte-concentrado-mineral'],
    faqs: [
      {
        q: '¿Qué certificación exige el terminal para los bolsones?',
        a: 'APM Terminals Callao comunicó que desde el 1 de enero de 2023 los bolsones deben contar con certificación de fabricación conforme a ISO 21898:2004, junto con el cumplimiento de las disposiciones de seguridad y salud en puertos de la OIT. Conviene solicitarla al proveedor durante la cotización.',
      },
      {
        q: '¿El cobertor forma parte del cumplimiento de transporte?',
        a: 'Cuando el material está clasificado como mercancía peligrosa, el sistema de contención queda comprendido en el Reglamento Nacional aprobado por D.S. 021-2008-MTC. La clasificación depende de la composición del material y conviene verificarla con el área de cumplimiento.',
      },
      {
        q: '¿Cómo evito que se rompan los bolsones en cancha?',
        a: 'La mayoría de las roturas vienen de la manipulación, no del tejido: izar con todas las asas diseñadas, mantener el ángulo de izaje vertical, proteger las uñas del montacargas, arriostrar el apilado, llenar centrado y no arrastrar el bolsón sobre superficies abrasivas.',
      },
    ],
  },

  {
    slug: 'proteccion-cultivo-agroexportacion',
    titulo: 'Protección de cultivo: barrera sanitaria, sombra y suelo',
    metaTitle: 'Protección de cultivo: mallas, sombra y cobertura de suelo | Perú',
    metaDescription:
      'Arquitectura de referencia para proteger un cultivo de agroexportación: exclusión de plagas sin asfixiar la ventilación, control de radiación y manejo de humedad del suelo.',
    escenario:
      'Un cultivo de agroexportación que necesita excluir vectores, manejar radiación y conservar humedad, en valles donde la radiación y el viento castigan el material tanto como la plaga.',
    problema: [
      'Se compran mallas por precio de metro cuadrado y sin definir el organismo objetivo, la superficie de ventilación disponible ni la radiación de la zona. Los tres datos cambian el producto.',
      'La barrera se cierra sin ampliar el área de ventilación y el problema fitosanitario que aparece por el cambio de clima interior supera al que se quería evitar.',
    ],
    sectores: ['Agricultura', 'Comercio'],
    componentes: [
      {
        producto: 'mallas-antiafidas',
        funcion: 'Barrera física de exclusión de vectores.',
        criterio:
          'Densidad de trama definida por el insecto más pequeño a excluir, con el costo de ventilación que ese nivel implica.',
      },
      {
        producto: 'malla-raschel-sombra',
        funcion: 'Control de radiación y temperatura de hoja.',
        criterio: 'Porcentaje de sombra según cultivo, etapa fenológica y radiación del valle.',
      },
      {
        producto: 'malla-anti-pajaro-anti-granizo',
        funcion: 'Protección mecánica frente a fauna y granizo.',
        criterio: 'Resistencia y sistema de tensado acorde al viento de la zona.',
        opcional: true,
      },
      {
        producto: 'mulch-madera-picada',
        funcion: 'Cobertura de suelo: retención de humedad y control de malezas.',
        criterio: 'Espesor de aplicación y granulometría según permanencia y viento.',
        opcional: true,
      },
      {
        producto: 'geotextiles',
        funcion: 'Separación y control en caminos internos y obras de riego.',
        criterio: 'Función requerida y clase de supervivencia del proceso constructivo.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir el organismo objetivo',
        detalle:
          'La densidad de trama se elige por el insecto más pequeño que debe excluir. Excluir trips exige aberturas del orden de una décima de milímetro, mucho menores que para áfidos o mosca blanca.',
      },
      {
        paso: 'Verificar la superficie de ventilación disponible',
        detalle:
          'Cerrar la trama sin ampliar las ventanas cambia el clima interior. La industria de invernaderos señala que el nivel de exclusión de trips puede requerir tres o cuatro veces más superficie de malla para mantener el flujo de aire.',
      },
      {
        paso: 'Definir el porcentaje de sombra',
        detalle:
          'Según cultivo, etapa y radiación del valle. La misma malla puede ser adecuada en una zona de alta radiación e insuficiente o excesiva en otra.',
      },
      {
        paso: 'Especificar el tratamiento UV por la radiación real',
        detalle:
          'En valles de alta insolación el tratamiento UV determina cuántas campañas resiste el material. El indicador que decide es el costo por campaña, no el precio por metro cuadrado.',
      },
      {
        paso: 'Resolver bordes, accesos y fijación',
        detalle:
          'La mayoría de las fallas ocurren en el punto de amarre y en las puertas, no en el paño: refuerzo de borde continuo y separación de fijación acorde al viento.',
      },
      {
        paso: 'Definir la cobertura de suelo',
        detalle:
          'Calcular el volumen de mulch por superficie y espesor objetivo, regando antes de aplicar y dejando libre el cuello de la planta.',
      },
    ],
    pilaresClave: ['compatibilidad', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Trama cerrada sin ampliar ventilación',
        detalle:
          'Sube la temperatura y la humedad interior; el resultado puede ser peor que la plaga que se quería excluir.',
      },
      {
        titulo: 'Fallas en accesos y amarres',
        detalle:
          'Una puerta mal resuelta anula la exclusión de toda la estructura, por buena que sea la malla instalada.',
      },
      {
        titulo: 'Mulch aplicado delgado',
        detalle:
          'Por debajo del espesor recomendado la luz llega al suelo, las malezas germinan igual y se concluye que el producto no sirve.',
      },
    ],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion', 'mulch-madera-espesor-calculo-cobertura-suelo'],
    faqs: [
      {
        q: '¿Qué información necesitan para especificar la malla?',
        a: 'La plaga o vector objetivo, la superficie de ventilación disponible y si puede ampliarse, la radiación y exposición de la zona, las dimensiones de paño y el sistema de fijación, y el cultivo con su etapa cuando además se busca sombreo.',
      },
      {
        q: '¿La malla antiáfida sirve también como malla de sombra?',
        a: 'Cumplen funciones distintas. La antiáfida es una barrera de exclusión y la raschel controla radiación. Si el objetivo agronómico es manejar radiación, la selección debe hacerse por porcentaje de sombra.',
      },
      {
        q: '¿Cuántas campañas dura el material?',
        a: 'Depende del tratamiento UV y sobre todo de la radiación de la zona. En valles de alta insolación la degradación es más rápida, por lo que conviene comparar costo por campaña en vez de precio por metro cuadrado.',
      },
    ],
  },

  {
    slug: 'almacenamiento-agua-operacion-remota',
    titulo: 'Almacenamiento de agua en operación remota',
    metaTitle: 'Almacenamiento de agua remoto: tanques flexibles y conducción | Perú',
    metaDescription:
      'Arquitectura de referencia para almacenar y conducir agua en frentes remotos: preparación de base, volumen útil real, conducción en HDPE y la pregunta correcta sobre potabilidad.',
    escenario:
      'Un frente de trabajo remoto que necesita almacenar y distribuir agua sin obra civil, sin grúa y con logística de acceso limitada.',
    problema: [
      'El equipo se elige por volumen nominal y llega a un emplazamiento que no se preparó, o que no tiene el área que ocupa el tanque lleno, que es mayor que la del tanque extendido en vacío.',
      'Cuando el contenido es agua de consumo, la pregunta se formula como "¿sirve para agua potable?" en vez de pedir la certificación de los materiales en contacto, que es lo que realmente se puede verificar.',
    ],
    sectores: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    componentes: [
      {
        producto: 'tanques-flexibles-bladders',
        funcion: 'Almacenamiento desplegable sin obra civil.',
        criterio: 'Fluido contenido, volumen y régimen de uso: estático o con ciclos frecuentes.',
      },
      {
        producto: 'tuberias-hdpe',
        funcion: 'Conducción entre almacenamiento y punto de uso.',
        criterio: 'Clase de presión y diámetro derivados del caudal y del perfil hidráulico.',
      },
      {
        producto: 'geomembrana-polietileno-pe-hdpe',
        funcion: 'Contención secundaria o revestimiento de la zona de apoyo cuando el contenido lo exige.',
        criterio: 'Compatibilidad con el fluido y requisitos de contención del emplazamiento.',
        opcional: true,
      },
      {
        producto: 'geotextiles',
        funcion: 'Protección de la base contra material anguloso.',
        criterio: 'Se define por el terreno disponible, con el mismo criterio que una subrasante.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir volumen y régimen de uso',
        detalle:
          'Establecer el volumen requerido y si el tanque trabajará estático o con ciclos frecuentes de llenado y vaciado, porque el régimen afecta la selección y los accesorios.',
      },
      {
        paso: 'Seleccionar y preparar el emplazamiento',
        detalle:
          'Elegir un área que admita la huella del tanque LLENO, con acceso para el vehículo de llenado, y nivelar y compactar retirando piedras angulares, restos metálicos y raíces.',
      },
      {
        paso: 'Colocar protección de base si el terreno lo exige',
        detalle:
          'Instalar la capa de protección cuando el terreno es granular grueso o anguloso, con el mismo criterio que se aplica bajo una geomembrana.',
      },
      {
        paso: 'Resolver la conducción',
        detalle:
          'Dimensionar la tubería por caudal y perfil hidráulico, no por disponibilidad de stock, y definir conexiones, válvulas y venteo antes del primer llenado.',
      },
      {
        paso: 'Llenado controlado y verificación',
        detalle:
          'Realizar un primer llenado progresivo revisando el asentamiento de la base y el comportamiento de las conexiones, corrigiendo antes de alcanzar el volumen total.',
      },
      {
        paso: 'Establecer inspección y reparación',
        detalle:
          'Definir frecuencia de revisión de base, conexiones y membrana, y disponer del kit y el procedimiento de reparación antes de necesitarlos.',
      },
    ],
    pilaresClave: ['compatibilidad', 'ejecucion', 'documentacion', 'operacion'],
    riesgos: [
      {
        titulo: 'Base sin preparar',
        detalle:
          'Cualquier elemento punzante bajo la membrana se convierte en un concentrador de esfuerzo bajo varias toneladas de agua. La falla llega cuando ya nadie recuerda cómo se preparó el terreno.',
      },
      {
        titulo: 'Emplazamiento planificado con la huella en vacío',
        detalle:
          'El área ocupada cambia al llenarse, y obliga a reubicar el equipo cuando ya está en uso.',
      },
      {
        titulo: 'Potabilidad asumida',
        detalle:
          'Se descubre en obra que el equipo no es apto para el uso previsto porque nadie pidió por escrito la certificación de los materiales en contacto.',
      },
    ],
    guias: ['tanques-flexibles-almacenamiento-agua-operaciones-remotas'],
    faqs: [
      {
        q: '¿Qué preparación de terreno necesita un tanque flexible?',
        a: 'Superficie nivelada, compactada y libre de elementos punzantes, dimensionada para la huella del tanque lleno, con protección adicional si el terreno es granular grueso o anguloso.',
      },
      {
        q: '¿Cómo pregunto correctamente por potabilidad?',
        a: 'Pidiendo por escrito, en la cotización, qué certificación tienen los materiales en contacto con el agua. NSF/ANSI 61 es el estándar internacional de referencia para componentes de sistemas de agua potable.',
      },
      {
        q: '¿Se puede reparar en sitio?',
        a: 'Los daños superficiales suelen repararse con el kit y el procedimiento del fabricante, por eso conviene incorporar la inspección periódica a la rutina: el mismo daño ignorado termina en reemplazo.',
      },
    ],
  },

  {
    slug: 'campamento-almacen-temporal',
    titulo: 'Campamento y almacén temporal: cubrir, cerrar y proteger',
    metaTitle: 'Campamento y almacén temporal: carpas, módulos y cerramientos | Perú',
    metaDescription:
      'Arquitectura de referencia para instalar cobertura y almacenamiento temporal en obra o faena: cargas de viento, anclaje disponible, cerramientos y protección de puestos de trabajo.',
    escenario:
      'Una faena que necesita cubrir superficie, almacenar material y habilitar puestos de trabajo con estructuras que se montan y, muchas veces, se desmontan al terminar la campaña.',
    problema: [
      'La cobertura se cotiza por metro cuadrado cubierto y nadie entrega el dato que gobierna el diseño: la ubicación exacta, la altura y el tipo de anclaje disponible. Sin eso, no hay cálculo de viento posible.',
      'Cuando la estructura falla, casi nunca se rompe la tela: se sueltan los anclajes o se levanta la cubierta entera, porque solo se verificó la presión frontal y no la succión.',
    ],
    sectores: ['Construcción', 'Minería', 'Industrial', 'Infraestructura'],
    componentes: [
      {
        producto: 'carpas-lona-estructuras-metalicas',
        funcion: 'Cobertura principal de superficie.',
        criterio:
          'Cargas de viento del emplazamiento según altura y geometría, y sistema de anclaje disponible.',
      },
      {
        producto: 'modulos-albergues-campamentos',
        funcion: 'Módulos habilitados para uso de personal o almacenamiento.',
        criterio: 'Uso interior, permanencia y logística de traslado.',
        opcional: true,
      },
      {
        producto: 'toldos-cerramientos',
        funcion: 'Cerramientos laterales y control de ingreso de viento y lluvia.',
        criterio:
          'El grado de cerramiento cambia por completo la presión interior y, con ella, el cálculo estructural.',
      },
      {
        producto: 'lona-plastificada-rafia-polytarp',
        funcion: 'Cobertura de material acopiado y protección temporal.',
        criterio: 'Gramaje y refuerzo perimetral según exposición y frecuencia de manipulación.',
      },
      {
        producto: 'biombos-protectores-soldadura',
        funcion: 'Protección colectiva en puestos de trabajo con soldadura.',
        criterio: 'Riesgo a controlar, geometría del espacio y frecuencia de movimiento.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir emplazamiento, altura y geometría',
        detalle:
          'La Norma E.020 corrige la velocidad de diseño por altura mediante Vh = V (h/10)^0,22, con un mínimo de 75 km/h hasta los 10 metros: una estructura alta ve más viento.',
      },
      {
        paso: 'Calcular presión y succión por superficie',
        detalle:
          'Aplicar Ph = 0,005 · C · Vh² en kgf/m², distinguiendo las caras a barlovento de las de sotavento, donde el factor de forma es negativo.',
      },
      {
        paso: 'Definir el grado de cerramiento',
        detalle:
          'Cerrada, abierta en un lado o completamente abierta: la condición de cerramiento cambia la presión interior y no puede decidirse después de dimensionar.',
      },
      {
        paso: 'Resolver el anclaje según el piso disponible',
        detalle:
          'Anclar sobre losa existente, sobre terreno natural o con lastre son tres soluciones estructuralmente distintas, y todas deben verificarse a extracción.',
      },
      {
        paso: 'Montar y tensar',
        detalle:
          'Una cobertura destensada aletea y fatiga sus propios amarres, de modo que el tensado forma parte del montaje y no del acabado.',
      },
      {
        paso: 'Definir el procedimiento ante alerta de viento',
        detalle:
          'Establecer quién cierra o refuerza la cobertura, con qué criterio y en cuánto tiempo, e incorporar la inspección del tensado al plan de mantenimiento.',
      },
    ],
    pilaresClave: ['cargas', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Succión no verificada',
        detalle:
          'La cara a sotavento recibe succión y hace trabajar los anclajes a extracción: es el modo de falla habitual de las coberturas textiles.',
      },
      {
        titulo: 'Anclaje que exige ejecución perfecta',
        detalle:
          'En estructuras desmontables, el montaje lo repite personal que rota: un anclaje sin tolerancia terminará mal ejecutado alguna vez.',
      },
      {
        titulo: 'Velocidad de diseño optimista',
        detalle:
          'Como la carga depende del cuadrado de la velocidad, bajar la velocidad de diseño de 90 a 75 km/h no reduce la carga un 17 % sino alrededor de un 30 %.',
      },
    ],
    guias: ['carpas-industriales-carga-viento-norma-e020'],
    faqs: [
      {
        q: '¿Qué datos necesitan para cotizar una cobertura?',
        a: 'Superficie y geometría a cubrir, altura libre requerida, ubicación exacta del emplazamiento, tipo de piso o terreno disponible para el anclaje, condición de cerramiento, uso interior previsto y si la estructura será permanente o desmontable.',
      },
      {
        q: '¿Instalan además de fabricar?',
        a: 'Sí. En cobertura textil el desempeño depende tanto del textil como del anclaje y del tensado, por lo que se entrega montada.',
      },
      {
        q: '¿Una estructura desmontable necesita el mismo cálculo?',
        a: 'Sí, y además debe tolerar la variabilidad de ejecución que impone el montaje y desmontaje repetido por personal que rota.',
      },
    ],
  },
];

export const solutionBySlug = (slug: string) => solutions.find((s) => s.slug === slug);

/** Arquitecturas donde participa un producto: alimenta el enlace desde la ficha. */
export const solutionsForProduct = (productSlug: string) =>
  solutions.filter((s) => s.componentes.some((c) => c.producto === productSlug));

/** Comprobaciones de integridad usadas por los tests. */
export const productExists = (slug: string) => products.some((p) => p.slug === slug);
export const guideExists = (slug: string) => articles.some((a) => a.slug === slug);
export const pillarExists = (id: PillarId) => pillars.some((p) => p.id === id);
