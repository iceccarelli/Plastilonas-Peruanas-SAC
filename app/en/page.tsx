import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Peruvian industrial textile manufacturer',
  description: SITE.description,
  alternates: { canonical: '/en' },
};

export default function EnglishPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">ENGLISH · PROCUREMENT BRIEF</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Peruvian manufacturer of custom industrial textiles</h1>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Plant in Chorrillos, Lima. Operating since {SITE.foundingYear}. RUC {SITE.ruc}. {COUNT_STATEMENT}.
        Spanish is the primary language of this site. This page exists so an international buyer can
        verify identity and file an RFQ without a machine-translated catalogue.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        We manufacture in Peru. International supply is evaluated per order. We do not offer automatic worldwide shipping.
      </p>
      <p className="mt-6 text-sm">Sales: {SITE.email} · WhatsApp {SITE.phoneWhatsApp}</p>
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">File an RFQ</Link>
    </div>
  );
}
