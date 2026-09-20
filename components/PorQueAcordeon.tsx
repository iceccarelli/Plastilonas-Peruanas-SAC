import { Plus } from 'lucide-react';

/**
 * «POR QUÉ ELEGIRNOS» — los mismos cuatro argumentos, plegados.
 *
 * QUÉ HABÍA. Una rejilla de cuatro tarjetas altas sobre la banda navy: un
 * número de 36 px, un título de dos líneas y un párrafo de cinco. Medido a
 * 390 px, la sección entera ocupaba 1156 px: un segundo bloque de altura
 * completa que el comprador tenía que recorrer entero para llegar al vídeo y
 * a las novedades, y que dice lo mismo que ya dicen la franja de confianza
 * del hero y la sección de servicios.
 *
 * QUÉ HACE AHORA. Los cuatro títulos son los que se ven; el párrafo se abre
 * al tocar. Nada se borra: las cuatro frases siguen enteras en el HTML —un
 * rastreador y un lector de pantalla las leen igual, `<details>` no las
 * oculta del árbol de accesibilidad— pero el que ya sabe por qué está aquí no
 * tiene que desplazarse por ellas.
 *
 * POR QUÉ `<details>` NATIVO Y NO UN ACORDEÓN DE REACT. Porque funciona sin
 * JavaScript, no añade un byte al paquete de cliente, y el teclado y los
 * lectores de pantalla ya saben qué es. El atributo `name` compartido es el
 * acordeón exclusivo de HTML: abrir uno cierra el anterior, sin estado que
 * mantener. Donde el navegador no lo soporte todavía se abren varios a la
 * vez, que es una degradación perfectamente correcta.
 *
 * La misma estructura en móvil y en escritorio, a propósito: en pantalla
 * ancha los cuatro pliegues van en dos columnas, no en una lista distinta.
 * Un solo mapa del sitio, más denso cuanto más ancho.
 */
export default function PorQueAcordeon({
  items,
}: {
  items: { title: string; content: string }[];
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2 md:gap-x-6">
      {items.map((item, i) => (
        <details
          key={item.title}
          name="porque-elegirnos"
          className="group border-t border-white/15 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 py-4 min-h-[56px]">
            <span className="text-lg font-semibold tabular-nums tracking-tight text-[#10B981]">
              0{i + 1}
            </span>
            <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-white">
              {item.title}
            </span>
            <Plus
              aria-hidden="true"
              className="w-4 h-4 shrink-0 text-white/50 transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="pb-5 pl-9 pr-8 text-sm leading-relaxed text-white/70">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
