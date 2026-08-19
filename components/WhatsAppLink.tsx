'use client';

import React from 'react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

/**
 * ÚNICO punto de salida a WhatsApp del sitio.
 *
 * Antes había once enlaces `wa.me` escritos a mano (footer, navbar, fichas de
 * producto, páginas de ciudad, contacto, modal de salida). Ninguno disparaba
 * analítica: solo el envío del formulario lo hacía. Es decir, el canal que
 * genera la mayoría de los leads en el Perú era invisible en GA4 y en Meta, y
 * no había forma de saber qué página producía negocio.
 *
 * Además, cada uno repetía el número de teléfono a mano. Un cambio de número
 * habría dejado enlaces apuntando a una línea muerta.
 *
 * Este componente resuelve las dos cosas: número desde una sola fuente y evento
 * `whatsapp_click` con el contexto de origen. `context` es obligatorio: sin él
 * el evento no sirve para atribuir nada.
 */

export interface WhatsAppLinkProps {
  /** Punto de salida, para atribución. Ej.: 'footer', 'producto:big-bags'. */
  context: string;
  /** Mensaje prellenado. Sin él, WhatsApp abre en blanco. */
  message?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export default function WhatsAppLink({
  context,
  message,
  children,
  className,
  ...rest
}: WhatsAppLinkProps) {
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackWhatsAppClick(context)}
      {...rest}
    >
      {children}
    </a>
  );
}
