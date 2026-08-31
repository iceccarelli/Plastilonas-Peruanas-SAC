# Auditoría de navegador y corrección — 2026-08-31

**Alcance:** clon limpio de `main` (`d364f7b`), compilado y servido, medido con
Chromium real sobre **6 viewports × 39 plantillas = 234 mediciones**, **230 URLs
rastreadas**, **16 rutas × 4 modos** (móvil/escritorio × claro/oscuro) con
axe-core, y **23 comprobaciones de interacción** ejecutadas tocando los
controles.

## 0. Por qué hacía falta

El repositorio tenía 747 pruebas en verde. Ninguna abre un navegador: leen
archivos y llaman funciones. Por eso convivieron trece etapas de trabajo con un
enlace del catálogo que llevaba a un 404, un formulario cuyos errores no
existían para un lector de pantalla, una calculadora ilegible en modo oscuro y
una barra flotante que tapaba los avisos legales en once páginas. **Nada de eso
rompía una prueba.** Ahora rompe: el arné vive en `scripts/diagnostico/` y los
invariantes de cada arreglo, en `test/regresiones-ui.test.ts`.

## 1. Lo que ya estaba bien (y conviene no romper)

| Medición | Resultado |
|---|---|
| Desborde horizontal (234 mediciones, 360–1440 px) | **0** |
| Imágenes rotas / peticiones fallidas | **0** |
| Errores de consola | **0** |
| `<h1>` por página (230 rutas) | **exactamente 1 en todas** |
| Títulos y descripciones duplicados | **0 y 0** |
| Tablas anchas sin contenedor con scroll | **0** |
| Menú móvil, buscador (48 resultados), filtros (99→67), calculadora, tema, carrito, chat | **funcionan** |
| Peso interno | concentrado en las tres cuñas, `/confianza` e `/indicadores` |

## 2. Defectos encontrados y corregidos

### P0 — funcionales

1. **404 en el catálogo.** `/productos/familia/seguridad-industrial` pintaba
   «Comparar las 4» y esa ruta no existe: `comparableFamilies()` exige además
   una fila comparable, y esa familia no comparte ninguna especificación. El
   botón se pintaba con `items.length >= 2`. Ahora usa **el mismo predicado que
   genera la ruta**.
2. **La barra móvil tapaba los avisos legales.** `position: fixed` no ocupa
   sitio: al final del documento se comía «Política de Privacidad» y «Términos
   y Condiciones» en **11 de 13 rutas medidas**. La barra ahora reserva su
   propio alto. Y el botón flotante del asistente cubría el segundo enlace: la
   fila legal pasó a alinearse a la izquierda para salir de esa esquina.
3. **Modo oscuro rompía las cinco calculadoras.** La capa oscura de
   `globals.css` remapeaba la TINTA de `.text-gray-900` pero no el FONDO de
   `input.bg-white` (los controles de formulario no estaban en la lista de
   elementos). Resultado: **fondo blanco con tinta clara, 1.16:1** — texto
   invisible en la herramienta de una página donde se decide una compra.
   El mismo defecto afectaba al ordenador de `/productos`.

### P1 — accesibilidad e integración

4. **Tres controles sin nombre en `/productos`**: el `<select>` de orden (sin
   `label`, sin `aria-label`, sin `name`) y los dos botones de vista
   cuadrícula/lista (iconos sin texto).
5. **Las pestañas de la portada no eran pestañas.** `ServiceTabs` se declaraba
   con `aria-pressed` —que se anuncia como interruptor, no como «pestaña 2 de
   4»— y el panel no estaba asociado a ninguna. En el mismo repositorio,
   `MachineryGallery` ya lo hacía bien: **dos widgets, dos verdades.** Además
   **rotaba cada 5 s con pausa sólo por `hover`, que en un teléfono no existe**
   (WCAG 2.2.2). Ahora: `tablist/tab/tabpanel`, `aria-selected`,
   `aria-controls`, navegación con flechas, y un botón explícito de pausa.
6. **Los errores del RFQ no existían para quien no ve.** `noValidate` +
   react-hook-form pintaba un `<p>` rojo y nada más: sin `aria-invalid`, sin
   `aria-describedby`, sin `role="alert"`, sin `aria-required`. En la única
   página por la que entra el dinero. Verificado tras el arreglo: **7 alertas,
   6 campos marcados y asociados a su mensaje, 6 declarados obligatorios.**
7. **El bloque de respuesta directa era ilegible en oscuro (2.33:1)** — el
   párrafo que citan los motores de respuesta, en las tres cuñas, sus gemelas
   inglesas y `/fabricar-o-importar`. Causa: la utilidad lleva modificador de
   opacidad (`bg-emerald-50/60`) y la capa oscura selecciona `.bg-emerald-50`,
   que es otra clase. El mismo fallo afectaba a los bloques «Qué no afirmamos».
8. **El verde de acción fallaba en oscuro fuera de `<main>`** (2.56:1):
   cabecera, pie y el botón «WhatsApp» de la barra inferior — el más pulsado
   del sitio en un teléfono.
9. **Áreas táctiles**: logo, tema, buscar, menú, iconos sociales y avisos
   legales por debajo del mínimo; puntos de la galería de 24×4 px.
10. **Tablas con scroll no recorribles con teclado** (WCAG 2.1.1) en siete
    plantillas.
11. **Saltos de nivel de encabezado** en `/productos`, las calculadoras y
    `/nosotros`.
12. **La cabecera no era un landmark**: la raíz de `Navbar` era un `<div>`, así
    que la barra utilitaria superior quedaba fuera de toda región y no había
    atajo a la cabecera. Un elemento, trece rutas.

## 3. Un error mío, atrapado por la propia auditoría

La primera versión de la regla de tintes translúcidos cubría también el blanco.
Un selector de atributo no distingue la utilidad de su variante `hover:`, así
que **pintó de oscuro el botón blanco del CTA final —el más pulsado del sitio—
dejando tinta `#0A2540` encima: 1.09:1.** Lo detectó la pasada siguiente de
axe-core, no una lectura. La regla se acotó y hay una prueba que impide que
vuelva.

## 4. Resultado

| Medición | Antes | Después |
|---|---|---|
| Violaciones axe-core (16 rutas × 4 modos) | **127** | **0** |
| — de gravedad crítica | 12 | 0 |
| Enlaces internos rotos | 1 | **0** |
| Rutas con contenido tapado por elementos flotantes | 11 de 13 | **0** |
| Saltos de nivel de encabezado | 3 rutas | **0** |
| Desborde horizontal (234 mediciones) | 0 | **0** |
| Comprobaciones de interacción | 16/18 | **23/23** |
| Pruebas de vitest | 747 | **763** (16 nuevas de regresión) |

`tsc --noEmit` limpio · `next lint` sin avisos · build 354 páginas.

## 5. Cómo repetirlo

```bash
npm run build
npx next start -p 4000 &
npm run diagnostico          # los cinco diagnósticos
npm run diagnostico:a11y     # sólo axe-core
npm run diagnostico:capturas # capturas móvil/escritorio, claro/oscuro
```

La salida (JSON y PNG) va a `.diagnostico/`, ignorada por git.

## 6. Lo que se decidió NO tocar

- **`/ai.txt` y `/mapa-consultas.json` sin enlace entrante.** Es correcto: son
  superficies para agentes, declaradas en `robots.txt` y `llms.txt`, no
  secciones de navegación.
- **`/productos` pesa 1,9 MB** (201 imágenes, 200 con carga diferida). Está
  dentro de lo razonable y bajarlo exige recortar el catálogo visible: es una
  decisión de producto, no un defecto.
- **Enlaces de texto en prosa por debajo de 44 px.** WCAG 2.5.8 los exime
  explícitamente, y axe-core no los reporta.
