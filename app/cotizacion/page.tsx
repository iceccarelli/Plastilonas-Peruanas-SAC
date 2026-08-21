'use client';

import CotizacionModal from '@/components/CotizacionModal';
import WhatsAppLink from '@/components/WhatsAppLink';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/lib/products';

/**
 * DEFECTO CORREGIDO AQUÍ: esta página nunca leía `?producto=`.
 *
 * Las 36 fichas de producto enlazan a `/cotizacion?producto=<nombre>` desde dos
 * botones cada una, y las páginas de familia y los artículos también empujan
 * hacia aquí. El parámetro se descartaba: el comprador llegaba al formulario
 * con el campo de producto vacío y tenía que volver a escribir lo que acababa
 * de mirar. El dato más valioso del embudo se perdía en el último paso.
 *
 * También se acepta `?comparativa=slug,slug` desde las tablas comparativas:
 * el primer producto queda seleccionado y el mensaje llega redactado con la
 * lista completa, para que el equipo comercial sepa qué se está evaluando.
 */

function CotizacionContent() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(true);

  const productoParam = searchParams.get('producto') ?? undefined;

  // La comparativa llega por slugs; se traducen a nombres reales del catálogo
  // para que coincidan con las opciones del formulario.
  const comparativa = (searchParams.get('comparativa') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const preselectedProduct = productoParam ?? comparativa[0]?.name;
  const preselectedMessage = comparativa.length
    ? `Estoy comparando estas alternativas y necesito una cotización: ${comparativa
        .map((p) => p.name)
        .join('; ')}. `
    : undefined;

  return (
    <div className="text-center">
      {preselectedProduct && (
        <p className="mt-6 inline-block rounded-2xl border border-[#059669]/30 bg-[#059669]/5 px-5 py-3 text-sm text-[#0A2540]">
          Cotizando: <strong>{preselectedProduct}</strong>
          {comparativa.length > 1 && ` y ${comparativa.length - 1} alternativa(s) más`}
        </p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="mt-10 inline-flex items-center justify-center bg-[#0A2540] hover:bg-[#059669] text-white btn btn-lg btn-accent w-full justify-center font-semibold text-lg active:scale-[0.985] transition-all"
      >
        Abrir Formulario de Cotización
      </button>

      <div className="mt-16 text-xs text-gray-400 max-w-xs mx-auto">
        También puede contactarnos directamente por WhatsApp al <WhatsAppLink context="cotizacion-nota" message="Hola, quisiera una cotización." className="underline">+51 946 085 270</WhatsAppLink> para una atención inmediata.
      </div>

      <CotizacionModal
        open={showModal}
        onOpenChange={setShowModal}
        preselectedProduct={preselectedProduct}
        preselectedMessage={preselectedMessage}
      />
    </div>
  );
}

/**
 * El encabezado vive FUERA del <Suspense>.
 *
 * Con todo dentro, Next solo podía prerenderizar el fallback —el componente lee
 * `useSearchParams`— y el HTML servido de la página de conversión llegaba sin
 * <h1> y sin una sola línea de texto: solo «Cargando formulario…». Para un
 * rastreador que no ejecuta JavaScript, la página de cotización estaba en
 * blanco.
 */
export default function CotizacionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio
      </Link>

      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">
        Solicite su cotización técnica
      </h1>
      <p className="speakable-intro text-xl text-gray-600 max-w-xl mx-auto">
        Complete el formulario y su solicitud llega directamente a nuestro equipo comercial por
        WhatsApp. Para una cotización precisa conviene indicar producto, medidas o metraje, cantidad,
        aplicación o sector y ciudad de entrega.
      </p>

      <Suspense
        fallback={<div className="py-16 text-center text-gray-400">Cargando formulario…</div>}
      >
        <CotizacionContent />
      </Suspense>
    </div>
  );
}
