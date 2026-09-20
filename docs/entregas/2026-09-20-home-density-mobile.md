# Densidad de la portada en móvil — el pie, el título de servicios y el maratón de scroll

**Fecha:** 2026-09-20 · **Rama:** `feat/home-density-mobile` · **Base:** `main` (`c3d3bc3`)

Tres defectos observados en producción por el dueño, y una medida: cuánto hay
que desplazar para llegar al final de la portada en un teléfono.

---

## 0 · Lo que se midió, y cómo

`document.documentElement.scrollHeight` sobre `/`, con el sitio compilado
(`next build` + `next start`) y Chromium local a través de Playwright, en tres
anchos. Se mide dos veces por ancho:

- **con `prefers-reduced-motion: reduce`** — la medida determinista, la que se
  repite igual entre ejecuciones;
- **sin el ajuste** — la que ve un teléfono normal.

La toma «antes» se hizo volviendo el árbol de trabajo al estado de `main`
(`git stash`), recompilando y midiendo. No es una estimación.

### Altura total de `/`

| ancho | antes (reduce) | después (reduce) | Δ | antes (con movimiento) | después (con movimiento) | Δ |
|---|---|---|---|---|---|---|
| **390 × 844** | 18 433 px | **12 630 px** | **−5 803 px (−31,5 %)** | 17 237 px | **12 058 px** | **−5 179 px (−30,0 %)** |
| **768 × 1024** | 14 581 px | **10 223 px** | **−4 358 px (−29,9 %)** | 14 217 px | **10 067 px** | **−4 150 px (−29,2 %)** |
| **1440 × 900** | 11 419 px | **8 441 px** | **−2 978 px (−26,1 %)** | 11 211 px | **8 337 px** | **−2 874 px (−25,6 %)** |

Sin desbordamiento horizontal en ninguno de los tres anchos, antes ni después.

### Sección por sección, a 390 px (con movimiento)

| # | sección | antes | después |
|---|---|---|---|
| 0 | Hero | 825 | 825 |
| 1 | Cifras | 331 | 331 |
| 2 | 4 líneas prioritarias | 2 518 | 2 518 |
| 3 | Tres frentes | 993 | 993 |
| 4 | **Catálogo** (eran dos secciones) | 1 378 | **924** |
| 5 | **Configurador de lona** | 4 733 | **473** |
| 6 | **Maquinaria** | 855 | **821** |
| 7 | **Servicios** | 641 | **674** |
| 8 | **Por qué elegirnos** | 1 156 | **681** |
| 9 | Trilogía | 693 | 693 |
| 10 | Novedades | 999 | 999 |
| 11 | Confianza | 307 | 307 |

Nada se borró. Las secciones que no aparecen tocadas siguen exactamente igual.

---

## 1 · El WhatsApp del pie (`components/Footer.tsx`)

**Lo que había (móvil).** Una píldora de ancho completo en `bg-[#25D366]` —el
verde de marca de WhatsApp al 100 %— con «WhatsApp comercial · +51 924 875 632»
en una sola línea de 16 px semibold. Medido a 390 px: 324 px de texto dentro de
342 px de píldora. Cabía por 18 px en el teléfono más común y se partía en dos
líneas en cualquiera de 360 o 320 px, que es lo que el dueño vio. Y compite con
el «Cotizar» blanco que está 40 px más arriba y que sí es la acción principal.

**Lo que hay.** El mismo criterio de jerarquía que la barra móvil de contacto
—rehecha en la entrega anterior—: WhatsApp es un canal **secundario**, así que
deja de ser un ladrillo verde y el `#25D366` pasa a ser **acento del icono**.
El número deja de competir con la etiqueta: va en una segunda línea tranquila,
más pequeña y tabular.

```
[icono verde]  WhatsApp comercial      ← 15 px / 600, blanco
               +51 924 875 632         ← 12,5 px / 400, white/70, tabular
```

**Por qué dos líneas y no una.** Una frase de 36 caracteres no cabe en 320 px a
ningún tamaño legible; dos etiquetas cortas sí. Medido en el navegador a 320,
360 y 390 px: **una línea cada una, altura constante de 62 px** en los tres.
No hay ancho en el que esto envuelva mal.

**Contraste — medido sobre píxeles compuestos**, no deducido del CSS: se ocultan
los hijos del enlace, se fotografía la píldora y se busca el peor píxel interior;
sobre ese fondo se compone el color del texto con su alfa. Fondo efectivo real:
`rgb(24, 49, 75)` (el `bg-white/[0.06]` compuesto sobre el navy `#0A2540` del pie).

| elemento | tamaño | antes | después |
|---|---|---|---|
| etiqueta | 15 px / 600 | `#0A2540` sobre `#25D366` = **7,83:1** | blanco sobre `rgb(24,49,75)` = **13,29:1** |
| número | 12,5 px / 400 | (iba en la misma línea) | white/70 sobre `rgb(24,49,75)` = **7,32:1** |

Idéntico en tema claro y oscuro: el pie es navy en los dos.

**Honestidad sobre el «antes»:** el ladrillo verde **no fallaba AA** (7,83:1).
El defecto era de envoltura y de jerarquía, no de contraste. El «después»
mejora igualmente el contraste, pero no se presenta como la corrección de un
fallo que no existía.

**El WhatsApp de escritorio (`md+`).** Existe, en «CONTACTO DIRECTO», y ya tenía
el icono verde como acento. Lo único flojo era el número en `text-[#25D366]`
—pasaba AA (7,83:1 sobre navy) pero leía como un enlace de 2012 y rompía la
simetría con la fila de teléfono de arriba, que usa blanco + subetiqueta
apagada. Ahora usa blanco tabular, como su vecina. No se inventó contenido
nuevo de escritorio.

---

## 2 · El título de servicios y las pestañas

### 2.1 Escala del encabezado: **prop `size="compact"`**, no `clamp()` compartido

**Se eligió (b).** `.t-h2` la comparten `/servicios`, `/nosotros`, la banda
«por qué elegirnos» y el bloque de la trilogía. Sus títulos son cortos —una o
dos líneas— y se leen bien a 28 px. El problema no era la escala: era la escala
multiplicada por un título de 39 caracteres. «Servicios integrales, de principio
a fin» caía en **tres líneas de 28 px** a 390 px, 92 px de tipografía antes de
que apareciera la primera pestaña. Bajar el token compartido habría encogido
cinco encabezados sanos para arreglar dos.

`SectionHeading` gana una prop opcional `size`, y `globals.css` un token
hermano:

```css
.t-h2         { font-size: clamp(1.75rem,  3.5vw, 2.5rem); }  /* sin tocar */
.t-h2-compact { font-size: clamp(1.375rem, 2.6vw, 2rem);   }  /* nuevo */
```

**Quién lo usa (verificado por `grep`, lista completa):**

- `app/(es)/page.tsx` → «Explorar catálogo» y «Servicios integrales…»
- `components/MachineryGallery.tsx` → «El proceso, paso a paso» (sólo se
  renderiza en la portada)
- `app/(es)/page.tsx` → el `<h2>` a mano de «por qué elegirnos» usa la clase
  directamente

**Nadie más.** `SectionHeading` sólo se importa desde `page.tsx` y
`MachineryGallery.tsx`; `.t-h2` sigue intacta en `/servicios`, `/nosotros` y
los otros dos bloques de la portada. Comprobado además en el navegador a 390 y
1440 px sobre `/servicios`, `/nosotros` y `/productos`: sin desbordes y sin
cambios de tamaño en sus encabezados.

### 2.2 El recorte a media palabra: **era `min-width: auto` de una rejilla**

El dueño vio la descripción del servicio cortada a media palabra («…según sus
espec») y el segundo botón diciendo «Ver todos los s». **No era un `line-clamp`
ni un truncado por caracteres: no hay ninguno en el componente.**

Medido en el navegador a 390 px, subiendo por el árbol desde `#panel-servicio`:

```
DIV #panel-servicio   ancho 935 px   ← el panel
DIV .grid lg:grid-cols-[320px_1fr]   ancho 342 px   ← su rejilla padre
```

Un ítem de rejilla tiene `min-width: auto`, así que no se encoge por debajo de
su contenido mínimo. El texto de dentro (`max-w-xl` = 576 px + 64 de relleno)
fijaba ese mínimo en 935 px; el panel se salía 593 px por la derecha y el
`overflow-hidden` de la portada se comía el sobrante — a media palabra, porque
un recorte por píxeles no sabe dónde acaban las palabras.

**Corrección:** `min-w-0` en el panel, en su columna de texto y en la columna de
pestañas. El texto vuelve a envolver por palabras. Ningún recorte manual.

### 2.3 Compactación de la fila de pestañas (móvil)

- Píldoras: `px-5 py-4` → `px-3.5 py-2.5` (icono 20 → 16 px, texto 14 → 13 px).
  **Medido: 42 px de alto, 161–187 px de ancho cada una.** Por debajo de los
  44 px de un botón de acción, y a propósito: en un carril horizontal el riesgo
  no es la vertical —el carril entero mide 42 px, no hay nada encima ni debajo
  que tocar por error— sino la horizontal, y ahí cada píldora conserva más de
  160 px. En `lg` recupera su tamaño de siempre, donde es una columna vertical.
- El carril y el botón de pausa van ahora **en columna**: en fila, el botón se
  sentaba encima del carril justo donde éste sangra hasta el borde (`-mx-6`) y
  tapaba media pestaña.
- El botón de pausa muestra una palabra («Pausar» / «Reanudar») en móvil y la
  frase completa en `lg`; el nombre accesible es siempre la frase completa.
- Panel: `min-h-[22rem]` → `min-h-[18rem]` en móvil, relleno `p-8` → `p-6`.
- CTAs: usan las clases `.btn` de la casa y **se apilan** por debajo de `sm`.
  Lado a lado no caben en 294 px de panel útil (`.btn` es `white-space: nowrap`).

### 2.4 Avance automático: **pausado por defecto en puntero grueso**

`ServiceTabs` **sí tenía** avance automático (5 s) — no es un no-op. Ya cumplía
WCAG 2.2.2 con un botón de pausa, pero cumplir no es estar bien: en un teléfono
el contenido cambiaba solo mientras alguien leía. Ahora, si
`matchMedia('(pointer: coarse)')` acierta, arranca pausado. Se decide en un
efecto y no en el estado inicial: el servidor no sabe qué puntero tiene el
visitante y `useState(matchMedia(...))` daría un HTML distinto del que React
hidrata.

De paso se quitó `aria-pressed` de ese botón. `globals.css` tiene una regla
global —`button[aria-pressed="true"]`, pensada para las píldoras de filtro— que
pinta de verde sólido con `!important` cualquier botón pulsado. Como ahora el
estado por defecto en un táctil es «pausado», el botón aparecía como una píldora
verde rellena que se lee como «filtro activo». Un play/pausa no es un
interruptor de dos estados persistentes: es una acción cuyo nombre cambia, y el
nombre accesible ya lo dice.

---

## 3 · Densidad: agrupar, no borrar

### 3.1 Dos secciones de catálogo → una (`components/ExplorarCatalogo.tsx`)

**Lo que había.** Dos secciones seguidas haciendo la misma pregunta con distinta
ropa: «Explore el catálogo por familia» (`FamilyCarousel`, carrusel de familias
que avanzaba solo cada 4 s) y «Nuestras líneas insignia» (`FeaturedDeck`, baraja
de las 36 fichas que **también** avanzaba sola cada 4 s). Ninguna respondía a la
otra: elegir «Geosintéticos» arriba no cambiaba nada abajo.

**Lo que hay.** Una sección, «Explorar catálogo», con un carril horizontal de
fichas —una por familia de `productFamilies`— y debajo un panel que muestra las
líneas destacadas **de la familia elegida**, su tagline, su recuento real y el
enlace a la familia completa. El carril reutiliza el lenguaje de píldora que ya
usa `SectorTicker` (redonda, borde gris, navy al activarse): no es un patrón
nuevo. Teclado con flechas, `tablist/tab/tabpanel`.

Los datos se resuelven en el servidor (`page.tsx`): el recuento por familia y
las destacadas salen del catálogo, no de una lista escrita a mano.

`FamilyCarousel.tsx` y `FeaturedDeck.tsx` quedan sin usar. **No se borraron**:
esta entrega no retira código que otra pueda querer.

> **Actualización (limpieza posterior, ver §8).** Ya se borraron. Se comprobó
> que no quedaba ni una importación en `app/`, `components/`, `lib/`, `test/`
> ni `scripts/` —incluidas las rutas `(en)` y `(pt)`— y ningún test los
> ejercía. Las referencias que quedan son históricas, como ésta.

**1 378 px → 924 px** a 390 px. Misma estructura en escritorio, sólo más ancha
(el carril entra entero, el panel usa tres columnas de aire).

### 3.2 «Por qué elegirnos» → acordeón (`components/PorQueAcordeon.tsx`)

Cuatro tarjetas altas —número de 36 px, título de dos líneas, párrafo de cinco—
sobre la banda navy: **1 156 px**, un segundo bloque de altura completa justo
después del de servicios.

Ahora los cuatro títulos son lo que se ve y el párrafo se abre al tocar.
`<details name="porque-elegirnos">` nativo: cero JavaScript, teclado y lectores
de pantalla ya resueltos, y el `name` compartido es el acordeón exclusivo de
HTML (abrir uno cierra el anterior) que degrada a «se abren varios» donde aún
no esté soportado. **El texto sigue entero en el HTML** — `<details>` no lo
saca del árbol de accesibilidad ni del primer render. En escritorio, los cuatro
pliegues en dos columnas: la misma estructura, más densa.

**1 156 px → 681 px.**

### 3.3 El configurador de lona se abre, no se impone

No estaba en la lista del encargo, y era **el bloque más alto de la portada**:
**4 733 px de los 17 237** que medía entera a 390 px — un 27 % del
desplazamiento de un teléfono para una herramienta de siete pasos que se usa
cuando ya se decidió especificar, no mientras se hojea.

Ahora vive dentro de un `<details>` con un resumen claro («Arme su lona paso a
paso»). El encabezado, la descripción y el enlace «Abrir el configurador
completo» siguen siempre visibles. Cerrado también en escritorio, a propósito:
una sola forma de la portada en los dos sitios.

**4 733 px → 473 px.** Es la mitad de la reducción total de esta entrega.
**Esto merece el juicio visual del dueño**: si prefiere el configurador
desplegado de entrada en escritorio, es un cambio de una línea.

### 3.4 `MachineryGallery` — **no era un segundo hero**

Se leyó el componente y se midió antes de tocarlo. A 390 px la tarjeta central
es `aspect-[16/10]` sobre 342 px de ancho: **214 px de alto**, un cuarto de la
pantalla, no una pantalla entera. La sección completa medía 855 px y eso es
encabezado + escenario + tira de miniaturas, no una portada repetida.

Así que **no se difiere tras un «Ver planta» ni se esconde**: se compacta.
`py-20` fijo → `section-pad` (el token de la casa, que ya baja a 3 rem en
móvil), encabezado en escala compacta, miniaturas `w-36` → `w-28` en móvil.
**855 px → 821 px.** Corrección modesta, porque el problema era modesto.

### 3.5 Cajón del Navbar móvil — **ya estaba bien, no se tocó**

`components/Navbar.tsx` declara `useState(false)` para `mobileProductsOpen` y
`useState<string | null>(null)` para `mobileGrupo`: todos los grupos arrancan
cerrados y no hay efecto que abra ninguno al montar el cajón. **No-op
confirmado.** No se inventó una corrección para un problema inexistente.

### 3.6 Bonus medido: la marquesina de sectores duplicada

`SectorTicker` duplica su lista para que el desplazamiento no tenga costura, y
la copia ya lleva `aria-hidden`. Pero con `prefers-reduced-motion: reduce` la
pista deja de desplazarse y pasa a `flex-wrap: wrap`: entonces **las 12 píldoras
y sus 12 duplicados se apilan a la vista**, doce filas, la mitad repetidas,
justo en la sección que esta entrega existe para compactar. Una línea en
`globals.css` oculta la copia cuando no hay bucle. Quien pide menos movimiento
no pide el doble de contenido.

### 3.7 `BarraMovilContacto` — intacta

No se tocó el archivo. La barra fija y su espaciador siguen exactamente como
los dejó la entrega anterior; se comprobó en las capturas (la barra aparece al
pie de la pantalla en claro y en oscuro).

---

## 4 · Modo oscuro: una regresión encontrada y corregida antes de salir

Los dos `<details>` nuevos aparecían **con fondo blanco** en tema oscuro. La
capa de compatibilidad de `globals.css` remapea `.bg-white` a la superficie
oscura, pero su lista de etiquetas —`div, section, article, aside, li, p,
span, …`— no incluía `details` ni `summary`. La capa de tinta sí alcanzaba al
texto y lo volvía claro: **1,17:1, texto invisible**. Es el mismo fallo que ese
comentario ya documenta para tablas y chips, con otra etiqueta; ampliar la
lista es aditivo, igual que entonces.

`npm run audit:ui` mide clases con fallo de contraste. Contadas sobre las 112
vistas que audita:

| | `main` | rama (antes del arreglo) | rama (final) |
|---|---|---|---|
| contraste oscuro | 11 | 18 | **11** |
| contraste claro | 1 | 1 | **1** |

**La línea base (`docs/ui-audit-baseline.json`) no se tocó** y sigue en
`contrasteClaro: 1, contrasteOscuro: 1`. `audit:ui` falla en `main` desde antes
de esta rama; esta entrega no lo empeora y deja el mismo número. Las 11 clases
restantes son todas de la portada anterior (tarjeta del hero, cuñas, novedades,
tagline del pie móvil) y ninguna es de los componentes nuevos.

---

## 5 · Verificación

```
npx tsc --noEmit              sin salida
npm test                      66 archivos · 1071 pruebas · 0 fallos
npm run auditar:imagenes      517 archivos, 201 rutas citadas · 0 errores, 0 avisos
npm run build                 ✓ Compiled successfully
npm run auditar:navegacion    0 errores · 45 destinos · 12 grupos × 5 anchos
npm run seo:claims            34 pruebas · 0 fallos
npm run auditar:viewport      3 errores — TODOS preexistentes: «Cotizar» de la
                              CABECERA recortado a 280 px (Galaxy Fold cerrado)
                              en /, /productos y /industria/mineria. No se tocó
                              el Navbar en esta entrega.
```

Medios sin tocar: `ls public/images/galeria/*.webp | wc -l` = **228**;
`git ls-files 'public/videos/*'` = **6 mp4 + 3 pósters**, sin cambios.

---

## 6 · Capturas

`docs/entregas/capturas/2026-09-20-home-density/`

**390 × 844**
- `footer-whatsapp-antes.webp` / `footer-whatsapp-despues.webp`
- `footer-whatsapp-320-despues.webp` — el caso que envolvía, a 320 px
- `servicios-antes.webp` / `servicios-despues.webp` — el recorte a media palabra
- `catalogo-antes.webp` / `catalogo-despues.webp` — las dos secciones → una
- `porque-antes.webp` / `porque-despues.webp`
- `configurador-plegado-oscuro-despues.webp` — el pliegue en tema oscuro

**1440 × 900**
- `catalogo-antes.webp` / `catalogo-despues.webp`

---

## 7 · Lo que queda al juicio del dueño

1. **El configurador plegado también en escritorio.** Es la mitad del ahorro y
   es la decisión más opinada de la entrega.
2. **La altura de las pestañas de servicio en móvil (42 px).** Por debajo de 44
   a propósito, razonado arriba; si se prefiere el mínimo estricto, son dos
   valores de relleno.
3. **`FamilyCarousel` y `FeaturedDeck` quedan huérfanos.** Retirarlos es una
   entrega aparte, cuando se confirme que la sección fusionada convence.

**Los tres están resueltos en §8.** El dueño se pronunció: el configurador se
queda plegado (1), las pestañas suben a 44 px en táctil (2), los huérfanos se
borran (3).

---

## 8 · Limpieza posterior (`chore/home-density-cleanup`)

Esta sección la añade la entrega de limpieza que cierra los tres puntos del §7.
No reabre ninguna decisión de densidad: sólo ejecuta lo que el dueño confirmó.

### 8.1 El configurador sigue plegado — sin cambios

Decisión confirmada, **no se tocó una línea**. El `<details>` de
`app/(es)/page.tsx` sigue sin atributo `open`, así que el bloque nace cerrado
en los dos temas y en los dos anchos. Se anota aquí explícitamente para que no
vuelva a aparecer como «pendiente de confirmar» en una entrega futura.

### 8.2 Huérfanos borrados

`components/FamilyCarousel.tsx` y `components/FeaturedDeck.tsx` **se borraron**.

Antes de borrar se buscó cada nombre y cada ruta de fichero en todo el
repositorio —no sólo en la portada—: `app/` con sus tres grupos de ruta
(`(es)`, `(en)`, `(pt)`), `components/`, `lib/`, `test/`, `scripts/` y `docs/`.
**Cero importaciones**, estáticas o dinámicas, y **cero tests** que los
ejercieran: no hubo que retirar ningún fichero de prueba ni ninguna aserción.
Lo único que los nombraba era prosa: la cabecera de `ExplorarCatalogo.tsx`, que
cuenta qué sustituyó, y estas entregas. Esa prosa se conserva —es historia, y
se marca como tal— en lugar de reescribirse.

### 8.3 Las pestañas de servicio llegan a 44 px en táctil

El §2 justificaba los 42 px como de **bajo riesgo**, que no es lo mismo que
suficiente: 44 px es el mínimo, y «poco peligroso» no lo sustituye.

La corrección no devuelve el relleno a su valor anterior, porque eso recrearía
exactamente el problema de altura que el §2 venía a resolver. Se separan las
dos cosas: el **peso visual** lo sigue fijando el relleno compacto
(`px-3.5 py-2.5`), y el **blanco de tiro** se declara aparte, con
`.tab-servicio { min-height: 44px }` dentro de un `@media (pointer: coarse)` en
`app/globals.css`. Es el mismo mecanismo y el mismo sitio que ya usaba
`.btn-sm` unas líneas más arriba: un patrón de la casa, no uno nuevo. La
píldora ya centraba su contenido con flex, así que el contenido no se mueve;
sólo crece la caja, 4 px. Donde hay ratón no cambia nada.

**Se descartó la alternativa del seudoelemento.** Extender el área tocable con
un `::before { position: absolute; inset: -2px }` habría dejado la caja visible
en 42 px, pero el carril de pestañas es `overflow-x-auto`, que computa recorte
**también en el eje vertical**: el seudoelemento saldría recortado justo donde
se pretendía ganar. Habría medido bien en el inspector y mal con el dedo.

**Medido en Chromium a 390 × 844 con `pointer: coarse` emulado**, sobre el
`getBoundingClientRect()` real de las cuatro pestañas: ver §8.4. El carril
completo se queda en 44 px de alto, lejos del techo de ~52 px que haría que la
fila volviera a dominar la sección.

### 8.4 Verificación

**Altura de pestaña, medida, no estimada.** Chromium sobre el build de
producción, dos contextos con el MISMO ancho de 390 px para aislar el puntero
como única variable:

| Contexto | `(pointer: coarse)` | Alto de cada pestaña | Alto del carril |
|---|---|---|---|
| Táctil (`hasTouch`, `isMobile`) | `true` | **44,00 px** ×4 | **44 px** |
| Ratón (mismo ancho) | `false` | 41,50 px ×4 | 41,5 px |

Las cuatro pestañas miden 44,00 px exactos en táctil —«Fabricación a Medida»
187 px de ancho, «Instalación Propia» 164, «Importación Directa» 176,
«Asesoría Técnica» 161— y el carril completo se queda en 44 px, muy por debajo
del techo de ~52 px. Con ratón siguen en 41,5 px: el peso visual compacto del
§2 está intacto donde el §2 lo quería.

**Suite.** `tsc --noEmit` limpio. `npm test`: **66 ficheros, 1 071 pruebas, 0
fallos** (incluye `huerfanas.test.ts`, que reconstruye el grafo de enlaces
internos y habría cantado si el borrado hubiera dejado una página colgando).
`npm run auditar:imagenes`: **0 errores, 0 avisos** sobre 517 ficheros en
`public/` y 201 rutas citadas. `npm run build` completo sin avisos nuevos.

**Ninguna línea base se tocó.** Ni el número de `docs/ui-audit-baseline.json`
ni la base/tolerancia de `auditar:viewport`. Lo que fallara antes sigue
fallando igual: mover la portería no es arreglar.

**Ningún medio se borró ni se recodificó.** `public/images/galeria/` mantiene
sus **228 WebP** y `public/videos/` sus **6 mp4**, sin un solo cambio en el
índice de git. Comprobado además servido: los seis vídeos responden `206` a
una petición por rango, y tres fichas de producto tomadas al azar
—`mantas-cobertores-toldos-camiones` (8 fotos de galería),
`mallas-antiafidas` (5), `mangas-ventilacion-minas-tuneles` (7)— pintan sus
imágenes desde `/images/galeria/`.

### 8.5 Estado de la portada, comprobado sobre el build de `main`

La producción (`plastilonas-peruanas-sac.vercel.app`) **no es alcanzable desde
el entorno donde se ejecutó esta limpieza**: el proxy de salida bloquea el
dominio y el token de Vercel no tiene alcance sobre el proyecto. Así que lo que
sigue está medido sobre el build de producción del `main` fusionado —el mismo
código que la producción sirve—, y se anota la distinción en vez de disimularla.

- **«Explorar catálogo» está fusionada.** Los `h2` de la portada son: «4 líneas
  que puede cotizar hoy…», «Lo que más nos piden…», **«Explorar catálogo»**,
  «Arme su lona capa por capa», «El proceso, paso a paso», «Servicios
  integrales…», «La ventaja de un solo proveedor…», «El oficio», «Novedades».
  **No aparece** ni «Explore el catálogo por familia» ni «Nuestras líneas
  insignia»: las dos secciones viejas ya no existen.
- **El WhatsApp del pie es el arreglo de dos líneas.** «WhatsApp comercial» +
  «+51 924 875 632», fondo `rgba(255,255,255,0.06)` y texto
  `rgba(255,255,255,0.9)`. **No hay ningún `#25D366`**: el ladrillo verde se
  fue.
- **El título de servicios es el compacto.** «Servicios integrales, de
  principio a fin» a `22px` y 50,6 px de alto a 390 px de ancho.
- **El configurador nace plegado.** Su `<details>` reporta `open === false` en
  el DOM hidratado, igual que los cuatro del acordeón «Por qué elegirnos». Las
  filas de píldoras no se pintan hasta que alguien lo abre.
- **`/oficio` sirve las tres películas.** «El oficio», «La materia» y «El
  gesto», con los seis mp4 accesibles bajo `/videos/`.
