#!/usr/bin/env node
/**
 * expand-galleries.mjs
 * Expands `gallery` arrays in lib/products.ts with extra professional shots.
 *
 * SAFETY CONTRACT:
 *  - Products are targeted by their EXISTING primary `image` path (unique per product),
 *    so this works even for products whose source we never hand-inspected.
 *  - An extra shot is added ONLY if the file physically exists under public/.
 *    => It is impossible for this script to introduce a broken image path.
 *  - Idempotent: re-running adds nothing that's already present.
 *
 * Usage:  node scripts/expand-galleries.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FILE = 'lib/products.ts';
const PUBLIC_DIR = 'public';

// key = product's current primary image path; value = extra gallery shots to append
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
  // Match:  image: '<imagePath>', \n <indent> gallery: [ <items> ]
  const re = new RegExp(
    `(image:\\s*'${esc(imagePath)}',\\s*\\n\\s*gallery:\\s*\\[)([^\\]]*)(\\])`
  );
  const m = src.match(re);
  if (!m) {
    report.push(`SKIP  ${imagePath} — no product/gallery block matched (multi-line gallery? check manually)`);
    continue;
  }

  const existing = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  const extras = extrasRaw.filter((p) => {
    if (existing.includes(p)) return false;      // already present
    if (!onDisk(p)) {                            // existence gate -> no broken paths
      report.push(`GATE  ${p} not on disk — skipped (would-be broken path avoided)`);
      return false;
    }
    return true;
  });

  if (extras.length === 0) {
    report.push(`OK    ${imagePath} — nothing to add`);
    continue;
  }

  const merged = [...existing, ...extras];
  const rebuilt = merged.map((p) => `'${p}'`).join(', ');
  src = src.replace(re, `$1${rebuilt}$3`);
  totalAdded += extras.length;
  report.push(`ADD   ${imagePath} += [${extras.join(', ')}]`);
}

writeFileSync(FILE, src);
console.log(report.join('\n'));
console.log(`\n${totalAdded} gallery entr${totalAdded === 1 ? 'y' : 'ies'} added. ${FILE} rewritten.`);
