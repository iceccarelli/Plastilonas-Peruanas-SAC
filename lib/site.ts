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
 * La mudanza NO se hace editando este archivo. Se hace en tres pasos:
 *
 *   1. DNS: apuntar www.plastilonas.com al proyecto de Vercel (Settings →
 *      Domains; el apex ya redirige 308 a www en la plataforma). TODO(HUMAN).
 *   2. Variable de entorno, en Vercel → Settings → Environment Variables:
 *
 *          NEXT_PUBLIC_CANONICAL_HOST = https://www.plastilonas.com
 *
 *      (CANONICAL_ORIGIN se sigue leyendo por compatibilidad; la nueva gana.
 *      El apex NO es un valor válido: ver `estadoMigracion`.)
 *      Con esa sola variable, en el mismo despliegue y sin tocar código:
 *      · SITE.url pasa a www.plastilonas.com, y con él sitemap, robots,
 *        llms.txt, metadataBase, canonicals, OG y todos los bloques JSON-LD;
 *      · middleware.ts emite noindex + Link rel=canonical en el host de
 *        Vercel, para que deje de competir por las mismas consultas.
 *   3. ENFORCE_BRAND_DOMAIN=true — SOLO tras confirmar que el DNS y el SSL
 *      de www sirven este proyecto: activa la redirección 308 dura de
 *      vercel.app, del apex y de http hacia https://www. Ver `decidirHost`
 *      y docs/HUMAN-GATES.md.
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

/** Dominio de marca (apex). No es canónico: sólo se usa para reconocer la variante. */
const DOMINIO_MARCA = "plastilonas.com";

/**
 * EL host canónico definitivo: www. Decidido por evidencia, no por gusto: en
 * Vercel el proyecto ya tiene `www` como dominio principal y el apex con una
 * redirección 308 de plataforma hacia `www`. Un canónico en el apex haría que
 * este middleware (apex ← www) y Vercel (www ← apex) se redirigieran el uno al
 * otro en bucle, así que un valor apex se RECHAZA en vez de aceptarse.
 */
const HOST_OBJETIVO = `https://www.${DOMINIO_MARCA}`;

type Entorno = Record<string, string | undefined>;

/**
 * ESTADO DE LA MUDANZA — uno solo, explícito, calculado de las variables.
 *
 *  · pendiente: sin variable (o apuntando a otro host). Nada degrada el host
 *    actual: ni noindex ni redirecciones. Estado de producción hoy.
 *  · invalida:  la variable nombra el apex o el dominio de marca con ruta/http.
 *    Se ignora (origen por defecto) y el middleware no hace nada: un valor
 *    ambiguo nunca puede desindexar el sitio.
 *  · canonico:  la variable es el host objetivo. El grafo entero pasa a www y
 *    el host de Vercel emite noindex + Link canonical. Reversible.
 *  · forzado:   canonico + ENFORCE_BRAND_DOMAIN=true (puerta humana: DNS y TLS
 *    de www confirmados). Añade el 308 duro hacia www.
 */
export type EstadoMigracion = "pendiente" | "invalida" | "canonico" | "forzado";

/**
 * NEXT_PUBLIC_CANONICAL_HOST gana; CANONICAL_ORIGIN sólo se lee si esa está
 * vacía (compatibilidad con la configuración anterior de Vercel).
 */
function valorConfigurado(env: Entorno): string {
  return (env.NEXT_PUBLIC_CANONICAL_HOST || env.CANONICAL_ORIGIN || "").trim();
}

function analizarOrigen(env: Entorno): { origen: string; estado: EstadoMigracion; host: string | null } {
  const raw = valorConfigurado(env);
  const defecto = { origen: ORIGEN_POR_DEFECTO, estado: "pendiente" as EstadoMigracion, host: null };
  if (!raw) return defecto;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return defecto;
  }
  if (u.protocol !== "https:") return defecto;
  const host = u.hostname.toLowerCase();
  const esMarca = host === DOMINIO_MARCA || host.endsWith(`.${DOMINIO_MARCA}`);
  if (esMarca) {
    // Sólo se acepta el host objetivo, sin ruta ni credenciales. Cualquier otra
    // variante de marca (apex, subdominios) es una mala configuración.
    const limpio = u.pathname === "/" && !u.search && !u.hash && !u.username && !u.port;
    if (host !== `www.${DOMINIO_MARCA}` || !limpio) {
      return { origen: ORIGEN_POR_DEFECTO, estado: "invalida", host };
    }
    return {
      origen: u.origin,
      estado: env.ENFORCE_BRAND_DOMAIN === "true" ? "forzado" : "canonico",
      host,
    };
  }
  // Otro host https (p. ej. una prueba): se usa como origen pero NO activa la mudanza.
  return { origen: u.origin, estado: "pendiente", host: null };
}

export function estadoMigracion(env: Entorno = process.env): EstadoMigracion {
  return analizarOrigen(env).estado;
}

export function origenCanonico(env: Entorno = process.env): string {
  return analizarOrigen(env).origen;
}

export type DecisionHost =
  | { accion: "ninguna" }
  | { accion: "redirigir"; destino: string }
  | { accion: "noindex"; canonica: string | null };

/**
 * Qué hacer con una petición según host, protocolo y estado de la mudanza.
 * Función pura: el middleware sólo la aplica. Conserva ruta y query.
 *
 *  · Despliegues de previsualización (VERCEL_ENV=preview): siempre noindex y
 *    NUNCA redirección —se prueban en su propio host—. No son el sitio vigente.
 *  · pendiente / invalida: no hacer nada (invariante de test/dominio-migracion).
 *  · canonico: el host *.vercel.app de producción emite noindex + canonical.
 *  · forzado: 308 desde *.vercel.app de producción, desde el apex y desde http
 *    hacia https://www, en un solo salto.
 */
export function decidirHost(
  peticion: { host: string; protocolo?: string | null; ruta: string; query?: string },
  env: Entorno = process.env,
): DecisionHost {
  const host = peticion.host.split(":")[0].toLowerCase();
  const esVercel = host.endsWith(".vercel.app");
  if (esVercel && env.VERCEL_ENV === "preview") {
    return { accion: "noindex", canonica: null };
  }
  const { estado, host: destino } = analizarOrigen(env);
  if ((estado !== "canonico" && estado !== "forzado") || !destino) {
    return { accion: "ninguna" };
  }
  const canonica = `https://${destino}${peticion.ruta}${peticion.query ?? ""}`;
  if (estado === "forzado") {
    const variante = host === DOMINIO_MARCA;
    const sinTls = host === destino && peticion.protocolo === "http";
    if (esVercel || variante || sinTls) {
      return { accion: "redirigir", destino: canonica };
    }
  }
  if (esVercel) return { accion: "noindex", canonica: `https://${destino}${peticion.ruta}` };
  return { accion: "ninguna" };
}

export const SITE = {
  url: origenCanonico(),
  /** Alias legible: host canónico VIGENTE (el que emite canonicals, OG y JSON-LD). */
  canonicalHost: origenCanonico(),
  brandHost: DOMINIO_MARCA,
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

  phoneWhatsApp: "+51924875632",
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
