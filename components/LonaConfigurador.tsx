'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import DatasheetButton from '@/components/DatasheetButton';
import LonaExploded from '@/components/LonaExploded';
import {
  BarraProporcion,
  IconoConfeccion,
  IconoTratamiento,
  MuestraMaterial,
  MuestraTextura,
} from '@/components/LonaIconos';
import {
  capasDeLona,
  fraccionAncho,
  fraccionGramaje,
  layerParaControl,
  type Capa,
} from '@/lib/lona-visual';
import {
  emptyLona,
  llevaOjales,
  lonaColorHex,
  lonaGramajeLabel,
  lonaMaterialLabel,
  lonaSummary,
  LONA_ANCHO,
  LONA_BORDE,
  LONA_CANTIDAD,
  LONA_COLOR,
  LONA_CONFECCION,
  LONA_GRAMAJE,
  LONA_MATERIAL,
  LONA_MEDIDAS,
  LONA_OJALES,
  LONA_OJALES_CANTIDAD,
  LONA_OJALES_DISTANCIA,
  LONA_PREGUNTAS,
  LONA_TEXTURA,
  LONA_TRATAMIENTO,
  LONA_USO,
  type LonaSpec,
} from '@/lib/lona-config';

/**
 * CONFIGURADOR DE LONA A MEDIDA — píldoras, despiece y dos cierres.
 *
 * Mismo contrato que el configurador de FIBC (`app/(es)/configurador/page.tsx`):
 * el estado vive en el cliente, el resumen se serializa en `lib/lona-config.ts`
 * y viaja al RFQ por `?notas=`, con `?origen=` para saber cuántas solicitudes
 * salen de aquí. NO calcula precio.
 *
 * POR QUÉ PÍLDORAS Y NO UN <select> MÁS. Un desplegable esconde el abanico:
 * el comprador no ve que hay cuatro materiales hasta que lo abre. Las
 * píldoras enseñan la oferta entera de un vistazo, que es justo lo que este
 * producto necesita comunicar. Son `<button>` de verdad con `aria-pressed`,
 * no divs con onClick: un lector de pantalla anuncia el estado.
 *
 * EL ORDEN DEL DOM ERA EL DEFECTO. Antes las siete filas de píldoras, los tres
 * campos de texto y los dos botones iban PRIMERO y el dibujo después. En
 * escritorio daba igual —son dos columnas—, pero en un teléfono el comprador
 * recorría una pared de controles sin ver nunca qué estaba armando. Ahora el
 * despiece es el primer hijo del formulario y queda PEGADO arriba mientras las
 * opciones pasan por debajo: se toca una píldora y se ve moverse la capa.
 *
 * CÓMO SE HACE SIN DUPLICAR NADA. El `<aside>` usa `display: contents` por
 * debajo de `lg`, así que sus dos hijos —dibujo y resumen— se convierten en
 * hijos directos del formulario flexible y se ordenan con `order`. A partir de
 * `lg` el `<aside>` vuelve a ser una caja y es la columna derecha pegajosa de
 * siempre. Un solo dibujo en el DOM, dos maquetaciones.
 *
 * LA ELECCIÓN ALIMENTA EL DIBUJO. Material, color, gramaje, ancho, acabado,
 * confección y tratamientos se pasan enteros al despiece, que cambia geometría
 * —no sólo leyendas— y pulsa la capa afectada. Es la misma información en dos
 * formas.
 */

/** Ficha del catálogo de la que salen TODAS las opciones de este configurador. */
const SLUG_LONA = 'lona-plastificada-rafia-polytarp';

/** Píldora de una fila de selección única o múltiple. */
function Pastilla({
  activa,
  onClick,
  children,
  adorno,
  barra,
}: {
  activa: boolean;
  onClick: () => void;
  children: ReactNode;
  /** Muestra, swatch o pictograma a la izquierda del rótulo. */
  adorno?: ReactNode;
  /** Fracción (0..1) del rango real, cuando la magnitud relativa importa. */
  barra?: number;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      // `min-h-[44px]` y no sólo padding: el objetivo táctil se DECLARA, así
      // sobrevive a que alguien cambie el tamaño de letra un día.
      className={`inline-flex min-h-[44px] snap-start shrink-0 flex-col justify-center gap-1 rounded-2xl border px-4 py-2.5 text-left text-sm transition-colors lg:shrink ${
        activa
          ? 'border-[#047857] bg-[#059669] text-white'
          : 'border-gray-200 bg-white text-[#0A2540] hover:border-[#059669] hover:text-[#047857]'
      }`}
    >
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        {adorno}
        {children}
      </span>
      {barra !== undefined && <BarraProporcion fraccion={barra} activa={activa} />}
    </motion.button>
  );
}

/** Swatch de color: grande y con anillo de selección, no un puntito. */
function Swatch({ hex, activa }: { hex: string; activa: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 rounded-full border border-black/10 ${
        activa ? 'ring-2 ring-white ring-offset-2 ring-offset-[#059669]' : ''
      }`}
      style={
        hex
          ? { backgroundColor: hex }
          : {
              backgroundImage:
                'linear-gradient(135deg,#f87171 0%,#fbbf24 35%,#34d399 70%,#60a5fa 100%)',
            }
      }
    />
  );
}

/**
 * Fila de opciones. En `scroller` los chips se recorren de lado con anclaje
 * —`snap-x snap-mandatory`— en vez de envolver en cinco líneas que empujan el
 * dibujo fuera de la pantalla. A partir de `lg` vuelven a envolver.
 */
function Fila({
  titulo,
  control,
  onSeñalar,
  scroller = false,
  children,
}: {
  titulo: string;
  /**
   * Id del control —`material`, `gramaje`, `confeccion`…—. `layerParaControl`
   * lo traduce a la capa que esta fila gobierna, y señalar la fila AÍSLA esa
   * capa en el dibujo.
   */
  control: string;
  onSeñalar: (capa: Capa | null) => void;
  scroller?: boolean;
  children: ReactNode;
}) {
  const capa = layerParaControl(control);
  /**
   * RATÓN Y TECLADO, LA MISMA SEÑAL. `onFocus`/`onBlur` de React son
   * `focusin`/`focusout`: BURBUJEAN desde el botón hasta este `<fieldset>`, así
   * que quien recorre las píldoras con el tabulador ve exactamente lo mismo que
   * quien pasa el ratón. Es un estado VISUAL y transitorio: no toca el
   * `aria-pressed` de ninguna píldora ni cambia la selección.
   */
  const señales = {
    onMouseEnter: () => onSeñalar(capa),
    onMouseLeave: () => onSeñalar(null),
    onFocus: () => onSeñalar(capa),
    onBlur: () => onSeñalar(null),
  };
  return (
    /* `min-w-0` NO ES DECORACIÓN. Un <fieldset> nace con
       `min-inline-size: min-content` por hoja de estilo del navegador: se
       niega a encogerse por debajo del ancho de su contenido. Con la fila de
       chips dentro, el fieldset crecía a lo que midieran los chips en vez de
       dejar que el contenedor con scroll hiciera su trabajo, y la PÁGINA
       entera se movía de lado 57px en un iPad mini. Lo encontró
       `npm run auditar:viewport`, no una revisión a ojo. */
    <fieldset {...señales} className="border-0 p-0 m-0 min-w-0">
      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">
        {titulo}
      </legend>
      <div
        className={
          scroller
            ? 'flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:pb-0'
            : 'flex flex-wrap gap-2'
        }
      >
        {children}
      </div>
    </fieldset>
  );
}

/**
 * Fila de selección ÚNICA sobre un enum de `lib/lona-config.ts`. Existe para
 * que las filas nuevas —ojales, medidas, cantidad, uso— no se escriban a mano
 * una a una, y VIVE EN EL MÓDULO por la misma razón que `Capa` y `Bloque` en
 * `LonaExploded.tsx`: declarada dentro del render sería un tipo de componente
 * nuevo en cada pulsación y React desmontaría la fila entera —perdiendo el
 * foco del teclado— cada vez que se toca una píldora.
 *
 * NO HAY `<input>` EN NINGUNA DE ESTAS FILAS. Todo lo que el comprador puede
 * decir aquí es un valor de enum, y por eso nada de lo que teclee puede llegar
 * al dibujo ni al RFQ sin pasar por el catálogo.
 */
function FilaEnum({
  titulo,
  control,
  opciones,
  valor,
  onElegir,
  onSeñalar,
  scroller = false,
}: {
  titulo: string;
  control: string;
  opciones: readonly { value: string; label: string }[];
  valor: string;
  onElegir: (v: string) => void;
  onSeñalar: (capa: Capa | null) => void;
  scroller?: boolean;
}) {
  return (
    <Fila titulo={titulo} control={control} onSeñalar={onSeñalar} scroller={scroller}>
      {opciones.map((o) => (
        <Pastilla key={o.value} activa={valor === o.value} onClick={() => onElegir(o.value)}>
          {o.label}
        </Pastilla>
      ))}
    </Fila>
  );
}

export default function LonaConfigurador({
  /** Sólo la página completa añade la barra de acción fija en móvil. */
  barraMovil = false,
  /**
   * Especificación de arranque, ya validada contra los enums por
   * `lonaDesdeParams` en el servidor. Sirve a los enlaces precargados
   * (`/configurador/lona?material=pvc&gramaje=700-900`) que llegan desde la
   * ficha del producto y desde el hub de lonas de camión.
   */
  inicial,
}: {
  barraMovil?: boolean;
  inicial?: LonaSpec;
}) {
  const [spec, setSpec] = useState<LonaSpec>(() => inicial ?? emptyLona());
  const [foco, setFoco] = useState<1 | 2 | 3 | 4 | null>(null);
  /** Cada cambio incrementa el contador: es lo que dispara el pulso del dibujo. */
  const [pulso, setPulso] = useState(0);
  /**
   * Capa que el usuario está señalando ahora mismo. Nada que ver con la
   * selección: el despiece apaga las otras tres mientras dura, y al soltar
   * vuelve todo. Vive aquí y no dentro del dibujo porque la señal nace en las
   * filas de píldoras.
   */
  const [aislada, setAislada] = useState<Capa | null>(null);
  const router = useRouter();

  const set = <K extends keyof LonaSpec>(k: K, v: LonaSpec[K]) =>
    setSpec((s) => ({ ...s, [k]: v }));

  /** Un cambio de especificación: mueve el foco y pulsa la capa afectada. */
  function marcar(capa: 1 | 2 | 3 | 4) {
    setFoco(capa);
    setPulso((p) => p + 1);
  }

  /** Alterna la pertenencia de `id` a una fila de selección múltiple. */
  function toggle(campo: 'confeccion' | 'tratamientos', id: string) {
    setSpec((s) => ({
      ...s,
      [campo]: s[campo].includes(id) ? s[campo].filter((x) => x !== id) : [...s[campo], id],
    }));
  }

  const resumen = lonaSummary(spec);
  const capas = capasDeLona(spec);
  const etiquetaCTA = `Especificar esta lona en ${lonaMaterialLabel(spec.material)} ${lonaGramajeLabel(spec.gramaje)}`;

  function submit(e: FormEvent) {
    e.preventDefault();
    // `origen` etiqueta el lead: sin él no hay forma de saber cuántas
    // solicitudes salen de este configurador y no de otra superficie.
    router.push(
      `/cotizacion?producto=lona-plastificada-rafia-polytarp&origen=configurador-lona&notas=${encodeURIComponent(resumen)}`,
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-10"
    >
      <aside className="contents lg:block lg:col-start-2 lg:space-y-6">
        {/* EL DIBUJO, PEGADO. En móvil se queda arriba mientras las opciones
            pasan por debajo; en escritorio es la cabecera de la columna
            derecha, también pegajosa dentro de su columna. */}
        <div className="order-1 sticky top-20 z-20 -mx-6 bg-white px-6 pt-1 pb-2 lg:order-none lg:top-28 lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0">
          <LonaExploded
            spec={spec}
            foco={foco}
            pulso={pulso}
            aislada={aislada}
            onAislar={setAislada}
            className="h-[42vh] max-h-[330px] min-h-[210px] lg:h-auto lg:max-h-none lg:min-h-0"
          />
          <div className="border-b border-gray-100 lg:hidden" />
        </div>

        {/* El resumen, las cuatro capas y las cuatro preguntas. En móvil van al
            final; en escritorio, debajo del dibujo en la columna derecha. */}
        <div className="order-3 space-y-6 lg:order-none">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">
              Resumen que viaja al RFQ
            </div>
            <pre
              aria-live="polite"
              className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[#0A2540] p-4 text-xs leading-relaxed text-white/80"
            >
              {resumen}
            </pre>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">
              Las cuatro capas
            </div>
            <ol className="space-y-3">
              {capas.map((c) => {
                const activa = (aislada ?? foco) === c.n;
                return (
                  <li
                    key={c.n}
                    className={`rounded-xl border p-4 transition-colors ${
                      activa ? 'border-[#059669] bg-[#059669]/5' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-xs font-semibold tabular-nums ${activa ? 'text-[#047857]' : 'text-gray-400'}`}
                      >
                        0{c.n}
                      </span>
                      <span className="font-semibold text-sm text-[#0A2540]">{c.titulo}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{c.texto}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">
              Pregúntele esto a cualquier proveedor
            </div>
            <ol className="space-y-3">
              {LONA_PREGUNTAS.map((p) => (
                <li key={p.n} className="border-t border-gray-100 pt-3">
                  <div className="flex gap-3">
                    <span className="text-sm font-semibold tabular-nums text-[#059669]">{p.n}</span>
                    <div>
                      <div className="text-sm font-medium leading-snug text-[#0A2540]">
                        {p.pregunta}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{p.porque}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>

      <div className="order-2 min-w-0 space-y-6 lg:order-none lg:col-start-1 lg:row-start-1">
        <Fila titulo="Material" control="material" onSeñalar={setAislada}>
          {LONA_MATERIAL.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.material === o.value}
              adorno={<MuestraMaterial material={o.value} />}
              onClick={() => {
                set('material', o.value);
                marcar(2);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Color (orientativo — se casa contra muestra física)" control="color" onSeñalar={setAislada} scroller>
          {LONA_COLOR.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.color === o.value}
              adorno={<Swatch hex={lonaColorHex(o.value)} activa={spec.color === o.value} />}
              onClick={() => {
                set('color', o.value);
                marcar(2);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Gramaje" control="gramaje" onSeñalar={setAislada} scroller>
          {LONA_GRAMAJE.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.gramaje === o.value}
              barra={fraccionGramaje(o.value)}
              onClick={() => {
                set('gramaje', o.value);
                marcar(3);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Ancho del paño" control="ancho" onSeñalar={setAislada} scroller>
          {LONA_ANCHO.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.ancho === o.value}
              barra={fraccionAncho(o.value)}
              onClick={() => {
                set('ancho', o.value);
                marcar(4);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Acabado" control="textura" onSeñalar={setAislada}>
          {LONA_TEXTURA.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.textura === o.value}
              adorno={<MuestraTextura textura={o.value} />}
              onClick={() => {
                set('textura', o.value);
                marcar(2);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Confección (varias)" control="confeccion" onSeñalar={setAislada}>
          {LONA_CONFECCION.map((o) => (
            <Pastilla
              key={o.id}
              activa={spec.confeccion.includes(o.id)}
              adorno={<IconoConfeccion id={o.id} />}
              onClick={() => {
                toggle('confeccion', o.id);
                marcar(4);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        {/* OJALES — BLOQUE PROPIO, Y UNA SOLA FUENTE DE VERDAD.
            Antes «Ojales» era una píldora más dentro de «Confección», al lado
            de velcro y cremallera: no había dónde decir cuántos, cada cuánto
            ni con qué borde, y el dibujo tenía que adivinarlo del ancho. Ahora
            la pregunta binaria manda —`spec.ojales`— y las tres filas de
            detalle sólo existen cuando la respuesta es «Con ojales». Con «Sin
            ojales» la capa 04 no dibuja NI UN aro.
            Lo que sigue sin decirse, aquí y en el dibujo: diámetro, material
            del aro y referencia de herraje. Eso lo fija la planta. */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-5">
          <FilaEnum
            titulo="¿Lleva ojales?"
            control="ojales"
            opciones={LONA_OJALES}
            valor={spec.ojales}
            onSeñalar={setAislada}
            onElegir={(v) => {
              set('ojales', v);
              marcar(4);
            }}
          />

          {llevaOjales(spec) && (
            <>
              <FilaEnum
                titulo="Cantidad de ojales"
                control="ojalesCantidad"
                opciones={LONA_OJALES_CANTIDAD}
                valor={spec.ojalesCantidad}
                onSeñalar={setAislada}
                scroller
                onElegir={(v) => {
                  set('ojalesCantidad', v);
                  marcar(4);
                }}
              />
              <FilaEnum
                titulo="Distancia entre ojales"
                control="ojalesDistancia"
                opciones={LONA_OJALES_DISTANCIA}
                valor={spec.ojalesDistancia}
                onSeñalar={setAislada}
                scroller
                onElegir={(v) => {
                  set('ojalesDistancia', v);
                  marcar(4);
                }}
              />
              <FilaEnum
                titulo="Acabado del borde / doblez"
                control="ojalesBorde"
                opciones={LONA_BORDE}
                valor={spec.ojalesBorde}
                onSeñalar={setAislada}
                scroller
                onElegir={(v) => {
                  set('ojalesBorde', v);
                  marcar(4);
                }}
              />
              <p className="text-xs text-gray-500">
                El esquema dibuja los ojales de forma ilustrativa: número topado, sin diámetro, sin
                material del aro y sin referencia de herraje. Eso se fija en la cotización.
              </p>
            </>
          )}
        </div>

        <Fila titulo="Tratamientos (varios)" control="tratamientos" onSeñalar={setAislada}>
          {LONA_TRATAMIENTO.map((o) => (
            <Pastilla
              key={o.id}
              activa={spec.tratamientos.includes(o.id)}
              adorno={<IconoTratamiento id={o.id} />}
              onClick={() => {
                toggle('tratamientos', o.id);
                marcar(1);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        {/* MEDIDAS, CANTIDAD Y USO — antes tres `<input>` de texto libre.
            Llegaban al RFQ como «unos 6 por 12», «varios» y «para el camión»:
            el comercial volvía a preguntar las tres cosas. Ahora son listas
            cerradas, así que la respuesta es siempre comparable y nada
            tecleado por un desconocido viaja sin validar hasta un correo. La
            salida a «a medida / cotización» sigue estando en las tres. */}
        <FilaEnum
          titulo="Medidas del paño"
          control="medidas"
          opciones={LONA_MEDIDAS}
          valor={spec.medidas}
          onSeñalar={setAislada}
          scroller
          onElegir={(v) => {
            set('medidas', v);
            marcar(4);
          }}
        />

        {/* CANTIDAD: además del RFQ, escala el escenario entero
            (`escalaEscenario` en lib/lona-visual.ts). No aísla ninguna capa
            —no gobierna ninguna—, así que no llama a `marcar`. */}
        <FilaEnum
          titulo="Cantidad"
          control="cantidad"
          opciones={LONA_CANTIDAD}
          valor={spec.cantidad}
          onSeñalar={setAislada}
          scroller
          onElegir={(v) => set('cantidad', v)}
        />

        <FilaEnum
          titulo="Uso previsto"
          control="uso"
          opciones={LONA_USO}
          valor={spec.uso}
          onSeñalar={setAislada}
          scroller
          onElegir={(v) => set('uso', v)}
        />

        <div
          role="group"
          aria-label="Cerrar la especificación"
          // Sin `flex-wrap`: en una columna, envolver crea COLUMNAS nuevas y el
          // grupo pasó a medir 456px dentro de un teléfono de 393. Lo cazó
          // `npm run auditar:viewport` en cuanto <body> dejó de tapar el
          // desborde de todo el sitio.
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            /* Sin la clase `.btn`: lleva `white-space: nowrap`, y el rótulo de
               este botón es DINÁMICO —«Especificar esta lona en PVC
               plastificado 500 – 700 g/m²»—. En un teléfono de 393px eso
               desbordaba la página 16px. El estilo visual ya está entero en
               las utilidades de al lado; lo único que aportaba `.btn` era la
               prohibición de partir la línea. */
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-3 text-center text-sm font-medium text-white hover:bg-[#123b63] transition-colors"
          >
            {etiquetaCTA}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <Link
            href="/cotizacion"
            aria-label="Pedir cotización con ficha técnica de la lona"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-[#0A2540] hover:border-[#059669] hover:text-[#047857] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Pedir cotización con ficha técnica
          </Link>
        </div>
        {/* LA FICHA, EN SU PROPIA LÍNEA. No entra en el grupo de arriba: ése
            pasa a fila a partir de `sm` y un tercer botón con rótulo largo lo
            devolvía a desbordar justo en 640px, que es el defecto que
            `auditar:viewport` ya cazó una vez aquí. El PDF sale del generador
            del catálogo (lib/datasheet.ts) — no hay una segunda tubería. */}
        <div>
          <DatasheetButton
            slug={SLUG_LONA}
            nombre="Lona plastificada, rafia y polytarp"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-[#0A2540] transition-colors hover:border-[#059669] hover:text-[#047857]"
          />
        </div>

        <p className="text-xs text-gray-500">
          Resumen preliminar para el RFQ. No calcula precio ni sustituye la ficha técnica del
          lote: el gramaje y el ancho se confirman por escrito en la cotización.
        </p>

        {barraMovil && (
          // El espaciador tiene la misma razón de ser que el de
          // `components/BarraMovilContacto.tsx`: una barra fija no ocupa sitio
          // en el flujo y al final del documento se comería el último párrafo.
          <div
            aria-hidden="true"
            className="md:hidden"
            style={{ height: 'calc(56px + env(safe-area-inset-bottom))' }}
          />
        )}
      </div>

      {barraMovil && (
        // SE APILA ENCIMA DE LA BARRA DE CONTACTO, NO LA TAPA. Aquélla mide
        // 48px + área segura y vive en z-[80]; ésta se sienta justo encima con
        // un z-index menor, así que las dos se ven enteras y ninguna roba el
        // toque de la otra.
        <div
          // `pr-24` deja libre la esquina donde vive el lanzador del asistente
          // (`fixed bottom-20 right-6`, 64×64): sin ese hueco el botón pasaba
          // por debajo y el dedo tocaba el chat en vez del RFQ.
          className="fixed inset-x-0 z-[70] border-t border-gray-200 bg-white/95 py-2 pl-4 pr-24 backdrop-blur md:hidden"
          style={{ bottom: 'calc(48px + env(safe-area-inset-bottom))' }}
        >
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-4 py-2.5 text-sm font-medium text-white"
          >
            Llevar esta especificación al RFQ
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </form>
  );
}
