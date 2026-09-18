'use client';

import { useEffect, useState } from 'react';

/**
 * ¿PUEDE ESTA PÁGINA MOVERSE?
 *
 * La consulta `prefers-reduced-motion: reduce` estaba copiada a mano en seis
 * componentes, cada uno con su matiz: uno la leía con `window.matchMedia?.`,
 * otro sin el interrogante, otro sin comprobar que había `window`. Tres formas
 * de preguntar lo mismo son tres formas de equivocarse.
 *
 * DOS DECISIONES QUE NO SON DE ESTILO:
 *
 * 1. DEVUELVE `false` EN EL PRIMER RENDER, SIEMPRE. En el servidor no hay
 *    `matchMedia` y en el cliente el primer render tiene que coincidir con el
 *    HTML servido o React avisa de una discordancia de hidratación. Empezar
 *    quieto y arrancar después es además lo correcto para quien pidió menos
 *    movimiento: nunca llega a ver el destello de una animación que no quería.
 *
 * 2. ESCUCHA EL CAMBIO. La preferencia se puede activar con la página abierta
 *    —en macOS y en Android es un interruptor del sistema—. Sin `addEventListener`
 *    el movimiento seguiría hasta recargar.
 *
 * `useMovimiento()` responde «sí, muévete»: es la pregunta que hace quien
 * escribe la animación, así que la respuesta afirmativa es la que se lee
 * directa en el `if`.
 */
export function useMovimiento(): boolean {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!consulta) return;

    const aplicar = () => setPermitido(!consulta.matches);
    aplicar();

    consulta.addEventListener?.('change', aplicar);
    return () => consulta.removeEventListener?.('change', aplicar);
  }, []);

  return permitido;
}
