import type { Metadata } from 'next';
import CunaHubEn from '@/components/CunaHubEn';
import { cunaEnPorSlug } from '@/lib/cunas-en';
import { SITE } from '@/lib/site';

/**
 * Cuña comercial en inglés (ver lib/cunas-en.ts).
 *
 * hreflang RECÍPROCO Y REAL. Ésta y /lonas-camiones sí son la misma oferta en dos
 * idiomas —mismo frente, mismas líneas, misma planta—, que es exactamente lo
 * que hreflang significa. Por eso aquí sí se declara, y en las 275 fichas del
 * catálogo sigue sin declararse: no tienen gemela. `x-default` apunta al
 * español porque el catálogo, la biblioteca y el glosario que hay detrás
 * están en español. La regla y sus clústeres viven en
 * test/descubribilidad.test.ts.
 */
const ALTERNOS = {
  'es-PE': '/lonas-camiones',
  en: '/en/truck-tarpaulins-peru',
  'x-default': '/lonas-camiones',
} as const;

const cuna = cunaEnPorSlug('truck-tarpaulins-peru')!;

export const metadata: Metadata = {
  title: { absolute: `${cuna.titulo} | ${SITE.legalName}` },
  description: cuna.descripcion,
  alternates: { canonical: '/en/truck-tarpaulins-peru', languages: ALTERNOS },
  openGraph: {
    title: cuna.titulo,
    description: cuna.descripcion,
    url: `${SITE.url}/en/truck-tarpaulins-peru`,
    locale: 'en',
    type: 'website',
  },
};

// ISR: la franja de costo lee el BCRP en vivo; una hora de caché en CDN
// evita consultar la API en cada visita sin servir un dato rancio.
export const revalidate = 3600;

export default function Page() {
  return <CunaHubEn cuna={cuna} />;
}
