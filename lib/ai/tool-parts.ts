/**
 * Resultados de herramientas YA COMPLETADOS dentro de un mensaje de `useChat`
 * (AI SDK 5+): partes `tool-<nombre>` con `state: 'output-available'` y `output`,
 * o `dynamic-tool` con `toolName`. Sustituye al antiguo `tool-invocation` /
 * `toolInvocation.state === 'result'`.
 *
 * Solo lee lo que el servidor emitió tras EJECUTAR la herramienta; el cliente no
 * puede inyectar resultados en una conversación nueva porque el servidor ignora
 * toda parte que no sea texto (lib/ai/chat-request.ts).
 */
export interface CompletedToolResult {
  toolName: string;
  result: unknown;
}

type AnyPart = { type: string; state?: string; output?: unknown; toolName?: string };

export function completedToolResults(message: { parts?: ReadonlyArray<AnyPart> }): CompletedToolResult[] {
  const out: CompletedToolResult[] = [];
  for (const part of message.parts ?? []) {
    if (part.state !== 'output-available') continue;
    if (part.type === 'dynamic-tool' && typeof part.toolName === 'string') {
      out.push({ toolName: part.toolName, result: part.output });
    } else if (part.type.startsWith('tool-')) {
      out.push({ toolName: part.type.slice('tool-'.length), result: part.output });
    }
  }
  return out;
}
