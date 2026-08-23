#!/usr/bin/env node
/**
 * AUDITORÍA DEL HTML REALMENTE GENERADO.
 *
 * Por qué contra el HTML y no contra el código. Todas las verificaciones que
 * este proyecto tenía hasta ahora miran el CÓDIGO FUENTE: que un archivo
 * contenga una cadena, que un objeto tenga un campo. Eso deja pasar
 * exactamente la clase de fallo que más daño hace, porque solo existe después
 * de renderizar: un enlace interno a una ruta que ya no existe, dos páginas
 * compitiendo con el mismo <title>, un @id de JSON-LD que apunta al vacío, una
 * página a la que no llega ningún enlace del propio sitio.
 *
 * Ninguno de esos rompe la compilación. Todos erosionan exactamente lo que el
 * sitio existe para construir.
 *
 *   node scripts/auditar-html.mjs            audita .next/server/app
 *   node scripts/auditar-html.mjs --json     salida legible por máquina
 *
 * Sale 1 si hay defectos de gravedad "error". Los "aviso" no rompen la
 * ejecución: son deuda visible, no una parada de línea.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = process.cwd();
const DIR = '.next/server/app';

const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;

if (!existsSync(join(RAIZ, DIR))) {
  console.error(`\nNo existe ${DIR}. Ejecute primero:  npx next build\n`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Recolección                                                         */
/* ------------------------------------------------------------------ */

function htmls(dir, out = []) {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) htmls(`${dir}/${e.name}`, out);
    else if (e.name.endsWith('.html')) out.push(`${dir}/${e.name}`);
  }
  return out;
}

/** Ruta pública a partir del archivo generado. */
const rutaDe = (archivo) => {
  const r = archivo.slice(DIR.length).replace(/\.html$/, '');
  return r === '/index' ? '/' : r || '/';
};

const paginas = htmls(DIR)
  .map((archivo) => ({ archivo, ruta: rutaDe(archivo), html: readFileSync(join(RAIZ, archivo), 'utf8') }))
  // _not-found es una plantilla de error, no una página del sitio.
  .filter((p) => !p.ruta.startsWith('/_'));

const rutasExistentes = new Set(paginas.map((p) => p.ruta));

/** Rutas que existen pero no son .html: endpoints y documentos generados. */
const noHtml = new Set();
(function endpoints(dir) {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) endpoints(`${dir}/${e.name}`);
    else if (/\.(body|meta)$/.test(e.name) || e.name === 'route.js') {
      const r = `${dir}/${e.name}`.slice(DIR.length).replace(/\/route\.js$|\.(body|meta)$/, '');
      if (r) noHtml.add(r);
    }
  }
})(DIR);

/**
 * Rutas declaradas en app/, incluidas las que se renderizan bajo demanda y por
 * tanto NO dejan un .html tras el build.
 *
 * Sin esto el auditor daba 167 falsos positivos de golpe: `/login` existe como
 * página y está enlazada desde el navbar de todas las páginas, pero es
 * dinámica. Un auditor que grita en cada página por algo que está bien es un
 * auditor que se deja de mirar a la segunda ejecución, y entonces no sirve
 * para nada.
 */
const patronesDeclarados = [];
(function rutasApp(dir, ruta = '') {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) {
      // Los grupos (carpeta) no aparecen en la URL.
      const seg = /^\(.*\)$/.test(e.name) ? '' : `/${e.name}`;
      rutasApp(`${dir}/${e.name}`, ruta + seg);
    } else if (e.name === 'page.tsx' || e.name === 'page.jsx') {
      patronesDeclarados.push(ruta || '/');
    }
  }
})('app');

/** ¿La ruta encaja con alguna declarada, resolviendo los segmentos dinámicos? */
const rutaDeclarada = (destino) =>
  patronesDeclarados.some((patron) => {
    if (!patron.includes('[')) return patron === destino;
    const re = new RegExp(
      '^' +
        patron
          .split('/')
          .map((seg) =>
            /^\[\.\.\..*\]$/.test(seg) ? '.+' : /^\[.*\]$/.test(seg) ? '[^/]+' : seg.replace(/[.*+?^${}()|\\]/g, '\\$&'),
          )
          .join('/') +
        '$',
    );
    return re.test(destino);
  });

/** Formas exactas de la marca. Un segmento igual a una de estas ES la marca. */
const MARCAS = new Set(['Plastilonas', 'Plastilonas Peruanas', 'Plastilonas Peruanas SAC']);

const defectos = [];
const anota = (gravedad, tipo, ruta, detalle) => defectos.push({ gravedad, tipo, ruta, detalle });

/* ------------------------------------------------------------------ */
/* Extracción                                                          */
/* ------------------------------------------------------------------ */

const entre = (html, re) => html.match(re)?.[1]?.trim() ?? null;
const decodificar = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#x2F;/g, '/');

const titulo = (h) => {
  const t = entre(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? decodificar(t) : null;
};
const descripcion = (h) => {
  const m = h.match(/<meta name="description" content="([^"]*)"/i);
  return m ? decodificar(m[1]) : null;
};
const canonico = (h) => h.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? null;
const h1s = (h) => [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decodificar(m[1].replace(/<[^>]+>/g, '')).trim());

/** Enlaces internos, ya normalizados y sin ancla ni query. */
function enlacesInternos(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    let r = m[1];
    if (/^\/(_next|images|fonts|favicon)/.test(r)) continue;
    if (r.length > 1) r = r.replace(/\/$/, '');
    out.add(r || '/');
  }
  return [...out];
}

function bloquesJsonLd(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    out.push(m[1]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Comprobaciones                                                      */
/* ------------------------------------------------------------------ */

const porTitulo = new Map();
const porDescripcion = new Map();
const recibenEnlace = new Set();
const idsDeclarados = new Set();
const idsReferenciados = [];

for (const p of paginas) {
  const { ruta, html } = p;

  // --- Título -------------------------------------------------------
  const t = titulo(html);
  if (!t) anota('error', 'sin-titulo', ruta, 'la página no emite <title>');
  else {
    // TRINQUETE. Esto era un aviso mientras había 100 títulos largos: marcar
    // como error un defecto que aparece cien veces solo consigue que se apague
    // la comprobación. Una vez llevado a cero, el aviso deja de servir para
    // nada: nadie mira un renglón ámbar entre cincuenta, y el primer parche que
    // añada una página con un título de 74 caracteres lo deshace en silencio.
    //
    // De cero solo se sale hacia arriba, así que a partir de aquí ES UN ERROR y
    // rompe la integración continua. Corregirlo no es truncar: es pasar el
    // título por `tituloAjustado` de lib/meta.ts, que suelta el complemento
    // cuando no cabe entero.
    if (t.length > 65) anota('error', 'titulo-largo', ruta, `${t.length} caracteres: Google recorta en 65 (use tituloAjustado de lib/meta.ts)`);
    if (t.length < 15) anota('aviso', 'titulo-corto', ruta, `«${t}» (${t.length} caracteres)`);
    // Marca repetida. Ocurrió de verdad: al acortar el sufijo de la plantilla,
    // las doce páginas de ciudad —que metían la marca en su propio título—
    // empezaron a servir «… | Plastilonas Peruanas SAC | Plastilonas». Es un
    // error que solo se ve en el HTML final, porque nace de la SUMA de la
    // plantilla y del título de la página.
    //
    // Se cuentan SEGMENTOS que son exactamente la marca, no apariciones de la
    // palabra: en el Perú «plastilona» es el sustantivo del producto, y
    // «Plastilonas y lonas en Arequipa | Plastilonas» es correcto. Contar la
    // palabra marcaba las doce ciudades como defectuosas estando bien, que es
    // la forma más rápida de que un auditor deje de mirarse.
    const segmentos = t.split(' | ').map((x) => x.trim());
    const comoMarca = segmentos.filter((x) => MARCAS.has(x)).length;
    if (comoMarca > 1) {
      anota('error', 'marca-duplicada', ruta, `la marca aparece como segmento ${comoMarca} veces: «${t}»`);
    }
    porTitulo.set(t, [...(porTitulo.get(t) ?? []), ruta]);
  }

  // --- Descripción --------------------------------------------------
  const d = descripcion(html);
  if (!d) anota('error', 'sin-descripcion', ruta, 'la página no emite meta description');
  else {
    if (d.length > 165) anota('aviso', 'descripcion-larga', ruta, `${d.length} caracteres: se trunca cerca de 155`);
    if (d.length < 70) anota('aviso', 'descripcion-corta', ruta, `${d.length} caracteres`);
    porDescripcion.set(d, [...(porDescripcion.get(d) ?? []), ruta]);
  }

  // --- Canónico -----------------------------------------------------
  const c = canonico(html);
  if (!c) anota('error', 'sin-canonico', ruta, 'sin <link rel="canonical">');

  // --- Encabezados --------------------------------------------------
  const hs = h1s(html);
  if (hs.length === 0) anota('error', 'sin-h1', ruta, 'ningún <h1>');
  else if (hs.length > 1) anota('aviso', 'h1-multiple', ruta, `${hs.length} elementos <h1>: ${hs.slice(0, 3).join(' | ')}`);

  // --- Imágenes sin alt ---------------------------------------------
  const sinAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)];
  if (sinAlt.length) anota('error', 'img-sin-alt', ruta, `${sinAlt.length} <img> sin atributo alt`);

  // --- JSON-LD ------------------------------------------------------
  for (const bruto of bloquesJsonLd(html)) {
    let dato;
    try {
      dato = JSON.parse(bruto.replace(/\\u003c/g, '<'));
    } catch (e) {
      anota('error', 'jsonld-invalido', ruta, `bloque JSON-LD no parsea: ${e.message}`);
      continue;
    }
    const recorrer = (n) => {
      if (Array.isArray(n)) return n.forEach(recorrer);
      if (!n || typeof n !== 'object') return;
      const claves = Object.keys(n);
      if (n['@id'] && claves.length > 1) idsDeclarados.add(n['@id']);
      if (n['@id'] && claves.length === 1) idsReferenciados.push({ ruta, id: n['@id'] });
      for (const k of claves) recorrer(n[k]);
    };
    recorrer(dato);
  }

  // --- Enlaces internos ---------------------------------------------
  for (const destino of enlacesInternos(html)) {
    recibenEnlace.add(destino);
    if (rutasExistentes.has(destino) || noHtml.has(destino)) continue;
    // Rutas dinámicas servidas por route.js sin archivo estático.
    if ([...noHtml].some((n) => destino.startsWith(n))) continue;
    // Páginas que existen pero se renderizan bajo demanda.
    if (rutaDeclarada(destino)) continue;
    anota('error', 'enlace-roto', ruta, `enlaza a ${destino}, que no existe`);
  }
}

// --- Duplicados -----------------------------------------------------
for (const [t, rutas] of porTitulo) {
  if (rutas.length > 1) {
    anota('error', 'titulo-duplicado', rutas[0], `«${t}» se repite en ${rutas.length} páginas: ${rutas.join(', ')}`);
  }
}
for (const [d, rutas] of porDescripcion) {
  if (rutas.length > 1) {
    anota('aviso', 'descripcion-duplicada', rutas[0], `misma descripción en ${rutas.length} páginas: ${rutas.slice(0, 5).join(', ')}`);
  }
}

// --- Huérfanas ------------------------------------------------------
// Una página a la que no llega ni un enlace del propio sitio existe solo en el
// sitemap. Se rastrea peor, no acumula señal interna y, en la práctica, es
// contenido que nadie encuentra navegando.
for (const p of paginas) {
  if (p.ruta === '/') continue;
  if (!recibenEnlace.has(p.ruta)) {
    anota('aviso', 'huerfana', p.ruta, 'ninguna página del sitio enlaza aquí');
  }
}

// --- @id colgantes ---------------------------------------------------
for (const { ruta, id } of idsReferenciados) {
  if (!idsDeclarados.has(id)) {
    anota('error', 'jsonld-id-colgante', ruta, `referencia {"@id": "${id}"} que no está declarado en ninguna página`);
  }
}

/* ------------------------------------------------------------------ */
/* Salida                                                              */
/* ------------------------------------------------------------------ */

const errores = defectos.filter((d) => d.gravedad === 'error');
const avisos = defectos.filter((d) => d.gravedad === 'aviso');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ paginas: paginas.length, errores: errores.length, avisos: avisos.length, defectos }, null, 2));
  process.exit(errores.length ? 1 : 0);
}

console.log(`\nAuditoría del HTML generado — ${paginas.length} páginas, ${patronesDeclarados.length} rutas declaradas\n`);

const porTipo = new Map();
for (const d of defectos) porTipo.set(d.tipo, [...(porTipo.get(d.tipo) ?? []), d]);

for (const [tipo, lista] of [...porTipo].sort((a, b) => b[1].length - a[1].length)) {
  const grave = lista[0].gravedad === 'error';
  const marca = grave ? rojo('✗') : ambar('!');
  console.log(`  ${marca} ${tipo} — ${lista.length}`);
  for (const d of lista.slice(0, 8)) console.log(gris(`      ${d.ruta}: ${d.detalle}`));
  if (lista.length > 8) console.log(gris(`      … y ${lista.length - 8} más`));
  console.log('');
}

if (!defectos.length) console.log(`  ${verde('Sin defectos.')}\n`);

console.log(
  `Resultado: ${errores.length ? rojo(`${errores.length} errores`) : verde('0 errores')}, ` +
    `${avisos.length ? ambar(`${avisos.length} avisos`) : verde('0 avisos')}\n`,
);

process.exit(errores.length ? 1 : 0);
