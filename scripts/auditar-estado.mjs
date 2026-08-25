#!/usr/bin/env node
/**
 * AUDITORÍA DE ESTADO — audit/current-state.json
 *
 * Qué es y qué no es.
 *
 * NO es un rastreo del sitio desplegado. Es un inventario del REPOSITORIO: lee
 * el árbol de `app/` y las fuentes de verdad de `lib/` y `data/`, y escribe lo
 * que el sitio declara ANTES de compilar. Se hace así a propósito: un rastreo
 * necesita un servidor levantado y una red, y por tanto no puede correr en el
 * mismo commit que introduce el problema. Este script sí, y por eso puede
 * romper el build.
 *
 * Lo que produce (audit/current-state.json):
 *   rutas .............. cada page.tsx, su ruta pública, si es dinámica, el
 *                        título y el H1 declarados, el canonical, los esquemas
 *                        JSON-LD que emite y sus enlaces internos salientes
 *   endpointsMaquina ... cada route.ts que sirve algo legible por un agente
 *   catalogo ........... productos, familias, industrias, sectores, ciudades
 *   grafoEnlaces ....... nodos, aristas, profundidad desde «/» y huérfanas
 *   mapaConsultas ...... clúster de consulta → página canónica (data/topic-map.json)
 *   afirmaciones ....... cada cifra publicable y de dónde sale
 *   proyectos .......... fichas redactadas frente a fichas publicadas
 *   inconsistencias .... toda cifra o fecha escrita a mano que ya vive en
 *                        lib/facts.ts o lib/site.ts
 *
 * Uso:
 *   node scripts/auditar-estado.mjs            → escribe audit/current-state.json
 *   node scripts/auditar-estado.mjs --check    → además falla si hay inconsistencias
 *   node scripts/auditar-estado.mjs --resumen  → imprime el resumen por consola
 */

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const RAIZ = process.cwd();
const ARGS = new Set(process.argv.slice(2));

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de lectura
// ─────────────────────────────────────────────────────────────────────────────

const leer = (rel) => (existsSync(join(RAIZ, rel)) ? readFileSync(join(RAIZ, rel), 'utf8') : '');

/** Quita comentarios de bloque, de línea y de JSX. Un comentario no es código. */
function sinComentarios(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Todos los `slug: '...'` de un archivo fuente, en orden de aparición. */
function slugsDe(rel) {
  const src = sinComentarios(leer(rel));
  return [...src.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

/** Los `slug` de un JSON de datos. */
function slugsDeJson(rel) {
  if (!existsSync(join(RAIZ, rel))) return [];
  try {
    const datos = JSON.parse(leer(rel));
    return Array.isArray(datos) ? datos.map((d) => d.slug).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function recorrer(dir, filtro, salida = []) {
  const abs = join(RAIZ, dir);
  if (!existsSync(abs)) return salida;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) recorrer(rel, filtro, salida);
    else if (filtro(e.name)) salida.push(rel);
  }
  return salida;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fuentes de verdad — se leen del código, nunca se copian aquí
// ─────────────────────────────────────────────────────────────────────────────

const FUENTES = {
  productos: slugsDe('lib/products.ts'),
  familias: slugsDe('lib/families.ts'),
  industrias: slugsDe('lib/industrias.ts'),
  glosario: slugsDe('lib/glosario.ts'),
  guias: slugsDe('lib/guides.ts'),
  aplicaciones: slugsDe('lib/applications.ts'),
  soluciones: slugsDe('lib/solutions.ts'),
  articulos: slugsDe('lib/articles.ts'),
  novedades: slugsDe('lib/novedades.ts'),
  informes: slugsDe('lib/informes.ts'),
  calculadoras: slugsDe('lib/calculadoras.ts'),
  proyectos: slugsDe('lib/projects.ts'),
  ciudades: slugsDeJson('data/ciudades.json'),
};

// `lib/products.ts` declara productos Y familias en el mismo archivo: los
// últimos `slug:` son los de `productFamilies`. Se separan por la lista de
// familias declarada en lib/families.ts, que es la que pagina el sitio.
FUENTES.productos = FUENTES.productos.filter((s) => !FUENTES.familias.includes(s));

/** Proyectos publicados = `verificado: true`. Se cuenta sobre el texto fuente. */
const proyectosSrc = sinComentarios(leer('lib/projects.ts'));
const proyectosPublicados = FUENTES.proyectos.filter((slug) => {
  const i = proyectosSrc.indexOf(`slug: "${slug}"`) >= 0
    ? proyectosSrc.indexOf(`slug: "${slug}"`)
    : proyectosSrc.indexOf(`slug: '${slug}'`);
  if (i < 0) return false;
  const bloque = proyectosSrc.slice(i, i + 2500);
  return /verificado:\s*true/.test(bloque.split(/\n\s*\{/)[0]);
});

/** Qué colección expande cada segmento dinámico. */
const EXPANSORES = {
  'productos/[slug]': FUENTES.productos,
  'productos/familia/[slug]': FUENTES.familias,
  'productos/familia/[slug]/comparar': FUENTES.familias,
  'industria/[sector]': FUENTES.industrias,
  'glosario/[slug]': FUENTES.glosario,
  'biblioteca/[slug]': FUENTES.guias,
  'aplicaciones/[slug]': FUENTES.aplicaciones,
  'soluciones/[slug]': FUENTES.soluciones,
  'recursos/[slug]': FUENTES.articulos,
  'novedades/[slug]': FUENTES.novedades,
  'informes/[slug]': FUENTES.informes,
  'calculadoras/[slug]': FUENTES.calculadoras,
  'local/[ciudad]': FUENTES.ciudades,
};

// ─────────────────────────────────────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────────────────────────────────────

/** app/productos/[slug]/page.tsx → productos/[slug] */
function rutaDe(archivoPage) {
  return archivoPage
    .replace(/^app\//, '')
    .replace(/\/?page\.tsx$/, '')
    .replace(/\/?\(\w[^/]*\)/g, ''); // grupos de ruta (auth) no aparecen en la URL
}

/** Título declarado en `metadata` o en `generateMetadata`. */
function tituloDe(src) {
  const m = sinComentarios(src).match(/\btitle:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)/);
  if (!m) return null;
  const bruto = m[1] ?? m[2] ?? m[3] ?? null;
  return bruto === null ? null : bruto.trim();
}

/** Primer H1 del componente. Devuelve el texto si es literal, o la expresión. */
function h1De(src) {
  const m = sinComentarios(src).match(/<h1\b[^>]*>([\s\S]{0,400}?)<\/h1>/);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').trim().slice(0, 200) || null;
}

/** Canonical declarado en `alternates`. */
function canonicalDe(src) {
  const limpio = sinComentarios(src);
  const m = limpio.match(/canonical:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|([A-Za-z_$][\w$.]*))/);
  if (m) return (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').trim() || null;
  // Forma abreviada de objeto: `alternates: { canonical }`, con la constante
  // declarada arriba. Es tan válida como la larga y hay que reconocerla.
  const corta = limpio.match(/alternates:\s*\{[^}]*\bcanonical\b\s*[,}]/);
  if (!corta) return null;
  const decl = limpio.match(/const\s+canonical\s*=\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)/);
  return (decl ? (decl[1] ?? decl[2] ?? decl[3]) : '(abreviado)').trim() || '(abreviado)';
}

/** Constructores de esquema JSON-LD invocados en el archivo. */
const CONSTRUCTORES_SCHEMA = [...sinComentarios(leer('lib/schema.ts'))
  .matchAll(/export function (\w+Schema)\s*\(/g)].map((m) => m[1]);

function esquemasDe(src) {
  const limpio = sinComentarios(src);
  const encontrados = new Set();
  for (const fn of CONSTRUCTORES_SCHEMA) {
    if (new RegExp(`\\b${fn}\\s*\\(`).test(limpio)) encontrados.add(fn);
  }
  // Componentes que emiten esquema por su cuenta.
  if (/<ProductStructuredData\b/.test(limpio)) encontrados.add('productSchema (vía ProductStructuredData)');
  if (/<StructuredData\b/.test(limpio)) encontrados.add('organizationSchema (vía StructuredData)');
  if (/<EsquemaPagina\b/.test(limpio)) {
    encontrados.add('webPageSchema (vía EsquemaPagina)');
    encontrados.add('breadcrumbSchema (vía EsquemaPagina)');
  }
  return [...encontrados].sort();
}

/**
 * Enlaces internos salientes.
 *
 * Incluye los INTERPOLADOS, y esa es la parte que importa. La primera versión
 * sólo leía cadenas literales, así que `href={`/productos/${p.slug}`}` —la
 * forma en que este sitio enlaza sus 36 fichas, sus 11 familias y sus 43
 * términos— no contaba como enlace. El resultado era una auditoría que
 * declaraba huérfanas y a más de tres clics precisamente las páginas
 * comerciales, que están a dos. Un enlace construido en tiempo de ejecución es
 * un enlace: lo que no se sabe es a qué slug concreto apunta, y para medir el
 * grafo eso da igual — se le asigna su plantilla.
 */
function enlacesDe(src) {
  const limpio = sinComentarios(src);
  const salida = new Set();
  const literales = [
    /href=["'](\/[^"'#?]*)["']/g,
    /href=\{\s*["'`](\/[^"'`#?${]*)["'`]\s*\}/g,
    /href:\s*["'`](\/[^"'`#?${]*)["'`]/g,
  ];
  for (const re of literales) {
    for (const m of limpio.matchAll(re)) {
      const h = m[1].replace(/\/$/, '') || '/';
      if (!h.startsWith('/api/')) salida.add(h);
    }
  }
  // Plantillas: `/productos/${p.slug}` → /productos/[slug]
  const interpolados = [/href=\{\s*`(\/[^`]*)`\s*\}/g, /href:\s*`(\/[^`]*)`/g];
  for (const re of interpolados) {
    for (const m of limpio.matchAll(re)) {
      if (!m[1].includes('${')) continue;
      const h = m[1]
        .replace(/\$\{[^}]*\}/g, '[slug]')
        .split('?')[0]
        .replace(/\/$/, '');
      if (h && !h.startsWith('/api/')) salida.add(h);
    }
  }
  return [...salida].sort();
}

const paginas = recorrer('app', (n) => n === 'page.tsx').sort();

/**
 * Fuente efectiva de una página: su page.tsx MÁS el layout.tsx de su misma
 * carpeta, si lo hay.
 *
 * Sin esto la auditoría mentía. Una página interactiva —/contacto,
 * /marco/evaluacion— es `'use client'` y no puede exportar `metadata`, así que
 * el canonical y el JSON-LD viven en un layout hermano. Mirando sólo el
 * page.tsx, esas dos páginas aparecían «sin canonical» y «sin esquema» cuando
 * ambos estaban puestos, y las de verdad rotas quedaban escondidas entre los
 * falsos positivos. Un auditor con ruido es un auditor que se deja de mirar.
 */
function fuenteEfectiva(archivoPage) {
  const propio = readFileSync(join(RAIZ, archivoPage), 'utf8');
  const layout = archivoPage.replace(/page\.tsx$/, 'layout.tsx');
  return existsSync(join(RAIZ, layout)) ? `${propio}\n${readFileSync(join(RAIZ, layout), 'utf8')}` : propio;
}

const rutas = paginas.map((archivo) => {
  const src = fuenteEfectiva(archivo);
  const ruta = rutaDe(archivo);
  const dinamica = ruta.includes('[');
  const expandida = EXPANSORES[ruta] ?? null;
  return {
    ruta: `/${ruta}`.replace(/\/$/, '') || '/',
    archivo,
    dinamica,
    instancias: dinamica ? (expandida ? expandida.length : null) : 1,
    slugs: dinamica ? expandida : null,
    title: tituloDe(src),
    tituloDerivado: !tituloDe(src) || /\$\{|\bproduct\b|\bfamilia\b/.test(tituloDe(src) ?? ''),
    h1: h1De(src),
    canonical: canonicalDe(src),
    esquemas: esquemasDe(src),
    enlacesSalientes: enlacesDe(src),
    lineas: readFileSync(join(RAIZ, archivo), 'utf8').split('\n').length,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Endpoints legibles por máquina
// ─────────────────────────────────────────────────────────────────────────────

const endpointsMaquina = recorrer('app', (n) => n === 'route.ts')
  .filter((f) => !f.startsWith('app/api/'))
  .map((archivo) => {
    const src = readFileSync(join(RAIZ, archivo), 'utf8');
    const tipo = (src.match(/['"]Content-Type['"]:\s*['"]([^'"]+)['"]/) || [])[1] ?? 'desconocido';
    return {
      ruta: `/${archivo.replace(/^app\//, '').replace(/\/route\.ts$/, '')}`,
      archivo,
      contentType: tipo,
      estatico: /export const dynamic\s*=\s*['"]force-static['"]/.test(src),
      abiertoACors: /Access-Control-Allow-Origin/.test(src),
      noindex: /X-Robots-Tag['"]?\s*[,:]\s*['"][^'"]*noindex/.test(src),
    };
  })
  .sort((a, b) => a.ruta.localeCompare(b.ruta));

const endpointsApi = recorrer('app/api', (n) => n === 'route.ts').map((a) => ({
  ruta: `/${a.replace(/^app\//, '').replace(/\/route\.ts$/, '')}`,
  archivo: a,
  publico: false,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Grafo de enlaces internos: profundidad desde «/» y huérfanas
// ─────────────────────────────────────────────────────────────────────────────

const NAV = sinComentarios(leer('components/Navbar.tsx'));
const PIE = sinComentarios(leer('components/Footer.tsx'));
const enlacesGlobales = new Set([
  ...enlacesDe(NAV),
  ...enlacesDe(PIE),
  // El menú deriva los sectores de lib/industrias.ts: se expanden a mano
  // porque el enlace se construye en runtime y el regex no lo ve.
  ...(/INDUSTRIAS\.map/.test(NAV) ? FUENTES.industrias.map((s) => `/industria/${s}`) : []),
]);

/** Plantilla de una ruta concreta: /productos/foo → /productos/[slug] */
function plantillaDe(ruta) {
  const partes = ruta.split('/').filter(Boolean);
  for (const r of rutas) {
    const p = r.ruta.split('/').filter(Boolean);
    if (p.length !== partes.length) continue;
    // Un segmento dinámico casa con cualquier cosa, y el marcador «[slug]» que
    // deja un enlace interpolado casa con cualquier segmento dinámico.
    if (p.every((seg, i) => seg.startsWith('[') || partes[i].startsWith('[') || seg === partes[i])) return r;
  }
  return null;
}

/** Todas las URLs concretas que el sitio publica. */
const urlsConcretas = [];
for (const r of rutas) {
  if (!r.dinamica) urlsConcretas.push(r.ruta);
  else if (r.slugs) {
    for (const s of r.slugs) urlsConcretas.push(r.ruta.replace(/\[[^\]]+\]/, s));
  }
}

const aristas = [];
for (const r of rutas) {
  for (const destino of r.enlacesSalientes) aristas.push({ desde: r.ruta, hacia: destino });
}
for (const destino of enlacesGlobales) aristas.push({ desde: '(global: menú y pie)', hacia: destino });

/**
 * Profundidad en clics desde la portada. El menú y el pie cuentan como nivel 1
 * porque están en todas las páginas: lo que enlazan está a un clic de donde sea.
 *
 * SE MIDE SOBRE PLANTILLAS, no sobre URLs concretas, y el destino de cada
 * enlace se traduce a su plantilla antes de propagar. Sin esa traducción la
 * medida no servía: /productos enlaza «/productos/big-bags-…», que es una URL
 * concreta, y la plantilla /productos/[slug] se quedaba sin profundidad — es
 * decir, las 36 fichas comerciales aparecían como inalcanzables cuando están a
 * dos clics.
 */
const profundidad = new Map([['/', 0]]);
for (const h of enlacesGlobales) {
  const clave = plantillaDe(h)?.ruta ?? h;
  if (!profundidad.has(clave)) profundidad.set(clave, 1);
}
let cambio = true;
let vueltas = 0;
while (cambio && vueltas++ < 12) {
  cambio = false;
  for (const r of rutas) {
    const base = profundidad.get(r.ruta);
    if (base === undefined) continue;
    for (const destino of r.enlacesSalientes) {
      const clave = plantillaDe(destino)?.ruta ?? destino;
      const actual = profundidad.get(clave);
      if (actual === undefined || actual > base + 1) {
        profundidad.set(clave, base + 1);
        cambio = true;
      }
    }
  }
}

/**
 * Huérfana = plantilla de página a la que no llega ningún enlace literal.
 * Una plantilla dinámica alcanzable por índice (por ejemplo /productos → tarjetas
 * construidas en runtime) NO es huérfana: se marca «alcanzable por índice».
 */
const INDICES = {
  'productos/[slug]': '/productos',
  'productos/familia/[slug]': '/productos',
  'productos/familia/[slug]/comparar': '/productos/familia/[slug]',
  'industria/[sector]': '/industria',
  'glosario/[slug]': '/glosario',
  'biblioteca/[slug]': '/biblioteca',
  'aplicaciones/[slug]': '/aplicaciones',
  'soluciones/[slug]': '/soluciones',
  'recursos/[slug]': '/recursos',
  'novedades/[slug]': '/novedades',
  'informes/[slug]': '/informes',
  'calculadoras/[slug]': '/calculadoras',
  'local/[ciudad]': '/local',
};

const entrantes = new Map();
for (const { hacia } of aristas) {
  const plantilla = plantillaDe(hacia);
  const clave = plantilla ? plantilla.ruta : hacia;
  entrantes.set(clave, (entrantes.get(clave) ?? 0) + 1);
}

const huerfanas = rutas
  .filter((r) => r.ruta !== '/')
  .filter((r) => !(entrantes.get(r.ruta) > 0))
  .filter((r) => !INDICES[r.ruta.slice(1)])
  .map((r) => r.ruta);

const aTresClics = rutas
  .filter((r) => (profundidad.get(r.ruta) ?? 99) > 3)
  .map((r) => ({
    ruta: r.ruta,
    profundidad: profundidad.get(r.ruta) ?? null,
    nota: profundidad.get(r.ruta) === undefined ? 'sin enlace literal entrante' : undefined,
  }));

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de consultas comerciales
// ─────────────────────────────────────────────────────────────────────────────

let mapaConsultas = { existe: false, clusters: [], terminos: 0 };
if (existsSync(join(RAIZ, 'data/topic-map.json'))) {
  const tm = JSON.parse(leer('data/topic-map.json'));
  mapaConsultas = {
    existe: true,
    version: tm.version ?? null,
    revisado: tm.revisado ?? null,
    clusters: (tm.clusters ?? []).map((c) => ({
      id: c.id,
      canonica: c.canonica,
      intencion: c.intencion,
      termino: c.termino,
      variantes: (c.variantes ?? []).length,
      preguntas: (c.preguntas ?? []).length,
      apoyos: (c.apoyos ?? []).length,
    })),
    terminos: (tm.clusters ?? []).reduce(
      (n, c) => n + 1 + (c.variantes ?? []).length + (c.erratas ?? []).length,
      0,
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Afirmaciones y sus inconsistencias
// ─────────────────────────────────────────────────────────────────────────────

const siteSrc = leer('lib/site.ts');
const anioFundacion = (siteSrc.match(/foundingYear:\s*['"](\d{4})['"]/) || [])[1] ?? null;
const ruc = (siteSrc.match(/ruc:\s*['"](\d+)['"]/) || [])[1] ?? null;

const afirmaciones = [
  { id: 'anio-fundacion', valor: anioFundacion, fuente: 'lib/site.ts › SITE.foundingYear' },
  { id: 'ruc', valor: ruc, fuente: 'lib/site.ts › SITE.ruc' },
  { id: 'productos', valor: String(FUENTES.productos.length), fuente: 'lib/facts.ts › PRODUCT_COUNT (deriva de lib/products.ts)' },
  { id: 'familias', valor: String(FUENTES.familias.length), fuente: 'lib/facts.ts › FAMILY_COUNT (deriva de lib/families.ts)' },
  { id: 'industrias', valor: String(FUENTES.industrias.length), fuente: 'lib/industrias.ts › INDUSTRIAS' },
  { id: 'proyectos-redactados', valor: String(FUENTES.proyectos.length), fuente: 'lib/projects.ts' },
  { id: 'proyectos-publicados', valor: String(proyectosPublicados.length), fuente: 'lib/projects.ts › verificado: true' },
  { id: 'terminos-glosario', valor: String(FUENTES.glosario.length), fuente: 'lib/glosario.ts' },
  { id: 'guias', valor: String(FUENTES.guias.length), fuente: 'lib/guides.ts' },
  { id: 'ciudades', valor: String(FUENTES.ciudades.length), fuente: 'data/ciudades.json' },
];

/**
 * Una inconsistencia es una cifra ESCRITA A MANO que ya vive en una fuente de
 * verdad. No se persiguen números: se persiguen exactamente estas cifras, en
 * texto que se sirve al usuario, fuera del archivo que las define.
 */
const EXENTOS = new Set(['lib/site.ts', 'lib/facts.ts', 'lib/products.ts', 'lib/families.ts', 'test']);
const PATRONES_INCONSISTENCIA = [
  {
    id: 'anio-fundacion-a-mano',
    // Sólo la antigüedad DE LA EMPRESA. «la ISO 21898 que el Callao exige
    // desde 2023» es un dato ajeno y correcto: no se persigue.
    re: anioFundacion
      ? new RegExp(
          `\\b(fabricaci[óo]n|fabricando|operando|operamos|fundad\\w+|constituid\\w+|en el mercado|en el Per[úu])\\b[^.\\n]{0,40}\\bdesde\\s+(?!${anioFundacion}\\b)(19|20)\\d{2}\\b`,
          'i',
        )
      : null,
    porque: `antigüedad de la empresa con un año distinto de SITE.foundingYear (${anioFundacion})`,
  },
  {
    id: 'conteo-soluciones-a-mano',
    re: /\b\d{1,3}\s+soluciones\b/i,
    porque: 'recuento de soluciones escrito a mano: debe salir de facts.ts › COUNT_STATEMENT',
  },
  {
    id: 'conteo-familias-a-mano',
    re: /\b\d{1,3}\s+(l[ií]neas de producto|familias)\b/i,
    porque: 'recuento de familias escrito a mano: debe salir de facts.ts › FAMILY_COUNT',
  },
  {
    id: 'conteo-productos-a-mano',
    re: /\b\d{1,3}\s+productos\s+(del\s+)?cat[áa]logo\b/i,
    porque: 'recuento de productos escrito a mano: debe salir de facts.ts › PRODUCT_COUNT',
  },
  {
    id: 'anios-experiencia-a-mano',
    re: /\b\d{1,2}\s+a[ñn]os\s+de\s+(experiencia|trayectoria|operaci[óo]n)\b/i,
    porque: 'antigüedad escrita a mano: debe salir de facts.ts › YEARS_OPERATING',
  },
];

const archivosTexto = [
  ...recorrer('app', (n) => /\.(tsx?|json)$/.test(n)),
  ...recorrer('components', (n) => /\.(tsx?)$/.test(n)),
  ...recorrer('lib', (n) => /\.(tsx?)$/.test(n)),
  ...recorrer('data', (n) => /\.json$/.test(n)),
].filter((f) => statSync(join(RAIZ, f)).size < 2_000_000);

const inconsistencias = [];
for (const { id, re, porque } of PATRONES_INCONSISTENCIA) {
  if (!re) continue;
  for (const f of archivosTexto) {
    if ([...EXENTOS].some((e) => f === e || f.startsWith(`${e}/`))) continue;
    const lineas = readFileSync(join(RAIZ, f), 'utf8').split('\n');
    for (const [n, linea] of lineas.entries()) {
      const t = linea.trim();
      if (t.startsWith('*') || t.startsWith('//') || t.startsWith('{/*')) continue;
      if (re.test(linea)) inconsistencias.push({ id, archivo: f, linea: n + 1, texto: t.slice(0, 160), porque });
    }
  }
}

// Páginas sin canonical declarado y páginas sin ningún esquema.
const sinCanonical = rutas.filter((r) => !r.canonical).map((r) => r.ruta);
const sinEsquema = rutas.filter((r) => r.esquemas.length === 0).map((r) => r.ruta);
const sinBreadcrumb = rutas
  .filter((r) => r.ruta.split('/').filter(Boolean).length >= 2)
  .filter((r) => !r.esquemas.some((e) => e.startsWith('breadcrumbSchema')))
  .map((r) => r.ruta);

// ─────────────────────────────────────────────────────────────────────────────
// Salida
// ─────────────────────────────────────────────────────────────────────────────

let commit = null;
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: RAIZ, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
} catch {
  /* repositorio sin git: no es un error */
}

const estado = {
  generadoPor: 'scripts/auditar-estado.mjs',
  // La fecha se toma del último commit, no del reloj: así el archivo es
  // reproducible y un `git diff` sólo cambia cuando cambia el sitio.
  commit,
  resumen: {
    plantillasDePagina: rutas.length,
    urlsPublicas: urlsConcretas.length,
    endpointsMaquina: endpointsMaquina.length,
    endpointsApi: endpointsApi.length,
    productos: FUENTES.productos.length,
    familias: FUENTES.familias.length,
    industrias: FUENTES.industrias.length,
    terminosGlosario: FUENTES.glosario.length,
    guias: FUENTES.guias.length,
    aplicaciones: FUENTES.aplicaciones.length,
    soluciones: FUENTES.soluciones.length,
    ciudades: FUENTES.ciudades.length,
    proyectosRedactados: FUENTES.proyectos.length,
    proyectosPublicados: proyectosPublicados.length,
    clustersDeConsulta: mapaConsultas.clusters.length,
    terminosMapeados: mapaConsultas.terminos,
    paginasSinCanonical: sinCanonical.length,
    paginasSinEsquema: sinEsquema.length,
    paginasProfundasSinBreadcrumbSchema: sinBreadcrumb.length,
    paginasHuerfanas: huerfanas.length,
    paginasAMasDeTresClics: aTresClics.length,
    inconsistencias: inconsistencias.length,
  },
  rutas,
  endpointsMaquina,
  endpointsApi,
  catalogo: FUENTES,
  proyectos: { redactados: FUENTES.proyectos, publicados: proyectosPublicados },
  mapaConsultas,
  afirmaciones,
  grafoEnlaces: {
    nodos: rutas.map((r) => r.ruta),
    aristas: aristas.length,
    enlacesGlobales: [...enlacesGlobales].sort(),
    profundidad: Object.fromEntries([...profundidad.entries()].sort()),
    huerfanas,
    aMasDeTresClics: aTresClics,
  },
  hallazgos: {
    sinCanonical,
    sinEsquema,
    profundasSinBreadcrumbSchema: sinBreadcrumb,
    inconsistencias,
  },
};

mkdirSync(join(RAIZ, 'audit'), { recursive: true });
const destino = join(RAIZ, 'audit/current-state.json');
writeFileSync(destino, `${JSON.stringify(estado, null, 2)}\n`, 'utf8');

const r = estado.resumen;
console.log(`audit/current-state.json escrito (${relative(RAIZ, destino)})`);
console.log(
  `  ${r.plantillasDePagina} plantillas · ${r.urlsPublicas} URLs públicas · ` +
    `${r.endpointsMaquina} endpoints de máquina`,
);
console.log(
  `  ${r.productos} productos · ${r.familias} familias · ${r.industrias} industrias · ` +
    `${r.clustersDeConsulta} clústeres de consulta (${r.terminosMapeados} términos)`,
);
console.log(
  `  hallazgos: ${r.paginasSinCanonical} sin canonical · ${r.paginasSinEsquema} sin esquema · ` +
    `${r.paginasProfundasSinBreadcrumbSchema} sin BreadcrumbList · ${r.paginasHuerfanas} huérfanas · ` +
    `${r.inconsistencias} inconsistencias`,
);

if (ARGS.has('--resumen')) {
  if (inconsistencias.length) {
    console.log('\nINCONSISTENCIAS:');
    for (const i of inconsistencias) console.log(`  ${i.archivo}:${i.linea}  ${i.porque}\n    ${i.texto}`);
  }
  if (huerfanas.length) console.log(`\nHUÉRFANAS:\n  ${huerfanas.join('\n  ')}`);
  if (sinBreadcrumb.length) console.log(`\nSIN BreadcrumbList:\n  ${sinBreadcrumb.join('\n  ')}`);
}

if (ARGS.has('--check') && inconsistencias.length) {
  console.error(`\n${inconsistencias.length} inconsistencia(s): una cifra que ya vive en una fuente de verdad está escrita a mano.`);
  process.exit(1);
}
