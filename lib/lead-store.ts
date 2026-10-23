/**
 * Persistencia del lead detrás de una interfaz. La implementación de Supabase
 * es la de producción; la de memoria (test/helpers) aplica las MISMAS
 * restricciones de unicidad para probar el flujo sin red.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import type { LeadInput } from '@/lib/lead-schema';

export type Channel = 'crm' | 'email';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'dead';

export interface QuoteRow {
  id: string;
  rfqId: string;
}

export interface DeliveryRow {
  id: string;
  quoteId: string;
  channel: Channel;
  status: DeliveryStatus;
  attempts: number;
}

export interface DeliveryOutcome {
  status: DeliveryStatus;
  attempts: number;
  lastError: string | null;
  lastHttpStatus: number | null;
  nextAttemptAt: Date | null;
}

export type InsertResult =
  /** `degraded`: la migración del pipeline aún no está aplicada; se guardó sin clave de idempotencia. */
  | { kind: 'created'; quote: QuoteRow; degraded?: boolean }
  | { kind: 'rfq_collision' }
  | { kind: 'duplicate'; quote: QuoteRow; deliveries: Record<string, DeliveryStatus> };

export interface NewQuote {
  rfqId: string;
  idempotencyKey: string;
  ipHash: string | null;
  source: string;
  lead: LeadInput;
}

export interface LeadStore {
  insertQuote(q: NewQuote): Promise<InsertResult>;
  /** Solicitudes aceptadas desde este hash de IP en la ventana. */
  countRecentByIp(ipHash: string, sinceMs: number): Promise<number>;
  createDeliveries(quoteId: string, channels: Channel[]): Promise<void>;
  recordDelivery(quoteId: string, channel: Channel, outcome: DeliveryOutcome): Promise<void>;
  /** Entregas vencidas (pending/failed con next_attempt_at <= ahora) con su lead. */
  dueDeliveries(limit: number): Promise<Array<DeliveryRow & { rfqId: string; lead: LeadInput }>>;
  /** Conteos por estado y antigüedad: sin datos personales. */
  deliveryHealth(): Promise<{ pending: number; failed: number; dead: number; oldestDueAgeSec: number | null }>;
}

export function fuenteMensaje(lead: LeadInput): string {
  return [
    lead.application,
    lead.dimensions,
    lead.material,
    lead.country && `Origen: ${lead.city || ''} ${lead.country}`.trim(),
    lead.deliveryCountry && `Entrega: ${lead.deliveryCity || ''} ${lead.deliveryCountry}`.trim(),
    lead.mensaje,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Columna/tabla inexistente: Postgres 42703/42P01 o PostgREST PGRST204/PGRST205. */
export function isMissingSchema(code: string | undefined): boolean {
  return code === '42703' || code === '42P01' || code === 'PGRST204' || code === 'PGRST205';
}

export function supabaseLeadStore(db: SupabaseClient = supabaseAdmin()): LeadStore {

  return {
    async insertQuote(q) {
      const { lead } = q;
      const row = {
        customer_email: lead.email,
        full_name: lead.nombre || lead.contact || '',
        company: lead.empresa,
        phone: lead.telefono,
        product: lead.producto ?? null,
        quantity: lead.cantidad ?? null,
        rfq_code: q.rfqId,
        country: lead.deliveryCountry || lead.country || null,
        industry: lead.industry ?? null,
        status: 'NEW',
        source: q.source,
        payload: lead,
        message: fuenteMensaje(lead),
      };
      let { data, error } = await db
        .from('quotes')
        .insert({ ...row, idempotency_key: q.idempotencyKey, ip_hash: q.ipHash })
        .select('id, rfq_code')
        .single();
      // Despliegue antes de aplicar la migración: guardar el lead sin las
      // columnas nuevas es mejor que perderlo. Sin idempotencia hasta migrar.
      if (error && isMissingSchema(error.code)) {
        ({ data, error } = await db.from('quotes').insert(row).select('id, rfq_code').single());
        if (!error && data) {
          return { kind: 'created', quote: { id: data.id, rfqId: data.rfq_code }, degraded: true };
        }
      }
      if (!error && data) return { kind: 'created', quote: { id: data.id, rfqId: data.rfq_code } };

      if (error?.code === '23505') {
        const text = `${error.message} ${error.details ?? ''}`;
        if (text.includes('quotes_rfq_code_uidx') || text.includes('rfq_code')) {
          return { kind: 'rfq_collision' };
        }
        const { data: existing } = await db
          .from('quotes')
          .select('id, rfq_code, lead_deliveries(channel, status)')
          .eq('idempotency_key', q.idempotencyKey)
          .single();
        if (existing) {
          const deliveries: Record<string, DeliveryStatus> = {};
          for (const d of (existing.lead_deliveries ?? []) as Array<{ channel: string; status: DeliveryStatus }>) {
            deliveries[d.channel] = d.status;
          }
          return { kind: 'duplicate', quote: { id: existing.id, rfqId: existing.rfq_code }, deliveries };
        }
      }
      throw new Error(`quotes insert failed: ${error?.code ?? 'unknown'}`);
    },

    async countRecentByIp(ipHash, sinceMs) {
      const since = new Date(Date.now() - sinceMs).toISOString();
      const { count, error } = await db
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since);
      if (error) throw new Error(`rate count failed: ${error.code ?? 'unknown'}`);
      return count ?? 0;
    },

    async createDeliveries(quoteId, channels) {
      if (!channels.length) return;
      const { error } = await db
        .from('lead_deliveries')
        .upsert(
          channels.map((channel) => ({ quote_id: quoteId, channel })),
          { onConflict: 'quote_id,channel', ignoreDuplicates: true },
        );
      if (error) throw new Error(`deliveries create failed: ${error.code ?? 'unknown'}`);
    },

    async recordDelivery(quoteId, channel, o) {
      const now = new Date().toISOString();
      const { error } = await db
        .from('lead_deliveries')
        .update({
          status: o.status,
          attempts: o.attempts,
          last_error: o.lastError,
          last_http_status: o.lastHttpStatus,
          last_attempt_at: now,
          next_attempt_at: o.nextAttemptAt ? o.nextAttemptAt.toISOString() : null,
          delivered_at: o.status === 'delivered' ? now : null,
        })
        .eq('quote_id', quoteId)
        .eq('channel', channel);
      if (error) throw new Error(`delivery record failed: ${error.code ?? 'unknown'}`);
    },

    async dueDeliveries(limit) {
      const { data, error } = await db
        .from('lead_deliveries')
        .select('id, quote_id, channel, status, attempts, quotes(rfq_code, payload)')
        .in('status', ['pending', 'failed'])
        .lte('next_attempt_at', new Date().toISOString())
        .order('next_attempt_at', { ascending: true })
        .limit(limit);
      if (error) throw new Error(`due query failed: ${error.code ?? 'unknown'}`);
      type Row = {
        id: string; quote_id: string; channel: Channel; status: DeliveryStatus; attempts: number;
        quotes: { rfq_code: string; payload: LeadInput } | { rfq_code: string; payload: LeadInput }[] | null;
      };
      return ((data ?? []) as unknown as Row[]).flatMap((r) => {
        const q = Array.isArray(r.quotes) ? r.quotes[0] : r.quotes;
        if (!q) return [];
        return [{
          id: r.id, quoteId: r.quote_id, channel: r.channel, status: r.status,
          attempts: r.attempts, rfqId: q.rfq_code, lead: q.payload,
        }];
      });
    },

    async deliveryHealth() {
      const count = async (status: DeliveryStatus) => {
        const { count: c, error } = await db
          .from('lead_deliveries').select('id', { count: 'exact', head: true }).eq('status', status);
        if (error) throw new Error(`health count failed: ${error.code ?? 'unknown'}`);
        return c ?? 0;
      };
      const [pending, failed, dead] = await Promise.all([count('pending'), count('failed'), count('dead')]);
      const { data } = await db
        .from('lead_deliveries')
        .select('next_attempt_at')
        .in('status', ['pending', 'failed'])
        .order('next_attempt_at', { ascending: true })
        .limit(1);
      const oldest = data?.[0]?.next_attempt_at ? new Date(data[0].next_attempt_at).getTime() : null;
      return {
        pending, failed, dead,
        oldestDueAgeSec: oldest === null ? null : Math.max(0, Math.round((Date.now() - oldest) / 1000)),
      };
    },
  };
}
