import { Calculator } from 'lucide-react';
import type { z } from 'zod';
import type { CalculationResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof CalculationResponse>;

/** Salida de una calculadora real de lib/calculadoras.ts, con sus avisos y límites tal cual. */
export default function CalculationCard({ calculatorSlug, principales, avisos, noCubre, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>
        <span className="inline-flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" /> Predimensionamiento · {calculatorSlug}
        </span>
      </CardEyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {principales.map((p) => (
          <div key={p.etiqueta} className="rounded-2xl bg-gray-50 dark:bg-[var(--surface-muted)] px-3 py-2.5">
            <div className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{p.etiqueta}</div>
            <div className="text-base font-semibold text-[#0A2540] dark:text-[var(--text)]">
              {p.valor} <span className="text-xs font-normal text-gray-500">{p.unidad}</span>
            </div>
          </div>
        ))}
      </div>
      {avisos.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2.5">
          {avisos.map((a, i) => (
            <li key={i}>⚠ {a}</li>
          ))}
        </ul>
      )}
      {noCubre.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 dark:text-[var(--text-muted)]">
          <span className="font-medium">No cubre: </span>
          {noCubre.join(' · ')}
        </div>
      )}
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
