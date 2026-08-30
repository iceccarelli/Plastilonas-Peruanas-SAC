import type { Metadata } from 'next';
import Link from 'next/link';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Programa de distribuidores',
  description:
    'Distribuidores industriales en Chile, Colombia, Ecuador, Bolivia, Brasil y México. Postulación por RFQ, no registro automático.',
  alternates: { canonical: '/distribuidores' },
};

export default function DistribuidoresPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:distribuidores-canal');
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">CANAL</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Programa de distribuidores</h1>
      {/* Diagrama del registro. `ImagenContenido` degrada solo: mientras el
          archivo no exista no se pinta nada roto, y en cuanto se publique
          aparece aquí sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}
      <p className="mt-4 text-gray-600">Empresas con fuerza de ventas, almacén y cartera industrial. No es franquicia ni registro automático.</p>
      <ul className="mt-6 list-disc pl-5 text-gray-700 space-y-1 text-sm">
        <li>Razón social, país y territorio</li>
        <li>Años operando e industrias</li>
        <li>Fuerza de ventas y almacén</li>
        <li>Marcas actuales y volumen estimado</li>
        <li>Familias de interés</li>
      </ul>
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Postular vía RFQ</Link>
    </div>
  );
}
