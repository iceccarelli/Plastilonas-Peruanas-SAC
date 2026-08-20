import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

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
const DISALLOW = ["/dashboard", "/login", "/api/", "/carrito", "/checkout", "/version.json"];

/** Agentes de IA y buscadores que permitimos de forma explícita. */
const ALLOWED_AGENTS = [
  // Buscadores
  "Googlebot",
  "Bingbot",
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Google (entrenamiento / Gemini)
  "Google-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Otros
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...ALLOWED_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
