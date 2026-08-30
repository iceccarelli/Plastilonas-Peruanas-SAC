/**
 * Single source of truth for business + SEO constants.
 *
 * Everything that emits a URL — sitemap.ts, robots.ts, /llms.txt, metadataBase,
 * canonicals, OG images and every JSON-LD block — MUST read from SITE.url.
 * Never hard-code a domain anywhere else in the codebase.
 * test/dominio.test.ts falla el build si alguien escribe un host a mano.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ORIGEN CANÓNICO — cómo se hace la mudanza a plastilonas.com
 * ─────────────────────────────────────────────────────────────────────────────
 * El sitio se sirve hoy desde plastilonas-peruanas-sac.vercel.app. El dominio
 * de marca, plastilonas.com, ya es propiedad de la empresa y sirve el correo
 * (ventas@plastilonas.com) pero todavía apunta al sitio antiguo.
 *
 * La mudanza NO se hace editando este archivo. Se hace en dos pasos:
 *
 *   1. DNS: apuntar plastilonas.com al proyecto de Vercel y verificar el
 *      dominio en el panel (Settings → Domains).
 *   2. Variable de entorno, en Vercel → Settings → Environment Variables:
 *
 *          CANONICAL_ORIGIN = https://plastilonas.com
 *
 * Con esa sola variable, en el mismo despliegue y sin tocar código:
 *   · SITE.url pasa a plastilonas.com, y con él sitemap, robots, llms.txt,
 *     metadataBase, todos los canonicals y todos los bloques JSON-LD;
 *   · middleware.ts empieza a redirigir www → apex con 308;
 *   · middleware.ts empieza a emitir noindex + Link rel=canonical en el host
 *     de Vercel, para que deje de competir por las mismas consultas.
 *
 * MIENTRAS LA VARIABLE ESTÉ VACÍA no ocurre nada de lo anterior, y eso es
 * deliberado: emitir noindex en el host de Vercel antes de que exista un
 * dominio de marca vivo que reciba esa autoridad no consolidaría nada, borraría
 * el sitio de Google. test/dominio-migracion.test.ts protege ese invariante.
 */
/**
 * EL ORIGEN CANÓNICO NO LO DECIDE UNA VARIABLE DE STRIPE.
 *
 * Este fallback leía `NEXT_PUBLIC_SITE_URL` en segundo lugar, y esa variable
 * existe para OTRA cosa: construir las URLs de retorno de Stripe. `.env.example`
 * la trae puesta a `http://localhost:3000` con ese propósito escrito al lado.
 *
 * El día que alguien active pagos siguiendo ese archivo y la copie a Vercel, el
 * sitio entero pasa a publicar canónicos, sitemap, robots (Host y Sitemap), OG,
 * llms.txt y los cuatro nodos de JSON-LD apuntando a localhost. Y no lo avisa
 * nada: `migracionActiva()` sólo mira CANONICAL_ORIGIN, así que el middleware
 * no se entera, y el daño es el mismo que el del interruptor de dominio pero
 * sin ninguna de sus protecciones — se pisa haciendo otra cosa.
 *
 * Ahora sólo CANONICAL_ORIGIN puede mover el origen, que es la variable que
 * lib/site.ts y middleware.ts documentan como el interruptor de la mudanza. Y
 * se rechaza cualquier valor que no sea https, para que un http:// pegado por
 * error no emita canónicos inseguros.
 */
const ORIGEN_POR_DEFECTO = "https://plastilonas-peruanas-sac.vercel.app";

/**
 * Host canónico objetivo de la mudanza. NO es el host vigente: el vigente lo
 * decide la variable de entorno. Documentado aquí para que middleware, /confianza
 * y docs/mudanza hablen del mismo destino.
 */
const HOST_OBJETIVO = "https://www.plastilonas.com";

function originFromEnv(): string {
  // NEXT_PUBLIC_CANONICAL_HOST es el interruptor documentado de la mudanza
  // (visible también en el cliente). CANONICAL_ORIGIN se mantiene por
  // compatibilidad con la configuración anterior de Vercel.
  const raw = (
    process.env.NEXT_PUBLIC_CANONICAL_HOST ||
    process.env.CANONICAL_ORIGIN ||
    ""
  ).trim();
  if (!raw) return ORIGEN_POR_DEFECTO;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return ORIGEN_POR_DEFECTO;
    return raw.replace(/\/$/, "");
  } catch {
    return ORIGEN_POR_DEFECTO;
  }
}

export const SITE = {
  url: originFromEnv(),
  /** Alias legible: host canónico VIGENTE (el que emite canonicals, OG y JSON-LD). */
  canonicalHost: originFromEnv(),
  brandHost: "plastilonas.com",
  /** Destino de la mudanza de dominio. Solo informativo hasta que el env lo active. */
  targetHost: HOST_OBJETIVO,

  name: "Plastilonas Peruanas SAC",
  legalName: "Plastilonas Peruanas SAC",
  ruc: "20523135385",
  /**
   * Descripción de reserva del sitio. La usan /en, la página de error y varias
   * etiquetas Open Graph, así que tiene que caber en el resultado de búsqueda:
   * 155 caracteres. La versión anterior enumeraba las siete familias y llegaba
   * a 225, de modo que Google cortaba justo en «mangas de ventilación mine…».
   */
  description:
    "Fabricante peruano de textil industrial a medida: big bags FIBC, lonas y cobertores, geosintéticos, estructuras, ventilación minera y mallas agrícolas.",

  phoneWhatsApp: "+51946085270",
  phoneCentral: "+51998117065",
  email: "ventas@plastilonas.com",

  addressStreet: "Calle Alameda del Remero Mz. V, Lt. 2, Urb. Los Huertos de Villa",
  addressLocality: "Chorrillos",
  addressRegion: "Lima",
  addressPostalCode: "15067",
  addressCountry: "PE",

  /**
   * CLASIFICACIÓN INDUSTRIAL — la forma correcta de decir «somos fábrica».
   *
   * schema.org NO tiene un tipo `Manufacturer`: los subtipos de Organization
   * son Airline, Corporation, LocalBusiness, NGO y una veintena más, y ninguno
   * es ese. `manufacturer` existe, pero como PROPIEDAD de Product apuntando a
   * una Organization —que es como ya se emite en ProductStructuredData—.
   * Declarar `"@type": ["Organization", "Manufacturer"]` no refuerza nada:
   * introduce un tipo inexistente en el nodo raíz de la empresa.
   *
   * Lo que sí está tipado en Organization y sí se lee: `naics` e `isicV4`.
   * Son códigos de clasificación industrial oficiales; dicen «fabricación de
   * productos de plástico» sin ambigüedad y sin inventar vocabulario.
   */
  /** CIIU/ISIC Rev.4 2220 — Fabricación de productos de plástico. VERIFY contra la ficha RUC. */
  isicV4: "2220",
  /** NAICS 326199 — All Other Plastics Product Manufacturing. Equivalente norteamericano. */
  naics: "326199",

  // --- Misc -----------------------------------------------------------------
  foundingYear: "2009",                 // VERIFY against constitución de la empresa
  locale: "es_PE",
  language: "es-PE",
  languages: ["es-PE", "en", "pt-BR"] as const,

  sameAs: [
    "https://www.facebook.com/plastilonasperuanas",
    "https://www.linkedin.com/company/plastilonas-peruanas-sac",
  ] as string[],
};

/**
 * HORARIO COMERCIAL — fuente única.
 *
 * Estaba escrito a mano en cuatro sitios (barra superior, /contacto, la
 * portada y el prompt del chatbot), en cuatro redacciones distintas. Cuatro
 * copias del mismo dato son cuatro horarios que pueden divergir, y un agente
 * que lea dos horarios distintos para el mismo RUC inventa una segunda sede.
 * Header, pie, /contacto, chatbot, /llms.txt y /ai.txt derivan de aquí.
 */
export const HORARIO = {
  /** Para barras y chips: cabe en una línea de utilitario. */
  corto: "L–V 8:00–18:00 · Sáb 8:00–13:00",
  /** Para prosa: páginas, prompt del chatbot y superficies para agentes. */
  completo: "lunes a viernes de 8:00 a 18:00 y sábados de 8:00 a 13:00",
  /** Para la tarjeta de la portada, que separa «L–V» del detalle. */
  tarjeta: "8:00–18:00 · sábados 8:00–13:00",
} as const;

/**
 * TELÉFONOS — presentación única.
 *
 * El E.164 vive en SITE.phoneCentral / SITE.phoneWhatsApp. Todo lo demás
 * (href `tel:`, texto visible «+51 998 117 065», número del enlace de WhatsApp) se DERIVA
 * aquí. Ningún componente debe volver a escribir un número a mano: ocho
 * archivos lo hacían y cualquier corrección dejaba siete copias viejas.
 */
function displayPhone(e164: string): string {
  const m = e164.match(/^\+51(\d{3})(\d{3})(\d{3})$/);
  return m ? `+51 ${m[1]} ${m[2]} ${m[3]}` : e164;
}

export const TELEFONOS = {
  central: {
    e164: SITE.phoneCentral,
    tel: `tel:${SITE.phoneCentral}`,
    display: displayPhone(SITE.phoneCentral),
  },
  whatsapp: {
    e164: SITE.phoneWhatsApp,
    /** Número para el enlace de WhatsApp: E.164 sin el signo +. */
    waNumber: SITE.phoneWhatsApp.replace(/^\+/, ""),
    display: displayPhone(SITE.phoneWhatsApp),
  },
} as const;

export const BASE_URL: string = SITE.url.replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
