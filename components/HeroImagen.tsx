'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { HERO_IMAGENES } from '@/lib/hero-imagenes';
import { useMovimiento } from '@/lib/usar-movimiento';

/**
 * LA FOTOGRAFÍA DEL HERO — un rotador CONTROLADO sobre el lote de lib/hero-imagenes.ts.
 *
 * QUÉ CAMBIÓ Y POR QUÉ. Antes aquí vivía una sola foto fija. La razón era
 * buena y sigue vigente en su parte importante: la versión anterior a esa
 * servía FOTOS[0] en el HTML y, al montar, SORTEABA otra de quince y la
 * cambiaba. Eso costaba dos descargas de ~150 KB por visita y movía el
 * elemento LCP después de la hidratación. Lo que se corrigió entonces no fue
 * «rotar»: fue «sortear en el primer pintado». Esa corrección se conserva
 * entera aquí.
 *
 * LAS CUATRO REGLAS QUE ESTE ARCHIVO NO PUEDE ROMPER —si alguien vuelve a
 * tocarlo, son estas y no otras—:
 *
 * 1. EL PRIMER PINTADO ES DETERMINISTA. HERO_IMAGENES[0] se renderiza en el
 *    HTML del servidor con `priority` + `fetchPriority="high"`. No hay sorteo
 *    de ningún tipo ni elección en cliente para el primer cuadro.
 *    El LCP de la portada es exactamente el mismo archivo que antes.
 *
 * 2. NO SE PRECARGA EL LOTE. Las otras diecinueve fotos no se montan hasta
 *    que les toca: el componente sólo renderiza las diapositivas ya
 *    «despertadas» (`montadas`), y despierta la SIGUIENTE cuando entra la
 *    actual, es decir con ocho a catorce segundos de margen para descargarse
 *    sin competir con nada. Un visitante que se va a los cinco segundos baja
 *    una imagen, igual que antes.
 *
 * 3. EL MOVIMIENTO SE PIDE, NO SE IMPONE. Con `prefers-reduced-motion:
 *    reduce` no hay intervalo, no hay fundido y no hay desplazamiento: la
 *    portada se queda en la primera foto, quieta, para siempre. Es la misma
 *    página que había antes de este cambio.
 *
 * 4. LA HONESTIDAD DEL PIE SIGUE ENCIMA DE LA FOTO. El pie nombra lo que se
 *    está viendo y termina siempre en la misma declaración: imagen
 *    referencial de la aplicación, no una obra ejecutada. Rotar fotos
 *    multiplica por veinte las ocasiones de dar a entender lo contrario, así
 *    que el aviso rota con ellas.
 *
 * POR QUÉ ROTAR, ENTONCES. La portada vende tres frentes —lonas y siders de
 * camión, carpas y toldos, revestimiento y cerramientos— y enseñaba uno. El
 * lote ya estaba en el repositorio. El coste real de mostrarlo, con las
 * cuatro reglas de arriba, es cero en el primer pintado.
 *
 * EL MOVIMIENTO — Y EL DEFECTO QUE TENÍA. Esto decía «tipo Ken Burns» y no lo
 * era: sólo escalaba de 1 a 1.09, sin desplazamiento, así que el encuadre
 * crecía pero no RECORRÍA nada. Y había algo peor: la diapositiva activa se
 * pintaba YA con su transformación final. Como el primer cuadro nace activo,
 * la foto que más se ve —la del LCP— nunca llegaba a moverse; la escala sólo
 * se notaba, y a medias, a partir del segundo giro.
 *
 * Ahora cada diapositiva tiene un PAR de encuadres, «de» y «a»: un
 * desplazamiento de un par de puntos porcentuales en una dirección distinta
 * por diapositiva, combinado con la escala. La activa va de «de» a «a» en
 * dieciséis segundos, y el primer cuadro arranca en «de» y salta a «a» en el
 * tick siguiente al montaje (`arrancado`), que es lo que hace que el recorrido
 * exista también en la primera foto. El fundido se alargó a 2.2 s: un corte de
 * 1.4 s sobre un movimiento tan lento se veía como un parpadeo.
 *
 * Sigue siendo CSS: `transform` y `opacity`, las dos propiedades que el
 * compositor anima sin repintar. Cero JavaScript por cuadro.
 */

/** Origen de la transformación por diapositiva: evita que todas paneen igual. */
const ORIGENES = ['50% 50%', '30% 40%', '70% 45%', '40% 65%', '60% 35%'] as const;

/**
 * Encuadre inicial y final de cada diapositiva. Cinco recorridos que se turnan:
 * dos diapositivas seguidas nunca paneán en la misma dirección, así que el
 * lote de veinte no se siente como veinte veces el mismo efecto.
 */
const RECORRIDOS = [
  { de: 'translate(-2.4%, 1.2%) scale(1.015)', a: 'translate(2.2%, -1.4%) scale(1.115)' },
  { de: 'translate(2.6%, -1.0%) scale(1.02)', a: 'translate(-2.0%, 1.6%) scale(1.12)' },
  { de: 'translate(0%, -2.2%) scale(1.09)', a: 'translate(-1.6%, 1.8%) scale(1.0)' },
  { de: 'translate(-1.8%, -1.8%) scale(1.01)', a: 'translate(1.8%, 1.8%) scale(1.13)' },
  { de: 'translate(1.4%, 2.0%) scale(1.1)', a: 'translate(-1.4%, -1.6%) scale(1.02)' },
] as const;

/** Intervalo entre giros, en milisegundos. Lento a propósito. */
const MIN_MS = 8_000;
const MAX_MS = 14_000;

export default function HeroImagen() {
  const [fallo, setFallo] = useState(false);
  const [indice, setIndice] = useState(0);
  /** Índices ya montados. Empieza y, sin movimiento, se queda en [0]. */
  const [montadas, setMontadas] = useState<number[]>([0]);
  /** Falso hasta el tick siguiente al montaje: es lo que echa a andar el paneo. */
  const [arrancado, setArrancado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * La misma pregunta que hacen el despiece de la lona y los carruseles, en un
   * solo sitio: `lib/usar-movimiento.ts`. Devuelve `false` en el primer render,
   * así que el HTML servido y el primer render del cliente coinciden y quien
   * pidió menos movimiento no ve arrancar nada.
   */
  const mover = useMovimiento();

  useEffect(() => {
    if (HERO_IMAGENES.length < 2) return;
    // Un solo lote, una sola foto: si el visitante pide menos movimiento, la
    // portada se queda como estaba antes de este componente.
    if (!mover) return;

    // El primer cuadro nace con su encuadre de salida y pasa al de llegada en
    // cuanto el navegador ha pintado: sin esto no hay transición que animar y
    // la foto del LCP se queda clavada en su encuadre final.
    const arranque = requestAnimationFrame(() => setArrancado(true));

    let vivo = true;

    // La duración se escalona por índice —8, 10, 12, 14 s— en lugar de
    // sortearse: el sorteo en cliente es lo que se quitó de este archivo y no
    // vuelve ni para esto. El efecto de variedad es el mismo y el
    // comportamiento es reproducible en una prueba.
    const duracionDe = (i: number) => MIN_MS + ((i % 4) * (MAX_MS - MIN_MS)) / 3;

    const programar = (desde: number) => {
      temporizador.current = setTimeout(() => {
        if (!vivo) return;
        const siguiente = (desde + 1) % HERO_IMAGENES.length;
        // La que viene DESPUÉS se monta ahora: le quedan ocho a catorce
        // segundos para descargarse antes de que le toque, y en ningún
        // momento están montadas las veinte.
        const posterior = (siguiente + 1) % HERO_IMAGENES.length;
        setIndice(siguiente);
        setMontadas((m) => (m.includes(posterior) ? m : [...m, posterior]));
        programar(siguiente);
      }, duracionDe(desde));
    };

    // La segunda se monta al arrancar, para que el primer fundido no espere
    // a la red. Nunca antes: el primer pintado sigue siendo una descarga.
    setMontadas((m) => (m.includes(1) ? m : [...m, 1]));
    programar(0);

    return () => {
      vivo = false;
      cancelAnimationFrame(arranque);
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [mover]);

  if (fallo) {
    // Sin fotografía no se finge una: el panel conserva el azul del sitio.
    return <div className="absolute inset-0 bg-[#0A2540]" aria-hidden="true" />;
  }

  const actual = HERO_IMAGENES[indice] ?? HERO_IMAGENES[0];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {montadas.map((i) => {
        const foto = HERO_IMAGENES[i];
        if (!foto) return null;
        const activa = i === indice;
        return (
          <Image
            key={foto.src}
            src={foto.src}
            // Solo la primera describe la escena para lectores de pantalla:
            // las que rotan son decorativas respecto del texto de la portada,
            // y veinte alt encadenados serían ruido para quien no ve.
            alt={i === 0 ? foto.alt : ''}
            aria-hidden={i === 0 ? undefined : true}
            fill
            priority={i === 0}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            loading={i === 0 ? undefined : 'lazy'}
            sizes="100vw"
            quality={75}
            onError={() => {
              // El fallo de la PRIMERA deja la portada sin foto: panel azul.
              // El de una secundaria no se ve, porque solo se muestra unos
              // segundos y debajo sigue habiendo fondo del sitio.
              if (i === 0) setFallo(true);
            }}
            className="object-cover"
            style={{
              filter: 'saturate(1.12) contrast(1.03)',
              opacity: activa ? 1 : 0,
              transformOrigin: ORIGENES[i % ORIGENES.length],
              // Sin movimiento no hay transformación en absoluto: la foto se
              // sirve tal cual, que es la página que había antes del rotador.
              transform: !mover
                ? 'none'
                : activa && arrancado
                  ? RECORRIDOS[i % RECORRIDOS.length].a
                  : RECORRIDOS[i % RECORRIDOS.length].de,
              transition: mover
                ? 'opacity 2200ms ease-in-out, transform 16000ms cubic-bezier(0.22,0.61,0.36,1)'
                : 'none',
              willChange: 'opacity, transform',
            }}
          />
        );
      })}
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
          la credibilidad de las fotos que sí sean propias. Al rotar, el pie
          nombra además LO QUE SE ESTÁ VIENDO. */}
      <div className="absolute bottom-2 right-3 max-w-[85%] text-right text-[10px] leading-tight text-white/70 bg-[#0A2540]/50 rounded px-2 py-0.5 pointer-events-none">
        <span className="hidden sm:inline">{actual.alt} </span>
        Imagen referencial de la aplicación — no es una obra ejecutada
      </div>
    </div>
  );
}
