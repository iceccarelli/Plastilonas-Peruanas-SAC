import Link from 'next/link';
import type { z } from 'zod';
import type { ComparisonResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof ComparisonResponse>;

/** Comparación lado a lado entre 2-4 líneas reales del propio catálogo. */
export default function ComparisonCard({ products, criteria, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>Comparación</CardEyebrow>
      <div className="overflow-x-auto -mx-1">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left font-medium text-gray-400 dark:text-[var(--text-muted)] px-2 py-2 text-xs uppercase tracking-wide">
                Criterio
              </th>
              {products.map((p) => (
                <th key={p.slug} className="text-left px-2 py-2">
                  <Link
                    href={p.url}
                    className="font-semibold text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]"
                  >
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((row) => (
              <tr key={row.label} className="border-t border-gray-100 dark:border-[var(--border)]">
                <td className="px-2 py-2 font-medium text-gray-500 dark:text-[var(--text-muted)] whitespace-nowrap">
                  {row.label}
                </td>
                {products.map((p) => (
                  <td key={p.slug} className="px-2 py-2 text-[#0A2540] dark:text-[var(--text)]">
                    {row.values[p.slug] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
