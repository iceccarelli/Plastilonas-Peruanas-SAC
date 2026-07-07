import { NextResponse } from 'next/server';
import { getStripe, siteUrl } from '@/lib/stripe';
import { products } from '@/lib/products';
import { toCents, withIgv } from '@/lib/format';
import { createPendingOrder, type ResolvedItem } from '@/lib/orders';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { ShippingDetails } from '@/lib/peru';

interface IncomingItem {
  slug: string;
  quantity: number;
}

/**
 * Crea una Checkout Session de Stripe.
 *
 * SEGURIDAD: nunca confía en el precio enviado por el cliente. Re-resuelve
 * cada producto por `slug` desde el catálogo del servidor, verifica que sea
 * comprable, y calcula el IGV en el servidor.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Pagos con tarjeta no disponibles temporalmente.' },
      { status: 503 }
    );
  }

  let body: { items?: IncomingItem[]; shipping?: ShippingDetails };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  const incoming = body.items ?? [];
  const shipping = body.shipping;
  if (!Array.isArray(incoming) || incoming.length === 0 || !shipping?.email) {
    return NextResponse.json({ error: 'Faltan datos del pedido.' }, { status: 400 });
  }

  // Re-resolver contra el catálogo del servidor.
  const resolved: ResolvedItem[] = [];
  for (const line of incoming) {
    const product = products.find((p) => p.slug === line.slug);
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 0));
    if (!product || !product.purchasable || typeof product.price !== 'number') {
      return NextResponse.json(
        { error: `Producto no disponible para compra: ${line.slug}` },
        { status: 400 }
      );
    }
    resolved.push({
      slug: product.slug,
      name: product.name,
      unit: product.priceUnit,
      unitPriceCents: toCents(product.price),
      quantity: qty,
    });
  }

  const subtotalCents = resolved.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  const { igvCents, totalCents } = withIgv(subtotalCents);

  // Registrar pedido pendiente (si Supabase está configurado).
  let orderId: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      orderId = await createPendingOrder({
        items: resolved,
        subtotalCents,
        igvCents,
        totalCents,
        shipping,
        provider: 'stripe',
      });
    } catch (err) {
      // No bloquear el pago por un fallo de persistencia; registrar en logs.
      console.error('[checkout] createPendingOrder falló:', err);
    }
  }

  // Line items por producto (precio SIN IGV) + una línea explícita de IGV,
  // para que el total cobrado por Stripe coincida exactamente con el checkout.
  const line_items = resolved.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: 'pen',
      unit_amount: i.unitPriceCents,
      product_data: {
        name: i.name + (i.unit ? ` (${i.unit})` : ''),
      },
    },
  }));
  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'pen',
      unit_amount: igvCents,
      product_data: { name: 'IGV (18%)' },
    },
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: shipping.email,
      success_url: `${siteUrl()}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/carrito`,
      metadata: {
        order_id: orderId ?? '',
        igv_cents: String(igvCents),
        subtotal_cents: String(subtotalCents),
        total_cents: String(totalCents),
      },
    });

    // Vincular la sesión al pedido para el webhook.
    if (orderId && isSupabaseConfigured()) {
      const { supabaseAdmin } = await import('@/lib/supabase');
      await supabaseAdmin()
        .from('orders')
        .update({ payment_ref: session.id })
        .eq('id', orderId);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe session error:', err);
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 });
  }
}
