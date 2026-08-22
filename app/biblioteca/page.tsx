import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Biblioteca técnica',
  description: 'Guías HTML de especificación: mangas de ventilación, gramaje de lona, FIBC, geomembrana y malla agrícola.',
  alternates: { canonical: '/biblioteca' },
};

export default function BibliotecaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">CENTRO TÉCNICO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Biblioteca de especificación</h1>
      <p className="mt-4 text-gray-600">HTML primero, para que un ingeniero o un agente de IA pueda leer y citar. Cada texto tiene fecha de revisión y dice qué no cubre.</p>
      <ul className="mt-10 space-y-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/biblioteca/${g.slug}`} className="block border border-gray-100 rounded-2xl p-5 hover:border-[#059669]/40">
              <div className="text-xs uppercase tracking-widest text-gray-400">Revisión {g.revised}</div>
              <h2 className="text-xl font-semibold text-[#0A2540] mt-1">{g.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{g.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
