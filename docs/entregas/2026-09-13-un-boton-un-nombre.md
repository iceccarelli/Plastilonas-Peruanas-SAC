# F3b — un botón, un nombre, un grupo

**Fecha:** 2026-09-13 · **Base:** `main` con 0002 a 0006 aplicados ·
**Archivos tocados:** 32 · **Neto:** −162 líneas · **Pruebas nuevas:** 16

## 1. Lo que había

El botón que abre el RFQ —el único botón que este sitio necesita que se
pulse— estaba escrito de ocho maneras:

```
Solicitar cotización · Solicitar Cotización · Cotizar ahora
Solicitar Cotización Personalizada · Solicitar Cotización para este producto
```

Y la tarjeta azul que cierra las páginas estaba **copiada y pegada en quince
archivos**, con sus clases repetidas a mano en cada uno. De esa copia salieron
tres consecuencias medibles:

1. **Ninguna de las quince en español ofrecía WhatsApp**, que es el canal por
   el que entra la mayoría de las consultas comerciales en el Perú. El único
   bloque que sí lo ofrecía era el inglés.
2. **Ninguna declaraba contexto de atribución**: los clics no se podían sumar
   ni atribuir a la página que los produjo.
3. El objetivo táctil de 44 px (WCAG 2.5.8) no estaba declarado en ninguna:
   dependía del `padding`, es decir, de que nadie lo tocara.

Para un comprador industrial que recorre cinco páginas antes de escribir, eso
no es variedad: es una puerta distinta en cada habitación.

## 2. Lo que entra

- **`lib/acciones.ts`** — el vocabulario. Un texto por acción: cotizar,
  cotizar este producto, cotizar esta configuración, escribirnos, evaluar, ver
  catálogo, RFQ en inglés, y las dos etiquetas de WhatsApp. Más el mensaje con
  el que se abre WhatsApp, que llega con los cuatro huecos puestos —producto,
  medidas, cantidad, ciudad— porque un «Hola» se responde con otra pregunta.
- **`components/CierreComercial.tsx`** — la agrupación. Mismo bloque, mismo
  aspecto, ahora en un solo archivo: título, párrafo y un `role="group"` con
  la acción principal, la secundaria y WhatsApp. `contexto` es obligatorio.
- **Quince páginas migradas**, en español y en inglés. La página sigue
  decidiendo qué dice y a dónde lleva; deja de decidir cómo se llama el botón,
  cómo se agrupa y cuánto mide.
- **El vocabulario, aplicado también donde no hay tarjeta**: cabecera, pie,
  cuñas comerciales, ficha de producto, glosario, servicios, `/ai.txt` y
  `/llms.txt`. Las superficies para máquinas nombran el botón igual que la
  interfaz.
- **Un duplicado retirado del pie**: «Solicitar Cotización» aparecía dos veces,
  en dos bloques distintos. Dos veces el mismo botón no ofrece dos caminos:
  reparte la atención del mismo.

## 3. Lo que esto cambia para el negocio

Catorce páginas en español que antes terminaban en un enlace ahora terminan en
un grupo con **WhatsApp**, con el mensaje ya redactado y con atribución por
página. Ése es el canal que cierra en este rubro, y hasta hoy sólo estaba en la
cabecera, en el pie y en la barra móvil.

## 4. Lo que lo mantiene

`test/acciones.test.ts`, 16 pruebas:

- ninguna etiqueta canónica se escribe a mano fuera de `lib/acciones.ts`
  —comprobado contra la etiqueta completa, no contra la subcadena, para que
  «Ver catálogo completo →» siga siendo otra cosa—;
- la tarjeta de cierre no se vuelve a maquetar en ningún archivo, salvo tres
  componentes de cliente declarados con su motivo;
- cada uso declara `contexto`;
- cada destino literal existe, contando plantillas dinámicas;
- los dos botones del grupo declaran `min-h-[44px]`, y el grupo se anuncia como
  grupo.

## 5. Lo que NO entra, a propósito

- `app/(es)/marco/evaluacion/page.tsx`, `components/CunaHubEn.tsx` y
  `components/FabricarOImportar.tsx` conservan su tarjeta: son componentes de
  **cliente** y no pueden renderizar uno de servidor. Convertir
  `CierreComercial` en cliente enviaría JavaScript a quince páginas estáticas
  que hoy no lo necesitan. Sí usan ya el vocabulario común.
- No se toca el menú de la cabecera más allá de la etiqueta del botón: cualquier
  cambio de estructura ahí exige `npm run auditar:navegacion` y
  `npm run auditar:viewport`, que necesitan navegador.
- No se cambia ningún texto de contenido, ningún destino y ninguna afirmación.
