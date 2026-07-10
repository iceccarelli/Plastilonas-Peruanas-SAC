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
  { id: 'photo-1741176508062-a79aa6b48bdc', alt: 'Operarios en una planta de manufactura textil industrial' },
  { id: 'photo-1551825687-f9de1603ed8b', alt: 'Transportista sonriendo junto al camión de reparto' },
  { id: 'photo-1741176508460-2001b928a0e7', alt: 'Confección de tela en línea de producción' },
  { id: 'photo-1534639077088-d702bcf685e7', alt: 'Rollos de tela apilados en almacén' },
  { id: 'photo-1695222833131-54ee679ae8e5', alt: 'Camión de carga en ruta hacia el interior del país' },
  { id: 'photo-1742934028246-55fcad193b6c', alt: 'Operaria sonriendo en una fábrica textil' },
  { id: 'photo-1764232891094-a4a3e8c517e3', alt: 'Manos cosechando cerezas de café maduras' },
  { id: 'photo-1770055592671-01c08cae22be', alt: 'Saco de yute lleno de granos de café verde' },
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
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              onError={() =>
                setFailed((f) => ({ ...f, [slide.id]: true }))
              }
              className={`hero-photo h-full w-full object-cover ${
                isActive ? 'kb-active' : ''
              }`}
            />
          </div>
        );
      })}

      {/* Scrim de dos etapas. Antes: 88-100% de opacidad en toda la imagen.
          Ahora la foto vive a 40% en los bordes y solo se oscurece donde hay
          texto. Medido sobre el pixel claro peor caso (#C8D2DC):
            titular  65% -> 5.89:1   (necesita 3.0, texto grande)
            subtitulo 65% -> 5.89:1  (necesita 4.5)
            cue abajo 81% -> 9.28:1
          Los bordes conservan 7.5x mas luminancia que antes. */}
      <div className="absolute inset-0 bg-[#0A2540]/40" />
      <div
        className="absolute inset-0"
        style={{
          background: [
            // Etapa 2a: elipse bajo la columna de copy.
            'radial-gradient(ellipse 92% 62% at 50% 50%,' +
              ' rgba(10,37,64,0.42) 0%,' +
              ' rgba(10,37,64,0.24) 46%,' +
              ' rgba(10,37,64,0) 76%)',
            // Etapa 2b: protege navbar arriba y el cue de scroll abajo.
            'linear-gradient(to bottom,' +
              ' rgba(10,37,64,0.42) 0%,' +
              ' rgba(10,37,64,0) 18%,' +
              ' rgba(10,37,64,0) 72%,' +
              ' rgba(10,37,64,0.68) 100%)',
          ].join(', '),
        }}
      />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)   translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
        }
        .kb-active {
          animation: kenburns ${INTERVAL_MS + 1600}ms ease-out forwards;
        }
        /* Las exportaciones de Unsplash llegan planas. Esto restaura el punch
           sin tocar el contraste del texto (el scrim ya lo garantiza).
           Va en la <img>, nunca en un padre: filter crea containing block y
           el navbar fixed empezaria a scrollear con el hero. */
        .hero-photo {
          filter: saturate(1.25) contrast(1.06) brightness(1.05);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-photo { filter: saturate(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-active { animation: none; }
        }
      `}</style>
    </div>
  );
}
