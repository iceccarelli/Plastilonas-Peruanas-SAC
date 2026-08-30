import { SITE } from '@/lib/site';

/**
 * Firma editorial de artículos y guías.
 *
 * Regla de honestidad: la autoría es del ÁREA, no de una persona inventada.
 * Un nombre propio ficticio con foto de stock es exactamente el tipo de
 * fabricación que /confianza promete no hacer. Cuando exista un autor real
 * dispuesto a firmar, se pasa por `autor` y sustituye al área.
 */
export default function Byline({
  autor,
  fecha,
}: {
  autor?: string;
  /** ISO YYYY-MM-DD; se muestra tal cual, sin reformatear. */
  fecha?: string;
}) {
  return (
    <p className="byline flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
      <span className="font-medium text-gray-700">
        {autor ?? `Área técnica · ${SITE.legalName}`}
      </span>
      {fecha && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={fecha}>{fecha}</time>
        </>
      )}
    </p>
  );
}
