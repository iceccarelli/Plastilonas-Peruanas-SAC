import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/site';
import { PRODUCT_COUNT, FAMILY_COUNT } from '@/lib/facts';

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
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">File an RFQ</Link>
    </div>
  );
}
