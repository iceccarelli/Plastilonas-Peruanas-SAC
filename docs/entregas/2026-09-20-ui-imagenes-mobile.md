# 2026-09-20 · Encuadre honesto y controles táctiles

Las fotos del catálogo se recortaban, los botones no se parecían entre sí y la
mitad de lo pulsable solo respondía al ratón. Esta entrega arregla las tres
cosas sin tocar un solo byte de imagen ni de vídeo: lo que cambia es CÓMO se
muestran, no QUÉ archivos existen.

Todo lo que dice este documento está medido en el navegador con Playwright a
390×844, 768×1024 y 1440×900. Donde hay un número, hay una medición.

---

## 1. Causas raíz corregidas

| Causa | Dónde | Qué se hizo |
|---|---|---|
| **Desborde horizontal de 246 px en la ficha de producto** (descubierto midiendo) | `app/(es)/productos/[slug]/page.tsx` | `min-w-0` en las dos columnas de la rejilla. La regla `min-width:auto` de CSS Grid dejaba que una fila de especificación larga estirase la columna derecha y arrastrase a la galería: **medido 636 px de ancho en una pantalla de 390**. `overflow-x: clip` tapaba el síntoma — no había barra, simplemente faltaba un tercio de cada foto. Ninguna corrección de encuadre servía mientras esto existiese. |
| `aspect-[16/11]` fijo + `object-cover` recortando la foto principal | `components/ProductGallery.tsx` | → `aspect-[3/2]`. Las **228** WebP de `public/images/galeria` miden TODAS 1.50 exacto (comprobado archivo por archivo con `sharp`). 16/11 = 1.4545 recortaba ~3 % del ancho de cada foto para siempre. Ahora el recorte del contenedor es **cero**. |
| Lightbox con el mismo `aspect-[16/11]` | `components/ProductGallery.tsx` | Caja elástica (`flex-1 min-h-0`) + `object-contain` + área segura. En 390×844 la foto pasa de una franja corta a **366×740**. Es la única vista que el usuario pide expresamente para verlo todo: ahí no se recorta nunca. |
| `h-56` fijo (y `height: 11rem` en ≤640) recortando las miniaturas de tarjeta | `components/ProductCard.tsx`, `app/globals.css` | → `aspect-[3/2] w-full` + clase `.product-card-media`. **Medido 340×176 (1.93:1) antes → 340×227 (1.50:1) ahora** en un teléfono. El `object-cover` se comía el 22 % del cuadro. |
| Ken Burns `scale(1.06)` sobre fotografía de producto | `app/globals.css` | Techo bajado a **1.03** en escritorio y a **1.012 sin paneo** por debajo de `md`. El `prefers-reduced-motion: reduce` lo sigue anulando entero (verificado: `animation-name: none`, `transform: scale(1.01)`, capas de cruce a `opacity: 0`). |
| `sizes` de `next/image` mal calibrados | `ProductGallery.tsx`, `ProductCard.tsx` | Galería: `(max-width: 768px) 100vw, 640px` → `(max-width: 1023px) 100vw, 576px`. El valor viejo servía 640 px justo donde hacen falta **720** (tableta, medido) y 640 donde bastan **522** (escritorio). Tarjeta: `(max-width: 768px) 100vw, 380px` → escalera de cuatro tramos que sigue los anchos reales (340 / 346 / 291 / 286). |
| «Ampliar» solo visible con hover | `ProductGallery.tsx` + `.pista-ampliar` en `globals.css` | **Medido `opacity: 0` en 390 px antes**, `opacity: 1` ahora. Es la única señal de que la foto se abre: en puntero grueso se ve desde el primer pintado; con ratón fino conserva el revelado por hover (`@media (hover: hover) and (pointer: fine)`). |
| Botones ad-hoc fuera del sistema `.btn` | Navbar, FeedbackBar, Calculadora, barra móvil, portada, ficha, DatasheetButton, /oficio | Migrados (detalle en §2). |
| Barra de contacto móvil plana y anticuada | `components/BarraMovilContacto.tsx` | Reconstruida con jerarquía y cristal (detalle en §3). |
| Objetivos táctiles por debajo de 44 px | `globals.css`, `SectorTicker`, `FamilyCarousel`, `SwipeDeck`, `FeaturedDeck`, `ProductCard` | **Medido en /: 40 destinos por debajo de 44 px → 1. En /productos: 72 → 0. En /oficio: 6 → 0.** El único que queda en cada ruta es un enlace de texto en línea (20 px de altura de línea), que WCAG 2.5.8 exime expresamente. |
| Sin estado de pulsado (solo hover) | `.btn`, `.product-card`, miniaturas, flechas de carrusel, barra móvil | `active:scale-[0.97]` / `whileTap` en todo lo pulsable. |

### Lo que NO era un problema real (comprobado antes de tocarlo)

- **Rejillas de producto a 2 columnas en móvil**: no existían. Medido, la
  portada (`sm:grid-cols-2`) y el catálogo (`grid-cols-1 md:grid-cols-2`) ya
  servían **una sola columna de 340 px** a 390 px. La regla de densidad de
  `globals.css` que fuerza 2-up en ≤640 apunta a `main section .grid.md:grid-cols-2`
  y alcanza las tarjetas de *Servicios* y *Por qué* —bloques de texto, no
  fotos de producto—, que es para lo que se escribió. No se tocó.
- **LCP de la portada**: sigue siendo la fotografía del hero, no el vídeo del
  cine. Medido con `PerformanceObserver` en las dos anchuras:
  `IMG /images/hero/hero-08.webp` a 768 ms (390 px) y 284 ms (1440 px). El
  `CinePlayer` de la portada vive en modo `sala` —un cartel y un botón— muy por
  debajo del pliegue, y no compite.

---

## 2. Migración al sistema de botones

Se siguió la **Fase 3 (unificación de forma)** de `docs/auditoria-consistencia-diseno.md`,
y **solo** esa: botones, alturas y radios. No se tocó ni un literal de color
hex, porque el documento explica en su §2 por qué una migración de color a
ciegas revierte la corrección de contraste AA y rompe el modo oscuro: la capa
`!important` de `globals.css` se ancla a los nombres de clase literales exactos.
Esa migración es por componente y con su override retirado en el mismo paso —
no es este parche.

| Componente | Antes | Ahora |
|---|---|---|
| `Navbar` — CTA principal | `rounded-full bg-[#0A2540] px-4 xl:px-5 py-2.5 …` | `.btn .btn-primary` (conserva su inversión en oscuro) |
| `Navbar` — «Mi cuenta» | `px-4 py-2 … border … rounded-full` | `.btn .btn-sm .btn-ghost` |
| `Navbar` — lupa | `px-2.5 py-2` | círculo `h-9 w-9`, declarado **solo escritorio** (`hidden lg:flex`): en táctil no se renderiza, la búsqueda móvil vive en el menú |
| `FeedbackBar` — Sí / No / Enviar | `px-7 py-3 rounded-full` ×3 | `.btn .btn-primary`, a ancho completo por debajo de `sm` |
| `FeedbackBar` — WhatsApp | `px-7 py-2.5 rounded-full border` | `.btn .btn-ghost` |
| `CalculadoraForm` — las dos acciones de cierre | `px-5 py-2.5 rounded-full` ×2 | `.btn .btn-accent` / `.btn .btn-ghost`, apiladas en móvil |
| Portada — hero | `px-6 py-3.5 rounded-full` ×2 | `.btn .btn-lg .btn-primary` / `.btn .btn-lg .btn-ghost` |
| Ficha de producto — Cotizar / RFQ | `px-9 py-4 rounded-2xl`, `px-7 py-4 rounded-2xl` | `.btn .btn-lg .btn-primary` / `.btn .btn-lg .btn-ghost` |
| `DatasheetButton` | mismo `px-7 py-4 rounded-2xl` por defecto | `.btn .btn-lg .btn-ghost` |
| `/oficio` — chips de familia | `px-3 py-1.5 rounded-full` (34 px medidos) | `.btn .btn-sm .btn-ghost` |
| `BarraMovilContacto` | tres celdas de rejilla idénticas | `.btn .btn-accent` + `.btn .btn-sm` + círculo de icono |

### Correcciones al propio sistema

- **`.btn` no medía 44 px.** El comentario decía «alto uniforme = 44px táctil»
  y la suma no daba: 12 + 12 de relleno y 14 de línea son 38, y **medido con
  icono, 40**. Se declara `min-height: 44px` en vez de deducirlo de una suma
  que cualquier cambio tipográfico desplaza.
- **`.btn-sm` medía 29 px reales** y estaba vivo en pantallas táctiles (el
  «Cotizar» de cada tarjeta). Ahora sube a 44 px bajo `@media (pointer: coarse)`
  y conserva su tamaño compacto donde hay ratón. Verificado: 44/44/44.
- **`.btn-lg` fija 48 px**, la altura de una acción principal bajo el pulgar.
- **`.btn:active`** pasa de `scale(0.985)` (imperceptible) a `0.97`.

### Lo que se dejó deliberadamente como está

- **La mega-navegación de escritorio** (`Navbar.tsx`): sus enlaces miden 28 px
  y no se tocan. Son un menú de ratón que no se renderiza en móvil, y meterlos
  en `.btn` reventaría la maqueta de columnas del mega-menú.
- **Los chips de filtro** (`FilterControls`, `.chip-selected`): tienen su propio
  estado seleccionado con degradado y `!important`, documentado y verificado en
  auditorías anteriores. Migrarlos a `.btn` es un cambio de comportamiento, no
  de forma, y no cabía en este parche.
- **Las migas de pan y los enlaces «Ver todo»**: son texto en línea dentro de
  una frase. WCAG 2.5.8 exime expresamente el objetivo en línea, y forzarles
  44 px de alto rompería el interlineado del párrafo.
- **La aurora de interacción** sigue en `@media (hover: hover)`. Es decorativa
  —dice «esto está vivo»— y quien no la ve no pierde ningún camino. Lo que sí
  se sacó de ahí es «Ampliar», que no es decorativo: es navegación.

---

## 3. La barra móvil

De rejilla de tres celdas iguales con líneas de 1 px —la forma de una tabla— a
barra de acciones con jerarquía:

- **Cotizar**: píldora esmeralda sólida, la más ancha, **48 px** (medido).
- **WhatsApp**: píldora secundaria con el verde del canal, **44 px**.
- **Llamar**: círculo de icono, **44 px**, con `aria-label` explícito porque no
  lleva texto visible.
- Los tres se hunden a `scale(0.96)` al pulsarse.
- Cristal: `backdrop-blur-xl` sobre fondo translúcido, con `supports-[backdrop-filter]`
  para que el fondo sea más opaco donde no hay desenfoque.

**Lo que no cambió, y es lo importante**: sigue oculta en `/cotizacion` (la
condición `pathname?.startsWith('/cotizacion')` está intacta) y el espaciador
sigue reservando el alto exacto de la barra al final del documento, para que
«Política de Privacidad» y «Términos y Condiciones» sigan siendo alcanzables.
Ahora el alto sale de **una sola constante** (`ALTO = 60`) que usan la barra y
el espaciador, así que no pueden desincronizarse — y la prueba de regresión
(`test/regresiones-ui.test.ts`) se reescribió para exigir esa invariante en vez
del número literal, que era lo que la hacía frágil.

---

## 4. Rejilla móvil: columna única, no carrusel

**Se eligió la columna única** y no el carrusel con «asomo» de 1.1 tarjetas.

El sitio ya usa el patrón de asomo donde tiene sentido: `.sector-scroll` para
los chips de sector y `.family-scroll` para las familias. En esos dos casos el
contenido es un **menú** —el usuario recorre para elegir una etiqueta— y ver
media tarjeta siguiente invita a arrastrar.

El catálogo es otra cosa: es una **lista de compra** de 36 líneas con precio,
disponibilidad y dos acciones por tarjeta. Un carrusel horizontal de 36
elementos esconde 35 detrás de un gesto, rompe el desplazamiento vertical del
pulgar y es incompatible con los filtros (que reducen el conjunto a tres o
cuatro: un carrusel de tres es un carrusel roto). La columna única ya estaba
ahí y estaba bien; lo que fallaba era el ALTO de cada tarjeta, y eso es lo que
arregla el 3:2.

**3:2 frente a 4:3**, comparado en la rejilla real: 4:3 lee bien en una ficha
suelta, pero en la lista de una columna del teléfono deja 255 px de foto por
tarjeta y empuja el nombre y el precio fuera de pantalla. Además 3:2 es el
ratio nativo de los 228 archivos, así que recorta cero. Gana 3:2.

---

## 5. iPad — comprobado en las dos anchuras exactas

| Ancho | Maqueta | Medido |
|---|---|---|
| 768 px | Galería y buy box **apilados** (`lg:grid-cols-2`). Es lo correcto: a dos columnas con `gap-14` cada una quedaría en ~340 px y el buy box no cabe. | Galería 718×478 (1.502), documento 768 = viewport, **sin desborde** |
| 1024 px | **Dos columnas**, galería a la izquierda y buy box a la derecha desde el primer pliegue | Galería 458×305 (1.502), `h1` a 252 px (junto a la foto, no debajo), documento 1024 = viewport |

La mega-navegación de escritorio no se tocó.

---

## 6. Archivos tocados

```
app/globals.css
app/(es)/page.tsx
app/(es)/oficio/page.tsx
app/(es)/productos/[slug]/page.tsx
components/ProductGallery.tsx
components/ProductCard.tsx
components/BarraMovilContacto.tsx
components/Navbar.tsx
components/FeedbackBar.tsx
components/CalculadoraForm.tsx
components/DatasheetButton.tsx
components/SectorTicker.tsx
components/FamilyCarousel.tsx
components/SwipeDeck.tsx
components/FeaturedDeck.tsx
test/regresiones-ui.test.ts
```

No se tocó `LonaExploded.tsx`. No se instaló ninguna dependencia.

---

## 7. Capturas

`docs/entregas/capturas/2026-09-20-ui-imagenes/{390x844,768x1024,1440x900}/`,
con `-antes` y `-despues` para `/`, `/productos`,
`/productos/lona-plastificada-rafia-polytarp`, `/oficio` y `/nosotros`. Más
`390x844/lightbox-despues.webp`.

- **390×844 · ficha** — antes: la foto se sale de la pantalla por la derecha
  (la galería medía 634 px), la cuarta miniatura queda cortada sin señal de que
  la fila continúe y no hay rastro de «Ampliar». Después: la foto entra entera
  en 340×226, «Ampliar» se lee sobre la esquina, las miniaturas miden 72 px con
  anillo esmeralda en la activa, y abajo la barra de cristal con Cotizar en
  esmeralda.
- **390×844 · catálogo** — antes la tarjeta recorta la escena a una franja de
  176 px; después se ve el patio entero en 227 px.
- **390×844 · lightbox** — la foto completa, contenida, con cerrar y flechas de
  48 px en círculos difuminados.
- **768×1024** — apilado y sin desborde en las cinco rutas; las tarjetas pasan
  de 1.55:1 a 1.50:1.
- **1440×900** — cambio contenido a propósito: la tarjeta pasa de 1.30:1 a
  1.50:1 (de las tres anchuras, la que más recortaba) y el resto es
  indistinguible salvo las alturas de botón.

---

## 8. Verificación

```
npx tsc --noEmit          0 errores
npm test                  1071 pruebas, 66 archivos, todas pasan
npm run auditar:imagenes  0 errores, 0 avisos (517 archivos, 201 rutas citadas)
npm run build             exit 0
ls public/images/galeria/*.webp | wc -l   → 228
git ls-files 'public/videos/**'           → 6 MP4 + 3 carteles
```

### Auditoría de diff en accesibilidad

Recuento de `:focus-visible` y de `@media (prefers-reduced-motion: reduce)`
idéntico antes y después (5 y 15 respectivamente, en `app/` + `components/`).
La única línea eliminada que mencionaba `outline` es el `<input>` de
`FeedbackBar`, reemplazado por otro que conserva `outline-none focus:border-[#059669]`
y además gana `min-h-[44px]`.

### `npm run audit:ui` — deuda heredada, no introducida aquí

El trinquete de contraste **ya fallaba en `main`**. Medido en las dos ramas con
el mismo binario y la misma base:

| | línea base guardada | `main` (420a888) | esta rama |
|---|---|---|---|
| contraste oscuro | 1 | **12** | **11** |

Es decir: esta rama deja el trinquete **uno mejor** que como lo encontró —la
migración del CTA secundario de la portada a `.btn-ghost` corrigió un caso de
1.17:1— pero no salda la deuda. Los once restantes son el panel claro del hero
de la portada en tema oscuro (títulos navy y cuerpo gris sobre superficie
oscura), que viene de sprints anteriores y merece su propio parche por
componente, con su override retirado en el mismo paso, tal y como manda la §2
de la auditoría de consistencia. **`docs/ui-audit-baseline.json` NO se actualizó
a propósito**: bajarlo a 11 sería tapar con una línea base lo que hay que
arreglar con código.
