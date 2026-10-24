import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SUPERFICIES_MAQUINA } from "@/lib/superficies-maquina";
import { agentesPermitidos, agentesDeEntrenamientoBloqueados } from "@/lib/ai-crawlers";

/**
 * robots.txt — política de rastreo.
 *
 * 1. Rastreadores clásicos y agentes de IA quedan explícitamente permitidos:
 *    la citabilidad en ChatGPT, Claude, Perplexity y Gemini depende de que el
 *    contenido sea rastreable, no solo indexable.
 * 2. Se bloquean rutas privadas o sin valor de indexación (dashboard, login,
 *    API, carrito, checkout): no aportan señales y diluyen el crawl budget.
 * 3. sitemap y host se derivan de SITE.url — nunca se escribe un dominio a mano.
 */

/** Rutas sin valor de indexación (privadas, transaccionales o de API). */
// /version.json es un endpoint de operación (qué commit sirve el sitio):
// ya va con X-Robots-Tag: noindex, y aquí se evita además el rastreo.
const DISALLOW = ["/dashboard", "/login", "/staff", "/api/", "/carrito", "/checkout", "/oferta/", "/version.json"];

/**
 * Permisos explícitos, no heredados. Las superficies para máquinas
 * (/llms.txt, /ai.txt, /entidad.json y los catálogos JSON) hoy solo están
 * permitidas porque «Allow: /» gana por longitud de coincidencia. Ese es un
 * permiso por accidente: cualquier Disallow futuro más específico las
 * apagaría en silencio, y son exactamente las rutas de las que depende la
 * citabilidad. Se enumeran para que la intención quede escrita en el archivo
 * que los agentes leen primero.
 */
const ALLOW = ["/", ...SUPERFICIES_MAQUINA];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      ...agentesPermitidos().map((userAgent) => ({
        userAgent,
        allow: ALLOW,
        disallow: DISALLOW,
      })),
      // Solo si el propietario lo decide (AI_TRAINING_CRAWLERS=block): los rastreadores
      // de ENTRENAMIENTO quedan fuera; los de búsqueda/respuesta siguen permitidos.
      ...agentesDeEntrenamientoBloqueados().map((userAgent) => ({ userAgent, disallow: ["/"] })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
