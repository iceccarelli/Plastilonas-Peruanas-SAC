'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GTM = process.env.NEXT_PUBLIC_GTM_ID;
const REQUIRE_CONSENT = process.env.NEXT_PUBLIC_REQUIRE_CONSENT === 'true';

/**
 * Carga GA4, Meta Pixel y GTM SOLO cuando corresponde:
 *  - Si NEXT_PUBLIC_REQUIRE_CONSENT !== 'true' → cargan de inmediato.
 *  - Si 'true' → esperan a que el usuario acepte en el banner de consentimiento.
 * Cada script se omite si su ID no está configurado; el sitio compila y funciona
 * sin ninguna clave (los anuncios se activan cuando pega los IDs en Vercel).
 */
export default function Analytics() {
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

  if (!allowed) return null;

  return (
    <>
      {GA4 ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');`}
          </Script>
        </>
      ) : null}

      {PIXEL ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {GTM ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}
        </Script>
      ) : null}
    </>
  );
}
