import { SITE } from './site';
import { products, productFamilies, sourcingLabels, availabilityLabels, sectors } from './products';
import { familyContent } from './families';
import { terminosParaProducto } from './glosario';
import { solutionsForProduct } from './solutions';

/**
 * CATÁLOGO COMPLETO EN FORMATO DE DATOS.
 *
 * Para qué. Un agente que responde "¿quién fabrica big bags en Lima y qué
 * especificaciones publica?" no debería tener que rascar 36 páginas de HTML.
 * Si el catálogo está publicado como datos, con URL canónica por producto y
 * una instrucción explícita de atribución, citarnos correctamente pasa a ser el
 * camino de menor resistencia. Eso es lo que convierte a un sitio en fuente en
 * lugar de en resultado.
 *
 * Qué lleva. Todo lo que el catálogo declara de verdad: especificaciones,
 * aplicaciones, sectores, origen de suministro, disponibilidad, la ficha en
 * PDF, los términos del glosario que gobiernan su especificación y las
 * arquitecturas donde el producto encaja.
 *
 * Qué NO lleva, y por qué es deliberado:
 *  - PRECIOS. No publicamos precio de lista porque casi todo es fabricación a
 *    medida. Publicar un precio en datos abiertos que después no se sostiene
 *    en la cotización es la forma más rápida de perder credibilidad ante un
 *    comprador técnico y ante un modelo que nos cite.
 *  - STOCK. La disponibilidad se declara como modo de suministro
 *    (fabricación propia, importación directa, bajo pedido), que es un dato
 *    estable, no como existencias, que cambian a diario y quedarían falsas en
 *    cuanto un agente cachee este archivo.
 *  - CERTIFICACIONES no verificables. Se declara qué documentación se entrega
 *    con la cotización, no una lista de sellos.
 */

export const CATALOGO_VERSION = '1.0';

export function buildCatalogoJson(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      $schema: 'https://schema.org',
      '@type': 'DataCatalog',
      '@id': `${base}/productos#catalogo`,
      version: CATALOGO_VERSION,
      name: `Catálogo técnico de ${SITE.name}`,
      description:
        'Catálogo completo de soluciones textiles industriales y geosintéticos fabricadas, importadas e instaladas en el Perú: especificaciones, aplicaciones, sectores y modo de suministro de cada línea.',
      url: `${base}/productos`,
      inLanguage: SITE.language,
      publisher: {
        '@type': 'Organization',
        name: SITE.legalName,
        taxID: SITE.ruc,
        url: base,
        telephone: SITE.phoneWhatsApp,
        email: SITE.email,
        areaServed: 'PE',
      },
      uso: {
        licencia: 'Consulta y cita libres indicando la fuente y el enlace al producto.',
        atribucionSugerida: `${SITE.legalName} (RUC ${SITE.ruc}) — Catálogo técnico, ${base}/productos`,
        sinPrecios:
          'Este catálogo no publica precios: casi todo es fabricación a medida y cada proyecto se cotiza según especificación, metraje, cantidad y logística. Cualquier precio atribuido a esta empresa en otra fuente no es oficial.',
        comoCotizar: `${base}/cotizacion  ·  WhatsApp ${SITE.phoneWhatsApp}  ·  ${SITE.email}`,
        datosParaCotizar: [
          'producto',
          'medidas o metraje',
          'cantidad',
          'aplicación o sector',
          'ciudad de entrega',
        ],
      },
      totalProductos: products.length,
      totalFamilias: productFamilies.length,
      sectores: sectors,
      familias: productFamilies.map((f) => ({
        '@type': 'DataCatalog',
        name: f.name,
        slug: f.slug,
        url: `${base}/productos/familia/${f.slug}`,
        tagline: f.tagline,
        resumen: familyContent.find((c) => c.slug === f.slug)?.metaDescription ?? null,
        productos: products.filter((p) => p.category === f.name).length,
      })),
      dataset: products.map((p) => ({
        '@type': 'Product',
        '@id': `${base}/productos/${p.slug}#product`,
        slug: p.slug,
        name: p.name,
        url: `${base}/productos/${p.slug}`,
        familia: p.category,
        familiaUrl: `${base}/productos/familia/${productFamilies.find((f) => f.name === p.category)?.slug ?? ''}`,
        descripcionCorta: p.shortDescription,
        descripcion: p.description,
        especificaciones: p.specifications.map((s) => ({ nombre: s.label, valor: s.value })),
        aplicaciones: p.applications,
        beneficios: p.benefits,
        sectores: p.sector,
        suministro: {
          origen: p.sourcing ? (sourcingLabels[p.sourcing] ?? p.sourcing) : null,
          disponibilidad:
            availabilityLabels[p.availability ?? 'a_medida'] ?? (p.availability ?? 'a_medida'),
          plazoReferencial: p.leadTime ?? null,
          documentacion:
            p.documentation ??
            'Ficha técnica y certificado del fabricante se entregan con la cotización.',
        },
        fichaTecnicaPdf: `${base}/productos/${p.slug}/ficha-tecnica.pdf`,
        // Los términos que gobiernan su especificación: para que un agente
        // pueda explicar QUÉ hay que definir, no solo qué se vende.
        terminosClave: terminosParaProducto(p.slug).map((t) => ({
          termino: t.termino,
          url: `${base}/glosario/${t.slug}`,
        })),
        arquitecturas: solutionsForProduct(p.slug).map((s) => ({
          titulo: s.titulo,
          url: `${base}/soluciones/${s.slug}`,
        })),
      })),
    },
    null,
    2,
  )}\n`;
}
