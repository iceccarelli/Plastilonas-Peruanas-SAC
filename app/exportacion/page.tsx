import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Exportación desde el Perú',
  description:
    'Suministro internacional desde Lima / Callao. Incoterms, documentación y mercados andinos. Sin promesa de envío mundial.',
  alternates: { canonical: '/exportacion' },
};

const MARKETS = [
  ['Perú', 'PEN', 'Despacho nacional. Fabricación e instalación propias.'],
  ['Chile', 'CLP', 'Callao o terrestre. Ventilación, lonas, FIBC por RFQ.'],
  ['Colombia', 'COP', 'Señal pública de comercio exterior. Cada operación se evalúa.'],
  ['Ecuador', 'USD', 'Marítimo o terrestre según volumen.'],
  ['Bolivia', 'BOB', 'Terrestre. Coberturas y geosintéticos por proyecto.'],
  ['Brasil', 'BRL', 'Marítimo. Sin lista de precios en BRL.'],
  ['México', 'MXN', 'Solo pedidos calificados por volumen.'],
];

export default function ExportacionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">SUMINISTRO INTERNACIONAL</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Exportación desde el Perú</h1>
      <p className="mt-4 text-gray-600">Fabricamos en Perú. Evaluamos destino, partida y MOQ. No operamos un e-commerce mundial.</p>
      <table className="mt-8 w-full text-sm">
        <tbody>
          {MARKETS.map(([n, c, note]) => (
            <tr key={n} className="border-t border-gray-100">
              <td className="py-3 font-medium">{n}</td>
              <td className="py-3 text-gray-500">{c}</td>
              <td className="py-3 text-gray-600">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/compradores" className="mt-8 inline-block text-[#059669]">Portal del comprador →</Link>
    </div>
  );
}
