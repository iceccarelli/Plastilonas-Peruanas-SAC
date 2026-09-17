import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, TELEFONOS } from '@/lib/site';
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/whatsapp';

/**
 * EL WHATSAPP COMERCIAL CAMBIÓ Y NO PUEDE QUEDAR NINGÚN NÚMERO VIEJO.
 *
 * `SITE.phoneWhatsApp` en lib/site.ts es la única fuente: todo lo demás
 * (WHATSAPP_NUMBER, TELEFONOS.whatsapp, cada enlace wa.me del sitio) se
 * deriva de ahí. Esta prueba fija el número nuevo y recorre el repositorio en
 * busca del viejo — no basta con comprobar el archivo fuente, porque un
 * número puede colarse escrito a mano en cualquier componente.
 */

const NUMERO_VIEJO = '946085270';
const NUMERO_NUEVO = '924875632';

describe('SITE.phoneWhatsApp: el número comercial vigente', () => {
  it('es el nuevo número, en E.164', () => {
    expect(SITE.phoneWhatsApp).toBe(`+51${NUMERO_NUEVO}`);
  });

  it('TELEFONOS.whatsapp y el helper de wa.me derivan del mismo dato', () => {
    expect(TELEFONOS.whatsapp.e164).toBe(SITE.phoneWhatsApp);
    expect(TELEFONOS.whatsapp.waNumber).toBe(`51${NUMERO_NUEVO}`);
    expect(TELEFONOS.whatsapp.display).toBe('+51 924 875 632');
    expect(WHATSAPP_NUMBER).toBe(`51${NUMERO_NUEVO}`);
    expect(WHATSAPP_DISPLAY).toBe('+51 924 875 632');
  });

  it('whatsappUrl() genera un enlace wa.me con el número nuevo', () => {
    const url = whatsappUrl('hola');
    expect(url.startsWith(`https://wa.me/51${NUMERO_NUEVO}?text=`)).toBe(true);
  });

  it('el teléfono central NO cambió (es un canal distinto del WhatsApp comercial)', () => {
    expect(SITE.phoneCentral).toBe('+51998117065');
  });
});

/**
 * Recorre app/, components/ y lib/ buscando el número antiguo escrito a mano.
 * Se excluyen node_modules, .next y el propio archivo de prueba (que declara
 * la constante NUMERO_VIEJO a propósito, para comparar).
 */
function archivosFuente(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const ruta = join(dir, e.name);
    if (e.isDirectory()) archivosFuente(ruta, out);
    else if (/\.(ts|tsx|js|mjs|md)$/.test(e.name)) out.push(ruta);
  }
  return out;
}

describe('cero referencias al WhatsApp anterior en todo el repositorio', () => {
  const raiz = process.cwd();
  const archivos = ['app', 'components', 'lib', 'docs', 'scripts', 'data']
    .filter((d) => {
      try {
        return statSync(join(raiz, d)).isDirectory();
      } catch {
        return false;
      }
    })
    .flatMap((d) => archivosFuente(join(raiz, d)));

  it('ningún archivo fuente contiene el número antiguo', () => {
    const conNumeroViejo = archivos.filter((f) => readFileSync(f, 'utf8').includes(NUMERO_VIEJO));
    expect(conNumeroViejo.map((f) => f.slice(raiz.length + 1))).toEqual([]);
  });
});
