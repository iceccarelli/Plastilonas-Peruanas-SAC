import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

/**
 * /contacto es client component (formulario) y no puede exportar `metadata`.
 * Este layout aporta title, description, canonical y el nodo ContactPage
 * enlazado al grafo de entidad — sin redeclarar el LocalBusiness global.
 */

const URL = `${SITE.url}/contacto`;
const TITLE = 'Contacto: WhatsApp, central y planta';
const DESCRIPTION = `WhatsApp ${SITE.phoneWhatsApp}, central ${SITE.phoneCentral}, ${SITE.email}. Planta y oficinas en ${SITE.addressLocality}, ${SITE.addressRegion}. RUC ${SITE.ruc}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'ContactPage',
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Contacto', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
        ]}
      />
      {children}
    </>
  );
}
