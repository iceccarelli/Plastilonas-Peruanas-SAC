'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Contador animado. Arranca cuando entra en pantalla (una sola vez).
 * - Usa easeOutCubic: rápido al inicio, se asienta al final (se siente "vivo").
 * - Respeta prefers-reduced-motion (muestra el valor final de inmediato).
 * - Se renderiza con .tabular-nums -> monoespaciada: los dígitos no bailan
 *   de ancho mientras cuentan.
 */
export default function CountUp({
  to,
  prefix = '',
  suffix = '',
  display,
  duration = 1600,
}: {
  to?: number;
  prefix?: string;
  suffix?: string;
  display?: string;   // valores no numéricos, p. ej. "24/7"
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (display || to === undefined || !inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, display]);

  return <span ref={ref}>{display ?? `${prefix}${n}${suffix}`}</span>;
}
