/**
 * CONFIGURACIÓN DEL SERVICIO — todo por entorno, nada fijo en el código.
 *
 * Este servicio no tiene base de datos ni estado propio a propósito. Su única
 * verdad es el sitio: el catálogo, el glosario, la entidad y las respuestas
 * comerciales se leen de las superficies JSON que el sitio ya publica, y el
 * cálculo se importa del mismo módulo que usa la web (`lib/calculadoras.ts`).
 * Una segunda copia de esos datos sería una segunda verdad, y en este negocio
 * una segunda verdad es una cotización mal hecha.
 */

const limpiar = (u: string): string => u.trim().replace(/\/+$/, '');

/** Origen canónico del sitio. Alimenta lectura de datos, enlaces y citas. */
export const SITIO = limpiar(
  process.env.SITIO_URL || process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://plastilonas-peruanas-sac.vercel.app',
);

/** Origen público de esta API. Se publica en OpenAPI y en el descriptor MCP. */
export const ORIGEN_API = limpiar(process.env.ORIGEN_API || 'http://localhost:8080');

export const PUERTO = Number(process.env.PORT || 8080);
export const HOST = process.env.HOST || '0.0.0.0';

/**
 * Minutos que se conserva en memoria una superficie del sitio antes de volver
 * a pedirla. El sitio revalida cada hora; media hora aquí nunca sirve algo más
 * viejo que eso.
 */
export const CACHE_MINUTOS = Number(process.env.CACHE_MINUTOS || 30);

/** Peticiones por IP y por ventana de diez minutos. */
export const LIMITE_PETICIONES = Number(process.env.LIMITE_PETICIONES || 240);
/** Solicitudes de cotización por IP y por ventana de diez minutos. */
export const LIMITE_COTIZACIONES = Number(process.env.LIMITE_COTIZACIONES || 8);

export const VERSION_API = '1.0.0';
