# P30 — El sector como puerta de entrada

Qué se añadió, qué se descartó a propósito y por qué.

## 1. `/industria` — el eje que faltaba

El sitio tenía cuatro ejes de navegación indexables:

| Eje | Pregunta que responde |
|---|---|
| `/productos/familia/*` | ¿qué línea me sirve? (por material) |
| `/soluciones/*` | ¿cómo se arma el conjunto? (por obra) |
| `/marco` | ¿qué tengo que definir? (por criterio) |
| `/local/*` | ¿llegan a mi ciudad? (por geografía) |

Faltaba el eje por el que empieza una compra industrial: **el sector del
comprador**. Nadie en una minera busca «geosintéticos»; busca resolver una poza.

El dato ya existía. Cada producto de `lib/products.ts` lleva
`sector: ['Minería', 'Construcción']` desde el principio, y las arquitecturas de
referencia también. Esa clasificación se usaba para filtrar en cliente y **no
tenía una sola URL propia**: el sitio sabía qué le vende a minería y no lo decía
en ninguna página indexable.

Cinco hubs, elegidos por volumen real de catálogo:

| Ruta | Etiquetas que absorbe | Productos derivados |
|---|---|---|
| `/industria/mineria` | Minería | 18 |
| `/industria/agroexportacion` | Agricultura | 19 |
| `/industria/transporte-logistica` | Transporte, Logística | 9 |
| `/industria/construccion` | Construcción, Infraestructura | 24 |
| `/industria/saneamiento-y-agua` | Saneamiento | 7 |

**No hay hub «Industrial»**, que es la etiqueta con más productos (19). Nadie
teclea «industrial» como intención de compra: sería relleno con aspecto de
estrategia.

### Regla de no deriva

Los productos de cada hub **no se escriben a mano**: se derivan de las etiquetas
que ya lleva el catálogo. Una lista de slugs copiada quedaría desfasada el día
que alguien añada un producto, y nadie se enteraría. Lo único escrito a mano es
lo que ningún dato puede dar —el problema de compra, el criterio, la logística—
y los `ancla`, que son orden de presentación y **están verificados por prueba**:
`test/industrias.test.ts` falla si un ancla no existe o no lleva la etiqueta de
su sector.

La lista larga no se clona: enlaza a `/productos?sector=…`, que ya funcionaba.

## 2. La señal de fabricante, con vocabulario que existe

`schema.org` **no define un tipo `Manufacturer`**. Los subtipos de `Organization`
son `Airline`, `Corporation`, `LocalBusiness`, `NGO` y una veintena más;
«Manufacturer» no está entre ellos. Existe `manufacturer`, pero como **propiedad
de `Product`** apuntando a una `Organization` — que es exactamente como
`ProductStructuredData.tsx` ya lo emitía.

Declarar `"@type": ["Organization", "Manufacturer"]` no refuerza la señal:
mete un tipo inexistente en el nodo raíz de la empresa. Lo mismo
`additionalType: "https://schema.org/Manufacturer"`, que es una URI muerta.

Lo que sí está tipado en `Organization` y sí se lee:

- `taxID` — el RUC, además del `identifier`/`PropertyValue` que nombra el esquema peruano
- `isicV4: "2220"` — CIIU Rev.4, fabricación de productos de plástico
- `naics: "326199"` — equivalente norteamericano

Y `manufacturer` se añadió a `productSchema()` de `lib/schema.ts`, que era el
único emisor de producto que aún no lo declaraba.

`test/industrias.test.ts` falla si alguien reintroduce el tipo inventado.

## 3. RUC validado de verdad

Un campo con `/^[0-9]{11}$/` acepta `12345678901`, `00000000000` y el teléfono
del que rellena por salir del paso. No cualifica nada; el comercial descubre el
error cuando ya emitió la cotización.

`lib/ruc.ts` comprueba el **dígito verificador del módulo 11**: factores
`5 4 3 2 7 6 5 4 3 2` sobre los diez primeros dígitos, y prefijo en
`10 / 15 / 17 / 20`. La prueba que da autoridad al algoritmo es que valida el RUC
de la propia empresa (`20523135385`), fijado en `test/ruc.test.ts`.

Alcance honesto: verifica que el número esté **bien formado**, no que exista en
el padrón de SUNAT ni que esté activo y habido. Eso es una consulta de servidor.

El error es específico —«El RUC tiene 11 dígitos; ingresó 8», «El dígito
verificador no corresponde»— porque un «RUC inválido» genérico hace que el
comprador reescriba el mismo número tres veces.

## 4. El trinquete de títulos

P29 llevó de 100 a 0 los títulos que Google recorta. Nada impedía deshacerlo:
`titulo-largo` era un **aviso** entre cincuenta y nadie mira un renglón ámbar.

Ahora es **error** y rompe la integración continua. De cero solo se sale hacia
arriba. Corregirlo no es truncar: es pasar el título por `tituloAjustado` de
`lib/meta.ts`, que suelta el complemento cuando no cabe entero.

Y una prueba adicional exige que el complemento **sobreviva**: un título que se
queda en «Transporte y logística» cabe perfectamente y desperdicia veintinueve
caracteres de espacio de clic. Por eso los sectores tienen `tituloBase` — el
nombre completo gana el encabezado, la versión corta gana el resultado de
búsqueda.

## Lo que se descartó a propósito

- **Meta `keywords` con la matriz de palabras clave.** Google las ignora desde
  2009. Meter «RUC 20523135385» ahí es ruido, no señal.
- **Subir `priority` en el sitemap a 0.9.** Google confirmó que ignora ese campo.
  Reordenar el XML es decorarlo.
- **Un segundo campo «volumen del proyecto».** «Cantidad aproximada» ya lo
  capturaba; dos campos casi iguales bajan la tasa de completado y parten el
  mismo dato en dos. Se le cambió el nombre y el ejemplo, y ya.
- **Reemplazar `SITE.description` por una descripción con palabras clave.** Esa
  cadena alimenta el JSON-LD, los Open Graph y los PDF: cambiarla por un anuncio
  de 137 caracteres degrada la descripción de la empresa en todos ellos y
  dispara descripciones duplicadas en el auditor.
- **`areaServed` con siete ciudades en `Organization`.** Redundante: el país ya
  las contiene y `/local/*` ya emite `Service` con `areaServed` por ciudad, que
  es la señal granular correcta.
