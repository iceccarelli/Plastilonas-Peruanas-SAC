'use client';

import { useCallback, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

/**
 * Chat del asistente sobre el AI SDK 7. Un solo sitio adapta la API del SDK a la
 * que usan los dos componentes (widget flotante y /asistente):
 *
 *  · el SDK ya no gestiona el campo de texto → `input` es estado local;
 *  · `append`/`handleSubmit` → `sendMessage({ text })`;
 *  · `isLoading` → `status` ('submitted' | 'streaming');
 *  · el contenido de un mensaje son PARTES: `textOf` junta las de texto.
 *
 * El servidor solo acepta texto de `user`/`assistant` (lib/ai/chat-request.ts):
 * las partes de herramienta que el cliente conserve para pintar tarjetas NO se
 * reenvían como contexto de confianza.
 */
export function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function useAsistenteChat(opts: { welcome: string; currentPage?: string }) {
  const [input, setInput] = useState('');
  const { welcome, currentPage } = opts;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: currentPage ? { currentPage } : undefined,
      }),
    [currentPage],
  );

  const initial: UIMessage[] = [{ id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: welcome }] }];
  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport,
    messages: initial,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const append = useCallback((text: string) => sendMessage({ text }), [sendMessage]);

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      const text = input.trim();
      if (!text || isLoading) return;
      setInput('');
      void sendMessage({ text });
    },
    [input, isLoading, sendMessage],
  );

  const handleInputChange = useCallback((e: { target: { value: string } }) => setInput(e.target.value), []);

  return { messages, input, handleInputChange, handleSubmit, append, isLoading, error };
}
