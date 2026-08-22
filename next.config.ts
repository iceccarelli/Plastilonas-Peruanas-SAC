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
