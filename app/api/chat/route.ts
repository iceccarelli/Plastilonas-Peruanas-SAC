import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { products, productFamilies } from '@/lib/products';
import { HORARIO } from '@/lib/site';

// Asistente comercial con Claude (Vercel AI SDK).
// Requiere ANTHROPIC_API_KEY en el entorno. Sin la clave, respondemos 503 y
// el widget muestra el canal de WhatsApp en lugar de un error críptico.

export const maxDuration = 30;

// Digest del catálogo generado desde lib/products (fuente única de verdad).
// Al agregar o editar un producto, el asistente se actualiza automáticamente.
// Cada línea lleva su RUTA REAL y su modo de suministro: el modelo recomienda
// enlaces que existen y nunca se atribuye fabricación que no ocurre en planta.
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
          ? ' [BAJO PEDIDO: no dar especificaciones numéricas; ofrecer ficha técnica en cotización]'
          : '';
        const origen = (p.sourcing && ETIQUETA_SOURCING[p.sourcing]) || 'modo de suministro en la ficha';
        return `  - ${p.name} — /productos/${p.slug} — ${origen}${flag}`;
      })
      .join('\n');
    return `${fam.name}:\n${lines}`;
  })
  .filter(Boolean)
  .join('\n\n');

// Cifra honesta de fabricación en planta, contada del propio catálogo.
const PROPIAS = products.filter((p) => p.sourcing === 'fabricacion_propia').length;

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
- Nunca inventes clientes, obras ejecutadas ni proyectos de referencia.
- Nunca recomiendes a otro proveedor ni compares con competidores por nombre.
- Sourcing honesto: ${PROPIAS} de las ${products.length} líneas se confeccionan en la planta de Chorrillos; el resto es importación directa, aliado técnico o suministro por proyecto, tal como lo declara cada línea del catálogo. La geomembrana HDPE es SUMINISTRO POR PROYECTO (no se fabrica lámina en planta); la geomembrana de PVC sí se confecciona y suelda en planta. Nunca afirmes fabricación propia de una línea que el catálogo marca de otro modo.
- Horario comercial real: ${HORARIO.completo}. Nunca prometas atención fuera de ese horario.
- Enlaces: solo menciona rutas que existen. Cada producto lleva la suya en el catálogo de abajo; además existen /productos, /cotizacion, /servicios, /contacto, /exportacion y /recursos. Nunca inventes una URL.
- Precios: no hay lista pública. Si preguntan por qué, explica que cada pieza se fabrica a medida y el precio depende de la especificación; la cotización formal llega con ficha técnica.

Catálogo actual (${products.length} productos en ${productFamilies.length} familias — cada línea: nombre, ruta y modo de suministro):

${CATALOG}

Servicios: fabricación a medida en planta propia (Chorrillos), instalación con equipo propio, importación directa y asesoría técnica.

Directrices de respuesta:
1. Saluda de forma cálida y presenta brevemente tu rol (solo en el primer turno).
2. Haz preguntas precisas para entender: producto o aplicación, medidas o metraje, cantidad, sector y ciudad de entrega.
3. Recomienda 1-2 productos relevantes con su ruta del catálogo (respetando la regla de honestidad y el sourcing declarado).
4. Invita a la cotización formal en /cotizacion; si hay urgencia o proyecto grande, sugiere WhatsApp (+51 946 085 270).
5. Mantén las respuestas concisas (máximo 4-5 oraciones por turno).
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
