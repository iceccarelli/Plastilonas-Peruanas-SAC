'use client';

import {
  lonaColorHex,
  lonaColorLabel,
  lonaGramajeLabel,
  lonaMaterialLabel,
  lonaTexturaLabel,
} from '@/lib/lona-config';

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
 * hay ningún número que no esté en esa ficha. Cuando el configurador cambia
 * el material, el gramaje o el color, cambian las leyendas y se resalta la
 * capa afectada: es el mismo dato, mostrado donde se decide.
 *
 * Es SVG inline: escala sin pixelarse, pesa unos pocos KB y no añade una
 * petición más al primer pintado de la portada.
 */

interface Props {
  material: string;
  gramaje: string;
  color: string;
  textura: string;
  /** Capa a resaltar, si el configurador quiere dirigir la mirada. */
  foco?: 1 | 2 | 3 | 4 | null;
  className?: string;
}

const NAVY = '#0A2540';
const VERDE = '#059669';
const VERDE_OSC = '#047857';

/** Paralelogramo isométrico: una capa vista en perspectiva. */
function Capa({
  y,
  fill,
  stroke,
  activa,
  trama,
}: {
  y: number;
  fill: string;
  stroke: string;
  activa: boolean;
  trama?: boolean;
}) {
  const puntos = `20,${y + 34} 150,${y} 280,${y + 34} 150,${y + 68}`;
  return (
    <g
      style={{
        transition: 'transform 320ms ease, opacity 320ms ease',
        transform: activa ? 'translateY(-4px)' : 'none',
        opacity: activa ? 1 : 0.9,
      }}
    >
      <polygon
        points={puntos}
        fill={fill}
        stroke={activa ? VERDE : stroke}
        strokeWidth={activa ? 2.5 : 1.2}
      />
      {trama && (
        // La trama se dibuja, no se describe: es lo que distingue un tejido
        // de una lámina, y es la capa por la que se pregunta el gramaje.
        <polygon points={puntos} fill="url(#lona-trama)" stroke="none" />
      )}
    </g>
  );
}

export default function LonaExploded({
  material,
  gramaje,
  color,
  textura,
  foco = null,
  className = '',
}: Props) {
  const hex = lonaColorHex(color) || '#94A3B8';
  const esTejido = material === 'rafia' || material === 'algodon';

  const capas = [
    {
      n: 1,
      titulo: 'Acabado / tratamiento superficial',
      texto:
        'Anti-UV, ignífugo, antiestático o antibacteriano — se piden uno a uno, no vienen incluidos por defecto.',
    },
    {
      n: 2,
      titulo: 'Cara plastificada',
      texto: `${lonaMaterialLabel(material)} · color ${lonaColorLabel(color).toLowerCase()} · acabado ${lonaTexturaLabel(textura).toLowerCase()}. Es la cara que recibe sol, lluvia y logo impreso.`,
    },
    {
      n: 3,
      titulo: 'Núcleo tejido / trama',
      texto: `${esTejido ? 'Trama tejida' : 'Base de rafia PP tejida'} · ${lonaGramajeLabel(gramaje)}. El gramaje es lo que aguanta el desgarro; el rango de trabajo va de 200 a 900 g/m².`,
    },
    {
      n: 4,
      titulo: 'Cara inferior y confección',
      texto:
        'Backing, borde reforzado, ojales y cierre por soldadura HF o costura doble. Hasta 4.0 m en una pieza; por encima, unión soldada.',
    },
  ];

  return (
    <div className={`grid gap-6 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-8 items-center ${className}`}>
      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-[260px] mx-auto sm:mx-0 h-auto"
        role="img"
        aria-label="Esquema del despiece de una lona: acabado, cara plastificada, núcleo tejido y confección inferior."
      >
        <defs>
          <pattern id="lona-trama" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 0H6M0 3H6" stroke={NAVY} strokeOpacity="0.28" strokeWidth="1" />
            <path d="M0 0V6M3 0V6" stroke={NAVY} strokeOpacity="0.18" strokeWidth="1" />
          </pattern>
          <filter id="lona-sombra" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={NAVY} floodOpacity="0.16" />
          </filter>
        </defs>
        <g filter="url(#lona-sombra)">
          {/* De arriba abajo: 01 acabado, 02 cara, 03 trama, 04 confección. */}
          <Capa y={26} fill="rgba(255,255,255,0.92)" stroke="#CBD5E1" activa={foco === 1} />
          <Capa y={86} fill={hex} stroke="#94A3B8" activa={foco === 2} />
          <Capa y={146} fill="#E2E8F0" stroke="#94A3B8" activa={foco === 3} trama />
          <Capa y={206} fill={NAVY} stroke={NAVY} activa={foco === 4} />
        </g>
        {/* Líneas de llamada hacia los números de la lista. */}
        {[
          { y: 60, n: '01' },
          { y: 120, n: '02' },
          { y: 180, n: '03' },
          { y: 240, n: '04' },
        ].map((c, i) => (
          <g key={c.n}>
            <line
              x1="282"
              y1={c.y}
              x2="298"
              y2={c.y}
              stroke={foco === i + 1 ? VERDE : '#94A3B8'}
              strokeWidth={foco === i + 1 ? 2 : 1}
            />
            <text
              x="286"
              y={c.y - 6}
              fontSize="11"
              fontWeight="600"
              fill={foco === i + 1 ? VERDE_OSC : '#64748B'}
              textAnchor="end"
            >
              {c.n}
            </text>
          </g>
        ))}
      </svg>

      <ol className="space-y-3">
        {capas.map((c) => {
          const activa = foco === c.n;
          return (
            <li
              key={c.n}
              className={`rounded-xl border p-4 transition-colors ${
                activa ? 'border-[#059669] bg-[#059669]/5' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xs font-semibold tabular-nums ${activa ? 'text-[#047857]' : 'text-gray-400'}`}
                >
                  0{c.n}
                </span>
                <span className="font-semibold text-sm text-[#0A2540]">{c.titulo}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{c.texto}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
