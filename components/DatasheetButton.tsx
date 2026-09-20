'use client';

import { FileDown } from 'lucide-react';
import { trackDocumentDownload } from '@/lib/analytics';

/**
 * Descarga de la ficha técnica, con evento de conversión.
 *
 * Descargar una ficha es una señal de intención mucho más fuerte que una visita:
 * quien se lleva el PDF suele estar armando un expediente de compra. Sin el
 * evento `document_download` esa señal se pierde y no se puede comparar el
 * rendimiento de las fichas entre familias.
 */
export default function DatasheetButton({
  slug,
  nombre,
  className,
}: {
  slug: string;
  nombre: string;
  className?: string;
}) {
  return (
    <a
      href={`/productos/${slug}/ficha-tecnica.pdf`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackDocumentDownload(`ficha-tecnica:${slug}`, slug)}
      /* El defecto pasa al sistema `.btn`: mismo alto, mismo radio y mismo
         hundimiento al pulsar que el resto de acciones de la ficha. Quien
         pase `className` sigue mandando. */
      className={className ?? 'btn btn-lg btn-ghost w-full sm:w-auto font-medium'}
    >
      <FileDown className="w-4 h-4" /> Descargar ficha técnica (PDF)
    </a>
  );
}
