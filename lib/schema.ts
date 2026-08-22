/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    // taxID es la propiedad tipada para el identificador fiscal. El
    // identifier/PropertyValue de arriba se mantiene porque nombra el esquema
    // peruano («RUC»), que taxID por sí solo no dice.
    taxID: SITE.ruc,
    // Clasificación industrial: así se declara «fábrica» con vocabulario real
    // (ver la nota en lib/site.ts sobre por qué no existe un tipo Manufacturer).
    isicV4: SITE.isicV4,
    naics: SITE.naics,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    // `manufacturer` es el ÚNICO lugar donde schema.org modela la fabricación,
    // y es una propiedad de Product, no un tipo de Organization. Apunta al
    // nodo de la empresa ya declarado: quien fabrica esto es esta empresa.
    manufacturer: businessRef(),
    ...(offers ? { offers } : {}),
  };
}

/**
 * Glosario como conjunto de términos definidos.
 *
 * DefinedTermSet + DefinedTerm es el tipo que schema.org previó exactamente
 * para esto y que casi nadie usa. Declara que el sitio publica un vocabulario
 * del rubro con una URL estable por concepto: es la forma legible por máquina
 * de decir "acá se define este término", que es justo lo que un agente
 * necesita resolver antes de poder citar a alguien.
 */
export function definedTermSetSchema(set: {
  url: string;
  name: string;
  description: string;
  terms: { slug: string; termino: string; definicionCorta: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${set.url}#glosario`,
    name: set.name,
    description: set.description,
    url: set.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    hasDefinedTerm: set.terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${set.url}/${t.slug}#termino`,
      name: t.termino,
      description: t.definicionCorta,
      url: `${set.url}/${t.slug}`,
      termCode: t.slug,
      inDefinedTermSet: { "@id": `${set.url}#glosario` },
    })),
  };
}

/** Un término del glosario, citable por sí solo. */
export function definedTermSchema(t: {
  url: string;
  setUrl: string;
  termino: string;
  definicionCorta: string;
  termCode: string;
  /** Sigla y otras formas de nombrarlo: ayudan a resolver la desambiguación. */
  alternateNames?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${t.url}#termino`,
    name: t.termino,
    description: t.definicionCorta,
    url: t.url,
    termCode: t.termCode,
    inLanguage: SITE.language,
    inDefinedTermSet: { "@id": `${t.setUrl}#glosario` },
    ...(t.alternateNames?.length ? { alternateName: t.alternateNames } : {}),
  };
}

/**
 * Centro de documentación como catálogo de datos.
 *
 * DataCatalog + DataDownload declara en lenguaje de máquina que este sitio
 * publica documentos y datos descargables, con su formato y su URL. Es la
 * diferencia entre que un agente encuentre los archivos rastreando enlaces y
 * que sepa de antemano qué hay disponible y en qué formato.
 */
export function dataCatalogSchema(cat: {
  url: string;
  name: string;
  description: string;
  downloads: { name: string; description: string; href: string; formato: string }[];
}): Dict {
  const mime: Record<string, string> = {
    pdf: "application/pdf",
    json: "application/json",
    rss: "application/rss+xml",
    txt: "text/plain",
    xml: "application/xml",
  };
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${cat.url}#catalogo-documentos`,
    name: cat.name,
    description: cat.description,
    url: cat.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    // isAccessibleForFree es el dato que decide si un agente se molesta en
    // intentar la descarga: sin muro de registro, se intenta.
    isAccessibleForFree: true,
    dataset: cat.downloads.map((d) => ({
      "@type": "Dataset",
      name: d.name,
      description: d.description,
      url: `${SITE.url}${d.href}`,
      isAccessibleForFree: true,
      creator: organizationRef(),
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${SITE.url}${d.href}`,
        encodingFormat: mime[d.formato] ?? d.formato,
      },
    })),
  };
}

/**
 * Informe con procedencia de datos.
 *
 * Dataset declara que la página publica DATOS con fuente, no solo prosa. Es lo
 * que permite a un agente citar una cifra junto con el organismo que la
 * publica, en lugar de atribuírnosla a nosotros. `isBasedOn` es el campo que
 * hace ese trabajo: dice explícitamente de dónde salió cada número.
 */
export function datasetSchema(d: {
  url: string;
  name: string;
  description: string;
  fecha: string;
  version: string;
  fuentes: { nombre: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${d.url}#dataset`,
    name: d.name,
    description: d.description,
    url: d.url,
    version: d.version,
    datePublished: d.fecha,
    dateModified: d.fecha,
    inLanguage: SITE.language,
    creator: organizationRef(),
    publisher: organizationRef(),
    isAccessibleForFree: true,
    isBasedOn: d.fuentes.map((f) => ({
      "@type": "CreativeWork",
      name: f.nombre,
      url: f.url,
    })),
  };
}

/**
 * Imagen con procedencia declarada.
 *
 * ImageObject permite decir de una imagen algo que el atributo alt no dice:
 * qué representa, quién la publica y si es una fotografía o un esquema. Para
 * un agente que construye un índice visual, esa distinción es la diferencia
 * entre citar un diagrama como esquema y citarlo como evidencia fotográfica.
 */
export function imageObjectSchema(img: {
  url: string;
  ancho: number;
  alto: number;
  alt: string;
  /** Página donde vive la imagen. */
  paginaUrl: string;
  esDiagrama: boolean;
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${img.paginaUrl}#imagen`,
    contentUrl: `${SITE.url}${img.url}`,
    url: `${SITE.url}${img.url}`,
    width: img.ancho,
    height: img.alto,
    caption: img.alt,
    description: img.alt,
    representativeOfPage: true,
    inLanguage: SITE.language,
    creator: organizationRef(),
    // Un esquema no es una fotografía de una obra ejecutada, y conviene que
    // eso viaje con la imagen y no solo en el pie de la página.
    ...(img.esDiagrama
      ? { creditText: `Esquema explicativo de ${SITE.legalName}`, encodingFormat: "image/png" }
      : { creditText: `Imagen referencial de ${SITE.legalName}` }),
  };
}

/**
 * Herramienta de cálculo publicada en el sitio.
 *
 * Por qué SoftwareApplication y no solo HowTo. HowTo describe un
 * procedimiento; esto ADEMÁS es una herramienta que se ejecuta en la página, y
 * declararlo permite que un buscador la presente como tal. Se emiten los dos:
 * el HowTo lleva el método —que es lo citable— y este nodo lleva la
 * herramienta.
 *
 * `isAccessibleForFree` y la ausencia de `offers` no son adorno: una
 * calculadora tras un formulario de captación no es una referencia del rubro,
 * y declararlo gratuito y sin registro es parte de lo que la hace citable.
 */
export function softwareApplicationSchema(app: {
  url: string;
  name: string;
  description: string;
  category?: string;
  /** Lo que la herramienta NO cubre. Va en el nodo, no solo en la página. */
  limitaciones?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${app.url}#herramienta`,
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: app.category ?? "UtilitiesApplication",
    operatingSystem: "Navegador web",
    browserRequirements: "Requiere JavaScript. No requiere registro.",
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    publisher: organizationRef(),
    provider: organizationRef(),
    ...(app.limitaciones && app.limitaciones.length
      ? { disambiguatingDescription: `No cubre: ${app.limitaciones.join(' ')}` }
      : {}),
  };
}
