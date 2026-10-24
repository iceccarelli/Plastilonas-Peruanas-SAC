import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { whatsappUrl } from '@/lib/whatsapp';
import { VISION_SYSTEM_PROMPT, VisionModelOutputSchema, parseVisionObservation } from '@/lib/ai/vision';
import { BASE64_RE, VISION_MAX_BYTES, VISION_MIME_ALLOWLIST, matchesImageSignature } from '@/lib/ai/vision-upload';
import { readBoundedText } from '@/lib/http-limits';
import { aiLimited, globalCap, safeError } from '@/lib/ai/abuse';

// Análisis de imagen del asistente (Sprint C). Requiere ANTHROPIC_API_KEY,
// igual que app/api/chat/route.ts: sin la clave, 503 y el cliente ofrece
// WhatsApp en vez de un error críptico. Server-only: nunca importa
// supabaseAdmin porque la foto viaja en base64 en el body, no como ruta de
// Storage (ver comentario de decisión en lib/ai/vision-upload.ts) — así que
// no hay ninguna llamada con service-role alcanzable desde el cliente.

export const maxDuration = 30;

const WHATSAPP_FOTO = whatsappUrl('Hola, quisiera que revisen una foto para mi cotización.');

// -----------------------------------------------------------------------------
// Abuso y coste. Más estricto que el chat (cada llamada es un modelo con visión):
// 10 fotos / 10 min por IP y un tope GLOBAL por hora. Contador compartido entre
// instancias (Postgres) con respaldo en memoria: lib/ai/abuse.ts.
const VISION_LIMITS = {
  scope: 'vision',
  perIp: { windowSeconds: 600, max: 10 },
  globalPerHour: globalCap(process.env, 'AI_VISION_GLOBAL_PER_HOUR', 120),
} as const;

/** 20 MB en base64 (×4/3) más el sobre JSON. Se corta la lectura al pasarlo. */
const VISION_MAX_BODY_BYTES = Math.ceil((VISION_MAX_BYTES * 4) / 3) + 1024;
const modelTimeoutMs = () => Number(process.env.AI_MODEL_TIMEOUT_MS) || 25_000;

const RequestSchema = z.object({
  imageBase64: z.string().trim().min(1),
  mediaType: z.enum(VISION_MIME_ALLOWLIST),
});

function fallback(status: number, error: string, message: string) {
  return Response.json({ error, message, whatsappUrl: WHATSAPP_FOTO }, { status });
}

export async function POST(req: Request) {
  // Falla cerrado y PRIMERO, antes de leer el body — mismo orden que /api/chat.
  if (await aiLimited(req.headers, VISION_LIMITS)) {
    return fallback(
      429,
      'rate_limited',
      'Está subiendo muchas fotos seguidas. Espere unos minutos, o envíenos la foto directo por WhatsApp.',
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback(503, 'vision_not_configured', 'El análisis de fotos no está disponible por ahora.');
  }

  const raw = await readBoundedText(req, VISION_MAX_BODY_BYTES);
  if (!raw.ok) {
    return raw.reason === 'too_large'
      ? fallback(413, 'file_too_large', 'La foto supera los 20 MB. Envíela por WhatsApp.')
      : fallback(400, 'bad_request', 'No se pudo leer la foto enviada.');
  }
  let body: unknown;
  try {
    body = JSON.parse(raw.text);
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
  // Lo declarado no basta: base64 bien formado y cabecera acorde al tipo.
  const head = Buffer.from(imageBase64.slice(0, 64), 'base64');
  if (!BASE64_RE.test(imageBase64) || !matchesImageSignature(mediaType, head)) {
    return fallback(400, 'bad_request', 'El archivo no es una imagen válida. Use JPG, PNG o WEBP, o envíela por WhatsApp.');
  }

  try {
    const { output: object } = await generateText({
      model: anthropic('claude-haiku-4-5'),
      output: Output.object({ schema: VisionModelOutputSchema }),
      instructions: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analice esta foto siguiendo exactamente las cuatro categorías de la instrucción del sistema.',
            },
            { type: 'file', mediaType, data: imageBase64 },
          ],
        },
      ],
      temperature: 0.3,
      maxOutputTokens: 700,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(modelTimeoutMs()),
    });

    const observation = parseVisionObservation(object);
    if (!observation) {
      // El modelo respondió algo que no cumple la estructura obligatoria
      // (p. ej. "unknown" vacío). Nunca se muestra una tarjeta a medias.
      console.error('[vision] respuesta del modelo no cumplió el esquema obligatorio');
      return fallback(
        502,
        'vision_invalid_response',
        'No se pudo analizar la foto de forma confiable. Envíela por WhatsApp y el equipo la revisa directamente.',
      );
    }

    return Response.json({ observation });
  } catch (err) {
    console.error('[vision] fatal error:', safeError(err));
    return fallback(
      500,
      'vision_failed',
      'El análisis de fotos no está disponible en este momento. Envíela por WhatsApp.',
    );
  }
}
