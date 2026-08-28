import ExitIntentModal from '@/components/ExitIntentModal';
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedbackBar from '@/components/FeedbackBar';
import Chatbot from '@/components/Chatbot';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';
import StructuredData from '@/components/StructuredData';
import { SITE } from '@/lib/site';
import Analytics from '@/components/Analytics';
import WebPush from '@/components/WebPush';
import ConsentBanner from '@/components/ConsentBanner';

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

/**
 * VIEWPORT — `viewportFit: 'cover'` es lo que activa las variables
 * env(safe-area-inset-*). Sin él, en un iPhone con muesca girado a horizontal
 * el navegador reserva franjas laterales y el encabezado fijo queda con el
 * contenido pegado al recorte de pantalla; con él, el header puede respetar el
 * área segura (ver components/Navbar.tsx).
 *
 * `maximumScale` y `userScalable` se dejan en sus valores permisivos a
 * propósito: bloquear el zoom rompe la accesibilidad en móvil y es un fallo de
 * WCAG 1.4.4, además de un problema real para un jefe de compras leyendo una
 * ficha técnica en el teléfono.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A2540' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    // El sufijo pasa de 27 caracteres a 14. Medido sobre el HTML generado:
    // 100 de 167 títulos pasaban de 65 caracteres —el punto en el que Google
    // recorta— y el sufijo por sí solo causaba 67 de esos 100. Lo que se
    // recorta es el final del título, así que la marca larga se comía la parte
    // del texto que gana el clic.
    //
    // La razón social exacta no se pierde: vive donde de verdad desambigua la
    // entidad —el JSON-LD, /llms.txt y el pie— que es donde un buscador y un
    // agente la leen. El <title> es un espacio de clic, no un registro legal.
    template: '%s | Plastilonas',
  },
  description: SITE.description,
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
  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.
  metadataBase: new URL(SITE.url),
  // Verificación de propiedad en Search Console y Bing Webmaster Tools.
  // Se emiten SOLO si la variable existe: una meta de verificación vacía o
  // inventada no verifica nada y ensucia el <head>.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    title: 'Plastilonas Peruanas SAC | Soluciones Textiles Industriales — Fabricación e Importación Directa',
    description: 'Portafolio integral de soluciones textiles industriales en el Perú: big bags, geosintéticos, estructuras y arquitectura textil, mallas, ventilación y lonas a medida. Fabricación propia, instalación e importación directa.',
    // og:image lo genera app/opengraph-image.tsx (antes apuntaba a un archivo
    // inexistente /images/og-image.jpg y las vistas previas salían en blanco).
    locale: 'es_PE',
    type: 'website',
  },
  // Favicon y apple-touch-icon estáticos: app/icon.png y app/apple-icon.png
  // (Next los detecta automáticamente).
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
        {/* Feed del registro fechado, declarado en TODO el sitio. Va como JSX
            y no en `metadata.alternates`: cada página declara su propio
            `alternates.canonical`, y Next reemplaza el objeto entero, de modo
            que el enlace del feed desaparecía en todas menos en /novedades. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Novedades — ${SITE.name}`}
          href={`${SITE.url}/novedades/rss.xml`}
        />
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
        {/* Destino del enlace "Volver arriba" del pie: apuntaba a #top y no
            existía ningún elemento con ese id, de modo que no hacía nada. */}
        <span id="top" aria-hidden="true" />
        <StructuredData />
        <Analytics />
        <WebPush />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
            {/* Cierre de página estilo AWS: ¿encontró lo que buscaba? Dentro
                de <main> para que la capa oscura de globals.css lo cubra. */}
            <FeedbackBar />
          </main>
          <Footer />
          <Chatbot />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
              <ExitIntentModal />
        <ConsentBanner />
      </body>
    </html>
  );
}
