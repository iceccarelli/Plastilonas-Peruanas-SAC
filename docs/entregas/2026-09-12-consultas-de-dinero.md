# B2 — las 22 consultas que preceden a una orden, con respuesta citable

**Fecha:** 2026-09-12 · **Base:** `main` con 0002 y 0003 aplicados ·
**Mapa:** 76 → 86 clústeres, 805 términos, 316 preguntas · **Pruebas nuevas:** 44

## 1. Qué faltaba

El mapa de consultas decidía qué página contesta cada término del rubro, y eso
basta para un buscador, que enlaza. No basta para un motor de respuestas, que
no enlaza: **extrae**. Cuando no encuentra un párrafo corto que conteste la
pregunta de compra, lo redacta con lo que suele ser cierto en el rubro —un
precio de referencia, un plazo, una ISO que nadie declaró— y lo publica
atribuido a esta empresa. Ahí es donde un proveedor honesto pierde contra uno
que exagera: no por competir mal, sino porque nadie escribió la respuesta.

Y faltaba algo más concreto: el mapa era sólo español. Las cuñas en inglés
(etapas 11–13) y la puerta en portugués existían **sin una sola consulta
declarada que las contestara**, así que para un agente eran páginas huérfanas.

## 2. Qué entra

- **`lib/consultas-dinero.ts`** — 22 consultas de compra, cada una con la página
  canónica que la contesta, un párrafo de 40 a 80 palabras que puede citarse
  entero, **el límite pegado a la respuesta** y el siguiente paso comercial.
  Doce en español, cinco en inglés, cinco en portugués.
- **`data/topic-map.json`** — diez clústeres nuevos: el corredor de exportación,
  la decisión de fabricar o importar, las seis cuñas en inglés y la puerta en
  portugués. Más los términos que faltaban en los clústeres que ya existían:
  ISO 21898 como exigencia del comprador, el Callao, Ecuador, el expediente que
  pide HDPE, la planta de Chorrillos.
- **Intención `corredor`** — el comprador está fuera del Perú y lo que evalúa es
  un embarque, no una compra en plaza. Se separó de `comercial` porque la
  pregunta no es qué producto, sino bajo qué Incoterm sale y qué NO se afirma.
- **Campo `idioma`** en cada clúster. Sin él, un agente lee «truck tarpaulins
  from Peru» como la traducción de «lonas para camión», y no lo es: son dos
  consultas con dos páginas distintas.
- **`/llms.txt`** publica la sección nueva con las 22 respuestas, y
  **`/mapa-consultas.json`** las pega a su clúster con el idioma declarado.

## 3. El límite viaja con la respuesta, y eso es la mitad del trabajo

Un motor que cite la respuesta sin el límite convierte una oferta honesta en
una promesa. Y el límite en una línea aparte es el primer trozo que se cae al
resumir. Por eso van en el mismo bloque, y por eso `test/consultas-dinero.test.ts`
exige que cada límite **niegue algo concreto** en el idioma de la respuesta:
no hay lista de precios, no hay certificación propia, Chile y Ecuador son
corredores de RFQ y no mercados con presencia declarada, el HDPE no se fabrica
aquí.

Las 44 pruebas nuevas además cazan: una consulta cuya respuesta apunte a una
página distinta de la que el mapa decidió, una respuesta fuera del rango de
40–80 palabras, un precio, un plazo en días, una certificación en primera
persona en cualquiera de los tres idiomas, y que cada una de las 22 consultas
del encargo siga resolviendo.

## 4. El presupuesto de `/llms.txt` subió de 90 a 100 KB

Con razón escrita en `test/superficies-maquina.test.ts`: el presupuesto no
existía para que el archivo fuera pequeño, sino para que lo primero que lea un
agente que trunca sea lo que decide una compra. Las respuestas citables son
exactamente ese contenido. A cambio se fija lo que de verdad importaba: el mapa
y las respuestas tienen que caber en los **primeros 40 KB**, antes del catálogo,
y una prueba nueva falla si alguien mete prosa por delante.

## 5. Lo que no entra, a propósito

- Ninguna página nueva. Las 22 consultas las contestan páginas que ya existen.
- Ningún `areaServed` continental, ninguna oficina en destino, ningún precio.
- Ningún hreflang nuevo: las cuñas no son traducciones del catálogo.
- Los artefactos generados `audit/ai-prompts.json` y `audit/current-state.json`
  cambian con el mapa, pero no viajan en este parche para no enterrarlo en 1500
  líneas generadas. Se regeneran con `npm run seo:prompts` y
  `npm run seo:estado`, y se commitean aparte.

## 6. Siguiente

El paso natural es que estas respuestas dejen de ser sólo para máquinas:
`FAQPage` y `Service` en el grafo JSON-LD de las páginas que las contestan (B3),
y el mismo bloque visible para una persona en `/exportacion` y en las cuñas.
