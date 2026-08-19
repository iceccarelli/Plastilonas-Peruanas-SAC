import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Product } from './types';
import { SITE } from './site';
import { sourcingLabels, availabilityLabels } from './products';

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
 * REGLA DE HONESTIDAD: el PDF no declara precio, ni certificaciones, ni ensayos
 * que el catálogo no contenga. Si `documentation` no existe, no se inventa una
 * línea de documentación; se indica que se entrega con la cotización.
 */

const MARGIN = 50;
const PAGE_W = 595.28; // A4 en puntos
const PAGE_H = 841.89;
const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
const VERDE = rgb(0.020, 0.588, 0.412); // #059669
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.88, 0.89, 0.91);

/**
 * Las fuentes estándar de PDF usan WinAnsi, que cubre el español (acentos y ñ)
 * pero NO los signos tipográficos que usamos en la web. Sin esta conversión,
 * pdf-lib lanza una excepción al primer guion largo y la ficha no se genera.
 */
export function toWinAnsi(text: string): string {
  return text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[→➡]/g, '->')
    .replace(/·/g, '-')
    .replace(/•/g, '-')
    .replace(/ /g, ' ')
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/º/g, 'o')
    .replace(/[^\x00-\xFF]/g, '');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

function heading(ctx: Ctx, text: string): void {
  ensure(ctx, 34);
  ctx.y -= 20;
  ctx.page.drawText(toWinAnsi(text.toUpperCase()), {
    x: MARGIN, y: ctx.y, size: 9, font: ctx.bold, color: VERDE,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 12;
}

function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

function bullets(ctx: Ctx, items: string[], size = 9.5): void {
  for (const item of items) {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 14);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText('-', { x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 14, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  }
}

function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
  const size = 9;
  const labelW = 150;
  const valueW = PAGE_W - MARGIN * 2 - labelW - 10;
  for (const row of rows) {
    const valueLines = wrap(row.value, ctx.regular, size, valueW);
    const labelLines = wrap(row.label, ctx.bold, size, labelW);
    const height = Math.max(valueLines.length, labelLines.length) * (size + 3) + 6;
    ensure(ctx, height);
    const top = ctx.y;
    labelLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN, y: top - i * (size + 3), size, font: ctx.bold, color: GRIS,
      });
    });
    valueLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN + labelW + 10, y: top - i * (size + 3), size, font: ctx.regular, color: AZUL,
      });
    });
    ctx.y = top - height + 2;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y + 4 }, end: { x: PAGE_W - MARGIN, y: ctx.y + 4 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    ctx.y -= 6;
  }
}

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
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`Ficha técnica - ${product.name} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(product.shortDescription));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords([product.category, ...product.sector, 'Perú', 'ficha técnica'].map(toWinAnsi));

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };

  // --- Cabecera -------------------------------------------------------------
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: rgb(1, 1, 1),
  });
  ctx.page.drawText(toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`), {
    x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.page.drawText(toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`), {
    x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.y = PAGE_H - 130;

  // --- Título ---------------------------------------------------------------
  for (const line of wrap(product.name, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(`${product.category}  |  Ficha técnica`), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

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

  // --- Pie en todas las páginas --------------------------------------------
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(
      toWinAnsi(`${SITE.url}/productos/${product.slug}  |  Documento generado el ${generatedAt}`),
      { x: MARGIN, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS },
    );
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
  });

  return doc.save();
}
