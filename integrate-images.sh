#!/usr/bin/env bash
# integrate-images.sh — extract the 4 product zips and place the high-quality
# images into the existing FLAT public/images/ paths (overwrite), plus copy the
# extra "hero" shots under clean names. Structure-agnostic: every file is located
# by basename wherever it sits inside the extracted tree, so it works no matter
# how the zips are internally organised.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

STAGE=/tmp/plastilonas-images
ZIPS=(lonas-y-cobertores estructuras-arquitectura-textil ventilacion-industrial mallas-y-geosinteticos)

echo "==> 1. Extract"
rm -rf "$STAGE" && mkdir -p "$STAGE"
for z in "${ZIPS[@]}"; do
  [ -f "$z.zip" ] || { echo "   MISSING $z.zip"; continue; }
  unzip -o -q "$z.zip" -d "$STAGE/$z" && echo "   extracted $z.zip"
done

echo "==> 2. TRUE IMAGE TREE (source of record)"
find "$STAGE" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  -printf '   %8s  %p\n' | sort -k2

# locate <basename> inside the extracted tree; echo first match or empty
locate_src() { find "$STAGE" -type f -iname "$1" -print -quit 2>/dev/null; }

copy_to_public() { # <src-basename> <dest-basename>
  local src; src="$(locate_src "$1")"
  if [ -n "$src" ]; then
    cp -f "$src" "public/images/$2"
    echo "   OK   $2  <=  ${src#$STAGE/}"
  else
    echo "   MISS $1  (no match in tree) — dest public/images/$2 NOT written"
  fi
}

echo "==> 3. Overwrite existing flat images with high-quality versions"
# dest basenames already exist in the repo; sources carry the same basename
for base in \
  lona-a-medida.jpg mantas-camiones.jpg cobertores-multimaterial.jpg mantas-aislantes.jpg \
  mallas-antiafidas.jpg geomembranas.jpg carpas.jpg tensoestructuras.jpg inflables.jpg \
  modulos-campamentos.jpg mangas-ventilacion.jpg ; do
  copy_to_public "$base" "$base"
done

echo "==> 4. Copy extra hero shots under clean names"
# format: "SOURCE_BASENAME_TO_SEARCH::DEST_BASENAME"
for pair in \
  "mangas-ventilacion-y.jpg::mangas-ventilacion-y.jpg" \
  "mangas-produccion.jpg::mangas-produccion.jpg" \
  "techos-escolares.jpg::techos-escolares.jpg" \
  "ojalillo-rafia.jpg::ojalillo-rafia.jpg" \
  "biombos-proteccion.jpg::biombos-proteccion.jpg" ; do
  copy_to_public "${pair%%::*}" "${pair##*::}"
done

echo "==> 5. Any extra source images NOT yet copied (review these names):"
find "$STAGE" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -printf '%f\n' \
  | sort -u > /tmp/_src_names
ls public/images | sort -u > /tmp/_dst_names
comm -23 /tmp/_src_names /tmp/_dst_names | sed 's/^/   unused source: /' || true

echo "==> Done. Image files placed. Next: node scripts/expand-galleries.mjs"
