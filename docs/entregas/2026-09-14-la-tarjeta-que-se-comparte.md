# B4a — el aviso del build tenía nombre, y detrás había treinta tarjetas mal

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0010 aplicados ·
**Archivos tocados:** 13 · **Neto:** +50 de código, +129 de prueba, +138 de nota ·
**Avisos de build:** 1 → 0

## 1. El aviso

Cada build terminaba con esto, y llevaba etapas terminando así:

```
⚠ metadataBase property in metadata export is not set for resolving social
  open graph or twitter images, using "http://localhost:3000".
```

Los tres layouts raíz —`(es)`, `(en)`, `(pt)`— declaran `metadataBase`. Por eso
lo dejé sin tocar en la entrega anterior: no se apaga un aviso que no se
entiende. Ahora se entiende, leído en la fuente de Next 15.5
(`packages/next/src/lib/metadata/resolvers/resolve-opengraph.ts`):

```ts
const shouldWarn =
  !isUsingVercelSystemEnvironmentVariables &&
  !metadataBase &&
  (process.env.NODE_ENV === 'production' || !isStaticMetadataRouteFile)
```

Hace falta una ruta **sin** `metadataBase` que aun así tenga una imagen social
relativa que resolver. En este repositorio hay exactamente una, y no la
escribió nadie: **`/_not-found`**, la que Next genera por su cuenta.

El encadenado, verificado en `next-app-loader`:

1. `app/opengraph-image.tsx` vivía en la **raíz** de `app/`. Por la convención
   de ficheros de Next, un archivo de metadatos en un segmento lo hereda todo
   lo que cuelga de él — y la raíz es todo el sitio, `/_not-found` incluida.
2. Este sitio no tiene `app/layout.tsx`: cada grupo de idioma sirve su propio
   `<html lang>`, que es toda la razón de que los grupos existan. Cuando no hay
   layout raíz, Next **inserta uno por defecto** para `/_not-found`
   (`rootLayout = defaultLayoutPath`), y ese layout no declara `metadataBase`.
3. Imagen relativa + `metadataBase` nulo + build de producción = el aviso. Una
   vez, porque es `warnOnce`.

En Vercel no aparece —`process.env.VERCEL` lo desactiva—, lo que explica que
haya sobrevivido tanto: sólo se ve en el gate.

**El arreglo:** la imagen se muda a `app/(es)/opengraph-image.tsx`. La URL
pública no cambia, porque los grupos de ruta no aparecen en la dirección: se
sigue sirviendo en `/opengraph-image`, que es lo que declara `OG_IMAGEN`. Lo
que cambia es quién la hereda: un layout que sí declara `metadataBase`.

## 2. Lo que apareció al levantar esa piedra

Tirar del hilo de «quién hereda qué imagen» dejó a la vista dos cosas peores
que el aviso. Las tres son el mismo asunto —la tarjeta que ve quien recibe el
enlace— y por eso viajan juntas.

### a) Treinta páginas en español compartían el título de la portada

El layout de `(es)` declaraba `openGraph.title` y `openGraph.description` con
el texto de la portada. En Next, `postProcessMetadata` rellena el título de la
tarjeta con el de la página **sólo si nadie lo ha fijado antes**
(`inheritFromMetadata`). Estaba fijado. Así que toda página en español sin
`openGraph` propio ni en su plantilla ni en su layout salía a compartirse con
el título y la descripción de la portada. Contadas recorriendo la cadena de
cada página: **19 plantillas, unas 30 páginas**.

```
/aplicaciones y sus 8 fichas · /biblioteca y sus 5 · /exportacion
/confianza · /compradores · /compras · /calidad · /distribuidores
/socios · /proyectos · /configurador · y la ruta de reserva
```

(Se quedan fuera `/contacto`, `/productos` y `/cotizacion`: sus layouts ya
declaraban la tarjeta con texto propio. Y `/carrito`, `/checkout`, `/login` y
`/dashboard`, que estaban igual pero no se comparten.)

Pegue `/aplicaciones/toldos-camion` en un grupo de WhatsApp y la tarjeta decía
«Plastilonas Peruanas SAC | Soluciones Textiles Industriales». El comprador no
sabía qué le habían mandado.

Se retiran las dos líneas. Next pasa a rellenar `og:title` y `og:description`
con los **ya resueltos** de cada página — plantilla de título incluida.

### b) `/en` y `/pt` eran las dos únicas páginas sin imagen propia

Los layouts de `(en)` y `(pt)` no declaraban `openGraph`. Vivían de la herencia
del archivo en la raíz — la misma herencia que había que cortar. Ahora declaran
la imagen explícitamente, como `(es)`, y sin título ni descripción, para que
cada página aporte los suyos.

Son las dos puertas de entrada de un comprador extranjero. La primera cosa que
ese comprador hace con un proveedor que le interesa es reenviar el enlace.

### c) `og:locale` decía `en`

Open Graph define `og:locale` como `idioma_TERRITORIO`. Las seis páginas en
inglés declaraban `en` a secas. Quien lo toma al pie de la letra lo descarta;
quien no, cae a su valor por defecto, que da la casualidad de que es `en_US`.
Cuesta un guión bajo y ahora hay una prueba que lo exige.

## 3. Lo que lo mantiene

`test/tarjeta-social.test.ts`, 10 pruebas. No repite lo que ya vigila
`test/regresiones-ui.test.ts` —que ningún `openGraph` declarado se quede sin
`images`—; cubre lo que aquélla no puede ver:

- cada layout raíz declara `metadataBase` y una imagen, y **no** fija título ni
  descripción de tarjeta;
- ningún archivo de metadatos sociales cuelga de la raíz de `app/`, con el
  motivo escrito entero para que la regla no parezca una manía;
- `/opengraph-image` existe como ruta **exactamente una vez** —cero sería un
  404 en las 43 páginas que la piden, dos sería un conflicto de ruta en Next—;
- `og:locale` siempre en formato `idioma_TERRITORIO`.

Verificadas las tres reglas nuevas en sentido contrario: devolviendo el archivo
a la raíz fallan dos; poniendo un `title` en el layout de `(es)` falla la
tercera; escribiendo `locale: 'en'` falla la cuarta.

## 4. Lo que NO entra

- No se toca el contenido de la imagen: el mismo logo, el mismo 1200×630.
- No se tocan `app/icon.png` ni `app/apple-icon.png`, que siguen en la raíz. Los
  iconos se sirven como rutas relativas y no pasan por el resolvedor que emitía
  el aviso; moverlos sería ruido.
- Sigue pendiente el resto de B4: los presupuestos de longitud de `title` y
  `description` en `lib/meta.ts`, que es otro asunto y otro parche.
