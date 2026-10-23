/**
 * Operaciones del personal sobre los leads. TODAS exigen un `actor`
 * (correo del personal autenticado) y dejan rastro en lead_events.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { BUCKET } from '@/lib/attachments';
import { normalizeStatus, transitionError, type LeadStatus } from '@/lib/lead-workflow';
import type { Channel, DeliveryStatus } from '@/lib/lead-store';

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
}

export type ActionResult = { ok: true } | { ok: false; error: 'not_found' | 'invalid_transition' | 'reason_required' | 'conflict' | 'failed' };

export interface StaffStore {
  listLeads(opts: { status?: LeadStatus; onlyProblems?: boolean; limit?: number }): Promise<LeadSummary[]>;
  getLead(id: string): Promise<LeadDetail | null>;
  assign(id: string, actor: string, assignee: string): Promise<ActionResult>;
  transition(id: string, actor: string, to: LeadStatus, reason?: string): Promise<ActionResult>;
  attachmentUrl(attachmentId: string, actor: string): Promise<string | null>;
  requeueDelivery(id: string, actor: string, channel: Channel): Promise<ActionResult>;
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
        .select('*, lead_deliveries(*), lead_attachments(*), lead_events(*)')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      const r = data as unknown as DetailRow;
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
  };
}
