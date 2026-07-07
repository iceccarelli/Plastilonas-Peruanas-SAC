#!/usr/bin/env bash
# ============================================================
# Smoke test en vivo — verifica que las rutas comerciales responden.
# Uso:
#   npm run dev            # en una terminal
#   npm run test:smoke     # en otra (o: BASE_URL=https://tu-preview.vercel.app npm run test:smoke)
# ============================================================
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
pass=0; fail=0

check() { # <descripción> <método> <ruta> <status_esperado> [body]
  local desc="$1" method="$2" path="$3" want="$4" body="${5:-}"
  local got
  if [ "$method" = "POST" ]; then
    got=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
      -H 'Content-Type: application/json' -d "$body" "$BASE_URL$path")
  else
    got=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$path")
  fi
  if [ "$got" = "$want" ]; then
    printf '  \033[32m✓\033[0m %-46s [%s]\n' "$desc" "$got"; pass=$((pass+1))
  else
    printf '  \033[31m✗\033[0m %-46s [esperado %s, obtuvo %s]\n' "$desc" "$want" "$got"; fail=$((fail+1))
  fi
}

echo "Smoke test → $BASE_URL"
echo "— Páginas públicas —"
check "home"                 GET  "/"                 200
check "catálogo"             GET  "/productos"        200
check "carrito"              GET  "/carrito"          200
check "checkout"             GET  "/checkout"         200
check "checkout/éxito"       GET  "/checkout/exito"   200

echo "— API de pago (comportamiento seguro sin claves reales) —"
# Sin STRIPE_SECRET_KEY -> 503; con clave pero slug inválido -> 400.
# Aceptamos cualquiera de los dos como "implementado y protegido".
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"slug":"no-existe","quantity":1}],"shipping":{"email":"a@b.co"}}' \
  "$BASE_URL/api/checkout/stripe")
if [ "$code" = "503" ] || [ "$code" = "400" ]; then
  printf '  \033[32m✓\033[0m %-46s [%s]\n' "checkout rechaza item inválido / sin claves" "$code"; pass=$((pass+1))
else
  printf '  \033[31m✗\033[0m %-46s [%s]\n' "checkout DEBERÍA proteger (503/400)" "$code"; fail=$((fail+1))
fi

# Webhook sin firma -> 400 (con secreto) o 503 (sin secreto); nunca 200.
wcode=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/webhooks/stripe")
if [ "$wcode" = "400" ] || [ "$wcode" = "503" ]; then
  printf '  \033[32m✓\033[0m %-46s [%s]\n' "webhook rechaza sin firma válida" "$wcode"; pass=$((pass+1))
else
  printf '  \033[31m✗\033[0m %-46s [%s]\n' "webhook DEBERÍA rechazar (400/503)" "$wcode"; fail=$((fail+1))
fi

echo
echo "Resultado: $pass OK, $fail fallos"
[ "$fail" -eq 0 ]
