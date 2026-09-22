#!/usr/bin/env bash
#
# CAMINO DEL DINERO, de un solo comando — misma secuencia que
# scripts/diagnostico.sh (compila si hace falta, levanta, ESPERA a que
# conteste, mide y apaga pase lo que pase). No se repite el razonamiento
# aquí: está escrito en ese archivo, y el `&` suelto sigue siendo la trampa.
#
# Uso:
#   npm run probar:dinero              # reutiliza .next si existe
#   npm run probar:dinero -- --build   # fuerza recompilar
#   PUERTO=4100 npm run probar:dinero
set -uo pipefail

PUERTO="${PUERTO:-4010}"
BASE="http://localhost:${PUERTO}"
REGISTRO="$(mktemp -t next-dinero-XXXX.log)"
SERVIDOR=""

# Se apaga el GRUPO entero: `npx` lanza un `next-server` hijo que sobrevive a
# un kill del padre y se queda con el puerto, y entonces la siguiente
# ejecución mide en silencio el servidor viejo —código anterior y límites de
# tasa ya gastados— creyendo que mide el nuevo. Mismo arreglo y mismo
# razonamiento que en scripts/diagnostico.sh.
apagar() {
  if [ -n "$SERVIDOR" ] && kill -0 "$SERVIDOR" 2>/dev/null; then
    kill -TERM "-${SERVIDOR}" 2>/dev/null || {
      pkill -TERM -P "$SERVIDOR" 2>/dev/null || true
      kill -TERM "$SERVIDOR" 2>/dev/null || true
    }
    wait "$SERVIDOR" 2>/dev/null || true
  fi
  SERVIDOR=""
}
interrumpir() {
  echo >&2
  echo "── Interrumpido. Se aborta la prueba del camino del dinero. ──" >&2
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

DIAG_BASE="$BASE" node scripts/camino-dinero.mjs
