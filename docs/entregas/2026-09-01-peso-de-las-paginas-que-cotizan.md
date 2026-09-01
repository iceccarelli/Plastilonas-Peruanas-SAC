# Etapa 16 — las dos páginas por las que entra el dinero pesaban el doble

**Fecha:** 2026-09-01 · **Pruebas:** 772 (3 nuevas)

## 1. El defecto, con su número

En la salida de `next build`, dos rutas destacaban sobre las otras 352:

```
├ ƒ /cotizacion      199 B    208 kB   ← First Load JS
├ ƒ /en/rfq          198 B    208 kB
├ ○ /big-bags        472 B    114 kB
+ First Load JS shared by all          102 kB
```

**208 kB frente a los 102 kB de base.** Y no eran páginas ricas: son un
formulario. Medido chunk a chunk sobre el paquete compilado, la causa era una
sola:

| chunk | contenido | tamaño |
|---|---|---|
| `1321-…` | `@supabase/supabase-js` | 39.9 kB gz |
| `44530001-…` | `@supabase/supabase-js` | 13.1 kB gz |
| | **total** | **53 kB gz** |

`components/CotizacionForm.tsx` importaba `@/lib/supabase` de forma estática.
Ese cliente se usa **en un solo sitio**: dentro de `subirArchivos()`, después de
`if (archivos.length === 0) return []`. Es decir, sólo hace falta si alguien
adjunta un plano — y la mayoría de los RFQ son medidas, cantidad y ciudad.

Se estaban descargando 53 kB comprimidos, en la ruta crítica, en la página
donde se decide una cotización, sobre una conexión móvil peruana, para una
función que la mayoría no llega a usar.

## 2. El arreglo

Una línea, en el sitio correcto: `await import('@/lib/supabase')` **después** de
la salida temprana. Webpack lo saca a un chunk asíncrono; el navegador lo pide
sólo cuando hay archivos y se pulsa enviar, que es cuando la persona ya decidió
cotizar y una espera de red se justifica.

| | Antes | Después |
|---|---|---|
| `/cotizacion` First Load JS | 208 kB | **147 kB** |
| `/en/rfq` First Load JS | 208 kB | **147 kB** |
| Reducción | | **−61 kB (−29 %)** |

**Verificado en el navegador, no en la teoría:** al abrir `/cotizacion` se
descargan 26 chunks y **ninguno contiene Supabase**; los dos chunks que sí lo
contienen quedan como asíncronos (`7817.…js`, `44530001.…js`) y la lógica de
subida sigue en el paquete de la página. La capacidad de adjuntar planos está
intacta.

## 3. Lo que se midió y se decidió NO tocar

Antes de seguir optimizando conviene saber dónde está el resto del peso. Se
midió chunk a chunk:

- El suelo de 102 kB es **React más el enrutador de Next**. Se comprobó
  buscando marcas dentro de los dos chunks compartidos: no hay ninguna
  biblioteca nuestra ahí. Es irreducible sin cambiar de framework.
- `framer-motion` (36.7 kB gz), `cmdk` (18.5 kB) y el SDK del asistente
  (13.5 kB) **ya están divididos**: aparecen en el grafo del layout pero no en
  el First Load de las páginas de contenido, que se quedan en 111–114 kB.
- Las páginas más pesadas que quedan —portada 180 kB, catálogo 174 kB— lo son
  por carruseles, filtros y tarjetas que sí se ven en pantalla.

Sacar `framer-motion` de la cabecera habría costado rehacer el mega-menú y
arriesgar la interfaz que la etapa 14 acaba de certificar, para mover bytes que
ya no bloquean. Se para aquí, y se deja escrito por qué.

## 4. Para que no vuelva a pasar

Un paquete inicial crece un import a la vez, cada uno razonable por separado.
Dos guardas nuevas:

- **`npm run diagnostico:peso`** — lee el manifiesto real de `next build` y
  falla si alguna ruta excede su presupuesto declarado (contenido 135 kB,
  formularios 165 kB, portada y catálogo 195 kB). Los presupuestos llevan su
  motivo escrito al lado, no son cifras redondas.
- **Una prueba de vitest** que prohíbe que cualquier componente de cliente
  importe el cliente de Supabase de forma estática, y que comprueba que el
  `await import()` va después de la salida temprana.

*(La primera ejecución del propio script encontró un error mío: las reglas de
presupuesto se evaluaban de la más general a la más específica y `/en/rfq`
caía en la categoría equivocada. Ahora van de específica a general, con el
motivo escrito.)*

## 5. Verificación

`tsc --noEmit` limpio · **772/772 pruebas** · `next lint` sin avisos · build 354
páginas · axe-core **0 violaciones** (16 rutas × 4 modos) · **0** enlaces rotos ·
**0** desbordes en 234 mediciones · **0** solapamientos en 13 rutas · el RFQ
sigue declarando sus 6 campos obligatorios y reteniendo el envío vacío.
