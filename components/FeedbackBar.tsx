'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import WhatsAppLink from './WhatsAppLink';

/**
 * «¿Encontró lo que buscaba?» — el cierre de página de aws.amazon.com,
 * con la honestidad de este sitio.
 *
 * Qué hace de verdad: registra un evento de analítica con la ruta y la
 * respuesta. No finge un "sistema de feedback" que nadie lee: el «No» abre
 * además el canal real —WhatsApp comercial, en horario de atención— con la
 * página como contexto, que es donde una carencia concreta sí se atiende.
 *
 * Vive DENTRO de <main> a propósito: la capa de compatibilidad del modo
 * oscuro (globals.css) remapea las utilidades bg-gray y text-gray sólo
 * bajo main, así que aquí el bloque adopta ambos temas sin clases extra.
 */
export default function FeedbackBar() {
  const ruta = usePathname();
  const [respuesta, setRespuesta] = useState<'si' | 'no' | null>(null);

  const responder = (valor: 'si' | 'no') => {
    setRespuesta(valor);
    trackEvent('feedback_pagina', { util: valor, ruta: ruta ?? '' });
  };

  return (
    <section aria-label="Valoración de la página" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl px-7 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-lg mb-1">¿Encontró lo que buscaba?</div>
            <p className="text-sm text-gray-600">
              {respuesta === null && 'Su respuesta nos dice qué contenido falta en esta página.'}
              {respuesta === 'si' && 'Gracias por confirmarlo.'}
              {respuesta === 'no' && 'Gracias por avisar. Si busca algo concreto, cuéntenoslo por WhatsApp y lo atendemos en horario comercial.'}
            </p>
          </div>
          {respuesta === null ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => responder('si')}
                className="inline-flex items-center gap-2 bg-[#0A2540] text-white hover:bg-[#047857] font-semibold px-7 py-3 rounded-full transition-colors"
              >
                Sí <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => responder('no')}
                className="inline-flex items-center gap-2 bg-[#0A2540] text-white hover:bg-[#047857] font-semibold px-7 py-3 rounded-full transition-colors"
              >
                No <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          ) : respuesta === 'no' ? (
            <WhatsAppLink
              context="feedback-pagina"
              message={`Hola, estuve en ${ruta ?? 'su sitio'} y no encontré lo que buscaba. Busco: `}
              className="inline-flex items-center gap-2 bg-[#0A2540] text-white hover:bg-[#047857] font-semibold px-7 py-3 rounded-full transition-colors"
            >
              Escribir por WhatsApp
            </WhatsAppLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
