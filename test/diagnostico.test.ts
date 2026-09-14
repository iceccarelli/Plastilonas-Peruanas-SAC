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
