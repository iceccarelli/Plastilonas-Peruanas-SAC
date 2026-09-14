import { ORIGEN_API, SITIO, VERSION_API } from './config';
import { catalogoDeCalculos } from './calculos';
import { HERRAMIENTAS } from './mcp';

/**
 * LA INTERFAZ.
 *
 * Quien integra una API decide en los dos primeros minutos si va a integrarla.
 * Una página que explica en abstracto y manda a leer un PDF pierde esa decisión.
 * Ésta trae el probador delante: elegir un cálculo, poner tres números, ver el
 * resultado con su fórmula, copiar el `curl`. Sin dependencias, sin fuentes
 * remotas, sin paso de compilación.
 */
export function consola(): string {
  const calculos = catalogoDeCalculos();
  const datos = JSON.stringify({ origen: ORIGEN_API, calculos }, null, 0).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>API de Plastilonas Peruanas SAC — especificar y cotizar</title>
<meta name="description" content="API pública y servidor MCP: catálogo de fabricación, predimensionamiento con fórmula publicada y solicitudes de cotización. Sin precios: se cotiza por operación.">
<link rel="canonical" href="${ORIGEN_API}/">
<style>
  :root{--tinta:#0A2540;--verde:#059669;--claro:#10B981;--papel:#ffffff;--suave:#f6f8fa;--borde:#e3e8ef;--gris:#5b6b7f}
  @media (prefers-color-scheme:dark){:root{--tinta:#e8eef6;--papel:#0b1220;--suave:#131c2b;--borde:#243044;--gris:#9fb0c6}}
  *{box-sizing:border-box}
  body{margin:0;background:var(--papel);color:var(--tinta);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .env{max-width:1060px;margin:0 auto;padding:0 20px}
  header{background:#0A2540;color:#fff;padding:56px 0 44px}
  header .env{max-width:1060px}
  h1{margin:0 0 12px;font-size:clamp(28px,4.4vw,44px);line-height:1.1;letter-spacing:-.02em;font-weight:700}
  .sub{color:rgba(255,255,255,.78);max-width:62ch;margin:0 0 22px}
  .marca{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#34D399;font-weight:700;margin-bottom:14px}
  .chips{display:flex;flex-wrap:wrap;gap:8px}
  .chip{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 14px;font-size:13px;color:#fff}
  h2{font-size:22px;margin:42px 0 10px;letter-spacing:-.01em}
  h3{font-size:16px;margin:22px 0 8px}
  p,li{color:var(--tinta)}
  .apunte{color:var(--gris);font-size:14px}
  code,kbd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}
  pre{background:var(--suave);border:1px solid var(--borde);border-radius:12px;padding:14px 16px;overflow-x:auto;font-size:13px}
  .caja{border:1px solid var(--borde);border-radius:16px;padding:20px;background:var(--suave);margin:14px 0}
  .rejilla{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  label{display:block;font-size:13px;font-weight:600;margin:10px 0 4px}
  select,input{width:100%;padding:10px 12px;border:1px solid var(--borde);border-radius:10px;background:var(--papel);color:var(--tinta);font:inherit;font-size:14px}
  button{min-height:44px;padding:0 22px;border:0;border-radius:12px;background:var(--verde);color:#fff;font:inherit;font-weight:700;cursor:pointer}
  button:hover{background:var(--claro)}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--borde);vertical-align:top}
  th{color:var(--gris);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
  a{color:var(--verde)}
  .dura{border-left:3px solid #f59e0b;padding-left:14px;margin:16px 0}
  footer{border-top:1px solid var(--borde);margin-top:50px;padding:26px 0 46px;color:var(--gris);font-size:14px}
  .ok{color:var(--verde);font-weight:700}
  .mal{color:#dc2626;font-weight:700}
</style>
</head>
<body>
<header>
  <div class="env">
    <div class="marca">API · MCP · v${VERSION_API}</div>
    <h1>Especifique y cotice textil industrial,<br>por programa o por agente.</h1>
    <p class="sub">Catálogo de fabricación, cinco cálculos de predimensionamiento con la fórmula a la vista y sus límites declarados, y un buzón de solicitudes de cotización. Fabricante peruano, RUC 20523135385, planta en Chorrillos, Lima.</p>
    <div class="chips">
      <span class="chip">Sin autenticación</span>
      <span class="chip">Sin precios — se cotiza por operación</span>
      <span class="chip">Cada dato con sus límites</span>
      <span class="chip">MCP para agentes</span>
    </div>
  </div>
</header>

<main class="env">

<h2>Pruébelo aquí</h2>
<p class="apunte">Se ejecuta contra este mismo servicio. Los campos que deje vacíos toman el supuesto por defecto publicado, y el resultado dice cuáles fueron.</p>
<div class="caja">
  <label for="calc">Cálculo</label>
  <select id="calc"></select>
  <p class="apunte" id="pregunta" style="margin:10px 0 0"></p>
  <div class="rejilla" id="campos"></div>
  <p style="margin:18px 0 0"><button id="correr">Calcular</button></p>
  <div id="salida"></div>
</div>

<h2>Lo que devuelve, y lo que no</h2>
<div class="rejilla">
  <div class="caja">
    <h3>Devuelve</h3>
    <ul>
      <li>Especificación: qué se fabrica y con qué características.</li>
      <li>Cantidad: cuánto hace falta, con el desglose del número.</li>
      <li>La fórmula aplicada, en texto plano.</li>
      <li>Los supuestos usados, y si los puso usted o vinieron por defecto.</li>
      <li>Lo que el cálculo <strong>no</strong> cubre.</li>
    </ul>
  </div>
  <div class="caja">
    <h3>No devuelve</h3>
    <p><strong>Precios.</strong> El precio depende del material, las medidas, la cantidad, el destino y el Incoterm; se emite en una cotización firmada. Una API que publicara precios dejaría de ser una referencia para pasar a ser una promesa que no se puede sostener.</p>
    <p class="apunte">Tampoco certificaciones como credenciales propias: cuando una norma aparece, aparece como requisito del comprador o del puerto, no como distintivo nuestro.</p>
  </div>
</div>

<div class="dura">
  <p style="margin:0"><strong>Los resultados son de predimensionamiento.</strong> Sirven para llegar a una cotización con un número propio y para entender qué variable manda. No son una memoria de cálculo firmada y no autorizan a construir nada.</p>
</div>

<h2>Para agentes — servidor MCP</h2>
<p>Las mismas capacidades, como herramientas que un modelo puede ejecutar. Cuando alguien pregunta a su asistente cuánta geomembrana necesita, el asistente no repite un artículo: calcula con nuestra fórmula y devuelve el enlace de cotización con el cálculo ya cargado.</p>
<pre><code>${ORIGEN_API}/mcp</code></pre>
<table>
  <thead><tr><th>Herramienta</th><th>Cuándo la llama un agente</th></tr></thead>
  <tbody>
${HERRAMIENTAS.map((h) => `    <tr><td><code>${h.name}</code></td><td>${h.description.split('.')[0]}.</td></tr>`).join('\n')}
  </tbody>
</table>
<pre><code>curl -s ${ORIGEN_API}/mcp \\
  -H 'content-type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'</code></pre>

<h2>Para programas — REST</h2>
<p>Contrato completo en <a href="/openapi.json">/openapi.json</a> (OpenAPI 3.1, generado desde el propio motor).</p>
<table>
  <thead><tr><th>Ruta</th><th>Qué resuelve</th></tr></thead>
  <tbody>
    <tr><td><code>GET /v1/catalogo?q=…</code></td><td>Qué producto corresponde a lo que el comprador describe.</td></tr>
    <tr><td><code>GET /v1/catalogo/{slug}</code></td><td>Ficha completa, con ficha técnica en PDF.</td></tr>
    <tr><td><code>GET /v1/calculos</code></td><td>Qué se puede predimensionar y qué datos pide cada cálculo.</td></tr>
    <tr><td><code>POST /v1/calculos/{slug}</code></td><td>El número, con desglose, supuestos y límites.</td></tr>
    <tr><td><code>POST /v1/cotizaciones</code></td><td>Registra la solicitud y devuelve su referencia.</td></tr>
    <tr><td><code>GET /v1/glosario</code></td><td>Los términos que gobiernan una especificación.</td></tr>
    <tr><td><code>GET /v1/entidad</code></td><td>Identidad verificable de la empresa.</td></tr>
  </tbody>
</table>

<h2>Los cinco datos que evitan tres correos</h2>
<p>Una solicitud que trae producto, medidas o especificación, cantidad, ciudad o puerto de entrega y fecha se cotiza el mismo día. Una que dice «necesito big bags» cuesta tres correos de ida y vuelta antes de poder empezar.</p>
<pre><code>curl -s ${ORIGEN_API}/v1/cotizaciones \\
  -H 'content-type: application/json' \\
  -d '{
    "email": "compras@empresa.com",
    "telefono": "+51 999 999 999",
    "producto": "geomembrana-hdpe",
    "medidas": "1.5 mm",
    "cantidad": "2400 m2",
    "ciudad_entrega": "Arequipa",
    "fecha_necesaria": "2026-11-15"
  }'</code></pre>

</main>

<footer class="env">
  <p>Plastilonas Peruanas SAC · RUC 20523135385 · Chorrillos, Lima, Perú · <a href="mailto:ventas@plastilonas.com">ventas@plastilonas.com</a></p>
  <p>Fabricación en planta propia. El suministro internacional se evalúa por operación bajo EXW Lima, FCA Lima o FOB Callao.</p>
  <p>Sitio: <a href="${SITIO}">${SITIO}</a> · Política de citación para agentes: <a href="${SITIO}/ai.txt">/ai.txt</a></p>
</footer>

<script>
const CFG = ${datos};
const sel = document.getElementById('calc');
const campos = document.getElementById('campos');
const salida = document.getElementById('salida');
const pregunta = document.getElementById('pregunta');

for (const c of CFG.calculos) {
  const o = document.createElement('option');
  o.value = c.slug; o.textContent = c.titulo;
  sel.appendChild(o);
}

function pintarCampos() {
  const c = CFG.calculos.find(x => x.slug === sel.value);
  pregunta.textContent = c.pregunta;
  campos.innerHTML = '';
  for (const campo of c.campos) {
    const env = document.createElement('div');
    const et = document.createElement('label');
    et.textContent = campo.etiqueta + (campo.unidad ? ' (' + campo.unidad + ')' : '');
    et.htmlFor = 'campo-' + campo.id;
    env.appendChild(et);
    let ctrl;
    if (campo.opciones && campo.opciones.length) {
      ctrl = document.createElement('select');
      for (const op of campo.opciones) {
        const o = document.createElement('option');
        o.value = String(op.valor); o.textContent = op.etiqueta;
        if (op.valor === campo.por_defecto) o.selected = true;
        ctrl.appendChild(o);
      }
    } else {
      ctrl = document.createElement('input');
      ctrl.type = 'number'; ctrl.step = 'any'; ctrl.value = String(campo.por_defecto);
    }
    ctrl.id = 'campo-' + campo.id;
    ctrl.dataset.campo = campo.id;
    env.appendChild(ctrl);
    const ayuda = document.createElement('p');
    ayuda.className = 'apunte';
    ayuda.style.margin = '4px 0 0';
    ayuda.textContent = campo.es_supuesto ? 'Supuesto editable. ' + campo.ayuda : campo.ayuda;
    env.appendChild(ayuda);
    campos.appendChild(env);
  }
  salida.innerHTML = '';
}

function esc(s) { return String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

async function correr() {
  const valores = {};
  for (const el of campos.querySelectorAll('[data-campo]')) {
    const n = Number(el.value);
    if (Number.isFinite(n)) valores[el.dataset.campo] = n;
  }
  salida.innerHTML = '<p class="apunte">Calculando…</p>';
  const r = await fetch('/v1/calculos/' + encodeURIComponent(sel.value), {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ valores })
  });
  const j = await r.json();
  if (!r.ok) {
    salida.innerHTML = '<p class="mal">' + esc(j.error?.mensaje || 'No se pudo calcular.') + '</p>';
    return;
  }
  const d = j.datos;
  const fila = m => '<tr><td>' + esc(m.etiqueta) + '</td><td><strong>' + m.valor.toFixed(m.decimales) + '</strong> ' + esc(m.unidad) + '</td></tr>';
  salida.innerHTML =
    '<h3>Resultado</h3><table><tbody>' + d.resultado.principales.map(fila).join('') + '</tbody></table>' +
    (d.resultado.desglose.length ? '<h3>Desglose</h3><table><tbody>' + d.resultado.desglose.map(fila).join('') + '</tbody></table>' : '') +
    (d.resultado.avisos.length ? '<h3>Avisos</h3><ul>' + d.resultado.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul>' : '') +
    '<h3>Fórmula aplicada</h3><pre><code>' + d.formula.map(esc).join('\\n') + '</code></pre>' +
    '<h3>Lo que no cubre</h3><ul>' + j.limites.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
    '<p><a href="' + esc(j.siguiente_paso.url) + '">' + esc(j.siguiente_paso.descripcion) + '</a></p>' +
    '<h3>La misma llamada, en curl</h3><pre><code>curl -s ' + esc(CFG.origen) + '/v1/calculos/' + esc(sel.value) +
    " \\\\\\n  -H 'content-type: application/json' \\\\\\n  -d '" + JSON.stringify({ valores }) + "'</code></pre>";
}

sel.addEventListener('change', pintarCampos);
document.getElementById('correr').addEventListener('click', correr);
pintarCampos();
</script>
</body>
</html>`;
}
