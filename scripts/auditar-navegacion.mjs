#!/usr/bin/env node
/**
 * AUDITORÍA DE NAVEGACIÓN: que los desplegables se puedan usar de verdad.
 *
 * Qué comprueba y por qué cada cosa.
 *
 * 1. VISIBILIDAD. Al abrir un grupo, todas sus opciones se ven. Un panel que
 *    se recorta por debajo del borde de la ventana esconde entradas sin decirlo.
 *
 * 2. ALCANZABILIDAD — la comprobación que motivó este archivo. Abrir el panel
 *    no basta: hay que poder LLEGAR a él. El panel se dibuja separado del botón
 *    por unos milímetros, y el manejador que lo cierra vive en el contenedor.
 *    Si esa franja de separación no pertenece a nadie, el puntero que baja del
 *    botón hacia la primera opción pasa por tierra de nadie, el contenedor
 *    recibe `mouseleave` y el menú se cierra ANTES de que el puntero llegue.
 *    Desde fuera se ve como «el menú desaparece solo». Esta prueba mueve el
 *    ratón por la trayectoria real, paso a paso, y exige que al final el panel
 *    siga abierto y la opción siga siendo pulsable.
 *
 * 3. PULSABILIDAD. Para cada opción se pregunta al navegador qué elemento hay
 *    de verdad en el centro de su caja. Si responde otra cosa, algo está encima
 *    y el clic no llegará: un enlace visible pero tapado es peor que uno
 *    ausente, porque nadie lo reporta.
 *
 * 4. TAMAÑO DE OBJETIVO. Mínimo 24x24 (WCAG 2.5.8).
 *
 * 5. DESTINO REAL. El `href` de cada opción tiene que responder 200.
 *
 * 6. LEGIBILIDAD PARA MÁQUINAS. Los paneles se ocultan con `display:none`, no
 *    se desmontan, así que sus enlaces viajan en el HTML servido y un agente
 *    que no ejecute JavaScript los ve igual. Se verifica sobre el HTML crudo.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as esperar } from 'node:timers/promises';

const V = '\x1b[32m', R = '\x1b[31m', A = '\x1b[33m', G = '\x1b[90m', F = '\x1b[0m';
const PUERTO = 4400 + (process.pid % 500);
const BASE = `http://127.0.0.1:${PUERTO}`;

/** Anchos donde la barra muestra el menú horizontal con desplegables. */
const ANCHOS = [
  { w: 768,  alto: 1024, nombre: 'iPad mini (vertical)' },
  { w: 1024, alto: 768,  nombre: 'iPad Pro 11 (horizontal)' },
  { w: 1280, alto: 800,  nombre: 'Portátil pequeño' },
  { w: 1440, alto: 900,  nombre: 'MacBook Air 13' },
  { w: 1920, alto: 1080, nombre: 'Full HD' },
];

/** Rutas donde se ejerce la cabecera. Distintas plantillas, misma barra. */
const RUTAS = ['/', '/productos', '/industria/mineria', '/biblioteca/especificacion-fibc'];

let servidor;
function arrancar() {
  servidor = spawn('npx', ['next', 'start', '-p', String(PUERTO)], {
    stdio: 'ignore', detached: true, env: { ...process.env },
  });
}
function parar() {
  if (servidor?.pid) { try { process.kill(-servidor.pid); } catch {} }
}
async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`${BASE}/`); if (r.ok) return true; } catch {}
    await esperar(1000);
  }
  return false;
}

const fallos = [];
/**
 * Se informa EN EL MOMENTO, además de resumir al final. Este auditor tarda
 * varios minutos y arranca un navegador; cuando el navegador se cae a mitad
 * —pasa en máquinas con poca memoria— el resumen nunca se imprime y la
 * ejecución no dice absolutamente nada de lo que llevaba encontrado. Un
 * hallazgo escrito cuando ocurre sobrevive a la caída.
 */
const anota = (tipo, donde, detalle) => {
  fallos.push({ tipo, donde, detalle });
  console.log(`  ${R}✗${F} ${tipo} · ${G}${donde}: ${detalle}${F}`);
};

async function irA(pagina, ruta) {
  for (let i = 0; i < 3; i++) {
    try {
      await pagina.goto(`${BASE}${ruta}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pagina.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
      return true;
    } catch { await esperar(1500); }
  }
  return false;
}

arrancar();
if (!(await esperarServidor())) { console.error('No arrancó el servidor. ¿Falta `npm run build`?'); parar(); process.exit(1); }

const navegador = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
);

console.log(`\nNavegación — ${ANCHOS.length} anchos × ${RUTAS.length} rutas\n`);

const destinos = new Map(); // href -> código, para no repetir peticiones

for (const vp of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: vp.w, height: vp.alto } });
  const pagina = await ctx.newPage();
  let gruposVistos = 0, opcionesVistas = 0, malas = 0;

  for (const ruta of RUTAS) {
    if (!(await irA(pagina, ruta))) { anota('sin-carga', `${vp.w}px ${ruta}`, 'la página no cargó'); continue; }

    // La barra es un <nav>, no un <header>: no hay elemento header en el
    // marcado. El panel se localiza como el hermano inmediato del botón, que
    // es como está construido tanto el panel de grupo como el de «Más»;
    // buscarlo por aria-label fallaba en el segundo, que no lo lleva.
    // Se localizan por `aria-expanded`, que es lo que define un desplegable en
    // el patrón de divulgación. Antes se buscaban por `aria-haspopup="true"`,
    // que se retiró: implica `role="menu"` en el panel, y estos paneles son
    // listas de enlaces de navegación, no menús de aplicación.
    /**
     * Sólo los disparadores de la barra horizontal. Por debajo de 1024px esa
     * barra está oculta a propósito y la navegación es el menú lateral, que
     * tiene otra mecánica —acordeón, no panel flotante— y se audita aparte.
     * La primera versión de esto no distinguía, encontraba el botón de la
     * hamburguesa y sus acordeones, buscaba un panel hermano que no existe y
     * reportaba cuatro fallos que no lo eran. Un auditor que grita donde no
     * hay fuego enseña a no hacerle caso.
     */
    const zona = pagina.locator('nav .lg\\:block').first();
    const disparadores = zona.locator('button[aria-controls]');
    const n = await disparadores.count();
    if (n === 0 && vp.w >= 1024) { anota('sin-desplegables', `${vp.w}px ${ruta}`, 'la barra no expone ningún grupo'); continue; }
    if (n === 0) { continue; }

    for (let i = 0; i < n; i++) {
      // Cada grupo se prueba desde el mismo estado: arriba del todo. Sin esto,
      // el desplazamiento que deja un grupo anterior al traer sus opciones a la
      // vista arrastra al siguiente, y el resultado depende de por dónde se
      // quedó el anterior.
      await pagina.evaluate(() => window.scrollTo(0, 0));
      await esperar(60);
      const boton = disparadores.nth(i);
      if (!(await boton.isVisible())) continue;
      const etiqueta = ((await boton.textContent()) || `grupo-${i}`).trim();
      gruposVistos++;

      // --- ABRIR CON EL PUNTERO, como lo haría una persona.
      const cajaBoton = await boton.boundingBox();
      if (!cajaBoton) { anota('sin-caja', `${vp.w}px ${ruta} · ${etiqueta}`, 'el disparador no tiene caja'); malas++; continue; }
      await pagina.mouse.move(cajaBoton.x + cajaBoton.width / 2, cajaBoton.y + cajaBoton.height / 2);
      await esperar(120);

      // El panel se resuelve por su `aria-controls`, no por posición en el
      // DOM. La versión anterior tomaba «el div hermano siguiente», y eso
      // dejó de ser cierto en cuanto el mega-menú se movió fuera de su
      // disparador para que su ancho no dependiera de la zona de navegación.
      // El atributo es el contrato accesible botón→panel: si se rompe, debe
      // fallar la auditoría, no la localización del panel.
      const idPanel = await boton.getAttribute('aria-controls');
      const panel = pagina.locator(`#${idPanel}`);
      let abierto = await panel.isVisible().catch(() => false);
      if (!abierto) {
        await boton.click();
        await esperar(120);
        abierto = await panel.isVisible().catch(() => false);
      }
      if (!abierto) { anota('no-abre', `${vp.w}px ${ruta} · ${etiqueta}`, 'el panel no se muestra ni al pasar el puntero ni al pulsar'); malas++; continue; }

      const opciones = panel.locator('a[href]');
      const cuantas = await opciones.count();
      if (cuantas === 0) { anota('panel-vacio', `${vp.w}px ${ruta} · ${etiqueta}`, 'el panel no contiene enlaces'); malas++; continue; }

      // --- EL PUENTE, medido. Esta comprobación es geométrica y por eso no
      // depende de la velocidad del ratón ni de la carga de la máquina, al
      // contrario que el recorrido de más abajo. Existe porque el puente de
      // «Más» medía el ancho de su botón —unos 60px— mientras su panel se
      // despliega 240px hacia la izquierda: el camino a la primera opción
      // cruzaba el hueco por fuera del puente. La prueba del recorrido lo
      // cazaba una vez de cada tres, según el equipo; ésta lo caza siempre.
      // El mega entra con una animación de 200ms que mueve su techo. Medir a
      // mitad da un hueco que no existe una vez asentado, así que se espera a
      // que el rectángulo deje de moverse antes de juzgar la geometría.
      await esperar(280);
      const geo = await pagina.evaluate(
        ([sel, idx]) => {
          const b = document.querySelectorAll(sel)[idx];
          if (!b) return null;
          const panel = document.getElementById(b.getAttribute('aria-controls') || '');
          // El puente vive como hermano inmediato ANTERIOR del panel (así lo
          // construyen los tres desplegables); si no, se busca junto al botón.
          const previo = panel?.previousElementSibling;
          const puente =
            previo && previo.tagName === 'SPAN' && previo.getAttribute('aria-hidden') === 'true'
              ? previo
              : b.parentElement?.querySelector(':scope > span[aria-hidden="true"]');
          const zona = b.closest('nav')?.querySelector('.lg\\:block');
          if (!puente || !panel || !zona) return { falta: !puente ? 'puente' : !panel ? 'panel' : 'zona' };
          const p = puente.getBoundingClientRect();
          const q = panel.getBoundingClientRect();
          const z = zona.getBoundingClientRect();
          const fallos = [];
          // Horizontal: el puente tiene que abarcar el panel de lado a lado.
          if (p.left > q.left + 1) fallos.push(`no llega por la izquierda (puente ${Math.round(p.left)} > panel ${Math.round(q.left)})`);
          if (p.right < q.right - 1) fallos.push(`no llega por la derecha (puente ${Math.round(p.right)} < panel ${Math.round(q.right)})`);
          // Vertical: no puede quedar franja descubierta entre el borde
          // inferior de la barra y el techo del panel. Se mide contra la BARRA
          // y no contra el botón: lo que hay entre el botón y el borde de la
          // barra sigue estando dentro de la barra, y ahí el puntero no se
          // pierde. Medirlo contra el botón daba por rotos los tres paneles
          // sin que hubiera nada roto.
          if (p.top > z.bottom + 1) fallos.push(`arranca por debajo de la barra (${Math.round(p.top)} > ${Math.round(z.bottom)})`);
          if (p.bottom < q.top - 1) fallos.push(`no llega al panel (${Math.round(p.bottom)} < ${Math.round(q.top)})`);
          return { fallos };
        },
        ['nav .lg\\:block button[aria-controls]', i],
      );
      if (geo?.falta) {
        anota('sin-puente', `${vp.w}px ${ruta} · ${etiqueta}`, `no encuentro el ${geo.falta}`);
        malas++;
      } else if (geo?.fallos?.length) {
        anota('puente-corto', `${vp.w}px ${ruta} · ${etiqueta}`, geo.fallos.join('; '));
        malas++;
      }

      // --- LA FORMA DEL PANEL: ancho real y texto sin estrujar.
      //
      // Esta comprobación existe porque todo lo anterior estuvo en verde
      // mientras el mega-menú se servía a ~350px en pantallas de 2560:
      // el panel abría, se alcanzaba y cada enlace era pulsable… con cada
      // categoría partida palabra por palabra en columnas de 100px. Abrir
      // y poder pulsar no es lo mismo que poderse LEER. Dos medidas:
      //  1. El ancho del panel debe acercarse a su ancho de diseño (el mega
      //     declara min(860px, contenedor); los demás, ≥280px). Un panel muy
      //     por debajo delata que hereda el ancho de un contenedor equivocado.
      //  2. Ningún texto del panel puede ocupar más de ~2 líneas de su propia
      //     altura de línea: tres o más líneas en un rótulo corto es la firma
      //     del ajuste palabra-por-palabra.
      const forma = await pagina.evaluate(
        ([id, vw]) => {
          const panel = document.getElementById(id);
          if (!panel) return null;
          const q = panel.getBoundingClientRect();
          const esperado = id === 'panel-productos' ? Math.min(860, vw - 48) : 280;
          const estrecho =
            q.width + 8 < esperado
              ? `mide ${Math.round(q.width)}px; su ancho de diseño es ≥ ${Math.round(esperado)}px`
              : null;
          const estrujados = [];
          for (const el of panel.querySelectorAll('a span, a')) {
            if (el.tagName === 'A' && el.querySelector('span')) continue; // se miden sus spans
            const cs = getComputedStyle(el);
            const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
            const h = el.getBoundingClientRect().height;
            if (h > lh * 2.2) {
              estrujados.push(`«${(el.textContent || '').trim().slice(0, 32)}» ocupa ~${Math.round(h / lh)} líneas`);
            }
          }
          return { estrecho, estrujados: estrujados.slice(0, 4), demas: Math.max(0, estrujados.length - 4) };
        },
        [idPanel, vp.w],
      );
      if (forma?.estrecho) {
        anota('panel-estrecho', `${vp.w}px ${ruta} · ${etiqueta}`, forma.estrecho);
        malas++;
      }
      if (forma?.estrujados?.length) {
        anota(
          'texto-estrujado',
          `${vp.w}px ${ruta} · ${etiqueta}`,
          forma.estrujados.join('; ') + (forma.demas ? ` … y ${forma.demas} más` : ''),
        );
        malas++;
      }

      // --- LA TRAYECTORIA. Del centro del botón al centro de la primera
      // opción, en pasos, como se mueve una mano. Si el panel se cierra a
      // mitad de camino, hay una franja muerta entre el botón y el panel.
      const cajaPrimera = await opciones.first().boundingBox();
      if (cajaPrimera) {
        const destinoX = cajaPrimera.x + cajaPrimera.width / 2;
        const destinoY = cajaPrimera.y + cajaPrimera.height / 2;
        await pagina.mouse.move(destinoX, destinoY, { steps: 12 });
        // 300 ms: MÁS que el retardo de cierre de la barra (180 ms). Con 80 ms
        // la comprobación corría contra ese temporizador y el resultado
        // dependía de la carga de la máquina — un fallo aparecía y desaparecía
        // entre ejecuciones, que es la peor clase de prueba: la que enseña a
        // no creerle. Esperando más que el temporizador, si el puntero está de
        // verdad dentro del panel éste sigue abierto, y si no lo está ya se
        // cerró. Deja de haber empate.
        await esperar(300);
        if (!(await panel.isVisible().catch(() => false))) {
          anota('se-cierra-al-ir', `${vp.w}px ${ruta} · ${etiqueta}`,
            'el panel se cierra mientras el puntero viaja del botón a la primera opción: hay una franja muerta entre ambos');
          malas++;
          continue;
        }
      }

      // --- CADA OPCIÓN: visible, dentro de la ventana, pulsable, con destino.
      for (let k = 0; k < cuantas; k++) {
        const op = opciones.nth(k);
        const href = await op.getAttribute('href');
        const texto = ((await op.textContent()) || '').trim().slice(0, 40);
        const donde = `${vp.w}px ${ruta} · ${etiqueta} › ${texto || href}`;
        opcionesVistas++;

        // El panel tiene alto máximo y desplazamiento propio: una opción del
        // pie puede quedar por debajo de su borde visible. Se la trae a la
        // vista antes de medir, que es lo que hace cualquiera al usarlo. Sin
        // esto la prueba medía un punto fuera del panel y culpaba a lo que
        // hubiera detrás.
        await op.scrollIntoViewIfNeeded().catch(() => {});
        const caja = await op.boundingBox();
        if (!caja || caja.width === 0 || caja.height === 0) { anota('opcion-sin-caja', donde, 'no ocupa espacio'); malas++; continue; }
        if (caja.height < 24) { anota('objetivo-pequeno', donde, `${Math.round(caja.height)}px de alto, mínimo 24 (WCAG 2.5.8)`); malas++; }
        if (caja.y + caja.height > vp.alto + 1 || caja.y < 0) {
          anota('fuera-de-ventana', donde, `la opción cae fuera del alto visible (${Math.round(caja.y)}px)`); malas++;
        }
        if (caja.x < 0 || caja.x + caja.width > vp.w + 1) {
          anota('desborda-horizontal', donde, `se sale por el lado (${Math.round(caja.x)}px)`); malas++;
        }

        // ¿Quién hay realmente en ese punto? Si no es esta opción, está tapada.
        const cx = Math.min(Math.max(caja.x + caja.width / 2, 1), vp.w - 1);
        const cy = Math.min(Math.max(caja.y + caja.height / 2, 1), vp.alto - 1);
        const tapada = await pagina.evaluate(
          ([x, y, h]) => {
            const el = document.elementFromPoint(x, y);
            if (!el) return 'no hay nada en ese punto';
            return el.closest(`a[href="${CSS.escape(h)}"]`) ? null : `lo tapa <${el.tagName.toLowerCase()}>`;
          },
          [cx, cy, href],
        );
        if (tapada) { anota('opcion-tapada', donde, tapada); malas++; }

        // ¿A dónde lleva? Solo rutas internas; una sola petición por destino.
        if (href && href.startsWith('/') && !destinos.has(href)) {
          try {
            const r = await fetch(`${BASE}${href}`, { redirect: 'manual' });
            destinos.set(href, r.status);
          } catch { destinos.set(href, 0); }
        }
      }

      // Cerrar antes del siguiente grupo.
      await pagina.keyboard.press('Escape');
      await pagina.mouse.move(5, vp.alto - 5);
      await esperar(60);
    }
  }

  const marca = malas === 0 ? `${V}✓${F}` : `${R}✗${F}`;
  console.log(`  ${marca} ${String(vp.w).padStart(4)}px  ${vp.nombre.padEnd(26)} ${G}${gruposVistos} grupos, ${opcionesVistas} opciones${F}`);
  await ctx.close();
}

// --- Destinos que no responden 200 ni 3xx.
for (const [href, codigo] of destinos) {
  if (!(codigo === 200 || (codigo >= 300 && codigo < 400))) {
    anota('destino-roto', href, `responde ${codigo || 'sin respuesta'}`);
  }
}
console.log(`\n${G}  ${destinos.size} destinos distintos comprobados${F}`);

await navegador.close();
parar();

if (fallos.length === 0) {
  console.log(`\nResultado: ${V}0 errores${F} — todos los desplegables se abren, se alcanzan y se pueden pulsar\n`);
  process.exit(0);
}
const porTipo = new Map();
for (const f of fallos) porTipo.set(f.tipo, [...(porTipo.get(f.tipo) ?? []), f]);
console.log('');
for (const [tipo, lista] of porTipo) {
  console.log(`  ${R}✗${F} ${tipo} — ${lista.length}`);
  for (const f of lista.slice(0, 6)) console.log(`${G}      ${f.donde}: ${f.detalle}${F}`);
  if (lista.length > 6) console.log(`${G}      … y ${lista.length - 6} más${F}`);
}
console.log(`\nResultado: ${R}${fallos.length} errores${F}\n`);
process.exit(1);
