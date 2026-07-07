'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/cart-store';

export default function CheckoutSuccessPage() {
  const clear = useCart((s) => s.clear);

  // El pago se confirma por webhook en el servidor; aquí solo limpiamos el
  // carrito local tras el retorno de Stripe.
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <CheckCircle2 className="w-16 h-16 text-[#059669] mx-auto mb-6" />
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-4">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-lg text-gray-600 max-w-md mx-auto">
        Hemos recibido tu pago. Te enviaremos la confirmación y los detalles de
        entrega por correo electrónico. Nuestro equipo comercial se pondrá en
        contacto para coordinar el envío.
      </p>
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Link
          href="/productos"
          className="inline-block bg-[#0A2540] hover:bg-[#059669] text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
        >
          Seguir comprando
        </Link>
        <Link
          href="/dashboard"
          className="inline-block border border-gray-200 hover:border-[#059669] text-[#0A2540] font-semibold px-8 py-3 rounded-2xl transition-colors"
        >
          Ver mi cuenta
        </Link>
      </div>
    </div>
  );
}
