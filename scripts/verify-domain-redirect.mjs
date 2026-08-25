#!/usr/bin/env node
/**
 * VERIFICACIÓN DE LA MUDANZA DE DOMINIO — plastilonas.com → dominio canónico.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LO QUE HAY QUE SABER ANTES DE EJECUTARLO, PORQUE CAMBIA LO QUE SIGNIFICA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * HOY, agosto de 2026, plastilonas.com NO apunta a este proyecto. El dominio es
 * de la empresa y sirve el correo (ventas@plastilonas.com), pero el DNS sigue
 * dirigido al sitio antiguo. El sitio nuevo vive en el host de Vercel.
 *
 * Eso significa que este script NO PUEDE, hoy, comprobar redirecciones 301 del
 * dominio antiguo al nuevo: no existe ninguna redirección que comprobar, y
 * exigirla haría fallar el build por una condición que no depende del código
 * sino de un cambio de DNS que aún no se ha hecho.
 *
 * Por eso el script tiene dos modos, y el modo por defecto es informar:
 *
 *   node scripts/verify-domain-redirect.mjs
 *       Diagnostica. Dice qué devuelve hoy cada ruta del dominio antiguo y
 *       qué debería devolver el día de la mudanza. Termina en 0 SIEMPRE.
 *
 *   VERIFICAR_DOMINIO=1 node scripts/verify-domain-redirect.mjs
 *       Exige. Cada ruta del dominio antiguo debe responder 301 (o 308) hacia
 *       la ruta EQUIVALENTE del dominio canónico: ni 200, ni 404, ni un volcado
 *       a la portada, ni una cadena de dos saltos. Falla con código 1.
 *       Esto es lo que hay que activar en CI el día que el DNS cambie.
 *
 * POR QUÉ IMPORTA LA EQUIVALENCIA, y no basta con «redirige». El fallo caro de
 * una migración no es el 404: es el 301 que manda /productos/geomembranas-pvc a
 * la portada. Google trata esa redirección como un soft-404, no traslada la
 * autoridad de la página antigua, y encima la página nueva no recibe nada. Diez
 * años de enlaces a fichas concretas se convierten en diez años de enlaces a la
 * portada. Por eso aquí se comprueba el DESTINO, ruta por ruta.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = process.cwd();
const EXIGIR = process.env.VERIFICAR_DOMINIO === '1';
const ANTIGUO = process.env.DOMINIO_ANTIGUO || 'https://www.plastilonas.com';
const TIEMPO_LIMITE = Number(process.env.TIMEOUT_MS || 12000);

/**
 * El origen canónico sale de la misma variable que lee lib/site.ts, y si no
 * está puesta, del literal de reserva que ese archivo declara.
 *
 * NO hay un dominio escrito a mano en este script, y no es un detalle de
 * estilo: test/dominio.test.ts rompe el build si alguien escribe el host en
 * cualquier archivo que no sea lib/site.ts. Un verificador de migración de
 * dominio que llevara su propia copia del dominio sería exactamente el archivo
 * que se queda atrás el día de la migración — y el único que nadie miraría,
 * porque «ese ya lo comprobamos».
 */
function origenCanonico() {
  const env = process.env.CANONICAL_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const src = readFileSync(join(RAIZ, 'lib/site.ts'), 'utf8');
  const m = src.match(/process\.env\.NEXT_PUBLIC_SITE_URL \|\|\s*"(https:\/\/[^"]+)"/);
  if (!m) {
    console.error(
      'No se pudo deducir el origen canónico de lib/site.ts.\n' +
        'Pase CANONICAL_ORIGIN=https://… al ejecutar este script.',
    );
    process.exit(2);
  }
  return m[1].replace(/\/$/, '');
}

const CANONICO = origenCanonico();

/**
 * Las rutas que hay que comprobar salen del sitio NUEVO: son las páginas que
 * deben existir al otro lado. La lista de URLs del sitio ANTIGUO no está en
 * este repositorio; cuando se tenga (Search Console → Páginas, o un rastreo del
 * dominio antiguo), guárdela en audit/urls-dominio-antiguo.json como un array
 * de rutas y este script la usará en lugar de la muestra.
 */
function rutasAComprobar() {
  try {
    const propias = JSON.parse(readFileSync(join(RAIZ, 'audit/urls-dominio-antiguo.json'), 'utf8'));
    if (Array.isArray(propias) && propias.length) return propias;
  } catch {
    /* sin inventario del dominio antiguo: se usa la muestra de abajo */
  }
  try {
    const estado = JSON.parse(readFileSync(join(RAIZ, 'audit/current-state.json'), 'utf8'));
    const clusters = estado.mapaConsultas?.clusters ?? [];
    // Las canónicas comerciales: son las que reciben enlaces desde fuera.
    const comerciales = clusters.filter((c) => c.intencion === 'comercial').map((c) => c.canonica);
    return ['/', '/productos', '/servicios', '/nosotros', '/contacto', ...comerciales];
  } catch {
    return ['/', '/productos', '/servicios', '/nosotros', '/contacto'];
  }
}

async function cabeza(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIEMPO_LIMITE);
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: ctrl.signal });
    return { status: res.status, location: res.headers.get('location') };
  } catch (e) {
    return { status: 0, location: null, error: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

const rutas = rutasAComprobar();
const resultados = [];

console.log(`Dominio antiguo: ${ANTIGUO}`);
console.log(`Dominio canónico esperado: ${CANONICO}`);
console.log(`Modo: ${EXIGIR ? 'EXIGIR (falla en CI)' : 'DIAGNÓSTICO (nunca falla)'}`);
console.log(`Rutas a comprobar: ${rutas.length}\n`);

for (const ruta of rutas) {
  const url = `${ANTIGUO}${ruta}`;
  const r = await cabeza(url);
  const esperado = `${CANONICO}${ruta}`;

  let veredicto;
  if (r.status === 0) veredicto = `sin respuesta (${r.error})`;
  else if (r.status === 301 || r.status === 308) {
    const destino = (r.location || '').replace(/\/$/, '') || '(sin Location)';
    if (destino === esperado.replace(/\/$/, '')) veredicto = 'ok: 301 a la ruta equivalente';
    else if (destino === CANONICO || destino === `${CANONICO}/`)
      veredicto = 'MAL: 301 a la portada (soft-404: no traslada autoridad)';
    else veredicto = `MAL: 301 a ${destino}, se esperaba ${esperado}`;
  } else if (r.status === 302 || r.status === 307) veredicto = `MAL: ${r.status} temporal, debe ser 301 permanente`;
  else if (r.status === 200) veredicto = 'MAL: 200 — el dominio antiguo sigue sirviendo contenido y compite';
  else if (r.status === 404) veredicto = 'MAL: 404 — la autoridad de esa URL se pierde entera';
  else veredicto = `MAL: ${r.status}`;

  const ok = veredicto.startsWith('ok');
  resultados.push({ ruta, url, status: r.status, location: r.location ?? null, esperado, veredicto, ok });
  console.log(`${ok ? '  ok ' : '  →  '}${ruta}  ${veredicto}`);
}

mkdirSync(join(RAIZ, 'audit'), { recursive: true });
writeFileSync(
  join(RAIZ, 'audit/domain-redirect.json'),
  `${JSON.stringify({ antiguo: ANTIGUO, canonico: CANONICO, exigido: EXIGIR, resultados }, null, 2)}\n`,
  'utf8',
);

const malos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - malos.length}/${resultados.length} correctas. audit/domain-redirect.json escrito.`);

if (!EXIGIR) {
  console.log(
    '\nEste resultado es un DIAGNÓSTICO, no un fallo. plastilonas.com todavía no apunta a\n' +
      'este proyecto: mientras el DNS no cambie no hay redirección que exigir.\n' +
      'La mudanza son dos pasos, y están documentados en lib/site.ts:\n' +
      '  1. DNS: apuntar plastilonas.com al proyecto de Vercel y verificarlo en Settings → Domains.\n' +
      `  2. Vercel → Environment Variables: CANONICAL_ORIGIN = https://plastilonas.com\n` +
      'El día que ambos estén hechos, active VERIFICAR_DOMINIO=1 en CI y este script\n' +
      'pasa a romper el build ante cualquier 200, 404, 302 o redirección a la portada.',
  );
  process.exit(0);
}

if (malos.length) {
  console.error(`\n${malos.length} ruta(s) del dominio antiguo no redirigen correctamente.`);
  process.exit(1);
}
