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

3 pendientes de 18.

### 1. `/images/recursos/rfq-manga-ventilacion-minera-datos-completos.webp`

| | |
|---|---|
| **Archivo** | `public/images/recursos/rfq-manga-ventilacion-minera-datos-completos.webp` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/rfq-manga-ventilacion-minera-datos-completos |
| **Texto alternativo** | Apertura de la guía: RFQ de mangas de ventilación minera: los datos que convierten una consulta en una cotización |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: RFQ de mangas de ventilación minera: los datos que convierten una consulta en una cotización
DE QUÉ TRATA: Qué debe traer un pedido de cotización de mangas de ventilación para mina o túnel: diámetro, tramos, régimen, ambiente y accesorios.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 2. `/images/recursos/fibc-factor-seguridad-5-1-vs-6-1.webp`

| | |
|---|---|
| **Archivo** | `public/images/recursos/fibc-factor-seguridad-5-1-vs-6-1.webp` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/fibc-factor-seguridad-5-1-vs-6-1 |
| **Texto alternativo** | Apertura de la guía: Factor de seguridad 5:1 vs 6:1 en big bags: qué significa y cuál pedir |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Factor de seguridad 5:1 vs 6:1 en big bags: qué significa y cuál pedir
DE QUÉ TRATA: El factor de seguridad de un FIBC no es un número de catálogo: 5:1 corresponde a uso único y 6:1 a bolsón multiuso. Cómo decidirlo en el RFQ.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 3. `/images/recursos/medidas-lona-toldo-sider-camion-rfq.webp`

| | |
|---|---|
| **Archivo** | `public/images/recursos/medidas-lona-toldo-sider-camion-rfq.webp` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/medidas-lona-toldo-sider-camion-rfq |
| **Texto alternativo** | Apertura de la guía: Cómo tomar las medidas de una lona, toldo o sider de camión para cotizar sin errores |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Cómo tomar las medidas de una lona, toldo o sider de camión para cotizar sin errores
DE QUÉ TRATA: Largo, ancho, alto útil y sistema de tensado: las medidas que un RFQ de lona o sider de camión debe traer, y los errores de medición que cuestan.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

## Guías de especificación (diagramas)

0 pendientes de 5.

## Geometría de las calculadoras (diagramas)

0 pendientes de 5.

## Errores de compra por sector (diagramas)

0 pendientes de 16.

## Hubs de aplicación

0 pendientes de 8.

## Procesos y flujos del sitio (diagramas)

0 pendientes de 17.

