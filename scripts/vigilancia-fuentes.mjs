#!/usr/bin/env node
/**
 * VIGILANCIA DE FUENTES — comprueba que la evidencia publicada sigue en pie.
 *
 * QUÉ HACE Y QUÉ NO HACE, porque la diferencia es todo:
 *
 *  HACE: recorre las fuentes que citan nuestros informes y guías, comprueba
 *  que siguen respondiendo, y avisa cuáles llevan demasiado tiempo sin
 *  verificarse. Emite un reporte para que una persona decida.
 *
 *  NO HACE: publicar nada. No trae titulares, no ingiere contenido ajeno, no
 *  actualiza cifras solo. Un feed que publica automáticamente contenido de
 *  terceros mete en nuestro grafo de entidad afirmaciones que no controlamos,
 *  genera contenido duplicado y convierte una referencia en una granja de
 *  contenido. Todo el sitio está construido sobre la propiedad contraria: nada
 *  se publica que no se pueda verificar. Este script protege esa propiedad; no
 *  la negocia.
 *
 * POR QUÉ ES UN MECANISMO. Una cita se pudre en silencio: el organismo
 * reorganiza su web, el enlace muere, y el informe sigue diciendo "según
 * MINEM" con un enlace roto durante meses. Nadie lo detecta revisando a mano,
 * porque revisar a mano es justamente lo que no se hace. Esto lo detecta.
 *
 * Uso:
 *   npm run vigilancia            # comprueba y reporta
 *   MAX_DIAS=120 npm run vigilancia
 *
 * Sale con código 1 SOLO si alguna cita devolvió 404 o 410, las dos únicas
 * respuestas en que el servidor AFIRMA que el recurso no existe. Todo lo demás
 * —cortafuegos, límites de tasa, errores de red— se informa sin hacer fallar
 * el proceso. Apto para una tarea programada.
 */

import { readFileSync } from 'node:fs';

const MAX_DIAS = Number(process.env.MAX_DIAS ?? 180);
const TIEMPO_ESPERA = Number(process.env.TIMEOUT_MS ?? 15000);

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;

/**
 * Extrae las fuentes declaradas en lib/informes.ts sin importar TypeScript:
 * el script debe poder correr en una tarea programada sin cadena de compilación.
 */
function leerFuentes(ruta, etiqueta) {
  let texto;
  try {
    texto = readFileSync(ruta, 'utf8');
  } catch {
    return [];
  }
  const fuentes = [];
  const bloques = texto.split(/\n\s*\{\s*\n/);
  for (const b of bloques) {
    const url = b.match(/url:\s*'([^']+)'/)?.[1];
    if (!url || !url.startsWith('http')) continue;
    fuentes.push({
      origen: etiqueta,
      url,
      organismo: b.match(/organismo:\s*'([^']+)'/)?.[1]
        ?? b.match(/label:\s*'([^']+)'/)?.[1]
        ?? '(sin organismo)',
      consultado: b.match(/consultado:\s*'([^']+)'/)?.[1] ?? null,
    });
  }
  return fuentes;
}

/**
 * Un rastreador sin cabecera de navegador recibe 403 de casi cualquier portal
 * con cortafuegos, y varios portales del Estado peruano están detrás de uno.
 */
const CABECERAS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; PlastilonasSourceCheck/1.0; +https://plastilonas-peruanas-sac.vercel.app/informes)',
  Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-PE,es;q=0.9',
};

/**
 * Clasificación en CUATRO estados. Es la decisión que decide si este script
 * sirve para algo, y hubo que corregirla dos veces con datos reales.
 *
 * El principio: solo se declara ROTA una cita cuando la respuesta lo DEMUESTRA.
 * Un reporte que grita cuando no pasa nada se deja de leer a la tercera vez, y
 * ahí el mecanismo dejó de existir. Falso negativo caro, falso positivo fatal.
 *
 *  ok         2xx y 3xx. La cita responde.
 *
 *  caida      404 y 410, y NADA MÁS. Son las dos únicas respuestas en que el
 *             servidor afirma que el recurso no existe. Es lo único que hace
 *             fallar el proceso.
 *
 *  bloqueado  401, 403, 429. Un cortafuegos o un límite de tasa rechazó a un
 *             cliente automatizado; la página puede estar perfectamente viva
 *             en un navegador. Se comprobó: gob.pe responde 418 a un fetcher
 *             y 200 a un navegador.
 *
 *  revisar    5xx y fallos de red (DNS, TLS, conexión rechazada, tiempo
 *             agotado). NO prueban nada sobre la cita: un dominio muerto y una
 *             red que no llega producen exactamente el mismo error. Se
 *             descubrió con revistaseguridadminera.com, que falló desde una
 *             red y cargó perfectamente desde otra. Se avisa, no se falla.
 */
function clasificar(estado) {
  if (estado >= 200 && estado < 400) return 'ok';
  if (estado === 404 || estado === 410) return 'caida';
  if (estado === 401 || estado === 403 || estado === 429) return 'bloqueado';
  return 'revisar';
}

async function comprobar(fuente) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_ESPERA);
  try {
    // HEAD primero: más barato y suficiente. Varios portales no lo admiten,
    // así que se reintenta con GET antes de sacar ninguna conclusión.
    let res = await fetch(fuente.url, {
      method: 'HEAD', headers: CABECERAS, signal: control.signal, redirect: 'follow',
    });
    if (!res.ok) {
      res = await fetch(fuente.url, {
        method: 'GET', headers: CABECERAS, signal: control.signal, redirect: 'follow',
      });
    }
    return { ...fuente, estado: res.status, clase: clasificar(res.status) };
  } catch (e) {
    return { ...fuente, estado: 0, clase: 'revisar', error: String(e?.message ?? e) };
  } finally {
    clearTimeout(temporizador);
  }
}

const diasDesde = (iso) =>
  Math.floor((Date.now() - new Date(`${iso}T12:00:00Z`).getTime()) / 86400000);

const fuentes = [
  ...leerFuentes('lib/informes.ts', 'informe'),
  ...leerFuentes('lib/articles.ts', 'guía'),
];

// Dos guías que citan la misma norma no son dos problemas: son uno. Sin esto
// el reporte repite la misma línea y aparenta más incidencias de las que hay.
const porUrl = new Map();
for (const f of fuentes) {
  const previa = porUrl.get(f.url);
  if (previa) previa.origenes.add(f.origen);
  else porUrl.set(f.url, { ...f, origenes: new Set([f.origen]) });
}
const unicas = [...porUrl.values()];

if (fuentes.length === 0) {
  console.error('No se encontró ninguna fuente. ¿Se ejecuta desde la raíz del repositorio?');
  process.exit(1);
}

console.log(
  `\nVigilancia de fuentes — ${unicas.length} URLs distintas en ${fuentes.length} citas\n`,
);

const resultados = [];
for (const f of unicas) resultados.push(await comprobar(f));

let caidas = 0;
let bloqueadas = 0;
let revisar = 0;
let vencidas = 0;

const MARCA = {
  ok: verde('✓'), bloqueado: ambar('~'), revisar: ambar('?'), caida: rojo('✗'),
};

for (const r of resultados) {
  const dias = r.consultado ? diasDesde(r.consultado) : null;
  const antigua = dias !== null && dias > MAX_DIAS;
  if (r.clase === 'caida') caidas++;
  if (r.clase === 'bloqueado') bloqueadas++;
  if (r.clase === 'revisar') revisar++;
  if (antigua) vencidas++;

  const edad =
    dias === null
      ? ''
      : antigua
        ? ambar(` · verificada hace ${dias} días`)
        : ` · verificada hace ${dias} días`;
  console.log(`  ${MARCA[r.clase]} [${[...r.origenes].join(', ')}] ${r.organismo} — ${r.estado || r.error}${edad}`);
  console.log(`      ${r.url}`);
}

console.log('');
if (caidas) {
  console.log(rojo(`${caidas} cita(s) devolvieron 404 o 410: el recurso ya no existe.`));
  console.log('  Una cita con enlace roto es una cita que ya no respalda nada.');
  console.log('  Busque la publicación vigente del organismo y actualice la URL.');
}
if (revisar) {
  console.log(ambar(`${revisar} cita(s) fallaron por red o error del servidor: no concluyente.`));
  console.log('  Un DNS que no resuelve y un dominio muerto dan el mismo error.');
  console.log('  Ábralas en un navegador; si cargan, no hay nada que corregir.');
}
if (vencidas) {
  console.log(ambar(`${vencidas} fuente(s) llevan más de ${MAX_DIAS} días sin verificarse.`));
  console.log('  Los organismos revisan sus series: reconfirme la cifra y actualice');
  console.log('  el campo `consultado`. NO se actualiza sola, y es deliberado.');
}
if (bloqueadas) {
  console.log(ambar(`${bloqueadas} fuente(s) devolvieron 401, 403 o 429: no concluyente.`));
  console.log('  Un cortafuegos o un límite de tasa rechazó al cliente automatizado.');
  console.log('  Ábralas en un navegador antes de tocar nada; NO cuentan como fallo.');
  console.log('  (Si TODAS salen así, el bloqueo está en su red, no en las fuentes.)');
}
if (!caidas && !bloqueadas && !revisar && !vencidas) {
  console.log(verde('Todas las fuentes responden y están dentro del plazo de verificación.'));
}

console.log('');
console.log('Este script NO publica nada. Solo informa para que una persona decida.');

process.exit(caidas ? 1 : 0);
