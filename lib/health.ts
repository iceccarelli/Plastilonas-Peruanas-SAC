/**
 * Verificaciones profundas: cada una produce evidencia de que algo FUNCIONA
 * (o de por qué no), no solo de que una variable existe.
 */
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { BUCKET } from '@/lib/attachments';
import { canCaptureLeads } from '@/lib/config';

export interface Check {
  id: string;
  status: 'pass' | 'fail' | 'skip';
  detail: string;
}

const MISSING = new Set(['42703', '42P01', 'PGRST204', 'PGRST205']);

export async function deepChecks(env: Record<string, string | undefined> = process.env): Promise<Check[]> {
  if (!isSupabaseConfigured() || !env.SUPABASE_SERVICE_ROLE_KEY || !canCaptureLeads(env)) {
    return [{ id: 'database', status: 'skip', detail: 'Supabase no configurado: los RFQ no se guardan.' }];
  }
  const db = supabaseAdmin();
  const out: Check[] = [];

  const probe = async (id: string, table: string, cols: string, hint: string) => {
    const { error } = await db.from(table).select(cols, { head: true, count: 'exact' }).limit(1);
    if (!error) out.push({ id, status: 'pass', detail: 'Consulta correcta.' });
    else if (MISSING.has(error.code ?? '')) out.push({ id, status: 'fail', detail: `Migración pendiente: ${hint}` });
    else out.push({ id, status: 'fail', detail: `Error de base (${error.code ?? 'desconocido'}).` });
  };
  await probe('migration_pipeline', 'quotes', 'idempotency_key, ip_hash', '20261023000000_rfq_durable_pipeline.sql');
  await probe('migration_deliveries', 'lead_deliveries', 'id', '20261023000000_rfq_durable_pipeline.sql');
  await probe('migration_attachments_staff', 'lead_attachments', 'id', '20261023010000_rfq_attachments_staff.sql');
  await probe('migration_quotations', 'lead_quotes', 'id', '20261023020000_rfq_quotations.sql');
  await probe('migration_quote_journey', 'quote_deliveries', 'id', '20261024000000_quotation_customer_journey.sql');

  try {
    const { data, error } = await db.storage.getBucket(BUCKET);
    if (error || !data) out.push({ id: 'bucket', status: 'fail', detail: `Bucket ${BUCKET} inexistente: aplicar la migración de adjuntos.` });
    else out.push({ id: 'bucket', status: data.public ? 'fail' : 'pass', detail: data.public ? 'El bucket es PÚBLICO: debe ser privado.' : 'Bucket privado presente.' });
  } catch {
    out.push({ id: 'bucket', status: 'fail', detail: 'No se pudo consultar Storage.' });
  }

  // Evidencia de conexión REAL: la última entrega confirmada por canal.
  for (const channel of ['crm', 'email'] as const) {
    const { data, error } = await db
      .from('lead_deliveries').select('delivered_at').eq('channel', channel).eq('status', 'delivered')
      .order('delivered_at', { ascending: false }).limit(1);
    if (error) continue; // la migración ya se reportó arriba
    out.push({
      id: `delivery_${channel}`, status: data?.length ? 'pass' : 'skip',
      detail: data?.length ? `Última entrega confirmada: ${data[0].delivered_at}` : 'Aún sin una entrega confirmada: conexión no demostrada.',
    });
  }

  for (const status of ['failed', 'dead'] as const) {
    const { count, error } = await db.from('lead_deliveries').select('id', { count: 'exact', head: true }).eq('status', status);
    if (error) continue;
    out.push({ id: `deliveries_${status}`, status: status === 'dead' && count ? 'fail' : 'pass', detail: `${count ?? 0} entregas en estado ${status}.` });
  }

  // Cotizaciones al cliente: lo que importa es que NO haya ofertas emitidas que el cliente no recibió.
  const { data: qh, error: qhErr } = await db.rpc('quote_delivery_health');
  if (!qhErr && qh) {
    const h = qh as Record<string, number>;
    out.push({ id: 'quote_deliveries_dead', status: h.dead > 0 ? 'fail' : 'pass', detail: `${h.dead ?? 0} cotizaciones sin entregar (agotaron reintentos o rebotaron).` });
    out.push({ id: 'quote_deliveries_blocked', status: h.blocked > 0 ? 'fail' : 'pass', detail: `${h.blocked ?? 0} cotizaciones bloqueadas por configuración (correo o secreto del enlace).` });
    out.push({ id: 'quote_deliveries_confirmed', status: h.confirmed > 0 ? 'pass' : 'skip', detail: h.confirmed > 0 ? `${h.confirmed} entregas con confirmación del proveedor.` : 'Aún sin confirmación del proveedor (webhook): entrega al buzón no demostrada.' });
  }
  return out;
}
