# Sprint conversión — Plastilonas AI gana dinero, no solo conversa

**Rama:** `feat/asistente-dinero-conversion` (base: `main` @ `b1d21b5`, post PR #29).
**Objetivo:** más RFQ completas y más handoffs a WhatsApp/cotización desde el asistente, sin inventar precios, certificaciones, clientes ni obras.

## Sprint A — Entrada contextual

Cada plantilla de página de alta intención ahora tiene un CTA secundario "Preguntar a Plastilonas AI" hacia `/asistente` con su contexto real:

| Página | Parámetro que pasa |
|---|---|
| `/productos/[slug]` | `producto=<slug>` |
| `/productos/familia/[slug]` | `pageType=family` |
| Resultado de calculadora (`CalculadoraForm.tsx`) | `calculadora=<slug>` |
| `/recursos/[slug]` (guía técnica) | `pageType=guide` |
| `/aplicaciones/[slug]` | `pageType=application` |
| `/industria/[sector]` | `pageType=industry` |
| Configurador de lona | `producto=lona-plastificada-rafia-polytarp&origen=configurador-lona` |

Todos usan el mismo componente `components/AsistenteAiLink.tsx` (mismo patrón que `WhatsAppLink.tsx`), y `/asistente/page.tsx` valida `pageType` contra el tipo real (`lib/ai/context.ts#PAGE_TYPES`) — nunca confía en un valor de query sin validar.

El widget flotante (`Chatbot.tsx`) ahora resuelve su propio "Abrir Plastilonas AI" con `inferPageType(pathname)`, la MISMA heurística que ya usa `/api/chat`, en vez de una regex propia — un solo lugar decide qué tipo de página es cada ruta.

**Evento nuevo:** `trackAsistenteCtaClick(context)` — nada existente cubría "clic para salir hacia /asistente desde una página de contenido" (distinto del primer mensaje ya dentro, que es `trackAsistenteEngaged`).

**Guía biblioteca no cubierta:** `app/(es)/biblioteca/[slug]/page.tsx` (una segunda plantilla de guía más delgada) quedó fuera por alcance — natural follow-up.

## Sprint B — Checklist de completitud (sin inventar un score)

`lib/ai/readiness.ts` define 5 campos determinísticos para que una cotización esté lista: **producto o familia, cantidad o medidas, ciudad de entrega, uso/aplicación, contacto (nombre + tel/email)**. Cada uno es *known*/*unknown* derivado SOLO de señales estructuradas reales ya en curso — el payload de `buildRFQ`, resultados de tools (`getProduct`, `searchProducts`, `getApplication`), o `PageContext`. Nunca se infiere de texto libre.

**Brecha honesta documentada, no forzada:** `ciudad` nunca puede marcarse *known* hoy — ninguna tool ni el payload de `buildRFQ` capturan la ciudad de entrega. El código lo dice explícitamente en vez de adivinarlo del chat.

"Mi proyecto" muestra los campos conocidos como chips llenos (✓ esmeralda) y los desconocidos como chips punteados; al hacer clic en uno desconocido se envía la pregunta específica que falta (mismo patrón de auto-envío que los chips de sugerencias existentes). Con los 5 conocidos, aparece "Listo para cotizar".

Verificado (no requirió cambios): **todo** CTA hacia `/cotizacion` desde `/asistente` ya pasaba `producto`, `nota` y `origen=asistente` — ningún slug se pierde en ningún camino.

**Canal paralelo de WhatsApp:** junto a "Cotizar ahora" hay un enlace de WhatsApp construido con `lib/whatsapp.ts#whatsappUrl()` y un mensaje armado del MISMO brief que el RFQ (producto, cantidad, mensaje) — nunca un mensaje genérico. Trackeado con `trackWhatsAppClick('asistente')`, la misma función que ya usa `WhatsAppLink.tsx` en el resto del sitio — ningún evento nuevo inventado para esto.

## Sprint C — Imagen que gana una cotización (multimodal, honesto)

Los botones "Subir imagen"/"Tomar foto" en `/asistente`, antes stubs deshabilitados, ahora funcionan:

- **Storage:** reutiliza el bucket `rfq-adjuntos` (mismo patrón que `CotizacionForm.tsx#subirArchivos`: `supabaseBrowser()` cargado de forma diferida, nunca `supabaseAdmin` en el cliente). La subida a Storage es una copia de archivo **best-effort** — si el bucket no está provisto en producción (ver `docs/HUMAN-GATES.md`, sigue pendiente), el análisis funciona igual porque la foto viaja como base64 directo al endpoint de visión, no como referencia de Storage.
- **Límites:** mismo allowlist MIME (JPEG/PNG/WEBP) y mismo `MAX_BYTES` (20 MB) que `CotizacionForm.tsx` — ningún umbral nuevo inventado. Cuota de cliente: 6 fotos por sesión (`lib/ai/vision-quota.ts`, localStorage, mismo estilo fail-open que `lib/ai/project-id.ts`).
- **`/api/vision`** (nuevo, server-only): mismo patrón de límite por IP en memoria que `/api/chat` y `/api/lead` — **10 peticiones / 10 minutos** (más bajo que el chat porque cada llamada invoca un modelo con visión, más cara, y porque la cuota de cliente ya cubre el uso normal). Se comprueba antes de leer el body y antes de la clave de Anthropic — mismo orden que `/api/chat`.
- **Honestidad exigida en código, no solo en el prompt:** `lib/ai/vision.ts#VisionModelOutputSchema` obliga a que `unknown` y `requiresConfirmation` sean arreglos NO vacíos. Un modelo que "olvida" declarar lo desconocido produce una respuesta que `safeParse` rechaza — la ruta nunca muestra una tarjeta a medias, cae a WhatsApp. Toda respuesta se divide en:
  - **OBSERVADO** — solo lo literalmente visible, nunca una medida inventada.
  - **INFERENCIA** — conjetura siempre marcada ("podría ser…, a confirmar"), puede ir vacía.
  - **DESCONOCIDO** — nombra lo que una foto nunca puede confirmar (dimensiones exactas, grado de material, certificaciones); nunca vacío.
  - **REQUIERE CONFIRMACIÓN** — qué debe verificar una persona antes de cotizar; nunca vacío.
- El análisis de fotos **nunca recomienda un producto específico del catálogo** por nombre — eso queda para el asistente de texto una vez confirmados los datos, para no mezclar "qué hay en la foto" con "qué vender".
- **Checklist de completitud (Sprint B) deliberadamente NO conectado** a las observaciones de la foto: una nota OBSERVADA en texto libre no tiene la misma certeza que una tool devolviendo un slug exacto, y una INFERENCIA/DESCONOCIDO nunca puede marcar un campo como conocido. Documentado en `lib/ai/vision-readiness.ts`, probado en `test/ai-vision-readiness.test.ts`.
- **Degradación:** sin `ANTHROPIC_API_KEY` → 503 + WhatsApp. Bucket ausente o subida fallida → se omite en silencio, el análisis sigue funcionando igual. Respuesta del modelo inválida → 502 + WhatsApp, nunca una tarjeta fabricada. Límite excedido → 429 + WhatsApp.

**Fuera de alcance:** "Subir documento" sigue como stub deshabilitado (solo imágenes esta vez); no hay arrastrar-y-soltar ni análisis en lote de varias fotos.

## Sprint D — Gates verificados

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | limpio |
| `npm test -- --run` | **76 archivos / 1189 tests**, todos verdes (línea base antes de este sprint: 73/1162 tras PR #29 — sin regresiones) |
| `test/afirmaciones.test.ts`, `test/dominio.test.ts`, `test/dominio-migracion.test.ts` | verdes, sin tocar |
| `test/chat-rate-limit.test.ts` (límite de #29) | verde — la 31.ª petición sigue devolviendo 429 con enlace de WhatsApp |
| `npm run auditar:imagenes` | 0 errores, 0 avisos (517 archivos, 201 rutas citadas) |
| `npm run auditar:navegacion` | 0 errores, 5 anchos × rutas reales incluyendo `/asistente`, 184 opciones |
| `npm run auditar:viewport` | Mismos 3 hallazgos preexistentes del recorte de cabecera "Cotizar" (280px) y áreas táctiles de `/productos`/`/cotizacion` que ya existían antes de este sprint — confirmados por comparación directa contra la base antes de los cambios, ninguno nuevo. Único hallazgo nuevo: un `<input type="file">` `sr-only` en `/asistente` marcado por el auditor como <24px — es intencionalmente invisible (el objetivo táctil real es el botón de 44×44px que lo dispara vía `.click()`), no una regresión de usabilidad. |

### Camino del dinero — verificado por código/tests, no en navegador

No hubo entorno de navegador disponible en este sandbox para una corrida visual completa. Cada paso quedó verificado así:

1. `/productos/<slug-real>` → CTA "Preguntar a Plastilonas AI" → `/asistente?producto=<slug>` → `page.tsx` resuelve el producto real vía `buildPageContext`/`findProductSnapshot` (nunca inventa un producto) — código y tipos verificados, falta una corrida visual humana antes de mergear.
2. Chips de "Mi proyecto" → clic en un campo desconocido → pregunta específica enviada — verificado por lectura de código y por los tests de `lib/ai/readiness.ts`.
3. CTA "Cotizar ahora"/RFQCard → `/cotizacion?origen=asistente&producto=&nota=` con campos reales — verificado, cubierto por tests que usan slugs reales de `lib/products.ts`.
4. Subir una foto → tarjeta de evidencia estructurada, sin números inventados — verificado por `test/ai-vision.test.ts` (validación de esquema) y por la garantía estructural de Zod, no por una corrida real contra la API de Anthropic con clave configurada.
5. Ráfaga contra `/api/chat` → sigue devolviendo 429 con WhatsApp — verificado por `test/chat-rate-limit.test.ts` (limitador en memoria, determinístico).
6. Widget flotante sigue funcionando en `/` — sin cambios de comportamiento, solo se enriqueció el contexto que ya pasaba (`inferPageType`).

**Antes de mergear/desplegar, una persona debe:**
- Confirmar visualmente en un navegador real los 6 pasos de arriba en `https://plastilonas-peruanas-sac.vercel.app` (móvil y escritorio).
- Confirmar que `ANTHROPIC_API_KEY` está configurada para probar el análisis de fotos con una llamada real (el esquema estructural ya impide una respuesta fabricada, pero nadie ha visto una respuesta real del modelo todavía).
- Revisar `docs/HUMAN-GATES.md` §2 — el bucket `rfq-adjuntos` sigue sin RLS de INSERT anónimo en producción; el análisis de fotos funciona igual sin él, pero la copia de archivo en Storage no.

## Instrumentación de conversión — antes/después

| Evento | Antes de este sprint | Después |
|---|---|---|
| Entrada a `/asistente` desde página de contenido | Solo desde el widget flotante | + CTA en 7 plantillas de página, evento `trackAsistenteCtaClick(context)` |
| Señal de completitud de RFQ | Ninguna — el usuario no sabía qué le faltaba | Checklist de 5 campos visible, "Listo para cotizar" explícito |
| Canales de conversión desde `/asistente` | Solo `/cotizacion` | `/cotizacion` (`trackQuoteStarted`) + WhatsApp paralelo (`trackWhatsAppClick`) con mensaje prellenado |
| Evidencia visual | Ninguna (subida deshabilitada) | Foto → tarjeta OBSERVADO/INFERENCIA/DESCONOCIDO/REQUIERE CONFIRMACIÓN, nunca inventada |

Ningún stack de analítica nuevo: todos los eventos pasan por `lib/analytics.ts`.
