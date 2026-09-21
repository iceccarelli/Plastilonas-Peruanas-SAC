import Link from 'next/link';
import { ArrowRight, Factory, Package } from 'lucide-react';
import type { z } from 'zod';
import type { ProductResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof ProductResponse>;

const AVAILABILITY_LABEL: Record<NonNullable<Props['availability']>, string> = {
  stock: 'En stock',
  a_medida: 'A medida',
  bajo_pedido: 'Suministro por proyecto',
};

export default function ProductCard({ name, url, summary, sourcingLabel, availability, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>Producto del catálogo</CardEyebrow>
      <h3 className="text-lg font-semibold text-[#0A2540] dark:text-[var(--text)]">{name}</h3>
      {summary && <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">{summary}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {sourcingLabel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-[var(--surface-muted)] px-3 py-1 text-gray-600 dark:text-[var(--text-muted)]">
            <Factory className="w-3.5 h-3.5" /> {sourcingLabel}
          </span>
        )}
        {availability && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-[var(--surface-muted)] px-3 py-1 text-gray-600 dark:text-[var(--text-muted)]">
            <Package className="w-3.5 h-3.5" /> {AVAILABILITY_LABEL[availability]}
          </span>
        )}
      </div>
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
