import type { Metadata } from 'next';
import { privacidad } from '@/lib/legal';
import { LegalPage } from '@/lib/legal-page';
import { SITE } from '@/lib/site';
import { OG_IMAGEN } from '@/lib/meta';

const TITLE = 'Política de privacidad';
const INTRO = `Qué datos recoge este sitio, con qué finalidad, con quién se comparten y cómo ejercer sus derechos. Describe el comportamiento real del sitio, no un texto genérico.`;

export const metadata: Metadata = {
  title: TITLE,
  description: `Datos que recogemos en cotizaciones y pedidos, encargados de tratamiento, cookies de analítica y derechos bajo la Ley N.º 29733.`,
  alternates: { canonical: '/privacidad' },
  openGraph: {
    images: OG_IMAGEN,
    title: `${TITLE} | ${SITE.name}`,
    description: INTRO,
    url: `${SITE.url}/privacidad`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      path="/privacidad"
      h1={TITLE}
      intro={INTRO}
      sections={privacidad}
      breadcrumbName="Privacidad"
    />
  );
}
