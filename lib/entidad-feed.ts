import { SITE } from './site';
import { ORGANIZATION_ID, BUSINESS_ID, WEBSITE_ID } from './schema';
import { PRODUCT_COUNT, FAMILY_COUNT, YEARS_STATEMENT } from './facts';
import { productFamilies } from './products';

/**
 * TARJETA DE ENTIDAD PARA AGENTES — derivada, no escrita a mano.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO. Antes había un `public/entidad.json` estático
 * con la identidad de la empresa copiada a mano. Tenía tres problemas y los
 * tres eran del mismo tipo —una copia que nadie regenera envejece sola—:
 *
 *   1. Declaraba `"@id": "https://plastilonas.com/#organization"` y
 *      `"url": "https://plastilonas.com"` mientras el sitio se sirve desde el
 *      host de Vercel. Un `@id` que no coincide con el origen que el rastreador
 *      tiene delante NO consolida la entidad: la parte en dos. Era la misma
 *      escisión que lib/site.ts prohíbe en su primera línea, sólo que fuera del
 *      alcance de test/dominio.ts, porque `public/` estaba en su lista de
 *      omisiones.
 *   2. Declaraba `areaServed: ["PE","CL","CO","EC","BO"]`. /confianza publica
 *      exactamente lo contrario —«Envío mundial o instalación continental» está
 *      en la lista de lo que NO se afirma— y sólo Colombia tiene evidencia
 *      pública de comercio. Cinco países en un campo tipado es una afirmación
 *      de cobertura, no un matiz comercial.
 *   3. Usaba `disclaimer`, que no es una propiedad de schema.org. Vocabulario
 *      inventado en el nodo raíz de la empresa.
 *
 * QUÉ HACE AHORA. Todo sale de lib/site.ts, lib/facts.ts y lib/products.ts, de
 * modo que el día que cambie el RUC, el teléfono, el domicilio o el dominio,
 * esta tarjeta cambia con ellos y no hay una segunda copia que corregir.
 *
 * EL ALCANCE INTERNACIONAL, DICHO CON PRECISIÓN. `areaServed` sigue siendo Perú
 * —es la única cobertura que la empresa puede sostener sin matices— y la
 * exportación se declara donde de verdad pertenece: como un `Service` con su
 * punto de entrega (EXW Lima / FOB Callao) y su condición explícita de
 * evaluación por RFQ. Un agente que lea esto obtiene una respuesta MÁS útil que
 * una lista de países: sabe desde dónde sale la carga, bajo qué Incoterm y qué
 * tiene que preguntar. Y no hay nada que un comprador pueda desmentir.
 */

/** Incoterms que la empresa cotiza de verdad, con su punto de entrega. */
export const INCOTERMS_SALIDA = [
  { codigo: 'EXW', punto: 'Planta Chorrillos, Lima', nota: 'El comprador toma la carga en planta.' },
  { codigo: 'FCA', punto: 'Lima', nota: 'Entrega al transportista designado por el comprador.' },
  { codigo: 'FOB', punto: 'Puerto del Callao', nota: 'Embarque marítimo desde el Callao.' },
] as const;

export function buildEntidadJson(): string {
  const doc = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        email: SITE.email,
        telephone: [SITE.phoneCentral, SITE.phoneWhatsApp],
        foundingDate: SITE.foundingYear,
        taxID: SITE.ruc,
        identifier: { '@type': 'PropertyValue', propertyID: 'RUC', value: SITE.ruc },
        isicV4: SITE.isicV4,
        naics: SITE.naics,
        description: SITE.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.addressStreet,
          addressLocality: SITE.addressLocality,
          addressRegion: SITE.addressRegion,
          postalCode: SITE.addressPostalCode,
          addressCountry: SITE.addressCountry,
        },
        // Una sola cobertura sin matices. La internacional se declara abajo,
        // como servicio evaluado por operación, que es lo que realmente es.
        areaServed: { '@type': 'Country', name: 'Perú' },
        knowsAbout: productFamilies.map((f) => f.name),
        knowsLanguage: [SITE.language],
        ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
      },
      {
        '@type': 'Service',
        '@id': `${SITE.url}/exportacion#servicio`,
        name: 'Suministro internacional evaluado por RFQ',
        serviceType: 'Exportación de textil industrial y geosintéticos',
        provider: { '@id': ORGANIZATION_ID },
        url: `${SITE.url}/exportacion`,
        areaServed: { '@type': 'Country', name: 'Perú' },
        description:
          'La fabricación ocurre en Chorrillos, Lima. Cada operación internacional se evalúa por ' +
          'partida arancelaria, volumen mínimo, destino e Incoterm; no hay envío mundial automático ' +
          'ni tarifa publicada. Existe evidencia pública de comercio exterior hacia Colombia; el ' +
          'resto de destinos se confirma operación por operación.',
        termsOfService: `${SITE.url}/confianza`,
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${SITE.url}/cotizacion`,
          name: 'Solicitud de cotización (RFQ)',
        },
        offers: {
          '@type': 'Offer',
          '@id': `${SITE.url}/exportacion#oferta`,
          availability: 'https://schema.org/LimitedAvailability',
          priceSpecification: {
            '@type': 'PriceSpecification',
            // No hay lista de precios: la venta es B2B por cotización. Declararlo
            // con vocabulario tipado es más honesto que omitir el campo.
            valueAddedTaxIncluded: false,
            description: 'Precio por cotización. No se publica lista de precios.',
          },
          eligibleCustomerType: 'https://schema.org/Business',
          additionalProperty: INCOTERMS_SALIDA.map((i) => ({
            '@type': 'PropertyValue',
            name: `Incoterm ${i.codigo}`,
            value: `${i.punto} — ${i.nota}`,
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE.url,
        name: SITE.name,
        inLanguage: SITE.language,
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE.url}/productos/catalogo.json#dataset`,
        name: `Catálogo Plastilonas — ${PRODUCT_COUNT} soluciones en ${FAMILY_COUNT} líneas de producto`,
        description: `${YEARS_STATEMENT}. Catálogo completo en JSON abierto, sin registro y sin precios.`,
        creator: { '@id': ORGANIZATION_ID },
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `${SITE.url}/productos/catalogo.json`,
        },
      },
    ],
  };
  return JSON.stringify(doc, null, 2);
}
