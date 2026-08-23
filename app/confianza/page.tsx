import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT, YEARS_STATEMENT } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Centro de confianza',
  description: `Identidad verificable de ${SITE.legalName}: RUC, dirección, catálogo y lo que deliberadamente no afirmamos.`,
  alternates: { canonical: '/confianza' },
};

export default function ConfianzaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">TRUST CENTER</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Centro de confianza</h1>
      <dl className="mt-10 space-y-4 text-sm">
        {[
          ['Razón social', SITE.legalName],
          ['RUC', SITE.ruc],
          ['Planta', `${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`],
          ['Antigüedad', YEARS_STATEMENT],
          ['Catálogo', COUNT_STATEMENT],
          ['Email', SITE.email],
          ['Central', SITE.phoneCentral],
          ['WhatsApp', SITE.phoneWhatsApp],
          ['Dominio canónico', SITE.brandHost],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-gray-100 pb-3">
            <dt className="text-xs uppercase tracking-widest text-gray-400">{k}</dt>
            <dd className="mt-1">{v}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 font-semibold text-[#0A2540]">Lo que no publicamos</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
        <li>ISO / ASTM / CE / UL / food-grade sin documento</li>
        <li>Envío mundial o instalación continental</li>
        <li>Rankings autofabricados</li>
        <li>Precios de lista en líneas a medida</li>
        <li>Clientes nominados sin permiso</li>
      </ul>
    </div>
  );
}
