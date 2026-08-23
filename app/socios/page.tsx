import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Partners de ingeniería y proyecto',
  description: 'EPC, estudios y contratistas. Canal de especificación, no programa de afiliados.',
  alternates: { canonical: '/socios' },
};

export default function SociosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">PARTNERS</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Ingeniería y proyecto</h1>
      <p className="mt-4 text-gray-600">EPC, estudios, contratistas de mina y de obra, integradores agrícolas. No es un programa de afiliados.</p>
      <ul className="mt-6 list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Biblioteca técnica HTML y calculadoras preliminares</li>
        <li>RFQ con identificador</li>
        <li>Muestras y fichas de lote cuando el material las tiene</li>
        <li>Apoyo de especificación — no sustituimos al ingeniero del proyecto</li>
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/cotizacion" className="btn inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">RFQ de partner</Link>
        <Link href="/distribuidores" className="btn inline-flex border border-gray-200 px-5 py-3 rounded-2xl">Canal de distribución</Link>
      </div>
    </div>
  );
}
