import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/site';
import { PRODUCT_COUNT, FAMILY_COUNT } from '@/lib/facts';
import { CUNAS_EN } from '@/lib/cunas-en';

/**
 * hreflang — se declara SOLO entre estas tres páginas.
 *
 * `/en` y `/pt` no son traducciones del sitio: son una página de identidad y
 * RFQ por idioma. hreflang significa «el mismo contenido en otro idioma», así
 * que declararlo en las 275 páginas apuntaría cada ficha de producto a una
 * portada en inglés que no la traduce. Google descarta el clúster entero
 * cuando el destino no corresponde, y de paso se pierde el caso en que sí
 * corresponde. Aquí corresponde: las tres son la puerta de entrada al mismo
 * proveedor, cada una en su idioma. x-default apunta al español porque es el
 * idioma real del catálogo.
 */
const ALTERNOS = {
  'es-PE': '/',
  en: '/en',
  'pt-BR': '/pt',
  'x-default': '/',
} as const;

export const metadata: Metadata = {
  title: 'Peruvian industrial textile manufacturer',
  description:
    'Custom industrial textiles made in Lima, Peru since 2009: FIBC big bags, truck tarpaulins, mine ventilation ducting, geosynthetics. RFQ in English.',
  alternates: { canonical: '/en', languages: ALTERNOS },
};

export default function EnglishPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      {/* El <html lang="en"> lo declara app/(en)/layout.tsx: esta página ya no
          necesita compensar el idioma con un atributo local. */}
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">ENGLISH · PROCUREMENT BRIEF</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Peruvian manufacturer of custom industrial textiles</h1>
      {/* Estas dos páginas son la puerta de entrada de un comprador
          internacional y llegaban sin una sola imagen: identidad y RFQ en
          texto plano. La fotografía es de planta propia y ya vive en el
          repositorio. */}
      <figure className="mt-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gray-100">
          <Image
            src="/images/servicio-fabricacion.webp"
            alt="Manufacturing floor at the Chorrillos plant, Lima."
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            priority
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-xs text-gray-500">Chorrillos plant, Lima — Peru.</figcaption>
      </figure>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Plant in Chorrillos, Lima. Operating since {SITE.foundingYear}. RUC {SITE.ruc}. {PRODUCT_COUNT} solutions across {FAMILY_COUNT} product families.
        Spanish is the primary language of this site. This page exists so an international buyer can
        verify identity and file an RFQ without a machine-translated catalogue.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        We manufacture in Peru. International supply is evaluated per order. We do not offer automatic worldwide shipping.
      </p>
      <p className="mt-6 text-sm">Sales: {SITE.email} · WhatsApp {SITE.phoneWhatsApp}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/en/sourcing-from-peru" className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-5 py-3 font-semibold text-white hover:bg-[#059669]">
          How to source from Peru →
        </Link>
        <Link href="/en/rfq" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]">
          File an RFQ
        </Link>
      </div>

      {/* Las tres consultas por las que un fabricante limeño puede ser la
          respuesta en inglés. Van aquí, bajo los dos botones, y no antes: esta
          página sigue siendo identidad y RFQ, no un catálogo traducido. */}
      <section className="mt-12 border-t pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-[#0A2540]">What we make</h2>
        <p className="mt-1 text-sm text-gray-500">
          Three lines, written in English: specification checklist, sourcing table, Incoterms and
          what we do not claim.
        </p>
        <ul className="mt-5 space-y-3">
          {CUNAS_EN.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/en/${c.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {c.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{c.descripcion}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
