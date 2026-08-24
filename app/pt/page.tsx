import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT } from '@/lib/facts';

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
  title: 'Fabricante peruano de têxteis industriais',
  description: 'Fábrica em Chorrillos, Lima. Exportação para o Brasil avaliada por RFQ.',
  alternates: { canonical: '/pt', languages: ALTERNOS },
};

export default function PortuguesePage() {
  return (
    <div lang="pt-BR" className="max-w-3xl mx-auto px-6 py-14">
      {/* Mismo motivo que en /en: el <html> dice "es" y esta página no lo es. */}
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">PORTUGUÊS · COMPRADOR BRASILEIRO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Fabricante peruano de têxteis industriais sob medida</h1>
      {/* Estas dos páginas son la puerta de entrada de un comprador
          internacional y llegaban sin una sola imagen: identidad y RFQ en
          texto plano. La fotografía es de planta propia y ya vive en el
          repositorio. */}
      <figure className="mt-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gray-100">
          <Image
            src="/images/servicio-fabricacion.webp"
            alt="Chão de fábrica na planta de Chorrillos, Lima."
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            priority
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-xs text-gray-500">Planta de Chorrillos, Lima — Peru.</figcaption>
      </figure>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Fábrica em Chorrillos, Lima. Desde {SITE.foundingYear}. RUC {SITE.ruc}. {COUNT_STATEMENT}.
        O sítio é em espanhol; esta página confirma identidade e abre o RFQ. Não há tabela de preços em BRL.
      </p>
      <p className="mt-6 text-sm">Vendas: {SITE.email} · WhatsApp {SITE.phoneWhatsApp}</p>
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Abrir RFQ</Link>
    </div>
  );
}
