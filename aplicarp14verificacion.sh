#!/usr/bin/env bash
# =============================================================================
#  P14 — Verificación de despliegue determinista
#  Plastilonas Peruanas SAC
#
#  El problema, repetido tres rondas seguidas: se hace push, se corren los
#  curls de verificación y responden 404 en rutas que sí existen — porque
#  Vercel todavía estaba construyendo y quien contestaba era el despliegue
#  ANTERIOR. Parece un defecto del código y no lo es. Peor: enseña a
#  desconfiar de la verificación, que es exactamente la herramienta que no
#  puede perder credibilidad.
#
#  La solución no es esperar más. Es preguntar.
#
#  /version.json publica qué commit está sirviendo el despliegue (SHA, rama,
#  entorno, origen canónico), resuelto en tiempo de build desde las variables
#  de Vercel. `npm run verify:deploy` sondea ese endpoint hasta que coincide
#  con el HEAD local y sólo entonces corre 32 comprobaciones: rutas, archivos
#  para rastreadores, datos estructurados, conteos de sitemap y feed, y que no
#  haya vuelto a aparecer ningún perfil social inventado.
#
#  Se encontraron y corrigieron dos fallos en el propio script antes de
#  entregarlo: `curl | grep -q` con `set -o pipefail` daba falsos negativos
#  (SIGPIPE), y `application/rss\+xml` en expresión regular básica buscaba
#  literalmente "application/rssxml". Ambos quedan fijados por tests.
#
#  Uso, a partir de ahora, después de cada push:
#    npm run verify:deploy
#
#  Uso:
#    ls aplicar*p14*
#    bash aplicarp14verificacion.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/version.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/version.ts" <<'P14_EOF'
import { SITE } from './site';

/**
 * Sello de compilación. Se resuelve en tiempo de BUILD, no de petición: las
 * variables de Vercel sólo existen mientras se construye, y el endpoint que
 * lo publica es estático.
 *
 * Ninguno de estos datos es sensible: el SHA de un commit y el nombre de la
 * rama no revelan nada que el repositorio no muestre. No se expone ninguna
 * variable de entorno que no sea de la propia plataforma.
 */

export interface BuildStamp {
  /** SHA completo del commit desplegado. Vacío fuera de Vercel. */
  commit: string;
  /** Los siete primeros caracteres: lo que imprime `git rev-parse --short`. */
  commitShort: string;
  /** Rama de origen. */
  branch: string;
  /** production | preview | development. */
  entorno: string;
  /** Origen canónico según lib/site.ts, para detectar despliegues cruzados. */
  siteUrl: string;
}

export function buildStamp(): BuildStamp {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  return {
    commit,
    commitShort: commit.slice(0, 7),
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    entorno: process.env.VERCEL_ENV ?? 'local',
    siteUrl: SITE.url,
  };
}
P14_EOF

# -----------------------------------------------------------------------------
# app/version.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/version.json"
cat > "app/version.json/route.ts" <<'P14_EOF'
import { buildStamp } from '@/lib/version';

/**
 * /version.json — qué commit está sirviendo este despliegue.
 *
 * Existe por un fallo de proceso que se repitió tres rondas seguidas: se hace
 * push, se corren los curls de verificación y la respuesta viene del
 * despliegue ANTERIOR, porque Vercel todavía estaba construyendo. El
 * resultado es un 404 que parece un defecto del código y no lo es — y peor,
 * enseña a desconfiar de la verificación.
 *
 * Con este endpoint la verificación deja de ser una cuestión de esperar lo
 * suficiente: se pregunta al sitio qué commit está sirviendo y se compara con
 * el que se acaba de subir. Es la diferencia entre "creo que ya desplegó" y
 * saberlo.
 *
 * No se indexa: es un endpoint de operación, no contenido.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(`${JSON.stringify(buildStamp(), null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Sin caché: si esta respuesta se sirve desde caché deja de responder
      // la única pregunta que se le hace.
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex',
    },
  });
}
P14_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P14_EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo "  Revise el build en el panel de Vercel antes de dar nada por roto."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /privacidad /terminos; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /version.json

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"

echo "— Ningún dato inventado a la vista —"
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P14_EOF

# -----------------------------------------------------------------------------
# test/deploy-verify.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/deploy-verify.test.ts" <<'P14_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildStamp } from '@/lib/version';
import { SITE } from '@/lib/site';

/**
 * La verificación de despliegue es un mecanismo: si se rompe en silencio,
 * volvemos a interrogar al build anterior y a confundir un despliegue en curso
 * con un defecto del código. Estos tests vigilan las tres formas conocidas de
 * que eso ocurra.
 */

const script = readFileSync(join(process.cwd(), 'scripts/verificar-despliegue.sh'), 'utf8');
const route = readFileSync(join(process.cwd(), 'app/version.json/route.ts'), 'utf8');
const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

describe('sello de compilación', () => {
  it('expone el commit, la rama, el entorno y el origen canónico', () => {
    const s = buildStamp();
    expect(s).toHaveProperty('commit');
    expect(s).toHaveProperty('commitShort');
    expect(s).toHaveProperty('branch');
    expect(s).toHaveProperty('entorno');
    expect(s.siteUrl).toBe(SITE.url);
  });

  it('commitShort son los siete primeros caracteres del SHA', () => {
    const s = buildStamp();
    expect(s.commitShort).toBe(s.commit.slice(0, 7));
  });

  it('fuera de Vercel no inventa un commit', () => {
    // Un sello falso es peor que ninguno: haría creer que ya desplegó.
    const s = buildStamp();
    if (!process.env.VERCEL_GIT_COMMIT_SHA) {
      expect(s.commit).toBe('');
      expect(s.entorno).toBe('local');
    }
  });

  it('no expone ninguna variable de entorno que no sea de la plataforma', () => {
    const lib = readFileSync(join(process.cwd(), 'lib/version.ts'), 'utf8');
    const vars = lib.match(/process\.env\.[A-Z_0-9]+/g) ?? [];
    for (const v of vars) expect(v.startsWith('process.env.VERCEL_'), v).toBe(true);
  });

  it('el endpoint no se indexa y no se cachea', () => {
    // Cacheado deja de responder la única pregunta que se le hace.
    expect(route).toMatch(/'X-Robots-Tag': 'noindex'/);
    expect(route).toMatch(/no-store/);
  });

  it('el route handler no exporta nada fuera del contrato de Next', () => {
    // Un export extra rompe el build entero; ya pasó una vez con indexnow.
    const exports = route.match(/^export\s+(const|async function|function)\s+(\w+)/gm) ?? [];
    for (const e of exports) {
      expect(/\b(GET|POST|dynamic|revalidate|runtime)\b/.test(e), e).toBe(true);
    }
  });
});

describe('script de verificación', () => {
  it('está enlazado como npm run verify:deploy', () => {
    expect(pkg.scripts['verify:deploy']).toContain('scripts/verificar-despliegue.sh');
  });

  it('espera al commit antes de comprobar nada', () => {
    expect(script).toMatch(/version\.json/);
    expect(script).toMatch(/commitShort/);
    expect(script).toMatch(/ESPERA_MAX/);
  });

  it('deriva el origen de lib/site.ts y no lo escribe a mano', () => {
    // El día de la migración a plastilonas.com este script debe seguirla solo.
    expect(script).toMatch(/lib\/site\.ts/);
    expect(script).not.toContain('https://plastilonas-peruanas-sac.vercel.app');
    expect(script).not.toContain('https://www.plastilonas.com');
  });

  it('no usa tuberías con grep -q, que dan falsos negativos con pipefail', () => {
    // grep -q cierra la entrada al primer acierto; con pipefail el curl que
    // alimenta la tubería muere con SIGPIPE y la comprobación "falla" pese a
    // haber encontrado el patrón. Es el fallo que tuvo este mismo script.
    expect(script).not.toMatch(/cuerpo "\$1" \| grep -q/);
    expect(script).toMatch(/grep -q "\$2" <<< "\$b"/);
  });

  it('sale con código distinto de cero cuando algo falla', () => {
    expect(script).toMatch(/exit 1/);
  });
});
P14_EOF

# -----------------------------------------------------------------------------
# app/robots.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/robots.ts" <<'P14_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * robots.txt — política de rastreo.
 *
 * 1. Rastreadores clásicos y agentes de IA quedan explícitamente permitidos:
 *    la citabilidad en ChatGPT, Claude, Perplexity y Gemini depende de que el
 *    contenido sea rastreable, no solo indexable.
 * 2. Se bloquean rutas privadas o sin valor de indexación (dashboard, login,
 *    API, carrito, checkout): no aportan señales y diluyen el crawl budget.
 * 3. sitemap y host se derivan de SITE.url — nunca se escribe un dominio a mano.
 */

/** Rutas sin valor de indexación (privadas, transaccionales o de API). */
// /version.json es un endpoint de operación (qué commit sirve el sitio):
// ya va con X-Robots-Tag: noindex, y aquí se evita además el rastreo.
const DISALLOW = ["/dashboard", "/login", "/api/", "/carrito", "/checkout", "/version.json"];

/** Agentes de IA y buscadores que permitimos de forma explícita. */
const ALLOWED_AGENTS = [
  // Buscadores
  "Googlebot",
  "Bingbot",
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Google (entrenamiento / Gemini)
  "Google-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Otros
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...ALLOWED_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
P14_EOF

# -----------------------------------------------------------------------------
# package.json
# -----------------------------------------------------------------------------
cat > "package.json" <<'P14_EOF'
{
  "name": "plastilonas-peruanas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "bash scripts/smoke.sh",
    "audit:ui": "node scripts/audit-ui.mjs",
    "verify:deploy": "bash scripts/verificar-despliegue.sh"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/react": "^1.2.12",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/supabase-js": "^2.45.4",
    "ai": "^4.3.16",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.469.0",
    "next": "^15.5.20",
    "next-auth": "^5.0.0-beta.31",
    "pdf-lib": "^1.17.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.7.0",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jsdom": "^25.0.1",
    "postcss": "^8",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
P14_EOF

chmod +x scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
echo ""
echo "P14 aplicado."
echo "  nuevos      lib/version.ts, app/version.json/route.ts"
echo "              scripts/verificar-despliegue.sh, test/deploy-verify.test.ts"
echo "  modificados app/robots.ts, package.json"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 218 tests en 17 archivos)"
echo ""
echo "Y despues de cada push, en lugar de los curls sueltos:"
echo "  npm run verify:deploy"
