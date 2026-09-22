# Cierre del embudo — "Listo para cotizar" ya puede disparar

**Rama:** `claude/inspiring-curie-k1av8i`
**Fecha:** 2026-09-21 · **Ampliado:** 2026-09-22 (Sprints E.2, F, G, H, I)
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

## Sprint E.2 — El bucle de readiness, cerrado de verdad

El Sprint E hizo que `ciudad` pudiera llegar. No alcanzaba, por dos agujeros
que se veían solo al usar el asistente como lo usa un comprador:

1. **El checklist leía únicamente el ÚLTIMO `buildRFQ` de la conversación.**
   Bastaba con que el modelo no volviera a llamar la tool en el turno
   siguiente para que un chip ya resuelto volviera a gris. "Listo para
   cotizar" dependía de que el modelo acertara a llamar una tool en el turno
   correcto — es decir, de la suerte.
2. **Los chips solo mandaban la pregunta al chat.** Si la persona respondía
   y el modelo no llamaba `buildRFQ`, el dato no llegaba a ninguna parte.

### Qué se construyó

- **`lib/ai/project-draft.ts` (nuevo).** Estado estructurado del proyecto en
  `localStorage`, al lado de `pp_asistente_project_id`. Campos:
  `productoSlug`, `productName`, `cantidad`, `ciudad`, `aplicacion`,
  `nombre`, `telefono`, `email`, `nota`, `visionEvidenceIds[]`.
  Cuatro fuentes admitidas y ninguna más: `pageContext`, resultado de tool,
  `buildRFQ`, o confirmación explícita en la UI. Un patch vacío **nunca**
  borra un dato ya confirmado; `clearProjectDraftField` es el único camino
  para quitar uno. Nunca lanza: en SSR, en modo privado o con `localStorage`
  bloqueado se comporta como un borrador vacío.
- **`mergeReadinessSignals` / `resolveProductSlug` en `lib/ai/readiness.ts`.**
  Funden las cuatro fuentes con precedencia explícita —confirmado >
  `buildRFQ` > tool > `pageContext`— y son **lógica pura**: sin DOM, sin
  modelo, probables con fixtures.
- **Chip desconocido → pregunta en el chat *y* campo de confirmación.** Hay
  siempre un camino que escribe estado estructurado sin depender de que el
  modelo llame la tool. Solo se guarda lo que la persona teclea y confirma:
  no se lee el texto libre del chat para adivinar una ciudad.
- **Los chips ya no desaparecen al completarse.** Antes, al encender "Listo
  para cotizar" se ocultaban, y con ellos la única forma de *revisar* lo que
  el proyecto había registrado. Un dato de entrega equivocado que ya no se
  puede corregir es peor que uno que falta. Ahora un chip verde es un botón
  que lo abre para editarlo.
- **El borrador absorbe `buildRFQ` y `getApplication`**, así el dato
  sobrevive a los turnos sin tool y a una recarga. **No** absorbe el producto
  de `pageContext` ni de `productosVistos`: haber mirado una ficha no es
  haber pedido ese producto. Esos siguen como señal viva, nunca como
  decisión fijada.

### Antes / después (E.2)

| Pregunta | Antes de E.2 | Después |
|---|---|---|
| ¿Un chip resuelto puede volver a gris? | Sí, en cuanto el modelo dejaba de llamar `buildRFQ` | No: el borrador lo retiene |
| ¿Sobrevive a una recarga de página? | No | Sí (`localStorage`) |
| ¿Hay camino a "Listo" sin llamada al modelo? | No | Sí, por confirmación en la UI |
| ¿Se puede corregir un dato equivocado? | No: los chips se ocultaban al completarse | Sí: cada chip verde se abre para editar |
| ¿Se adivina la ciudad del texto libre? | — | No, y hay prueba de ello |

## Sprint F — Puente honesto foto → proyecto

Tras una tarjeta de visión válida, cada tick de **OBSERVADO** se puede
adjuntar al proyecto con "Confirmar para el proyecto". Nada automático:
sigue siendo la persona quien afirma.

Dos reglas, hechas cumplir **en código** y no solo en el prompt:

1. **Solo OBSERVADO es confirmable.** El callback se pasa únicamente a esa
   sección; INFERENCIA, DESCONOCIDO y REQUIERE CONFIRMACIÓN se renderizan
   sin callback, así que no existe en el árbol un botón capaz de
   confirmarlas. Además `buildVisionConfirmationPatch` devuelve `null` para
   cualquier índice fuera de `observed`.
2. **Lo confirmado entra como NOTA, nunca como dato estructurado.** El patch
   solo puede tocar `nota` y `visionEvidenceIds`. De una foto no sale una
   cantidad, una ciudad ni una certificación: una medida sacada de una foto
   es una cotización equivocada, y una certificación sacada de una foto es
   una afirmación que la empresa no puede sostener.

`deriveReadinessSignalFromVision` **sigue devolviendo `{}`**: ninguna foto
marca sola un chip. El compilador refuerza la separación —
`VisionConfirmationPatch` no comparte ninguna propiedad con
`ProjectDraftSignals`, así que pasarlo a `mergeReadinessSignals` no compila
(TS2559). La subida de documento sigue siendo stub, sin cambios.

## Sprint G — La prueba que sí vale dinero

`scripts/camino-dinero.mjs` + `scripts/probar-dinero.sh`
(**`npm run probar:dinero`**): navegador real contra el sitio **compilado**.

Las 1234 pruebas de vitest leen archivos y llaman funciones. Pueden demostrar
que `mergeReadinessSignals` enciende "Listo para cotizar" con las cinco
señales, pero **no** que un comprador llegue a ponerlas. Entre la función
correcta y la venta hay un CTA en la ficha, un panel visible, un formulario
que tiene que *escribir* estado y un `/cotizacion` que tiene que llegar
precargado. Cada uno ha estado roto alguna vez con la suite entera en verde.

- **TRAMO 1** — ficha → CTA contextual → `/asistente?producto=` → confirmar
  cantidad, ciudad, uso y contacto → "Listo para cotizar" → `/cotizacion`
  con ciudad y producto precargados → brief de WhatsApp con los mismos datos
  y sin ningún precio. Cada confirmación se verifica leyendo el borrador del
  propio navegador: un "Confirmar" que no escribe estado es justo el fallo
  que esta prueba existe para ver.
- **TRAMO 2** — foto: o analiza de verdad, o dice que no puede. Nunca inventa.
- **TRAMO 3** — ráfaga a `/api/chat` → 429; `/api/vision` sigue limitando por
  su cuenta. Va al final a propósito: agotar el cubo deja el chat limitado
  10 minutos, y cualquier tramo posterior mediría un sitio artificialmente
  roto.
- **TRAMO 4** — alcanzabilidad (ver Sprint H).

**El Tramo 1 no necesita clave de Anthropic, y eso no es un atajo de la
prueba: es la propiedad que el Sprint E.2 existe para dar.** Si el camino a
"Listo para cotizar" dependiera de que el modelo acertara a llamar
`buildRFQ`, esta prueba no podría correr sin clave — y el comprador tampoco
podría cotizar cuando el modelo no la llamara.

**Resultado: 26/26 comprobaciones.**

### Dos defectos del arnés, encontrados al usarlo

1. **El apagado dejaba un servidor vivo ocupando el puerto.** `kill`
   mataba el `npx`, no su hijo `next-server`. La ejecución siguiente
   encontraba algo que contestaba, lo daba por "servidor listo" y medía el
   servidor **viejo** creyendo medir el nuevo. Medido: la ráfaga dio 429 en
   la petición 1 porque el cubo ya estaba gastado de la corrida anterior.
   Ahora se apaga el grupo de procesos (`setsid` + `kill -PGID`) y se aborta
   si el puerto ya responde. **El mismo fallo estaba en
   `scripts/diagnostico.sh`**, que es el único instrumento del repositorio
   que mide la página renderizada.
2. **`getByText` compara por subcadena e ignorando mayúsculas**, así que
   buscar "Análisis de foto" daba positivo dentro del mensaje de error "El
   análisis de fotos no está disponible". La prueba entraba en la rama
   equivocada. La tarjeta se detecta ahora por texto exclusivo suyo.

### Limitación declarada

La rama del Tramo 2 que confirma una observación real solo corre **con**
`ANTHROPIC_API_KEY` (sin clave, `/api/vision` responde 503 y lo que se
comprueba es que la UI lo dice en vez de inventar — que también es una
prueba, no una excusa). La lógica de confirmación en sí está cubierta por
`test/ai-vision-readiness.test.ts`, que no necesita clave.

## Sprint H — Una sola pila, sin huérfanos

### Alcanzabilidad: 14 callejones sin salida, cerrados

El TRAMO 4 mide si una página que informa ofrece **algún** camino a cotizar
dentro de su contenido. Se mide dentro de `<main>` a propósito: el navbar y
el pie tienen enlaces a `/cotizacion` y a WhatsApp en todas las páginas, así
que comprobarlos daría verde siempre y no diría nada.

**Lo que encontró:** las **14 entradas de `/novedades`** terminaban en "ver
todas las novedades" y "feed RSS", y nada más. Quien llegaba desde una
búsqueda leía el artículo y se iba. Eran las únicas páginas de contenido del
sitio así.

**Arreglo:** bloque de salida en `novedades/[slug]` con el patrón que ya usan
`biblioteca/[slug]` y `recursos/[slug]` — RFQ como camino principal y
`AsistenteAiLink` de secundario (`pageType=news`, un `PageType` real). **No
hay un segundo asistente ni un segundo formulario.** El bloque editorial de
registro y RSS sigue intacto debajo: no se cambia la voz.

Exclusiones, con su motivo escrito en el código: los endpoints de máquina
(`catalogo.json`, `terminos.json`, `formulas.json` — datos para agentes, no
páginas que alguien lee) y las **raíces** de sección, cuyo trabajo es
repartir hacia las hijas. Eso se comprueba aparte: una raíz que no enlaza a
ninguna hija es tan callejón sin salida como un artículo sin CTA.

**Resultado: 178 páginas de contenido con salida, 6 raíces repartiendo.**

### Cuatro formas de encontrar Chromium, y solo una funcionaba

`auditar:navegacion`, `auditar:viewport`, `audit-ui` y el arné de
`diagnostico/` tenían cuatro estrategias distintas y **tres nombres de
variable** (`PLAYWRIGHT_CHROMIUM`, `PLAYWRIGHT_CHROMIUM_PATH`,
`DIAG_CHROME`). Las dos primeras morían con «run `npx playwright install`»
sin decir que había un Chromium a dos directorios de distancia — es decir,
dos auditorías del repositorio estaban **apagadas** sin que nada lo dijera.

Ahora las cuatro lanzan con `LANZAR` de `scripts/diagnostico/rutas.mjs`, que
ya sabía buscar en orden; las variables viejas se aceptan como alias.
`audit-ui.mjs` lo importa de forma dinámica para no convertir `playwright`
en dependencia obligatoria.

`npm run auditar:navegacion` vuelve a correr: **0 errores, 45 destinos, 12
grupos × 184 opciones en los 5 anchos.**

### Medios: nada borrado, nada re-codificado

`npm run auditar:imagenes`: **0 errores, 0 avisos** (517 archivos en
`public/`, 201 rutas citadas). **Cero binarios modificados**: ni un WebP ni
un mp4 regenerado, movido o borrado.

**32 WebP sin ninguna cita** (ni por ruta, ni por nombre, ni por slug), 1,6 MB
en total. Se **listan, no se purgan**, como pide el mandato:

| Grupo | Archivos | Peso |
|---|---|---|
| `/images/industria/*` (variantes de ilustración no cableadas) | 17 | ~700 KB |
| `/images/proceso/*-2.webp` (segundas tomas no cableadas) | 12 | ~250 KB |
| `/images/galeria/geomembranas-pvc-*-2.webp` | 3 | ~500 KB |

Ningún `.mp4` quedó huérfano: los editoriales siguen citados y en uso.

### Información: sin inconsistencias

`npm run seo:consistency`: 67 plantillas · 239 URLs públicas · 25 endpoints
de máquina · **0 inconsistencias**. Las 2 huérfanas que reporta son las
declaradas a propósito (retorno de pasarela, acceso de clientes) y
`huerfanas.test.ts` sigue en verde.

## Sprint I — Velocidad: medido, y casi todo ya estaba bien

Este sprint es corto **a propósito**. Lo que se encontró al auditar es que
la capa de rendimiento ya estaba afinada:

- Las 15 imágenes con `fill` **ya tenían** su `sizes`. Ninguna faltaba.
- `priority` es condicional en todos los casos (`index === 0`, `i === 0`,
  `prioridadCartel`) menos el logo del navbar, que sí está sobre el pliegue
  en todas las páginas. No hay un `priority` de más.
- `MachineryGallery` ya trae `loading`/`decoding` correctos, con `eager`
  solo en la primera toma. `CinePlayer` usa `preload="metadata"` con póster.

**Lo único que faltaba:** el avatar del proveedor de sesión en el navbar, un
`<img>` de 20×20 decorativo sin `loading` ni `decoding`. Ahora `lazy` +
`async`, con `width`/`height` explícitos.

### Dos experimentos medidos y revertidos

Valen más escritos que callados:

| Experimento | Hipótesis | Medido | Decisión |
|---|---|---|---|
| `Chatbot` con `next/dynamic` desde el layout | Arranca cerrado y `@ai-sdk/react` solo lo usan él y `/asistente`: parecía el candidato obvio | 99 rutas idénticas, 2 rutas **+1 kB**, trozo compartido con el **mismo hash** | Revertido |
| `LonaConfigurador` con `next/dynamic` (SSR conservado) | 711 líneas, el componente de cliente más grande de la portada, muy por debajo del pliegue | Portada **201 → 202 kB** | Revertido |

Next 15 ya divide por ruta; el `dynamic()` manual solo agregaba el
envoltorio. Enviar cualquiera de los dos habría sido mover sin avanzar.

## Gates — resultado final

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | limpio |
| `npm test` | **78 archivos / 1234 pruebas**, 0 fallidas (línea base de la rama: 76/1193 → **+2 archivos, +41 pruebas, 0 regresiones**) |
| `npm run seo:claims` | 3 archivos / 34 pruebas en verde |
| `afirmaciones.test.ts` / `dominio-migracion.test.ts` | **sin tocar** (verificado con `git diff --name-only`) |
| `npm run auditar:imagenes` | 0 errores, 0 avisos |
| `npm run auditar:navegacion` | 0 errores, 45 destinos |
| `npm run auditar:viewport` | **0 errores** + 3 avisos táctiles (antes: 3 errores, exit 1) |
| `npm run probar:dinero` | **26/26** |
| `npm run build` | limpio |

### Sobre el viewport: de 3 errores a 0

Durante el pase, los 3 errores se trataron como línea base intocable, y así
se empujó el PR. **CI lo rechazó** — y al mirar la base apareció lo
importante: `main @ c1c1556` fallaba con la **salida byte a byte idéntica**.
`main` llevaba en rojo desde el 20 de septiembre, seis ejecuciones seguidas;
el último verde fue `420a888`. Con la base en rojo, la red de seguridad del
repositorio estaba apagada: una regresión nueva no se distinguía de la que
ya estaba.

El mandato excluye estos 3 defectos **salvo que sean triviales**. Lo eran.

**El auditor decía «cabecera» y el defecto nunca estuvo en la cabecera.** El
CTA «Cotizar» del navbar es `!hidden md:!inline-flex`: a 280 px ni siquiera
se renderiza. Lo que se salía era la **barra móvil fija de abajo**
(`BarraMovilContacto`), construida con `<nav>` — y `zona()` de
`scripts/auditar-viewport.mjs` etiqueta como cabecera todo lo que viva dentro
de un `<nav>`. Eso explica también por qué fallaba en `/`, `/productos` e
`/industria/mineria` pero no en `/cotizacion`: ahí la barra devuelve `null`.

**Causa real:** un hijo de flex arranca con `min-width: auto` —«nunca más
estrecho que mi contenido»—, así que `flex-1` y `flex-[1.4]` repartían lo que
sobraba pero no podían ceder cuando faltaba. Medido en Chromium sobre el
build, en `/` a 280 px: disponible 196 px, ocupado 100 + 121 = 221 px, borde
derecho de «Cotizar» en **293** con vista de 280. El CTA principal de la
barra móvil —la única píldora sólida, la acción que paga el sitio— se salía
**25 px de pantalla** en el teléfono más estrecho que el sitio declara
soportar.

**Arreglo:** `min-w-0` en las dos píldoras.

| Ancho | «Cotizar», antes → después |
|---|---|
| 280 px | der **293 → 268** (cabe exacto en el cuadro de relleno) |
| 320 px | der 308 → 308 (sin cambio) |
| 360 px | 115/161 → **idéntico** |
| 390 px | 127/179 → **idéntico** |

Solo actúa cuando el espacio no alcanza. Objetivos táctiles holgados a
280 px: 115×48 y 82×44.

Quedan los **3 avisos táctiles** preexistentes (`/productos` a 430/412 px,
`<input>` de `/cotizacion` a 2560 px): son avisos, no errores, no hacen
fallar el gate y siguen fuera de alcance.

Tras tocar `Navbar.tsx` (avatar) y `BarraMovilContacto.tsx` se corrieron
`auditar:viewport` y `auditar:navegacion`, como exige la ley de producto.

**Lección que vale más que el arreglo:** dar por buena una «línea base
conocida» sin comprobar si la base estaba verde. Bastaba mirar el historial
de CI de `main`. Un gate que lleva seis commits en rojo no es una línea
base: es un gate apagado.

## Bloqueos humanos (documentados, no simulados)

Siguen vigentes y **no se tocó ninguno**:

- Bucket `rfq-adjuntos` en Supabase Storage + política RLS de `INSERT`
  anónimo. Condiciona los adjuntos de `/cotizacion` y la subida de documento
  del asistente (que por eso sigue siendo stub).
- `CRM_WEBHOOK_URL` / `N8N_WEBHOOK_URL` para reenvío del lead.
- `RESEND_API_KEY` (opcional) para copia por correo del RFQ.
- Decisión `www` vs. apex en `CANONICAL_ORIGIN` — **no tocada**.
- `verificado: true` en `lib/projects.ts` antes de publicar cualquier obra o
  cliente nuevo — no se agregó ninguno.
- `ANTHROPIC_API_KEY` en el entorno de CI si se quiere que el Tramo 2 de
  `probar:dinero` ejercite el análisis real de foto.

`wa.me` ya funciona y se usa tal cual.

## Cómo seguir desde aquí

1. **Correr `npm run probar:dinero` en CI** con clave, para cubrir la rama de
   visión real del Tramo 2.
2. **Cablear o retirar los 32 WebP sin citar** — decisión editorial, no
   técnica: o se usan en las páginas de industria y proceso para las que se
   generaron, o se archivan. No se tocan desde aquí.
3. **Desbloquear `rfq-adjuntos`** es lo que convierte la subida de documento
   de stub en producto.
