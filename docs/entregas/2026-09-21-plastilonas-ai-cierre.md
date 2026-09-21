# Cierre — "Plastilonas AI" (Fase 3, endurecimiento y cableado)

**Rama:** `feat/plastilonas-ai-asistente`
**Fecha:** 2026-09-21
**Continúa de:** `docs/entregas/2026-09-21-plastilonas-ai-audit.md` (Fase 0), Fase 1 (`lib/ai/{context,tools,schema}.ts` + tool-calling en `app/api/chat/route.ts`) y Fase 2 (`app/(es)/asistente`, `components/ai/*`).

Esta fase no agrega tools ni rutas nuevas: cierra huecos que la Fase 2 dejó documentados a propósito (mapeos de tarjeta, analítica, verificación del camino de RFQ) y deja constancia escrita de seguridad y de lo que sigue sin construir.

## 1. `lib/ai/derive-card.ts` — mapeos nuevos

Se agregaron 5 mapeos, todos copia literal de un resultado de tool real (nunca un campo inventado):

| Tool | Tarjeta | Nota |
|---|---|---|
| `searchProducts` | `ProductResponse[]` (una por resultado) | Reusa el mismo recorte que `getProduct`. |
| `compareProducts` | `ComparisonResponse` | Filas "Familia/Sector/Origen/Disponibilidad"; una fila se omite si ningún producto la tiene. |
| `runCalculation` | `CalculationResponse` | Solo cuando `found:true`; `principales`/`avisos`/`noCubre` calzan exacto con el shape de `lib/calculadoras.ts`. |
| `getFrameworkRequirement` | `RiskResponse` | Solo cuando la tool devolvió UN criterio (`pillarId`+`criterionId`); el listado de pilares no tiene pregunta/riesgo y se deja sin tarjeta. |
| `getCompanyFact` | `EvidenceResponse` | Solo `fact !== 'all'`; `sourceType: 'facts'`. |
| `getPublishedProjects` | `EvidenceResponse` | Solo si `count > 0`; lista vacía no genera tarjeta (el texto del modelo ya dice honestamente que no hay evidencia). |

**No mapeadas a propósito** (documentado en el propio archivo): `getProductFamily`, `getApplication`, `getGuide`, `getGlossaryTerm`, `listCalculations`. Sus resultados no calzan con ninguna variante existente de `AssistantResponse`; forzarlos exigiría inventar campos o una variante de esquema nueva, que es decisión de esquema, no de este adaptador.

Cambio de firma: `deriveCardFromToolResult` (singular) queda como wrapper deprecado; el nuevo `deriveCardsFromToolResult` devuelve siempre un arreglo, para soportar `searchProducts` sin que el llamador distinga singular de plural. `components/ai/AsistenteWorkspace.tsx` se actualizó a la nueva firma.

## 2. Analítica

- **`trackAsistenteEngaged()`** (nueva, evento `asistente_engaged`) — se dispara una sola vez por sesión de `/asistente`, en el primer mensaje (mismo patrón de guarda `engaged.current` que ya usa `trackChatbotEngaged()` en el widget). Es un evento propio, no una reutilización de `chatbot_engaged`, porque `/asistente` es una superficie distinta del widget flotante y el negocio necesita comparar cuánta intención entra por cada una.
- **`trackQuoteStarted`** (ya existía, `rfq_start`) — se reutilizó tal cual, sin inventar un nombre nuevo, en tres puntos de `/asistente` que llevan a `/cotizacion`: el CTA de `RFQCard`, el enlace "Ir al formulario" y el botón "Cotizar ahora" del panel "Mi proyecto". Todos pasan `context: 'asistente'` y el slug/nombre de producto cuando se conoce.

## 3. Camino de RFQ — verificado, un ajuste

`app/(es)/cotizacion/page.tsx` **ya leía** `producto`, `nota`/`notas` y `origen` desde antes de esta fase (confirmado leyendo el archivo y `test/parametros-cotizacion.test.ts`, que compara ambos extremos del enlace). `RFQCard` enlaza a `/cotizacion?origen=asistente&producto=...&nota=...` y los tres llegan. No hizo falta cablear nada nuevo aquí — el único cambio fue agregar el disparo de `trackQuoteStarted` al hacer clic (punto 2).

## 4. Checklist de seguridad

| Ítem | Resultado | Evidencia |
|---|---|---|
| (a) `supabaseAdmin` en `components/ai/*` o `app/(es)/asistente/*` | **PASA** — cero apariciones | `grep -rn "supabaseAdmin" components/ai "app/(es)/asistente"` sin coincidencias |
| (b) `lib/ai/tools.ts` no expone lectura/escritura fuera del catálogo público | **PASA** — todas las tools son de solo lectura contra libs de dominio (`products`, `facts`, `framework`, `calculadoras`, `guides`, `applications`, `glosario`, `projectsPublicados`); `buildRFQ` arma un payload pero nunca hace `fetch`/POST ni importa `supabaseAdmin` | Revisión de los 25 imports de `lib/ai/tools.ts`; ninguno es de `lib/supabase.ts` |
| (c) `getOrCreateProjectId` nunca viaja a un endpoint | **PASA** — el id solo se usa en `useState`/`useEffect` y se muestra truncado en el panel "Mi proyecto"; no aparece en el `body` de `useChat` ni en ningún `fetch` | `grep -rn "getOrCreateProjectId\|projectId"` en `lib/ai/project-id.ts`, `components/ai`, `app/(es)/asistente`, `app/api/chat` |
| (d) Rate limiting de `/api/chat` sin bypass | **PASA con nota** — `/asistente` reutiliza `/api/chat` sin ruta ni parámetro nuevo, así que cualquier limitación (o ausencia de ella) es la misma para el widget y para el workspace. Nota honesta: `/api/chat` **no tiene rate limiting propio** hoy (ni lo tenía en Fase 1/2 — el único limitador de la Fase 0 es el de `/api/lead`, 12/10min por IP). Esta fase no introduce ni retira nada al respecto; queda como gap preexistente, no una regresión de esta fase. |

## 5. Test añadido

`test/ai-cards.test.ts` (13 tests) — verifica, contra `AssistantResponse.options` (la fuente de verdad del esquema, no una lista copiada a mano), que `components/ai/AssistantCard.tsx` tiene un `case` literal por variante, conserva la guardia `never` de exhaustividad, y no tiene cases huérfanos. Sigue la convención de este repo de pruebas que leen archivos fuente como texto (`test/parametros-cotizacion.test.ts`, `test/analytics.test.ts`) en vez de renderizar React — el `vitest.config.ts` de este repo solo incluye `test/**/*.test.ts` (sin `.tsx`) y corre en entorno `node`, no `jsdom`.

## 6. Validación

- `npx tsc --noEmit` — limpio, sin errores.
- `npm test -- --run` — **70 archivos, 1131 tests, todos en verde** (antes de esta fase: 69 archivos / 1118 tests; +1 archivo, +13 tests, cero regresiones).

## 7. Checklist manual de éxito del encargo — estado real

Ninguno de estos puntos se verificó abriendo un navegador en esta sesión (agente sin runtime de UI). Se marca cada uno como verificado por lectura de código/tests, o como pendiente de verificación humana antes de mergear:

| Punto | Estado |
|---|---|
| Abrir `/` → chat flotante presente | **Verificado por código**: `components/Chatbot.tsx` sigue montado igual que antes de esta fase (sin cambios de esta fase); no verificado visualmente. |
| Abrir `/asistente` → estado vacío | **Verificado por código**: `AsistenteWorkspace` renderiza `EmptyState` cuando `sinConversacion` (mensajes ≤ 1); no verificado visualmente. |
| Preguntar algo de catálogo → tarjeta con datos reales y enlace real a producto | **Verificado por código y test**: `getProduct`/`searchProducts` → `ProductCard` con `url: /productos/<slug>` real de `lib/products.ts`; **pendiente de verificación humana** en navegador con `ANTHROPIC_API_KEY` configurada (esta sesión no ejecutó el modelo). |
| Desde una ficha de producto, abrir la IA con contexto del slug | **Verificado por código**: `Chatbot.tsx` arma `hrefAsistente` con `?producto=slug`; `/asistente/page.tsx` lo lee y lo pasa a `buildPageContext`/`currentPage`. No verificado visualmente. |
| Falta de información actualiza el panel de proyecto | **Verificado por código**: `rfqDraft`/`productosVistos` en `AsistenteWorkspace` se recalculan de `cardsPorMensaje` con `useMemo`; el panel "Mi proyecto" los refleja. No verificado con una conversación real end-to-end. |
| Camino de RFQ reutiliza `/api/lead` | **Verificado por código y test**: `RFQCard` enlaza a `/cotizacion` (nunca hace POST); `/cotizacion` → `CotizacionForm` → `/api/lead` (sin cambios de ruta). Ningún componente de `/asistente` llama a `/api/lead` directamente — un solo POST de creación de lead sigue existiendo. |
| Sin ISO/precios/obras inventados | **Verificado por código**: `getCompanyFact` solo lee `STATS`/`lib/facts.ts`; `getPublishedProjects` solo lee `projectsPublicados` (filtrado por `verificado: true`); ningún producto expone `price` salvo `purchasable: true`. Cubierto también por `test/afirmaciones.test.ts` (preexistente, sigue en verde). |

## 8. Gaps que esta fase NO cierra (explícitos para el reporte humano)

1. **Visión/carga de imágenes**: siguen siendo stubs deshabilitados (`UploadStub` en `AsistenteWorkspace.tsx`, texto "próximamente"). No hay análisis de imagen real conectado.
2. **Cuotas de uso de IA vía Stripe**: no existen. `/api/chat` no tiene límite de uso por cliente ni facturación asociada al consumo del asistente.
3. **Proyectos guardados/persistentes entre dispositivos**: el panel "Mi proyecto" es 100% `localStorage` anónimo (`lib/ai/project-id.ts`), sin cuenta ni sincronización — se pierde al cambiar de navegador o borrar datos del sitio.
4. **Pulido de pipeline completo de `searchProducts`/`compareProducts`/`runCalculation`**: esta fase los conectó a tarjeta, pero no se optimizó ranking de búsqueda, ni se agregaron más filas de comparación de las cuatro genéricas (Familia/Sector/Origen/Disponibilidad) — comparar especificaciones técnicas línea por línea seguiría siendo trabajo de una fase futura si se necesita.
5. **`generateObject`/streaming estructurado**: `app/api/chat/route.ts` sigue usando `streamText` (texto libre) con mapeo de tool-results a tarjeta en el cliente, no `generateObject` contra `AssistantResponse`. Decisión ya tomada en Fase 2 y mantenida aquí para no arriesgar romper el widget flotante que consume el mismo endpoint.
6. **Rate limiting propio de `/api/chat`**: no existe (ver punto 4(d) del checklist de seguridad) — gap preexistente desde Fase 1, no introducido ni cerrado por esta fase.

## No commiteado

Esta fase no crea commits; el orquestador confirma y commitea los cambios de `lib/ai/derive-card.ts`, `components/ai/AsistenteWorkspace.tsx`, `components/ai/cards/RFQCard.tsx`, `lib/analytics.ts`, `test/ai-cards.test.ts` y este documento.
