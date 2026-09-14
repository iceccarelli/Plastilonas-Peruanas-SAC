import { test } from 'node:test';
import assert from 'node:assert/strict';
import { responderMcp } from '../src/mcp';
import { RECURSOS, PLANTILLAS_RECURSO, RecursoDesconocido, leerRecurso } from '../src/recursos';
import { INSTRUCCIONES, construirInstruccion, InstruccionDesconocida } from '../src/instrucciones';

/**
 * LAS TRES PRIMITIVAS.
 *
 * Casi todos los servidores MCP que circulan publican sólo herramientas. Las
 * otras dos no son adorno:
 *
 *   RECURSOS los lee el cliente y los adjunta al contexto — no hay decisión del
 *   modelo que acertar. Por eso la lista de lo que esta empresa NO afirma vive
 *   ahí: un modelo que no la ha leído rellena, y rellenar en este rubro es
 *   inventar una certificación.
 *
 *   INSTRUCCIONES las elige la PERSONA. Son lo que hace que esto lo pueda usar
 *   un jefe de compras que no sabe qué es MCP.
 */

const pedir = async (method: string, params?: Record<string, unknown>) =>
  (await responderMcp({ jsonrpc: '2.0', id: 1, method, params })) as {
    result?: Record<string, unknown>;
    error?: { code: number; message: string; data?: unknown };
  };

test('el servidor declara las tres capacidades, no sólo herramientas', async () => {
  const r = await pedir('initialize');
  const c = r.result?.capabilities as Record<string, unknown>;
  assert.ok(c.tools, 'faltan herramientas');
  assert.ok(c.resources, 'faltan recursos: el cliente no sabría que puede leerlos');
  assert.ok(c.prompts, 'faltan instrucciones: sin ellas sólo sirve si el modelo acierta a llamar');
});

test('las instrucciones de arranque mandan leer los límites antes de afirmar nada', async () => {
  const r = await pedir('initialize');
  assert.match(String(r.result?.instructions), /plastilonas:\/\/limites/);
});

test('el primer recurso de la lista es lo que la empresa NO afirma', async () => {
  // El orden importa: un cliente que adjunta «el primero» adjunta el que evita
  // que el modelo invente una certificación.
  const r = await pedir('resources/list');
  const recursos = r.result?.resources as { uri: string; description: string }[];
  assert.equal(recursos[0]?.uri, 'plastilonas://limites');
  assert.match(recursos[0]!.description, /ADJUNTE ESTE RECURSO/);
});

test('cada recurso se anuncia con uri, título, descripción y tipo', async () => {
  const r = await pedir('resources/list');
  for (const x of r.result?.resources as Record<string, string>[]) {
    for (const campo of ['uri', 'name', 'title', 'description', 'mimeType']) {
      assert.ok(x[campo], `un recurso sin ${campo}`);
    }
    assert.ok(x.uri!.startsWith('plastilonas://'), `esquema inesperado: ${x.uri}`);
    assert.ok(x.description!.length > 60, `${x.uri}: descripción demasiado corta para decidir si adjuntarlo`);
  }
});

test('hay una plantilla para leer una ficha sin traerse el catálogo entero', async () => {
  const r = await pedir('resources/templates/list');
  const plantillas = r.result?.resourceTemplates as { uriTemplate: string }[];
  assert.ok(plantillas.some((p) => p.uriTemplate.includes('{slug}')));
  assert.deepEqual(plantillas, PLANTILLAS_RECURSO);
});

test('los cálculos se leen como recurso sin tocar la red', async () => {
  // Es el único que no depende del sitio: si el sitio cae, el método sigue
  // siendo legible y citable.
  const { mimeType, text } = await leerRecurso('plastilonas://calculos');
  assert.equal(mimeType, 'application/json');
  const d = JSON.parse(text) as { calculos: { formula: string[]; no_cubre: string[] }[]; limites: string[] };
  assert.ok(d.calculos.length >= 5);
  for (const c of d.calculos) {
    assert.ok(c.formula.length > 0);
    assert.ok(c.no_cubre.length > 0);
  }
  assert.ok(d.limites.length > 0);
});

test('un recurso inexistente devuelve −32002 y la lista de los que sí existen', async () => {
  // −32002 es el código que el protocolo reserva para «no encontrado»: un
  // cliente lo distingue de un fallo del servidor y puede ofrecer la lista.
  const r = await pedir('resources/read', { uri: 'plastilonas://inventado' });
  assert.equal(r.error?.code, -32002);
  assert.ok(((r.error?.data as { disponibles: string[] }).disponibles ?? []).length >= 6);
  await assert.rejects(() => leerRecurso('plastilonas://inventado'), RecursoDesconocido);
});

test('las cuatro instrucciones se anuncian con sus argumentos', async () => {
  const r = await pedir('prompts/list');
  const prompts = r.result?.prompts as { name: string; title: string; description: string; arguments: unknown[] }[];
  assert.ok(prompts.length >= 4);
  assert.deepEqual(
    prompts.map((p) => p.name).sort(),
    INSTRUCCIONES.map((i) => i.name).sort(),
  );
  for (const p of prompts) {
    assert.ok(p.title, `${p.name} sin título: en un cliente MCP el título es lo que ve la persona`);
    assert.ok(p.description.length > 60, `${p.name}: descripción demasiado corta`);
    assert.ok(Array.isArray(p.arguments));
  }
});

test('TODA instrucción impone las reglas del proveedor antes que la tarea', () => {
  /**
   * Un proveedor que entrega el guion también entrega las restricciones. Si no,
   * el guion se usa para vender de más: precios inventados, certificaciones
   * atribuidas y un RFQ registrado sin que nadie lo pidiera.
   */
  for (const i of INSTRUCCIONES) {
    const args = Object.fromEntries(i.arguments.map((a) => [a.name, 'prueba']));
    const { texto } = construirInstruccion(i.name, args);
    assert.match(texto, /NO des precios/, `${i.name} no prohíbe dar precios`);
    assert.match(texto, /NO atribuyas certificaciones/, `${i.name} no prohíbe atribuir certificaciones`);
    assert.match(texto, /PREDIMENSIONAMIENTO/, `${i.name} no recuerda el límite del cálculo`);
    assert.match(texto, /NO registres una solicitud/, `${i.name} no exige consentimiento para el RFQ`);
    assert.match(texto, /RUC 20523135385/, `${i.name} no identifica al proveedor`);
  }
});

test('una instrucción sin sus argumentos obligatorios no se construye a medias', async () => {
  const r = await pedir('prompts/get', { name: 'cuanto-material-necesito', arguments: {} });
  assert.equal(r.error?.code, -32602);
  assert.match(String(r.error?.message), /que_necesita/);
});

test('una instrucción inexistente devuelve la lista de las que hay', async () => {
  const r = await pedir('prompts/get', { name: 'no-existe', arguments: {} });
  assert.equal(r.error?.code, -32602);
  assert.ok(((r.error?.data as { disponibles: string[] }).disponibles ?? []).length >= 4);
  assert.throws(() => construirInstruccion('no-existe', {}), InstruccionDesconocida);
});

test('la instrucción de especificar enseña a leer la certeza antes de hablar', async () => {
  // Es la diferencia entre un agente que lidera con la familia equivocada y uno
  // que hace primero la pregunta que cierra la ambigüedad.
  const r = await pedir('prompts/get', {
    name: 'especificar-un-requerimiento',
    arguments: { problema: 'poza de relaves', sector: 'Minería' },
  });
  const texto = ((r.result?.messages as { content: { text: string } }[])[0]!).content.text;
  assert.match(texto, /certeza/);
  assert.match(texto, /NO lideres con un producto/);
  assert.match(texto, /lo_que_no_decidimos_por_usted/);
});

test('la instrucción de fabricar o importar obliga a decir cuándo gana importar', () => {
  // El proveedor lo publica en su sitio; ocultarlo contradiría su propia página.
  const { texto } = construirInstruccion('fabricar-en-peru-o-importar', { producto: 'big bags' });
  assert.match(texto, /GANA IMPORTAR/);
});

test('el recurso de límites apunta a la superficie que el sitio ya publica', () => {
  // Sin duplicar la lista: si el sitio añade un límite, aquí llega solo.
  const limites = RECURSOS.find((r) => r.uri === 'plastilonas://limites');
  assert.ok(limites);
  assert.equal(limites!.mimeType, 'text/plain');
});
