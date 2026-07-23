#!/usr/bin/env node
/**
 * Idempotent codemod: set product.gallery to exactly 4 paths for every
 * product in lib/products.ts, matched by UNIQUE slug.
 * ABORTS if any expected slug is missing or if an unexpected slug appears
 * in the target list.
 *
 * Usage (from repo root):
 *   node path/to/codemod-galleries.mjs
 *
 * Requires manifest.json next to this script (or pass --manifest=...).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = process.argv.find(a => a.startsWith('--manifest='))?.split('=')[1]
  || join(__dirname, '../manifest.json');
const PRODUCTS_TS = process.argv.find(a => a.startsWith('--products='))?.split('=')[1]
  || join(process.cwd(), 'lib/products.ts');

if (!existsSync(MANIFEST_PATH)) {
  console.error('FATAL: manifest.json not found at', MANIFEST_PATH);
  process.exit(1);
}
if (!existsSync(PRODUCTS_TS)) {
  console.error('FATAL: lib/products.ts not found at', PRODUCTS_TS);
  console.error('Run this script from the repository root.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const expectedSlugs = new Set(Object.keys(manifest));
console.log('Manifest products:', expectedSlugs.size);

let src = readFileSync(PRODUCTS_TS, 'utf8');

// Detect families export and assert we do not touch it
if (!/export const (productFamilies|families)\s*[:=]/.test(src) && !/productFamilies/.test(src)) {
  console.warn('WARN: productFamilies/families not detected — continuing, but verify manually.');
} else {
  console.log('OK: families/productFamilies detected (will not be modified).');
}

const missing = [];
const applied = [];

for (const [slug, info] of Object.entries(manifest)) {
  const galleryLiteral = `[${info.gallery.map(p => `'${p}'`).join(', ')}]`;

  // Match the gallery array for this slug. We look for the object that contains
  // slug: '...' and then its gallery: [...]
  // Strategy: find the slug line, then the next gallery: within a reasonable window.
  const slugRe = new RegExp(
    `(slug\\s*:\\s*['"]${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*,[\\s\\S]{0,6000}?gallery\\s*:\\s*)\\[[^\\]]*\\]`,
    'm'
  );

  if (!slugRe.test(src)) {
    missing.push(slug);
    continue;
  }

  src = src.replace(slugRe, `$1${galleryLiteral}`);
  applied.push(slug);
}

if (missing.length) {
  console.error('FATAL: the following slugs from manifest were NOT found in products.ts:');
  missing.forEach(s => console.error('  -', s));
  process.exit(2);
}

if (applied.length !== expectedSlugs.size) {
  console.error('FATAL: applied count mismatch', applied.length, 'vs', expectedSlugs.size);
  process.exit(3);
}

// Sanity: every gallery in the new source for these slugs is length 4
for (const slug of expectedSlugs) {
  const m = src.match(new RegExp(`slug\\s*:\\s*['"]${slug}['"][\\s\\S]{0,6000}?gallery\\s*:\\s*(\\[[^\\]]*\\])`, 'm'));
  if (!m) {
    console.error('FATAL: post-check failed for', slug);
    process.exit(4);
  }
  const arr = m[1];
  const count = (arr.match(/\/images\//g) || []).length;
  if (count !== 4) {
    console.error('FATAL: gallery length != 4 for', slug, 'got', count, arr);
    process.exit(5);
  }
}

writeFileSync(PRODUCTS_TS, src);
console.log('OK: updated', applied.length, 'products. gallery.length === 4 for all.');
console.log('Idempotent: re-running will produce the same result.');
