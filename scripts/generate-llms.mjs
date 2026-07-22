#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const OUT_DIR = path.join(ROOT, "public");
const SITE_URL = (process.env.SITE_URL || "https://plastilonas-peruanas-sac.vercel.app").replace(/\/$/, "");

async function collect(dir, base = "") {
  const out = []; let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  if (entries.some((e) => /^page\.(t|j)sx?$/.test(e.name))) out.push(base || "/");
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const n = e.name;
    if (n.startsWith("(") || n.startsWith("_") || n === "api" || n.startsWith("[")) continue;
    out.push(...(await collect(path.join(dir, n), `${base}/${n}`)));
  }
  return out;
}
const routes = [...new Set(await collect(APP_DIR))].sort();
let cityLines = [];
try {
  const ciudades = JSON.parse(await readFile(path.join(ROOT, "data", "ciudades.json"), "utf8"));
  cityLines = ciudades.map((c) => `- [Plastilonas en ${c.ciudad}](${SITE_URL}/local/${c.slug})`);
} catch {}
const header = `# Plastilonas Peruanas SAC
Fabricantes de plastilonas, lonas plastificadas, mantas plásticas, cobertores impermeables, geomembranas y agroplásticos en Perú. Fabricación a medida y despacho nacional.

RUC 20523135385 | Chorrillos, Lima | WhatsApp +51 946 085 270 | ventas@plastilonas.com
`;
const pageLines = routes.map((r) => `- ${SITE_URL}${r === "/" ? "/" : r}`);
const body = `\n## Páginas principales\n${pageLines.join("\n")}\n\n## Cobertura local\n${cityLines.join("\n")}\n`;
await writeFile(path.join(OUT_DIR, "llms.txt"), header + body, "utf8");
await writeFile(path.join(OUT_DIR, "llms-full.txt"),
  header + "\nEste archivo resume el sitio para asistentes de IA. Contenido en español (es-PE).\n" + body, "utf8");
console.log(`Wrote llms.txt (${routes.length} routes, ${cityLines.length} cities)`);
