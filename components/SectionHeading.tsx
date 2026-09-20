import type { ReactNode } from 'react';

/**
 * Encabezado de sección unificado para todo el sitio.
 *
 * Un único patrón tipográfico y de alineación:
 *  - Eyebrow: 12px, mayúsculas, tracking amplio, verde de marca.
 *  - Título:  serif display, escala responsiva idéntica en todas las secciones
 *             (text-3xl base → md:text-4xl), tracking-tighter, navy.
 *  - Alineación a la izquierda por defecto (align="center" solo para CTAs).
 *
 * Reemplaza los encabezados ad-hoc que variaban en tamaño, tracking y
 * alineación entre páginas.
 */

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light'; // light = texto claro sobre fondos oscuros
  className?: string;
  action?: ReactNode; // p.ej. enlace "Ver todo" alineado a la derecha
  /**
   * Escala del título.
   *
   *  - 'default' (`.t-h2`, 28 → 40 px) — la de todo el sitio. No se toca.
   *  - 'compact' (`.t-h2-compact`, 22 → 32 px) — OPT-IN, para los títulos
   *    largos que en un teléfono se leen como una valla publicitaria.
   *
   * Por qué una variante y no bajar `.t-h2`: la clase compartida la usan
   * /servicios, /nosotros y dos bloques más de la portada, con títulos
   * cortos que están bien a 28 px. Sólo dos encabezados de la portada
   * tienen el problema, y es por la LONGITUD del texto, no por la escala.
   * Cambiar el token compartido habría encogido cinco encabezados sanos
   * para arreglar dos.
   */
  size?: 'default' | 'compact';
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className = '',
  action,
  size = 'default',
}: Props) {
  const alignCls = align === 'center' ? 'text-center mx-auto items-center' : 'text-left';
  const titleColor = tone === 'light' ? 'text-white' : 'text-[#0A2540]';
  const descColor = tone === 'light' ? 'text-white/70' : 'text-gray-600';

  const heading = (
    <div className={`flex flex-col ${alignCls} ${description || !action ? '' : ''}`}>
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className={`${size === 'compact' ? 't-h2-compact' : 't-h2'} font-semibold ${titleColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base md:text-lg leading-relaxed max-w-2xl ${descColor} ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );

  // Con acción (p.ej. "Ver todo"), fila con el enlace a la derecha en desktop.
  if (action && align === 'left') {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${className}`}>
        {heading}
        <div className="shrink-0">{action}</div>
      </div>
    );
  }

  return <div className={className}>{heading}</div>;
}
