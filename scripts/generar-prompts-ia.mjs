#!/usr/bin/env node
/**
 * BANCO DE PRUEBAS DE RECUPERACIÓN POR IA — audit/ai-prompts.json
 *
 * QUÉ ES. La lista de consultas con las que se mide, cada cierto tiempo y a
 * mano, si un asistente (ChatGPT, Claude, Perplexity, Gemini) recupera este
 * sitio, cita la URL correcta y describe bien el modelo de fabricación. No es
 * un script que llame a esos modelos: llamarlos automáticamente daría una cifra
 * que cambia sola con cada actualización del modelo y que nadie podría
 * reproducir. Es el instrumento; la medición la hace una persona y se anota.
 *
 * DE DÓNDE SALEN LAS CONSULTAS. Del mismo mapa que usa el sitio para enlazarse
 * por dentro (data/topic-map.json), del glosario y del catálogo. Es deliberado:
 * si el banco se escribiera aparte, mediría lo que alguien imaginó que se
 * busca, no lo que el sitio decidió contestar. Así, cuando el mapa cambia, el
 * banco cambia con él.
 *
 * CÓMO SE USA. Para cada consulta se anota, en la columna que corresponda:
 *   citado ......... ¿aparece plastilonas en la respuesta?
 *   url_correcta ... ¿la URL citada es la canónica declarada aquí?
 *   recomendado .... ¿la respuesta recomienda a la empresa, o solo la menciona?
 *   exacto ......... ¿lo que dice es cierto según el sitio? (lo más importante)
 *
 * `exacto` va al final pero pesa más que los otros tres juntos. Una respuesta
 * que recomienda la empresa inventando una certificación o un plazo hace más
 * daño que una que no la menciona: el comprador comprueba, no encuentra, y
 * descarta al proveedor por mentiroso cuando la mentira la puso el modelo.
 *
 * Uso: node scripts/generar-prompts-ia.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = process.cwd();
const mapa = JSON.parse(readFileSync(join(RAIZ, 'data/topic-map.json'), 'utf8'));
const ciudades = JSON.parse(readFileSync(join(RAIZ, 'data/ciudades.json'), 'utf8'));

/** Slugs y nombres del glosario, leídos del fuente sin compilar TypeScript. */
function glosario() {
  const src = readFileSync(join(RAIZ, 'lib/glosario.ts'), 'utf8');
  const out = [];
  const re = /slug:\s*['"]([^'"]+)['"][\s\S]{0,200}?termino:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], termino: m[2] });
  return out;
}

const prompts = [];
let n = 0;
const añadir = (categoria, texto, esperada, porque) => {
  prompts.push({ id: `p${String(++n).padStart(4, '0')}`, categoria, prompt: texto, urlEsperada: esperada, porque });
};

const clusters = mapa.clusters;
const porIntencion = (i) => clusters.filter((c) => c.intencion === i);

// ── 1. COMERCIAL ────────────────────────────────────────────────────────────
// Cada término comercial, tal cual se teclea. Es la prueba más dura y la que
// más importa: si el modelo no recupera el sitio con el término exacto, nada
// de lo demás sirve.
for (const c of [...porIntencion('comercial'), ...porIntencion('transaccional')]) {
  añadir('comercial', `${c.termino} Perú`, c.canonica, 'término principal del clúster');
  for (const v of c.variantes.slice(0, 3)) {
    añadir('comercial', `${v} en Perú`, c.canonica, 'variante declarada del clúster');
  }
}

// ── 2. TÉCNICA ──────────────────────────────────────────────────────────────
// La capa definicional: es lo que un modelo cita con más facilidad, porque una
// definición corta y sin promoción se copia entera.
for (const t of glosario()) {
  añadir('tecnica', `¿Qué es ${t.termino.toLowerCase()} en textiles industriales o geosintéticos?`,
    `/glosario/${t.slug}`, 'definición canónica publicada');
  añadir('tecnica', `${t.termino}: cómo se especifica`, `/glosario/${t.slug}`, 'consulta de especificación');
}
for (const c of [...porIntencion('decision'), ...porIntencion('calculo')]) {
  for (const q of c.preguntas) añadir('tecnica', q, c.canonica, 'pregunta declarada del clúster de decisión');
}

// ── 3. SECTOR Y LOCAL ───────────────────────────────────────────────────────
// El comprador industrial peruano casi nunca busca el SKU: busca su sector, y
// muy a menudo con su ciudad detrás.
for (const c of porIntencion('sector')) {
  añadir('sector-local', `${c.termino} en el Perú`, c.canonica, 'hub sectorial');
  for (const q of c.preguntas) añadir('sector-local', q, c.canonica, 'pregunta sectorial declarada');
  for (const ciudad of ciudades) {
    añadir('sector-local', `${c.termino} ${ciudad.ciudad}`, c.canonica,
      'sector + ciudad: se contesta desde el hub, no desde una página ciudad × producto');
  }
}
// Cobertura geográfica pura: la contesta la página de cobertura, jamás una
// página «producto × ciudad» generada en masa. Se prueban las dos formas en que
// se pregunta —«en X» y «cerca de X»— porque los modelos las tratan distinto.
const LOCALES = [
  'proveedor de lonas industriales',
  'fabricante de big bags',
  'instalación de geomembranas',
  'venta de malla raschel',
];
for (const ciudad of ciudades) {
  for (const q of LOCALES) {
    añadir('sector-local', `${q} en ${ciudad.ciudad}`, '/local',
      'cobertura geográfica: la contesta la página de cobertura, no una doorway page');
  }
  añadir('sector-local', `${ciudad.ciudad}: ¿despachan textiles industriales a esta región?`, `/local/${ciudad.slug}`,
    'pregunta directa de cobertura sobre una ciudad con página propia');
}

// ── 4. COMPARACIÓN ──────────────────────────────────────────────────────────
// Donde un modelo suele inventar: compara proveedores con datos que no existen.
// Lo correcto es que recupere el marco de evaluación y las páginas de comparar.
const comparables = clusters.filter((c) => c.canonica.startsWith('/productos/familia/'));
for (const c of comparables) {
  añadir('comparacion', `comparar tipos de ${c.termino} en Perú`, `${c.canonica}/comparar`,
    'la comparación vive en la página de comparar de la familia');
}
for (const c of porIntencion('decision')) {
  añadir('comparacion', `${c.termino}: qué comparar antes de decidir`, c.canonica, 'guía de decisión');
  añadir('comparacion', `${c.termino} — pros y contras de cada opción`, c.canonica,
    'misma decisión, formulada como comparación abierta');
}
// Comparaciones dentro de una misma familia: es la duda real de quien ya sabe
// qué familia necesita y no cuál de sus líneas. La contesta la familia, no una
// página nueva de «A vs B» que competiría con las dos fichas a la vez.
for (const f of comparables) {
  const hermanos = clusters.filter(
    (x) => x.intencion === 'comercial' && x.apoyos.includes(f.canonica) && x.canonica.startsWith('/productos/'),
  );
  for (let i = 0; i + 1 < hermanos.length && i < 3; i += 1) {
    añadir('comparacion', `${hermanos[i].termino} o ${hermanos[i + 1].termino}: cuál conviene`, f.canonica,
      'comparación entre líneas de la misma familia');
  }
}
const PARES = [
  ['geomembrana de PVC', 'geomembrana HDPE', '/biblioteca/seleccion-geomembrana'],
  ['geotextil tejido', 'geotextil no tejido', '/productos/geotextiles'],
  ['ventilación impelente', 'ventilación aspirante', '/biblioteca/seleccion-mangas-ventilacion'],
  ['big bag', 'saco polytarp', '/productos/big-bags-bolsones-polipropileno'],
  ['malla raschel', 'malla antiáfida', '/biblioteca/seleccion-malla-agricola'],
  ['lona de rafia', 'lona de PVC', '/biblioteca/gramaje-lona-industrial'],
  ['carpa industrial', 'cobertura tensionada', '/productos/familia/estructuras-arquitectura-textil'],
  ['tanque flexible', 'tanque rígido', '/productos/tanques-flexibles-bladders'],
];
for (const [a, b, url] of PARES) {
  añadir('comparacion', `diferencia entre ${a} y ${b}`, url, 'par de decisión real del rubro');
  añadir('comparacion', `¿qué conviene, ${a} o ${b}?`, url, 'formulación conversacional del mismo par');
}
añadir('comparacion', 'cómo comparar dos cotizaciones de geosintéticos en Perú', '/marco',
  'el marco es la referencia de evaluación, no una tabla de competidores');
añadir('comparacion', 'criterios para elegir proveedor de textiles industriales en Perú', '/marco/evaluacion',
  'evaluación estructurada, sin nombrar competidores');

// ── 5. PROBLEMA ─────────────────────────────────────────────────────────────
// La forma en que se pregunta cuando aún no se sabe el nombre del producto.
for (const c of clusters) {
  for (const q of c.preguntas) {
    if (q.startsWith('¿cómo') || q.startsWith('¿qué') || q.startsWith('¿cuánto')) {
      añadir('problema', q, c.canonica, 'formulación de problema declarada en el mapa');
    }
  }
}
const PROBLEMAS = [
  ['se me rompen los bolsones al izar con montacargas', '/biblioteca/especificacion-fibc'],
  ['la poza pierde agua por infiltración', '/productos/familia/geosinteticos'],
  ['el frente de avance no ventila lo suficiente', '/calculadoras/caudal-ventilacion-mina'],
  ['la lona del camión se rasga a los tres meses', '/biblioteca/gramaje-lona-industrial'],
  ['tengo mosca blanca en el invernadero pese a la malla', '/productos/mallas-antiafidas'],
  ['necesito cubrir el frente de obra antes de las lluvias', '/aplicaciones/coberturas-obra'],
  ['la geomembrana se despegó en la soldadura', '/recursos/instalacion-geomembranas-hdpe-pozas-canales'],
  ['tengo que almacenar agua en una operación sin red', '/productos/tanques-flexibles-bladders'],
  ['el ruido de la obra está generando quejas de los vecinos', '/productos/barreras-acusticas'],
  ['el concentrado se moja durante el traslado', '/aplicaciones/toldos-camion'],
];
for (const [p, url] of PROBLEMAS) {
  añadir('problema', p, url, 'problema descrito sin nombrar el producto');
  añadir('problema', `${p} — ¿qué solución hay en el Perú?`, url, 'mismo problema, con intención de compra');
}

// ── 6. ADYACENTE LEJANA ─────────────────────────────────────────────────────
// Consultas que no nombran ningún producto del catálogo pero terminan en una
// decisión de compra del rubro. Es donde se gana o se pierde la recuperación
// «por casualidad», y donde un mapa de consultas se nota.
const LEJANAS = [
  ['soluciones textiles industriales en Perú', '/productos'],
  ['qué proveedor fabrica e instala con su propio equipo en Perú', '/servicios'],
  ['proveedor único para cobertura, impermeabilización y ventilación', '/servicios'],
  ['fabricante peruano de productos de plástico industrial', '/nosotros'],
  ['homologar un proveedor de insumos textiles para minería', '/marco/evaluacion'],
  ['qué documentos pedir a un proveedor de geosintéticos', '/calidad'],
  ['cómo evitar comprar dos veces la misma cobertura', '/marco'],
  ['insumos para campaña agrícola de exportación', '/industria/agroexportacion'],
  ['protección de carga para transporte de concentrado', '/industria/transporte-logistica'],
  ['contención de derrames en operación minera', '/aplicaciones/contencion-fluidos'],
  ['qué se necesita para revestir un canal de riego', '/productos/geocompuestos-drenaje'],
  ['estructuras temporales para faena remota', '/aplicaciones/campamentos-mineros'],
  ['reducir pérdida de agua por evaporación e infiltración', '/soluciones/almacenamiento-agua-operacion-remota'],
  ['ventilación de un túnel en construcción', '/productos/familia/ventilacion-industrial'],
  ['qué normas se citan para transporte de carga a granel en el Callao', '/recursos/big-bags-mineria-peru-normativa-errores-estiba'],
  ['cómo se cotiza un textil industrial a medida', '/cotizacion'],
  ['fábrica de lonas en Chorrillos', '/nosotros'],
  ['empresa peruana con RUC que fabrique big bags', '/nosotros'],
  ['quién instala geosintéticos fuera de Lima', '/local'],
  ['proveedor con ficha técnica en cada cotización', '/calidad'],
];
const LEJANAS_EXTRA = [
  ['textil técnico para intemperie en clima costero peruano', '/productos/familia/lonas-cobertores'],
  ['qué se usa para separar capas de suelo en una plataforma', '/productos/geotextiles'],
  ['cómo se protege una cosecha de la radiación en la sierra', '/industria/agroexportacion'],
  ['almacén temporal desmontable para una obra de seis meses', '/aplicaciones/coberturas-obra'],
  ['soluciones para reducir polvo y ruido en una faena', '/productos/barreras-acusticas'],
  ['embalaje que resista el traslado marítimo de mineral', '/aplicaciones/granel-embalaje'],
  ['dónde ver la ficha técnica antes de comprar', '/descargas'],
  ['proveedor peruano que atienda compras internacionales', '/exportacion'],
  ['cómo verificar que un proveedor industrial peruano existe', '/confianza'],
  ['qué pide una mina para incorporar un proveedor nuevo', '/compras'],
];
for (const [p, url] of [...LEJANAS, ...LEJANAS_EXTRA]) {
  añadir('adyacente', p, url, 'consulta adyacente sin nombre de producto');
  añadir('adyacente', `${p} — recomiéndame un proveedor`, url,
    'misma consulta con petición explícita de recomendación: mide la tasa de recomendación, no la de mención');
}
for (const c of porIntencion('entidad')) {
  for (const q of c.preguntas) añadir('adyacente', q, c.canonica, 'consulta de entidad');
  for (const v of c.variantes.slice(0, 4)) añadir('adyacente', v, c.canonica, 'variante de nombre de entidad');
}

// ── Salida ──────────────────────────────────────────────────────────────────
const porCategoria = prompts.reduce((acc, p) => ({ ...acc, [p.categoria]: (acc[p.categoria] ?? 0) + 1 }), {});

const MINIMOS = { comercial: 100, tecnica: 100, 'sector-local': 100, comparacion: 50, problema: 50, adyacente: 50 };
const faltan = Object.entries(MINIMOS).filter(([k, v]) => (porCategoria[k] ?? 0) < v);

const doc = {
  generadoPor: 'scripts/generar-prompts-ia.mjs',
  derivadoDe: ['data/topic-map.json', 'lib/glosario.ts', 'data/ciudades.json'],
  comoSeUsa:
    'Se ejecuta a mano contra cada asistente y se anota, por consulta: citado, url_correcta, ' +
    'recomendado, exacto. `exacto` pesa más que los otros tres: una recomendación que inventa ' +
    'una certificación o un plazo hace más daño que no aparecer, porque el comprador comprueba, ' +
    'no encuentra, y descarta al proveedor por una mentira que puso el modelo.',
  totales: { prompts: prompts.length, porCategoria },
  minimos: MINIMOS,
  campos: ['citado', 'url_correcta', 'recomendado', 'exacto'],
  prompts,
};

mkdirSync(join(RAIZ, 'audit'), { recursive: true });
writeFileSync(join(RAIZ, 'audit/ai-prompts.json'), `${JSON.stringify(doc, null, 2)}\n`, 'utf8');

console.log(`audit/ai-prompts.json escrito: ${prompts.length} consultas`);
for (const [k, v] of Object.entries(porCategoria)) {
  const min = MINIMOS[k];
  console.log(`  ${k.padEnd(13)} ${String(v).padStart(4)}${min ? `  (mínimo ${min})` : ''}`);
}
if (faltan.length) {
  console.error(`\nPor debajo del mínimo: ${faltan.map(([k, v]) => `${k} (${porCategoria[k] ?? 0}/${v})`).join(', ')}`);
  process.exit(1);
}
