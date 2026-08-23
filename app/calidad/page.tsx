import type { Metadata } from 'next';
import Link from 'next/link';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Sistema de calidad',
  description: 'Proceso de planta: material, corte, confección, medida, embalaje y trazabilidad por RFQ. Sin ISO inventado.',
  alternates: { canonical: '/calidad' },
};

const STEPS = [
  ['Material', 'Verificación de la tela o membrana pedida contra la cotización. Ficha de lote cuando el proveedor la emite.'],
  ['Corte', 'Dimensiones de paño según el pedido. Tolerancias se acuerdan.'],
  ['Confección / soldadura', 'Costura, ojal, soldadura RF o termofusión según la línea.'],
  ['Medida', 'Comprobación dimensional antes de empacar.'],
  ['Embalaje', 'Identificación del lote en el bulto cuando el pedido lo pide.'],
  ['Trazabilidad', 'El RFQ y la cotización son el expediente. No afirmamos ERP de clase farmacéutica.'],
];

export default function CalidadPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:calidad-planta');

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">CALIDAD</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Cómo controlamos un pedido.</h1>
      <p className="mt-4 text-gray-600">Proceso de planta, no un certificado colgado. No hay ISO, ASTM, CE ni UL en esta página porque no hay documento que mostrar.</p>
      {/* El flujo completo antes de la lista. Esta página dice que aquí no hay
          un certificado que enseñar sino un proceso; un proceso descrito solo
          con palabras no se distingue de uno inventado. */}
      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}

      <ol className="mt-10 space-y-4">
        {STEPS.map(([k, v], i) => (
          <li key={k} className="border border-gray-100 rounded-2xl p-4">
            <div className="text-xs text-gray-400">{String(i + 1).padStart(2, '0')}</div>
            <h2 className="font-semibold text-[#0A2540]">{k}</h2>
            <p className="text-sm text-gray-600 mt-1">{v}</p>
          </li>
        ))}
      </ol>
      <Link href="/compras" className="mt-8 inline-block text-[#059669]">Ver due diligence de compras →</Link>
    </div>
  );
}
