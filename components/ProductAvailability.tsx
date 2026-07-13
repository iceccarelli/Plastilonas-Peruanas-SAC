import { CheckCircle2, FileText, Truck } from 'lucide-react';
import { Product } from '@/lib/types';
import { availabilityLabels, sourcingLabels } from '@/lib/products';

const AVAIL_STYLE: Record<string, string> = {
  stock: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  a_medida: 'bg-blue-50 text-blue-700 border-blue-100',
  bajo_pedido: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function ProductAvailability({ product }: { product: Product }) {
  const availability = product.availability ?? 'a_medida';

  return (
    <div className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${AVAIL_STYLE[availability]}`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> {availabilityLabels[availability]}
        </span>
        {product.sourcing && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600">
            <Truck className="w-3.5 h-3.5" /> {sourcingLabels[product.sourcing]}
          </span>
        )}
        {product.leadTime && <span className="text-xs text-gray-400">· {product.leadTime}</span>}
      </div>
      {product.documentation && (
        <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <FileText className="w-4 h-4 mt-0.5 text-[#059669] shrink-0" />
          <span>{product.documentation}</span>
        </div>
      )}
    </div>
  );
}
