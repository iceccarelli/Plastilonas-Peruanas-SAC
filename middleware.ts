import { NextRequest, NextResponse } from "next/server";

/**
 * ESTRATEGIA DE DOMINIO — con interruptor, no con fe.
 *
 * El objetivo final es que plastilonas.com sea el único dominio indexable y
 * que el host de Vercel deje de competir. Pero el sitio HOY vive en
 * plastilonas-peruanas-sac.vercel.app: emitir `noindex` en ese host antes de
 * que el DNS de la marca apunte aquí no consolida autoridad, la borra.
 *
 * Por eso el noindex está condicionado a que la migración haya ocurrido de
 * verdad. La señal es CANONICAL_ORIGIN, la misma que lee lib/site.ts para
 * construir canonicals, sitemap y JSON-LD. Mientras esté vacía, este archivo
 * no toca la indexabilidad de nada.
 *
 * EL DÍA DE LA MIGRACIÓN, en Vercel → Settings → Environment Variables:
 *   CANONICAL_ORIGIN = https://plastilonas.com
 * Con esa sola variable, en el mismo despliegue:
 *   · sitemap, canonicals, JSON-LD y llms.txt pasan a plastilonas.com
 *   · www → apex con 308
 *   · el host de Vercel pasa a noindex + Link rel=canonical al dominio bueno
 * Sin esa variable no pasa nada de lo anterior. Ese es el punto.
 *
 * test/dominio.test.ts falla el build si alguien invierte este condicional.
 */
const CANONICAL_HOST = (process.env.CANONICAL_HOST || "plastilonas.com").replace(/^www\./, "");

/** ¿El dominio de marca ya sirve este proyecto? Solo entonces se degrada Vercel. */
export function migracionActiva(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const origin = (env.CANONICAL_ORIGIN || "").trim();
  if (!origin) return false;
  try {
    return new URL(origin).hostname.replace(/^www\./, "") === CANONICAL_HOST;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const url = req.nextUrl.clone();

  const isVercel = host.endsWith(".vercel.app");
  const isWww = host === `www.${CANONICAL_HOST}`;
  const isApex = host === CANONICAL_HOST;
  const migrado = migracionActiva();

  // www → apex. Solo tiene sentido si el dominio ya resuelve aquí.
  if (isWww && migrado) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const res = NextResponse.next();

  // El host de Vercel deja de competir ÚNICAMENTE cuando hay un dominio de
  // marca vivo que pueda recibir esa autoridad. Antes de eso, sería suicidio.
  if (isVercel && migrado) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Link", `<https://${CANONICAL_HOST}${url.pathname}>; rel="canonical"`);
  }

  if (isApex || isVercel) {
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
