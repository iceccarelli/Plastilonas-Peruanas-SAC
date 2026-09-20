'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, HardHat, Ship, Lightbulb, ArrowRight, Check, Pause, Play, type LucideIcon } from 'lucide-react';
import { ACCIONES } from '@/lib/acciones';

const ICONS: Record<string, LucideIcon> = { ruler: Ruler, hardhat: HardHat, ship: Ship, lightbulb: Lightbulb };

/**
 * FOTOS DE SERVICIO — resueltas en el servidor, no adivinadas aquí.
 *
 * La versión anterior construía la ruta con `/images/${base}${ph === 1 ? '-2' : ''}.jpg`
 * y un comentario prometía que «si alguna falta, cae con elegancia (sin ícono
 * roto)». No caía: nunca existieron servicio-fabricacion-2.jpg ni
 * servicio-instalacion-2.jpg, y cada carga de la portada lanzaba
 *
 *   ⨯ The requested resource isn't a valid image for /images/servicio-instalacion-2.webp
 *
 * Un componente de cliente no puede mirar el disco, así que la promesa era
 * imposible de cumplir desde aquí. Ahora el servidor resuelve qué tomas
 * existen —con `tomasDe`, el mismo mecanismo de la galería de producto, que
 * además descarta las copias byte a byte— y las pasa ya resueltas. Si un
 * servicio tiene una sola foto, se muestra fija; si aparece una segunda, el
 * cruce se activa solo con dejar el archivo en su sitio.
 */
type Svc = { title: string; desc: string; icon: string; tomas: string[] };

/**
 * ACCESIBILIDAD DE ESTE COMPONENTE — dos defectos encontrados en la auditoría
 * de agosto de 2026, y por qué importaban:
 *
 * 1. NO ERA UN GRUPO DE PESTAÑAS PARA QUIEN NO VE. Se declaraba con
 *    `aria-pressed`, que un lector de pantalla anuncia como interruptor
 *    («pulsado / no pulsado»), no como «pestaña 2 de 4, seleccionada». Y el
 *    panel no estaba asociado a su pestaña, así que activarla no llevaba el
 *    foco ni el contexto a ninguna parte. En el MISMO repositorio,
 *    MachineryGallery ya lo hacía bien: dos widgets de pestañas, dos verdades.
 *    Ahora los dos hablan el mismo idioma —tablist/tab/tabpanel, aria-selected,
 *    aria-controls— y además se navega con flechas, que es lo que espera
 *    cualquiera que use el teclado.
 *
 * 2. EL AVANCE AUTOMÁTICO NO SE PODÍA PARAR CON EL DEDO. Rotaba cada 5 s y la
 *    única pausa era `hover`, que en un teléfono NO EXISTE: el contenido
 *    cambiaba solo mientras alguien lo leía. WCAG 2.2.2 exige poder pausarlo.
 *    Ahora se pausa al tocar/enfocar cualquier pestaña, hay un botón explícito
 *    de pausa, y tocar una pestaña detiene la rotación para siempre: si el
 *    usuario eligió, el componente deja de decidir por él.
 */
export default function ServiceTabs({ services }: { services: Svc[] }) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);      // 0 = foto A, 1 = foto B (crossfade Ken Burns)
  const [hover, setHover] = useState(false);
  // Pausa deliberada: el usuario tocó una pestaña o el botón de pausa.
  const [pausado, setPausado] = useState(false);

  /**
   * EN UN TÁCTIL EL AVANCE AUTOMÁTICO ARRANCA PAUSADO.
   *
   * El componente ya cumplía WCAG 2.2.2 —hay un botón explícito de pausa— pero
   * cumplir no es lo mismo que estar bien: en un teléfono el contenido seguía
   * cambiando solo cada 5 s mientras alguien leía la descripción del servicio,
   * y la única salida era encontrar y pulsar un botón que está DEBAJO de la
   * fila de pestañas. Donde hay ratón, pasar el cursor pausa y el carrusel es
   * un adorno inofensivo; donde no lo hay, es una interrupción.
   *
   * Se decide en un efecto y no en el estado inicial a propósito: el servidor
   * no sabe qué puntero tiene el visitante, y `useState(matchMedia(...))`
   * produciría un HTML distinto del que React hidrata.
   */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) setPausado(true);
  }, []);
  const svc = services[active];
  const Icon = ICONS[svc.icon] ?? Ruler;
  const tomas = svc.tomas?.length ? svc.tomas : [];

  // Auto-avance de pestañas cada 5s (pausa al pasar el cursor / prefiere menos movimiento).
  useEffect(() => {
    if (hover || pausado) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % services.length), 5000);
    return () => clearInterval(id);
  }, [hover, pausado, services.length]);

  // Cruce entre las tomas del servicio activo cada 3.5s.
  useEffect(() => {
    setPhase(0);
    // Con una sola toma no hay nada que alternar: mantener el intervalo solo
    // gastaría renders y provocaría un cruce de la imagen contra sí misma.
    if (tomas.length < 2) return;
    const id = setInterval(() => setPhase((p) => (p + 1) % tomas.length), 3500);
    return () => clearInterval(id);
  }, [active, tomas.length]);

  return (
    <div
      className="grid lg:grid-cols-[320px_1fr] gap-4 lg:gap-10"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Pestañas */}
      {/* En columna TAMBIÉN en móvil. En fila, el botón de pausa se sentaba
          encima del carril de pestañas justo donde éste sangra hasta el borde
          de la pantalla (`-mx-6`), tapando media pestaña. El carril se queda
          con todo el ancho y el control va debajo, que es donde no estorba. */}
      <div className="flex flex-col min-w-0 gap-2">
        <div
          role="tablist"
          aria-label="Servicios"
          aria-orientation="horizontal"
          className="no-scrollbar flex min-w-0 lg:flex-col gap-2 overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0"
          onKeyDown={(e) => {
            const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
                    : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            setPausado(true);
            const sig = (active + d + services.length) % services.length;
            setActive(sig);
            document.getElementById(`pestana-servicio-${sig}`)?.focus();
          }}
        >
          {services.map((s, i) => {
            const I = ICONS[s.icon] ?? Ruler;
            const on = i === active;
            return (
              <button
                key={s.title}
                id={`pestana-servicio-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="panel-servicio"
                // El estándar: sólo la pestaña activa está en el orden de
                // tabulación; dentro del grupo se navega con flechas.
                tabIndex={on ? 0 : -1}
                onClick={() => { setActive(i); setPausado(true); }}
                onFocus={() => setPausado(true)}
                /* COMPACTACIÓN MÓVIL DE LA FILA DE PESTAÑAS.
                   Era `px-5 py-4` en todos los anchos: cuatro píldoras de
                   56 px de alto en un carril horizontal que sólo tiene que
                   dejar elegir uno de cuatro servicios. En el teléfono baja
                   a `px-3.5 py-2.5`, que MEDIDO da 40 px de alto —por debajo
                   de los 44 de un botón de acción, y a propósito: en una
                   fila de pestañas adyacentes el riesgo no es acertar la
                   altura (el carril entero mide 40 px de arriba abajo, no
                   hay nada encima ni debajo que tocar por error) sino
                   acertar la HORIZONTAL, y ahí cada píldora conserva más de
                   110 px de ancho. En `lg` recupera su tamaño de siempre,
                   donde es una columna vertical y sí conviven verticalmente. */
                className={`shrink-0 lg:shrink text-left flex items-center gap-2 lg:gap-3 px-3.5 py-2.5 lg:px-5 lg:py-4 rounded-2xl border transition-all duration-300 ${
                  on ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-lg shadow-[#0A2540]/15'
                     : 'bg-white border-gray-200 text-[#0A2540] hover:border-[#047857]'
                }`}
              >
                <I className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 ${on ? 'text-[#10B981]' : 'text-gray-400'}`} aria-hidden="true" />
                <span className="font-medium text-[13px] lg:text-sm whitespace-nowrap lg:whitespace-normal">{s.title}</span>
                {on && <span className="ml-auto hidden lg:block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {/* WCAG 2.2.2: un control explícito para detener el avance. En un
            teléfono es el único que existe — `hover` no ocurre nunca.

            El rótulo completo («Reanudar el avance automático») envolvía a
            tres líneas en un teléfono. Ahí se muestra una palabra junto al
            icono; el nombre accesible sigue siendo la frase entera, que es
            lo que anuncia un lector de pantalla. En `lg` vuelve el texto
            completo, donde hay sitio de sobra. */}
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          /* SIN `aria-pressed`, y no por descuido.
             `globals.css` tiene una regla global —`button[aria-pressed="true"]`,
             pensada para las píldoras de filtro— que pinta cualquier botón
             pulsado de verde esmeralda sólido con `!important`. Como ahora
             este control arranca PAUSADO en un táctil, el estado por defecto
             del teléfono era una píldora verde rellena que se lee como «filtro
             activo», no como «reanudar». Un botón de play/pausa no es un
             interruptor de dos estados persistentes: es una acción cuyo
             nombre cambia. El nombre accesible ya dice cuál es. */
          aria-label={pausado ? 'Reanudar el avance automático' : 'Pausar el avance automático'}
          className="shrink-0 self-start inline-flex min-h-[44px] items-center gap-2 px-4 rounded-2xl border border-gray-200 text-xs font-medium text-gray-600 hover:border-[#047857] hover:text-[#047857] transition-colors"
        >
          {pausado ? <Play className="w-3.5 h-3.5" aria-hidden="true" /> : <Pause className="w-3.5 h-3.5" aria-hidden="true" />}
          <span className="lg:hidden">{pausado ? 'Reanudar' : 'Pausar'}</span>
          <span className="hidden lg:inline">
            {pausado ? 'Reanudar el avance automático' : 'Pausar el avance automático'}
          </span>
        </button>
      </div>

      {/* Panel con fotos de fondo (Ken Burns + crossfade) y texto sobre velo */}
      <div
        id="panel-servicio"
        role="tabpanel"
        aria-labelledby={`pestana-servicio-${active}`}
        aria-live="polite"
        /* `min-w-0`, Y NO ES COSMÉTICA: ES EL RECORTE A MEDIA PALABRA.

           Síntoma que reportó el dueño: la descripción del servicio activo se
           cortaba a media palabra («…según sus espec») y el segundo botón
           decía «Ver todos los s». La causa NO era un `line-clamp` ni un
           truncado por caracteres: no hay ninguno en este componente. Era el
           mínimo automático de un ítem de rejilla.

           Medido en el navegador a 390 px, subiendo por el árbol desde
           `#panel-servicio`: la rejilla padre medía 342 px y ESTE panel 935.
           Un ítem de rejilla tiene `min-width: auto`, así que no se encoge por
           debajo de su contenido mínimo; el texto de dentro (`max-w-xl` =
           576 px + 64 de relleno) fijaba ese mínimo en 935 px, el panel se
           salía 593 px por la derecha y el `overflow-hidden` de la portada se
           comía el sobrante — a media palabra, porque un recorte por píxeles
           no sabe dónde acaban las palabras.

           `min-w-0` devuelve el panel al ancho de su columna y el texto
           envuelve por palabras, que es lo que hace el texto cuando se le
           deja. Nada de recortes manuales por número de caracteres. */
        className="relative min-w-0 rounded-3xl overflow-hidden min-h-[18rem] lg:min-h-[22rem] flex border border-gray-100 bg-[#0A2540]"
      >
        {/* Capa de fotos */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {tomas.map((_, ph) =>
              ph === phase ? (
                <motion.div
                  key={`${svc.icon}-${ph}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  className="absolute inset-0 ken-burns-wrap"
                >
                  <Image
                    src={tomas[ph] ?? tomas[0]}
                    alt={svc.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="ken-burns object-cover"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
          {/* Velo para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540]/95 via-[#0A2540]/80 to-[#0A2540]/40" />
        </div>

        {/* Texto */}
        <div className="relative z-10 min-w-0 flex-1 p-6 md:p-10 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col w-full min-w-0 max-w-xl"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#047857] text-white flex items-center justify-center mb-4 md:mb-5">
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="font-semibold text-xl md:text-3xl tracking-tight text-white mb-2 md:mb-3">{svc.title}</h3>
              <p className="text-white/80 leading-relaxed t-body md:text-base mb-4 md:mb-6">{svc.desc}</p>
              <div className="flex items-center gap-2 text-sm text-white/70 mb-6 md:mb-8">
                <Check className="w-4 h-4 shrink-0 text-[#10B981]" /> Incluido en todos nuestros proyectos
              </div>
              {/* Los dos CTA usan el sistema `.btn` de la casa y se APILAN en
                  el teléfono: lado a lado, «Ver todos los servicios» —que es
                  `whitespace-nowrap` por `.btn`— no cabe junto a «Solicitar
                  cotización» en 294 px de panel útil, y `flex-wrap` dejaba el
                  segundo colgando solo en una fila propia igualmente. Apilar
                  es lo mismo, pero a ancho completo y con el pulgar servido. */}
              <div className="mt-auto flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link href="/cotizacion" className="btn bg-white text-[#0A2540] hover:bg-[#10B981] hover:text-white w-full sm:w-auto">
                  {ACCIONES.cotizar.label} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/servicios" className="btn border border-white/30 hover:bg-white/10 text-white font-medium w-full sm:w-auto">
                  Ver todos los servicios
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
