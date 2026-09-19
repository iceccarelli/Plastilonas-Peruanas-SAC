# Trilogía fotográfica: 82 tomas nuevas sobre ranuras ya definidas

**Fecha:** 19 de septiembre de 2026 · **Rama:** `feat/trilogia-fotografica-galeria`

## Qué llegó y qué se hizo con ello

Llegaron quince ZIP en la raíz del repositorio: cinco familias visuales
—ventilación minera, lona de producto y detalle, instalación agrícola,
arquitectura textil, y geosintéticos/FIBC/seguridad/flota— cada una en tres
fases. 126 fotografías en total, agrupadas en 42 «tríos»: una toma de
establecimiento (phase1), una de ángulo o acercamiento (phase2) y una de
producto en uso o contacto humano (phase3).

**Ninguna ranura de `product.gallery` cambió.** Las cuatro vistas por
producto —general, detalle, instalación, escala— ya estaban pobladas con
fotografía honesta, y el resolutor de `lib/galeria.ts` admite hasta
`MAX_TOMAS = 4`. El material nuevo entró por tanto como **tomas 2, 3 y 4**
sobre la toma 1 existente. Consecuencias deliberadas:

- Sólo dos ranuras se reordenaron, y con motivo declarado (ver «Las dos
  ranuras unificadas» más abajo): `mangas-ventilacion-minas-tuneles/general`
  y `lona-plastificada-rafia-polytarp/general`. En el resto el diff sólo
  añade: ninguna otra imagen publicada se desplazó ni se renombró.
- `lib/products.ts` **no se tocó**. Ni `image`, ni `gallery`, ni
  `specifications`, ni `sourcing`, ni `availability`. Los sufijos `-2`,
  `-3` y `-4` no aparecen en ninguna galería: el resolutor los encuentra en
  disco, que es justo para lo que existe.
- No se escribió una sola línea de rotación. `ProductGallery` ya apila las
  tomas y `app/globals.css` ya define `.tomas-2`, `.tomas-3` y
  `.tomas-4`; con cuatro tomas la clase pasa sola a `tomas-4`.

Los quince ZIP se retiraron del árbol versionado con `git rm`. La extracción
vivió siempre fuera del repositorio (`/tmp/plastilonas-trilogia/`), así que no
queda ningún `.jpg` suelto ni directorio de extracción dentro del proyecto.

## Sobre el tipo de imagen

`lib/imagenes.ts` **no se modificó**, y conviene decir por qué. Ese registro
no es una lista de archivos publicados: es un generador de encargos derivado de
`lib/products.ts`, y `ranurasProducto()` fija `tipo: 'ilustracion'` para
la ranura, no para el archivo que la ocupa. No existe hoy una entrada por
archivo donde declarar la toma 2 de una vista, y no se inventó una: hacerlo
habría añadido una API nueva a un registro que ninguna página de producto lee.

Lo que sí se hizo es lo que el tipo servía para proteger. Las vistas
`instalacion` y `escala` —las que, sin decir nada, se leen como obra
ejecutada— llevan ahora la leyenda de honestidad bajo la galería, con la misma
redacción que `FotoReferencial`, extraída a `lib/leyendas.ts` para que no
haya dos versiones que envejezcan por separado.

**Ninguna imagen de esta entrega se presenta como obra de Plastilonas Peruanas
SAC.** `lib/projects.ts` no publica ninguna ficha con `verificado: true`, y
esta entrega no cambia eso. Las personas visibles en varias tomas no se
describen como personal de la empresa en ningún texto alternativo ni leyenda.

## Tabla de decisiones

| archivo_origen | fase | slug | vista | toma | ruta_final | tipo | nota de honestidad |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `mangas-ventilacion-minas-tuneles-general-producto.jpg` | phase1 | `mangas-ventilacion-minas-tuneles` | general | **1** | `/images/galeria/mangas-ventilacion-minas-tuneles-general.webp` | foto | Rollo de manga textil flexible naranja sobre fondo neutro. **Promovida a toma 1**: desplaza la ductería metálica rígida que ocupaba la ranura. No hay labor identificada ni obra nominada. |
| `mangas-ventilacion-minas-tuneles-general-producto-02.jpg` | phase2 | `mangas-ventilacion-minas-tuneles` | general | 2 | `/images/galeria/mangas-ventilacion-minas-tuneles-general-2.webp` | foto | Manga flexible de ventilación fotografiada como producto. No hay labor identificada ni obra nominada. |
| `mangas-ventilacion-minas-tuneles-general-producto-03.jpg` | phase3 | `mangas-ventilacion-minas-tuneles` | general | 3 | `/images/galeria/mangas-ventilacion-minas-tuneles-general-3.webp` | foto | Manga flexible de ventilación fotografiada como producto. No hay labor identificada ni obra nominada. |
| `mangas-ventilacion-minas-tuneles-detalle-codo.jpg` | phase1 | `mangas-ventilacion-minas-tuneles` | detalle | 2 | `/images/galeria/mangas-ventilacion-minas-tuneles-detalle-2.webp` | foto | Codo y costura del tramo en taller. La persona que aparece en la toma 4 no se presenta como personal de la empresa. |
| `mangas-ventilacion-minas-tuneles-detalle-codo-02.jpg` | phase2 | `mangas-ventilacion-minas-tuneles` | detalle | 3 | `/images/galeria/mangas-ventilacion-minas-tuneles-detalle-3.webp` | foto | Codo y costura del tramo en taller. La persona que aparece en la toma 4 no se presenta como personal de la empresa. |
| `mangas-ventilacion-minas-tuneles-detalle-codo-03.jpg` | phase3 | `mangas-ventilacion-minas-tuneles` | detalle | 4 | `/images/galeria/mangas-ventilacion-minas-tuneles-detalle-4.webp` | foto | Codo y costura del tramo en taller. La persona que aparece en la toma 4 no se presenta como personal de la empresa. |
| `mangas-ventilacion-minas-tuneles-instalacion-tunel.jpg` | phase1 | `mangas-ventilacion-minas-tuneles` | instalacion | 2 | `/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-2.webp` | foto | Labor subterránea referencial. No corresponde a ninguna obra de lib/projects.ts. |
| `mangas-ventilacion-minas-tuneles-instalacion-tunel-02.jpg` | phase2 | `mangas-ventilacion-minas-tuneles` | instalacion | 3 | `/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-3.webp` | foto | Labor subterránea referencial. No corresponde a ninguna obra de lib/projects.ts. |
| `mangas-ventilacion-minas-tuneles-instalacion-tunel-03.jpg` | phase3 | `mangas-ventilacion-minas-tuneles` | instalacion | 4 | `/images/galeria/mangas-ventilacion-minas-tuneles-instalacion-4.webp` | foto | Labor subterránea referencial. No corresponde a ninguna obra de lib/projects.ts. |
| `mangas-ventilacion-minas-tuneles-escala-taller.jpg` | phase1 | `mangas-ventilacion-minas-tuneles` | escala | 2 | `/images/galeria/mangas-ventilacion-minas-tuneles-escala-2.webp` | foto | Tramo tendido en patio con una persona de referencia de tamaño. Sin atribución de personal. |
| `mangas-ventilacion-minas-tuneles-escala-taller-02.jpg` | phase2 | `mangas-ventilacion-minas-tuneles` | escala | 3 | `/images/galeria/mangas-ventilacion-minas-tuneles-escala-3.webp` | foto | Tramo tendido en patio con una persona de referencia de tamaño. Sin atribución de personal. |
| `mangas-ventilacion-minas-tuneles-escala-taller-03.jpg` | phase3 | `mangas-ventilacion-minas-tuneles` | escala | 4 | `/images/galeria/mangas-ventilacion-minas-tuneles-escala-4.webp` | foto | Tramo tendido en patio con una persona de referencia de tamaño. Sin atribución de personal. |
| `lona-plastificada-rafia-polytarp-general-verde.jpg` | phase1 | `lona-plastificada-rafia-polytarp` | general | **1** | `/images/galeria/lona-plastificada-rafia-polytarp-general.webp` | foto | Lona verde plegada sobre fondo neutro, con ojal y orillo a la vista. **Promovida a toma 1**: desplaza la escena de obra andina que ocupaba la ranura. Fotografía de producto. |
| `lona-plastificada-rafia-polytarp-general-verde-02.jpg` | phase2 | `lona-plastificada-rafia-polytarp` | general | 2 | `/images/galeria/lona-plastificada-rafia-polytarp-general-2.webp` | foto | Lona doblada sobre fondo neutro. Fotografía de producto. |
| `lona-plastificada-rafia-polytarp-general-verde-03.jpg` | phase3 | `lona-plastificada-rafia-polytarp` | general | 3 | `/images/galeria/lona-plastificada-rafia-polytarp-general-3.webp` | foto | Lona doblada sobre fondo neutro. Fotografía de producto. |
| `lona-plastificada-rafia-polytarp-detalle-ojal-plata.jpg` | phase1 | `lona-plastificada-rafia-polytarp` | detalle | 2 | `/images/galeria/lona-plastificada-rafia-polytarp-detalle-2.webp` | foto | Ojal, refuerzo y soga. Fotografía de material. |
| `lona-plastificada-rafia-polytarp-detalle-ojal-plata-02.jpg` | phase2 | `lona-plastificada-rafia-polytarp` | detalle | 3 | `/images/galeria/lona-plastificada-rafia-polytarp-detalle-3.webp` | foto | Ojal, refuerzo y soga. Fotografía de material. |
| `lona-plastificada-rafia-polytarp-detalle-ojal-plata-03.jpg` | phase3 | `lona-plastificada-rafia-polytarp` | detalle | 4 | `/images/galeria/lona-plastificada-rafia-polytarp-detalle-4.webp` | foto | Ojal, refuerzo y soga. Fotografía de material. |
| `lona-plastificada-rafia-polytarp-detalle-colores.jpg` | phase1 | `mantas-cobertores-toldos-camiones` | general | 2 | `/images/galeria/mantas-cobertores-toldos-camiones-general-2.webp` | foto | Cobertores doblados por colores. Fotografía de producto, no de stock disponible. |
| `lona-plastificada-rafia-polytarp-detalle-colores-02.jpg` | phase2 | `mantas-cobertores-toldos-camiones` | general | 3 | `/images/galeria/mantas-cobertores-toldos-camiones-general-3.webp` | foto | Cobertores doblados por colores. Fotografía de producto, no de stock disponible. |
| `lona-plastificada-rafia-polytarp-detalle-colores-03.jpg` | phase3 | `mantas-cobertores-toldos-camiones` | general | 4 | `/images/galeria/mantas-cobertores-toldos-camiones-general-4.webp` | foto | Cobertores doblados por colores. Fotografía de producto, no de stock disponible. |
| `lona-plastificada-rafia-polytarp-instalacion-equipo.jpg` | phase1 | `lona-plastificada-rafia-polytarp` | instalacion | 2 | `/images/galeria/lona-plastificada-rafia-polytarp-instalacion-2.webp` | foto | Equipo cubierto en altura. Escena referencial, no obra nominada. |
| `lona-plastificada-rafia-polytarp-instalacion-equipo-02.jpg` | phase2 | `lona-plastificada-rafia-polytarp` | instalacion | 3 | `/images/galeria/lona-plastificada-rafia-polytarp-instalacion-3.webp` | foto | Equipo cubierto en altura. Escena referencial, no obra nominada. |
| `lona-plastificada-rafia-polytarp-instalacion-equipo-03.jpg` | phase3 | `lona-plastificada-rafia-polytarp` | instalacion | 4 | `/images/galeria/lona-plastificada-rafia-polytarp-instalacion-4.webp` | foto | Equipo cubierto en altura. Escena referencial, no obra nominada. |
| `mantas-cobertores-toldos-instalacion-polytarp.jpg` | phase1 | `mantas-cobertores-toldos-camiones` | instalacion | 2 | `/images/galeria/mantas-cobertores-toldos-camiones-instalacion-2.webp` | foto | Tendido de cobertor sobre carga apilada. Escena referencial; las personas no se presentan como personal de la empresa. |
| `mantas-cobertores-toldos-instalacion-polytarp-02.jpg` | phase2 | `mantas-cobertores-toldos-camiones` | instalacion | 3 | `/images/galeria/mantas-cobertores-toldos-camiones-instalacion-3.webp` | foto | Tendido de cobertor sobre carga apilada. Escena referencial; las personas no se presentan como personal de la empresa. |
| `mantas-cobertores-toldos-instalacion-polytarp-03.jpg` | phase3 | `mantas-cobertores-toldos-camiones` | instalacion | 4 | `/images/galeria/mantas-cobertores-toldos-camiones-instalacion-4.webp` | foto | Tendido de cobertor sobre carga apilada. Escena referencial; las personas no se presentan como personal de la empresa. |
| `cobertores-agricolas-multimaterial-general-monton.jpg` | phase1 | `cobertores-agricolas-multimaterial` | general | 2 | `/images/galeria/cobertores-agricolas-multimaterial-general-2.webp` | foto | Montón cubierto en campo. Escena referencial. |
| `cobertores-agricolas-multimaterial-general-monton-02.jpg` | phase2 | `cobertores-agricolas-multimaterial` | general | 3 | `/images/galeria/cobertores-agricolas-multimaterial-general-3.webp` | foto | Montón cubierto en campo. Escena referencial. |
| `cobertores-agricolas-multimaterial-general-monton-03.jpg` | phase3 | `cobertores-agricolas-multimaterial` | general | 4 | `/images/galeria/cobertores-agricolas-multimaterial-general-4.webp` | foto | Montón cubierto en campo. Escena referencial. |
| `cobertores-agricolas-multimaterial-escala-silos.jpg` | phase1 | `cobertores-agricolas-multimaterial` | escala | 2 | `/images/galeria/cobertores-agricolas-multimaterial-escala-2.webp` | foto | Silobolsas y maquinaria agrícola como referencia de tamaño. Escena referencial. |
| `cobertores-agricolas-multimaterial-escala-silos-02.jpg` | phase2 | `cobertores-agricolas-multimaterial` | escala | 3 | `/images/galeria/cobertores-agricolas-multimaterial-escala-3.webp` | foto | Silobolsas y maquinaria agrícola como referencia de tamaño. Escena referencial. |
| `cobertores-agricolas-multimaterial-escala-silos-03.jpg` | phase3 | `cobertores-agricolas-multimaterial` | escala | 4 | `/images/galeria/cobertores-agricolas-multimaterial-escala-4.webp` | foto | Silobolsas y maquinaria agrícola como referencia de tamaño. Escena referencial. |
| `galpones-invernaderos-estructurados-general-lechuga.jpg` | phase1 | `galpones-invernaderos-estructurados` | general | 2 | `/images/galeria/galpones-invernaderos-estructurados-general-2.webp` | foto | Túnel de cultivo referencial. No es una instalación nominada. |
| `galpones-invernaderos-estructurados-general-lechuga-02.jpg` | phase2 | `galpones-invernaderos-estructurados` | general | 3 | `/images/galeria/galpones-invernaderos-estructurados-general-3.webp` | foto | Túnel de cultivo referencial. No es una instalación nominada. |
| `galpones-invernaderos-estructurados-general-lechuga-03.jpg` | phase3 | `galpones-invernaderos-estructurados` | general | 4 | `/images/galeria/galpones-invernaderos-estructurados-general-4.webp` | foto | Túnel de cultivo referencial. No es una instalación nominada. |
| `galpones-invernaderos-estructurados-instalacion-camas.jpg` | phase1 | `galpones-invernaderos-estructurados` | instalacion | 2 | `/images/galeria/galpones-invernaderos-estructurados-instalacion-2.webp` | foto | Camas de cultivo bajo cubierta. Escena referencial. |
| `galpones-invernaderos-estructurados-instalacion-camas-02.jpg` | phase2 | `galpones-invernaderos-estructurados` | instalacion | 3 | `/images/galeria/galpones-invernaderos-estructurados-instalacion-3.webp` | foto | Camas de cultivo bajo cubierta. Escena referencial. |
| `galpones-invernaderos-estructurados-instalacion-camas-03.jpg` | phase3 | `galpones-invernaderos-estructurados` | instalacion | 4 | `/images/galeria/galpones-invernaderos-estructurados-instalacion-4.webp` | foto | Camas de cultivo bajo cubierta. Escena referencial. |
| `coberturas-tensionadas-arquitectura-textil-general.jpg` | phase1 | `coberturas-tensionadas-arquitectura-textil` | general | 2 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-general-2.webp` | foto | Cubierta tensada referencial. No corresponde a obra publicada. |
| `coberturas-tensionadas-arquitectura-textil-general-02.jpg` | phase2 | `coberturas-tensionadas-arquitectura-textil` | general | 3 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-general-3.webp` | foto | Cubierta tensada referencial. No corresponde a obra publicada. |
| `coberturas-tensionadas-arquitectura-textil-general-03.jpg` | phase3 | `coberturas-tensionadas-arquitectura-textil` | general | 4 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-general-4.webp` | foto | Cubierta tensada referencial. No corresponde a obra publicada. |
| `coberturas-tensionadas-arquitectura-textil-detalle-paneles.jpg` | phase1 | `coberturas-tensionadas-arquitectura-textil` | detalle | 2 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-2.webp` | foto | Paños tensados y su costura perimetral. Fotografía de material. |
| `coberturas-tensionadas-arquitectura-textil-detalle-paneles-02.jpg` | phase2 | `coberturas-tensionadas-arquitectura-textil` | detalle | 3 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-3.webp` | foto | Paños tensados y su costura perimetral. Fotografía de material. |
| `coberturas-tensionadas-arquitectura-textil-detalle-paneles-03.jpg` | phase3 | `coberturas-tensionadas-arquitectura-textil` | detalle | 4 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-detalle-4.webp` | foto | Paños tensados y su costura perimetral. Fotografía de material. |
| `coberturas-tensionadas-arquitectura-textil-general-cono.jpg` | phase1 | `coberturas-tensionadas-arquitectura-textil` | instalacion | 2 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-2.webp` | foto | Cono tensado montado, referencial. No es obra nominada. |
| `coberturas-tensionadas-arquitectura-textil-general-cono-02.jpg` | phase2 | `coberturas-tensionadas-arquitectura-textil` | instalacion | 3 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-3.webp` | foto | Cono tensado montado, referencial. No es obra nominada. |
| `coberturas-tensionadas-arquitectura-textil-general-cono-03.jpg` | phase3 | `coberturas-tensionadas-arquitectura-textil` | instalacion | 4 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-instalacion-4.webp` | foto | Cono tensado montado, referencial. No es obra nominada. |
| `coberturas-tensionadas-arquitectura-textil-escala-playa-estacionamiento.jpg` | phase1 | `coberturas-tensionadas-arquitectura-textil` | escala | 2 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-2.webp` | foto | Playa de estacionamiento cubierta; los vehículos dan la escala. Referencial. |
| `coberturas-tensionadas-arquitectura-textil-escala-playa-estacionamiento-02.jpg` | phase2 | `coberturas-tensionadas-arquitectura-textil` | escala | 3 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-3.webp` | foto | Playa de estacionamiento cubierta; los vehículos dan la escala. Referencial. |
| `coberturas-tensionadas-arquitectura-textil-escala-playa-estacionamiento-03.jpg` | phase3 | `coberturas-tensionadas-arquitectura-textil` | escala | 4 | `/images/galeria/coberturas-tensionadas-arquitectura-textil-escala-4.webp` | foto | Playa de estacionamiento cubierta; los vehículos dan la escala. Referencial. |
| `carpas-lona-estructuras-metalicas-general-galpon.jpg` | phase1 | `carpas-lona-estructuras-metalicas` | general | 2 | `/images/galeria/carpas-lona-estructuras-metalicas-general-2.webp` | foto | Galpón con cubierta de lona sobre estructura metálica. Referencial. |
| `carpas-lona-estructuras-metalicas-general-galpon-02.jpg` | phase2 | `carpas-lona-estructuras-metalicas` | general | 3 | `/images/galeria/carpas-lona-estructuras-metalicas-general-3.webp` | foto | Galpón con cubierta de lona sobre estructura metálica. Referencial. |
| `carpas-lona-estructuras-metalicas-general-galpon-03.jpg` | phase3 | `carpas-lona-estructuras-metalicas` | general | 4 | `/images/galeria/carpas-lona-estructuras-metalicas-general-4.webp` | foto | Galpón con cubierta de lona sobre estructura metálica. Referencial. |
| `modulos-albergues-campamentos-general-referencial.jpg` | phase1 | `modulos-albergues-campamentos` | general | 2 | `/images/galeria/modulos-albergues-campamentos-general-2.webp` | foto | Módulo de campaña referencial. La persona que aparece no se presenta como personal de la empresa. |
| `modulos-albergues-campamentos-general-referencial-03.jpg` | phase3 | `modulos-albergues-campamentos` | general | 3 | `/images/galeria/modulos-albergues-campamentos-general-3.webp` | foto | Módulo de campaña referencial. La persona que aparece no se presenta como personal de la empresa. |
| `malla-raschel-sombra-instalacion-pasillo.jpg` | phase1 | `malla-raschel-sombra` | instalacion | 2 | `/images/galeria/malla-raschel-sombra-instalacion-2.webp` | foto | Pasillo sombreado en montaje. Escena referencial; las personas no se presentan como personal de la empresa. |
| `malla-raschel-sombra-instalacion-pasillo-02.jpg` | phase2 | `malla-raschel-sombra` | instalacion | 3 | `/images/galeria/malla-raschel-sombra-instalacion-3.webp` | foto | Pasillo sombreado en montaje. Escena referencial; las personas no se presentan como personal de la empresa. |
| `malla-raschel-sombra-instalacion-pasillo-03.jpg` | phase3 | `malla-raschel-sombra` | instalacion | 4 | `/images/galeria/malla-raschel-sombra-instalacion-4.webp` | foto | Pasillo sombreado en montaje. Escena referencial; las personas no se presentan como personal de la empresa. |
| `malla-raschel-sombra-instalacion-interior-02.jpg` | phase2 | `malla-raschel-sombra` | detalle | 2 | `/images/galeria/malla-raschel-sombra-detalle-2.webp` | foto | Trama Raschel a contraluz. Fotografía de material. |
| `malla-raschel-sombra-instalacion-interior-03.jpg` | phase3 | `malla-raschel-sombra` | general | 2 | `/images/galeria/malla-raschel-sombra-general-2.webp` | foto | Sombreado sobre cultivo. Escena referencial. |
| `big-bags-bolsones-polipropileno-general-planta.jpg` | phase1 | `big-bags-bolsones-polipropileno` | general | 2 | `/images/galeria/big-bags-bolsones-polipropileno-general-2.webp` | foto | Bolsones llenos en almacén. Escena referencial, no inventario propio declarado. |
| `big-bags-bolsones-polipropileno-general-planta-02.jpg` | phase2 | `big-bags-bolsones-polipropileno` | general | 3 | `/images/galeria/big-bags-bolsones-polipropileno-general-3.webp` | foto | Bolsones llenos en almacén. Escena referencial, no inventario propio declarado. |
| `big-bags-bolsones-polipropileno-general-planta-03.jpg` | phase3 | `big-bags-bolsones-polipropileno` | general | 4 | `/images/galeria/big-bags-bolsones-polipropileno-general-4.webp` | foto | Bolsones llenos en almacén. Escena referencial, no inventario propio declarado. |
| `big-bags-bolsones-polipropileno-escala-almacen.jpg` | phase1 | `big-bags-bolsones-polipropileno` | escala | 2 | `/images/galeria/big-bags-bolsones-polipropileno-escala-2.webp` | foto | Bolsón en izaje por gancho; da la escala. Referencial. |
| `big-bags-bolsones-polipropileno-escala-almacen-02.jpg` | phase2 | `big-bags-bolsones-polipropileno` | escala | 3 | `/images/galeria/big-bags-bolsones-polipropileno-escala-3.webp` | foto | Bolsón en izaje por gancho; da la escala. Referencial. |
| `big-bags-bolsones-polipropileno-escala-almacen-03.jpg` | phase3 | `big-bags-bolsones-polipropileno` | escala | 4 | `/images/galeria/big-bags-bolsones-polipropileno-escala-4.webp` | foto | Bolsón en izaje por gancho; da la escala. Referencial. |
| `big-bags-bolsones-polipropileno-general-apilados-02.jpg` | phase2 | `big-bags-bolsones-polipropileno` | detalle | 2 | `/images/galeria/big-bags-bolsones-polipropileno-detalle-2.webp` | foto | Tejido y faja de asa en primer plano. Fotografía de material. |
| `geomembrana-polietileno-pe-hdpe-general-poza.jpg` | phase1 | `geomembrana-polietileno-pe-hdpe` | general | 2 | `/images/galeria/geomembrana-polietileno-pe-hdpe-general-2.webp` | foto | Poza revestida y rollo. Escena referencial. |
| `geomembrana-polietileno-pe-hdpe-general-poza-02.jpg` | phase2 | `geomembrana-polietileno-pe-hdpe` | general | 3 | `/images/galeria/geomembrana-polietileno-pe-hdpe-general-3.webp` | foto | Poza revestida y rollo. Escena referencial. |
| `geomembrana-polietileno-pe-hdpe-instalacion-talud.jpg` | phase1 | `geomembrana-polietileno-pe-hdpe` | instalacion | 2 | `/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-2.webp` | foto | Revestimiento de talud con cuadrilla. Escena referencial: no corresponde a ninguna obra de lib/projects.ts. |
| `geomembrana-polietileno-pe-hdpe-instalacion-talud-02.jpg` | phase2 | `geomembrana-polietileno-pe-hdpe` | instalacion | 3 | `/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-3.webp` | foto | Revestimiento de talud con cuadrilla. Escena referencial: no corresponde a ninguna obra de lib/projects.ts. |
| `geomembrana-polietileno-pe-hdpe-instalacion-talud-03.jpg` | phase3 | `geomembrana-polietileno-pe-hdpe` | instalacion | 4 | `/images/galeria/geomembrana-polietileno-pe-hdpe-instalacion-4.webp` | foto | Revestimiento de talud con cuadrilla. Escena referencial: no corresponde a ninguna obra de lib/projects.ts. |
| `geomembrana-polietileno-pe-hdpe-escala-rollos-referencial.jpg` | phase1 | `geomembrana-polietileno-pe-hdpe` | escala | 2 | `/images/galeria/geomembrana-polietileno-pe-hdpe-escala-2.webp` | foto | Reservorio agrícola con rollos y dos personas tendiendo lámina. Referencial. |
| `geomembrana-polietileno-pe-hdpe-escala-rollos-referencial-02.jpg` | phase2 | `geomembrana-polietileno-pe-hdpe` | escala | 3 | `/images/galeria/geomembrana-polietileno-pe-hdpe-escala-3.webp` | foto | Reservorio agrícola con rollos y dos personas tendiendo lámina. Referencial. |
| `geomembrana-polietileno-pe-hdpe-escala-rollos-referencial-03.jpg` | phase3 | `geomembrana-polietileno-pe-hdpe` | escala | 4 | `/images/galeria/geomembrana-polietileno-pe-hdpe-escala-4.webp` | foto | Reservorio agrícola con rollos y dos personas tendiendo lámina. Referencial. |
| `cobertores-agricolas-multimaterial-instalacion-secado.jpg` | phase1 | `cobertores-agricolas-multimaterial` | instalacion | 2 | `/images/galeria/cobertores-agricolas-multimaterial-instalacion-2.webp` | foto | Patio de secado de grano sobre manta. Escena referencial; la persona no se presenta como personal de la empresa. |
| `cobertores-agricolas-multimaterial-instalacion-secado-02.jpg` | phase2 | `cobertores-agricolas-multimaterial` | instalacion | 3 | `/images/galeria/cobertores-agricolas-multimaterial-instalacion-3.webp` | foto | Patio de secado de grano sobre manta. Escena referencial; la persona no se presenta como personal de la empresa. |
| `cobertores-agricolas-multimaterial-instalacion-secado-03.jpg` | phase3 | `cobertores-agricolas-multimaterial` | instalacion | 4 | `/images/galeria/cobertores-agricolas-multimaterial-instalacion-4.webp` | foto | Patio de secado de grano sobre manta. Escena referencial; la persona no se presenta como personal de la empresa. |
| `biombos-protectores-soldadura-instalacion.jpg` | phase1 | `biombos-protectores-soldadura` | instalacion | 2 | `/images/galeria/biombos-protectores-soldadura-instalacion-2.webp` | foto | Biombo en uso frente a corte de metal. Escena referencial; la persona no se presenta como personal de la empresa. |
| `biombos-protectores-soldadura-instalacion-02.jpg` | phase2 | `biombos-protectores-soldadura` | instalacion | 3 | `/images/galeria/biombos-protectores-soldadura-instalacion-3.webp` | foto | Biombo en uso frente a corte de metal. Escena referencial; la persona no se presenta como personal de la empresa. |
| `biombos-protectores-soldadura-instalacion-03.jpg` | phase3 | `biombos-protectores-soldadura` | instalacion | 4 | `/images/galeria/biombos-protectores-soldadura-instalacion-4.webp` | foto | Biombo en uso frente a corte de metal. Escena referencial; la persona no se presenta como personal de la empresa. |

Las 82 conversiones salieron a WebP con calidad 84 (reducida por pasos sólo
donde hacía falta para no pasar de 400 KB), recorte 3:2 con encuadre por
atención y lado largo limitado al del original: **ninguna imagen se amplió**.
El archivo más pesado de la entrega ocupa 325 KB, frente al techo de 700 KB que
fija `test/peso-imagenes.test.ts`.

## Lo que se descartó, y por qué

Cuarenta y cuatro fotogramas de los 126 no se publicaron. No sobraban por
calidad: sobraban porque no había ranura a la que pertenecieran honestamente.
Una foto de menos es mejor que una ranura mentirosa.

| archivo_origen | fases | por qué se descarta |
| --- | --- | --- |
| `plastilonas-peruanas-sac-flota-van` | 1, 2, 3 | **El descarte que más importa.** El rotulado de la furgoneta lleva impresos un teléfono (`2546655`), un Nextel y un correo que no coinciden con los que declara `lib/site.ts` (`phoneCentral`, `phoneWhatsApp`, `email`). Publicar un número de contacto quemado en un píxel es publicar un dato que nadie va a actualizar cuando cambie. El rótulo además está mal escrito («SIANÇAS COBERTORAS», «PERUANS»). Con eso, la imagen no puede servir ni en /nosotros ni en /contacto, que era su destino previsto. |
| `biombos-protectores-soldadura-contexto-taller` | 1, 2, 3 | El biombo no es el sujeto: son planos de corte de metal con chispas en los que el paño protector está fuera de cuadro o al fondo. Ilustran el oficio, no el producto. |
| `mangas-ventilacion-minas-tuneles-general-tramos` | 1, 2, 3 | Render de dos tramos en nave vacía; convive mal con las tomas de taller real que sí entraron en la misma ranura. |
| `mangas-ventilacion-minas-tuneles-detalle-helice` | 1, 2, 3 | Lo mismo: primer plano sintético del refuerzo helicoidal, distinto en textura y luz del resto del trío de `detalle`. |
| `mangas-ventilacion-minas-tuneles-detalle-panel-amarillo` | 1, 2, 3 | Paño de PVC amarillo doblado en taller. Es material de manga, pero la ranura `detalle` ya tiene un trío coherente (codo, costura, mano sobre el refuerzo) y mezclarlo rompería el sujeto. |
| `mangas-ventilacion-minas-tuneles-fabricacion` | 1, 2, 3 | Buena fotografía de taller, pero ninguna de las cuatro vistas es «fabricación», y forzarla a `instalacion` diría que el taller es una labor minera. |
| `mangas-ventilacion-minas-tuneles-fabricacion-linea` | 1, 2, 3 | Panorámica de la línea de confección. Mismo motivo. Es material de `/calidad` o de portada de familia, no de una vista de producto; la portada de `ventilacion-industrial` ya existe y no había razón para reemplazarla. |
| `lona-plastificada-rafia-polytarp-general-rollos` | 1, 2, 3 | Rollos de material en formato vertical. Recortado a 3:2 pierde justo lo que lo hacía legible, y la ranura `general` ya tiene trío. |
| `lona-plastificada-rafia-polytarp-detalle-orillo` | 1, 2, 3 | Orillo con soga, excelente, pero `detalle` ya está ocupada por el trío del ojal y `escala` no admite un macro. |
| `cobertores-agricolas-multimaterial-general-pacas` | 1, 2, 3 | Cobertor sobre pacas redondas. Sin ranura libre en el producto y sin otro slug al que pertenezca sin forzarlo. |
| `cobertores-agricolas-multimaterial-escala-fardos` | 1, 2, 3 | Igual: `escala` ya la ocupa el trío de silobolsas. |
| `cobertores-agricolas-multimaterial-contexto-campo` | 1, 2, 3 | Comederos cubiertos; «contexto» no es una vista del catálogo. |
| `cobertores-agricolas-multimaterial-instalacion-tunel` | 1, 2, 3 | **El trío se rompe a sí mismo:** phase1 es un almacenaje cubierto al aire libre y phase2/phase3 son el interior de un túnel de cultivo. No son el mismo sujeto, y la regla de la ranura es que las tomas lo sean. |
| `modulos-albergues-campamentos-general-referencial` | 2 | La puerta de la carpa da a una nave industrial. El exterior y el interior no pertenecen al mismo sitio; se publican phase1 y phase3, que sí. |
| `malla-raschel-sombra-instalacion-interior` | 1 | Malla azul sobre almacenaje de paletas: el encuadre está tan cargado que la malla deja de ser el asunto. De este trío se publicaron phase2 (trama) y phase3 (sombreado), cada una en la ranura que le toca. |
| `big-bags-bolsones-polipropileno-general-apilados` | 1, 3 | Fardos de bolsones plegados y montacargas. `general` y `escala` ya tienen trío; se publicó sólo phase2, que es el único primer plano de tejido y faja del lote. |
| `geomembrana-polietileno-pe-hdpe-general-poza` | 3 | La misma poza bajo cielo estrellado. Es una imagen de campaña, no de catálogo: rompe el estilo de luz natural que sostiene el resto de la serie. |

## Las dos ranuras unificadas

Dos ranuras `general` mezclaban sujetos distintos dentro de la misma rotación.
Una ranura es la MISMA vista capturada otra vez; si el sujeto cambia entre
tomas, el cruce no informa, confunde. Se unificaron así:

**`mangas-ventilacion-minas-tuneles` / `general`.** La toma 1 publicada
mostraba ductería metálica rígida dentro de un túnel. La empresa fabrica manga
textil flexible: el sujeto no era el producto. Las tres tomas nuevas sí lo son.
Resultado final, sin huecos de numeración:

| toma | archivo | qué muestra |
| --- | --- | --- |
| 1 | `mangas-ventilacion-minas-tuneles-general.webp` | Rollo de manga naranja completo sobre piso neutro. Vista general de catálogo. |
| 2 | `mangas-ventilacion-minas-tuneles-general-2.webp` | Vista axial por la boca: espiral de refuerzo y jareta. |
| 3 | `mangas-ventilacion-minas-tuneles-general-3.webp` | Manga acoplada a un ventilador portátil. |

La fotografía desplazada (ductería metálica en túnel) **no se archivó ni se
reubicó: se retiró del árbol servido**. Se estudió pasarla a la ranura
`instalacion` de este mismo producto y no cabía por dos razones
independientes: esa ranura ya está llena —cuatro tomas, el tope de
`MAX_TOMAS`— y su sujeto sigue siendo ductería rígida, de modo que publicarla
bajo «instalación de manga» presentaría un producto ajeno como si fuera el
propio. Queda en la historia de git, que es donde tiene que estar una imagen
que se extrajo de un ZIP y se decidió no publicar.

**`lona-plastificada-rafia-polytarp` / `general`.** Mismo caso: la toma 1 era
una escena de obra andina —lonas cubriendo acopios en un valle— conviviendo
con fotografía de producto de estudio. Resultado final:

| toma | archivo | qué muestra |
| --- | --- | --- |
| 1 | `lona-plastificada-rafia-polytarp-general.webp` | Lona verde plegada sobre fondo neutro, ojal y orillo a la vista. |
| 2 | `lona-plastificada-rafia-polytarp-general-2.webp` | Esquina reforzada con ojal metálico. |
| 3 | `lona-plastificada-rafia-polytarp-general-3.webp` | Ojal pasado por soga, sobre el tejido. |

Las tres son ahora el mismo sujeto —la misma lona verde, la misma luz de
estudio—, así que el cruce funciona como debe. La escena andina desplazada
tampoco se archivó: la ranura `instalacion` de este producto ya publica dos
tomas de lona naranja cubriendo equipo en altiplano andino (tomas 2 y 3), de
modo que el contexto de obra sigue representado y la imagen desplazada era
redundante; además esa ranura también está en el tope de cuatro tomas. Se
retiró del árbol servido y queda en la historia de git.

Ninguna de las dos ranuras quedó con huecos de numeración, y ninguna cadena
del resto de la galería se tocó. La comprobación completa —ningún `-N`
huérfano, ninguna cadena con agujeros, nada por encima de `MAX_TOMAS`, ninguna
toma idéntica byte a byte— se pasó sobre las 228 imágenes de
`public/images/galeria/`.

## Sobre la marca de agua y los fotogramas reconstruidos

**Decidido, no pendiente.** Parte del material nuevo son fotogramas de
catálogo reconstruidos, con el logotipo y las palabras «Plastilonas Peruanas»
incrustados. Se aceptan como tomas legítimas de galería. La norma de la casa
es que una imagen de catálogo no necesita documentar una obra ejecutada
mientras no diga que la documenta: la leyenda de honestidad —«imagen
referencial, no documenta una obra ejecutada»— sigue aplicándose en todas las
ranuras donde ya aplicaba, y es ella la que hace la revelación.

Lo que no se hace, y no se hizo: presentarlas como obra verificada. No se
tocó `lib/projects.ts`, no se marcó ningún `verificado: true`, y ninguna
leyenda afirma autoría de una obra concreta.

Queda una observación de marca, no de honestidad: las tomas nuevas llevan
marca de agua y varias tomas 1 heredadas no, de modo que en el cruce se nota
el cambio. Es una decisión estética pendiente de criterio comercial, no un
problema de veracidad.

## Qué debería mirar una persona antes de fusionar

1. **Las tomas 1 restantes de `mangas-ventilacion-minas-tuneles`.** La ranura
   `general` ya quedó resuelta (ver arriba), pero `detalle` conserva como toma
   1 una lona plateada con ojales que no es manga textil, y `instalacion`
   conserva una escena de ductería metálica. Ambas ranuras están en el tope de
   cuatro tomas, así que corregirlas exige decidir qué toma sale, y eso es
   criterio comercial, no técnico. Queda señalado, no resuelto.
2. **La marca de agua.** Las tomas nuevas llevan el logotipo incrustado y
   varias tomas 1 heredadas no. En el cruce se nota. Es una decisión de marca,
   no de honestidad; los fotogramas reconstruidos ya están aceptados como
   norma de la casa (ver la sección anterior).
3. **El ciclo de cuatro tomas dura 40 s.** Lo dice el propio comentario de
   `lib/galeria.ts`: nadie lo ve entero. Treinta ranuras rotan ahora, y
   veintidós de ellas con cuatro tomas. Tras la unificación de las dos ranuras
   `general`, el inventario final es de 34 ranuras con más de una toma
   repartidas en 13 productos, sobre 228 WebP en `public/images/galeria/`.

