# P7 — lo que se toca con el pulgar

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0019 aplicados ·
**Tablas que movían la página:** 3 → 0 · **Filas de botones sin agrupar:** 6 → 0 ·
**Nombres distintos del botón de cotizar:** 9 → 8

## 1. Primero, lo que NO pude hacer

Me comprometí a medir con navegador. **No pude, y lo digo antes de fingirlo:**
el proxy de este entorno rechaza la salida de Chromium (`ERR_TUNNEL_CONNECTION_FAILED`)
y bloquea el registro de npm, así que ni mido el sitio en vivo ni lo compilo
aquí. El arné de Playwright existe y funciona —`npm run diagnostico`—, pero
necesita el sitio levantado y eso sólo pasa en su entorno.

Lo que sí es medible desde el código es determinista, y es lo que sigue. **No
sustituye a medir en el navegador: impide que lo medido vuelva.**

## 2. Lo que la medición del código encontró

Cuatro defectos reales. El resto del sitio salió limpio —los `w-[380px]` y
`grid-cols-3` que aparecen en una búsqueda ingenua ya estaban acotados con
`max-w-[calc(100vw-3rem)]` o con `hidden md:block`—, y decirlo también es parte
del informe: no voy a inventar trabajo donde etapas anteriores ya lo hicieron.

### a) El botón que más importa del sitio medía 26 px

`components/CatalogoFiltrado.tsx`, **las 36 fichas del catálogo**, que es la
superficie comercial con más tráfico:

```jsx
<div className="flex gap-3">
  <Link …>Ver detalles →</Link>
  <Link … className="text-sm … px-5 py-1.5 rounded-full text-xs">Cotizar este producto</Link>
</div>
```

Tres defectos en dos líneas:

1. **`py-1.5` con `text-xs` da unos 26 px de alto.** WCAG 2.5.8 pide 24×24 como
   mínimo absoluto y el objetivo real es 44. Es el botón por el que entra el
   dinero, repetido 36 veces.
2. **La fila no envuelve.** En 360 px las dos acciones se aprietan o se salen.
3. **«Cotizar este producto» es el NOVENO nombre** escrito a mano para el mismo
   botón. `lib/acciones.ts` ya lo nombra: `ACCIONES.cotizarProducto`. La entrega
   0007 unificó ocho variantes y ésta se escapó porque el texto era distinto, no
   igual — la prueba de entonces sólo perseguía las etiquetas canónicas escritas
   a mano, no una etiqueta nueva.

Ahora es un `role="group"` con su `aria-label`, los dos con `min-h-[44px]`, la
fila envuelve, y el rótulo sale de `lib/acciones.ts`.

### b) Tres tablas movían la página entera de lado

- `/exportacion` — la tabla de mercados, tres columnas de texto, en una página
  comercial.
- `BarChart` y `LineChart` — las tablas de datos que acompañan a cada gráfico
  para lector de pantalla e impresión.

Sin contenedor con scroll propio, lo que se desplaza no es la tabla: es la
**página**. Quien no sabe que puede deslizar cree que le falta contenido, y
quien lo sabe pierde el sitio donde estaba leyendo.

### c) El submenú del menú móvil medía 30 px

`components/Navbar.tsx`: `px-3 py-1.5` en los enlaces hijos del menú que se usa
**con el pulgar**. El `padding` además depende de que nadie lo toque; `min-h`
lo declara y sobrevive a un rediseño.

### d) Seis filas de botones sin agrupar

Portada, `/compras`, `/checkout/exito`, `/glosario/{término}`, `/socios` y
`/en`. Dos o tres botones juntos que un lector de pantalla leía como enlaces
sueltos en vez de como una decisión con opciones. Ahora cada una es un
`role="group"` con su `aria-label`.

## 3. La regla mira el aspecto, no la etiqueta

La tentación era agrupar «toda fila con dos enlaces». Sería mentirle al lector
de pantalla: los dos avisos legales del pie y los tres enlaces «→» del final de
`/metodo` son **listas de enlaces**, no decisiones. Lo que es una decisión con
opciones es una fila de **botones**: con fondo o borde, con padding horizontal y
con esquinas redondeadas. Ésos se agrupan; los otros, no.

Al pie sí le entró `flex-wrap`: los dos rótulos legales suman más de 300 px y
en 360 px empujaban la fila fuera del ancho.

## 4. Lo que lo mantiene

`test/movil.test.ts`, 5 pruebas:

- cada `<table>` vive dentro de un contenedor con scroll propio;
- ningún enlace ni botón con `py-1.5` o menos se queda sin declarar su altura;
- el botón de cotizar del catálogo declara `min-h-[44px]` **y** enlaza la acción
  canónica;
- toda fila con dos o más **botones** se anuncia como grupo y envuelve;
- la ficha no reescribe el nombre del botón de cotizar.

Verificadas las cuatro en sentido contrario: quitando el envoltorio de la tabla
de `/exportacion`, devolviendo el `py-1.5` al botón del catálogo, quitando el
`role="group"` de `/socios` y devolviendo «Cotizar este producto», falla
exactamente la que corresponde.

## 5. Lo que queda, y necesita su entorno

Un comando suyo, con el sitio compilado, y el siguiente parche sale de datos
reales en vez de análisis estático:

```bash
npm run build && npx next start -p 4000 &
npm run diagnostico
```

Mide desborde horizontal real, objetivos táctiles calculados sobre el elemento
renderizado, contraste, errores de consola y enlaces rotos, en seis viewports
desde 360 px. La salida va a `.diagnostico/`. Mándemela.

## 6. Lo que NO entra

- Ningún cambio de contenido, de dato ni de destino: sólo altura, agrupación y
  desbordamiento.
- No se toca el vocabulario comercial salvo para dejar de reescribirlo.
- Queda anotado y sin tocar: `/compras` llama «Registrar RFQ» y `/socios` «RFQ
  de partner» al mismo botón. Son rótulos de contexto, no copias de una etiqueta
  canónica, y decidir si se unifican es una decisión de copia — no de maqueta.
