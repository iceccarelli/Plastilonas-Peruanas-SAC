# P9 — un Ctrl-C, cinco culpables falsos, y un informe tirado a la basura

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0021 aplicados ·
**Pasos que fallaban por defecto propio del arné:** 5 de 6 → 0

## 1. Lo que devolvió el comando

0021 arregló que el arné encontrara Chromium, y se notó: el registro dice
`servidor listo` y el paso 04 auditó los cuatro modos con axe-core sin una
queja. Después, cinco de seis pasos «fallaron». **Ninguno por un defecto del
sitio.** Los tres defectos eran del instrumento, y los tres estaban en mi
código.

## 2. Defecto (a) — el informe se escribía en una carpeta que no existe

El paso 04 midió entero y murió en la última línea:

```
  ✓ movil-claro
  ✓ movil-oscuro
  ✓ escritorio-claro
  ✓ escritorio-oscuro
ENOENT: no such file or directory, open '.diagnostico/04-accesibilidad.json'
```

`.diagnostico/` está en `.gitignore`, así que **no viene en el clon**. De los
ocho pasos, sólo `05-capturas.mjs` la creaba; los otros siete llamaban a
`writeFileSync('.diagnostico/NN-x.json')` a pelo. En cualquier máquina recién
clonada —la suya— el trabajo se hacía y se tiraba al guardar.

Reproducido y medido antes de tocar nada, en una carpeta vacía:

```
viejo camino (writeFileSync directo): ENOENT
.diagnostico existe antes: false
escrito .diagnostico/04-accesibilidad.json
.diagnostico existe después: true
```

**Arreglo:** la carpeta se crea en `rutas.mjs`, el módulo que importan los
ocho, detrás de `guardar(nombre, datos)` y `carpeta(sub)`. No se añadió un
`mkdirSync` a cada paso: eso es el mismo error repetido siete veces esperando
a que alguien escriba el octavo. Ningún paso vuelve a nombrar la ruta.

## 3. Defecto (b) — un Ctrl-C mataba el servidor y dejaba seguir el bucle

En el registro hay una `q` suelta y un `^C` en mitad del paso 01. A partir de
ahí, cuatro `ECONNREFUSED` en cascada. La causa es una línea que escribí yo:

```bash
trap apagar EXIT INT TERM
```

La señal apagaba el servidor **y el bucle continuaba**. Un informe que dice
«5 pasos fallaron» son cinco causas que investigar; la causa era una, y la
había puesto el operador a propósito.

Reproducido con las dos versiones y una señal a los 2 s:

```
===== viejo =====            ===== nuevo =====
-- 01                        -- 01
apagando                     ── Interrumpido. Se aborta el diagnóstico completo. ──
-- 02   ECONNREFUSED         apagando
-- 03   ECONNREFUSED         código de salida: 130
-- 04   ECONNREFUSED
-- 07   ECONNREFUSED
-- 08   ECONNREFUSED
FALLOS=5
```

**Arreglo:** `INT`/`TERM` tienen manejador propio, que apaga y sale con **130**
—el código convenido para «lo paró una señal»—. El `trap apagar EXIT` se queda:
la garantía de no dejar un `next start` ocupando el puerto no se negocia.

## 4. Defecto (c) — el paso 01 era mudo durante varios minutos

37 rutas × 6 viewports = **222 páginas**, con 1.2 s de pausa en cada una, sin
imprimir una sola línea hasta terminar. Eso no se lee como «trabajando». Se lee
como colgado, y se corta — que es exactamente lo que pasó y lo que disparó (b).

**Arreglo:** `avance(hecho, total, etiqueta)`. En terminal reescribe una sola
línea. Sin terminal —CI, salida redirigida— 222 líneas serían ruido, así que
anuncia por decenas de porcentaje. Medido: **12 líneas**, no 222. El guion,
además, dice cuánto tardó cada paso.

## 5. Lo que impide que vuelva

Seis pruebas nuevas en `test/diagnostico.test.ts`, y la que importa no
comprueba que el arreglo esté: comprueba que **el defecto no pueda volver a
escribirse**. Ningún paso puede nombrar `.diagnostico/` por su cuenta.

Verificado al revés, deshaciendo cada arreglo por separado:

| Arreglo deshecho | Prueba que se pone roja |
|---|---|
| `guardar()` → `writeFileSync` literal en 04 | «todo paso que produce un informe pasa por guardar() o carpeta()» |
| `trap apagar EXIT INT TERM` de vuelta | «el servidor se sigue apagando pase lo que pase» |
| `avance()` fuera de 01 | «01 y 03 informan del avance» |

Restaurado: 16 pruebas, 0 fallos.

## 6. Lo único que se midió limpio la vez pasada

`08-presupuesto` pasó, y merece quedar escrito porque es la única medida real
que sobrevivió al desastre:

```
✓ Ninguna ruta excede su presupuesto
  /(es)/page                   180.9 kB  (presupuesto 195 kB)
  /(es)/productos/page         174.7 kB
  /(es)/marco/evaluacion/page  160.8 kB
  /(es)/cotizacion/page        143.9 kB  (presupuesto 165 kB)
  /(en)/en/rfq/page            143.9 kB
```

## 7. Lo que sigue

`npm run diagnostico` completo, sin Ctrl-C. Ahora termina, escribe y dice por
dónde va, así que lo que devuelva serán **defectos del sitio** —desborde
horizontal, objetivos táctiles, contraste, enlaces rotos— y no del
instrumento. El siguiente parche sale de esos números.
