import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

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
 */
const PERMITIDOS = new Set<string>([]);
const ARTEFACTO = [
  /\.patch$/,
  /\.diff$/,
  // Los ZIP de entrega de imágenes llegaron a sumar 51 MB en la raíz: el mismo
  // patrón que los parches, con el mismo coste. Las imágenes van a
  // public/images/, el contenedor no se queda.
  /\.zip$/,
  /^integrar.*\.sh$/,
  /^(aplicar|apply).*\.sh$/,
];

describe('la raíz del repositorio se mantiene limpia', () => {
  it('ningún artefacto de entrega queda versionado', () => {
    let versionados: string[] = [];
    try {
      versionados = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    } catch { return; }
    const intrusos = versionados.filter(
      (f) => !PERMITIDOS.has(f) && ARTEFACTO.some((re) => re.test(f)),
    );
    expect(intrusos, 'retírelos con `git rm --cached`').toEqual([]);
  });
});
