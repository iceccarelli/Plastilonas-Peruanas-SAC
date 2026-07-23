#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const FILE = 'lib/products.ts';
const IMG_DIR = 'public/images';
const SUFFIXES = ['-2', '-3', '-b', '-detalle', '-instalacion', '-instalado'];

const onDisk = new Set(
  readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)),
);

let src = readFileSync(FILE, 'utf8');
const rowRe = /image:\s*'(\/images\/[^']+)',\s*\n\s*gallery:\s*\[([^\]]*)\]/g;

const report = [];
let added = 0;

src = src.replace(rowRe, (full, imgPath, galleryInner) => {
  const file = imgPath.split('/').pop();
  const dot = file.lastIndexOf('.');
  const stem = file.slice(0, dot);
  const ext = file.slice(dot);
  const existing = [...galleryInner.matchAll(/'([^']+)'/g)].map((m) => m[1]);

  const toAdd = SUFFIXES
    .map((suf) => `${stem}${suf}${ext}`)
    .filter((name) => onDisk.has(name))
    .map((name) => `/images/${name}`)
    .filter((p) => !existing.includes(p));

  if (toAdd.length === 0) return full;

  added += toAdd.length;
  report.push(`+ ${stem}: ${toAdd.map((p) => p.split('/').pop()).join(', ')}`);
  const rebuilt = [...existing, ...toAdd].map((p) => `'${p}'`).join(', ');
  return full.replace(/gallery:\s*\[[^\]]*\]/, `gallery: [${rebuilt}]`);
});

writeFileSync(FILE, src);
console.log(report.length ? report.join('\n') : 'No new same-product second-angle images on disk to wire. Everything addable is already in galleries.');
console.log(`\n${added} image(s) added.`);
