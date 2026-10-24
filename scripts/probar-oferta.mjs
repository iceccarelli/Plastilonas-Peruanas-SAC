/**
 * RECORRIDO DE LA OFERTA, de extremo a extremo y en navegador real.
 *
 * Qué prueba (todo contra el sitio COMPILADO, no contra funciones sueltas):
 *   base de datos limpia (schema + todas las migraciones, Postgres real vía
 *   PGlite) → oferta emitida por el personal → el cron real envía el correo a
 *   un proveedor local de captura → se abre el enlace DEL CORREO en Chromium,
 *   en escritorio y en móvil → se revisa, se descarga el PDF, se acepta o se
 *   rechaza → se comprueba la base y que repetir/reenviar no cambia nada.
 *
 * Qué NO prueba, dicho claro: la sesión Auth.js del personal ni el servicio
 * real de Supabase/Resend. El personal actúa aquí con las MISMAS funciones SQL
 * que usan sus rutas (las rutas, con sesión simulada, las cubren las pruebas
 * de vitest). Ningún correo sale a Internet: el proveedor es un servidor local.
 *
 * Lo lanza scripts/probar-oferta.sh (compila, levanta, mide, apaga).
 */
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { lanzarNavegador } from './diagnostico/rutas.mjs';

const BASE = process.env.DIAG_BASE || 'http://localhost:4012';
const SHIM_PORT = Number(process.env.OFERTA_SHIM_PORT || 4013);
const MAIL_PORT = Number(process.env.OFERTA_MAIL_PORT || 4014);
const SECRETO = process.env.QUOTE_LINK_SECRET;
const CRON = process.env.CRON_SECRET;

const R = [];
let fallos = 0;
const ok = (nombre, pasa, detalle = '') => {
  R.push({ nombre, pasa, detalle });
  if (!pasa) fallos++;
  console.error(`  ${pasa ? '✓' : '✗'} ${nombre}${detalle ? ' — ' + detalle : ''}`);
};

// ── Base limpia ─────────────────────────────────────────────────────────────
const db = new PGlite();
const leer = (f) => readFileSync(`supabase/${f}`, 'utf8');
await db.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
await db.exec(leer('schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
for (const f of readdirSync('supabase/migrations').sort()) await db.exec(leer(`migrations/${f}`));
ok('base limpia: schema.sql + migraciones aplican', true, `${readdirSync('supabase/migrations').length} migraciones`);

// ── Cliente PostgREST mínimo sobre PGlite (solo /rpc; el resto, vacío) ──────
const shim = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    const url = new URL(req.url, 'http://x');
    const rpc = /^\/rest\/v1\/rpc\/([a-z_]+)$/.exec(url.pathname);
    try {
      if (rpc && req.method === 'POST') {
        const args = body ? JSON.parse(body) : {};
        const keys = Object.keys(args);
        const params = keys.map((k) => (args[k] !== null && typeof args[k] === 'object' ? JSON.stringify(args[k]) : args[k]));
        const ph = keys.map((k, i) => `${k} => $${i + 1}${args[k] !== null && typeof args[k] === 'object' ? '::jsonb' : ''}`);
        const r = await db.query(`select public.${rpc[1]}(${ph.join(', ')}) as r`, params);
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify(r.rows[0].r));
      }
      if (url.pathname.startsWith('/rest/v1/')) {
        res.writeHead(200, { 'content-type': 'application/json', 'content-range': '*/0' });
        return res.end(req.method === 'HEAD' ? undefined : '[]');
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end('{"message":"not found"}');
    } catch (e) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: String(e.message), code: 'P0001', details: null, hint: null }));
    }
  });
});
await new Promise((r) => shim.listen(SHIM_PORT, '127.0.0.1', r));

// ── Proveedor de correo local (Resend falso) ────────────────────────────────
const correos = [];
let modoMail = 'ok';
const mail = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    correos.push({ headers: req.headers, body });
    if (modoMail === 'falla') { res.writeHead(500, { 'content-type': 'application/json' }); return res.end('{}'); }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: `msg_${correos.length}` }));
  });
});
await new Promise((r) => mail.listen(MAIL_PORT, '127.0.0.1', r));

// ── Personal: mismas funciones SQL que las rutas ────────────────────────────
const ISSUER = {
  name: 'Plastilonas Peruanas SAC', legalName: 'Plastilonas Peruanas SAC', ruc: '20523135385',
  address: 'Calle de prueba 1, Chorrillos, Lima, Perú', email: 'ventas@example.test', phones: ['WhatsApp +51 900 000 000'], website: BASE,
};
async function lead(extra = {}) {
  const l = { full_name: 'Ana Compradora', company: 'Minera Andina SAC', customer_email: 'compras@minera.example', product: 'Mangas de ventilación', quantity: '12 unidades Ø600 x 50 m', ...extra };
  const r = await db.query(
    `insert into public.quotes(customer_email, full_name, company, product, quantity, status, rfq_code, payload)
     values ($1,$2,$3,$4,$5,'QUALIFIED','RFQ-20261024-' || upper(substr(gen_random_uuid()::text,1,8)), '{"ruc":"20123456786","deliveryCity":"Arequipa"}'::jsonb) returning id, rfq_code`,
    [l.customer_email, l.full_name, l.company, l.product, l.quantity]);
  return r.rows[0];
}
async function oferta(leadId, summary = 'Mangas de ventilación Ø600 mm x 50 m, 12 unidades') {
  const items = JSON.stringify([{ description: 'Manga de ventilación Ø600 mm x 50 m', quantity: '12', unit: 'UND', unit_price_cents: 104200, amount_cents: 1250400 }]);
  await db.query(`select public.lead_quote_create($1,'ventas@example.test',1475472,'PEN','2099-01-01',$2,'NOTA INTERNA: margen',$3::jsonb,'excluded','IGV 18% no incluido',225072,'Pago 50% adelanto. Entrega a coordinar.')`, [leadId, summary, items]);
  const q = (await db.query(`select id from public.lead_quotes where quote_id=$1 order by version desc limit 1`, [leadId])).rows[0];
  await db.query(`select public.lead_quote_issue($1,'ventas@example.test',$2::jsonb)`, [q.id, JSON.stringify(ISSUER)]);
  return q.id;
}
const cron = async () => (await fetch(`${BASE}/api/cron/lead-deliveries`, { headers: { authorization: `Bearer ${CRON}` } })).json();
const enlaceDelCorreo = (i) => {
  const texto = JSON.parse(correos[i].body).text;
  const m = /https?:\/\/\S+\/oferta\/([A-Za-z0-9_-]{43})/.exec(texto);
  return m ? new URL(m[0]).pathname : null; // el host del enlace es el canónico; se prueba contra el servidor local
};
const sha = (b) => createHash('sha256').update(b).digest('hex');
const una = async (sql, p = []) => (await db.query(sql, p)).rows[0];

// ── Recorrido ───────────────────────────────────────────────────────────────
const browser = await lanzarNavegador();
const terceros = new Set();
const consola = [];
const nuevaPagina = async (movil) => {
  const ctx = await browser.newContext({
    viewport: movil ? { width: 375, height: 700 } : { width: 1280, height: 900 }, isMobile: movil, hasTouch: movil,
    acceptDownloads: true,
  });
  const p = await ctx.newPage();
  p.on('request', (r) => { const u = new URL(r.url()); if (!r.url().startsWith('data:') && u.origin !== new URL(BASE).origin) terceros.add(u.origin); });
  p.on('console', (m) => { if (m.type() === 'error') consola.push(m.text()); });
  return { ctx, p };
};

try {
  // 1 · Emisión → envío por el cron real
  const l1 = await lead();
  const q1 = await oferta(l1.id);
  const antes = await una(`select status from public.quote_deliveries where lead_quote_id=$1`, [q1]);
  ok('al emitir queda la entrega en cola (nada se envió todavía)', antes.status === 'queued' && correos.length === 0);
  const c1 = await cron();
  ok('el cron real envía el correo', c1.quotes?.run?.sent === 1 && correos.length === 1, JSON.stringify(c1.quotes?.run));
  const d1 = await una(`select status from public.quote_deliveries where lead_quote_id=$1`, [q1]);
  ok('estado «sent» (aceptado por el proveedor), NUNCA «confirmed» sin su webhook', d1.status === 'sent');
  const m1 = JSON.parse(correos[0].body);
  ok('el correo va al cliente, con PDF adjunto y sin HTML', m1.to[0] === 'compras@minera.example' && m1.attachments?.length === 1 && !m1.html);
  const ruta1 = enlaceDelCorreo(0);
  ok('el correo trae un enlace personal /oferta/<token de 256 bits>', Boolean(ruta1));

  // 2 · Cliente en ESCRITORIO: revisar, descargar PDF
  const desk = await nuevaPagina(false);
  await desk.p.goto(BASE + ruta1, { waitUntil: 'networkidle' });
  const h1 = await desk.p.locator('h1').innerText();
  ok('escritorio: muestra la cotización exacta', h1.includes(`${l1.rfq_code}-V1`), h1);
  const txt = await desk.p.locator('main').innerText();
  ok('escritorio: total, impuestos y condiciones visibles', /14,754\.72/.test(txt) && /IGV 18% no incluido/.test(txt) && /Pago 50% adelanto/.test(txt));
  ok('escritorio: NO se filtran notas internas', !/NOTA INTERNA|margen/.test(txt));
  const pdfResp = await desk.ctx.request.get(BASE + ruta1 + '/documento.pdf');
  const pdf = Buffer.from(await pdfResp.body());
  ok('escritorio: el PDF descarga y es válido', pdfResp.status() === 200 && pdf.subarray(0, 5).toString() === '%PDF-');
  const adj = Buffer.from(m1.attachments[0].content, 'base64');
  ok('el PDF del enlace es BYTE A BYTE el adjunto del correo (misma instantánea)', sha(pdf) === sha(adj));
  ok('el PDF no se puede pedir sin token válido', (await desk.ctx.request.get(`${BASE}/oferta/${'A'.repeat(43)}/documento.pdf`)).status() === 404);

  // Accesibilidad (axe) en escritorio y móvil
  const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
  const auditarA11y = async (p, etiqueta) => {
    await p.addScriptTag({ content: axe });
    const r = await p.evaluate(async () => window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
    ok(`${etiqueta}: accesibilidad (axe, WCAG 2.2 AA) sin violaciones`, r.violations.length === 0, r.violations.map((v) => `${v.id}:${v.nodes.length}`).join(' '));
  };
  await auditarA11y(desk.p, 'escritorio');

  // Un clic en «Aceptar» SIN marcar la confirmación no envía nada (validación nativa)
  await desk.p.getByRole('button', { name: 'Aceptar oferta' }).click();
  await desk.p.waitForTimeout(400);
  ok('sin confirmar, el formulario no se envía y no cambia nada', (await una(`select status from public.lead_quotes where id=$1`, [q1])).status === 'issued');

  // 3 · Aceptar
  await desk.p.getByRole('checkbox').check();
  await Promise.all([desk.p.waitForNavigation(), desk.p.getByRole('button', { name: 'Aceptar oferta' }).click()]);
  const tras = await desk.p.locator('main').innerText();
  ok('tras aceptar, la página muestra el estado REAL: «aceptada»', /aceptada/.test(tras) && !(await desk.p.getByRole('button', { name: 'Aceptar oferta' }).count()));
  const fila = await una(`select status, resolved_via from public.lead_quotes where id=$1`, [q1]);
  ok('base: oferta aceptada por el cliente y lead GANADO', fila.status === 'accepted' && fila.resolved_via === 'customer' && (await una(`select status from public.quotes where id=$1`, [l1.id])).status === 'WON');

  // 4 · Reenvío del mismo POST (replay) y recarga: nada cambia
  const eventos = (await una(`select count(*)::int n from public.lead_events where quote_id=$1`, [l1.id])).n;
  const token = ruta1.split('/').pop();
  const replay = await desk.ctx.request.post(`${BASE}/api/oferta/${token}/decision`, {
    form: { outcome: 'rejected', reason: 'intento tardío', key: 'z'.repeat(22) }, headers: { origin: new URL(BASE).origin }, maxRedirects: 0,
  });
  ok('un rechazo posterior a la aceptación se rechaza (303 con aviso)', replay.status() === 303 && /e=already_resolved/.test(replay.headers().location ?? ''));
  const cross = await desk.ctx.request.post(`${BASE}/api/oferta/${token}/decision`, { form: { outcome: 'rejected', reason: 'x', key: 'y'.repeat(22) }, headers: { origin: 'https://evil.test' }, maxRedirects: 0 });
  ok('un POST desde otro origen se rechaza (403)', cross.status() === 403);
  ok('replay y CSRF no alteran estado ni auditoría', (await una(`select status from public.lead_quotes where id=$1`, [q1])).status === 'accepted' && (await una(`select count(*)::int n from public.lead_events where quote_id=$1`, [l1.id])).n === eventos);
  await desk.ctx.close();

  // 5 · MÓVIL: rechazo con motivo
  const l2 = await lead({ company: 'Agro Norte SAC' });
  const q2 = await oferta(l2.id);
  await cron();
  const ruta2 = enlaceDelCorreo(1);
  const mov = await nuevaPagina(true);
  await mov.p.goto(BASE + ruta2, { waitUntil: 'networkidle' });
  const desborde = await mov.p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok('móvil (375 px): sin desborde horizontal de la página', !desborde);
  await auditarA11y(mov.p, 'móvil');
  await mov.p.getByRole('textbox', { name: /Motivo/ }).fill('Precio superior al presupuesto aprobado');
  await Promise.all([mov.p.waitForNavigation(), mov.p.getByRole('button', { name: 'Rechazar oferta' }).click()]);
  ok('móvil: tras rechazar la página dice «rechazada»', /rechazada/.test(await mov.p.locator('main').innerText()));
  const lost = await una(`select status, loss_reason from public.quotes where id=$1`, [l2.id]);
  ok('base: lead PERDIDO con el motivo del cliente', lost.status === 'LOST' && lost.loss_reason === 'Precio superior al presupuesto aprobado');
  await mov.ctx.close();

  // 6 · Reemplazo: el enlace viejo ya no ofrece la oferta
  const l3 = await lead({ company: 'Constructora Sur SAC' });
  await oferta(l3.id); await cron();
  const ruta3 = enlaceDelCorreo(2);
  await oferta(l3.id, 'Versión 2 de la oferta con otra especificación'); await cron();
  const v = await nuevaPagina(false);
  await v.p.goto(BASE + ruta3, { waitUntil: 'networkidle' });
  const t3 = await v.p.locator('main').innerText();
  ok('la oferta reemplazada no se puede aceptar y se explica', /fue reemplazada/.test(t3) && !/Aceptar oferta|Constructora Sur/.test(t3));
  const ruta3b = enlaceDelCorreo(3);
  await v.p.goto(BASE + ruta3b, { waitUntil: 'networkidle' });
  ok('el enlace de la versión nueva sí abre la V2', (await v.p.locator('h1').innerText()).includes('-V2'));

  // 7 · Enlace vencido
  await db.query(`update public.quote_access_tokens set expires_at = now() - interval '1 minute' where token_hash = $1`, [sha(ruta3b.split('/').pop())]);
  await v.p.goto(BASE + ruta3b, { waitUntil: 'networkidle' });
  ok('enlace vencido: lo dice y no ofrece decidir', /venció/.test(await v.p.locator('main').innerText()) && !(await v.p.getByRole('button', { name: 'Aceptar oferta' }).count()));
  const inv = await v.p.goto(`${BASE}/oferta/${'B'.repeat(43)}`, { waitUntil: 'networkidle' });
  ok('enlace inventado: «no válido», sin datos', /no válido/.test(await v.p.locator('main').innerText()) && inv.status() < 500);
  await v.ctx.close();

  // 8 · Falla del proveedor: ningún falso éxito
  modoMail = 'falla';
  const l4 = await lead({ company: 'Pesquera Centro SAC' });
  const q4 = await oferta(l4.id);
  const c4 = await cron();
  const d4 = await una(`select status, last_error from public.quote_deliveries where lead_quote_id=$1`, [q4]);
  ok('si el proveedor falla: «failed» con reintento, NO «sent»; la alarma del cron se ve', d4.status === 'failed' && d4.last_error === 'http_5xx');
  modoMail = 'ok';
  await db.query(`update public.quote_deliveries set next_attempt_at = now() - interval '1 second' where lead_quote_id=$1`, [q4]);
  await cron();
  ok('al recuperarse el proveedor, el reintento entrega la oferta', (await una(`select status from public.quote_deliveries where lead_quote_id=$1`, [q4])).status === 'sent');

  ok('ninguna petición a terceros (sin analítica ni píxeles en el enlace del cliente)', terceros.size === 0, [...terceros].join(', '));
  ok('sin errores de consola en el navegador', consola.length === 0, consola.slice(0, 2).join(' | '));
} catch (e) {
  ok('el recorrido terminó sin excepción', false, String(e?.stack || e).slice(0, 400));
} finally {
  await browser.close().catch(() => undefined);
  shim.close(); mail.close();
}

mkdirSync('.diagnostico', { recursive: true });
writeFileSync('.diagnostico/oferta.json', JSON.stringify({ fallos, resultados: R }, null, 2));
console.error(`\n${R.length - fallos}/${R.length} comprobaciones correctas.`);
process.exit(fallos ? 1 : 0);
