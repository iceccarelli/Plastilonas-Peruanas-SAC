'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, FileText } from 'lucide-react';
import WhatsAppLink from './WhatsAppLink';
import { TELEFONOS } from '@/lib/site';

/**
 * Barra fija inferior, SOLO móvil: Llamar | WhatsApp | Cotizar.
 *
 * En escritorio los tres canales viven en la cabecera; en un teléfono la
 * cabecera se esconde al bajar y el comprador que ya decidió tenía que volver
 * arriba para actuar. Tres acciones, altura táctil de 48px, respeta el área
 * segura del iPhone. Se oculta en /cotizacion: ahí el CTA es el formulario
 * mismo y la barra taparía su botón de envío.
 *
 * EL ESPACIADOR NO ES DECORACIÓN. La barra está en `position: fixed`, así que
 * no ocupa sitio en el flujo: al final del documento se comía los últimos
 * 48 px del pie. Lo que quedaba debajo, en TODAS las páginas menos /cotizacion,
 * eran «Política de Privacidad» y «Términos y Condiciones» — dos enlaces que
 * un teléfono no podía tocar. No es un detalle estético: son los avisos
 * legales, y tienen que ser alcanzables. Lo encontró una comprobación de
 * solapamiento con elementFromPoint, no una revisión a ojo.
 *
 * El espaciador se renderiza junto a la barra y con la misma condición, así
 * que aparece y desaparece con ella: no hay forma de que uno exista sin el
 * otro.
 */
export default function BarraMovilContacto() {
  const pathname = usePathname();
  if (pathname?.startsWith('/cotizacion')) return null;

  return (
    <>
    <div
      aria-hidden="true"
      className="md:hidden"
      style={{ height: 'calc(48px + env(safe-area-inset-bottom))' }}
    />
    <nav
      aria-label="Contacto rápido"
      className="fixed inset-x-0 bottom-0 z-[80] grid grid-cols-3 md:hidden bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur border-t border-gray-200 dark:border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        href={TELEFONOS.central.tel}
        className="flex items-center justify-center gap-1.5 min-h-[48px] text-sm font-semibold text-[#0A2540] dark:text-[var(--text)]"
      >
        <Phone className="w-4 h-4" /> Llamar
      </a>
      <WhatsAppLink
        context="barra-movil"
        message="Hola, quiero cotizar. Producto: ___. Medidas/cantidad: ___. Ciudad de entrega: ___."
        className="flex items-center justify-center gap-1.5 min-h-[48px] text-sm font-semibold text-[#047857] border-x border-gray-200 dark:border-[var(--border)]"
      >
        WhatsApp
      </WhatsAppLink>
      <Link
        href="/cotizacion"
        className="flex items-center justify-center gap-1.5 min-h-[48px] text-sm font-semibold bg-[#0A2540] text-white dark:bg-[#10B981] dark:text-[#0A2540]"
      >
        <FileText className="w-4 h-4" /> Cotizar
      </Link>
    </nav>
    </>
  );
}
