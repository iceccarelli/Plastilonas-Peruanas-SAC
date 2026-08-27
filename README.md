# Plastilonas Peruanas SAC — sitio y referencia técnica

Sitio de **Plastilonas Peruanas SAC** (RUC 20523135385), fabricante e instalador
peruano de textil industrial y geosintéticos. Next.js 15 (App Router),
TypeScript, Tailwind, desplegado en Vercel.

Esto no es un folleto del proyecto. Es lo que hay que saber antes de cambiar
algo aquí, en el orden en que se necesita.

---

## 1. Las reglas que no se rompen

El sitio compite por confianza, no por volumen: quien lo abre es un comprador
industrial verificando a un proveedor antes de homologarlo. Todo lo demás se
puede rehacer; esto no.

- **No se inventan certificaciones.** No hay ISO, ASTM, CE ni UL a nombre de
  esta empresa. Se citan normas ajenas cuando aplican —«el Callao exige ISO
  21898»— y nunca como credencial propia.
- **No se inventan clientes, obras ni cifras de negocio.** `lib/projects.ts`
  tiene fichas redactadas y ninguna publicada: no se publica ninguna sin que
  el área comercial confirme que la obra existió tal como está escrita y que
  el cliente autorizó mencionarla (`verificado: true`).
- **No se publican precios.** La venta es B2B por cotización. Cualquier precio
  atribuido a esta empresa en otra fuente no es oficial.
- **No se promete envío mundial.** Se fabrica en Chorrillos y se evalúa cada
  operación internacional. Hay evidencia pública de comercio hacia Colombia;
  el resto se confirma caso por caso.
- **Las cifras salen de los datos, no del teclado.** `lib/facts.ts` es la
  fuente única de conteos y antigüedad. Escribir «36 productos» a mano crea
  una cifra que caduca en silencio.
- **Lo que no se afirma se declara.** Cada hub de aplicación publica su lista
  de límites; `/confianza` publica la de la empresa entera.

`test/afirmaciones.test.ts` hace fallar el build si vuelve a colarse un
recuento de clientes, un liderazgo de mercado, una certificación propia o una
sede que no existe. Se escribió después de encontrar en la página *Nosotros*
una invitación a unirse a un número redondo de empresas que ya confiaban en
Plastilonas: una cifra que no sale de ningún sistema de esta empresa y que
nadie puede comprobar. La regla vale también para este archivo, y por eso la
cifra no se reproduce aquí — la prueba la cazaría, con razón.

---

## 2. Arranque

```bash
npm install
cp .env.example .env.local     # todo opcional; ver el apartado 3
npm run dev                    # http://localhost:3000
```

El sitio público funciona **sin ninguna variable de entorno**: los formularios
salen por WhatsApp. Las variables habilitan chatbot, login, pedidos y analítica.

---

## 3. Variables de entorno

`.env.example` está comentado archivo por archivo y es la referencia buena.
Lo que conviene saber sin abrirlo:

| Variable | Para qué | Si falta |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chatbot (Claude vía Vercel AI SDK) | El widget ofrece WhatsApp |
| `AUTH_SECRET` + `AUTH_*_ID/SECRET` | Login de clientes (Auth.js v5) | `/login` dice «disponible próximamente» |
| `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` | Pedidos persistidos y panel | El sitio público no cambia |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout hospedado | No hay pago en línea |
| `N8N_WEBHOOK_URL` | Reenvío de leads | `/api/lead` responde 200 y no reenvía |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GTM_ID` | Analítica | No se carga ningún script de terceros |
| **`CANONICAL_ORIGIN`** | Interruptor de mudanza de dominio. **La única que mueve `SITE.url`** | **Ver el aviso de abajo** |
| `NEXT_PUBLIC_SITE_URL` | URLs de retorno de Stripe, y sólo eso | No afecta al origen canónico |

> **`CANONICAL_ORIGIN` puede desindexar el sitio entero.** Cuando su valor
> coincide con el host canónico, `middleware.ts` emite
> `X-Robots-Tag: noindex, nofollow` en cualquier host `*.vercel.app` — que es
> donde vive el sitio hoy. Está **vacío a propósito**. Sólo se rellena el día
> que el DNS de `plastilonas.com` apunte a este proyecto, y ese mismo día
> `SITE.url` en `lib/site.ts` pasa a ese dominio. `test/dominio-migracion.test.ts`
> vigila el interruptor.

El chatbot corre sobre **Anthropic**, no sobre OpenAI. `@ai-sdk/openai` no está
instalado y `OPENAI_API_KEY` no la lee nadie.

---

## 4. Verificación

Nada se publica sin que estas siete pasen. **Las siete corren en CI** en cada
pull request (`.github/workflows/ci.yml`), y el flujo añade dos pasos más que no
están en esta lista: `npm run seo:all` y una segunda pasada aislada de
`test/facts.test.ts` contra las contradicciones de conteo.

```bash
npx tsc --noEmit            # tipos
npm test                    # la suite completa (vitest)
npm run auditar:imagenes    # toda ruta de imagen citada tiene archivo
npm run build               # el sitio completo, estático
npm run auditar             # el HTML SERVIDO: títulos, descripciones, enlaces,
                            #   imágenes, nombres accesibles, JSON-LD, huérfanas
npm run auditar:viewport    # 17 dispositivos de 280px a 2560px, con Chromium
npm run auditar:navegacion  # los desplegables: que se abran, se alcancen y se pulsen
```

Las dos últimas usan navegador de verdad porque miden lo que ninguna prueba de
unidad ve. `auditar:viewport` nació porque una barra de once entradas dejó el
CTA fuera de pantalla entre 1280 y 1920 px durante semanas. `auditar:navegacion`
nació porque los 48 paneles del menú se cerraban mientras el puntero viajaba
del botón a la primera opción: el HTML estaba bien, la maquetación estaba bien,
y lo que fallaba era el trayecto.

---

## 5. Dónde vive la verdad

El catálogo y el contenido no están en las páginas: están en `lib/`, y las
páginas los derivan. Editar el dato actualiza todo lo que dependa de él —
página, PDF, JSON, sitemap, `llms.txt` y datos estructurados.

| Archivo | Qué manda |
|---|---|
| `lib/site.ts` | Identidad, dominio, contacto. **Toda URL canónica sale de aquí.** |
| `lib/facts.ts` | Conteos y antigüedad. Fuente única. |
| `lib/products.ts` | Catálogo: especificaciones, sectores, suministro, galería |
| `lib/families.ts` | Familias de producto y sus criterios |
| `lib/industrias.ts` | Los cinco hubs sectoriales y sus errores de compra |
| `lib/guides.ts` / `lib/applications.ts` | Biblioteca de especificación y hubs de aplicación |
| `lib/articles.ts` / `lib/solutions.ts` | Guías técnicas y arquitecturas de referencia |
| `lib/glosario.ts` / `lib/framework.ts` | Vocabulario del rubro y Marco de Especificación |
| `lib/calculadoras.ts` | Métodos de predimensionamiento, con sus límites |
| `lib/informes.ts` / `lib/novedades.ts` | Informes con fuente oficial y registro fechado |
| `lib/projects.ts` | Fichas de obra. Nada se publica sin `verificado: true` |
| `lib/imagenes.ts` | Registro de imágenes: ruta, tamaño, alt, contexto y prompt |
| `lib/meta.ts` | Presupuesto de título (65) y descripción (155) del resultado de búsqueda |
| `lib/schema.ts` | Todos los generadores de JSON-LD |

---

## 6. Imágenes

`lib/imagenes.ts` declara cada hueco de imagen del sitio con su ruta exacta,
tamaño, texto alternativo y el prompt con el que encargarla. De ahí sale el
pliego:

```bash
npm run imagenes            # estado: publicadas y pendientes
npm run imagenes:prompts    # escribe docs/encargo-imagenes.md
npm run imagenes:tomas      # pide tomas alternas de las ya publicadas
```

`components/ImagenContenido.tsx` degrada en tres escalones: archivo encargado →
fotografía real del catálogo, con pie honesto → hueco declarado. Nunca un icono
roto y nunca un relleno genérico, que es peor porque ocupa el sitio del bueno y
nadie vuelve a acordarse de encargarlo.

Las ilustraciones son referenciales y los esquemas son dibujos explicativos.
**Ninguna es fotografía de una obra ejecutada por esta empresa**, y así se
declara en el pie y en el JSON-LD.

---

## 7. Para agentes y rastreadores

Esta parte del sitio existe a propósito y conviene no romperla.

- **`/llms.txt`** es el mapa curado para agentes: catálogo, hubs, guías con sus
  preguntas de cotización, límites declarados, y un apartado explícito de
  cuándo esta empresa **no** es la respuesta correcta. Se genera de las mismas
  fuentes que el sitio. `test/descubribilidad.test.ts` falla si se publica una
  sección que `llms.txt` no anuncia.
- **JSON-LD** en `lib/schema.ts`. Un `@id` que apunte a un nodo inexistente es
  error de auditoría: un grafo con referencias rotas se descarta entero.
- **Los paneles del menú se ocultan con `display:none`, sin desmontarse**, de
  modo que sus enlaces viajan en el HTML servido y un rastreador que no ejecuta
  JavaScript los ve igual. Por lo mismo, `/productos` sirve un índice completo
  desde el servidor además de la rejilla filtrable, que es de cliente.
- Datos abiertos sin registro: `/productos/catalogo.json`, `/glosario/terminos.json`,
  `/calculadoras/formulas.json`, `/indicadores/datos.json`, feeds RSS y JSON.

---

## 8. Despliegue

Vercel, preset Next.js, sin configuración especial. `main` despliega solo.

Antes de tocar el dominio, leer el aviso de `CANONICAL_ORIGIN` del apartado 3.
Tras un despliegue con rutas nuevas:

```bash
node scripts/submit-indexnow.mjs   # avisa a los buscadores
```

---

## 9. Higiene del repositorio

La raíz es sólo para configuración. La documentación vive en `docs/`.
`test/repositorio-limpio.test.ts` rompe el build si aparece un `.patch`, un
guion de entrega, un documento suelto en la raíz o un archivo vacío — pasó
once veces, porque la subida por la interfaz web de GitHub ignora `.gitignore`
sin avisar y además le quita los guiones al nombre del archivo.
