'use client';

export default function ImprimirBoton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center rounded border border-gray-400 px-4 py-2 text-sm font-medium print:hidden">
      Imprimir
    </button>
  );
}
