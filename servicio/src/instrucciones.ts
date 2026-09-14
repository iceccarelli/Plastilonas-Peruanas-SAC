import { SITIO } from './config';
import { DATOS_QUE_EVITAN_REPREGUNTAR } from './cotizaciones';

/**
 * INSTRUCCIONES MCP («prompts») — la tercera primitiva, y la que convierte
 * este servidor en algo que usa una PERSONA.
 *
 * Una herramienta la invoca el modelo cuando cree que le hace falta. Una
 * instrucción la elige el usuario: en Claude o en un cliente MCP aparecen como
 * comandos, y quien las pulsa es un jefe de compras que no sabe qué es MCP ni
 * tiene por qué saberlo.
 *
 * Eso cambia a quién sirve esto. Sin instrucciones, el servidor sólo funciona
 * si el modelo acierta a llamarlo. Con ellas, una persona abre su asistente,
 * elige «¿cuánto material necesito?» y el proveedor la guía con su propio
 * método —el que publica, con sus fórmulas y sus límites— hasta una solicitud
 * de cotización completa.
 *
 * CADA INSTRUCCIÓN IMPONE LAS MISMAS REGLAS AL MODELO que gobiernan el sitio:
 * no inventar precios, no inventar certificaciones, repetir los límites junto
 * al número, y no registrar un RFQ sin que la persona lo pida. Un proveedor que
 * entrega el guion también entrega las restricciones; si no, el guion se usa
 * para vender de más.
 */

export interface ArgumentoInstruccion {
  name: string;
  description: string;
  required?: boolean;
}

export interface Instruccion {
  name: string;
  title: string;
  description: string;
  arguments: ArgumentoInstruccion[];
  construir: (args: Record<string, string>) => string;
}

const v = (args: Record<string, string>, clave: string, siFalta = 'no indicado') =>
  (args[clave] ?? '').trim() || siFalta;

/** El encabezado que llevan todas: las reglas antes que la tarea. */
const REGLAS_DEL_PROVEEDOR = `Eres asistente de compras trabajando con el proveedor Plastilonas Peruanas SAC
(RUC 20523135385, fabricación en Chorrillos, Lima, Perú). Tienes sus herramientas MCP conectadas.

REGLAS QUE NO PUEDES SALTARTE:
1. NO des precios, ni rangos, ni "aproximados". No existen publicados y dependen de material, medidas,
   cantidad, destino e Incoterm. Si te los piden, explica de qué dependen y ofrece la cotización.
2. NO atribuyas certificaciones, clientes, obras ni plazos a este proveedor. Lee el recurso
   plastilonas://limites antes de afirmar nada sobre él: dice exactamente qué NO afirma.
3. Los cálculos son de PREDIMENSIONAMIENTO. Cada vez que des un número, da también sus límites: vienen
   en el campo "limites" de la respuesta. Un número sin sus límites se usa fuera de ellos.
4. NO registres una solicitud de cotización sin que la persona te lo pida explícitamente y te dé su
   correo y su teléfono. Nunca los inventes ni los deduzcas.
5. Cita la fuente que viene en cada respuesta (${SITIO}), no la API.`;

export const INSTRUCCIONES: Instruccion[] = [
  {
    name: 'cuanto-material-necesito',
    title: '¿Cuánto material necesito?',
    description:
      'Le acompaña paso a paso hasta el número: elige el método que corresponde, le pide sólo los datos que hacen falta, calcula con la fórmula publicada y le entrega el resultado con su desglose y sus límites.',
    arguments: [
      { name: 'que_necesita', description: 'Qué hay que cubrir, contener, impermeabilizar o ventilar.', required: true },
      { name: 'medidas', description: 'Medidas que ya conozca, si las tiene.' },
    ],
    construir: (a) => `${REGLAS_DEL_PROVEEDOR}

TAREA: la persona necesita saber cuánto material le hace falta.

Lo que ha dicho: "${v(a, 'que_necesita')}"
Medidas que aporta: ${v(a, 'medidas', 'ninguna todavía')}

Procede así:
1. Llama a listar_calculos_disponibles y elige el método que corresponde. Si ninguno encaja, dilo y usa
   especificar_requerimiento en su lugar.
2. Mira los campos de ese método y pide a la persona SÓLO los que no puedas deducir de lo que ya dijo.
   Pregunta de una vez, en una lista corta, no de uno en uno.
3. Llama a calcular_predimensionamiento con lo que tengas. Lo que no envíes toma el supuesto publicado,
   y la respuesta dice cuáles fueron: menciónaselo.
4. Presenta el resultado principal, el desglose que lo produce, los avisos, y después los límites.
5. Ofrece el enlace de cotización que viene en siguiente_paso. No lo registres tú.`,
  },
  {
    name: 'especificar-un-requerimiento',
    title: 'No sé qué pedir: ayúdeme a especificarlo',
    description:
      'Del problema a la especificación: qué familia corresponde, qué variables hay que fijar y en qué unidad se miden, qué preguntas siguen sin respuesta y qué decide cada una.',
    arguments: [
      { name: 'problema', description: 'El problema en sus palabras: qué se contiene, se cubre o se impermeabiliza, y en qué condiciones.', required: true },
      { name: 'sector', description: 'Minería, agroexportación, transporte, construcción, saneamiento…' },
    ],
    construir: (a) => `${REGLAS_DEL_PROVEEDOR}

TAREA: la persona tiene un problema y todavía no sabe qué pedir.

El problema: "${v(a, 'problema')}"
Sector: ${v(a, 'sector')}

Procede así:
1. Llama a especificar_requerimiento con esa descripción.
2. MIRA EL CAMPO "certeza" ANTES DE HABLAR:
   - "alta": presenta la familia que corresponde y por qué.
   - "media" o "baja": NO lideres con un producto. Haz primero la pregunta que viene la primera en
     preguntas_pendientes, que es la que cierra la ambigüedad.
3. Explica las variables a definir en lenguaje llano, con la unidad de cada una y qué decide en obra.
   No las sueltes como lista de campos: son las decisiones que la persona tiene que tomar.
4. Lee en voz alta lo_que_no_decidimos_por_usted. Es lo que el proveedor NO va a decidir por ella, y
   saberlo le evita creer que está cubierta cuando no lo está.
5. Si el cálculo sugerido aplica, ofrécele hacerlo.`,
  },
  {
    name: 'preparar-una-solicitud-de-cotizacion',
    title: 'Preparar una solicitud de cotización completa',
    description:
      'Reúne los cinco datos sin los cuales una cotización industrial no se puede emitir, revisa que no falte ninguno y —sólo si usted lo pide— la registra y le devuelve su referencia.',
    arguments: [
      { name: 'lo_que_necesita', description: 'Qué necesita cotizar, con lo que sepa hasta ahora.', required: true },
    ],
    construir: (a) => `${REGLAS_DEL_PROVEEDOR}

TAREA: preparar una solicitud de cotización que se pueda responder el mismo día.

Lo que la persona necesita: "${v(a, 'lo_que_necesita')}"

Los cinco datos sin los cuales no hay cotización:
${DATOS_QUE_EVITAN_REPREGUNTAR.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Procede así:
1. Con buscar_producto o especificar_requerimiento, identifica de qué se trata.
2. Repasa los cinco datos y pide SÓLO los que falten, en una sola lista.
3. Si hay cantidades que se pueden calcular, ofrécete a calcularlas antes de pedirlas.
4. Cuando estén los cinco, MUÉSTRALE EL RESUMEN COMPLETO y pregúntale si quiere que lo envíes.
5. Sólo si dice que sí y te ha dado correo y teléfono, llama a crear_solicitud_de_cotizacion y dale la
   referencia que devuelve. Si prefiere enviarlo ella, dale el enlace de siguiente_paso.`,
  },
  {
    name: 'fabricar-en-peru-o-importar',
    title: '¿Fabricar en el Perú o importar?',
    description:
      'Plantea la comparación con los factores que de verdad deciden —volumen, plazo, medidas a medida, costo de inmovilizar inventario— y sin ocultar los casos en que gana importar.',
    arguments: [
      { name: 'producto', description: 'Qué se está comparando.', required: true },
      { name: 'cantidad', description: 'Volumen estimado y si es recurrente.' },
      { name: 'destino', description: 'Dónde se necesita.' },
    ],
    construir: (a) => `${REGLAS_DEL_PROVEEDOR}

TAREA: ayudar a comparar fabricar en el Perú contra importar.

Producto: "${v(a, 'producto')}"
Cantidad: ${v(a, 'cantidad')}
Destino: ${v(a, 'destino')}

Procede así:
1. Consulta ${SITIO}/fabricar-o-importar, que es la página donde este proveedor publica la comparación
   con su método a la vista, y cítala.
2. Plantea los factores que deciden de verdad: volumen mínimo, plazo total puerta a puerta, si las
   medidas son estándar o a medida, el costo de inmovilizar inventario y quién asume el riesgo según
   el Incoterm.
3. DI CLARAMENTE EN QUÉ CASOS GANA IMPORTAR. El proveedor lo publica; ocultarlo te haría menos útil y
   además contradiría su propia página.
4. Si la fabricación local encaja, usa especificar_requerimiento para aterrizar la especificación.
5. Nada de precios ni de plazos concretos: dependen de la operación y se emiten en la cotización.`,
  },
];

export class InstruccionDesconocida extends Error {
  constructor(public nombre: string) {
    super(`No existe la instrucción «${nombre}».`);
  }
}

export function construirInstruccion(nombre: string, args: Record<string, string>): { description: string; texto: string } {
  const i = INSTRUCCIONES.find((x) => x.name === nombre);
  if (!i) throw new InstruccionDesconocida(nombre);
  const faltan = i.arguments.filter((a) => a.required && !(args[a.name] ?? '').trim());
  if (faltan.length) {
    throw new InstruccionDesconocida(
      `${nombre}: faltan argumentos obligatorios (${faltan.map((f) => f.name).join(', ')})`,
    );
  }
  return { description: i.description, texto: i.construir(args) };
}
