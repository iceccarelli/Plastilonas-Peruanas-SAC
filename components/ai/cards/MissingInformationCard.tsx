import { HelpCircle } from 'lucide-react';
import type { z } from 'zod';
import type { MissingInformationResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof MissingInformationResponse>;

/** El asistente necesita un dato concreto antes de poder avanzar. Nunca lo inventa. */
export default function MissingInformationCard({ question, fieldsNeeded, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>
        <span className="inline-flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Falta un dato
        </span>
      </CardEyebrow>
      <p className="text-sm font-medium text-[#0A2540] dark:text-[var(--text)]">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {fieldsNeeded.map((f) => (
          <span
            key={f}
            className="text-xs rounded-full border border-gray-200 dark:border-[var(--border)] px-3 py-1 text-gray-600 dark:text-[var(--text-muted)]"
          >
            {f}
          </span>
        ))}
      </div>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
