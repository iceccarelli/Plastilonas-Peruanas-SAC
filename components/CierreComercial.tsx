import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_LABEL, mensajeWhatsApp, type IdiomaAccion } from '@/lib/acciones';

/**
 * EL BLOQUE QUE CIERRA UNA PÁGINA, UNA SOLA VEZ EN EL REPOSITORIO.
 *
 * Dieciséis páginas terminaban con la misma tarjeta azul —título, párrafo y
 * dos botones— copiada y pegada, con las clases repetidas a mano en cada una.
 * Copiada, se desincroniza: el botón principal se llamaba de seis maneras
 * distintas, el secundario a veces llevaba flecha y a veces no, y NINGUNA de
 * las quince en español ofrecía WhatsApp, que es el canal por el que entra la
 * mayoría de las consultas comerciales en el Perú.
 *
 * Esto no es un cambio de diseño: el bloque se ve igual. Lo que cambia es
 * dónde vive. La página sigue decidiendo qué dice y a dónde lleva —eso es
 * contenido, y es suyo—; el vocabulario de los botones, su agrupación, su
 * altura de toque y su atribución dejan de ser decisión de cada página.
 *
 * `contexto` es obligatorio a propósito: sin él, el clic de WhatsApp llega a
 * analítica sin decir de qué página salió, que es como no llegar.
 */

export interface AccionCierre {
  href: string;
  label: string;
  /**
   * Flecha al final. Se declara por acción y no por posición: la llevaban las
   * que invitan a seguir leyendo, y se conserva exactamente donde estaba antes
   * de agrupar el bloque. Un icono que aparece solo cambia el significado del
   * botón sin que nadie lo decida.
   */
  flecha?: boolean;
}

interface Props {
  titulo: React.ReactNode;
  /** El párrafo. Va como children para que la página pueda interpolar sus datos. */
  children: React.ReactNode;
  principal: AccionCierre;
  secundaria?: AccionCierre;
  /** Añade el botón de WhatsApp al grupo. Por defecto, sí en español. */
  whatsapp?: boolean;
  /**
   * Mensaje con el que abre WhatsApp, cuando la página tiene uno mejor que el
   * genérico: las cuñas comerciales llevan el suyo, con el producto y los
   * datos que esa línea necesita. Sin esto, migrarlas al bloque común habría
   * cambiado un mensaje específico por uno de plantilla, que es peor.
   */
  whatsappMensaje?: string;
  /** Punto de salida para atribución: 'recursos', 'producto:big-bags', 'en-sourcing'. */
  contexto: string;
  idioma?: IdiomaAccion;
  /** Pie del bloque: identidad fiscal, aviso o dato de contacto. */
  nota?: React.ReactNode;
  className?: string;
}

const PRIMARIO =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90';
const SECUNDARIO =
  'inline-flex min-h-[44px] items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10';

export default function CierreComercial({
  titulo,
  children,
  principal,
  secundaria,
  whatsapp = true,
  whatsappMensaje,
  contexto,
  idioma = 'es',
  nota,
  className = '',
}: Props) {
  return (
    <div className={`rounded-3xl bg-[#0A2540] p-10 text-center text-white ${className}`.trim()}>
      <h2 className="mb-3 text-3xl font-semibold tracking-tight">{titulo}</h2>
      <p className="mx-auto mb-7 max-w-lg text-white/80">{children}</p>
      {/* Un grupo, no tres botones sueltos: el lector ve una decisión con
          opciones, y un lector de pantalla la anuncia como tal. */}
      <div
        role="group"
        aria-label={idioma === 'en' ? 'Next steps' : 'Acciones comerciales'}
        className="flex flex-col justify-center gap-3 sm:flex-row"
      >
        <Link href={principal.href} className={PRIMARIO}>
          {principal.label}
          {principal.flecha ? <ArrowRight className="h-4 w-4" /> : null}
        </Link>
        {secundaria ? (
          <Link href={secundaria.href} className={SECUNDARIO}>
            {secundaria.label}
            {secundaria.flecha ? <ArrowRight className="h-4 w-4" /> : null}
          </Link>
        ) : null}
        {whatsapp ? (
          <WhatsAppLink
            context={contexto}
            message={whatsappMensaje ?? mensajeWhatsApp(contexto, idioma)}
            className={SECUNDARIO}
          >
            {WHATSAPP_LABEL[idioma]}
          </WhatsAppLink>
        ) : null}
      </div>
      {nota ? <p className="mt-5 text-sm text-white/60">{nota}</p> : null}
    </div>
  );
}
