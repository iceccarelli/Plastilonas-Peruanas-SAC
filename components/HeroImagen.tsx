'use client';

import { useEffect, useState } from 'react';

/**
 * UNA imagen fija por visita — el reemplazo del carrusel del hero.
 *
 * Por qué se retiró el carrusel: la portada superponía tres consignas, un
 * párrafo, dos botones y cuatro cifras sobre 16 fotos en rotación con zoom
 * Ken Burns. Texto sobre fotografía en movimiento es exactamente lo contrario
 * de la lectura tranquila que espera un comprador industrial. El nuevo hero
 * separa los planos: el texto vive sobre panel sólido y la fotografía ocupa
 * su propia columna, quieta.
 *
 * Reglas:
 *  - En SSR se sirve siempre la primera foto (LCP estable y predecible).
 *  - Al montar, se elige UNA foto al azar del lote y se queda quieta: sin
 *    intervalo, sin zoom, sin transición. Cada visita ve una obra distinta;
 *    ninguna visita ve una película.
 *  - Solo fotografías de trabajo (planta, obra, producto). El paisaje andino
 *    que abría el sitio se retiró: no mostraba nada que esta empresa haga.
 *  - Si el archivo elegido no carga, se degrada a la primera foto; si esa
 *    tampoco, el panel queda en el azul del sitio y la página sigue legible.
 */
interface Foto {
  src: string;
  alt: string;
}

const FOTOS: Foto[] = [
  { src: '/images/hero/hero-02.webp', alt: 'Carga de big bags (FIBC) en planta industrial' },
  { src: '/images/hero/hero-03.webp', alt: 'Instalación de geomembrana HDPE en poza de contención' },
  { src: '/images/hero/hero-04.webp', alt: 'Geotextil y geomalla en obra de movimiento de tierras' },
  { src: '/images/hero/hero-05.webp', alt: 'Estructura tensada de arquitectura textil' },
  { src: '/images/hero/hero-06.webp', alt: 'Malla agrícola de sombra y anti-granizo sobre cultivo' },
  { src: '/images/hero/hero-07.webp', alt: 'Tanque flexible (bladder) para almacenamiento de agua' },
  { src: '/images/hero/hero-08.webp', alt: 'Camión con siders y tolderas en carretera peruana' },
  { src: '/images/hero/hero-09.webp', alt: 'Mangas de ventilación industrial en planta' },
  { src: '/images/hero/hero-10.webp', alt: 'Almacén con rollos de lonas industriales' },
  { src: '/images/hero/hero-11.webp', alt: 'Operarios en línea de fabricación de lonas' },
  { src: '/images/hero/hero-12.webp', alt: 'Acopio minero cubierto con lona en altura' },
  { src: '/images/hero/hero-13.webp', alt: 'Invernadero con film técnico agrícola' },
  { src: '/images/hero/hero-14.webp', alt: 'Cosecha de café con sacos de yute y big bags' },
  { src: '/images/hero/hero-15.webp', alt: 'Geosintéticos para control de erosión en talud' },
  { src: '/images/hero/hero-16.webp', alt: 'Patio logístico con cargas paletizadas y embaladas' },
];

export default function HeroImagen() {
  // SSR y primer render de cliente: la misma foto → hidratación estable.
  const [foto, setFoto] = useState<Foto>(FOTOS[0]);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFoto(FOTOS[Math.floor(Math.random() * FOTOS.length)]);
  }, []);

  if (fallo) {
    // Sin fotografía no se finge una: el panel conserva el azul del sitio.
    return <div className="absolute inset-0 bg-[#0A2540]" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto.src}
        alt={foto.alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => {
          if (foto.src !== FOTOS[0].src) setFoto(FOTOS[0]);
          else setFallo(true);
        }}
        className="h-full w-full object-cover"
        style={{ filter: 'saturate(1.12) contrast(1.03)' }}
      />
      {/* Velo mínimo hacia el panel de texto para que el corte no sea duro.
          No hay texto encima de la foto: el velo es estético, no funcional. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(10,37,64,0.28) 0%, rgba(10,37,64,0) 22%)',
        }}
      />
      {/* Honestidad visual: estas fotos ilustran la aplicación, no son obras
          ejecutadas por la empresa. Decirlo cuesta una línea; callarlo cuesta
          la credibilidad de las fotos que sí sean propias. */}
      <div className="absolute bottom-2 right-3 text-[10px] leading-tight text-white/70 bg-[#0A2540]/50 rounded px-2 py-0.5 pointer-events-none">
        Imagen referencial de la aplicación — no es una obra ejecutada
      </div>
    </div>
  );
}
