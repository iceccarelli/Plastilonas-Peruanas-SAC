import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '@/lib/site';

/**
 * UN SOLO SITIO ESCRIBE EL DOMINIO.
 *
 * Por qué importa ahora y no «algún día». plastilonas.com está VIVO, con el
 * sitio antiguo, los mismos productos y la misma ciudad. Mientras tanto este
 * sitio vive en un subdominio de vercel.app, que está en la Public Suffix List
 * y que ningún comprador va a teclear ni enlazar. Los dos dominios compiten
 * por las mismas consultas y parten las señales de entidad.
 *
 * La mudanza es UNA LÍNEA —`SITE.url` en lib/site.ts— y estas pruebas existen
 * para que siga siéndolo. Cada dominio escrito a mano fuera de ese archivo es
 * una línea más que habrá que recordar el día del cambio, y la que se olvide
 * será la que emita una URL canónica equivocada.
 *
 * Hoy había tres: la fuente de verdad y dos cadenas de User-Agent. Las dos
 * ahora derivan de SITE.url.
 */

const raiz = process.cwd();
const EXTS = /\.(ts|tsx|mjs|js|yml|yaml)$/;
const OMITIR = new Set(['node_modules', '.next', '.git', 'test', 'docs', 'public']);

function fuentes(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (OMITIR.has(e.name)) continue;
    const r = `${dir}/${e.name}`;
    if (e.isDirectory()) fuentes(r, out);
    else if (EXTS.test(e.name)) out.push(r);
  }
  return out;
}

describe('el origen canónico se declara una sola vez', () => {
  const archivos = ['app', 'lib', 'components', 'scripts', '.github'].flatMap((d) => {
    try {
      return fuentes(d);
    } catch {
      return [];
    }
  });

  it('encuentra código que auditar', () => {
    expect(archivos.length).toBeGreaterThan(50);
  });

  it('ningún archivo salvo lib/site.ts escribe el dominio a mano', () => {
    const host = new URL(SITE.url).host;
    const culpables: string[] = [];
    for (const r of archivos) {
      if (r === 'lib/site.ts') continue;
      const src = readFileSync(join(raiz, r), 'utf8');
      // Los comentarios pueden nombrar el dominio para explicar algo; lo que
      // no puede es EMITIRSE. Se mira el código, no la prosa.
      const codigo = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/^\s*#.*$/gm, '');
      if (codigo.includes(host)) culpables.push(r);
    }
    expect(
      culpables,
      `escriben «${host}» a mano y romperían la mudanza a plastilonas.com: ${culpables.join(', ')}`,
    ).toEqual([]);
  });

  it('lib/site.ts documenta cómo se hace la mudanza', () => {
    const src = readFileSync(join(raiz, 'lib/site.ts'), 'utf8');
    expect(src).toMatch(/plastilonas\.com/);
    expect(src).toMatch(/CANONICAL ORIGIN|ORIGEN CANÓNICO/i);
  });

  it('el origen no lleva barra final: la duplicaría en cada URL emitida', () => {
    expect(SITE.url.endsWith('/')).toBe(false);
    expect(SITE.url.startsWith('https://')).toBe(true);
  });
});
