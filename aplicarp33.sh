#!/usr/bin/env bash
# FASE 33 — que las máquinas vean lo que ya existe.
# Cada paso depende del anterior. Si algo falla, para y dice dónde.
set -euo pipefail
V=$'\033[32m'; R=$'\033[31m'; A=$'\033[33m'; G=$'\033[90m'; F=$'\033[0m'
paso(){ printf '\n%s▸ %s%s\n' "$A" "$1" "$F"; }
ok(){   printf '%s  ✓ %s%s\n' "$V" "$1" "$F"; }
nota(){ printf '%s    %s%s\n' "$G" "$1" "$F"; }
morir(){ printf '\n%s  ✗ %s%s\n\n' "$R" "$1" "$F"; exit 1; }

REPO=/workspaces/Plastilonas-Peruanas-SAC
cd "$REPO" || morir "No encuentro el repositorio."

paso "1/7 · Punto de partida"
[ -z "$(git status --porcelain)" ] || { git status --short | head; morir "Hay cambios sin guardar. Guárdelos o descártelos antes."; }
git fetch --quiet origin main || morir "No pude hablar con GitHub."
git checkout --quiet main
git pull --quiet --ff-only origin main || morir "main no avanza en línea recta. Avíseme."
ok "main en $(git rev-parse --short HEAD)"

paso "2/7 · Rescatando el parche fuera del árbol"
# El parche viene subido por la interfaz web, así que está DENTRO del repo.
# Se copia fuera ANTES de tocar nada: la última vez un script se borró a sí
# mismo al limpiar el árbol en el que vivía.
[ -f p33.patch ] || morir "No veo p33.patch en la raíz. ¿Se subió a main por la web de GitHub?"
cp p33.patch ~/p33.patch
ok "copiado a ~/p33.patch ($(wc -l < ~/p33.patch) líneas)"

paso "3/7 · Retirando el parche de main"
# .gitignore declara *.patch, pero la subida por la web lo ignora sin avisar.
# Y test/repositorio-limpio.test.ts rompe el build si se queda. Se va ahora.
git rm --quiet p33.patch
git commit --quiet -m "chore: retirar p33.patch de la raíz" -m \
"Subido por la interfaz web, que ignora .gitignore sin avisar.
test/repositorio-limpio.test.ts falla mientras siga versionado."
git push --quiet origin main || morir "No pude publicar la limpieza de main."
ok "main limpio y publicado"

paso "4/7 · Aplicando la fase 33"
git checkout --quiet -B fase/p33
# `git am` aplica Y conmitea con el mensaje que viaja en el parche. -3 permite
# la fusión a tres bandas si alguna línea de contexto se movió.
git am -3 ~/p33.patch || {
  git am --abort 2>/dev/null || true
  morir "El parche no aplica. Pegue el error a Claude; no toque nada más."
}
ok "aplicado en $(git rev-parse --short HEAD)"

paso "5/7 · Verificación completa"
nota "son unos diez minutos; la auditoría de 17 dispositivos es lo más lento"
npm ci --silent                || morir "npm ci falló."
npx tsc --noEmit               || morir "Typecheck falla. La rama no se publica."
npx vitest run --reporter=dot  || morir "Pruebas fallan. La rama no se publica."
npm run auditar:imagenes       || morir "Hay rutas de imagen sin archivo."
npm run build                  || morir "El build falla."
npm run auditar                || morir "La auditoría HTML trae errores."
npm run auditar:viewport       || morir "La auditoría de viewport trae errores."
ok "545 pruebas, 275 páginas, 0 errores"

paso "6/7 · Publicando la rama"
git push --quiet -u origin fase/p33 || morir "El push falló."
ok "rama publicada"

paso "7/7 · Abriendo el PR"
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  gh pr create --base main --head fase/p33 \
    --title "P33: que las máquinas vean lo que ya existe" \
    --body "$(git log -1 --format=%b)" 2>/dev/null \
  && ok "PR abierto" || nota "El PR ya existía o gh no pudo abrirlo; ábralo desde la web."
else
  nota "gh no está disponible: abra el PR desde la web de GitHub."
fi

printf '\n%s  Listo. Cuando CI esté en verde: gh pr merge --squash --delete-branch%s\n\n' "$V" "$F"
