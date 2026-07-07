import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { markOrderPaid } from '@/lib/orders';

// Stripe requiere el cuerpo crudo para verificar la firma.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook no configurado.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma.' }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] firma inválida:', err);
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      try {
        await markOrderPaid({
          paymentRef: session.id,
          provider: 'stripe',
          amountCents: session.amount_total ?? 0,
          raw: session as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.error('[webhook] markOrderPaid falló:', err);
        // 500 para que Stripe reintente.
        return NextResponse.json({ error: 'Error al registrar el pago.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
