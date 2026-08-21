#!/usr/bin/env node
/**
 * INVENTARIO DE IMÁGENES — qué falta y con qué encargarlo.
 *
 *   npm run imagenes            informe: cuántas hay, cuántas faltan y cuáles
 *   npm run imagenes:prompts    emite docs/encargo-imagenes.md
 *
 * Por qué los prompts se GENERAN y no se escriben a mano: el nombre de cada
 * archivo se deriva del slug real del catálogo. Si alguien renombra un
 * producto, el encargo se renombra con él en la siguiente ejecución. Una lista
 * de encargos escrita aparte se desincroniza la primera vez que algo cambia, y
 * el síntoma aparece semanas después como una página con un hueco.
 *
 * Sale con código 0 siempre: faltar imágenes es un estado normal del trabajo,
 * no un fallo de compilación.
 */

import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;

// El registro es TypeScript; se lee a través de tsx para no duplicarlo aquí.
function leerRanuras() {
  const salida = execFileSync(
    'npx',
    ['tsx', '-e', "import {todasLasRanuras} from './lib/imagenes'; console.log(JSON.stringify(todasLasRanuras()));"],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const linea = salida.trim().split('\n').pop();
  return JSON.parse(linea);
}

const ranuras = leerRanuras();
const faltan = ranuras.filter((r) => !existsSync(join('public', r.ruta)));
const hay = ranuras.length - faltan.length;

const soloGrupo = (() => {
  const i = process.argv.indexOf('--grupo');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const modo = process.argv.includes('--prompts') ? 'prompts' : 'informe';

if (modo === 'informe') {
  console.log(`\nInventario de imágenes — ${ranuras.length} ranuras declaradas\n`);
  const porContexto = new Map();
  for (const r of faltan) {
    const grupo = r.id.split(':')[0];
    porContexto.set(grupo, (porContexto.get(grupo) ?? 0) + 1);
  }
  console.log(`  ${verde(`${hay} publicadas`)}   ${faltan.length ? ambar(`${faltan.length} pendientes`) : verde('0 pendientes')}\n`);
  for (const [grupo, n] of porContexto) {
    console.log(`  ${ambar('·')} ${grupo}: ${n} pendientes`);
  }
  if (faltan.length) {
    console.log('\n  Primeras diez pendientes:');
    for (const r of faltan.slice(0, 10)) console.log(`    ${r.ruta}`);
    console.log('\n  Genere el documento de encargo con:  npm run imagenes:prompts');
    console.log('  Mientras falten, la página muestra un marcador sobrio, no una imagen rota.');
  }
  console.log('');
  process.exit(0);
}

// --- Documento de encargo ---------------------------------------------------

const grupos = {
  solucion: 'Arquitecturas de referencia (diagramas)',
  familia: 'Portadas de familia',
  producto: 'Galerías de producto',
  glosario: 'Términos del glosario (diagramas)',
  guia: 'Encabezados de guía',
};

let md = `# Encargo de imágenes — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:prompts\` desde el registro del sitio.
**No edite este archivo a mano**: se regenera, y el nombre de cada archivo se
deriva del slug real del catálogo.

## Cómo usarlo

1. Genere cada imagen con el prompt indicado.
2. Guárdela EXACTAMENTE con el nombre de archivo que aparece en \`Archivo\`.
3. Colóquela en la carpeta \`public/\` respetando la ruta completa.
4. Ejecute \`npm run imagenes\` para confirmar que el sitio ya la reconoce.

Las rutas empiezan por \`/images/...\`; en el repositorio eso corresponde a
\`public/images/...\`. Es decir: \`/images/familias/geosinteticos.jpg\` se sube
como \`public/images/familias/geosinteticos.jpg\`.

## Reglas que no debe romper el generador

- **Sin texto dentro de la imagen.** Ni etiquetas, ni cotas, ni títulos. Las
  leyendas las pone la página, en español y en HTML, donde un buscador y un
  lector de pantalla sí las leen. Texto quemado en un JPG es invisible para ambos.
- **Sin logotipos, marcas ni marcas de agua.**
- **Sin rostros identificables.**
- **Exactitud técnica antes que belleza.** Estas imágenes las mira gente que
  instala esto para vivir. Una costura mal representada o una capa en el orden
  equivocado cuesta más credibilidad de la que gana la estética.
- **Una imagen generada no es una fotografía del producto real.** El sitio las
  publica marcadas como referenciales. Cuando exista una foto real del material
  que efectivamente vendemos, reemplaza a la generada: basta sobrescribir el archivo.

---

`;

let total = 0;
for (const [clave, titulo] of Object.entries(grupos)) {
  // --grupo glosario emite un documento con SOLO ese silo. Un encargo de 47
  // imágenes es difícil de repartir; uno de 41 diagramas del mismo tipo se
  // puede pasar entero a quien dibuja diagramas.
  if (soloGrupo && clave !== soloGrupo) continue;
  const delGrupo = ranuras.filter((r) => r.id.startsWith(`${clave}:`));
  if (!delGrupo.length) continue;
  const pendientes = delGrupo.filter((r) => !existsSync(join('public', r.ruta)));
  md += `## ${titulo}\n\n${pendientes.length} pendientes de ${delGrupo.length}.\n\n`;
  for (const r of pendientes) {
    total += 1;
    md += `### ${total}. \`${r.ruta}\`\n\n`;
    md += `| | |\n|---|---|\n`;
    md += `| **Archivo** | \`public${r.ruta}\` |\n`;
    md += `| **Tamaño** | ${r.ancho} × ${r.alto} px |\n`;
    md += `| **Tipo** | ${r.tipo} |\n`;
    md += `| **Dónde se usa** | ${r.contexto} |\n`;
    md += `| **Texto alternativo** | ${r.alt} |\n\n`;
    md += `**Prompt:**\n\n\`\`\`\n${r.prompt}\n\`\`\`\n\n---\n\n`;
  }
}

mkdirSync('docs', { recursive: true });
const destino = soloGrupo
  ? `docs/encargo-imagenes-${soloGrupo}.md`
  : 'docs/encargo-imagenes.md';
writeFileSync(destino, md);
console.log(`\nEscrito ${destino} con ${total} encargos.\n`);
console.log('Entrégueselo a su generador de imágenes tal cual.');
console.log('Los nombres de archivo salen del catálogo: no los cambie.\n');
