#!/usr/bin/env node
/**
 * INVENTARIO DE IMÁGENES — qué falta y con qué encargarlo.
 *
 *   npm run imagenes            informe: cuántas hay, cuántas faltan y cuáles
 *   npm run imagenes:prompts    emite docs/encargo-imagenes.md (lo que FALTA)
 *   npm run imagenes:tomas      emite docs/encargo-tomas.md (tomas 2 y 3 de lo
 *                               que YA existe, para que el sitio las rote)
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

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;

/** Tope de tomas que rota el sitio. Debe coincidir con MAX_TOMAS de lib/galeria. */
const MAX_TOMAS = 4;

const huella = (ruta) => {
  try {
    return createHash('sha256').update(readFileSync(ruta)).digest('hex');
  } catch {
    return null;
  }
};

/**
 * Recuento de tomas por ranura, con la MISMA lógica que el sitio: se corta en
 * el primer hueco y se descartan las copias byte a byte.
 *
 * Este recuento existe porque «faltan tomas» y «llegaron duplicadas» se ven
 * idénticos en el sitio —una sola imagen quieta— y son problemas opuestos.
 * Sin el número, el informe mentía por omisión.
 */
function recuentoDeTomas(rutas) {
  let rotan = 0;
  let duplicadas = 0;
  const conDuplicados = [];
  for (const ruta of rutas) {
    const abs = join('public', ruta);
    if (!existsSync(abs)) continue;
    const vistas = new Set([huella(abs)].filter(Boolean));
    let enDisco = 0;
    let distintas = 0;
    for (let n = 2; n <= MAX_TOMAS; n++) {
      const cand = join('public', ruta.replace(/\.(jpg|jpeg|png|webp|avif)$/i, `-${n}.$1`));
      if (!existsSync(cand)) break;
      enDisco++;
      const h = huella(cand);
      if (h && vistas.has(h)) continue;
      if (h) vistas.add(h);
      distintas++;
    }
    if (distintas > 0) rotan++;
    if (enDisco > distintas) {
      duplicadas += enDisco - distintas;
      conDuplicados.push(ruta);
    }
  }
  return { rotan, duplicadas, conDuplicados };
}

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

/**
 * Rutas de galería YA COMPLETAS. `todasLasRanuras()` las omite a propósito
 * —una ranura es un ENCARGO, y lo que ya existe no se encarga— pero para
 * contar tomas hay que mirar justamente esas: son las únicas que hoy tienen
 * archivos -2 en disco. Contar solo los encargos daba «0 rotan» con 28
 * segundas tomas publicadas, que es un informe falso.
 */
function leerGalerias() {
  const salida = execFileSync(
    'npx',
    ['tsx', '-e', "import {products} from './lib/products'; console.log(JSON.stringify(products.flatMap((p) => p.gallery ?? [])));"],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  return JSON.parse(salida.trim().split('\n').pop());
}

const ranuras = leerRanuras();
const faltan = ranuras.filter((r) => !existsSync(join('public', r.ruta)));
const hay = ranuras.length - faltan.length;

const soloGrupo = (() => {
  const i = process.argv.indexOf('--grupo');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const modo = process.argv.includes('--tomas')
  ? 'tomas'
  : process.argv.includes('--prompts')
    ? 'prompts'
    : 'informe';

/** Cuántas tomas se piden por ranura. 3 es lo que el sitio rota cómodamente. */
const TOMAS_PEDIDAS = Number(
  process.argv[process.argv.indexOf('--tomas') + 1]?.match(/^[2-4]$/)?.[0] ?? 3,
);

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

  const t = recuentoDeTomas([...new Set([...ranuras.map((r) => r.ruta), ...leerGalerias()])]);
  console.log(`\n  Rotación de tomas (sufijos -2 … -${MAX_TOMAS})\n`);
  console.log(`    ${t.rotan > 0 ? verde(`${t.rotan} ranuras rotan varias tomas`) : ambar('0 ranuras rotan: no hay segundas tomas distintas')}`);
  if (t.duplicadas > 0) {
    console.log(`    ${rojo(`${t.duplicadas} archivos -n descartados por ser copias byte a byte`)}`);
    console.log('    Un duplicado exacto no es una toma: fundir una imagen contra');
    console.log('    una copia de sí misma deja la página quieta y la descarga dos veces.');
    for (const r of t.conDuplicados.slice(0, 10)) console.log(`      ${r}`);
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

// --- Encargo de tomas alternas ----------------------------------------------

if (modo === 'tomas') {
  // Se parte de TODAS las ranuras, incluidas las publicadas: para pedir la
  // toma 2 hace falta el prompt de la toma 1, que es la que ya existe.
  const salida = execFileSync(
    'npx',
    [
      'tsx',
      '-e',
      "import {todasLasRanurasConPublicadas, VARIACION_TOMA} from './lib/imagenes'; console.log(JSON.stringify({r: todasLasRanurasConPublicadas(), v: VARIACION_TOMA}));",
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const { r: todas, v: variacion } = JSON.parse(salida.trim().split('\n').pop());

  const publicadas = todas.filter((r) => existsSync(join('public', r.ruta)));
  const filtradas = soloGrupo ? publicadas.filter((r) => r.id.startsWith(`${soloGrupo}:`)) : publicadas;

  let doc = `# Encargo de TOMAS ALTERNAS — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:tomas\` desde el registro del sitio.
**No edite este archivo a mano.**

Esto NO es una lista de imágenes que faltan: es la lista de imágenes que **ya
existen** y a las que se les pide una segunda y una tercera versión, para que
el sitio las **alterne** con un cruce lento y un movimiento Ken Burns desfasado.

## Lo único que hay que entender

El nombre del archivo es lo que activa la rotación. Nada más:

| Archivo | Qué es |
|---|---|
| \`nombre.jpg\` | toma 1 — ya existe, **no la toque** |
| \`nombre-2.jpg\` | toma 2 — lo que se pide aquí |
| \`nombre-3.jpg\` | toma 3 — lo que se pide aquí |

## Las dos formas de que esto falle

1. **Entregar el mismo render con otro nombre.** El sitio compara el contenido
   byte a byte y descarta las copias exactas: una imagen fundiéndose contra un
   duplicado de sí misma no rota, deja la página quieta y descarga el archivo
   dos veces. Ya pasó una vez con los diagramas del glosario, que llegaron por
   triplicado e idénticos. Por eso cada encargo de abajo lleva ESCRITO qué debe
   cambiar entre una toma y otra.
2. **Saltarse un número.** Si llega \`-3\` sin \`-2\`, el sitio usa solo la
   toma 1. La numeración no puede tener huecos.

Suba los archivos a \`public/\` respetando la ruta y ejecute
\`npm run imagenes\`: el informe dice cuántas ranuras rotan y cuántos
archivos se descartaron por venir duplicados.

---

`;

  let n = 0;
  for (const [clave, titulo] of Object.entries(grupos)) {
    if (soloGrupo && clave !== soloGrupo) continue;
    const delGrupo = filtradas.filter((r) => r.id.startsWith(`${clave}:`));
    if (!delGrupo.length) continue;
    doc += `## ${titulo}\n\n${delGrupo.length} imágenes publicadas × ${TOMAS_PEDIDAS - 1} tomas = ${delGrupo.length * (TOMAS_PEDIDAS - 1)} encargos.\n\n`;
    for (const r of delGrupo) {
      for (let t = 2; t <= TOMAS_PEDIDAS; t++) {
        const destino = r.ruta.replace(/\.(jpg|jpeg|png|webp|avif)$/i, `-${t}.$1`);
        if (existsSync(join('public', destino))) continue; // ya entregada
        n += 1;
        doc += `### ${n}. \`${destino}\`\n\n`;
        doc += `| | |\n|---|---|\n`;
        doc += `| **Archivo a crear** | \`public${destino}\` |\n`;
        doc += `| **Toma 1 (referencia, ya existe)** | \`public${r.ruta}\` |\n`;
        doc += `| **Tamaño** | ${r.ancho} × ${r.alto} px |\n`;
        doc += `| **Tipo** | ${r.tipo} |\n`;
        doc += `| **Dónde se usa** | ${r.contexto} |\n\n`;
        doc += `**Prompt:**\n\n\`\`\`\n${r.prompt}\n\n${variacion[t]}\n\`\`\`\n\n---\n\n`;
      }
    }
  }

  mkdirSync('docs', { recursive: true });
  const dest = soloGrupo ? `docs/encargo-tomas-${soloGrupo}.md` : 'docs/encargo-tomas.md';
  writeFileSync(dest, doc);
  console.log(`\nEscrito ${dest} con ${n} encargos de toma alterna.\n`);
  if (n === 0) {
    console.log('No hay nada que pedir: todas las tomas solicitadas ya están en disco.\n');
  } else {
    console.log('Entrégueselo a su generador tal cual. Lo que NO puede pasar es que');
    console.log('devuelva el mismo render con otro nombre: el sitio lo descarta.\n');
  }
  process.exit(0);
}


let md = `# Encargo de imágenes — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:prompts\` desde el registro del sitio.
**No edite este archivo a mano**: se regenera, y el nombre de cada archivo se
deriva del slug real del catálogo.

## Cómo usarlo

1. Genere cada imagen con el prompt indicado.
2. Guárdela EXACTAMENTE con el nombre de archivo que aparece en \`Archivo\`.
3. Colóquela en la carpeta \`public/\` respetando la ruta completa.
4. Ejecute \`npm run imagenes\` para confirmar que el sitio ya la reconoce.

## Tomas alternas: cómo pedir que una imagen rote

El sitio alterna hasta ${MAX_TOMAS} versiones de la MISMA ranura con un cruce
lento y un movimiento Ken Burns desfasado. Se activa solo, por el nombre:

| Archivo | Qué es |
|---|---|
| \`nombre.jpg\` | toma 1 — la que se ve primero y la que mide el LCP |
| \`nombre-2.jpg\` | toma 2 — opcional |
| \`nombre-3.jpg\` | toma 3 — opcional |
| \`nombre-4.jpg\` | toma 4 — el tope |

Tres condiciones, y las tres se comprueban solas al compilar:

1. **La numeración no puede tener huecos.** Si existe \`-3\` pero falta
   \`-2\`, el sitio usa solo la toma 1. Un hueco es casi siempre un archivo
   mal nombrado, y adivinar produciría una rotación distinta en cada despliegue.
2. **Las tomas tienen que ser DISTINTAS.** El sitio compara el contenido byte a
   byte y descarta las copias exactas. Una imagen fundiéndose contra un
   duplicado de sí misma no rota: deja la página quieta diez segundos y
   descarga el archivo dos veces. Si su generador entrega el mismo render
   varias veces, no sirve: hay que cambiar el ángulo, la hora del día, la
   distancia o el material del entorno.
3. **Misma vista, otra captura.** No es otro producto ni otro encuadre
   temático: es el MISMO asunto visto de otro modo. Cambiar de tema entre
   tomas confunde en vez de explicar.

Ejecute \`npm run imagenes\` después de subirlas: el informe dice cuántas
ranuras rotan y cuántos archivos se descartaron por venir duplicados.

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
