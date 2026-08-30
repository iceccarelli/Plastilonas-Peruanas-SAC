import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isValidIndexNowKey, INDEXNOW_KEY_PATTERN, INDEXNOW_KEY, INDEXNOW_KEY_PATH } from '@/lib/indexnow';
import { siteUrl } from '@/lib/stripe';
import { SITE } from '@/lib/site';

const ROOT = process.cwd();

/**
 * El archivo sin comentarios.
 *
 * Es la cuarta vez en este repositorio que un test falla contra su propia
 * prosa: el comentario que EXPLICA por qué ya no se usa `process.env` contiene
 * la cadena `process.env`. Se afirma sobre el código, no sobre lo que el
 * código dice de sí mismo.
 */
const sinComentarios = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('IndexNow: el envío sigue el índice de sitemaps', () => {
  const script = readFileSync(join(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');

  /**
   * REGRESIÓN REAL, ATRAPADA AQUÍ.
   *
   * Al partir /sitemap.xml en un <sitemapindex> con cuatro hijos, este script
   * —que leía <loc> del primer nivel— pasó a enviar CUATRO URLs (las de los
   * propios sitemaps) en lugar de las ~280 páginas. Y lo hacía con salida 200
   * y un «4 URLs enviadas» que nadie iba a leer como avería: el canal de
   * distribución apagado mientras todo parecía correcto, que es exactamente
   * el incidente que la cabecera de este script documenta.
   */
  it('detecta el índice y desciende a los sitemaps hijos', () => {
    expect(script).toMatch(/sitemapindex/);
    expect(sinComentarios(script)).toMatch(/for \(const hijo of hijos\)/);
  });

  it('falla ruidosamente si un sitemap hijo viene vacío', () => {
    const codigo = sinComentarios(script);
    expect(codigo).toMatch(/no declara ninguna URL/);
    expect(codigo).toMatch(/no declara ningún sitemap hijo/);
  });

  it('la verificación de despliegue cuenta URLs en los hijos, no en el índice', () => {
    const verificacion = readFileSync(join(ROOT, 'scripts/verificar-despliegue.sh'), 'utf8');
    // Contar <loc> en el índice da 4 y daría por bueno cualquier hijo vacío.
    expect(verificacion).toMatch(/sitemaps\/productos\.xml"\s+'<loc>'/);
    expect(verificacion).toMatch(/sitemaps\/pages\.xml"\s+'<loc>'/);
  });
});

describe('IndexNow: prueba de propiedad', () => {
  it('acepta claves dentro del rango de la especificación (8–128)', () => {
    expect(isValidIndexNowKey('a'.repeat(8))).toBe(true);
    expect(isValidIndexNowKey('a'.repeat(128))).toBe(true);
    expect(isValidIndexNowKey('7f3c9b1e-42aa-4d0e-9c11-5b6d7e8f9a0b')).toBe(true);
  });

  it('rechaza claves cortas, largas, vacías o con caracteres no admitidos', () => {
    expect(isValidIndexNowKey('corta')).toBe(false);
    expect(isValidIndexNowKey('a'.repeat(129))).toBe(false);
    expect(isValidIndexNowKey('')).toBe(false);
    expect(isValidIndexNowKey(undefined)).toBe(false);
    expect(isValidIndexNowKey('clave con espacios')).toBe(false);
    expect(isValidIndexNowKey('clave_con_guion_bajo')).toBe(false);
  });

  it('el patrón está anclado: no valida una subcadena dentro de basura', () => {
    expect(INDEXNOW_KEY_PATTERN.test('!!!validkey123!!!')).toBe(false);
  });
});

describe('IndexNow: el canal no depende de que nadie configure una consola', () => {
  /**
   * El fallo que esto impide ya ocurrió y duró semanas: la clave salía de
   * `process.env.INDEXNOW_KEY`, nadie la configuró, /indexnow-key.txt
   * respondía 404 y el flujo de GitHub estaba condicionado a una variable que
   * tampoco existía. El sitio publicaba 163 URLs sin avisar a un solo
   * buscador, y todas las verificaciones daban verde porque todas miraban otra
   * cosa.
   */
  const ruta = readFileSync(join(ROOT, 'app/indexnow-key.txt/route.ts'), 'utf8');
  const flujo = readFileSync(join(ROOT, '.github/workflows/seo-maintenance.yml'), 'utf8');
  const envio = readFileSync(join(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');

  it('la clave está en el repositorio y es válida', () => {
    expect(isValidIndexNowKey(INDEXNOW_KEY)).toBe(true);
    expect(INDEXNOW_KEY.length).toBeGreaterThanOrEqual(16);
  });

  it('la ruta sirve la clave siempre, no un 404 condicional', () => {
    expect(ruta).toMatch(/from '@\/lib\/indexnow'/);
    expect(ruta).toMatch(/new Response\(INDEXNOW_KEY/);
    expect(sinComentarios(ruta), 'volvió a depender del entorno').not.toMatch(/process\.env/);
  });

  it('no hay una segunda fuente de la clave que pueda divergir', () => {
    // Con dos orígenes, configurarla en Vercel y no en Actions produce un 403
    // silencioso: el archivo publica una clave y el envío usa otra.
    const fuentes = [
      ['lib', readFileSync(join(ROOT, 'lib/indexnow.ts'), 'utf8')],
      ['envío', envio],
      ['flujo', flujo],
    ] as const;
    for (const [nombre, src] of fuentes) {
      expect(
        sinComentarios(src),
        `${nombre} vuelve a leer INDEXNOW_KEY del entorno`,
      ).not.toMatch(/process\.env\.INDEXNOW_KEY|secrets\.INDEXNOW_KEY/);
    }
  });

  it('el flujo de mantenimiento no está condicionado a una variable', () => {
    // Los comentarios de YAML empiezan por #, no por //.
    const flujoSinNotas = flujo.replace(/^\s*#.*$/gm, '');
    expect(flujoSinNotas, 'volvió la condición que lo mantuvo apagado').not.toMatch(/if:\s*\$\{\{\s*vars\./);
    expect(flujo).toMatch(/submit-indexnow\.mjs/);
    expect(flujo).toMatch(/push:/);
  });

  it('el envío lee la clave y el dominio del propio repositorio', () => {
    expect(envio).toMatch(/lib\/indexnow/);
    expect(envio).toMatch(/lib\/site/);
    expect(sinComentarios(envio), 'volvió a depender de SITE_URL del entorno').not.toMatch(/process\.env\.SITE_URL/);
  });

  it('la ruta pública declarada coincide con la que usa el envío', () => {
    expect(INDEXNOW_KEY_PATH).toBe('/indexnow-key.txt');
    expect(envio).toContain(INDEXNOW_KEY_PATH);
  });
});

describe('IndexNow: el script de envío', () => {
  const script = readFileSync(join(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');

  it('deriva las URLs del sitemap y no de una lista fija', () => {
    expect(script).toContain('/sitemap.xml');
    expect(script).toMatch(/<loc>/);
  });

  it('apunta keyLocation al archivo que el sitio publica realmente', () => {
    expect(script).toContain('/indexnow-key.txt');
    expect(script).not.toMatch(/\$\{KEY\}\.txt/);
  });

  it('verifica la prueba de propiedad antes de enviar', () => {
    expect(script).toContain('KEY_LOCATION');
    expect(script).toMatch(/proof/i);
  });

  it('trata 200 y 202 como éxito, según la especificación', () => {
    expect(script).toContain('res.status === 200');
    expect(script).toContain('res.status === 202');
  });
});

describe('llms.txt: una sola fuente de verdad', () => {
  it('/llms.txt se sirve desde el route handler', () => {
    expect(existsSync(join(ROOT, 'app/llms.txt/route.ts'))).toBe(true);
  });

  it('NO existe public/llms.txt: un estático ahí sombrearía la ruta curada', () => {
    expect(existsSync(join(ROOT, 'public/llms.txt'))).toBe(false);
    expect(existsSync(join(ROOT, 'public/llms-full.txt'))).toBe(false);
  });

  it('ningún script regenera llms.txt en paralelo al route handler', () => {
    expect(existsSync(join(ROOT, 'scripts/generate-llms.mjs'))).toBe(false);
  });

  it('el workflow ya no ejecuta ni commitea el generador de llms', () => {
    const wf = readFileSync(join(ROOT, '.github/workflows/seo-maintenance.yml'), 'utf8');
    // Se comprueba la INVOCACIÓN, no la prosa: el comentario del workflow
    // explica por qué se retiró y debe poder nombrar el script.
    expect(wf).not.toMatch(/node\s+scripts\/generate-llms/);
    expect(wf).not.toMatch(/git\s+add[^\n]*llms/);
    expect(wf).not.toMatch(/git\s+commit[^\n]*llms/);
  });
});

describe('URLs de retorno de Stripe', () => {
  it('nunca cae a localhost fuera de desarrollo', () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    try {
      expect(siteUrl()).toBe(SITE.url);
      expect(siteUrl()).not.toContain('localhost');
    } finally {
      if (original !== undefined) process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it('respeta NEXT_PUBLIC_SITE_URL y le quita la barra final', () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.plastilonas.com/';
    try {
      expect(siteUrl()).toBe('https://www.plastilonas.com');
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });
});
