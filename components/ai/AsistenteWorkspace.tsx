'use client';

/**
 * WORKSPACE DE /asistente — Fase 2.
 *
 * NO es un clon de ChatGPT: usa la misma identidad navy/esmeralda del resto
 * del sitio (ver components/Navbar.tsx, components/Chatbot.tsx) y el MISMO
 * endpoint que el widget flotante (`/api/chat`, `app/api/chat/route.ts`,
 * `useChat` de `@ai-sdk/react`) — no hay un segundo backend de IA.
 *
 * ESTRUCTURA (ver docs/entregas de esta fase para el detalle de la decisión):
 *  - Escritorio (≥1024px, `lg:`): tres columnas — conversación (izquierda),
 *    tarjetas estructuradas (centro), "Mi proyecto" (derecha).
 *  - Móvil: pestañas Conversa / Resultados / Proyecto, un panel a la vez.
 *
 * TARJETAS REALES, NO INVENTADAS. `app/api/chat/route.ts` sigue usando
 * `streamText` (texto libre), no `generateObject` contra `AssistantResponse`
 * — cambiar eso habría significado tocar el endpoint que ya usa el widget
 * flotante. En vez de inventar una tarjeta de producto o de cotización con
 * datos de relleno, la columna central:
 *   1. Si el mensaje del asistente incluye una tool-invocation con resultado
 *      real (getProduct, buildRFQ — ver lib/ai/derive-card.ts), muestra la
 *      tarjeta tipada correspondiente con esos datos reales.
 *   2. Si no, muestra el texto del asistente en una tarjeta narrativa simple
 *      (NarrativeCard), igual que lo vería alguien en el widget flotante.
 * El resto de variantes de tarjeta (comparación, cálculo, riesgo…) están
 * construidas y listas mostrando datos reales cuando estén disponibles, pero
 * hoy no tienen un origen de datos automático desde este endpoint de texto —
 * ver el gap documentado para Fase 3 en el informe de entrega.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { Message } from 'ai';
import Link from 'next/link';
import { Bot, Camera, CheckCircle2, FileUp, ImageIcon, MessageCircle, Send, User } from 'lucide-react';
import ChatMarkdown from '@/components/ChatMarkdown';
import AssistantCard from '@/components/ai/AssistantCard';
import { deriveCardsFromToolResult } from '@/lib/ai/derive-card';
import type { AssistantResponse } from '@/lib/ai/schema';
import { getOrCreateProjectId } from '@/lib/ai/project-id';
import { INICIOS, seguimientosPara } from '@/lib/chat/intents';
import { trackAsistenteEngaged, trackQuoteStarted, trackWhatsAppClick } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/whatsapp';
import { buildReadinessChecklist, isReadyToQuote, type ReadinessSignals } from '@/lib/ai/readiness';
import type { PageContext } from '@/lib/ai/context';

interface Props {
  /** Contexto de página ya resuelto en el servidor (lib/ai/context.ts). */
  pageContext: PageContext;
  /** Ruta/consulta que se envía como `currentPage` al endpoint, igual que hoy hace el widget. */
  currentPage: string;
}

type Tab = 'conversa' | 'resultados' | 'proyecto';

/** Tarjetas derivadas de tool-invocations reales para UN mensaje del asistente. */
function cardsFromMessage(message: Message): AssistantResponse[] {
  const parts = message.parts ?? [];
  const cards: AssistantResponse[] = [];
  for (const part of parts) {
    if (part.type !== 'tool-invocation') continue;
    const invocation = part.toolInvocation;
    if (invocation.state !== 'result') continue;
    cards.push(...deriveCardsFromToolResult({ toolName: invocation.toolName, result: invocation.result }));
  }
  return cards;
}

export default function AsistenteWorkspace({ pageContext, currentPage }: Props) {
  const [tab, setTab] = useState<Tab>('conversa');
  const [projectId, setProjectId] = useState<string | null>(null);
  const engaged = useRef(false);

  useEffect(() => {
    setProjectId(getOrCreateProjectId());
  }, []);

  const { messages, input, handleInputChange, handleSubmit, append, isLoading, error } = useChat({
    api: '/api/chat',
    body: { currentPage },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          '¡Hola! Soy Plastilonas AI. Trabajo con el catálogo real de la empresa: no invento precios, certificaciones ni obras. Cuénteme qué necesita cubrir, ventilar, contener o transportar.',
      },
    ],
  });

  const sinConversacion = messages.length <= 1;

  const enviarIntencion = (mensaje: string) => {
    if (isLoading) return;
    if (!engaged.current) {
      engaged.current = true;
      trackAsistenteEngaged();
    }
    void append({ role: 'user', content: mensaje });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!engaged.current) {
      engaged.current = true;
      trackAsistenteEngaged();
    }
    handleSubmit(e);
  };

  const ultimo = messages[messages.length - 1];
  const chipsSeguimiento =
    !sinConversacion && !isLoading && !error && ultimo?.role === 'assistant'
      ? seguimientosPara(
          messages
            .slice(-2)
            .map((m) => m.content)
            .join('\n'),
        ).slice(0, 3)
      : [];

  // Todas las tarjetas derivadas de TODA la conversación, en orden. Sirve
  // tanto para la columna central como para el resumen de "Mi proyecto".
  const cardsPorMensaje = useMemo(
    () => messages.map((m) => ({ message: m, cards: m.role === 'assistant' ? cardsFromMessage(m) : [] })),
    [messages],
  );

  const productosVistos = useMemo(() => {
    const vistos = new Map<string, { name: string; url: string }>();
    for (const { cards } of cardsPorMensaje) {
      for (const card of cards) {
        if (card.type === 'product') vistos.set(card.slug, { name: card.name, url: card.url });
      }
    }
    return [...vistos.values()];
  }, [cardsPorMensaje]);

  const rfqDraft = useMemo(() => {
    for (let i = cardsPorMensaje.length - 1; i >= 0; i--) {
      const rfq = cardsPorMensaje[i].cards.find((c) => c.type === 'rfq');
      if (rfq && rfq.type === 'rfq') return rfq;
    }
    return null;
  }, [cardsPorMensaje]);

  const consultasDelUsuario = messages.filter((m) => m.role === 'user').length;

  /**
   * Señal real de "uso/aplicación conocida": `getApplication` (lib/ai/tools.ts)
   * devolvió un hub real (`found: true`). No se mapea a una tarjeta hoy
   * (ver lib/ai/derive-card.ts), así que se lee directo del tool-invocation —
   * el mismo dato que ya viaja en `message.parts`, nunca un texto adivinado.
   */
  const aplicacionConocida = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parts = messages[i].parts ?? [];
      for (const part of parts) {
        if (part.type !== 'tool-invocation') continue;
        const invocation = part.toolInvocation;
        if (invocation.toolName !== 'getApplication' || invocation.state !== 'result') continue;
        const result = invocation.result as { found?: boolean; application?: { name?: string } } | undefined;
        if (result?.found && result.application?.name) return result.application.name;
      }
    }
    return null;
  }, [messages]);

  const readinessSignals: ReadinessSignals = {
    productName: rfqDraft?.payload.producto ?? productosVistos[0]?.name ?? pageContext.product?.name ?? null,
    cantidad: rfqDraft?.payload.cantidad ?? null,
    // Ninguna tool ni PageContext capturan ciudad de entrega hoy — ver lib/ai/readiness.ts.
    ciudad: null,
    aplicacion: aplicacionConocida,
    nombre: rfqDraft?.payload.nombre ?? null,
    telefono: rfqDraft?.payload.telefono ?? null,
    email: rfqDraft?.payload.email ?? null,
  };
  const checklist = buildReadinessChecklist(readinessSignals);
  const listoParaCotizar = isReadyToQuote(checklist);

  /**
   * Mensaje de WhatsApp armado con el MISMO brief que ya alimenta la RFQCard
   * y este panel (producto, cantidad, nota) — nunca un texto genérico de
   * relleno. Canal paralelo a /cotizacion, no un reemplazo: quien prefiere
   * WhatsApp no tiene que repetir lo que ya contó en el chat.
   */
  function mensajeWhatsApp(): string {
    const lineas = [
      'Hola, vengo del asistente de Plastilonas AI y quiero cotizar:',
      readinessSignals.productName ? `Producto: ${readinessSignals.productName}` : null,
      readinessSignals.cantidad ? `Cantidad/medidas: ${readinessSignals.cantidad}` : null,
      rfqDraft?.payload.mensaje ? `Detalle: ${rfqDraft.payload.mensaje}` : null,
    ].filter((l): l is string => Boolean(l));
    return lineas.join('\n');
  }

  /**
   * MISMA construcción de querystring que components/ai/cards/RFQCard.tsx —
   * un solo camino hacia /cotizacion, nunca una segunda lógica que pueda
   * divergir. Antes, estos dos enlaces del panel "Mi proyecto" solo mandaban
   * `?origen=asistente` y descartaban el slug/producto y la nota que
   * buildRFQ ya había armado (visibles arriba, en la propia RFQCard), así
   * que llegar por aquí perdía lo que la persona ya contó en el chat.
   */
  function hrefCotizacion(origen: 'asistente' | 'asistente-proyecto'): string {
    const params = new URLSearchParams({ origen });
    if (rfqDraft?.payload.slug) params.set('producto', rfqDraft.payload.slug);
    else if (rfqDraft?.payload.producto) params.set('producto', rfqDraft.payload.producto);
    else if (pageContext.product?.slug) params.set('producto', pageContext.product.slug);
    if (rfqDraft?.payload.mensaje) params.set('nota', rfqDraft.payload.mensaje);
    return `/cotizacion?${params.toString()}`;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Encabezado ligero: quién es y en qué página se apoya (si viene de una). */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A2540] dark:text-[var(--text)]">Plastilonas AI</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">
          Espacio de trabajo del asistente comercial. Mismo catálogo, mismas reglas de honestidad que el chat del
          sitio — aquí con espacio para ver el detalle y armar su proyecto.
          {pageContext.product && (
            <>
              {' '}
              Contexto: <span className="font-medium text-[#047857]">{pageContext.product.name}</span>.
            </>
          )}
        </p>
      </div>

      {/* Pestañas — solo móvil/tablet angosta. */}
      <div className="lg:hidden mb-4 flex gap-1 rounded-2xl bg-gray-100 dark:bg-[var(--surface-muted)] p-1">
        {(
          [
            ['conversa', 'Conversa'],
            ['resultados', 'Resultados'],
            ['proyecto', 'Proyecto'],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-white dark:bg-[var(--surface-raised)] text-[#0A2540] dark:text-[var(--text)] shadow-sm'
                : 'text-gray-500 dark:text-[var(--text-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_320px] gap-6 items-start">
        {/* ───────────────────────── Conversación ───────────────────────── */}
        <section className={`${tab === 'conversa' ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white dark:bg-[var(--surface-raised)] border border-gray-100 dark:border-[var(--border)] rounded-3xl shadow-sm flex flex-col h-[min(70vh,720px)] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-3xl leading-snug ${
                      message.role === 'user'
                        ? 'bg-[#0A2540] text-white rounded-tr-none'
                        : 'bg-gray-50 dark:bg-[var(--surface-muted)] rounded-tl-none'
                    }`}
                  >
                    {message.role === 'assistant' ? <ChatMarkdown content={message.content} /> : message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-200 text-gray-600 rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {sinConversacion && !isLoading && (
                <EmptyState onIntencion={enviarIntencion} disabled={isLoading} />
              )}

              {chipsSeguimiento.length > 0 && (
                <div className="pl-10 flex flex-wrap gap-2">
                  {chipsSeguimiento.map((chip) => (
                    <button
                      key={chip.etiqueta}
                      type="button"
                      onClick={() => enviarIntencion(chip.mensaje)}
                      className="text-xs bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border)] hover:border-[#059669] hover:text-[#047857] px-3.5 py-2 rounded-full shadow-sm transition-colors"
                    >
                      {chip.etiqueta}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-gray-50 dark:bg-[var(--surface-muted)] px-4 py-3 rounded-3xl rounded-tl-none">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-center text-xs bg-amber-50 border border-amber-100 text-amber-800 py-3 px-4 rounded-2xl">
                  El asistente no está disponible en este momento. Escríbanos por WhatsApp o use{' '}
                  <Link href="/cotizacion" className="underline font-medium">
                    el formulario de cotización
                  </Link>
                  .
                </p>
              )}
            </div>

            <form onSubmit={onSubmit} className="p-3 border-t border-gray-100 dark:border-[var(--border)] flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Escriba su consulta..."
                className="flex-1 bg-gray-100 dark:bg-[var(--surface-muted)] px-4 py-2.5 text-sm rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#059669] placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-300 text-white w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* ─────────────────────── Tarjetas estructuradas ─────────────────────── */}
        <section className={`${tab === 'resultados' ? 'block' : 'hidden'} lg:block space-y-4`}>
          {cardsPorMensaje
            .filter(({ message }) => message.role === 'assistant' && message.id !== 'welcome')
            .map(({ message, cards }) =>
              cards.length > 0 ? (
                cards.map((card, i) => <AssistantCard key={`${message.id}-${i}`} response={card} />)
              ) : (
                <AssistantCard
                  key={message.id}
                  response={{ type: 'narrative', text: message.content || '…' }}
                />
              ),
            )}
          {sinConversacion && (
            <div className="bg-white dark:bg-[var(--surface-raised)] border border-dashed border-gray-200 dark:border-[var(--border)] rounded-3xl p-8 text-center text-sm text-gray-400 dark:text-[var(--text-muted)]">
              Las tarjetas de producto, cotización y predimensionamiento aparecerán aquí a medida que converse con el
              asistente.
            </div>
          )}
        </section>

        {/* ───────────────────────── Mi proyecto ───────────────────────── */}
        <section className={`${tab === 'proyecto' ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white dark:bg-[var(--surface-raised)] border border-gray-100 dark:border-[var(--border)] rounded-3xl shadow-sm p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-[#0A2540] dark:text-[var(--text)]">Mi proyecto</h2>
              <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-1">
                Resumen local de esta conversación. No requiere cuenta ni inicio de sesión.
              </p>
            </div>

            <div className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
              <span className="font-medium">Sesión: </span>
              <code className="text-[11px]">{projectId ? projectId.slice(0, 18) : '—'}</code>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--text-muted)] mb-2">
                Consultas realizadas
              </h3>
              <p className="text-sm text-[#0A2540] dark:text-[var(--text)]">{consultasDelUsuario}</p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--text-muted)] mb-2">
                Productos de interés
              </h3>
              {productosVistos.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">Ninguno todavía.</p>
              ) : (
                <ul className="space-y-1.5">
                  {productosVistos.map((p) => (
                    <li key={p.url}>
                      <Link href={p.url} className="text-sm text-[#047857] hover:text-[#059669] hover:underline">
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--text-muted)] mb-2">
                Datos para cotizar
              </h3>
              {listoParaCotizar ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Listo para cotizar
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {checklist.map((campo) =>
                    campo.known ? (
                      <span
                        key={campo.id}
                        className="inline-flex items-center gap-1 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1"
                        title={campo.detail}
                      >
                        <CheckCircle2 className="w-3 h-3" /> {campo.label}
                      </span>
                    ) : (
                      <button
                        key={campo.id}
                        type="button"
                        disabled={isLoading}
                        onClick={() => enviarIntencion(campo.question)}
                        className="text-xs rounded-full border border-dashed border-gray-300 dark:border-[var(--border)] text-gray-500 dark:text-[var(--text-muted)] hover:border-[#059669] hover:text-[#047857] px-3 py-1 transition-colors"
                        title={`Preguntar: ${campo.question}`}
                      >
                        + {campo.label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--text-muted)] mb-2">
                Cotización en curso
              </h3>
              {rfqDraft ? (
                <div className="text-sm text-[#0A2540] dark:text-[var(--text)] space-y-1">
                  {rfqDraft.payload.producto && <p>Producto: {rfqDraft.payload.producto}</p>}
                  {rfqDraft.missingFields.length > 0 ? (
                    <p className="text-xs text-amber-700">Falta: {rfqDraft.missingFields.join(', ')}</p>
                  ) : (
                    <p className="text-xs text-emerald-700">Lista para enviar</p>
                  )}
                  <Link
                    href={hrefCotizacion('asistente-proyecto')}
                    onClick={() => trackQuoteStarted('asistente', rfqDraft.payload.producto, rfqDraft.payload.slug)}
                    className="text-xs font-medium text-[#047857] hover:underline"
                  >
                    Ir al formulario →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                  Aún no hay una cotización en curso. Cuando dé sus datos, aparecerá aquí.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[var(--border)] space-y-2">
              <Link
                href={hrefCotizacion('asistente')}
                onClick={() =>
                  trackQuoteStarted('asistente', rfqDraft?.payload.producto ?? pageContext.product?.name, rfqDraft?.payload.slug ?? pageContext.product?.slug)
                }
                className="block text-center text-sm font-semibold bg-[#0A2540] hover:bg-[#047857] text-white px-4 py-2.5 rounded-2xl transition-colors"
              >
                Cotizar ahora
              </Link>
              {/* Canal paralelo, no un reemplazo del formulario: mismo brief real (lib/whatsapp.ts#whatsappUrl). */}
              <a
                href={whatsappUrl(mensajeWhatsApp())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('asistente')}
                className="inline-flex items-center justify-center gap-1.5 w-full text-sm font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-2xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Estado vacío: título, subtexto, atajos honestos y stubs de carga "próximamente". */
function EmptyState({
  onIntencion,
  disabled,
}: {
  onIntencion: (mensaje: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="pl-10 space-y-4">
      <div>
        <p className="text-base font-semibold text-[#0A2540] dark:text-[var(--text)]">¿Qué necesita resolver?</p>
        <p className="text-sm text-gray-400 dark:text-[var(--text-muted)] mt-1">
          Cuénteme el producto, la aplicación o la medida y le ayudo a encontrar la línea correcta del catálogo.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {INICIOS.map((intento) => (
          <button
            key={intento.etiqueta}
            type="button"
            disabled={disabled}
            onClick={() => onIntencion(intento.mensaje)}
            className="text-left text-sm bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border)] hover:border-[#059669] hover:text-[#047857] px-4 py-2.5 rounded-2xl shadow-sm transition-colors"
          >
            {intento.etiqueta}
          </button>
        ))}
      </div>

      {/* Stubs de carga: visiblemente deshabilitados. No se pretende analizar
          ninguna imagen o documento que no llega a ningún lado. */}
      <div>
        <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-2">Adjuntar contexto (próximamente)</p>
        <div className="flex flex-wrap gap-2">
          <UploadStub icon={ImageIcon} label="Subir imagen" />
          <UploadStub icon={FileUp} label="Subir documento" />
          <UploadStub icon={Camera} label="Tomar foto" />
        </div>
      </div>
    </div>
  );
}

function UploadStub({ icon: Icon, label }: { icon: typeof ImageIcon; label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Próximamente: el análisis de imágenes y documentos aún no está conectado."
      className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-[var(--text-muted)] border border-dashed border-gray-200 dark:border-[var(--border)] rounded-full px-3.5 py-2 cursor-not-allowed"
    >
      <Icon className="w-3.5 h-3.5" /> {label}
      <span className="text-[10px] uppercase tracking-wide text-gray-300">próx.</span>
    </button>
  );
}
