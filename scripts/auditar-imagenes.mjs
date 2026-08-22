#!/usr/bin/env node
/**
 * AUDITORÍA DE IMÁGENES — ninguna ruta declarada puede quedar sin archivo.
 *
 * El fallo que motiva este script: `components/ServiceTabs.tsx` construía la
 * ruta `/images/servicio-{x}-2.jpg` y un comentario prometía que «si alguna
 * falta, cae con elegancia». No caía. Cada carga de la portada escupía
 *
 *   ⨯ The requested resource isn't a valid image for /images/servicio-instalacion-2.jpg
 *
 * en el registro del servidor, y ninguna de las 517 pruebas lo notaba: una
 * prueba de unidad no mira el disco de `public/`, y el build tampoco resuelve
 * las rutas de imagen.
 *
 * Qué comprueba:
 *   1. Toda ruta literal citada desde app/, components/ y lib/ existe.
 *   2. Toda ranura del registro de imágenes se resuelve: archivo encargado,
 *      o respaldo real, o marcador declarado a propósito.
 *   3. Ningún archivo de public/images está vacío o es sospechosamente chico.
 *
 * Lo 1 y lo 3 son ERROR: rompen la página. Lo 2 es AVISO cuando cae en el
 * marcador, porque un hueco declarado es una decisión, no un defecto.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const raiz = process.cwd();
const V = '\x1b[32m', R = '\x1b[31m', A = '\x1b[33m', G = '\x1b[90m', F = '\x1b[0m';

const errores = [];
const avisos = [];

/* ---- 1) rutas literales en código de render ------------------------------ */
function fuentes(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) fuentes(p, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

const RE_RUTA = /['"`](\/[A-Za-z0-9_\-./]*\.(?:jpg|jpeg|png|webp|avif|svg))['"`]/gi;
const literales = new Map();
for (const f of [join(raiz, 'app'), join(raiz, 'components'), join(raiz, 'lib')].flatMap((d) => fuentes(d))) {
  const src = readFileSync(f, 'utf8');
  let m;
  while ((m = RE_RUTA.exec(src))) {
    const r = m[1];
    if (!literales.has(r)) literales.set(r, new Set());
    literales.get(r).add(f.replace(raiz + '/', ''));
  }
}
for (const [ruta, quien] of literales) {
  if (!existsSync(join(raiz, 'public', ruta))) {
    errores.push({ tipo: 'ruta-sin-archivo', ruta, quien: [...quien] });
  }
}

/* ---- 2) el registro de ranuras lo audita test/imagenes-registro.test.ts --- *
 * Ese registro es TypeScript y importarlo aquí obligaría a añadir tsx como
 * dependencia solo para esto. Vitest ya está instalado y resuelve TS de
 * fábrica, así que la comprobación de ranuras y respaldos vive allí y corre
 * con `npm test`. Este script se queda con lo que sí puede verificar sin
 * compilador: rutas literales y archivos rotos.                              */

/* ---- 3) archivos vacíos o rotos ------------------------------------------ */
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg']);
let totalArchivos = 0;
(function rec(d) {
  if (!existsSync(d)) return;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { rec(p); continue; }
    if (!EXT.has(extname(e.name).toLowerCase())) continue;
    totalArchivos++;
    const bytes = statSync(p).size;
    // 512 bytes: por debajo de eso no hay fotografía posible; un SVG mínimo sí,
    // por eso se exceptúan.
    if (bytes < 512 && extname(e.name).toLowerCase() !== '.svg') {
      errores.push({ tipo: 'archivo-vacio', ruta: p.replace(join(raiz, 'public'), ''), bytes });
    }
  }
})(join(raiz, 'public'));

/* ---- informe -------------------------------------------------------------- */
console.log(`\nImágenes — ${totalArchivos} archivos en public/, ${literales.size} rutas citadas desde código\n`);

const porTipo = (lista, t) => lista.filter((x) => x.tipo === t);
void avisos;

for (const e of porTipo(errores, 'ruta-sin-archivo')) {
  console.log(`  ${R}✗${F} ${e.ruta}`);
  console.log(`${G}      citada desde ${e.quien.join(', ')} y el archivo no existe${F}`);
}
for (const e of porTipo(errores, 'archivo-vacio')) {
  console.log(`  ${R}✗${F} ${e.ruta} — ${e.bytes} bytes, no es una imagen válida`);
}

console.log(
  `\nResultado: ${errores.length ? R : V}${errores.length} errores${F}, ` +
  `${avisos.length ? A : V}${avisos.length} avisos${F}\n`,
);
process.exit(errores.length ? 1 : 0);
