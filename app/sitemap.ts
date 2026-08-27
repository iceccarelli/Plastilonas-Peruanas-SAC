import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/aplicaciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE.url}/biblioteca`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/proyectos`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compras`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE.url}/calidad`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/socios`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
    { url: `${SITE.url}/configurador`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/compradores`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/exportacion`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE.url}/distribuidores`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/confianza`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/metodo`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/en`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/pt`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/industria`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Indicadores: la única página del sitio que cambia sola. changeFrequency
    // diaria porque es cierto, no porque suene bien.
    { url: `${SITE.url}/indicadores`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    // Centro de documentación: la puerta de "necesito papeles para el expediente".
    { url: `${SITE.url}/descargas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  // Derivados de la fuente de verdad, no de una lista paralela: estos dos
  // arrays estaban escritos a mano con los ocho y los cinco slugs copiados.
  // Añadir una aplicación en lib/applications.ts creaba una página que el
  // sitemap no declaraba, y nadie se enteraba hasta mirar Search Console.
  const applicationRoutes: MetadataRoute.Sitemap = applications.map((a) => ({
    url: `${SITE.url}/aplicaciones/${a.slug}`,
    lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE.url}/biblioteca/${g.slug}`,
    lastModified: new Date(g.revised), changeFrequency: "monthly" as const, priority: 0.75,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  // Glosario: la capa definicional. Prioridad alta en el índice porque es la
  // puerta de entrada de las búsquedas de definición, y media en cada término.
  const glosarioRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/glosario`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t) => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: now, changeFrequency: "yearly" as const, priority: 0.6,
    })),
  ];

  // Informes: evidencia con fuente. lastModified real, no "hoy".
  const informeRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/informes`, lastModified: new Date(INFORMES_UPDATED),
      changeFrequency: "monthly", priority: 0.85 },
    ...informes.map((i) => ({
      url: `${SITE.url}/informes/${i.slug}`,
      lastModified: new Date(i.fecha), changeFrequency: "yearly" as const, priority: 0.75,
    })),
  ];

  // Calculadoras: lastModified es la fecha de revisión del MÉTODO, no "hoy".
  // Declarar cambios diarios en una fórmula que no cambia enseña a los
  // rastreadores a desconfiar del lastModified de todo el sitio.
  const calculadoraRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/calculadoras`, lastModified: new Date(CALCULADORAS_ACTUALIZADO),
      changeFrequency: "monthly", priority: 0.85 },
    ...calculadoras.map((c) => ({
      url: `${SITE.url}/calculadoras/${c.slug}`,
      lastModified: new Date(CALCULADORAS_ACTUALIZADO),
      changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Un hub por sector comprador. `priority` se deja igual que el resto del
  // contenido editorial: Google confirmó hace años que ignora este campo, así
  // que subirlo a 0.9 sería decorar el XML, no priorizar nada.
  const industriaRoutes: MetadataRoute.Sitemap = INDUSTRIAS.map((i) => ({
    url: `${SITE.url}/industria/${i.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...industriaRoutes, ...marcoRoutes, ...calculadoraRoutes, ...informeRoutes, ...glosarioRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...applicationRoutes, ...guideRoutes, ...localRoutes, ...articleRoutes];
}
