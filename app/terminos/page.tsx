import type { Metadata } from 'next';
import { terminos } from '@/lib/legal';
import { LegalPage } from '@/lib/legal-page';
import { SITE } from '@/lib/site';

const TITLE = 'Términos y condiciones';
const INTRO = `Cómo funciona la relación comercial: venta por cotización, alcance de las especificaciones publicadas, compra en línea y uso del contenido técnico del sitio.`;

export const metadata: Metadata = {
  title: TITLE,
  description: `Venta B2B por cotización, sin precios de lista. Alcance de las fichas y guías técnicas, compra en línea y ley aplicable.`,
  alternates: { canonical: '/terminos' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: INTRO,
    url: `${SITE.url}/terminos`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function TerminosPage() {
  return (
    <LegalPage
      path="/terminos"
      h1={TITLE}
      intro={INTRO}
      sections={terminos}
      breadcrumbName="Términos y condiciones"
    />
  );
}
