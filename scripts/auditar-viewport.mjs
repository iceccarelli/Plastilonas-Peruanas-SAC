#!/usr/bin/env node
/**
 * AUDITORÍA DE VIEWPORT — mide, no supone.
 *
 * Levanta el build de producción y abre cada ruta en una matriz de anchos de
 * dispositivo reales, midiendo con el motor de layout de Chromium:
 *
 *   · desbordamiento horizontal (scrollWidth > clientWidth)
 *   · qué elemento concreto lo causa
 *   · áreas táctiles por debajo del mínimo accesible
 *   · elementos recortados por el borde del viewport
 *
 * Un breakpoint elegido a ojo («a partir de lg caben los enlaces») es una
 * suposición. Esto es la medición que la reemplaza.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

/** Anchos reales, no redondeos bonitos. El más estrecho manda. */
const DISPOSITIVOS = [
  { nombre: 'Galaxy Fold (cerrado)',     ancho: 280,  alto: 653,  dpr: 3,   movil: true },
  { nombre: 'iPhone SE / 5s',            ancho: 320,  alto: 568,  dpr: 2,   movil: true },
  { nombre: 'iPhone SE 2/3, 8',          ancho: 375,  alto: 667,  dpr: 2,   movil: true },
  { nombre: 'iPhone 12/13/14 mini',      ancho: 375,  alto: 812,  dpr: 3,   movil: true },
  { nombre: 'iPhone 14/15/16',           ancho: 393,  alto: 852,  dpr: 3,   movil: true },
  { nombre: 'iPhone 15/16 Pro Max',      ancho: 430,  alto: 932,  dpr: 3,   movil: true },
  { nombre: 'Galaxy S8+ / Android común',ancho: 360,  alto: 740,  dpr: 3,   movil: true },
  { nombre: 'Pixel 7',                   ancho: 412,  alto: 915,  dpr: 2.6, movil: true },
  { nombre: 'iPad mini (vertical)',      ancho: 768,  alto: 1024, dpr: 2,   movil: true },
  { nombre: 'iPad Air (vertical)',       ancho: 820,  alto: 1180, dpr: 2,   movil: true },
  { nombre: 'iPad Pro 11 (horizontal)',  ancho: 1024, alto: 768,  dpr: 2,   movil: true },
  { nombre: 'Portátil pequeño',          ancho: 1280, alto: 800,  dpr: 1,   movil: false },
  { nombre: 'Portátil 1366',             ancho: 1366, alto: 768,  dpr: 1,   movil: false },
  { nombre: 'MacBook Air 13',            ancho: 1440, alto: 900,  dpr: 2,   movil: false },
  { nombre: 'Escritorio 1536',           ancho: 1536, alto: 864,  dpr: 1,   movil: false },
  { nombre: 'Full HD',                   ancho: 1920, alto: 1080, dpr: 1,   movil: false },
  { nombre: 'QHD ultraancho',            ancho: 2560, alto: 1440, dpr: 1,   movil: false },
];

const RUTAS = process.env.RUTAS_AUDITORIA
  ? process.env.RUTAS_AUDITORIA.split(',')
  : ['/', '/productos', '/industria/mineria', '/cotizacion', '/glosario', '/contacto'];

/** WCAG 2.5.8 pide 24×24 CSS px; las guías de iOS y Android piden ~44. */
const TACTIL_MINIMO = 24;

// Puerto distinto por ejecución. Un puerto fijo hacía que, si una ejecución
// anterior dejaba el servidor vivo, la siguiente midiera contra el BUILD VIEJO
// sin avisar: dos cambios seguidos de código daban exactamente los mismos
// números y parecía que nada surtía efecto.
const PUERTO = 4400 + (process.pid % 500);
const BASE = `http://127.0.0.1:${PUERTO}`;

function arrancarServidor() {
  // `detached` crea un grupo de procesos propio. `next start` lanza a su vez
  // next-server: matar solo al hijo directo dejaba huérfano al que escucha.
  return spawn('npx', ['next', 'start', '-p', String(PUERTO)], {
    stdio: 'ignore',
    detached: true,
    env: { ...process.env, NODE_ENV: 'production' },
  });
}

function pararServidor(p) {
  try { process.kill(-p.pid, 'SIGKILL'); } catch { try { p.kill('SIGKILL'); } catch {} }
}

async function esperarServidor(intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
      if (r.ok) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

/** Se ejecuta DENTRO del navegador: usa el layout real, no una heurística. */
function medirEnPagina(tactilMinimo) {
  const doc = document.documentElement;
  const anchoVista = doc.clientWidth;
  const hallazgos = [];

  /**
   * ¿Lo ve una persona? Un panel desplegable cerrado, una fila de medida o un
   * elemento con opacidad cero siguen existiendo en el DOM y siguen teniendo
   * caja. Contarlos como «recortado» convierte la auditoría en ruido: informa
   * de problemas que nadie puede ver y esconde los que sí.
   */
  const visible = (el) => {
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    }
    if (el.closest('[aria-hidden="true"]')) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const e = getComputedStyle(n);
      if (e.display === 'none' || e.visibility === 'hidden' || Number(e.opacity) === 0) return false;
    }
    return true;
  };

  /** Dónde vive el elemento, para no confundir el pie con la cabecera. */
  const zona = (el) => {
    if (el.closest('header, [class*="fixed top-0"]') || el.closest('nav')) return 'cabecera';
    if (el.closest('footer')) return 'pie';
    return 'cuerpo';
  };

  // 1) ¿Se puede arrastrar la página a los lados? Es el síntoma que ve el usuario.
  const desbordaDocumento = doc.scrollWidth - anchoVista;
  if (desbordaDocumento > 1) {
    // Localizar al culpable: el elemento cuyo borde derecho se sale más.
    // Se busca primero entre lo visible —es lo que sufre el usuario— y, si no
    // aparece nada, se repite sin filtro: un elemento oculto que aun así
    // empuja el ancho de scroll es un fallo igual de real, solo que invisible,
    // y sin esta segunda pasada el informe diría «desborda» sin culpable.
    const buscarPeor = (soloVisibles) => {
      let peor = null;
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (soloVisibles && !visible(el)) continue;
        const exceso = Math.round(r.right - anchoVista);
        if (exceso > 1 && (!peor || exceso > peor.exceso)) {
          const est = getComputedStyle(el);
          peor = {
            exceso,
            etiqueta: el.tagName.toLowerCase(),
            clases: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 110),
            texto: (el.textContent || '').trim().slice(0, 45),
            oculto: !soloVisibles,
            estilo: `${est.display}/${est.position}/ovf:${est.overflowX}`,
          };
        }
      }
      return peor;
    };
    const peor = buscarPeor(true) || buscarPeor(false);
    hallazgos.push({ tipo: 'desborde-horizontal', px: desbordaDocumento, culpable: peor });
  }

  // 2) Elementos recortados por el borde derecho aunque el documento no
  //    desborde: overflow:hidden esconde el problema pero el enlace ya no se ve.
  for (const el of document.querySelectorAll('nav a, nav button, header a, header button')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (!visible(el)) continue;
    if (r.left >= anchoVista - 2 || r.right > anchoVista + 2) {
      hallazgos.push({
        tipo: 'recortado-en-cabecera',
        texto: (el.textContent || '').trim().slice(0, 40),
        izq: Math.round(r.left), der: Math.round(r.right), vista: anchoVista,
      });
    }
  }

  // 3) Áreas táctiles. Solo lo visible e interactivo.
  const vistos = new Set();
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.top > innerHeight || r.bottom < 0) continue;
    if (!visible(el)) continue;
    // Un enlace dentro de un párrafo no es un área táctil de control.
    if (el.tagName === 'A' && el.closest('p, li')) continue;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w < tactilMinimo || h < tactilMinimo) {
      const clave = `${el.tagName}:${(el.textContent || '').trim().slice(0, 24)}:${w}x${h}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      hallazgos.push({
        tipo: 'area-tactil-pequena',
        texto: (el.textContent || '').trim().slice(0, 32) || el.getAttribute('aria-label') || el.tagName,
        medida: `${w}×${h}`,
        zona: zona(el),
      });
    }
  }

  return { anchoVista, hallazgos };
}

const servidor = arrancarServidor();
const limpiar = () => pararServidor(servidor);
process.on('exit', limpiar);
process.on('SIGINT', () => { limpiar(); process.exit(130); });
process.on('SIGTERM', () => { limpiar(); process.exit(143); });

if (!(await esperarServidor())) {
  console.error('No arrancó el servidor de producción. ¿Falta `npm run build`?');
  pararServidor(servidor);
  process.exit(1);
}

// En CI/Codespaces Playwright resuelve su propio Chromium. En entornos donde ya
// hay uno instalado (PLAYWRIGHT_CHROMIUM), se respeta el que exista.
const ejecutable = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const navegador = await chromium.launch(ejecutable ? { executablePath: ejecutable } : {});
let totalDesbordes = 0, totalRecortes = 0, totalTactiles = 0;
const informe = [];

for (const d of DISPOSITIVOS) {
  const ctx = await navegador.newContext({
    viewport: { width: d.ancho, height: d.alto },
    deviceScaleFactor: d.dpr,
    isMobile: d.movil,
    hasTouch: d.movil,
  });
  const pagina = await ctx.newPage();

  // El sitio pide fuentes, analítica y push a terceros. En una medición de
  // layout esas peticiones solo añaden latencia y ruido —y en un runner sin
  // salida a internet, cuelgan—. Se cortan: no afectan a la geometría.
  await pagina.route('**/*', (ruta) => {
    const u = new URL(ruta.request().url());
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return ruta.continue();
    return ruta.abort();
  });

  const porDispositivo = [];

  for (const ruta of RUTAS) {
    // `load`, no `domcontentloaded`: el hero lleva fotografías y un carrusel;
    // medir antes de que tengan tamaño da lecturas fantasma.
    await pagina.goto(BASE + ruta, { waitUntil: 'load', timeout: 60000 });
    await pagina.evaluate(() => {
      delete window.__lecturas;
      return document.fonts ? document.fonts.ready.catch(() => {}) : null;
    });
    // Se espera a que el layout se ESTABILICE, no a que termine la red.
    //
    // Medir justo después de domcontentloaded da lecturas falsas: React aún no
    // ha hidratado, los carruseles no han recortado su pista y el ancho de
    // scroll todavía se mueve. Una primera versión de este script informó de
    // desbordes de 106px que no existían, por medir en ese hueco.
    //
    // El criterio es empírico y se calibró contra un falso positivo real: una
    // versión anterior informaba de un desborde de 106px en Full HD que no
    // existía pasados cuatro segundos. Ocho lecturas idénticas separadas 200ms
    // —1,6 s de quietud— cubren la hidratación, la carga de imágenes del hero
    // y el arranque del carrusel. Si en 20s no se estabiliza, se mide igual.
    await pagina.waitForFunction(
      () => {
        const w = document.documentElement.scrollWidth;
        const g = window;
        g.__lecturas = (g.__lecturas || []).concat(w).slice(-8);
        return g.__lecturas.length === 8 && g.__lecturas.every((x) => x === w);
      },
      null,
      { timeout: 20000, polling: 200 },
    ).catch(() => {});
    const { hallazgos } = await pagina.evaluate(medirEnPagina, TACTIL_MINIMO);
    for (const h of hallazgos) porDispositivo.push({ ruta, ...h });
  }

  await ctx.close();

  const desbordes = porDispositivo.filter((h) => h.tipo === 'desborde-horizontal');
  const recortes = porDispositivo.filter((h) => h.tipo === 'recortado-en-cabecera');
  const tactiles = porDispositivo.filter((h) => h.tipo === 'area-tactil-pequena');
  totalDesbordes += desbordes.length;
  totalRecortes += recortes.length;
  totalTactiles += tactiles.length;

  informe.push({ d, desbordes, recortes, tactiles });
}

await navegador.close();
pararServidor(servidor);

const V = '\x1b[32m', R = '\x1b[31m', A = '\x1b[33m', G = '\x1b[90m', F = '\x1b[0m';
console.log(`\nViewport — ${DISPOSITIVOS.length} dispositivos × ${RUTAS.length} rutas\n`);

for (const { d, desbordes, recortes, tactiles } of informe) {
  // El aviso táctil no rompe el despliegue; el recorte y el desborde sí.
  // Marcarlos igual haría que 73 avisos parecieran 73 fallos.
  const falla = desbordes.length > 0 || recortes.length > 0;
  const marca = falla ? `${R}✗${F}` : tactiles.length ? `${A}!${F}` : `${V}✓${F}`;
  console.log(`  ${marca} ${String(d.ancho).padStart(4)}px  ${d.nombre}`);
  for (const h of desbordes) {
    console.log(`${R}      desborda ${h.px}px en ${h.ruta}${F}`);
    if (h.culpable) console.log(`${G}        culpable: <${h.culpable.etiqueta}> .${h.culpable.clases.split(' ')[0]} «${h.culpable.texto}» +${h.culpable.exceso}px [${h.culpable.estilo}]${h.culpable.oculto ? ' (oculto)' : ''}${F}`);
    else console.log(`${G}        sin elemento identificable — revisar manualmente${F}`);
  }
  for (const h of recortes.slice(0, 4)) {
    console.log(`${R}      recortado en cabecera: «${h.texto}» (der ${h.der} > vista ${h.vista}) en ${h.ruta}${F}`);
  }
  if (recortes.length > 4) console.log(`${G}      … y ${recortes.length - 4} recortes más${F}`);
  for (const h of tactiles.slice(0, 3)) {
    console.log(`${A}      área táctil ${h.medida} < ${TACTIL_MINIMO}px: «${h.texto}» [${h.zona}] en ${h.ruta}${F}`);
  }
  if (tactiles.length > 3) console.log(`${G}      … y ${tactiles.length - 3} áreas más${F}`);
}

const errores = totalDesbordes + totalRecortes;
console.log(
  `\nResultado: ${errores ? R : V}${errores} errores${F} ` +
  `(${totalDesbordes} desbordes, ${totalRecortes} recortes), ` +
  `${totalTactiles ? A : V}${totalTactiles} avisos táctiles${F}\n`,
);
process.exit(errores > 0 ? 1 : 0);
