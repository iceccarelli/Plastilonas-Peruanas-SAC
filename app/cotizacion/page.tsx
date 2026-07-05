'use client';

import CotizacionModal from '@/components/CotizacionModal';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CotizacionPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8"><ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio</Link>
      
      <h1 className="text-5xl tracking-tighter font-semibold mb-4">Solicite su cotización</h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto">Complete el formulario y reciba una propuesta personalizada en menos de 2 horas hábiles.</p>

      <button 
        onClick={() => setShowModal(true)} 
        className="mt-10 inline-flex items-center justify-center bg-[#0A2540] hover:bg-[#059669] text-white px-14 py-4 rounded-2xl font-semibold text-lg active:scale-[0.985] transition-all"
      >
        Abrir Formulario de Cotización
      </button>

      <div className="mt-16 text-xs text-gray-400 max-w-xs mx-auto">
        También puede contactarnos directamente por WhatsApp al <a href="https://wa.me/51946085270" className="underline">+51 946 085 270</a> para una atención inmediata.
      </div>

      <CotizacionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
