#!/usr/bin/env bash
# Coloca las 71 imágenes de la galería en public/images/maquinaria/ a partir
# de los dos ZIP ya subidos al repo. Idempotente: reporta ok/skip y descarta
# el PNG truncado de la variante B de la máquina 02.
set -euo pipefail

Z0="galeria-maquinaria-plastilonas.zip"
Z1="galeria-maquinaria-plastilonas (1).zip"
DEST="public/images/maquinaria"

for z in "$Z0" "$Z1"; do
  [ -f "$z" ] || { echo "MISS: falta $z en la raíz del repo"; exit 1; }
done

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/a" "$TMP/b" "$DEST"
unzip -qo "$Z0" -d "$TMP/a"
unzip -qo "$Z1" -d "$TMP/b"
A="$TMP/a/galeria-maquinaria-plastilonas/img"
B="$TMP/b/galeria-maquinaria-plastilonas/img"

# slug base por orden (idéntico en ambos zips salvo el sufijo de #06/08/09/10)
map_a=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento \
04-impresora-flexografica 05-corte-automatico 06-coser-industrial-bigbags \
07-calandra-pvc 08-soldadora-alta-frecuencia 09-soldadora-cuna-caliente \
10-soldadora-aire-caliente 11-curvadora-tubo 12-telar-raschel)
map_b=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento \
04-impresora-flexografica 05-corte-automatico 06-coser-bigbags \
07-calandra-pvc 08-soldadora-hf 09-soldadora-cuna \
10-soldadora-aire 11-curvadora-tubo 12-telar-raschel)
# nombre destino canónico por orden
map_d=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento \
04-impresora-flexografica 05-corte-automatico 06-coser-bigbags \
07-calandra-pvc 08-soldadora-alta-frecuencia 09-soldadora-cuna-caliente \
10-soldadora-aire-caliente 11-curvadora-tubo 12-telar-raschel)

cpx(){ if [ -f "$1" ]; then cp -f "$1" "$2"; echo "ok   $(basename "$2")"; else echo "skip (no origen) $(basename "$2")"; fi; }

for i in "${!map_d[@]}"; do
  d="${map_d[$i]}"; a="${map_a[$i]}"; b="${map_b[$i]}"
  # variante A (zip0, íntegra)
  cpx "$A/$a.png"        "$DEST/$d-a.png"
  cpx "$A/$a.webp"       "$DEST/$d-a.webp"
  cpx "$A/$a-thumb.webp" "$DEST/$d-a-thumb.webp"
  # variante B (zip1) — el PNG de #02 llegó truncado: se omite, se usan sus WebP
  if [ "$d" = "02-telar-circular" ]; then
    echo "skip 02-telar-circular-b.png (PNG truncado en zip1; se usan sus WebP)"
  else
    cpx "$B/$b.png"      "$DEST/$d-b.png"
  fi
  cpx "$B/$b.webp"       "$DEST/$d-b.webp"
  cpx "$B/$b-thumb.webp" "$DEST/$d-b-thumb.webp"
done

echo "----"
echo "Imágenes en $DEST: $(ls -1 "$DEST" | wc -l) (esperado: 71)"
