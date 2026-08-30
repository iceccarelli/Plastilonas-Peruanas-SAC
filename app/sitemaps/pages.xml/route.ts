import { xmlDeSeccion, CABECERAS_XML } from "@/lib/sitemaps";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return new Response(xmlDeSeccion("pages"), { headers: CABECERAS_XML });
}
