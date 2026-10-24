import { describe, it, expect, beforeEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { QuoteDraftInput, computeDraft, lineAmountCents, toCents, quoteErrorOf } from '@/lib/quotations';

describe('entrada de cotización', () => {
  const item = { description: 'Manga de ventilación Ø600 mm, 50 m', quantity: '12', unit: 'UND', unitPrice: '1042.00' };
  const ok = {
    currency: 'PEN', validUntil: '2099-01-01', summary: 'Mangas Ø600 x 50 m, 12 unidades, entrega Arequipa',
    items: [item], taxTreatment: 'included', taxLabel: 'IGV incluido',
  };
  it('convierte a céntimos sin coma flotante', () => {
    expect(toCents('12500.50')).toBe(1250050);
    expect(toCents('12500.5')).toBe(1250050);
    expect(toCents('0.10')).toBe(10);
    expect(toCents('1')).toBe(100);
    expect(toCents('0.07')).toBe(7);
  });
  it('valida moneda, fecha, resumen, partidas e impuestos', () => {
    expect(QuoteDraftInput.safeParse(ok).success).toBe(true);
    const bad: Array<Record<string, unknown>> = [
      { currency: 'EUR' }, { validUntil: '31/12/2099' }, { summary: 'corto' }, { items: [] },
      { items: [{ ...item, quantity: '0' }] }, { items: [{ ...item, quantity: '1.2345' }] }, { items: [{ ...item, unitPrice: '-5' }] },
      { items: [{ ...item, unitPrice: '1,5' }] }, { items: [{ ...item, description: 'ab' }] },
      { taxTreatment: undefined }, { taxTreatment: 'iva' }, { taxLabel: '' },
      { taxTreatment: 'excluded' }, // adicional sin importe
    ];
    for (const b of bad) expect(QuoteDraftInput.safeParse({ ...ok, ...b }).success, JSON.stringify(b)).toBe(false);
    expect(QuoteDraftInput.safeParse({ ...ok, taxTreatment: 'excluded', taxAmount: '2250.00' }).success).toBe(true);
  });
  it('multiplica con enteros y redondea medio hacia arriba', () => {
    expect(lineAmountCents('12', 104200)).toBe(1250400);
    expect(lineAmountCents('0.5', 101)).toBe(51); // 50.5 -> 51
    expect(lineAmountCents('0.001', 100)).toBe(0);
    expect(lineAmountCents('1234567.123', 100)).toBe(123456712); // sin coma flotante
  });
  it('el impuesto solo se suma si es adicional', () => {
    const base = QuoteDraftInput.parse(ok);
    expect(computeDraft(base).totalCents).toBe(1250400);
    const ex = QuoteDraftInput.parse({ ...ok, taxTreatment: 'excluded', taxAmount: '2250.72' });
    expect(computeDraft(ex)).toMatchObject({ subtotalCents: 1250400, taxCents: 225072, totalCents: 1475472 });
    const exempt = QuoteDraftInput.parse({ ...ok, taxTreatment: 'exempt', taxLabel: 'Exonerado — base legal indicada por contabilidad' });
    expect(computeDraft(exempt).totalCents).toBe(1250400);
  });
  it('traduce los errores de las funciones SQL a códigos estables', () => {
    expect(quoteErrorOf('P0001: validity_required')).toBe('validity_required');
    expect(quoteErrorOf('tax_required')).toBe('tax_required');
    expect(quoteErrorOf('error raro del driver')).toBe('failed');
    expect(quoteErrorOf(undefined)).toBe('failed');
  });
});

describe('cotizaciones en Postgres real', () => {
  let db: PGlite;
  const sql = (f: string) => readFileSync(`supabase/${f}`, 'utf8');
  beforeEach(async () => {
    db = new PGlite();
    await db.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
    await db.exec(sql('schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
    for (const f of readdirSync('supabase/migrations').sort()) await db.exec(sql(`migrations/${f}`));
  });

  const lead = async (status: string) =>
    ((await db.query(`insert into public.quotes(customer_email, rfq_code, status) values ('a@b.co', 'R-' || gen_random_uuid(), $1) returning id`, [status])).rows[0] as { id: string }).id;
  const create = (id: string, amount = 1250050, cur = 'PEN', until = '2099-01-01', summary = 'Especificación cotizada completa') =>
    db.query(
      `select * from public.lead_quote_create($1, 'ventas@p.com', $2, $3, $4::date, $5, null, '[]'::jsonb, 'included', 'IGV incluido', null, null)`,
      [id, amount, cur, until, summary],
    );
  const issue = (qid: string) => db.query(`select * from public.lead_quote_issue($1, 'ventas@p.com')`, [qid]);
  const resolve = (qid: string, o: string, r: string | null) => db.query(`select * from public.lead_quote_resolve($1, 'ventas@p.com', $2, $3)`, [qid, o, r]);
  const status = async (id: string) => ((await db.query(`select status, loss_reason from public.quotes where id=$1`, [id])).rows[0] as { status: string; loss_reason: string | null });
  const qid = (r: { rows: unknown[] }) => (r.rows[0] as { id: string }).id;

  it('no se cotiza un lead sin calificar', async () => {
    await expect(create(await lead('NEW'))).rejects.toThrow(/lead_not_ready/);
    await expect(create(await lead('ASSIGNED'))).rejects.toThrow(/lead_not_ready/);
    await expect(create(await lead('LOST'))).rejects.toThrow(/lead_not_ready/);
  });

  it('crea borradores con versión consecutiva y mueve QUALIFIED a QUOTE_PREPARATION', async () => {
    const l = await lead('QUALIFIED');
    const v1 = (await create(l)).rows[0] as { version: number; status: string };
    expect(v1).toMatchObject({ version: 1, status: 'draft' });
    expect((await status(l)).status).toBe('QUOTE_PREPARATION');
    expect(((await create(l)).rows[0] as { version: number }).version).toBe(2);
  });

  it('un borrador NO es una oferta: el lead no pasa a QUOTED hasta emitir', async () => {
    const l = await lead('QUALIFIED');
    await create(l);
    expect((await status(l)).status).toBe('QUOTE_PREPARATION');
  });

  it('emitir exige vigencia futura; la emisión mueve el lead a QUOTED', async () => {
    const l = await lead('QUALIFIED');
    const past = qid(await create(l, 100, 'PEN', '2000-01-01'));
    await expect(issue(past)).rejects.toThrow(/validity_required/);
    const good = qid(await create(l));
    expect(((await issue(good)).rows[0] as { status: string }).status).toBe('issued');
    expect((await status(l)).status).toBe('QUOTED');
  });

  it('solo hay UNA oferta vigente: emitir la v2 reemplaza a la v1', async () => {
    const l = await lead('QUALIFIED');
    const a = qid(await create(l)); await issue(a);
    const b = qid(await create(l)); await issue(b);
    const r = await db.query(`select version, status from public.lead_quotes where quote_id=$1 order by version`, [l]);
    expect(r.rows).toEqual([{ version: 1, status: 'superseded' }, { version: 2, status: 'issued' }]);
    // Una oferta reemplazada no puede resucitar: ni por la restricción de vigente única ni por la guarda de estados.
    await expect(db.query(`update public.lead_quotes set status='issued' where quote_id=$1 and version=1`, [l])).rejects.toThrow(/quote_status_invalid|lead_quotes_one_issued_uidx/);
  });

  it('un borrador ya emitido no se puede emitir dos veces', async () => {
    const l = await lead('QUALIFIED'); const a = qid(await create(l)); await issue(a);
    await expect(issue(a)).rejects.toThrow(/quote_not_draft/);
  });

  it('la aceptación marca el lead como WON y queda auditada', async () => {
    const l = await lead('QUALIFIED'); const a = qid(await create(l)); await issue(a);
    expect(((await resolve(a, 'accepted', null)).rows[0] as { status: string }).status).toBe('accepted');
    expect(await status(l)).toEqual({ status: 'WON', loss_reason: null });
    const ev = await db.query(`select action, to_value from public.lead_events where quote_id=$1 order by created_at, id`, [l]);
    expect(ev.rows.map((e) => (e as { to_value: string }).to_value)).toContain('v1 accepted');
  });

  it('el rechazo exige motivo y marca el lead como LOST con ese motivo', async () => {
    const l = await lead('QUALIFIED'); const a = qid(await create(l)); await issue(a);
    await expect(resolve(a, 'rejected', '  ')).rejects.toThrow(/reason_required/);
    await resolve(a, 'rejected', 'precio por encima del presupuesto');
    expect(await status(l)).toEqual({ status: 'LOST', loss_reason: 'precio por encima del presupuesto' });
  });

  it('solo la oferta vigente admite resultado (no borradores ni reemplazadas)', async () => {
    const l = await lead('QUALIFIED'); const a = qid(await create(l));
    await expect(resolve(a, 'accepted', null)).rejects.toThrow(/quote_not_issued/);
    await issue(a); const b = qid(await create(l)); await issue(b);
    await expect(resolve(a, 'accepted', null)).rejects.toThrow(/quote_not_issued/); // a quedó superseded
    await expect(resolve(b, 'maybe', null)).rejects.toThrow(/invalid_outcome/);
  });

  it('restricciones de datos: importe negativo, moneda ajena y resumen vacío se rechazan', async () => {
    const l = await lead('QUALIFIED');
    await expect(create(l, -1)).rejects.toThrow();
    await expect(create(l, 100, 'EUR')).rejects.toThrow();
    await expect(create(l, 100, 'PEN', '2099-01-01', '   ')).rejects.toThrow();
  });

  it('borrar el lead borra sus cotizaciones; RLS activa sin políticas', async () => {
    const l = await lead('QUALIFIED'); await create(l);
    await db.query(`delete from public.quotes where id=$1`, [l]);
    expect((await db.query(`select 1 from public.lead_quotes`)).rows).toHaveLength(0);
    expect((await db.query(`select relrowsecurity from pg_class where relname='lead_quotes'`)).rows[0]).toEqual({ relrowsecurity: true });
    expect((await db.query(`select 1 from pg_policies where tablename='lead_quotes'`)).rows).toHaveLength(0);
  });

  it('la migración es idempotente', async () => {
    await db.exec(sql('migrations/20261023020000_rfq_quotations.sql'));
  });
});
