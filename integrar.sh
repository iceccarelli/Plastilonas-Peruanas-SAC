#!/usr/bin/env bash
#
# INTEGRACIÓN DE LAS FASES 29 A 32 — Plastilonas Peruanas SAC
#
# Por qué existe este script y no unas instrucciones sueltas:
#
# Las últimas tres tandas de trabajo se subieron al repositorio como archivos
# .patch a través de la interfaz web de GitHub y nunca llegaron a integrarse.
# El resultado fue que el HEAD publicado seguía en P28 mientras el árbol de
# trabajo local tenía P29/P30 aplicado sin commitear, y p32.patch —construido
# sobre ese estado local— no aplicaba sobre el HEAD. Ocho .patch en la raíz,
# ninguno integrado, y ninguna forma evidente de saber cuál iba primero.
#
# Este script cierra ese ciclo: parte del HEAD publicado, aplica UN parche
# consolidado, y solo commitea si el build, las pruebas y las dos auditorías
# pasan. Si algo falla, aborta y deja la rama a medias para inspeccionarla,
# sin tocar main.
#
# Uso:
#   bash integrar.sh
#
set -euo pipefail

RAMA="integracion/p29-p32"
PARCHE="integrar.patch"
VERDE=$'\033[32m'; ROJO=$'\033[31m'; AMBAR=$'\033[33m'; GRIS=$'\033[90m'; FIN=$'\033[0m'

paso()  { printf '\n%s▸ %s%s\n' "$AMBAR" "$1" "$FIN"; }
ok()    { printf '%s  ✓ %s%s\n' "$VERDE" "$1" "$FIN"; }
morir() { printf '\n%s  ✗ %s%s\n\n' "$ROJO" "$1" "$FIN"; exit 1; }
nota()  { printf '%s    %s%s\n' "$GRIS" "$1" "$FIN"; }

# ─────────────────────────────────────────────────────────────────────────────
paso "Comprobaciones previas"

[ -f package.json ] || morir "Ejecute esto desde la raíz del repositorio."
[ -f "$PARCHE" ]    || morir "No encuentro $PARCHE en la raíz. Descárguelo aquí primero."
command -v git >/dev/null || morir "git no está disponible."

# El parche se copia FUERA del repositorio antes de tocar nada.
#
# La primera versión de este script guardaba el trabajo local con
# `git stash push --include-untracked`, y eso se llevaba al stash el propio
# parche y el propio script, que también son archivos sin seguimiento. El
# script seguía vivo en memoria pero el parche desaparecía del disco a mitad
# de ejecución. Se detectó probándolo; no habría dado la cara leyéndolo.
COPIA_PARCHE="$(mktemp -t integrar-XXXXXX.patch)"
cp "$PARCHE" "$COPIA_PARCHE"
trap 'rm -f "$COPIA_PARCHE"' EXIT
ok "estoy en la raíz del repositorio; el parche está a salvo fuera del árbol"

# El parche se construyó contra el HEAD publicado. Si el árbol local va por
# delante o por detrás, aplicarlo produce conflictos silenciosos.
git fetch --quiet origin main
BASE_ESPERADA="bffeee8"
BASE_REAL="$(git rev-parse --short origin/main)"
if [ "$BASE_REAL" != "$BASE_ESPERADA" ]; then
  nota "origin/main está en $BASE_REAL; el parche se construyó sobre $BASE_ESPERADA."
  nota "Si alguien ha subido algo desde entonces, hay que regenerar el parche."
  morir "La base no coincide. Pare y avise antes de continuar."
fi
ok "origin/main está en $BASE_REAL, que es la base del parche"

# ─────────────────────────────────────────────────────────────────────────────
paso "Poniendo a salvo el trabajo local sin commitear"

# Aquí hay dos clases de cambio local y ambas estorban, por motivos distintos:
#
#   · Los archivos MODIFICADOS con seguimiento se arrastrarían a la rama nueva.
#   · Los archivos NUEVOS sin seguimiento —los que creó p29p30completo.patch:
#     lib/industrias.ts, app/industria/, lib/ruc.ts, test/industrias.test.ts…—
#     hacen que el parche falle con «already exists in working directory».
#
# Así que se guardan los dos, con una excepción explícita: este script y su
# parche, que también están sin seguimiento y que llevárselos al stash dejaría
# la ejecución sin sus propios insumos a mitad de camino.
#
# Todo lo que se guarda aquí está contenido en el parche consolidado, de modo
# que el stash es una red de seguridad, no una pieza necesaria.
GUION="$(basename "${BASH_SOURCE[0]}")"

# Las exclusiones se calculan, no se dan por supuestas. `.gitignore` de este
# repositorio lleva `*.patch` («patch delivery artifacts (never commit)»), y
# nombrar un archivo ya ignorado dentro del pathspec hace que git aborte con
# «paths are ignored by one of your .gitignore files». Además, un archivo
# ignorado nunca entra en `--include-untracked`, así que excluirlo tampoco
# haría falta. Se excluye únicamente lo que git sí se llevaría.
EXCLUSIONES=(".")
for archivo in "$PARCHE" "$GUION"; do
  if [ -e "$archivo" ] && ! git check-ignore -q "$archivo"; then
    EXCLUSIONES+=(":(exclude)$archivo")
  fi
done

if [ -n "$(git status --porcelain)" ]; then
  ETIQUETA="respaldo-antes-de-integrar-$(date +%Y%m%d-%H%M%S)"
  git stash push --include-untracked --message "$ETIQUETA" \
    -- "${EXCLUSIONES[@]}" >/dev/null
  ok "cambios locales guardados en el stash «$ETIQUETA»"
  nota "recuperables con: git stash list && git stash apply stash@{0}"
  nota "su contenido (P29/P30) ya está incluido en el parche; el stash es solo un seguro"
else
  ok "el árbol de trabajo estaba limpio"
fi

# Comprobación explícita: si algo sobrevivió al stash y colisiona con el
# parche, es mejor detenerse aquí que descubrirlo con el árbol a medias.
if [ -n "$(git status --porcelain --untracked-files=normal | grep -vE "$PARCHE|$GUION" || true)" ]; then
  nota "queda esto sin guardar:"
  git status --short | grep -vE "$PARCHE|$GUION" | head -10
  morir "El árbol no quedó limpio. Revíselo antes de continuar."
fi
ok "árbol de trabajo limpio"

paso "Creando la rama de integración"

git checkout --quiet -B "$RAMA" origin/main
ok "rama $RAMA creada a partir de origin/main"
nota "main no se toca en ningún momento de este script"

# ─────────────────────────────────────────────────────────────────────────────
paso "Aplicando el parche consolidado"

git apply --check "$COPIA_PARCHE" 2>/dev/null || morir "El parche no aplica limpio. No se ha modificado nada."
git apply --whitespace=nowarn "$COPIA_PARCHE"
ok "$(git status --porcelain | wc -l | tr -d ' ') archivos modificados"

# ─────────────────────────────────────────────────────────────────────────────
paso "Instalando dependencias"

if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi
ok "dependencias instaladas"

# ─────────────────────────────────────────────────────────────────────────────
paso "Puerta 1 de 4 — tipos"

npx tsc --noEmit || morir "El typecheck falla. Nada commiteado."
ok "sin errores de tipo"

# ─────────────────────────────────────────────────────────────────────────────
paso "Puerta 2 de 4 — pruebas"

npm test || morir "Las pruebas fallan. Nada commiteado."
ok "suite en verde"

# ─────────────────────────────────────────────────────────────────────────────
paso "Puerta 3 de 4 — build y auditoría del HTML generado"

npm run build || morir "El build falla. Nada commiteado."
npm run auditar || morir "La auditoría del HTML encuentra errores. Nada commiteado."
ok "build y auditoría HTML correctos"

# ─────────────────────────────────────────────────────────────────────────────
paso "Puerta 4 de 4 — matriz de dispositivos"

# Esta es la puerta que no existía cuando el CTA principal llevaba semanas
# fuera de pantalla en Full HD sin que ninguna prueba lo notara.
if npx --no-install playwright --version >/dev/null 2>&1; then
  npx playwright install --with-deps chromium >/dev/null 2>&1 || true
  npm run auditar:viewport || morir "Hay recortes o desbordes en algún dispositivo. Nada commiteado."
  ok "0 desbordes y 0 recortes en 17 anchos de dispositivo"
else
  nota "playwright no disponible; esta puerta se omite y se ejecutará en CI"
fi

# ─────────────────────────────────────────────────────────────────────────────
paso "Commit"

git add -A
git commit --quiet --file=- <<'MENSAJE'
feat(p29-p32): fases 29 a 32 consolidadas

Reúne tres tandas que vivían como .patch sueltos en la raíz y nunca se
integraron. Van juntas porque nacieron de la misma base y se pisaban:
por separado no aplican en ningún orden sin conflicto.

P29/P30 — descubribilidad
  IndexNow, presupuesto de títulos (58 recortados por Google → 0),
  cinco hubs sectoriales, RUC validado, glosario, informes, marco de
  evaluación, calculadoras, auditor del HTML generado en CI.

P32 — motor comercial e identidad
  Middleware de dominio con interruptor CANONICAL_ORIGIN, lib/facts.ts
  como fuente única de conteos y antigüedad, biblioteca de
  especificación, hubs de aplicación, portal de comprador
  internacional, exportación, distribuidores, socios, calidad,
  confianza, configurador FIBC, entidad.json.

Resoluciones al integrar
  /industrias eliminado por canibalizar a /industria; nueve 301
  recogen la ruta antigua. El noindex del host de Vercel queda
  condicionado a que el dominio de marca esté vivo: sin esa condición
  el despliegue habría desindexado el sitio entero. /proyectos no
  publica ninguna ficha sin verificado:true.

Cabecera
  Navegación de once entradas a seis agrupadas: con once, el CTA
  «Solicitar Cotización» quedaba fuera de pantalla en 1280, 1366,
  1440, 1536 y 1920 px. Guarda de desbordamiento medida con
  ResizeObserver, área segura, dvh, áreas táctiles, y
  scripts/auditar-viewport.mjs sobre 17 dispositivos en CI.

Se eliminan los ocho .patch de la raíz: su contenido está aquí.
MENSAJE
ok "commit creado en $RAMA"

# ─────────────────────────────────────────────────────────────────────────────
paso "Publicando la rama"

git push --quiet --set-upstream origin "$RAMA"
ok "rama publicada"

if command -v gh >/dev/null 2>&1; then
  gh pr create \
    --base main --head "$RAMA" \
    --title "Fases 29 a 32 consolidadas" \
    --body "$(cat <<'CUERPO'
Integra P29, P30 y P32 en un solo commit, verificado sobre un clon limpio.

### Por qué en un solo commit
Las tres tandas nacieron de la misma base (P28) y modifican los mismos
archivos (`app/sitemap.ts`, `lib/site.ts`, `lib/lead.ts`,
`components/Footer.tsx`). Aplicadas por separado no hay orden que no
produzca conflictos.

### Lo que se detuvo antes de llegar a producción
- **Desindexación del sitio.** El middleware emitía `X-Robots-Tag: noindex`
  en todo host `*.vercel.app` — que es donde vive el sitio hoy. Ahora
  depende de `CANONICAL_ORIGIN` y está apagado por defecto.
- **Canibalización sectorial.** `/industrias` (8 slugs superficiales)
  competía con `/industria` (5 sectores con contenido de compra). Se
  conserva el profundo; nueve 301 recogen la ruta antigua.
- **CTA invisible.** Con once entradas de menú, «Solicitar Cotización»
  quedaba fuera de pantalla en 1280, 1366, 1440, 1536 y 1920 px.

### Verificación
| | Antes | Después |
|---|---|---|
| Pruebas | 452 | **517** |
| Páginas construidas | 249 | **275** |
| Avisos de auditoría HTML | 128 | **57** |
| Errores de auditoría HTML | 0 | **0** |
| Recortes de cabecera (17 dispositivos) | 48 | **0** |

### Pendiente, y solo lo puede decidir una persona
- Apuntar el DNS de `plastilonas.com` y poner `CANONICAL_ORIGIN` en Vercel.
- Confirmar cuáles de las cinco fichas de `/proyectos` son ciertas para
  ponerlas en `verificado: true`.
CUERPO
)" || nota "no se pudo abrir el PR automáticamente; ábralo desde la web"
  ok "pull request abierto"
else
  nota "gh no está instalado; abra el PR desde la web de GitHub"
fi

printf '\n%s Integración completa. main sigue intacta; revise el PR y haga merge.%s\n\n' "$VERDE" "$FIN"
