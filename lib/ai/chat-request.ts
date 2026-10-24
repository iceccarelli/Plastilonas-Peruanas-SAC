/**
 * Entrada NO CONFIABLE del chat. El navegador reenvía el historial completo en
 * cada turno, y nada impide que alguien lo fabrique: roles `system`, resultados
 * de herramientas inventados, partes de archivo, cientos de mensajes.
 *
 * Qué pasa por aquí y qué no:
 *  · solo roles `user` y `assistant`;
 *  · solo partes de TEXTO (ni herramientas, ni archivos, ni razonamiento): un
 *    resultado de herramienta forjado sería una instrucción con apariencia de
 *    dato propio. Las herramientas reales se vuelven a ejecutar en el servidor;
 *  · topes de cantidad de mensajes, de longitud por mensaje y de total;
 *  · el último mensaje debe ser del usuario;
 *  · `currentPage` solo si es una ruta interna sencilla (va al prompt del sistema).
 * Lo que no cumple se descarta o se rechaza; nunca se "arregla" adivinando.
 */
import type { UIMessage } from 'ai';

export const CHAT_MAX_BODY_BYTES = 128 * 1024;
export const CHAT_MAX_MESSAGES = 30;
export const CHAT_MAX_TEXT = 4000;
export const CHAT_MAX_TOTAL_CHARS = 24_000;

const PAGE_RE = /^\/[A-Za-z0-9\-._~/]{0,159}$/;

export type ChatRequest =
  | { ok: true; messages: Array<Omit<UIMessage, 'id'> & { id: string }>; currentPage: string | null }
  | { ok: false; error: 'invalid_request' | 'too_many_messages' | 'message_too_long' | 'conversation_too_long' };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Texto de un mensaje del cliente: `parts` de texto (v5+) o `content` heredado. null si no hay texto. */
function textOf(m: Record<string, unknown>): string | null {
  if (Array.isArray(m.parts)) {
    const chunks = m.parts
      .filter((p): p is Record<string, unknown> => isObj(p) && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string);
    return chunks.length ? chunks.join('\n') : null;
  }
  return typeof m.content === 'string' ? m.content : null;
}

export function parseChatRequest(raw: unknown): ChatRequest {
  if (!isObj(raw) || !Array.isArray(raw.messages) || raw.messages.length === 0) return { ok: false, error: 'invalid_request' };
  if (raw.messages.length > CHAT_MAX_MESSAGES) return { ok: false, error: 'too_many_messages' };

  const messages: Array<Omit<UIMessage, 'id'> & { id: string }> = [];
  let total = 0;
  for (const [i, m] of raw.messages.entries()) {
    if (!isObj(m) || (m.role !== 'user' && m.role !== 'assistant')) return { ok: false, error: 'invalid_request' };
    const text = textOf(m)?.trim() ?? null;
    if (text === null || text.length === 0) {
      // Un turno del asistente que solo tenía herramientas se omite; uno del usuario vacío es inválido.
      if (m.role === 'assistant') continue;
      return { ok: false, error: 'invalid_request' };
    }
    if (text.length > CHAT_MAX_TEXT) return { ok: false, error: 'message_too_long' };
    total += text.length;
    if (total > CHAT_MAX_TOTAL_CHARS) return { ok: false, error: 'conversation_too_long' };
    messages.push({ id: `m${i}`, role: m.role, parts: [{ type: 'text', text }] });
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') return { ok: false, error: 'invalid_request' };

  const page = typeof raw.currentPage === 'string' && PAGE_RE.test(raw.currentPage) ? raw.currentPage : null;
  return { ok: true, messages, currentPage: page };
}
