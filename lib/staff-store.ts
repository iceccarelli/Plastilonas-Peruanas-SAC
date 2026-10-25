/**
 * Operaciones del personal sobre los leads. TODAS exigen un `actor`
 * (correo del personal autenticado) y dejan rastro en lead_events.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { BUCKET } from '@/lib/attachments';
import { normalizeStatus, transitionError, type LeadStatus } from '@/lib/lead-workflow';
import type { Channel, DeliveryStatus } from '@/lib/lead-store';
import { computeDraft, quoteErrorOf, type QuoteDraftInputT, type QuoteError } from '@/lib/quotations';
import { issuerFromSite } from '@/lib/quote-snapshot';

export interface LeadSummary {
  id: string;
  rfqId: string;
  status: LeadStatus;
  assignedTo: string | null;
  company: string | null;
  product: string | null;
  createdAt: string;
  source: string | null;
  deliveries: Partial<Record<Channel, DeliveryStatus>>;
  attachmentCount: number;
}

export interface LeadDetail extends LeadSummary {
  fullName: string | null;
  email: string;
  phone: string | null;
  quantity: string | null;
  message: string | null;
  lossReason: string | null;
  payload: Record<string, unknown>;
  deliveryDetail: Array<{ channel: Channel; status: DeliveryStatus; attempts: number; lastError: string | null; lastHttpStatus: number | null; nextAttemptAt: string | null }>;
  attachments: Array<{ id: string; filename: string; sizeBytes: number | null; mimeType: string | null }>;
  events: Array<{ actor: string; action: string; from: string | null; to: string | null; note: string | null; at: string }>;
  quotes: StaffQuote[];
}

export interface StaffQuoteDelivery {
  status: 'queued' | 'blocked' | 'sent' | 'confirmed' | 'failed' | 'dead';
  attempts: number; lastError: string | null; lastHttpStatus: number | null;
  sentAt: string | null; confirmedAt: string | null; nextAttemptAt: string | null; generation: number;
}

export interface StaffQuote {
  id: string; version: number; status: string; amountCents: number; currency: string; validUntil: string | null;
  summary: string; notes: string | null; createdBy: string; issuedBy: string | null; issuedAt: string | null;
  resolutionReason: string | null; resolvedAt: string | null; resolvedVia: 'staff' | 'customer' | null;
  lineItems: Array<{ description: string; quantity: string; unit: string; unit_price_cents: number; amount_cents: number }>;
  subtotalCents: number | null; taxTreatment: 'included' | 'excluded' | 'exempt' | null; taxLabel: string | null;
  taxCents: number | null; terms: string | null; snapshotHash: string | null; snapshot: unknown;
  delivery: StaffQuoteDelivery | null;
}

export type QuoteResult = { ok: true } | { ok: false; error: QuoteError };

export type ActionResult = { ok: true } | { ok: false; error: 'not_found' | 'invalid_transition' | 'reason_required' | 'conflict' | 'failed' };

export interface StaffStore {
  listLeads(opts: { status?: LeadStatus; onlyProblems?: boolean; limit?: number }): Promise<LeadSummary[]>;
  getLead(id: string): Promise<LeadDetail | null>;
  assign(id: string, actor: string, assignee: string): Promise<ActionResult>;
  transition(id: string, actor: string, to: LeadStatus, reason?: string): Promise<ActionResult>;
  attachmentUrl(attachmentId: string, actor: string): Promise<string | null>;
  requeueDelivery(id: string, actor: string, channel: Channel): Promise<ActionResult>;
  createQuote(leadId: string, actor: string, input: QuoteDraftInputT): Promise<QuoteResult>;
  updateQuote(quoteId: string, actor: string, input: QuoteDraftInputT): Promise<QuoteResult>;
  issueQuote(quoteId: string, actor: string): Promise<QuoteResult>;
  resolveQuote(quoteId: string, actor: string, outcome: 'accepted' | 'rejected', reason?: string): Promise<QuoteResult>;
}

type QuoteRow = {
  id: string; rfq_code: string | null; status: string | null; assigned_to: string | null;
  company: string | null; product: string | null; created_at: string; source: string | null;
  lead_deliveries?: Array<{ channel: Channel; status: DeliveryStatus }>;
  lead_attachments?: Array<{ id: string }>;
};

type DetailRow = Omit<QuoteRow, 'lead_deliveries' | 'lead_attachments'> & {
  full_name: string | null; customer_email: string; phone: string | null; quantity: string | null;
  message: string | null; loss_reason: string | null; payload: Record<string, unknown> | null;
  lead_deliveries?: Array<{ channel: Channel; status: DeliveryStatus; attempts: number; last_error: string | null; last_http_status: number | null; next_attempt_at: string | null }>;
  lead_attachments?: Array<{ id: string; filename: string; size_bytes: number | null; mime_type: string | null }>;
  lead_quotes?: Array<{
    id: string; version: number; status: string; amount_cents: number | string; currency: string; valid_until: string | null;
    summary: string; notes: string | null; created_by: string; issued_by: string | null; issued_at: string | null;
    resolution_reason: string | null; resolved_at?: string | null; resolved_via?: 'staff' | 'customer' | null;
    line_items?: StaffQuote['lineItems'] | null; subtotal_cents?: number | string | null; tax_treatment?: StaffQuote['taxTreatment'];
    tax_label?: string | null; tax_cents?: number | string | null; customer_terms?: string | null; snapshot_hash?: string | null; snapshot?: unknown;
  }>;
  lead_events?: Array<{ actor: string; action: string; from_value: string | null; to_value: string | null; note: string | null; created_at: string }>;
};

function summary(r: Pick<QuoteRow, 'id' | 'rfq_code' | 'status' | 'assigned_to' | 'company' | 'product' | 'created_at' | 'source'> & { lead_deliveries?: QuoteRow['lead_deliveries']; lead_attachments?: Array<{ id: string }> }): LeadSummary {
  const deliveries: LeadSummary['deliveries'] = {};
  for (const d of r.lead_deliveries ?? []) deliveries[d.channel] = d.status;
  return {
    id: r.id, rfqId: r.rfq_code ?? r.id.slice(0, 8), status: normalizeStatus(r.status),
    assignedTo: r.assigned_to, company: r.company, product: r.product,
    createdAt: r.created_at, source: r.source, deliveries,
    attachmentCount: r.lead_attachments?.length ?? 0,
  };
}

export function supabaseStaffStore(db: SupabaseClient = supabaseAdmin()): StaffStore {
  async function audit(quoteId: string, actor: string, action: string, from: string | null, to: string | null, note?: string) {
    const { error } = await db.from('lead_events').insert({ quote_id: quoteId, actor, action, from_value: from, to_value: to, note: note ?? null });
    if (error) throw new Error(`audit failed: ${error.code ?? 'unknown'}`);
  }

  async function current(id: string) {
    const { data } = await db.from('quotes').select('id, status, assigned_to').eq('id', id).maybeSingle();
    return data as { id: string; status: string | null; assigned_to: string | null } | null;
  }

  return {
    async listLeads({ status, onlyProblems, limit = 100 }) {
      let q = db
        .from('quotes')
        .select('id, rfq_code, status, assigned_to, company, product, created_at, source, lead_deliveries(channel, status), lead_attachments(id)')
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 200));
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw new Error(`list failed: ${error.code ?? 'unknown'}`);
      const rows = ((data ?? []) as unknown as QuoteRow[]).map(summary);
      return onlyProblems
        ? rows.filter((r) => Object.values(r.deliveries).some((s) => s === 'failed' || s === 'dead'))
        : rows;
    },

    async getLead(id) {
      const { data, error } = await db
        .from('quotes')
        .select('*, lead_deliveries(*), lead_attachments(*), lead_events(*), lead_quotes(*)')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      const r = data as unknown as DetailRow;
      // Entregas de cotización en una consulta aparte y tolerante: si la migración
      // del recorrido del cliente aún no está, el panel sigue funcionando sin ellas.
      const deliveries = new Map<string, StaffQuoteDelivery>();
      const ids = (r.lead_quotes ?? []).map((x) => x.id);
      if (ids.length) {
        const { data: dl } = await db.from('quote_deliveries')
          .select('lead_quote_id, status, attempts, last_error, last_http_status, sent_at, confirmed_at, next_attempt_at, generation')
          .in('lead_quote_id', ids);
        for (const d of (dl ?? []) as Array<Record<string, unknown>>) {
          deliveries.set(String(d.lead_quote_id), {
            status: d.status as StaffQuoteDelivery['status'], attempts: Number(d.attempts), lastError: (d.last_error as string | null) ?? null,
            lastHttpStatus: (d.last_http_status as number | null) ?? null, sentAt: (d.sent_at as string | null) ?? null,
            confirmedAt: (d.confirmed_at as string | null) ?? null, nextAttemptAt: (d.next_attempt_at as string | null) ?? null,
            generation: Number(d.generation ?? 1),
          });
        }
      }
      return {
        ...summary(r),
        fullName: r.full_name ?? null, email: r.customer_email, phone: r.phone ?? null,
        quantity: r.quantity ?? null, message: r.message ?? null, lossReason: r.loss_reason ?? null,
        payload: r.payload ?? {},
        deliveryDetail: (r.lead_deliveries ?? []).map((d) => ({
          channel: d.channel, status: d.status, attempts: d.attempts, lastError: d.last_error,
          lastHttpStatus: d.last_http_status, nextAttemptAt: d.next_attempt_at,
        })),
        attachments: (r.lead_attachments ?? []).map((a) => ({
          id: a.id, filename: a.filename, sizeBytes: a.size_bytes, mimeType: a.mime_type,
        })),
        quotes: [...(r.lead_quotes ?? [])].sort((a, b) => b.version - a.version).map((x) => ({
          id: x.id, version: x.version, status: x.status, amountCents: Number(x.amount_cents), currency: x.currency,
          validUntil: x.valid_until, summary: x.summary, notes: x.notes, createdBy: x.created_by,
          issuedBy: x.issued_by, issuedAt: x.issued_at, resolutionReason: x.resolution_reason,
          resolvedAt: x.resolved_at ?? null, resolvedVia: x.resolved_via ?? null,
          lineItems: x.line_items ?? [], subtotalCents: x.subtotal_cents == null ? null : Number(x.subtotal_cents),
          taxTreatment: x.tax_treatment ?? null, taxLabel: x.tax_label ?? null,
          taxCents: x.tax_cents == null ? null : Number(x.tax_cents), terms: x.customer_terms ?? null,
          snapshotHash: x.snapshot_hash ?? null, snapshot: x.snapshot ?? null, delivery: deliveries.get(x.id) ?? null,
        })),
        events: [...(r.lead_events ?? [])]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((e) => ({ actor: e.actor, action: e.action, from: e.from_value, to: e.to_value, note: e.note, at: e.created_at })),
      };
    },

    async assign(id, actor, assignee) {
      const cur = await current(id);
      if (!cur) return { ok: false, error: 'not_found' };
      const from = normalizeStatus(cur.status);
      // Asignar un lead NEW lo mueve a ASSIGNED; en otros estados solo cambia el responsable.
      const nextStatus = from === 'NEW' ? 'ASSIGNED' : from;
      const { data, error } = await db
        .from('quotes')
        .update({ assigned_to: assignee, status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id).eq('status', cur.status ?? 'NEW')
        .select('id');
      if (error) return { ok: false, error: 'failed' };
      if (!data?.length) return { ok: false, error: 'conflict' };
      await audit(id, actor, 'assign', cur.assigned_to, assignee);
      if (nextStatus !== from) await audit(id, actor, 'status', from, nextStatus);
      return { ok: true };
    },

    async transition(id, actor, to, reason) {
      const cur = await current(id);
      if (!cur) return { ok: false, error: 'not_found' };
      const err = transitionError(cur.status, to, reason);
      if (err) return { ok: false, error: err as 'invalid_transition' | 'reason_required' };
      const { data, error } = await db
        .from('quotes')
        .update({ status: to, loss_reason: to === 'LOST' ? reason!.trim() : null, updated_at: new Date().toISOString() })
        .eq('id', id).eq('status', cur.status ?? 'NEW') // optimista: si cambió entre tanto, 409
        .select('id');
      if (error) return { ok: false, error: 'failed' };
      if (!data?.length) return { ok: false, error: 'conflict' };
      await audit(id, actor, 'status', normalizeStatus(cur.status), to, reason);
      return { ok: true };
    },

    async attachmentUrl(attachmentId, actor) {
      const { data: a } = await db.from('lead_attachments').select('quote_id, path, filename').eq('id', attachmentId).maybeSingle();
      if (!a) return null;
      // Descarga forzada (nunca en línea) y válida 5 minutos.
      const { data, error } = await db.storage.from(BUCKET).createSignedUrl(a.path, 300, { download: a.filename });
      if (error || !data) return null;
      await audit(a.quote_id, actor, 'download', null, a.filename);
      return data.signedUrl;
    },

    async requeueDelivery(id, actor, channel) {
      const { data, error } = await db
        .from('lead_deliveries')
        .update({ status: 'pending', next_attempt_at: new Date().toISOString() })
        .eq('quote_id', id).eq('channel', channel).in('status', ['failed', 'dead'])
        .select('id');
      if (error) return { ok: false, error: 'failed' };
      if (!data?.length) return { ok: false, error: 'not_found' };
      await audit(id, actor, 'retry_delivery', null, channel);
      return { ok: true };
    },

    async createQuote(leadId, actor, i) {
      const c = computeDraft(i);
      const { error } = await db.rpc('lead_quote_create', {
        p_quote: leadId, p_actor: actor, p_amount: c.totalCents, p_currency: i.currency,
        p_valid_until: i.validUntil, p_summary: i.summary, p_notes: i.notes ?? null,
        p_items: c.items, p_tax_treatment: i.taxTreatment, p_tax_label: i.taxLabel,
        p_tax_cents: c.taxCents, p_terms: i.terms ?? null,
      });
      return error ? { ok: false, error: quoteErrorOf(error.message) } : { ok: true };
    },

    async updateQuote(quoteId, actor, i) {
      const c = computeDraft(i);
      const { error } = await db.rpc('lead_quote_update_draft', {
        p_id: quoteId, p_actor: actor, p_amount: c.totalCents, p_currency: i.currency,
        p_valid_until: i.validUntil, p_summary: i.summary, p_notes: i.notes ?? null,
        p_items: c.items, p_tax_treatment: i.taxTreatment, p_tax_label: i.taxLabel,
        p_tax_cents: c.taxCents, p_terms: i.terms ?? null,
      });
      return error ? { ok: false, error: quoteErrorOf(error.message) } : { ok: true };
    },

    async issueQuote(quoteId, actor) {
      const { error } = await db.rpc('lead_quote_issue', { p_id: quoteId, p_actor: actor, p_issuer: issuerFromSite() });
      return error ? { ok: false, error: quoteErrorOf(error.message) } : { ok: true };
    },

    async resolveQuote(quoteId, actor, outcome, reason) {
      const { error } = await db.rpc('lead_quote_resolve', { p_id: quoteId, p_actor: actor, p_outcome: outcome, p_reason: reason ?? null });
      return error ? { ok: false, error: quoteErrorOf(error.message) } : { ok: true };
    },
  };
}
