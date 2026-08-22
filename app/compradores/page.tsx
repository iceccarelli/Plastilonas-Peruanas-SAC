import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'International buyers',
  description:
    'Can Plastilonas export? From Peru, with RFQ-based evaluation. No worldwide shipping claims. EXW Lima or FOB Callao as a starting point.',
  alternates: { canonical: '/compradores' },
};

export default function CompradoresPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">INTERNATIONAL BUYERS</div>
      <h1 className="t-display font-semibold text-[#0A2540]">¿Pueden exportar?</h1>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Fabricamos en {SITE.addressLocality}, {SITE.addressRegion}, Perú. El suministro internacional
        se evalúa por producto, volumen, destino y documentación. No hay envío mundial automático ni
        instalación en toda Sudamérica.
      </p>
      <dl className="mt-10 space-y-4 text-sm">
        <div><dt className="font-semibold">Incoterms de partida</dt><dd className="text-gray-600">EXW Lima o FOB Callao. DAP/CIF se cotizan con forwarder cuando el volumen lo justifica.</dd></div>
        <div><dt className="font-semibold">Mercados de prioridad</dt><dd className="text-gray-600">Perú, Chile, Colombia, Ecuador, Bolivia. Brasil y México por RFQ calificado.</dd></div>
        <div><dt className="font-semibold">Señal existente</dt><dd className="text-gray-600">Hay evidencia pública de comercio exterior hacia Colombia. Cada operación se confirma.</dd></div>
        <div><dt className="font-semibold">Documentos</dt><dd className="text-gray-600">Factura, packing list, ficha técnica de lote cuando existe. Sin certificaciones inventadas.</dd></div>
        <div><dt className="font-semibold">Contacto</dt><dd className="text-gray-600">{SITE.email} · WhatsApp {SITE.phoneWhatsApp}</dd></div>
      </dl>
      <Link href="/cotizacion" className="btn mt-10 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Abrir RFQ internacional</Link>
    </div>
  );
}
