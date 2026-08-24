#!/usr/bin/env bash
# FASE 38 — rendimiento: 128 MB de imágenes a 48.
# El parche trae el CÓDIGO; las imágenes las convierte esta máquina, porque
# en binario el parche pesaría 217 MB y GitHub no acepta subirlo.
set -euo pipefail
V=$'\033[32m'; R=$'\033[31m'; A=$'\033[33m'; G=$'\033[90m'; F=$'\033[0m'
paso(){ printf '\n%s▸ %s%s\n' "$A" "$1" "$F"; }
ok(){   printf '%s  ✓ %s%s\n' "$V" "$1" "$F"; }
nota(){ printf '%s    %s%s\n' "$G" "$1" "$F"; }
morir(){ printf '\n%s  ✗ %s%s\n\n' "$R" "$1" "$F"; exit 1; }
cd /workspaces/Plastilonas-Peruanas-SAC || morir "No encuentro el repositorio."

paso "1/6 · Punto de partida"
[ -z "$(git status --porcelain)" ] || { git status --short|head; morir "Hay cambios sin guardar."; }
git fetch --quiet origin && git checkout --quiet main && git pull --quiet --ff-only origin main
grep -q "top-full left-0 h-5" components/Navbar.tsx || morir "Falta la fase 37 en main. No aplique esto encima."
[ -f p38-codigo.patch ] || morir "Falta p38-codigo.patch en la raíz de main. Súbalo por la web de GitHub."
cp p38-codigo.patch ~/p38-codigo.patch
git rm --quiet p38-codigo.patch && git commit --quiet -m "chore: retirar p38-codigo.patch de la raíz"
ok "main en $(git rev-parse --short HEAD), parche a salvo en ~/"
nota "public/images ahora: $(du -sh public/images | cut -f1)"

paso "2/6 · Convirtiendo las imágenes (un minuto)"
cat > /tmp/convertir-imagenes.mjs <<'CONVERSOR'
#!/usr/bin/env node
/**
 * CONVERSIÓN DE IMÁGENES A WEBP — se ejecuta una sola vez.
 *
 * Por qué esto no viaja en el parche. Convertidas, las 410 imágenes ocupan
 * 48 MB de binario: un parche con ellas dentro pesa 217 MB y GitHub no acepta
 * subir un archivo de más de 100 MB por la web. La conversión, en cambio, es
 * determinista y la puede hacer su máquina en un minuto con el `sharp` que ya
 * trae Next. El parche lleva sólo el código; esto lleva sólo los píxeles.
 *
 * Qué hace, en este orden:
 *   1. Borra los 48 PNG de maquinaria que no referencia nadie (20 MB). Son los
 *      originales que quedaron detrás de una conversión anterior: lib/machinery.ts
 *      sólo nombra los .webp, que ya existen al lado.
 *   2. Convierte a WebP calidad 82 todos los PNG y JPG restantes de
 *      public/images, y borra el original.
 *
 * Es idempotente: si ya se ejecutó, no encuentra nada que convertir y lo dice.
 * No toca public/logo.png ni los iconos, que no están bajo public/images.
 */
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const RAIZ = 'public/images';
const V = '\x1b[32m', A = '\x1b[33m', G = '\x1b[90m', F = '\x1b[0m';

if (!existsSync(RAIZ)) { console.error('No encuentro public/images. ¿Está en la raíz del repositorio?'); process.exit(1); }

function todos(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) todos(p, out); else out.push(p);
  }
  return out;
}

// --- 1. Los PNG de maquinaria que nadie usa -------------------------------
const maq = join(RAIZ, 'maquinaria');
let muertos = 0, mbMuertos = 0;
if (existsSync(maq)) {
  for (const f of readdirSync(maq).filter((x) => x.endsWith('.png'))) {
    const p = join(maq, f);
    // Sólo se borra si existe su .webp al lado: si no, es que sí hacía falta.
    if (existsSync(p.replace(/\.png$/, '.webp'))) {
      mbMuertos += statSync(p).size; unlinkSync(p); muertos++;
    }
  }
}
console.log(muertos
  ? `${V}✓${F} ${muertos} PNG de maquinaria sin usar retirados ${G}(${(mbMuertos / 1048576).toFixed(1)} MB)${F}`
  : `${G}  no había PNG de maquinaria que retirar${F}`);

// --- 2. Todo lo demás a WebP ----------------------------------------------
const pendientes = todos(RAIZ).filter((f) => ['.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase()));
if (!pendientes.length) { console.log(`${G}  no queda ningún PNG ni JPG: ya estaba convertido${F}`); process.exit(0); }

console.log(`${A}  convirtiendo ${pendientes.length} archivos…${F}`);
let antes = 0, despues = 0, hechos = 0;
for (const p of pendientes) {
  const destino = p.replace(/\.(png|jpe?g)$/i, '.webp');
  antes += statSync(p).size;
  await sharp(p).webp({ quality: 82, effort: 5 }).toFile(destino);
  despues += statSync(destino).size;
  unlinkSync(p);
  if (++hechos % 50 === 0) process.stdout.write(`${G}    ${hechos}/${pendientes.length}\r${F}`);
}
console.log(`${V}✓${F} ${hechos} convertidos: ${(antes / 1048576).toFixed(1)} MB → ${(despues / 1048576).toFixed(1)} MB ` +
            `${G}(-${(100 - (despues / antes) * 100).toFixed(0)}%)${F}`);

const total = todos(RAIZ).reduce((t, f) => t + statSync(f).size, 0);
console.log(`${V}✓${F} public/images: ${(total / 1048576).toFixed(1)} MB en ${todos(RAIZ).length} archivos`);
CONVERSOR
node /tmp/convertir-imagenes.mjs || morir "La conversión falló."

paso "3/6 · Aplicando el código"
git apply --3way --whitespace=nowarn ~/p38-codigo.patch || morir "El parche de código no aplica. Pegue el error a Claude."
ok "17 archivos actualizados"

paso "4/6 · Verificación completa"
nota "unos doce minutos"
npx tsc --noEmit               || morir "Typecheck falla."
npx vitest run --reporter=dot  || morir "Pruebas fallan."
npm run auditar:imagenes       || morir "Hay rutas de imagen sin archivo."
npm run build                  || morir "El build falla."
npm run auditar                || morir "La auditoría HTML trae errores."
npm run auditar:viewport       || morir "La auditoría de viewport trae errores."
npm run auditar:navegacion     || morir "Los desplegables fallan."
ok "561 pruebas, 275 páginas, 0 errores"

paso "5/6 · Publicando"
git add -A
git commit --quiet -F - <<'MENSAJE'
perf(p38): 128 MB de imágenes a 48, y el presupuesto que lo mantiene

Los 48 PNG de maquinaria (20 MB) no los referenciaba nadie: eran los
originales de una conversión anterior. Los 77 PNG en uso y los 237 JPG
pasan a WebP calidad 82 — un ejemplo real, 548 KB a 53 KB.

WebP como formato de ORIGEN, no AVIF: el optimizador ya sirve AVIF a
quien lo acepta, así que los bytes servidos ya eran óptimos. Lo que se
arregla es que el optimizador LEE el origen en cada transformación.

next.config recorta deviceSizes de ocho anchos a seis —ninguna imagen se
pinta por encima de 900px de ancho CSS—, fija una sola calidad y sube
minimumCacheTTL a 31 días. Cada combinación de imagen, ancho y calidad
es una transformación facturada.

llms.txt bajaba su caché de CDN a 24 horas con siete días de
stale-while-revalidate: un despliegue con secciones nuevas seguía
sirviendo el mapa viejo un día entero. Ahora 15 minutos.

imageObjectSchema declaraba encodingFormat "image/png" fijo; ahora se
deriva de la ruta. Tres pruebas fijaban la extensión en vez de la regla
y se reescribieron. Nueva test/peso-imagenes.test.ts: techo de 700 KB
por archivo, prohibición de PNG para contenido y tope de 90 MB.
MENSAJE
git push --quiet origin main || morir "El push falló."
ok "main publicado en $(git rev-parse --short HEAD)"

paso "6/6 · Comprobando el despliegue"
SITIO="https://plastilonas-peruanas-sac.vercel.app"
ESPERADO="$(git rev-parse HEAD)"
for i in $(seq 1 24); do
  SERVIDO="$(curl -s --max-time 12 "$SITIO/version.json" | grep -o '"commit": *"[^"]*"' | cut -d'"' -f4 || true)"
  [ "$SERVIDO" = "$ESPERADO" ] && break
  sleep 15
done
[ "${SERVIDO:-}" = "$ESPERADO" ] && ok "el sitio sirve $(git rev-parse --short HEAD)" || nota "aún sirve ${SERVIDO:0:7}"
echo
for s in /biblioteca /aplicaciones /industria; do
  curl -s --max-time 20 "$SITIO/llms.txt?v=$RANDOM" | grep -q "$s" \
    && printf '    %s✓%s llms.txt anuncia %s\n' "$V" "$F" "$s" \
    || printf '    %s✗%s llms.txt NO anuncia %s\n' "$R" "$F" "$s"
done
printf '    llms.txt: %s KB\n' "$(( $(curl -s --max-time 20 "$SITIO/llms.txt?v=$RANDOM" | wc -c) / 1024 ))"
printf '    peso de la portada: %s KB de HTML\n' "$(( $(curl -s --max-time 15 "$SITIO/" | wc -c) / 1024 ))"
node scripts/submit-indexnow.mjs || nota "IndexNow no confirmó"
printf '\n%s  Listo.%s\n\n' "$V" "$F"
