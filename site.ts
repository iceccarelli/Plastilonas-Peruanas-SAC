/**
 * Single source of truth for business + SEO constants.
 *
 * Everything that emits a URL — sitemap.ts, robots.ts, /llms.txt, metadataBase,
 * canonicals, OG images and every JSON-LD block — MUST read from SITE.url.
 * Never hard-code a domain anywhere else in the codebase.
 *
 * VERIFY every value against official records before a production deploy: a
 * wrong value propagates into structured data, local pages and llms.txt.
 * Do NOT add unverifiable claims (ratings, certifications, statistics) here.
 *
 * Taxonomy note: product families live in lib/products.ts (`productFamilies`),
 * which is the single source of truth for categories. Do not duplicate them here.
 */
export const SITE = {
  /**
   * CRITICAL — CANONICAL ORIGIN.
   * The moment DNS for plastilonas.com (or www.plastilonas.com) points at this
   * Vercel project and the domain is verified in the Vercel dashboard, change
   * this ONE line to the exact final canonical origin (no trailing slash):
   *
   *   url: "https://www.plastilonas.com",
   *
   * Until then it must stay on the live Vercel origin so robots, sitemap,
   * llms.txt and JSON-LD all agree with the URL Google actually crawls.
   */
  url: "https://plastilonas-peruanas-sac.vercel.app",

  // --- Identity (verified against repo contact pages / footer) --------------
  name: "Plastilonas Peruanas SAC",
  legalName: "Plastilonas Peruanas SAC",
  ruc: "20523135385",                   // VERIFY against SUNAT before production
  description:
    "Fabricación e instalación a medida de soluciones textiles industriales en el Perú: big bags FIBC, lonas y cobertores, geomembranas y geosintéticos, estructuras y arquitectura textil, mangas de ventilación minera, mallas agrícolas y accesorios.",

  // --- Contact --------------------------------------------------------------
  /** WhatsApp comercial, formato E.164. Debe coincidir con lib/whatsapp.ts. */
  phoneWhatsApp: "+51946085270",
  /** Central telefónica (footer, navbar, /contacto). */
  phoneCentral: "+51998117065",
  email: "ventas@plastilonas.com",

  // --- Address (footer + /contacto) ----------------------------------------
  addressStreet: "Calle Alameda del Remero Mz. V, Lt. 2, Urb. Los Huertos de Villa",
  addressLocality: "Chorrillos",
  addressRegion: "Lima",
  addressPostalCode: "15067",           // VERIFY before production
  addressCountry: "PE",

  // --- Misc -----------------------------------------------------------------
  foundingYear: "2009",                 // VERIFY against constitución de la empresa
  locale: "es_PE",
  language: "es-PE",
  languages: ["es-PE"] as const,

  /**
   * Perfiles REALES y propios únicamente. Un sameAs vacío es infinitamente
   * mejor que uno inventado: un perfil falso rompe la reconciliación de
   * entidad en Google y en los grafos de conocimiento de los LLMs.
   * Facebook y WhatsApp están marcados como perfiles reales en lib/social.ts.
   */
  sameAs: [
    "https://www.facebook.com/plastilonasperuanas",
  ] as string[],
} as const;

/** Origen canónico sin barra final, para concatenar rutas con seguridad. */
export const BASE_URL: string = SITE.url.replace(/\/$/, "");

/** Construye una URL absoluta a partir de una ruta relativa. */
export function absoluteUrl(path = "/"): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
