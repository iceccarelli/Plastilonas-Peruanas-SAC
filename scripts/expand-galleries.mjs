#!/usr/bin/env node
/**
 * expand-galleries.mjs — appends extra shots to gallery arrays in lib/products.ts.
 * Targets products by their existing primary `image` path (unique per product).
 * Adds a shot ONLY if the file exists under public/ => broken paths impossible.
 * Idempotent.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FILE = 'lib/products.ts';
const PUBLIC_DIR = 'public';

const GALLERY_ADDITIONS = {
  '/images/mangas-ventilacion.jpg': ['/images/mangas-ventilacion-y.jpg', '/images/mangas-produccion.jpg'],
  '/images/carpas.jpg':             ['/images/techos-escolares.jpg'],
  '/images/lona-a-medida.jpg':      ['/images/ojalillo-rafia.jpg'],
  '/images/accesorios.jpg':         ['/images/ojalillo-rafia.jpg'],
  '/images/biombos.jpg':            ['/images/biombos-proteccion.jpg'],
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const onDisk = (webPath) => existsSync(join(PUBLIC_DIR, webPath.replace(/^\//, '')));

let src = readFileSync(FILE, 'utf8');
let totalAdded = 0;
const report = [];

for (const [imagePath, extrasRaw] of Object.entries(GALLERY_ADDITIONS)) {
  const re = new RegExp(`(image:\\s*'${esc(imagePath)}',\\s*\\n\\s*gallery:\\s*\\[)([^\\]]*)(\\])`);
  const m = src.match(re);
  if (!m) { report.push(`SKIP  ${imagePath} — no gallery block matched (check manually)`); continue; }

  const existing = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  const extras = extrasRaw.filter((p) => {
    if (existing.includes(p)) return false;
    if (!onDisk(p)) { report.push(`GATE  ${p} not on disk — skipped`); return false; }
    return true;
  });

  if (extras.length === 0) { report.push(`OK    ${imagePath} — nothing to add`); continue; }

  const rebuilt = [...existing, ...extras].map((p) => `'${p}'`).join(', ');
  src = src.replace(re, `$1${rebuilt}$3`);
  totalAdded += extras.length;
  report.push(`ADD   ${imagePath} += [${extras.join(', ')}]`);
}

writeFileSync(FILE, src);
console.log(report.join('\n'));
console.log(`\n${totalAdded} gallery entr${totalAdded === 1 ? 'y' : 'ies'} added. ${FILE} rewritten.`);
