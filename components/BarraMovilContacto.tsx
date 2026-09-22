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
 *
 * ─────────────────────────────────────────────────────────────────────────
 * REFORMA 2026-09-20 — de formulario a barra nativa.
 *
 * Lo que había era una rejilla de tres celdas iguales separadas por líneas
 * de 1 px: la forma de una tabla, no la de una barra de acciones. Los tres
 * canales pesaban lo mismo y ninguno se leía como «el botón». Y no había
 * estado de pulsado: en un táctil, donde el hover no existe, tocar no
 * devolvía nada.
 *
 * Ahora hay JERARQUÍA explícita, que es lo que hace nativa a una barra:
 *   · Cotizar — píldora esmeralda, la más ancha y la única sólida. 48 px.
 *     (El `!` de `!min-h-[48px]` no es capricho: `.btn` declara su
 *     `min-height: 44px` DESPUÉS de las utilidades de Tailwind en
 *     globals.css, así que sin él ganaría 44 y la acción principal se
 *     quedaría a la altura de las secundarias. Medido, no supuesto.)
 *   · WhatsApp — píldora secundaria con el verde del canal, reconocible.
 *   · Llamar — icono terciario, un círculo de 44 px (el mínimo táctil).
 * Los tres se hunden a 0.96 al pulsarse, con la misma curva que `.btn`.
 *
 * El cristal (`backdrop-blur-xl` + fondo translúcido) no es decoración: la
 * barra flota sobre contenido que se desplaza por debajo, y el desenfoque es
 * lo que permite que sea opaca a la lectura sin ser opaca a la página. El
 * área segura se respeta en el relleno Y en el espaciador, con el mismo
 * cálculo, para que no se puedan desincronizar.
 *
 * LO QUE NO CAMBIA: la barra se sigue ocultando en /cotizacion (ver la
 * condición de abajo) y el espaciador sigue existiendo con la misma
 * condición. Ambas cosas son la corrección de los avisos legales que
 * describe el párrafo anterior y no se tocan.
 */

/** Alto de la barra sin contar el área segura. Un solo número, dos usos. */
const ALTO = 60;

export default function BarraMovilContacto() {
  const pathname = usePathname();
  if (pathname?.startsWith('/cotizacion')) return null;

  return (
    <>
    <div
      aria-hidden="true"
      className="md:hidden"
      style={{ height: `calc(${ALTO}px + env(safe-area-inset-bottom))` }}
    />
    <nav
      aria-label="Contacto rápido"
      className="fixed inset-x-0 bottom-0 z-[80] flex items-center gap-2 px-3 md:hidden border-t border-gray-200/70 dark:border-[var(--border)] bg-white/80 dark:bg-[#1C2C46]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#1C2C46]/70 shadow-[0_-8px_24px_-12px_rgba(10,37,64,0.25)]"
      style={{
        height: `calc(${ALTO}px + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Terciario: solo icono. El número sigue siendo el mismo enlace `tel:`
          y el círculo mide 44 px, el mínimo táctil, con nombre accesible
          explícito porque no lleva texto visible. */}
      <a
        href={TELEFONOS.central.tel}
        aria-label="Llamar a Plastilonas Peruanas"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-[var(--border)] text-[#0A2540] dark:text-[var(--text)] transition-transform duration-100 active:scale-[0.96]"
      >
        <Phone className="w-[18px] h-[18px]" />
      </a>

      {/* Secundario: píldora con el verde del canal, para que se reconozca
          de un vistazo sin necesidad de un logotipo de terceros.

          EL FONDO DE ESTA PÍLDORA ES OPACO, Y ESO NO ES ESTÉTICA.

          Era `bg-[#047857]/10`: un tinte del 10 % sobre una barra que a su vez
          es cristal (`bg-white/70`, `dark:bg-[#1C2C46]/70`). Es decir, el
          fondo EFECTIVO del texto no lo decidía el CSS, lo decidía lo que
          hubiera debajo desplazándose. Medido sobre píxeles renderizados a
          390×844 —se oculta el texto, se captura la píldora y se busca el peor
          píxel interior— en 4 rutas × 5 posiciones de desplazamiento:

            claro   #047857 sobre #79a094 (peor)  →  1.90:1   FALLA AA
            oscuro  #34D399 sobre #4b857e (peor)  →  2.20:1   FALLA AA

          El umbral es 4.5:1: 13 px con peso 600 NO es texto grande (WCAG pide
          ≥18.66 px en negrita o ≥24 px). El comentario de `globals.css` que
          promete «#34D399 sobre --surface-nav pasa de 7:1» era cierto — pero
          el texto nunca estaba sobre --surface-nav, estaba sobre --surface-nav
          al 70 % sobre una fotografía.

          La corrección es la que ya usa `globals.css` en su sección «TINTES
          TRANSLUCIDOS EN MODO OSCURO» para esta misma trampa: sustituir el
          tinte translúcido por un fondo OPACO tomado de la paleta existente.
          Ningún hex nuevo: `#ECFDF5` es el emerald-50 que ya usa `SwipeDeck`
          y `#1C2C46` es `--surface-nav`, el mismo que declara esta barra y la
          cabecera (`Navbar.tsx`, `ChromeEn.tsx`). El cristal de la BARRA no se
          toca: lo único que deja de ser transparente son 120 px de píldora.

            claro   #047857 sobre #ECFDF5  →  5.23:1   PASA
            oscuro  #34D399 sobre #1C2C46  →  7.16:1   PASA */}
      <WhatsAppLink
        context="barra-movil"
        message="Hola, quiero cotizar. Producto: ___. Medidas/cantidad: ___. Ciudad de entrega: ___."
        className="btn btn-sm flex-1 min-w-0 min-h-[44px] border border-[#047857]/30 bg-[#ECFDF5] text-[#047857] dark:bg-[#1C2C46] dark:text-[#34D399] dark:border-[#34D399]/30 transition-transform duration-100 active:scale-[0.96]"
      >
        WhatsApp
      </WhatsAppLink>

      {/* Primario: la única píldora sólida de la barra. 48 px de alto, que es
          lo que pide una acción principal bajo el pulgar.

          `min-w-0` EN ESTA PÍLDORA Y EN LA DE WHATSAPP NO ES COSMÉTICA.

          Un hijo de flex arranca con `min-width: auto`, que en la práctica
          significa «nunca más estrecho que mi contenido». Con eso, `flex-1` y
          `flex-[1.4]` podían repartir el espacio sobrante pero NO podían
          ceder cuando faltaba. Medido en Chromium sobre el build, en `/` a
          280 px (Galaxy Fold cerrado):

            disponible para las dos píldoras   196 px
            lo que ocupaban                    100 + 121 = 221 px
            borde derecho de «Cotizar»         293 px  (vista: 280)

          Es decir: el CTA principal de la barra móvil —la única píldora
          sólida, la acción que paga el sitio— se salía 25 px de la pantalla
          en el teléfono más estrecho que el sitio declara soportar. No se
          veía en el resto de anchos porque a partir de 320 px sobra sitio y
          el reparto nunca llega a pedir que nadie se encoja.

          `min-w-0` devuelve a `flex-shrink` la capacidad de actuar. A 320 px
          y por encima no cambia ni un píxel: sólo actúa cuando el espacio no
          alcanza, que era exactamente el caso que fallaba.

          Esto es lo que `npm run auditar:viewport` venía marcando como
          «recortado en cabecera» en `/`, `/productos` e
          `/industria/mineria`: el auditor etiqueta como cabecera todo lo que
          vive dentro de un `<nav>` (ver `zona()` en
          scripts/auditar-viewport.mjs) y esta barra es un `<nav>`. El defecto
          nunca estuvo en la cabecera. */}
      <Link
        href="/cotizacion"
        className="btn btn-accent flex-[1.4] min-w-0 !min-h-[48px] dark:bg-[#10B981] dark:text-[#0A2540] transition-transform duration-100 active:scale-[0.96]"
      >
        <FileText className="w-4 h-4" /> Cotizar
      </Link>
    </nav>
    </>
  );
}
