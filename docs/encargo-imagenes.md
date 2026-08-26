# Encargo de imágenes — Plastilonas Peruanas SAC

Generado por `npm run imagenes:prompts` desde el registro del sitio.
**No edite este archivo a mano**: se regenera, y el nombre de cada archivo se
deriva del slug real del catálogo.

## Cómo usarlo

1. Genere cada imagen con el prompt indicado.
2. Guárdela EXACTAMENTE con el nombre de archivo que aparece en `Archivo`.
3. Colóquela en la carpeta `public/` respetando la ruta completa.
4. Ejecute `npm run imagenes` para confirmar que el sitio ya la reconoce.

## Tomas alternas: cómo pedir que una imagen rote

El sitio alterna hasta 4 versiones de la MISMA ranura con un cruce
lento y un movimiento Ken Burns desfasado. Se activa solo, por el nombre:

| Archivo | Qué es |
|---|---|
| `nombre.jpg` | toma 1 — la que se ve primero y la que mide el LCP |
| `nombre-2.jpg` | toma 2 — opcional |
| `nombre-3.jpg` | toma 3 — opcional |
| `nombre-4.jpg` | toma 4 — el tope |

Tres condiciones, y las tres se comprueban solas al compilar:

1. **La numeración no puede tener huecos.** Si existe `-3` pero falta
   `-2`, el sitio usa solo la toma 1. Un hueco es casi siempre un archivo
   mal nombrado, y adivinar produciría una rotación distinta en cada despliegue.
2. **Las tomas tienen que ser DISTINTAS.** El sitio compara el contenido byte a
   byte y descarta las copias exactas. Una imagen fundiéndose contra un
   duplicado de sí misma no rota: deja la página quieta diez segundos y
   descarga el archivo dos veces. Si su generador entrega el mismo render
   varias veces, no sirve: hay que cambiar el ángulo, la hora del día, la
   distancia o el material del entorno.
3. **Misma vista, otra captura.** No es otro producto ni otro encuadre
   temático: es el MISMO asunto visto de otro modo. Cambiar de tema entre
   tomas confunde en vez de explicar.

Ejecute `npm run imagenes` después de subirlas: el informe dice cuántas
ranuras rotan y cuántos archivos se descartaron por venir duplicados.

Las rutas empiezan por `/images/...`; en el repositorio eso corresponde a
`public/images/...`. Es decir: `/images/familias/geosinteticos.jpg` se sube
como `public/images/familias/geosinteticos.jpg`.

## Reglas que no debe romper el generador

- **Sin texto dentro de la imagen.** Ni etiquetas, ni cotas, ni títulos. Las
  leyendas las pone la página, en español y en HTML, donde un buscador y un
  lector de pantalla sí las leen. Texto quemado en un JPG es invisible para ambos.
- **Sin logotipos, marcas ni marcas de agua.**
- **Sin rostros identificables.**
- **Exactitud técnica antes que belleza.** Estas imágenes las mira gente que
  instala esto para vivir. Una costura mal representada o una capa en el orden
  equivocado cuesta más credibilidad de la que gana la estética.
- **Una imagen generada no es una fotografía del producto real.** El sitio las
  publica marcadas como referenciales. Cuando exista una foto real del material
  que efectivamente vendemos, reemplaza a la generada: basta sobrescribir el archivo.

---

## Arquitecturas de referencia (diagramas)

0 pendientes de 6.

## Portadas de familia

0 pendientes de 11.

## Términos del glosario (diagramas)

0 pendientes de 41.

## Encabezados de guía

0 pendientes de 10.

## Guías de especificación (diagramas)

0 pendientes de 5.

## Geometría de las calculadoras (diagramas)

0 pendientes de 5.

## Errores de compra por sector (diagramas)

0 pendientes de 16.

## Hubs de aplicación

0 pendientes de 8.

## Procesos y flujos del sitio (diagramas)

13 pendientes de 17.

### 1. `/images/proceso/glosario-mapa.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/glosario-mapa.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /glosario |
| **Texto alternativo** | Cómo se relacionan los términos del glosario con los productos y las guías |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: red de vocabulario técnico: un término central conectado a los productos que gobierna, a las guías que lo desarrollan y a los términos vecinos, mostrando que definir bien una palabra decide una compra.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 2. `/images/proceso/descargas-inventario.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/descargas-inventario.webp` |
| **Tamaño** | 1600 × 700 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /descargas |
| **Texto alternativo** | Qué documentos se pueden descargar y de qué fuente sale cada uno |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: inventario de documentos descargables agrupados por tipo —ficha técnica de producto, guía, arquitectura de solución, informe sectorial, glosario— con una línea que va de cada uno a la fuente de datos de la que se genera, sin registro previo.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 3. `/images/proceso/novedades-registro.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/novedades-registro.webp` |
| **Tamaño** | 1600 × 700 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /novedades |
| **Texto alternativo** | Registro fechado de cambios del sitio y de su catálogo |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: línea de tiempo horizontal con entradas fechadas de distinto tipo —catálogo, documentación, dato sectorial— mostrando que cada cambio publicado queda registrado con su fecha y no se reescribe en silencio.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 4. `/images/proceso/indicadores-fuente.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/indicadores-fuente.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /indicadores |
| **Texto alternativo** | De dónde sale cada indicador y cada cuánto se actualiza |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: camino de un indicador macroeconómico desde el organismo oficial que lo publica hasta la tarjeta que lo muestra, marcando el periodo del dato y el punto en que el sitio recurre a su valor de respaldo si la fuente no responde.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 5. `/images/proceso/compras-homologacion.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/compras-homologacion.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /compras |
| **Texto alternativo** | Recorrido de homologación de un proveedor, de la identidad al primer pedido |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: recorrido de homologación de un proveedor industrial en seis paradas: verificar identidad y RUC, revisar catálogo y modo de suministro, confirmar alcance de exportación, reunir documentación técnica, emitir el RFQ y cerrar el primer pedido.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 6. `/images/proceso/confianza-identidad.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/confianza-identidad.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /confianza |
| **Texto alternativo** | Lo que se puede verificar de la empresa y lo que deliberadamente no se afirma |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: dos columnas enfrentadas: a la izquierda lo verificable —razón social, RUC, dirección de planta, catálogo, año de inicio—; a la derecha lo que no se afirma —certificaciones propias, envío mundial, obras publicadas—, cada lado con su marca distinta.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 7. `/images/proceso/compradores-incoterm.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/compradores-incoterm.webp` |
| **Tamaño** | 1600 × 700 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /compradores |
| **Texto alternativo** | Dónde cambia la responsabilidad entre EXW Lima, FOB Callao y DAP destino |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: línea de suministro de planta a destino con tres marcas de traspaso de responsabilidad —EXW en planta, FOB al costado del buque en el Callao, DAP en destino— indicando en cada tramo quién asume coste y riesgo.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 8. `/images/proceso/distribuidores-canal.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/distribuidores-canal.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /distribuidores |
| **Texto alternativo** | Territorio, almacén y fuerza de ventas: lo que se evalúa en una postulación de canal |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: los tres requisitos que se evalúan en un distribuidor —territorio definido, almacén propio y fuerza de ventas industrial— y el paso de postulación por RFQ que los reúne, sin sugerir registro automático.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 9. `/images/proceso/socios-especificacion.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/socios-especificacion.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /socios |
| **Texto alternativo** | Dónde entra el fabricante en el ciclo de un proyecto de ingeniería |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: ciclo de un proyecto de ingeniería —estudio, especificación, licitación, ejecución— señalando el punto de la especificación como el momento en que interviene el fabricante, no la fase de compra.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 10. `/images/proceso/proyectos-verificacion.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/proyectos-verificacion.webp` |
| **Tamaño** | 1600 × 700 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /proyectos |
| **Texto alternativo** | Por qué una ficha de obra no se publica hasta estar confirmada y autorizada |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: compuerta de dos condiciones que una ficha de obra debe pasar antes de publicarse —confirmación interna de que la obra ocurrió tal como está escrita, y autorización del cliente para mencionarla— con la ficha detenida antes de la compuerta.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 11. `/images/proceso/marco-pilares.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/marco-pilares.webp` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /marco |
| **Texto alternativo** | Los pilares del marco de especificación y qué decide cada uno |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: los pilares del marco de especificación dispuestos como columnas, cada una con el tipo de decisión que resuelve y lo que ocurre en obra si ese dato no existe al cotizar.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 12. `/images/proceso/informes-metodo.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/informes-metodo.webp` |
| **Tamaño** | 1600 × 800 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /informes |
| **Texto alternativo** | Cómo se construye un informe: dato oficial, lectura propia y lo que no se afirma |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: tres bandas apiladas y visiblemente distintas: la cifra de fuente oficial con su organismo y fecha, la lectura propia claramente separada, y la banda de lo que el informe declara no afirmar.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

### 13. `/images/proceso/local-cobertura.webp`

| | |
|---|---|
| **Archivo** | `public/images/proceso/local-cobertura.webp` |
| **Tamaño** | 1600 × 1000 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Cuerpo de /local |
| **Texto alternativo** | Despacho nacional desde una sola planta en Lima |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: silueta del Perú con la planta marcada en Lima y radios de despacho hacia las ciudades con página propia, dejando claro que hay una sola planta y no sedes regionales.
IMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.
```

---

