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

/**
 * Formato numérico peruano SIN depender de Intl en tiempo de ejecución.
 *
 * Por qué no `toLocaleString('es-PE')`. Depende de los datos ICU que traiga el
 * Node que ejecute el build. En un entorno con ICU reducido devuelve
 * silenciosamente el formato inglés: el mismo código produjo "-0.7" en un
 * contenedor y "−0,7" en otro. Se detectó mirando la captura de un gráfico, no
 * leyendo el código.
 *
 * En un sitio que publica cifras con fuente, que el separador decimal dependa
 * del contenedor que compiló es inaceptable: la coma y el punto significan
 * cosas distintas, y "1.200" se lee como mil doscientos o como uno coma dos
 * según de dónde sea el lector.
 *
 * Se usa además el signo menos tipográfico (U+2212) y no el guion: es lo
 * correcto en una cifra y se alinea con los dígitos.
 */
export function numeroPE(valor: number, decimales?: number): string {
  const negativo = valor < 0;
  const abs = Math.abs(valor);
  const dec = decimales ?? (Number.isInteger(abs) ? 0 : 1);
  const [entero, fraccion] = abs.toFixed(dec).split('.');
  // Separador de millares: espacio fino, recomendado por el SI y sin la
  // ambigüedad del punto frente a la coma decimal.
  const conMillares = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const cuerpo = fraccion ? `${conMillares},${fraccion}` : conMillares;
  return negativo ? `−${cuerpo}` : cuerpo;
}

/** Igual que numeroPE pero anteponiendo el signo cuando el valor es positivo. */
export function numeroConSigno(valor: number, decimales?: number): string {
  const base = numeroPE(valor, decimales);
  return valor > 0 ? `+${base}` : base;
}
