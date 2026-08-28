'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO_MENSAJES } from '@/lib/hero-mensajes';

/**
 * EL TEXTO VIVO DEL HERO — rota el bloque completo, teclea SOLO el H1.
 *
 * Reglas de la animación (y por qué cada una):
 *  - Ciclo de ~10 s: el bloque se desvanece, cambia entero (eyebrow, sub y
 *    línea de productos aparecen de una vez) y el H1 se teclea a ~32 ms por
 *    carácter con cursor parpadeante. Teclear los párrafos sería un truco;
 *    una portada seria teclea una línea y para.
 *  - Nunca se borra-y-reteclea a mitad de lectura: el cambio ocurre con el
 *    bloque ya desvanecido.
 *  - El alto del H1 se reserva con la frase completa invisible: la tarjeta
 *    no salta mientras se teclea.
 *  - Accesibilidad: el <h1> lleva la frase completa en un span sr-only desde
 *    el primer render, y la copia visual que se teclea va con aria-hidden.
 *    El contenedor declara aria-live="off": un lector de pantalla no debe
 *    narrar cada rotación. Con prefers-reduced-motion no se teclea nada: el
 *    texto aparece completo.
 *  - SSR sirve el primer mensaje COMPLETO: es el H1 canónico que ven los
 *    rastreadores sin JavaScript, idéntico en servidor y primer render de
 *    cliente para no romper la hidratación.
 *
 * Los colores van en hexadecimal a propósito: este bloque vive dentro de la
 * tarjeta clara del hero, que sigue clara en modo oscuro (ver app/page.tsx),
 * y la capa oscura de globals.css remapearía las utilidades text-gray-*.
 */

const CICLO_MS = 10_000;
const FUNDIDO_MS = 450;
const MS_POR_CARACTER = 32;

export default function HeroMensaje() {
  const [idx, setIdx] = useState(0);
  // SSR y primer render: la frase completa. Solo las rotaciones teclean.
  const [tecleado, setTecleado] = useState<number>(HERO_MENSAJES[0].h1.length);
  const [oculto, setOculto] = useState(false);
  const reducirMovimiento = useRef(false);
  const primerRender = useRef(true);

  // Ciclo de rotación: fundir → cambiar de bloque → reaparecer.
  useEffect(() => {
    reducirMovimiento.current =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let vivo = true;
    const temporizadores: number[] = [];
    const programar = () => {
      temporizadores.push(
        window.setTimeout(() => {
          if (!vivo) return;
          setOculto(true);
          temporizadores.push(
            window.setTimeout(() => {
              if (!vivo) return;
              setIdx((i) => (i + 1) % HERO_MENSAJES.length);
              setOculto(false);
              programar();
            }, FUNDIDO_MS),
          );
        }, CICLO_MS),
      );
    };
    programar();
    return () => {
      vivo = false;
      temporizadores.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Tecleo del H1 al cambiar de bloque (nunca en el primer render).
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const total = HERO_MENSAJES[idx].h1.length;
    if (reducirMovimiento.current) {
      setTecleado(total);
      return;
    }
    setTecleado(0);
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setTecleado(n);
      if (n >= total) window.clearInterval(t);
    }, MS_POR_CARACTER);
    return () => window.clearInterval(t);
  }, [idx]);

  const m = HERO_MENSAJES[idx];
  const tecleando = tecleado < m.h1.length;

  return (
    <div
      aria-live="off"
      className="transition-opacity ease-out"
      style={{ transitionDuration: `${FUNDIDO_MS}ms`, opacity: oculto ? 0 : 1 }}
    >
      <div className="text-xs tracking-[2px] text-[#047857] font-semibold uppercase mb-4">{m.eyebrow}</div>
      <h1 className="relative text-3xl md:text-[2.75rem] md:leading-[1.08] font-semibold tracking-tight text-[#0A2540] mb-4">
        {/* Reserva el alto con la frase completa: la tarjeta no salta. */}
        <span className="invisible" aria-hidden="true">{m.h1}</span>
        {/* La frase completa para lectores de pantalla, desde el inicio. */}
        <span className="sr-only">{m.h1}</span>
        {/* La copia visual que se teclea. */}
        <span className="absolute inset-0" aria-hidden="true">
          {m.h1.slice(0, tecleado)}
          {tecleando && <span className="hero-cursor" aria-hidden="true" />}
        </span>
      </h1>
      <p className="text-base md:text-lg text-[#334155] mb-2">{m.sub}</p>
      <p className="text-sm text-[#64748B] mb-7">{m.productos}</p>

      <style>{`
        .hero-cursor {
          display: inline-block;
          width: 3px;
          height: 0.95em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: #047857;
          animation: hero-parpadeo 0.9s steps(1) infinite;
        }
        @keyframes hero-parpadeo {
          0%, 55% { opacity: 1; }
          56%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-cursor { animation: none; }
        }
      `}</style>
    </div>
  );
}
