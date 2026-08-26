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
const OMITIR = new Set(['node_modules', '.next', '.git', 'test', 'docs']);

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

  /**
   * EL HOST DE MARCA TAMBIÉN SE VIGILA, Y NO SÓLO EL VIGENTE.
   *
   * La prueba de arriba busca el host que SITE.url tiene hoy. Eso deja pasar lo
   * contrario, que es el error que de verdad ocurrió: `public/entidad.json`
   * declaraba `"@id": "https://plastilonas.com/#organization"` mientras el sitio
   * se servía desde el host de Vercel, y se servía tal cual en /entidad.json. Un
   * `@id` que no coincide con el origen rastreado no consolida la entidad: la
   * parte en dos y desperdicia las señales de las dos mitades.
   *
   * Se miran sólo las carpetas cuyo contenido SE SIRVE. scripts/ queda fuera a
   * propósito: verify-domain-redirect.mjs necesita nombrar el dominio antiguo
   * porque su trabajo es justamente comprobar la redirección desde él.
   */
  it('ningún archivo servido escribe el host de marca a mano', () => {
    const servidas = ['app', 'lib', 'components', 'public'].flatMap((d) => {
      try {
        return fuentes(d);
      } catch {
        return [];
      }
    });
    const jsonServido = (() => {
      try {
        return readdirSync(join(raiz, 'public'), { withFileTypes: true })
          .filter((e) => e.isFile() && e.name.endsWith('.json'))
          .map((e) => `public/${e.name}`);
      } catch {
        return [];
      }
    })();
    const culpables: string[] = [];
    for (const r of [...servidas, ...jsonServido]) {
      if (r === 'lib/site.ts') continue;
      const src = readFileSync(join(raiz, r), 'utf8');
      const codigo = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        // El correo comercial vive de verdad en el dominio de marca —el MX ya
        // apunta ahí aunque el sitio todavía no—, así que una dirección de
        // correo no es una URL canónica mal escrita. Lo que se persigue es un
        // HOST emitido como origen, no una cuenta de correo.
        .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, '');
      if (codigo.includes(SITE.brandHost)) culpables.push(r);
    }
    expect(
      culpables,
      `emiten «${SITE.brandHost}» mientras el origen canónico es ${SITE.url}: ` +
        `un @id que no coincide con el host rastreado parte la entidad. ` +
        `Derive de SITE.url. Culpables: ${culpables.join(', ')}`,
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
