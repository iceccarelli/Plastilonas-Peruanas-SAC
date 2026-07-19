'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Detección de intención de salida, sin UI (separada de la presentación).
 * - Desktop: mouseout con clientY <= 0 (el cursor sale hacia la barra del navegador).
 * - Touch: scroll-up rápido tras pasar el 50% de la página, o 40s en la página.
 * - Una vez por sesión (sessionStorage), nunca en el primer paint,
 *   nunca mientras se escribe en un campo de formulario.
 */
const KEY = 'pp_exit_intent_shown';

export function useExitIntent() {
  const [open, setOpen] = useState(false);
  const armed = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { if (sessionStorage.getItem(KEY)) return; } catch {}

    // No armar hasta pasado el primer paint (evita disparo inmediato).
    const armTimer = setTimeout(() => { armed.current = true; }, 3000);

    const isTyping = () => {
      const el = document.activeElement;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
    };

    const fire = () => {
      if (!armed.current || isTyping()) return;
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      setOpen(true);
      cleanup();
    };

    // ── Desktop: exit intent ──
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) fire();
    };

    // ── Touch: scroll-up velocity tras 50%, o timeout ──
    let lastY = window.scrollY;
    let lastT = Date.now();
    const onScroll = () => {
      const y = window.scrollY;
      const now = Date.now();
      const depth = (y + window.innerHeight) / document.documentElement.scrollHeight;
      const dy = y - lastY;
      const dt = now - lastT || 1;
      const vUp = -dy / dt; // px/ms hacia arriba
      if (depth > 0.5 && vUp > 0.8) fire();
      lastY = y; lastT = now;
    };

    const idleTimer = setTimeout(() => fire(), 40000);

    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (hasHover) document.addEventListener('mouseout', onMouseOut);
    else window.addEventListener('scroll', onScroll, { passive: true });

    function cleanup() {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idleTimer);
      clearTimeout(armTimer);
    }
    return cleanup;
  }, []);

  return { open, close: () => setOpen(false) };
}
