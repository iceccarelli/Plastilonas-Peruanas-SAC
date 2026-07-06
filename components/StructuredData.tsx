import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/whatsapp';

/**
 * Datos estructurados JSON-LD (schema.org) para SEO local.
 *
 * Solo se declaran datos REALES ya presentes en el repositorio: razón social,
 * RUC, ubicación (Chorrillos, Lima), y el WhatsApp comercial. No se inventan
 * reseñas, calificaciones, horarios ni certificaciones — eso sería fabricación
 * y además rompería el rich result de Google si no se puede verificar.
 *
 * Esto habilita el panel de negocio local en Google para búsquedas como
 * "plastilonas lima", "fabricante big bags perú", etc.
 */
export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.plastilonas.com/#business',
    name: 'Plastilonas Peruanas SAC',
    description:
      'Fabricación a medida de Big Bags, geomembranas de PVC, carpas industriales con estructura metálica, mangas de ventilación, mallas agrícolas y lonas plastificadas para minería, agricultura, construcción y transporte en el Perú.',
    url: 'https://www.plastilonas.com',
    image: 'https://www.plastilonas.com/opengraph-image',
    telephone: `+${WHATSAPP_NUMBER}`,
    taxID: '20523135385',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chorrillos',
      addressRegion: 'Lima',
      addressCountry: 'PE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Perú',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: `+${WHATSAPP_NUMBER}`,
      availableLanguage: ['Spanish'],
      name: `WhatsApp comercial ${WHATSAPP_DISPLAY}`,
    },
    knowsAbout: [
      'Big Bags FIBC',
      'Geomembranas de PVC',
      'Carpas industriales',
      'Mangas de ventilación para minería',
      'Mallas antiáfidas',
      'Lonas plastificadas a medida',
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
