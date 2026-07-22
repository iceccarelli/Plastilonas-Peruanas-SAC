import { readFileSync, writeFileSync } from 'node:fs';

const L = (...lines) => lines.join('\n');
const PAGE = 'app/productos/[slug]/page.tsx';
const CARD = 'components/ProductCard.tsx';

const edits = [
  { file: PAGE,
    find: "import ProductImage from '@/components/ProductImage';",
    replace: "import ProductGallery from '@/components/ProductGallery';" },

  { file: PAGE,
    find: L(
      '        {/* Gallery / Image */}',
      '        <div>',
      '          <div className="aspect-[16/11] rounded-3xl overflow-hidden relative mb-4 border border-gray-100">',
      '            <ProductImage product={product} variant="hero" priority />',
      '          </div>',
      '          <div className="text-xs text-center text-gray-400">Fotografías reales de este producto disponibles bajo solicitud por WhatsApp</div>',
      '        </div>'),
    replace: L(
      '        {/* Gallery */}',
      '        <div>',
      '          <ProductGallery product={product} />',
      '        </div>') },

  { file: PAGE,
    find: L(
      '  // No se declara openGraph.images: product.image apunta a archivos aún',
      '  // inexistentes (/images/*.jpg), así que la página hereda la imagen OG del',
      '  // sitio (app/opengraph-image.tsx) en lugar de romper la vista previa.'),
    replace: L(
      '  // Las fotos reales ahora existen en /public/images: exponemos la imagen del',
      '  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,',
      '  // LinkedIn) se muestre la foto real del producto.') },

  { file: PAGE,
    find: '  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;',
    replace: L(
      '  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;',
      '  const ogImage = product.image ? `https://www.plastilonas.com${product.image}` : undefined;') },

  { file: PAGE,
    find: "    openGraph: { title: ogTitle, description: product.shortDescription, url: canonical, type: 'website' },",
    replace: L(
      '    openGraph: {',
      '      title: ogTitle,',
      '      description: product.shortDescription,',
      '      url: canonical,',
      "      type: 'website',",
      '      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),',
      '    },') },

  { file: PAGE,
    find: "    twitter: { card: 'summary_large_image', title: ogTitle, description: product.shortDescription },",
    replace: L(
      '    twitter: {',
      "      card: 'summary_large_image',",
      '      title: ogTitle,',
      '      description: product.shortDescription,',
      '      ...(ogImage ? { images: [ogImage] } : {}),',
      '    },') },

  { file: CARD,
    find: '<ProductImage product={product} variant="card" />',
    replace: '<ProductImage product={product} variant="card" enableHover />' },
];

const cache = {};
const load = (f) => (cache[f] ??= readFileSync(f, 'utf8'));

let ok = true;
edits.forEach((e, i) => {
  let c;
  try { c = load(e.file); } catch { console.error(`EDIT ${i + 1}: cannot read ${e.file}`); ok = false; return; }
  const n = c.split(e.find).length - 1;
  if (n !== 1) { console.error(`EDIT ${i + 1} [${e.file}]: anchor matched ${n}x (need exactly 1) — NOT applied`); ok = false; }
});
if (!ok) { console.error('\nAborted — no files changed. Paste this output back.'); process.exit(1); }

for (const e of edits) cache[e.file] = cache[e.file].replace(e.find, e.replace);
for (const f of Object.keys(cache)) { writeFileSync(f, cache[f]); console.log(`patched ${f}`); }
console.log(`\n${edits.length} edits applied cleanly.`);
