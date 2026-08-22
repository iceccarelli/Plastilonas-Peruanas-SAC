'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Contador animado. Arranca cuando entra en pantalla (una sola vez).
 *
 * P0: el estado inicial ERA 0, así que SSR y el primer paint mostraban
 * "0 Años fabricando" si el observer no disparaba. Ahora el HTML inicial
 * ya lleva el valor final; la animación solo corre en cliente.
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
  display?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const finalValue = to ?? 0;
  const [n, setN] = useState(finalValue);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (display || to === undefined || !inView || hasAnimated) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      setHasAnimated(true);
      return;
    }
    setN(0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setHasAnimated(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, display, hasAnimated]);

  return <span ref={ref}>{display ?? `${prefix}${n}${suffix}`}</span>;
}
