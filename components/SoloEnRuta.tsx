'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * MUESTRA SU CONTENIDO SÓLO EN UNA RUTA EXACTA.
 *
 * Existe por un caso concreto: `app/(es)/configurador/layout.tsx` pone el
 * despiece del big bag encima del formulario de FIBC. Cuando
 * `/configurador/lona` se colgó de la misma carpeta, ese layout pasó a
 * envolverla también, y la página de lonas heredaba la ilustración de un
 * producto distinto.
 *
 * La alternativa era mover el archivo del configurador de FIBC a un grupo de
 * rutas. Mover una página que funciona para colocar una nueva es el tipo de
 * cambio que rompe algo a tres archivos de distancia; esto no toca nada de lo
 * que ya servía.
 *
 * El contenido llega YA RENDERIZADO desde el servidor (`children`), así que
 * este componente no arrastra al navegador ni el registro de imágenes ni el
 * acceso al disco: sólo decide si lo pinta.
 */
export default function SoloEnRuta({
  ruta,
  children,
}: {
  ruta: string;
  children: ReactNode;
}) {
  return usePathname() === ruta ? <>{children}</> : null;
}
