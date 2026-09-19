# Cine editorial — la trilogía «El oficio / La materia / El gesto»

Fecha: 2026-09-19 · Rama: `feat/cine-editorial`

Tres piezas cortas de fotografía en movimiento, recuperadas del historial de
git, remuxadas para web y publicadas bajo `public/videos/`. Sala propia en
`/oficio`, una presencia en portada y una en `/nosotros`. La galería
fotográfica que entró en PR #23 no se toca.

---

## 1. De dónde salen los archivos

**No hubo ninguna re-subida.** Los seis MP4 llegaron dos veces a la raíz del
repositorio por la interfaz web de GitHub y se borraron dos veces (`dabc60f` y
`0a73ed9`), la segunda por error: son un entregable del sitio, no un paquete de
transferencia como los quince ZIP de fotografía. Los blobs siguen en la
historia, así que se recuperaron con `git show` desde `39e4b38`, el commit
anterior al segundo borrado.

| Nombre original en la raíz (`39e4b38`) | Ruta canónica | Bytes originales | Papel |
|---|---|---|---|
| `01-el-oficio-segundo-video.mp4` | `public/videos/el-oficio.mp4` | 18 002 544 | master hablado I |
| `01-el-oficio.mp4` | `public/videos/el-oficio-mudo.mp4` | 19 340 061 | toma sin locución I |
| `02-la-materia-segundo-video.mp4` | `public/videos/la-materia.mp4` | 14 474 924 | master hablado II |
| `02-la-materia.mp4` | `public/videos/la-materia-mudo.mp4` | 13 301 511 | toma sin locución II |
| `03-el-gesto-segundo-video.mp4` | `public/videos/el-gesto.mp4` | 12 609 101 | master hablado III |
| `03-el-gesto.mp4` | `public/videos/el-gesto-mudo.mp4` | 13 735 907 | toma sin locución III |

Los bytes son los que declara `git show 0a73ed9 --stat`, y coinciden uno a uno
con lo recuperado. El remux posterior resta un byte a cada archivo (reordena el
átomo `moov`, no recodifica).

Cuál es el hablado y cuál el mudo **no se dedujo del nombre**: los seis se
midieron con `volumedetect`. Los seis llevan pista de audio; los `-segundo-video`
tienen el nivel medio homogéneo de una locución (−25,6 a −25,8 dBFS) y los
otros tres van entre 4 y 9 dB por debajo (−29,3 / −35,0 / −33,4 dBFS), que es
música y ambiente sin voz. El grupo alto es el master publicado.

### Comandos, tal cual se ejecutaron

```bash
git show 39e4b38:01-el-oficio-segundo-video.mp4 > public/videos/el-oficio.mp4
git show 39e4b38:02-la-materia-segundo-video.mp4 > public/videos/la-materia.mp4
git show 39e4b38:03-el-gesto-segundo-video.mp4  > public/videos/el-gesto.mp4
git show 39e4b38:01-el-oficio.mp4  > public/videos/el-oficio-mudo.mp4
git show 39e4b38:02-la-materia.mp4 > public/videos/la-materia-mudo.mp4
git show 39e4b38:03-el-gesto.mp4   > public/videos/el-gesto-mudo.mp4

# Remux con +faststart: mueve el índice al principio del archivo para que el
# navegador pueda empezar a reproducir sin descargarlo entero. Sin recodificar.
ffmpeg -y -i public/videos/$F.mp4 -c copy -movflags +faststart /tmp/$F.mp4

# Un cartel por pieza HABLADA, del propio master, a los 10 s.
ffmpeg -y -ss 10 -i public/videos/$F.mp4 -frames:v 1 -q:v 5 \
  -vf scale=1920:1080 public/videos/posters/$F.jpg
```

`ffmpeg` no está en la imagen: se usó el binario de `ffmpeg-static`, instalado
fuera del repositorio. **No se añadió ninguna dependencia a `package.json`** —
ni para el reproductor ni para el proceso.

---

## 2. Duraciones reales (ffprobe)

Son las que viajan a `lib/cine.ts` y de ahí al `VideoObject`. Ninguna está
estimada.

| Pieza | Hablado | Mudo |
|---|---|---|
| El oficio | 74,292 s → `PT1M14S` | 67,334 s |
| La materia | 60,292 s → `PT1M0S` | 47,375 s |
| El gesto | 55,375 s → `PT55S` | 48,500 s |

Los seis son H.264 1920×1080 con audio AAC.

---

## 3. El arreglo de `.gitignore`, que era el bloqueo real

La limpieza anterior añadió `*.mp4` y `*.mov` globales. Esa regla no impide lo
que pretendía —la subida web de GitHub ignora `.gitignore`— y sí impide lo
único que importa aquí: que `git add` versione los masters canónicos. Se
sustituye por protección **sólo de la raíz**:

```gitignore
/01-*.mp4
/02-*.mp4
/03-*.mp4
/*.mov
```

`*.zip` sigue ignorado globalmente: los quince paquetes de fotografía no
vuelven nunca. `public/videos/**` **no** se ignora.

---

## 4. Qué se ve en cada pieza, y dónde aparece

El reparto de `familias` y `productos` en `lib/cine.ts` describe lo que de
verdad se ve en el montaje, y está hecho **sin solapes**: ninguna página de
familia o de ficha puede heredar dos películas, así que el límite de un vídeo
por página se cumple por construcción y no por vigilancia.

### I · El oficio — *Una lectura de Plastilonas Peruanas* (1:14)

Recorrido por el catálogo entero: manga de ventilación, ducto en un frente de
mina, rollo de geomembrana, lona aluminizada con ojales, cobertor sobre fardos,
silo bolsa, cubierta tensada, poza revestida.

- **Familias / productos:** ninguno. No es la película de una línea, es la de la
  empresa; atribuirla a una familia sería decir que ese material protagoniza un
  montaje que no protagoniza.
- **Páginas:** `/` (portada), `/oficio`, `/nosotros`.

### II · La materia — *El producto, visto de cerca* (1:00)

Macro de acabado: el ojal embutido sobre tejido aluminizado, la costura que lo
rodea, el nervio del polipropileno rafia, el rollo de geomembrana de canto, la
pila de lonas dobladas por color.

- **Familias:** `lonas-cobertores`, `geosinteticos`.
- **Productos:** `lona-plastificada-rafia-polytarp`.
- **Páginas:** `/oficio` + las páginas de esas familias y esa ficha.

### III · El gesto — *El producto, trabajando* (0:55)

El material instalado y en servicio: ducto de ventilación colgado en el túnel,
cobertor amarrado sobre fardos, cubierta sobre patio de vehículos, malla de
sombra sobre un paso peatonal, bolsón lleno, biombo aislando un corte.

- **Familias:** `ventilacion-industrial`, `estructuras-arquitectura-textil`,
  `envases-embalaje`, `seguridad-industrial`.
- **Productos:** `mangas-ventilacion-minas-tuneles`,
  `carpas-lona-estructuras-metalicas`, `big-bags-bolsones-polipropileno`,
  `biombos-protectores-soldadura`.
- **Páginas:** `/oficio` + las páginas de esas familias y esas fichas.

### Dónde NO aparecen

- **`/contacto`:** nunca.
- **Junto a la galería de producto:** nunca. La galería es lo que se usa para
  especificar —vista general, detalle, escala— y el vídeo va debajo de todo, en
  la ficha, donde llega quien ya la leyó. La galería no se sustituye ni se
  recorta.
- **En el menú principal:** no. `/oficio` cuelga de `/nosotros` y del pie.

---

## 5. Honestidad: son fotografías en movimiento, no obras

Se aplica exactamente la misma regla que a la galería fotográfica. La leyenda
vive en `lib/leyendas.ts` junto a la de las fotos, por el motivo de siempre —
dos redacciones parecidas envejecen a ritmos distintos y la más blanda es la
que acaba leyendo quien homologa:

> **Fotografía en movimiento del producto y del oficio. No representa una obra
> nominada.**

Se imprime bajo cada cuadro, en el mismo gris y el mismo tamaño que el pie de
`FotoReferencial`, y **además** va pegada a la `description` de cada
`VideoObject`: el nodo puede viajar solo a un buscador, y si la única
advertencia viviera en el `<figcaption>` la pieza acabaría citada como prueba
de una obra entregada justo donde nadie puede leer el desmentido.

No hay cliente nombrado, ni obra, ni cifra de negocio, ni certificación propia
en ninguna de las tres piezas ni en el texto que las acompaña. `llms.txt`
declara además que no son «vídeo comercial» —no llevan oferta, precio ni
llamada a comprar— para que un agente no las reetiquete por su cuenta.

---

## 6. Decisiones técnicas que conviene no deshacer

**`<video>` nativo, sin librería.** Son archivos propios servidos desde el
mismo origen: no hay HLS, ni DRM, ni proveedor remoto. Un reproductor de
terceros costaría entre 50 y 200 KB de JavaScript y sustituiría los controles
del sistema —teclado, subtítulos, Picture in Picture— por unos dibujados.

**Nada arranca solo con sonido, en ninguna parte.** `CinePlayer` tiene dos
modos. `sala` no monta el `<video>` hasta que se pulsa: hasta entonces sólo hay
un cartel servido por `next/image`. `fondo` es el único contexto donde algo
podría arrancar solo, y está atado por construcción — usa `pieza.srcMudo`,
nunca `pieza.src`, y lleva `muted` siempre. No existe forma de pedirle a este
componente que reproduzca la pista hablada sin un gesto.

**`preload="metadata"`, no `none`.** Con `+faststart` la cabecera son unos
pocos KB y la barra de progreso es real desde el primer fotograma. Con `none`
el primer clic se queda quieto mientras llega esa cabecera, y eso se lee como
que el vídeo está roto.

**La portada lleva cartel, no bucle.** La toma muda más ligera pesa 12,6 MB.
Reproducirla sola detrás del hero costaría más que toda la portada junta, en un
país donde buena parte del tráfico entra por datos móviles. El cartel lo sirve
el optimizador en AVIF a la medida de la pantalla, y el MP4 sólo se toca si
alguien pulsa. `prioridadCartel` se queda en `false`: el LCP de la portada
sigue siendo la fotografía del hero (`lib/hero-imagenes.ts`).

**Movimiento reducido.** `useMovimiento()` devuelve `false` en el primer
render, así que el modo `fondo` no emite el `<video>` hasta saber que puede
moverse: quien pidió menos movimiento se queda con el cartel fijo y nunca ve el
destello de un bucle que arranca y se corta.

**CSP.** `next.config.ts` ya traía `default-src 'self'`, que por herencia
habría bastado. Se declara `media-src 'self'` explícito para que el día que
`default-src` se endurezca las tres piezas no dejen de reproducirse sin que
nadie relacione una cosa con la otra.

**Sin subtítulos, y es una decisión declarada.** Los tres masters llevan
locución y este repositorio no tiene transcripción de ella. Escribir un WebVTT
«aproximado» sería inventar palabras que alguien va a leer como las que se
dicen. El hueco queda abierto: el día que llegue la transcripción real, entra
como `<track>` en `CinePlayer` y como `transcript` en el `VideoObject`.

**Los carteles están en el registro de imágenes, pero NO en la cola de
encargos.** `lib/imagenes.ts` re-exporta `ranurasCine()` y deja fuera de
`todasLasRanuras()`: esa lista es la de imágenes *pendientes de encargar*, con
un prompt de generación que `test/imagenes.test.ts` valida. Los carteles son
fotogramas del master, ya en disco. Meterlos ahí habría obligado a escribirles
un prompt falso, y además habría inflado la cifra que `llms.txt` publica como
«ilustraciones y esquemas declarados» con tres cosas que no son ninguna de las
dos.

**El auditor del grafo.** `/oficio` se enlaza con la constante `RUTA_CINE`, y
`scripts/auditar-estado.mjs` sólo leía `href` literales. Se añadió `RUTA_CINE`
a `ENLACES_DERIVADOS`, resuelto leyendo `lib/cine.ts` — que es el patrón que
ese archivo ya usa para `ENLACES_CUNAS`, `INDUSTRIAS` y `RUTA_ES`. La
alternativa, escribir `/oficio` a mano en el pie, es exactamente la solución
que el comentario de ese archivo advierte contra.

---

## 7. Archivos tocados

Nuevos: `lib/cine.ts`, `components/CinePlayer.tsx`, `app/(es)/oficio/page.tsx`,
`public/videos/*.mp4` (6), `public/videos/posters/*.jpg` (3).

Modificados: `.gitignore`, `lib/leyendas.ts` (`LEYENDA_CINE`), `lib/schema.ts`
(`videoObjectSchema`), `lib/sitemaps.ts`, `lib/imagenes.ts`,
`app/llms.txt/route.ts`, `next.config.ts`, `components/Footer.tsx`,
`app/(es)/page.tsx`, `app/(es)/nosotros/page.tsx`,
`app/(es)/productos/[slug]/page.tsx`,
`app/(es)/productos/familia/[slug]/page.tsx`, `scripts/auditar-estado.mjs`.

**No se tocó nada de la galería fotográfica de PR #23**:
`public/images/galeria/*.webp` (228 archivos, 34 segundas tomas),
`components/ProductGallery.tsx`, `components/ProductRotator.tsx`,
`components/FotoReferencial.tsx`, `lib/leyendas.ts` sólo se amplía sin tocar
`LEYENDA_REFERENCIAL`, y `docs/entregas/2026-09-19-trilogia-fotografica.md`
queda intacto.

---

## 8. Verificación

```
npm test -- --run test/repositorio-limpio.test.ts    9 pruebas, 0 fallos
npx tsc --noEmit                                    sin salida
npm test                                            66 archivos, 1071 pruebas, 0 fallos
npm run auditar:imagenes                            517 archivos, 0 errores, 0 avisos
npm run build                                       357 páginas estáticas, /oficio prerenderizada
npm run auditar                                     225 páginas servidas, sin defectos
```

Comprobado sobre el HTML servido: ninguna página emite un `<video>` antes del
clic; ninguna emite `autoplay` en ninguna parte; los tres `VideoObject` se
emiten una sola vez, en `/oficio`, y su `isPartOf` apunta al `#webpage` de esa
misma página; `/contacto` no tiene vídeo.
