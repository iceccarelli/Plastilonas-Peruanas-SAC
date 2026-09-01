import localFont from 'next/font/local';

/**
 * FUENTES DEL SITIO — servidas desde nuestro propio dominio.
 *
 * POR QUÉ SE DEJÓ DE PEDÍRSELAS A GOOGLE. Tres razones, en orden de peso:
 *
 *  1. LA COMPILACIÓN DEPENDÍA DE UN TERCERO. Cada `next build` salía a
 *     fonts.googleapis.com. En Codespaces eso imprimía diecisiete
 *     «Retrying 1/3…» y añadía casi un minuto; en un contenedor sin salida a
 *     ese dominio la compilación fallaba directamente, y hubo que inventar un
 *     NEXT_FONT_GOOGLE_MOCKED_RESPONSES para poder verificar. Un sitio cuya
 *     compilación depende de que un servicio ajeno responda no es
 *     reproducible: es afortunado.
 *
 *  2. UNA CONEXIÓN MENOS EN LA RUTA CRÍTICA. Las fuentes ya no salen de otro
 *     origen: viajan por la misma conexión que el HTML, con hash y caché
 *     inmutable. Sobre una conexión móvil peruana, ahorrarse la resolución
 *     DNS y el handshake TLS de un segundo dominio se nota en el LCP, que es
 *     justo lo que la etapa 8 fue a arreglar.
 *
 *  3. SE PUEDE CERRAR LA CSP. `font-src` ya no necesita permitir
 *     fonts.gstatic.com (ver next.config.ts): queda `'self' data:`.
 *
 * QUÉ SE SIRVE, exactamente: los subconjuntos latinos que el sitio usa de
 * verdad —Inter 400/500/600/700, Playfair Display 700 y JetBrains Mono 400—,
 * 148 kB en total. Los archivos vienen de los paquetes @fontsource, que
 * publican los mismos binarios que Google Fonts con licencia SIL OFL.
 *
 * `adjustFontFallback` mantiene el ajuste métrico que hacía el cargador remoto:
 * la fuente de respaldo se escala para que el texto no salte cuando llega la
 * real. Sin eso, self-hostear introduce el CLS que la auditoría acaba de
 * dejar en cero.
 *
 * Se inicializan UNA vez porque hay tres layouts raíz —grupos (es), (en) y
 * (pt), necesarios para que <html lang> diga la verdad—: declararlas en cada
 * layout duplicaría los @font-face.
 */

export const inter = localFont({
  src: [
    { path: '../public/fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const playfair = localFont({
  src: [{ path: '../public/fonts/playfair-display-latin-700-normal.woff2', weight: '700', style: 'normal' }],
  variable: '--font-playfair',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

// Mono para metadatos técnicos (specs, estados, conteos).
export const mono = localFont({
  src: [{ path: '../public/fonts/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
});

export const fontClasses = `${inter.variable} ${playfair.variable} ${mono.variable}`;
