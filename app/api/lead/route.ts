import { NextRequest, NextResponse } from 'next/server';

/**
 * Recibe un lead de cotización y lo reenvía al webhook de n8n.
 *
 * Arquitectura de seguridad: el navegador NUNCA ve la URL de n8n. El cliente
 * hace POST a esta ruta interna; el secreto vive en el servidor (N8N_WEBHOOK_URL,
 * sin prefijo NEXT_PUBLIC_). Best-effort: el canal primario es WhatsApp, así que
 * si n8n no está configurado o falla, respondemos 200 y no rompemos la UX.
 */

export async function POST(req: NextRequest) {
  let lead: Record<string, unknown>;
  try {
    lead = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!lead || typeof lead !== 'object' || !lead.email || !lead.telefono) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const webhook = process.env.N8N_WEBHOOK_URL;
  if (!webhook) {
    // Sin webhook configurado: no es error. El lead ya fue por WhatsApp.
    return NextResponse.json({ ok: true, forwarded: false });
  }

  const payload = {
    ...lead,
    source: 'plastilonas.com/cotizacion',
    receivedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ ok: res.ok, forwarded: res.ok });
  } catch {
    // n8n caído: no rompemos la experiencia del cliente.
    return NextResponse.json({ ok: false, forwarded: false, error: 'webhook_failed' });
  }
}
