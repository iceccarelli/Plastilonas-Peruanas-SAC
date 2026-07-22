/**
 * Single source of truth for business + SEO constants.
 * VERIFY every value below against official records before deploy — a wrong
 * value propagates into JSON-LD, sitemap, llms.txt and every local page.
 * Do NOT add unverifiable claims (ratings, certifications, statistics) here.
 */
export const SITE = {
  url: "https://plastilonas-peruanas-sac.vercel.app", // swap for custom domain when live
  name: "Plastilonas Peruanas SAC",
  legalName: "Plastilonas Peruanas SAC",
  ruc: "20523135385",              // VERIFY
  phoneWhatsApp: "+51946085270",   // VERIFY
  email: "ventas@plastilonas.com", // VERIFY
  addressLocality: "Chorrillos",
  addressRegion: "Lima",
  addressCountry: "PE",
  foundingYear: "2009",            // VERIFY
  languages: ["es-PE"],
  sameAs: [] as string[],          // add only real owned social profiles
} as const;

export const CATEGORIES = [
  { slug: "lonas-y-cobertores", nombre: "Lonas y Cobertores" },
  { slug: "geosinteticos-e-impermeabilizacion", nombre: "Geosintéticos e Impermeabilización" },
  { slug: "agroplasticos", nombre: "Agroplásticos" },
  { slug: "industriales", nombre: "Productos Industriales" },
] as const;
