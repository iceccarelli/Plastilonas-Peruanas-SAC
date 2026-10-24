import { NextRequest, NextResponse } from "next/server";

import { decidirHost } from "@/lib/site";

/**
 * ESTRATEGIA DE DOMINIO — la política vive en lib/site.ts (`decidirHost`) y
 * aquí sólo se aplica, para que se pueda probar sin levantar Next.
 *
 * Host canónico único: https://www.<marca>. Estados (pendiente → canonico →
 * forzado) y sus invariantes: ver lib/site.ts y docs/mudanza-plastilonas-com.md.
 * Mientras no haya variable, NADA degrada el host vigente; el 308 duro sólo
 * existe con ENFORCE_BRAND_DOMAIN=true, que es una puerta humana (DNS + TLS).
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const decision = decidirHost({
    host: req.headers.get("host") || "",
    protocolo: req.headers.get("x-forwarded-proto"),
    ruta: url.pathname,
    query: url.search,
  });

  if (decision.accion === "redirigir") {
    return NextResponse.redirect(decision.destino, 308);
  }

  const res = NextResponse.next();

  if (decision.accion === "noindex") {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    if (decision.canonica) {
      res.headers.set("Link", `<${decision.canonica}>; rel="canonical"`);
    }
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
