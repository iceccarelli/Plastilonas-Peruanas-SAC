#!/usr/bin/env bash
# =============================================================================
# P10 — MARCO DE ESPECIFICACIÓN: publicar el estándar del rubro
#
# Plastilonas Peruanas SAC. Aplica sobre main en 4f88d16 o posterior.
#
# La jugada de AWS que de verdad transfiere no es el blog ni la documentación:
# es el Well-Architected Framework. Convirtieron su criterio en la vara con la
# que la industria se mide, y desde entonces los competidores describen sus
# arquitecturas con el vocabulario de AWS. Quien publica el estándar deja de
# competir dentro de la comparación y pasa a ser el eje sobre el que ocurre.
#
# Aquí el estándar ya existía sin estar escrito: las 10 guías técnicas
# documentan modos de falla —el bolsón izado con dos asas, la geomembrana
# anclada tensada, la manga aspirante sin refuerzo, la malla cerrada sin
# ampliar la ventilación— y todos comparten el mismo patrón: los proyectos no
# fallan por el material, fallan por lo que nadie definió.
#
# Este parche publica ese patrón como 26 criterios en 6 pilares (/marco) y
# añade una autoevaluación (/marco/evaluacion) que puntúa cuán definido está
# el proyecto del cliente y genera un brief técnico descargable.
#
# Decisión deliberada: la evaluación NO pide datos personales y NO envía nada
# a un servidor; el PDF se arma en el navegador. Un comprador técnico solo
# responde con franqueza sobre lo que no tiene definido si esa confesión no se
# convierte en una lista de llamadas. El lead llega igual, y mejor: quien
# escribe por WhatsApp al terminar lo hace con su brief en la mano.
#
# Uso:   bash apply-p10-marco.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Creando directorios"
mkdir -p app/marco/evaluacion

echo "==> Escribiendo lib/framework.ts"
cat > 'lib/framework.ts' <<'PP_EOF'
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
PP_EOF

echo "==> Escribiendo lib/framework-score.ts"
cat > 'lib/framework-score.ts' <<'PP_EOF'
import { pillars, nivel, type PillarId } from './framework';

/**
 * PUNTUACIÓN DEL MARCO — lógica pura, sin dependencias pesadas.
 *
 * Vive separada de lib/framework-brief.ts a propósito: ese módulo importa
 * pdf-lib, y tenerlo en el mismo archivo metía ~210 kB de JavaScript en la
 * carga inicial de la evaluación, para una librería que solo hace falta si el
 * usuario decide descargar el PDF. Aquí queda lo que la página necesita desde
 * el primer render; el generador se carga bajo demanda.
 */

export type Answer = 'si' | 'no' | 'nose';
export type Answers = Record<string, Answer>;

export interface PillarScore {
  id: PillarId;
  nombre: string;
  obtenido: number;
  posible: number;
  porcentaje: number;
  pendientes: { pregunta: string; riesgo: string; critico: boolean }[];
}

export interface BriefResult {
  porcentaje: number;
  obtenido: number;
  posible: number;
  nivel: ReturnType<typeof nivel>;
  porPilar: PillarScore[];
}

/**
 * Puntúa las respuestas. "No sé" cuenta igual que "no": el objetivo es medir
 * qué está DEFINIDO, y un dato que nadie conoce no está definido.
 */
export function scoreAnswers(answers: Answers): BriefResult {
  const porPilar: PillarScore[] = pillars.map((p) => {
    let obtenido = 0;
    let posible = 0;
    const pendientes: PillarScore['pendientes'] = [];
    for (const c of p.criterios) {
      posible += c.peso;
      if (answers[c.id] === 'si') obtenido += c.peso;
      else pendientes.push({ pregunta: c.pregunta, riesgo: c.riesgo, critico: c.peso === 2 });
    }
    return {
      id: p.id,
      nombre: p.nombre,
      obtenido,
      posible,
      porcentaje: posible ? Math.round((obtenido / posible) * 100) : 0,
      pendientes,
    };
  });

  const obtenido = porPilar.reduce((n, p) => n + p.obtenido, 0);
  const posible = porPilar.reduce((n, p) => n + p.posible, 0);
  const porcentaje = posible ? Math.round((obtenido / posible) * 100) : 0;
  return { porcentaje, obtenido, posible, nivel: nivel(porcentaje), porPilar };
}
PP_EOF

echo "==> Escribiendo lib/framework-brief.ts"
cat > 'lib/framework-brief.ts' <<'PP_EOF'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { toWinAnsi } from './pdf-text';
import { FRAMEWORK_VERSION } from './framework';
import type { BriefResult } from './framework-score';

/**
 * BRIEF DE ESPECIFICACIÓN — el entregable de la autoevaluación.
 *
 * Se genera EN EL NAVEGADOR: las respuestas nunca salen del dispositivo del
 * usuario. Eso no es solo privacidad, es la razón por la que un comprador
 * técnico se anima a responder con franqueza sobre lo que su proyecto todavía
 * no tiene definido.
 *
 * La lógica de puntuación vive en lib/framework-score.ts para que esta
 * dependencia (pdf-lib) se cargue solo cuando el usuario pide el PDF.
 *
 * El documento sirve para llevarlo a una reunión interna: lista lo que está
 * definido, lo que falta y por qué importa. Lleva nuestra marca porque lo
 * generamos, no porque lo condicione: es útil aunque el proyecto se compre a
 * otro proveedor.
 */

const MARGIN = 50;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const AZUL = rgb(0.039, 0.145, 0.251);
const VERDE = rgb(0.02, 0.588, 0.412);
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.88, 0.89, 0.91);
const AMBAR = rgb(0.85, 0.47, 0.02);

interface Ctx { doc: PDFDocument; page: PDFPage; y: number; regular: PDFFont; bold: PDFFont }

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const cand = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(cand, size) <= maxWidth) current = cand;
    else { if (current) lines.push(current); current = w; }
  }
  if (current) lines.push(current);
  return lines;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 40) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - MARGIN;
  }
}

function para(ctx: Ctx, text: string, size = 9.5, color = AZUL) {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color });
    ctx.y -= size + 3.5;
  }
}

export async function buildBriefPdf(
  result: BriefResult,
  proyecto: string,
  generatedAt: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle(toWinAnsi(`Brief de especificación - ${proyecto || 'Proyecto'}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject('Autoevaluación contra el Marco de Especificación Plastilonas');

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };

  // Cabecera
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 92, width: PAGE_W, height: 92, color: AZUL });
  ctx.page.drawText('BRIEF DE ESPECIFICACIÓN', {
    x: MARGIN, y: PAGE_H - 38, size: 15, font: bold, color: rgb(1, 1, 1),
  });
  ctx.page.drawText(
    toWinAnsi(`Marco de Especificación ${SITE.name} v${FRAMEWORK_VERSION}  |  ${generatedAt}`),
    { x: MARGIN, y: PAGE_H - 56, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.page.drawText(toWinAnsi(`RUC ${SITE.ruc}  |  WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.url}`), {
    x: MARGIN, y: PAGE_H - 72, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.y = PAGE_H - 122;

  if (proyecto.trim()) {
    ctx.page.drawText(toWinAnsi(proyecto.trim()), { x: MARGIN, y: ctx.y, size: 14, font: bold, color: AZUL });
    ctx.y -= 24;
  }

  // Resultado
  ctx.page.drawText(
    toWinAnsi(`Nivel de definición: ${result.nivel.etiqueta}  (${result.porcentaje}%)`),
    { x: MARGIN, y: ctx.y, size: 12, font: bold, color: VERDE },
  );
  ctx.y -= 18;
  para(ctx, result.nivel.detalle);
  ctx.y -= 6;
  para(
    ctx,
    'Este documento puntúa cuánta información existe para especificar sin adivinar. No evalúa proveedores ni productos.',
    8.5,
    GRIS,
  );
  ctx.y -= 10;

  // Barras por pilar
  ctx.page.drawText('RESULTADO POR PILAR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 14;
  for (const p of result.porPilar) {
    ensure(ctx, 26);
    const anchoTotal = 220;
    ctx.page.drawText(toWinAnsi(p.nombre), { x: MARGIN, y: ctx.y, size: 9, font: regular, color: AZUL });
    ctx.page.drawRectangle({
      x: MARGIN + 250, y: ctx.y - 2, width: anchoTotal, height: 8, color: GRIS_CLARO,
    });
    ctx.page.drawRectangle({
      x: MARGIN + 250, y: ctx.y - 2, width: (anchoTotal * p.porcentaje) / 100, height: 8,
      color: p.porcentaje >= 60 ? VERDE : AMBAR,
    });
    ctx.page.drawText(`${p.porcentaje}%`, {
      x: MARGIN + 250 + anchoTotal + 8, y: ctx.y, size: 8.5, font: bold, color: GRIS,
    });
    ctx.y -= 18;
  }
  ctx.y -= 10;

  // Pendientes
  ctx.page.drawText('CRITERIOS POR CERRAR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 14;

  const conPendientes = result.porPilar.filter((p) => p.pendientes.length);
  if (!conPendientes.length) {
    para(ctx, 'No quedan criterios pendientes. El proyecto está listo para una especificación firme.');
  }
  for (const p of conPendientes) {
    ensure(ctx, 30);
    ctx.page.drawText(toWinAnsi(p.nombre.toUpperCase()), {
      x: MARGIN, y: ctx.y, size: 8.5, font: bold, color: GRIS,
    });
    ctx.y -= 14;
    for (const pend of p.pendientes) {
      const marca = pend.critico ? '[CRITICO] ' : '';
      for (const line of wrap(marca + pend.pregunta, bold, 9, PAGE_W - MARGIN * 2 - 12)) {
        ensure(ctx, 13);
        ctx.page.drawText(line, {
          x: MARGIN + 12, y: ctx.y, size: 9, font: bold,
          color: pend.critico ? AMBAR : AZUL,
        });
        ctx.y -= 12;
      }
      for (const line of wrap(pend.riesgo, regular, 8.5, PAGE_W - MARGIN * 2 - 12)) {
        ensure(ctx, 12);
        ctx.page.drawText(line, { x: MARGIN + 12, y: ctx.y, size: 8.5, font: regular, color: GRIS });
        ctx.y -= 11;
      }
      ctx.y -= 5;
    }
    ctx.y -= 4;
  }

  // Cierre
  ensure(ctx, 60);
  ctx.y -= 8;
  ctx.page.drawText('CÓMO SEGUIR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 16;
  para(
    ctx,
    `Lleve este brief a su equipo técnico y cierre primero los criterios marcados como críticos: son los que cambian la especificación, no solo el precio. Cuando estén resueltos, una cotización sobre esta base es comparable entre proveedores.`,
  );
  ctx.y -= 4;
  para(
    ctx,
    `Si quiere que revisemos su caso: WhatsApp ${SITE.phoneWhatsApp}, ${SITE.url}/cotizacion o ${SITE.email}. El marco completo, con la guía técnica que respalda cada criterio, está en ${SITE.url}/marco.`,
  );

  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(toWinAnsi(`${SITE.url}/marco  |  Generado en su navegador: sus respuestas no se enviaron a ningún servidor`), {
      x: MARGIN, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
  });

  return doc.save();
}
PP_EOF

echo "==> Escribiendo lib/pdf-text.ts"
cat > 'lib/pdf-text.ts' <<'PP_EOF'
/**
 * Saneado de texto para las fuentes estándar de PDF (WinAnsi).
 *
 * Vive en su propio módulo porque lo usan tanto la ficha técnica (servidor,
 * junto al catálogo completo) como el brief del marco (navegador). Importarlo
 * desde lib/datasheet.ts arrastraría las 1600 líneas del catálogo al bundle
 * del cliente.
 *
 * WinAnsi cubre el español (acentos y ñ) pero NO los signos tipográficos que
 * usamos en la web: sin esta conversión, pdf-lib lanza excepción al primer
 * guion largo y el documento no se genera.
 */
export function toWinAnsi(text: string): string {
  return text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[→➡]/g, '->')
    .replace(/·/g, '-')
    .replace(/•/g, '-')
    .replace(/ /g, ' ')
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/º/g, 'o')
    .replace(/[^\x00-\xFF]/g, '');
}
PP_EOF

echo "==> Escribiendo lib/datasheet.ts"
cat > 'lib/datasheet.ts' <<'PP_EOF'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Product } from './types';
import { SITE } from './site';
import { sourcingLabels, availabilityLabels } from './products';
import { toWinAnsi } from './pdf-text';

/**
 * FICHA TÉCNICA EN PDF, GENERADA DESDE EL CATÁLOGO.
 *
 * Por qué existe: en una compra industrial el comprador técnico no decide solo;
 * tiene que llevar el documento a ingeniería, a calidad y a logística. Un PDF
 * descargable con las especificaciones reales es el activo que circula dentro
 * de la empresa del cliente cuando nosotros ya no estamos en la conversación.
 *
 * Por qué se GENERA y no se sube a mano: 36 fichas mantenidas manualmente se
 * desincronizan del catálogo a la primera corrección. Aquí el PDF se construye
 * desde `lib/products.ts`, de modo que corregir una especificación en el
 * catálogo corrige también el documento en el siguiente despliegue.
 *
 * REGLA DE HONESTIDAD: el PDF no declara precio, ni certificaciones, ni ensayos
 * que el catálogo no contenga. Si `documentation` no existe, no se inventa una
 * línea de documentación; se indica que se entrega con la cotización.
 */

const MARGIN = 50;
const PAGE_W = 595.28; // A4 en puntos
const PAGE_H = 841.89;
const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
const VERDE = rgb(0.020, 0.588, 0.412); // #059669
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.88, 0.89, 0.91);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

function heading(ctx: Ctx, text: string): void {
  ensure(ctx, 34);
  ctx.y -= 20;
  ctx.page.drawText(toWinAnsi(text.toUpperCase()), {
    x: MARGIN, y: ctx.y, size: 9, font: ctx.bold, color: VERDE,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 12;
}

function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

function bullets(ctx: Ctx, items: string[], size = 9.5): void {
  for (const item of items) {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 14);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText('-', { x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 14, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  }
}

function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
  const size = 9;
  const labelW = 150;
  const valueW = PAGE_W - MARGIN * 2 - labelW - 10;
  for (const row of rows) {
    const valueLines = wrap(row.value, ctx.regular, size, valueW);
    const labelLines = wrap(row.label, ctx.bold, size, labelW);
    const height = Math.max(valueLines.length, labelLines.length) * (size + 3) + 6;
    ensure(ctx, height);
    const top = ctx.y;
    labelLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN, y: top - i * (size + 3), size, font: ctx.bold, color: GRIS,
      });
    });
    valueLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN + labelW + 10, y: top - i * (size + 3), size, font: ctx.regular, color: AZUL,
      });
    });
    ctx.y = top - height + 2;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y + 4 }, end: { x: PAGE_W - MARGIN, y: ctx.y + 4 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    ctx.y -= 6;
  }
}

/**
 * Construye la ficha técnica de un producto.
 *
 * @param product Producto del catálogo.
 * @param generatedAt Fecha del documento. Se inyecta para que el resultado sea
 *   determinista en los tests y estable entre despliegues del mismo contenido.
 */
export async function buildDatasheetPdf(
  product: Product,
  generatedAt: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`Ficha técnica - ${product.name} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(product.shortDescription));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords([product.category, ...product.sector, 'Perú', 'ficha técnica'].map(toWinAnsi));

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };

  // --- Cabecera -------------------------------------------------------------
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: rgb(1, 1, 1),
  });
  ctx.page.drawText(toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`), {
    x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.page.drawText(toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`), {
    x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.y = PAGE_H - 130;

  // --- Título ---------------------------------------------------------------
  for (const line of wrap(product.name, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(`${product.category}  |  Ficha técnica`), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

  heading(ctx, 'Descripción');
  paragraph(ctx, product.description);

  if (product.specifications.length) {
    heading(ctx, 'Especificaciones técnicas');
    specTable(ctx, product.specifications);
  }

  if (product.applications.length) {
    heading(ctx, 'Aplicaciones');
    bullets(ctx, product.applications);
  }

  if (product.benefits.length) {
    heading(ctx, 'Beneficios');
    bullets(ctx, product.benefits);
  }

  // --- Estado de la oferta: dato real del catálogo, no marketing ------------
  heading(ctx, 'Suministro');
  const suministro: { label: string; value: string }[] = [];
  if (product.sourcing) {
    suministro.push({ label: 'Origen', value: sourcingLabels[product.sourcing] ?? product.sourcing });
  }
  const disp = product.availability ?? 'a_medida';
  suministro.push({ label: 'Disponibilidad', value: availabilityLabels[disp] ?? disp });
  if (product.leadTime) suministro.push({ label: 'Plazo referencial', value: product.leadTime });
  if (product.sustainability) suministro.push({ label: 'Materiales', value: product.sustainability });
  suministro.push({
    label: 'Documentación',
    value: product.documentation ?? 'Ficha técnica y certificado del fabricante se entregan con la cotización.',
  });
  suministro.push({ label: 'Sectores', value: product.sector.join(', ') });
  specTable(ctx, suministro);

  heading(ctx, 'Cómo cotizar');
  paragraph(
    ctx,
    `No publicamos precio de lista para este producto: se cotiza según medidas, cantidad, especificación y ciudad de entrega. Escriba por WhatsApp al ${SITE.phoneWhatsApp}, use el formulario en ${SITE.url}/cotizacion o escriba a ${SITE.email}.`,
  );
  paragraph(
    ctx,
    'Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.',
  );

  // --- Pie en todas las páginas --------------------------------------------
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(
      toWinAnsi(`${SITE.url}/productos/${product.slug}  |  Documento generado el ${generatedAt}`),
      { x: MARGIN, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS },
    );
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
  });

  return doc.save();
}
PP_EOF

echo "==> Escribiendo lib/analytics.ts"
cat > 'lib/analytics.ts' <<'PP_EOF'
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
PP_EOF

echo "==> Escribiendo components/TrackView.tsx"
cat > 'components/TrackView.tsx' <<'PP_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
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
  | { kind: 'framework'; slug: string };

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
    }
  }, [props]);

  return null;
}
PP_EOF

echo "==> Escribiendo app/marco/page.tsx"
cat > 'app/marco/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  pillars,
  totalCriteria,
  FRAMEWORK_VERSION,
  FRAMEWORK_UPDATED,
} from '@/lib/framework';
import { articleBySlug } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Marco de Especificación Plastilonas — el documento público.
 *
 * Es el peldaño que ningún competidor del rubro ocupa: no vende un producto,
 * publica el criterio con el que se juzga cualquier proyecto del rubro. Quien
 * adopta el vocabulario de un marco termina comparando dentro de él.
 *
 * Sigue siendo honesto porque es útil aunque el proyecto se compre a otro: los
 * criterios describen decisiones de ingeniería, no ventajas nuestras.
 */

const URL = `${SITE.url}/marco`;
const TITLE = 'Marco de Especificación: 6 pilares para definir un proyecto textil industrial';
const DESCRIPTION = `Criterios públicos para especificar big bags, geomembranas, coberturas y ventilación antes de cotizar: compatibilidad, cargas, exposición, ejecución, documentación y operación. ${totalCriteria()} criterios verificables con su fuente.`;

const FAQS = [
  {
    q: '¿Qué es el Marco de Especificación Plastilonas?',
    a: `Un conjunto público de ${totalCriteria()} criterios, agrupados en seis pilares, para definir un proyecto de solución textil o geosintética antes de pedir precio. Cada criterio indica qué decide técnicamente y qué ocurre en obra cuando el dato no existe.`,
  },
  {
    q: '¿Sirve si finalmente compro a otro proveedor?',
    a: 'Sí, y está escrito para que así sea. Los criterios describen decisiones de ingeniería, no ventajas comerciales nuestras. Un proyecto bien definido recibe cotizaciones comparables entre sí, que es exactamente lo que un comprador técnico necesita.',
  },
  {
    q: '¿De dónde salen los criterios?',
    a: 'De los modos de falla documentados en nuestras guías técnicas, cada una con su fuente citada: la Norma E.020 para cargas de viento, ISO 21898 y el requisito de APM Terminals Callao para big bags, las prácticas de ensayo de costura para geomembranas, y el reglamento de seguridad minera para ventilación.',
  },
  {
    q: '¿La autoevaluación puntúa a los proveedores?',
    a: 'No. Puntúa cuán definido está su proyecto, es decir, cuánta información existe para especificar sin adivinar. No compara marcas ni productos.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/marco' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'article',
  },
};

export default function MarcoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="framework" slug="marco" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Marco de Especificación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Pilares del Marco de Especificación',
            items: pillars.map((p) => ({ name: p.nombre, url: `${URL}#${p.id}` })),
          }),
          faqSchema(FAQS, URL),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <span className="text-gray-700">Marco de Especificación</span>
      </nav>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#059669]">
        <ShieldCheck className="h-3.5 w-3.5" /> Versión {FRAMEWORK_VERSION} · {FRAMEWORK_UPDATED}
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        Marco de Especificación: seis pilares para definir un proyecto antes de cotizarlo
      </h1>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        <p>
          Los proyectos de esta industria rara vez fallan por el material. Fallan por lo
          que nadie definió: la densidad del contenido, la succión en sotavento, la
          holgura térmica, quién firma la recepción de subrasante, qué certificado exige
          el terminal. El material se lleva la culpa mucho después.
        </p>
        <p>
          Este marco reúne {totalCriteria()} criterios en seis pilares. Cada uno indica
          qué decide técnicamente y qué ocurre en obra cuando el dato no existe, con la
          guía que lo documenta. Está escrito para ser útil aunque el proyecto se compre
          a otro proveedor — un proyecto bien definido recibe cotizaciones comparables,
          y eso es lo que necesita un comprador técnico.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-7 py-3.5 font-semibold text-white hover:bg-[#059669]"
        >
          Evaluar mi proyecto <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-7 py-3.5 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
        >
          Ver las guías que lo respaldan
        </Link>
      </div>

      {/* Índice de pilares */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Los seis pilares
        </h2>
        <ol className="space-y-2 text-sm">
          {pillars.map((p, i) => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {p.nombre} — <span className="text-gray-500">{p.resumen}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {pillars.map((p, i) => (
        <section key={p.id} id={p.id} className="mb-14 scroll-mt-24">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {i + 1}. {p.nombre}
          </h2>
          <p className="mb-6 text-gray-700">{p.intro}</p>

          <div className="space-y-5">
            {p.criterios.map((c) => {
              const guia = c.evidencia ? articleBySlug(c.evidencia) : undefined;
              return (
                <div key={c.id} className="rounded-2xl border border-gray-100 p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold text-[#0A2540]">{c.pregunta}</h3>
                    {c.peso === 2 && (
                      <span className="shrink-0 rounded-full bg-[#059669]/10 px-3 py-1 text-xs font-semibold text-[#059669]">
                        Crítico
                      </span>
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-600">Qué decide</dt>
                      <dd className="text-gray-700">{c.porQue}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">Si el dato no existe</dt>
                      <dd className="text-gray-700">{c.riesgo}</dd>
                    </div>
                  </dl>
                  {guia && (
                    <Link
                      href={`/recursos/${guia.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
                    >
                      Guía que lo documenta: {guia.metaTitle} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Evalúe su proyecto contra los {totalCriteria()} criterios
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Toma unos minutos, no pide datos personales y genera un brief técnico
          descargable con los criterios que le faltan por cerrar.
        </p>
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
        >
          Comenzar la evaluación <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/marco/evaluacion/page.tsx"
cat > 'app/marco/evaluacion/page.tsx' <<'PP_EOF'
'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Download, FileText, RotateCcw } from 'lucide-react';
import { pillars, totalCriteria } from '@/lib/framework';
import { scoreAnswers, type Answer, type Answers } from '@/lib/framework-score';
import {
  trackBriefDownload,
  trackFrameworkCompleted,
  trackFrameworkStarted,
} from '@/lib/analytics';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * Autoevaluación contra el Marco de Especificación.
 *
 * Decisión de diseño deliberada: NO pide datos personales y NO envía nada a un
 * servidor. El PDF se genera en el navegador. Un comprador técnico responde con
 * franqueza sobre lo que su proyecto todavía no tiene definido solo si sabe que
 * esa confesión no se convierte en una lista de llamadas.
 *
 * El resultado comercial llega igual, y mejor: quien termina la evaluación y
 * escribe por WhatsApp lo hace con su brief en la mano.
 */

const CRITERIOS = pillars.flatMap((p) => p.criterios.map((c) => ({ ...c, pilar: p })));

const OPCIONES: { valor: Answer; etiqueta: string; ayuda: string }[] = [
  { valor: 'si', etiqueta: 'Sí, está definido', ayuda: 'Tengo el dato o la decisión tomada' },
  { valor: 'no', etiqueta: 'No, aún no', ayuda: 'Falta definirlo' },
  { valor: 'nose', etiqueta: 'No lo sé', ayuda: 'Habría que averiguarlo' },
];

export default function EvaluacionPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [proyecto, setProyecto] = useState('');
  const [terminado, setTerminado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const empezado = useRef(false);

  const respondidos = Object.keys(answers).length;
  const resultado = useMemo(() => scoreAnswers(answers), [answers]);

  const responder = (id: string, valor: Answer) => {
    if (!empezado.current) {
      empezado.current = true;
      trackFrameworkStarted();
    }
    setAnswers((prev) => ({ ...prev, [id]: valor }));
  };

  const finalizar = () => {
    setTerminado(true);
    trackFrameworkCompleted(resultado.porcentaje, resultado.nivel.etiqueta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const descargar = async () => {
    setGenerando(true);
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      // Carga diferida: pdf-lib pesa ~210 kB y solo hace falta si el usuario
      // decide descargar. Sin esto viajaba en la carga inicial de la página.
      const { buildBriefPdf } = await import('@/lib/framework-brief');
      const bytes = await buildBriefPdf(resultado, proyecto, fecha);
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brief-especificacion-${fecha}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      trackBriefDownload(resultado.nivel.etiqueta);
    } finally {
      setGenerando(false);
    }
  };

  const reiniciar = () => {
    setAnswers({});
    setTerminado(false);
    empezado.current = false;
  };

  const mensajeWhatsApp =
    `Hola, completé la autoevaluación del Marco de Especificación. ` +
    `Nivel: ${resultado.nivel.etiqueta} (${resultado.porcentaje}%).` +
    (proyecto.trim() ? ` Proyecto: ${proyecto.trim()}.` : '') +
    ` Quisiera revisar los criterios que me faltan.`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <Link href="/marco" className="hover:text-[#059669]">Marco de Especificación</Link>{' '}
        / <span className="text-gray-700">Evaluación</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Evalúe la definición de su proyecto
      </h1>
      <p className="mb-2 text-lg text-gray-700">
        {totalCriteria()} criterios en seis pilares. Mide cuánta información existe para
        especificar sin adivinar — no evalúa proveedores ni productos.
      </p>
      <p className="mb-8 text-sm text-gray-500">
        No pedimos datos personales y sus respuestas no se envían a ningún servidor: el
        brief se genera en su propio navegador.
      </p>

      {terminado && (
        <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
          <div className="mb-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
            Nivel de definición
          </div>
          <div className="mb-3 text-3xl font-semibold tracking-tight text-[#0A2540]">
            {resultado.nivel.etiqueta} · {resultado.porcentaje}%
          </div>
          <p className="mb-6 text-gray-800">{resultado.nivel.detalle}</p>

          <div className="mb-6 space-y-2">
            {resultado.porPilar.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-56 shrink-0 text-sm text-gray-700">{p.nombre}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <span
                    className={`block h-full rounded-full ${p.porcentaje >= 60 ? 'bg-[#059669]' : 'bg-amber-500'}`}
                    style={{ width: `${p.porcentaje}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-sm font-medium text-gray-600">
                  {p.porcentaje}%
                </span>
              </div>
            ))}
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="proyecto">
            Nombre del proyecto (opcional, solo aparece en su PDF)
          </label>
          <input
            id="proyecto"
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            placeholder="Ej.: Poza de proceso — Unidad Arequipa"
            className="form-input mb-5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-[#059669]"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={descargar}
              disabled={generando}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-7 py-3.5 font-semibold text-white hover:bg-[#059669] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {generando ? 'Generando…' : 'Descargar brief (PDF)'}
            </button>
            <WhatsAppLink
              context={`marco:${resultado.nivel.etiqueta.toLowerCase()}`}
              message={mensajeWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-7 py-3.5 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
            >
              Revisar los pendientes con un especialista
            </WhatsAppLink>
            <button
              onClick={reiniciar}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-500 hover:text-[#059669]"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
        <FileText className="h-5 w-5 shrink-0 text-[#059669]" />
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <span
            className="block h-full rounded-full bg-[#059669] transition-all"
            style={{ width: `${Math.round((respondidos / CRITERIOS.length) * 100)}%` }}
          />
        </span>
        <span className="shrink-0 text-sm font-medium text-gray-600">
          {respondidos} / {CRITERIOS.length}
        </span>
      </div>

      {pillars.map((p, i) => (
        <section key={p.id} className="mb-10">
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {i + 1}. {p.nombre}
          </h2>
          <p className="mb-5 text-sm text-gray-600">{p.resumen}</p>

          <div className="space-y-4">
            {p.criterios.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gray-100 p-5">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-medium text-[#0A2540]">{c.pregunta}</h3>
                  {c.peso === 2 && (
                    <span className="shrink-0 rounded-full bg-[#059669]/10 px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                      Crítico
                    </span>
                  )}
                </div>
                <p className="mb-4 text-sm text-gray-600">{c.porQue}</p>
                <div className="flex flex-wrap gap-2">
                  {OPCIONES.map((o) => {
                    const activo = answers[c.id] === o.valor;
                    return (
                      <button
                        key={o.valor}
                        onClick={() => responder(c.id, o.valor)}
                        title={o.ayuda}
                        aria-pressed={activo}
                        className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm transition-colors ${
                          activo
                            ? 'border-[#059669] bg-[#059669]/10 font-medium text-[#047857]'
                            : 'border-gray-200 text-gray-700 hover:border-[#059669]/40'
                        }`}
                      >
                        {activo && <Check className="h-3.5 w-3.5" />}
                        {o.etiqueta}
                      </button>
                    );
                  })}
                </div>
                {answers[c.id] && answers[c.id] !== 'si' && (
                  <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm text-gray-600">
                    {c.riesgo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {respondidos === CRITERIOS.length
            ? 'Listo: ya respondió los ' + CRITERIOS.length + ' criterios'
            : `Respondidos ${respondidos} de ${CRITERIOS.length}`}
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Puede calcular el resultado en cualquier momento; los criterios sin responder
          cuentan como no definidos.
        </p>
        <button
          onClick={finalizar}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
        >
          Ver resultado y generar brief <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/marco/evaluacion/layout.tsx"
cat > 'app/marco/evaluacion/layout.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { totalCriteria } from '@/lib/framework';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

/**
 * La evaluación es un client component (estado del formulario) y no puede
 * exportar `metadata`. Este layout aporta title, description, canonical y el
 * nodo WebPage enlazado al grafo de entidad.
 */

const URL = `${SITE.url}/marco/evaluacion`;
const TITLE = 'Autoevaluación: ¿está su proyecto listo para cotizar?';
const DESCRIPTION = `Responda ${totalCriteria()} criterios técnicos y obtenga un brief de especificación descargable con lo que falta definir. Sin registro y sin enviar datos: el PDF se genera en su navegador.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/marco/evaluacion' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function EvaluacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackView kind="framework" slug="evaluacion" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Marco de Especificación', url: `${SITE.url}/marco` },
              { name: 'Evaluación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
        ]}
      />
      {children}
    </>
  );
}
PP_EOF

echo "==> Escribiendo app/sitemap.ts"
cat > 'app/sitemap.ts' <<'PP_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";

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

  return [...staticRoutes, ...marcoRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
PP_EOF

echo "==> Escribiendo app/llms.txt/route.ts"
cat > 'app/llms.txt/route.ts' <<'PP_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";

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
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
PP_EOF

echo "==> Escribiendo components/Navbar.tsx"
cat > 'components/Navbar.tsx' <<'PP_EOF'
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
  { href: '/marco', label: 'Marco' },
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
PP_EOF

echo "==> Escribiendo components/Footer.tsx"
cat > 'components/Footer.tsx' <<'PP_EOF'
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
      { label: 'Marco de Especificación', href: '/marco' },
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
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
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
            <Link href="/contacto" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/contacto" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
PP_EOF

echo "==> Escribiendo test/framework.test.ts"
cat > 'test/framework.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  pillars, allCriteria, totalCriteria, maxScore, evidenceExists, nivel,
  FRAMEWORK_VERSION,
} from '@/lib/framework';
import { buildBriefPdf } from '@/lib/framework-brief';
import { scoreAnswers, type Answers } from '@/lib/framework-score';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

describe('marco: integridad de los criterios', () => {
  it('hay seis pilares y todos tienen criterios', () => {
    expect(pillars).toHaveLength(6);
    for (const p of pillars) expect(p.criterios.length, p.id).toBeGreaterThanOrEqual(3);
  });

  it('los identificadores de criterio son únicos en todo el marco', () => {
    const ids = allCriteria().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada criterio declara qué decide y qué pasa si falta el dato', () => {
    for (const c of allCriteria()) {
      expect(c.pregunta.trim().length, c.id).toBeGreaterThan(25);
      expect(c.porQue.trim().length, c.id).toBeGreaterThan(60);
      expect(c.riesgo.trim().length, c.id).toBeGreaterThan(50);
      expect([1, 2]).toContain(c.peso);
    }
  });

  it('toda evidencia citada existe realmente en el silo de guías', () => {
    // Un criterio que cita una guía inexistente es una afirmación sin respaldo.
    for (const c of allCriteria()) {
      if (c.evidencia) expect(evidenceExists(c.evidencia), `${c.id} → ${c.evidencia}`).toBe(true);
    }
  });

  it('cada pilar tiene al menos un criterio crítico', () => {
    for (const p of pillars) {
      expect(p.criterios.some((c) => c.peso === 2), p.id).toBe(true);
    }
  });

  it('el marco no se atribuye exclusividad ni vende en los criterios', () => {
    // Es útil aunque el proyecto se compre a otro: esa es la razón por la que
    // puede convertirse en referencia del rubro.
    const texto = JSON.stringify(pillars).toLowerCase();
    for (const frase of ['solo nosotros', 'únicos', 'nuestra ventaja', 'mejor que la competencia']) {
      expect(texto, frase).not.toContain(frase);
    }
    expect(texto).not.toMatch(/s\/\s?\d/);
  });
});

describe('marco: puntuación', () => {
  const todos = (v: 'si' | 'no' | 'nose'): Answers =>
    Object.fromEntries(allCriteria().map((c) => [c.id, v]));

  it('todo definido da 100% y nivel Definido', () => {
    const r = scoreAnswers(todos('si'));
    expect(r.porcentaje).toBe(100);
    expect(r.obtenido).toBe(maxScore());
    expect(r.nivel.etiqueta).toBe('Definido');
    expect(r.porPilar.every((p) => p.pendientes.length === 0)).toBe(true);
  });

  it('nada definido da 0% y lista TODOS los criterios como pendientes', () => {
    const r = scoreAnswers({});
    expect(r.porcentaje).toBe(0);
    expect(r.porPilar.reduce((n, p) => n + p.pendientes.length, 0)).toBe(totalCriteria());
  });

  it('"no lo sé" cuenta igual que "no": mide lo DEFINIDO, no el optimismo', () => {
    expect(scoreAnswers(todos('nose')).porcentaje).toBe(scoreAnswers(todos('no')).porcentaje);
  });

  it('los criterios críticos pesan el doble', () => {
    const critico = allCriteria().find((c) => c.peso === 2)!;
    const normal = allCriteria().find((c) => c.peso === 1)!;
    expect(scoreAnswers({ [critico.id]: 'si' }).obtenido).toBe(2);
    expect(scoreAnswers({ [normal.id]: 'si' }).obtenido).toBe(1);
  });

  it('los umbrales de nivel son monótonos', () => {
    expect(nivel(100).etiqueta).toBe('Definido');
    expect(nivel(70).etiqueta).toBe('Avanzado');
    expect(nivel(40).etiqueta).toBe('Preliminar');
    expect(nivel(10).etiqueta).toBe('Exploratorio');
  });
});

describe('marco: brief en PDF', () => {
  it('genera un PDF válido en cualquier nivel de respuesta', async () => {
    for (const answers of [{}, Object.fromEntries(allCriteria().map((c) => [c.id, 'si' as const]))]) {
      const bytes = await buildBriefPdf(scoreAnswers(answers), 'Proyecto de prueba', '2026-08-19');
      expect(Buffer.from(bytes.slice(0, 5)).toString('latin1')).toBe('%PDF-');
      expect(bytes.length).toBeGreaterThan(2000);
    }
  }, 30_000);

  it('pdf-lib NO viaja en la carga inicial de la evaluación', () => {
    // 210 kB de JavaScript por una descarga opcional es un impuesto que paga
    // todo el que solo quería responder las preguntas.
    const page = readFileSync(join(process.cwd(), 'app/marco/evaluacion/page.tsx'), 'utf8');
    expect(page).toContain("await import('@/lib/framework-brief')");
    expect(page).not.toMatch(/^import .*framework-brief/m);
    const score = readFileSync(join(process.cwd(), 'lib/framework-score.ts'), 'utf8');
    // Se comprueba la IMPORTACIÓN, no la prosa: el comentario del módulo
    // explica por qué está separado y debe poder nombrar la librería.
    expect(score).not.toMatch(/from ['"]pdf-lib['"]/);
  });

  it('el brief se genera en el navegador y lo dice en el pie', () => {
    const src = readFileSync(join(process.cwd(), 'lib/framework-brief.ts'), 'utf8');
    expect(src).toContain('no se enviaron a ningún servidor');
  });

  it('la evaluación no pide datos personales', () => {
    const src = readFileSync(join(process.cwd(), 'app/marco/evaluacion/page.tsx'), 'utf8');
    for (const campo of ['email', 'correo', 'telefono', 'teléfono', 'ruc']) {
      expect(src.toLowerCase(), `pide ${campo}`).not.toContain(`"${campo}"`);
    }
    expect(src).toContain('no se envían a ningún servidor');
  });
});

describe('marco: integración con el sitio', () => {
  it('el sitemap lista el marco y la evaluación', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/marco`);
    expect(urls).toContain(`${SITE.url}/marco/evaluacion`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('el marco está en la navegación, no solo en el sitemap', () => {
    const nav = readFileSync(join(process.cwd(), 'components/Navbar.tsx'), 'utf8');
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    expect(nav).toContain("href: '/marco'");
    expect(footer).toContain("href: '/marco'");
  });

  it('llms.txt declara el marco para los agentes', () => {
    const src = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8');
    expect(src).toContain('Marco de Especificación');
    expect(src).toContain('/marco/evaluacion');
  });

  it('la versión del marco está declarada', () => {
    expect(FRAMEWORK_VERSION).toMatch(/^\d+\.\d+$/);
  });
});
PP_EOF

echo "==> Escribiendo test/datasheet.test.ts"
cat > 'test/datasheet.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products } from '@/lib/products';
import { buildDatasheetPdf } from '@/lib/datasheet';
import { toWinAnsi } from '@/lib/pdf-text';
import { generateStaticParams } from '@/app/productos/[slug]/ficha-tecnica.pdf/route';

const FECHA = '2026-08-18';

describe('ficha técnica: saneado de texto', () => {
  it('convierte los signos tipográficos que WinAnsi no admite', () => {
    // Sin esto, pdf-lib lanza excepción al primer guion largo y no hay ficha.
    expect(toWinAnsi('a—b')).toBe('a-b');
    expect(toWinAnsi('“cita”')).toBe('"cita"');
    expect(toWinAnsi('a → b')).toBe('a -> b');
    expect(toWinAnsi('2 m²')).toBe('2 m2');
    expect(toWinAnsi('uno · dos')).toBe('uno - dos');
  });

  it('conserva intactos los acentos y la eñe del español', () => {
    expect(toWinAnsi('Especificación de mañana en el Perú')).toBe(
      'Especificación de mañana en el Perú',
    );
  });

  it('elimina lo que no cabe en WinAnsi en vez de romper el documento', () => {
    expect(toWinAnsi('ok ✅ fin')).toBe('ok  fin');
  });
});

describe('ficha técnica: generación', () => {
  it('genera un PDF válido para CADA producto del catálogo', async () => {
    for (const p of products) {
      const bytes = await buildDatasheetPdf(p, FECHA);
      const header = Buffer.from(bytes.slice(0, 5)).toString('latin1');
      expect(header, p.slug).toBe('%PDF-');
      expect(bytes.length, p.slug).toBeGreaterThan(2000);
    }
  }, 60_000);

  it('es determinista para el mismo contenido y la misma fecha', async () => {
    const a = await buildDatasheetPdf(products[0], FECHA);
    const b = await buildDatasheetPdf(products[0], FECHA);
    expect(a.length).toBe(b.length);
  });

  it('la ruta prerenderiza una ficha por producto', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(products.length);
    expect(params.map((p) => p.slug).sort()).toEqual(products.map((p) => p.slug).sort());
  });
});

describe('ficha técnica: honestidad del documento', () => {
  const route = readFileSync(
    join(process.cwd(), 'app/productos/[slug]/ficha-tecnica.pdf/route.ts'),
    'utf8',
  );
  const lib = readFileSync(join(process.cwd(), 'lib/datasheet.ts'), 'utf8');

  it('declara canonical hacia la ficha HTML, para no competir con ella', () => {
    expect(route).toContain('rel="canonical"');
    expect(route).toContain('/productos/${product.slug}');
  });

  it('no inventa documentación cuando el catálogo no la declara', () => {
    // El texto de respaldo dice que se entrega con la cotización; nunca afirma
    // un certificado concreto que no exista en el catálogo.
    expect(lib).toContain('product.documentation ??');
    expect(lib).toContain('se entregan con la cotización');
  });

  it('el PDF no publica precios: el negocio es por cotización', () => {
    expect(lib).not.toMatch(/S\/\s?\d/);
    expect(lib).toContain('No publicamos precio de lista');
  });

  it('la descarga emite el evento de conversión', () => {
    const btn = readFileSync(join(process.cwd(), 'components/DatasheetButton.tsx'), 'utf8');
    expect(btn).toContain('trackDocumentDownload');
    expect(btn).toContain('/ficha-tecnica.pdf');
  });
});
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 14 test files / 152 tests, y en el build:"
echo "   o /marco              (el estándar publicado)"
echo "   o /marco/evaluacion   (143 kB: pdf-lib se carga bajo demanda)"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(marco): publicar el Marco de Especificacion y su autoevaluacion'"
echo "   git push origin main"
echo "=============================================================="
