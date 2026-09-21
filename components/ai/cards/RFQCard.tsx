import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import type { z } from 'zod';
import type { RFQResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof RFQResponse>;

/**
 * Payload de cotización YA ARMADO por la tool buildRFQ, todavía sin enviar.
 * Este componente NUNCA hace el POST a /api/lead: solo muestra lo que se
 * completó y enlaza a /cotizacion (mismo formulario del sitio, precargado)
 * para que la persona confirme y envíe — nunca un segundo formulario propio.
 */
export default function RFQCard({ payload, readyToSubmit, missingFields, followUp }: Props) {
  const params = new URLSearchParams({ origen: 'asistente' });
  if (payload.slug) params.set('producto', payload.slug);
  else if (payload.producto) params.set('producto', payload.producto);
  if (payload.mensaje) params.set('nota', payload.mensaje);

  return (
    <CardShell accent>
      <CardEyebrow>
        <span className="inline-flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5" /> Solicitud de cotización
        </span>
      </CardEyebrow>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {payload.producto && (
          <>
            <dt className="text-gray-500 dark:text-[var(--text-muted)]">Producto</dt>
            <dd className="text-[#0A2540] dark:text-[var(--text)]">{payload.producto}</dd>
          </>
        )}
        {payload.cantidad && (
          <>
            <dt className="text-gray-500 dark:text-[var(--text-muted)]">Cantidad</dt>
            <dd className="text-[#0A2540] dark:text-[var(--text)]">{payload.cantidad}</dd>
          </>
        )}
        {payload.nombre && (
          <>
            <dt className="text-gray-500 dark:text-[var(--text-muted)]">Nombre</dt>
            <dd className="text-[#0A2540] dark:text-[var(--text)]">{payload.nombre}</dd>
          </>
        )}
        {payload.email && (
          <>
            <dt className="text-gray-500 dark:text-[var(--text-muted)]">Email</dt>
            <dd className="text-[#0A2540] dark:text-[var(--text)]">{payload.email}</dd>
          </>
        )}
      </dl>
      {!readyToSubmit && missingFields.length > 0 && (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
          Aún falta: {missingFields.join(', ')}. Complételo en el formulario de cotización.
        </p>
      )}
      <Link
        href={`/cotizacion?${params.toString()}`}
        className="mt-4 inline-flex items-center justify-center w-full text-sm font-semibold bg-[#0A2540] hover:bg-[#047857] text-white px-4 py-2.5 rounded-2xl transition-colors"
      >
        Revisar y enviar cotización
      </Link>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
