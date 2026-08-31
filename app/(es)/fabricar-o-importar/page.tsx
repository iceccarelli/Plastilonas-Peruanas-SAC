import type { Metadata } from 'next';
import FabricarOImportar from '@/components/FabricarOImportar';
import { SITE } from '@/lib/site';

/**
 * hreflang RECÍPROCO: esta página y /en/manufacture-in-peru-or-import son la
 * MISMA comparación en dos idiomas, escritas desde la misma matriz
 * (lib/fabricar-o-importar.ts). Clúster válido, igual que los tres pares de
 * cuña de la etapa 12. `x-default` al español.
 */
const ALTERNOS = {
  'es-PE': '/fabricar-o-importar',
  en: '/en/manufacture-in-peru-or-import',
  'x-default': '/fabricar-o-importar',
} as const;

const TITLE = '¿Fabricar en Lima o importar? La comparación completa';
const DESCRIPTION =
  'Diez criterios, incluidos los tres que gana la importación, y el costo real de importar: ad valorem sobre CIF, IGV, IPM, percepción, despacho y días de financiamiento.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | ${SITE.legalName}` },
  description: DESCRIPTION,
  alternates: { canonical: '/fabricar-o-importar', languages: ALTERNOS },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/fabricar-o-importar`,
    locale: SITE.locale,
    type: 'website',
  },
};

// ISR: la franja cambiaria lee el BCRP en vivo.
export const revalidate = 3600;

export default function Page() {
  return <FabricarOImportar idioma="es" />;
}
