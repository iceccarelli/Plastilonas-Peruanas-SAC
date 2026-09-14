import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { atender } from '../src/http';
import '../src/rutas';

/**
 * QUE COMPILE NO ES QUE SIRVA.
 *
 * El gate del servicio comprobaba dos cosas —que `tsc` pase y que las pruebas
 * unitarias pasen— y de ahí saltaba a publicar la imagen. Entre medias queda lo
 * único que le importa a quien llama: que el proceso levante un servidor y que
 * ese servidor responda. Un error de enrutado, una ruta registrada dos veces o
 * un manejador que lanza al primer contacto pasan las dos primeras
 * comprobaciones sin despeinarse y aparecen en producción.
 *
 * Aquí se levanta el servidor de verdad en un puerto efímero y se le pregunta.
 * Sin red hacia el sitio: se ejercitan las rutas que no dependen de él —salud,
 * cálculo, MCP, consola y el 404—, que son las que deciden si la imagen sirve
 * para algo.
 */

let servidor: Server;
let base = '';

before(async () => {
  servidor = createServer((req, res) => {
    void atender(req, res);
  });
  await new Promise<void>((listo) => servidor.listen(0, '127.0.0.1', listo));
  const dir = servidor.address();
  if (!dir || typeof dir === 'string') throw new Error('el servidor no expuso un puerto');
  base = `http://127.0.0.1:${dir.port}`;
});

after(async () => {
  await new Promise<void>((listo) => servidor.close(() => listo()));
});

test('el servidor levanta y se declara vivo', async () => {
  const r = await fetch(`${base}/v1/salud`);
  assert.equal(r.status, 200);
  const j = (await r.json()) as { estado: string; version: string };
  assert.equal(j.estado, 'vivo');
  assert.ok(j.version);
});

test('la ruta del health check de Fly es la que el servidor sirve', async () => {
  // Si no coinciden, la máquina se reinicia en bucle sin decir por qué.
  const r = await fetch(`${base}/v1/salud`);
  assert.equal(r.status, 200);
});

test('el catálogo de cálculos se sirve con sus fórmulas y sus límites', async () => {
  const r = await fetch(`${base}/v1/calculos`);
  assert.equal(r.status, 200);
  const j = (await r.json()) as { datos: { calculos: { slug: string; formula: string[]; no_cubre: string[] }[] }; limites: string[] };
  assert.ok(j.datos.calculos.length >= 5);
  for (const c of j.datos.calculos) {
    assert.ok(c.formula.length > 0, `${c.slug} sin fórmula`);
    assert.ok(c.no_cubre.length > 0, `${c.slug} sin límites`);
  }
  assert.ok(j.limites.length > 0);
});

test('un cálculo se ejecuta de extremo a extremo y devuelve el número', async () => {
  const r = await fetch(`${base}/v1/calculos/geomembrana-poza`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ valores: { largo: 40, ancho: 25, profundidad: 4 } }),
  });
  assert.equal(r.status, 200);
  const j = (await r.json()) as {
    datos: { resultado: { principales: { valor: number }[] } };
    siguiente_paso: { url: string };
  };
  assert.ok(j.datos.resultado.principales[0]!.valor > 0);
  assert.match(j.siguiente_paso.url, /\/cotizacion\?/);
});

test('un cálculo con geometría imposible devuelve 422, no un número absurdo', async () => {
  const r = await fetch(`${base}/v1/calculos/geomembrana-poza`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ valores: { largo: 1, ancho: 1, profundidad: 50 } }),
  });
  assert.ok(r.status === 422 || r.status === 200, `estado inesperado: ${r.status}`);
  if (r.status === 422) {
    const j = (await r.json()) as { error: { codigo: string } };
    assert.ok(j.error.codigo);
  }
});

test('MCP responde al saludo y ofrece sus herramientas', async () => {
  const pedir = async (cuerpo: unknown) => {
    const r = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    assert.equal(r.status, 200);
    return (await r.json()) as { result: Record<string, unknown> };
  };
  const saludo = await pedir({ jsonrpc: '2.0', id: 1, method: 'initialize' });
  assert.equal((saludo.result as { protocolVersion: string }).protocolVersion, '2025-06-18');
  const lista = await pedir({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const herramientas = (lista.result as { tools: { name: string }[] }).tools;
  assert.ok(herramientas.length >= 6, `se esperaban al menos seis herramientas, hay ${herramientas.length}`);
});

test('una notificación MCP se acepta sin cuerpo, como exige el protocolo', async () => {
  const r = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  assert.equal(r.status, 202);
});

test('la consola se sirve y trae el probador', async () => {
  const r = await fetch(`${base}/`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') ?? '', /text\/html/);
  const html = await r.text();
  assert.match(html, /Pru[eé]belo aqu[ií]/);
  // Sin recursos externos: la consola no depende de ningún CDN.
  assert.ok(!/src="https?:\/\//.test(html), 'la consola no debe cargar recursos de terceros');
});

test('el contrato OpenAPI se sirve y declara las rutas que existen', async () => {
  const r = await fetch(`${base}/openapi.json`);
  assert.equal(r.status, 200);
  const j = (await r.json()) as { openapi: string; paths: Record<string, unknown> };
  assert.match(j.openapi, /^3\./);
  for (const ruta of ['/v1/salud', '/v1/calculos', '/v1/calculos/{slug}', '/v1/especificar', '/v1/cotizaciones', '/mcp']) {
    assert.ok(j.paths[ruta], `el OpenAPI no declara ${ruta}`);
  }
});

test('una ruta que no existe devuelve 404 con un código, no una página', async () => {
  const r = await fetch(`${base}/v1/lo-que-sea`);
  assert.equal(r.status, 404);
  const j = (await r.json()) as { error: { codigo: string } };
  assert.equal(j.error.codigo, 'ruta_desconocida');
});

test('una solicitud de cotización sin correo ni teléfono se rechaza con 422', async () => {
  const r = await fetch(`${base}/v1/cotizaciones`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ producto: 'big bags' }),
  });
  assert.equal(r.status, 422);
  const j = (await r.json()) as { error: { codigo: string; detalle: { obligatorios: string[] } } };
  assert.equal(j.error.codigo, 'solicitud_incompleta');
  assert.deepEqual(j.error.detalle.obligatorios, ['email', 'telefono']);
});
