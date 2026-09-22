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
import { Bot, Camera, Check, CheckCircle2, FileUp, ImageIcon, Loader2, MessageCircle, Pencil, Send, User, X } from 'lucide-react';
import ChatMarkdown from '@/components/ChatMarkdown';
import AssistantCard from '@/components/ai/AssistantCard';
import { deriveCardsFromToolResult } from '@/lib/ai/derive-card';
import type { AssistantResponse } from '@/lib/ai/schema';
import { getOrCreateProjectId } from '@/lib/ai/project-id';
import { INICIOS, seguimientosPara } from '@/lib/chat/intents';
import { trackAsistenteEngaged, trackQuoteStarted, trackWhatsAppClick } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/whatsapp';
import {
  buildReadinessChecklist,
  isReadyToQuote,
  mergeReadinessSignals,
  resolveProductSlug,
  type ReadinessField,
  type ReadinessFieldId,
  type ReadinessSources,
} from '@/lib/ai/readiness';
import {
  clearProjectDraftField,
  patchProjectDraft,
  readProjectDraft,
  type ProjectDraft,
} from '@/lib/ai/project-draft';
import type { PageContext } from '@/lib/ai/context';
import { archiveVisionImage, readFileAsBase64, validateVisionFile } from '@/lib/ai/vision-upload';
import { canUploadVisionImage, registerVisionUpload } from '@/lib/ai/vision-quota';

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

  /**
   * BORRADOR DEL PROYECTO — Sprint E.2. El estado estructurado que faltaba
   * para cerrar el bucle: antes, el checklist sólo leía el ÚLTIMO `buildRFQ`
   * de la conversación, así que bastaba con que el modelo no volviera a
   * llamar la tool en el turno siguiente para que un chip ya resuelto se
   * apagara y "Listo para cotizar" no encendiera nunca. Vive en
   * localStorage (lib/ai/project-draft.ts), al lado del id de proyecto.
   *
   * Arranca vacío SIEMPRE, incluso en el cliente: leer localStorage durante
   * el primer render daría un HTML distinto al del servidor. Se hidrata en
   * el efecto de abajo, igual que `projectId`.
   */
  const [draft, setDraft] = useState<ProjectDraft>({});
  /** Campo del checklist con el formulario de confirmación abierto, si hay alguno. */
  const [confirmando, setConfirmando] = useState<ReadinessFieldId | null>(null);

  /**
   * TARJETAS DE ANÁLISIS DE FOTO — no viven en `messages` (no son turnos de
   * chat: `/api/vision` es un endpoint aparte, no `streamText`) pero se
   * muestran en la misma columna de "Resultados" que las demás tarjetas
   * reales. Ver lib/ai/vision-readiness.ts para por qué NUNCA tocan
   * `readinessSignals`/`checklist` de abajo.
   */
  const [visionCards, setVisionCards] = useState<{ id: string; card: AssistantResponse }[]>([]);
  const [visionStatus, setVisionStatus] = useState<{ state: 'idle' | 'uploading' | 'error'; message?: string }>({
    state: 'idle',
  });

  useEffect(() => {
    setProjectId(getOrCreateProjectId());
    setDraft(readProjectDraft());
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

  /**
   * SUBE Y ANALIZA UNA FOTO — nunca simula un resultado mientras espera:
   * `visionStatus` pasa a 'uploading' y la tarjeta solo se agrega tras una
   * respuesta REAL de `/api/vision` (lib/ai/vision.ts hace cumplir en
   * código que esa respuesta tenga las cuatro categorías obligatorias).
   * Cualquier fallo —tipo/peso inválido, cuota de sesión agotada, red,
   * clave de Anthropic ausente, respuesta del modelo mal formada— termina en
   * `visionStatus.state === 'error'` con el mismo tipo de mensaje de
   * WhatsApp que ya usa el resto del sitio, nunca en un análisis inventado.
   */
  async function subirYAnalizarFoto(file: File) {
    const errorValidacion = validateVisionFile(file);
    if (errorValidacion) {
      setVisionStatus({ state: 'error', message: errorValidacion });
      return;
    }
    if (!canUploadVisionImage()) {
      setVisionStatus({
        state: 'error',
        message: 'Alcanzó el máximo de fotos de esta sesión. Puede enviarla directo por WhatsApp.',
      });
      return;
    }

    setVisionStatus({ state: 'uploading' });
    // Best-effort, no bloquea el análisis: ver decisión documentada en
    // lib/ai/vision-upload.ts sobre por qué el análisis no depende de esto.
    void archiveVisionImage(file, projectId ?? 'sin-sesion');

    try {
      const imageBase64 = await readFileAsBase64(file);
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType: file.type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.observation) {
        setVisionStatus({
          state: 'error',
          message:
            typeof data?.message === 'string'
              ? data.message
              : 'No se pudo analizar la foto. Puede enviarla directo por WhatsApp.',
        });
        return;
      }
      registerVisionUpload();
      setVisionCards((prev) => [...prev, { id: `vision-${Date.now()}-${prev.length}`, card: data.observation }]);
      setVisionStatus({ state: 'idle' });
      setTab('resultados');
    } catch {
      setVisionStatus({
        state: 'error',
        message: 'No se pudo analizar la foto. Puede enviarla directo por WhatsApp.',
      });
    }
  }

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
    const vistos = new Map<string, { slug: string; name: string; url: string }>();
    for (const { cards } of cardsPorMensaje) {
      for (const card of cards) {
        if (card.type === 'product') vistos.set(card.slug, { slug: card.slug, name: card.name, url: card.url });
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onArchivoFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void subirYAnalizarFoto(file);
  };

  /**
   * LAS CUATRO FUENTES REALES, EN UN SOLO OBJETO — Sprint E.2, tarea 3.
   * `mergeReadinessSignals` (lib/ai/readiness.ts) fija la precedencia y es
   * lógica pura: se puede probar con fixtures, sin DOM y sin una llamada
   * viva al modelo (test/ai-readiness-merge.test.ts).
   */
  const readinessSources: ReadinessSources = useMemo(
    () => ({
      draft,
      rfq: rfqDraft?.payload ?? null,
      tools: {
        productName: productosVistos[0]?.name ?? null,
        productSlug: productosVistos[0]?.slug ?? null,
        aplicacion: aplicacionConocida,
      },
      pageContext: { product: pageContext.product ?? null },
    }),
    [draft, rfqDraft, productosVistos, aplicacionConocida, pageContext.product],
  );

  /**
   * EL BORRADOR ABSORBE LO QUE LAS TOOLS YA CONFIRMARON.
   *
   * `buildRFQ` y `getApplication` son fuentes admitidas (ver el encabezado de
   * lib/ai/project-draft.ts): el modelo no las inventa, transcribe al esquema
   * algo que la persona dijo explícitamente. Guardarlas hace que el dato
   * sobreviva a los turnos en que el modelo no vuelve a llamar la tool —que
   * era justo el agujero— y a una recarga de página.
   *
   * NO se absorbe el producto que viene de `productosVistos` ni de
   * `pageContext`: haber MIRADO una ficha no es haber PEDIDO ese producto.
   * Esos dos siguen como señal viva en la fusión de arriba (encienden el
   * chip mientras duran) pero nunca se fijan al proyecto sin que la persona
   * lo confirme. Fijarlos sería convertir una visita en una decisión.
   */
  useEffect(() => {
    const patch: Partial<ProjectDraft> = {};
    const payload = rfqDraft?.payload;
    if (payload) {
      if (payload.producto) patch.productName = payload.producto;
      if (payload.slug) patch.productoSlug = payload.slug;
      if (payload.cantidad) patch.cantidad = payload.cantidad;
      if (payload.ciudad) patch.ciudad = payload.ciudad;
      if (payload.nombre) patch.nombre = payload.nombre;
      if (payload.telefono) patch.telefono = payload.telefono;
      if (payload.email) patch.email = payload.email;
      if (payload.mensaje) patch.nota = payload.mensaje;
    }
    if (aplicacionConocida) patch.aplicacion = aplicacionConocida;
    if (Object.keys(patch).length === 0) return;
    setDraft(patchProjectDraft(patch, rfqDraft ? 'rfq' : 'tool'));
  }, [rfqDraft, aplicacionConocida]);

  const readinessSignals = useMemo(() => mergeReadinessSignals(readinessSources), [readinessSources]);
  const checklist = buildReadinessChecklist(readinessSignals);
  const listoParaCotizar = isReadyToQuote(checklist);

  /** Slug real del producto — el dato que nunca se puede perder camino a /cotizacion. */
  const productoSlug = resolveProductSlug(readinessSources);
  /** Nota del proyecto: lo que la persona confirmó, o el detalle que armó `buildRFQ`. */
  const notaProyecto = draft.nota ?? rfqDraft?.payload.mensaje ?? null;

  /**
   * CHIP DESCONOCIDO → PREGUNTA → CONFIRMACIÓN (Sprint E.2, tarea 2).
   *
   * Antes, pulsar un chip sólo mandaba la pregunta al chat y ahí moría: si la
   * persona respondía y el modelo no llamaba `buildRFQ`, el dato no llegaba a
   * ninguna parte y el chip seguía gris. Ahora hace las dos cosas —pregunta
   * en la conversación Y abre el campo de confirmación— para que exista
   * SIEMPRE un camino que escribe estado estructurado sin depender de que el
   * modelo acierte a llamar la tool.
   *
   * Lo que este camino NO hace: leer la respuesta en texto libre del chat e
   * intentar adivinar de ahí la ciudad. Sólo se guarda lo que la persona
   * escribió en el campo y confirmó con el botón.
   */
  const pedirCampo = (campo: ReadinessField) => {
    setConfirmando(campo.id);
    enviarIntencion(campo.question);
  };

  /** Guarda lo confirmado en la UI. Único origen: lo que la persona tecleó. */
  const confirmarCampo = (patch: Partial<ProjectDraft>) => {
    setDraft(patchProjectDraft(patch, 'confirmado'));
    setConfirmando(null);
  };

  const borrarCampoDelBorrador = (campos: Array<Parameters<typeof clearProjectDraftField>[0]>) => {
    let siguiente = draft;
    for (const campo of campos) siguiente = clearProjectDraftField(campo);
    setDraft(siguiente);
    setConfirmando(null);
  };

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
      readinessSignals.ciudad ? `Ciudad de entrega: ${readinessSignals.ciudad}` : null,
      readinessSignals.aplicacion ? `Aplicación: ${readinessSignals.aplicacion}` : null,
      notaProyecto ? `Detalle: ${notaProyecto}` : null,
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
    // Slug primero SIEMPRE: /cotizacion resuelve el slug contra el catálogo
    // real y preselecciona el producto; con sólo el nombre puede no casar y
    // el comprador tiene que volver a elegirlo. El nombre es el respaldo.
    if (productoSlug) params.set('producto', productoSlug);
    else if (readinessSignals.productName) params.set('producto', readinessSignals.productName);
    if (notaProyecto) params.set('nota', notaProyecto);
    if (readinessSignals.ciudad) params.set('ciudad', readinessSignals.ciudad);
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
                <EmptyState
                  onIntencion={enviarIntencion}
                  disabled={isLoading}
                  onSubirImagen={() => fileInputRef.current?.click()}
                  onTomarFoto={() => cameraInputRef.current?.click()}
                  subiendoFoto={visionStatus.state === 'uploading'}
                />
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

            {/* Estado de la foto: nunca silencioso ni fingido — "subiendo",
                error con salida a WhatsApp, o nada cuando está inactivo. */}
            {visionStatus.state === 'uploading' && (
              <p className="px-4 py-2 text-xs text-gray-500 dark:text-[var(--text-muted)] flex items-center gap-1.5 border-t border-gray-100 dark:border-[var(--border)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando la foto…
              </p>
            )}
            {visionStatus.state === 'error' && (
              <p className="px-4 py-2 text-xs text-amber-800 bg-amber-50 border-t border-amber-100 flex items-center justify-between gap-2">
                <span>{visionStatus.message}</span>
                <a
                  href={whatsappUrl(visionStatus.message ?? 'Hola, quisiera enviar una foto para mi cotización.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium flex-shrink-0"
                >
                  WhatsApp
                </a>
              </p>
            )}

            {/* Inputs ocultos reales — accesibles desde EmptyState y desde aquí, sin duplicar lógica de subida. */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onArchivoFoto}
              className="sr-only"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={onArchivoFoto}
              className="sr-only"
            />

            <form onSubmit={onSubmit} className="p-3 border-t border-gray-100 dark:border-[var(--border)] flex gap-2">
              <button
                type="button"
                disabled={visionStatus.state === 'uploading'}
                onClick={() => fileInputRef.current?.click()}
                title="Subir una foto para que el asistente la analice"
                aria-label="Subir imagen"
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-[var(--border)] text-gray-500 dark:text-[var(--text-muted)] hover:border-[#059669] hover:text-[#047857] disabled:opacity-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
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
          {/* Tarjetas de foto: fuera del flujo de `messages` (endpoint aparte,
              ver subirYAnalizarFoto), así que se muestran primero, siempre. */}
          {visionCards.map(({ id, card }) => (
            <AssistantCard key={id} response={card} />
          ))}
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
          {sinConversacion && visionCards.length === 0 && (
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
              {listoParaCotizar && !confirmando && (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Listo para cotizar
                </p>
              )}
              {/*
                Los chips se muestran SIEMPRE, también con el checklist
                completo: antes, al encender "Listo para cotizar"
                desaparecían, y con ellos la única forma de ver —o corregir—
                lo que el proyecto había registrado. Un dato de entrega
                equivocado que ya no se puede revisar es peor que uno que
                falta. Ahora un chip verde es un botón: lo abre para editarlo.
              */}
              <div className="flex flex-wrap gap-1.5">
                {checklist.map((campo) =>
                  campo.known ? (
                    <button
                      key={campo.id}
                      type="button"
                      onClick={() => setConfirmando(confirmando === campo.id ? null : campo.id)}
                      aria-expanded={confirmando === campo.id}
                      className="group inline-flex items-center gap-1 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 px-3 py-1 transition-colors"
                      title={campo.detail ? `${campo.detail} — pulse para corregir` : 'Pulse para corregir'}
                    >
                      <CheckCircle2 className="w-3 h-3" /> {campo.label}
                      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  ) : (
                    <button
                      key={campo.id}
                      type="button"
                      onClick={() => pedirCampo(campo)}
                      aria-expanded={confirmando === campo.id}
                      className="text-xs rounded-full border border-dashed border-gray-300 dark:border-[var(--border)] text-gray-500 dark:text-[var(--text-muted)] hover:border-[#059669] hover:text-[#047857] px-3 py-1 transition-colors"
                      title={`Preguntar y confirmar: ${campo.question}`}
                    >
                      + {campo.label}
                    </button>
                  ),
                )}
              </div>

              {confirmando && (
                <ConfirmarCampo
                  campo={checklist.find((c) => c.id === confirmando)!}
                  draft={draft}
                  onConfirmar={confirmarCampo}
                  onBorrar={borrarCampoDelBorrador}
                  onCancelar={() => setConfirmando(null)}
                />
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 dark:text-[var(--text-muted)] mb-2">
                Cotización en curso
              </h3>
              {rfqDraft ? (
                <div className="text-sm text-[#0A2540] dark:text-[var(--text)] space-y-1">
                  {rfqDraft.payload.producto && <p>Producto: {rfqDraft.payload.producto}</p>}
                  {rfqDraft.payload.ciudad && <p>Ciudad de entrega: {rfqDraft.payload.ciudad}</p>}
                  {rfqDraft.missingFields.length > 0 ? (
                    <p className="text-xs text-amber-700">Falta: {rfqDraft.missingFields.join(', ')}</p>
                  ) : (
                    <p className="text-xs text-emerald-700">Lista para enviar</p>
                  )}
                  <Link
                    href={hrefCotizacion('asistente-proyecto')}
                    onClick={() => trackQuoteStarted('asistente', readinessSignals.productName ?? undefined, productoSlug ?? undefined)}
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
                  trackQuoteStarted('asistente', readinessSignals.productName ?? undefined, productoSlug ?? undefined)
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

/**
 * CONFIRMACIÓN DE UN CAMPO DEL CHECKLIST — Sprint E.2, tarea 2.
 *
 * ESTE ES EL ÚNICO CAMINO por el que un dato escrito por la persona entra al
 * `ProjectDraft`. La regla que hace cumplir en código: se guarda EXACTAMENTE
 * lo que se tecleó en estos campos y se envió con "Confirmar". Nunca se lee
 * el texto libre del chat para adivinar una ciudad, una cantidad ni un
 * contacto — ni siquiera cuando la respuesta parece obvia. Una ciudad de
 * entrega adivinada se paga en un flete perdido.
 *
 * `contacto` es el único chip con tres entradas porque el checklist lo trata
 * como un solo campo (nombre + teléfono o email, ver buildReadinessChecklist).
 */
function ConfirmarCampo({
  campo,
  draft,
  onConfirmar,
  onBorrar,
  onCancelar,
}: {
  campo: ReadinessField;
  draft: ProjectDraft;
  onConfirmar: (patch: Partial<ProjectDraft>) => void;
  onBorrar: (campos: Array<Parameters<typeof clearProjectDraftField>[0]>) => void;
  onCancelar: () => void;
}) {
  const esContacto = campo.id === 'contacto';
  const [nombre, setNombre] = useState(draft.nombre ?? '');
  const [telefono, setTelefono] = useState(draft.telefono ?? '');
  const [email, setEmail] = useState(draft.email ?? '');
  const [valor, setValor] = useState(() => {
    if (campo.id === 'producto') return draft.productName ?? '';
    if (campo.id === 'cantidad') return draft.cantidad ?? '';
    if (campo.id === 'ciudad') return draft.ciudad ?? '';
    if (campo.id === 'aplicacion') return draft.aplicacion ?? '';
    return '';
  });
  const primerCampo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampo.current?.focus();
  }, []);

  /** Contacto necesita nombre + al menos una vía; el resto, un valor no vacío. */
  const puedeConfirmar = esContacto
    ? Boolean(nombre.trim() && (telefono.trim() || email.trim()))
    : Boolean(valor.trim());

  /** Hay algo guardado que se pueda quitar (no basta con que el chip esté verde). */
  const camposGuardados = esContacto
    ? (['nombre', 'telefono', 'email'] as const).filter((c) => draft[c])
    : ([campo.id === 'producto' ? 'productName' : campo.id] as const).filter(
        (c) => draft[c as keyof ProjectDraft],
      );

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    if (esContacto) {
      onConfirmar({ nombre, telefono, email });
      return;
    }
    if (campo.id === 'producto') onConfirmar({ productName: valor });
    else if (campo.id === 'cantidad') onConfirmar({ cantidad: valor });
    else if (campo.id === 'ciudad') onConfirmar({ ciudad: valor });
    else if (campo.id === 'aplicacion') onConfirmar({ aplicacion: valor });
  }

  const inputClase =
    'w-full text-sm rounded-xl border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--surface)] text-[#0A2540] dark:text-[var(--text)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669]';

  return (
    <form
      onSubmit={enviar}
      className="mt-3 rounded-2xl border border-gray-200 dark:border-[var(--border)] bg-gray-50 dark:bg-[var(--surface)] p-3 space-y-2"
    >
      <p className="text-xs text-gray-600 dark:text-[var(--text-muted)]">{campo.question}</p>

      {esContacto ? (
        <>
          <label className="sr-only" htmlFor="confirmar-nombre">
            Nombre
          </label>
          <input
            id="confirmar-nombre"
            ref={primerCampo}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre y apellido"
            autoComplete="name"
            maxLength={120}
            className={inputClase}
          />
          <label className="sr-only" htmlFor="confirmar-telefono">
            Teléfono
          </label>
          <input
            id="confirmar-telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono (WhatsApp)"
            inputMode="tel"
            autoComplete="tel"
            maxLength={40}
            className={inputClase}
          />
          <label className="sr-only" htmlFor="confirmar-email">
            Email
          </label>
          <input
            id="confirmar-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            inputMode="email"
            autoComplete="email"
            maxLength={180}
            className={inputClase}
          />
          <p className="text-[11px] text-gray-400 dark:text-[var(--text-muted)]">
            Con el nombre y una vía de contacto basta.
          </p>
        </>
      ) : (
        <>
          <label className="sr-only" htmlFor={`confirmar-${campo.id}`}>
            {campo.label}
          </label>
          <input
            id={`confirmar-${campo.id}`}
            ref={primerCampo}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={campo.label}
            maxLength={campo.id === 'cantidad' || campo.id === 'ciudad' ? 80 : 200}
            className={inputClase}
          />
        </>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="submit"
          disabled={!puedeConfirmar}
          className="inline-flex items-center gap-1 text-xs font-semibold bg-[#047857] hover:bg-[#059669] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-xl transition-colors"
        >
          <Check className="w-3 h-3" /> Confirmar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] px-2 py-1.5 transition-colors"
        >
          <X className="w-3 h-3" /> Cancelar
        </button>
        {camposGuardados.length > 0 && (
          <button
            type="button"
            onClick={() => onBorrar([...camposGuardados] as Array<Parameters<typeof clearProjectDraftField>[0]>)}
            className="ml-auto text-xs text-gray-400 dark:text-[var(--text-muted)] hover:text-amber-700 px-2 py-1.5 transition-colors"
          >
            Quitar
          </button>
        )}
      </div>
    </form>
  );
}

/** Estado vacío: título, subtexto, atajos honestos, y subida de fotos real (el documento sigue "próximamente"). */
function EmptyState({
  onIntencion,
  disabled,
  onSubirImagen,
  onTomarFoto,
  subiendoFoto,
}: {
  onIntencion: (mensaje: string) => void;
  disabled: boolean;
  onSubirImagen: () => void;
  onTomarFoto: () => void;
  subiendoFoto: boolean;
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

      {/* Subir imagen y tomar foto: reales, suben a /api/vision (ver
          subirYAnalizarFoto). "Subir documento" sigue siendo un stub — este
          sprint solo cubre imágenes, nunca planos/PDF que no se analizan. */}
      <div>
        <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-2">
          Adjuntar una foto ayuda al asistente a entender su proyecto
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={subiendoFoto}
            onClick={onSubirImagen}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-[var(--text-muted)] border border-gray-200 dark:border-[var(--border)] hover:border-[#059669] hover:text-[#047857] rounded-full px-3.5 py-2 disabled:opacity-50 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Subir imagen
          </button>
          <button
            type="button"
            disabled={subiendoFoto}
            onClick={onTomarFoto}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-[var(--text-muted)] border border-gray-200 dark:border-[var(--border)] hover:border-[#059669] hover:text-[#047857] rounded-full px-3.5 py-2 disabled:opacity-50 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Tomar foto
          </button>
          <UploadStub icon={FileUp} label="Subir documento" />
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
      title="Próximamente: el análisis de documentos aún no está conectado."
      className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-[var(--text-muted)] border border-dashed border-gray-200 dark:border-[var(--border)] rounded-full px-3.5 py-2 cursor-not-allowed"
    >
      <Icon className="w-3.5 h-3.5" /> {label}
      <span className="text-[10px] uppercase tracking-wide text-gray-300">próx.</span>
    </button>
  );
}
