import CotizacionForm, { SLA_COTIZACION } from '@/components/CotizacionForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/lib/products';
import DatosParaCotizar from '@/components/DatosParaCotizar';

/**
 * /cotizacion — PÁGINA COMPLETA de RFQ (antes: una página que solo abría un
 * modal). Un formulario con URL propia se puede enlazar desde 36 fichas,
 * medir por campaña, retomar desde el historial y servir con TODOS sus campos
 * en el primer HTML.
 *
 * Es un componente de SERVIDOR que lee `searchParams` como prop: la página se
 * vuelve dinámica (se renderiza por petición), y a cambio el formulario —con
 * ciudad de entrega, fecha y adjuntos— llega completo en el HTML inicial para
 * quien no ejecuta JavaScript. (Antes, un limite de suspensión dejaba la
 * página de conversión en «Cargando…» para los rastreadores.)
 *
 * Lee `?producto=` (nombre o slug) y `?comparativa=slug,slug`. Si llega un
 * producto, el campo de producto pasa a ser OBLIGATORIO: el visitante ya
 * decidió qué cotiza y perder ese dato en el último paso era el defecto más
 * caro del embudo.
 */
export default async function CotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; comparativa?: string; nota?: string }>;
}) {
  const params = await searchParams;
  const productoParam = params.producto || undefined;
  const porSlug = productoParam ? products.find((p) => p.slug === productoParam) : undefined;

  const comparativa = (params.comparativa ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const preselectedProduct = porSlug?.name ?? productoParam ?? comparativa[0]?.name;
  const slugOrigen =
    porSlug?.slug ??
    products.find((p) => p.name === productoParam)?.slug ??
    comparativa[0]?.slug;
  // `nota` llega de las calculadoras («Enviar este predimensionado a
  // cotización»): el resumen del cálculo prellenado en la descripción.
  const nota = (params.nota ?? '').slice(0, 1500) || undefined;
  const preselectedMessage =
    [
      comparativa.length
        ? `Estoy comparando estas alternativas y necesito una cotización: ${comparativa
            .map((p) => p.name)
            .join('; ')}. `
        : '',
      nota ?? '',
    ]
      .filter(Boolean)
      .join('\n') || undefined;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex min-h-[24px] items-center py-1 text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio
      </Link>

      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">
        Solicite su cotización técnica
      </h1>
      <p className="speakable-intro text-xl text-gray-600 max-w-xl">{SLA_COTIZACION}</p>

      <div className="my-8">
        <DatosParaCotizar compacto />
      </div>

      {preselectedProduct && (
        <p className="mb-8 inline-block rounded-2xl border border-[#059669]/30 bg-[#059669]/5 px-5 py-3 text-sm text-[#0A2540]">
          Cotizando: <strong>{preselectedProduct}</strong>
          {comparativa.length > 1 && ` y ${comparativa.length - 1} alternativa(s) más`}
        </p>
      )}

      <CotizacionForm
        preselectedProduct={preselectedProduct}
        slugOrigen={slugOrigen}
        preselectedMessage={preselectedMessage}
      />
    </div>
  );
}
