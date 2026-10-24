import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { estadoMigracion, origenCanonico, decidirHost } from '../lib/site';

/**
 * UN HOST CANÓNICO (www) Y UN ESTADO EXPLÍCITO.
 *
 * Invariante histórico: mientras la variable no apunte al host de marca, NADA
 * degrada la indexabilidad del host vigente (un noindex en vercel.app sin un
 * dominio vivo que reciba la autoridad borraría el sitio de Google).
 *
 * Invariante nuevo: el apex NUNCA es canónico. Vercel redirige apex → www con
 * 308 a nivel de plataforma; un canónico en el apex haría que el middleware
 * (www → apex) y la plataforma (apex → www) se redirigieran en bucle.
 */
const VERCEL = 'plastilonas-peruanas-sac.vercel.app';
const WWW = 'https://www.plastilonas.com';

describe('estado de la migración', () => {
  it('pendiente sin variable, en blanco, malformada o http', () => {
    for (const env of [
      {},
      { NEXT_PUBLIC_CANONICAL_HOST: '' },
      { CANONICAL_ORIGIN: '   ' },
      { CANONICAL_ORIGIN: 'plastilonas.com' },
      { CANONICAL_ORIGIN: 'no-es-una-url' },
      { NEXT_PUBLIC_CANONICAL_HOST: 'http://www.plastilonas.com' },
    ]) {
      expect(estadoMigracion(env)).toBe('pendiente');
      expect(origenCanonico(env)).toBe(`https://${VERCEL}`);
    }
  });

  it('apuntar al propio host de Vercel no enciende nada', () => {
    const env = { CANONICAL_ORIGIN: `https://${VERCEL}` };
    expect(estadoMigracion(env)).toBe('pendiente');
    expect(origenCanonico(env)).toBe(`https://${VERCEL}`);
  });

  it('www es el único canónico de marca; ambos nombres de variable valen', () => {
    for (const env of [{ NEXT_PUBLIC_CANONICAL_HOST: WWW }, { CANONICAL_ORIGIN: WWW }, { CANONICAL_ORIGIN: `${WWW}/` }]) {
      expect(estadoMigracion(env)).toBe('canonico');
      expect(origenCanonico(env)).toBe(WWW);
    }
  });

  it('NEXT_PUBLIC_CANONICAL_HOST gana sobre CANONICAL_ORIGIN', () => {
    const env = { NEXT_PUBLIC_CANONICAL_HOST: WWW, CANONICAL_ORIGIN: 'https://plastilonas.com' };
    expect(estadoMigracion(env)).toBe('canonico');
    expect(origenCanonico(env)).toBe(WWW);
  });

  it('el apex y cualquier variante de marca ambigua son INVÁLIDOS y no mueven nada', () => {
    for (const v of [
      'https://plastilonas.com',
      'https://blog.plastilonas.com',
      `${WWW}/productos`,
      `${WWW}?x=1`,
      `${WWW}:8443`,
      'https://user:pw@www.plastilonas.com',
    ]) {
      const env = { NEXT_PUBLIC_CANONICAL_HOST: v, ENFORCE_BRAND_DOMAIN: 'true' };
      expect(estadoMigracion(env), v).toBe('invalida');
      expect(origenCanonico(env), v).toBe(`https://${VERCEL}`);
      expect(decidirHost({ host: VERCEL, ruta: '/', protocolo: 'https' }, env), v).toEqual({ accion: 'ninguna' });
    }
  });

  it('forzado exige canónico y el valor EXACTO "true"', () => {
    expect(estadoMigracion({ NEXT_PUBLIC_CANONICAL_HOST: WWW, ENFORCE_BRAND_DOMAIN: 'true' })).toBe('forzado');
    for (const v of ['TRUE', '1', 'yes', ' true']) {
      expect(estadoMigracion({ NEXT_PUBLIC_CANONICAL_HOST: WWW, ENFORCE_BRAND_DOMAIN: v })).toBe('canonico');
    }
    expect(estadoMigracion({ ENFORCE_BRAND_DOMAIN: 'true' })).toBe('pendiente');
  });
});

describe('decisión por host', () => {
  const canonico = { NEXT_PUBLIC_CANONICAL_HOST: WWW };
  const forzado = { ...canonico, ENFORCE_BRAND_DOMAIN: 'true' };
  const ruta = '/productos/geomembranas-pvc';
  const query = '?utm_source=google&q=a%20b';

  it('pendiente: ni noindex ni redirección en NINGÚN host', () => {
    for (const host of [VERCEL, 'www.plastilonas.com', 'plastilonas.com', 'localhost:3000']) {
      for (const protocolo of ['http', 'https']) {
        expect(decidirHost({ host, protocolo, ruta, query }, {})).toEqual({ accion: 'ninguna' });
      }
    }
  });

  it('canónico: vercel.app de producción → noindex + canonical a www con la misma ruta', () => {
    expect(decidirHost({ host: VERCEL, protocolo: 'https', ruta, query }, { ...canonico, VERCEL_ENV: 'production' })).toEqual({
      accion: 'noindex',
      canonica: `${WWW}${ruta}`,
    });
  });

  it('canónico: www y apex no se tocan (sin 308 hasta la puerta humana)', () => {
    for (const host of ['www.plastilonas.com', 'plastilonas.com']) {
      expect(decidirHost({ host, protocolo: 'https', ruta, query }, canonico)).toEqual({ accion: 'ninguna' });
    }
  });

  it('forzado: vercel.app, apex y http → 308 a https://www en UN salto, conservando ruta y query', () => {
    const esperado = { accion: 'redirigir', destino: `${WWW}${ruta}${query}` };
    expect(decidirHost({ host: VERCEL, protocolo: 'https', ruta, query }, forzado)).toEqual(esperado);
    expect(decidirHost({ host: 'plastilonas.com', protocolo: 'https', ruta, query }, forzado)).toEqual(esperado);
    expect(decidirHost({ host: 'plastilonas.com', protocolo: 'http', ruta, query }, forzado)).toEqual(esperado);
    expect(decidirHost({ host: 'www.plastilonas.com', protocolo: 'http', ruta, query }, forzado)).toEqual(esperado);
    expect(decidirHost({ host: `${VERCEL}:443`, protocolo: 'https', ruta, query }, forzado)).toEqual(esperado);
  });

  it('forzado: https://www ya es el destino → nunca redirige (sin bucle)', () => {
    expect(decidirHost({ host: 'www.plastilonas.com', protocolo: 'https', ruta, query }, forzado)).toEqual({ accion: 'ninguna' });
    expect(decidirHost({ host: 'www.plastilonas.com', ruta, query }, forzado)).toEqual({ accion: 'ninguna' });
  });

  it('forzado: un host ajeno (localhost, dominio desconocido) no se redirige', () => {
    for (const host of ['localhost:3000', 'ejemplo.test', 'evil-plastilonas.com']) {
      expect(decidirHost({ host, protocolo: 'https', ruta, query }, forzado)).toEqual({ accion: 'ninguna' });
    }
  });

  it('previsualizaciones: siempre noindex, JAMÁS redirección (ni siquiera forzado)', () => {
    const host = 'plastilonas-peruanas-sac-git-rama-iceccarellis-projects.vercel.app';
    for (const env of [{ VERCEL_ENV: 'preview' }, { ...forzado, VERCEL_ENV: 'preview' }]) {
      expect(decidirHost({ host, protocolo: 'https', ruta, query }, env)).toEqual({ accion: 'noindex', canonica: null });
    }
  });
});

describe('middleware aplicado a una petición real', () => {
  afterEach(() => vi.unstubAllEnvs());
  const pedir = async (url: string, headers: Record<string, string>) => {
    const { middleware } = await import('../middleware');
    return middleware(new NextRequest(url, { headers }));
  };

  it('forzado: 308 con Location absoluta hacia www, ruta y query intactas', async () => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', WWW);
    vi.stubEnv('ENFORCE_BRAND_DOMAIN', 'true');
    const res = await pedir(`https://${VERCEL}/productos/mantas-cobertoras?a=1&b=2`, { host: VERCEL });
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe(`${WWW}/productos/mantas-cobertoras?a=1&b=2`);
  });

  it('http en www → https en un salto', async () => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', WWW);
    vi.stubEnv('ENFORCE_BRAND_DOMAIN', 'true');
    const res = await pedir('http://www.plastilonas.com/contacto?x=1', { host: 'www.plastilonas.com', 'x-forwarded-proto': 'http' });
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe(`${WWW}/contacto?x=1`);
  });

  it('canónico (sin forzar): vercel.app responde 200 con noindex y Link canonical', async () => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', WWW);
    vi.stubEnv('VERCEL_ENV', 'production');
    const res = await pedir(`https://${VERCEL}/industria/mineria`, { host: VERCEL });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toMatch(/noindex/);
    expect(res.headers.get('link')).toBe(`<${WWW}/industria/mineria>; rel="canonical"`);
  });

  it('pendiente: el host vigente NO recibe noindex (estado actual de producción)', async () => {
    const res = await pedir(`https://${VERCEL}/`, { host: VERCEL });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toBeNull();
    expect(res.headers.get('link')).toBeNull();
  });
});
