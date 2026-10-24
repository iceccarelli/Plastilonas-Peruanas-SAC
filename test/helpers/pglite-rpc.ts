import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';

/** Base limpia: schema.sql + TODAS las migraciones en orden, como en un proyecto nuevo. */
export async function freshDb(): Promise<PGlite> {
  const db = new PGlite();
  const sql = (f: string) => readFileSync(`supabase/${f}`, 'utf8');
  await db.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
  await db.exec(sql('schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
  for (const f of readdirSync('supabase/migrations').sort()) await db.exec(sql(`migrations/${f}`));
  return db;
}

/**
 * Cliente con la forma de `supabase.rpc`: llama a la función SQL por NOMBRE de
 * argumento, igual que PostgREST. Así el código de producción (quoteStore,
 * rate-limit, staff-store) corre sin cambios contra Postgres real.
 */
export function rpcOver(db: PGlite) {
  return {
    async rpc(fn: string, args: Record<string, unknown> = {}) {
      const keys = Object.keys(args);
      const params = keys.map((k) => {
        const v = args[k];
        return v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
      });
      const placeholders = keys.map((k, i) => {
        const v = args[k];
        return `${k} => $${i + 1}${v !== null && typeof v === 'object' ? '::jsonb' : ''}`;
      });
      try {
        const res = await db.query(`select public.${fn}(${placeholders.join(', ')}) as r`, params as never[]);
        return { data: (res.rows[0] as { r: unknown }).r, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } };
      }
    },
  };
}

export async function seedLead(db: PGlite, over: Record<string, unknown> = {}) {
  const l = {
    status: 'QUALIFIED', full_name: 'Ana Compradora', company: 'Minera Andina SAC', customer_email: 'compras@minera.example',
    product: 'Mangas de ventilación', quantity: '12 unidades Ø600 x 50 m', payload: { ruc: '20123456786', deliveryCity: 'Arequipa' }, ...over,
  };
  const r = await db.query(
    `insert into public.quotes(customer_email, full_name, company, product, quantity, status, rfq_code, payload)
     values ($1,$2,$3,$4,$5,$6,'RFQ-20261024-' || upper(substr(gen_random_uuid()::text,1,8)), $7::jsonb) returning id, rfq_code`,
    [l.customer_email, l.full_name, l.company, l.product, l.quantity, l.status, JSON.stringify(l.payload)],
  );
  return r.rows[0] as { id: string; rfq_code: string };
}
