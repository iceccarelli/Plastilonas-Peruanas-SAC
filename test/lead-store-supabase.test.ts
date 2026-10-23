import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseLeadStore, isMissingSchema } from '@/lib/lead-store';
import { submitLead, _resetBurst } from '@/lib/lead-service';

/**
 * Cliente de Supabase mínimo que se comporta como PostgREST ANTES de aplicar
 * la migración: rechaza las columnas nuevas (PGRST204) y no tiene lead_deliveries.
 */
function preMigrationClient() {
  const inserted: Array<Record<string, unknown>> = [];
  const db = {
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          return {
            select: () => ({
              single: async () => {
                if (table !== 'quotes') return { data: null, error: { code: 'PGRST205' } };
                if ('idempotency_key' in row || 'ip_hash' in row) return { data: null, error: { code: 'PGRST204' } };
                inserted.push(row);
                return { data: { id: 'q1', rfq_code: row.rfq_code }, error: null };
              },
            }),
          };
        },
        select: () => ({ eq: () => ({ gte: async () => ({ count: null, error: { code: 'PGRST204' } }) }) }),
        upsert: async () => ({ error: { code: 'PGRST205' } }),
        update: () => ({ eq: () => ({ eq: async () => ({ error: { code: 'PGRST205' } }) }) }),
      };
    },
  } as unknown as SupabaseClient;
  return { db, inserted };
}

describe('despliegue antes de la migración', () => {
  it('clasifica los códigos de esquema faltante', () => {
    expect(['42703', '42P01', 'PGRST204', 'PGRST205'].every(isMissingSchema)).toBe(true);
    expect(isMissingSchema('23505')).toBe(false);
  });

  it('el lead se sigue guardando (sin columnas nuevas) (aceptado, durabilidad database)', async () => {
    _resetBurst();
    const { db, inserted } = preMigrationClient();
    const r = await submitLead(
      { email: 'qa@example.com', telefono: '999000111', nombre: 'QA' }, '9.9.9.1',
      { store: supabaseLeadStore(db), env: {} },
    );
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ accepted: true, durability: 'database' });
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).not.toHaveProperty('idempotency_key');
  });
});
