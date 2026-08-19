import { articles } from './articles';

/**
 * MARCO DE ESPECIFICACIÓN PLASTILONAS (MEP)
 *
 * Qué es: un conjunto público de criterios para especificar una solución
 * textil o geosintética industrial ANTES de cotizarla, con una autoevaluación
 * que puntúa qué tan definido está el proyecto.
 *
 * Por qué existe. Todas nuestras guías técnicas documentan lo mismo desde
 * ángulos distintos: los proyectos no fallan por el material, fallan por lo
 * que nadie definió. El bolsón izado con dos asas, la geomembrana anclada
 * tensada, la manga aspirante sin refuerzo, la malla cerrada sin ampliar la
 * ventilación. Ese patrón, escrito como criterio verificable, es un estándar.
 *
 * Por qué es un MECANISMO y no una campaña: cada modo de falla que
 * encontramos en obra se convierte en una pregunta de este archivo. El marco
 * crece solo mientras la empresa trabaje, sin depender del entusiasmo de nadie.
 *
 * REGLAS DE HONESTIDAD:
 *  1. Ninguna pregunta insinúa que solo nosotros podemos responderla. El marco
 *     es útil aunque el proyecto se compre a un competidor — esa es justamente
 *     la razón por la que se convierte en referencia.
 *  2. Cada criterio que cita una cifra normativa enlaza a la guía que la
 *     documenta con su fuente. Sin guía que lo respalde, no entra.
 *  3. La autoevaluación NO puntúa proveedores ni productos: puntúa cuán
 *     definido está el proyecto del cliente. No es un ranking disfrazado.
 */

export type PillarId =
  | 'compatibilidad'
  | 'cargas'
  | 'exposicion'
  | 'ejecucion'
  | 'documentacion'
  | 'operacion';

export interface Criterion {
  id: string;
  /** La pregunta, redactada para que el comprador la responda con un dato. */
  pregunta: string;
  /** Qué decide técnicamente esta respuesta. */
  porQue: string;
  /** Qué ocurre en obra cuando el dato no existe. Casos reales documentados. */
  riesgo: string;
  /** Slug de artículo en lib/articles.ts que respalda el criterio. */
  evidencia?: string;
  /** Peso relativo dentro del pilar. 2 = crítico, 1 = importante. */
  peso: 1 | 2;
}

export interface Pillar {
  id: PillarId;
  nombre: string;
  /** Una línea: qué gobierna este pilar. */
  resumen: string;
  intro: string;
  criterios: Criterion[];
}

export const FRAMEWORK_VERSION = '1.0';
export const FRAMEWORK_UPDATED = '2026-08-19';

export const pillars: Pillar[] = [
  {
    id: 'compatibilidad',
    nombre: 'Compatibilidad del contenido',
    resumen: 'Qué toca el material y con qué agresividad.',
    intro:
      'La primera decisión no es de espesor ni de gramaje: es de compatibilidad. Un material que no resiste lo que contiene falla por más grueso que sea, y el fallo aparece cuando la instalación ya está en servicio.',
    criterios: [
      {
        id: 'contenido',
        pregunta: '¿Qué contiene o qué toca exactamente el material, y con qué concentración?',
        porQue:
          'Agua, solución de proceso, lixiviado, combustible, concentrado mineral o alimento imponen compatibilidades químicas distintas y, a veces, documentación distinta.',
        riesgo:
          'Se especifica por espesor y la lámina resulta incompatible con el líquido contenido; el deterioro es químico y no se detecta en la recepción de obra.',
        evidencia: 'instalacion-geomembranas-hdpe-pozas-canales',
        peso: 2,
      },
      {
        id: 'consumo-humano',
        pregunta: '¿El contenido es para consumo humano o para uso agrícola sensible?',
        porQue:
          'Determina qué certificación deben tener los materiales en contacto. La pregunta correcta al proveedor es por la certificación de esos materiales, no si "sirve para agua potable".',
        riesgo:
          'El equipo llega a obra y no es apto para el uso previsto; el hallazgo ocurre después de la compra.',
        evidencia: 'tanques-flexibles-almacenamiento-agua-operaciones-remotas',
        peso: 2,
      },
      {
        id: 'densidad',
        pregunta: '¿Conoce la densidad aparente del material a contener (kg/m³)?',
        porQue:
          'El envase se compra por peso pero se llena por volumen. Sin densidad aparente el dimensionamiento sale mal en una de dos direcciones.',
        riesgo:
          'Se paga volumen que nunca se usa, o se sobrellena por encima de la carga de trabajo segura del envase.',
        evidencia: 'big-bags-mineria-peru-normativa-errores-estiba',
        peso: 1,
      },
      {
        id: 'plaga-objetivo',
        pregunta: 'Si es una barrera biológica, ¿cuál es el organismo objetivo a excluir?',
        porQue:
          'La densidad de trama se elige por el insecto más pequeño que debe excluir, y cada escalón de exclusión se paga en ventilación.',
        riesgo:
          'Se cierra la trama sin ampliar el área de ventilación: sube la temperatura y la humedad, y aparece un problema fitosanitario distinto del que se quería evitar.',
        evidencia: 'mallas-antiafidas-densidad-trama-ventilacion',
        peso: 1,
      },
    ],
  },
  {
    id: 'cargas',
    nombre: 'Cargas y esfuerzos',
    resumen: 'Qué fuerzas actúan, en qué dirección y con qué signo.',
    intro:
      'Casi ninguna falla de campo ocurre por rotura del material en su centro. Ocurre en el punto donde se transmite el esfuerzo: el asa, el ojalillo, el anclaje, la costura. Ese esfuerzo hay que calcularlo, no estimarlo.',
    criterios: [
      {
        id: 'viento',
        pregunta: '¿Se calculó la carga de viento del emplazamiento, incluida la succión?',
        porQue:
          'La Norma E.020 del RNE fija la velocidad de diseño según altura y obtiene la carga con Ph = 0,005·C·Vh². En sotavento el factor de forma es negativo: la cobertura recibe succión.',
        riesgo:
          'Se verifica solo la presión frontal. La succión arranca la cobertura por los anclajes, que nunca se comprobaron a extracción.',
        evidencia: 'carpas-industriales-carga-viento-norma-e020',
        peso: 2,
      },
      {
        id: 'izaje',
        pregunta: 'Si hay izaje, ¿está definida la carga de trabajo segura y la relación de seguridad?',
        porQue:
          'En big bags, 5:1 corresponde a un solo uso y 6:1 a uso múltiple con inspección documentada. Es un criterio de uso, no un grado de calidad.',
        riesgo:
          'Se compra 5:1 y se reutiliza. Es la decisión que precede a la mayoría de las roturas "inexplicables" en cancha.',
        evidencia: 'big-bags-mineria-peru-normativa-errores-estiba',
        peso: 2,
      },
      {
        id: 'columna-hidraulica',
        pregunta: '¿Cuál es la carga hidráulica y la geometría de taludes?',
        porQue:
          'La altura de columna y la pendiente definen el esfuerzo sobre la lámina y sobre su anclaje, y determinan si hace falta protección adicional contra punzonamiento.',
        riesgo:
          'La lámina se presiona contra material anguloso de la subrasante y se perfora desde abajo, con la poza ya en servicio.',
        evidencia: 'como-elegir-geotextil-separacion-drenaje-refuerzo',
        peso: 2,
      },
      {
        id: 'presion-negativa',
        pregunta: 'Si hay aspiración, ¿el elemento resiste presión negativa sin colapsar?',
        porQue:
          'Una manga aspirante trabaja a presión negativa y necesita refuerzo helicoidal o equivalente; no es una manga impelente instalada al revés.',
        riesgo:
          'El ducto se estrangula al arrancar el ventilador y el caudal real cae muy por debajo del nominal. Se descubre en el primer turno.',
        evidencia: 'ventilacion-impelente-vs-aspirante-labores-mineras',
        peso: 1,
      },
      {
        id: 'dinamica',
        pregunta: '¿El elemento trabaja bajo carga dinámica (ruta, vibración, aleteo)?',
        porQue:
          'A velocidad de carretera un cobertor recibe succión y aletea; el aleteo es un ciclo de fatiga que actúa sobre el perímetro.',
        riesgo:
          'Desgarro progresivo desde los ojalillos semanas después de instalado, sin ningún impacto que lo explique.',
        evidencia: 'cobertores-transporte-concentrado-mineral',
        peso: 1,
      },
    ],
  },
  {
    id: 'exposicion',
    nombre: 'Exposición y vida útil',
    resumen: 'Dónde va a trabajar y por cuánto tiempo.',
    intro:
      'El mismo producto tiene vidas útiles distintas en Ica, en Cusco y en Iquitos. La radiación de altura, la amplitud térmica y la humedad no son detalles de contexto: son variables de especificación.',
    criterios: [
      {
        id: 'ubicacion',
        pregunta: '¿Está definida la ubicación exacta, con altitud y exposición?',
        porQue:
          'La radiación UV de altura, la garúa costera y la lluvia de selva determinan gramaje, tratamiento UV y tipo de unión. También cambian el requerimiento de aire por persona en labores subterráneas.',
        riesgo:
          'Se traslada una especificación que funcionó en costa a una operación de sierra y la vida útil se reduce a una fracción.',
        evidencia: 'calculo-caudal-mangas-ventilacion-mina-subterranea',
        peso: 2,
      },
      {
        id: 'vida-util',
        pregunta: '¿Cuál es la vida útil requerida, y se compara costo por campaña o precio por m²?',
        porQue:
          'El indicador que decide no es el precio por metro cuadrado sino el costo por campaña, que incluye desmontaje y reinstalación cuando el material falla antes de tiempo.',
        riesgo:
          'Se compra lo más barato por m² y se paga dos veces la instalación dentro del mismo ciclo.',
        evidencia: 'mallas-antiafidas-densidad-trama-ventilacion',
        peso: 1,
      },
      {
        id: 'ciclo-termico',
        pregunta: '¿Se previó la holgura por dilatación y contracción térmica?',
        porQue:
          'Una lámina anclada tensada en la hora más fría queda a tracción permanente cuando el sol la calienta y luego se contrae.',
        riesgo:
          'La falla no aparece en la entrega: aparece entre el tercer y el sexto mes y se diagnostica mal como defecto de fábrica.',
        evidencia: 'instalacion-geomembranas-hdpe-pozas-canales',
        peso: 2,
      },
      {
        id: 'almacenamiento',
        pregunta: '¿Cuánto tiempo estará el material almacenado a la intemperie antes de usarse?',
        porQue:
          'El polipropileno con tratamiento UV tiene una vida de exposición finita, que empieza a consumirse en el patio, no en la operación.',
        riesgo:
          'El material llega degradado a la puesta en servicio sin que nada se vea a simple vista.',
        evidencia: 'big-bags-mineria-peru-normativa-errores-estiba',
        peso: 1,
      },
    ],
  },
  {
    id: 'ejecucion',
    nombre: 'Ejecución e instalación',
    resumen: 'Quién lo instala, sobre qué, y cómo se verifica.',
    intro:
      'Un material bien especificado y mal instalado rinde peor que uno más modesto bien instalado. La ejecución no es la última etapa del proyecto: es la variable que más determina el resultado.',
    criterios: [
      {
        id: 'base',
        pregunta: '¿Está definida y aceptada la subrasante o base de apoyo?',
        porQue:
          'La superficie debe estar compactada, uniforme y libre de material orgánico y piedra angular. Si no cumple, la respuesta correcta es corregir el terreno o proteger con geotextil.',
        riesgo:
          'Punzonamiento desde abajo. El daño se manifiesta cuando la carga presiona la lámina contra el terreno, con la obra ya recibida.',
        evidencia: 'instalacion-geomembranas-hdpe-pozas-canales',
        peso: 2,
      },
      {
        id: 'ensayos',
        pregunta: '¿Hay plan de ensayos de unión, con registro por costura?',
        porQue:
          'La costura de cuña doble se ensaya presurizando su canal de aire; la soldadura por extrusión, con caja de vacío. Son ensayos distintos para uniones distintas.',
        riesgo:
          'Una costura sin registro de ensayo es una costura no ejecutada, por bien que se vea. La filtración aparece meses después.',
        evidencia: 'instalacion-geomembranas-hdpe-pozas-canales',
        peso: 2,
      },
      {
        id: 'anclaje',
        pregunta: '¿Está resuelto el sistema de anclaje o amarre, verificado a extracción?',
        porQue:
          'Anclar sobre losa, sobre terreno natural o con lastre son tres proyectos distintos, y la succión hace trabajar los anclajes a extracción, no a compresión.',
        riesgo:
          'Falla el punto de amarre antes que el material. Es el modo de falla más frecuente en coberturas textiles.',
        evidencia: 'carpas-industriales-carga-viento-norma-e020',
        peso: 2,
      },
      {
        id: 'manipulacion',
        pregunta: '¿Quién lo coloca, en cuánto tiempo y con cuántas personas?',
        porQue:
          'Un elemento que exige demasiado tiempo o demasiada gente terminará mal colocado en la práctica, sobre todo con unidades esperando.',
        riesgo:
          'La holgura que deja una colocación apurada es exactamente la que dispara el aleteo y el desgarro.',
        evidencia: 'cobertores-transporte-concentrado-mineral',
        peso: 1,
      },
      {
        id: 'medicion-real',
        pregunta: '¿La verificación se hará donde importa, y no donde es cómodo medir?',
        porQue:
          'En ventilación, la medición válida es el caudal en el frente de trabajo, no en la boca del ventilador.',
        riesgo:
          'El sistema se declara conforme con una medición que no representa la condición del trabajador.',
        evidencia: 'calculo-caudal-mangas-ventilacion-mina-subterranea',
        peso: 1,
      },
    ],
  },
  {
    id: 'documentacion',
    nombre: 'Documentación y trazabilidad',
    resumen: 'Qué papeles exige el destino, y cuándo se piden.',
    intro:
      'La documentación no es burocracia: es un requisito de ingreso en terminales y en clientes de exportación. Pedirla en la cotización cuesta un correo; pedirla con el contenedor en camino cuesta el embarque.',
    criterios: [
      {
        id: 'certificacion-destino',
        pregunta: '¿El destino exige certificación de fabricación por lote?',
        porQue:
          'APM Terminals Callao comunicó que desde el 1 de enero de 2023 los bolsones deben contar con certificación conforme a ISO 21898:2004, junto con las disposiciones de seguridad y salud en puertos de la OIT.',
        riesgo:
          'La carga llega al terminal sin el documento y el problema aparece en el punto donde es más caro resolverlo.',
        evidencia: 'big-bags-mineria-peru-normativa-errores-estiba',
        peso: 2,
      },
      {
        id: 'clasificacion-peligrosa',
        pregunta: '¿El material transportado está clasificado como mercancía peligrosa?',
        porQue:
          'El transporte terrestre de materiales y residuos peligrosos se rige por el D.S. 021-2008-MTC, y algunos concentrados quedan comprendidos según su composición.',
        riesgo:
          'El sistema de contención se especifica como si fuera una tapa y no como parte de un conjunto sujeto a reglamento.',
        evidencia: 'cobertores-transporte-concentrado-mineral',
        peso: 1,
      },
      {
        id: 'ficha-lote',
        pregunta: '¿Se exigirá ficha técnica y certificado de lote del fabricante?',
        porQue:
          'Las líneas técnicas se entregan con la ficha y el certificado del fabricante. Un proveedor que no puede entregarlos está declarando algo sobre su cadena de suministro.',
        riesgo:
          'Se acepta una declaración verbal y no queda nada que presentar cuando el cliente final o la auditoría lo pide.',
        peso: 2,
      },
      {
        id: 'as-built',
        pregunta: 'En obra instalada, ¿se recibirá plano as-built y registro de reparaciones?',
        porQue:
          'El as-built de paneles con la ubicación de cada reparación es lo que permite diagnosticar una filtración años después sin excavar a ciegas.',
        riesgo:
          'Ante una falla, no hay forma de saber qué se reparó ni dónde, y el diagnóstico se vuelve una excavación exploratoria.',
        evidencia: 'instalacion-geomembranas-hdpe-pozas-canales',
        peso: 1,
      },
    ],
  },
  {
    id: 'operacion',
    nombre: 'Operación y mantenimiento',
    resumen: 'Qué pasa después de la entrega.',
    intro:
      'La entrega no es el final del proyecto sino el principio de su vida útil. Casi todas las fallas evitables se detectan en una inspección que nadie tenía asignada.',
    criterios: [
      {
        id: 'inspeccion',
        pregunta: '¿Hay una rutina de inspección definida, con responsable y frecuencia?',
        porQue:
          'Los daños superficiales suelen ser reparables si se detectan a tiempo; el mismo daño ignorado termina en reemplazo.',
        riesgo:
          'La primera vez que alguien mira el elemento es cuando ya falló.',
        evidencia: 'tanques-flexibles-almacenamiento-agua-operaciones-remotas',
        peso: 2,
      },
      {
        id: 'reparacion',
        pregunta: '¿Existe procedimiento y kit de reparación en sitio?',
        porQue:
          'En operaciones remotas, la diferencia entre una reparación de una hora y una parada de semanas es tener el kit y el procedimiento antes de necesitarlos.',
        riesgo:
          'Un daño menor obliga a detener la operación hasta que llegue un especialista desde Lima.',
        peso: 1,
      },
      {
        id: 'reposicion',
        pregunta: '¿Está previsto el criterio de reemplazo y el plazo de reposición?',
        porQue:
          'Los elementos a medida tienen plazo de fabricación. Saber cuándo pedir el reemplazo evita operar con material degradado.',
        riesgo:
          'Se opera con el elemento vencido porque el reemplazo se pidió cuando ya había fallado.',
        peso: 1,
      },
      {
        id: 'procedimiento-emergencia',
        pregunta: '¿Quién actúa ante una alerta (viento, lluvia, evento) y con qué criterio?',
        porQue:
          'Una cobertura destensada aletea y fatiga sus propios amarres; el cierre ante alerta debe tener responsable y tiempo objetivo.',
        riesgo:
          'La decisión se toma durante el evento, que es cuando peor se decide.',
        evidencia: 'carpas-industriales-carga-viento-norma-e020',
        peso: 1,
      },
    ],
  },
];

/** Todos los criterios en una lista plana. */
export const allCriteria = (): (Criterion & { pillar: PillarId })[] =>
  pillars.flatMap((p) => p.criterios.map((c) => ({ ...c, pillar: p.id })));

export const totalCriteria = () => allCriteria().length;

export const maxScore = () =>
  allCriteria().reduce((n, c) => n + c.peso, 0);

/** Verifica que la evidencia citada exista realmente en el silo de guías. */
export const evidenceExists = (slug: string) => articles.some((a) => a.slug === slug);

/**
 * Nivel de definición del proyecto. NO puntúa al proveedor ni al producto:
 * puntúa cuánta información existe para especificar sin adivinar.
 */
export function nivel(porcentaje: number): { etiqueta: string; detalle: string } {
  if (porcentaje >= 85)
    return {
      etiqueta: 'Definido',
      detalle:
        'El proyecto tiene la información necesaria para una especificación firme. Una cotización sobre esta base es comparable entre proveedores.',
    };
  if (porcentaje >= 60)
    return {
      etiqueta: 'Avanzado',
      detalle:
        'Falta cerrar algunos criterios. Conviene resolverlos antes de comparar cotizaciones: sin ellos, dos propuestas con precios distintos pueden no ser la misma cosa.',
    };
  if (porcentaje >= 35)
    return {
      etiqueta: 'Preliminar',
      detalle:
        'Hay definiciones importantes pendientes. Cotizar ahora produce números orientativos que cambiarán al concretar el alcance.',
    };
  return {
    etiqueta: 'Exploratorio',
    detalle:
      'El proyecto está en fase de exploración. Es un punto de partida legítimo: conviene resolver primero los criterios críticos de cada pilar.',
  };
}
