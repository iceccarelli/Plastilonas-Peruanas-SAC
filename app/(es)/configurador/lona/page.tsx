import type { Metadata } from 'next';
import Link from 'next/link';
import LonaConfigurador from '@/components/LonaConfigurador';

export const metadata: Metadata = {
  title: 'Configurador de lona plastificada, rafia y polytarp',
  description:
    'Elija material, gramaje, ancho, color, acabado, confección y tratamientos. El resumen alimenta el RFQ. Sin precio y sin certificación inventada.',
  alternates: { canonical: '/configurador/lona' },
};

/**
 * Hermana del configurador de FIBC, con el mismo contrato: arma una
 * especificación y la manda al RFQ. Cambia el producto, no las reglas.
 */
export default function ConfiguradorLonaPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">
        LONA PLASTIFICADA / RAFIA / POLYTARP
      </div>
      <h1 className="t-display font-semibold text-[#0A2540]">Configurador de lona a medida</h1>
      <p className="mt-4 max-w-3xl text-gray-600">
        Arma un resumen para el RFQ. No calcula precio, no emite plano y no certifica nada: el
        gramaje, el ancho y la confección se confirman por escrito en la cotización.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-gray-500">
        ¿Big bags en lugar de lona?{' '}
        <Link href="/configurador" className="font-medium text-[#059669] hover:underline">
          Configurador de FIBC / Big Bag
        </Link>
        . ¿Prefiere ver la ficha completa?{' '}
        <Link
          href="/productos/lona-plastificada-rafia-polytarp"
          className="font-medium text-[#059669] hover:underline"
        >
          Lona plastificada, rafia y polytarp
        </Link>
        .
      </p>
      <div className="mt-10">
        <LonaConfigurador />
      </div>
    </div>
  );
}
