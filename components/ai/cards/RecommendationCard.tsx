import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { z } from 'zod';
import type { RecommendationResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof RecommendationResponse>;

export default function RecommendationCard({ productName, url, reason, followUp }: Props) {
  return (
    <CardShell accent>
      <CardEyebrow>Recomendación</CardEyebrow>
      <h3 className="text-lg font-semibold text-[#0A2540] dark:text-[var(--text)]">{productName}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">{reason}</p>
      <Link
        href={url}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:text-[#059669]"
      >
        Ver ficha completa <ArrowRight className="w-4 h-4" />
      </Link>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
