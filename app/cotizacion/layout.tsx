import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

/**
 * /cotizacion es client component (formulario + handoff a WhatsApp) y no puede
 * exportar `metadata`. Es además la página de mayor intención comercial del
 * sitio: sin title ni canonical propios competía con la home.
 */

const URL = `${SITE.url}/cotizacion`;
const TITLE = 'Solicitar cotización técnica';
const DESCRIPTION = `Cotice big bags, lonas, geomembranas, carpas, mangas de ventilación o mallas con ${SITE.name}. Indique producto, medidas, cantidad y ciudad de entrega: respondemos por WhatsApp (${SITE.phoneWhatsApp}) con especificación y plazo.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/cotizacion' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function CotizacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Cotización', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
        ]}
      />
      {children}
    </>
  );
}
