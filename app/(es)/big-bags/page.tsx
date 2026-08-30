import type { Metadata } from 'next';
import CunaHub from '@/components/CunaHub';
import { cunaPorSlug } from '@/lib/cunas';
import { SITE } from '@/lib/site';

// Cuña comercial (ver lib/cunas.ts). Contenido estático: se prerenderiza.
const cuna = cunaPorSlug('big-bags')!;

export const metadata: Metadata = {
  title: { absolute: `${cuna.titulo} | Plastilonas Peruanas SAC` },
  description: cuna.descripcion,
  alternates: { canonical: '/big-bags' },
  openGraph: {
    title: cuna.titulo,
    description: cuna.descripcion,
    url: `${SITE.url}/big-bags`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function Page() {
  return <CunaHub cuna={cuna} />;
}
