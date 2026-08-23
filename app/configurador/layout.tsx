import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurador FIBC / Big Bag',
  description: 'Especifique capacidad, boca, fondo, asas y liner. El resumen alimenta el RFQ. Sin precio y sin certificación UN inventada.',
  alternates: { canonical: '/configurador' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
