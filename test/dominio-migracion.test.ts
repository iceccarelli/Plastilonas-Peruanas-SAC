import { describe, it, expect } from 'vitest';
import { migracionActiva } from '../middleware';

/**
 * Esta prueba existe por un incidente concreto: una versión del middleware
 * emitía `X-Robots-Tag: noindex` en todo host *.vercel.app SIN comprobar si el
 * dominio de marca ya estaba vivo. Como el sitio se sirve hoy desde
 * plastilonas-peruanas-sac.vercel.app, ese despliegue habría desindexado el
 * sitio entero y IndexNow habría estado empujando páginas noindex.
 *
 * El invariante que se protege: mientras CANONICAL_ORIGIN no apunte al dominio
 * de marca, NADA degrada la indexabilidad del host actual.
 */
describe('interruptor de migración de dominio', () => {
  it('está apagado cuando no hay CANONICAL_ORIGIN (estado actual del proyecto)', () => {
    expect(migracionActiva({})).toBe(false);
    expect(migracionActiva({ CANONICAL_ORIGIN: '' })).toBe(false);
    expect(migracionActiva({ CANONICAL_ORIGIN: '   ' })).toBe(false);
  });

  it('sigue apagado si CANONICAL_ORIGIN apunta al propio host de Vercel', () => {
    expect(
      migracionActiva({
        CANONICAL_ORIGIN: 'https://plastilonas-peruanas-sac.vercel.app',
      }),
    ).toBe(false);
  });

  it('no se enciende con una URL malformada', () => {
    expect(migracionActiva({ CANONICAL_ORIGIN: 'plastilonas.com' })).toBe(false);
    expect(migracionActiva({ CANONICAL_ORIGIN: 'no-es-una-url' })).toBe(false);
  });

  it('se enciende con el dominio de marca, con o sin www', () => {
    expect(migracionActiva({ CANONICAL_ORIGIN: 'https://plastilonas.com' })).toBe(true);
    expect(migracionActiva({ CANONICAL_ORIGIN: 'https://www.plastilonas.com' })).toBe(true);
  });
});
