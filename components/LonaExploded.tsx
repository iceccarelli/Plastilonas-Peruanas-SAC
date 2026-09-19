'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  amplitudGiro,
  apartadoCapa,
  capasDeLona,
  opacidadCapa,
  specToVisualState,
  GIRO_SEGUNDOS,
  type Capa as NumCapa,
} from '@/lib/lona-visual';
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
 * hay ningún número que no esté en esa ficha — el esquema va sin precio, igual
 * que el resumen que viaja al RFQ. Los ojales que se dibujan son ILUSTRATIVOS
 * —su número está topado— y no declaran diámetro, material ni referencia.
 *
 * QUÉ CAMBIÓ EN ESTA PASADA — Y POR QUÉ. La pasada anterior puso la
 * MATEMÁTICA: flotación por capa, muelles, y `specToVisualState` traduciendo la
 * especificación a geometría. Lo que seguía siendo primitivo era el DIBUJO:
 * rellenos planos, una rejilla haciendo de «tejido» y los ojales como puntitos
 * oscuros. Esta pasada arregla el material:
 *
 *   · 01 ACABADO  → barniz TRASLÚCIDO sobre la cara: degradado teñido por los
 *                   tratamientos pedidos más una veta de reflejo. Ya no es un
 *                   rectángulo blanco.
 *   · 02 CARA     → cada material responde a la luz de otra manera (PVC
 *                   especular, polytarp apagado) y los tejidos se dibujan con
 *                   un ENTRELAZADO de verdad: urdimbre continua, trama que pasa
 *                   por encima en media pasada y por debajo en la otra. Una
 *                   rejilla de dos líneas cruzadas no es un tejido; esto sí.
 *   · 03 NÚCLEO   → se extruye con el gramaje Y el tejido se CIERRA con él: a
 *                   200 g/m² el azulejo mide 7.2 px y a 900 mide 3.6.
 *   · 04 CONFECCIÓN → cada elección se dibuja SOBRE la capa, no como insignia
 *                   flotante: ojales metálicos con aro, barril y reflejo en el
 *                   canto; cordón de soldadura HF; puntada; cremallera con
 *                   dientes; banda de velcro.
 *
 * Y HAY GIRO. Además de la flotación, el conjunto oscila en guiñada: las capas
 * se desplazan de lado en sentidos opuestos —±12 px la primera y la cuarta, ±4
 * las de en medio—, lo que sobre una pila de 180 px de alto se lee como ±7.6°
 * de guiñada, en un ciclo de 16 s de ida y vuelta. No gira en redondo y no pasa
 * de los topes: es una plataforma de producto, no un tiovivo. Los números
 * —`GIRO_SEGUNDOS`, `amplitudGiro`, `GIRO_GRADOS`— viven en `lib/lona-visual.ts`
 * y tienen prueba: si alguien sube la amplitud hasta marear, salta.
 *
 * TODO ES `transform` Y `opacity` — las dos propiedades que el compositor anima
 * sin repintar. Ni una geometría (`d`, `points`, `width`) se recalcula por
 * fotograma: los `<pattern>` y los polígonos sólo cambian cuando cambia la
 * especificación, que es un evento discreto. Nada de WebGL y nada de
 * `requestAnimationFrame` a mano.
 *
 * Y SE CALLA CUANDO SE LO PIDEN. Con `prefers-reduced-motion: reduce` no hay
 * bucle: ni flotación, ni giro, ni pulso. El AISLADO sí sigue funcionando
 * —es un cambio de estado que pide el usuario, no una animación de ambiente—
 * pero ocurre de golpe, sin muelle. Y el bucle también se para cuando el dibujo
 * no está en pantalla (`useInView`), para no gastar batería pintando algo que
 * nadie ve.
 */

interface Props {
  spec: LonaSpec;
  /** Capa a resaltar, si el configurador quiere dirigir la mirada. */
  foco?: NumCapa | null;
  /** Se incrementa en cada cambio: dispara el pulso de la capa enfocada. */
  pulso?: number;
  /**
   * Capa que el usuario está señalando —con el ratón o con el tabulador— desde
   * una fila de píldoras. Las otras tres se apagan. Es PURAMENTE VISUAL: no
   * selecciona nada y no toca el `aria-pressed` de ninguna píldora.
   */
  aislada?: NumCapa | null;
  /** El dibujo avisa cuando el ratón entra o sale de una capa. */
  onAislar?: (capa: NumCapa | null) => void;
  className?: string;
}

const NAVY = '#0A2540';
const VERDE = '#059669';
const VERDE_OSC = '#047857';
const CX = 150;
/** Relación isométrica del paralelogramo: alto de media cara / semiancho. */
const RAZON = 0.262;

/** Alturas de arranque de las cuatro capas dentro del viewBox. */
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

/** Muelle corto: lo que entra y sale (barniz, confección) se nota y se va. */
const MUELLE = { type: 'spring', stiffness: 320, damping: 17, mass: 0.6 } as const;

/** Sin animación: el estado nuevo ya está puesto cuando termina el fotograma. */
const INSTANTE = { duration: 0 } as const;

/**
 * Transición del AISLADO, en CSS. Con `prefers-reduced-motion: reduce` vale
 * `0ms`: aislar sigue funcionando —lo pide el usuario— pero ocurre de golpe.
 */
const SUAVE = '280ms ease-out';
const YA = '0ms';

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

type P = [number, number];

const caraPuntos = (y: number, W: number) => {
  const H = W * RAZON;
  return `${CX - W},${y + H} ${CX},${y} ${CX + W},${y + H} ${CX},${y + 2 * H}`;
};

/** Las cuatro esquinas del rombo isométrico: izquierda, arriba, derecha, abajo. */
function esquinas(y: number, W: number): { L: P; T: P; R: P; B: P; C: P } {
  const H = W * RAZON;
  return {
    L: [CX - W, y + H],
    T: [CX, y],
    R: [CX + W, y + H],
    B: [CX, y + 2 * H],
    C: [CX, y + H],
  };
}

const entre2 = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Vector unitario que apunta del punto `p` hacia el centro del rombo. */
function haciaDentro(p: P, c: P): P {
  const [dx, dy] = [c[0] - p[0], c[1] - p[1]];
  const m = Math.hypot(dx, dy) || 1;
  return [dx / m, dy / m];
}

const desplazar = (p: P, n: P, d: number): P => [p[0] + n[0] * d, p[1] + n[1] * d];

const ladoIzquierdo = (y: number, W: number, t: number) => {
  const H = W * RAZON;
  return `${CX - W},${y + H} ${CX},${y + 2 * H} ${CX},${y + 2 * H + t} ${CX - W},${y + H + t}`;
};

const ladoDerecho = (y: number, W: number, t: number) => {
  const H = W * RAZON;
  return `${CX + W},${y + H} ${CX},${y + 2 * H} ${CX},${y + 2 * H + t} ${CX + W},${y + H + t}`;
};

/**
 * Punto del CANTO INFERIOR del rombo, recorriéndolo entero de la esquina
 * izquierda a la derecha pasando por la de abajo. `u` va de 0 a 1. Es donde se
 * colocan los ojales: el canto que se ve, no el que queda detrás.
 */
function puntoCanto(y: number, W: number, u: number): P {
  const { L, B, R } = esquinas(y, W);
  return u < 0.5 ? entre2(L, B, u * 2) : entre2(B, R, (u - 0.5) * 2);
}

/* ------------------------------------------------------------------ */
/* TEJIDO DE VERDAD — urdimbre y trama, una pasa por encima de la otra  */
/* ------------------------------------------------------------------ */

/**
 * UN `<pattern>` QUE SE LEE COMO TELA, NO COMO HOJA DE CÁLCULO.
 *
 * Una rejilla —dos líneas horizontales y dos verticales— no es un tejido: es
 * papel milimetrado. Lo que distingue a una tela es el ENTRELAZADO, y eso se
 * dibuja en un azulejo de 2×2 celdas con el ligamento tafetán:
 *
 *   1. los tramos de trama que pasan POR DEBAJO, en sombra
 *   2. la urdimbre entera, de arriba abajo
 *   3. los tramos de trama que pasan POR ENCIMA, que TAPAN la urdimbre
 *   4. un filo claro sobre cada hilo visible, para que el hilo tenga bulto
 *
 * El orden de pintado ES la información: en la mitad izquierda de la fila de
 * arriba la trama cruza por encima, y en la derecha por debajo. Eso es lo que
 * el ojo lee como «tejido».
 */
function Tejido({
  id,
  paso,
  sombra,
  luz,
}: {
  id: string;
  /** Lado de una celda: la mitad del azulejo. Más pequeño, tejido más cerrado. */
  paso: number;
  sombra: string;
  luz: string;
}) {
  const u = paso;
  const d = u * 0.74;
  const o = (u - d) / 2;
  const filo = d * 0.3;
  return (
    <pattern id={id} width={2 * u} height={2 * u} patternUnits="userSpaceOnUse">
      {/* 1 · trama por debajo: sólo su sombra en el cruce */}
      <rect x={u} y={o} width={u} height={d} fill={sombra} fillOpacity="0.5" />
      <rect x={0} y={u + o} width={u} height={d} fill={sombra} fillOpacity="0.5" />
      {/* 2 · urdimbre continua */}
      <rect x={o} y={0} width={d} height={2 * u} fill={sombra} fillOpacity="0.3" />
      <rect x={u + o} y={0} width={d} height={2 * u} fill={sombra} fillOpacity="0.3" />
      {/* 3 · trama por encima: tapa la urdimbre en media pasada */}
      <rect x={0} y={o} width={u} height={d} fill={luz} fillOpacity="0.2" />
      <rect x={u} y={u + o} width={u} height={d} fill={luz} fillOpacity="0.2" />
      {/* 4 · filo claro del hilo que va por encima */}
      <rect x={0} y={o} width={u} height={filo} fill={luz} fillOpacity="0.34" />
      <rect x={u} y={u + o} width={u} height={filo} fill={luz} fillOpacity="0.34" />
      {/* 5 · filo claro de la urdimbre en el tramo en que se la ve */}
      <rect x={o} y={u} width={filo} height={u} fill={luz} fillOpacity="0.22" />
      <rect x={u + o} y={0} width={filo} height={u} fill={luz} fillOpacity="0.22" />
    </pattern>
  );
}

/** Ojal metálico: aro, barril, agujero y un reflejo corto arriba a la izquierda. */
function Ojal({ x, y, r = 4.4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {/* apoyo: sin él el ojal flota sobre la tela en vez de estar clavado */}
      <ellipse cx={x} cy={y + r * 0.34} rx={r * 1.02} ry={r * 0.58} fill="#020617" fillOpacity="0.3" />
      <circle cx={x} cy={y} r={r} fill="url(#lona-metal)" stroke="#334155" strokeWidth="0.45" />
      {/* barril: la banda metálica entre el aro y el agujero */}
      <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke="#64748B" strokeWidth="0.5" strokeOpacity="0.75" />
      <circle cx={x} cy={y} r={r * 0.46} fill="#0A2540" />
      <circle cx={x} cy={y} r={r * 0.46} fill="none" stroke="#020617" strokeOpacity="0.55" strokeWidth="0.5" />
      {/* reflejo: mismo origen de luz que los degradados, arriba a la izquierda */}
      <path
        d={`M${x - r * 0.66},${y - r * 0.38} A ${r * 0.8} ${r * 0.8} 0 0 1 ${x + r * 0.1},${y - r * 0.76}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
    </g>
  );
}

/**
 * CONFECCIÓN DIBUJADA SOBRE LA CAPA, NO COLGADA DE ELLA. Antes cada opción
 * elegida ponía una insignia redonda flotando encima de la capa 04: decía que
 * existía, no dónde caía. Ahora cada una ocupa su canto:
 *
 *   · cremallera → dientes a lo largo del canto superior izquierdo
 *   · velcro     → banda texturada en el canto superior derecho
 *   · hf         → cordón de soldadura: dos líneas paralelas y el tinte del
 *                  calor, sobre el eje del paño
 *   · costura    → hilván discontinuo por dentro de todo el perímetro
 *   · ojales     → en el canto inferior, que es donde se ven
 */
function Confeccion({ id, y, W, ojales }: { id: string; y: number; W: number; ojales: number }) {
  const { L, T, R, B, C } = esquinas(y, W);

  if (id === 'ojales') {
    if (!ojales) return null;
    const n = haciaDentro(B, C);
    return (
      <>
        {Array.from({ length: ojales }, (_, i) => {
          // El recorrido se ENCOGE un 12 %: pegado a la esquina el ojal
          // queda a caballo de dos cantos y parece suelto.
          const p = desplazar(puntoCanto(y, W, 0.06 + ((i + 0.5) / ojales) * 0.88), n, 7);
          return <Ojal key={i} x={p[0]} y={p[1]} r={Math.max(3.2, Math.min(4.6, W / 26))} />;
        })}
      </>
    );
  }

  if (id === 'cremallera') {
    const n = haciaDentro(entre2(L, T, 0.5), C);
    const espina = 4;
    const dientes = 11;
    const a = desplazar(L, n, espina);
    const b = desplazar(T, n, espina);
    return (
      <>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#CBD5E1" strokeOpacity="0.8" strokeWidth="1" />
        {Array.from({ length: dientes }, (_, i) => {
          const p = entre2(a, b, (i + 0.5) / dientes);
          const lado = i % 2 === 0 ? 1 : -1;
          const q = desplazar(p, n, 2.6 * lado);
          return (
            <line
              key={i}
              x1={p[0]}
              y1={p[1]}
              x2={q[0]}
              y2={q[1]}
              stroke="#E2E8F0"
              strokeOpacity="0.9"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </>
    );
  }

  if (id === 'velcro') {
    const n = haciaDentro(entre2(T, R, 0.5), C);
    const a = desplazar(T, n, 1.5);
    const b = desplazar(R, n, 1.5);
    const c = desplazar(R, n, 7.5);
    const d = desplazar(T, n, 7.5);
    return (
      <polygon
        points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`}
        fill="url(#lona-velcro)"
        stroke="#94A3B8"
        strokeOpacity="0.55"
        strokeWidth="0.6"
      />
    );
  }

  if (id === 'hf') {
    // Cordón de alta frecuencia: dos líneas paralelas y el halo del calor
    // alrededor. La zona afectada por el calor es lo que distingue una
    // soldadura de una raya pintada.
    return (
      <>
        <line
          x1={L[0]}
          y1={L[1]}
          x2={R[0]}
          y2={R[1]}
          stroke="#93C5FD"
          strokeOpacity="0.22"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line x1={L[0]} y1={L[1] - 1} x2={R[0]} y2={R[1] - 1} stroke="#DBEAFE" strokeOpacity="0.85" strokeWidth="1.1" />
        <line x1={L[0]} y1={L[1] + 1.6} x2={R[0]} y2={R[1] + 1.6} stroke="#BFDBFE" strokeOpacity="0.6" strokeWidth="1.1" />
      </>
    );
  }

  if (id === 'costura') {
    const k = 0.88;
    const p = [L, T, R, B]
      .map((q) => entre2(C, q, k))
      .map((q) => `${q[0]},${q[1]}`)
      .join(' ');
    return (
      <polygon
        points={p}
        fill="none"
        stroke="#E2E8F0"
        strokeOpacity="0.85"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        strokeLinejoin="round"
      />
    );
  }

  return null;
}

/**
 * Cada capa flota con sus propios números, se desplaza de lado con el giro de
 * plataforma y, si es la que acaba de cambiar, su grupo interno se vuelve a
 * montar (`key` con el contador de pulsos) y entra con un muelle.
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
  aislada,
  aislar,
  onAislar,
  children,
}: {
  n: NumCapa;
  W: number;
  foco: NumCapa | null;
  pulso: number;
  /** ¿Corren los bucles de reposo? Falso con reduced-motion o fuera de pantalla. */
  mover: boolean;
  aislada: NumCapa | null;
  /** Duración de la transición del aislado; `0ms` con reduced-motion. */
  aislar: string;
  onAislar: (capa: NumCapa | null) => void;
  children: React.ReactNode;
}) {
  const f = FLOTE[n - 1];
  const y = ALTURA[n - 1];
  const H = W * RAZON;
  const esta = foco === n;
  const destacada = aislada === n;
  const alza = destacada ? -12 : esta ? -5 : 0;
  return (
    /* CUATRO GRUPOS ANIDADOS, UN MOVIMIENTO CADA UNO. Apilar opacidad,
       flotación, giro y pulso en un solo `transform` obliga a recomponerlo
       entero en cada fotograma y a que los cuatro compartan curva. Separados,
       cada uno lleva su propia animación y el compositor los multiplica. */
    <g
      onMouseEnter={() => onAislar(n)}
      onMouseLeave={() => onAislar(null)}
      style={{ opacity: opacidadCapa(n, aislada), transition: `opacity ${aislar}` }}
    >
      {/* FLOTACIÓN. Amplitud, periodo y desfase propios: si las cuatro
          compartieran periodo la pila subiría y bajaría como un bloque. */}
      <g
        className={mover ? 'lona-flote' : undefined}
        style={
          {
            transformBox: 'fill-box',
            transformOrigin: 'center',
            '--lona-amp': f.amplitud,
            '--lona-dur': `${f.duracion}s`,
            '--lona-ret': `${f.retraso}s`,
          } as React.CSSProperties
        }
      >
        {/* GIRO DE PLATAFORMA. Mismo periodo para las cuatro y amplitudes
            opuestas arriba y abajo: la pila se abre en abanico y vuelve. */}
        <g
          className={mover ? 'lona-giro' : undefined}
          style={
            {
              transformBox: 'fill-box',
              transformOrigin: 'center',
              '--lona-giro': amplitudGiro(n),
              '--lona-giro-dur': `${GIRO_SEGUNDOS}s`,
            } as React.CSSProperties
          }
        >
          {/* PULSO. La `key` con el contador hace que el nodo se vuelva a
              montar y la animación se reproduzca otra vez: sin eso, el segundo
              cambio seguido de la misma capa no se vería. */}
          <g
            key={`capa-${n}-${esta ? pulso : 'quieta'}`}
            className={mover && esta && pulso > 0 ? 'lona-pulso' : undefined}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {/* ESTADO: levantada por el foco, aislada y apartada por la señal
                del usuario. Es una transición, no un bucle: con
                reduced-motion `aislar` vale `0ms` y el cambio es instantáneo. */}
            <g
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: `translate(${apartadoCapa(n, aislada)}px, ${alza}px) scale(${destacada ? 1.035 : 1})`,
                transition: `transform ${aislar}`,
              }}
              filter={destacada ? 'url(#lona-realce)' : undefined}
            >
              {children}
            </g>
          </g>
          {/* La llamada vive dentro de los grupos que se mueven: apunta a la
              capa incluso mientras la capa flota y se desplaza. Antes era una
              línea recta dibujada una vez y en cuanto algo se movía dejaba de
              señalar a nada. Y se apaga con su capa: aislada la 03, el único
              número que queda en pie es el «03». */}
          <line
            x1={CX + W + 5}
            y1={y + H}
            x2="290"
            y2={y + H}
            stroke={esta || destacada ? VERDE : '#94A3B8'}
            strokeWidth={esta || destacada ? 2 : 1}
            style={{ transition: 'stroke 240ms ease' }}
          />
          <text
            x="297"
            y={y + H - 5}
            fontSize="11"
            fontWeight="600"
            fill={esta || destacada ? VERDE_OSC : '#64748B'}
            textAnchor="end"
          >
            0{n}
          </text>
        </g>
      </g>
    </g>
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
  n: NumCapa;
  W: number;
  foco: NumCapa | null;
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

export default function LonaExploded({
  spec,
  foco = null,
  pulso = 0,
  aislada: aisladaFuera = null,
  onAislar,
  className = '',
}: Props) {
  const caja = useRef<HTMLDivElement>(null);
  /** ¿Permite el usuario que esto se mueva? `false` con reduced-motion. */
  const permiteMovimiento = useMovimiento();
  /**
   * Y ADEMÁS, ¿SE ESTÁ VIENDO? Un bucle infinito que corre con el dibujo tres
   * pantallas más arriba gasta batería para nadie. `useInView` —que por debajo
   * es un IntersectionObserver, el mismo mecanismo que usa `Reveal`— lo apaga.
   */
  const enVista = useInView(caja, { margin: '160px' });
  const mover = permiteMovimiento && enVista;
  /**
   * AISLAR ES UN CAMBIO DE ESTADO, NO UN BUCLE. Lo pide el usuario al señalar
   * una fila o una capa, así que sigue funcionando con reduced-motion: lo que
   * desaparece es la transición, que pasa a ser instantánea.
   */
  const aislar = permiteMovimiento ? SUAVE : YA;

  const [aisladaDentro, setAisladaDentro] = useState<NumCapa | null>(null);
  const aislada = aisladaFuera ?? aisladaDentro;

  function señalar(capa: NumCapa | null) {
    setAisladaDentro(capa);
    onAislar?.(capa);
  }

  const v = specToVisualState(spec);
  const capas = capasDeLona(spec);
  const W = v.medioAncho;

  const capaFoco = capas.find((c) => c.n === (aislada ?? foco));

  return (
    <div ref={caja} className={`flex flex-col ${className}`}>
      <svg
        // Margen alrededor del dibujo: el giro de plataforma mueve las capas
        // de lado y sin este aire el contenedor pegajoso de 42vh las cortaba.
        viewBox="-14 -8 328 330"
        className="mx-auto block w-full max-w-[320px] min-h-0 flex-1"
        role="img"
        aria-label={`Esquema del despiece de una lona en ${lonaGramajeLabel(spec.gramaje)}, ${lonaAnchoLabel(spec.ancho).toLowerCase()}: acabado, cara plastificada, núcleo tejido y confección inferior.`}
      >
        <defs>
          {/* TEJIDOS. Mismo ligamento, tres escalas y tres paletas. */}
          <Tejido id="lona-trama-rafia" paso={6} sombra={NAVY} luz="#FFFFFF" />
          <Tejido id="lona-trama-lienzo" paso={3.4} sombra="#78350F" luz="#FFF7ED" />
          {/* El núcleo CIERRA la trama con el gramaje: el azulejo es dato, no
              decoración, y sale de `pasoTramaNucleo` en lib/lona-visual.ts. */}
          <Tejido id="lona-trama-nucleo" paso={v.pasoTramaNucleo} sombra={NAVY} luz="#FFFFFF" />

          {/* RESPUESTA A LA LUZ, POR MATERIAL. Mismo color, distinta lámina. */}
          <linearGradient id="lona-luz-gloss" x1="0" y1="0" x2="0.92" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="24%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor={NAVY} stopOpacity="0.2" />
            <stop offset="72%" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="100%" stopColor={NAVY} stopOpacity="0.24" />
          </linearGradient>
          <linearGradient id="lona-luz-mate" x1="0" y1="0" x2="0.92" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor={NAVY} stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="lona-luz-tejido" x1="0" y1="0" x2="0.92" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor={NAVY} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lona-luz-lienzo" x1="0" y1="0" x2="0.92" y2="1">
            <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.34" />
            <stop offset="50%" stopColor="#FFF7ED" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0.22" />
          </linearGradient>

          {/* BARNIZ DE LA CAPA 01. Teñido por los tratamientos pedidos: el
              acabado no es un cristal incoloro, y tampoco tapa el color. */}
          <linearGradient id="lona-barniz" x1="0" y1="0" x2="1" y2="0.85">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="45%" stopColor={v.tinteAcabado} stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="lona-barniz-punto" cx="0.3" cy="0.22" r="0.6">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="lona-brillo" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
          </linearGradient>

          {/* Metal de los ojales: luz arriba a la izquierda, como todo aquí. */}
          <linearGradient id="lona-metal" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="34%" stopColor="#CBD5E1" />
            <stop offset="64%" stopColor="#8595A8" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Banda de velcro: ganchos, no una raya. */}
          <pattern id="lona-velcro" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="#CBD5E1" fillOpacity="0.5" />
            <path d="M0.6 2.2q0.6 -1.4 1.2 0" fill="none" stroke="#475569" strokeOpacity="0.7" strokeWidth="0.5" />
          </pattern>

          {/* Punteado del acabado esmerilado. */}
          <pattern id="lona-esmerilado" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="0.75" fill="#ffffff" fillOpacity="0.62" />
            <circle cx="3.6" cy="3.4" r="0.55" fill="#ffffff" fillOpacity="0.4" />
          </pattern>

          <filter id="lona-sombra" x="-25%" y="-25%" width="150%" height="170%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={NAVY} floodOpacity="0.16" />
          </filter>
          {/* Realce de la capa aislada: un halo verde de marca, no un borde. */}
          <filter id="lona-realce" x="-30%" y="-40%" width="160%" height="190%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={VERDE} floodOpacity="0.55" />
          </filter>
          {/* Sombra de apoyo: un desenfoque de verdad, no una elipse dura. */}
          <filter id="lona-suelo" x="-60%" y="-160%" width="220%" height="420%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* SUELO. Dos elipses desenfocadas —una ancha y difusa, otra corta y
            densa— dan la profundidad que separa el plástico del fondo. Respira
            despacio, y sólo animando `opacity` y `scaleX`: animar el `filter`
            costaría un repintado por fotograma. */}
        <g
          filter="url(#lona-suelo)"
          className={mover ? 'lona-suelo' : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'center', opacity: mover ? undefined : 0.7 }}
        >
          <ellipse cx={CX} cy="300" rx={W * 0.86} ry="10" fill={NAVY} fillOpacity="0.16" />
          <ellipse cx={CX} cy="300" rx={W * 0.48} ry="6" fill={NAVY} fillOpacity="0.26" />
        </g>

        <g filter="url(#lona-sombra)">
          {/* 01 · ACABADO. Un barniz traslúcido, no un rectángulo blanco. */}
          <Capa n={1} W={W} foco={foco} pulso={pulso} mover={mover} aislada={aislada} aislar={aislar} onAislar={señalar}>
            <Bloque
              n={1}
              W={W}
              foco={foco}
              // TRASLÚCIDA DE VERDAD: por debajo de este baño se ve la página.
              // Un blanco sólido lo convertía en una quinta lámina opaca, que
              // es justo lo que un acabado superficial NO es.
              relleno="rgba(255,255,255,0.10)"
              borde="#CBD5E1"
              espesor={v.opacidadTratamiento > 0 ? 3 : 0}
              sombraLado="#E2E8F0"
            />
            <AnimatePresence>
              {v.opacidadTratamiento > 0 && (
                <motion.g
                  key="barniz"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={mover ? MUELLE : INSTANTE}
                >
                  <polygon
                    points={caraPuntos(ALTURA[0], W)}
                    fill="url(#lona-barniz)"
                    fillOpacity={Math.min(0.62, v.opacidadTratamiento * 2)}
                    stroke="none"
                  />
                  <polygon
                    points={caraPuntos(ALTURA[0], W)}
                    fill="url(#lona-barniz-punto)"
                    fillOpacity="0.32"
                    stroke="none"
                  />
                  {/* Veta de reflejo: lo que convierte una lámina en un barniz. */}
                  <polygon
                    points={`${CX - W * 0.72},${ALTURA[0] + W * RAZON * 0.75} ${CX - W * 0.2},${ALTURA[0] + W * RAZON * 0.2} ${CX - W * 0.05},${ALTURA[0] + W * RAZON * 0.36} ${CX - W * 0.56},${ALTURA[0] + W * RAZON * 0.93}`}
                    fill="#ffffff"
                    fillOpacity="0.42"
                    stroke="none"
                  />
                </motion.g>
              )}
            </AnimatePresence>
          </Capa>

          {/* 02 · CARA PLASTIFICADA. Color, material y acabado, los tres. */}
          <Capa n={2} W={W} foco={foco} pulso={pulso} mover={mover} aislada={aislada} aislar={aislar} onAislar={señalar}>
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
            {/* La lámina responde a la luz según de qué esté hecha. */}
            <polygon
              points={caraPuntos(ALTURA[1], W)}
              fill={`url(#${v.gradienteCara})`}
              fillOpacity={v.aplanado ? 0.45 : 1}
              stroke="none"
            />
            {/* Reflejo especular del PVC: una banda estrecha y dura. */}
            {v.cara === 'gloss' && !v.aplanado && (
              <polygon
                points={`${CX - W * 0.58},${ALTURA[1] + W * RAZON * 0.86} ${CX - W * 0.06},${ALTURA[1] + W * RAZON * 0.32} ${CX + W * 0.1},${ALTURA[1] + W * RAZON * 0.48} ${CX - W * 0.42},${ALTURA[1] + W * RAZON * 1.02}`}
                fill="#ffffff"
                fillOpacity="0.32"
                stroke="none"
              />
            )}
            {v.brillo > 0 && (
              <motion.polygon
                points={caraPuntos(ALTURA[1], W)}
                fill="url(#lona-brillo)"
                stroke="none"
                animate={{ opacity: v.brillo }}
                transition={mover ? MUELLE : INSTANTE}
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

          {/* 03 · NÚCLEO TEJIDO. El gramaje se ve como espesor Y como cierre. */}
          <Capa n={3} W={W} foco={foco} pulso={pulso} mover={mover} aislada={aislada} aislar={aislar} onAislar={señalar}>
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
              fill="url(#lona-trama-nucleo)"
              stroke="none"
              animate={{ opacity: v.opacidadTrama }}
              transition={mover ? MUELLE : INSTANTE}
            />
            <polygon
              points={caraPuntos(ALTURA[2], W)}
              fill="url(#lona-luz-tejido)"
              stroke="none"
            />
          </Capa>

          {/* 04 · CONFECCIÓN. Cada elección ocupa su canto, no flota encima. */}
          <Capa n={4} W={W} foco={foco} pulso={pulso} mover={mover} aislada={aislada} aislar={aislar} onAislar={señalar}>
            <Bloque n={4} W={W} foco={foco} relleno={NAVY} borde={NAVY} espesor={3} sombraLado={NAVY} />
            <polygon points={caraPuntos(ALTURA[3], W)} fill="url(#lona-luz-mate)" stroke="none" />
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
              {v.pictogramas.map((id) => (
                <motion.g
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={mover ? MUELLE : INSTANTE}
                >
                  <Confeccion id={id} y={ALTURA[3]} W={W} ojales={v.ojales} />
                </motion.g>
              ))}
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
