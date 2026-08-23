'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  emptyFibc,
  fibcSummary,
  FIBC_BOTTOM,
  FIBC_CAPACITY,
  FIBC_EXTRAS,
  FIBC_LOOPS,
  FIBC_SF,
  FIBC_TOP,
} from '@/lib/fibc';

export default function ConfiguradorPage() {
  const [spec, setSpec] = useState(emptyFibc);
  const router = useRouter();

  function toggle(id: string) {
    setSpec((s) => ({
      ...s,
      extras: s.extras.includes(id) ? s.extras.filter((x) => x !== id) : [...s.extras, id],
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(`/cotizacion?producto=big-bags-bolsones-polipropileno&notas=${encodeURIComponent(fibcSummary(spec))}`);
  }

  const selectCls = 'w-full border border-gray-200 rounded-xl px-3 h-11 text-sm';

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">FIBC / BIG BAG</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Configurador de especificación</h1>
      <p className="mt-4 text-gray-600">Arma un resumen para el RFQ. No calcula precio, no emite plano, no certifica UN.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm">Capacidad
          <select className={`${selectCls} mt-1`} value={spec.capacity} onChange={(e) => setSpec((s) => ({ ...s, capacity: e.target.value }))}>
            {FIBC_CAPACITY.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['length', 'width', 'height'] as const).map((k) => (
            <label key={k} className="block text-sm capitalize">{k === 'length' ? 'Largo cm' : k === 'width' ? 'Ancho cm' : 'Alto cm'}
              <input className={`${selectCls} mt-1`} value={spec[k]} onChange={(e) => setSpec((s) => ({ ...s, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-sm">Boca
            <select className={`${selectCls} mt-1`} value={spec.top} onChange={(e) => setSpec((s) => ({ ...s, top: e.target.value }))}>
              {FIBC_TOP.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">Fondo
            <select className={`${selectCls} mt-1`} value={spec.bottom} onChange={(e) => setSpec((s) => ({ ...s, bottom: e.target.value }))}>
              {FIBC_BOTTOM.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">Asas
            <select className={`${selectCls} mt-1`} value={spec.loops} onChange={(e) => setSpec((s) => ({ ...s, loops: e.target.value }))}>
              {FIBC_LOOPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">Factor de seguridad pedido
            <select className={`${selectCls} mt-1`} value={spec.sf} onChange={(e) => setSpec((s) => ({ ...s, sf: e.target.value }))}>
              {FIBC_SF.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="text-sm mb-2">Opciones</legend>
          <div className="flex flex-wrap gap-2">
            {FIBC_EXTRAS.map((x) => (
              <label key={x.id} className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2 text-sm">
                <input type="checkbox" checked={spec.extras.includes(x.id)} onChange={() => toggle(x.id)} />
                {x.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm">Producto a envasar
          <input className={`${selectCls} mt-1`} value={spec.product} onChange={(e) => setSpec((s) => ({ ...s, product: e.target.value }))} />
        </label>
        <label className="block text-sm">Cantidad
          <input className={`${selectCls} mt-1`} value={spec.quantity} onChange={(e) => setSpec((s) => ({ ...s, quantity: e.target.value }))} />
        </label>
        <pre className="bg-[#0A2540] text-white/80 text-xs p-4 rounded-2xl overflow-x-auto whitespace-pre-wrap">{fibcSummary(spec)}</pre>
        <button type="submit" className="btn bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Enviar esta especificación al RFQ</button>
        <p className="text-xs text-gray-500">Cálculo preliminar. No sustituye ficha de lote ni certificación UN.</p>
      </form>
    </div>
  );
}
