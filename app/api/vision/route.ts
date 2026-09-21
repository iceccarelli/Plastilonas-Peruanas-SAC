import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { whatsappUrl } from '@/lib/whatsapp';
import { VISION_SYSTEM_PROMPT, VisionModelOutputSchema, parseVisionObservation } from '@/lib/ai/vision';
import { VISION_MAX_BYTES, VISION_MIME_ALLOWLIST } from '@/lib/ai/vision-upload';

// Análisis de imagen del asistente (Sprint C). Requiere ANTHROPIC_API_KEY,
// igual que app/api/chat/route.ts: sin la clave, 503 y el cliente ofrece
// WhatsApp en vez de un error críptico. Server-only: nunca importa
// supabaseAdmin porque la foto viaja en base64 en el body, no como ruta de
// Storage (ver comentario de decisión en lib/ai/vision-upload.ts) — así que
// no hay ninguna llamada con service-role alcanzable desde el cliente.

export const maxDuration = 30;

const WHATSAPP_FOTO = whatsappUrl('Hola, quisiera que revisen una foto para mi cotización.');

// -----------------------------------------------------------------------------
// Rate limiting — MISMO patrón en memoria que app/api/chat/route.ts y
// app/api/lead/route.ts (mapa IP -> {n, t}, ventana de 10 minutos). El límite
// es más bajo que el del chat (30/10min) porque cada petición aquí es una
// llamada a un modelo con visión (más cara) y porque ya existe una cuota de
// cliente en lib/ai/vision-quota.ts (6 fotos/sesión) que cubre el uso normal;
// este límite por IP es la defensa que esa cuota de cliente NO puede ser: no
// se puede evadir borrando localStorage.
const VISION_RATE_LIMIT = 10;
const VISION_RATE_WINDOW_MS = 10 * 60 * 1000;
const visionBuckets = new Map<string, { n: number; t: number }>();

function visionLimited(ip: string): boolean {
  const now = Date.now();
  const hit = visionBuckets.get(ip);
  if (!hit || now - hit.t > VISION_RATE_WINDOW_MS) {
    visionBuckets.set(ip, { n: 1, t: now });
    return false;
  }
  hit.n += 1;
  return hit.n > VISION_RATE_LIMIT;
}

const RequestSchema = z.object({
  imageBase64: z.string().trim().min(1),
  mediaType: z.enum(VISION_MIME_ALLOWLIST),
});

function fallback(status: number, error: string, message: string) {
  return Response.json({ error, message, whatsappUrl: WHATSAPP_FOTO }, { status });
}

export async function POST(req: Request) {
  // Falla cerrado y PRIMERO, antes de leer el body — mismo orden que /api/chat.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (visionLimited(ip)) {
    return fallback(
      429,
      'rate_limited',
      'Está subiendo muchas fotos seguidas. Espere unos minutos, o envíenos la foto directo por WhatsApp.',
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback(503, 'vision_not_configured', 'El análisis de fotos no está disponible por ahora.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fallback(400, 'bad_request', 'No se pudo leer la foto enviada.');
  }

  const parsedRequest = RequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return fallback(
      400,
      'bad_request',
      'Formato de imagen no admitido. Use JPG, PNG o WEBP, o envíela por WhatsApp.',
    );
  }
  const { imageBase64, mediaType } = parsedRequest.data;

  // Tamaño real del archivo ≈ 3/4 del base64 (sin el prefijo data:, que el
  // cliente ya recorta en lib/ai/vision-upload.ts#readFileAsBase64). Mismo
  // umbral que CotizacionForm.MAX_BYTES — no se inventa un segundo número.
  const approxBytes = Math.floor((imageBase64.length * 3) / 4);
  if (approxBytes > VISION_MAX_BYTES) {
    return fallback(413, 'file_too_large', 'La foto supera los 20 MB. Envíela por WhatsApp.');
  }

  try {
    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      schema: VisionModelOutputSchema,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analice esta foto siguiendo exactamente las cuatro categorías de la instrucción del sistema.',
            },
            { type: 'image', image: `data:${mediaType};base64,${imageBase64}` },
          ],
        },
      ],
      temperature: 0.3,
      maxTokens: 700,
    });

    const observation = parseVisionObservation(object);
    if (!observation) {
      // El modelo respondió algo que no cumple la estructura obligatoria
      // (p. ej. "unknown" vacío). Nunca se muestra una tarjeta a medias.
      console.error('[vision] respuesta del modelo no cumplió el esquema obligatorio', object);
      return fallback(
        502,
        'vision_invalid_response',
        'No se pudo analizar la foto de forma confiable. Envíela por WhatsApp y el equipo la revisa directamente.',
      );
    }

    return Response.json({ observation });
  } catch (err) {
    console.error('[vision] fatal error:', err);
    return fallback(
      500,
      'vision_failed',
      'El análisis de fotos no está disponible en este momento. Envíela por WhatsApp.',
    );
  }
}
