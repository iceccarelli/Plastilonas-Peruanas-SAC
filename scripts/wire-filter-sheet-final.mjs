import { readFileSync, writeFileSync } from 'node:fs';
const F = 'app/productos/page.tsx';
const NL = String.fromCharCode(10);
const L = (...a) => a.join(NL);
let s = readFileSync(F, 'utf8');

// anchor: the grid column close + flex close + page close, unique at end of ProductosContent
const find = L(
  '          </AnimatePresence>',
  '        </div>',
  '      </div>',
  '    </div>',
  '  );',
  '}',
);

const sheet = L(
  '      <FilterSheet',
  '        open={showFilters}',
  '        onClose={() => setShowFilters(false)}',
  '        resultCount={filteredProducts.length}',
  '        hasActiveFilters={!!hasActiveFilters}',
  '        onClear={clearFilters}',
  '      >',
  '        <FilterControls',
  '          categories={categories}',
  '          availabilityOrder={AVAILABILITY_ORDER}',
  '          sectors={sectors}',
  '          availabilityLabels={availabilityLabels}',
  '          selectedCategories={selectedCategories}',
  '          selectedAvailability={selectedAvailability}',
  '          selectedSectors={selectedSectors}',
  '          toggleCategory={toggleCategory}',
  '          toggleAvailability={toggleAvailability}',
  '          toggleSector={toggleSector}',
  '          clearFilters={clearFilters}',
  '          hasActiveFilters={!!hasActiveFilters}',
  '          showHeader={false}',
  '        />',
  '      </FilterSheet>',
);

const replace = L(
  '          </AnimatePresence>',
  '        </div>',
  '      </div>',
  '',
  sheet,
  '    </div>',
  '  );',
  '}',
);

const n = s.split(find).length - 1;
if (n !== 1) { console.error('ANCHOR FAIL: matched ' + n + 'x (need 1). Paste sed 246-252 back.'); process.exit(1); }
s = s.replace(find, replace);
writeFileSync(F, s);
console.log('FilterSheet wired before page close.');
