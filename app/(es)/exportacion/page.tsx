import type { Metadata } from 'next';
import Link from 'next/link';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { webPageSchema, breadcrumbSchema, faqSchema, businessRef } from '@/lib/schema';
import { INCOTERMS_SALIDA } from '@/lib/entidad-feed';
import WhatsAppLink from '@/components/WhatsAppLink';

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

/**
 * ALCANCE INTERNACIONAL, DECLARADO SIN INVENTAR COBERTURA.
 *
 * La tentación evidente en esta página es meter Chile, Colombia, Ecuador y
 * Bolivia en un `areaServed` y quedarse tranquilo. No se hace, y el motivo está
 * publicado dos clics más allá: /confianza enumera «Envío mundial o instalación
 * continental» entre las cosas que esta empresa NO afirma, y de esos cuatro
 * mercados sólo Colombia tiene evidencia pública de comercio. Un `areaServed`
 * con cinco países es una afirmación de cobertura en un campo tipado, y un
 * comprador que la contrasta con /confianza encuentra al sitio contradiciéndose.
 *
 * Lo que sí se declara —y es MÁS útil para quien pregunta— es el mecanismo: de
 * dónde sale la carga, bajo qué Incoterm, y qué hay que definir para que exista
 * una cotización. Un agente que lea esto puede contestar «¿exportan a Chile?»
 * con la verdad completa: se fabrica en Chorrillos, se embarca EXW Lima o FOB
 * Callao, y cada operación se evalúa por partida, volumen y destino.
 */
const FAQS = [
  {
    q: '¿Exportan a otros países de Sudamérica?',
    a: 'La fabricación ocurre en Chorrillos, Lima. Cada operación internacional se evalúa por partida arancelaria, volumen mínimo, destino e Incoterm: no hay envío mundial automático ni tarifa publicada. Existe evidencia pública de comercio exterior hacia Colombia; el resto de destinos se confirma operación por operación.',
  },
  {
    q: '¿Bajo qué Incoterm entregan?',
    a: `Cotizamos ${INCOTERMS_SALIDA.map((i) => `${i.codigo} (${i.punto})`).join(', ')}. El Incoterm decide dónde cambia la responsabilidad sobre la carga, así que se define antes del precio, no después.`,
  },
  {
    q: '¿Instalan fuera del Perú?',
    a: 'La instalación con equipo propio se coordina dentro del Perú. Fuera del país el alcance se define en la cotización, proyecto por proyecto: no se ofrece como cobertura continental automática.',
  },
  {
    q: '¿Publican precios para exportación?',
    a: 'No. La venta es B2B por cotización y no hay lista de precios en ninguna moneda. El precio depende de especificación, volumen, Incoterm y destino.',
  },
];

export default function ExportacionPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:exportacion-flujo');
  const url = `${SITE.url}/exportacion`;
  const rfq = [
    '*RFQ EXPORTACIÓN*',
    '',
    'Para evaluar la operación necesito indicar:',
    '· País y ciudad de destino: ',
    '· Producto y especificación: ',
    '· Volumen / cantidad: ',
    '· Incoterm preferido (EXW Lima / FCA Lima / FOB Callao): ',
    '· Fecha requerida: ',
  ].join('\n');

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: 'Exportación de textil industrial y geosintéticos desde el Perú',
            description:
              'Fabricación en Chorrillos, Lima. Suministro internacional evaluado por RFQ: partida, volumen mínimo, destino e Incoterm. Sin envío mundial automático.',
            speakable: ['.respuesta-directa'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Exportación', url },
            ],
            `${url}#breadcrumb`,
          ),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${url}#servicio`,
            name: 'Suministro internacional evaluado por RFQ',
            serviceType: 'Exportación de textil industrial y geosintéticos',
            provider: businessRef(),
            url,
            // Una sola cobertura sin matices: donde se fabrica. Lo internacional
            // va como condición del servicio, no como área de servicio.
            areaServed: { '@type': 'Country', name: 'Perú' },
            termsOfService: `${SITE.url}/confianza`,
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: `${SITE.url}/cotizacion`,
              name: 'Solicitud de cotización (RFQ)',
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Puntos de entrega cotizables',
              itemListElement: INCOTERMS_SALIDA.map((i) => ({
                '@type': 'Offer',
                name: `${i.codigo} — ${i.punto}`,
                description: i.nota,
                eligibleCustomerType: 'https://schema.org/Business',
              })),
            },
          },
          faqSchema(FAQS, url),
        ]}
      />
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">SUMINISTRO INTERNACIONAL</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Exportación desde el Perú</h1>
      <p className="respuesta-directa mt-4 text-gray-700 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 leading-relaxed">
        Plastilonas Peruanas SAC fabrica textil industrial y geosintéticos en su planta de {SITE.addressLocality}, Lima,
        y embarca {INCOTERMS_SALIDA.map((i) => i.codigo).join(' / ')} desde Lima y el Callao. Cada operación internacional
        se evalúa por partida arancelaria, volumen mínimo, destino e Incoterm. No operamos un comercio electrónico
        mundial y no publicamos precios en ninguna moneda.
      </p>
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
      <h2 className="mt-12 text-xl font-semibold text-[#0A2540]">Punto de entrega cotizable</h2>
      <dl className="mt-4 space-y-3">
        {INCOTERMS_SALIDA.map((i) => (
          <div key={i.codigo} className="rounded-2xl border border-gray-100 p-4">
            <dt className="font-semibold text-[#0A2540]">{i.codigo} — {i.punto}</dt>
            <dd className="mt-1 text-sm text-gray-600">{i.nota}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-xl font-semibold text-[#0A2540]">Preguntas frecuentes</h2>
      <dl className="mt-4 space-y-5">
        {FAQS.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
            <dd className="mt-1 text-gray-700">{f.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap gap-3">
        <WhatsAppLink
          context="rfq-exportacion"
          message={rfq}
          className="inline-flex items-center bg-[#0A2540] text-white px-5 py-3 rounded-2xl font-semibold hover:bg-[#059669]"
        >
          RFQ de exportación por WhatsApp
        </WhatsAppLink>
        <Link href="/compradores" className="inline-flex items-center border border-gray-200 px-5 py-3 rounded-2xl font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]">Portal del comprador →</Link>
      </div>
    </div>
  );
}
