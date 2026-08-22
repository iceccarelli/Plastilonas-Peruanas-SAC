import { SITE } from "./site";
import { productFamilies, products } from "./products";

/** Años de operación. Se recalcula cada 1 de enero. No es un eslogan. */
export const YEARS_OPERATING =
  new Date().getFullYear() - Number(SITE.foundingYear);

/** Única frase de antigüedad permitida en UI, metadata y chatbot. */
export const YEARS_STATEMENT = `Fabricación en el Perú desde ${SITE.foundingYear}`;

export const PRODUCT_COUNT = products.length;
export const FAMILY_COUNT = productFamilies.length;

export const COUNT_STATEMENT = `${PRODUCT_COUNT} soluciones en ${FAMILY_COUNT} líneas de producto`;
