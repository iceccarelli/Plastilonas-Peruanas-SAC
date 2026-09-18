/**
 * LOS MISMOS DIBUJOS EN LOS DOS SITIOS.
 *
 * El despiece pinta una insignia de «ojal» sobre la capa 4 y la píldora de
 * «Ojales» pinta un ojal dentro del botón. Si fueran dos dibujos distintos, el
 * comprador tendría que aprender dos veces el mismo símbolo. Los trazos se
 * escriben una vez, en un lienzo de 16×16, y los usan tanto el `<svg>` del
 * despiece —dentro de un `<g transform>`— como el `<svg>` de la píldora.
 *
 * Todos heredan `currentColor`: el mismo trazo va en blanco sobre la capa
 * inferior azul y en verde dentro de una píldora activa, sin duplicar nada.
 */

/** Trazos de confección en un lienzo de 16×16. Se insertan tal cual. */
export function TrazosConfeccion({ id }: { id: string }) {
  switch (id) {
    case 'ojales':
      return (
        <>
          <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </>
      );
    case 'hf':
      // Soldadura de alta frecuencia: un cordón continuo, no una puntada.
      return (
        <>
          <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M1.5 10.5h13"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
        </>
      );
    case 'costura':
      return (
        <>
          <path
            d="M1.5 6h13"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeDasharray="3 2.2"
            strokeLinecap="round"
          />
          <path
            d="M1.5 10.5h13"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeDasharray="3 2.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </>
      );
    case 'cremallera':
      return (
        <>
          <path d="M8 1.5v13" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.7" />
          <path
            d="M4 3.5h3M4 7h3M4 10.5h3M9 5.2h3M9 8.7h3M9 12.2h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      );
    case 'velcro':
      return (
        <>
          <rect
            x="1.4"
            y="4"
            width="13.2"
            height="8"
            rx="1.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M4 6.6h1.6M7.2 6.6h1.6M10.4 6.6h1.6M4 9.4h1.6M7.2 9.4h1.6M10.4 9.4h1.6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return null;
  }
}

/** El mismo trazo, ya envuelto en su propio `<svg>`, para una píldora. */
export function IconoConfeccion({ id, className = 'h-4 w-4' }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
      <TrazosConfeccion id={id} />
    </svg>
  );
}

/** Trazos de tratamiento en un lienzo de 16×16. */
export function TrazosTratamiento({ id }: { id: string }) {
  switch (id) {
    case 'uv':
      // Sol: lo que el anti-UV recibe.
      return (
        <>
          <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3.1 3.1l1.3 1.3M11.6 11.6l1.3 1.3M12.9 3.1l-1.3 1.3M4.4 11.6l-1.3 1.3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );
    case 'ignifugo':
      return (
        <path
          d="M8 1.5c2.6 2.4 3.9 4.3 3.9 6.1 0 1-.4 1.9-1.1 2.5.1-1.3-.5-2.4-1.7-3.4.2 2.2-.7 3.3-1.6 4.1-.8-.6-1.2-1.4-1.2-2.3-1 .9-1.5 1.9-1.5 3-1-.8-1.7-2-1.7-3.4 0-2.3 1.9-4.4 4.9-6.6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      );
    case 'antiestatico':
      return (
        <path
          d="M9 1.5 4 8.6h3.2L6.6 14.5 12 7.1H8.6L9 1.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      );
    case 'antibacteriano':
      return (
        <>
          <path
            d="M8 1.6 2.8 3.7v4.1c0 3 2.2 5.4 5.2 6.6 3-1.2 5.2-3.6 5.2-6.6V3.7L8 1.6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M5.7 7.9 7.3 9.6l3.1-3.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    default:
      return null;
  }
}

export function IconoTratamiento({ id, className = 'h-4 w-4' }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
      <TrazosTratamiento id={id} />
    </svg>
  );
}

/**
 * Muestra de material: el mismo aspecto que tendrá la cara 02 del despiece.
 * Es el argumento de la píldora — «rafia» no significa nada hasta que se ve
 * que es un tejido y no una lámina.
 */
export function MuestraMaterial({
  material,
  className = 'h-5 w-5',
}: {
  material: string;
  className?: string;
}) {
  const id = `mm-${material}`;
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 rounded-[5px] ${className}`} aria-hidden="true">
      <defs>
        {material === 'rafia' && (
          <pattern id={`${id}-p`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 1h4M0 3h4" stroke="#0A2540" strokeOpacity="0.45" strokeWidth="1.2" />
            <path d="M1 0v4M3 0v4" stroke="#0A2540" strokeOpacity="0.3" strokeWidth="1.2" />
          </pattern>
        )}
        {material === 'algodon' && (
          <pattern id={`${id}-p`} width="3" height="3" patternUnits="userSpaceOnUse">
            <path d="M0 0h3M0 1.5h3" stroke="#78350F" strokeOpacity="0.35" strokeWidth="0.9" />
            <path d="M0.75 0v3M2.25 0v3" stroke="#78350F" strokeOpacity="0.28" strokeWidth="0.9" />
          </pattern>
        )}
        {material === 'pvc' && (
          <linearGradient id={`${id}-p`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0A2540" stopOpacity="0.22" />
          </linearGradient>
        )}
      </defs>
      <rect
        x="0"
        y="0"
        width="20"
        height="20"
        rx="5"
        fill={
          material === 'algodon' ? '#D6C7A8' : material === 'polytarp' ? '#8FA3B8' : '#5B7793'
        }
      />
      {material !== 'polytarp' && (
        <rect x="0" y="0" width="20" height="20" rx="5" fill={`url(#${id}-p)`} />
      )}
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="4.5"
        fill="none"
        stroke="#0A2540"
        strokeOpacity="0.2"
      />
    </svg>
  );
}

/** Muestra del acabado: mate plano, brillante con reflejo, esmerilado punteado. */
export function MuestraTextura({
  textura,
  className = 'h-5 w-5',
}: {
  textura: string;
  className?: string;
}) {
  const id = `mt-${textura}`;
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 rounded-[5px] ${className}`} aria-hidden="true">
      <defs>
        {textura === 'brillante' && (
          <linearGradient id={`${id}-p`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        )}
        {textura === 'esmerilado' && (
          <pattern id={`${id}-p`} width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.55" fill="#ffffff" fillOpacity="0.75" />
            <circle cx="2.4" cy="2.3" r="0.4" fill="#ffffff" fillOpacity="0.5" />
          </pattern>
        )}
      </defs>
      <rect x="0" y="0" width="20" height="20" rx="5" fill="#44607E" />
      {textura !== 'mate' && (
        <rect x="0" y="0" width="20" height="20" rx="5" fill={`url(#${id}-p)`} />
      )}
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="4.5"
        fill="none"
        stroke="#0A2540"
        strokeOpacity="0.2"
      />
    </svg>
  );
}

/**
 * Barra de proporción. «500 – 700 g/m²» es un número; la barra dice de un
 * vistazo que ese número está a dos tercios del rango de la ficha. No añade
 * un dato: hace legible el que ya estaba.
 */
export function BarraProporcion({
  fraccion,
  activa,
  className = '',
}: {
  fraccion: number;
  activa: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block h-1 w-full overflow-hidden rounded-full ${
        activa ? 'bg-white/30' : 'bg-gray-200'
      } ${className}`}
    >
      <span
        className={`block h-full rounded-full transition-[width] duration-300 ease-out ${
          activa ? 'bg-white' : 'bg-[#059669]'
        }`}
        style={{ width: `${Math.round(Math.min(1, Math.max(0.06, fraccion)) * 100)}%` }}
      />
    </span>
  );
}
