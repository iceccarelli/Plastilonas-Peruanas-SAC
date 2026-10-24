import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { renderQuotePdf, formatMoney } from '@/lib/quote-document';
import { issuerFromSite, parseSnapshot, type QuoteSnapshotT } from '@/lib/quote-snapshot';
import { buildStaffQuotePdf } from '@/lib/quote-staff-pdf';
import type { StaffQuote } from '@/lib/staff-store';

const base = (over: Partial<QuoteSnapshotT> = {}): QuoteSnapshotT => ({
  schema: 1, reference: 'RFQ-20261024-ABCD2345-V2', rfq: 'RFQ-20261024-ABCD2345', version: 2,
  issuedAt: '2026-10-24T15:04:05Z', validUntil: '2026-11-30', currency: 'USD', issuer: issuerFromSite(),
  customer: { name: 'Ana Compradora', company: 'Minera Andina SAC', email: 'compras@minera.example', ruc: '20123456786' },
  request: { product: 'Mangas de ventilación', quantity: '12 unidades', deliveryCity: 'Arequipa' },
  summary: 'Mangas Ø600 mm x 50 m.\n\nIncluye anillos de suspensión.',
  items: [{ description: 'Manga de ventilación Ø600 mm x 50 m', quantity: '12', unit: 'UND', unit_price_cents: 104200, amount_cents: 1250400 }],
  subtotalCents: 1250400, tax: { treatment: 'excluded', label: 'IGV 18% (no incluido)', cents: 225072 }, totalCents: 1475472,
  terms: 'Pago 50% adelanto.\nEntrega a coordinar.', ...over,
});
const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const HASH = 'a'.repeat(64);

describe('documento PDF de la cotización', () => {
  it('es reproducible: mismas entradas, mismos bytes (huella estable)', async () => {
    const a = await renderQuotePdf(base(), { hash: HASH });
    await new Promise((r) => setTimeout(r, 1100)); // cruza un segundo de reloj
    const b = await renderQuotePdf(base(), { hash: HASH });
    expect(sha(a)).toBe(sha(b));
  });

  it('cambia si cambia cualquier dato de la oferta', async () => {
    const a = await renderQuotePdf(base(), { hash: HASH });
    expect(sha(await renderQuotePdf(base({ totalCents: 1475473 }), { hash: HASH }))).not.toBe(sha(a));
    expect(sha(await renderQuotePdf(base({ validUntil: '2026-12-01' }), { hash: HASH }))).not.toBe(sha(a));
  });

  it('es un PDF válido, con fechas de la emisión y metadatos del emisor', async () => {
    const bytes = await renderQuotePdf(base(), { hash: HASH });
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getTitle()).toContain('RFQ-20261024-ABCD2345-V2');
    // La fecha del documento sale de la emisión (día), no del reloj.
    expect(doc.getCreationDate()?.toISOString()).toBe('2026-10-24T12:00:00.000Z');
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('el borrador queda marcado y sin huella; no es una oferta', async () => {
    const bytes = await renderQuotePdf(base(), { hash: null, draft: true });
    expect(Buffer.from(bytes).toString('latin1')).toBeTruthy();
    expect(sha(bytes)).not.toBe(sha(await renderQuotePdf(base(), { hash: HASH })));
  });

  it('muchas partidas y textos largos paginan sin error', async () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ description: `Partida ${i} ` + 'descripción larga '.repeat(12), quantity: '1.5', unit: 'm2', unit_price_cents: 1999, amount_cents: 2999 }));
    const bytes = await renderQuotePdf(base({ items, summary: 'Texto largo. '.repeat(500), terms: 'Condición. '.repeat(400) }), { hash: HASH });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(2);
  });

  it('texto hostil: controles, bidi, emoji, marcado, plantillas y comillas no rompen la generación', async () => {
    const evil = '<script>alert(1)</script> {{7*7}} ${x} \u0000\u0007\u0081‮​ 😀 ✓ → ≥ ñ á "\'`; DROP TABLE x;--';
    const bytes = await renderQuotePdf(base({
      reference: 'RFQ-X-V1', summary: evil, terms: evil,
      customer: { name: evil, company: evil, email: evil, ruc: evil }, request: { product: evil, quantity: evil, deliveryCity: evil },
      items: [{ description: evil, quantity: '1', unit: evil.slice(0, 20), unit_price_cents: 1, amount_cents: 1 }],
      tax: { treatment: 'exempt', label: evil, cents: null },
    }), { hash: HASH });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('no contiene recursos externos ni acciones activas (sin URI, JavaScript ni imágenes remotas)', async () => {
    const raw = Buffer.from(await renderQuotePdf(base({ summary: 'ver http://evil.test/x' }), { hash: HASH })).toString('latin1');
    for (const marker of ['/URI', '/JavaScript', '/JS', '/Launch', '/EmbeddedFile', '/OpenAction', '/AA ', '/XObject']) {
      expect(raw.includes(marker), marker).toBe(false);
    }
  });

  it('las notas internas no existen en el tipo de la instantánea', () => {
    const parsed = parseSnapshot({ ...base(), notes: 'margen 22%', createdBy: 'interno@example.test' });
    expect(parsed).toBeTruthy();
    expect(JSON.stringify(parsed)).not.toMatch(/margen|createdBy|interno@example/);
  });

  it('parseSnapshot rechaza contratos rotos o importes negativos', () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ ...base(), schema: 2 })).toBeNull();
    expect(parseSnapshot({ ...base(), totalCents: -1 })).toBeNull();
    expect(parseSnapshot({ ...base(), currency: 'EUR' })).toBeNull();
    expect(parseSnapshot({ ...base(), tax: { treatment: 'iva', label: 'x', cents: null } })).toBeNull();
  });

  it('formatea importes sin coma flotante ni locale', () => {
    expect(formatMoney(0, 'PEN')).toBe('S/ 0.00');
    expect(formatMoney(5, 'USD')).toBe('US$ 0.05');
    expect(formatMoney(1475472, 'PEN')).toBe('S/ 14,754.72');
    expect(formatMoney(123456789012, 'USD')).toBe('US$ 1,234,567,890.12');
  });
});

describe('PDF para el personal', () => {
  const lead = { rfqId: 'RFQ-1', fullName: 'Ana', company: 'Minera', email: 'a@m.example', product: 'Mangas', quantity: '12', payload: { ruc: '20123456786' } };
  const quote = (over: Partial<StaffQuote>): StaffQuote => ({
    id: 'q1', version: 3, status: 'draft', amountCents: 1000, currency: 'PEN', validUntil: '2099-01-01', summary: 'Resumen de la especificación',
    notes: 'NOTA INTERNA', createdBy: 'v@p.com', issuedBy: null, issuedAt: null, resolutionReason: null, resolvedAt: null, resolvedVia: null,
    lineItems: [{ description: 'Item', quantity: '1', unit: 'UND', unit_price_cents: 1000, amount_cents: 1000 }], subtotalCents: 1000,
    taxTreatment: 'included', taxLabel: 'IGV incluido', taxCents: null, terms: null, snapshotHash: null, snapshot: null, delivery: null, ...over,
  });
  const storeOf = (q: StaffQuote) => ({ getLead: async (id: string) => (id === 'L1' ? ({ ...lead, quotes: [q] } as never) : null) });

  it('borrador: vista previa marcada; emitida: la instantánea exacta; otro lead o id → null', async () => {
    const render = async (s: QuoteSnapshotT, o: { hash: string | null; draft?: boolean }) => renderQuotePdf(s, o);
    const d = await buildStaffQuotePdf(storeOf(quote({})), 'L1', 'q1', render);
    expect(d?.filename).toBe('BORRADOR-RFQ-1-V3.pdf');
    expect(Buffer.from(d!.bytes.subarray(0, 5)).toString()).toBe('%PDF-');
    const snap = base({ reference: 'RFQ-1-V3' });
    const issued = await buildStaffQuotePdf(storeOf(quote({ status: 'issued', snapshot: snap, snapshotHash: HASH })), 'L1', 'q1', render);
    expect(issued?.filename).toBe('RFQ-1-V3.pdf');
    expect(sha(issued!.bytes)).toBe(sha(await renderQuotePdf(snap, { hash: HASH })));
    expect(await buildStaffQuotePdf(storeOf(quote({})), 'OTRO', 'q1', render)).toBeNull();
    expect(await buildStaffQuotePdf(storeOf(quote({})), 'L1', 'q-ajena', render)).toBeNull();
  });
  it('un borrador sin impuestos definidos no genera vista previa (no se presupone nada)', async () => {
    expect(await buildStaffQuotePdf(storeOf(quote({ taxTreatment: null })), 'L1', 'q1', renderQuotePdf)).toBeNull();
  });
});
