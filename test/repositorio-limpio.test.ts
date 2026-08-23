import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
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
