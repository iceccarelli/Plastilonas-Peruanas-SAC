'use client';

import { useEffect } from 'react';
import { capture } from '@/lib/attribution';

const REQUIRE_CONSENT = process.env.NEXT_PUBLIC_REQUIRE_CONSENT === 'true';

/**
 * Guarda de dónde vino la visita (ver lib/attribution.ts) para adjuntarlo al
 * RFQ. Solo sessionStorage; con consentimiento exigido, solo si fue otorgado.
 */
export default function AttributionCapture() {
  useEffect(() => {
    const run = () => {
      try {
        if (REQUIRE_CONSENT && localStorage.getItem('pp-consent') !== 'granted') return;
        capture(
          { search: location.search, referrer: document.referrer, landingPath: location.pathname, ownHost: location.hostname },
          sessionStorage,
        );
      } catch {
        /* almacenamiento bloqueado */
      }
    };
    run();
    window.addEventListener('pp-consent-change', run);
    return () => window.removeEventListener('pp-consent-change', run);
  }, []);
  return null;
}
