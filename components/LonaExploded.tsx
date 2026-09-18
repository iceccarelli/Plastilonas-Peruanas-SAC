'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { TrazosConfeccion } from '@/components/LonaIconos';
import { capasDeLona, specToVisualState } from '@/lib/lona-visual';
import { useMovimiento } from '@/lib/usar-movimiento';
import { lonaAnchoLabel, lonaGramajeLabel, type LonaSpec } from '@/lib/lona-config';

/**
 * DESPIECE DE UNA LONA — cuatro capas, en isométrica, sin fotografía.
 *
 * POR QUÉ UN ESQUEMA Y NO UNA FOTO. Un paño de lona fotografiado es un paño
 * de color: no se ve la trama, no se ve el gramaje y no se ve dónde está la
 * soldadura. El comprador que especifica necesita justo eso. Y un esquema
 * dibujado no corre el riesgo de que alguien lo lea como una obra ejecutada.
 *
 * QUÉ DICE Y QUÉ NO. Las cuatro capas y sus textos salen de la ficha real de
 * `lona-plastificada-rafia-polytarp`. No hay norma citada, no hay sello y no
 * hay ningún número que no esté en esa ficha.
 *
 * QUÉ CAMBIÓ EN ESTA PASADA — Y POR QUÉ. Antes el dibujo era estático: la
 * única señal de que una píldora había hecho algo era un `translateY(-4px)` de
 * 320 ms y un cambio de texto. Es decir, el comprador cambiaba el gramaje y
 * veía cambiar una LEYENDA. Ahora cambia la GEOMETRÍA:
 *
 *   · material  → la cara 02 cambia de aspecto (PVC con brillo, rafia con
 *                 trama tejida, polytarp mate, algodón con tejido de lienzo)
 *   · color     → el relleno de la cara 02, del swatch de `lib/lona-config.ts`
 *   · gramaje   → la capa 03 se EXTRUYE: 200 g/m² es una lámina, 900 es un
 *                 bloque, e interpolado en el medio
 *   · ancho     → el paño entero se ensancha, de 1.5 m a 4.0 m
 *   · acabado   → brillo, punteado esmerilado o nada
 *   · confección→ insignias que entran y salen sobre la capa 04
 *   · tratamientos → la capa 01 gana cuerpo con cada uno
 *
 * Y hay movimiento de reposo: las cuatro capas flotan con amplitud, periodo y
 * desfase distintos, de modo que nunca se mueven en bloque. La línea de llamada
 * de cada capa vive DENTRO de su grupo flotante, así que acompaña a la capa a
 * la que apunta en lugar de quedarse clavada.
 *
 * TODO ES `transform` Y `opacity` — las dos propiedades que el compositor anima
 * sin repintar. Nada de WebGL, nada de `requestAnimationFrame` a mano: las
 * animaciones las declara framer-motion y las ejecuta el navegador.
 *
 * Y SE CALLA CUANDO SE LO PIDEN. Con `prefers-reduced-motion: reduce` no hay
 * bucle, no hay flotación y no hay pulso: el esquema se queda quieto, con la
 * misma geometría, que es la información. `useMovimiento()` empieza además en
 * «quieto», así que quien pidió menos movimiento no llega a ver ni el destello.
 */

interface Props {
  spec: LonaSpec;
  /** Capa a resaltar, si el configurador quiere dirigir la mirada. */
  foco?: 1 | 2 | 3 | 4 | null;
  /** Se incrementa en cada cambio: dispara el pulso de la capa enfocada. */
  pulso?: number;
  className?: string;
}

const NAVY = '#0A2540';
const VERDE = '#059669';
const VERDE_OSC = '#047857';
const CX = 150;
/** Relación isométrica del paralelogramo: alto de media cara / semiancho. */
const RAZON = 0.262;

/** Alturas de arranque de las cuatro capas dentro del viewBox de 300. */
const ALTURA = [26, 86, 146, 206] as const;

/**
 * Amplitud, periodo y desfase de la flotación, por capa. Números distintos a
 * propósito: si las cuatro compartieran periodo el conjunto subiría y bajaría
 * como un bloque y parecería un solo objeto, no cuatro capas separadas.
 */
const FLOTE = [
  { amplitud: 3.4, duracion: 5.2, retraso: 0 },
  { amplitud: 2.4, duracion: 6.1, retraso: 0.5 },
  { amplitud: 1.8, duracion: 7.3, retraso: 1.1 },
  { amplitud: 1.2, duracion: 8.4, retraso: 0.3 },
] as const;

/** Mezcla un hex hacia el negro: las caras laterales de la extrusión. */
function oscurecer(hex: string, factor: number): string {
  const limpio = hex.replace('#', '');
  if (limpio.length !== 6) return hex;
  const n = parseInt(limpio, 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.round(v * (1 - factor))),
  );
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const caraPuntos = (y: number, W: number) => {
  const H = W * RAZON;
  return `${CX - W},${y + H} ${CX},${y} ${CX + W},${y + H} ${CX},${y + 2 * H}`;
};

const ladoIzquierdo = (y: number, W: number, t: number) => {
  const H = W * RAZON;
  return `${CX - W},${y + H} ${CX},${y + 2 * H} ${CX},${y + 2 * H + t} ${CX - W},${y + H + t}`;
};

const ladoDerecho = (y: number, W: number, t: number) => {
  const H = W * RAZON;
  return `${CX + W},${y + H} ${CX},${y + 2 * H} ${CX},${y + 2 * H + t} ${CX + W},${y + H + t}`;
};

/** Muelle corto: el pulso se nota y se va, no rebota tres veces. */
const MUELLE = { type: 'spring', stiffness: 320, damping: 17, mass: 0.6 } as const;

/**
 * Cada capa flota con sus propios números y, si es la que acaba de cambiar, su
 * grupo interno se vuelve a montar (`key` con el contador de pulsos) y entra
 * con un muelle: escala un pelo, se levanta y se asienta.
 *
 * VIVE EN EL MÓDULO, NO DENTRO DEL RENDER. Definida dentro de
 * `LonaExploded` sería un tipo de componente NUEVO en cada render: React
 * desmontaría y volvería a montar las cuatro capas en cada pulsación, y las
 * animaciones de reposo arrancarían de cero cada vez. Es exactamente el fallo
 * que hace que una animación «no se vea».
 */
function Capa({
  n,
  W,
  foco,
  pulso,
  mover,
  children,
}: {
  n: 1 | 2 | 3 | 4;
  W: number;
  foco: 1 | 2 | 3 | 4 | null;
  pulso: number;
  mover: boolean;
  children: React.ReactNode;
}) {
  const f = FLOTE[n - 1];
  const y = ALTURA[n - 1];
  const H = W * RAZON;
  const esta = foco === n;
  return (
      <motion.g
        animate={mover ? { y: [0, -f.amplitud, 0] } : { y: 0 }}
        transition={
          mover
            ? { duration: f.duracion, repeat: Infinity, ease: 'easeInOut', delay: f.retraso }
            : { duration: 0 }
        }
      >
        <motion.g
          key={`capa-${n}-${esta ? pulso : 'quieta'}`}
          initial={esta && pulso > 0 ? { scale: 1.055, y: -7 } : false}
          animate={{ scale: 1, y: esta ? -5 : 0 }}
          transition={mover ? MUELLE : { duration: 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {children}
        </motion.g>
        {/* La llamada vive dentro del grupo flotante: apunta a la capa incluso
            mientras la capa se mueve. Antes era una línea recta dibujada una
            vez, y en cuanto algo se movía dejaba de señalar a nada. */}
        <line
          x1={CX + W + 5}
          y1={y + H}
          x2="290"
          y2={y + H}
          stroke={esta ? VERDE : '#94A3B8'}
          strokeWidth={esta ? 2 : 1}
          style={{ transition: 'stroke 240ms ease' }}
        />
        <text
          x="297"
          y={y + H - 5}
          fontSize="11"
          fontWeight="600"
          fill={esta ? VERDE_OSC : '#64748B'}
          textAnchor="end"
        >
          0{n}
        </text>
    </motion.g>
  );
}

/** Caja isométrica completa: cara superior + las dos caras de la extrusión. */
function Bloque({
  n,
  W,
  foco,
  relleno,
  borde,
  espesor,
  sombraLado,
}: {
  n: 1 | 2 | 3 | 4;
  W: number;
  foco: 1 | 2 | 3 | 4 | null;
  relleno: string;
  borde: string;
  espesor: number;
  sombraLado: string;
}) {
  const y = ALTURA[n - 1];
  return (
    <>
      {espesor > 0 && (
        <>
          <polygon
            points={ladoIzquierdo(y, W, espesor)}
            fill={oscurecer(sombraLado, 0.32)}
            stroke="none"
          />
          <polygon
            points={ladoDerecho(y, W, espesor)}
            fill={oscurecer(sombraLado, 0.16)}
            stroke="none"
          />
        </>
      )}
      <polygon
        points={caraPuntos(y, W)}
        fill={relleno}
        stroke={foco === n ? VERDE : borde}
        strokeWidth={foco === n ? 2.4 : 1.2}
        style={{ transition: 'fill 320ms ease, stroke 240ms ease' }}
      />
    </>
  );
}

export default function LonaExploded({ spec, foco = null, pulso = 0, className = '' }: Props) {
  const mover = useMovimiento();
  const v = specToVisualState(spec);
  const capas = capasDeLona(spec);
  const W = v.medioAncho;

  const capaFoco = capas.find((c) => c.n === foco);
  const yPicto = ALTURA[3] + W * RAZON;

  return (
    <div className={`flex flex-col ${className}`}>
      <svg
        viewBox="0 0 300 302"
        className="mx-auto block w-full max-w-[300px] min-h-0 flex-1"
        role="img"
        aria-label={`Esquema del despiece de una lona en ${lonaGramajeLabel(spec.gramaje)}, ${lonaAnchoLabel(spec.ancho).toLowerCase()}: acabado, cara plastificada, núcleo tejido y confección inferior.`}
      >
        <defs>
          {/* Trama de la capa 03: lo que distingue un tejido de una lámina. */}
          <pattern id="lona-trama" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 0H6M0 3H6" stroke={NAVY} strokeOpacity="0.3" strokeWidth="1" />
            <path d="M0 0V6M3 0V6" stroke={NAVY} strokeOpacity="0.2" strokeWidth="1" />
          </pattern>
          {/* Rafia PP: tejido plano y visible. */}
          <pattern id="lona-trama-rafia" width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 1.6H7M0 5.1H7" stroke="#0A2540" strokeOpacity="0.4" strokeWidth="1.7" />
            <path d="M1.6 0V7M5.1 0V7" stroke="#0A2540" strokeOpacity="0.26" strokeWidth="1.7" />
          </pattern>
          {/* Algodón encerado: tejido de lienzo, más fino y más cálido. */}
          <pattern id="lona-trama-lienzo" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 0.9H4M0 2.9H4" stroke="#78350F" strokeOpacity="0.4" strokeWidth="1" />
            <path d="M0.9 0V4M2.9 0V4" stroke="#78350F" strokeOpacity="0.3" strokeWidth="1" />
          </pattern>
          {/* Punteado del acabado esmerilado. */}
          <pattern id="lona-esmerilado" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="0.75" fill="#ffffff" fillOpacity="0.62" />
            <circle cx="3.6" cy="3.4" r="0.55" fill="#ffffff" fillOpacity="0.4" />
          </pattern>
          <linearGradient id="lona-brillo" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="lona-topcoat" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#A7F3D0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>
          <filter id="lona-sombra" x="-25%" y="-25%" width="150%" height="170%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={NAVY} floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Sombra de apoyo: respira despacio y da la sensación de que el
            conjunto flota sobre la página en lugar de estar pegado a ella.
            Es una elipse con opacidad y radio animados — mucho más barato que
            animar el `filter` de todo el grupo. */}
        <motion.ellipse
          cx={CX}
          cy="296"
          rx={W * 0.72}
          ry="7"
          fill={NAVY}
          animate={mover ? { opacity: [0.1, 0.16, 0.1], scaleX: [1, 1.05, 1] } : { opacity: 0.13 }}
          transition={mover ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        <g filter="url(#lona-sombra)">
          {/* 01 · ACABADO. Gana cuerpo con cada tratamiento pedido. */}
          <Capa n={1} W={W} foco={foco} pulso={pulso} mover={mover}>
            <Bloque
              n={1}
              W={W}
              foco={foco}
              relleno="rgba(255,255,255,0.92)"
              borde="#CBD5E1"
              espesor={v.opacidadTratamiento > 0 ? 3 : 0}
              sombraLado="#E2E8F0"
            />
            <AnimatePresence>
              {v.opacidadTratamiento > 0 && (
                <motion.polygon
                  key="topcoat"
                  points={caraPuntos(ALTURA[0], W)}
                  fill="url(#lona-topcoat)"
                  stroke="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: v.opacidadTratamiento }}
                  exit={{ opacity: 0 }}
                  transition={mover ? MUELLE : { duration: 0 }}
                />
              )}
            </AnimatePresence>
          </Capa>

          {/* 02 · CARA PLASTIFICADA. Color, material y acabado, los tres. */}
          <Capa n={2} W={W} foco={foco} pulso={pulso} mover={mover}>
            <Bloque
              n={2}
              W={W}
              foco={foco}
              relleno={v.colorCara}
              borde="#94A3B8"
              espesor={2.5}
              sombraLado={v.colorCara}
            />
            {v.patronMaterial && (
              <polygon
                points={caraPuntos(ALTURA[1], W)}
                fill={`url(#${v.patronMaterial})`}
                stroke="none"
              />
            )}
            {v.brillo > 0 && (
              <motion.polygon
                points={caraPuntos(ALTURA[1], W)}
                fill="url(#lona-brillo)"
                stroke="none"
                animate={{ opacity: v.brillo }}
                transition={mover ? MUELLE : { duration: 0 }}
              />
            )}
            {v.estipulado && (
              <polygon
                points={caraPuntos(ALTURA[1], W)}
                fill="url(#lona-esmerilado)"
                stroke="none"
              />
            )}
          </Capa>

          {/* 03 · NÚCLEO TEJIDO. El gramaje se ve como espesor, no como texto. */}
          <Capa n={3} W={W} foco={foco} pulso={pulso} mover={mover}>
            <Bloque
              n={3}
              W={W}
              foco={foco}
              relleno="#E2E8F0"
              borde="#94A3B8"
              espesor={v.espesorNucleo}
              sombraLado="#CBD5E1"
            />
            <motion.polygon
              points={caraPuntos(ALTURA[2], W)}
              fill="url(#lona-trama)"
              stroke="none"
              animate={{ opacity: v.opacidadTrama }}
              transition={mover ? MUELLE : { duration: 0 }}
            />
          </Capa>

          {/* 04 · CONFECCIÓN. Cada elección entra y sale como insignia. */}
          <Capa n={4} W={W} foco={foco} pulso={pulso} mover={mover}>
            <Bloque n={4} W={W} foco={foco} relleno={NAVY} borde={NAVY} espesor={3} sombraLado={NAVY} />
            {v.unionSoldada && (
              // Por encima de 4.0 m hay unión: se dibuja dónde cae.
              <line
                x1={CX}
                y1={ALTURA[3]}
                x2={CX}
                y2={ALTURA[3] + 2 * W * RAZON}
                stroke="#93C5FD"
                strokeWidth="1.6"
                strokeDasharray="5 3"
              />
            )}
            <AnimatePresence>
              {v.pictogramas.map((id, i) => {
                const paso = 26;
                const x = CX - ((v.pictogramas.length - 1) * paso) / 2 + i * paso;
                return (
                  <motion.g
                    key={id}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={mover ? MUELLE : { duration: 0 }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  >
                    <circle cx={x} cy={yPicto} r="10" fill="#ffffff" fillOpacity="0.12" />
                    <g transform={`translate(${x - 8},${yPicto - 8})`} color="#FFFFFF">
                      <TrazosConfeccion id={id} />
                    </g>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </Capa>
        </g>
      </svg>

      {/* Pie vivo: en un teléfono la lista de cuatro capas no cabe junto al
          dibujo, pero decir QUÉ acaba de cambiar sí cabe en una línea. */}
      <p
        aria-live="polite"
        className="mt-2 min-h-[2.5rem] px-1 text-center text-xs leading-snug text-gray-600 lg:hidden"
      >
        {capaFoco ? (
          <>
            <span className="font-semibold text-[#047857]">0{capaFoco.n} · {capaFoco.titulo}</span>{' '}
            <span className="text-gray-500">{capaFoco.texto}</span>
          </>
        ) : (
          <span className="text-gray-500">
            Cuatro capas: acabado, cara plastificada, núcleo tejido y confección. Toque una opción
            y mire cuál cambia.
          </span>
        )}
      </p>
    </div>
  );
}
