/** Utilidades de formato monetario (PEN) y conversión a céntimos. */

export const IGV_RATE = 0.18; // IGV Perú 18%

const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

/** Formatea un monto en soles (número) a "S/ 1,234.00". */
export function formatPEN(amount: number): string {
  return penFormatter.format(amount);
}

/** Formatea un monto en céntimos a texto en soles. */
export function formatCents(cents: number): string {
  return penFormatter.format(cents / 100);
}

/** Convierte soles a céntimos enteros (evita errores de coma flotante). */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Desglosa un subtotal (en céntimos) en IGV y total. */
export function withIgv(subtotalCents: number): {
  subtotalCents: number;
  igvCents: number;
  totalCents: number;
} {
  const igvCents = Math.round(subtotalCents * IGV_RATE);
  return {
    subtotalCents,
    igvCents,
    totalCents: subtotalCents + igvCents,
  };
}
