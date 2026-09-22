#!/usr/bin/env bash
#
# DIAGNÓSTICO EN NAVEGADOR — de un solo comando.
#
# POR QUÉ EXISTE. Las instrucciones eran éstas, y son una trampa:
#
#     npm run build && npx next start -p 4000 &
#     npm run diagnostico
#
# El `&` manda al fondo la cadena ENTERA, así que el diagnóstico arranca
# mientras `next build` todavía está compilando: cuando llega a pedir la primera
# página no hay servidor, y si lo hubiera, el `next start` se queda detenido al
# volver al prompt. Medido: el diagnóstico corrió antes de que el build
# terminara y el servidor acabó en «Stopped».
#
# Este script hace la secuencia en el orden correcto, ESPERA a que el servidor
# conteste de verdad, y lo apaga pase lo que pase.
#
# Uso:
#   npm run diagnostico              # compila si hace falta, mide y apaga
#   npm run diagnostico -- --build   # fuerza recompilar
#   PUERTO=4100 npm run diagnostico  # si 4000 está ocupado
set -uo pipefail

PUERTO="${PUERTO:-4000}"
BASE="http://localhost:${PUERTO}"
REGISTRO="$(mktemp -t next-start-XXXX.log)"
SERVIDOR=""

# SE APAGA EL GRUPO ENTERO, NO SÓLO EL `npx`.
#
# Esto decía `kill "$SERVIDOR"`, y $SERVIDOR es el `npx`, que a su vez lanza
# un `next-server` hijo. Matar al padre dejaba al hijo vivo OCUPANDO EL
# PUERTO. Y ahí está el daño: la siguiente ejecución encontraba algo que
# contestaba en ese puerto, daba por bueno "servidor listo" y medía el
# servidor VIEJO —código anterior, límites de tasa ya gastados— creyendo que
# medía el nuevo. Un arné que mide en silencio la cosa equivocada es peor
# que uno que no corre: el verde es falso y nadie lo sabe.
#
# `setsid` pone el servidor en su propio grupo de procesos y `kill -TERM -PGID`
# se lleva al padre y al hijo. Si `setsid` no existe, se cae a matar al `npx`
# y a sus hijos directos, y la comprobación de puerto de más abajo atrapa lo
# que quede.
apagar() {
  if [ -n "$SERVIDOR" ] && kill -0 "$SERVIDOR" 2>/dev/null; then
    echo "── Apagando el servidor de pruebas ──"
    kill -TERM "-${SERVIDOR}" 2>/dev/null || {
      pkill -TERM -P "$SERVIDOR" 2>/dev/null || true
      kill -TERM "$SERVIDOR" 2>/dev/null || true
    }
    wait "$SERVIDOR" 2>/dev/null || true
  fi
  # Idempotente: `interrumpir` apaga y sale, y el trap EXIT vuelve a llamar a
  # esta función. Sin esta línea el apagado se anuncia dos veces.
  SERVIDOR=""
}

# UN Ctrl-C ABORTA EL DIAGNÓSTICO ENTERO, no el paso en curso.
#
# `trap apagar EXIT INT TERM` mataba el servidor al llegar la señal Y DEJABA
# QUE EL BUCLE SIGUIERA. Medido: se interrumpió el paso 01 y los cinco pasos
# siguientes corrieron contra un servidor muerto, cada uno con su propio
# ECONNREFUSED. El informe decía «5 pasos fallaron» —cinco causas distintas
# que investigar— cuando la causa era una y la había puesto el operador.
#
# Ahora INT y TERM tienen su propio manejador y salen con 130, el código que
# la convención reserva para «lo paró una señal». El EXIT sigue apagando el
# servidor: pase lo que pase, no queda un `next start` ocupando el puerto.
interrumpir() {
  echo >&2
  echo "── Interrumpido. Se aborta el diagnóstico completo. ──" >&2
  echo "   Lo que se alcanzó a escribir está en .diagnostico/" >&2
  apagar
  exit 130
}
trap apagar EXIT
trap interrumpir INT TERM

if [ "${1:-}" = "--build" ] || [ ! -f .next/BUILD_ID ]; then
  echo "── Compilando el sitio ──"
  npm run build || exit 1
else
  echo "── Reutilizando la compilación de .next (use --build para rehacerla) ──"
fi

# NUNCA MEDIR EL SERVIDOR DE OTRO. Si algo ya contesta en este puerto, el
# bucle de espera de abajo lo daría por "listo" y toda la medición saldría de
# un proceso que no es el que acabamos de compilar.
if curl -fsS "${BASE}/version.json" >/dev/null 2>&1; then
  echo "Ya hay un servidor respondiendo en ${BASE}." >&2
  echo "Apáguelo (o use PUERTO=<otro>) para no medir una compilación vieja." >&2
  exit 1
fi

echo "── Levantando el sitio en ${BASE} ──"
setsid npx next start -p "$PUERTO" > "$REGISTRO" 2>&1 &
SERVIDOR=$!

# Esperar a que CONTESTE, no a que el proceso exista: arrancar tarda segundos y
# pedirle una página antes de tiempo da un diagnóstico de una página en blanco.
for _ in $(seq 1 60); do
  if curl -fsS "${BASE}/version.json" >/dev/null 2>&1; then break; fi
  if ! kill -0 "$SERVIDOR" 2>/dev/null; then
    echo "El servidor murió al arrancar:" >&2
    tail -20 "$REGISTRO" >&2
    exit 1
  fi
  sleep 1
done

if ! curl -fsS "${BASE}/version.json" >/dev/null 2>&1; then
  echo "El servidor no respondió en 60 s. Registro:" >&2
  tail -20 "$REGISTRO" >&2
  exit 1
fi
echo "   servidor listo"

export DIAG_BASE="$BASE"
FALLOS=0
for PASO in \
  01-maquetacion 02-interaccion 03-arquitectura 04-accesibilidad 07-solapamiento 08-presupuesto
do
  echo
  echo "── ${PASO} ──"
  INICIO=$SECONDS
  # Sin `set -e`: que un paso falle no puede impedir que corran los otros cinco.
  # Un informe de cinco medidas vale más que ninguna.
  if node "scripts/diagnostico/${PASO}.mjs"; then
    echo "   ${PASO} terminó en $((SECONDS - INICIO))s"
  else
    echo "   ⚠ ${PASO} falló tras $((SECONDS - INICIO))s"
    FALLOS=$((FALLOS+1))
  fi
done

echo
if [ "$FALLOS" -gt 0 ]; then
  echo "✖ ${FALLOS} paso(s) fallaron. Lo que sí se midió está en .diagnostico/"
else
  echo "✔ Diagnóstico completo. Resultados en .diagnostico/"
fi
ls -1 .diagnostico 2>/dev/null | sed 's/^/   /' || true
exit "$FALLOS"
