#!/usr/bin/env bash
# =============================================================================
# P4 — INDEXACIÓN: IndexNow real, verificación de propiedad y dos defectos
#
# Plastilonas Peruanas SAC. Aplica sobre main en b74b91c o posterior.
#
# 1. IndexNow estaba configurado pero era inoperante: enviaba 2 URLs fijas de
#    un sitio de 93 páginas y apuntaba keyLocation a un archivo que no existía,
#    de modo que cada ejecución obtenía 403. Ahora la lista sale del sitemap
#    real y el sitio publica la prueba de propiedad en /indexnow-key.txt.
# 2. El workflow regeneraba public/llms.txt y lo commiteaba: ese estático
#    habría sombreado el endpoint curado /llms.txt. Se retira el generador.
# 3. Verificación de Search Console y Bing por variables de entorno.
# 4. Corrige un defecto de producción: las URLs de retorno de Stripe caían a
#    http://localhost:3000 si NEXT_PUBLIC_SITE_URL no estaba definida.
#
# Uso:   bash apply-p4-indexacion.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Creando directorios"
mkdir -p "app/indexnow-key.txt" .github/workflows docs scripts

echo "==> Escribiendo lib/indexnow.ts"
cat > 'lib/indexnow.ts' <<'PP_EOF'
/**
 * Utilidades de IndexNow compartidas por la ruta de prueba de propiedad
 * (app/indexnow-key.txt/route.ts) y por los tests.
 *
 * Viven aquí y no en la propia ruta porque un route handler de Next solo puede
 * exportar los símbolos que el framework reconoce (GET, POST, dynamic…);
 * cualquier export adicional rompe el contrato de tipos del build.
 */

/**
 * La especificación de IndexNow admite claves de 8 a 128 caracteres, formadas
 * por letras, números y guiones. El patrón está anclado a propósito: una clave
 * válida incrustada en basura no es una clave válida.
 */
export const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

export function isValidIndexNowKey(key: string | undefined): key is string {
  return typeof key === 'string' && INDEXNOW_KEY_PATTERN.test(key);
}

/**
 * Ruta pública donde el sitio publica la clave. Se declara con `keyLocation`
 * en cada envío: al vivir en la raíz, la clave valida todas las URLs del sitio.
 */
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt';
PP_EOF

echo "==> Escribiendo app/indexnow-key.txt/route.ts"
cat > 'app/indexnow-key.txt/route.ts' <<'PP_EOF'
import { isValidIndexNowKey } from '@/lib/indexnow';

/**
 * Prueba de propiedad para IndexNow.
 *
 * IndexNow exige que el sitio publique un archivo de texto con la clave para
 * demostrar control del dominio. La especificación admite dos ubicaciones: la
 * raíz como `{clave}.txt`, o una ruta propia declarada con `keyLocation` en el
 * envío. Usamos la segunda porque la primera exigiría una ruta dinámica en la
 * raíz de la app, que capturaría cualquier URL de primer nivel.
 *
 * Sobre el alcance: la carpeta donde vive el archivo determina qué URLs valida.
 * Al servirlo en la raíz (`/indexnow-key.txt`) la clave cubre todo el sitio; en
 * un subdirectorio solo validaría ese subárbol.
 *
 * Sin INDEXNOW_KEY configurada responde 404: preferimos una ausencia honesta a
 * publicar una clave de relleno que haría fallar la verificación con un 403.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const key = process.env.INDEXNOW_KEY;

  if (!isValidIndexNowKey(key)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
PP_EOF

echo "==> Escribiendo scripts/submit-indexnow.mjs"
cat > 'scripts/submit-indexnow.mjs' <<'PP_EOF'
#!/usr/bin/env node
/**
 * Envío a IndexNow — Bing, Yandex, Seznam, Naver y Yep.
 *
 * Google NO participa en IndexNow: para Google el canal es el sitemap más
 * Search Console. Tampoco se usa aquí la Indexing API de Google, restringida a
 * JobPosting y BroadcastEvent; usarla para páginas normales arriesga la cuenta.
 *
 * Qué cambió respecto de la versión anterior: enviaba dos URLs fijas ("/" y
 * "/productos") de un sitio que hoy tiene más de noventa páginas, y apuntaba
 * keyLocation a `{clave}.txt` en la raíz, archivo que nunca existió — es decir,
 * cada ejecución obtenía 403 y no indexaba nada. Ahora la lista se deriva del
 * sitemap real en producción, de modo que crece sola con el sitio.
 *
 * Uso:
 *   INDEXNOW_KEY=... SITE_URL=https://... node scripts/submit-indexnow.mjs
 *   node scripts/submit-indexnow.mjs --dry-run          (no envía nada)
 *   node scripts/submit-indexnow.mjs https://.../una-url (envía solo esas)
 */

const KEY = process.env.INDEXNOW_KEY;
const SITE_URL = (process.env.SITE_URL || 'https://plastilonas-peruanas-sac.vercel.app').replace(/\/$/, '');
const KEY_LOCATION = `${SITE_URL}/indexnow-key.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicitUrls = args.filter((a) => a.startsWith('http'));

/** La especificación admite 8–128 caracteres hexadecimales, letras y guiones. */
const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

async function urlsFromSitemap() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml respondió ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(locs)];
}

async function main() {
  if (!KEY || !KEY_PATTERN.test(KEY)) {
    console.error('INDEXNOW_KEY ausente o con formato inválido (8–128 caracteres alfanuméricos o guiones).');
    process.exit(1);
  }

  // Verificamos la prueba de propiedad ANTES de enviar: si el archivo no
  // devuelve exactamente la clave, el envío obtendrá 403 y no lo sabríamos.
  const proof = await fetch(KEY_LOCATION);
  const proofText = proof.ok ? (await proof.text()).trim() : '';
  if (proofText !== KEY) {
    console.error(
      `La prueba de propiedad falló. ${KEY_LOCATION} devolvió ${proof.status}` +
        (proof.ok ? ' con un contenido distinto de la clave.' : '.') +
        '\nConfigure INDEXNOW_KEY en el entorno de producción y despliegue antes de enviar.',
    );
    process.exit(1);
  }

  const urls = explicitUrls.length ? explicitUrls : await urlsFromSitemap();
  if (!urls.length) {
    console.log('No hay URLs para enviar.');
    return;
  }

  const host = new URL(SITE_URL).host;
  const foreign = urls.filter((u) => new URL(u).host !== host);
  if (foreign.length) {
    console.error(`Hay ${foreign.length} URL(s) de otro host; IndexNow las rechazaría (422). Abortando.`);
    process.exit(1);
  }

  console.log(`${urls.length} URLs · host ${host} · keyLocation ${KEY_LOCATION}`);
  if (dryRun) {
    console.log(urls.join('\n'));
    console.log('--dry-run: no se envió nada.');
    return;
  }

  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const lote = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation: KEY_LOCATION, urlList: lote }),
    });
    // 200 = aceptado, 202 = recibido y pendiente de validar la clave.
    const ok = res.status === 200 || res.status === 202;
    console.log(`Lote de ${lote.length} URLs → HTTP ${res.status}${ok ? '' : ' (fallo)'}`);
    if (!ok) {
      console.error(await res.text().catch(() => ''));
      process.exit(1);
    }
  }
  console.log('Envío a IndexNow completado.');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
PP_EOF

echo "==> Escribiendo .github/workflows/seo-maintenance.yml"
cat > '.github/workflows/seo-maintenance.yml' <<'PP_EOF'
name: SEO Maintenance

# Qué hace: tras cada despliegue a main, avisa a los buscadores que participan
# en IndexNow (Bing, Yandex, Seznam, Naver, Yep) de TODAS las URLs del sitemap.
# Google no participa en IndexNow: su canal es el sitemap más Search Console.
#
# Qué dejó de hacer, y por qué: antes regeneraba public/llms.txt con
# scripts/generate-llms.mjs y lo commiteaba. Desde que /llms.txt se sirve desde
# app/llms.txt/route.ts —derivado de lib/site.ts, lib/products.ts, ciudades y
# artículos— ese archivo estático competía por la misma ruta y habría terminado
# sombreando el endpoint curado con una versión autogenerada y más pobre.

on:
  push: { branches: [main] }
  schedule: [{ cron: "0 6 * * 1" }]   # lunes 06:00 UTC — red de seguridad semanal
  workflow_dispatch:

permissions:
  contents: read

jobs:
  indexnow:
    runs-on: ubuntu-latest
    # Sin clave configurada el envío obtendría 403: mejor no ejecutarlo.
    if: ${{ vars.SITE_URL != '' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }

      - name: Esperar a que Vercel publique el despliegue
        run: sleep 60

      - name: Enviar todas las URLs del sitemap a IndexNow
        env:
          INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
          SITE_URL: ${{ vars.SITE_URL }}
        run: node scripts/submit-indexnow.mjs
PP_EOF

echo "==> Escribiendo test/indexnow.test.ts"
cat > 'test/indexnow.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isValidIndexNowKey, INDEXNOW_KEY_PATTERN } from '@/lib/indexnow';
import { siteUrl } from '@/lib/stripe';
import { SITE } from '@/lib/site';

const ROOT = process.cwd();

describe('IndexNow: prueba de propiedad', () => {
  it('acepta claves dentro del rango de la especificación (8–128)', () => {
    expect(isValidIndexNowKey('a'.repeat(8))).toBe(true);
    expect(isValidIndexNowKey('a'.repeat(128))).toBe(true);
    expect(isValidIndexNowKey('7f3c9b1e-42aa-4d0e-9c11-5b6d7e8f9a0b')).toBe(true);
  });

  it('rechaza claves cortas, largas, vacías o con caracteres no admitidos', () => {
    expect(isValidIndexNowKey('corta')).toBe(false);
    expect(isValidIndexNowKey('a'.repeat(129))).toBe(false);
    expect(isValidIndexNowKey('')).toBe(false);
    expect(isValidIndexNowKey(undefined)).toBe(false);
    expect(isValidIndexNowKey('clave con espacios')).toBe(false);
    expect(isValidIndexNowKey('clave_con_guion_bajo')).toBe(false);
  });

  it('el patrón está anclado: no valida una subcadena dentro de basura', () => {
    expect(INDEXNOW_KEY_PATTERN.test('!!!validkey123!!!')).toBe(false);
  });
});

describe('IndexNow: el script de envío', () => {
  const script = readFileSync(join(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');

  it('deriva las URLs del sitemap y no de una lista fija', () => {
    expect(script).toContain('/sitemap.xml');
    expect(script).toMatch(/<loc>/);
  });

  it('apunta keyLocation al archivo que el sitio publica realmente', () => {
    expect(script).toContain('/indexnow-key.txt');
    expect(script).not.toMatch(/\$\{KEY\}\.txt/);
  });

  it('verifica la prueba de propiedad antes de enviar', () => {
    expect(script).toContain('KEY_LOCATION');
    expect(script).toMatch(/proof/i);
  });

  it('trata 200 y 202 como éxito, según la especificación', () => {
    expect(script).toContain('res.status === 200');
    expect(script).toContain('res.status === 202');
  });
});

describe('llms.txt: una sola fuente de verdad', () => {
  it('/llms.txt se sirve desde el route handler', () => {
    expect(existsSync(join(ROOT, 'app/llms.txt/route.ts'))).toBe(true);
  });

  it('NO existe public/llms.txt: un estático ahí sombrearía la ruta curada', () => {
    expect(existsSync(join(ROOT, 'public/llms.txt'))).toBe(false);
    expect(existsSync(join(ROOT, 'public/llms-full.txt'))).toBe(false);
  });

  it('ningún script regenera llms.txt en paralelo al route handler', () => {
    expect(existsSync(join(ROOT, 'scripts/generate-llms.mjs'))).toBe(false);
  });

  it('el workflow ya no ejecuta ni commitea el generador de llms', () => {
    const wf = readFileSync(join(ROOT, '.github/workflows/seo-maintenance.yml'), 'utf8');
    // Se comprueba la INVOCACIÓN, no la prosa: el comentario del workflow
    // explica por qué se retiró y debe poder nombrar el script.
    expect(wf).not.toMatch(/node\s+scripts\/generate-llms/);
    expect(wf).not.toMatch(/git\s+add[^\n]*llms/);
    expect(wf).not.toMatch(/git\s+commit[^\n]*llms/);
  });
});

describe('URLs de retorno de Stripe', () => {
  it('nunca cae a localhost fuera de desarrollo', () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    try {
      expect(siteUrl()).toBe(SITE.url);
      expect(siteUrl()).not.toContain('localhost');
    } finally {
      if (original !== undefined) process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it('respeta NEXT_PUBLIC_SITE_URL y le quita la barra final', () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.plastilonas.com/';
    try {
      expect(siteUrl()).toBe('https://www.plastilonas.com');
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });
});
PP_EOF

echo "==> Escribiendo docs/SEO-FOUNDATION.md"
cat > 'docs/SEO-FOUNDATION.md' <<'PP_EOF'
# Fundación SEO y de citabilidad — estado y operación

Documento operativo. Describe **lo que el repositorio hace hoy**, no un plan.
Si algo aquí deja de ser cierto, corrija el documento en el mismo commit.

## Principio que gobierna todo

`lib/site.ts` es la única fuente de verdad del dominio. `robots.ts`, `sitemap.ts`,
`/llms.txt`, `metadataBase`, todos los canonicals, las imágenes Open Graph y cada
bloque JSON-LD derivan de `SITE.url`. **Nunca** se escribe un dominio a mano.

Cuando el DNS de `plastilonas.com` apunte a este proyecto de Vercel, se cambia
esa única línea y todo lo demás se reajusta solo. Añada además las redirecciones
301 desde el sitio antiguo para no perder el historial de enlaces.

## Qué existe hoy

| Superficie | Ruta | Origen del contenido |
|---|---|---|
| Catálogo | `/productos` + 36 fichas | `lib/products.ts` |
| Familias | `/productos/familia/[slug]` (11) | `lib/families.ts` + `productFamilies` |
| Cobertura local | `/local` + 12 ciudades | `data/ciudades.json` |
| Guías técnicas | `/recursos` + 10 artículos | `lib/articles.ts` |
| Mapa para agentes | `/llms.txt` | `app/llms.txt/route.ts` (derivado) |
| Rastreo | `/robots.txt`, `/sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` |
| Propiedad IndexNow | `/indexnow-key.txt` | `INDEXNOW_KEY` del entorno |

Grafo de entidad JSON-LD, con un solo nodo por entidad y todo lo demás
referenciándolo por `@id`:

- `${SITE.url}/#organization` — Organization
- `${SITE.url}/#business` — LocalBusiness
- `${SITE.url}/#website` — WebSite con SearchAction

Las páginas internas **no** redeclaran esos nodos: los referencian
(`lib/schema.ts` → `organizationRef`, `businessRef`, `websiteRef`).

## Variables de entorno

Configúrelas en Vercel → Project → Settings → Environment Variables.
Todas son opcionales: si faltan, la funcionalidad correspondiente se desactiva
de forma limpia en lugar de publicar datos de relleno.

| Variable | Para qué | Si falta |
|---|---|---|
| `INDEXNOW_KEY` | Prueba de propiedad en `/indexnow-key.txt` y envíos a IndexNow | La ruta responde 404 y el script aborta antes de enviar |
| `GOOGLE_SITE_VERIFICATION` | Meta de verificación de Search Console | No se emite la meta |
| `BING_SITE_VERIFICATION` | Meta `msvalidate.01` de Bing Webmaster Tools | No se emite la meta |
| `NEXT_PUBLIC_SITE_URL` | Origen de las URLs de retorno de Stripe | Se usa `SITE.url` (nunca localhost en producción) |

`INDEXNOW_KEY` debe cumplir la especificación: entre 8 y 128 caracteres, solo
letras, números y guiones. Genérela así:

```bash
node -e "console.log(crypto.randomUUID())"
```

## Puesta en marcha — checklist del operador

Una sola vez, unos diez minutos:

1. **Generar y configurar la clave de IndexNow.** Cree la variable
   `INDEXNOW_KEY` en Vercel y despliegue. Verifique:
   `curl -s https://<sitio>/indexnow-key.txt` debe devolver exactamente la clave.
2. **Google Search Console.** Añada la propiedad, elija verificación por
   etiqueta HTML, copie el valor `content` a `GOOGLE_SITE_VERIFICATION` en
   Vercel, despliegue y pulse Verificar. Después envíe `/sitemap.xml`.
3. **Bing Webmaster Tools.** Igual, con `BING_SITE_VERIFICATION`. Bing permite
   importar la propiedad desde Search Console, lo que ahorra el paso manual.
4. **GitHub.** En Settings → Secrets and variables → Actions:
   variable `SITE_URL` con la URL de producción y secreto `INDEXNOW_KEY` con la
   misma clave. Sin la variable, el workflow no se ejecuta.
5. **Primer envío manual**, para comprobar la cadena completa:
   ```bash
   INDEXNOW_KEY=... SITE_URL=https://<sitio> node scripts/submit-indexnow.mjs --dry-run
   INDEXNOW_KEY=... SITE_URL=https://<sitio> node scripts/submit-indexnow.mjs
   ```

A partir de ahí, `.github/workflows/seo-maintenance.yml` envía todas las URLs
del sitemap tras cada push a `main`, más una pasada semanal de seguridad.

## Qué NO se hace, y por qué

- **Google no participa en IndexNow.** Para Google el canal es el sitemap con
  `lastmod` honesto y Search Console. Cualquier servicio que prometa
  "indexación instantánea en Google" vía IndexNow está vendiendo humo.
- **No se usa la Indexing API de Google.** Está restringida a `JobPosting` y
  `BroadcastEvent`; usarla para páginas normales arriesga perder el acceso.
- **No se generan estáticos que compitan con rutas.** `/llms.txt` se sirve desde
  `app/llms.txt/route.ts`. Un `public/llms.txt` sombrearía esa ruta con una
  versión autogenerada y más pobre; hay un test que falla si reaparece.
- **No se inventan datos.** Ni precios, ni reseñas, ni calificaciones, ni
  certificaciones propias, ni perfiles sociales que no existan. Un `sameAs`
  vacío es mejor que uno falso: el perfil inventado rompe la reconciliación de
  entidad. Las cifras normativas de los artículos llevan su fuente citada, y
  cuando un dato no se pudo verificar contra el texto oficial, se dice.
- **No se generan páginas doorway.** `/local/[ciudad]` y `/recursos/[slug]`
  usan `dynamicParams = false`: solo existen las URLs curadas.

## Invariantes cubiertos por tests

`npm test` falla si alguien:

- reintroduce un dominio escrito a mano en el sitemap;
- quita un crawler de IA de `robots.ts` o expone una ruta privada a alguno;
- publica un producto o una familia sin su contraparte editorial;
- escribe una FAQ de producto que afirma un precio, un plazo o una
  documentación que el catálogo no declara;
- publica un artículo sin fuente, con fuente sin URL absoluta, o con un
  `relatedProducts` que apunta a un SKU inexistente;
- duplica un `metaTitle` entre familias o entre artículos;
- deja el sitemap con URLs repetidas o con una entrada que no existe;
- reintroduce `public/llms.txt` o el generador estático paralelo;
- hace que las URLs de retorno de Stripe caigan a `localhost` en producción.

## Siguientes pasos legítimos de mayor palanca

1. Verificar en Search Console qué páginas reciben impresiones y reescribir los
   títulos de las que aparecen pero no se pulsan.
2. Google Business Profile con NAP idéntico al de `lib/site.ts` (nombre,
   dirección y teléfono exactamente iguales, carácter por carácter).
3. Fotografías reales en los 7 productos que aún no tienen galería.
4. Casos de estudio con números y fotos autorizadas por el cliente.
5. Migrar el dominio y añadir las redirecciones 301 desde el sitio antiguo.
PP_EOF

echo "==> Retirando el generador estático de llms (compite con /llms.txt)"
rm -f scripts/generate-llms.mjs public/llms.txt public/llms-full.txt

echo "==> Aplicando cambios puntuales"
python3 - <<'PP_EOF'
import sys

def edit(path, pairs):
    src = open(path, encoding='utf-8').read()
    for old, new in pairs:
        if old not in src:
            if new in src:
                print(f"   = {path}: ya aplicado")
                continue
            sys.exit(f"ERROR: {path} no está en el estado esperado.\nNo se encontró:\n{old[:150]}")
        src = src.replace(old, new, 1)
    open(path, 'w', encoding='utf-8').write(src)
    print(f"   + {path}")

# --- layout: metas de verificación, solo si la variable existe ---------------
edit('app/layout.tsx', [
    (
        "  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.\n  metadataBase: new URL(SITE.url),",
        "  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.\n"
        "  metadataBase: new URL(SITE.url),\n"
        "  // Verificación de propiedad en Search Console y Bing Webmaster Tools.\n"
        "  // Se emiten SOLO si la variable existe: una meta de verificación vacía o\n"
        "  // inventada no verifica nada y ensucia el <head>.\n"
        "  verification: {\n"
        "    ...(process.env.GOOGLE_SITE_VERIFICATION\n"
        "      ? { google: process.env.GOOGLE_SITE_VERIFICATION }\n"
        "      : {}),\n"
        "    ...(process.env.BING_SITE_VERIFICATION\n"
        "      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }\n"
        "      : {}),\n"
        "  },",
    ),
])

# --- stripe: nunca redirigir a localhost en producción -----------------------
edit('lib/stripe.ts', [
    ("import Stripe from 'stripe';", "import Stripe from 'stripe';\nimport { SITE } from './site';"),
    (
        "export function siteUrl(): string {\n  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';\n}",
        "/**\n"
        " * Origen para las URLs de retorno de Stripe (success_url / cancel_url).\n"
        " *\n"
        " * El fallback anterior era 'http://localhost:3000': si NEXT_PUBLIC_SITE_URL no\n"
        " * estaba definida en producción, un cliente que completaba el pago terminaba\n"
        " * redirigido a su propia máquina. El respaldo correcto es el origen canónico\n"
        " * del sitio; localhost solo cuando se está desarrollando de verdad.\n"
        " */\n"
        "export function siteUrl(): string {\n"
        "  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\\/$/, '');\n"
        "  if (fromEnv) return fromEnv;\n"
        "  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';\n"
        "  return SITE.url;\n"
        "}",
    ),
])
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 8 test files / 92 tests, y en el build:"
echo "   o /indexnow-key.txt   (404 hasta configurar INDEXNOW_KEY)"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(seo): IndexNow operativo desde sitemap, verificacion GSC/Bing, fix retorno Stripe'"
echo "   git push origin main"
echo ""
echo " Luego, el checklist de 10 minutos: docs/SEO-FOUNDATION.md"
echo "=============================================================="
