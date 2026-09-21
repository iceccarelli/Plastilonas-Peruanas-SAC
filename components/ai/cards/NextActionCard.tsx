import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { z } from 'zod';
import type { NextActionResponse } from '@/lib/ai/schema';
import { CardShell } from './CardShell';

type Props = z.infer<typeof NextActionResponse>;

const isExternal = (url: string) => /^https?:\/\//.test(url);

/** Un único botón de siguiente paso: cotizar, WhatsApp o contacto. */
export default function NextActionCard({ url, label }: Props) {
  const external = isExternal(url);
  return (
    <CardShell className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-[#0A2540] dark:text-[var(--text)]">{label}</span>
      {external ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:text-[#059669]"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </a>
      ) : (
        <Link href={url} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:text-[#059669]">
          Continuar <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </CardShell>
  );
}
