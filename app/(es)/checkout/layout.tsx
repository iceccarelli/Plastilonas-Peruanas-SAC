import type { Metadata } from 'next';

/** Ver la nota de app/carrito/layout.tsx: página transaccional, fuera del índice. */
export const metadata: Metadata = {
  title: 'Confirmar solicitud',
  description:
    'Confirmación de la solicitud de cotización a Plastilonas Peruanas SAC. Fabricación e instalación a medida en el Perú.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
