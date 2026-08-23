import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { products, productFamilies } from '@/lib/products';

/**
 * El catálogo (app/productos/page.tsx) es un client component y por eso no
 * puede exportar `metadata`. Sin este layout la página heredaba el title y la
 * description del root layout — misma descripción que la home, sin canonical.
 *
 * OJO: este layout también envuelve /productos/[slug]. Esa página sobrescribe
 * title, description, canonical y openGraph en su generateMetadata, así que no
 * hereda nada de aquí. Por eso el JSON-LD del catálogo NO va en este layout
 * (se duplicaría en las 36 fichas), sino dentro de la propia página.
 */

const TITLE = `Catálogo: ${products.length} soluciones textiles industriales`;
const DESCRIPTION = `${products.length} líneas en ${productFamilies.length} familias, con especificación real y modo de suministro declarado. Fabricación a medida y despacho a todo el Perú.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/productos' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/productos`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
