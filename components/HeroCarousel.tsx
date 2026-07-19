'use client';

import { useEffect, useState } from 'react';

interface Slide {
  src: string;
  alt: string;
}

// Imágenes propias en /public/images/hero (1920×1080). La primera es el LCP.
const SLIDES: Slide[] = [
  { src: '/images/hero/hero-01.jpg', alt: 'Paisaje industrial minero en los Andes peruanos' },
  { src: '/images/hero/hero-02.jpg', alt: 'Carga de big bags (FIBC) en planta industrial' },
  { src: '/images/hero/hero-03.jpg', alt: 'Instalación de geomembrana HDPE en poza de contención' },
  { src: '/images/hero/hero-04.jpg', alt: 'Geotextil y geomalla en obra de movimiento de tierras' },
  { src: '/images/hero/hero-05.jpg', alt: 'Estructura tensada de arquitectura textil' },
  { src: '/images/hero/hero-06.jpg', alt: 'Malla agrícola de sombra y anti-granizo sobre cultivo' },
  { src: '/images/hero/hero-07.jpg', alt: 'Tanque flexible (bladder) para almacenamiento de agua' },
  { src: '/images/hero/hero-08.jpg', alt: 'Camión con siders y tolderas en carretera peruana' },
  { src: '/images/hero/hero-09.jpg', alt: 'Mangas de ventilación industrial en planta' },
  { src: '/images/hero/hero-10.jpg', alt: 'Almacén con rollos de lonas industriales' },
  { src: '/images/hero/hero-11.jpg', alt: 'Operarios en línea de fabricación de lonas' },
  { src: '/images/hero/hero-12.jpg', alt: 'Acopio minero cubierto con lona en altura' },
  { src: '/images/hero/hero-13.jpg', alt: 'Invernadero con film técnico agrícola' },
  { src: '/images/hero/hero-14.jpg', alt: 'Cosecha de café con sacos de yute y big bags' },
  { src: '/images/hero/hero-15.jpg', alt: 'Geosintéticos para control de erosión en talud' },
  { src: '/images/hero/hero-16.jpg', alt: 'Patio logístico con cargas paletizadas y embaladas' },
];

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
      <div className="absolute inset-0 bg-[#0A2540]" />
      <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:5px_5px] opacity-40" />

      {SLIDES.map((slide, i) => {
        if (failed[slide.src]) return null;
        const isActive = i === active;
        return (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out will-change-[opacity]"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              onError={() => setFailed((f) => ({ ...f, [slide.src]: true }))}
              className={`hero-photo h-full w-full object-cover ${isActive ? 'kb-active' : ''}`}
            />
          </div>
        );
      })}

      <div className="absolute inset-0 bg-[#0A2540]/40" />
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 92% 62% at 50% 50%, rgba(10,37,64,0.42) 0%, rgba(10,37,64,0.24) 46%, rgba(10,37,64,0) 76%)',
            'linear-gradient(to bottom, rgba(10,37,64,0.42) 0%, rgba(10,37,64,0) 18%, rgba(10,37,64,0) 72%, rgba(10,37,64,0.68) 100%)',
          ].join(', '),
        }}
      />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)   translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
        }
        .kb-active { animation: kenburns ${INTERVAL_MS + 1600}ms ease-out forwards; }
        .hero-photo { filter: saturate(1.25) contrast(1.06) brightness(1.05); }
        @media (prefers-reduced-motion: reduce) {
          .hero-photo { filter: saturate(1.15); }
          .kb-active { animation: none; }
        }
      `}</style>
    </div>
  );
}
