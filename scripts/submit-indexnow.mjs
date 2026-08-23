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
 * NO NECESITA NINGUNA VARIABLE DE ENTORNO. La clave y el origen canónico se
 * leen del propio repositorio —lib/indexnow.ts y lib/site.ts— porque cualquier
 * otra cosa deja el envío esperando a que alguien configure una consola. Ver
 * la nota larga de lib/indexnow.ts sobre por qué la clave no es un secreto.
 *
 * Uso:
 *   node scripts/submit-indexnow.mjs                     (envía todo el sitemap)
 *   node scripts/submit-indexnow.mjs --dry-run           (no envía nada)
 *   node scripts/submit-indexnow.mjs https://.../una-url (envía solo esas)
 */

import { execFileSync } from 'node:child_process';

/**
 * El registro es TypeScript; se lee a través de tsx para no duplicar aquí ni
 * la clave ni el dominio. Duplicarlos es exactamente cómo se desincronizan.
 */
function desdeElRepositorio() {
  const salida = execFileSync(
    'npx',
    [
      'tsx',
      '-e',
      "import {INDEXNOW_KEY} from './lib/indexnow'; import {SITE} from './lib/site'; console.log(JSON.stringify({key: INDEXNOW_KEY, site: SITE.url}));",
    ],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  );
  return JSON.parse(salida.trim().split('\n').pop());
}

const { key: KEY, site: SITE_CANONICO } = desdeElRepositorio();
const SITE_URL = SITE_CANONICO.replace(/\/$/, '');
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
    console.error('La clave de lib/indexnow.ts tiene un formato inválido (8–128 caracteres alfanuméricos o guiones).');
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
        '\nEso significa que producción todavía sirve un build anterior a este commit.' +
        '\nEspere a que Vercel termine el despliegue y vuelva a ejecutar.',
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
