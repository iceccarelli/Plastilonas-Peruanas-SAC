import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { toWinAnsi } from './pdf-text';

/**
 * MOTOR DE DOCUMENTOS PDF.
 *
 * Por qué existe. La ficha técnica de producto llevaba su propio maquetador
 * privado. Al añadir guías, arquitecturas, glosario y marco, ese código se
 * habría copiado cuatro veces: cuatro cabeceras que divergen, cuatro pies con
 * distinta letra pequeña, cuatro sitios donde corregir el RUC. Extraerlo es lo
 * que permite que todos los documentos de la empresa se vean como uno solo.
 *
 * Por qué importa más allá de la estética. Un comprador industrial no decide
 * solo: reenvía el PDF a ingeniería, a calidad y a logística. Ese documento
 * circula dentro de la empresa del cliente cuando nosotros ya no estamos en la
 * conversación, y a veces es lo único que queda de nosotros en el expediente.
 *
 * REGLAS:
 *  1. Todo documento se GENERA desde la fuente de verdad, nunca se sube a mano.
 *     Un PDF mantenido aparte se desincroniza a la primera corrección.
 *  2. La fecha se INYECTA como parámetro, no se toma del reloj: así el
 *     resultado es determinista en los tests y estable entre despliegues del
 *     mismo contenido.
 *  3. Ningún documento declara precio, certificación ni ensayo que la fuente
 *     no contenga.
 *  4. Todo texto pasa por toWinAnsi(): las fuentes estándar de PDF no cubren
 *     Unicode completo y un carácter fuera de WinAnsi rompe la generación.
 */

export const MARGIN = 50;
export const PAGE_W = 595.28; // A4 en puntos
export const PAGE_H = 841.89;
export const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
export const VERDE = rgb(0.02, 0.588, 0.412); // #059669
export const GRIS = rgb(0.42, 0.45, 0.5);
export const GRIS_CLARO = rgb(0.88, 0.89, 0.91);
export const BLANCO = rgb(1, 1, 1);

export interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

export function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
export function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

export function heading(ctx: Ctx, text: string): void {
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

/** Subtítulo dentro de una sección: para documentos largos con jerarquía. */
export function subheading(ctx: Ctx, text: string): void {
  ensure(ctx, 26);
  ctx.y -= 10;
  for (const line of wrap(text, ctx.bold, 11, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: AZUL });
    ctx.y -= 14;
  }
  ctx.y -= 2;
}

export function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

/** Texto secundario: notas, procedencia, advertencias de alcance. */
export function note(ctx: Ctx, text: string, size = 8): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: GRIS });
    ctx.y -= size + 3;
  }
}

export function bullets(ctx: Ctx, items: string[], size = 9.5): void {
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

/** Lista numerada: secuencias de ejecución, pasos de un procedimiento. */
export function steps(ctx: Ctx, items: string[], size = 9.5): void {
  items.forEach((item, n) => {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 22);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText(`${n + 1}.`, {
          x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE,
        });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 22, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  });
}

export function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
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

/** Bloque destacado: riesgo, error frecuente, criterio que decide. */
export function callout(ctx: Ctx, titulo: string, texto: string): void {
  const size = 9;
  const lines = wrap(texto, ctx.regular, size, PAGE_W - MARGIN * 2 - 24);
  const alto = lines.length * (size + 3.5) + 26;
  ensure(ctx, alto + 8);
  const top = ctx.y;
  ctx.page.drawRectangle({
    x: MARGIN, y: top - alto + 8, width: 3, height: alto - 6, color: VERDE,
  });
  ctx.page.drawText(toWinAnsi(titulo.toUpperCase()), {
    x: MARGIN + 12, y: top, size: 7.5, font: ctx.bold, color: VERDE,
  });
  let y = top - 13;
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN + 12, y, size, font: ctx.regular, color: AZUL });
    y -= size + 3.5;
  }
  ctx.y = y - 6;
}

/** Crea el documento con su cabecera de marca y devuelve el contexto listo. */
export async function startDoc(meta: {
  title: string;
  subject: string;
  keywords: string[];
  /** Título grande del documento. */
  h1: string;
  /** Línea de contexto bajo el título: familia, tipo de documento, versión. */
  kicker: string;
}): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`${meta.title} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(meta.subject));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords(meta.keywords.map(toWinAnsi));

  const ctx: Ctx = {
    doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold,
  };

  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: BLANCO,
  });
  ctx.page.drawText(
    toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`),
    { x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.page.drawText(
    toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`),
    { x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.y = PAGE_H - 130;

  for (const line of wrap(meta.h1, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(meta.kicker), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

  return ctx;
}

/**
 * Cierra el documento: pie con procedencia y numeración en todas las páginas.
 *
 * La URL de origen en cada página no es decoración: cuando el PDF circula
 * dentro de la empresa del cliente, es lo único que permite volver a la fuente
 * y comprobar si el documento sigue vigente.
 */
export async function finishDoc(
  ctx: Ctx,
  sourceUrl: string,
  generatedAt: string,
): Promise<Uint8Array> {
  // Fechas del documento fijadas a partir de `generatedAt`, NO del reloj.
  //
  // pdf-lib estampa por defecto la hora del sistema en CreationDate y
  // ModDate. Con eso, los 52 PDF del sitio cambiaban de bytes en CADA
  // compilación aunque su contenido fuera idéntico: los ETags se invalidaban
  // solos, la caché del CDN se rehacía sin motivo y un diff entre dos
  // versiones no significaba nada.
  //
  // Lo delató un test propio de determinismo que fallaba una de cada dos veces
  // en un clon limpio: pasaba solo cuando las dos generaciones caían dentro
  // del mismo segundo. Un test intermitente casi siempre está señalando un
  // defecto real; este lo señalaba.
  //
  // Mediodía UTC y no medianoche: en zona negativa como la peruana, 00:00 UTC
  // retrocede la fecha un día.
  const fecha = new Date(`${generatedAt}T12:00:00Z`);
  if (!Number.isNaN(fecha.getTime())) {
    ctx.doc.setCreationDate(fecha);
    ctx.doc.setModificationDate(fecha);
  }

  const pages = ctx.doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(toWinAnsi(`${sourceUrl}  |  Documento generado el ${generatedAt}`), {
      x: MARGIN, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
  });
  return ctx.doc.save();
}
