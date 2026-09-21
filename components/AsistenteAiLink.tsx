'use client';

import React from 'react';
import Link from 'next/link';
import { trackAsistenteCtaClick } from '@/lib/analytics';

/**
 * CTA secundario "Preguntar a Plastilonas AI" — Sprint A (entradas
 * contextuales), hermano de WhatsAppLink.tsx: un único punto de salida hacia
 * `/asistente` con dos cosas que un `<Link>` escrito a mano no da gratis —
 * evento `asistente_cta_click` con el contexto de origen (mismo patrón que
 * `trackWhatsAppClick`) y una única fuente para el texto del botón, para no
 * repetir "Preguntar a Plastilonas AI" de ocho maneras por el sitio.
 *
 * NO es el CTA principal de ninguna página: siempre va junto a "Cotizar" o al
 * botón de WhatsApp del RFQ, nunca en su lugar — el asistente orienta, no
 * reemplaza el camino directo a cotización.
 */

export interface AsistenteAiLinkProps {
  /** Query string ya armado, p.ej. `producto=lona-plastificada`. Sin `?`. */
  query?: string;
  /** Punto de salida, para atribución (mismo campo que `WhatsAppLink.context`). */
  context: string;
  className?: string;
  children?: React.ReactNode;
}

export default function AsistenteAiLink({ query, context, className, children }: AsistenteAiLinkProps) {
  const href = query ? `/asistente?${query}` : '/asistente';
  return (
    <Link href={href} className={className} onClick={() => trackAsistenteCtaClick(context)}>
      {children ?? 'Preguntar a Plastilonas AI'}
    </Link>
  );
}
