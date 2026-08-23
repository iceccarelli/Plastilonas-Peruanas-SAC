import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT } from '@/lib/facts';

export const metadata: Metadata = {
  title: 'Fabricante peruano de têxteis industriais',
  description: 'Fábrica em Chorrillos, Lima. Exportação para o Brasil avaliada por RFQ.',
  alternates: { canonical: '/pt' },
};

export default function PortuguesePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">PORTUGUÊS · COMPRADOR BRASILEIRO</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Fabricante peruano de têxteis industriais sob medida</h1>
      <p className="mt-4 text-gray-600 leading-relaxed">
        Fábrica em Chorrillos, Lima. Desde {SITE.foundingYear}. RUC {SITE.ruc}. {COUNT_STATEMENT}.
        O sítio é em espanhol; esta página confirma identidade e abre o RFQ. Não há tabela de preços em BRL.
      </p>
      <p className="mt-6 text-sm">Vendas: {SITE.email} · WhatsApp {SITE.phoneWhatsApp}</p>
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Abrir RFQ</Link>
    </div>
  );
}
