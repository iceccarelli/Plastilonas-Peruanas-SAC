# Etapa 13 — «¿Fabricar en Lima o importar?»

**Fecha:** 2026-08-31 · **Páginas construidas:** 354 (antes 352) · **URLs en sitemap:** 230 (antes 228)

## 1. El hueco que llena

El sitio tenía 36 fichas, cinco guías, tres cuñas en dos idiomas y un centro de
confianza — todo para el **después** de elegir proveedor. Y nada para el momento
en que la compra se decide de verdad, que es antes: *¿mando fabricar acá o
importo un contenedor?* Entrábamos a la conversación tarde.

Se publican dos páginas, gemelas por hreflang:

| Ruta | |
|---|---|
| `/fabricar-o-importar` | ES |
| `/en/manufacture-in-peru-or-import` | EN |

## 2. La decisión incómoda, que es la que hace que funcione

La tabla tiene **13 criterios y la importación gana 4**: precio unitario a
volumen, disponibilidad inmediata de un formato estándar, variedad de
configuraciones ya desarrolladas y **certificación de producto emitida por el
fabricante** — que es exactamente lo que `/confianza` declara que esta empresa
no emite. Hay además un bloque titulado **«Cuándo NO nos compre»**.

Por qué se publica lo que nos perjudica: el comprador ya lo sabe. El proveedor
que se lo oculta no gana ese lote — pierde la credibilidad de todo lo demás que
afirma, incluida la parte donde tiene razón. Lo que gana esta página no es la
venta del contenedor estándar: es la de los otros casos (medida fuera de
estándar, lote corto, reposición en días, iteración de la especificación) donde
el mismo comprador vuelve.

**La primera versión de esta página concedía una sola fila y afirmaba en el
texto que concedía tres.** No lo detectó una lectura: lo detectó la prueba de
criterio de salida, que exige un mínimo de derrotas y que al menos una no sea la
del precio. Se rebalanceó la matriz y el recuento pasó a derivarse del dato.

## 3. Lo que NO publica

**Ninguna tasa atribuida a una subpartida concreta.** Los componentes del costo
de importar se nombran con sus rangos oficiales y su fuente — ad valorem sobre
CIF (0 %, 6 %, 11 % según subpartida), IGV 16 %, IPM 2 %, percepción del IGV
3,5/5/10 %, antidumping, despacho, almacenaje y días de financiamiento — y la
página dice quién tiene la última palabra: SUNAT o su agente de aduana, no
nosotros. Un «los big bags pagan 6 %» sería justo el dato que este repositorio
se niega a inventar, y encima caducaría sin que nadie se entere. Una prueba
prohíbe esa forma de frase.

Fuentes verificadas el 2026-08-31: SUNAT («Estructura del Arancel de Aduanas»,
«Pagos a realizar») y ADEX («Principales tributos aduaneros en el Perú»).

## 4. Decisiones de ingeniería

- **Una sola plantilla para los dos idiomas.** Dos plantillas serían dos
  verdades, y esta página afirma cosas que nos perjudican: el día que una de las
  dos las suavizara, el argumento entero se cae. El texto vive en
  `lib/fabricar-o-importar.ts`; el componente sólo elige idioma.
- **hreflang recíproco.** Cuarto clúster declarado del sitio, junto al trío de
  portadas y los tres pares de cuña. La prueba comprueba los dos sentidos.
- **La franja del BCRP tiene sentido aquí**: la exposición cambiaria es una de
  las filas de la matriz, y el lector la ve con su fecha — en español imprime
  `3,372` y en inglés `3.372`, cada uno en su separador.
- Enlazada desde las dos plantillas de cuña y desde el hub de compra inglés, no
  sólo desde el sitemap.

## 5. Verificación

`tsc --noEmit` limpio · **747/747 pruebas** (8 nuevas) · `next lint` sin avisos ·
build 354 páginas · humo en servidor real: hreflang recíproco en ambos sentidos,
`FAQPage` con 5 preguntas por idioma, 13 filas en la tabla y los chips 4 / 8 / 1.

## 6. Casillas del propietario (sin cambios)

- [ ] **DNS de `www.plastilonas.com` → Vercel.**
- [ ] `NEXT_PUBLIC_GA4_ID` en Vercel.
- [ ] `CRM_WEBHOOK_URL`.
- [ ] Tras desplegar: `node scripts/submit-indexnow.mjs`.
