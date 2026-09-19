'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { useMovimiento } from '@/lib/usar-movimiento';
import { duracionLegible, type Pieza } from '@/lib/cine';

/**
 * EL REPRODUCTOR DE LA TRILOGÍA. `<video>` nativo y nada más.
 *
 * POR QUÉ NO HAY LIBRERÍA. Estas tres piezas son archivos propios servidos
 * desde el mismo origen. Un reproductor de terceros —ReactPlayer, Plyr,
 * Video.js— existe para resolver lo que aquí no hay que resolver: proveedores
 * remotos, DRM, HLS, formatos que un navegador no entiende. A cambio mete
 * entre 50 y 200 KB de JavaScript en el paquete, se interpone en el teclado y
 * en el lector de pantalla, y sustituye los controles del sistema operativo
 * —que el usuario ya sabe usar— por unos dibujados. El elemento nativo
 * reproduce un MP4 local con controles, teclado, subtítulos y Picture in
 * Picture sin una sola línea de dependencia.
 *
 * DOS MODOS, Y LA DIFERENCIA IMPORTA.
 *
 *  · `sala` (por defecto): no ocurre NADA hasta que la persona pulsa. Hasta
 *    entonces sólo hay un cartel —una imagen, optimizada por next/image— y un
 *    botón. `preload="metadata"` y no `none`: cuando el elemento aparece, el
 *    navegador pide la cabecera del archivo (unos pocos KB, gracias al
 *    remux con +faststart) y con eso la barra de progreso ya es real desde el
 *    primer fotograma. Con `none` el primer clic se queda quieto mientras
 *    llega esa cabecera, y se lee como que el vídeo no funciona.
 *
 *  · `fondo`: bucle silencioso detrás de otro contenido. Es el ÚNICO contexto
 *    del sitio donde algo arranca solo, y por eso está atado por construcción:
 *    usa `pieza.srcMudo` y nunca `pieza.src`, y lleva `muted` siempre. No hay
 *    manera de pedirle a este componente que reproduzca la pista hablada sin
 *    un gesto. Reproducción automática con sonido no existe en este repositorio.
 *
 * MOVIMIENTO REDUCIDO. `useMovimiento()` devuelve `false` en el primer render
 * —en el servidor no hay `matchMedia`— así que el modo fondo NO emite el
 * `<video>` hasta saber que puede moverse. Quien pidió menos movimiento se
 * queda con el cartel fijo y el enlace a la sala: nunca ve el destello de un
 * bucle que arranca y se corta.
 *
 * SUBTÍTULOS. No hay `<track>`. Los tres masters llevan locución y este
 * repositorio no tiene transcripción de ellos: escribir un WebVTT «aproximado»
 * sería inventar palabras que alguien va a leer como las que se dicen, que es
 * exactamente el tipo de relleno que el resto del sitio existe para no hacer.
 * El hueco se declara en docs/entregas/2026-09-19-cine-editorial.md.
 */

type Modo = 'sala' | 'fondo';

export default function CinePlayer({
  pieza,
  modo = 'sala',
  prioridadCartel = false,
  className = '',
}: {
  pieza: Pieza;
  modo?: Modo;
  /**
   * Sólo para un cartel que de verdad sea lo primero de la página. Está en
   * `false` por defecto a propósito: en la portada el LCP es la fotografía del
   * hero (`lib/hero-imagenes.ts`) y el cartel de la trilogía vive mucho más
   * abajo. Dos imágenes marcadas como prioritarias compiten y ninguna gana.
   */
  prioridadCartel?: boolean;
  className?: string;
}) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const puedeMoverse = useMovimiento();

  if (modo === 'fondo') {
    // Sin movimiento permitido: el cartel, y nada que se mueva.
    if (!puedeMoverse) {
      return (
        <div className={`relative aspect-video w-full overflow-hidden ${className}`}>
          <Image
            src={pieza.poster}
            alt={`${pieza.titulo} — ${pieza.antetitulo}`}
            fill
            sizes="100vw"
            quality={75}
            priority={prioridadCartel}
            className="object-cover"
          />
        </div>
      );
    }
    return (
      <div className={`relative aspect-video w-full overflow-hidden ${className}`}>
        {/* `srcMudo`, SIEMPRE. Ver la cabecera de este archivo. */}
        <video
          src={pieza.srcMudo}
          poster={pieza.poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const arrancar = () => {
    setReproduciendo(true);
    // El elemento se monta en este mismo render; el play se pide en el
    // siguiente cuadro, cuando ya existe. `catch` vacío a propósito: si el
    // navegador rechaza el play, quedan los controles nativos, que es
    // exactamente lo que el usuario esperaría.
    requestAnimationFrame(() => void video.current?.play().catch(() => {}));
  };

  return (
    <figure className={className}>
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-[#0A2540]">
        {reproduciendo ? (
          <video
            ref={video}
            src={pieza.src}
            poster={pieza.poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
          >
            {/* Un navegador sin soporte de MP4/H.264 no existe hoy, pero si
                apareciera, esto le da el archivo en vez de un rectángulo negro. */}
            <a href={pieza.src}>Descargar «{pieza.titulo}» (MP4)</a>
          </video>
        ) : (
          <button
            type="button"
            onClick={arrancar}
            aria-label={`Reproducir ${pieza.n} · ${pieza.titulo} (${duracionLegible(pieza.durationSec)})`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={pieza.poster}
              alt={`${pieza.titulo} — ${pieza.antetitulo}`}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              quality={75}
              priority={prioridadCartel}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#0A2540] shadow-2xl shadow-black/40 transition-transform group-hover:scale-105">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </span>
            <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 text-left md:p-7">
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {pieza.n}
                </span>
                <span className="mt-1 block truncate text-xl font-semibold tracking-tight text-white md:text-2xl">
                  {pieza.titulo}
                </span>
                <span className="mt-0.5 block truncate text-sm text-white/70">
                  {pieza.antetitulo}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-black/45 px-3 py-1 font-mono text-xs tabular-nums text-white/90">
                {duracionLegible(pieza.durationSec)}
              </span>
            </span>
          </button>
        )}
      </div>
      {/* El pie va con el mismo peso y el mismo gris que el de FotoReferencial
          y el de la galería de producto: es la misma declaración, y verla
          escrita igual en los tres sitios es parte de que se crea. */}
      <figcaption className="mt-2 text-xs text-gray-500">{pieza.pie}</figcaption>
    </figure>
  );
}
