import { xmlIndice, CABECERAS_XML } from "@/lib/sitemaps";

/**
 * /sitemap.xml — ÍNDICE de sitemaps (antes: un único XML plano en
 * app/sitemap.ts). Cada sección se sirve en /sitemaps/{pages,productos,
 * industrias,recursos}.xml con lastmod real por URL. Ver lib/sitemaps.ts.
 */
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return new Response(xmlIndice(), { headers: CABECERAS_XML });
}
