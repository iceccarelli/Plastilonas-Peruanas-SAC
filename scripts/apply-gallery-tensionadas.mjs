import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FILE = 'lib/products.ts';
const find = "    gallery: ['/images/tensoestructuras.jpg'],";
const replace = "    gallery: ['/images/tensoestructuras.jpg', '/images/toldos-cerramientos.jpg'],";
const NEW_IMG = '/images/toldos-cerramientos.jpg';

// existence gate — refuse to wire a path that isn't on disk
if (!existsSync(join('public', NEW_IMG.replace(/^\//, '')))) {
  console.error(`ABORT: public${NEW_IMG} not found on disk`); process.exit(1);
}

const src = readFileSync(FILE, 'utf8');
const n = src.split(find).length - 1;
if (n !== 1) {
  console.error(`ABORT: anchor matched ${n}x (need exactly 1) — no change`); process.exit(1);
}
if (src.includes(replace)) { console.log('Already applied — nothing to do.'); process.exit(0); }

writeFileSync(FILE, src.replace(find, replace));
console.log('Wired toldos-cerramientos.jpg as gallery[1] of Coberturas Tensionadas.');
