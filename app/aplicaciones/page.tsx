import type { Metadata } from 'next';
import Link from 'next/link';
import { applications } from '@/lib/applications';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasAplicacion } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Aplicaciones industriales',
  description:
    'Ventilación de mina, toldos de camión, malla agrícola, geomembrana, coberturas de obra y FIBC. El comprador busca un problema, no un SKU.',
  alternates: { canonical: '/aplicaciones' },
};

export default function AplicacionesPage() {
  const ilustraciones = ranurasAplicacion();
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">APLICACIÓN PRIMERO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">El problema, no el SKU.</h1>
      <p className="mt-4 max-w-2xl text-gray-600">{applications.length} aplicaciones que Plastilonas puede atender con líneas del catálogo. Cada ficha dice qué preguntamos y qué no afirmamos.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {applications.map((a) => (
          <Link
            key={a.slug}
            href={`/aplicaciones/${a.slug}`}
            className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white hover:border-[#059669]/40"
          >
            <MiniaturaRanura
              ranura={ilustraciones.find((r) => r.id === `aplicacion:${a.slug}`)}
              className="w-full rounded-none"
              sizes="(min-width: 768px) 480px, 100vw"
            />
            <div className="p-6">
              <div className="text-xs uppercase tracking-widest text-[#059669]">{a.nameEn}</div>
              <h2 className="text-xl font-semibold text-[#0A2540] mt-1">{a.name}</h2>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{a.problem}</p>
              {/* Los límites viajan con el enlace, no solo dentro de la ficha:
                  quien descarta aquí no gasta un clic ni una consulta. */}
              <p className="mt-3 text-xs text-gray-500">
                {a.questions.length} datos para cotizar · {a.notClaimed.length} límites declarados
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
