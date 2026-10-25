import type { Metadata, Viewport } from 'next';
import { fontClasses } from '@/lib/fonts';
import '../globals.css';
import { SITE } from '@/lib/site';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * Layout RAÍZ propio para el enlace de la oferta, a propósito SIN analítica,
 * píxeles, chat, atribución ni barra de navegación del sitio.
 *
 * La URL de la oferta lleva un token de acceso. Si esta página cargara GA4,
 * Meta Pixel o GTM —como cualquier otra del sitio— el token viajaría a esos
 * terceros dentro de page_location, y quien los consulte podría abrir la oferta
 * de otro cliente. Aquí no hay ni un script de terceros.
 */
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export const metadata: Metadata = {
  title: 'Su oferta comercial | Plastilonas',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
  referrer: 'no-referrer',
  // Mismo contrato que los demás layouts: una URL relativa nunca se resuelve contra localhost.
  metadataBase: new URL(SITE.url),
  openGraph: { images: OG_IMAGEN, locale: 'es_PE', type: 'website' },
};

export default function OfertaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={fontClasses}>
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:p-2">
          Saltar al contenido
        </a>
        <main id="contenido" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
