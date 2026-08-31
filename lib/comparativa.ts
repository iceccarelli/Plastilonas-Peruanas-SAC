import type { Product } from './types';

/**
 * MATRIZ DE COMPARACIÓN — una sola implementación.
 *
 * Vivía dentro de app/(es)/productos/familia/[slug]/comparar/page.tsx. Al
 * necesitarla también en las cuñas comerciales, copiarla habría creado dos
 * tablas con reglas de honestidad que pueden divergir: el día que alguien
 * ajuste el umbral en una, la otra empieza a publicar una matriz con otro
 * criterio bajo la misma marca.
 *
 * LAS DOS REGLAS QUE LA GOBIERNAN, y que se mantienen intactas:
 *
 *  1. Una fila entra solo si AL MENOS DOS productos declaran esa
 *     especificación. Con la unión completa de etiquetas, una familia de
 *     siete líneas producía una tabla de mayoría «No declarado»: técnicamente
 *     honesta e inservible para decidir.
 *  2. Donde un producto no declara la especificación se escribe «No
 *     declarado». Nunca se rellena, nunca se infiere, nunca se copia del
 *     vecino.
 */

export const NO_DECLARADO = 'No declarado';

export interface Comparativa {
  /** Etiquetas que al menos dos productos declaran, en orden de catálogo. */
  filas: string[];
  /** Especificación exclusiva de un producto: diferencia, no hueco. */
  exclusivas: { producto: Product; specs: { label: string; value: string }[] }[];
  /** Valor de una celda, o «No declarado». */
  valor: (slugProducto: string, label: string) => string;
}

export function construirComparativa(items: Product[]): Comparativa {
  const labels: string[] = [];
  for (const p of items) {
    for (const spec of p.specifications) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }

  const cuenta = (label: string) =>
    items.filter((p) => p.specifications.some((s) => s.label === label)).length;

  const filas = labels.filter((l) => cuenta(l) >= 2);

  const exclusivas = items
    .map((producto) => ({
      producto,
      specs: producto.specifications.filter((s) => cuenta(s.label) < 2),
    }))
    .filter((x) => x.specs.length > 0);

  const valor = (slugProducto: string, label: string): string => {
    const p = items.find((x) => x.slug === slugProducto);
    return p?.specifications.find((s) => s.label === label)?.value ?? NO_DECLARADO;
  };

  return { filas, exclusivas, valor };
}
