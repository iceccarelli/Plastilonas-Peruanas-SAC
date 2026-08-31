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
 * Uso: levantar el sitio compilado en el puerto 4000 y `npm run diagnostico`.
 *   npm run build && npx next start -p 4000 &
 *   npm run diagnostico
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

/** El Chromium preinstalado del contenedor; la versión fijada de playwright
 *  espera otra revisión y descargarla no es posible aquí. */
export const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const LANZAR = { executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] };
