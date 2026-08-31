/**
 * DIAGNÓSTICO 7 — ¿QUÉ TAPAN LOS ELEMENTOS FLOTANTES EN EL TELÉFONO?
 * La barra inferior de contacto y el lanzador del asistente viven encima del
 * contenido. Se comprueba, al pie de cada página, qué control queda debajo.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { BASE, LANZAR } from './rutas.mjs';

const RUTAS = ['/', '/productos', '/productos/big-bags-bolsones-polipropileno', '/big-bags',
  '/fabricar-o-importar', '/cotizacion', '/calculadoras/big-bags-por-viaje', '/contacto',
  '/indicadores', '/marco/evaluacion', '/configurador', '/carrito', '/en/rfq'];

const nav = await chromium.launch(LANZAR);
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
const out = [];
for (const ruta of RUTAS) {
  const p = await ctx.newPage();
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  // Al fondo del documento: es donde la barra fija muerde el contenido.
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const vis = (el) => { const c = getComputedStyle(el), q = el.getBoundingClientRect();
      return c.visibility !== 'hidden' && c.display !== 'none' && q.width > 0 && q.height > 0; };
    const flotantes = [...document.querySelectorAll('body *')].filter((el) =>
      getComputedStyle(el).position === 'fixed' && vis(el) && el.getBoundingClientRect().height > 24);
    const interactivos = [...document.querySelectorAll('a[href], button, input, select, textarea')].filter(vis);
    const tapados = [];
    for (const f of flotantes) {
      const fr = f.getBoundingClientRect();
      if (fr.top > innerHeight || fr.bottom < 0) continue;
      for (const el of interactivos) {
        if (f.contains(el) || el.contains(f)) continue;
        const r2 = el.getBoundingClientRect();
        if (r2.bottom < 0 || r2.top > innerHeight) continue;
        const solape = Math.max(0, Math.min(fr.bottom, r2.bottom) - Math.max(fr.top, r2.top)) *
                       Math.max(0, Math.min(fr.right, r2.right) - Math.max(fr.left, r2.left));
        if (solape > r2.width * r2.height * 0.25) {
          // ¿Está el elemento realmente por debajo? elementFromPoint decide.
          const cx = r2.left + r2.width / 2, cy = r2.top + r2.height / 2;
          const arriba = document.elementFromPoint(cx, cy);
          if (arriba && !el.contains(arriba) && arriba !== el && (f.contains(arriba) || arriba === f)) {
            tapados.push({
              flotante: (f.className || '').toString().slice(0, 50),
              tapado: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 50),
              tag: el.tagName.toLowerCase(),
            });
          }
        }
      }
    }
    const padBody = getComputedStyle(document.body).paddingBottom;
    return { tapados: tapados.slice(0, 6), padBody, nFlotantes: flotantes.length };
  });
  out.push({ ruta, ...r });
  if (r.tapados.length) console.error(`  ✗ ${ruta} — ${r.tapados.map((t) => `«${t.tapado}» (${t.tag}) bajo .${t.flotante.split(' ')[0]}`).join(' | ')}`);
  else console.error(`  ✓ ${ruta}`);
  await p.close();
}
await nav.close();
writeFileSync('.diagnostico/07-solapamiento.json', JSON.stringify(out, null, 1));
console.error('padding-bottom del body: ' + [...new Set(out.map((o) => o.padBody))].join(', '));
