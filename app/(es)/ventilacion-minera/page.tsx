import type { Metadata } from 'next';
import CunaHub from '@/components/CunaHub';
import { cunaPorSlug } from '@/lib/cunas';
import { SITE } from '@/lib/site';

// Cuña comercial (ver lib/cunas.ts). Contenido estático: se prerenderiza.
const cuna = cunaPorSlug('ventilacion-minera')!;

/**
 * hreflang RECÍPROCO. Esta cuña y /en/mine-ventilation-ducting-peru son la misma oferta comercial en
 * dos idiomas —mismo frente, mismas líneas, misma planta—, que es lo que
 * hreflang significa y lo que las fichas del catálogo NO tienen. El par se
 * declara en los dos sentidos o Google lo descarta entero. `x-default` apunta
 * al español: es el idioma del catálogo que hay detrás.
 */
const ALTERNOS = {
  'es-PE': '/ventilacion-minera',
  en: '/en/mine-ventilation-ducting-peru',
  'x-default': '/ventilacion-minera',
} as const;

export const metadata: Metadata = {
  title: { absolute: `${cuna.titulo} | Plastilonas Peruanas SAC` },
  description: cuna.descripcion,
  alternates: { canonical: '/ventilacion-minera', languages: ALTERNOS },
  openGraph: {
    title: cuna.titulo,
    description: cuna.descripcion,
    url: `${SITE.url}/ventilacion-minera`,
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
