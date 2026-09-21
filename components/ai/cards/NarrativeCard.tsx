import type { z } from 'zod';
import type { NarrativeResponse } from '@/lib/ai/schema';
import { CardShell, CardFollowUp } from './CardShell';
import ChatMarkdown from '@/components/ChatMarkdown';

type Props = z.infer<typeof NarrativeResponse>;

/** Respuesta de texto libre (la más cercana al widget flotante de hoy). */
export default function NarrativeCard({ text, followUp }: Props) {
  return (
    <CardShell>
      <div className="text-sm leading-relaxed text-[#0A2540] dark:text-[var(--text)]">
        <ChatMarkdown content={text} />
      </div>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
