import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  FileText,
  MessageCircle,
  Package,
  ArrowRight,
} from 'lucide-react';
import { getSafeSession } from '@/auth';
import SignOutButton from '@/components/SignOutButton';
import SavedQuotes from '@/components/SavedQuotes';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

// La sesión debe evaluarse en cada request, nunca en build.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mi Cuenta',
  description: 'Panel de cliente de Plastilonas Peruanas SAC.',
};

export default async function DashboardPage() {
  const session = await getSafeSession();
  if (!session?.user) redirect('/login');

  const { name, email, image } = session.user;
  const firstName = name?.split(' ')[0] ?? 'cliente';

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          {image ? (
            <Image
              src={image}
              alt={name ?? 'Avatar'}
              width={56}
              height={56}
              className="rounded-2xl"
            />
          ) : (
            <div className="w-14 h-14 bg-[#0A2540] rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter text-[#0A2540]">
              Hola, {firstName}
            </h1>
            <p className="text-gray-500 text-sm">{email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-14">
        <Link
          href="/cotizacion"
          className="group bg-[#0A2540] text-white rounded-3xl p-7 flex flex-col justify-between min-h-[160px] hover:bg-[#059669] transition-colors"
        >
          <FileText className="w-7 h-7 opacity-80" />
          <div>
            <div className="font-semibold text-lg tracking-tight">
              Nueva cotización
            </div>
            <div className="text-sm text-white/70 flex items-center gap-1 mt-1">
              Respuesta en horas hábiles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </Link>

        <Link
          href="/productos"
          className="group bg-white border border-gray-200 hover:border-[#059669] rounded-3xl p-7 flex flex-col justify-between min-h-[160px] transition-all"
        >
          <Package className="w-7 h-7 text-[#059669]" />
          <div>
            <div className="font-semibold text-lg tracking-tight text-[#0A2540]">
              Explorar catálogo
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Big Bags, geomembranas, carpas y más
            </div>
          </div>
        </Link>

        <a
          href={whatsappUrl(
            `Hola, soy ${name ?? 'un cliente registrado'} (${email ?? ''}). Quisiera hacer una consulta.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white border border-gray-200 hover:border-[#059669] rounded-3xl p-7 flex flex-col justify-between min-h-[160px] transition-all"
        >
          <MessageCircle className="w-7 h-7 text-[#059669]" />
          <div>
            <div className="font-semibold text-lg tracking-tight text-[#0A2540]">
              WhatsApp directo
            </div>
            <div className="text-sm text-gray-500 mt-1">{WHATSAPP_DISPLAY}</div>
          </div>
        </a>
      </div>

      {/* Saved quotes (local to this browser) */}
      <SavedQuotes />
    </div>
  );
}
