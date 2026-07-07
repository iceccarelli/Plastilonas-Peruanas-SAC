/**
 * Persistencia de pedidos (solo servidor). Usa la service-role de Supabase.
 * Si Supabase no está configurado, las funciones lanzan y el llamador decide
 * cómo responder (el pago puede seguir funcionando aunque falle el registro,
 * pero lo registramos como error para no perder trazabilidad).
 */
import { supabaseAdmin } from './supabase';
import type { ShippingDetails } from './peru';

export interface ResolvedItem {
  slug: string;
  name: string;
  unit?: string;
  unitPriceCents: number;
  quantity: number;
}

export interface CreateOrderInput {
  items: ResolvedItem[];
  subtotalCents: number;
  igvCents: number;
  totalCents: number;
  shipping: ShippingDetails;
  provider: string;
  paymentRef?: string;
}

/** Crea un pedido en estado `pending` y sus líneas. Devuelve el id. */
export async function createPendingOrder(input: CreateOrderInput): Promise<string> {
  const db = supabaseAdmin();

  const { data: order, error } = await db
    .from('orders')
    .insert({
      customer_email: input.shipping.email,
      status: 'pending',
      subtotal_cents: input.subtotalCents,
      igv_cents: input.igvCents,
      total_cents: input.totalCents,
      currency: 'PEN',
      ship_name: input.shipping.name,
      ship_phone: input.shipping.phone,
      ship_address: input.shipping.address,
      ship_district: input.shipping.district,
      ship_province: input.shipping.province,
      ship_department: input.shipping.department,
      ship_reference: input.shipping.reference ?? null,
      notes: input.shipping.notes ?? null,
      payment_provider: input.provider,
      payment_ref: input.paymentRef ?? null,
      metadata: { ruc: input.shipping.ruc ?? null },
    })
    .select('id')
    .single();

  if (error || !order) {
    throw new Error(`No se pudo crear el pedido: ${error?.message ?? 'desconocido'}`);
  }

  const rows = input.items.map((i) => ({
    order_id: order.id,
    product_slug: i.slug,
    product_name: i.name,
    unit: i.unit ?? null,
    unit_price_cents: i.unitPriceCents,
    quantity: i.quantity,
    line_total_cents: i.unitPriceCents * i.quantity,
  }));

  const { error: itemsError } = await db.from('order_items').insert(rows);
  if (itemsError) {
    throw new Error(`No se pudieron guardar las líneas: ${itemsError.message}`);
  }

  return order.id as string;
}

/** Marca un pedido como pagado y registra el pago (idempotente por provider_ref). */
export async function markOrderPaid(params: {
  paymentRef: string;
  provider: string;
  amountCents: number;
  raw: Record<string, unknown>;
}): Promise<void> {
  const db = supabaseAdmin();

  const { data: order } = await db
    .from('orders')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('payment_ref', params.paymentRef)
    .select('id')
    .maybeSingle();

  await db.from('payments').upsert(
    {
      order_id: order?.id ?? null,
      provider: params.provider,
      provider_ref: params.paymentRef,
      amount_cents: params.amountCents,
      currency: 'PEN',
      status: 'succeeded',
      raw: params.raw,
    },
    { onConflict: 'provider,provider_ref' }
  );
}
