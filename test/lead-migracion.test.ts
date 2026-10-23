import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

/**
 * La migración se ejecuta en un Postgres REAL (PGlite, WASM) encima de
 * schema.sql: lo que se prueba son las restricciones que sostienen las
 * garantías del pipeline —unicidad de código e idempotencia, estados válidos,
 * un registro por canal— no un doble en memoria.
 */
const sql = (f: string) => readFileSync(f, 'utf8');
let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  // Stubs mínimos del esquema `auth` de Supabase que schema.sql referencia.
  await db.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
  await db.exec(sql('supabase/schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
  await db.exec(sql('supabase/migrations/20261023000000_rfq_durable_pipeline.sql'));
});

const q = (rfq: string, key: string | null) =>
  db.query(
    `insert into public.quotes(customer_email, rfq_code, idempotency_key) values ('a@b.co', $1, $2) returning id`,
    [rfq, key],
  );

describe('migración rfq_durable_pipeline (Postgres real)', () => {
  it('es idempotente: aplicarla dos veces no falla', async () => {
    await db.exec(sql('supabase/migrations/20261023000000_rfq_durable_pipeline.sql'));
  });

  it('el código RFQ es único', async () => {
    await q('RFQ-X-1', 'k1');
    await expect(q('RFQ-X-1', 'k2')).rejects.toThrow(/quotes_rfq_code_uidx/);
  });

  it('la clave de idempotencia es única: el segundo insert concurrente pierde', async () => {
    await q('RFQ-X-2', 'dup');
    await expect(q('RFQ-X-3', 'dup')).rejects.toThrow(/quotes_idempotency_key_uidx/);
    // Varias filas sin clave (históricas) siguen permitidas.
    await q('RFQ-X-4', null);
    await q('RFQ-X-5', null);
  });

  it('lead_deliveries: un registro por canal y solo canales/estados válidos', async () => {
    const { rows } = await q('RFQ-X-6', 'k6');
    const id = (rows[0] as { id: string }).id;
    await db.query(`insert into public.lead_deliveries(quote_id, channel) values ($1,'crm')`, [id]);
    await expect(db.query(`insert into public.lead_deliveries(quote_id, channel) values ($1,'crm')`, [id])).rejects.toThrow();
    await expect(db.query(`insert into public.lead_deliveries(quote_id, channel) values ($1,'sms')`, [id])).rejects.toThrow();
    await expect(db.query(`update public.lead_deliveries set status='ok' where quote_id=$1`, [id])).rejects.toThrow();
    await db.query(`update public.lead_deliveries set status='dead' where quote_id=$1`, [id]);
  });

  it('borrar la solicitud borra sus entregas (sin huérfanas)', async () => {
    const { rows } = await q('RFQ-X-7', 'k7');
    const id = (rows[0] as { id: string }).id;
    await db.query(`insert into public.lead_deliveries(quote_id, channel) values ($1,'email')`, [id]);
    await db.query(`delete from public.quotes where id=$1`, [id]);
    const left = await db.query(`select 1 from public.lead_deliveries where quote_id=$1`, [id]);
    expect(left.rows).toHaveLength(0);
  });

  it('lead_deliveries tiene RLS activa y sin políticas (solo service-role)', async () => {
    const r = await db.query(`select relrowsecurity from pg_class where relname='lead_deliveries'`);
    expect((r.rows[0] as { relrowsecurity: boolean }).relrowsecurity).toBe(true);
    const p = await db.query(`select 1 from pg_policies where tablename='lead_deliveries'`);
    expect(p.rows).toHaveLength(0);
  });
});
