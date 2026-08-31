/**
 * DIAGNÓSTICO 3 — ARQUITECTURA DE LA INFORMACIÓN.
 *
 * Contesta la pregunta del encargo: ¿está cada cosa donde debe, o hay
 * ensalada? Rastrea las 230 URLs del sitemap y mide:
 *  · enlaces internos rotos (404) y enlaces a rutas fuera del sitemap
 *  · HUÉRFANAS: publicadas en el sitemap y sin un solo enlace entrante
 *  · profundidad de clic desde la portada (nada comercial debería estar a >3)
 *  · títulos y descripciones duplicados entre páginas
 *  · consistencia de marco: ¿cada grupo de idioma sirve SU cabecera y pie?
 */
import { writeFileSync } from 'node:fs';
import { BASE, todasLasRutas } from './rutas.mjs';

const rutas = await todasLasRutas();
const enSitemap = new Set(rutas);

const salientes = new Map();   // ruta → Set(rutas destino)
const entrantes = new Map();   // ruta → Set(rutas origen)
const meta = new Map();        // ruta → {title, desc, h1, estado, header, footer}
const rotos = [];
const fuera = new Map();       // destino no publicado → Set(orígenes)

const norm = (href) => {
  if (!href) return null;
  if (/^(mailto:|tel:|https?:\/\/(?!localhost:4000)|#|javascript:)/i.test(href)) return null;
  try {
    const u = new URL(href, BASE);
    if (u.origin !== BASE) return null;
    let p = u.pathname;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  } catch { return null; }
};

const estados = new Map();
async function estado(p) {
  if (estados.has(p)) return estados.get(p);
  const r = await fetch(BASE + p, { method: 'GET', redirect: 'manual' });
  estados.set(p, r.status);
  return r.status;
}

let i = 0;
for (const ruta of rutas) {
  i++;
  if (i % 40 === 0) console.error(`  ${i}/${rutas.length}`);
  const res = await fetch(BASE + ruta);
  const html = await res.text();
  const esHtml = (res.headers.get('content-type') || '').includes('text/html');

  const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1].trim();
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim().slice(0, 90);
  meta.set(ruta, {
    estado: res.status, esHtml, title, desc, h1,
    lang: (html.match(/<html lang="([^"]+)"/) || [, ''])[1],
    marcoEs: html.includes('Solicitar cotización') || html.includes('Productos</'),
    marcoEn: html.includes('Sitio en español'),
  });
  if (!esHtml) { salientes.set(ruta, new Set()); continue; }

  const dest = new Set();
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const p = norm(m[1]);
    if (!p || p === ruta) continue;
    dest.add(p);
  }
  salientes.set(ruta, dest);
  for (const d of dest) {
    if (!entrantes.has(d)) entrantes.set(d, new Set());
    entrantes.get(d).add(ruta);
    if (!enSitemap.has(d)) {
      if (!fuera.has(d)) fuera.set(d, new Set());
      fuera.get(d).add(ruta);
    }
  }
}

// Verificar los destinos que no están en el sitemap: ¿existen?
for (const [d, origenes] of fuera) {
  const st = await estado(d);
  if (st >= 400) rotos.push({ destino: d, estado: st, desde: [...origenes].slice(0, 5) });
}

// Profundidad de clic desde la portada
const prof = new Map([['/', 0]]);
let frontera = ['/'];
while (frontera.length) {
  const sig = [];
  for (const n of frontera) {
    for (const d of salientes.get(n) || []) {
      if (!prof.has(d)) { prof.set(d, prof.get(n) + 1); sig.push(d); }
    }
  }
  frontera = sig;
}

const huerfanas = rutas.filter((r) => r !== '/' && !(entrantes.get(r) || new Set()).size);
const profundas = rutas.filter((r) => (prof.get(r) ?? 99) > 3).map((r) => ({ r, d: prof.get(r) ?? null }));

const porTitulo = new Map(), porDesc = new Map();
for (const [r, m] of meta) {
  if (!m.esHtml) continue;
  if (m.title) { if (!porTitulo.has(m.title)) porTitulo.set(m.title, []); porTitulo.get(m.title).push(r); }
  if (m.desc) { if (!porDesc.has(m.desc)) porDesc.set(m.desc, []); porDesc.get(m.desc).push(r); }
}
const titDup = [...porTitulo.entries()].filter(([, v]) => v.length > 1);
const descDup = [...porDesc.entries()].filter(([, v]) => v.length > 1);

const salida = {
  rutas: rutas.length,
  enlacesRotos: rotos,
  destinosFueraDelSitemap: [...fuera.entries()].map(([d, o]) => ({ destino: d, estado: estados.get(d), desde: o.size })).sort((a, b) => b.desde - a.desde),
  huerfanas,
  profundas,
  titulosDuplicados: titDup.map(([t, v]) => ({ titulo: t.slice(0, 80), rutas: v })),
  descripcionesDuplicadas: descDup.map(([d, v]) => ({ desc: d.slice(0, 80), rutas: v })),
  idiomas: [...meta.entries()].filter(([, m]) => m.esHtml).reduce((a, [r, m]) => { (a[m.lang] = a[m.lang] || []).push(r); return a; }, {}),
  masEnlazadas: [...entrantes.entries()].map(([r, s]) => [r, s.size]).sort((a, b) => b[1] - a[1]).slice(0, 15),
};
writeFileSync('.diagnostico/03-arquitectura.json', JSON.stringify(salida, null, 1));

console.error('\n== RESUMEN ==');
console.error('rutas rastreadas:', rutas.length);
console.error('enlaces internos ROTOS:', rotos.length);
console.error('huérfanas (sin enlace entrante):', huerfanas.length, huerfanas.slice(0, 12).join(', '));
console.error('a más de 3 clics de la portada:', profundas.length);
console.error('títulos duplicados:', titDup.length);
console.error('descripciones duplicadas:', descDup.length);
console.error('idiomas servidos:', Object.entries(salida.idiomas).map(([k, v]) => `${k}: ${v.length}`).join(' · '));
