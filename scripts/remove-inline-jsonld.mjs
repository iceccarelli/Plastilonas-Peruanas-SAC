import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'app/productos/[slug]/page.tsx';
const L = (...lines) => lines.join('\n');

// The inline duplicate Product schema block (weaker: generic OG image, no sku/breadcrumbs).
const block = L(
  '        {/* Datos estructurados de producto (solo campos reales, sin precio inventado) */}',
  '        <script',
  '          type="application/ld+json"',
  '          // eslint-disable-next-line react/no-danger',
  '          dangerouslySetInnerHTML={{',
  '            __html: JSON.stringify({',
  "              '@context': 'https://schema.org',",
  "              '@type': 'Product',",
  '              name: product.name,',
  '              description: product.shortDescription,',
  '              category: product.category,',
  "              image: 'https://www.plastilonas.com/opengraph-image',",
  "              brand: { '@type': 'Brand', name: 'Plastilonas Peruanas SAC' },",
  "              manufacturer: { '@type': 'Organization', name: 'Plastilonas Peruanas SAC' },",
  "              areaServed: 'Perú',",
  '            }),',
  '          }}',
  '        />',
);

const src = readFileSync(FILE, 'utf8');
const n = src.split(block).length - 1;
if (n !== 1) {
  console.error(`ABORT: inline-JSON-LD block matched ${n}x (need exactly 1) — no change`);
  process.exit(1);
}

// remove the block plus the one leading newline, so no blank gap is left behind
writeFileSync(FILE, src.replace('\n' + block, ''));
console.log('Removed inline duplicate Product JSON-LD. <ProductStructuredData> is now the single source.');
