import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT, YEARS_STATEMENT } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Centro de compras industriales',
  description: 'Due diligence para abastecimiento: identidad, catálogo, exportación, documentación y RFQ.',
  alternates: { canonical: '/compras' },
};

export default function ComprasPage() {
  const items = [
    ['¿Quién fabrica?', `${SITE.legalName}, RUC ${SITE.ruc}. ${SITE.addressStreet}, ${SITE.addressLocality}.`],
    ['¿Desde cuándo?', YEARS_STATEMENT],
    ['¿Qué pueden fabricar?', COUNT_STATEMENT],
    ['¿Exportan?', 'Se evalúa por RFQ. Incoterms de partida EXW Lima o FOB Callao. No hay envío mundial automático.'],
    ['¿Qué documentación?', 'Cotización, factura, packing list y ficha de lote cuando existe. Sin ISO/ASTM/CE inventados.'],
    ['¿Cómo se paga?', 'Condiciones en la cotización. No hay checkout para líneas industriales a medida.'],
  ];
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">PROCUREMENT</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Centro de compras industriales</h1>
      <dl className="mt-10 space-y-5">
        {items.map(([q, a]) => (
          <div key={q} className="border-b border-gray-100 pb-4">
            <dt className="font-semibold text-[#0A2540]">{q}</dt>
            <dd className="mt-1 text-sm text-gray-600">{a}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/cotizacion" className="btn inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Registrar RFQ</Link>
        <Link href="/confianza" className="btn inline-flex border border-gray-200 px-5 py-3 rounded-2xl">Due diligence</Link>
        <Link href="/biblioteca" className="btn inline-flex border border-gray-200 px-5 py-3 rounded-2xl">Guías técnicas</Link>
      </div>
    </div>
  );
}
