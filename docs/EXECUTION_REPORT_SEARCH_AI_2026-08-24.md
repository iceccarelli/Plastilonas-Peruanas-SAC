# Informe de ejecución — descubribilidad en búsqueda y en IA

**Fecha:** 2026-08-24 · **Rama:** `feat/search-ai-domination-2026-08` · **Base:** `67693bd`

> Este informe vive en `docs/` y no en la raíz porque `test/repositorio-limpio.test.ts`
> lo exige, y tiene razón: la raíz es configuración. La prueba lo cazó al intentarlo.

---

## Lo primero, porque cambia cómo se lee todo lo demás

El encargo pedía construir desde cero la base técnica: fuente única de verdad,
robots, sitemap, `llms.txt`, esquema JSON-LD, hubs sectoriales, glosario,
interruptor de dominio, endpoints de datos abiertos. **Casi todo eso ya
existía en este repositorio**, y bien hecho: 51 plantillas de página, 203 URLs
públicas, 15 endpoints legibles por máquina, 561 pruebas en verde y una
disciplina de honestidad —`afirmaciones.test.ts`, `proyectos.verificado`,
`/confianza`— que es mejor que la de la mayoría de sitios industriales del
mundo, no sólo del Perú.

Así que la auditoría no encontró un solar vacío. Encontró un edificio con
cuatro huecos concretos. Este ciclo los cierra. Lo que **no** hace, y conviene
decirlo antes de la lista: no crea páginas nuevas de «producto × ciudad», no
inventa proyectos, no registra cifras que esta empresa no pueda sostener con un
documento, y no promete que ningún buscador ni modelo vaya a colocar a
Plastilonas primero. Eso último no lo decide el repositorio.

---

## P0 — Auditoría de estado

**`scripts/auditar-estado.mjs` → `audit/current-state.json`** (nuevo)

Inventario completo del repositorio, no del sitio desplegado: se hace sobre el
código para que pueda romper el build en el mismo commit que introduce el
problema, cosa que un rastreo con servidor levantado no puede.

Contiene, sin omisiones: cada plantilla de página con su ruta pública, su
título, su H1, su canonical, los esquemas JSON-LD que emite y sus enlaces
salientes; cada endpoint de máquina con su tipo de contenido y su política de
indexación; el catálogo completo (productos, familias, industrias, glosario,
guías, aplicaciones, soluciones, ciudades); el grafo de enlaces con profundidad
en clics desde la portada; el mapa de consultas; el registro de afirmaciones; y
los proyectos redactados frente a los publicados.

Tres correcciones del propio auditor, cada una porque la primera versión mentía:

1. **Leía sólo `page.tsx`.** Las páginas interactivas —`/contacto`,
   `/marco/evaluacion`— son `'use client'` y ponen su canonical y su JSON-LD en
   un `layout.tsx` hermano. El auditor las daba por rotas: 11 falsos positivos
   de canonical que escondían los 2 reales. Ahora fusiona página y layout.
2. **No contaba los enlaces interpolados.** `href={\`/productos/${p.slug}\`}` es
   como este sitio enlaza sus 36 fichas, y no casaba con el patrón. Resultado:
   las páginas comerciales aparecían como huérfanas y a más de tres clics cuando
   están a dos. Ahora se resuelven a su plantilla y se cuentan.
3. **Perseguía «desde ‹año›» sin contexto.** Marcaba «la ISO 21898 que el Callao
   exige desde 2023» como inconsistencia de año de fundación. Ahora sólo
   persigue la antigüedad *de la empresa*.

**Estado tras el ciclo:**

| Hallazgo | Antes | Ahora |
| --- | ---: | ---: |
| Páginas sin canonical | 2 reales | 2 (`/dashboard`, `/login` — tras autenticación, con `Disallow` en robots) |
| Páginas sin ningún JSON-LD | 20 | 10 (carrito, checkout, autenticación, legales, `/en`, `/pt`) |
| Páginas profundas sin `BreadcrumbList` | 2 | 1 (`/checkout/exito`) |
| Páginas huérfanas | 1 | 1 (`/checkout/exito`, post-pago: correcto) |
| Cifras escritas a mano que ya viven en una fuente | 2 | 0 |

---

## P0 — Registro de afirmaciones

**`lib/content/claims.ts` + `test/registro-afirmaciones.test.ts`** (nuevo)

`afirmaciones.test.ts` ya existía y es una **lista negra**: persigue seis formas
conocidas de mentir. Funciona para lo que ya salió mal una vez y no dice nada de
la cifra nueva que alguien escriba mañana.

Esto es la **lista blanca**. Las 15 cifras que este sitio puede publicar sobre sí
mismo, cada una con `valor()` derivado de su fuente de verdad, `fuente` escrita
y `verificadoEl` fechado. Registrar «clientes atendidos», «toneladas
despachadas» o «años de garantía» hace fallar la prueba: no es que suenen mal,
es que esta empresa no tiene un sistema del que salgan.

**Dos derivas reales encontradas y corregidas en `app/page.tsx`:**

- `const anios = new Date().getFullYear() - 2009` y `sub: 'En el Perú desde 2009'`
  → ahora `YEARS_OPERATING` y `SITE.foundingYear`. El año de constitución estaba
  escrito a mano dos veces en la portada mientras `lib/site.ts` era la única
  fuente que podía saberlo.
- `text: 'RUC 20523135385'` → ahora `RUC ${SITE.ruc}`.

---

## P1.5 — Mapa de consultas (el trabajo principal)

**`data/topic-map.json` + `lib/search/topic-map.ts` + `test/mapa-consultas.test.ts`** (nuevo)

**67 clústeres · 647 términos · 155 preguntas conversacionales.**

El encargo pedía «expandir hasta que sea imposible fallar». El problema real de
este sitio no era falta de cobertura: era **canibalización**. «Geomembrana»
aparece en la familia, en cuatro fichas, en una guía, en una calculadora, en dos
términos de glosario y en un artículo. Con ocho candidatas parecidas, el
buscador reparte la señal y no posiciona ninguna. Eso no se arregla escribiendo
más — se arregla decidiendo.

Cada clúster declara: el término principal, sus variantes reales (plural, orden
invertido, sinónimo del rubro), sus erratas frecuentes (`bigbag`,
`mangas ventilacion`, `lona plastifcada`), las preguntas conversacionales que
contesta, **una** página canónica, y las páginas de apoyo que la refuerzan sin
competir con ella.

Lo que rompe el build:

- un término reclamado por dos clústeres (dos páginas compitiendo)
- una canónica declarada por dos clústeres
- una ruta —canónica o apoyo— que no existe en `app/`
- un producto, familia o sector sin clúster que lo declare canónico
- un clúster sin apoyos (una página aislada del grafo)

**Las erratas viven en el mapa, no en páginas.** Una página por errata es una
doorway page; y una errata no necesita página propia, necesita que la página
buena la cubra. Por la misma razón no hay ninguna página nueva de «producto ×
ciudad»: el propio mapa las haría fallar por canibalización contra la familia
que sí responde.

Al generarlo, 20 entradas se eliminaron por redundantes: una errata que sólo
difiere en tildes ya la resuelve la normalización.

---

## P2 — Enlace lateral entre páginas comerciales

**`components/RielComercial.tsx`** (nuevo), montado en ficha de producto,
página de familia y hub sectorial.

El grafo interno iba de arriba abajo: portada → catálogo → familia → ficha. Lo
que casi no existía era el enlace **lateral** —de la ficha de geomembrana HDPE a
la de geotextiles, que es lo siguiente que compra la misma persona— y es el que
reparte autoridad entre páginas comerciales en lugar de acumularla en la
portada.

Los destinos salen del mapa, no de una lista escrita en cada página, y el texto
del enlace es el término por el que esa página compite. **Máximo seis vecinos.**
No se vuelcan los 647 términos: eso es relleno de palabras clave y hoy se
descuenta, no se premia.

---

## P4 — Superficies para máquinas

| Superficie | Qué es | Indexable |
| --- | --- | --- |
| `/mapa-consultas.json` | La tabla de decisión completa, con canónicas absolutas y la entidad con RUC | **Sí** — contenido propio |
| `/llms-full.txt` | El corpus entero: catálogo, familias, sectores, guías íntegras y glosario | **No** — `noindex`, canonical a `/llms.txt` |
| `/productos/[slug]/contenido.md` | Espejo en texto plano de cada ficha, con bloque de hechos citables | **No** — `noindex`, canonical a la ficha HTML |

Los dos `noindex` son deliberados y están declarados explícitamente en las
cabeceras, no dejados a la interpretación del rastreador: son el mismo texto que
las páginas HTML, y si el buscador eligiera el `.md` el usuario aterrizaría en un
archivo de texto en vez de en la página que cotiza.

**`llms.txt`** ahora abre con el mapa de consultas **antes** del catálogo. Un
agente que resuelve «geomembranas Perú» no necesita leer las 36 fichas: necesita
saber cuál es la respuesta, y saberlo antes de gastarse el contexto. Hay una
prueba que verifica ese orden.

**Bloque de hechos citables** (`hechosCitables()`): entidad, RUC, ubicación,
año de fundación, metodología, canonical, y cada afirmación con su fuente y su
fecha de verificación. Con contextos: los conteos internos del sitio no se
filtran a una ficha de producto de adorno.

**`BreadcrumbList` + `WebPage` en la ficha de producto**, que no los tenía. Era
la página comercial más importante del sitio y la única profunda sin jerarquía
declarada: pintaba una miga de pan visible que ningún agente podía leer.

**Diez páginas colgadas del grafo de entidad** (`components/EsquemaPagina.tsx` +
un layout por página): `/confianza`, `/calidad`, `/compras`, `/proyectos`,
`/distribuidores`, `/socios`, `/exportacion`, `/compradores`, `/biblioteca`,
`/aplicaciones`. Son las páginas a las que llega quien está **comprobando** al
proveedor, y existían para el lector pero no para el grafo.

---

## Dominio antiguo — el punto que no se puede cerrar desde el código

**`scripts/verify-domain-redirect.mjs`** (nuevo) · `npm run seo:dominio`

El encargo exige 301 permanentes de cada ruta de `plastilonas.com` a su
equivalente. **Hoy eso es imposible, y no por falta de código.** El dominio es de
la empresa y sirve el correo, pero **el DNS sigue apuntando al sitio antiguo**:
no hay ninguna redirección que comprobar porque el dominio no llega a este
proyecto.

Por eso el script tiene dos modos. Por defecto **diagnostica** y termina en 0.
Con `VERIFICAR_DOMINIO=1` **exige** y rompe el build ante cualquier 200, 404,
302, o —lo más caro de todo— un 301 que mande `/productos/geomembranas-pvc` a la
portada: Google trata eso como soft-404, no traslada la autoridad, y diez años de
enlaces a fichas concretas se convierten en enlaces a la portada.

**Los dos pasos, que son suyos y no del repositorio:**

1. DNS: apuntar `plastilonas.com` al proyecto de Vercel y verificarlo en
   Settings → Domains.
2. Vercel → Environment Variables: `CANONICAL_ORIGIN = https://plastilonas.com`

Con esa variable, en el mismo despliegue y sin tocar código: `SITE.url`,
sitemap, robots, `llms.txt`, canonicals y todo el JSON-LD pasan al dominio de
marca; `www` → apex con 308; y el host de Vercel deja de competir. El interruptor
ya estaba construido y probado en `middleware.ts`. Falta pulsarlo.

Cuando tenga el inventario de URLs del sitio antiguo (Search Console → Páginas),
guárdelo en `audit/urls-dominio-antiguo.json` y el script lo usará en lugar de la
muestra.

---

## P7 — Banco de medición

**`scripts/generar-prompts-ia.mjs` → `audit/ai-prompts.json`** (nuevo)

**702 consultas**, todas derivadas del mapa, del glosario y del catálogo: si el
banco se escribiera aparte mediría lo que alguien imaginó que se busca, no lo
que el sitio decidió contestar.

| Categoría | Consultas | Mínimo exigido |
| --- | ---: | ---: |
| Comercial | 196 | 100 |
| Técnica | 109 | 100 |
| Sector y local | 136 | 100 |
| Comparación | 60 | 50 |
| Problema | 134 | 50 |
| Adyacente lejana | 67 | 50 |

Se ejecuta a mano contra cada asistente y se anota por consulta: *citado*,
*url_correcta*, *recomendado*, *exacto*. **`exacto` pesa más que los otros tres
juntos.** Una respuesta que recomienda la empresa inventando una certificación o
un plazo hace más daño que una que no la menciona: el comprador comprueba, no
encuentra, y descarta al proveedor por una mentira que puso el modelo.

No llama a los modelos automáticamente. Una cifra que cambia sola con cada
actualización de un modelo ajeno, y que nadie puede reproducir, no es una
medición.

---

## Comandos nuevos

```
npm run seo:estado        auditoría de estado, con resumen por consola
npm run seo:consistency   falla si una cifra de una fuente de verdad está escrita a mano
npm run seo:claims        lista negra + lista blanca + conteos del catálogo
npm run seo:schema        robots, sitemap, JSON-LD, llms.txt
npm run seo:links         navegación + mapa de consultas
npm run seo:mapa          sólo el mapa de consultas
npm run seo:prompts       regenera el banco de prompts
npm run seo:dominio       diagnóstico de la migración de dominio
npm run seo:crawl         verificación contra el sitio desplegado
npm run seo:all           todo lo que corre sin red (lo que hay en CI)
```

`npm run seo:all` está en `.github/workflows/ci.yml`, antes del build.

---

## Estado de las pruebas

| | Antes | Ahora |
| --- | ---: | ---: |
| Archivos de prueba | 38 | 41 |
| Pruebas | 561 | 619 |
| `tsc --noEmit` | limpio | limpio |

`next build` **no se pudo ejecutar en el entorno de preparación**: bloquea
`fonts.googleapis.com` y `next/font` falla al descargar Inter, JetBrains Mono y
Playfair Display. No es un fallo del código —ninguna fuente cambió— pero
significa que **el prerenderizado no está verificado**. Ejecute `npx next build`
antes de fusionar; el flujo de CI lo hace igualmente.

Mitigación mientras tanto: `test/superficies-maquina.test.ts` (19 pruebas)
ejecuta de verdad los tres manejadores de ruta nuevos y comprueba códigos,
cabeceras, `noindex`, canonical y contenido.

---

## Un error de este ciclo, anotado

Sobrescribí `app/marco/evaluacion/layout.tsx` completo por un hallazgo del
auditor que resultó ser un falso positivo —el layout ya tenía canonical y
`BreadcrumbList`; el auditor no leía layouts—. Se perdieron en el proceso el
`TrackView` de analítica, el esquema del proceso (`ImagenContenido`) y un
título mejor que el mío. Revertido por completo. La causa raíz, que el auditor
no fusionara página y layout, está corregida y es lo que bajó los falsos
positivos de canonical de 11 a 0.

---

## Las diez acciones siguientes, por impacto

1. **Migrar el DNS y poner `CANONICAL_ORIGIN`.** Nada de lo anterior compensa
   que el sitio viva en un subdominio de Vercel mientras el dominio de marca
   sirve un sitio antiguo. Es la única acción de esta lista que multiplica todas
   las demás, y no depende del código.
2. **Exportar el inventario de URLs del sitio antiguo** desde Search Console a
   `audit/urls-dominio-antiguo.json`, y activar `VERIFICAR_DOMINIO=1` en CI el
   día de la migración.
3. **Confirmar y publicar una ficha de proyecto.** Hay 5 redactadas y **0
   publicadas**. Una sola con `verificado: true` cambia la página `/proyectos` de
   promesa a evidencia, y es lo que un jefe de compras abre primero. Requiere una
   conversación con el área comercial, no código.
4. **Verificar los datos registrales contra la ficha RUC** y actualizar
   `VERIFICADO_REGISTRAL` en `lib/content/claims.ts`. `SITE.foundingYear`,
   `isicV4` y `naics` llevan un comentario `VERIFY` sin resolver desde hace
   tiempo.
5. **Correr el banco de 702 prompts** contra ChatGPT, Claude, Perplexity y
   Gemini, y anotar la línea base. Sin línea base no hay forma de saber si algo
   de esto funcionó.
6. **Google Business Profile.** Categoría primaria y secundarias, fotos reales
   de planta, y las preguntas del mapa sembradas en Q&A. Es la palanca local más
   grande que queda y no se toca desde el repositorio.
7. **Search Console y Bing Webmaster** sobre el dominio de marca, en cuanto
   exista, y enviar el sitemap. El repositorio ya emite `indexnow-key.txt`.
8. **Cerrar `/checkout/exito`**: es la única página profunda sin
   `BreadcrumbList` y la única huérfana. Probablemente lo correcto sea marcarla
   `noindex` y sacarla del sitemap, no darle esquema.
9. **Extender los espejos `.md`** a familias, hubs sectoriales y guías. Hoy sólo
   las 36 fichas de producto los tienen.
10. **Revisar el mapa cada vez que crezca el catálogo.** Un producto nuevo sin
    clúster rompe el build a propósito: es el recordatorio de decidir por qué
    término compite antes de publicarlo, no después.

---

## Lo que este trabajo no hace

No garantiza posición ni citación. Ningún cambio de repositorio puede hacerlo:
el ranking lo decide un tercero con criterios que no publica, y la citación de
un modelo depende de su corpus de entrenamiento y de su índice de recuperación,
que tampoco controlamos. Lo que sí hace es cerrar todas las razones **propias**
por las que un buscador o un modelo elegiría a otro: ambigüedad sobre qué página
contesta qué, páginas sin declarar su jerarquía, cifras que se contradicen entre
sí, y contenido que un agente sólo puede leer descargando una aplicación entera.

Y lo hace sin inventar un solo dato. Las 619 pruebas siguen en verde, incluidas
las seis que rompen el build si alguien escribe que somos líderes del mercado.
