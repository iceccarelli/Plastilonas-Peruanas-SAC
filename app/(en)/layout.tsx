import type { Metadata, Viewport } from 'next';
import { fontClasses } from '@/lib/fonts';
import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import AuthProvider from '@/components/AuthProvider';
import { SITE } from '@/lib/site';

/**
 * Layout raíz del grupo (en) — existe para UNA cosa: que /en sirva
 * <html lang="en"> de verdad. Antes /en heredaba lang="es" del layout global
 * y lo compensaba con un <div lang="en">, que un rastreador respeta a medias
 * y un lector de pantalla a veces ignora. El atributo correcto va en <html>.
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
    default: 'Plastilonas Peruanas SAC',
    template: '%s | Plastilonas',
  },
  metadataBase: new URL(SITE.url),
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClasses} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        <span id="top" aria-hidden="true" />
        <StructuredData />
        <Analytics />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
        <ConsentBanner />
      </body>
    </html>
  );
}
