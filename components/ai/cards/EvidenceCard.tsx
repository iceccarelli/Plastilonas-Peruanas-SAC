import { BookOpen } from 'lucide-react';
import type { z } from 'zod';
import type { EvidenceResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof EvidenceResponse>;

const SOURCE_LABEL: Record<Props['sourceType'], string> = {
  facts: 'Cifra de la empresa (lib/facts.ts)',
  framework: 'Marco de Especificación',
  guide: 'Guía técnica',
  glossary: 'Glosario técnico',
  project: 'Proyecto verificado',
};

/** Respuesta que cita explícitamente de dónde sale la afirmación. */
export default function EvidenceCard({ claim, sourceType, sourceRef, detail, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>Evidencia citada</CardEyebrow>
      <p className="text-sm font-medium text-[#0A2540] dark:text-[var(--text)]">{claim}</p>
      {detail && <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">{detail}</p>}
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-[var(--text-muted)] bg-gray-50 dark:bg-[var(--surface-muted)] rounded-full px-3 py-1">
        <BookOpen className="w-3.5 h-3.5" /> {SOURCE_LABEL[sourceType]} · {sourceRef}
      </div>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
