import type { Metadata } from 'next';
import CunaHub from '@/components/CunaHub';
import { cunaPorSlug } from '@/lib/cunas';
import { SITE } from '@/lib/site';
import { OG_IMAGEN } from '@/lib/meta';

// Cuña comercial (ver lib/cunas.ts). Contenido estático: se prerenderiza.
const cuna = cunaPorSlug('big-bags')!;

/**
 * hreflang RECÍPROCO. Esta cuña y /en/fibc-big-bags-peru son la misma oferta comercial en
 * dos idiomas —mismo frente, mismas líneas, misma planta—, que es lo que
 * hreflang significa y lo que las fichas del catálogo NO tienen. El par se
 * declara en los dos sentidos o Google lo descarta entero. `x-default` apunta
 * al español: es el idioma del catálogo que hay detrás.
 */
const ALTERNOS = {
  'es-PE': '/big-bags',
  en: '/en/fibc-big-bags-peru',
  'x-default': '/big-bags',
} as const;

export const metadata: Metadata = {
  title: { absolute: `${cuna.titulo} | Plastilonas Peruanas SAC` },
  description: cuna.descripcion,
  alternates: { canonical: '/big-bags', languages: ALTERNOS },
  openGraph: {
    images: OG_IMAGEN,
    title: cuna.titulo,
    description: cuna.descripcion,
    url: `${SITE.url}/big-bags`,
    locale: SITE.locale,
    type: 'website',
  },
};

// ISR: la franja de costo lee el BCRP en vivo; una hora de caché en CDN
// evita consultar la API en cada visita sin servir un dato rancio.
export const revalidate = 3600;

export default function Page() {
  return <CunaHub cuna={cuna} />;
}
