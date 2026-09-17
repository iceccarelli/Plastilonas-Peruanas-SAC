import type { Metadata } from 'next';
import FabricarOImportar from '@/components/FabricarOImportar';
import { SITE } from '@/lib/site';
import { OG_IMAGEN } from '@/lib/meta';

/** Gemela inglesa de /fabricar-o-importar. Ver la nota de hreflang allí. */
const ALTERNOS = {
  'es-PE': '/fabricar-o-importar',
  en: '/en/manufacture-in-peru-or-import',
  'x-default': '/fabricar-o-importar',
} as const;

const TITLE = 'Manufacture in Peru or import? The full comparison';
const DESCRIPTION =
  'Ten criteria, including the three importing wins, and the real cost of importing: ad valorem duty, IGV, IPM, perception, clearance and financing.';

export const metadata: Metadata = {
  // Short layout template (`%s | Plastilonas`, 65-char budget): a suffix
  // with the full legal name pushed the <title> past 65 characters.
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/en/manufacture-in-peru-or-import', languages: ALTERNOS },
  openGraph: {
    images: OG_IMAGEN,
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/en/manufacture-in-peru-or-import`,
    locale: 'en_US',
    type: 'website',
  },
};

export const revalidate = 3600;

export default function Page() {
  return <FabricarOImportar idioma="en" />;
}
