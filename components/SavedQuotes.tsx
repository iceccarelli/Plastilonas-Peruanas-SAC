'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { getSavedQuotes, type SavedQuote } from '@/lib/whatsapp';

/**
 * Historial de solicitudes guardado localmente en este navegador.
 * Es honesto sobre su alcance: no hay (aún) una base de datos de pedidos,
 * así que no fingimos sincronización entre dispositivos.
 */
export default function SavedQuotes() {
  const [quotes, setQuotes] = useState<SavedQuote[] | null>(null);

  useEffect(() => {
    setQuotes(getSavedQuotes());
  }, []);

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#0A2540]">
            Sus solicitudes recientes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Guardadas en este navegador para su referencia.
          </p>
        </div>
      </div>

      {quotes === null ? null : quotes.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-3xl p-10 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            Aún no ha enviado solicitudes desde este navegador.
          </p>
          <Link
            href="/cotizacion"
            className="inline-flex items-center gap-2 text-[#059669] font-medium hover:underline"
          >
            Solicitar mi primera cotización <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium text-[#0A2540]">
                  {q.producto || 'Consulta general'}
                </div>
                <div className="text-sm text-gray-500">
                  {q.cantidad ? `Cantidad: ${q.cantidad} · ` : ''}
                  {new Date(q.fecha).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <span className="text-xs font-medium tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                ENVIADA POR WHATSAPP
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
