/**
 * DIAGNÓSTICO 8 — PRESUPUESTO DE JAVASCRIPT POR RUTA.
 *
 * Por qué existe. El paquete inicial de una página no aparece en ninguna
 * prueba: crece un import a la vez, cada uno razonable por separado, y un día
 * la página por la que entra el dinero pesa el doble que el resto del sitio.
 * Eso ya pasó aquí: /cotizacion y /en/rfq llegaron a 208 kB frente a los
 * 102 kB de base porque `@supabase/supabase-js` viajaba en el import estático
 * del formulario para una función —adjuntar planos— que la mayoría de los RFQ
 * nunca usa.
 *
 * Qué mide. El "First Load JS" real de cada ruta: la suma comprimida de los
 * chunks que el navegador necesita ANTES de poder interactuar. Se lee del
 * manifiesto que genera `next build`, así que no estima nada.
 *
 * Uso:  npm run build && node scripts/diagnostico/08-presupuesto.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const MANIFIESTO = '.next/app-build-manifest.json';
if (!existsSync(MANIFIESTO)) {
  console.error('Falta .next/app-build-manifest.json — ejecute `npm run build` primero.');
  process.exit(2);
}

/**
 * PRESUPUESTOS, con su motivo. No son cifras redondas puestas a ojo: son el
 * valor medido hoy más un margen para que un cambio honesto no rompa el build,
 * pero no tanto como para que quepa una biblioteca entera sin enterarse.
 */
// El ORDEN importa: gana la primera regla que casa, así que van de la más
// específica a la más general. La primera versión ponía «contenido» arriba y
// /en/rfq —que es un formulario— caía en el presupuesto equivocado y rompía
// el build. Lo detectó la primera ejecución del propio script.
const PRESUPUESTO = [
  // Portada, catálogo y el cuestionario del marco: llevan carruseles, filtros
  // y tarjetas, y son las páginas más ricas del sitio.
  { patron: /^\/\(es\)\/(page|productos\/page|marco\/evaluacion\/page)$/, kb: 195, nombre: 'portada y catálogo' },
  // Formularios: react-hook-form + zod + resolvers son un coste real y
  // justificado. Supabase NO: se carga sólo si alguien adjunta un plano.
  { patron: /\/(cotizacion|en\/rfq|contacto)\/page$/, kb: 165, nombre: 'formularios' },
  // Todo lo demás: la inmensa mayoría del sitio. El suelo lo pone el framework
  // (React más el enrutador de Next), no nosotros.
  { patron: /page$/, kb: 135, nombre: 'contenido' },
];

const m = JSON.parse(readFileSync(MANIFIESTO, 'utf8'));
const tam = new Map();
const gz = (f) => {
  if (!tam.has(f)) tam.set(f, gzipSync(readFileSync('.next/' + f)).length / 1024);
  return tam.get(f);
};

const filas = [];
for (const [ruta, archivos] of Object.entries(m.pages)) {
  if (!ruta.endsWith('/page')) continue;
  const js = archivos.filter((f) => f.endsWith('.js'));
  const total = js.reduce((a, f) => a + gz(f), 0);
  const regla = PRESUPUESTO.find((p) => p.patron.test(ruta));
  filas.push({ ruta, kb: total, regla });
}
filas.sort((a, b) => b.kb - a.kb);

const excesos = filas.filter((f) => f.regla && f.kb > f.regla.kb);
const sinRegla = filas.filter((f) => !f.regla);

console.log('Las 12 rutas más pesadas (kB comprimidos, paquete inicial):');
for (const f of filas.slice(0, 12)) {
  const marca = f.regla ? (f.kb > f.regla.kb ? '  ✗ EXCEDE' : '  ✓') : '  · sin presupuesto';
  console.log(`  ${f.kb.toFixed(1).padStart(7)} kB  ${f.ruta.padEnd(46)}${marca}${f.regla ? ` (${f.regla.nombre}: ${f.regla.kb} kB)` : ''}`);
}
if (sinRegla.length) {
  console.log(`\n${sinRegla.length} rutas sin presupuesto declarado (la más pesada: ${sinRegla[0].kb.toFixed(1)} kB).`);
}
if (excesos.length) {
  console.error('\n✗ PRESUPUESTO EXCEDIDO:');
  for (const f of excesos) console.error(`  ${f.ruta}: ${f.kb.toFixed(1)} kB > ${f.regla.kb} kB (${f.regla.nombre})`);
  process.exit(1);
}
console.log('\n✓ Ninguna ruta excede su presupuesto.');
