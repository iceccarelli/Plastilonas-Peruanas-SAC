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

## Galerías de producto

144 imágenes publicadas × 2 tomas = 288 encargos.

### 1. `/images/galeria/big-bags-bolsones-polipropileno-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 2. `/images/galeria/big-bags-bolsones-polipropileno-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 3. `/images/galeria/big-bags-bolsones-polipropileno-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 4. `/images/galeria/big-bags-bolsones-polipropileno-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 5. `/images/galeria/big-bags-bolsones-polipropileno-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 6. `/images/galeria/big-bags-bolsones-polipropileno-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 7. `/images/galeria/big-bags-bolsones-polipropileno-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 8. `/images/galeria/big-bags-bolsones-polipropileno-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/big-bags-bolsones-polipropileno-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/big-bags-bolsones-polipropileno-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/big-bags-bolsones-polipropileno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Big Bags / Bolsones de Polipropileno. Contenedores flexibles de alta resistencia para almacenamiento y transporte de materiales a granel de 1 y 2 toneladas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Transporte y almacenamiento de minerales y concentrados mineros; Granos, fertilizantes, semillas y productos agrícolas a granel; Cemento, arena, grava y materiales de construcción.
SECTORES: Minería, Industrial, Agricultura, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 9. `/images/galeria/sacos-polytarp-embarque-granel-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 10. `/images/galeria/sacos-polytarp-embarque-granel-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 11. `/images/galeria/sacos-polytarp-embarque-granel-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 12. `/images/galeria/sacos-polytarp-embarque-granel-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 13. `/images/galeria/sacos-polytarp-embarque-granel-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 14. `/images/galeria/sacos-polytarp-embarque-granel-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 15. `/images/galeria/sacos-polytarp-embarque-granel-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 16. `/images/galeria/sacos-polytarp-embarque-granel-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/sacos-polytarp-embarque-granel-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/sacos-polytarp-embarque-granel-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/sacos-polytarp-embarque-granel |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Sacos Polytarp para Embarque a Granel. Sacos de tejido Polytarp impermeable y de alta resistencia para embarque y estiba de carga a granel, con confección reforzada.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Embarque y estiba de carga a granel; Protección de mercadería en tránsito y almacenaje; Cobertura de pallets y unidades de carga.
SECTORES: Transporte, Minería, Agricultura, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 17. `/images/galeria/bolsas-laminas-pebd-pead-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 18. `/images/galeria/bolsas-laminas-pebd-pead-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 19. `/images/galeria/bolsas-laminas-pebd-pead-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 20. `/images/galeria/bolsas-laminas-pebd-pead-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 21. `/images/galeria/bolsas-laminas-pebd-pead-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 22. `/images/galeria/bolsas-laminas-pebd-pead-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 23. `/images/galeria/bolsas-laminas-pebd-pead-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 24. `/images/galeria/bolsas-laminas-pebd-pead-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/bolsas-laminas-pebd-pead-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/bolsas-laminas-pebd-pead-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/bolsas-laminas-pebd-pead |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Bolsas y Láminas de Polietileno PEBD / PEAD. Bolsas y láminas de polietileno PEBD/PEAD 100% virgen en medidas y colores especiales, para embalaje, protección y aplicaciones industriales.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Embalaje y protección de productos industriales; Recubrimiento y separación de materiales; Forrado de contenedores, tolvas y estructuras.
SECTORES: Industrial, Agricultura, Logística, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 25. `/images/galeria/films-termocontraibles-shrink-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 26. `/images/galeria/films-termocontraibles-shrink-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 27. `/images/galeria/films-termocontraibles-shrink-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 28. `/images/galeria/films-termocontraibles-shrink-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 29. `/images/galeria/films-termocontraibles-shrink-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 30. `/images/galeria/films-termocontraibles-shrink-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 31. `/images/galeria/films-termocontraibles-shrink-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 32. `/images/galeria/films-termocontraibles-shrink-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/films-termocontraibles-shrink-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/films-termocontraibles-shrink-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/films-termocontraibles-shrink |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Films Termocontraíbles (Shrink) y Mangas PE. Películas y mangas termocontraíbles de polietileno para embalaje, unitización y protección de cargas paletizadas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Unitización y estabilización de cargas paletizadas; Embalaje de protección contra polvo y humedad; Agrupación de productos para distribución.
SECTORES: Industrial, Logística, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 33. `/images/galeria/lona-plastificada-rafia-polytarp-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 34. `/images/galeria/lona-plastificada-rafia-polytarp-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 35. `/images/galeria/lona-plastificada-rafia-polytarp-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 36. `/images/galeria/lona-plastificada-rafia-polytarp-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 37. `/images/galeria/lona-plastificada-rafia-polytarp-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 38. `/images/galeria/lona-plastificada-rafia-polytarp-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 39. `/images/galeria/lona-plastificada-rafia-polytarp-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 40. `/images/galeria/lona-plastificada-rafia-polytarp-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/lona-plastificada-rafia-polytarp-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/lona-plastificada-rafia-polytarp-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/lona-plastificada-rafia-polytarp |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Lona Plastificada, Rafia y Polytarp a Medida. Soluciones integrales de lonas plastificadas, rafia tejida y polytarp personalizadas para cualquier aplicación industrial, agrícola o de transporte.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cubiertas y fundas a medida para maquinaria y equipos; Toldos y carpas para eventos, comercios y residencias; Cortinas industriales y separadores de ambientes.
SECTORES: Industrial, Construcción, Transporte, Agricultura, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 41. `/images/galeria/mantas-cobertores-toldos-camiones-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 42. `/images/galeria/mantas-cobertores-toldos-camiones-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 43. `/images/galeria/mantas-cobertores-toldos-camiones-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 44. `/images/galeria/mantas-cobertores-toldos-camiones-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 45. `/images/galeria/mantas-cobertores-toldos-camiones-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 46. `/images/galeria/mantas-cobertores-toldos-camiones-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 47. `/images/galeria/mantas-cobertores-toldos-camiones-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 48. `/images/galeria/mantas-cobertores-toldos-camiones-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-cobertores-toldos-camiones-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-cobertores-toldos-camiones-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-cobertores-toldos-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Cobertores y Toldos para Camiones. Mantas de lona cruda, teñida y encerada para camiones, remolques y contenedores. Protección total contra lluvia, sol y polvo en transporte de carga.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Transporte de carga general en camiones y trailers; Transporte de minerales, concentrados y materiales de construcción; Transporte de productos agrícolas (granos, fertilizantes, frutas).
SECTORES: Transporte, Logística, Minería, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 49. `/images/galeria/siders-tolderas-camiones-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 50. `/images/galeria/siders-tolderas-camiones-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 51. `/images/galeria/siders-tolderas-camiones-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 52. `/images/galeria/siders-tolderas-camiones-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 53. `/images/galeria/siders-tolderas-camiones-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 54. `/images/galeria/siders-tolderas-camiones-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 55. `/images/galeria/siders-tolderas-camiones-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 56. `/images/galeria/siders-tolderas-camiones-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/siders-tolderas-camiones-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/siders-tolderas-camiones-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/siders-tolderas-camiones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Siders y Tolderas para Camiones. Siders (cortinas laterales) y tolderas de lona PVC de alta tenacidad para carrocerías, plataformas y furgones, confeccionados a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cortinas laterales para semirremolques y furgones; Tolderas para plataformas y camiones de carga; Renovación y reparación de siders existentes.
SECTORES: Transporte, Logística, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 57. `/images/galeria/cobertores-agricolas-multimaterial-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 58. `/images/galeria/cobertores-agricolas-multimaterial-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 59. `/images/galeria/cobertores-agricolas-multimaterial-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 60. `/images/galeria/cobertores-agricolas-multimaterial-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 61. `/images/galeria/cobertores-agricolas-multimaterial-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 62. `/images/galeria/cobertores-agricolas-multimaterial-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 63. `/images/galeria/cobertores-agricolas-multimaterial-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 64. `/images/galeria/cobertores-agricolas-multimaterial-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/cobertores-agricolas-multimaterial-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/cobertores-agricolas-multimaterial-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/cobertores-agricolas-multimaterial |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP). Línea completa de cobertores en Polytarp, polietileno, Raschel, térmico y polipropileno para protección de cultivos, insumos y mercadería.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de cultivos, camas de siembra y almácigos; Cobertura de insumos, granos y mercadería a la intemperie; Control de sombra, temperatura y helada en campo.
SECTORES: Agricultura, Industrial, Logística.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 65. `/images/galeria/mantas-arpilleras-granjas-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 66. `/images/galeria/mantas-arpilleras-granjas-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 67. `/images/galeria/mantas-arpilleras-granjas-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 68. `/images/galeria/mantas-arpilleras-granjas-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 69. `/images/galeria/mantas-arpilleras-granjas-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 70. `/images/galeria/mantas-arpilleras-granjas-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 71. `/images/galeria/mantas-arpilleras-granjas-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 72. `/images/galeria/mantas-arpilleras-granjas-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-arpilleras-granjas-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-arpilleras-granjas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-arpilleras-granjas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Arpilleras para Granjas. Mantas arpilleras de yute o sintéticas para granjas avícolas y porcinas. Control de temperatura, humedad y protección del suelo.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cama inicial para pollitos de engorde y ponedoras; Protección de suelo en galpones avícolas y porcinos; Cortinas laterales y control de temperatura.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 73. `/images/galeria/mantas-aislantes-termicas-termoacusticas-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 74. `/images/galeria/mantas-aislantes-termicas-termoacusticas-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 75. `/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 76. `/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 77. `/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 78. `/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 79. `/images/galeria/mantas-aislantes-termicas-termoacusticas-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 80. `/images/galeria/mantas-aislantes-termicas-termoacusticas-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mantas-aislantes-termicas-termoacusticas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mantas-aislantes-termicas-termoacusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mantas Aislantes Térmicas y Termoacústicas. Mantas aislantes de alta performance para control térmico y acústico en edificaciones, galpones, contenedores y instalaciones industriales.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Techos y paredes de galpones industriales y agrícolas; Aislamiento de contenedores y módulos habitables; Cámaras frigoríficas y cuartos fríos.
SECTORES: Construcción, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 81. `/images/galeria/carpas-lona-estructuras-metalicas-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 82. `/images/galeria/carpas-lona-estructuras-metalicas-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 83. `/images/galeria/carpas-lona-estructuras-metalicas-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 84. `/images/galeria/carpas-lona-estructuras-metalicas-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 85. `/images/galeria/carpas-lona-estructuras-metalicas-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 86. `/images/galeria/carpas-lona-estructuras-metalicas-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 87. `/images/galeria/carpas-lona-estructuras-metalicas-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 88. `/images/galeria/carpas-lona-estructuras-metalicas-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/carpas-lona-estructuras-metalicas-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/carpas-lona-estructuras-metalicas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/carpas-lona-estructuras-metalicas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Carpas de Lona Plástica con Estructuras Metálicas. Hangares, galpones, almacenes temporales y cubiertas de lona de alta resistencia con estructuras metálicas galvanizadas a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Hangares para maquinaria agrícola, minera y de construcción; Almacenes temporales y galpones para productos a granel; Techos de piscinas, canchas deportivas y patios escolares.
SECTORES: Construcción, Agricultura, Industrial, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 89. `/images/galeria/coberturas-tensionadas-arquitectura-textil-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 90. `/images/galeria/coberturas-tensionadas-arquitectura-textil-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 91. `/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 92. `/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 93. `/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 94. `/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 95. `/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 96. `/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-tensionadas-arquitectura-textil-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-tensionadas-arquitectura-textil |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas Tensionadas y Arquitectura Textil. Cubiertas tensadas de membrana textil para atrios, patios, ingresos, estacionamientos y espacios comerciales, con diseño e instalación a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Sombras de estacionamiento y playas vehiculares; Patios de comida, plazas e ingresos comerciales; Cubiertas de áreas recreativas y deportivas.
SECTORES: Construcción, Comercio, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 97. `/images/galeria/coberturas-inflables-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 98. `/images/galeria/coberturas-inflables-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 99. `/images/galeria/coberturas-inflables-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 100. `/images/galeria/coberturas-inflables-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 101. `/images/galeria/coberturas-inflables-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 102. `/images/galeria/coberturas-inflables-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 103. `/images/galeria/coberturas-inflables-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 104. `/images/galeria/coberturas-inflables-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/coberturas-inflables-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/coberturas-inflables-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/coberturas-inflables |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Coberturas y Estructuras Inflables. Estructuras inflables de membrana para almacenamiento, espacios temporales y protección, con sistema de presión de aire.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Almacenamiento y coberturas temporales; Coberturas deportivas y recreativas; Espacios de evento y exhibición.
SECTORES: Industrial, Comercio, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 105. `/images/galeria/modulos-albergues-campamentos-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 106. `/images/galeria/modulos-albergues-campamentos-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 107. `/images/galeria/modulos-albergues-campamentos-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 108. `/images/galeria/modulos-albergues-campamentos-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 109. `/images/galeria/modulos-albergues-campamentos-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 110. `/images/galeria/modulos-albergues-campamentos-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 111. `/images/galeria/modulos-albergues-campamentos-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 112. `/images/galeria/modulos-albergues-campamentos-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/modulos-albergues-campamentos-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/modulos-albergues-campamentos-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/modulos-albergues-campamentos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Módulos y Albergues para Campamentos. Módulos estructurados, tiendas de campaña y albergues para campamentos mineros y obras remotas, con lona técnica y estructura desmontable.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Campamentos mineros y de exploración; Obras de construcción e infraestructura remota; Albergues temporales y de emergencia.
SECTORES: Minería, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 113. `/images/galeria/galpones-invernaderos-estructurados-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 114. `/images/galeria/galpones-invernaderos-estructurados-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 115. `/images/galeria/galpones-invernaderos-estructurados-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 116. `/images/galeria/galpones-invernaderos-estructurados-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 117. `/images/galeria/galpones-invernaderos-estructurados-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 118. `/images/galeria/galpones-invernaderos-estructurados-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 119. `/images/galeria/galpones-invernaderos-estructurados-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 120. `/images/galeria/galpones-invernaderos-estructurados-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/galpones-invernaderos-estructurados-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/galpones-invernaderos-estructurados-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/galpones-invernaderos-estructurados |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Galpones, Techos Ligeros e Invernaderos Estructurados. Galpones, techos ligeros e invernaderos estructurados a medida para agricultura protegida, almacenamiento y producción.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Invernaderos para hortalizas, berries y flores; Galpones y techos ligeros para almacenamiento; Viveros y producción de plántulas.
SECTORES: Agricultura, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 121. `/images/galeria/toldos-cerramientos-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 122. `/images/galeria/toldos-cerramientos-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 123. `/images/galeria/toldos-cerramientos-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 124. `/images/galeria/toldos-cerramientos-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 125. `/images/galeria/toldos-cerramientos-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 126. `/images/galeria/toldos-cerramientos-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 127. `/images/galeria/toldos-cerramientos-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 128. `/images/galeria/toldos-cerramientos-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/toldos-cerramientos-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/toldos-cerramientos-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/toldos-cerramientos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Toldos, Cerramientos y Cortinas Industriales. Toldos decorativos y comerciales, cerramientos de lona y cortinas industriales para delimitar, proteger y ambientar espacios.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Toldos para comercios, restaurantes y viviendas; Cerramientos de ambientes y accesos; Cortinas industriales y separadores de nave.
SECTORES: Comercio, Industrial, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 129. `/images/galeria/mallas-antiafidas-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 130. `/images/galeria/mallas-antiafidas-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 131. `/images/galeria/mallas-antiafidas-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 132. `/images/galeria/mallas-antiafidas-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 133. `/images/galeria/mallas-antiafidas-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 134. `/images/galeria/mallas-antiafidas-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 135. `/images/galeria/mallas-antiafidas-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 136. `/images/galeria/mallas-antiafidas-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mallas-antiafidas-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mallas-antiafidas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mallas-antiafidas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mallas Antiáfidas para Protección de Cultivos. Mallas antiáfidas de alta densidad para protección de cultivos contra insectos, pájaros y condiciones climáticas adversas. Ideales para agricultura protegida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de cultivos de hortalizas (tomate, pimiento, lechuga, etc.); Cultivo de berries, uvas y frutales; Invernaderos y túneles de producción.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 137. `/images/galeria/malla-raschel-sombra-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 138. `/images/galeria/malla-raschel-sombra-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 139. `/images/galeria/malla-raschel-sombra-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 140. `/images/galeria/malla-raschel-sombra-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 141. `/images/galeria/malla-raschel-sombra-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 142. `/images/galeria/malla-raschel-sombra-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 143. `/images/galeria/malla-raschel-sombra-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 144. `/images/galeria/malla-raschel-sombra-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-raschel-sombra-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-raschel-sombra-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-raschel-sombra |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Raschel y Malla Sombra. Mallas Raschel de distintos porcentajes de sombra para control de luz, temperatura y viento en cultivos, viveros y espacios.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Sombra para viveros y cultivos sensibles; Cercos, delimitación y control de viento; Sombras de estacionamiento y áreas comunes.
SECTORES: Agricultura, Construcción, Comercio.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 145. `/images/galeria/malla-anti-pajaro-anti-granizo-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 146. `/images/galeria/malla-anti-pajaro-anti-granizo-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 147. `/images/galeria/malla-anti-pajaro-anti-granizo-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 148. `/images/galeria/malla-anti-pajaro-anti-granizo-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 149. `/images/galeria/malla-anti-pajaro-anti-granizo-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 150. `/images/galeria/malla-anti-pajaro-anti-granizo-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 151. `/images/galeria/malla-anti-pajaro-anti-granizo-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 152. `/images/galeria/malla-anti-pajaro-anti-granizo-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/malla-anti-pajaro-anti-granizo-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/malla-anti-pajaro-anti-granizo-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/malla-anti-pajaro-anti-granizo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Malla Anti-Pájaro y Anti-Granizo. Mallas de protección anti-pájaro y anti-granizo para frutales y cultivos de alto valor, con confección a medida del huerto.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Protección de frutales y viñedos; Cultivos de alto valor y berries; Reducción de pérdidas por aves y granizo.
SECTORES: Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 153. `/images/galeria/mangas-ventilacion-minas-tuneles-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 154. `/images/galeria/mangas-ventilacion-minas-tuneles-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 155. `/images/galeria/mangas-ventilacion-minas-tuneles-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 156. `/images/galeria/mangas-ventilacion-minas-tuneles-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 157. `/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 158. `/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 159. `/images/galeria/mangas-ventilacion-minas-tuneles-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 160. `/images/galeria/mangas-ventilacion-minas-tuneles-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mangas-ventilacion-minas-tuneles-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mangas-ventilacion-minas-tuneles-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mangas-ventilacion-minas-tuneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mangas de Ventilación para Minas y Túneles. Sistemas de ventilación flexible de alta resistencia para minas subterráneas, túneles y obras de infraestructura. Fabricación a medida.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Ventilación principal y auxiliar en minas subterráneas; Túneles carreteros, ferroviarios y de metro; Obras de infraestructura subterránea.
SECTORES: Minería, Construcción.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 161. `/images/galeria/geomembranas-pvc-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembranas-pvc-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembranas-pvc-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembranas-pvc |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembranas de PVC. Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Pozas de relave y contención minera; Canales de riego y reservorios agrícolas; Lagunas de tratamiento de aguas residuales.
SECTORES: Minería, Agricultura, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 162. `/images/galeria/geomembranas-pvc-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembranas-pvc-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembranas-pvc-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembranas-pvc |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembranas de PVC. Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Pozas de relave y contención minera; Canales de riego y reservorios agrícolas; Lagunas de tratamiento de aguas residuales.
SECTORES: Minería, Agricultura, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 163. `/images/galeria/geomembranas-pvc-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembranas-pvc-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembranas-pvc-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembranas-pvc |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembranas de PVC. Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Pozas de relave y contención minera; Canales de riego y reservorios agrícolas; Lagunas de tratamiento de aguas residuales.
SECTORES: Minería, Agricultura, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 164. `/images/galeria/geomembranas-pvc-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembranas-pvc-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembranas-pvc-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembranas-pvc |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembranas de PVC. Geomembranas de PVC de alta calidad para impermeabilización de pozas, canales de riego, subsuelos y obras hidráulicas. Soldadas por alta frecuencia.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Pozas de relave y contención minera; Canales de riego y reservorios agrícolas; Lagunas de tratamiento de aguas residuales.
SECTORES: Minería, Agricultura, Construcción, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 165. `/images/galeria/geomembrana-polietileno-pe-hdpe-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 166. `/images/galeria/geomembrana-polietileno-pe-hdpe-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 167. `/images/galeria/geomembrana-polietileno-pe-hdpe-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 168. `/images/galeria/geomembrana-polietileno-pe-hdpe-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 169. `/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 170. `/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 171. `/images/galeria/geomembrana-polietileno-pe-hdpe-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 172. `/images/galeria/geomembrana-polietileno-pe-hdpe-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-polietileno-pe-hdpe-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-polietileno-pe-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de Polietileno (PE / HDPE). Geomembrana de polietileno de alta densidad para impermeabilización de pozas, rellenos y obras hidráulicas de gran exigencia química y mecánica.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Pozas de proceso y relave en minería; Rellenos sanitarios y de seguridad; Reservorios y lagunas de tratamiento.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 173. `/images/galeria/geomembrana-pe-fortificada-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 174. `/images/galeria/geomembrana-pe-fortificada-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 175. `/images/galeria/geomembrana-pe-fortificada-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 176. `/images/galeria/geomembrana-pe-fortificada-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 177. `/images/galeria/geomembrana-pe-fortificada-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 178. `/images/galeria/geomembrana-pe-fortificada-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 179. `/images/galeria/geomembrana-pe-fortificada-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 180. `/images/galeria/geomembrana-pe-fortificada-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-pe-fortificada-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-pe-fortificada-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-pe-fortificada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana de PE Fortificada (Reforzada). Geomembrana de polietileno reforzada con inserto de refuerzo para mayor resistencia mecánica en condiciones exigentes.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cubiertas flotantes y coberturas expuestas; Aplicaciones con alto riesgo de punzonamiento; Obras temporales de impermeabilización.
SECTORES: Minería, Construcción, Infraestructura, Energía.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 181. `/images/galeria/geomembrana-bituminosa-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 182. `/images/galeria/geomembrana-bituminosa-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 183. `/images/galeria/geomembrana-bituminosa-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 184. `/images/galeria/geomembrana-bituminosa-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 185. `/images/galeria/geomembrana-bituminosa-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 186. `/images/galeria/geomembrana-bituminosa-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 187. `/images/galeria/geomembrana-bituminosa-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 188. `/images/galeria/geomembrana-bituminosa-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomembrana-bituminosa-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomembrana-bituminosa-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomembrana-bituminosa |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomembrana Bituminosa. Geomembrana bituminosa para impermeabilización de obras civiles e hidráulicas, con buena adaptación al terreno.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Impermeabilización de túneles y obras subterráneas; Canales y estructuras hidráulicas; Obras civiles de infraestructura.
SECTORES: Infraestructura, Construcción, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 189. `/images/galeria/geotextiles-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 190. `/images/galeria/geotextiles-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 191. `/images/galeria/geotextiles-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 192. `/images/galeria/geotextiles-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 193. `/images/galeria/geotextiles-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 194. `/images/galeria/geotextiles-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 195. `/images/galeria/geotextiles-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 196. `/images/galeria/geotextiles-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geotextiles-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geotextiles-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geotextiles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geotextiles (Tejidos y No Tejidos). Geotextiles tejidos y no tejidos para separación, filtración, drenaje, refuerzo y protección de geomembranas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Separación de capas en terraplenes y vías; Filtración y drenaje en obras de tierra; Protección de geomembranas.
SECTORES: Construcción, Minería, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 197. `/images/galeria/geomallas-geogrids-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 198. `/images/galeria/geomallas-geogrids-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 199. `/images/galeria/geomallas-geogrids-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 200. `/images/galeria/geomallas-geogrids-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 201. `/images/galeria/geomallas-geogrids-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 202. `/images/galeria/geomallas-geogrids-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 203. `/images/galeria/geomallas-geogrids-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 204. `/images/galeria/geomallas-geogrids-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geomallas-geogrids-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geomallas-geogrids-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geomallas-geogrids |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geomallas (Geogrids) para Estabilización de Suelos. Geomallas uniaxiales y biaxiales para refuerzo y estabilización de suelos, taludes, bases de vías y plataformas.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Bases y sub-bases de carreteras y plataformas; Muros de suelo reforzado; Estabilización de taludes.
SECTORES: Construcción, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 205. `/images/galeria/tanques-flexibles-bladders-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 206. `/images/galeria/tanques-flexibles-bladders-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 207. `/images/galeria/tanques-flexibles-bladders-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 208. `/images/galeria/tanques-flexibles-bladders-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 209. `/images/galeria/tanques-flexibles-bladders-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 210. `/images/galeria/tanques-flexibles-bladders-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 211. `/images/galeria/tanques-flexibles-bladders-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 212. `/images/galeria/tanques-flexibles-bladders-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tanques-flexibles-bladders-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tanques-flexibles-bladders-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tanques-flexibles-bladders |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tanques Flexibles (Bladders). Tanques flexibles plegables para almacenamiento de agua, efluentes y líquidos, de fácil transporte e instalación.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Reserva de agua para riego y ganadería; Almacenamiento de efluentes y contingencia; Agua para campamentos y obras remotas.
SECTORES: Agricultura, Industrial, Minería, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 213. `/images/galeria/biodigestores-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 214. `/images/galeria/biodigestores-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 215. `/images/galeria/biodigestores-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 216. `/images/galeria/biodigestores-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 217. `/images/galeria/biodigestores-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 218. `/images/galeria/biodigestores-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 219. `/images/galeria/biodigestores-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 220. `/images/galeria/biodigestores-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biodigestores-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biodigestores-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biodigestores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biodigestores para Tratamiento de Residuos. Biodigestores para tratamiento de residuos orgánicos y generación de biogás, mediante aliado técnico especializado.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Tratamiento de residuos ganaderos y agroindustriales; Generación de biogás para autoconsumo; Gestión ambiental de efluentes orgánicos.
SECTORES: Agricultura, Industrial, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 221. `/images/galeria/tuberias-hdpe-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 222. `/images/galeria/tuberias-hdpe-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 223. `/images/galeria/tuberias-hdpe-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 224. `/images/galeria/tuberias-hdpe-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 225. `/images/galeria/tuberias-hdpe-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 226. `/images/galeria/tuberias-hdpe-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 227. `/images/galeria/tuberias-hdpe-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 228. `/images/galeria/tuberias-hdpe-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/tuberias-hdpe-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/tuberias-hdpe-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/tuberias-hdpe |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Tuberías HDPE y Accesorios. Tuberías de polietileno de alta densidad y accesorios para conducción de agua, relaves y fluidos, con termofusión.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Conducción de agua y riego presurizado; Transporte de relaves y fluidos mineros; Redes de saneamiento y drenaje.
SECTORES: Minería, Saneamiento, Agricultura, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 229. `/images/galeria/biombos-protectores-soldadura-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 230. `/images/galeria/biombos-protectores-soldadura-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 231. `/images/galeria/biombos-protectores-soldadura-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 232. `/images/galeria/biombos-protectores-soldadura-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 233. `/images/galeria/biombos-protectores-soldadura-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 234. `/images/galeria/biombos-protectores-soldadura-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 235. `/images/galeria/biombos-protectores-soldadura-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 236. `/images/galeria/biombos-protectores-soldadura-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/biombos-protectores-soldadura-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/biombos-protectores-soldadura-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/biombos-protectores-soldadura |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Biombos Protectores para Talleres de Soldadura. Biombos portátiles y fijos de lona ignífuga para protección contra chispas, radiación UV y proyecciones en trabajos de soldadura.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Talleres de soldadura y fabricación metálica; Mantenimiento industrial en minas y plantas; Construcción y obras civiles.
SECTORES: Industrial, Construcción, Minería.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 237. `/images/galeria/accesorios-instalacion-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 238. `/images/galeria/accesorios-instalacion-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 239. `/images/galeria/accesorios-instalacion-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 240. `/images/galeria/accesorios-instalacion-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 241. `/images/galeria/accesorios-instalacion-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 242. `/images/galeria/accesorios-instalacion-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 243. `/images/galeria/accesorios-instalacion-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 244. `/images/galeria/accesorios-instalacion-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/accesorios-instalacion-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/accesorios-instalacion-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/accesorios-instalacion |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos). Ojalillos metálicos, sogas (sisal, driza, cabo), tensores, ganchos y tubos: todo lo necesario para instalar lonas, mallas y estructuras.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Instalación y amarre de lonas y coberturas; Montaje de mallas y estructuras temporales; Reposición de herrajes y accesorios.
SECTORES: Industrial, Transporte, Construcción, Agricultura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 245. `/images/galeria/gigantografias-senaletica-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 246. `/images/galeria/gigantografias-senaletica-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 247. `/images/galeria/gigantografias-senaletica-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 248. `/images/galeria/gigantografias-senaletica-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 249. `/images/galeria/gigantografias-senaletica-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 250. `/images/galeria/gigantografias-senaletica-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 251. `/images/galeria/gigantografias-senaletica-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 252. `/images/galeria/gigantografias-senaletica-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/gigantografias-senaletica-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/gigantografias-senaletica-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/gigantografias-senaletica |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Gigantografías, Letreros y Señalética. Impresión de gran formato en lona: gigantografías, letreros, paneles y señalética para exterior e interior.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Gigantografías y fachadas comerciales; Letreros, paneles y señalética; Banners para campañas y eventos.
SECTORES: Comercio, Publicidad, Industrial.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 253. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 254. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 255. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 256. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 257. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 258. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 259. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 260. `/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/revestimiento-vehicular-toldos-publicitarios |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Revestimiento Vehicular y Toldos Publicitarios. Revestimiento (wrap) de vehículos, toldos y kioscos publicitarios personalizados para activación de marca.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Rotulado y wrapping de flotas y vehículos; Toldos publicitarios para comercios; Kioscos y mobiliario de marca.
SECTORES: Comercio, Publicidad, Transporte.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 261. `/images/galeria/mulch-madera-picada-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 262. `/images/galeria/mulch-madera-picada-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 263. `/images/galeria/mulch-madera-picada-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 264. `/images/galeria/mulch-madera-picada-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 265. `/images/galeria/mulch-madera-picada-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 266. `/images/galeria/mulch-madera-picada-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 267. `/images/galeria/mulch-madera-picada-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 268. `/images/galeria/mulch-madera-picada-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/mulch-madera-picada-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/mulch-madera-picada-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/mulch-madera-picada |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Mulch de Madera Picada. Mulch de madera picada de alta calidad para cobertura de suelos, control de malezas, retención de humedad y decoración de jardines y áreas verdes.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cobertura de suelos en cultivos de berries, frutales y hortalizas; Jardines, parques y áreas recreativas; Control de erosión en taludes y proyectos de reforestación.
SECTORES: Agricultura, Construcción, Paisajismo.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 269. `/images/galeria/geocompuestos-drenaje-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 270. `/images/galeria/geocompuestos-drenaje-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 271. `/images/galeria/geocompuestos-drenaje-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 272. `/images/galeria/geocompuestos-drenaje-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 273. `/images/galeria/geocompuestos-drenaje-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 274. `/images/galeria/geocompuestos-drenaje-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 275. `/images/galeria/geocompuestos-drenaje-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 276. `/images/galeria/geocompuestos-drenaje-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/geocompuestos-drenaje-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/geocompuestos-drenaje-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/geocompuestos-drenaje |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Geocompuestos de Drenaje. Geocompuestos drenantes (geored + geotextil) para captación y conducción de fluidos en obras de tierra, muros, rellenos sanitarios y minería.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Drenaje detrás de muros de contención y estructuras enterradas; Sistemas de drenaje en rellenos sanitarios y celdas de residuos; Drenaje de taludes, terraplenes y obras viales.
SECTORES: Minería, Construcción, Infraestructura, Saneamiento.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 277. `/images/galeria/barreras-acusticas-general-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-general-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 278. `/images/galeria/barreras-acusticas-general-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-general-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-general.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: vista general del producto completo en su contexto de uso.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 279. `/images/galeria/barreras-acusticas-detalle-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-detalle-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 280. `/images/galeria/barreras-acusticas-detalle-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-detalle-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-detalle.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión).
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 281. `/images/galeria/barreras-acusticas-instalacion-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-instalacion-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 282. `/images/galeria/barreras-acusticas-instalacion-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-instalacion-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-instalacion.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: el producto durante su instalación o puesta en servicio, mostrando el proceso.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

### 283. `/images/galeria/barreras-acusticas-escala-2.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-escala-2.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: lo único que cambia es dónde está la cámara.
```

---

### 284. `/images/galeria/barreras-acusticas-escala-3.jpg`

| | |
|---|---|
| **Archivo a crear** | `public/images/galeria/barreras-acusticas-escala-3.jpg` |
| **Toma 1 (referencia, ya existe)** | `public/images/galeria/barreras-acusticas-escala.jpg` |
| **Tamaño** | 1920 × 1280 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Galería de /productos/barreras-acusticas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 3:2 horizontal.

TEMA: Barreras Acústicas / Cortinas Antirruido. Barreras y cortinas acústicas de material flexible para atenuar ruido en obras, plantas y equipos, apoyando el cumplimiento ambiental y de seguridad.
ENCUADRE: el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros.
USO REAL: Cerramiento acústico de frentes de obra en zonas urbanas; Encierro de generadores, compresores y equipos ruidosos; Perímetros de plantas industriales y canteras.
SECTORES: Construcción, Industrial, Minería, Infraestructura.
IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; preferir la exactitud del material y su montaje antes que la belleza de la composición.

TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, MISMA paleta y MISMA calidad de luz.
```

---

## Términos del glosario (diagramas)

41 imágenes publicadas × 2 tomas = 82 encargos.

### 285. `/images/glosario/altitud-y-radiacion-2.png`

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

### 286. `/images/glosario/altitud-y-radiacion-3.png`

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

### 287. `/images/glosario/arquitectura-textil-2.png`

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

### 288. `/images/glosario/arquitectura-textil-3.png`

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

### 289. `/images/glosario/big-bag-fibc-2.png`

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

### 290. `/images/glosario/big-bag-fibc-3.png`

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

### 291. `/images/glosario/carga-de-trabajo-segura-2.png`

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

### 292. `/images/glosario/carga-de-trabajo-segura-3.png`

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

### 293. `/images/glosario/carga-de-viento-2.png`

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

### 294. `/images/glosario/carga-de-viento-3.png`

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

### 295. `/images/glosario/caudal-2.png`

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

### 296. `/images/glosario/caudal-3.png`

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

### 297. `/images/glosario/certificado-de-lote-2.png`

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

### 298. `/images/glosario/certificado-de-lote-3.png`

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

### 299. `/images/glosario/denier-2.png`

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

### 300. `/images/glosario/denier-3.png`

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

### 301. `/images/glosario/densidad-aparente-2.png`

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

### 302. `/images/glosario/densidad-aparente-3.png`

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

### 303. `/images/glosario/estabilizacion-uv-2.png`

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

### 304. `/images/glosario/estabilizacion-uv-3.png`

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

### 305. `/images/glosario/factor-de-fuga-2.png`

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

### 306. `/images/glosario/factor-de-fuga-3.png`

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

### 307. `/images/glosario/factor-de-seguridad-2.png`

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

### 308. `/images/glosario/factor-de-seguridad-3.png`

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

### 309. `/images/glosario/geomalla-2.png`

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

### 310. `/images/glosario/geomalla-3.png`

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

### 311. `/images/glosario/geomembrana-2.png`

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

### 312. `/images/glosario/geomembrana-3.png`

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

### 313. `/images/glosario/geosintetico-2.png`

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

### 314. `/images/glosario/geosintetico-3.png`

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

### 315. `/images/glosario/geotextil-2.png`

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

### 316. `/images/glosario/geotextil-3.png`

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

### 317. `/images/glosario/gramaje-2.png`

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

### 318. `/images/glosario/gramaje-3.png`

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

### 319. `/images/glosario/liner-interior-2.png`

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

### 320. `/images/glosario/liner-interior-3.png`

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

### 321. `/images/glosario/lona-plastificada-2.png`

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

### 322. `/images/glosario/lona-plastificada-3.png`

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

### 323. `/images/glosario/malla-antiafida-2.png`

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

### 324. `/images/glosario/malla-antiafida-3.png`

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

### 325. `/images/glosario/malla-raschel-2.png`

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

### 326. `/images/glosario/malla-raschel-3.png`

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

### 327. `/images/glosario/manga-de-ventilacion-2.png`

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

### 328. `/images/glosario/manga-de-ventilacion-3.png`

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

### 329. `/images/glosario/mesh-2.png`

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

### 330. `/images/glosario/mesh-3.png`

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

### 331. `/images/glosario/no-tejido-punzonado-2.png`

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

### 332. `/images/glosario/no-tejido-punzonado-3.png`

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

### 333. `/images/glosario/ojal-2.png`

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

### 334. `/images/glosario/ojal-3.png`

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

### 335. `/images/glosario/perdida-de-carga-2.png`

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

### 336. `/images/glosario/perdida-de-carga-3.png`

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

### 337. `/images/glosario/permitividad-2.png`

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

### 338. `/images/glosario/permitividad-3.png`

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

### 339. `/images/glosario/as-built-2.png`

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

### 340. `/images/glosario/as-built-3.png`

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

### 341. `/images/glosario/hdpe-2.png`

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

### 342. `/images/glosario/hdpe-3.png`

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

### 343. `/images/glosario/porcentaje-de-sombra-2.png`

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

### 344. `/images/glosario/porcentaje-de-sombra-3.png`

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

### 345. `/images/glosario/pretensado-2.png`

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

### 346. `/images/glosario/pretensado-3.png`

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

### 347. `/images/glosario/refuerzo-espiral-2.png`

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

### 348. `/images/glosario/refuerzo-espiral-3.png`

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

### 349. `/images/glosario/resistencia-al-desgarro-2.png`

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

### 350. `/images/glosario/resistencia-al-desgarro-3.png`

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

### 351. `/images/glosario/resistencia-al-punzonamiento-2.png`

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

### 352. `/images/glosario/resistencia-al-punzonamiento-3.png`

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

### 353. `/images/glosario/soldadura-por-cuna-caliente-2.png`

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

### 354. `/images/glosario/soldadura-por-cuna-caliente-3.png`

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

### 355. `/images/glosario/subrasante-2.png`

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

### 356. `/images/glosario/subrasante-3.png`

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

### 357. `/images/glosario/termosellado-2.png`

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

### 358. `/images/glosario/termosellado-3.png`

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

### 359. `/images/glosario/tipo-electrostatico-fibc-2.png`

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

### 360. `/images/glosario/tipo-electrostatico-fibc-3.png`

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

### 361. `/images/glosario/ventilacion-aspirante-2.png`

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

### 362. `/images/glosario/ventilacion-aspirante-3.png`

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

### 363. `/images/glosario/ventilacion-impelente-2.png`

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

### 364. `/images/glosario/ventilacion-impelente-3.png`

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

### 365. `/images/glosario/zanja-de-anclaje-2.png`

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

### 366. `/images/glosario/zanja-de-anclaje-3.png`

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

