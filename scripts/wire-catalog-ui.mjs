import { readFileSync, writeFileSync } from 'node:fs';

const F = process.argv[2] || 'app/productos/page.tsx';
const NL = String.fromCharCode(10);
const L = (...a) => a.join(NL);
let s = readFileSync(F, 'utf8');

const edits = [];

edits.push({
  name: 'import ProductRotator',
  find: "import ProductCard from '@/components/ProductCard';",
  replace: L(
    "import ProductCard from '@/components/ProductCard';",
    "import ProductRotator from '@/components/ProductRotator';",
  ),
});

edits.push({
  name: 'desktop sidebar -> FilterControls',
  find: L(
    '          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">',
    '            <div className="flex items-center justify-between mb-6">',
    '              <div className="font-semibold tracking-tight">Filtros</div>',
    '              {hasActiveFilters && (',
    '                <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-[#059669] hover:underline">',
    '                  <X className="w-3 h-3" /> Limpiar',
    '                </button>',
    '              )}',
    '            </div>',
  ),
  replace: L(
    '          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">',
    '            <FilterControls',
    '              categories={categories}',
    '              availabilityOrder={AVAILABILITY_ORDER}',
    '              sectors={sectors}',
    '              availabilityLabels={availabilityLabels}',
    '              selectedCategories={selectedCategories}',
    '              selectedAvailability={selectedAvailability}',
    '              selectedSectors={selectedSectors}',
    '              toggleCategory={toggleCategory}',
    '              toggleAvailability={toggleAvailability}',
    '              toggleSector={toggleSector}',
    '              clearFilters={clearFilters}',
    '              hasActiveFilters={!!hasActiveFilters}',
    '            />',
    '            {/* @@FILTER_BODY_REMOVED@@ */}',
  ),
});

edits.push({
  name: 'list-view thumbnail -> ProductRotator',
  find: '                      <div className="w-36 h-28 bg-gray-100 rounded-2xl flex-shrink-0" />',
  replace: L(
    '                      <div className="relative w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0">',
    '                        <ProductRotator product={product} />',
    '                      </div>',
  ),
});

let ok = true;
for (const e of edits) {
  const n = s.split(e.find).length - 1;
  if (n !== 1) { console.error('ANCHOR FAIL [' + e.name + ']: matched ' + n + 'x (need 1)'); ok = false; }
}
if (!ok) { console.error('Aborted — no changes written.'); process.exit(1); }
for (const e of edits) s = s.replace(e.find, e.replace);

const MARK = '            {/* @@FILTER_BODY_REMOVED@@ */}';
const startIdx = s.indexOf(MARK);
if (startIdx === -1) { console.error('marker missing'); process.exit(1); }
const gridMarker = '        {/* Products Grid/List */}';
const gridIdx = s.indexOf(gridMarker, startIdx);
if (gridIdx === -1) { console.error('grid column marker not found'); process.exit(1); }

const before = s.slice(0, startIdx);
const after = s.slice(gridIdx);
const cleanClose = L('          </div>', '        </div>', '') + NL;
s = before + cleanClose + after;

writeFileSync(F, s);
console.log('page.tsx wired. Next: add <FilterSheet> before page close + swap ProductCard image.');
