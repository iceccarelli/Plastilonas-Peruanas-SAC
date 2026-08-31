/**
 * DIAGNÓSTICO 1 — MAQUETACIÓN REAL EN NAVEGADOR.
 *
 * Lo que busca, en orden de gravedad para un comprador con el teléfono:
 *  1. DESBORDE HORIZONTAL: la página se mueve de lado. Es el defecto móvil
 *     que más daña la conversión y el que ninguna prueba de unidad detecta.
 *  2. ELEMENTOS QUE SE SALEN del viewport, con el selector culpable.
 *  3. ÁREAS TÁCTILES por debajo de 44×44 px (guía de Apple/WCAG 2.5.8).
 *  4. ERRORES DE CONSOLA y peticiones fallidas (imágenes rotas incluidas).
 *  5. JERARQUÍA DE ENCABEZADOS: un solo H1, sin saltos de nivel.
 *  6. TABLAS ANCHAS que no viven dentro de un contenedor con scroll propio.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { BASE, REPRESENTATIVAS, VIEWPORTS, LANZAR } from './rutas.mjs';

const HALLAZGOS = [];
const push = (o) => HALLAZGOS.push(o);

const AUDITORIA = () => {
  const docEl = document.documentElement;
  const vw = docEl.clientWidth;

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };
  const sel = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
      : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 120);
  };

  // 1 + 2. Desborde
  const desbordeDoc = docEl.scrollWidth - vw;
  const culpables = [];
  if (desbordeDoc > 1) {
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      // Sólo el elemento MÁS EXTERNO que se sale: si el padre ya se sale, el
      // hijo es consecuencia y no causa.
      if (r.right > vw + 1 || r.left < -1) {
        const p = el.parentElement;
        if (p && p !== document.body) {
          const pr = p.getBoundingClientRect();
          if (pr.right > vw + 1 || pr.left < -1) continue;
        }
        culpables.push({
          sel: sel(el),
          right: Math.round(r.right),
          left: Math.round(r.left),
          width: Math.round(r.width),
          texto: (el.textContent || '').trim().slice(0, 60),
        });
      }
      if (culpables.length >= 8) break;
    }
  }

  // 3. Áreas táctiles
  const chicos = [];
  const interactivos = document.querySelectorAll('a[href], button, [role="button"], input, select, summary, [role="tab"]');
  for (const el of interactivos) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 || r.width < 24) {
      // Un enlace dentro de un párrafo no es un botón: se excluye el texto en
      // línea, que WCAG 2.5.8 exempta explícitamente.
      const enLinea = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
      if (enLinea) continue;
      chicos.push({
        sel: sel(el),
        w: Math.round(r.width),
        h: Math.round(r.height),
        texto: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
      });
    }
    if (chicos.length >= 25) break;
  }

  // 5. Encabezados
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(visible)
    .map((h) => ({ n: Number(h.tagName[1]), t: (h.textContent || '').trim().slice(0, 60) }));
  const saltos = [];
  for (let i = 1; i < hs.length; i++) {
    if (hs[i].n - hs[i - 1].n > 1) saltos.push(`h${hs[i - 1].n} → h${hs[i].n} («${hs[i].t}»)`);
  }

  // 6. Tablas sin contenedor con scroll
  const tablasAtrapadas = [];
  for (const t of document.querySelectorAll('table')) {
    if (!visible(t)) continue;
    let p = t.parentElement, conScroll = false;
    for (let i = 0; i < 4 && p; i++, p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') { conScroll = true; break; }
    }
    if (!conScroll && t.getBoundingClientRect().width > vw) {
      tablasAtrapadas.push(sel(t));
    }
  }

  // Barras fijas que tapan el final del contenido
  const fijos = [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el);
    return (cs.position === 'fixed' || cs.position === 'sticky') && visible(el);
  }).map((el) => ({ sel: sel(el), pos: getComputedStyle(el).position, z: getComputedStyle(el).zIndex, h: Math.round(el.getBoundingClientRect().height) }));

  return {
    vw,
    scrollWidth: docEl.scrollWidth,
    desbordeDoc,
    culpables,
    chicos,
    h1: hs.filter((h) => h.n === 1).length,
    saltos,
    tablasAtrapadas,
    fijos: fijos.slice(0, 10),
    imgsSinAlt: [...document.querySelectorAll('img:not([alt])')].length,
  };
};

const navegador = await chromium.launch(LANZAR);

for (const vp of VIEWPORTS) {
  const ctx = await navegador.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.movil,
    hasTouch: vp.movil,
    userAgent: vp.movil
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });

  for (const ruta of REPRESENTATIVAS) {
    const page = await ctx.newPage();
    // Nada de red externa: el contenedor no sale a internet y cada intento
    // (autocompletado de Chrome, GA) cuesta segundos de espera. Se corta.
    // OJO: abortar peticiones deja el evento `load` pendiente en Chromium, así
    // que abajo se espera `domcontentloaded` + una pausa, NO `load`. Con
    // `load` esta misma página tardaba 439 ms sin bloqueo y agotaba 25 s con
    // él: un falso positivo del arné, no un defecto del sitio.
    await page.route('**/*', (r) =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    const consola = [];
    const fallidas = [];
    page.on('console', (m) => { if (m.type() === 'error') consola.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => consola.push('PAGEERROR: ' + String(e).slice(0, 200)));
    page.on('response', (r) => { if (r.status() >= 400) fallidas.push(`${r.status()} ${r.url().replace(BASE, '')}`); });

    let estado = 0;
    try {
      const resp = await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded', timeout: 25000 });
      estado = resp ? resp.status() : 0;
      await page.waitForTimeout(1200);
      const r = await page.evaluate(AUDITORIA);
      push({ ruta, vp: vp.nombre, estado, ...r, consola, fallidas: [...new Set(fallidas)] });
    } catch (e) {
      push({ ruta, vp: vp.nombre, estado, error: String(e).slice(0, 200) });
    }
    await page.close();
  }
  await ctx.close();
  console.error(`  ✓ ${vp.nombre} (${vp.width}px)`);
}

await navegador.close();
writeFileSync('.diagnostico/01-maquetacion.json', JSON.stringify(HALLAZGOS, null, 1));
console.error('escrito .diagnostico/01-maquetacion.json — ' + HALLAZGOS.length + ' mediciones');
