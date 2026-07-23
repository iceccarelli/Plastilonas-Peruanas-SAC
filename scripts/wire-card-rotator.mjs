import { readFileSync, writeFileSync } from 'node:fs';
const F = 'components/ProductCard.tsx';
const NL = String.fromCharCode(10);
let s = readFileSync(F, 'utf8');

const edits = [
  { name: 'import',
    find: "import ProductImage from '@/components/ProductImage';",
    replace: "import ProductImage from '@/components/ProductImage';" + NL + "import ProductRotator from '@/components/ProductRotator';" },
  { name: 'usage',
    find: '<ProductImage product={product} variant="card" enableHover />',
    replace: '<ProductRotator product={product} sizes="(max-width: 768px) 100vw, 380px" />' },
];

let ok = true;
for (const e of edits) {
  const n = s.split(e.find).length - 1;
  if (n !== 1) { console.error('ANCHOR FAIL [' + e.name + ']: matched ' + n + 'x (need 1)'); ok = false; }
}
if (!ok) { console.error('Aborted.'); process.exit(1); }
for (const e of edits) s = s.replace(e.find, e.replace);
writeFileSync(F, s);
console.log('ProductCard now uses ProductRotator.');
