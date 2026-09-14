import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EL ÚNICO INSTRUMENTO QUE MIRA LA PÁGINA RENDERIZADA.
 *
 * Las 902 pruebas de este repositorio leen archivos y llaman funciones.
 * Ninguna abre un navegador, así que ninguna puede ver un desborde horizontal
 * en un teléfono, un objetivo táctil de 23 px, un contraste de 1.16:1 en modo
 * oscuro ni un enlace interno roto. Para eso está el arné de
 * `scripts/diagnostico/`.
 *
 * Y ESTUVO APAGADO SIN QUE NADA LO DIJERA. `rutas.mjs` fijaba una sola ruta
 * absoluta a un Chromium que existía en un contenedor concreto:
 *
 *   browserType.launch: Failed to launch chromium because executable doesn't
 *   exist at /opt/pw-browsers/chromium-1194/chrome-linux/chrome
 *
 * Fuera de ese contenedor —un Codespace, un portátil, CI— el arné entero moría
 * con ese mensaje, que además no dice qué hacer. Estas pruebas impiden que la
 * herramienta de medir vuelva a depender de una máquina.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');
const PASOS = readdirSync(join(raiz, 'scripts/diagnostico')).filter((f) => /^\d\d-.*\.mjs$/.test(f));

describe('el arné no depende de una máquina concreta', () => {
  it('el navegador se busca en una lista, no se supone en una ruta', () => {
    const src = leer('scripts/diagnostico/rutas.mjs');
    expect(src, 'sin buscarChrome, una sola ruta decide si el arné existe').toContain('export function buscarChrome');
    expect(src, 'quien sabe dónde está su navegador tiene que poder decirlo').toContain('DIAG_CHROME');
    expect(src, 'el caso normal es el Chromium que instaló Playwright').toContain('chromium.executablePath()');
    // Y las rutas de contenedor siguen ahí: quitarlas rompería el sandbox donde
    // sí existen. Se buscan, no se imponen.
    expect(src).toContain('/opt/pw-browsers/');
  });

  it('cuando no hay navegador, el error dice el comando exacto', () => {
    // «executable doesn't exist at /opt/...» no le dice nada a nadie.
    const src = leer('scripts/diagnostico/rutas.mjs');
    expect(src).toContain('npx playwright install chromium');
    expect(src).toContain('DIAG_CHROME=/ruta/a/chrome');
  });

  it('los seis pasos abren el navegador por la misma puerta', () => {
    const sueltos: string[] = [];
    for (const f of PASOS) {
      const src = leer(`scripts/diagnostico/${f}`);
      if (!/chromium\.launch|lanzarNavegador/.test(src)) continue;
      if (src.includes('chromium.launch(')) sueltos.push(f);
    }
    expect(
      sueltos,
      'use lanzarNavegador(): con chromium.launch directo, el error vuelve a no decir nada',
    ).toEqual([]);
  });
});

describe('el diagnóstico se ejecuta con un comando y no deja procesos sueltos', () => {
  it('npm run diagnostico llama al guion, no a seis nodes encadenados', () => {
    /**
     * Encadenar los seis con `&&` obligaba a levantar el servidor aparte, y las
     * instrucciones para hacerlo —`npm run build && npx next start -p 4000 &`—
     * mandan al fondo la cadena entera: el diagnóstico arrancaba mientras el
     * build seguía compilando.
     */
    const pkg = JSON.parse(leer('package.json'));
    expect(pkg.scripts.diagnostico).toContain('scripts/diagnostico.sh');
    expect(existsSync(join(raiz, 'scripts/diagnostico.sh'))).toBe(true);
  });

  it('el guion espera a que el servidor CONTESTE antes de medir', () => {
    // Pedir una página antes de tiempo da el diagnóstico de una página en
    // blanco, que es peor que ningún diagnóstico: parece que todo está bien.
    const sh = leer('scripts/diagnostico.sh');
    // DOS veces, y las dos hacen falta: una DENTRO del bucle de espera y otra
    // después, como comprobación final. Quitar la del bucle deja el guion
    // esperando un tiempo fijo, que es adivinar en vez de medir.
    const sondeos = [...sh.matchAll(/curl -fsS "\$\{BASE\}\/version\.json"/g)].length;
    expect(sondeos, 'se sondea dentro del bucle y se comprueba al salir').toBeGreaterThanOrEqual(2);
    expect(sh, 'sin límite, un servidor que no arranca cuelga el comando para siempre').toMatch(/seq 1 60/);
  });

  it('el guion apaga el servidor pase lo que pase', () => {
    // Sin trap, un paso que falla deja un `next start` ocupando el puerto y el
    // siguiente intento falla por una razón distinta y confusa.
    const sh = leer('scripts/diagnostico.sh');
    expect(sh).toMatch(/trap apagar EXIT/);
    expect(sh).toContain('kill "$SERVIDOR"');
  });

  it('un paso que falla no impide que corran los otros cinco', () => {
    // Un informe de cinco medidas vale más que ninguna.
    const sh = leer('scripts/diagnostico.sh');
    expect(sh).not.toMatch(/^set -e\b/m);
    expect(sh).toMatch(/FALLOS=\$\(\(FALLOS\+1\)\)/);
  });

  it('se puede preguntar qué navegador usaría, sin correr nada', () => {
    const pkg = JSON.parse(leer('package.json'));
    expect(pkg.scripts['diagnostico:navegador']).toBeTruthy();
  });
});

/**
 * EL DIAGNÓSTICO TERMINA, ESCRIBE Y DICE POR DÓNDE VA.
 *
 * Lo medido en la máquina del operador, con Chromium ya instalado y el
 * servidor en pie: cinco de seis pasos «fallaron». Ninguno por un defecto del
 * sitio.
 *
 *   04-accesibilidad: ✓ movil-claro ✓ movil-oscuro ✓ escritorio-claro
 *                     ✓ escritorio-oscuro
 *                     ENOENT: open '.diagnostico/04-accesibilidad.json'
 *
 * Auditó los cuatro modos con axe-core y tiró el informe en la última línea,
 * porque `.diagnostico/` está en .gitignore —no viene en el clon— y sólo
 * 05-capturas la creaba. Y el paso 01 abre 222 páginas sin imprimir nada, así
 * que se leyó como colgado y se cortó con Ctrl-C; el `trap ... EXIT INT TERM`
 * mató el servidor y dejó seguir el bucle, y los cinco pasos restantes
 * fallaron con ECONNREFUSED. Un Ctrl-C, cinco falsos culpables.
 */
describe('el diagnóstico escribe donde dice que escribe', () => {
  it('la carpeta de salida se crea en el módulo común, no en cada paso', () => {
    const src = leer('scripts/diagnostico/rutas.mjs');
    expect(src, 'sin guardar(), cada paso vuelve a poder olvidarse del mkdir').toContain('export function guardar');
    expect(src, 'las capturas necesitan subcarpeta').toContain('export function carpeta');
    expect(src).toMatch(/mkdirSync\(ruta, \{ recursive: true \}\)/);
  });

  it('ningún paso nombra .diagnostico/ por su cuenta', () => {
    // Ésta es la regresión de verdad: el día que alguien escriba
    // `writeFileSync('.diagnostico/09-x.json')` vuelve el ENOENT. Se prohíbe
    // la ruta literal en los pasos; el único que la conoce es rutas.mjs.
    const culpables: string[] = [];
    for (const f of PASOS) {
      const src = leer(`scripts/diagnostico/${f}`)
        .replace(/\/\*[\s\S]*?\*\//g, '')   // los comentarios sí pueden citarla
        .replace(/^\s*\/\/.*$/gm, '');
      if (src.includes('.diagnostico/')) culpables.push(f);
    }
    expect(culpables, 'use guardar() o carpeta() de rutas.mjs').toEqual([]);
  });

  it('todo paso que produce un informe pasa por guardar() o carpeta()', () => {
    const sinSalida: string[] = [];
    for (const f of PASOS) {
      const src = leer(`scripts/diagnostico/${f}`);
      // 08-presupuesto lee .next y sólo imprime: no escribe informe.
      if (!/writeFileSync|screenshot\(/.test(src)) continue;
      if (!/\bguardar\(|\bcarpeta\(/.test(src)) sinSalida.push(f);
    }
    expect(sinSalida).toEqual([]);
  });
});

describe('un Ctrl-C aborta el diagnóstico, no sólo el paso en curso', () => {
  it('INT y TERM tienen su propio manejador y salen con 130', () => {
    const sh = leer('scripts/diagnostico.sh');
    // Reproducido antes del arreglo: con `trap apagar EXIT INT TERM`, una sola
    // señal mataba el servidor y el bucle continuaba → FALLOS=5.
    // Anclado a principio de línea a propósito: el comentario del guion CITA la
    // línea vieja para explicar por qué se fue, y citarla no es tenerla.
    expect(sh, 'INT no puede compartir manejador con EXIT: apaga y deja seguir').not.toMatch(/^trap apagar EXIT INT/m);
    expect(sh).toMatch(/^trap interrumpir INT TERM$/m);
    expect(sh, '130 es el código convenido para «lo paró una señal»').toMatch(/exit 130/);
  });

  it('el servidor se sigue apagando pase lo que pase', () => {
    // El arreglo no puede costar la garantía anterior: sin trap EXIT queda un
    // `next start` ocupando el puerto y el siguiente intento falla por otra razón.
    const sh = leer('scripts/diagnostico.sh');
    expect(sh).toMatch(/trap apagar EXIT\s*$/m);
    expect(sh, 'interrumpir() apaga y sale; el trap EXIT vuelve a llamar a apagar()').toMatch(/SERVIDOR=""/);
  });
});

describe('los pasos largos dicen por dónde van', () => {
  it('01 y 03 informan del avance', () => {
    // 01 abre 37 rutas × 6 viewports con 1.2 s de pausa en cada una. Mudo, son
    // varios minutos que se leen como «colgado», y se cortan.
    for (const f of ['01-maquetacion.mjs', '03-arquitectura.mjs']) {
      expect(leer(`scripts/diagnostico/${f}`), `${f} mide cientos de páginas en silencio`).toMatch(/\bavance\(/);
    }
  });

  it('sin terminal, el avance no escupe una línea por medida', () => {
    // 222 líneas en un registro de CI no son progreso, son ruido. Medido: 12.
    const src = leer('scripts/diagnostico/rutas.mjs');
    expect(src).toContain('process.stderr.isTTY');
    expect(src, 'se anuncia por decenas de porcentaje').toMatch(/Math\.floor\(pct \/ 10\)/);
  });

  it('el guion dice cuánto tardó cada paso', () => {
    const sh = leer('scripts/diagnostico.sh');
    expect(sh).toMatch(/INICIO=\$SECONDS/);
    expect(sh).toMatch(/\$\(\(SECONDS - INICIO\)\)/);
  });
});
