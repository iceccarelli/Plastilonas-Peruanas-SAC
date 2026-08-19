import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { toWinAnsi } from './pdf-text';
import { FRAMEWORK_VERSION } from './framework';
import type { BriefResult } from './framework-score';

/**
 * BRIEF DE ESPECIFICACIÓN — el entregable de la autoevaluación.
 *
 * Se genera EN EL NAVEGADOR: las respuestas nunca salen del dispositivo del
 * usuario. Eso no es solo privacidad, es la razón por la que un comprador
 * técnico se anima a responder con franqueza sobre lo que su proyecto todavía
 * no tiene definido.
 *
 * La lógica de puntuación vive en lib/framework-score.ts para que esta
 * dependencia (pdf-lib) se cargue solo cuando el usuario pide el PDF.
 *
 * El documento sirve para llevarlo a una reunión interna: lista lo que está
 * definido, lo que falta y por qué importa. Lleva nuestra marca porque lo
 * generamos, no porque lo condicione: es útil aunque el proyecto se compre a
 * otro proveedor.
 */

const MARGIN = 50;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const AZUL = rgb(0.039, 0.145, 0.251);
const VERDE = rgb(0.02, 0.588, 0.412);
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.88, 0.89, 0.91);
const AMBAR = rgb(0.85, 0.47, 0.02);

interface Ctx { doc: PDFDocument; page: PDFPage; y: number; regular: PDFFont; bold: PDFFont }

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const cand = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(cand, size) <= maxWidth) current = cand;
    else { if (current) lines.push(current); current = w; }
  }
  if (current) lines.push(current);
  return lines;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 40) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - MARGIN;
  }
}

function para(ctx: Ctx, text: string, size = 9.5, color = AZUL) {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color });
    ctx.y -= size + 3.5;
  }
}

export async function buildBriefPdf(
  result: BriefResult,
  proyecto: string,
  generatedAt: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle(toWinAnsi(`Brief de especificación - ${proyecto || 'Proyecto'}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject('Autoevaluación contra el Marco de Especificación Plastilonas');

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };

  // Cabecera
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 92, width: PAGE_W, height: 92, color: AZUL });
  ctx.page.drawText('BRIEF DE ESPECIFICACIÓN', {
    x: MARGIN, y: PAGE_H - 38, size: 15, font: bold, color: rgb(1, 1, 1),
  });
  ctx.page.drawText(
    toWinAnsi(`Marco de Especificación ${SITE.name} v${FRAMEWORK_VERSION}  |  ${generatedAt}`),
    { x: MARGIN, y: PAGE_H - 56, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.page.drawText(toWinAnsi(`RUC ${SITE.ruc}  |  WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.url}`), {
    x: MARGIN, y: PAGE_H - 72, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.y = PAGE_H - 122;

  if (proyecto.trim()) {
    ctx.page.drawText(toWinAnsi(proyecto.trim()), { x: MARGIN, y: ctx.y, size: 14, font: bold, color: AZUL });
    ctx.y -= 24;
  }

  // Resultado
  ctx.page.drawText(
    toWinAnsi(`Nivel de definición: ${result.nivel.etiqueta}  (${result.porcentaje}%)`),
    { x: MARGIN, y: ctx.y, size: 12, font: bold, color: VERDE },
  );
  ctx.y -= 18;
  para(ctx, result.nivel.detalle);
  ctx.y -= 6;
  para(
    ctx,
    'Este documento puntúa cuánta información existe para especificar sin adivinar. No evalúa proveedores ni productos.',
    8.5,
    GRIS,
  );
  ctx.y -= 10;

  // Barras por pilar
  ctx.page.drawText('RESULTADO POR PILAR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 14;
  for (const p of result.porPilar) {
    ensure(ctx, 26);
    const anchoTotal = 220;
    ctx.page.drawText(toWinAnsi(p.nombre), { x: MARGIN, y: ctx.y, size: 9, font: regular, color: AZUL });
    ctx.page.drawRectangle({
      x: MARGIN + 250, y: ctx.y - 2, width: anchoTotal, height: 8, color: GRIS_CLARO,
    });
    ctx.page.drawRectangle({
      x: MARGIN + 250, y: ctx.y - 2, width: (anchoTotal * p.porcentaje) / 100, height: 8,
      color: p.porcentaje >= 60 ? VERDE : AMBAR,
    });
    ctx.page.drawText(`${p.porcentaje}%`, {
      x: MARGIN + 250 + anchoTotal + 8, y: ctx.y, size: 8.5, font: bold, color: GRIS,
    });
    ctx.y -= 18;
  }
  ctx.y -= 10;

  // Pendientes
  ctx.page.drawText('CRITERIOS POR CERRAR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 14;

  const conPendientes = result.porPilar.filter((p) => p.pendientes.length);
  if (!conPendientes.length) {
    para(ctx, 'No quedan criterios pendientes. El proyecto está listo para una especificación firme.');
  }
  for (const p of conPendientes) {
    ensure(ctx, 30);
    ctx.page.drawText(toWinAnsi(p.nombre.toUpperCase()), {
      x: MARGIN, y: ctx.y, size: 8.5, font: bold, color: GRIS,
    });
    ctx.y -= 14;
    for (const pend of p.pendientes) {
      const marca = pend.critico ? '[CRITICO] ' : '';
      for (const line of wrap(marca + pend.pregunta, bold, 9, PAGE_W - MARGIN * 2 - 12)) {
        ensure(ctx, 13);
        ctx.page.drawText(line, {
          x: MARGIN + 12, y: ctx.y, size: 9, font: bold,
          color: pend.critico ? AMBAR : AZUL,
        });
        ctx.y -= 12;
      }
      for (const line of wrap(pend.riesgo, regular, 8.5, PAGE_W - MARGIN * 2 - 12)) {
        ensure(ctx, 12);
        ctx.page.drawText(line, { x: MARGIN + 12, y: ctx.y, size: 8.5, font: regular, color: GRIS });
        ctx.y -= 11;
      }
      ctx.y -= 5;
    }
    ctx.y -= 4;
  }

  // Cierre
  ensure(ctx, 60);
  ctx.y -= 8;
  ctx.page.drawText('CÓMO SEGUIR', { x: MARGIN, y: ctx.y, size: 9, font: bold, color: VERDE });
  ctx.y -= 16;
  para(
    ctx,
    `Lleve este brief a su equipo técnico y cierre primero los criterios marcados como críticos: son los que cambian la especificación, no solo el precio. Cuando estén resueltos, una cotización sobre esta base es comparable entre proveedores.`,
  );
  ctx.y -= 4;
  para(
    ctx,
    `Si quiere que revisemos su caso: WhatsApp ${SITE.phoneWhatsApp}, ${SITE.url}/cotizacion o ${SITE.email}. El marco completo, con la guía técnica que respalda cada criterio, está en ${SITE.url}/marco.`,
  );

  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(toWinAnsi(`${SITE.url}/marco  |  Generado en su navegador: sus respuestas no se enviaron a ningún servidor`), {
      x: MARGIN, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
  });

  return doc.save();
}
