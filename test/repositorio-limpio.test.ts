import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { statSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EL REPOSITORIO NO ES UN BUZÓN DE ENTREGAS.
 *
 * `.gitignore` declara `*.patch` con este comentario literal: «patch delivery
 * artifacts (never commit)». Aun así llegaron a convivir once archivos de
 * entrega en la raíz, porque la subida por la interfaz web de GitHub ignora
 * .gitignore sin avisar. Con ocho parches y ninguno aplicado, nadie podía
 * saber cuál iba primero, y tres fases estuvieron semanas sin integrarse.
 *
 * .gitignore sugiere. Esta prueba obliga.
 *
 * Segunda pasada. La regla original sólo miraba parches y guiones, y con eso
 * no bastaba. La raíz seguía teniendo:
 *
 *   · `README.txt` y `MASTER-README-IMAGES.md`, instrucciones para aplicar
 *     entregas que se aplicaron hace meses. Un lector nuevo no puede
 *     distinguir un instructivo caducado de uno vigente, y el caducado le
 *     manda a ejecutar guiones que ya no existen.
 *   · `main` y `FETCH_HEAD`, dos archivos de cero bytes nacidos de sendos
 *     redirigidos mal escritos. `main` es el peor de los dos: comparte nombre
 *     con la rama, así que `git log main` deja de funcionar —«ambiguous
 *     argument: both revision and filename»— en el propio repositorio.
 *
 * Y la subida por la web tiene una manía más, que ya costó dos veces:
 * le quita los guiones al nombre. `montar-imagenes.sh` llegó como
 * `montarimagenes.sh`, y `aplicar-p33.sh` como `aplicarp33.sh`. Por eso los
 * patrones no exigen el guion.
 *
 * La documentación de verdad vive en `docs/`. La raíz es para configuración.
 */

/** Archivos de raíz que SÍ deben existir. Todo lo demás sobra. */
const RAIZ_PERMITIDA = new Set<string>([
  '.env.example',
  '.gitignore',
  'README.md',
  'auth.ts',
  'eslint.config.mjs',
  'middleware.ts',
  'next-env.d.ts',
  'next.config.ts',
  'package-lock.json',
  'package.json',
  'postcss.config.mjs',
  'tailwind.config.ts',
  'tsconfig.json',
  'vitest.config.ts',
]);

const ARTEFACTO = [
  /\.patch$/,
  /\.diff$/,
  /^(aplicar|apply|integrar|integrate|montar|stage)[^/]*\.sh$/,
];

function versionados(): string[] {
  try {
    return execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

describe('la raíz del repositorio se mantiene limpia', () => {
  it('ningún artefacto de entrega queda versionado', () => {
    const todos = versionados();
    if (!todos.length) return;
    const intrusos = todos.filter((f) => ARTEFACTO.some((re) => re.test(f)));
    expect(intrusos, 'retírelos con `git rm --cached`').toEqual([]);
  });

  it('la raíz sólo contiene configuración, no documentos sueltos', () => {
    const todos = versionados();
    if (!todos.length) return;
    const enRaiz = todos.filter((f) => !f.includes('/'));
    const sobran = enRaiz.filter((f) => !RAIZ_PERMITIDA.has(f));
    expect(
      sobran,
      'la documentación va en docs/. Si de verdad tiene que vivir en la raíz, añádalo a RAIZ_PERMITIDA con su motivo',
    ).toEqual([]);
  });

  it('ningún archivo versionado está vacío', () => {
    // Un archivo de cero bytes nunca es intencional: es un `>` mal escrito.
    const vacios = versionados().filter((f) => {
      try {
        return statSync(join(process.cwd(), f)).size === 0;
      } catch {
        return false;
      }
    });
    expect(vacios, 'son redirigidos mal escritos, no contenido').toEqual([]);
  });

  it('ningún archivo versionado se llama como una rama', () => {
    /**
     * Había un archivo `main` de cero bytes en la raíz. Con él presente,
     * `git log main` responde «ambiguous argument 'main': both revision and
     * filename» y hay que escribir `git log main --` para desambiguar. Un
     * repositorio en el que los comandos de git fallan por el nombre de un
     * archivo vacío es un repositorio con una trampa puesta.
     */
    const colisiones = versionados().filter((f) =>
      ['main', 'master', 'HEAD', 'FETCH_HEAD', 'ORIG_HEAD'].includes(f),
    );
    expect(colisiones, 'chocan con nombres de referencia de git').toEqual([]);
  });
});

describe('el README describe el repositorio que existe', () => {
  /**
   * POR QUÉ ESTO ES UNA PRUEBA Y NO UNA REVISIÓN.
   *
   * El README es el primer archivo que abre quien hereda esto —una persona o
   * un agente que va a editar el código—, y es el único que nadie ejecuta, así
   * que envejece sin hacer ruido. El que había mandaba crear una cuenta en
   * OpenAI y poner `OPENAI_API_KEY`. El chatbot corre sobre Anthropic y lee
   * `ANTHROPIC_API_KEY`: siguiendo esas instrucciones se paga a un proveedor
   * equivocado y el chat sigue sin funcionar, sin ningún error que lo explique.
   * Decía además que el sitio usaba imágenes de relleno —hay 459 archivos— y
   * que usaba Tailwind 4, que es la 3.
   *
   * Aquí sólo se comprueba lo comprobable: que los comandos existan, que los
   * archivos citados estén y que las variables sean las que lee el código.
   * La prosa sigue siendo responsabilidad de quien escribe.
   */
  /**
   * Se lee SIN try/catch, a propósito. La primera versión lo envolvía en uno
   * que devolvía cadena vacía, y cada prueba empezaba con `if (!readme)
   * return`. Faltaba el import de `readFileSync`, así que el catch se tragaba
   * un ReferenceError y las cinco pruebas pasaban sin comprobar nada: las
   * saboteé a propósito para verificarlas y me dijeron que todo estaba bien.
   * Una prueba que no puede fallar es peor que ninguna, porque ocupa su sitio.
   * Si el README no existe, esto revienta, que es lo correcto.
   */
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

  it('cada `npm run` que menciona existe en package.json', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const citados = [...readme.matchAll(/npm run ([a-z:]+)/g)].map((m) => m[1]);
    const ausentes = [...new Set(citados)].filter((c) => !(c in (pkg.scripts ?? {})));
    expect(ausentes, 'el README manda ejecutar comandos que no existen').toEqual([]);
  });

  it('cada archivo de lib/ que cita existe', () => {
    const citados = [...readme.matchAll(/`(lib\/[a-z-]+\.ts)`/g)].map((m) => m[1]);
    const ausentes = [...new Set(citados)].filter((f) => !existsSync(join(process.cwd(), f)));
    expect(ausentes, 'el README describe archivos que ya no están').toEqual([]);
  });

  it('cada variable de entorno que cita está en .env.example', () => {
    const ejemplo = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
    const citadas = [...readme.matchAll(/`([A-Z][A-Z0-9_]{4,})`/g)].map((m) => m[1]);
    const ausentes = [...new Set(citadas)]
      // Se citan también las que el código NO lee, para desmentirlas.
      .filter((v) => v !== 'OPENAI_API_KEY')
      .filter((v) => !ejemplo.includes(v));
    expect(ausentes, 'variables citadas en el README que .env.example no declara').toEqual([]);
  });

  it('no manda configurar la clave del proveedor equivocado', () => {
    // Mencionarla para desmentirla es correcto; mandar ponerla, no.
    expect(readme).not.toMatch(/OPENAI_API_KEY\s*=/);
    expect(readme, 'el chatbot lee ANTHROPIC_API_KEY').toContain('ANTHROPIC_API_KEY');
  });

  it('no se atribuye lo que la empresa no puede respaldar', () => {
    // Las mismas reglas que rigen el sitio rigen su documentación.
    // Ojo con el gato que se muerde la cola: la primera versión de esta
    // prueba falló contra el README limpio, porque el párrafo que explica de
    // dónde salió la regla reproducía la cifra inventada. Documentar un error
    // no puede exigir repetirlo. Si vuelve a pasar, se reformula el texto —
    // nunca se debilita la regla.
    for (const re of [
      /(m[áa]s de|\+)\s*\d[\d.,]*\s*(empresas|clientes|obras)/i,
      /\b(somos|estamos)\s+certificad/i,
      /nivel internacional/i,
    ]) {
      expect(readme, `el README afirma algo que el sitio no afirma: ${re}`).not.toMatch(re);
    }
  });
});
