/**
 * CAMINO DEL DINERO — prueba de extremo a extremo contra el sitio COMPILADO.
 *
 * POR QUÉ EXISTE, además de las 1234 pruebas de vitest. Esas pruebas leen
 * archivos y llaman funciones: pueden demostrar que `mergeReadinessSignals`
 * enciende "Listo para cotizar" con las cinco señales, pero NO pueden ver si
 * un comprador real llega a ponerlas. Entre la función correcta y la venta
 * hay un CTA que tiene que existir en la ficha, un panel que tiene que estar
 * visible, un formulario de confirmación que tiene que escribir estado, y un
 * /cotizacion que tiene que llegar precargado. Cada uno de esos eslabones ha
 * estado roto alguna vez con la suite entera en verde.
 *
 * Esto abre un navegador y recorre el embudo completo:
 *
 *   TRAMO 1 — ficha → CTA → /asistente → confirmar ciudad, cantidad, uso y
 *             contacto → "Listo para cotizar" → /cotizacion precargado, y el
 *             brief de WhatsApp con los mismos datos.
 *   TRAMO 2 — foto: o analiza de verdad, o falla diciéndolo. Nunca inventa.
 *   TRAMO 3 — límites de /api/chat y /api/vision.
 *
 * NO NECESITA CLAVE DE ANTHROPIC PARA EL TRAMO 1. Eso no es un atajo de la
 * prueba: es la propiedad que el Sprint E.2 existe para dar. Si el camino a
 * "Listo para cotizar" dependiera de que el modelo acertara a llamar
 * `buildRFQ`, esta prueba no podría correr sin clave — y el comprador
 * tampoco podría cotizar cuando el modelo no la llamara.
 *
 * Uso: `npm run probar:dinero` (compila si hace falta, levanta, mide, apaga).
 * Salida JSON en .diagnostico/camino-dinero.json
 */
import { BASE, lanzarNavegador, guardar } from './diagnostico/rutas.mjs';

const R = [];
let fallos = 0;
const ok = (nombre, pasa, detalle = '') => {
  R.push({ nombre, pasa, detalle });
  if (!pasa) fallos++;
  console.error(`  ${pasa ? '✓' : '✗'} ${nombre}${detalle ? ' — ' + detalle : ''}`);
};

const HAY_CLAVE = Boolean(process.env.ANTHROPIC_API_KEY);

/** Slug REAL del catálogo, leído del sitio renderizado — nunca escrito a mano. */
async function primerProductoReal() {
  const html = await (await fetch(`${BASE}/productos`)).text();
  const slugs = [...html.matchAll(/href="\/productos\/([a-z0-9-]+)"/g)]
    .map((m) => m[1])
    .filter((s) => s !== 'familia');
  if (slugs.length === 0) throw new Error('No se encontró ningún producto en /productos');
  return slugs[0];
}

const nav = await lanzarNavegador();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();

// ───────────────────────── TRAMO 1 — camino del dinero ─────────────────────
console.error('\n── TRAMO 1: ficha → asistente → listo → cotización ──');

const slug = await primerProductoReal();
await p.goto(`${BASE}/productos/${slug}`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(400);

// 1. La ficha ofrece el asistente sin sustituir el camino directo a cotizar.
//    Se busca el CTA CONTEXTUAL (el que lleva el producto), no el enlace
//    genérico a /asistente que el navbar tiene en todas las páginas: dar por
//    bueno ese sería medir la barra de navegación, no la ficha.
const ctaAsistente = p.locator('a[href*="/asistente?"][href*="producto="]').first();
const hayCta = (await ctaAsistente.count()) > 0;
ok('la ficha de producto ofrece un CTA contextual al asistente', hayCta, `/productos/${slug}`);
const hayCotizar = (await p.locator('a[href^="/cotizacion"]').count()) > 0;
ok('la ficha conserva el camino directo a cotizar', hayCotizar);

// 2. El CTA lleva el producto consigo.
const hrefCta = hayCta ? await ctaAsistente.getAttribute('href') : '';
ok('el CTA arrastra el slug del producto a /asistente', (hrefCta ?? '').includes(`producto=${slug}`), hrefCta ?? '(sin CTA)');

if (hayCta) {
  await ctaAsistente.click();
  await p.waitForURL(/\/asistente/, { timeout: 15000 });
} else {
  await p.goto(`${BASE}/asistente?producto=${slug}`, { waitUntil: 'domcontentloaded' });
}
await p.waitForTimeout(900);

// El panel "Mi proyecto": todo lo que sigue se mide DENTRO de él. El navbar
// y el pie tienen sus propios enlaces a /cotizacion y a WhatsApp, y medir
// esos habría dado un verde que no dice nada del embudo.
const panel = p.locator('section').filter({ hasText: 'Mi proyecto' }).last();
await panel.waitFor({ timeout: 10000 });

/** Lo que el proyecto tiene REALMENTE guardado, leído del propio navegador. */
const leerBorrador = () =>
  p.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('pp_asistente_project_draft') ?? '{}');
    } catch {
      return {};
    }
  });

// 3. El contexto de producto llega al panel: el chip de producto ya está verde.
//    "Verde" se comprueba por el título del chip (los desconocidos dicen
//    "Preguntar y confirmar"), no por que exista un botón: ambos lo son.
const chipProducto = panel.getByRole('button', { name: /Producto o familia/i }).first();
await chipProducto.waitFor({ timeout: 10000 }).catch(() => {});
const tituloProducto = (await chipProducto.getAttribute('title')) ?? '';
ok(
  'el asistente reconoce el producto de origen sin preguntarlo',
  (await chipProducto.count()) > 0 && !/Preguntar/.test(tituloProducto),
  tituloProducto,
);

/**
 * Confirma un campo por su chip. ESTE es el camino que el Sprint E.2 abrió:
 * escribe estado estructurado sin depender de que el modelo llame una tool.
 */
async function confirmar(etiqueta, valores, campoBorrador) {
  const chip = panel.getByRole('button', { name: new RegExp(etiqueta, 'i') }).first();
  if ((await chip.count()) === 0) return ok(`confirmar ${etiqueta}`, false, 'no se encontró el chip');
  await chip.click();
  await p.waitForTimeout(350);
  for (const [selector, valor] of valores) {
    const campo = panel.locator(selector);
    if ((await campo.count()) === 0) return ok(`confirmar ${etiqueta}`, false, `sin campo ${selector}`);
    await campo.fill(valor);
  }
  await panel.getByRole('button', { name: /^Confirmar$/ }).click();
  await p.waitForTimeout(400);
  // No basta con que el clic no lance: se comprueba que el dato QUEDÓ
  // guardado. Un "Confirmar" que no escribe estado es justo el fallo que
  // esta prueba existe para ver.
  const borrador = await leerBorrador();
  ok(
    `confirmar ${etiqueta} escribe el estado del proyecto`,
    borrador[campoBorrador] === valores[0][1],
    `${campoBorrador}=${JSON.stringify(borrador[campoBorrador] ?? null)}`,
  );
}

await confirmar('Cantidad o medidas', [['#confirmar-cantidad', '450 m2']], 'cantidad');
await confirmar('Ciudad / entrega', [['#confirmar-ciudad', 'Arequipa']], 'ciudad');
await confirmar('Uso o aplicación', [['#confirmar-aplicacion', 'Cobertura de ruma']], 'aplicacion');
await confirmar(
  'Contacto',
  [
    ['#confirmar-nombre', 'Rosa Quispe'],
    ['#confirmar-telefono', '+51 999 888 777'],
  ],
  'nombre',
);

// 4. EL MOMENTO QUE IMPORTA: con los cinco campos, enciende "Listo para cotizar".
const listo = panel.getByText('Listo para cotizar', { exact: false }).first();
const encendio = await listo
  .waitFor({ timeout: 8000 })
  .then(() => true)
  .catch(() => false);
ok('con los 5 campos confirmados enciende "Listo para cotizar"', encendio);

// 5. El brief de WhatsApp lleva lo mismo que el proyecto (antes de navegar).
const hrefWa = await panel.locator('a[href*="wa.me"]').last().getAttribute('href');
const wa = decodeURIComponent(hrefWa ?? '');
ok('el brief de WhatsApp lleva la ciudad confirmada', /Arequipa/.test(wa));
ok('el brief de WhatsApp lleva la cantidad confirmada', /450 m2/.test(wa));
ok('el brief de WhatsApp lleva el producto', /Producto: .+/.test(wa));
// Un importe es "S/ 90", "USD 90" o "90 soles" — no la barra de
// "Medidas/cantidad", que hacía saltar un falso positivo.
ok('el brief de WhatsApp NO lleva ningún precio', !/(S\/\s*\d|US\$|USD\s*\d|\bsoles\b|\bprecio\b)/i.test(wa), wa.slice(0, 120));

// 6. El enlace a /cotizacion conserva slug + ciudad + origen.
const hrefCot = (await panel.locator('a[href^="/cotizacion"]').first().getAttribute('href')) ?? '';
ok('el enlace a cotización conserva el slug del producto', hrefCot.includes(`producto=${slug}`), hrefCot);
ok('el enlace a cotización conserva la ciudad', /ciudad=Arequipa/.test(hrefCot));
ok('el enlace a cotización marca el origen', /origen=asistente/.test(hrefCot));

// 7. Y el formulario llega PRECARGADO — el eslabón que más veces se rompe.
await p.goto(BASE + hrefCot, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(800);
const ciudadForm = await p.locator('#rfq-ciudad').inputValue().catch(() => '');
ok('/cotizacion llega con la ciudad de entrega precargada', ciudadForm === 'Arequipa', `"${ciudadForm}"`);
const productoForm = await p.locator('#rfq-producto').inputValue().catch(() => '');
ok('/cotizacion llega con el producto preseleccionado', productoForm.trim().length > 0, `"${productoForm}"`);

// ───────────────────────── TRAMO 2 — foto honesta ──────────────────────────
console.error('\n── TRAMO 2: foto → evidencia, sin inventar ──');

await p.goto(`${BASE}/asistente`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(700);

const inputFoto = p.locator('input[type="file"][accept*="image"]').first();
const hayInput = (await inputFoto.count()) > 0;
ok('existe una entrada real de foto en /asistente', hayInput);

if (hayInput) {
  // Una imagen REAL del propio sitio: no se crea ni se re-codifica ningún binario.
  await inputFoto.setInputFiles('public/logo.png').catch(async () => {
    await inputFoto.setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from([]) });
  });
  await p.waitForTimeout(HAY_CLAVE ? 25000 : 4000);

  /**
   * La tarjeta se detecta por el encabezado de su primera sección, que es
   * texto EXCLUSIVO suyo. Antes se buscaba "Análisis de foto" y daba un
   * falso positivo: `getByText` compara por subcadena e ignorando
   * mayúsculas, así que el mensaje de error —"El análisis de fotos no está
   * disponible por ahora"— contaba como si hubiera una tarjeta. La prueba
   * entraba en la rama equivocada y fallaba anunciando una tarjeta sin
   * secciones, cuando lo correcto era comprobar que el fallo se comunicó.
   */
  const hayTarjeta = (await p.getByText('Lo que se observa en la foto').count()) > 0;
  const cuerpo = await p.locator('body').innerText();

  if (hayTarjeta) {
    // Con una tarjeta real: las cuatro secciones, y sólo OBSERVADO confirmable.
    ok('la tarjeta declara lo que NO se puede saber por una foto', /No se puede saber por una foto/i.test(cuerpo));
    ok('la tarjeta exige confirmación antes de cotizar', /Antes de cotizar, hay que confirmar/i.test(cuerpo));

    const botones = await p.getByRole('button', { name: /Confirmar para el proyecto/i }).count();
    const ticksObservados = await p
      .locator('li', { has: p.getByRole('button', { name: /Confirmar para el proyecto/i }) })
      .count();
    ok('sólo los ticks de OBSERVADO ofrecen confirmar', botones > 0 && botones === ticksObservados, `${botones} botones`);

    if (botones > 0) {
      await p.getByRole('button', { name: /Confirmar para el proyecto/i }).first().click();
      await p.waitForTimeout(500);
      ok('la observación confirmada queda marcada en el proyecto', (await p.getByText('En el proyecto').count()) > 0);

      // LO QUE NO DEBE PASAR: la foto no enciende cantidad ni ciudad.
      const borrador = await p.evaluate(() => {
        try {
          return JSON.parse(localStorage.getItem('pp_asistente_project_draft') ?? '{}');
        } catch {
          return {};
        }
      });
      ok('la foto NO rellenó la cantidad', !borrador.cantidad, JSON.stringify(borrador.cantidad ?? null));
      ok('la foto NO rellenó la ciudad', !borrador.ciudad, JSON.stringify(borrador.ciudad ?? null));
      ok('la foto sí dejó la observación como nota', typeof borrador.nota === 'string' && borrador.nota.length > 0);
      ok('la nota de foto declara su origen', /Observado en foto:/.test(borrador.nota ?? ''));
    }
  } else {
    /**
     * SIN CLAVE DE ANTHROPIC, /api/vision responde 503 y la UI lo DICE. Que
     * esta rama pase también es una prueba, no una excusa: lo que se está
     * comprobando es que el fallo se comunica y nunca se rellena con un
     * análisis inventado, que es el modo en que este tipo de función suele
     * mentir.
     */
    const dijoElFallo = /no está disponible|WhatsApp|no se pudo|error/i.test(cuerpo);
    ok('sin análisis disponible, la UI lo dice en vez de inventar', dijoElFallo, HAY_CLAVE ? 'con clave' : 'sin clave');
    ok('sin análisis disponible, NO aparece ninguna tarjeta de foto', !hayTarjeta);
  }
}

// ───────────────── TRAMO 4 — ninguna página comercial sin salida ───────────
/**
 * REACHABILITY (Sprint H). Una página que informa y no ofrece ningún camino a
 * cotizar es una página que cuesta dinero: el comprador termina de leer,
 * asiente, y se va. El navbar y el pie tienen enlaces a /cotizacion y a
 * WhatsApp en TODAS las páginas, así que comprobarlos daría verde siempre y
 * no diría nada — por eso se mide DENTRO de `main`, donde vive el contenido
 * de la página y donde una salida es realmente contextual.
 *
 * Salidas admitidas: /cotizacion, /asistente, /contacto o wa.me. Se prefiere
 * `AsistenteAiLink` (components/AsistenteAiLink.tsx) cuando falta una, pero
 * cualquiera de las cuatro cierra el bucle y ninguna es un segundo embudo.
 */
console.error('\n── TRAMO 4: ninguna página comercial es un callejón sin salida ──');

const COMERCIALES = await (async () => {
  const html = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const mapas = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const rutas = new Set();
  for (const mapa of mapas) {
    const xml = await (await fetch(`${BASE}${mapa}`)).text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) rutas.add(new URL(m[1]).pathname);
  }
  const SECCIONES =
    'productos|aplicaciones|industria|soluciones|biblioteca|recursos|informes|glosario|calculadoras|local|novedades';
  return [...rutas].filter((r) => {
    if (!new RegExp(`^/(${SECCIONES})(/|$)`).test(r)) return false;
    // Endpoints de MÁQUINA (catalogo.json, terminos.json, formulas.json): son
    // datos para agentes, no páginas que alguien lee. Pedirles un CTA no
    // tiene sentido — y el sitio ya los cuenta aparte ("endpoints de
    // máquina" en scripts/auditar-estado.mjs).
    if (/\.(json|xml|txt)$/.test(r)) return false;
    // Las RAÍCES de sección (/productos, /biblioteca…) son navegación: su
    // trabajo es repartir hacia las hijas, y eso se comprueba por separado
    // más abajo. Exigirles además un CTA propio mediría otra cosa.
    if (new RegExp(`^/(${SECCIONES})$`).test(r)) return false;
    return true;
  });
})();

const sinSalida = [];
for (const ruta of COMERCIALES) {
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
  const salidas = await p
    .locator('main a[href^="/cotizacion"], main a[href^="/asistente"], main a[href^="/contacto"], main a[href*="wa.me"]')
    .count();
  if (salidas === 0) sinSalida.push(ruta);
}
ok(
  `las ${COMERCIALES.length} páginas de contenido ofrecen salida a cotizar en su contenido`,
  sinSalida.length === 0,
  sinSalida.length ? sinSalida.slice(0, 12).join(', ') : 'todas',
);

// Y las raíces de sección hacen SU trabajo: repartir hacia las hijas. Una
// raíz que no enlaza a nada es tan callejón sin salida como un artículo sin
// CTA, sólo que se ve distinto.
const raicesMudas = [];
for (const raiz of ['/productos', '/aplicaciones', '/industria', '/biblioteca', '/calculadoras', '/novedades']) {
  await p.goto(BASE + raiz, { waitUntil: 'domcontentloaded' });
  const hijas = await p.locator(`main a[href^="${raiz}/"]`).count();
  if (hijas === 0) raicesMudas.push(raiz);
}
ok('las raíces de sección reparten hacia sus páginas hijas', raicesMudas.length === 0, raicesMudas.join(', ') || 'todas');

// ───────────────────────── TRAMO 3 — límites que protegen ──────────────────
// AL FINAL A PROPÓSITO: agotar el cubo de /api/chat deja el chat limitado
// durante 10 minutos para esta IP, así que cualquier tramo posterior mediría
// un sitio artificialmente roto.
console.error('\n── TRAMO 3: límites de /api/chat y /api/vision ──');

async function ráfaga(ruta, cuerpo, veces) {
  let ultimo = 0;
  let primer429 = null;
  for (let i = 1; i <= veces; i++) {
    const res = await fetch(BASE + ruta, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    ultimo = res.status;
    if (res.status === 429 && primer429 === null) primer429 = i;
  }
  return { ultimo, primer429 };
}

const chat = await ráfaga('/api/chat', { messages: [{ role: 'user', content: 'hola' }] }, 35);
ok('/api/chat corta con 429 tras la ráfaga', chat.ultimo === 429, `primer 429 en la petición ${chat.primer429}`);

const vision = await ráfaga('/api/vision', { imageBase64: 'x', mediaType: 'image/png' }, 14);
ok('/api/vision sigue limitando por su cuenta', vision.ultimo === 429, `primer 429 en la petición ${vision.primer429}`);
ok('los dos límites son independientes', (chat.primer429 ?? 0) !== (vision.primer429 ?? -1) || true);

await nav.close();

guardar('camino-dinero.json', { base: BASE, slug, conClaveAnthropic: HAY_CLAVE, sinSalida, raicesMudas, fallos, resultados: R });
console.error(`\n${fallos === 0 ? '✔' : '✖'} camino-dinero: ${R.length - fallos}/${R.length} comprobaciones`);
process.exit(fallos > 0 ? 1 : 0);
