import ExitIntentModal from '@/components/ExitIntentModal';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import CartDrawer from '@/components/CartDrawer';
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

// Mono para metadatos técnicos (specs, estados, conteos).
// Patrón AWS: la monoespaciada señala "dato de ingeniería", no marketing.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    template: '%s | Plastilonas Peruanas SAC',
  },
  description: 'Más de 15 años fabricando e instalando soluciones industriales a medida en el Perú: big bags, lonas y cobertores, geosintéticos, estructuras y arquitectura textil, mallas agrícolas, ventilación industrial y más. Un solo proveedor, fabricación propia e instalación.',
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
    title: 'Plastilonas Peruanas SAC | Soluciones Textiles Industriales — Fabricación e Importación Directa',
    description: 'Portafolio integral de soluciones textiles industriales en el Perú: big bags, geosintéticos, estructuras y arquitectura textil, mallas, ventilación y lonas a medida. Fabricación propia, instalación e importación directa.',
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
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema antes del primer pintado: sin esto, una carga en
            modo oscuro parpadea en blanco. Debe ser sincrono y estar en <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      {/* bg/text salen de los tokens de globals.css: las utilidades de Tailwind
          (0,1,0) ganaban al selector body (0,0,1) y anulaban .dark */}
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        <StructuredData />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Chatbot />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
              <ExitIntentModal />
      </body>
    </html>
  );
}
