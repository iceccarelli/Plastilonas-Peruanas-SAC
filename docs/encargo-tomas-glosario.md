# Encargo de TOMAS ALTERNAS — Plastilonas Peruanas SAC

Generado por `npm run imagenes:tomas` desde el registro del sitio.
**No edite este archivo a mano.**

Esto NO es una lista de imágenes que faltan: es la lista de imágenes que **ya
existen** y a las que se les pide una segunda y una tercera versión, para que
el sitio las **alterne** con un cruce lento y un movimiento Ken Burns desfasado.

## Lo único que hay que entender

El nombre del archivo es lo que activa la rotación. Nada más:

| Archivo | Qué es |
|---|---|
| `nombre.jpg` | toma 1 — ya existe, **no la toque** |
| `nombre-2.jpg` | toma 2 — lo que se pide aquí |
| `nombre-3.jpg` | toma 3 — lo que se pide aquí |

## Las dos formas de que esto falle

1. **Entregar el mismo render con otro nombre.** El sitio compara el contenido
   byte a byte y descarta las copias exactas: una imagen fundiéndose contra un
   duplicado de sí misma no rota, deja la página quieta y descarga el archivo
   dos veces. Ya pasó una vez con los diagramas del glosario, que llegaron por
   triplicado e idénticos. Por eso cada encargo de abajo lleva ESCRITO qué debe
   cambiar entre una toma y otra.
2. **Saltarse un número.** Si llega `-3` sin `-2`, el sitio usa solo la
   toma 1. La numeración no puede tener huecos.

Suba los archivos a `public/` respetando la ruta y ejecute
`npm run imagenes`: el informe dice cuántas ranuras rotan y cuántos
archivos se descartaron por venir duplicados.

---

## Términos del glosario (diagramas)

41 imágenes publicadas × 2 tomas = 82 encargos.

### 1. `/images/glosario/altitud-y-radiacion-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/altitud-y-radiacion-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/altitud-y-radiacion.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/altitud-y-radiacion |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Altitud y radiación ultravioleta
QUÉ SIGNIFICA: Relación por la cual la radiación ultravioleta que llega a una superficie aumenta con la altitud, al atravesar menos atmósfera.
QUÉ COMPONER: Corte de la atmósfera con dos emplazamientos: uno al nivel del mar y otro en altura. El haz solar atraviesa mucho menos espesor atmosférico en el segundo y llega con más intensidad.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 2. `/images/glosario/altitud-y-radiacion-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/altitud-y-radiacion-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/altitud-y-radiacion.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/altitud-y-radiacion |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Altitud y radiación ultravioleta
QUÉ SIGNIFICA: Relación por la cual la radiación ultravioleta que llega a una superficie aumenta con la altitud, al atravesar menos atmósfera.
QUÉ COMPONER: Corte de la atmósfera con dos emplazamientos: uno al nivel del mar y otro en altura. El haz solar atraviesa mucho menos espesor atmosférico en el segundo y llega con más intensidad.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 3. `/images/glosario/arquitectura-textil-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/arquitectura-textil-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/arquitectura-textil.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/arquitectura-textil |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Arquitectura textil
QUÉ SIGNIFICA: Construcción cuya envolvente es una membrana flexible que resiste las cargas trabajando a tracción, en lugar de a flexión o a compresión.
QUÉ COMPONER: Superficie de membrana con doble curvatura opuesta —forma de silla de montar— anclada en sus puntos altos y bajos, con las líneas de tracción marcadas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 4. `/images/glosario/arquitectura-textil-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/arquitectura-textil-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/arquitectura-textil.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/arquitectura-textil |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Arquitectura textil
QUÉ SIGNIFICA: Construcción cuya envolvente es una membrana flexible que resiste las cargas trabajando a tracción, en lugar de a flexión o a compresión.
QUÉ COMPONER: Superficie de membrana con doble curvatura opuesta —forma de silla de montar— anclada en sus puntos altos y bajos, con las líneas de tracción marcadas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 5. `/images/glosario/big-bag-fibc-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/big-bag-fibc-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/big-bag-fibc.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/big-bag-fibc |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Big bag
QUÉ SIGNIFICA: Contenedor flexible de gran volumen, tejido en polipropileno, diseñado para llenar, izar y transportar material a granel en una sola unidad de carga.
CÓMO SE MIDE: Por capacidad de carga segura (kg), volumen útil (litros o m³) y dimensiones de cuerpo y asas (cm).
QUÉ COMPONER: Bolsón visto en tres cuartos con sus cuatro asas tensadas por el izaje, boca de carga arriba y boca de descarga abajo señaladas por su geometría. Un gancho de montacargas entrando en las asas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 6. `/images/glosario/big-bag-fibc-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/big-bag-fibc-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/big-bag-fibc.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/big-bag-fibc |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Big bag
QUÉ SIGNIFICA: Contenedor flexible de gran volumen, tejido en polipropileno, diseñado para llenar, izar y transportar material a granel en una sola unidad de carga.
CÓMO SE MIDE: Por capacidad de carga segura (kg), volumen útil (litros o m³) y dimensiones de cuerpo y asas (cm).
QUÉ COMPONER: Bolsón visto en tres cuartos con sus cuatro asas tensadas por el izaje, boca de carga arriba y boca de descarga abajo señaladas por su geometría. Un gancho de montacargas entrando en las asas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 7. `/images/glosario/carga-de-trabajo-segura-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/carga-de-trabajo-segura-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/carga-de-trabajo-segura.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/carga-de-trabajo-segura |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Carga de trabajo segura
QUÉ SIGNIFICA: Peso máximo que un envase o accesorio de izaje está diseñado para soportar en uso normal y repetido, declarado por el fabricante.
CÓMO SE MIDE: En kilogramos, declarada en la etiqueta y en la ficha técnica del envase.
QUÉ COMPONER: Dos escalas verticales enfrentadas sobre el mismo bolsón: la de la izquierda marca la carga de trabajo, la de la derecha la carga de rotura, mucho más alta. La distancia entre ambas es el margen, y debe leerse a simple vista.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 8. `/images/glosario/carga-de-trabajo-segura-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/carga-de-trabajo-segura-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/carga-de-trabajo-segura.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/carga-de-trabajo-segura |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Carga de trabajo segura
QUÉ SIGNIFICA: Peso máximo que un envase o accesorio de izaje está diseñado para soportar en uso normal y repetido, declarado por el fabricante.
CÓMO SE MIDE: En kilogramos, declarada en la etiqueta y en la ficha técnica del envase.
QUÉ COMPONER: Dos escalas verticales enfrentadas sobre el mismo bolsón: la de la izquierda marca la carga de trabajo, la de la derecha la carga de rotura, mucho más alta. La distancia entre ambas es el margen, y debe leerse a simple vista.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 9. `/images/glosario/carga-de-viento-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/carga-de-viento-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/carga-de-viento.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/carga-de-viento |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Carga de viento
QUÉ SIGNIFICA: Fuerza que el viento ejerce sobre una superficie, resultado de su velocidad de diseño, la altura, la exposición del emplazamiento y la forma de la construcción.
CÓMO SE MIDE: Como presión, en kilogramos por metro cuadrado o en pascales, a partir de la velocidad de diseño (km/h).
QUÉ COMPONER: Viento incidiendo sobre una cubierta ligera con las flechas de succión tirando hacia arriba mucho más marcadas que las de presión: el arrancamiento domina.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 10. `/images/glosario/carga-de-viento-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/carga-de-viento-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/carga-de-viento.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/carga-de-viento |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Carga de viento
QUÉ SIGNIFICA: Fuerza que el viento ejerce sobre una superficie, resultado de su velocidad de diseño, la altura, la exposición del emplazamiento y la forma de la construcción.
CÓMO SE MIDE: Como presión, en kilogramos por metro cuadrado o en pascales, a partir de la velocidad de diseño (km/h).
QUÉ COMPONER: Viento incidiendo sobre una cubierta ligera con las flechas de succión tirando hacia arriba mucho más marcadas que las de presión: el arrancamiento domina.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 11. `/images/glosario/caudal-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/caudal-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/caudal.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/caudal |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Caudal de aire
QUÉ SIGNIFICA: Volumen de aire que atraviesa una sección por unidad de tiempo, y magnitud con la que se dimensiona cualquier sistema de ventilación.
CÓMO SE MIDE: En metros cúbicos por minuto (m³/min) o por segundo (m³/s); también en pies cúbicos por minuto.
QUÉ COMPONER: Una sección transversal de conducto con el volumen de aire que la atraviesa representado como un bloque que avanza en el tiempo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 12. `/images/glosario/caudal-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/caudal-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/caudal.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/caudal |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Caudal de aire
QUÉ SIGNIFICA: Volumen de aire que atraviesa una sección por unidad de tiempo, y magnitud con la que se dimensiona cualquier sistema de ventilación.
CÓMO SE MIDE: En metros cúbicos por minuto (m³/min) o por segundo (m³/s); también en pies cúbicos por minuto.
QUÉ COMPONER: Una sección transversal de conducto con el volumen de aire que la atraviesa representado como un bloque que avanza en el tiempo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 13. `/images/glosario/certificado-de-lote-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/certificado-de-lote-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/certificado-de-lote.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/certificado-de-lote |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Certificado de lote
QUÉ SIGNIFICA: Documento emitido por el fabricante que declara los resultados de ensayo del lote concreto de material suministrado.
QUÉ COMPONER: Un rollo de material con su etiqueta de lote y, unido por una línea de trazabilidad, el documento que declara los ensayos de ESE lote. La correspondencia uno a uno es el mensaje.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 14. `/images/glosario/certificado-de-lote-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/certificado-de-lote-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/certificado-de-lote.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/certificado-de-lote |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Certificado de lote
QUÉ SIGNIFICA: Documento emitido por el fabricante que declara los resultados de ensayo del lote concreto de material suministrado.
QUÉ COMPONER: Un rollo de material con su etiqueta de lote y, unido por una línea de trazabilidad, el documento que declara los ensayos de ESE lote. La correspondencia uno a uno es el mensaje.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 15. `/images/glosario/denier-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/denier-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/denier.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/denier |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Denier
QUÉ SIGNIFICA: Unidad que expresa el grosor de un hilo por su masa en gramos cada 9.000 metros de longitud.
CÓMO SE MIDE: En denier (g/9.000 m), habitualmente acompañado de la densidad de trama en hilos por pulgada.
QUÉ COMPONER: Tres hilos en paralelo, de grosor claramente creciente, y bajo ellos la misma longitud de referencia. El grosor es la variable.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 16. `/images/glosario/denier-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/denier-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/denier.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/denier |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Denier
QUÉ SIGNIFICA: Unidad que expresa el grosor de un hilo por su masa en gramos cada 9.000 metros de longitud.
CÓMO SE MIDE: En denier (g/9.000 m), habitualmente acompañado de la densidad de trama en hilos por pulgada.
QUÉ COMPONER: Tres hilos en paralelo, de grosor claramente creciente, y bajo ellos la misma longitud de referencia. El grosor es la variable.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 17. `/images/glosario/densidad-aparente-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/densidad-aparente-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/densidad-aparente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/densidad-aparente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Densidad aparente
QUÉ SIGNIFICA: Masa por unidad de volumen de un material a granel incluyendo los huecos entre partículas, no solo el volumen del sólido.
CÓMO SE MIDE: En kilogramos por metro cúbico (kg/m³) o toneladas por metro cúbico.
QUÉ COMPONER: Dos recipientes del mismo volumen lado a lado: uno con partículas gruesas y muchos huecos, otro con partículas finas y pocos huecos. Bajo cada uno, una balanza marcando pesos claramente distintos.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 18. `/images/glosario/densidad-aparente-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/densidad-aparente-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/densidad-aparente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/densidad-aparente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Densidad aparente
QUÉ SIGNIFICA: Masa por unidad de volumen de un material a granel incluyendo los huecos entre partículas, no solo el volumen del sólido.
CÓMO SE MIDE: En kilogramos por metro cúbico (kg/m³) o toneladas por metro cúbico.
QUÉ COMPONER: Dos recipientes del mismo volumen lado a lado: uno con partículas gruesas y muchos huecos, otro con partículas finas y pocos huecos. Bajo cada uno, una balanza marcando pesos claramente distintos.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 19. `/images/glosario/estabilizacion-uv-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/estabilizacion-uv-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/estabilizacion-uv.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/estabilizacion-uv |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Estabilización ultravioleta
QUÉ SIGNIFICA: Incorporación de aditivos al material plástico para retrasar la degradación que produce la radiación solar sobre los polímeros.
QUÉ COMPONER: Dos fragmentos del mismo material bajo el mismo haz solar: en el de la izquierda las cadenas del polímero se mantienen; en el de la derecha aparecen fracturadas y el borde se resquebraja. La diferencia es el aditivo, representado como partículas dispersas en la masa del primero.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 20. `/images/glosario/estabilizacion-uv-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/estabilizacion-uv-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/estabilizacion-uv.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/estabilizacion-uv |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Estabilización ultravioleta
QUÉ SIGNIFICA: Incorporación de aditivos al material plástico para retrasar la degradación que produce la radiación solar sobre los polímeros.
QUÉ COMPONER: Dos fragmentos del mismo material bajo el mismo haz solar: en el de la izquierda las cadenas del polímero se mantienen; en el de la derecha aparecen fracturadas y el borde se resquebraja. La diferencia es el aditivo, representado como partículas dispersas en la masa del primero.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 21. `/images/glosario/factor-de-fuga-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/factor-de-fuga-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/factor-de-fuga.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/factor-de-fuga |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Factor de fuga
QUÉ SIGNIFICA: Proporción del aire que se escapa por las uniones y las perforaciones de un ducto antes de llegar al punto de entrega.
QUÉ COMPONER: Ducto tendido con pequeñas fugas escapando en cada unión a lo largo del recorrido, de modo que el flujo que llega al final es visiblemente menor que el que entró.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 22. `/images/glosario/factor-de-fuga-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/factor-de-fuga-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/factor-de-fuga.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/factor-de-fuga |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Factor de fuga
QUÉ SIGNIFICA: Proporción del aire que se escapa por las uniones y las perforaciones de un ducto antes de llegar al punto de entrega.
QUÉ COMPONER: Ducto tendido con pequeñas fugas escapando en cada unión a lo largo del recorrido, de modo que el flujo que llega al final es visiblemente menor que el que entró.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 23. `/images/glosario/factor-de-seguridad-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/factor-de-seguridad-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/factor-de-seguridad.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/factor-de-seguridad |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Factor de seguridad
QUÉ SIGNIFICA: Relación entre la carga de rotura de un envase y su carga de trabajo segura, expresada como una proporción del tipo 5:1 o 6:1.
CÓMO SE MIDE: Como una proporción adimensional (por ejemplo 5:1 o 6:1), declarada por el fabricante.
QUÉ COMPONER: Cinco bloques idénticos apilados junto a un bolsón que sostiene solo uno: la proporción 5:1 expresada como cantidad, no como número escrito.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 24. `/images/glosario/factor-de-seguridad-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/factor-de-seguridad-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/factor-de-seguridad.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/factor-de-seguridad |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Factor de seguridad
QUÉ SIGNIFICA: Relación entre la carga de rotura de un envase y su carga de trabajo segura, expresada como una proporción del tipo 5:1 o 6:1.
CÓMO SE MIDE: Como una proporción adimensional (por ejemplo 5:1 o 6:1), declarada por el fabricante.
QUÉ COMPONER: Cinco bloques idénticos apilados junto a un bolsón que sostiene solo uno: la proporción 5:1 expresada como cantidad, no como número escrito.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 25. `/images/glosario/geomalla-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geomalla-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geomalla.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geomalla |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geomalla
QUÉ SIGNIFICA: Estructura sintética de aberturas regulares diseñada para reforzar suelo mediante la trabazón mecánica de las partículas dentro de sus aberturas.
CÓMO SE MIDE: Por resistencia a la tracción en cada dirección (kN/m) y por tamaño de abertura.
QUÉ COMPONER: Corte de terreno con la geomalla tendida y el árido trabado dentro de sus aberturas: las partículas encajan en la retícula y el conjunto se comporta como un bloque.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 26. `/images/glosario/geomalla-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geomalla-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geomalla.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geomalla |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geomalla
QUÉ SIGNIFICA: Estructura sintética de aberturas regulares diseñada para reforzar suelo mediante la trabazón mecánica de las partículas dentro de sus aberturas.
CÓMO SE MIDE: Por resistencia a la tracción en cada dirección (kN/m) y por tamaño de abertura.
QUÉ COMPONER: Corte de terreno con la geomalla tendida y el árido trabado dentro de sus aberturas: las partículas encajan en la retícula y el conjunto se comporta como un bloque.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 27. `/images/glosario/geomembrana-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geomembrana-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geomembrana.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geomembrana |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geomembrana
QUÉ SIGNIFICA: Lámina sintética de muy baja permeabilidad instalada como barrera para impedir el paso de líquidos o gases entre dos medios.
CÓMO SE MIDE: Por polímero, espesor (mm o mils), textura de superficie y ancho de rollo.
QUÉ COMPONER: Corte de talud y fondo con la lámina continua sobre el terreno, mostrando los tres puntos donde se pierde la continuidad: unión, penetración y anclaje perimetral.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 28. `/images/glosario/geomembrana-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geomembrana-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geomembrana.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geomembrana |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geomembrana
QUÉ SIGNIFICA: Lámina sintética de muy baja permeabilidad instalada como barrera para impedir el paso de líquidos o gases entre dos medios.
CÓMO SE MIDE: Por polímero, espesor (mm o mils), textura de superficie y ancho de rollo.
QUÉ COMPONER: Corte de talud y fondo con la lámina continua sobre el terreno, mostrando los tres puntos donde se pierde la continuidad: unión, penetración y anclaje perimetral.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 29. `/images/glosario/geosintetico-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geosintetico-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geosintetico.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geosintetico |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geosintético
QUÉ SIGNIFICA: Material polimérico fabricado para instalarse en contacto con suelo o roca y cumplir una función de ingeniería definida: contener, separar, filtrar, drenar, proteger o reforzar.
QUÉ COMPONER: Corte de terreno con las distintas familias en su posición típica: geomalla trabando el árido arriba, geotextil separando capas, geomembrana como barrera, geocompuesto drenando. Cada una en su función, no en fila.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 30. `/images/glosario/geosintetico-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geosintetico-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geosintetico.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geosintetico |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geosintético
QUÉ SIGNIFICA: Material polimérico fabricado para instalarse en contacto con suelo o roca y cumplir una función de ingeniería definida: contener, separar, filtrar, drenar, proteger o reforzar.
QUÉ COMPONER: Corte de terreno con las distintas familias en su posición típica: geomalla trabando el árido arriba, geotextil separando capas, geomembrana como barrera, geocompuesto drenando. Cada una en su función, no en fila.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 31. `/images/glosario/geotextil-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geotextil-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geotextil.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geotextil |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geotextil
QUÉ SIGNIFICA: Tela permeable de fibras sintéticas que se instala en contacto con el suelo para separar capas, filtrar, drenar, proteger o reforzar.
CÓMO SE MIDE: Por construcción, gramaje (g/m²), resistencia a la tracción, resistencia al punzonamiento y propiedades hidráulicas de abertura y permitividad.
QUÉ COMPONER: Dos paños ampliados lado a lado: uno de fibras entrelazadas al azar y gran espesor, otro de hilos cruzados en ángulo recto. La diferencia de construcción es todo el dibujo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 32. `/images/glosario/geotextil-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/geotextil-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/geotextil.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/geotextil |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Geotextil
QUÉ SIGNIFICA: Tela permeable de fibras sintéticas que se instala en contacto con el suelo para separar capas, filtrar, drenar, proteger o reforzar.
CÓMO SE MIDE: Por construcción, gramaje (g/m²), resistencia a la tracción, resistencia al punzonamiento y propiedades hidráulicas de abertura y permitividad.
QUÉ COMPONER: Dos paños ampliados lado a lado: uno de fibras entrelazadas al azar y gran espesor, otro de hilos cruzados en ángulo recto. La diferencia de construcción es todo el dibujo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 33. `/images/glosario/gramaje-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/gramaje-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/gramaje.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/gramaje |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Gramaje
QUÉ SIGNIFICA: Masa de un tejido o una lámina por unidad de superficie, que expresa cuánto material hay en cada metro cuadrado.
CÓMO SE MIDE: En gramos por metro cuadrado (g/m²).
QUÉ COMPONER: Un cuadrado de un metro por un metro recortado de la lona, suspendido sobre el plato de una balanza. La superficie unitaria y la masa, nada más.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 34. `/images/glosario/gramaje-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/gramaje-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/gramaje.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/gramaje |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Gramaje
QUÉ SIGNIFICA: Masa de un tejido o una lámina por unidad de superficie, que expresa cuánto material hay en cada metro cuadrado.
CÓMO SE MIDE: En gramos por metro cuadrado (g/m²).
QUÉ COMPONER: Un cuadrado de un metro por un metro recortado de la lona, suspendido sobre el plato de una balanza. La superficie unitaria y la masa, nada más.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 35. `/images/glosario/liner-interior-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/liner-interior-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/liner-interior.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/liner-interior |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Liner
QUÉ SIGNIFICA: Bolsa de película plástica colocada dentro de un envase textil para aislar el contenido del tejido exterior.
CÓMO SE MIDE: Por material de la película y su espesor (micras), y por la forma de fijación al envase.
QUÉ COMPONER: Corte del bolsón con la bolsa interior visible como una segunda piel separada del tejido exterior, conteniendo material fino que el tejido dejaría pasar.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 36. `/images/glosario/liner-interior-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/liner-interior-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/liner-interior.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/liner-interior |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Liner
QUÉ SIGNIFICA: Bolsa de película plástica colocada dentro de un envase textil para aislar el contenido del tejido exterior.
CÓMO SE MIDE: Por material de la película y su espesor (micras), y por la forma de fijación al envase.
QUÉ COMPONER: Corte del bolsón con la bolsa interior visible como una segunda piel separada del tejido exterior, conteniendo material fino que el tejido dejaría pasar.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 37. `/images/glosario/lona-plastificada-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/lona-plastificada-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/lona-plastificada.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/lona-plastificada |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Lona plastificada
QUÉ SIGNIFICA: Tejido de fibra sintética recubierto en ambas caras con una capa de material plástico que le da impermeabilidad y resistencia a la intemperie.
CÓMO SE MIDE: Por gramaje total (g/m²), denier del tejido base y densidad de hilos por pulgada.
QUÉ COMPONER: Corte transversal muy ampliado con las tres capas separadas y visibles: recubrimiento superior, tejido base con su trama de hilos cruzados, recubrimiento inferior.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 38. `/images/glosario/lona-plastificada-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/lona-plastificada-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/lona-plastificada.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/lona-plastificada |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Lona plastificada
QUÉ SIGNIFICA: Tejido de fibra sintética recubierto en ambas caras con una capa de material plástico que le da impermeabilidad y resistencia a la intemperie.
CÓMO SE MIDE: Por gramaje total (g/m²), denier del tejido base y densidad de hilos por pulgada.
QUÉ COMPONER: Corte transversal muy ampliado con las tres capas separadas y visibles: recubrimiento superior, tejido base con su trama de hilos cruzados, recubrimiento inferior.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 39. `/images/glosario/malla-antiafida-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/malla-antiafida-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/malla-antiafida.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/malla-antiafida |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Malla antiáfida
QUÉ SIGNIFICA: Tejido de trama cerrada instalado como barrera física para impedir el ingreso de insectos vectores a un cultivo protegido.
CÓMO SE MIDE: Por densidad de trama, expresada en hilos por pulgada (mesh) o en dimensiones de la abertura.
QUÉ COMPONER: Ampliación de la trama con insectos de distinto tamaño frente a la abertura: uno queda fuera, otro pasa. La relación tamaño de abertura contra tamaño del insecto es el dibujo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 40. `/images/glosario/malla-antiafida-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/malla-antiafida-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/malla-antiafida.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/malla-antiafida |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Malla antiáfida
QUÉ SIGNIFICA: Tejido de trama cerrada instalado como barrera física para impedir el ingreso de insectos vectores a un cultivo protegido.
CÓMO SE MIDE: Por densidad de trama, expresada en hilos por pulgada (mesh) o en dimensiones de la abertura.
QUÉ COMPONER: Ampliación de la trama con insectos de distinto tamaño frente a la abertura: uno queda fuera, otro pasa. La relación tamaño de abertura contra tamaño del insecto es el dibujo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 41. `/images/glosario/malla-raschel-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/malla-raschel-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/malla-raschel.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/malla-raschel |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Malla Raschel
QUÉ SIGNIFICA: Malla fabricada por tejido de urdimbre tipo Raschel, empleada para sombreo y protección de cultivos y de superficies.
CÓMO SE MIDE: Por porcentaje de sombra (%), gramaje (g/m²) y ancho de rollo (m).
QUÉ COMPONER: Ampliación de la estructura de tejido de urdimbre Raschel, mostrando el enlazado que impide que se deshilache, y un borde cortado que se mantiene íntegro.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 42. `/images/glosario/malla-raschel-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/malla-raschel-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/malla-raschel.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/malla-raschel |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Malla Raschel
QUÉ SIGNIFICA: Malla fabricada por tejido de urdimbre tipo Raschel, empleada para sombreo y protección de cultivos y de superficies.
CÓMO SE MIDE: Por porcentaje de sombra (%), gramaje (g/m²) y ancho de rollo (m).
QUÉ COMPONER: Ampliación de la estructura de tejido de urdimbre Raschel, mostrando el enlazado que impide que se deshilache, y un borde cortado que se mantiene íntegro.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 43. `/images/glosario/manga-de-ventilacion-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/manga-de-ventilacion-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/manga-de-ventilacion.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/manga-de-ventilacion |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Manga de ventilación
QUÉ SIGNIFICA: Conducto flexible de material textil o plástico que transporta aire entre un ventilador y el frente de trabajo de una labor subterránea.
CÓMO SE MIDE: Por diámetro nominal (pulgadas o mm), longitud por tramo (m) y presión de trabajo.
QUÉ COMPONER: Labor subterránea en corte longitudinal con el ventilador en la bocamina, la manga tendida por el techo y el frente de trabajo al fondo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 44. `/images/glosario/manga-de-ventilacion-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/manga-de-ventilacion-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/manga-de-ventilacion.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/manga-de-ventilacion |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Manga de ventilación
QUÉ SIGNIFICA: Conducto flexible de material textil o plástico que transporta aire entre un ventilador y el frente de trabajo de una labor subterránea.
CÓMO SE MIDE: Por diámetro nominal (pulgadas o mm), longitud por tramo (m) y presión de trabajo.
QUÉ COMPONER: Labor subterránea en corte longitudinal con el ventilador en la bocamina, la manga tendida por el techo y el frente de trabajo al fondo.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 45. `/images/glosario/mesh-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/mesh-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/mesh.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/mesh |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Mesh
QUÉ SIGNIFICA: Unidad que expresa la densidad de una trama como número de hilos por pulgada lineal, en una o en ambas direcciones.
CÓMO SE MIDE: En hilos por pulgada, habitualmente como un par de valores.
QUÉ COMPONER: Una pulgada de referencia sobre la trama, con los hilos contados dentro de esa distancia. Dos tramas de distinta densidad para comparar.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 46. `/images/glosario/mesh-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/mesh-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/mesh.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/mesh |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Mesh
QUÉ SIGNIFICA: Unidad que expresa la densidad de una trama como número de hilos por pulgada lineal, en una o en ambas direcciones.
CÓMO SE MIDE: En hilos por pulgada, habitualmente como un par de valores.
QUÉ COMPONER: Una pulgada de referencia sobre la trama, con los hilos contados dentro de esa distancia. Dos tramas de distinta densidad para comparar.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 47. `/images/glosario/no-tejido-punzonado-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/no-tejido-punzonado-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/no-tejido-punzonado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/no-tejido-punzonado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: No tejido punzonado por agujas
QUÉ SIGNIFICA: Proceso de fabricación que entrelaza mecánicamente las fibras de un velo con agujas de púas, sin tejerlas ni fundirlas.
QUÉ COMPONER: Corte del velo de fibras con las agujas de púas descendiendo y arrastrando fibras de una capa a otra, dejando la estructura entrelazada y esponjosa.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 48. `/images/glosario/no-tejido-punzonado-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/no-tejido-punzonado-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/no-tejido-punzonado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/no-tejido-punzonado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: No tejido punzonado por agujas
QUÉ SIGNIFICA: Proceso de fabricación que entrelaza mecánicamente las fibras de un velo con agujas de púas, sin tejerlas ni fundirlas.
QUÉ COMPONER: Corte del velo de fibras con las agujas de púas descendiendo y arrastrando fibras de una capa a otra, dejando la estructura entrelazada y esponjosa.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 49. `/images/glosario/ojal-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ojal-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ojal.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ojal |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ojal
QUÉ SIGNIFICA: Refuerzo metálico o plástico instalado en el borde de una lona para transmitir el esfuerzo de amarre al tejido sin desgarrarlo.
CÓMO SE MIDE: Por diámetro interior (mm), material y separación entre ojales (cm).
QUÉ COMPONER: Corte del borde de una lona con el ojal instalado: refuerzo local de material bajo el anillo, y la cuerda tirando. El área sobre la que se reparte el esfuerzo debe ser evidente.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 50. `/images/glosario/ojal-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ojal-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ojal.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ojal |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ojal
QUÉ SIGNIFICA: Refuerzo metálico o plástico instalado en el borde de una lona para transmitir el esfuerzo de amarre al tejido sin desgarrarlo.
CÓMO SE MIDE: Por diámetro interior (mm), material y separación entre ojales (cm).
QUÉ COMPONER: Corte del borde de una lona con el ojal instalado: refuerzo local de material bajo el anillo, y la cuerda tirando. El área sobre la que se reparte el esfuerzo debe ser evidente.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 51. `/images/glosario/perdida-de-carga-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/perdida-de-carga-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/perdida-de-carga.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/perdida-de-carga |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Pérdida de carga
QUÉ SIGNIFICA: Energía que el aire pierde por rozamiento y turbulencia al recorrer un conducto, expresada como una caída de presión.
CÓMO SE MIDE: En pascales (Pa) o en pulgadas de columna de agua.
QUÉ COMPONER: Ducto en corte longitudinal con la presión decreciendo a lo largo del recorrido, y las pérdidas localizadas marcadas en los codos y los acoples.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 52. `/images/glosario/perdida-de-carga-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/perdida-de-carga-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/perdida-de-carga.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/perdida-de-carga |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Pérdida de carga
QUÉ SIGNIFICA: Energía que el aire pierde por rozamiento y turbulencia al recorrer un conducto, expresada como una caída de presión.
CÓMO SE MIDE: En pascales (Pa) o en pulgadas de columna de agua.
QUÉ COMPONER: Ducto en corte longitudinal con la presión decreciendo a lo largo del recorrido, y las pérdidas localizadas marcadas en los codos y los acoples.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 53. `/images/glosario/permitividad-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/permitividad-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/permitividad.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/permitividad |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Permitividad
QUÉ SIGNIFICA: Capacidad de un geotextil de dejar pasar agua perpendicularmente a su plano, por unidad de diferencia de presión y de tiempo.
CÓMO SE MIDE: En segundos elevados a menos uno (s⁻¹), por ensayos hidráulicos normalizados.
QUÉ COMPONER: Un mismo geotextil con dos flujos representados: uno atravesándolo perpendicularmente (permitividad) y otro corriendo dentro de su espesor a lo largo del plano (transmisividad).
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 54. `/images/glosario/permitividad-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/permitividad-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/permitividad.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/permitividad |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Permitividad
QUÉ SIGNIFICA: Capacidad de un geotextil de dejar pasar agua perpendicularmente a su plano, por unidad de diferencia de presión y de tiempo.
CÓMO SE MIDE: En segundos elevados a menos uno (s⁻¹), por ensayos hidráulicos normalizados.
QUÉ COMPONER: Un mismo geotextil con dos flujos representados: uno atravesándolo perpendicularmente (permitividad) y otro corriendo dentro de su espesor a lo largo del plano (transmisividad).
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 55. `/images/glosario/as-built-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/as-built-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/as-built.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/as-built |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Plano as-built
QUÉ SIGNIFICA: Documentación que registra cómo quedó ejecutada la obra realmente, incluida la disposición de paneles, uniones, reparaciones y ensayos.
QUÉ COMPONER: Planta de una poza con el despiece real de paneles numerados, las líneas de unión marcadas y los puntos de reparación señalados en su posición.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 56. `/images/glosario/as-built-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/as-built-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/as-built.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/as-built |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Plano as-built
QUÉ SIGNIFICA: Documentación que registra cómo quedó ejecutada la obra realmente, incluida la disposición de paneles, uniones, reparaciones y ensayos.
QUÉ COMPONER: Planta de una poza con el despiece real de paneles numerados, las líneas de unión marcadas y los puntos de reparación señalados en su posición.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 57. `/images/glosario/hdpe-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/hdpe-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/hdpe.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/hdpe |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Polietileno de alta densidad
QUÉ SIGNIFICA: Polímero de cadena lineal y alta cristalinidad, usado en geomembranas y tuberías por su resistencia química y su baja permeabilidad.
QUÉ COMPONER: Comparación de estructura molecular esquemática: cadenas lineales apretadas y ordenadas (alta densidad) frente a cadenas ramificadas y sueltas. Sin fórmulas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 58. `/images/glosario/hdpe-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/hdpe-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/hdpe.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/hdpe |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Polietileno de alta densidad
QUÉ SIGNIFICA: Polímero de cadena lineal y alta cristalinidad, usado en geomembranas y tuberías por su resistencia química y su baja permeabilidad.
QUÉ COMPONER: Comparación de estructura molecular esquemática: cadenas lineales apretadas y ordenadas (alta densidad) frente a cadenas ramificadas y sueltas. Sin fórmulas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 59. `/images/glosario/porcentaje-de-sombra-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/porcentaje-de-sombra-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/porcentaje-de-sombra.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/porcentaje-de-sombra |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Porcentaje de sombra
QUÉ SIGNIFICA: Proporción de radiación solar que una malla intercepta, expresada como porcentaje de la radiación incidente.
CÓMO SE MIDE: En porcentaje (%) de intercepción de radiación.
QUÉ COMPONER: Haz de radiación incidiendo sobre la malla: una parte se intercepta y otra pasa, representadas como dos fracciones claramente distintas del haz original.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 60. `/images/glosario/porcentaje-de-sombra-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/porcentaje-de-sombra-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/porcentaje-de-sombra.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/porcentaje-de-sombra |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Porcentaje de sombra
QUÉ SIGNIFICA: Proporción de radiación solar que una malla intercepta, expresada como porcentaje de la radiación incidente.
CÓMO SE MIDE: En porcentaje (%) de intercepción de radiación.
QUÉ COMPONER: Haz de radiación incidiendo sobre la malla: una parte se intercepta y otra pasa, representadas como dos fracciones claramente distintas del haz original.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 61. `/images/glosario/pretensado-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/pretensado-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/pretensado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/pretensado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Pretensado
QUÉ SIGNIFICA: Tensión que se introduce deliberadamente en una membrana durante el montaje para que nunca quede floja bajo las cargas de servicio.
QUÉ COMPONER: La misma membrana en dos estados: floja y aleteando por el viento, y tensada y estable. El sistema de retensado visible en el anclaje.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 62. `/images/glosario/pretensado-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/pretensado-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/pretensado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/pretensado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Pretensado
QUÉ SIGNIFICA: Tensión que se introduce deliberadamente en una membrana durante el montaje para que nunca quede floja bajo las cargas de servicio.
QUÉ COMPONER: La misma membrana en dos estados: floja y aleteando por el viento, y tensada y estable. El sistema de retensado visible en el anclaje.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 63. `/images/glosario/refuerzo-espiral-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/refuerzo-espiral-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/refuerzo-espiral.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/refuerzo-espiral |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Refuerzo espiral
QUÉ SIGNIFICA: Alambre o perfil dispuesto helicoidalmente en la pared de una manga para impedir que colapse cuando trabaja a presión negativa.
QUÉ COMPONER: Tramo de manga en corte con el alambre helicoidal en su pared, y al lado la misma manga sin refuerzo mostrando la sección aplastada.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 64. `/images/glosario/refuerzo-espiral-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/refuerzo-espiral-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/refuerzo-espiral.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/refuerzo-espiral |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Refuerzo espiral
QUÉ SIGNIFICA: Alambre o perfil dispuesto helicoidalmente en la pared de una manga para impedir que colapse cuando trabaja a presión negativa.
QUÉ COMPONER: Tramo de manga en corte con el alambre helicoidal en su pared, y al lado la misma manga sin refuerzo mostrando la sección aplastada.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 65. `/images/glosario/resistencia-al-desgarro-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/resistencia-al-desgarro-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/resistencia-al-desgarro.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/resistencia-al-desgarro |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Resistencia al desgarro
QUÉ SIGNIFICA: Fuerza necesaria para propagar un corte ya iniciado en un tejido, a diferencia de la fuerza necesaria para romperlo desde intacto.
CÓMO SE MIDE: En newtons (N), por métodos de ensayo normalizados de rasgado.
QUÉ COMPONER: Dos paños idénticos: en uno la fuerza tira de un borde intacto; en el otro, de un corte ya iniciado que se propaga. Las dos flechas de fuerza son del mismo tamaño y el resultado es distinto.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 66. `/images/glosario/resistencia-al-desgarro-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/resistencia-al-desgarro-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/resistencia-al-desgarro.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/resistencia-al-desgarro |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Resistencia al desgarro
QUÉ SIGNIFICA: Fuerza necesaria para propagar un corte ya iniciado en un tejido, a diferencia de la fuerza necesaria para romperlo desde intacto.
CÓMO SE MIDE: En newtons (N), por métodos de ensayo normalizados de rasgado.
QUÉ COMPONER: Dos paños idénticos: en uno la fuerza tira de un borde intacto; en el otro, de un corte ya iniciado que se propaga. Las dos flechas de fuerza son del mismo tamaño y el resultado es distinto.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 67. `/images/glosario/resistencia-al-punzonamiento-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/resistencia-al-punzonamiento-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/resistencia-al-punzonamiento.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/resistencia-al-punzonamiento |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Resistencia al punzonamiento
QUÉ SIGNIFICA: Fuerza que un geosintético soporta antes de ser perforado por un objeto que lo empuja perpendicularmente a su plano.
CÓMO SE MIDE: En newtons (N), por ensayos de punzonamiento normalizados.
QUÉ COMPONER: Una piedra angulosa de la subrasante empujando desde abajo contra el geotextil y la geomembrana: se ve la deformación absorbida por el geotextil y la lámina intacta encima.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 68. `/images/glosario/resistencia-al-punzonamiento-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/resistencia-al-punzonamiento-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/resistencia-al-punzonamiento.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/resistencia-al-punzonamiento |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Resistencia al punzonamiento
QUÉ SIGNIFICA: Fuerza que un geosintético soporta antes de ser perforado por un objeto que lo empuja perpendicularmente a su plano.
CÓMO SE MIDE: En newtons (N), por ensayos de punzonamiento normalizados.
QUÉ COMPONER: Una piedra angulosa de la subrasante empujando desde abajo contra el geotextil y la geomembrana: se ve la deformación absorbida por el geotextil y la lámina intacta encima.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 69. `/images/glosario/soldadura-por-cuna-caliente-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/soldadura-por-cuna-caliente-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/soldadura-por-cuna-caliente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/soldadura-por-cuna-caliente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Soldadura por cuña caliente
QUÉ SIGNIFICA: Técnica de unión de geomembranas termoplásticas que funde dos láminas superpuestas con una cuña calefactada y las presiona con rodillos, dejando dos pistas de soldadura y un canal de aire entre ellas.
QUÉ COMPONER: Corte de dos láminas solapadas con la cuña entrando entre ellas y los rodillos presionando: se ven las DOS pistas de soldadura y el canal de aire que queda entre ambas, con la aguja de presurización.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 70. `/images/glosario/soldadura-por-cuna-caliente-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/soldadura-por-cuna-caliente-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/soldadura-por-cuna-caliente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/soldadura-por-cuna-caliente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Soldadura por cuña caliente
QUÉ SIGNIFICA: Técnica de unión de geomembranas termoplásticas que funde dos láminas superpuestas con una cuña calefactada y las presiona con rodillos, dejando dos pistas de soldadura y un canal de aire entre ellas.
QUÉ COMPONER: Corte de dos láminas solapadas con la cuña entrando entre ellas y los rodillos presionando: se ven las DOS pistas de soldadura y el canal de aire que queda entre ambas, con la aguja de presurización.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 71. `/images/glosario/subrasante-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/subrasante-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/subrasante.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/subrasante |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Subrasante
QUÉ SIGNIFICA: Superficie de suelo preparada y aceptada sobre la que se instala un geosintético.
QUÉ COMPONER: Corte del terreno preparado: superficie perfilada y compactada, y junto a ella —tachados o apartados— los elementos que no deben quedar: piedra angulosa, raíz, encharcamiento.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 72. `/images/glosario/subrasante-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/subrasante-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/subrasante.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/subrasante |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Subrasante
QUÉ SIGNIFICA: Superficie de suelo preparada y aceptada sobre la que se instala un geosintético.
QUÉ COMPONER: Corte del terreno preparado: superficie perfilada y compactada, y junto a ella —tachados o apartados— los elementos que no deben quedar: piedra angulosa, raíz, encharcamiento.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 73. `/images/glosario/termosellado-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/termosellado-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/termosellado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/termosellado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Termosellado
QUÉ SIGNIFICA: Unión de dos piezas de material termoplástico fundiendo sus superficies con calor y presión, sin hilo ni adhesivo.
QUÉ COMPONER: Corte de dos láminas superpuestas: arriba una unión continua donde el material se fundió y es un solo cuerpo; abajo, para contraste, una costura con hilo que perfora ambas capas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 74. `/images/glosario/termosellado-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/termosellado-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/termosellado.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/termosellado |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Termosellado
QUÉ SIGNIFICA: Unión de dos piezas de material termoplástico fundiendo sus superficies con calor y presión, sin hilo ni adhesivo.
QUÉ COMPONER: Corte de dos láminas superpuestas: arriba una unión continua donde el material se fundió y es un solo cuerpo; abajo, para contraste, una costura con hilo que perfora ambas capas.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 75. `/images/glosario/tipo-electrostatico-fibc-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/tipo-electrostatico-fibc-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/tipo-electrostatico-fibc.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/tipo-electrostatico-fibc |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Tipos electrostáticos de FIBC (A, B, C y D)
QUÉ SIGNIFICA: Clasificación de los big bags según cómo controlan la carga electrostática que genera el llenado y el vaciado de material a granel.
QUÉ COMPONER: Cuatro bolsones en fila, idénticos en forma y distintos en su tratamiento de la carga: uno liso, uno con paños de tejido de baja tensión, uno con hilos conductores y su cable a tierra conectado, uno con tejido disipativo sin cable. La diferencia debe estar en el tejido y en la presencia o ausencia del cable.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 76. `/images/glosario/tipo-electrostatico-fibc-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/tipo-electrostatico-fibc-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/tipo-electrostatico-fibc.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/tipo-electrostatico-fibc |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Tipos electrostáticos de FIBC (A, B, C y D)
QUÉ SIGNIFICA: Clasificación de los big bags según cómo controlan la carga electrostática que genera el llenado y el vaciado de material a granel.
QUÉ COMPONER: Cuatro bolsones en fila, idénticos en forma y distintos en su tratamiento de la carga: uno liso, uno con paños de tejido de baja tensión, uno con hilos conductores y su cable a tierra conectado, uno con tejido disipativo sin cable. La diferencia debe estar en el tejido y en la presencia o ausencia del cable.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 77. `/images/glosario/ventilacion-aspirante-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ventilacion-aspirante-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ventilacion-aspirante.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ventilacion-aspirante |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ventilación aspirante
QUÉ SIGNIFICA: Configuración en la que el ventilador extrae aire desde el frente de trabajo, de modo que la manga trabaja a presión negativa y tiende a colapsar.
QUÉ COMPONER: Corte de labor: la manga succiona desde el frente y la sección del ducto tiende a cerrarse por la depresión. Las flechas van en sentido contrario al caso impelente.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 78. `/images/glosario/ventilacion-aspirante-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ventilacion-aspirante-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ventilacion-aspirante.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ventilacion-aspirante |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ventilación aspirante
QUÉ SIGNIFICA: Configuración en la que el ventilador extrae aire desde el frente de trabajo, de modo que la manga trabaja a presión negativa y tiende a colapsar.
QUÉ COMPONER: Corte de labor: la manga succiona desde el frente y la sección del ducto tiende a cerrarse por la depresión. Las flechas van en sentido contrario al caso impelente.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 79. `/images/glosario/ventilacion-impelente-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ventilacion-impelente-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ventilacion-impelente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ventilacion-impelente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ventilación impelente
QUÉ SIGNIFICA: Configuración en la que el ventilador empuja aire limpio hacia el frente de trabajo, de modo que la manga trabaja a presión positiva.
QUÉ COMPONER: Corte de labor: el ventilador empuja aire por la manga hasta el frente; el aire limpio barre el frente y retorna por la labor. Las flechas de ida van dentro de la manga y las de retorno por fuera.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 80. `/images/glosario/ventilacion-impelente-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/ventilacion-impelente-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/ventilacion-impelente.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/ventilacion-impelente |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Ventilación impelente
QUÉ SIGNIFICA: Configuración en la que el ventilador empuja aire limpio hacia el frente de trabajo, de modo que la manga trabaja a presión positiva.
QUÉ COMPONER: Corte de labor: el ventilador empuja aire por la manga hasta el frente; el aire limpio barre el frente y retorna por la labor. Las flechas de ida van dentro de la manga y las de retorno por fuera.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 81. `/images/glosario/zanja-de-anclaje-2.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/zanja-de-anclaje-2.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/zanja-de-anclaje.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/zanja-de-anclaje |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Zanja de anclaje
QUÉ SIGNIFICA: Excavación perimetral donde se aloja y se entierra el borde de un geosintético para fijarlo y transmitir al terreno los esfuerzos que recibe la lámina.
CÓMO SE MIDE: Por profundidad y ancho de la zanja (m) y por su separación respecto de la corona del talud.
QUÉ COMPONER: Corte del borde superior del talud: la excavación perimetral con la lámina bajando dentro, doblada al fondo y cubierta con material compactado. La distancia a la corona del talud debe verse.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 82. `/images/glosario/zanja-de-anclaje-3.png`

| | |
|---|---|
| **Archivo a crear** | `public/images/glosario/zanja-de-anclaje-3.png` |
| **Toma 1 (referencia, ya existe)** | `public/images/glosario/zanja-de-anclaje.png` |
| **Tamaño** | 1200 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Definición en /glosario/zanja-de-anclaje |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TÉRMINO: Zanja de anclaje
QUÉ SIGNIFICA: Excavación perimetral donde se aloja y se entierra el borde de un geosintético para fijarlo y transmitir al terreno los esfuerzos que recibe la lámina.
CÓMO SE MIDE: Por profundidad y ancho de la zanja (m) y por su separación respecto de la corona del talud.
QUÉ COMPONER: Corte del borde superior del talud: la excavación perimetral con la lámina bajando dentro, doblada al fondo y cubierta con material compactado. La distancia a la corona del talud debe verse.
EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. La representación tiene que ser técnicamente correcta: la geometría, las proporciones y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. Un esquema bonito y equivocado hace más daño que ninguno. Proporción 4:3 horizontal.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

