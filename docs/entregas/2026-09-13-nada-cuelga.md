# F3 — el auditor de enlaces decía 43 huérfanas y ninguna lo era

**Fecha:** 2026-09-13 · **Base:** `main` con 0002 a 0005 aplicados ·
**Huérfanas reales:** 43 → 2, ambas declaradas · **Prueba nueva:** 1

## 1. El informe que nadie podía usar

`npm run seo:estado` venía listando 43 páginas «huérfanas»: `/productos`,
`/contacto`, `/cotizacion`, `/exportacion`, las tres cuñas comerciales, los
cinco hubs sectoriales. Todas están enlazadas desde el menú o el pie en cada
una de las ~280 páginas del sitio. Un informe con 43 falsos positivos no es un
informe: es una lista que se deja de mirar, y debajo de ella se esconde la
huérfana de verdad.

Eran tres defectos del propio auditor, ninguno del sitio:

1. **La barra de más.** `rutaDe()` quitaba el grupo de ruta —`app/(es)/…`— y
   dejaba la barra que lo precedía. Cada página agrupada quedaba como
   `//productos`, que no coincide con `/productos`, que es a donde apuntan los
   enlaces. Con eso, las 43.
2. **El comodín se lo comía todo.** `plantillaDe()` recorría las plantillas en
   orden y `app/(es)/[...resto]` —la ruta de reserva— casa con cualquier ruta
   de un segmento. Los enlaces del menú se contaban como entrantes de
   `/[...resto]` y sus destinos reales se quedaban a cero.
3. **Los enlaces derivados eran invisibles.** Media navegación no se escribe
   como `href="/algo"`: el pie enlaza las cuñas con `ENLACES_CUNAS`, la
   cabecera inglesa con `ENLACES_CUNAS_EN`, el menú expande `INDUSTRIAS` y la
   comparación de abastecimiento se enlaza con `RUTA_ES` / `RUTA_EN`. El regex
   sólo veía literales.

Arreglados los tres: 43 → 3.

## 2. La huérfana que sí lo era

`/fabricar-o-importar` colgaba **sólo** de las tres cuñas comerciales, a través
de un componente. Quien entraba por el catálogo, por un hub sectorial o por una
ficha de producto no la encontraba nunca — y es la página donde un comprador
decide si fabrica en Lima o importa un contenedor, que es la decisión anterior
a cualquier cotización. Ahora está en el pie, en el bloque de industria e
internacional, junto a `/exportacion`.

Quedan dos, declaradas con su motivo en `HUERFANAS_PERMITIDAS`: el retorno de
la pasarela de pago —se llega pagando, no navegando— y el acceso de clientes,
que además está prohibido en `robots.txt`.

## 3. Y ahora rompe el build

El auditor sabía responder esto desde hace etapas, pero vivía sólo en
`npm run seo:consistency`, que el gate de entregas —`scripts/aplicar-entrega.sh`:
typecheck, test, lint, build— **no corre**. Una entrega podía dejar huérfana una
página comercial y pasar el gate entero.

- `--check` ahora falla, con nombre y apellido, ante cualquier huérfana no
  declarada.
- `test/huerfanas.test.ts` ejecuta esa comprobación dentro de `npm test`, que
  sí corre siempre. Verificado en los dos sentidos: quitando del pie el enlace
  a `/exportacion`, la prueba falla nombrando `/exportacion`.
- `--no-escribir` permite correrlo desde la prueba sin ensuciar el árbol:
  `audit/current-state.json` está versionado y no debe reescribirse en cada
  `npm test`.

## 4. Lo que este parche NO hace

- No toca el menú. Añadir entradas a la cabecera exige `npm run auditar:navegacion`
  y `npm run auditar:viewport`, que necesitan navegador; el pie ya alcanza a
  todas las páginas y es donde vive el bloque comercial.
- No publica contenido nuevo ni afirmaciones nuevas: un enlace y tres defectos
  de medición.
- No toca `audit/current-state.json` ni `audit/ai-prompts.json`: son artefactos
  generados y se regeneran con `npm run seo:estado` y `npm run seo:prompts`.
