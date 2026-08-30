import { NextRequest, NextResponse } from "next/server";

/**
 * ESTRATEGIA DE DOMINIO — con interruptor doble, no con fe.
 *
 * El objetivo final es que https://www.plastilonas.com sea el único origen
 * indexable y que el host de Vercel deje de competir. Pero el sitio HOY vive
 * en plastilonas-peruanas-sac.vercel.app: degradar ese host antes de que el
 * DNS de la marca apunte aquí no consolida autoridad, la borra.
 *
 * Dos interruptores, dos niveles de compromiso:
 *
 *  1. NEXT_PUBLIC_CANONICAL_HOST=https://www.plastilonas.com
 *     (o el heredado CANONICAL_ORIGIN). Retargetea TODO el grafo — canonicals,
 *     sitemap índice, OG, JSON-LD, /ai.txt, /llms.txt, /entidad.json — vía
 *     lib/site.ts, y este middleware emite en el host de Vercel
 *     `X-Robots-Tag: noindex` + `Link rel=canonical` al dominio de marca.
 *     Reversible: se borra la variable y todo vuelve.
 *
 *  2. ENFORCE_BRAND_DOMAIN=true — SOLO cuando una persona confirmó que el DNS
 *     y el certificado de www.plastilonas.com sirven este proyecto
 *     (TODO(HUMAN) — ver docs/HUMAN-GATES.md). Convierte la señal suave en
 *     redirección dura: 308 de *.vercel.app (y del apex, si el canónico es
 *     www) hacia el host canónico, ruta y query intactas.
 *
 * Mientras el interruptor 1 esté vacío, NADA degrada la indexabilidad del
 * host actual; mientras el 2 no sea 'true', no hay redirecciones duras.
 * test/dominio-migracion.test.ts protege el primer invariante.
 */
const CANONICAL_HOST = (process.env.CANONICAL_HOST || "plastilonas.com").replace(/^www\./, "");

/** Host canónico completo (con www si el env lo trae), sin protocolo. */
function hostCanonico(env: Record<string, string | undefined> = process.env): string | null {
  const raw = (env.NEXT_PUBLIC_CANONICAL_HOST || env.CANONICAL_ORIGIN || "").trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** ¿El dominio de marca ya sirve este proyecto? Solo entonces se degrada Vercel. */
export function migracionActiva(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const h = hostCanonico(env);
  return h !== null && h.replace(/^www\./, "") === CANONICAL_HOST;
}

/** ¿Redirección dura activada por una persona? (DNS + SSL confirmados). */
export function redireccionDuraActiva(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.ENFORCE_BRAND_DOMAIN === "true" && migracionActiva(env);
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const url = req.nextUrl.clone();

  const isVercel = host.endsWith(".vercel.app");
  const migrado = migracionActiva();
  const destino = hostCanonico(); // p. ej. www.plastilonas.com
  const forzar = redireccionDuraActiva();

  // Redirección dura: vercel.app y la variante de marca no canónica (apex si
  // el canónico es www, o www si el canónico es el apex) → host canónico, 308.
  if (forzar && destino && host !== destino) {
    const esVarianteMarca =
      host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
    if (isVercel || esVarianteMarca) {
      url.hostname = destino;
      url.protocol = "https:";
      url.port = "";
      return NextResponse.redirect(url, 308);
    }
  }

  const res = NextResponse.next();

  // Señal suave: el host de Vercel deja de competir ÚNICAMENTE cuando hay un
  // dominio de marca vivo que pueda recibir esa autoridad. Antes, sería suicidio.
  if (isVercel && migrado && destino) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Link", `<https://${destino}${url.pathname}>; rel="canonical"`);
  }

  {
    // Cabeceras de seguridad también cuando la respuesta viene del middleware
    // (next.config.ts las pone en las respuestas normales).
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images/).*)"],
};
