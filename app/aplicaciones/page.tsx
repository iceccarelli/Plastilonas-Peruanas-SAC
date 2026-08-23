import type { Metadata } from 'next';
import Link from 'next/link';
import { applications } from '@/lib/applications';

export const metadata: Metadata = {
  title: 'Aplicaciones industriales',
  description:
    'Ventilación de mina, toldos de camión, malla agrícola, geomembrana, coberturas de obra y FIBC. El comprador busca un problema, no un SKU.',
  alternates: { canonical: '/aplicaciones' },
};

export default function AplicacionesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">APLICACIÓN PRIMERO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">El problema, no el SKU.</h1>
      <p className="mt-4 max-w-2xl text-gray-600">Ocho aplicaciones que Plastilonas puede atender con líneas del catálogo. Cada ficha dice qué preguntamos y qué no afirmamos.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {applications.map((a) => (
          <Link key={a.slug} href={`/aplicaciones/${a.slug}`} className="block border border-gray-100 rounded-3xl p-6 bg-white hover:border-[#059669]/40">
            <div className="text-xs uppercase tracking-widest text-[#059669]">{a.nameEn}</div>
            <h2 className="text-xl font-semibold text-[#0A2540] mt-1">{a.name}</h2>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{a.problem}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
