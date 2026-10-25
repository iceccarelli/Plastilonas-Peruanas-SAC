/**
 * Documento PDF de la cotización, generado SOLO desde la instantánea emitida.
 *
 *  · Reproducible: mismas entradas → mismos bytes (fechas del PDF fijadas a la
 *    emisión, sin reloj ni aleatoriedad), así la huella del documento es
 *    comprobable y un reenvío entrega exactamente la misma oferta.
 *  · Sin recursos externos: texto vectorial con fuentes estándar. No hay HTML
 *    que interpretar, ni imágenes remotas, ni enlaces activos: no existe una
 *    ruta de SSRF ni de inyección de marcado en la generación.
 *  · Seguro ante texto hostil: todo pasa por `limpiar` (controles fuera) y por
 *    toWinAnsi (lo no codificable sale), así ningún carácter rompe la generación.
 *  · No muestra notas internas: la instantánea no las contiene.
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  AZUL, GRIS, GRIS_CLARO, BLANCO, MARGIN, PAGE_H, PAGE_W, VERDE,
  ensure, finishDoc, heading, note, paragraph, specTable, wrap, type Ctx,
} from '@/lib/pdf-kit';
import { toWinAnsi } from '@/lib/pdf-text';
import type { QuoteSnapshotT } from '@/lib/quote-snapshot';

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/g;
const limpiar = (t: string | null | undefined) => toWinAnsi((t ?? '').replace(CONTROL, '')).trim();

export function formatMoney(cents: number, currency: 'PEN' | 'USD'): string {
  const whole = Math.floor(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = String(cents % 100).padStart(2, '0');
  return `${currency === 'PEN' ? 'S/' : 'US$'} ${whole}.${frac}`;
}

const TAX_LABEL = { included: 'Impuestos incluidos', excluded: 'Impuestos adicionales', exempt: 'Operación exonerada' } as const;

export interface RenderOptions {
  /** Huella SHA-256 de la instantánea emitida; se imprime para poder verificarla. */
  hash: string | null;
  /** Vista previa interna de un borrador: marcada, NO es una oferta. */
  draft?: boolean;
}

/** Limpia TODA cadena de la instantánea una sola vez, antes de dibujar: ningún texto llega crudo a pdf-lib. */
function sanear<T>(v: T): T {
  if (typeof v === 'string') return limpiar(v) as unknown as T;
  if (Array.isArray(v)) return v.map(sanear) as unknown as T;
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sanear(x)])) as T;
  }
  return v;
}

export async function renderQuotePdf(raw: QuoteSnapshotT, opt: RenderOptions): Promise<Uint8Array> {
  const s = sanear(raw);
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ref = limpiar(s.reference);
  doc.setTitle(`Cotizacion ${ref} - ${limpiar(s.issuer.name)}`);
  doc.setAuthor(limpiar(s.issuer.legalName));
  doc.setSubject(`Oferta ${ref}`);
  doc.setProducer(limpiar(s.issuer.name));
  doc.setCreator(limpiar(s.issuer.website));
  const fecha = new Date(s.issuedAt);
  if (!Number.isNaN(fecha.getTime())) {
    doc.setCreationDate(fecha);
    doc.setModificationDate(fecha);
  }

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };
  const light = rgb(0.85, 0.88, 0.92);
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(limpiar(s.issuer.name), { x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: BLANCO });
  ctx.page.drawText(limpiar(`RUC ${s.issuer.ruc}  |  ${s.issuer.address}`), { x: MARGIN, y: PAGE_H - 60, size: 8, font: regular, color: light });
  ctx.page.drawText(limpiar([...s.issuer.phones, s.issuer.email].join('  |  ')), { x: MARGIN, y: PAGE_H - 76, size: 8, font: regular, color: light });
  ctx.y = PAGE_H - 130;

  ctx.page.drawText('COTIZACION', { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
  ctx.page.drawText(ref, { x: MARGIN + 130, y: ctx.y, size: 18, font: bold, color: VERDE });
  ctx.y -= 18;
  if (opt.draft) {
    ctx.page.drawText('BORRADOR INTERNO - NO ES UNA OFERTA', { x: MARGIN, y: ctx.y, size: 10, font: bold, color: rgb(0.75, 0.1, 0.1) });
    ctx.y -= 14;
  }

  specTable(ctx, [
    { label: 'Referencia', value: ref },
    { label: 'Fecha de emision', value: s.issuedAt.slice(0, 10) },
    { label: 'Valida hasta', value: `${s.validUntil} (fin del dia, hora de Lima)` },
    { label: 'Moneda', value: s.currency === 'PEN' ? 'Soles (PEN)' : 'Dolares americanos (USD)' },
  ]);

  heading(ctx, 'Cliente');
  specTable(ctx, [
    ...(s.customer.company ? [{ label: 'Empresa', value: limpiar(s.customer.company) }] : []),
    ...(s.customer.ruc ? [{ label: 'RUC', value: limpiar(s.customer.ruc) }] : []),
    ...(s.customer.name ? [{ label: 'Atencion', value: limpiar(s.customer.name) }] : []),
    ...(s.customer.email ? [{ label: 'Correo', value: limpiar(s.customer.email) }] : []),
  ].filter((r) => r.value));

  heading(ctx, 'Solicitud y especificacion cotizada');
  const req = [
    ...(s.request.product ? [{ label: 'Producto solicitado', value: limpiar(s.request.product) }] : []),
    ...(s.request.quantity ? [{ label: 'Cantidad / medidas', value: limpiar(s.request.quantity) }] : []),
    ...(s.request.deliveryCity ? [{ label: 'Ciudad de entrega', value: limpiar(s.request.deliveryCity) }] : []),
  ];
  if (req.length) specTable(ctx, req);
  for (const p of limpiar(s.summary).split(/\n{2,}/)) paragraph(ctx, p);

  heading(ctx, 'Detalle de la oferta');
  drawItems(ctx, s);

  heading(ctx, 'Impuestos');
  paragraph(ctx, `${TAX_LABEL[s.tax.treatment]}: ${limpiar(s.tax.label) || 'segun lo indicado por el emisor'}.`);

  if (s.terms && limpiar(s.terms)) {
    heading(ctx, 'Condiciones comerciales');
    for (const p of s.terms.split(/\n+/)) if (limpiar(p)) paragraph(ctx, p);
  }

  heading(ctx, 'Aceptacion y verificacion');
  paragraph(ctx, 'Esta oferta se acepta o rechaza unicamente desde el enlace seguro que acompana este documento, o respondiendo a nuestro equipo comercial. Si se emite una version posterior, esta deja de estar vigente.');
  if (opt.hash) note(ctx, `Huella SHA-256 de la oferta emitida: ${opt.hash}`);

  return finishDoc(ctx, `${ref}${opt.hash ? ` - ${opt.hash.slice(0, 16)}` : ' - borrador'}`, s.issuedAt.slice(0, 10));
}

function drawItems(ctx: Ctx, s: QuoteSnapshotT): void {
  const x = { desc: MARGIN, qty: 300, unit: 355, price: 400, amt: 475 };
  const size = 8.5;
  const head = () => {
    ensure(ctx, 24);
    for (const [t, px] of [['Descripcion', x.desc], ['Cant.', x.qty], ['Unid.', x.unit], ['P. unit.', x.price], ['Importe', x.amt]] as const) {
      ctx.page.drawText(t, { x: px, y: ctx.y, size: 8, font: ctx.bold, color: GRIS });
    }
    ctx.y -= 6;
    ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y }, thickness: 0.75, color: GRIS_CLARO });
    ctx.y -= 11;
  };
  head();
  const rows = s.items.length
    ? s.items
    : [{ description: 'Segun especificacion cotizada', quantity: '1', unit: 'glb', unit_price_cents: s.subtotalCents, amount_cents: s.subtotalCents }];
  for (const it of rows) {
    const lines = wrap(limpiar(it.description), ctx.regular, size, x.qty - x.desc - 8);
    const alto = lines.length * (size + 3) + 4;
    if (ctx.y - alto < MARGIN + 60) { ensure(ctx, 9999); head(); }
    const top = ctx.y;
    lines.forEach((l, i) => ctx.page.drawText(l, { x: x.desc, y: top - i * (size + 3), size, font: ctx.regular, color: AZUL }));
    ctx.page.drawText(limpiar(it.quantity), { x: x.qty, y: top, size, font: ctx.regular, color: AZUL });
    ctx.page.drawText(limpiar(it.unit), { x: x.unit, y: top, size, font: ctx.regular, color: AZUL });
    ctx.page.drawText(formatMoney(it.unit_price_cents, s.currency).replace(/^\S+ /, ''), { x: x.price, y: top, size, font: ctx.regular, color: AZUL });
    ctx.page.drawText(formatMoney(it.amount_cents, s.currency).replace(/^\S+ /, ''), { x: x.amt, y: top, size, font: ctx.regular, color: AZUL });
    ctx.y = top - alto;
  }
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y + 4 }, end: { x: PAGE_W - MARGIN, y: ctx.y + 4 }, thickness: 0.5, color: GRIS_CLARO });
  ctx.y -= 8;
  const line = (label: string, cents: number, strong = false) => {
    ensure(ctx, 16);
    const f = strong ? ctx.bold : ctx.regular;
    ctx.page.drawText(label, { x: 330, y: ctx.y, size: strong ? 10.5 : 9, font: f, color: AZUL });
    ctx.page.drawText(formatMoney(cents, s.currency), { x: 450, y: ctx.y, size: strong ? 10.5 : 9, font: f, color: strong ? VERDE : AZUL });
    ctx.y -= strong ? 18 : 14;
  };
  line('Subtotal', s.subtotalCents);
  if (s.tax.treatment === 'excluded' && s.tax.cents !== null) line(limpiar(s.tax.label) || 'Impuesto', s.tax.cents);
  line(s.tax.treatment === 'excluded' ? 'TOTAL' : s.tax.treatment === 'included' ? 'TOTAL (imp. incl.)' : 'TOTAL (exonerado)', s.totalCents, true);
}
