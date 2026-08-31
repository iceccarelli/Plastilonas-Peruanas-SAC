import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, HORARIO } from '@/lib/site';
import { PRODUCT_COUNT, FAMILY_COUNT, FABRICACION_PROPIA_COUNT, YEARS_OPERATING } from '@/lib/facts';
import { INCOTERMS_SALIDA, MERCADOS, NO_AFIRMAMOS_EN } from '@/lib/exportacion';
import { CUNAS_EN } from '@/lib/cunas-en';
import { RUTA_EN } from '@/lib/fabricar-o-importar';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * SOURCING HUB EN INGLÉS — la puerta del comprador extranjero.
 *
 * POR QUÉ EXISTE. Todo el material que un jefe de compras de fuera del Perú
 * necesita —quién es la empresa y cómo verificarlo, qué se fabrica y qué se
 * suministra, bajo qué Incoterm sale la carga, qué mercados tienen evidencia
 * real y qué NO se promete— ya estaba publicado y verificado… en español, en
 * /exportacion y /confianza. Un comprador en Santiago, Bogotá o Houston no lo
 * lee. Esta página libera esa sustancia; no inventa ninguna.
 *
 * SIN hreflang, y es deliberado —a diferencia de las tres cuñas inglesas que
 * esta página enlaza, que desde la etapa 12 SÍ lo declaran porque sí tienen
 * gemela española exacta—. El clúster recíproco del sitio son tres
 * páginas —/, /en, /pt— y esta no es la traducción de ninguna: es una síntesis
 * en inglés de /exportacion más las tres cuñas. Declarar hreflang hacia un
 * destino que no corresponde hace que Google descarte el clúster entero,
 * incluido el caso en que sí corresponde. La regla y su prueba viven en
 * test/descubribilidad.test.ts.
 *
 * (La cabecera y el pie ingleses llegaron en la etapa 11: components/ChromeEn.tsx.
 * Las tres cuñas en inglés, en la etapa 12: lib/cunas-en.ts. Esta página dejó de
 * ser el final del camino y pasó a ser su vestíbulo.)
 */

const URL_PAGINA = `${SITE.url}/en/sourcing-from-peru`;
const TITLE = 'Sourcing industrial textiles from Peru';
const DESCRIPTION =
  'How to buy FIBC big bags, truck tarpaulins and mine ventilation ducting from a Peruvian manufacturer: identity, Incoterms, what we make vs. supply, and the RFQ checklist.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE.legalName}` },
  description: DESCRIPTION,
  alternates: { canonical: '/en/sourcing-from-peru' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL_PAGINA,
    locale: 'en',
    type: 'website',
  },
};

/** Preguntas reales de compras internacionales. Cada respuesta sale de un dato publicado. */
const FAQS = [
  {
    q: 'Are you a manufacturer or a trading company?',
    a: `Both, and each product line says which it is. Of ${PRODUCT_COUNT} lines in ${FAMILY_COUNT} families, ${FABRICACION_PROPIA_COUNT} are cut and sewn at our own plant in Chorrillos, Lima; the rest are direct imports, partner-supplied or produced to order, and every product page declares its sourcing mode. We do not present supplied goods as our own manufacturing.`,
  },
  {
    q: 'How do I verify the company exists before sending an RFQ?',
    a: `${SITE.legalName} holds Peruvian tax ID (RUC) ${SITE.ruc}, registered with SUNAT since 2009. You can check it yourself in SUNAT's public RUC lookup — we do not ask you to take our word for it.`,
  },
  {
    q: 'Which Incoterms do you quote?',
    a: `${INCOTERMS_SALIDA.map((i) => `${i.codigo} (${i.punto})`).join(', ')}. The Incoterm decides where responsibility for the cargo changes hands, so it is agreed before the price, not after.`,
  },
  {
    q: 'Do you ship worldwide?',
    a: 'No, and we will not claim otherwise. Manufacturing happens in Lima. Each international shipment is assessed by tariff heading, minimum volume, destination and Incoterm. There is no automatic worldwide shipping and no published freight tariff.',
  },
  {
    q: 'Do you install outside Peru?',
    a: 'Installation with our own crew is coordinated within Peru. Outside the country the scope is defined per project in the quotation; we do not offer it as automatic continent-wide coverage.',
  },
  {
    q: 'Can I get a price list?',
    a: 'No. Sales are B2B by quotation and there is no price list in any currency: price depends on specification, volume, Incoterm and destination. What you get instead is a quotation with a technical datasheet.',
  },
  {
    q: 'What do you need from me to quote?',
    a: 'Product, dimensions or quantity, delivery city or port, and the date you need it. With those four the first reply is a quotation with a datasheet; without them it is a list of questions.',
  },
];

export default function SourcingFromPeruPage() {
  const respuestaDirecta =
    `${SITE.legalName} (Peruvian tax ID ${SITE.ruc}, registered since 2009) manufactures industrial ` +
    `textiles in Chorrillos, Lima, Peru: ${FABRICACION_PROPIA_COUNT} of ${PRODUCT_COUNT} catalogue ` +
    `lines are cut and sewn in-house, across ${FAMILY_COUNT} product families, after ` +
    `${YEARS_OPERATING} years of operation. Export terms quoted are ` +
    `${INCOTERMS_SALIDA.map((i) => i.codigo).join(', ')} from Lima and the Port of Callao. ` +
    `Sales are B2B by quotation: no price list, no automatic worldwide shipping.`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL_PAGINA,
            name: TITLE,
            description: respuestaDirecta,
            speakable: ['.respuesta-directa'],
          }),
          breadcrumbSchema(
            [
              { name: 'Home', url: `${SITE.url}/` },
              { name: 'English', url: `${SITE.url}/en` },
              { name: TITLE, url: URL_PAGINA },
            ],
            `${URL_PAGINA}#breadcrumb`,
          ),
          faqSchema(FAQS, URL_PAGINA),
        ]}
      />

      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/en" className="hover:text-[#059669]">English</Link>
        {' / '}
        <span className="text-gray-700">Sourcing from Peru</span>
      </nav>

      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">
        PROCUREMENT BRIEF · ENGLISH
      </div>
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#0A2540] leading-tight mb-6">
        Sourcing industrial textiles from Peru
      </h1>

      {/* Bloque citable, arriba: el 44 % de las citas de los motores de
          respuesta sale del primer 30 % del contenido. Compuesto de campos
          reales, igual que su equivalente en español. */}
      <p className="respuesta-directa text-[15px] leading-relaxed text-[#0A2540] bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mb-8">
        {respuestaDirecta}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-3">
          What we manufacture, and what we supply
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The distinction matters more than a catalogue does. Every product page states its sourcing
          mode — own manufacturing, direct import, partner-supplied or made to order — because a
          supplier that blurs the two is a supplier you cannot audit. Three lines carry most of our
          export enquiries:
        </p>
        <ul className="space-y-3">
          {CUNAS_EN.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/en/${c.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {c.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  {c.descripcion}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7">
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#0A2540]">
          Before you compare suppliers, compare the two options
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">
          Importing a container and having it made in Lima are not the same purchase, and the
          honest comparison is landed cost, not FOB against ex-works. We publish the whole table —
          including the three criteria out of ten where importing is the better choice.
        </p>
        <p className="mt-4 text-sm">
          <Link href={RUTA_EN} className="font-medium text-[#047857] hover:underline">
            Manufacture in Peru or import? The full comparison →
          </Link>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-3">
          Where the cargo changes hands
        </h2>
        <dl className="space-y-3">
          {INCOTERMS_SALIDA.map((i) => (
            <div key={i.codigo} className="rounded-2xl border border-gray-100 p-4">
              <dt className="font-semibold text-[#0A2540]">
                {i.codigo} — {i.punto}
              </dt>
              <dd className="mt-1 text-sm text-gray-600">{i.nota}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-3">
          Markets, stated without inventing coverage
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          We do not publish a map of flags. Below is what is true per destination; anything not
          listed is assessed shipment by shipment.
        </p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Export markets (scrolls horizontally)">
          <table className="w-full text-sm border-collapse">
            <caption className="sr-only">Export markets, currency and stated scope</caption>
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">Market</th>
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">Currency</th>
                <th scope="col" className="py-3 text-left font-medium text-gray-500">Scope</th>
              </tr>
            </thead>
            <tbody>
              {MERCADOS.map((m) => (
                <tr key={m.paisEn} className="border-b border-gray-100 last:border-none">
                  <th scope="row" className="py-3 pr-6 text-left font-medium text-[#0A2540]">{m.paisEn}</th>
                  <td className="py-3 pr-6 text-gray-500">{m.moneda}</td>
                  <td className="py-3 text-gray-600">{m.notaEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12 rounded-3xl border border-gray-200 bg-gray-50/60 p-7">
        <h2 className="text-xl font-semibold tracking-tight text-[#0A2540] mb-4">
          What we do not claim
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          {NO_AFIRMAMOS_EN.map((t) => (
            <li key={t.slice(0, 24)} className="flex gap-2">
              <span className="text-gray-400">—</span> {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          This list is published in Spanish too, at{' '}
          <Link href="/confianza" className="text-[#047857] underline underline-offset-2">/confianza</Link>. Both
          languages state the same limits.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-4">
          Frequently asked, before the first RFQ
        </h2>
        <dl className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">File an RFQ</h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Send product, dimensions or quantity, destination and required date. We reply within
          business hours ({HORARIO.corto}, Lima time) with a datasheet or with the questions still
          missing.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/en/rfq"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            RFQ form (in English)
          </Link>
          <WhatsAppLink
            context="en-sourcing"
            message="Hello, I am an international buyer. Product: ___. Quantity/dimensions: ___. Destination port or city: ___."
            className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            WhatsApp sales
          </WhatsAppLink>
        </div>
        <p className="mt-5 text-sm text-white/60">
          {SITE.email} · {SITE.legalName} · RUC {SITE.ruc} · Chorrillos, Lima, Peru
        </p>
      </div>
    </div>
  );
}
