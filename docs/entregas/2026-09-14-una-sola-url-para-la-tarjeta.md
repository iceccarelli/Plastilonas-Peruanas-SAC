# B4b — la entrega 0011 dejó siete páginas con la tarjeta rota, y lo dijo su propio build

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0011 aplicados ·
**Archivos tocados:** 8 · **Páginas con `og:image` roto:** 7 → 0

## 1. Lo que rompí

La entrega 0011 apagó el aviso de `metadataBase` mudando
`app/opengraph-image.tsx` de la raíz de `app/` al grupo `(es)`. El aviso
desapareció —el diagnóstico era correcto— pero el build siguiente mostró esto:

```
├ ○ /opengraph-image-35z9gd      ← antes:  ○ /opengraph-image
```

La causa, en la fuente de Next 15.5 (`lib/metadata/get-metadata-route.ts`):

```ts
const segments = parentPathname.split('/')
if (segments.some((seg) => isGroupSegment(seg) || isParallelRouteSegment(seg))) {
  suffix = djb2Hash(parentPathname).toString(36).slice(0, 6)   // '35z9gd'
}
```

**La URL de un archivo de metadatos no la decide este repositorio.** En la raíz
se llama `/opengraph-image`; bajo un grupo de ruta, Next le cuelga un hash. Y
`lib/meta.ts` apuntaba a la URL con un literal.

### Medido sobre el sitio desplegado, no deducido

| Página | `og:image` servido | |
|---|---|---|
| `/aplicaciones/toldos-camion` | `/opengraph-image-35z9gd?ddd8a8d3` | 200 |
| `/productos/big-bags-…` | su propia foto de producto | 200 |
| `/en/fibc-big-bags-peru` | `/opengraph-image` | **404** |
| `/pt` | `/opengraph-image` | **404** |

`https://…/opengraph-image` devuelve hoy **404**, comprobado directamente.

Rotas: las **seis páginas en inglés y `/pt`** — las siete que existen para el
comprador extranjero, las que 0011 acababa de arreglar. Las páginas en español
se salvaron por accidente, y ese accidente es el segundo hallazgo.

## 2. El accidente que enseña dónde estaba el error de diseño

`/aplicaciones/toldos-camion` no sirve `/opengraph-image`: sirve la ruta con
hash. Es decir, **el archivo de convención de `(es)` pisa el `images: OG_IMAGEN`
del layout de su propio grupo**. En español, `OG_IMAGEN` llevaba etapas siendo
decorativo: lo que salía al HTML era la URL generada por Next.

De ahí que el sitio tuviera dos URLs para la misma imagen —una en español, otra
declarada en `lib/meta.ts`— y que sólo se notara cuando una de las dos se cayó.

## 3. Lo que entra

La imagen deja de ser un archivo de convención de Next y pasa a ser un
**manejador de ruta**: `app/og.png/route.tsx`, servido en `/og.png`. Mismo
patrón que `/ai.txt`, `/entidad.json` y `/version.json`, que ya viven así en
este repositorio.

Un manejador de ruta no participa de las dos cosas que rompieron:

- **no se hereda por el árbol**, así que la `/_not-found` que Next genera sola
  —la que corre sin `metadataBase`— no la ve, y el aviso del build no vuelve;
- **su URL es literalmente su carpeta**, así que `OG_IMAGEN` puede apuntarla con
  un literal sin que Next se la cambie por debajo.

Resultado: **una sola URL para la tarjeta, en los tres idiomas**, la misma que
declara `lib/meta.ts` y la misma que emite el JSON-LD de `StructuredData`.

`next.config.ts` redirige `/opengraph-image` → `/og.png` con un 301 permanente:
WhatsApp, LinkedIn y Slack guardan la imagen por URL, y los enlaces compartidos
antes de hoy no tienen por qué perder su tarjeta.

## 4. Lo que lo mantiene

La regla que escribí en 0011 —«ningún archivo social en la raíz de `app/`»— era
la equivocada: prohibía una ubicación cuando el problema era la convención
entera. Se reemplaza, en `test/tarjeta-social.test.ts`:

- ningún `opengraph-image.*` ni `twitter-image.*` en **ninguna parte** de `app/`;
- la URL que declara `OG_IMAGEN` **existe** como manejador de ruta —esto es lo
  que habría atrapado 0011 antes de salir—;
- el 301 del nombre viejo sigue declarado;
- la tarjeta se prerenderiza (`force-static`) y no se calcula en cada visita de
  rastreador.

Las cuatro, verificadas en sentido contrario: creando un `opengraph-image.tsx`,
apuntando `OG_IMAGEN` a una carpeta inexistente, quitando el redirect y
quitando `force-static`, falla exactamente la que corresponde.

## 5. Lo que esto me deja dicho

0011 pasó el gate entero —typecheck, 844 pruebas, lint, build— y aun así salió
rota. El gate no comprueba que las URLs que el HTML emite existan. Las pruebas
nuevas cierran este caso concreto; la comprobación general —recorrer el sitio
construido y pedir cada `og:image`, cada `canonical` y cada enlace— no existe
todavía y es lo que debería existir. Va anotado para su propio parche.
