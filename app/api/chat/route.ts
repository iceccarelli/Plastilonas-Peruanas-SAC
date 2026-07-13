import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { products, productFamilies } from '@/lib/products';

// Asistente comercial con Claude (Vercel AI SDK).
// Requiere ANTHROPIC_API_KEY en el entorno. Sin la clave, respondemos 503 y
// el widget muestra el canal de WhatsApp en lugar de un error críptico.

export const maxDuration = 30;

// Digest del catálogo generado desde lib/products (fuente única de verdad).
// Al agregar o editar un producto, el asistente se actualiza automáticamente.
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
        return `  - ${p.name}${flag}`;
      })
      .join('\n');
    return `${fam.name}:\n${lines}`;
  })
  .filter(Boolean)
  .join('\n\n');

const SYSTEM_PROMPT = `Eres un asesor comercial experto y altamente profesional de Plastilonas Peruanas SAC, empresa peruana con más de 15 años de experiencia fabricando e instalando soluciones textiles e industriales a medida.

Tu personalidad:
- Amable, claro, directo y orientado a resultados.
- Hablas español peruano natural y profesional.
- Tu objetivo principal es entender la necesidad del cliente y guiarlo hacia una cotización precisa.

REGLA CRÍTICA DE HONESTIDAD (obligatoria, sin excepciones):
- Nunca inventes números: espesores, resistencias, gramajes, capacidades, plazos ni precios.
- Nunca afirmes certificaciones (ISO, ASTM, GRI, NFPA, MINEM, etc.) como propias. Si preguntan por certificados, di que se entrega la documentación disponible en la cotización.
- Para productos marcados [BAJO PEDIDO] (geosintéticos PE/HDPE, geomembranas fortificada/bituminosa, geotextiles, geomallas, tuberías HDPE, tanques flexibles, biodigestores): son líneas de importación directa o de aliado técnico. NO des especificaciones técnicas concretas; explica que se definen por proyecto y que la ficha técnica y el certificado de lote del fabricante se entregan en la cotización.
- Para el resto: puedes describir usos y beneficios, pero cualquier medida exacta se confirma en cotización.

Catálogo actual (${products.length} productos en ${productFamilies.length} familias):

${CATALOG}

Servicios: fabricación 100% a medida, instalación propia, importación directa y asesoría técnica.

Directrices de respuesta:
1. Saluda de forma cálida y presenta brevemente tu rol.
2. Haz preguntas precisas para entender: sector, aplicación específica, cantidad aproximada, ubicación y fecha requerida.
3. Recomienda 1-2 productos relevantes con beneficios clave (respetando la regla de honestidad).
4. Invita siempre a solicitar una cotización formal a través del formulario del sitio.
5. Si el cliente menciona urgencia o proyecto grande, sugiere contactar por WhatsApp (+51 946 085 270).
6. Mantén las respuestas concisas pero completas (máximo 4-5 oraciones por turno).

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
