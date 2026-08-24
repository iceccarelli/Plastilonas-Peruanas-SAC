import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.onesignal.com https://grok.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],

    /**
     * PRESUPUESTO DE TRANSFORMACIONES.
     *
     * Cada combinación distinta de (imagen, ancho, calidad) es una
     * transformación que el optimizador ejecuta y que Vercel cuenta. Con los
     * ocho `deviceSizes` por defecto —640, 750, 828, 1080, 1200, 1920, 2048 y
     * 3840— y 459 imágenes, el techo teórico son unas 3.700 sólo para cubrir
     * el catálogo una vez, y se vuelve a pagar en cada despliegue que invalide
     * la caché.
     *
     * Estos seis anchos salen de los `sizes` que el sitio declara de verdad:
     * ninguna imagen se pinta por encima de 900px de ancho CSS, así que 2048 y
     * 3840 nunca se piden salvo en pantallas retina muy grandes, donde 1920 ya
     * basta. Recortar la lista baja el techo a la mitad sin que se vea
     * distinto: el navegador elige el primer ancho que cubra su necesidad.
     *
     * `imageSizes` son los tamaños pequeños —miniaturas de índice, logo, pies
     * de tarjeta— que no deben resolverse contra la lista grande.
     */
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 176, 256, 384],

    /**
     * 31 días. El valor por defecto hace que el optimizador vuelva a
     * transformar la misma imagen mucho antes de que haga falta: estas
     * imágenes son estáticas y cambian sólo cuando se despliega, y un
     * despliegue ya invalida por sí mismo. Alargar la caché no arriesga a
     * servir algo viejo y quita trabajo repetido.
     */
    minimumCacheTTL: 2678400,

    /**
     * Una sola calidad. Next 15 permite declararlas y advierte si se pide una
     * que no está en la lista; fijar una evita que un `quality` suelto en
     * cualquier componente duplique todas las variantes de esa imagen.
     */
    qualities: [75],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
  reactStrictMode: true,
  // El parche P32 traía un segundo hub sectorial en /industrias/[slug] que
  // competía con /industria/[sector] por las mismas consultas. Se eliminó el
  // superficial y se conserva el profundo; estos 301 recogen cualquier enlace
  // o rastreo que ya hubiera visto la ruta antigua. Un 301 transfiere; un 404
  // tira.
  async redirects() {
    return [
      { source: '/industrias', destination: '/industria', permanent: true },
      { source: '/industrias/mineria', destination: '/industria/mineria', permanent: true },
      { source: '/industrias/agricultura', destination: '/industria/agroexportacion', permanent: true },
      { source: '/industrias/construccion', destination: '/industria/construccion', permanent: true },
      { source: '/industrias/infraestructura', destination: '/industria/construccion', permanent: true },
      { source: '/industrias/transporte', destination: '/industria/transporte-logistica', permanent: true },
      { source: '/industrias/logistica', destination: '/industria/transporte-logistica', permanent: true },
      { source: '/industrias/saneamiento', destination: '/industria/saneamiento-y-agua', permanent: true },
      { source: '/industrias/:path*', destination: '/industria', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
