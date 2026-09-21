import type { z } from 'zod';
import { Eye, HelpCircle, AlertCircle, Lightbulb } from 'lucide-react';
import type { VisionObservationResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof VisionObservationResponse>;

/**
 * Cuatro secciones, nunca mezcladas — el mismo corte que impone el esquema
 * (lib/ai/schema.ts) y el prompt (lib/ai/vision.ts): OBSERVADO / INFERENCIA /
 * DESCONOCIDO / REQUIERE CONFIRMACIÓN. "Desconocido" y "Requiere
 * confirmación" se muestran con el mismo peso visual que "Observado" —no
 * como letra pequeña— porque son la parte que evita prometer de más.
 */
export default function VisionObservationCard({ observed, inferences, unknown, requiresConfirmation, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>Análisis de foto</CardEyebrow>

      <Section icon={Eye} title="Lo que se observa en la foto" items={observed} tone="text-[#0A2540] dark:text-[var(--text)]" />

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
}: {
  icon: typeof Eye;
  title: string;
  items: string[];
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 first:mt-0">
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      <ul className="mt-1.5 space-y-1 text-sm text-gray-700 dark:text-[var(--text)] list-disc list-inside">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
