import { notFound } from 'next/navigation';

/**
 * Atrapa-todo del 404.
 *
 * Con tres layouts raíz (grupos (es), (en) y (pt)) ya no existe un
 * app/not-found.tsx global: Next exige que el not-found viva bajo un layout.
 * Esta ruta comodín captura cualquier URL que ningún segmento reclame y
 * delega en app/(es)/not-found.tsx, que renderiza la página 404 real con la
 * cabecera y el pie del sitio.
 */
export default function CatchAll() {
  notFound();
}
