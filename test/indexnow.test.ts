import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isValidIndexNowKey, INDEXNOW_KEY_PATTERN } from '@/lib/indexnow';
import { siteUrl } from '@/lib/stripe';
import { SITE } from '@/lib/site';

const ROOT = process.cwd();

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
