import type { Metadata } from 'next';

/** Ver la nota de app/carrito/layout.tsx: página transaccional, fuera del índice. */
export const metadata: Metadata = {
  title: 'Solicitud recibida',
  description:
    'Su solicitud llegó a nuestro equipo comercial. Plastilonas Peruanas SAC responde por WhatsApp y correo con la cotización técnica.',
  alternates: { canonical: '/checkout/exito' },
  robots: { index: false, follow: true },
};

export default function ExitoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
