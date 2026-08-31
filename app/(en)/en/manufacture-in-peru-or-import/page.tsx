import type { Metadata } from 'next';
import FabricarOImportar from '@/components/FabricarOImportar';
import { SITE } from '@/lib/site';

/** Gemela inglesa de /fabricar-o-importar. Ver la nota de hreflang allí. */
const ALTERNOS = {
  'es-PE': '/fabricar-o-importar',
  en: '/en/manufacture-in-peru-or-import',
  'x-default': '/fabricar-o-importar',
} as const;

const TITLE = 'Manufacture in Peru or import? The full comparison';
const DESCRIPTION =
  'Ten criteria, including the three importing wins, and what an import into Peru actually costs: ad valorem duty on CIF, IGV, IPM, advance perception, clearance and days of financing.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE.legalName}` },
  description: DESCRIPTION,
  alternates: { canonical: '/en/manufacture-in-peru-or-import', languages: ALTERNOS },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/en/manufacture-in-peru-or-import`,
    locale: 'en',
    type: 'website',
  },
};

export const revalidate = 3600;

export default function Page() {
  return <FabricarOImportar idioma="en" />;
}
