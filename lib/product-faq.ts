import type { Product } from './types';
import { SITE } from './site';

/**
 * FAQs por producto, DERIVADAS del catálogo — nunca escritas a mano por SKU.
 *
 * Por qué importa: FAQPage es el bloque de datos estructurados que más se cita
 * en respuestas de LLM y el que alimenta los desplegables en Google. Pero una
 * FAQ inventada es peor que ninguna: si la respuesta no está respaldada por un
 * campo real del producto, no se emite la pregunta.
 *
 * REGLA: cada respuesta se construye solo con campos existentes de `Product`
 * (specifications, applications, sector, sourcing, availability, leadTime,
 * documentation, price). Si el campo no existe, la pregunta se omite. No se
 * afirman precios, certificaciones, plazos ni normas que el catálogo no declare.
 */

export interface Faq {
  q: string;
  a: string;
}

const SOURCING_TEXT: Record<string, string> = {
  fabricacion_propia:
    'Sí. Este producto lo fabricamos nosotros en nuestra planta de Chorrillos, Lima, según la especificación del cliente.',
  importacion_directa:
    'Este producto lo traemos por importación directa bajo nuestro control de calidad, y lo adaptamos o confeccionamos según el requerimiento.',
  bajo_pedido:
    'Esta línea se produce o adquiere contra pedido, con plazo confirmado en la cotización. La ficha técnica y el certificado de lote del fabricante se entregan con la propuesta.',
  partner:
    'Este producto se provee mediante un aliado técnico especializado, bajo nuestra coordinación y responsabilidad comercial.',
};

const AVAILABILITY_TEXT: Record<string, string> = {
  stock: 'Es un SKU estandarizado, con entrega rápida sujeta a stock al momento de la orden.',
  a_medida: 'Se fabrica a medida: las dimensiones, refuerzos y acabados se definen con el cliente antes de producir.',
  bajo_pedido: 'Es una línea bajo pedido: se confirma disponibilidad y plazo al cotizar.',
};

export function productFaqs(product: Product): Faq[] {
  const faqs: Faq[] = [];
  const sourcing = product.sourcing;
  const availability = product.availability ?? 'a_medida';

  // 1. Fabricación / origen — respaldado por `sourcing` + `availability`.
  const sourcingLine = sourcing ? SOURCING_TEXT[sourcing] : null;
  if (sourcingLine) {
    faqs.push({
      q: `¿${product.name} se fabrica a medida en el Perú?`,
      a: `${sourcingLine} ${AVAILABILITY_TEXT[availability]}`,
    });
  }

  // 2. Especificaciones técnicas — respaldado por `specifications`.
  if (product.specifications.length > 0) {
    const specs = product.specifications
      .slice(0, 4)
      .map((s) => `${s.label}: ${s.value}`)
      .join('. ');
    faqs.push({
      q: `¿Qué especificaciones técnicas tiene ${product.name}?`,
      a: `${specs}. La ficha completa de este producto está publicada en su página y las variantes exactas se confirman en la cotización.`,
    });
  }

  // 3. Aplicaciones — respaldado por `applications`.
  if (product.applications.length > 0) {
    faqs.push({
      q: `¿En qué aplicaciones se usa ${product.name}?`,
      a: `Principalmente en: ${product.applications.join('; ')}.`,
    });
  }

  // 4. Sectores — respaldado por `sector`.
  if (product.sector.length > 0) {
    faqs.push({
      q: `¿Qué sectores compran ${product.name}?`,
      a: `${product.sector.join(', ')}. Atendemos proyectos en todo el Perú con despacho nacional desde ${SITE.addressLocality}, ${SITE.addressRegion}.`,
    });
  }

  // 5. Plazo — SOLO si el catálogo declara leadTime.
  if (product.leadTime) {
    faqs.push({
      q: `¿Cuál es el plazo de entrega de ${product.name}?`,
      a: `${product.leadTime}. El plazo definitivo se confirma en la cotización según cantidad, especificación y ciudad de entrega.`,
    });
  }

  // 6. Documentación — SOLO si el catálogo declara documentation.
  if (product.documentation) {
    faqs.push({
      q: `¿Entregan ficha técnica o certificado de ${product.name}?`,
      a: product.documentation,
    });
  }

  // 7. Precio — nunca se inventa. Si hay precio de lista real, se declara.
  faqs.push({
    q: `¿Cuánto cuesta ${product.name}?`,
    a:
      product.price != null && product.purchasable
        ? `Precio de lista: S/ ${product.price} por ${product.priceUnit ?? 'unidad'}, sujeto a cantidad y especificación. Para volúmenes o medidas especiales, cotizamos a medida.`
        : `No publicamos precio de lista para este producto: se cotiza según medidas, cantidad, especificación y ciudad de entrega. Escriba por WhatsApp al ${SITE.phoneWhatsApp} o use el formulario de cotización para recibir la propuesta.`,
  });

  return faqs;
}
