#!/usr/bin/env bash
# =============================================================================
# stage-catalog-images.sh
# -----------------------------------------------------------------------------
# Coloca las 108 imágenes de galería (27 productos × 4 vistas) desde los cinco
# ZIP del repositorio hacia public/images/galeria/, renombrándolas al slug REAL
# del producto en lib/products.ts y a un sufijo de vista legible:
#   {product-slug}-general.jpg      (vista 1 · hero)
#   {product-slug}-detalle.jpg      (vista 2 · detalle de material)
#   {product-slug}-instalacion.jpg  (vista 3 · instalación en obra)
#   {product-slug}-escala.jpg       (vista 4 · referencia de escala)
#
# Idempotente: puede ejecutarse varias veces sin duplicar ni corromper nada.
# No toca las imágenes existentes en public/images/ (se conservan tal cual).
#
# Los ZIP nombran las carpetas por FAMILIA de imagen; cuatro de ellas difieren
# del slug del producto y se remapean abajo (RENAMES). Dos carpetas
# (barreras-acusticas, geocompuestos-drenaje) NO corresponden a ningún producto
# de los 34 y quedan fuera: se copian a pending-product-images/ para decisión.
#
# Uso:  bash scripts/stage-catalog-images.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Extrayendo los 5 ZIP en carpeta temporal…"
for z in plastilonas-images-0*.zip; do
  [ -f "$z" ] || { echo "ERROR: falta $z en la raíz del repo"; exit 1; }
  unzip -q -o "$z" -d "$TMP"
done

DEST="public/images/galeria"
PENDING="pending-product-images"
mkdir -p "$DEST" "$PENDING"

# image-folder-slug  ->  product-slug  (27 productos que reciben galería)
declare -A MAP=(
  [big-bags-bolsones-polipropileno]=big-bags-bolsones-polipropileno
  [sacos-polytarp-embarque-granel]=sacos-polytarp-embarque-granel
  [bolsas-laminas-pebd-pead]=bolsas-laminas-pebd-pead
  [films-termocontraibles-shrink]=films-termocontraibles-shrink
  [accesorios-instalacion]=accesorios-instalacion
  [lona-plastificada-rafia-polytarp]=lona-plastificada-rafia-polytarp
  [mantas-cobertores-toldos-camiones]=mantas-cobertores-toldos-camiones
  [siders-tolderas-camiones]=siders-tolderas-camiones
  [cobertores-agricolas-multimaterial]=cobertores-agricolas-multimaterial
  [mantas-arpilleras-granjas]=mantas-arpilleras-granjas
  [mantas-aislantes-termicas-termoacusticas]=mantas-aislantes-termicas-termoacusticas
  [carpas-lona-estructuras-metalicas]=carpas-lona-estructuras-metalicas
  [coberturas-tensionadas-arquitectura-textil]=coberturas-tensionadas-arquitectura-textil
  [coberturas-inflables]=coberturas-inflables
  [modulos-albergues-campamentos]=modulos-albergues-campamentos
  [galpones-invernaderos-estructurados]=galpones-invernaderos-estructurados
  [toldos-cerramientos]=toldos-cerramientos
  [mallas-antiafidas]=mallas-antiafidas
  [malla-raschel-sombra]=malla-raschel-sombra
  [malla-anti-pajaro-anti-granizo]=malla-anti-pajaro-anti-granizo
  [mangas-ventilacion-minas-tuneles]=mangas-ventilacion-minas-tuneles
  [biombos-protectores-soldadura]=biombos-protectores-soldadura
  [mulch-madera-picada]=mulch-madera-picada
  # --- remapeos: la carpeta de imagen usa otro nombre que el slug del producto ---
  [banners-gigantografias]=gigantografias-senaletica
  [geomembranas-hdpe-ldpe]=geomembrana-polietileno-pe-hdpe
  [geotextiles-no-tejidos]=geotextiles
  [lonas-publicitarias]=revestimiento-vehicular-toldos-publicitarios
)

# carpetas sin producto en el catálogo -> quedan pendientes de decisión
ORPHANS=(barreras-acusticas geocompuestos-drenaje)

declare -A VIEW=([1]=general [2]=detalle [3]=instalacion [4]=escala)

copied=0
for imgslug in "${!MAP[@]}"; do
  prod="${MAP[$imgslug]}"
  for n in 1 2 3 4; do
    src="$(find "$TMP" -type f -path "*/$imgslug/$imgslug-$n.jpg" | head -n1)"
    if [ -z "$src" ]; then echo "AVISO: no se encontró $imgslug-$n.jpg"; continue; fi
    cp -f "$src" "$DEST/$prod-${VIEW[$n]}.jpg"
    copied=$((copied+1))
  done
done

orphaned=0
for imgslug in "${ORPHANS[@]}"; do
  for n in 1 2 3 4; do
    src="$(find "$TMP" -type f -path "*/$imgslug/$imgslug-$n.jpg" | head -n1)"
    [ -z "$src" ] && continue
    cp -f "$src" "$PENDING/$imgslug-${VIEW[$n]}.jpg"
    orphaned=$((orphaned+1))
  done
done

echo "==> Listo."
echo "    Galería del catálogo : $copied imágenes en $DEST/  (esperado 108)"
echo "    Pendientes sin producto: $orphaned imágenes en $PENDING/  (esperado 8)"
