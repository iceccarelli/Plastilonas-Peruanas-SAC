import type { Metadata } from 'next';
import CunaHubEn from '@/components/CunaHubEn';
import { cunaEnPorSlug } from '@/lib/cunas-en';
import { SITE } from '@/lib/site';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * Cuña comercial en inglés (ver lib/cunas-en.ts).
 *
 * hreflang RECÍPROCO Y REAL. Ésta y /ventilacion-minera sí son la misma oferta en dos
 * idiomas —mismo frente, mismas líneas, misma planta—, que es exactamente lo
 * que hreflang significa. Por eso aquí sí se declara, y en las 275 fichas del
 * catálogo sigue sin declararse: no tienen gemela. `x-default` apunta al
 * español porque el catálogo, la biblioteca y el glosario que hay detrás
 * están en español. La regla y sus clústeres viven en
 * test/descubribilidad.test.ts.
 */
const ALTERNOS = {
  'es-PE': '/ventilacion-minera',
  en: '/en/mine-ventilation-ducting-peru',
  'x-default': '/ventilacion-minera',
} as const;

const cuna = cunaEnPorSlug('mine-ventilation-ducting-peru')!;

export const metadata: Metadata = {
  title: { absolute: `${cuna.titulo} | ${SITE.legalName}` },
  description: cuna.descripcion,
  alternates: { canonical: '/en/mine-ventilation-ducting-peru', languages: ALTERNOS },
  openGraph: {
    images: OG_IMAGEN,
    title: cuna.titulo,
    description: cuna.descripcion,
    url: `${SITE.url}/en/mine-ventilation-ducting-peru`,
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
