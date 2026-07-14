import { ImageResponse } from 'next/og';

/**
 * Imagen Open Graph generada dinámicamente (1200x630).
 *
 * Antes, layout.tsx apuntaba a /images/og-image.jpg, un archivo que NO existe
 * en el repositorio. Resultado: al compartir plastilonas.com por WhatsApp o
 * Facebook —el principal canal de difusión B2B en el Perú— no aparecía ninguna
 * vista previa. Next detecta este archivo automáticamente y sirve la imagen en
 * las etiquetas og:image / twitter:image de todo el sitio. Sin binarios, sin
 * dependencias externas, sin fabricar fotos.
 */

export const runtime = 'edge';
export const alt = 'Plastilonas Peruanas SAC — Soluciones textiles industriales a medida';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A2540',
          padding: '72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: 'linear-gradient(90deg, #059669, #10B981)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: '#059669',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            PP
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 22,
              letterSpacing: 4,
              fontWeight: 600,
            }}
          >
            PLASTILONAS PERUANAS SAC
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: 'white',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Soluciones industriales
          </div>
          <div
            style={{
              color: '#34D399',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            de lona y plástico a medida.
          </div>
          <div
            style={{
              marginTop: 26,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 28,
              display: 'flex',
            }}
          >
            Big Bags · Geosintéticos · Estructuras · Mallas · Ventilación · +15 años en el Perú
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 24,
          }}
        >
          <div style={{ display: 'flex' }}>RUC 20523135385 · Chorrillos, Lima</div>
          <div style={{ display: 'flex' }}>WhatsApp +51 946 085 270</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
