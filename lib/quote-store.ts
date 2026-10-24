/**
 * Acceso a datos de la cotización al cliente. TODA operación es una función SQL
 * (rpc): un único contrato que la base hace cumplir de forma atómica y que se
 * puede probar contra Postgres real o contra un servidor de prueba.
 */
import { supabaseAdmin } from '@/lib/supabase';
import { quoteErrorOf, type QuoteError } from '@/lib/quotations';
import { parseSnapshot, type QuoteSnapshotT } from '@/lib/quote-snapshot';
import type { RpcClient } from '@/lib/rate-limit';

export type PublicQuoteView =
  | { state: 'not_found' }
  | { state: 'expired' }
  | { state: 'revoked'; reason: 'superseded' | 'manual' }
  | { state: 'open' | 'resolved'; outcome: 'accepted' | 'rejected' | null; resolvedAt: string | null; snapshot: QuoteSnapshotT; snapshotHash: string; quoteId: string };

export type DecideError =
  | 'link_invalid' | 'link_revoked' | 'link_expired' | 'already_resolved' | 'quote_not_current'
  | 'offer_expired' | 'reason_required' | 'reason_too_long' | 'invalid_request' | 'invalid_outcome' | 'failed';

const DECIDE_KNOWN: DecideError[] = [
  'link_invalid', 'link_revoked', 'link_expired', 'already_resolved', 'quote_not_current',
  'offer_expired', 'reason_required', 'reason_too_long', 'invalid_request', 'invalid_outcome',
];
export const decideErrorOf = (m: string | undefined): DecideError => DECIDE_KNOWN.find((k) => (m ?? '').includes(k)) ?? 'failed';

export type DecideResult =
  | { ok: true; outcome: 'accepted' | 'rejected'; replayed: boolean; resolvedAt: string | null }
  | { ok: false; error: DecideError };

export interface ClaimedDelivery {
  id: string; leadQuoteId: string; generation: number; attempts: number; recipient: string;
  reference: string; validUntil: string; snapshot: QuoteSnapshotT; snapshotHash: string;
}

export type DeliveryRecordStatus = 'blocked' | 'sent' | 'failed' | 'dead';

export interface QuoteDeliveryHealth {
  queued: number; blocked: number; sent: number; confirmed: number; failed: number; dead: number;
  oldestDueAgeSec: number | null;
}

export function quoteStore(db: RpcClient = supabaseAdmin()) {
  const call = async (fn: string, args: Record<string, unknown>) => {
    const { data, error } = await db.rpc(fn, args);
    if (error) throw Object.assign(new Error(error.message), { code: error.code });
    return data;
  };
  return {
    async publicView(tokenHash: string): Promise<PublicQuoteView> {
      const d = (await call('quote_public_view', { p_hash: tokenHash })) as Record<string, unknown> | null;
      const state = d?.state;
      if (state === 'not_found') return { state };
      if (state === 'expired') return { state };
      if (state === 'revoked') return { state, reason: d?.reason === 'superseded' ? 'superseded' : 'manual' };
      if (state === 'open' || state === 'resolved') {
        const snapshot = parseSnapshot(d?.snapshot);
        // Una instantánea que no cumple el contrato no se muestra: mejor «no disponible» que datos dudosos.
        if (!snapshot || typeof d?.snapshotHash !== 'string') return { state: 'not_found' };
        return {
          state, outcome: d?.outcome === 'accepted' || d?.outcome === 'rejected' ? d.outcome : null,
          resolvedAt: typeof d?.resolvedAt === 'string' ? d.resolvedAt : null,
          snapshot, snapshotHash: d.snapshotHash, quoteId: String(d.quoteId),
        };
      }
      return { state: 'not_found' };
    },

    async decide(tokenHash: string, outcome: 'accepted' | 'rejected', reason: string | null, requestKey: string): Promise<DecideResult> {
      try {
        const d = (await call('quote_customer_decide', {
          p_hash: tokenHash, p_outcome: outcome, p_reason: reason, p_request_key: requestKey,
        })) as { outcome: 'accepted' | 'rejected'; replayed: boolean; resolvedAt: string | null };
        return { ok: true, outcome: d.outcome, replayed: d.replayed, resolvedAt: d.resolvedAt ?? null };
      } catch (e) {
        return { ok: false, error: decideErrorOf((e as Error).message) };
      }
    },

    async registerToken(leadQuoteId: string, tokenHash: string, generation: number, expiresAt: Date): Promise<void> {
      await call('quote_token_register', { p_quote: leadQuoteId, p_hash: tokenHash, p_generation: generation, p_expires: expiresAt.toISOString() });
    },

    async rotateLink(leadQuoteId: string, actor: string): Promise<{ ok: true } | { ok: false; error: QuoteError }> {
      try { await call('quote_token_rotate', { p_quote: leadQuoteId, p_actor: actor }); return { ok: true }; }
      catch (e) { return { ok: false, error: quoteErrorOf((e as Error).message) }; }
    },

    async requeueDelivery(leadQuoteId: string, actor: string): Promise<{ ok: true; requeued: boolean } | { ok: false; error: QuoteError }> {
      try { return { ok: true, requeued: Boolean(await call('quote_delivery_requeue', { p_lead_quote: leadQuoteId, p_actor: actor })) }; }
      catch (e) { return { ok: false, error: quoteErrorOf((e as Error).message) }; }
    },

    async claimDeliveries(limit: number): Promise<ClaimedDelivery[]> {
      const rows = ((await call('quote_delivery_claim', { p_limit: limit })) as Array<Record<string, unknown>> | null) ?? [];
      return rows.flatMap((r) => {
        const snapshot = parseSnapshot(r.snapshot);
        if (!snapshot) return [];
        return [{
          id: String(r.id), leadQuoteId: String(r.leadQuoteId), generation: Number(r.generation), attempts: Number(r.attempts),
          recipient: String(r.recipient ?? ''), reference: String(r.reference ?? ''), validUntil: String(r.validUntil),
          snapshot, snapshotHash: String(r.snapshotHash),
        }];
      });
    },

    async recordDelivery(id: string, status: DeliveryRecordStatus, attempts: number, error: string | null, http: number | null, messageId: string | null, next: Date | null): Promise<void> {
      await call('quote_delivery_record', {
        p_id: id, p_status: status, p_attempts: attempts, p_error: error, p_http: http,
        p_message_id: messageId, p_next: next ? next.toISOString() : null,
      });
    },

    async providerEvent(eventId: string, messageId: string, type: string): Promise<{ claimed: boolean; updated: boolean }> {
      const d = (await call('quote_delivery_provider_event', { p_event: eventId, p_message_id: messageId, p_type: type })) as { claimed: boolean; updated: boolean };
      return { claimed: Boolean(d?.claimed), updated: Boolean(d?.updated) };
    },

    async health(): Promise<QuoteDeliveryHealth> {
      const d = (await call('quote_delivery_health', {})) as Record<string, number | null>;
      return {
        queued: Number(d.queued ?? 0), blocked: Number(d.blocked ?? 0), sent: Number(d.sent ?? 0),
        confirmed: Number(d.confirmed ?? 0), failed: Number(d.failed ?? 0), dead: Number(d.dead ?? 0),
        oldestDueAgeSec: d.oldestDueAgeSec === null || d.oldestDueAgeSec === undefined ? null : Number(d.oldestDueAgeSec),
      };
    },
  };
}
export type QuoteStore = ReturnType<typeof quoteStore>;
