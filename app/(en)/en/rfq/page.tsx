import type { Metadata } from 'next';
import Link from 'next/link';
import CotizacionForm, { SLA_QUOTE_EN } from '@/components/CotizacionForm';
import { products } from '@/lib/products';
import { SITE, HORARIO } from '@/lib/site';
import { INCOTERMS_SALIDA } from '@/lib/exportacion';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * RFQ EN INGLÉS.
 *
 * El hueco que cierra: /en/sourcing-from-peru invitaba a un comprador
 * extranjero y su botón de cotización lo dejaba en un formulario en español,
 * con «Ciudad de entrega» y un placeholder de teléfono peruano. Se pierde ahí
 * exactamente al visitante que la página existe para captar.
 *
 * Es el MISMO componente que /cotizacion —mismos campos obligatorios, mismos
 * adjuntos, mismo borrador, mismo acuse de recibo— con `idioma="en"`. No hay
 * un segundo formulario que pueda divergir: esa lección ya la pagó
 * CotizacionModal.
 *
 * El lead viaja con `language: 'en'`, campo que /api/lead aceptaba desde
 * siempre y que nunca recibía: ahora el equipo comercial sabe en qué idioma
 * responder antes de abrir el mensaje.
 */

const URL_PAGINA = `${SITE.url}/en/rfq`;
const TITLE = 'Request a quotation';
const DESCRIPTION =
  'Request a quotation from a Peruvian manufacturer of industrial textiles: product, dimensions, destination and date. Reply with a technical datasheet.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE.legalName}` },
  description: DESCRIPTION,
  alternates: { canonical: '/en/rfq' },
  openGraph: {
    images: OG_IMAGEN, title: TITLE, description: DESCRIPTION, url: URL_PAGINA, locale: 'en', type: 'website' },
};

export default async function RfqEnPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const buscado = params.product || undefined;
  const encontrado = buscado
    ? products.find((p) => p.slug === buscado || p.name === buscado)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({ url: URL_PAGINA, name: TITLE, description: DESCRIPTION }),
          breadcrumbSchema(
            [
              { name: 'Home', url: `${SITE.url}/` },
              { name: 'English', url: `${SITE.url}/en` },
              { name: TITLE, url: URL_PAGINA },
            ],
            `${URL_PAGINA}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/en" className="hover:text-[#059669]">English</Link>
        {' / '}
        <Link href="/en/sourcing-from-peru" className="hover:text-[#059669]">Sourcing from Peru</Link>
        {' / '}
        <span className="text-gray-700">Request a quotation</span>
      </nav>

      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
        Request a quotation
      </h1>
      <p className="text-xl text-gray-600">{SLA_QUOTE_EN}</p>

      <section className="my-8 rounded-2xl border border-gray-200 p-5">
        <div className="mb-3 font-semibold text-[#0A2540]">Four details make the quote exact</div>
        <ol className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <li><span className="font-mono text-[#059669]">1.</span> <span className="font-medium">Product</span> <span className="text-gray-500">— name or family</span></li>
          <li><span className="font-mono text-[#059669]">2.</span> <span className="font-medium">Dimensions / quantity</span> <span className="text-gray-500">— units, metres or tonnes</span></li>
          <li><span className="font-mono text-[#059669]">3.</span> <span className="font-medium">Delivery city or port</span> <span className="text-gray-500">— sets Incoterm and freight</span></li>
          <li><span className="font-mono text-[#059669]">4.</span> <span className="font-medium">Date</span> <span className="text-gray-500">— when you need it</span></li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          Export terms quoted: {INCOTERMS_SALIDA.map((i) => `${i.codigo} (${i.punto})`).join(', ')}.
          Business hours {HORARIO.corto}, Lima time.
        </p>
      </section>

      {encontrado && (
        <p className="mb-8 inline-block rounded-2xl border border-[#059669]/30 bg-[#059669]/5 px-5 py-3 text-sm text-[#0A2540]">
          Quoting: <strong>{encontrado.name}</strong>
        </p>
      )}

      <CotizacionForm
        idioma="en"
        opciones={products.map((p) => ({ slug: p.slug, name: p.name }))}
        preselectedProduct={encontrado?.name}
        slugOrigen={encontrado?.slug}
      />
    </div>
  );
}
