import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NADA DE LO QUE EL COMPRADOR YA DIJO SE PIERDE EN EL ÚLTIMO PASO.
 *
 * EL DEFECTO QUE ESTO CIERRA. El configurador de big bags enviaba al RFQ la
 * configuración completa —capacidad, tapa, fondo, asas, factor de seguridad—
 * en `?notas=`, y /cotizacion sólo leía `?nota=`. El dato se descartaba en
 * silencio: el comprador que se había tomado el trabajo de configurar su
 * bolsón llegaba a un formulario vacío. Lo mismo con los hubs de aplicación.
 * Y el asistente enlazaba `?origen=chat` desde hacía etapas sin que nadie lo
 * leyera, así que no había forma de saber cuántas solicitudes produce el chat.
 *
 * Un parámetro que nadie lee no falla: se pierde. Por eso esta prueba compara
 * los DOS lados —lo que los enlaces mandan y lo que las páginas leen— en vez
 * de confiar en que quien añada un enlace se acuerde del otro extremo.
 */

const raiz = process.cwd();

/** Páginas de destino y el archivo donde declaran lo que leen. */
const DESTINOS: Record<string, string> = {
  '/cotizacion': 'app/(es)/cotizacion/page.tsx',
  '/en/rfq': 'app/(en)/en/rfq/page.tsx',
};

function fuentes(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) fuentes(rel, out);
    else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

const archivos = [...fuentes('app'), ...fuentes('components')];

/** Parámetros que una página declara leer, según su tipo `searchParams`. */
function leidosPor(archivo: string): Set<string> {
  const src = readFileSync(join(raiz, archivo), 'utf8');
  const bloque = src.match(/searchParams:\s*Promise<\{([\s\S]*?)\}>/);
  if (!bloque) return new Set();
  return new Set([...bloque[1].matchAll(/(\w+)\??:/g)].map((m) => m[1]));
}

/** Enlaces literales hacia una página de destino, con sus parámetros. */
function enviados(): { archivo: string; destino: string; param: string }[] {
  const out: { archivo: string; destino: string; param: string }[] = [];
  for (const f of archivos) {
    const src = readFileSync(join(raiz, f), 'utf8');
    for (const m of src.matchAll(/\/(cotizacion|en\/rfq)\?([^`"')\s]*)/g)) {
      const destino = `/${m[1]}`;
      for (const trozo of m[2].split('&')) {
        const clave = trozo.match(/^([a-zA-Z_]+)=/);
        if (clave) out.push({ archivo: f, destino, param: clave[1] });
      }
    }
  }
  return out;
}

describe('los dos extremos del enlace al RFQ coinciden', () => {
  it('cada parámetro enviado lo lee la página de destino', () => {
    const huerfanos: string[] = [];
    for (const { archivo, destino, param } of enviados()) {
      const pagina = DESTINOS[destino];
      if (!pagina) {
        huerfanos.push(`${archivo} → ${destino} (destino desconocido)`);
        continue;
      }
      if (!leidosPor(pagina).has(param)) huerfanos.push(`${archivo} manda ?${param}= y ${pagina} no lo lee`);
    }
    expect(huerfanos.join('\n'), 'un parámetro que nadie lee no falla: se pierde').toBe('');
  });

  it('/cotizacion sigue leyendo los cuatro que recibe de verdad', () => {
    const leidos = leidosPor(DESTINOS['/cotizacion']);
    for (const p of ['producto', 'comparativa', 'nota', 'notas', 'origen']) {
      expect(leidos.has(p), `/cotizacion dejó de leer ?${p}=`).toBe(true);
    }
  });

  it('el origen viaja hasta el lead y hasta el CRM', () => {
    // Sin esto, «¿cuántos RFQ salen del chat?» no tiene respuesta posible.
    expect(readFileSync(join(raiz, 'lib/lead.ts'), 'utf8')).toContain('origen?: string');
    const api = readFileSync(join(raiz, 'app/api/lead/route.ts'), 'utf8');
    expect(api, 'zod descarta en silencio lo que no declara').toMatch(/origen:\s*z\.string\(\)/);
    expect(api, 'la fuente del lead es la ruta real, no una fija').toContain('fuenteDe(lead)');
  });

  it('las superficies que producen solicitudes se identifican', () => {
    const conOrigen = enviados().filter((e) => e.param === 'origen').map((e) => e.archivo);
    for (const archivo of [
      'components/Chatbot.tsx',
      'components/CalculadoraForm.tsx',
      'app/(es)/configurador/page.tsx',
    ]) {
      expect(conOrigen, `${archivo} no etiqueta su origen`).toContain(archivo);
    }
  });
});
