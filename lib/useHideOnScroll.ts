'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve true cuando el encabezado debe estar visible.
 *
 * Regla (estilo AWS / apps móviles): al bajar se oculta para dar espacio al
 * contenido; al subir reaparece de inmediato. Siempre visible cerca del tope.
 * El encabezado se traslada con transform (no cambia el flujo del documento),
 * por lo que la página no "salta" ni se desplaza hacia abajo.
 */
export function useHideOnScroll(threshold = 80): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      const delta = Math.abs(y - lastY);

      // Ignorar micro-movimientos para evitar parpadeo.
      if (delta > 6) {
        if (y < threshold) {
          setVisible(true); // cerca del tope: siempre visible
        } else if (goingDown) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return visible;
}
