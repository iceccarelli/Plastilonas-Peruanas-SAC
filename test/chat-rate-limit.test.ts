import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/chat/route';

/**
 * RATE LIMIT DE /api/chat — Fase 4.
 *
 * Mismo patrón en memoria que app/api/lead/route.ts (mapa IP -> {n, t},
 * ventana de 10 minutos), con un límite más alto (30/10min) porque el chat
 * admite varios turnos por sesión. La comprobación es la PRIMERA cosa que
 * hace el handler —antes de mirar ANTHROPIC_API_KEY y antes de leer el
 * body— así que estos casos nunca disparan una llamada real a Anthropic: se
 * verifican sin stub de la clave, y el 503 de "chat_not_configured" en las
 * primeras peticiones confirma justamente que el límite se cuenta ANTES de
 * cualquier red.
 */

function post(ip: string): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hola' }] }),
  });
}

describe('POST /api/chat — límite de tasa', () => {
  it('permite hasta 30 peticiones por IP en la ventana y bloquea la 31ª con 429', async () => {
    const ip = `test-ip-${Date.now()}-a`;
    let ultimaRespuesta: Response | undefined;
    for (let i = 0; i < 31; i++) {
      ultimaRespuesta = await POST(post(ip));
    }
    expect(ultimaRespuesta!.status).toBe(429);
    const json = await ultimaRespuesta!.json();
    expect(json.error).toBe('rate_limited');
    // El fallback de WhatsApp debe viajar en el 429: la misma URL que
    // construye lib/whatsapp.ts (whatsappUrl), nunca una escrita a mano.
    expect(typeof json.whatsappUrl).toBe('string');
    expect(json.whatsappUrl).toMatch(/^https:\/\/wa\.me\//);
  });

  it('nunca llega a streamText/Anthropic para una IP ya limitada: no hay más 503 tras el 429', async () => {
    // Sin ANTHROPIC_API_KEY en el entorno de test, cualquier petición que SÍ
    // llegue al cuerpo del handler respondería 503 (chat_not_configured), no
    // 429. Que la respuesta límite sea 429 y no 503 prueba que la
    // comprobación de límite ocurre antes que la de la clave.
    const ip = `test-ip-${Date.now()}-b`;
    for (let i = 0; i < 30; i++) {
      const res = await POST(post(ip));
      expect(res.status).toBe(503);
    }
    const bloqueada = await POST(post(ip));
    expect(bloqueada.status).toBe(429);
  });

  it('una IP distinta no se ve afectada por el límite de otra', async () => {
    const ipAgotada = `test-ip-${Date.now()}-c`;
    for (let i = 0; i < 31; i++) await POST(post(ipAgotada));
    const otraIp = `test-ip-${Date.now()}-d`;
    const res = await POST(post(otraIp));
    expect(res.status).not.toBe(429);
  });
});
