'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * LA FOTOGRAFÍA DEL HERO — un solo archivo, servido por el optimizador.
 *
 * DOS DECISIONES, LAS DOS MEDIBLES.
 *
 * 1. UNA FOTO FIJA, NO UNA AL AZAR. La versión anterior servía FOTOS[0] en el
 *    HTML y, al montar, sorteaba otra de quince y la cambiaba. El efecto real
 *    no era «cada visita ve una obra distinta»: era descargar DOS imágenes de
 *    ~150 KB en cada visita —la del servidor, que se tira, y la sorteada— y
 *    mover el elemento LCP después de la hidratación. Se pagaba ancho de banda
 *    móvil y puntuación de Core Web Vitals a cambio de una novedad que ningún
 *    comprador industrial pidió. El resto del lote sigue en el repositorio y
 *    se usa donde ilustra de verdad (galerías de proceso y de producto).
 *
 * 2. next/image EN LUGAR DE <img>. El optimizador emite AVIF y WebP con
 *    srcset por ancho de dispositivo (next.config.ts recorta deviceSizes a
 *    seis y fija quality 75). Un teléfono deja de bajar el mismo archivo de
 *    escritorio. `priority` la marca como recurso de máxima prioridad —es el
 *    LCP de la portada— y `fill` sobre el contenedor absoluto reserva el
 *    espacio, así que no hay salto de layout.
 *
 * La foto elegida es la que corresponde a la primera cuña del H1 —lonas y
 * siders para camión—; es referencial, y así lo dice el pie sobre la imagen.
 */
const FOTO = {
  src: '/images/hero/hero-08.webp',
  alt: 'Camión con siders y tolderas de lona en una carretera peruana.',
};

export default function HeroImagen() {
  const [fallo, setFallo] = useState(false);

  if (fallo) {
    // Sin fotografía no se finge una: el panel conserva el azul del sitio.
    return <div className="absolute inset-0 bg-[#0A2540]" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={FOTO.src}
        alt={FOTO.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={75}
        onError={() => setFallo(true)}
        className="object-cover"
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
      {/* Honestidad visual: la foto ilustra la aplicación, no es una obra
          ejecutada por la empresa. Decirlo cuesta una línea; callarlo cuesta
          la credibilidad de las fotos que sí sean propias. */}
      <div className="absolute bottom-2 right-3 text-[10px] leading-tight text-white/70 bg-[#0A2540]/50 rounded px-2 py-0.5 pointer-events-none">
        Imagen referencial de la aplicación — no es una obra ejecutada
      </div>
    </div>
  );
}
