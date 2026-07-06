import { ImageResponse } from 'next/og';

/**
 * Favicon "PP" con la marca, generado por Next (reemplaza el /favicon.ico
 * inexistente al que apuntaba layout.tsx). Detectado automáticamente y aplicado
 * como icono del sitio en pestañas y accesos directos móviles.
 */

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A2540',
          color: '#10B981',
          fontSize: 18,
          fontWeight: 800,
          borderRadius: 6,
          fontFamily: 'sans-serif',
        }}
      >
        PP
      </div>
    ),
    { ...size }
  );
}
