/**
 * ARNÉS DE DIAGNÓSTICO DE NAVEGADOR.
 *
 * Por qué existe, además de las 747 pruebas de vitest: esas pruebas leen
 * archivos y llaman funciones. NO abren un navegador, así que no pueden ver
 * un desborde horizontal en un teléfono, un botón sin nombre accesible, un
 * contraste de 1.16:1 en modo oscuro, un enlace interno roto ni una barra
 * flotante tapando los avisos legales. Todo eso existía y ninguna prueba
 * fallaba. Este arné mide la página RENDERIZADA, que es la que ve el
 * comprador.
 *
 * Uso: `npm run diagnostico`, y ya está.
 *
 * Las instrucciones anteriores eran éstas, y son una trampa:
 *
 *     npm run build && npx next start -p 4000 &
 *     npm run diagnostico
 *
 * El `&` manda al fondo la cadena ENTERA, así que el diagnóstico arranca
 * mientras `next build` todavía compila y pide páginas a un servidor que no
 * existe. Ahora `scripts/diagnostico.sh` compila si hace falta, levanta el
 * sitio, ESPERA a que conteste, mide y lo apaga pase lo que pase.
 *
 * La salida (JSON y capturas) va a .diagnostico/, que está ignorado.
 */
const BASE = process.env.DIAG_BASE || 'http://localhost:4000';

export async function todasLasRutas() {
  const indice = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const hijos = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const rutas = new Set();
  for (const h of hijos) {
    const path = new URL(h).pathname;
    const xml = await (await fetch(`${BASE}${path}`)).text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      rutas.add(new URL(m[1]).pathname);
    }
  }
  return [...rutas].sort();
}

/** Una ruta por PLANTILLA: el conjunto que recibe la auditoría completa. */
export const REPRESENTATIVAS = [
  '/',                                        // portada
  '/productos',                               // catálogo con filtros
  '/productos/big-bags-bolsones-polipropileno', // ficha
  '/productos/familia/envases-embalaje',      // familia
  '/productos/familia/envases-embalaje/comparar', // tabla ancha
  '/big-bags',                                // cuña ES
  '/lonas-camiones',
  '/ventilacion-minera',
  '/fabricar-o-importar',                     // tabla de 13 filas × 4 col
  '/cotizacion',                              // formulario RFQ
  '/contacto',
  '/industria/mineria',
  '/local/lima',
  '/biblioteca/especificacion-fibc',
  '/calculadoras/big-bags-por-viaje',         // interactiva
  '/indicadores',                             // datos en vivo
  '/glosario',
  '/glosario/big-bag-fibc',
  '/informes/formacion-de-precio-y-volatilidad-textiles-industriales',
  '/novedades',
  '/recursos/instalacion-geomembranas-hdpe-pozas-canales',
  '/aplicaciones/toldos-camion',
  '/soluciones/frente-avance-ventilado',
  '/confianza',
  '/compras',
  '/exportacion',
  '/marco/evaluacion',                        // formulario largo
  '/configurador',                            // interactivo
  '/descargas',
  '/carrito',
  '/servicios',
  '/nosotros',
  '/en',                                      // grupo inglés
  '/en/sourcing-from-peru',
  '/en/fibc-big-bags-peru',
  '/en/manufacture-in-peru-or-import',
  '/en/rfq',
  '/pt',
  '/no-existe-esta-pagina-404',               // 404
];

export const VIEWPORTS = [
  { nombre: 'iphone-se',   width: 375, height: 667, movil: true,  dpr: 2 },
  { nombre: 'iphone-14',   width: 390, height: 844, movil: true,  dpr: 3 },
  { nombre: 'android',     width: 360, height: 800, movil: true,  dpr: 3 },
  { nombre: 'tablet',      width: 768, height: 1024, movil: true, dpr: 2 },
  { nombre: 'laptop',      width: 1280, height: 800, movil: false, dpr: 1 },
  { nombre: 'desktop',     width: 1440, height: 900, movil: false, dpr: 1 },
];

export { BASE };

/**
 * DÓNDE ESTÁ CHROMIUM — buscado, no supuesto.
 *
 * Esta línea decía una sola ruta absoluta:
 * `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Era el Chromium
 * preinstalado de UN contenedor concreto, y funcionó mientras ese contenedor
 * existió. Fuera de él —en un Codespace, en el portátil de cualquiera, en CI—
 * el arné entero moría con este mensaje:
 *
 *   browserType.launch: Failed to launch chromium because executable doesn't
 *   exist at /opt/pw-browsers/chromium-1194/chrome-linux/chrome
 *
 * Que no dice qué hacer. Y la consecuencia es peor que un error feo: el ÚNICO
 * instrumento de este repositorio que mide la página renderizada —desborde
 * horizontal, objetivos táctiles reales, contraste, enlaces rotos— dejó de
 * poder ejecutarse en ninguna máquina. Las 902 pruebas leen archivos; esto es
 * lo que abre un navegador, y estaba apagado sin que nada lo dijera.
 *
 * Ahora se busca en orden, y lo primero que exista gana:
 *
 *   1. `DIAG_CHROME` — quien sabe dónde está lo dice y se acabó la discusión.
 *   2. El que Playwright haya instalado en esta máquina (`executablePath()`),
 *      que es el caso normal después de `npx playwright install chromium`.
 *   3. Rutas de contenedores preaprovisionados, la del sandbox incluida.
 *   4. El Chromium o el Chrome del sistema.
 *
 * Y si no hay ninguno, el error dice el comando exacto que lo arregla.
 */

import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CANDIDATOS = () => [
  process.env.DIAG_CHROME,
  (() => {
    try {
      return chromium.executablePath();
    } catch {
      return null;
    }
  })(),
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
].filter(Boolean);

export function buscarChrome() {
  return CANDIDATOS().find((ruta) => existsSync(ruta)) ?? null;
}

export const CHROME = buscarChrome();

/**
 * Los argumentos no son opcionales: sin `--no-sandbox` Chromium no arranca
 * dentro de un contenedor sin privilegios, y sin `--disable-dev-shm-usage` se
 * queda sin memoria compartida en mitad de una captura.
 */
export const ARGS = ['--no-sandbox', '--disable-dev-shm-usage'];

export const LANZAR = CHROME ? { executablePath: CHROME, args: ARGS } : { args: ARGS };

/**
 * Lo que usan los seis scripts. Falla con el comando exacto en vez de con una
 * ruta que a nadie le dice nada.
 */
export async function lanzarNavegador() {
  try {
    return await chromium.launch(LANZAR);
  } catch (e) {
    const detalle = e instanceof Error ? e.message.split('\n')[0] : String(e);
    throw new Error(
      [
        'No se pudo abrir Chromium para el diagnóstico.',
        '',
        `  Detalle: ${detalle}`,
        `  Buscado en: ${CANDIDATOS().join('\n              ')}`,
        '',
        '  Instálelo con:   npx playwright install chromium',
        '  O indique el suyo:   DIAG_CHROME=/ruta/a/chrome npm run diagnostico',
      ].join('\n'),
    );
  }
}
