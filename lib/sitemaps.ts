import { SITE } from "@/lib/site";
import { products, CATALOGO_ACTUALIZADO } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";
import { terminos } from "@/lib/glosario";
import { informes, INFORMES_UPDATED } from "@/lib/informes";
import { calculadoras, CALCULADORAS_ACTUALIZADO } from "@/lib/calculadoras";
import { INDUSTRIAS } from "@/lib/industrias";
import { applications } from "@/lib/applications";
import { guides } from "@/lib/guides";
import { SUPERFICIES_INDEXABLES } from "@/lib/superficies-maquina";
import { cunas } from "@/lib/cunas";

/**
 * SITEMAPS — índice + cuatro secciones, con lastmod REAL.
 *
 * Antes app/sitemap.ts emitía un único XML con ~250 URLs y `new Date()` como
 * lastModified de casi todas: 218 URLs con el mismo timestamp en cada deploy.
 * Un lastmod que dice «hoy» siempre enseña a Googlebot y Bingbot a ignorar el
 * campo en todo el sitio, incluidas las secciones donde sí es un dato honesto
 * (novedades, informes, artículos).
 *
 * Ahora:
 *  · /sitemap.xml es un ÍNDICE que apunta a cuatro sitemaps por tipo de
 *    contenido: pages / productos / industrias / recursos. Se depuran por
 *    separado en Search Console (¿qué sección no se indexa? se ve al minuto).
 *  · Cada URL declara la fecha del último cambio REAL de su contenido: la
 *    fecha del dato (artículos, novedades, informes, guías, legal) o la
 *    constante de revisión de su fuente (catálogo, industrias, páginas).
 *
 * REGLA DE MANTENIMIENTO: si edita el contenido de una sección estática, suba
 * la fecha correspondiente en ACTUALIZADO. test/descubribilidad.test.ts vigila
 * que las URLs sigan derivándose de lib/, no de una lista a mano.
 */

/** Fechas de última revisión editorial por bloque estático (YYYY-MM-DD). */
export const ACTUALIZADO = {
  /** Portada y páginas institucionales (hero, orden de secciones, copy). */
  paginas: "2026-08-30",
  /** Hubs de sector (/industria/*) y cobertura local (/local/*). */
  industrias: "2026-08-30",
  /** Glosario: fecha de la última revisión del conjunto de términos. */
  glosario: "2026-08-30",
} as const;

export interface EntradaSitemap {
  url: string;
  lastModified: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

const d = (iso: string) => new Date(iso);

/* ────────────────────────── sección: pages ─────────────────────────── */

export function seccionPaginas(): EntradaSitemap[] {
  const paginas = d(ACTUALIZADO.paginas);
  const estaticas: EntradaSitemap[] = [
    { url: `${SITE.url}/`, lastModified: paginas, changeFrequency: "weekly", priority: 1 },
    // Las tres cuñas comerciales (lib/cunas.ts): las páginas que el sitio
    // quiere que contesten «lona camión», «manga ventilación» y «big bags».
    ...cunas.map((c): EntradaSitemap => ({
      url: `${SITE.url}/${c.slug}`,
      lastModified: paginas,
      changeFrequency: "monthly",
      priority: 0.9,
    })),
    { url: `${SITE.url}/servicios`, lastModified: paginas, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: paginas, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: paginas, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: paginas, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/proyectos`, lastModified: paginas, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compras`, lastModified: paginas, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE.url}/calidad`, lastModified: paginas, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/socios`, lastModified: paginas, changeFrequency: "monthly", priority: 0.55 },
    { url: `${SITE.url}/configurador`, lastModified: paginas, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compradores`, lastModified: paginas, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/exportacion`, lastModified: paginas, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE.url}/distribuidores`, lastModified: paginas, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/confianza`, lastModified: paginas, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/metodo`, lastModified: paginas, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/en`, lastModified: paginas, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/pt`, lastModified: paginas, changeFrequency: "monthly", priority: 0.6 },
    // Indicadores: la única página que cambia sola; su lastmod diario es cierto.
    { url: `${SITE.url}/indicadores`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/descargas`, lastModified: paginas, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/privacidad`, lastModified: d(LEGAL_UPDATED), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: d(LEGAL_UPDATED), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Superficies para máquinas indexables. /llms-full.txt NO va: es noindex con
  // canónica en /llms.txt, y declarar en el sitemap una URL noindex es
  // contradecirse. Cambian cuando cambia el catálogo, y esa fecha existe.
  const maquinas: EntradaSitemap[] = SUPERFICIES_INDEXABLES.map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: d(CATALOGO_ACTUALIZADO),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...estaticas, ...maquinas];
}

/* ───────────────────────── sección: productos ──────────────────────── */

export function seccionProductos(): EntradaSitemap[] {
  const catalogo = d(CATALOGO_ACTUALIZADO);
  return [
    { url: `${SITE.url}/productos`, lastModified: catalogo, changeFrequency: "weekly", priority: 0.9 },
    ...familyContent.map((f): EntradaSitemap => ({
      url: `${SITE.url}/productos/familia/${f.slug}`,
      lastModified: catalogo, changeFrequency: "monthly", priority: 0.85,
    })),
    ...comparableFamilies().map((f): EntradaSitemap => ({
      url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
      lastModified: catalogo, changeFrequency: "monthly", priority: 0.7,
    })),
    ...products.map((p): EntradaSitemap => ({
      url: `${SITE.url}/productos/${p.slug}`,
      lastModified: catalogo, changeFrequency: "monthly", priority: 0.8,
    })),
  ];
}

/* ───────────────────────── sección: industrias ─────────────────────── */

export function seccionIndustrias(): EntradaSitemap[] {
  const fecha = d(ACTUALIZADO.industrias);
  return [
    { url: `${SITE.url}/industria`, lastModified: fecha, changeFrequency: "monthly", priority: 0.8 },
    ...INDUSTRIAS.map((i): EntradaSitemap => ({
      url: `${SITE.url}/industria/${i.slug}`,
      lastModified: fecha, changeFrequency: "monthly", priority: 0.8,
    })),
    { url: `${SITE.url}/aplicaciones`, lastModified: fecha, changeFrequency: "monthly", priority: 0.85 },
    ...applications.map((a): EntradaSitemap => ({
      url: `${SITE.url}/aplicaciones/${a.slug}`,
      lastModified: fecha, changeFrequency: "monthly", priority: 0.8,
    })),
    { url: `${SITE.url}/soluciones`, lastModified: fecha, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s): EntradaSitemap => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: fecha, changeFrequency: "monthly", priority: 0.8,
    })),
    { url: `${SITE.url}/local`, lastModified: fecha, changeFrequency: "monthly", priority: 0.7 },
    ...(ciudades as { slug: string }[]).map((c): EntradaSitemap => ({
      url: `${SITE.url}/local/${c.slug}`,
      lastModified: fecha, changeFrequency: "monthly", priority: 0.7,
    })),
  ];
}

/* ────────────────────────── sección: recursos ──────────────────────── */

export function seccionRecursos(): EntradaSitemap[] {
  return [
    { url: `${SITE.url}/recursos`, lastModified: ultimaFecha(articles.map((a) => a.dateModified)), changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a): EntradaSitemap => ({
      url: `${SITE.url}/recursos/${a.slug}`,
      lastModified: d(a.dateModified), changeFrequency: "monthly", priority: 0.7,
    })),
    { url: `${SITE.url}/biblioteca`, lastModified: ultimaFecha(guides.map((g) => g.revised)), changeFrequency: "monthly", priority: 0.8 },
    ...guides.map((g): EntradaSitemap => ({
      url: `${SITE.url}/biblioteca/${g.slug}`,
      lastModified: d(g.revised), changeFrequency: "monthly", priority: 0.75,
    })),
    { url: `${SITE.url}/marco`, lastModified: d(FRAMEWORK_UPDATED), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: d(FRAMEWORK_UPDATED), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/calculadoras`, lastModified: d(CALCULADORAS_ACTUALIZADO), changeFrequency: "monthly", priority: 0.85 },
    ...calculadoras.map((c): EntradaSitemap => ({
      url: `${SITE.url}/calculadoras/${c.slug}`,
      lastModified: d(CALCULADORAS_ACTUALIZADO), changeFrequency: "monthly", priority: 0.8,
    })),
    { url: `${SITE.url}/informes`, lastModified: d(INFORMES_UPDATED), changeFrequency: "monthly", priority: 0.85 },
    ...informes.map((i): EntradaSitemap => ({
      url: `${SITE.url}/informes/${i.slug}`,
      lastModified: d(i.fecha), changeFrequency: "yearly", priority: 0.75,
    })),
    { url: `${SITE.url}/glosario`, lastModified: d(ACTUALIZADO.glosario), changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t): EntradaSitemap => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: d(ACTUALIZADO.glosario), changeFrequency: "yearly", priority: 0.6,
    })),
    { url: `${SITE.url}/novedades`, lastModified: d(NOVEDADES_UPDATED), changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n): EntradaSitemap => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: d(n.fecha), changeFrequency: "yearly", priority: 0.5,
    })),
  ];
}

function ultimaFecha(isos: string[]): Date {
  return new Date(Math.max(...isos.map((i) => new Date(i).getTime())));
}

/* ─────────────────────────── índice y XML ──────────────────────────── */

export const SECCIONES = {
  pages: seccionPaginas,
  productos: seccionProductos,
  industrias: seccionIndustrias,
  recursos: seccionRecursos,
} as const;

export type NombreSeccion = keyof typeof SECCIONES;

/**
 * El sitio completo, en el mismo formato que devolvía app/sitemap.ts.
 * Lo consumen las pruebas (una URL declarada = una página que existe) y
 * cualquier script que quiera el universo de URLs.
 */
export default function sitemapCompleto(): EntradaSitemap[] {
  return [
    ...seccionPaginas(),
    ...seccionProductos(),
    ...seccionIndustrias(),
    ...seccionRecursos(),
  ];
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function xmlDeSeccion(nombre: NombreSeccion): string {
  const filas = SECCIONES[nombre]()
    .map((e) => {
      const partes = [
        `<loc>${escapeXml(e.url)}</loc>`,
        `<lastmod>${e.lastModified.toISOString().slice(0, 10)}</lastmod>`,
        e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : "",
        e.priority != null ? `<priority>${e.priority}</priority>` : "",
      ].filter(Boolean);
      return `<url>${partes.join("")}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filas}\n</urlset>\n`;
}

export function xmlIndice(): string {
  const filas = (Object.keys(SECCIONES) as NombreSeccion[])
    .map((nombre) => {
      const entradas = SECCIONES[nombre]();
      const ultimo = new Date(
        Math.max(...entradas.map((e) => e.lastModified.getTime())),
      );
      return `<sitemap><loc>${SITE.url}/sitemaps/${nombre}.xml</loc><lastmod>${ultimo
        .toISOString()
        .slice(0, 10)}</lastmod></sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filas}\n</sitemapindex>\n`;
}

export const CABECERAS_XML = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
} as const;
