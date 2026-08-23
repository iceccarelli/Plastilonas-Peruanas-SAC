import type { Metadata } from 'next';
import Link from 'next/link';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

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
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:exportacion-flujo');

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">SUMINISTRO INTERNACIONAL</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Exportación desde el Perú</h1>
      <p className="mt-4 text-gray-600">Fabricamos en Perú. Evaluamos destino, partida y MOQ. No operamos un e-commerce mundial.</p>
      {/* El punto donde cambia la responsabilidad es lo que un comprador
          extranjero necesita ver antes de leer la tabla de mercados: EXW Lima y
          FOB Callao son dos puntos distintos de la misma cadena. */}
      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}

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
