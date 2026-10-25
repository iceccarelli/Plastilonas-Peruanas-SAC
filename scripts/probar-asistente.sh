#!/usr/bin/env bash
#
# RECORRIDO DE LA OFERTA en navegador real. Misma secuencia que probar-dinero.sh
# (compila si hace falta, levanta, ESPERA, mide y apaga pase lo que pase).
#
#   npm run probar:oferta               # reutiliza .next si existe
#   npm run probar:oferta -- --build    # fuerza recompilar
set -uo pipefail

PUERTO="${PUERTO:-4015}"
BASE="http://localhost:${PUERTO}"
REGISTRO="$(mktemp -t next-asistente-XXXX.log)"
SERVIDOR=""
export ASISTENTE_FAKE_PORT="${ASISTENTE_FAKE_PORT:-4016}"

apagar() {
  if [ -n "$SERVIDOR" ] && kill -0 "$SERVIDOR" 2>/dev/null; then
    kill -TERM "-${SERVIDOR}" 2>/dev/null || { pkill -TERM -P "$SERVIDOR" 2>/dev/null || true; kill -TERM "$SERVIDOR" 2>/dev/null || true; }
    wait "$SERVIDOR" 2>/dev/null || true
  fi
  SERVIDOR=""
}
trap apagar EXIT
trap 'apagar; exit 130' INT TERM

if [ "${1:-}" = "--build" ] || [ ! -f .next/BUILD_ID ]; then
  echo "── Compilando el sitio ──"
  npm run build || exit 1
else
  echo "── Reutilizando la compilación de .next (use --build para rehacerla) ──"
fi

if curl -fsS "${BASE}/version.json" >/dev/null 2>&1; then
  echo "Ya hay un servidor respondiendo en ${BASE}. Apáguelo (o use PUERTO=<otro>)." >&2
  exit 1
fi

# El sitio habla con un Anthropic FALSO local (lo levanta probar-asistente.mjs):
# ni saldo ni red, aunque el entorno de quien lo corre tenga una clave real.
echo "── Levantando el sitio en ${BASE} ──"
ANTHROPIC_API_KEY="sk-ant-prueba" ANTHROPIC_BASE_URL="http://127.0.0.1:${ASISTENTE_FAKE_PORT}/v1" \
  NEXT_PUBLIC_SUPABASE_URL="" NEXT_PUBLIC_SUPABASE_ANON_KEY="" SUPABASE_SERVICE_ROLE_KEY="" \
  setsid npx next start -p "$PUERTO" > "$REGISTRO" 2>&1 &
SERVIDOR=$!

for _ in $(seq 1 60); do
  if curl -fsS "${BASE}/version.json" >/dev/null 2>&1; then break; fi
  if ! kill -0 "$SERVIDOR" 2>/dev/null; then echo "El servidor murió al arrancar:" >&2; tail -20 "$REGISTRO" >&2; exit 1; fi
  sleep 1
done
curl -fsS "${BASE}/version.json" >/dev/null 2>&1 || { echo "El servidor no respondió en 60 s." >&2; tail -20 "$REGISTRO" >&2; exit 1; }
echo "   servidor listo"

DIAG_BASE="$BASE" node scripts/probar-asistente.mjs
CODIGO=$?
[ "$CODIGO" -ne 0 ] && { echo "── Registro del servidor (últimas líneas) ──" >&2; tail -15 "$REGISTRO" >&2; }
exit "$CODIGO"
