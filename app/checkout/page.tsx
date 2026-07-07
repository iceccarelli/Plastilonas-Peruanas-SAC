'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useCart, cartSubtotal } from '@/lib/cart-store';
import { formatPEN, IGV_RATE } from '@/lib/format';
import { PERU_DEPARTMENTS, type ShippingDetails } from '@/lib/peru';

const EMPTY: ShippingDetails = {
  name: '', email: '', phone: '', ruc: '',
  address: '', district: '', province: '', department: 'Lima',
  reference: '', notes: '',
};

export default function CheckoutPage() {
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<ShippingDetails>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  const set = (k: keyof ShippingDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const requiredOk =
    form.name && form.email && form.phone && form.address && form.district && form.province;

  async function handlePay() {
    setError(null);
    if (!requiredOk) {
      setError('Complete los campos obligatorios (*) para continuar.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'No se pudo iniciar el pago.');
      }
      window.location.href = data.url; // Stripe Checkout hospedado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago.');
      setSubmitting(false);
    }
  }

  if (!mounted) return <div className="max-w-5xl mx-auto px-6 py-20" />;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-[#0A2540] mb-4">Tu carrito está vacío</h1>
        <Link href="/productos" className="inline-block bg-[#0A2540] hover:bg-[#059669] text-white font-semibold px-8 py-3 rounded-2xl transition-colors">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669]';

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link href="/carrito" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al carrito
      </Link>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
        Finalizar compra
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-semibold text-lg text-[#0A2540] mb-4">Datos de contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputCls} placeholder="Nombre completo *" value={form.name} onChange={set('name')} />
              <input className={inputCls} type="email" placeholder="Correo electrónico *" value={form.email} onChange={set('email')} />
              <input className={inputCls} placeholder="Teléfono *" value={form.phone} onChange={set('phone')} />
              <input className={inputCls} placeholder="RUC (para factura, opcional)" value={form.ruc} onChange={set('ruc')} />
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-[#0A2540] mb-4">Dirección de envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={`${inputCls} sm:col-span-2`} placeholder="Dirección (calle, número) *" value={form.address} onChange={set('address')} />
              <input className={inputCls} placeholder="Distrito *" value={form.district} onChange={set('district')} />
              <input className={inputCls} placeholder="Provincia *" value={form.province} onChange={set('province')} />
              <select className={inputCls} value={form.department} onChange={set('department')}>
                {PERU_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input className={inputCls} placeholder="Referencia (opcional)" value={form.reference} onChange={set('reference')} />
              <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder="Notas del pedido (opcional)" value={form.notes} onChange={set('notes')} />
            </div>
          </section>
        </div>

        {/* Resumen + pago */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-7 sticky top-28">
            <h2 className="font-semibold text-lg text-[#0A2540] mb-5">Tu pedido</h2>

            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto">
              {items.map((item) => (
                <div key={item.slug} className="flex justify-between text-sm">
                  <span className="text-gray-600 pr-3">
                    {item.name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="text-[#0A2540] font-medium whitespace-nowrap">
                    {formatPEN(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span className="text-[#0A2540] font-medium">{formatPEN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IGV (18%)</span><span className="text-[#0A2540] font-medium">{formatPEN(igv)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-gray-100 pt-3">
                <span className="font-semibold text-[#0A2540]">Total</span>
                <span className="text-2xl font-semibold text-[#0A2540]">{formatPEN(total)}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              onClick={handlePay}
              disabled={submitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#059669] disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors active:scale-[0.99]"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo…</>
              ) : (
                <>Pagar con tarjeta</>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Pago seguro procesado por Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
