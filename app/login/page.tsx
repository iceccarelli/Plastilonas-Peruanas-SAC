import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { authConfigured, enabledProviders, getSafeSession } from '@/auth';
import LoginButtons from '@/components/LoginButtons';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

// La sesión debe evaluarse en cada request, nunca en build.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description:
    'Acceda a su cuenta de Plastilonas Peruanas para gestionar sus cotizaciones y solicitudes.',
};

export default async function LoginPage() {
  const session = await getSafeSession();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
          <div className="w-12 h-12 bg-[#0A2540] rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl tracking-tighter">PP</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tighter text-[#0A2540]">
            Portal de clientes
          </h1>
          <p className="mt-2 text-gray-600">
            Acceda para revisar sus solicitudes de cotización y agilizar sus
            próximos pedidos.
          </p>

          <div className="mt-8">
            {authConfigured ? (
              <LoginButtons providers={enabledProviders} />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <p className="font-semibold mb-1">
                  El acceso en línea estará disponible próximamente.
                </p>
                <p>
                  Mientras tanto, nuestro equipo comercial le atiende
                  directamente por WhatsApp con la misma rapidez.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <a
              href={whatsappUrl(
                'Hola, quisiera hacer una consulta sobre sus productos.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-[#059669] hover:text-[#059669] rounded-2xl px-6 py-3.5 font-medium text-gray-700 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Solo usamos su nombre y correo para identificar sus solicitudes.
              No publicamos nada en sus redes sociales.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Solo necesita una cotización rápida?{' '}
          <Link href="/cotizacion" className="text-[#059669] font-medium hover:underline">
            Solicítela sin registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
