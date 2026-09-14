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

apagar() {
  if [ -n "$SERVIDOR" ] && kill -0 "$SERVIDOR" 2>/dev/null; then
    echo "── Apagando el servidor de pruebas ──"
    kill "$SERVIDOR" 2>/dev/null || true
    wait "$SERVIDOR" 2>/dev/null || true
  fi
}
trap apagar EXIT INT TERM

if [ "${1:-}" = "--build" ] || [ ! -f .next/BUILD_ID ]; then
  echo "── Compilando el sitio ──"
  npm run build || exit 1
else
  echo "── Reutilizando la compilación de .next (use --build para rehacerla) ──"
fi

echo "── Levantando el sitio en ${BASE} ──"
npx next start -p "$PUERTO" > "$REGISTRO" 2>&1 &
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
  # Sin `set -e`: que un paso falle no puede impedir que corran los otros cinco.
  # Un informe de cinco medidas vale más que ninguna.
  node "scripts/diagnostico/${PASO}.mjs" || { echo "   ⚠ ${PASO} falló"; FALLOS=$((FALLOS+1)); }
done

echo
if [ "$FALLOS" -gt 0 ]; then
  echo "✖ ${FALLOS} paso(s) fallaron. Lo que sí se midió está en .diagnostico/"
else
  echo "✔ Diagnóstico completo. Resultados en .diagnostico/"
fi
ls -1 .diagnostico 2>/dev/null | sed 's/^/   /' || true
exit "$FALLOS"
