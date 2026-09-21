# Cierre del embudo — "Listo para cotizar" ya puede disparar

**Rama:** `claude/inspiring-curie-k1av8i`
**Fecha:** 2026-09-21
**Base:** `main @ c1c1556` (PR de cierre del sprint "asistente" ya en producción).
**Continúa de:** `docs/entregas/2026-09-21-plastilonas-ai-cierre.md`.

## El defecto que esto cierra

En `components/ai/AsistenteWorkspace.tsx`, `readinessSignals.ciudad` estaba
fijo en `null` para siempre: ninguna cantidad de conversación podía llenarlo,
así que `isReadyToQuote()` nunca devolvía `true`. El comprador podía dar
producto, cantidad, aplicación y contacto completos y el panel "Mi proyecto"
seguía mostrando un chip pendiente sin salida. Era el cuello de botella de
mayor apalancamiento del sprint: el resto del embudo (tarjetas honestas,
CTAs contextuales, visión de fotos) ya funcionaba: solo la ciudad de entrega
—dato real que el equipo comercial pide en el 100 % de los RFQ, según el
propio comentario de `CotizacionForm.tsx`— no tenía ningún camino desde el
chat hasta el checklist.

## Qué se cambió (Sprint E)

1. **`lib/ai/tools.ts` — `RFQPayloadSchema`/`buildRFQ`:** se agregó `ciudad`
   (string, ≤80 car., opcional) al esquema y a la descripción de la tool. El
   modelo la llena EXCLUSIVAMENTE cuando el usuario la dijo explícitamente en
   el chat — la instrucción es la misma que ya rige nombre/email/teléfono
   ("nunca inventes... si el usuario no los dio, déjalos fuera"), extendida a
   ciudad. No hay heurística de texto libre ni regex sobre `mensaje`: la única
   fuente es el campo estructurado que la tool valida.
2. **`lib/ai/schema.ts` — `RFQResponse.payload`:** mismo campo `ciudad`,
   para que `RFQCard` y el resto de consumidores tipados lo vean.
3. **`app/api/chat/route.ts`:** la línea del prompt que describe `buildRFQ`
   ahora nombra la ciudad de entrega entre los datos a capturar y pide
   llamar a la tool en cuanto el usuario la mencione (antes solo cubría
   nombre/email/teléfono/producto/cantidad/mensaje).
4. **`components/ai/AsistenteWorkspace.tsx`:**
   - `readinessSignals.ciudad` ahora lee `rfqDraft?.payload.ciudad` (antes:
     `null` fijo, con un comentario explicando por qué no había fuente).
   - `hrefCotizacion()` agrega `?ciudad=` a los dos enlaces "Cotizar ahora" /
     "Ir al formulario" del panel "Mi proyecto" — antes solo llevaban
     `producto` y `nota`.
   - `mensajeWhatsApp()` agrega la línea `Ciudad de entrega: …` cuando se
     conoce.
   - El resumen "Cotización en curso" del panel muestra la ciudad capturada.
5. **`components/ai/cards/RFQCard.tsx`:** muestra `payload.ciudad` en la
   tarjeta y la agrega a `?ciudad=` en el enlace "Revisar y enviar
   cotización" (misma construcción de querystring que ya usaba
   `AsistenteWorkspace`, sin una segunda lógica que pudiera divergir).
6. **`app/(es)/cotizacion/page.tsx`:** declara `ciudad` en su tipo de
   `searchParams` (lo exige `test/parametros-cotizacion.test.ts`, que compara
   los parámetros que los enlaces mandan contra los que la página lee), lo
   sanea (`.slice(0, 80)`) y lo pasa como `preselectedCiudad` a
   `CotizacionForm`.
7. **`components/CotizacionForm.tsx`:** nueva prop `preselectedCiudad` que
   precarga `ciudadEntrega` — mismo patrón ya usado para `preselectedProduct`
   y `preselectedMessage` (valor por defecto del formulario, `useEffect` que
   lo fuerza si llega tarde, y prioridad de la URL sobre el borrador
   guardado en `localStorage`).

Ningún endpoint nuevo, ninguna tool nueva, ninguna segunda ruta a
`/cotizacion`: el dato viaja por el mismo payload de `buildRFQ` y el mismo
querystring que ya existían para producto/cantidad/nota.

### Antes / después

| Pregunta | Antes | Después |
|---|---|---|
| ¿Puede "Listo para cotizar" disparar? | No, nunca — `ciudad` fijo en `null` | Sí, en cuanto el usuario da los 5 campos (producto, cantidad, ciudad, aplicación, contacto) |
| ¿La ciudad llega a `CotizacionForm`? | No existía ningún camino | Sí — `?ciudad=` precarga `ciudadEntrega`, campo obligatorio del formulario |
| ¿La ciudad llega al mensaje de WhatsApp? | No | Sí — línea `Ciudad de entrega: …` en `mensajeWhatsApp()` |
| ¿Se pierde `producto`/`nota`/`origen=asistente` en el camino? | No (ya funcionaba) | Sigue sin perderse; `ciudad` se sumó sin tocar esa lógica |

## Pruebas

- `lib/ai/readiness.ts`: comentario actualizado (ya no dice "ninguna tool
  captura ciudad"); se agregó una prueba que confirma que `ciudad` se marca
  `known` solo cuando la señal llega explícita.
- `test/ai-tools.test.ts`: prueba nueva — `buildRFQ` captura `ciudad` cuando
  el usuario la dio y la deja `undefined` cuando no, más una prueba de que
  sobrevive como `?ciudad=` hacia `/cotizacion` (mismo patrón que ya existía
  para `?producto=`/`?nota=`).
- `test/ai-derive-card.test.ts` y `test/ai-schema.test.ts`: `ciudad` viaja
  intacta por el adaptador tool → tarjeta y el esquema Zod la acepta.
- `test/ai-readiness.test.ts`: el fixture "isReadyToQuote es true solo
  cuando los cinco campos son conocidos" ya incluía `ciudad: 'Trujillo'` en
  el caso completo — con el fix, ese caso deja de estar "documentando un
  gap" y pasa a ser el camino feliz real.
- `test/parametros-cotizacion.test.ts` (ya existente, sin tocar) sigue
  verificando que todo parámetro que un enlace manda a `/cotizacion` está
  declarado en el tipo de `searchParams` de la página — cubre el `?ciudad=`
  nuevo automáticamente.

**Resultado:** `npx tsc --noEmit` limpio. `npx vitest run`: **76 archivos,
1193 pruebas** (línea base: 76/1189 + 4 pruebas nuevas de este sprint;
`afirmaciones.test.ts`/`dominio.test.ts` sin tocar y en verde).

## Sprint G — cobertura (hecho: gap de biblioteca)

`app/(es)/biblioteca/[slug]/page.tsx` era la única plantilla de contenido
técnico sin salida al asistente (gap ya señalado en el cierre anterior:
`recursos/[slug]`, `productos/[slug]`, `aplicaciones/[slug]`,
`productos/familia/[slug]` e `industria/[sector]` ya lo tenían). Se agregó
`AsistenteAiLink` junto al botón "Abrir RFQ" existente, mismo patrón que
`recursos/[slug]/page.tsx`: CTA secundario, nunca en lugar del RFQ directo,
con `context: 'biblioteca:<slug>'` para atribución y `producto=<slug
relacionado>` cuando la guía declara uno.

## Qué queda sin hacer en este pase (honesto, no fingido)

El resto de Sprint E–I definía un alcance mayor (borrador de proyecto en
`localStorage`, confirmación de campos de visión, Playwright E2E contra
producción, barrido completo de reachability/orphans de Sprint H, y el
trabajo de carga/lazy de Sprint I). Este pase se concentró en el ítem de
mayor apalancamiento («cash antes que coherencia antes que velocidad», como
pide el mandato) y en cerrarlo con pruebas reales, en vez de tocar
superficialmente ocho frentes a la vez:

- **Sprint F** (vision → draft, checkbox de confirmación por campo
  OBSERVADO): no se tocó. `lib/ai/vision-readiness.ts` sigue sin alimentar
  `readinessSignals` — sigue siendo la barrera correcta, documentada en el
  propio archivo, y no se debilitó.
- **Sprint G.2/G.3** (Playwright E2E contra build de producción, burst-test
  de rate limiting): no se ejecutó una suite Playwright nueva en este pase.
  Sí se corrieron y verificaron en verde, contra el build real:
  `npm run auditar:imagenes` (0 errores, 0 avisos) y
  `npm run auditar:navegacion` (0 errores, 184 opciones × 5 anchos).
- **Sprint H** (barrido completo de orphans/reachability más allá del gap de
  biblioteca cerrado arriba, consolidación de CTAs duplicados): no se hizo
  un inventario nuevo. La única señal que corrió en este pase
  (`auditar:imagenes`, `huerfanas.test.ts`) no encontró huérfanos nuevos.
- **Sprint I** (lazy/priority/defer): no se tocó ningún archivo de imágenes,
  layout o carga. Cero binarios modificados (no aplicaba: no se tocó
  ninguno).

## Verificación de "cero regresiones vs. #30"

- `npx vitest run` en la rama base (`main @ c1c1556`, sin estos cambios): 76
  archivos / 1189 pruebas en verde.
- Misma corrida sobre esta rama: 76 archivos / **1193** pruebas en verde (4
  nuevas, 0 fallidas, 0 saltadas).
- `npm run build` limpio en ambas ramas.
- `npm run auditar:viewport` (17 dispositivos × 4 rutas) da el **mismo
  resultado exacto** en `main` y en esta rama: 3 errores de recorte en
  Galaxy Fold (280px, cabecera "Cotizar") y 3 avisos de área táctil
  (producto en `/productos` a 430/412px, `<input>` en `/cotizacion` a
  2560px). Se confirmó corriendo el audit sobre el árbol *stasheado* al
  commit base antes de restaurar los cambios de esta rama: son defectos
  preexistentes de la navbar y de la grilla de `/productos`/`/cotizacion`
  que este sprint no toca ni intenta resolver (fuera de alcance: tocar la
  navbar exige el mismo audit + `auditar:navegacion`, y no es donde está el
  dinero de este sprint).
- `npm run auditar:navegacion` (17 dispositivos donde aplica, 12 grupos de
  menú, 184 opciones): 0 errores.

## Bloqueos humanos (documentados, no simulados)

Sin cambios respecto al cierre anterior — se listan de nuevo porque siguen
vigentes y condicionan Sprint F/adjuntos:

- Bucket `rfq-adjuntos` en Supabase Storage + política RLS de `INSERT`
  anónimo (hoy los adjuntos de `/cotizacion` viajan como lista de nombres si
  el bucket no existe).
- `CRM_WEBHOOK_URL` / `N8N_WEBHOOK_URL` para reenvío del lead.
- `RESEND_API_KEY` (opcional) para copia por correo del RFQ.
- Decisión `www` vs. apex en `CANONICAL_ORIGIN` — no tocada.
- `verificado: true` en `lib/projects.ts` antes de publicar cualquier obra o
  cliente nuevo — no se agregó ninguno.

## Cómo seguir desde aquí

El siguiente ítem de mayor apalancamiento es Sprint F (confirmar campos
OBSERVADO de una foto hacia el `ProjectDraft`/`buildRFQ`) porque cierra el
puente que ya existe a medias entre `/api/vision` y la cotización. Después,
Sprint G.2 (Playwright real contra un build servido) verificaría en CI lo
que aquí se verificó a mano.
