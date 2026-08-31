/**
 * DIAGNÓSTICO 2 — ¿FUNCIONA LO QUE SE TOCA?
 *
 * No mira el HTML: abre el navegador, toca el control y comprueba que el
 * estado del DOM cambió. Un botón que renderiza y no hace nada pasa todas las
 * pruebas de este repositorio menos ésta.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { BASE, LANZAR } from './rutas.mjs';

const R = [];
const ok = (nombre, pasa, detalle = '') => {
  R.push({ nombre, pasa, detalle });
  console.error(`  ${pasa ? '✓' : '✗'} ${nombre}${detalle ? ' — ' + detalle : ''}`);
};

const nav = await chromium.launch(LANZAR);

/* ─────────────── MÓVIL 390×844 ─────────────── */
const movil = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
let p = await movil.newPage();
await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);

// 1. Menú móvil
try {
  const antes = await p.locator('nav a:visible, [role="dialog"] a:visible').count();
  await p.getByRole('button', { name: /abrir menú/i }).click();
  await p.waitForTimeout(450);
  const despues = await p.locator('a:visible').count();
  const cierra = await p.getByRole('button', { name: /cerrar menú|abrir menú/i }).count();
  ok('menú móvil abre y muestra enlaces', despues > antes, `${antes} → ${despues} enlaces visibles`);
  ok('menú móvil ofrece cierre', cierra > 0);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(350);
} catch (e) { ok('menú móvil abre y muestra enlaces', false, String(e).slice(0, 120)); }

// 2. Buscador / paleta de comandos
try {
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  await p.getByRole('button', { name: /buscar productos/i }).click();
  await p.waitForTimeout(500);
  const campo = p.locator('input[type="text"]:visible, input[type="search"]:visible, [role="combobox"]:visible').first();
  const abrio = await campo.count() > 0;
  ok('buscador abre un campo enfocable', abrio);
  if (abrio) {
    await campo.fill('big bag');
    await p.waitForTimeout(700);
    const res = await p.locator('[role="option"]:visible, [role="listbox"] a:visible, li a:visible').count();
    ok('buscador devuelve resultados para «big bag»', res > 0, `${res} resultados`);
  }
  await p.keyboard.press('Escape');
} catch (e) { ok('buscador abre un campo enfocable', false, String(e).slice(0, 120)); }

// 3. Barra móvil de contacto: existe y NO tapa el CTA final
try {
  await p.goto(BASE + '/big-bags', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const fijos = [...document.querySelectorAll('body *')].filter((el) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return cs.position === 'fixed' && rect.height > 30 && rect.width > 200 &&
             rect.bottom > innerHeight - 5 && cs.visibility !== 'hidden' && cs.display !== 'none';
    });
    if (!fijos.length) return { barra: false };
    const barra = fijos[0].getBoundingClientRect();
    // ¿Qué hay justo debajo de la barra? Si es un enlace/botón, está tapado.
    const bajo = document.elementFromPoint(innerWidth / 2, barra.top + barra.height / 2);
    const cta = [...document.querySelectorAll('a,button')].filter((el) => {
      const q = el.getBoundingClientRect();
      return q.height > 20 && q.top < barra.bottom && q.bottom > barra.top;
    }).filter((el) => !fijos[0].contains(el));
    const padBody = getComputedStyle(document.body).paddingBottom;
    return {
      barra: true, alto: Math.round(barra.height), padBody,
      tapa: cta.map((e) => (e.textContent || '').trim().slice(0, 40)).slice(0, 4),
      debajo: bajo ? bajo.tagName : null,
    };
  });
  ok('barra móvil de contacto presente', r.barra === true, r.barra ? `alto ${r.alto}px, padding-bottom del body: ${r.padBody}` : '');
  ok('la barra fija no tapa ningún CTA al final de la página', !r.tapa || r.tapa.length === 0,
     r.tapa && r.tapa.length ? 'tapa: ' + r.tapa.join(' | ') : '');
} catch (e) { ok('barra móvil de contacto presente', false, String(e).slice(0, 120)); }

// 4. Tema oscuro
try {
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  const antes = await p.evaluate(() => document.documentElement.classList.contains('dark'));
  await p.getByRole('button', { name: /modo oscuro|modo claro/i }).first().click();
  await p.waitForTimeout(400);
  const despues = await p.evaluate(() => document.documentElement.classList.contains('dark'));
  ok('el conmutador de tema cambia el modo', antes !== despues, `${antes} → ${despues}`);
  const persiste = await p.evaluate(() => { try { return localStorage.getItem('theme'); } catch { return null; } });
  ok('el tema queda guardado', persiste !== null, `localStorage.theme = ${persiste}`);
  if (despues) { await p.getByRole('button', { name: /modo claro|modo oscuro/i }).first().click(); }
} catch (e) { ok('el conmutador de tema cambia el modo', false, String(e).slice(0, 120)); }

await p.close();

/* ─────────────── ESCRITORIO 1280×800 ─────────────── */
const esc = await nav.newContext({ viewport: { width: 1280, height: 800 } });
p = await esc.newPage();

// 5. Filtros del catálogo
try {
  await p.goto(BASE + '/productos', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const antes = await p.locator('a[href^="/productos/"]:visible').count();
  const botones = p.locator('button:visible, [role="button"]:visible');
  const n = await botones.count();
  let clicado = '';
  for (let i = 0; i < n; i++) {
    const t = ((await botones.nth(i).textContent()) || '').trim();
    if (/^(Envases|Lonas|Geosint|Mallas|Ventilaci|Estructuras)/i.test(t)) { await botones.nth(i).click(); clicado = t; break; }
  }
  await p.waitForTimeout(800);
  const despues = await p.locator('a[href^="/productos/"]:visible').count();
  ok('los filtros del catálogo filtran de verdad', clicado !== '' && despues !== antes,
     clicado ? `filtro «${clicado}»: ${antes} → ${despues} fichas` : 'no se encontró un botón de familia');
} catch (e) { ok('los filtros del catálogo filtran de verdad', false, String(e).slice(0, 140)); }

// 6. Pestañas de servicios
try {
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(800);
  // La portada tiene DOS grupos de pestañas independientes (servicios y
  // galería de maquinaria). Se comprueba el de servicios por su tablist.
  const lista = p.locator('[role="tablist"][aria-label="Servicios"]');
  const tabs = lista.locator('[role="tab"]');
  const n = await tabs.count();
  if (n === 0) { ok('las pestañas de servicios (portada) cambian de panel', false, 'no hay tablist «Servicios»'); }
  else {
    const panel = p.locator('#panel-servicio');
    const t0 = (await panel.textContent() || '').slice(0, 160);
    await tabs.nth(Math.min(1, n - 1)).click();
    await p.waitForTimeout(700);
    const t1 = (await panel.textContent() || '').slice(0, 160);
    ok('las pestañas de servicios (portada) cambian de panel', t0 !== t1, `${n} pestañas`);
    const sel = await lista.locator('[role="tab"][aria-selected="true"]').count();
    ok('exactamente una pestaña de servicios se declara seleccionada', sel === 1, `${sel} con aria-selected=true`);
    // WCAG 2.2.2: el avance automático tiene que poder detenerse con el dedo.
    // (Tocar una pestaña ya pausa el avance, así que el botón puede estar en
    // cualquiera de sus dos estados: se busca por los dos rótulos.)
    const pausa = p.getByRole('button', { name: /(pausar|reanudar) el avance automático/i });
    ok('existe un control para pausar el avance automático', await pausa.count() > 0,
       (await pausa.first().textContent() || '').trim());
    // Navegación por teclado dentro del grupo: relativa, no absoluta.
    const idAntes = await lista.locator('[role="tab"][aria-selected="true"]').first().getAttribute('id');
    await lista.locator(`#${idAntes}`).focus();
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(400);
    const idDespues = await lista.locator('[role="tab"][aria-selected="true"]').first().getAttribute('id');
    const esperado = `pestana-servicio-${(Number(idAntes.split('-').pop()) + 1) % n}`;
    ok('las flechas mueven la pestaña activa', idDespues === esperado, `${idAntes} → ${idDespues}`);
  }
} catch (e) { ok('las pestañas de servicios (portada) cambian de panel', false, String(e).slice(0, 140)); }

// 7. Calculadora
try {
  await p.goto(BASE + '/calculadoras/big-bags-por-viaje', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(800);
  const nums = p.locator('input[type="number"]:visible');
  const n = await nums.count();
  const antes = await p.evaluate(() => document.body.innerText);
  for (let i = 0; i < Math.min(n, 3); i++) await nums.nth(i).fill(String(7 + i * 3));
  await p.waitForTimeout(800);
  const despues = await p.evaluate(() => document.body.innerText);
  ok('la calculadora recalcula al cambiar una entrada', n > 0 && antes !== despues, `${n} campos numéricos`);
} catch (e) { ok('la calculadora recalcula al cambiar una entrada', false, String(e).slice(0, 140)); }

// 8. Formulario RFQ: validación del navegador y campos obligatorios
try {
  await p.goto(BASE + '/cotizacion', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  // El formulario lleva `noValidate` a propósito —los mensajes están en dos
  // idiomas y los escribe react-hook-form—, así que lo obligatorio se declara
  // con aria-required, que es lo que anuncia un lector de pantalla.
  const req = await p.locator('[aria-required="true"]:visible').count();
  const submit = p.locator('button[type="submit"]:visible, form button:visible').first();
  const haySubmit = await submit.count() > 0;
  ok('el RFQ declara sus campos obligatorios a la tecnología asistiva', req >= 5, `${req} con aria-required`);
  ok('el RFQ tiene botón de envío visible', haySubmit);
  if (haySubmit) {
    await submit.click();
    await p.waitForTimeout(900);
    const enviado = p.url().includes('gracias') || p.url().includes('exito');
    ok('el RFQ NO se envía vacío', !enviado, 'la validación retiene el envío');
    // Y el error tiene que EXISTIR para quien no lo ve.
    const alertas = await p.locator('[role="alert"]:visible').count();
    const invalidos = await p.locator('[aria-invalid="true"]').count();
    const descritos = await p.locator('[aria-describedby$="-error"]').count();
    ok('los errores se anuncian (role=alert)', alertas > 0, `${alertas} alertas`);
    ok('cada campo inválido se marca y se asocia a su mensaje', invalidos > 0 && descritos > 0,
       `${invalidos} aria-invalid · ${descritos} aria-describedby`);
  }
  const labels = await p.evaluate(() => {
    const campos = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')];
    const sin = campos.filter((c) => {
      if (c.getAttribute('aria-label') || c.getAttribute('aria-labelledby')) return false;
      if (c.id && document.querySelector(`label[for="${CSS.escape(c.id)}"]`)) return false;
      return !c.closest('label');
    });
    return { total: campos.length, sin: sin.map((c) => c.name || c.type).slice(0, 6) };
  });
  ok('todos los campos del RFQ tienen etiqueta', labels.sin.length === 0, `${labels.total} campos, sin etiqueta: ${labels.sin.join(', ') || 'ninguno'}`);
} catch (e) { ok('el RFQ declara campos obligatorios', false, String(e).slice(0, 140)); }

// 9. Contenedores con scroll horizontal que de verdad hacen scroll
try {
  await p.goto(BASE + '/fabricar-o-importar', { waitUntil: 'domcontentloaded' });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const cajas = [...document.querySelectorAll('.overflow-x-auto')];
    return cajas.map((c) => ({ sw: c.scrollWidth, cw: c.clientWidth, desplazable: c.scrollWidth > c.clientWidth + 2 }));
  });
  ok('la tabla ancha vive en un contenedor desplazable', r.length > 0 && r.every((x) => x.desplazable),
     r.map((x) => `${x.sw}/${x.cw}px`).join(', '));
} catch (e) { ok('la tabla ancha vive en un contenedor desplazable', false, String(e).slice(0, 140)); }

// 10. Carrito y chatbot
try {
  await p.setViewportSize({ width: 1280, height: 800 });
  await p.goto(BASE + '/productos/big-bags-bolsones-polipropileno', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const chat = p.locator('button[aria-label*="chat" i], button[aria-label*="asistente" i], button[aria-label*="Abrir" i]');
  ok('la ficha ofrece una ruta a cotización', await p.locator('a[href*="cotizacion"]:visible').count() > 0);
  ok('hay un lanzador de asistente/chat', await chat.count() > 0, `${await chat.count()} botones`);
} catch (e) { ok('la ficha ofrece una ruta a cotización', false, String(e).slice(0, 140)); }

await p.close();
await nav.close();
writeFileSync('.diagnostico/02-interaccion.json', JSON.stringify(R, null, 1));
const fallos = R.filter((x) => !x.pasa).length;
console.error(`\n${R.length - fallos}/${R.length} comprobaciones de interacción pasan`);
