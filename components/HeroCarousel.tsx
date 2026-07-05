'use client';

import { useEffect, useState } from 'react';

/**
 * Fondo cinematográfico del hero con efecto Ken Burns.
 *
 * Las 8 imágenes representan los sectores reales de Plastilonas: minería,
 * agricultura, construcción, geomembranas/contención de agua, transporte,
 * industria e invernaderos. Se cargan desde el CDN de Unsplash directamente
 * en el navegador del visitante.
 *
 * Robustez: cada imagen que no cargue se marca como fallida y simplemente no
 * se muestra (el fondo navy queda visible). Una sola imagen rota nunca degrada
 * el diseño ni deja un ícono de imagen quebrada.
 */

interface Slide {
  id: string;
  alt: string;
}

// IDs del CDN de Unsplash (images.unsplash.com/photo-...), fotos estables y
// libres para uso comercial que encajan con el mercado industrial peruano.
const SLIDES: Slide[] = [
  { id: 'photo-1578319439584-104c94d37305', alt: 'Operación minera a tajo abierto' },
  { id: 'photo-1504328345606-18bbc8c9d7d1', alt: 'Camión minero de gran tonelaje' },
  { id: 'photo-1500382017468-9049fed747ef', alt: 'Campo agrícola extenso' },
  { id: 'photo-1416879595882-3373a0480b5b', alt: 'Invernadero de cultivo protegido' },
  { id: 'photo-1503387762-592deb58ef4e', alt: 'Obra de construcción industrial' },
  { id: 'photo-1558449028-b53a39d100fc', alt: 'Reservorio con geomembrana' },
  { id: 'photo-1601584115197-04ecc0da31d7', alt: 'Transporte de carga en carretera' },
  { id: 'photo-1587293852726-70cdb56c2866', alt: 'Planta industrial' },
];

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1920&auto=format&fit=crop`;

const INTERVAL_MS = 6000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Capa base garantizada: patrón navy siempre visible. Si ninguna
          imagen carga, el hero conserva este fondo pulido en lugar de
          quedar en blanco. */}
      <div className="absolute inset-0 bg-[#0A2540]" />
      <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:5px_5px] opacity-40" />

      {SLIDES.map((slide, i) => {
        if (failed[slide.id]) return null;
        const isActive = i === active;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out will-change-[opacity]"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={UNSPLASH(slide.id)}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={() =>
                setFailed((f) => ({ ...f, [slide.id]: true }))
              }
              className={`h-full w-full object-cover ${
                isActive ? 'kb-active' : ''
              }`}
            />
          </div>
        );
      })}

      {/* Capas de oscurecimiento para garantizar contraste del texto */}
      <div className="absolute inset-0 bg-[#0A2540]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/40 to-[#0A2540]/70" />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)   translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
        }
        .kb-active {
          animation: kenburns ${INTERVAL_MS + 1600}ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-active { animation: none; }
        }
      `}</style>
    </div>
  );
}
