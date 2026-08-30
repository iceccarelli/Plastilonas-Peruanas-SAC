import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LA FRONTERA ENTRE SERVIDOR Y CLIENTE.
 *
 * El fallo que este archivo existe para impedir ya ocurrió, y llegó hasta el
 * despliegue: se pasó un objeto `Calculadora` —que lleva dentro su método
 * `calcular`— desde un componente de servidor a uno de cliente. React
 * serializa las props para cruzar esa frontera, y una función no se serializa.
 *
 * Lo grave no es el error: es DÓNDE aparece. `tsc` lo da por bueno, porque en
 * TypeScript la prop es perfectamente válida. Las pruebas unitarias lo dan por
 * bueno, porque llaman a la función directamente y nunca cruzan nada. El único
 * que se entera es `next build`, en la fase de prerenderizado, y para entonces
 * el commit ya está empujado y el despliegue en cola.
 *
 * De ahí estas dos comprobaciones. La primera es estructural y corre en
 * milisegundos; la segunda vigila que `next build` siga formando parte de la
 * verificación, que es lo que de verdad cierra el agujero.
 */

const raiz = process.cwd();

function archivos(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    if (e.isDirectory()) archivos(`${dir}/${e.name}`, out);
    else if (/\.tsx?$/.test(e.name)) out.push(`${dir}/${e.name}`);
  }
  return out;
}

/** Interfaces y tipos exportados que llevan una función dentro. */
function tiposConFuncion(): Map<string, string> {
  const encontrados = new Map<string, string>();
  for (const ruta of archivos('lib')) {
    const src = readFileSync(join(raiz, ruta), 'utf8');
    const re = /export\s+(?:interface|type)\s+(\w+)\s*(?:=\s*)?\{/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      // Cuerpo del bloque, contando llaves.
      let i = src.indexOf('{', m.index);
      let nivel = 0;
      let fin = i;
      for (; fin < src.length; fin++) {
        if (src[fin] === '{') nivel++;
        else if (src[fin] === '}') {
          nivel--;
          if (nivel === 0) break;
        }
      }
      const cuerpo = src.slice(i + 1, fin);
      // `nombre: (...) => X`  o  `nombre(...): X`
      if (/^\s*\w+\??\s*:\s*\([^)]*\)\s*=>/m.test(cuerpo) || /^\s*\w+\??\([^)]*\)\s*:/m.test(cuerpo)) {
        encontrados.set(m[1], ruta);
      }
    }
  }
  return encontrados;
}

describe('frontera servidor/cliente: ninguna función cruza como prop', () => {
  const conFuncion = tiposConFuncion();

  it('detecta los tipos que llevan una función dentro', () => {
    // Si esto queda vacío, el resto del archivo es un test que no prueba nada.
    expect(conFuncion.size, 'ningún tipo con función: revise el detector').toBeGreaterThan(0);
    expect([...conFuncion.keys()]).toContain('Calculadora');
  });

  it('ningún componente de cliente los usa como tipo de sus props', () => {
    const clientes = [...archivos('components'), ...archivos('app')].filter((r) =>
      /^['"]use client['"]/m.test(readFileSync(join(raiz, r), 'utf8')),
    );
    expect(clientes.length, 'no se encontró ningún componente de cliente').toBeGreaterThan(3);

    for (const ruta of clientes) {
      const src = readFileSync(join(raiz, ruta), 'utf8');
      for (const [tipo, origen] of conFuncion) {
        const usadoComoProp = new RegExp(`:\\s*\\{[^}]*:\\s*${tipo}\\b|\\b\\w+:\\s*${tipo}\\s*[;,}]`).test(src);
        expect(
          usadoComoProp,
          `${ruta} recibe un ${tipo} (definido en ${origen}), que lleva una función dentro. ` +
            'Una función no se serializa al cruzar a un componente de cliente y el build ' +
            'falla en el prerenderizado. Pase un identificador y resuelva el objeto en el cliente.',
        ).toBe(false);
      }
    }
  });

  it('el formulario de calculadora recibe un slug, no la calculadora', () => {
    // La forma concreta del fallo que ya ocurrió.
    const src = readFileSync(join(raiz, 'components/CalculadoraForm.tsx'), 'utf8');
    expect(src).toMatch(/CalculadoraForm\(\{\s*slug\s*\}: \{\s*slug: string\s*\}\)/);
    const page = readFileSync(join(raiz, 'app/(es)/calculadoras/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/<CalculadoraForm slug=\{calc\.slug\}/);
    expect(page).not.toMatch(/<CalculadoraForm calc=/);
  });
});

describe('el agujero de verificación que dejó pasar el fallo', () => {
  it('hay integración continua y construye de verdad', () => {
    // `tsc` y vitest daban verde con el build roto. La única verificación que
    // ve un error de prerenderizado es `next build`, y tiene que correr en el
    // repositorio —en rojo, con el log al lado— y no solo en un panel de
    // Vercel al que hay que ir a mirar.
    const ci = readFileSync(join(raiz, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toMatch(/next build/);
    expect(ci).toMatch(/tsc --noEmit/);
    expect(ci).toMatch(/vitest run/);
    expect(ci).toMatch(/on:[\s\S]*push:/);
  });

  it('el build corre después de tipos y pruebas, no antes', () => {
    // Dos minutos de compilación para descubrir que faltaba un punto y coma
    // es la forma más segura de que alguien acabe saltándose la verificación.
    // Se mira solo la lista de pasos: el comentario de cabecera del propio
    // flujo menciona `next build` para explicar por qué existe, y comparar
    // posiciones sobre el archivo entero medía la prosa, no el orden real.
    const completo = readFileSync(join(raiz, '.github/workflows/ci.yml'), 'utf8');
    const pasos = completo.slice(completo.indexOf('    steps:'));
    expect(pasos.indexOf('tsc --noEmit')).toBeGreaterThan(-1);
    expect(pasos.indexOf('tsc --noEmit')).toBeLessThan(pasos.indexOf('next build'));
    expect(pasos.indexOf('vitest run')).toBeLessThan(pasos.indexOf('next build'));
  });

  it('package.json conserva el build de producción', () => {
    const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'));
    expect(pkg.scripts.build).toContain('next build');
  });
});
