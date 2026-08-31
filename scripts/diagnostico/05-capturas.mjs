/** Capturas para MIRAR la maqueta, no sólo medirla. Móvil y escritorio, claro y oscuro. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { BASE, LANZAR } from './rutas.mjs';
mkdirSync('.diagnostico/capturas', { recursive: true });

const RUTAS = process.argv[2] ? [process.argv[2]] : [
  '/', '/productos', '/big-bags', '/fabricar-o-importar',
  '/calculadoras/big-bags-por-viaje', '/cotizacion', '/en/fibc-big-bags-peru', '/indicadores',
];
const MODOS = [
  { n: 'movil-claro', w: 390, h: 900, m: true, osc: false },
  { n: 'movil-oscuro', w: 390, h: 900, m: true, osc: true },
  { n: 'escritorio-claro', w: 1440, h: 950, m: false, osc: false },
  { n: 'escritorio-oscuro', w: 1440, h: 950, m: false, osc: true },
];
const nav = await chromium.launch(LANZAR);
for (const mo of MODOS) {
  const ctx = await nav.newContext({
    viewport: { width: mo.w, height: mo.h }, isMobile: mo.m, hasTouch: mo.m,
    deviceScaleFactor: 1, colorScheme: mo.osc ? 'dark' : 'light',
  });
  await ctx.addInitScript(`try{localStorage.setItem('theme','${mo.osc ? 'dark' : 'light'}')}catch(e){}`);
  for (const r of RUTAS) {
    const p = await ctx.newPage();
    await p.goto(BASE + r, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1400);
    const nombre = (r === '/' ? 'home' : r.replace(/\//g, '_').replace(/^_/, ''));
    await p.screenshot({ path: `.diagnostico/capturas/${nombre}__${mo.n}.png`, fullPage: false });
    await p.close();
  }
  await ctx.close();
  console.error('  ✓ ' + mo.n);
}
await nav.close();
