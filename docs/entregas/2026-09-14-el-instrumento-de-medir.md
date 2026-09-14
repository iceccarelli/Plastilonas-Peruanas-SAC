# P8 — el único instrumento que mira la página renderizada estaba apagado

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0020 aplicados ·
**Máquinas donde el arné podía correr:** 1 → cualquiera con Chromium

## 1. Lo que devolvió el comando

Le pedí que corriera `npm run diagnostico` para que el siguiente parche saliera
de mediciones y no de análisis estático. Devolvió esto:

```
browserType.launch: Failed to launch chromium because executable doesn't exist
at /opt/pw-browsers/chromium-1194/chrome-linux/chrome
```

Y no es un fallo de su máquina. **Es el hallazgo.**

## 2. Dos defectos, y el segundo es el grave

### a) El arné apuntaba a una máquina que ya no existe

`scripts/diagnostico/rutas.mjs` fijaba **una sola ruta absoluta**: el Chromium
preinstalado de un contenedor concreto. Funcionó mientras ese contenedor
existió. Fuera de él —su Codespace, un portátil, CI— el arné entero moría con
ese mensaje, que además no dice qué hacer.

La consecuencia es peor que un error feo. Las 902 pruebas de este repositorio
**leen archivos**: ninguna abre un navegador. Esto es lo único que mide desborde
horizontal real, objetivos táctiles calculados sobre el elemento renderizado,
contraste, errores de consola y enlaces rotos. Llevaba apagado sin que nada lo
dijera, y yo construí el parche anterior con análisis estático **porque esta
herramienta no arrancaba en ninguna parte.**

Ahora el navegador se **busca**, en orden, y lo primero que exista gana:

1. `DIAG_CHROME` — quien sabe dónde está el suyo lo dice y se acabó.
2. El que Playwright haya instalado (`chromium.executablePath()`), que es el
   caso normal tras `npx playwright install chromium`.
3. Las rutas de contenedores preaprovisionados, la del sandbox incluida.
4. El Chromium o el Chrome del sistema.

Y si no hay ninguno, el error dice el comando exacto que lo arregla en vez de
una ruta que a nadie le dice nada.

### b) Las instrucciones para levantar el sitio eran una trampa

```bash
npm run build && npx next start -p 4000 &
npm run diagnostico
```

El `&` manda al fondo **la cadena entera**, así que el diagnóstico arranca
mientras `next build` todavía compila: cuando pide la primera página no hay
servidor. Se ve en su salida — el diagnóstico falló, y después apareció
`Creating an optimized production build…` seguido de `[1]+ Stopped`.

Y aunque hubiera arrancado a tiempo, medir sobre un servidor a medio levantar da
el diagnóstico de una página en blanco: **parece que todo está bien**, que es
peor que no medir.

`npm run diagnostico` pasa a ser un comando que hace la secuencia entera:
compila si hace falta, levanta el sitio, **espera a que conteste de verdad**
sondeando `/version.json` con un tope de 60 s, corre los seis pasos, y apaga el
servidor pase lo que pase con un `trap`. Un paso que falle no impide los otros
cinco: un informe de cinco medidas vale más que ninguna.

## 3. Probado abriendo el navegador de verdad

No me limité a editarlo. Con el resolvedor nuevo, Chromium real, 360 px, contra
una página servida a propósito con dos defectos plantados:

```
MEDIDO EN CHROMIUM REAL: {"desborde":540,"enlaceAlto":23}
```

540 px de desborde horizontal y un enlace de 23 px de alto: las dos clases de
defecto que este instrumento existe para cazar, detectadas a través del camino
nuevo.

Y el camino del error, también ejecutado —apuntando `DIAG_CHROME` a un archivo
que existe pero no es un navegador—:

```
No se pudo abrir Chromium para el diagnóstico.
  Buscado en: /bin/true
              /opt/pw-browsers/chromium-1194/chrome-linux/chrome
              …
  Instálelo con:   npx playwright install chromium
  O indique el suyo:   DIAG_CHROME=/ruta/a/chrome npm run diagnostico
```

## 4. Lo que lo mantiene

`test/diagnostico.test.ts`, 8 pruebas:

- el navegador se **busca** en una lista y admite `DIAG_CHROME`;
- cuando no hay, el error trae el comando exacto;
- los seis pasos abren el navegador por la misma puerta —`lanzarNavegador()`—
  y no con `chromium.launch` suelto, que devuelve el error que no dice nada;
- `npm run diagnostico` llama al guion, y el guion existe;
- el guion **sondea dos veces**: dentro del bucle de espera y al salir. Quitar
  la del bucle lo dejaría esperando un tiempo fijo, que es adivinar;
- apaga el servidor con `trap` —si no, un paso que falla deja el puerto ocupado
  y el intento siguiente falla por una razón distinta y confusa—;
- un paso que falla no aborta los otros cinco.

Verificadas en sentido contrario: volviendo a la ruta fija, devolviendo
`chromium.launch` a un paso, quitando el sondeo del bucle y quitando el `trap`,
falla exactamente la que corresponde.

Dos aserciones de `test/regresiones-ui.test.ts` fijaban la forma literal del
comando antiguo. Se ajustan a lo que de verdad importa —que siga siendo UN
comando y que el paso del presupuesto siga corriendo— y la forma exacta queda en
la prueba que le toca.

## 5. Ahora sí

```bash
npx playwright install chromium    # una vez, si aún no lo tiene
npm run diagnostico
```

Compila, levanta, espera, mide en seis viewports desde 360 px y apaga. La salida
va a `.diagnostico/`. Mándemela y el siguiente parche sale de números.

## 6. Lo que NO entra

- Ni una línea del sitio, ni del servicio, ni de las pruebas de contenido.
- Ninguna dependencia nueva: `playwright` y `axe-core` ya estaban.
