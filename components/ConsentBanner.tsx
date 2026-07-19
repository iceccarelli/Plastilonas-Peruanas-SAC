'use client';

import { useEffect, useState } from 'react';

const REQUIRE_CONSENT = process.env.NEXT_PUBLIC_REQUIRE_CONSENT === 'true';

/**
 * Banner de consentimiento. Solo aparece si NEXT_PUBLIC_REQUIRE_CONSENT === 'true'
 * y aún no hay decisión guardada. Al decidir, guarda la elección y avisa a
 * <Analytics/> mediante un evento para que cargue (o no) los scripts.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!REQUIRE_CONSENT) return;
    try {
      if (!localStorage.getItem('pp-consent')) setVisible(true);
    } catch {
      /* sin localStorage: no mostramos banner */
    }
  }, []);

  const decide = (choice: 'granted' | 'denied') => {
    try {
      localStorage.setItem('pp-consent', choice);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('pp-consent-change'));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#0A2540] text-white rounded-2xl shadow-2xl border border-white/10 p-5 sm:flex sm:items-center sm:gap-6">
        <p className="text-sm text-white/80 leading-relaxed mb-4 sm:mb-0">
          Usamos cookies de analítica para entender el tráfico y mejorar el sitio. Puede aceptarlas o continuar solo con lo esencial.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => decide('denied')} className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition">
            Solo esencial
          </button>
          <button onClick={() => decide('granted')} className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#047857] hover:bg-[#059669] text-white transition">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
