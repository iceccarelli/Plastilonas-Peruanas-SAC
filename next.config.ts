import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // AVIF antes que WebP: en dibujos de línea plana como los del glosario
    // pesa entre un 20 y un 30 % menos que WebP con la misma calidad visual.
    // Los PNG de origen se conservan tal cual —41 diagramas a 1200x900— y es
    // Next quien entrega la versión ligera a cada navegador según lo que
    // acepte. Por eso el peso del repositorio y el peso servido son dos cosas
    // distintas: el visitante descarga alrededor de 70 KB, no 470.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Avatares OAuth (dashboard)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
