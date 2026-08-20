import type { Product } from './types';
import { SITE } from './site';
import { sourcingLabels, availabilityLabels } from './products';
import {
  bullets, finishDoc, heading, paragraph, specTable, startDoc,
  type Ctx,
} from './pdf-kit';

/**
 * FICHA TÉCNICA EN PDF, GENERADA DESDE EL CATÁLOGO.
 *
 * Por qué existe: en una compra industrial el comprador técnico no decide solo;
 * tiene que llevar el documento a ingeniería, a calidad y a logística. Un PDF
 * descargable con las especificaciones reales es el activo que circula dentro
 * de la empresa del cliente cuando nosotros ya no estamos en la conversación.
 *
 * Por qué se GENERA y no se sube a mano: 36 fichas mantenidas manualmente se
 * desincronizan del catálogo a la primera corrección. Aquí el PDF se construye
 * desde `lib/products.ts`, de modo que corregir una especificación en el
 * catálogo corrige también el documento en el siguiente despliegue.
 *
 * El maquetado vive en lib/pdf-kit.ts y lo comparten todos los documentos de la
 * empresa: fichas, guías, arquitecturas, glosario y marco. Antes estaba aquí,
 * en privado, y al aparecer el segundo tipo de documento se habría copiado.
 *
 * REGLA DE HONESTIDAD: el PDF no declara precio, ni certificaciones, ni ensayos
 * que el catálogo no contenga. Si `documentation` no existe, no se inventa una
 * línea de documentación; se indica que se entrega con la cotización.
 */

/**
 * Construye la ficha técnica de un producto.
 *
 * @param product Producto del catálogo.
 * @param generatedAt Fecha del documento. Se inyecta para que el resultado sea
 *   determinista en los tests y estable entre despliegues del mismo contenido.
 */
export async function buildDatasheetPdf(
  product: Product,
  generatedAt: string,
): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Ficha técnica - ${product.name}`,
    subject: product.shortDescription,
    keywords: [product.category, ...product.sector, 'Perú', 'ficha técnica'],
    h1: product.name,
    kicker: `${product.category}  |  Ficha técnica`,
  });

  heading(ctx, 'Descripción');
  paragraph(ctx, product.description);

  if (product.specifications.length) {
    heading(ctx, 'Especificaciones técnicas');
    specTable(ctx, product.specifications);
  }

  if (product.applications.length) {
    heading(ctx, 'Aplicaciones');
    bullets(ctx, product.applications);
  }

  if (product.benefits.length) {
    heading(ctx, 'Beneficios');
    bullets(ctx, product.benefits);
  }

  // --- Estado de la oferta: dato real del catálogo, no marketing ------------
  heading(ctx, 'Suministro');
  const suministro: { label: string; value: string }[] = [];
  if (product.sourcing) {
    suministro.push({ label: 'Origen', value: sourcingLabels[product.sourcing] ?? product.sourcing });
  }
  const disp = product.availability ?? 'a_medida';
  suministro.push({ label: 'Disponibilidad', value: availabilityLabels[disp] ?? disp });
  if (product.leadTime) suministro.push({ label: 'Plazo referencial', value: product.leadTime });
  if (product.sustainability) suministro.push({ label: 'Materiales', value: product.sustainability });
  suministro.push({
    label: 'Documentación',
    value: product.documentation ?? 'Ficha técnica y certificado del fabricante se entregan con la cotización.',
  });
  suministro.push({ label: 'Sectores', value: product.sector.join(', ') });
  specTable(ctx, suministro);

  heading(ctx, 'Cómo cotizar');
  paragraph(
    ctx,
    `No publicamos precio de lista para este producto: se cotiza según medidas, cantidad, especificación y ciudad de entrega. Escriba por WhatsApp al ${SITE.phoneWhatsApp}, use el formulario en ${SITE.url}/cotizacion o escriba a ${SITE.email}.`,
  );
  paragraph(
    ctx,
    'Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.',
  );

  return finishDoc(ctx, `${SITE.url}/productos/${product.slug}`, generatedAt);
}
