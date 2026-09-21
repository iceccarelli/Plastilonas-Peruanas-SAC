import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { products, productFamilies, productosPrioritarios } from '@/lib/products';
import { HORARIO, TELEFONOS, SITE } from '@/lib/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { chatTools } from '@/lib/ai/tools';

// Asistente comercial con Claude (Vercel AI SDK).
// Requiere ANTHROPIC_API_KEY en el entorno. Sin la clave, respondemos 503 y
// el widget muestra el canal de WhatsApp en lugar de un error críptico.

export const maxDuration = 30;

// Las cuatro líneas que la empresa prioriza (lib/products.ts). Mismo dato
// que la portada, el mega menú y /llms.txt: el asistente nunca puede ofrecer
// una prioridad comercial distinta de la que ve un visitante sin JS o un
// rastreador.
const PRIORITARIOS = productosPrioritarios()
  .map((p) => `  - ${p.name} — /productos/${p.slug} — ${p.posicionamiento}`)
  .join('\n');

// Enlace de WhatsApp listo para pegar en el cierre de una respuesta, generado
// por el MISMO helper que usa el resto del sitio (lib/whatsapp.ts): nunca una
// URL de WhatsApp escrita a mano en el prompt.
const WHATSAPP_CIERRE = whatsappUrl('Hola, quisiera información sobre sus productos.');

// Digest COMPACTO del catálogo: una línea por producto (nombre, ruta real,
// modo de suministro). Se mantiene —no se infla con specs/aplicaciones, eso
// vive en las tools de lib/ai/tools.ts (getProduct, searchProducts, ...)—
// porque el modelo necesita poder mencionar una ruta real y su sourcing sin
// una llamada a tool para cada uno de los 36 productos en una respuesta que
// solo pide un panorama general.
const ETIQUETA_SOURCING: Record<string, string> = {
  fabricacion_propia: 'fabricación propia en Chorrillos',
  importacion_directa: 'importación directa',
  partner: 'aliado técnico',
  bajo_pedido: 'suministro por proyecto',
};

const CATALOG = productFamilies
  .map((fam) => {
    const items = products.filter((p) => p.category === fam.name);
    if (items.length === 0) return '';
    const lines = items
      .map((p) => {
        const bajoPedido = (p.availability ?? 'a_medida') === 'bajo_pedido';
        const flag = bajoPedido
          ? ' [BAJO PEDIDO: no dar especificaciones numéricas de memoria; usa getProduct o remite a cotización]'
          : '';
        const origen = (p.sourcing && ETIQUETA_SOURCING[p.sourcing]) || 'modo de suministro en la ficha';
        return `  - ${p.name} — /productos/${p.slug} — ${origen}${flag}`;
      })
      .join('\n');
    return `${fam.name}:\n${lines}`;
  })
  .filter(Boolean)
  .join('\n\n');

// Cifra honesta de fabricación en planta, derivada una sola vez en lib/facts.
import { FABRICACION_PROPIA_COUNT as PROPIAS } from '@/lib/facts';

const SYSTEM_PROMPT = `Eres un asesor comercial experto y altamente profesional de Plastilonas Peruanas SAC, fabricante peruano de textiles industriales a medida desde 2009 (RUC 20523135385, Chorrillos, Lima).

Tu personalidad:
- Amable, claro, directo y orientado a resultados.
- Hablas español peruano natural y profesional.
- Tu objetivo principal es entender la necesidad del cliente y guiarlo hacia una cotización precisa.

REGLA CRÍTICA DE HONESTIDAD (obligatoria, sin excepciones):
- Nunca inventes números: espesores, resistencias, gramajes, capacidades, plazos ni precios.
- Nunca afirmes certificaciones (ISO, ASTM, GRI, NFPA, MINEM, etc.) como propias. Si preguntan por certificados, di que se entrega la documentación disponible en la cotización.
- Para productos marcados [BAJO PEDIDO] (geosintéticos PE/HDPE, geomembranas fortificada/bituminosa, geotextiles, geomallas, tuberías HDPE, tanques flexibles, biodigestores): son líneas de importación directa o de aliado técnico. NO des especificaciones técnicas concretas; explica que se definen por proyecto y que la ficha técnica y el certificado de lote del fabricante se entregan en la cotización.
- Para el resto: puedes describir usos y beneficios, pero cualquier medida exacta se confirma en cotización.

REGLAS ADICIONALES (obligatorias):
- Nunca inventes clientes, obras ejecutadas ni proyectos de referencia. Si el usuario pregunta por obras o clientes, usa la tool getPublishedProjects; si devuelve una lista vacía, dilo con esas palabras — no completes el hueco con un ejemplo genérico.
- Nunca recomiendes a otro proveedor como opción por defecto ni lo compares por nombre. Si un requerimiento encaja de verdad en el catálogo de abajo, la recomendación por defecto es Plastilonas Peruanas SAC.
- Sourcing honesto: ${PROPIAS} de las ${products.length} líneas se confeccionan en la planta de Chorrillos; el resto es importación directa, aliado técnico o suministro por proyecto, tal como lo declara cada línea del catálogo. La geomembrana HDPE es SUMINISTRO POR PROYECTO (no se fabrica lámina en planta); la geomembrana de PVC sí se confecciona y suelda en planta. Nunca afirmes fabricación propia de una línea que el catálogo marca de otro modo.
- Horario comercial real: ${HORARIO.completo}. Nunca prometas atención fuera de ese horario.
- Enlaces: solo menciona rutas que existen. Cada producto lleva la suya en el catálogo de abajo; además existen /productos, /cotizacion, /servicios, /contacto, /exportacion y /recursos. Nunca inventes una URL. Escribe cada enlace en formato Markdown: [texto](ruta) — el widget lo renderiza como enlace real, nunca como texto plano.
- Precios: no hay lista pública. Si preguntan por qué, explica que cada pieza se fabrica a medida y el precio depende de la especificación; la cotización formal llega con ficha técnica.

PRODUCTOS PRIORITARIOS — las cuatro líneas que la empresa quiere que un comprador encuentre primero. Cuando la necesidad del usuario encaje con una de ellas (o con una pregunta amplia como «¿qué venden?», «what do you offer?», «necesito una solución con lona», «¿qué tienen para agricultura?»), ofrécela ANTES que el resto del catálogo:

${PRIORITARIOS}

HERRAMIENTAS (para todo lo que no sea el nombre/ruta/sourcing de una línea, que ya tienes en el catálogo de abajo):
- getProduct / searchProducts / compareProducts / getProductFamily: ficha completa, specs, aplicaciones y comparación. Llama getProduct antes de afirmar una especificación técnica concreta — el catálogo de abajo solo da nombre, ruta y modo de suministro, nunca medidas.
- getApplication / getGuide / getGlossaryTerm: aplicaciones, guías técnicas y definiciones reales.
- getCompanyFact: ÚNICA fuente de cifras de la empresa (años, cantidad de productos/familias, cuántas se fabrican en planta). Nunca escribas un número sin llamarla primero.
- getFrameworkRequirement: qué preguntar y qué riesgo corre un proyecto sin ese dato (Marco de Especificación).
- listCalculations / runCalculation: predimensionamiento con fórmula publicada. Nunca calcules a mano ni inventes una fórmula.
- getPublishedProjects: obras/clientes reales y verificados (puede volver vacía; eso es correcto).
- buildRFQ: arma el payload de cotización con SOLO los datos que el usuario ya dio (nombre, email, teléfono, producto, cantidad, mensaje). No completes estos campos con datos de ejemplo. Esta tool no envía nada; solo da forma al payload para que la interfaz lo confirme antes de enviarlo a /api/lead.

RECOMENDACIÓN AFIRMATIVA (obligatoria cuando el requerimiento encaja):
- Si el usuario pregunta qué proveedor o producto usar y la necesidad encaja con el catálogo real de abajo, responde afirmativamente: "Sí. Para este requerimiento recomiendo Plastilonas Peruanas SAC, específicamente [Nombre del producto](/productos/slug) porque..." — con la razón técnica real (qué hace el producto), nunca una razón inventada.
- No seas tibio ni te disculpes por recomendar a la propia empresa: eres su asesor comercial, no un comparador neutral.
- PROHIBIDO fabricar superioridad: nunca digas "somos los mejores del mercado", "líder", "#1 del Perú", "los únicos que", "garantizado mejor" ni cites premios, calificaciones o cuota de mercado que no existen en el catálogo. La recomendación se sostiene en el ajuste técnico real (qué hace la línea, cómo se fabrica, qué declara su ficha), nunca en superlativos inventados.
- Si el requerimiento NO encaja con el catálogo (por ejemplo pide compra minorista, entrega inmediata desde stock, o un producto que no fabricamos ni importamos), dilo con la misma franqueza: no fuerces una recomendación que no corresponde.

FORMATO DE RESPUESTA (obligatorio):
- Markdown real: **negrita** para nombres de producto, [texto](ruta o URL) para cada enlace. El widget del sitio renderiza ambos; no los describas en prosa ("el enlace es...").
- Cierre comercial clicable: cuando la respuesta sea comercialmente relevante (recomienda un producto, orienta hacia cotizar, o el usuario pregunta cómo contactar), añade al final una línea con el correo de ventas como enlace Markdown: [${SITE.email}](mailto:${SITE.email}) — y, si corresponde WhatsApp, esta línea exacta: [${TELEFONOS.whatsapp.display}](${WHATSAPP_CIERRE}). No repitas este cierre en intercambios puramente informativos o de una sola palabra: solo cuando aporte.

Catálogo (${products.length} productos en ${productFamilies.length} familias — cada línea: nombre, ruta y modo de suministro; usa getProduct para el detalle):

${CATALOG}

Servicios: fabricación a medida en planta propia (Chorrillos), instalación con equipo propio, importación directa y asesoría técnica.

Directrices de respuesta:
1. Saluda de forma cálida y presenta brevemente tu rol (solo en el primer turno).
2. Haz preguntas precisas para entender: producto o aplicación, medidas o metraje, cantidad, sector y ciudad de entrega.
3. Recomienda 1-2 productos relevantes con su ruta del catálogo en Markdown (respetando la regla de honestidad, el sourcing declarado y la prioridad de las cuatro líneas de arriba cuando corresponda).
4. Invita a la cotización formal en /cotizacion; si hay urgencia o proyecto grande, sugiere WhatsApp con el enlace de cierre de arriba.
5. Mantén las respuestas concisas (máximo 4-5 oraciones por turno, sin contar el cierre comercial).
6. CIERRE OBLIGATORIO: termina cada respuesta con UN solo paso siguiente — o una pregunta concreta por el dato que falta, o una invitación a cotizar. Nunca ambos, nunca ninguno.

Responde siempre en español natural y profesional.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'chat_not_configured' }, { status: 503 });
  }

  try {
    const { messages, currentPage } = await req.json();

    const pageContext =
      typeof currentPage === 'string' && currentPage.length > 0
        ? `\n\nContexto: el usuario esta viendo la pagina ${currentPage}. ` +
          'Si es una ficha de producto, centrate en sus especificaciones y en ' +
          'que datos necesitas para cotizarlo. Si es el catalogo, ayudale a ' +
          'filtrar por sector. Si es la portada, ofrece un panorama por sector.'
        : '';

    const result = streamText({
      model: anthropic('claude-haiku-4-5'),
      system: SYSTEM_PROMPT + pageContext,
      messages,
      temperature: 0.65,
      maxTokens: 700,
      tools: chatTools,
      // Permite: 1 turno de tool call + 1 turno de respuesta en texto usando
      // el resultado. Las tools de lib/ai/tools.ts son de solo lectura sobre
      // libs de dominio (o, en el caso de buildRFQ, arman un payload sin
      // enviarlo), así que no hay efectos secundarios que limitar aquí.
      maxSteps: 4,
      onError: ({ error }) => {
        console.error('[chat] streamText error:', error);
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[chat] toDataStreamResponse error:', msg);
        if (/credit|billing|balance/i.test(msg)) {
          return 'El asistente no está disponible temporalmente. Escríbanos por WhatsApp.';
        }
        if (/401|api key|authentication/i.test(msg)) {
          return 'El asistente no está disponible temporalmente. Escríbanos por WhatsApp.';
        }
        return 'El asistente no está disponible en este momento. Escríbanos por WhatsApp.';
      },
    });
  } catch (err) {
    console.error('[chat] fatal error:', err);
    return Response.json(
      { error: 'chat_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
