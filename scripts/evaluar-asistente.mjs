#!/usr/bin/env node
/**
 * Mide al asistente CONTRA UN SERVIDOR EN MARCHA con el banco de preguntas de
 * data/evaluacion-asistente.json. Cuesta unos centavos de API: se ejecuta a mano,
 * antes de cambiar el prompt, el modelo o el catálogo; NO corre en CI.
 *
 *   ANTHROPIC_API_KEY=… npx next start -p 4000 &
 *   node scripts/evaluar-asistente.mjs http://localhost:4000
 *
 * Salida: una línea por caso y un resumen. Código 1 si algún caso falla.
 * Las reglas están en lib/ai/evaluacion.ts (y se prueban en test/ai-evaluacion.test.ts).
 * Nada de esto demuestra que otro asistente de IA recomiende a la empresa.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = (process.argv[2] || process.env.DIAG_BASE || 'http://localhost:4000').replace(/\/$/, '');
const banco = JSON.parse(readFileSync('data/evaluacion-asistente.json', 'utf8'));

// Mismas reglas que la prueba. Node 24 (y 22.18+) ejecuta TypeScript sin compilar; el módulo solo usa tipos borrables.
let evaluar, textoDeFlujo;
try {
  ({ evaluarRespuesta: evaluar, textoDeFlujo } = await import('../lib/ai/evaluacion.ts'));
} catch (e) {
  console.error(`No se pudo cargar lib/ai/evaluacion.ts (¿Node < 22.18?): ${e?.message ?? e}`);
  process.exit(2);
}

let fallos = 0;
const filas = [];
for (const caso of banco.casos) {
  let texto = '';
  let estado = 0;
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: caso.pregunta }] }] }),
      signal: AbortSignal.timeout(60_000),
    });
    estado = res.status;
    texto = textoDeFlujo(await res.text());
  } catch (e) {
    texto = '';
  }
  const v = estado === 200 ? evaluar(caso, texto) : { pasa: false, fallos: [`HTTP ${estado || 'sin respuesta'}`] };
  if (!v.pasa) fallos++;
  filas.push({ id: caso.id, categoria: caso.categoria, pasa: v.pasa, fallos: v.fallos, respuesta: texto.slice(0, 600) });
  console.error(`  ${v.pasa ? '✓' : '✗'} ${caso.id}${v.pasa ? '' : ' — ' + v.fallos.join('; ')}`);
}
mkdirSync('.diagnostico', { recursive: true });
writeFileSync('.diagnostico/evaluacion-asistente.json', JSON.stringify({ base: BASE, fallos, total: filas.length, filas }, null, 2));
console.error(`\n${filas.length - fallos}/${filas.length} casos correctos. Detalle en .diagnostico/evaluacion-asistente.json`);
process.exit(fallos ? 1 : 0);
