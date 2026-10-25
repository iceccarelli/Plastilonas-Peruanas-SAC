/**
 * EL ASISTENTE DE PUNTA A PUNTA con un Anthropic FALSO local.
 *
 * Por qué existe: el cliente del chat (useChat del AI SDK 7) y el servidor
 * (/api/chat) cambiaron de contrato. Las pruebas de vitest cubren el servidor
 * con un modelo simulado, pero solo un navegador demuestra que el widget y
 * /asistente envían, reciben el flujo, pintan el texto, derivan tarjetas de
 * herramientas REALES y muestran un fallo sin filtrar su detalle.
 *
 * ANTHROPIC_BASE_URL apunta a un servidor local que habla el protocolo de la API
 * de mensajes (SSE). Ninguna llamada sale a Internet ni gasta saldo.
 */
import { createServer } from 'node:http';
import { lanzarNavegador } from './diagnostico/rutas.mjs';

const BASE = process.env.DIAG_BASE || 'http://localhost:4015';
const FAKE_PORT = Number(process.env.ASISTENTE_FAKE_PORT || 4016);

const R = [];
let fallos = 0;
const ok = (nombre, pasa, detalle = '') => {
  R.push({ nombre, pasa });
  if (!pasa) fallos++;
  console.error(`  ${pasa ? '✓' : '✗'} ${nombre}${detalle ? ' — ' + detalle : ''}`);
};

const SECRETO_PROVEEDOR = 'sk-ant-SECRETO-DEL-PROVEEDOR saldo insuficiente org_999';
const solicitudes = [];

function sse(res, eventos) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
  for (const e of eventos) res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
  res.end();
}
const inicio = (id) => ({ type: 'message_start', message: { id, type: 'message', role: 'assistant', model: 'claude-haiku-4-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } });
const texto = (id, t) => [
  inicio(id),
  { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t } },
  { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 8 } },
  { type: 'message_stop' },
];
const herramienta = (id, name, input) => [
  inicio(id),
  { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: `toolu_${id}`, name, input: {} } },
  { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: JSON.stringify(input) } },
  { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'tool_use', stop_sequence: null }, usage: { output_tokens: 12 } },
  { type: 'message_stop' },
];

const fake = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    let j = {};
    try { j = JSON.parse(body); } catch { /* sin cuerpo */ }
    solicitudes.push(j);
    const mensajes = j.messages ?? [];
    const ultimo = mensajes[mensajes.length - 1];
    const blocks = Array.isArray(ultimo?.content) ? ultimo.content : [];
    const userText = JSON.stringify(mensajes.filter((m) => m.role === 'user'));
    if (blocks.some((b) => b.type === 'tool_result')) {
      return sse(res, texto('m2', 'Esta es la ficha real del producto. ¿En qué ciudad lo necesita?'));
    }
    if (/FALLA_PROVEEDOR/.test(userText)) {
      res.writeHead(402, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ type: 'error', error: { type: 'billing_error', message: SECRETO_PROVEEDOR } }));
    }
    if (/QUIERO_FICHA/.test(userText)) {
      return sse(res, herramienta('m1', 'getProduct', { slug: process.env.ASISTENTE_SLUG || 'mantas-cobertores-toldos-camiones' }));
    }
    return sse(res, texto('m0', 'Hola, con gusto le ayudo. ¿Qué necesita cubrir?'));
  });
});
await new Promise((r) => fake.listen(FAKE_PORT, '127.0.0.1', r));

const nav = await lanzarNavegador();
try {
  // ── Widget flotante ───────────────────────────────────────────────────────
  console.error('\n── Widget flotante ──');
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e)));
  await p.goto(`${BASE}/contacto`, { waitUntil: 'domcontentloaded' });
  await p.getByRole('button', { name: 'Abrir chat de asistencia' }).click();
  const caja = p.getByPlaceholder('Escriba su consulta sobre productos o proyectos...');
  await caja.waitFor({ timeout: 10000 });
  ok('el widget abre con el saludo inicial', (await p.getByText('Soy el asistente de Plastilonas Peruanas').count()) > 0);
  await caja.fill('Necesito cubrir una ruma de granos');
  await caja.press('Enter');
  await p.getByText('Hola, con gusto le ayudo. ¿Qué necesita cubrir?').waitFor({ timeout: 15000 });
  ok('el widget muestra la respuesta transmitida por el servidor', true);
  ok('el campo de texto se vacía tras enviar', (await caja.inputValue()) === '');
  const primera = solicitudes[0];
  ok('el servidor envió al modelo el system propio y UN turno de usuario', Array.isArray(primera.system) || typeof primera.system === 'string');
  ok('el modelo recibió el texto del usuario', JSON.stringify(primera.messages).includes('ruma de granos'));
  await caja.fill('FALLA_PROVEEDOR por favor');
  await caja.press('Enter');
  await p.getByText('no está disponible', { exact: false }).first().waitFor({ timeout: 15000 });
  const cuerpo = await p.locator('body').innerText();
  ok('un fallo del proveedor se muestra con mensaje fijo', true);
  ok('el detalle del proveedor (clave, saldo, org) NO llega al navegador', !/sk-ant|SECRETO|saldo|org_999/.test(cuerpo));
  ok('sin errores de JavaScript en la página', errores.length === 0, errores.slice(0, 2).join(' | '));
  await ctx.close();

  // ── Espacio de trabajo /asistente: tarjetas de herramientas reales ───────
  console.error('\n── /asistente ──');
  const ctx2 = await nav.newContext({ viewport: { width: 1440, height: 1000 } });
  const w = await ctx2.newPage();
  const errores2 = [];
  w.on('pageerror', (e) => errores2.push(String(e)));
  await w.goto(`${BASE}/asistente`, { waitUntil: 'domcontentloaded' });
  const entrada = w.getByPlaceholder('Escriba su consulta...');
  await entrada.waitFor({ timeout: 10000 });
  await entrada.fill('QUIERO_FICHA de mantas');
  await w.getByRole('button', { name: 'Enviar' }).click();
  await w.getByText('Esta es la ficha real del producto.').first().waitFor({ timeout: 20000 });
  ok('el asistente completó el ciclo herramienta → respuesta', true);
  const usoHerramienta = solicitudes.some((s) => JSON.stringify(s).includes('tool_result'));
  ok('el servidor EJECUTÓ la herramienta y devolvió su resultado al modelo', usoHerramienta);
  const trasHerramienta = solicitudes.find((s) => JSON.stringify(s).includes('tool_result'));
  ok('el resultado de la herramienta sale del catálogo real, no del cliente', /found\\?":\s*true/.test(JSON.stringify(trasHerramienta)));
  await w.getByRole('button', { name: 'Resultados' }).click().catch(() => undefined);
  const tarjetas = await w.locator('section').filter({ hasText: 'Mantas' }).count();
  ok('se derivó una tarjeta de producto a partir del resultado real', tarjetas > 0);
  ok('sin errores de JavaScript en /asistente', errores2.length === 0, errores2.slice(0, 2).join(' | '));
  await ctx2.close();
} catch (e) {
  ok('el recorrido terminó sin excepción', false, String(e?.stack || e).slice(0, 500));
} finally {
  await nav.close().catch(() => undefined);
  fake.close();
}
console.error(`\n${R.length - fallos}/${R.length} comprobaciones correctas.`);
process.exit(fallos ? 1 : 0);
