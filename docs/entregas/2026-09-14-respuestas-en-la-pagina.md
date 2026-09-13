# B3 — las 22 respuestas dejan de ser sólo para máquinas

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0007 aplicados ·
**Rutas que ahora publican su respuesta:** 17 · **Pruebas nuevas:** 5

## 1. El hueco que dejó B2

La etapa B2 escribió las 22 respuestas que preceden a una orden de compra, con
su límite pegado, y las publicó en `/llms.txt` y en `/mapa-consultas.json`. Un
agente las leía. **Una persona no.**

Y eso bloqueaba justo lo que venía después. Marcar un `FAQPage` con preguntas
que la página no muestra es lo que un buscador descarta —con razón: sería
decirle al rastreador algo que su lector no puede comprobar—. Sin el bloque
visible, no había forma honesta de emitir el dato estructurado.

## 2. Qué entra

- **`pregunta`** en cada una de las 22 entradas: la misma consulta escrita como
  la haría una persona en voz alta. Una cadena de búsqueda —«big bags FIBC a
  medida Perú»— no es una pregunta, y marcarla como si lo fuera es basura en el
  grafo.
- **`faqsDeRuta(ruta)`**: devuelve las preguntas de una ruta en el formato que
  ya usan los bloques de preguntas frecuentes y `faqSchema`, con **el límite
  dentro de la respuesta**. Un motor que cite el fragmento se lleva la
  condición con él; en una línea aparte sería lo primero que se cae al resumir.
- **Las páginas que ya tenían preguntas frecuentes las mezclan**: las tres
  cuñas en español, las tres en inglés, `/exportacion`, `/fabricar-o-importar`
  y su gemela inglesa, las fichas de producto, las familias y las guías de
  recursos. Una sola lista visible, un solo `FAQPage`.
- **`components/PreguntasDeCompra.tsx`** para las que no lo tenían:
  `/nosotros`, `/biblioteca/[slug]`, `/en/rfq` y la puerta en portugués. Si la
  ruta no tiene respuestas escritas, no pinta nada y no emite nada — un
  `FAQPage` vacío es ruido.
- **`/pt` entra al grafo**: hasta hoy no emitía JSON-LD. Ahora declara
  `WebPage`, `BreadcrumbList` y su `FAQPage` con las cinco respuestas en
  portugués.

## 3. El idioma del marcado dejó de mentir

`webPageSchema` y `faqSchema` fijaban `inLanguage: es-PE` para todo el sitio.
Las seis páginas en inglés y la portuguesa declaraban por tanto ser españolas
en su propio dato estructurado, mientras su `<html lang>` decía otra cosa. Los
dos generadores aceptan ahora el idioma de la página; las cuñas inglesas,
`/en/rfq`, `/en/sourcing-from-peru` y `/pt` declaran el suyo.

## 4. Lo que lo mantiene

Cinco pruebas nuevas en `test/consultas-dinero.test.ts`:

- cada pregunta está escrita como pregunta y no repite la cadena de búsqueda;
- la respuesta publicada contiene la respuesta **y** el límite;
- **cada una de las 17 rutas con respuestas tiene un archivo que las publica**,
  con una tabla explícita de qué archivo cubre qué ruta: si mañana una consulta
  nueva apunta a una página que nadie publica, la prueba lo dice con nombre;
- las páginas en inglés y en portugués declaran su idioma en el marcado;
- ninguna pregunta se duplica dentro de la misma página.

## 5. Lo que NO entra

- Ninguna afirmación nueva: el texto es exactamente el de B2, que ya pasó las
  pruebas de precio, plazo y certificación en tres idiomas.
- Ningún `Review`, ningún `AggregateRating`, ningún `areaServed` continental.
  El grafo sigue con un solo `Organization`, un solo `LocalBusiness` y un solo
  `WebSite`, referenciados por `@id`.
- Ningún `FAQPage` nuevo en páginas que ya tenían uno: se mezclan las preguntas
  en el existente en vez de emitir dos, que es lo que confunde al rastreador.
