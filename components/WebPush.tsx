'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const REQUIRE_CONSENT = process.env.NEXT_PUBLIC_REQUIRE_CONSENT === 'true';

/**
 * Notificaciones web push (OneSignal). Se activa solo si:
 *  - NEXT_PUBLIC_ONESIGNAL_APP_ID está definido, y
 *  - hay consentimiento (o REQUIRE_CONSENT !== 'true').
 * Sin App ID no carga nada: inerte hasta pegar el ID en Vercel. Requiere el
 * service worker public/OneSignalSDKWorker.js (incluido). El navegador pide su
 * propio permiso de notificaciones, así que nunca notifica sin opt-in explícito.
 */
export default function WebPush() {
  const [allowed, setAllowed] = useState(!REQUIRE_CONSENT);

  useEffect(() => {
    if (!REQUIRE_CONSENT) return;
    const read = () => {
      try {
        setAllowed(localStorage.getItem('pp-consent') === 'granted');
      } catch {
        /* localStorage no disponible */
      }
    };
    read();
    window.addEventListener('pp-consent-change', read);
    return () => window.removeEventListener('pp-consent-change', read);
  }, []);

  if (!APP_ID || !allowed) return null;

  return (
    <>
      <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" />
      <Script id="onesignal-init" strategy="afterInteractive">
        {`window.OneSignalDeferred=window.OneSignalDeferred||[];OneSignalDeferred.push(async function(OneSignal){await OneSignal.init({appId:"${APP_ID}"});});`}
      </Script>
    </>
  );
}
