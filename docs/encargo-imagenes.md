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

6 pendientes de 6.

### 1. `/images/soluciones/poza-revestida-impermeabilizacion.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/poza-revestida-impermeabilizacion.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/poza-revestida-impermeabilizacion |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Poza revestida: el conjunto completo, no solo la lámina |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Poza revestida: el conjunto completo, no solo la lámina.
ESCENARIO: Una poza de proceso, de agua o de almacenamiento que debe contener su contenido durante toda la vida del proyecto, en un terreno que rara vez es el ideal.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. geotextiles — Protección mecánica entre la subrasante y la barrera impermeable.
  2. geomembrana polietileno pe hdpe — Barrera impermeable principal.
  3. geomembranas pvc — Alternativa de barrera cuando la geometría exige mayor flexibilidad.
  4. geocompuestos drenaje — Alivio de presión bajo la lámina y conducción de fluidos.
  5. accesorios instalacion — Fijación, remates y elementos de detalle.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

### 2. `/images/soluciones/frente-avance-ventilado.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/frente-avance-ventilado.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/frente-avance-ventilado |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Frente de avance ventilado: del cálculo de caudal a la manga instalada |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Frente de avance ventilado: del cálculo de caudal a la manga instalada.
ESCENARIO: Una labor ciega en avance, con personal y equipo diésel operando, donde el aire debe llegar al fondo y los gases de voladura evacuarse dentro del ciclo de trabajo.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. mangas ventilacion minas tuneles — Conducción del aire entre el ventilador y el frente.
  2. accesorios instalacion — Suspensión, empalmes y fijación a lo largo de la labor.
  3. lona plastificada rafia polytarp — Cortinas y tabiques de control de flujo cuando el circuito lo requiere.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

### 3. `/images/soluciones/despacho-concentrado-granel.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/despacho-concentrado-granel.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/despacho-concentrado-granel |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Despacho de concentrado a granel: del llenado al puerto |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Despacho de concentrado a granel: del llenado al puerto.
ESCENARIO: Material a granel que sale de operación, pasa por balanza, viaja por carretera y llega a un terminal portuario con requisitos documentales propios.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. big bags bolsones polipropileno — Envase y elemento de izaje del material a granel.
  2. sacos polytarp embarque granel — Alternativa de envase para embarque y estiba.
  3. films termocontraibles shrink — Unitización y protección de la carga paletizada.
  4. mantas cobertores toldos camiones — Contención y protección de la carga durante el transporte.
  5. siders tolderas camiones — Cerramiento lateral de la unidad cuando el tipo de carrocería lo requiere.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

### 4. `/images/soluciones/proteccion-cultivo-agroexportacion.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/proteccion-cultivo-agroexportacion.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/proteccion-cultivo-agroexportacion |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Protección de cultivo: barrera sanitaria, sombra y suelo |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Protección de cultivo: barrera sanitaria, sombra y suelo.
ESCENARIO: Un cultivo de agroexportación que necesita excluir vectores, manejar radiación y conservar humedad, en valles donde la radiación y el viento castigan el material tanto como la plaga.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. mallas antiafidas — Barrera física de exclusión de vectores.
  2. malla raschel sombra — Control de radiación y temperatura de hoja.
  3. malla anti pajaro anti granizo — Protección mecánica frente a fauna y granizo.
  4. mulch madera picada — Cobertura de suelo: retención de humedad y control de malezas.
  5. geotextiles — Separación y control en caminos internos y obras de riego.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

### 5. `/images/soluciones/almacenamiento-agua-operacion-remota.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/almacenamiento-agua-operacion-remota.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/almacenamiento-agua-operacion-remota |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Almacenamiento de agua en operación remota |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Almacenamiento de agua en operación remota.
ESCENARIO: Un frente de trabajo remoto que necesita almacenar y distribuir agua sin obra civil, sin grúa y con logística de acceso limitada.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. tanques flexibles bladders — Almacenamiento desplegable sin obra civil.
  2. tuberias hdpe — Conducción entre almacenamiento y punto de uso.
  3. geomembrana polietileno pe hdpe — Contención secundaria o revestimiento de la zona de apoyo cuando el contenido lo exige.
  4. geotextiles — Protección de la base contra material anguloso.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

### 6. `/images/soluciones/campamento-almacen-temporal.png`

| | |
|---|---|
| **Archivo** | `public/images/soluciones/campamento-almacen-temporal.png` |
| **Tamaño** | 1600 × 900 px |
| **Tipo** | diagrama |
| **Dónde se usa** | Encabezado de /soluciones/campamento-almacen-temporal |
| **Texto alternativo** | Esquema de la arquitectura de referencia: Campamento y almacén temporal: cubrir, cerrar y proteger |

**Prompt:**

```
Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.

TEMA: corte o vista isométrica de esta configuración: Campamento y almacén temporal: cubrir, cerrar y proteger.
ESCENARIO: Una faena que necesita cubrir superficie, almacenar material y habilitar puestos de trabajo con estructuras que se montan y, muchas veces, se desmontan al terminar la campaña.
COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:
  1. carpas lona estructuras metalicas — Cobertura principal de superficie.
  2. modulos albergues campamentos — Módulos habilitados para uso de personal o almacenamiento.
  3. toldos cerramientos — Cerramientos laterales y control de ingreso de viento y lluvia.
  4. lona plastificada rafia polytarp — Cobertura de material acopiado y protección temporal.
  5. biombos protectores soldadura — Protección colectiva en puestos de trabajo con soldadura.
IMPORTANTE: la posición de cada capa debe ser técnicamente correcta; el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.
```

---

## Portadas de familia

11 pendientes de 11.

### 7. `/images/familias/envases-embalaje.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/envases-embalaje.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/envases-embalaje |
| **Texto alternativo** | Envases y Embalaje: Big Bags, sacos, bolsas y films |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Envases y Embalaje". Big Bags, sacos, bolsas y films
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Big Bags / Bolsones de Polipropileno; Sacos Polytarp para Embarque a Granel; Bolsas y Láminas de Polietileno PEBD / PEAD; Films Termocontraíbles (Shrink) y Mangas PE.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 8. `/images/familias/lonas-cobertores.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/lonas-cobertores.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/lonas-cobertores |
| **Texto alternativo** | Lonas y Cobertores: Confección textil 100% a medida |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Lonas y Cobertores". Confección textil 100% a medida
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Lona Plastificada, Rafia y Polytarp a Medida; Mantas Cobertores y Toldos para Camiones; Siders y Tolderas para Camiones; Cobertores Multimaterial (Polytarp, PE, Raschel, Térmico, PP).
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 9. `/images/familias/estructuras-arquitectura-textil.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/estructuras-arquitectura-textil.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/estructuras-arquitectura-textil |
| **Texto alternativo** | Estructuras y Arquitectura Textil: Carpas, tensadas, módulos e invernaderos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Estructuras y Arquitectura Textil". Carpas, tensadas, módulos e invernaderos
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Carpas de Lona Plástica con Estructuras Metálicas; Coberturas Tensionadas y Arquitectura Textil; Coberturas y Estructuras Inflables; Módulos y Albergues para Campamentos.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 10. `/images/familias/mallas-agricolas.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/mallas-agricolas.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/mallas-agricolas |
| **Texto alternativo** | Mallas y Coberturas Agrícolas: Antiáfidas, Raschel y protección de cultivo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Mallas y Coberturas Agrícolas". Antiáfidas, Raschel y protección de cultivo
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Mallas Antiáfidas para Protección de Cultivos; Malla Raschel y Malla Sombra; Malla Anti-Pájaro y Anti-Granizo.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 11. `/images/familias/ventilacion-industrial.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/ventilacion-industrial.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/ventilacion-industrial |
| **Texto alternativo** | Ventilación Industrial: Mangas para minas y túneles |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Ventilación Industrial". Mangas para minas y túneles
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Mangas de Ventilación para Minas y Túneles.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 12. `/images/familias/geosinteticos.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/geosinteticos.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/geosinteticos |
| **Texto alternativo** | Geosintéticos e Impermeabilización: Geomembranas, geotextiles y geomallas |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Geosintéticos e Impermeabilización". Geomembranas, geotextiles y geomallas
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Geomembranas de PVC; Geomembrana de Polietileno (PE / HDPE); Geomembrana de PE Fortificada (Reforzada); Geomembrana Bituminosa.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 13. `/images/familias/ambientales-fluidos.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/ambientales-fluidos.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/ambientales-fluidos |
| **Texto alternativo** | Soluciones Ambientales y Fluidos: Tanques, biodigestores y tuberías HDPE |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Soluciones Ambientales y Fluidos". Tanques, biodigestores y tuberías HDPE
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Tanques Flexibles (Bladders); Biodigestores para Tratamiento de Residuos; Tuberías HDPE y Accesorios.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 14. `/images/familias/seguridad-industrial.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/seguridad-industrial.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/seguridad-industrial |
| **Texto alternativo** | Protección y Seguridad Industrial: Biombos y protección de taller |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Protección y Seguridad Industrial". Biombos y protección de taller
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Biombos Protectores para Talleres de Soldadura; Barreras Acústicas / Cortinas Antirruido.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 15. `/images/familias/accesorios.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/accesorios.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/accesorios |
| **Texto alternativo** | Accesorios y Complementos: Ojalillos, sogas, tensores y tubos |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Accesorios y Complementos". Ojalillos, sogas, tensores y tubos
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Accesorios de Instalación (Ojalillos, Sogas, Tensores, Tubos).
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 16. `/images/familias/publicidad.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/publicidad.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/publicidad |
| **Texto alternativo** | Publicidad y Comunicación Visual: Gigantografías y rotulado de flota |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Publicidad y Comunicación Visual". Gigantografías y rotulado de flota
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Gigantografías, Letreros y Señalética; Revestimiento Vehicular y Toldos Publicitarios.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

### 17. `/images/familias/especialidades.jpg`

| | |
|---|---|
| **Archivo** | `public/images/familias/especialidades.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Portada de /productos/familia/especialidades |
| **Texto alternativo** | Especialidades: Mulch y valor agregado |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.

TEMA: familia de producto "Especialidades". Mulch y valor agregado
DEBE SUGERIR EL CONJUNTO, no un solo artículo: Mulch de Madera Picada.
ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.
```

---

## Términos del glosario (diagramas)

0 pendientes de 41.

## Encabezados de guía

10 pendientes de 10.

### 18. `/images/recursos/big-bags-mineria-peru-normativa-errores-estiba.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/big-bags-mineria-peru-normativa-errores-estiba.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/big-bags-mineria-peru-normativa-errores-estiba |
| **Texto alternativo** | Apertura de la guía: Big Bags para minería en el Perú: qué exige la normativa y los 7 errores de estiba que rompen bolsones |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Big Bags para minería en el Perú: qué exige la normativa y los 7 errores de estiba que rompen bolsones
DE QUÉ TRATA: Factor de seguridad 5:1 vs 6:1, la exigencia de certificación ISO 21898:2004 en el Puerto del Callao desde 2023, y los siete errores de manipulación y estiba que causan la mayoría de las roturas de big bags en operaciones mineras peruanas.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 19. `/images/recursos/instalacion-geomembranas-hdpe-pozas-canales.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/instalacion-geomembranas-hdpe-pozas-canales.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/instalacion-geomembranas-hdpe-pozas-canales |
| **Texto alternativo** | Apertura de la guía: Instalación de geomembranas HDPE en pozas y canales: secuencia, ensayos de soldadura y los fallos que aparecen recién… |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Instalación de geomembranas HDPE en pozas y canales: secuencia, ensayos de soldadura y los fallos que aparecen recién a los seis meses
DE QUÉ TRATA: Preparación de subrasante, zanja de anclaje, soldadura por cuña caliente y extrusión, ensayos no destructivos (caja de vacío ASTM D5641 y presión de aire en costura doble) y los errores de instalación que provocan filtraciones meses después de la entrega.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 20. `/images/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/calculo-caudal-mangas-ventilacion-mina-subterranea |
| **Texto alternativo** | Apertura de la guía: Cálculo de caudal para mangas de ventilación en mina subterránea: método, corrección por altitud y por qué su manga e… |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Cálculo de caudal para mangas de ventilación en mina subterránea: método, corrección por altitud y por qué su manga entrega menos aire del que promete
DE QUÉ TRATA: Requerimiento de aire por persona y por HP diésel, corrección por altitud sobre los 1500, 3000 y 4000 msnm, pérdidas por fricción y por fugas en la manga, y cómo dimensionar diámetro y tramo para que el aire llegue al frente.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 21. `/images/recursos/ventilacion-impelente-vs-aspirante-labores-mineras.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/ventilacion-impelente-vs-aspirante-labores-mineras.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/ventilacion-impelente-vs-aspirante-labores-mineras |
| **Texto alternativo** | Apertura de la guía: Impelente o aspirante: cómo elegir el sistema de ventilación auxiliar de una labor y qué manga exige cada uno |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Impelente o aspirante: cómo elegir el sistema de ventilación auxiliar de una labor y qué manga exige cada uno
DE QUÉ TRATA: Diferencias reales entre ventilación impelente, aspirante y mixta en labores ciegas: tiempo de reingreso tras voladura, control de polvo, distancia de la manga al frente y por qué la manga aspirante exige refuerzo antic colapso.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 22. `/images/recursos/como-elegir-geotextil-separacion-drenaje-refuerzo.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/como-elegir-geotextil-separacion-drenaje-refuerzo.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/como-elegir-geotextil-separacion-drenaje-refuerzo |
| **Texto alternativo** | Apertura de la guía: Cómo elegir un geotextil: separación, filtración, drenaje o refuerzo, y por qué el gramaje solo no alcanza |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Cómo elegir un geotextil: separación, filtración, drenaje o refuerzo, y por qué el gramaje solo no alcanza
DE QUÉ TRATA: Las cuatro funciones del geotextil, por qué comprar por gramaje es la forma más común de equivocarse, qué propiedades exige AASHTO M288 según la severidad de la obra y cómo evitar la colmatación del filtro.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 23. `/images/recursos/mallas-antiafidas-densidad-trama-ventilacion.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/mallas-antiafidas-densidad-trama-ventilacion.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/mallas-antiafidas-densidad-trama-ventilacion |
| **Texto alternativo** | Apertura de la guía: Mallas antiáfidas: cómo elegir la densidad de trama sin asfixiar el cultivo |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Mallas antiáfidas: cómo elegir la densidad de trama sin asfixiar el cultivo
DE QUÉ TRATA: Qué plaga excluye cada densidad de trama, por qué excluir trips puede exigir varias veces más superficie de malla para mantener la ventilación, y cómo decidir entre exclusión total y manejo integrado en valles peruanos.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 24. `/images/recursos/carpas-industriales-carga-viento-norma-e020.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/carpas-industriales-carga-viento-norma-e020.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/carpas-industriales-carga-viento-norma-e020 |
| **Texto alternativo** | Apertura de la guía: Carpas y coberturas textiles: cómo se calcula la carga de viento en el Perú según la Norma E.020 |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Carpas y coberturas textiles: cómo se calcula la carga de viento en el Perú según la Norma E.020
DE QUÉ TRATA: Velocidad de diseño según altura, presión de viento, factores de forma para superficies inclinadas y cubiertas curvas, y por qué la succión —no la presión— es la que arranca las coberturas textiles.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 25. `/images/recursos/cobertores-transporte-concentrado-mineral.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/cobertores-transporte-concentrado-mineral.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/cobertores-transporte-concentrado-mineral |
| **Texto alternativo** | Apertura de la guía: Cobertores para transporte de concentrado: contención, amarre y el error de comprar por metro cuadrado |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Cobertores para transporte de concentrado: contención, amarre y el error de comprar por metro cuadrado
DE QUÉ TRATA: Qué exige el transporte de concentrados por carretera en el Perú, por qué el cobertor es un elemento de contención y no solo una tapa, y cómo se especifica el amarre para que resista viento a velocidad de ruta.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 26. `/images/recursos/tanques-flexibles-almacenamiento-agua-operaciones-remotas.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/tanques-flexibles-almacenamiento-agua-operaciones-remotas.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/tanques-flexibles-almacenamiento-agua-operaciones-remotas |
| **Texto alternativo** | Apertura de la guía: Tanques flexibles para agua en operaciones remotas: base, volumen útil y la pregunta del agua potable |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Tanques flexibles para agua en operaciones remotas: base, volumen útil y la pregunta del agua potable
DE QUÉ TRATA: Cómo dimensionar un tanque flexible, por qué la preparación de la base decide su vida útil, y qué preguntar sobre certificación de materiales cuando el contenido es agua para consumo humano.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

### 27. `/images/recursos/mulch-madera-espesor-calculo-cobertura-suelo.jpg`

| | |
|---|---|
| **Archivo** | `public/images/recursos/mulch-madera-espesor-calculo-cobertura-suelo.jpg` |
| **Tamaño** | 1920 × 1080 px |
| **Tipo** | ilustracion |
| **Dónde se usa** | Encabezado de /recursos/mulch-madera-espesor-calculo-cobertura-suelo |
| **Texto alternativo** | Apertura de la guía: Mulch de madera: cómo calcular el volumen y por qué el espesor decide si funciona o no |

**Prompt:**

```
Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. Contexto peruano creíble. Sin personas identificables ni rostros. Sin logotipos, marcas ni texto legible de ningún tipo. Sin marcas de agua. Proporción 16:9 horizontal.

TEMA: Mulch de madera: cómo calcular el volumen y por qué el espesor decide si funciona o no
DE QUÉ TRATA: Fórmula para calcular el volumen de mulch por superficie y espesor, qué rango de espesor recomiendan los servicios de extensión, y los errores de aplicación que anulan el beneficio o dañan la planta.
ENCUADRE: la situación de obra concreta que la guía enseña a resolver, en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.
```

---

