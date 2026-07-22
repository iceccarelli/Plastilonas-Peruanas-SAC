/**
 * JSON-LD builders. Only emit fields backed by real data.
 * Never emit Review/AggregateRating unless reviews are genuine and stored,
 * and never emit unverifiable certifications/awards.
 */
import { SITE } from "./site";
type Dict = Record<string, unknown>;

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org", "@type": "Organization",
    name: SITE.name, legalName: SITE.legalName, url: SITE.url, email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: { "@type": "PropertyValue", propertyID: "RUC", value: SITE.ruc },
    address: { "@type": "PostalAddress", addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}
export function localBusinessSchema(): Dict {
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "@id": `${SITE.url}/#localbusiness`, name: SITE.name, url: SITE.url,
    telephone: SITE.phoneWhatsApp, email: SITE.email,
    areaServed: { "@type": "Country", name: "Perú" },
    address: { "@type": "PostalAddress", addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry },
  };
}
export function breadcrumbSchema(items: { name: string; url: string }[]): Dict {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })) };
}
export function faqSchema(qas: { q: string; a: string }[]): Dict {
  return { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: qas.map((x) => ({ "@type": "Question", name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a } })) };
}
export function speakableSchema(cssSelectors: string[]): Dict {
  return { "@context": "https://schema.org", "@type": "WebPage", inLanguage: "es-PE",
    speakable: { "@type": "SpeakableSpecification", cssSelector: cssSelectors } };
}
export function productSchema(p: { name: string; description: string; url: string; image?: string;
  material?: string; priceMin?: number; priceMax?: number; currency?: string; }): Dict {
  const offers = p.priceMin != null ? {
    "@type": "AggregateOffer", priceCurrency: p.currency ?? "PEN", lowPrice: p.priceMin,
    ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: SITE.name },
  } : undefined;
  return { "@context": "https://schema.org", "@type": "Product", name: p.name,
    description: p.description, url: p.url, ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name }, ...(offers ? { offers } : {}) };
}
