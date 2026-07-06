import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';
import StructuredData from '@/components/StructuredData';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    template: '%s | Plastilonas Peruanas SAC',
  },
  description: 'Más de 15 años fabricando Big Bags, Geomembranas, Carpas Industriales, Mangas de Ventilación y soluciones textiles a medida para minería, agricultura, construcción y transporte en Perú. Calidad premium, precios justos y atención personalizada.',
  keywords: [
    'plastilonas peruanas',
    'big bags lima',
    'geomembranas perú',
    'carpas industriales',
    'mantas para camiones',
    'lona plastificada',
    'soluciones textiles industriales',
    'fabricación a medida perú',
    'big bags minería',
    'geomembrana pvc',
  ],
  authors: [{ name: 'Plastilonas Peruanas SAC' }],
  creator: 'Plastilonas Peruanas SAC',
  publisher: 'Plastilonas Peruanas SAC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.plastilonas.com'),
  openGraph: {
    title: 'Plastilonas Peruanas SAC | Líder en Soluciones Textiles Industriales',
    description: 'Fabricamos Big Bags, Geomembranas, Carpas con estructura metálica, Mangas de Ventilación y lonas a medida con la más alta calidad para los sectores más exigentes del Perú.',
    // og:image lo genera app/opengraph-image.tsx (antes apuntaba a un archivo
    // inexistente /images/og-image.jpg y las vistas previas salían en blanco).
    locale: 'es_PE',
    type: 'website',
  },
  // El favicon lo genera app/icon.tsx (antes /favicon.ico no existía).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-[#0A2540]">
        <StructuredData />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Chatbot />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
