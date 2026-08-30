/**
 * Fuentes del sitio — módulo único.
 *
 * Con tres layouts raíz (grupos (es), (en) y (pt), necesarios para que
 * <html lang> diga la verdad en cada idioma), inicializar next/font en cada
 * layout duplicaría los @font-face. Aquí se inicializan una vez y cada layout
 * importa las mismas instancias.
 */
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});

// Mono para metadatos técnicos (specs, estados, conteos).
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontClasses = `${inter.variable} ${playfair.variable} ${mono.variable}`;
