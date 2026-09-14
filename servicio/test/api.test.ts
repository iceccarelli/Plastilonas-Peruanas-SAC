import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutar, catalogoDeCalculos, CalculoInvalido, notaParaCotizacion } from '../src/calculos';
import { validar, SolicitudInvalida } from '../src/cotizaciones';
import { responderMcp, HERRAMIENTAS } from '../src/mcp';
import { openapi } from '../src/openapi';
import { puntuar, buscar, buscarConPuntaje, certezaDe, type ProductoDelSitio } from '../src/sitio';
import { LIMITES_GLOBALES, enlaceCotizacion } from '../src/contrato';
import { envoltorioDeEspecificacion, especificar, RequerimientoVacio, type Especificacion } from '../src/especificar';

/**
 * Lo que estas pruebas protegen no es que el código corra: es que la API no
 * empiece a decir cosas que la empresa no puede sostener. Un precio colado, un
 * número sin sus límites o una herramienta MCP sin descripción son los tres
 * modos conocidos de que esto deje de ser un activo y pase a ser un pasivo.
 */

test('ninguna respuesta de cálculo publica un precio', () => {
  const prohibido = /(precio|costo|tarifa|USD|S\/\.|soles|d[oó]lares)/i;
  for (const c of catalogoDeCalculos()) {
    const texto = JSON.stringify(c);
    assert.ok(!prohibido.test(texto), `el cálculo ${c.slug} menciona dinero`);
  }
});

test('todo cálculo declara su fórmula y lo que no cubre', () => {
  const cs = catalogoDeCalculos();
  assert.ok(cs.length >= 5, 'se esperaban al menos cinco cálculos publicados');
  for (const c of cs) {
    assert.ok(c.formula.length > 0, `${c.slug} sin fórmula publicada`);
    assert.ok(c.no_cubre.length > 0, `${c.slug} no declara sus límites`);
    assert.ok(c.campos.length > 0, `${c.slug} sin campos`);
  }
});

test('un cálculo devuelve el número, su desglose y de dónde salió cada supuesto', () => {
  const hecho = ejecutar({ slug: 'geomembrana-poza', valores: {} });
  assert.equal(hecho.calculo, 'geomembrana-poza');
  assert.ok(hecho.resultado.principales.length > 0);
  assert.ok(hecho.supuestos_aplicados.every((s) => s.origen === 'recibido' || s.origen === 'por defecto'));
  assert.ok(hecho.no_cubre.length > 0);
  assert.ok(notaParaCotizacion(hecho).includes('predimensionamiento'));
});

test('un campo que el cálculo no acepta se rechaza en lugar de ignorarse', () => {
  // Ignorarlo en silencio es peor: quien integra cree que su dato se usó.
  assert.throws(
    () => ejecutar({ slug: 'geomembrana-poza', valores: { inventado: 3 } }),
    (e: unknown) => e instanceof CalculoInvalido && e.codigo === 'campos_desconocidos',
  );
});

test('un valor no numérico no se convierte, se rechaza', () => {
  assert.throws(
    () => ejecutar({ slug: 'geomembrana-poza', valores: { largo: '40' as unknown as number } }),
    (e: unknown) => e instanceof CalculoInvalido && e.codigo === 'valor_no_numerico',
  );
});

test('un cálculo inexistente dice cuáles existen', () => {
  try {
    ejecutar({ slug: 'no-existe', valores: {} });
    assert.fail('debió lanzar');
  } catch (e) {
    assert.ok(e instanceof CalculoInvalido);
    assert.equal(e.codigo, 'calculo_desconocido');
    assert.ok(Array.isArray((e.detalle as { disponibles: string[] }).disponibles));
  }
});

test('una solicitud sin correo ni teléfono no se acepta, y dice qué falta', () => {
  try {
    validar({ producto: 'big bags' });
    assert.fail('debió lanzar');
  } catch (e) {
    assert.ok(e instanceof SolicitudInvalida);
    assert.deepEqual(e.campos.sort(), ['email', 'telefono']);
  }
});

test('una solicitud válida conserva los cinco datos que evitan repreguntar', () => {
  const v = validar({
    email: 'compras@empresa.com',
    telefono: '+51 999 999 999',
    producto: 'geomembrana',
    cantidad: '2400 m2',
    medidas: '1.5 mm',
    ciudad_entrega: 'Arequipa',
    fecha_necesaria: '2026-11-15',
  });
  assert.equal(v.email, 'compras@empresa.com');
  assert.equal(v.campos.producto, 'geomembrana');
  assert.equal(v.campos.ciudad, 'Arequipa');
});

test('un RUC que no tiene once dígitos no viaja como si los tuviera', () => {
  assert.equal(validar({ email: 'a@b.com', telefono: '999999', ruc: '123' }).campos.ruc, undefined);
  assert.equal(validar({ email: 'a@b.com', telefono: '999999', ruc: '20523135385' }).campos.ruc, '20523135385');
});

test('MCP se presenta con el protocolo y con instrucciones que prohíben inventar precios', async () => {
  const r = (await responderMcp({ jsonrpc: '2.0', id: 1, method: 'initialize' })) as {
    result: { protocolVersion: string; instructions: string };
  };
  assert.equal(r.result.protocolVersion, '2025-06-18');
  assert.match(r.result.instructions, /NO devuelve precios/);
});

test('MCP no responde a las notificaciones, como exige el protocolo', async () => {
  assert.equal(await responderMcp({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
});

test('cada herramienta MCP dice cuándo llamarla, no sólo qué hace', () => {
  assert.ok(HERRAMIENTAS.length >= 5);
  for (const h of HERRAMIENTAS) {
    assert.ok(h.description.length > 120, `${h.name} tiene una descripción demasiado corta para que un modelo decida`);
    assert.equal((h.inputSchema as { type: string }).type, 'object');
  }
});

test('la herramienta de cálculo devuelve límites y un siguiente paso que convierte', async () => {
  const r = (await responderMcp({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: 'calcular_predimensionamiento', arguments: { calculo: 'geomembrana-poza', valores: {} } },
  })) as { result: { isError: boolean; structuredContent: { limites: string[]; siguiente_paso: { url: string } } } };
  assert.equal(r.result.isError, false);
  assert.ok(r.result.structuredContent.limites.length > 0);
  assert.match(r.result.structuredContent.siguiente_paso.url, /\/cotizacion\?/);
});

test('un error de herramienta vuelve como resultado, no como error de protocolo', async () => {
  // Si vuelve como error JSON-RPC, el modelo abandona; como resultado, corrige.
  const r = (await responderMcp({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'calcular_predimensionamiento', arguments: { calculo: 'no-existe' } },
  })) as { result: { isError: boolean } };
  assert.equal(r.result.isError, true);
});

test('el enlace de cotización lleva el contexto cargado y recortado', () => {
  const u = new URL(enlaceCotizacion({ producto: 'x'.repeat(400), nota: 'y'.repeat(4000), origen: 'mcp:calculo' }));
  assert.equal(u.pathname, '/cotizacion');
  assert.ok((u.searchParams.get('producto') ?? '').length <= 120);
  assert.ok((u.searchParams.get('nota') ?? '').length <= 1500);
  assert.equal(u.searchParams.get('origen'), 'mcp:calculo');
});

test('los límites globales nombran la planta, los Incoterms y la ausencia de precios', () => {
  const texto = LIMITES_GLOBALES.join(' ');
  assert.match(texto, /no publica precios/);
  assert.match(texto, /Chorrillos/);
  assert.match(texto, /EXW Lima|FCA Lima|FOB Callao/);
});

test('OpenAPI se genera con los slugs reales del motor', () => {
  const doc = openapi() as { paths: Record<string, { post?: { parameters?: { schema?: { enum?: string[] } }[] } }> };
  const enumerado = doc.paths['/v1/calculos/{slug}']?.post?.parameters?.[0]?.schema?.enum ?? [];
  assert.deepEqual([...enumerado].sort(), catalogoDeCalculos().map((c) => c.slug).sort());
});

const ficha = (extra: Partial<ProductoDelSitio> = {}): ProductoDelSitio => ({
  slug: 'geomembrana-hdpe', name: 'Geomembrana HDPE', url: '', familia: 'Geosintéticos', familiaUrl: '',
  descripcionCorta: 'Impermeabilización de pozas', descripcion: 'Revestimiento de pozas de relaves y canales.',
  especificaciones: [], aplicaciones: ['pozas de relaves'], beneficios: [], sectores: ['minería'],
  suministro: { origen: null, disponibilidad: '', plazoReferencial: null, documentacion: '' },
  fichaTecnicaPdf: '', terminosClave: [], arquitecturas: [], ...ficha_extra(extra),
});
function ficha_extra(e: Partial<ProductoDelSitio>): Partial<ProductoDelSitio> { return e; }

test('la búsqueda puntúa el nombre por encima del cuerpo y no inventa coincidencias', () => {
  assert.ok(puntuar(ficha(), 'geomembrana') > puntuar(ficha(), 'relaves'));
  assert.equal(puntuar(ficha(), 'automóviles'), 0);
});

test('se comparan palabras, no subcadenas: «sol» no encuentra «soldadura»', () => {
  // Medido sobre el catálogo real: «cubrir hectáreas de vivero del sol»
  // devolvía biombos para SOLdadura. Una palabra corta usada como subcadena es
  // un comodín, y el resultado se presenta con la misma confianza que uno bueno.
  const biombo = ficha({ slug: 'biombo', name: 'Biombo para soldadura', descripcion: 'Protección en trabajos de soldadura.' });
  assert.equal(puntuar(biombo, 'sol'), 0);
  // Y desde cinco letras sí se admite la variante morfológica.
  const manga = ficha({ slug: 'mangas', name: 'Mangas de ventilación', descripcion: 'Ventilación de labores.' });
  assert.ok(puntuar(manga, 'manga') > 0);
});

test('un producto que sólo coincide en vocabulario genérico no es candidato', () => {
  /**
   * «Años», «vida» y «útil» aparecen en media docena de fichas; sumadas
   * bastaban para colar una malla antiáfidos en la consulta de una poza de
   * relaves. Se exige al menos una coincidencia que DISTINGA.
   */
  const catalogo = [
    ficha({ slug: 'geomembrana', name: 'Geomembrana HDPE', descripcion: 'Revestimiento de pozas de relaves. Larga vida útil.' }),
    ficha({ slug: 'malla', name: 'Malla antiáfidos', familia: 'Mallas', descripcion: 'Protección de cultivos. Larga vida útil.', aplicaciones: ['invernadero'], sectores: ['agricultura'] }),
    ficha({ slug: 'lona', name: 'Lona para camión', familia: 'Lonas', descripcion: 'Cobertura de carga. Larga vida útil.', aplicaciones: ['transporte'], sectores: ['transporte'] }),
  ];
  const encontrados = buscar(catalogo, 'poza de relaves con larga vida útil').map((p) => p.slug);
  assert.deepEqual(encontrados, ['geomembrana']);
});

test('la certeza dice cuánto se puede fiar un agente de la lista', () => {
  // Una lista insegura presentada como segura es cómo un comprador acaba con
  // el producto equivocado.
  const uno = [{ producto: ficha(), puntos: 9, ventaja: Infinity, en_nombre: true }];
  assert.equal(certezaDe(uno), 'alta');
  assert.equal(certezaDe([]), 'baja');
  // Separarse del segundo no basta si ninguna palabra tocó un nombre.
  assert.equal(certezaDe([{ producto: ficha(), puntos: 2.9, ventaja: 3, en_nombre: false }]), 'baja');
  // Empate entre dos productos de LA MISMA familia: la familia es la respuesta,
  // y lo abierto —qué polímero— ya es una de las preguntas pendientes.
  const otra = ficha({ slug: 'malla', familia: 'Mallas' });
  assert.equal(
    certezaDe([{ producto: ficha(), puntos: 9, ventaja: 1.02, en_nombre: true }, { producto: ficha({ slug: 'pe' }), puntos: 8.8, ventaja: 1.02, en_nombre: true }]),
    'alta',
  );
  // Entre familias distintas manda la separación.
  assert.equal(certezaDe([{ producto: ficha(), puntos: 9, ventaja: 2, en_nombre: true }, { producto: otra, puntos: 4.5, ventaja: 2, en_nombre: true }]), 'alta');
  assert.equal(certezaDe([{ producto: ficha(), puntos: 9, ventaja: 1.2, en_nombre: true }, { producto: otra, puntos: 7.5, ventaja: 1.2, en_nombre: true }]), 'media');
  assert.equal(certezaDe([{ producto: ficha(), puntos: 9, ventaja: 1.05, en_nombre: true }, { producto: otra, puntos: 8.6, ventaja: 1.05, en_nombre: true }]), 'baja');
});

test('buscarConPuntaje descarta lo que queda muy por debajo del mejor', () => {
  const catalogo = [
    ficha({ slug: 'geomembrana', name: 'Geomembrana HDPE para pozas' }),
    ficha({ slug: 'tuberia', name: 'Tubería HDPE', familia: 'Fluidos', descripcion: 'Conducción.', aplicaciones: ['conducción'], sectores: ['minería'] }),
  ];
  const r = buscarConPuntaje(catalogo, 'geomembrana para poza');
  assert.equal(r[0]?.producto.slug, 'geomembrana');
  assert.ok(r.every((c) => c.puntos >= (r[0]?.puntos ?? 0) * 0.55));
});

test('una descripción demasiado corta no se especifica, se devuelve la pregunta', async () => {
  await assert.rejects(() => especificar({ descripcion: 'lona' }), RequerimientoVacio);
});

test('una especificación declara lo que NO se decide por el comprador', () => {
  // Compatibilidad química, vida útil bajo exposición, diseño estructural y las
  // certificaciones del pliego: cuatro decisiones que se firman, y aquí no se
  // firma nada. Callarlas induce a usar el resto fuera de sus límites.
  const e: Especificacion = {
    entendido: { descripcion: 'x' },
    certeza: 'alta',
    candidatos: [],
    variables_a_definir: [],
    preguntas_pendientes: [],
    calculo_sugerido: null,
    lo_que_no_decidimos_por_usted: [],
  };
  const env = envoltorioDeEspecificacion(e);
  assert.match(env.limites[0]!, /no una recomendación de ingeniería/);
  assert.equal(env.siguiente_paso.accion, 'solicitar_cotizacion');
  assert.match(env.siguiente_paso.url, /\/cotizacion\?/);
});

test('con preguntas pendientes, el siguiente paso es completarlas, no cotizar', () => {
  const e: Especificacion = {
    entendido: { descripcion: 'x' },
    certeza: 'baja',
    candidatos: [],
    variables_a_definir: [],
    preguntas_pendientes: ['¿qué cantidad?'],
    calculo_sugerido: null,
    lo_que_no_decidimos_por_usted: [],
  };
  assert.equal(envoltorioDeEspecificacion(e).siguiente_paso.accion, 'completar_datos');
});
