#!/usr/bin/env bash
#
# APLICAR UNA ENTREGA .patch DESDE LA RAÍZ DEL REPOSITORIO.
#
# POR QUÉ EXISTE. Los parches se suben por la interfaz web de GitHub a la raíz,
# y esa vía tiene tres manías que ya costaron tres rondas de integración:
#
#   1. Ignora .gitignore, así que el artefacto queda VERSIONADO y
#      test/repositorio-limpio.test.ts —con razón— pone el build en rojo.
#   2. Le quita los guiones al nombre, de modo que siempre aparecen DOS copias
#      del mismo archivo: `etapa-9-x.patch` y `etapa9x.patch`.
#   3. Convive con parches sueltos SIN versionar de otras sesiones, y un
#      `git rm -- *.patch` con el glob del shell los incluye, no encuentra el
#      suelto en el índice y ABORTA entero sin borrar nada. Pasó.
#
# Este script hace la secuencia completa en el orden correcto y se detiene al
# primer fallo, de modo que nunca se empuja algo que no pasó el gate.
#
# Uso:  npm run entrega etapa-10-loquesea.patch
set -euo pipefail

PARCHE="${1:-}"
if [ -z "$PARCHE" ]; then
  echo "Uso: npm run entrega <archivo.patch>" >&2
  echo "Parches en la raíz:" >&2
  ls -1 ./*.patch 2>/dev/null >&2 || echo "  (ninguno)" >&2
  exit 1
fi

if [ ! -f "$PARCHE" ]; then
  echo "No existe '$PARCHE' en $(pwd)." >&2
  exit 1
fi

# Una subida truncada produce un archivo que no empieza por "From <sha>", y
# `git am` lo reporta como «Patch is empty» dejando la sesión a medias.
if ! head -1 "$PARCHE" | grep -q '^From '; then
  echo "'$PARCHE' no parece un parche de git format-patch (su primera línea no empieza por 'From ')." >&2
  echo "Primera línea: $(head -1 "$PARCHE")" >&2
  exit 1
fi

echo "── Limpiando cualquier git am a medias ──"
git am --abort 2>/dev/null || true

echo "── Sincronizando main ──"
git switch main
git pull --ff-only

echo "── Aplicando $PARCHE ──"
git am --3way "$PARCHE"

# SOLO los versionados: `git ls-files` ignora los parches sueltos del disco,
# que es exactamente donde el glob del shell fallaba. `xargs -r` no ejecuta
# nada si la lista viene vacía, así que el script es idempotente.
echo "── Retirando los .patch versionados de la raíz ──"
if git ls-files -z '*.patch' | grep -qz .; then
  git ls-files -z '*.patch' | xargs -0 git rm -q --
  git commit -m "chore: retirar los .patch de la raíz — $PARCHE ya vive en la historia"
else
  echo "  (no había ninguno versionado)"
fi

echo "── Gate completo ──"
npm run typecheck
npm test
npm run lint
npm run build

echo "── Empujando a origin/main ──"
git push origin main
echo "✔ $PARCHE integrado y empujado."
