import { readFileSync, writeFileSync } from 'node:fs';
const F = 'app/productos/page.tsx';
const L = (...a) => a.join('\n');
let s = readFileSync(F, 'utf8');

const edits = [
  // a) imports
  { find: "import ProductCard from '@/components/ProductCard';",
    replace: L("import ProductCard from '@/components/ProductCard';",
               "import FilterControls from '@/components/FilterControls';",
               "import FilterSheet from '@/components/FilterSheet';") },

  // b) desktop sidebar: replace the whole inline filter body with <FilterControls/>.
  //    anchor = from the sidebar wrapper down through the end of the Sectores block.
  { find: L(
      '        {/* Filters Sidebar */}',
      '        <div className={`lg:w-72 flex-shrink-0 ${showFilters ? \'block\' : \'hidden lg:block\'}`}>',
      '          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">'),
    replace: L(
      '        {/* Filters Sidebar (desktop) */}',
      '        <div className="hidden lg:block lg:w-72 flex-shrink-0">',
      '          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">') },
];

// verify all present exactly once
let ok = true;
for (const [i, e] of edits.entries()) {
  const n = s.split(e.find).length - 1;
  if (n !== 1) { console.error(`EDIT ${i + 1}: anchor matched ${n}x (need 1)`); ok = false; }
}
if (!ok) { console.error('Aborted — no changes.'); process.exit(1); }
for (const e of edits) s = s.replace(e.find, e.replace);
writeFileSync(F, s);
console.log('Imports + desktop sidebar wrapper updated. Manual step next: see instructions.');
