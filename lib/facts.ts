import { SITE } from "./site";
import { productFamilies, products } from "./products";

/** Años de operación. Se recalcula cada 1 de enero. No es un eslogan. */
export const YEARS_OPERATING =
  new Date().getFullYear() - Number(SITE.foundingYear);

/** Única frase de antigüedad permitida en UI, metadata y chatbot. */
export const YEARS_STATEMENT = `Fabricación en el Perú desde ${SITE.foundingYear}`;

export const PRODUCT_COUNT = products.length;
export const FAMILY_COUNT = productFamilies.length;

/**
 * Líneas confeccionadas en la planta de Chorrillos. Antes se recalculaba
 * inline en app/page.tsx y en app/ai.txt/route.ts: misma expresión, dos
 * copias. Una sola derivación, un solo número (hoy: 18 de 36).
 */
export const FABRICACION_PROPIA_COUNT = products.filter(
  (p) => p.sourcing === "fabricacion_propia",
).length;

export const COUNT_STATEMENT = `${PRODUCT_COUNT} soluciones en ${FAMILY_COUNT} líneas de producto`;

/** Cifras de portada y superficies para agentes: 18 / 36 / 11 / 17. */
export const STATS = {
  fabricacionPropia: FABRICACION_PROPIA_COUNT,
  productos: PRODUCT_COUNT,
  familias: FAMILY_COUNT,
  anios: YEARS_OPERATING,
} as const;
