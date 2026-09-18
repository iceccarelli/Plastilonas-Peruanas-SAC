'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import LonaExploded from '@/components/LonaExploded';
import {
  emptyLona,
  lonaColorHex,
  lonaGramajeLabel,
  lonaMaterialLabel,
  lonaSummary,
  LONA_ANCHO,
  LONA_COLOR,
  LONA_CONFECCION,
  LONA_GRAMAJE,
  LONA_MATERIAL,
  LONA_PREGUNTAS,
  LONA_TEXTURA,
  LONA_TRATAMIENTO,
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
 * LA ELECCIÓN ALIMENTA EL DIBUJO. Material, gramaje, color y acabado se pasan
 * al despiece, que resalta la capa que acaba de cambiar. Es la misma
 * información en dos formas.
 */

/** Píldora de una fila de selección única o múltiple. */
function Pastilla({
  activa,
  onClick,
  children,
  hex,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hex?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        activa
          ? 'border-[#047857] bg-[#059669] text-white'
          : 'border-gray-200 bg-white text-[#0A2540] hover:border-[#059669] hover:text-[#047857]'
      }`}
    >
      {hex !== undefined && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 rounded-full border border-black/10"
          style={
            hex
              ? { backgroundColor: hex }
              : {
                  backgroundImage:
                    'linear-gradient(135deg,#f87171 0%,#fbbf24 35%,#34d399 70%,#60a5fa 100%)',
                }
          }
        />
      )}
      {children}
    </button>
  );
}

function Fila({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2.5">
        {titulo}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export default function LonaConfigurador() {
  const [spec, setSpec] = useState<LonaSpec>(emptyLona);
  const [foco, setFoco] = useState<1 | 2 | 3 | 4 | null>(null);
  const router = useRouter();

  const set = <K extends keyof LonaSpec>(k: K, v: LonaSpec[K]) =>
    setSpec((s) => ({ ...s, [k]: v }));

  /** Alterna la pertenencia de `id` a una fila de selección múltiple. */
  function toggle(campo: 'confeccion' | 'tratamientos', id: string) {
    setSpec((s) => ({
      ...s,
      [campo]: s[campo].includes(id) ? s[campo].filter((x) => x !== id) : [...s[campo], id],
    }));
  }

  const resumen = lonaSummary(spec);
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
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-10">
      <div className="space-y-6">
        <Fila titulo="Material">
          {LONA_MATERIAL.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.material === o.value}
              onClick={() => {
                set('material', o.value);
                setFoco(2);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Color (orientativo — se casa contra muestra física)">
          {LONA_COLOR.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.color === o.value}
              hex={lonaColorHex(o.value)}
              onClick={() => {
                set('color', o.value);
                setFoco(2);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Gramaje">
          {LONA_GRAMAJE.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.gramaje === o.value}
              onClick={() => {
                set('gramaje', o.value);
                setFoco(3);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Ancho del paño">
          {LONA_ANCHO.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.ancho === o.value}
              onClick={() => {
                set('ancho', o.value);
                setFoco(4);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Acabado">
          {LONA_TEXTURA.map((o) => (
            <Pastilla
              key={o.value}
              activa={spec.textura === o.value}
              onClick={() => {
                set('textura', o.value);
                setFoco(1);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Confección (varias)">
          {LONA_CONFECCION.map((o) => (
            <Pastilla
              key={o.id}
              activa={spec.confeccion.includes(o.id)}
              onClick={() => {
                toggle('confeccion', o.id);
                setFoco(4);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <Fila titulo="Tratamientos (varios)">
          {LONA_TRATAMIENTO.map((o) => (
            <Pastilla
              key={o.id}
              activa={spec.tratamientos.includes(o.id)}
              onClick={() => {
                toggle('tratamientos', o.id);
                setFoco(1);
              }}
            >
              {o.label}
            </Pastilla>
          ))}
        </Fila>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['medidas', 'Medidas del paño'],
              ['cantidad', 'Cantidad'],
              ['uso', 'Uso previsto'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="block text-sm text-gray-600">
              {label}
              <input
                className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-[#0A2540]"
                value={spec[k]}
                onChange={(e) => set(k, e.target.value)}
              />
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="btn inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-3 text-sm font-medium text-white hover:bg-[#123b63] transition-colors"
          >
            {etiquetaCTA}
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href="/cotizacion"
            aria-label="Pedir cotización con ficha técnica de la lona"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-[#0A2540] hover:border-[#059669] hover:text-[#047857] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Pedir cotización con ficha técnica
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Resumen preliminar para el RFQ. No calcula precio ni sustituye la ficha técnica del
          lote: el gramaje y el ancho se confirman por escrito en la cotización.
        </p>
      </div>

      <div className="space-y-6">
        <LonaExploded
          material={spec.material}
          gramaje={spec.gramaje}
          color={spec.color}
          textura={spec.textura}
          foco={foco}
        />

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
    </form>
  );
}
