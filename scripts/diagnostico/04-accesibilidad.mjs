/**
 * DIAGNÓSTICO 4 — ACCESIBILIDAD REAL (axe-core), móvil y escritorio, claro y
 * oscuro. Se ejecuta en el navegador contra el DOM ya hidratado: detecta lo
 * que ninguna prueba de este repositorio puede ver — contraste insuficiente,
 * roles mal puestos, orden de foco, nombres accesibles ausentes.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { BASE, LANZAR } from './rutas.mjs';

const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const RUTAS = [
  '/', '/productos', '/productos/big-bags-bolsones-polipropileno', '/big-bags',
  '/fabricar-o-importar', '/cotizacion', '/contacto', '/indicadores',
  '/industria/mineria', '/calculadoras/big-bags-por-viaje', '/confianza',
  '/en', '/en/fibc-big-bags-peru', '/en/rfq', '/glosario', '/servicios',
];
const MODOS = [
  { nombre: 'movil-claro', w: 390, h: 844, movil: true, oscuro: false },
  { nombre: 'movil-oscuro', w: 390, h: 844, movil: true, oscuro: true },
  { nombre: 'escritorio-claro', w: 1440, h: 900, movil: false, oscuro: false },
  { nombre: 'escritorio-oscuro', w: 1440, h: 900, movil: false, oscuro: true },
];

const nav = await chromium.launch(LANZAR);
const todo = [];

for (const m of MODOS) {
  const ctx = await nav.newContext({
    viewport: { width: m.w, height: m.h }, isMobile: m.movil, hasTouch: m.movil,
    colorScheme: m.oscuro ? 'dark' : 'light',
  });
  await ctx.addInitScript(`try{localStorage.setItem('theme','${m.oscuro ? 'dark' : 'light'}')}catch(e){}`);
  for (const ruta of RUTAS) {
    const p = await ctx.newPage();
    try {
      await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(900);
      await p.addScriptTag({ content: axe });
      const r = await p.evaluate(async () =>
        await window.axe.run(document, {
          resultTypes: ['violations'],
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        }),
      );
      for (const v of r.violations) {
        todo.push({
          modo: m.nombre, ruta, id: v.id, impacto: v.impact, ayuda: v.help,
          n: v.nodes.length,
          ejemplo: (v.nodes[0]?.target || []).join(' '),
          resumen: (v.nodes[0]?.failureSummary || '').replace(/\s+/g, ' ').slice(0, 200),
        });
      }
    } catch (e) {
      todo.push({ modo: m.nombre, ruta, id: 'ERROR', resumen: String(e).slice(0, 160) });
    }
    await p.close();
  }
  await ctx.close();
  console.error(`  ✓ ${m.nombre}`);
}
await nav.close();
writeFileSync('.diagnostico/04-accesibilidad.json', JSON.stringify(todo, null, 1));

const porRegla = {};
for (const v of todo) {
  const k = `${v.id}|${v.impacto}|${v.ayuda}`;
  porRegla[k] = porRegla[k] || { rutas: new Set(), modos: new Set(), n: 0, ej: v.ejemplo, res: v.resumen };
  porRegla[k].rutas.add(v.ruta); porRegla[k].modos.add(v.modo); porRegla[k].n += v.n || 1;
}
const orden = { critical: 0, serious: 1, moderate: 2, minor: 3, undefined: 4 };
console.error('\n== VIOLACIONES agrupadas por regla ==');
for (const [k, v] of Object.entries(porRegla).sort((a, b) => (orden[a[0].split('|')[1]] ?? 9) - (orden[b[0].split('|')[1]] ?? 9))) {
  const [id, imp, ayuda] = k.split('|');
  console.error(`\n[${(imp || '?').toUpperCase()}] ${id} — ${ayuda}`);
  console.error(`   nodos: ${v.n} · rutas: ${v.rutas.size} (${[...v.rutas].slice(0, 5).join(', ')})`);
  console.error(`   modos: ${[...v.modos].join(', ')}`);
  console.error(`   ej: ${v.ej}`);
  if (v.res) console.error(`   ${v.res.slice(0, 160)}`);
}
console.error(`\ntotal de hallazgos: ${todo.length}`);
