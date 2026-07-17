'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';

type FLink = { label: string; href: string; external?: boolean };
export type FSection = { title: string; links: FLink[] };

/**
 * Footer acordeón para mobile (patrón AWS): cada columna se colapsa en una
 * fila tocable con +/-. Reduce ~1900px de muro vertical a una lista escaneable.
 */
export default function FooterAccordion({ sections }: { sections: FSection[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="md:hidden divide-y divide-white/10 border-y border-white/10">
      {sections.map((sec, i) => {
        const on = open === i;
        return (
          <div key={sec.title}>
            <button
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-semibold text-sm tracking-wide text-white">{sec.title}</span>
              {on ? <Minus className="w-4 h-4 text-white/60" /> : <Plus className="w-4 h-4 text-white/60" />}
            </button>
            <div className={`grid transition-all duration-300 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <ul className="pb-4 space-y-3 text-sm">
                  {sec.links.map((l) => (
                    <li key={l.label}>
                      {l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">{l.label}</a>
                      ) : (
                        <Link href={l.href} className="text-white/70 hover:text-white transition-colors">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
