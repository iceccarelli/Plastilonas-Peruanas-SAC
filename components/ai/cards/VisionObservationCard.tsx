import type { z } from 'zod';
import { Eye, HelpCircle, AlertCircle, Check, Lightbulb, Plus } from 'lucide-react';
import type { VisionObservationResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

export interface VisionConfirmProps {
  /**
   * Adjunta al proyecto el tick de `observed` en esa posición. Se pasa SÓLO
   * a la sección "Lo que se observa": las otras tres no reciben callback, así
   * que no existe en el árbol un botón capaz de confirmar una inferencia o
   * un desconocido. La regla no depende de que alguien recuerde no llamarla.
   */
  onConfirmarObservacion: (observedIndex: number) => void;
  /** Índices ya adjuntados, para mostrarlos confirmados en vez de ofrecerlos otra vez. */
  observacionesConfirmadas?: number[];
}

type Props = z.infer<typeof VisionObservationResponse> & Partial<VisionConfirmProps>;

/**
 * Cuatro secciones, nunca mezcladas — el mismo corte que impone el esquema
 * (lib/ai/schema.ts) y el prompt (lib/ai/vision.ts): OBSERVADO / INFERENCIA /
 * DESCONOCIDO / REQUIERE CONFIRMACIÓN. "Desconocido" y "Requiere
 * confirmación" se muestran con el mismo peso visual que "Observado" —no
 * como letra pequeña— porque son la parte que evita prometer de más.
 */
export default function VisionObservationCard({
  observed,
  inferences,
  unknown,
  requiresConfirmation,
  followUp,
  onConfirmarObservacion,
  observacionesConfirmadas = [],
}: Props) {
  return (
    <CardShell>
      <CardEyebrow>Análisis de foto</CardEyebrow>

      {/*
        ÚNICA sección confirmable — Sprint F. `onConfirmar` sólo llega aquí:
        lo observado es lo más cercano a un hecho que da una foto, y aun así
        adjuntarlo es una decisión de la persona, no un automatismo. Las
        otras tres secciones se renderizan sin callback a propósito.
      */}
      <Section
        icon={Eye}
        title="Lo que se observa en la foto"
        items={observed}
        tone="text-[#0A2540] dark:text-[var(--text)]"
        onConfirmar={onConfirmarObservacion}
        confirmados={observacionesConfirmadas}
      />

      {inferences.length > 0 && (
        <Section
          icon={Lightbulb}
          title="Posible, a confirmar"
          items={inferences}
          tone="text-amber-700"
        />
      )}

      <Section icon={HelpCircle} title="No se puede saber por una foto" items={unknown} tone="text-gray-500 dark:text-[var(--text-muted)]" />

      <Section
        icon={AlertCircle}
        title="Antes de cotizar, hay que confirmar"
        items={requiresConfirmation}
        tone="text-[#047857]"
      />

      <p className="mt-3 pt-3 border-t border-gray-100 dark:border-[var(--border)] text-xs text-gray-400 dark:text-[var(--text-muted)]">
        Esta lectura es referencial. Ninguna medida, material ni certificación se confirma a partir de una foto —
        la ficha técnica real se define en la cotización.
      </p>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  tone,
  onConfirmar,
  confirmados = [],
}: {
  icon: typeof Eye;
  title: string;
  items: string[];
  tone: string;
  /** Si falta, la sección es de sólo lectura: no se dibuja ningún botón. */
  onConfirmar?: (index: number) => void;
  confirmados?: number[];
}) {
  if (items.length === 0) return null;
  const confirmable = typeof onConfirmar === 'function';
  return (
    <div className="mt-3 first:mt-0">
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      <ul
        className={`mt-1.5 space-y-1 text-sm text-gray-700 dark:text-[var(--text)] ${
          confirmable ? '' : 'list-disc list-inside'
        }`}
      >
        {items.map((item, i) => {
          if (!confirmable) return <li key={i}>{item}</li>;
          const yaConfirmado = confirmados.includes(i);
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-1">{item}</span>
              {yaConfirmado ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-emerald-700 whitespace-nowrap pt-0.5">
                  <Check className="w-3 h-3" /> En el proyecto
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onConfirmar(i)}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 whitespace-nowrap transition-colors"
                  title="Adjuntar esta observación a mi proyecto"
                >
                  <Plus className="w-2.5 h-2.5" /> Confirmar para el proyecto
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
