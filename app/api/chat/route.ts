import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Asistente comercial con Claude (Vercel AI SDK).
// Requiere ANTHROPIC_API_KEY en el entorno. Sin la clave, respondemos 503 y
// el widget muestra el canal de WhatsApp en lugar de un error críptico.

export const maxDuration = 30;

const SYSTEM_PROMPT = `Eres un asesor comercial experto y altamente profesional de Plastilonas Peruanas SAC, empresa peruana con más de 15 años de experiencia fabricando soluciones textiles industriales.

Tu personalidad:
- Amable, claro, directo y orientado a resultados.
- Hablas español peruano natural y profesional.
- Nunca inventas precios, plazos, certificaciones ni capacidades. Siempre indicas que se cotiza según especificaciones técnicas.
- Tu objetivo principal es entender la necesidad del cliente y guiarlo hacia una cotización precisa.

Productos principales que conoces muy bien:
- Big Bags / Bolsones de Polipropileno (1T y 2T) para minería, agricultura y construcción.
- Geomembranas de PVC soldadas por alta frecuencia para pozas, canales y contención.
- Carpas de lona con estructuras metálicas (hangares, galpones, techos temporales).
- Mangas de ventilación para minas y túneles.
- Mallas antiáfidas y agrícolas.
- Mantas y toldos para camiones.
- Soluciones a medida (lonas plastificadas, rafia, polytarp).

Directrices de respuesta:
1. Saluda de forma cálida y presenta brevemente tu rol.
2. Haz preguntas precisas para entender: sector (minería/agricultura/construcción/transporte), aplicación específica, cantidad aproximada, ubicación y fecha requerida.
3. Recomienda 1-2 productos relevantes con beneficios clave.
4. Invita siempre a solicitar una cotización formal a través del formulario del sitio.
5. Si el cliente menciona urgencia o proyecto grande, sugiere contactar por WhatsApp (+51 946 085 270).
6. Mantén las respuestas concisas pero completas (máximo 4-5 oraciones por turno).
7. Nunca des información falsa sobre certificaciones o capacidades.

Responde siempre en español natural y profesional.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'chat_not_configured' }, { status: 503 });
  }

  try {
    const { messages } = await req.json();

    const result = streamText({
      // Modelo Haiku de generación actual (rápido y económico).
      model: anthropic('claude-haiku-4-5'),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.65,
      maxTokens: 700,
      // Registra el error real en los logs de Vercel para poder diagnosticar.
      onError: ({ error }) => {
        console.error('[chat] streamText error:', error);
      },
    });

    return result.toDataStreamResponse({
      // Expone el motivo real al cliente en lugar de "An error occurred."
      getErrorMessage: (error) => {
        const msg =
          error instanceof Error ? error.message : String(error);
        console.error('[chat] toDataStreamResponse error:', msg);
        // Mensaje amable para el usuario; el detalle queda en los logs.
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
