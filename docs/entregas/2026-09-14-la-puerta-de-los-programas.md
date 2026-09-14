# P5 — la API está viva, y hasta hoy nadie podía encontrarla

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0017 aplicados ·
**Página nueva:** `/integraciones` · **Nodo nuevo en el grafo:** `WebAPI`

## 1. Lo que acaba de pasar, verificado contra producción

```
✔ Machine 48ed9179b22308 [app] update finished: success
✓ DNS configuration verified — https://plastilonas-api.fly.dev/
```

Medido en vivo, no deducido:

| Llamada | Respuesta |
|---|---|
| `GET /v1/salud` | `{"estado":"vivo","version":"1.0.0","sitio":"…vercel.app"}` |
| `GET /v1/catalogo?q=geomembrana para poza de relaves` | las **4 geomembranas** del catálogo real, 11 familias |
| Primer límite devuelto | «Esta API no publica precios: el precio depende de material, medidas, cantidad, destino e Incoterm» |

La cadena entera funciona: el servicio en São Paulo lee el catálogo del sitio en
Vercel, lo busca ponderando por lo que distingue, y devuelve el resultado con
sus límites.

## 2. El problema que quedaba, y es el caro

**Nada apunta a ella.** Un activo que nadie encuentra vale exactamente lo mismo
que no tenerlo. Un jefe de compras que busca «cargar catálogo de geomembranas
en el ERP», un integrador que busca «API proveedor industrial Perú» y un agente
que rastrea el sitio se encuentran hoy con 354 páginas que hablan de productos y
con cero que digan qué se puede leer y qué se puede ejecutar.

## 3. `/integraciones`

Una página escrita para los dos lectores que decide este mercado: un integrador
que evalúa en dos minutos si esto le sirve, y un agente que necesita saber qué
puede ejecutar y con qué límites.

**Se publica siempre, porque la mitad de lo que describe es cierta siempre.** Las
ocho superficies en JSON —catálogo con 36 fichas, glosario con 43 términos y la
unidad de cada uno, los cinco métodos con su fórmula, identidad, mapa de
consultas, indicadores— llevan etapas publicadas y no dependen de que ningún
servicio esté levantado. El bloque ejecutable aparece sólo cuando la API
responde de verdad.

Y la lista de superficies **no se escribe a mano**: se deriva de
`SUPERFICIES_INDEXABLES`, la misma constante que alimenta el sitemap y
`robots.txt`. Publicar una novena superficie y olvidarse de describirla aquí es
imposible: la prueba lo dice, y además exige que cada una tenga un manejador que
la sirva de verdad.

## 4. El nodo `WebAPI`, que existe en schema.org

`WebAPI` es subtipo de `Service` y está documentado; `documentation`,
`potentialAction` y `EntryPoint` son sus propiedades. No hace falta inventar
nada — que es justo lo que L11 prohíbe: un `@type` que schema.org no define no
refuerza una entidad, la ensucia.

El nodo cuelga del `@id` de la organización que ya existe, declara sus dos
puntos de entrada reales —`GET` al OpenAPI, `POST` al MCP—, dice
`isAccessibleForFree: true` (el dato que decide si un agente se molesta en
intentar la llamada) y enumera las seis herramientas como capacidades.

**Se emite sólo con la API declarada.** Declarar en el grafo de la empresa un
servicio que devuelve un error es la misma mentira que declararlo en `/ai.txt`,
con el agravante de que ésta queda indexada.

## 5. Lo que lo mantiene

`test/integraciones.test.ts`, 12 pruebas:

- la página está enlazada desde el pie, el sitemap, `/llms.txt` y `/ai.txt` —una
  página que sólo vive en el sitemap no la visita nadie y ningún agente la
  encuentra navegando—;
- describe **todas** las superficies indexables, ninguna más y ninguna menos, y
  cada una tiene un manejador que la sirve;
- sin `NEXT_PUBLIC_API_URL` no hay bloque ejecutable ni nodo `WebAPI`;
- el nodo es `WebAPI`, cuelga de la organización, declara dos `EntryPoint` con
  su método HTTP, y **no** inventa `AggregateRating`, `Review` ni `Offer` con
  precio;
- las tres reglas viajan con la página, la primera es que no hay precios, y la
  advertencia de predimensionamiento está publicada.

Verificadas en sentido contrario: añadiendo una novena superficie sin
descripción, quitando el enlace del pie —falla también el auditor de huérfanas—
y metiendo un `Offer` con precio en el nodo, falla exactamente la que
corresponde.

## 6. Lo que falta para que esto cobre

Una variable en Vercel:

```
NEXT_PUBLIC_API_URL=https://plastilonas-api.fly.dev
```

Con ella, y sin tocar una línea más de código, el sitio empieza a publicar solo:
el bloque ejecutable en `/integraciones`, el nodo `WebAPI` en el grafo, el
servidor MCP y las seis herramientas en `/ai.txt` y en `/llms.txt`.

Sin ella, la página sigue siendo cierta: describe los datos abiertos y dice que
el servicio ejecutable todavía no está publicado.

## 7. Lo que NO entra

- Ningún dato nuevo, ninguna afirmación nueva, ningún precio.
- No se toca el servicio: esto es todo del lado del sitio.
- No se inventa una convención de descubrimiento. Se usa lo que existe:
  `WebAPI` de schema.org, `/ai.txt`, `/llms.txt`, el sitemap y un enlace en el
  pie que alcanza a las 354 páginas.
