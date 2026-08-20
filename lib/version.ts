import { SITE } from './site';

/**
 * Sello de compilación. Se resuelve en tiempo de BUILD, no de petición: las
 * variables de Vercel sólo existen mientras se construye, y el endpoint que
 * lo publica es estático.
 *
 * Ninguno de estos datos es sensible: el SHA de un commit y el nombre de la
 * rama no revelan nada que el repositorio no muestre. No se expone ninguna
 * variable de entorno que no sea de la propia plataforma.
 */

export interface BuildStamp {
  /** SHA completo del commit desplegado. Vacío fuera de Vercel. */
  commit: string;
  /** Los siete primeros caracteres: lo que imprime `git rev-parse --short`. */
  commitShort: string;
  /** Rama de origen. */
  branch: string;
  /** production | preview | development. */
  entorno: string;
  /** Origen canónico según lib/site.ts, para detectar despliegues cruzados. */
  siteUrl: string;
}

export function buildStamp(): BuildStamp {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  return {
    commit,
    commitShort: commit.slice(0, 7),
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    entorno: process.env.VERCEL_ENV ?? 'local',
    siteUrl: SITE.url,
  };
}
