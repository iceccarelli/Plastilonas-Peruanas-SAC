import { SITE } from '@/lib/site';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';

/**
 * Datos estructurados JSON-LD globales (schema.org).
 *
 * Regla de dominio: TODO (@id, url, image, logo) se deriva de SITE.url. Nunca
 * se escribe un dominio a mano — un @id que no coincide con el origen que
 * Google rastrea rompe la reconciliación de entidad y desperdicia las señales.
 *
 * Regla de honestidad: solo datos REALES ya verificables en el sitio (razón
 * social, RUC, dirección, teléfonos, email, perfiles propios). No se declaran
 * reseñas, calificaciones, horarios ni certificaciones sin respaldo: además de
 * ser fabricación, invalida el rich result cuando Google no puede verificarlo.
 *
 * Se emiten tres bloques enlazados por @id:
 *  - LocalBusiness  → panel de negocio local ("plastilonas lima", "big bags perú")
 *  - Organization   → nodo de entidad reutilizable (publisher, sameAs, taxID)
 *  - WebSite        → sitelinks searchbox apuntando al buscador real de /productos
 */
export default function StructuredData() {
  const base = SITE.url;

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: base,
    logo: {
      '@type': 'ImageObject',
      '@id': `${base}/#logo`,
      url: `${base}/logo.png`,
      contentUrl: `${base}/logo.png`,
      caption: SITE.name,
    },
    image: { '@id': `${base}/#logo` },
    taxID: SITE.ruc,
    vatID: SITE.ruc,
    email: SITE.email,
    telephone: SITE.phoneCentral,
    foundingDate: SITE.foundingYear,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    areaServed: { '@type': 'Country', name: 'Perú' },
    sameAs: SITE.sameAs,
  };

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${base}/#business`,
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: base,
    image: `${base}/opengraph-image`,
    logo: `${base}/logo.png`,
    telephone: SITE.phoneWhatsApp,
    email: SITE.email,
    taxID: SITE.ruc,
    foundingDate: SITE.foundingYear,
    parentOrganization: { '@id': `${base}/#organization` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    areaServed: { '@type': 'Country', name: 'Perú' },
    currenciesAccepted: 'PEN',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: SITE.phoneWhatsApp,
        availableLanguage: ['Spanish'],
        areaServed: 'PE',
        name: `WhatsApp comercial ${WHATSAPP_DISPLAY}`,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: SITE.phoneCentral,
        availableLanguage: ['Spanish'],
        areaServed: 'PE',
        name: 'Central telefónica',
      },
    ],
    knowsAbout: [
      'Big Bags FIBC',
      'Sacos y envases industriales de polipropileno',
      'Lonas plastificadas y cobertores a medida',
      'Geomembranas de PVC y HDPE',
      'Geotextiles y geomallas',
      'Carpas industriales y arquitectura textil',
      'Mangas de ventilación para minería y túneles',
      'Mallas antiáfidas y mallas Raschel',
      'Impermeabilización de pozas, canales y rellenos',
    ],
    knowsLanguage: ['es-PE'],
    sameAs: SITE.sameAs,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: base,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': `${base}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/productos?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
