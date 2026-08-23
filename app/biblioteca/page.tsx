import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/lib/guides';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasBiblioteca } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Biblioteca técnica',
  description: 'Guías HTML de especificación: mangas de ventilación, gramaje de lona, FIBC, geomembrana y malla agrícola.',
  alternates: { canonical: '/biblioteca' },
};

export default function BibliotecaPage() {
  const diagramas = ranurasBiblioteca();
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">CENTRO TÉCNICO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Biblioteca de especificación</h1>
      <p className="mt-4 text-gray-600">HTML primero, para que un ingeniero o un agente de IA pueda leer y citar. Cada texto tiene fecha de revisión y dice qué no cubre.</p>
      <ul className="mt-10 space-y-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/biblioteca/${g.slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 sm:flex-row sm:items-start"
            >
              {/* El mismo esquema que abre la guía. Distinguir una guía de otra
                  antes de entrar es la mitad del trabajo de un índice. */}
              <MiniaturaRanura
                ranura={diagramas.find((r) => r.id === `biblioteca:${g.slug}`)}
                className="w-full shrink-0 sm:w-44"
                sizes="(min-width: 640px) 176px, 100vw"
              />
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Revisión {g.revised}</div>
                <h2 className="text-xl font-semibold text-[#0A2540] mt-1">{g.title}</h2>
                <p className="text-sm text-gray-600 mt-2">{g.summary}</p>
                <p className="mt-3 text-xs text-gray-500">
                  {g.questions.length} datos que pedimos para cotizar
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
