import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SITE } from '@/lib/site';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

const SITE_HOST = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

const LeadSchema = z.object({
  nombre: z.string().trim().min(1).max(120).optional(),
  contact: z.string().trim().min(1).max(120).optional(),
  empresa: z.string().trim().max(160).optional().default(''),
  email: z.string().trim().email().max(180),
  telefono: z.string().trim().min(6).max(40),
  whatsapp: z.string().trim().max(40).optional(),
  producto: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(80).optional(),
  application: z.string().trim().max(240).optional(),
  cantidad: z.string().trim().max(80).optional(),
  dimensions: z.string().trim().max(120).optional(),
  material: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  deliveryCountry: z.string().trim().max(80).optional(),
  deliveryCity: z.string().trim().max(80).optional(),
  fechaNecesaria: z.string().trim().max(40).optional(),
  mensaje: z.string().trim().max(4000).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
});

const buckets = new Map<string, { n: number; t: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const hit = buckets.get(ip);
  if (!hit || now - hit.t > 10 * 60 * 1000) {
    buckets.set(ip, { n: 1, t: now });
    return false;
  }
  hit.n += 1;
  return hit.n > 12;
}

function rfqId(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RFQ-${y}${m}${day}-${rand}`;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_fields' }, { status: 400 });
  }
  const lead = parsed.data;
  const id = rfqId();
  const contact = lead.nombre || lead.contact || '';

  let persisted = false;
  if (isSupabaseConfigured()) {
    try {
      const admin = supabaseAdmin();
      const { error } = await admin.from('quotes').insert({
        customer_email: lead.email,
        full_name: contact,
        company: lead.empresa,
        phone: lead.telefono,
        product: lead.producto ?? null,
        quantity: lead.cantidad ?? null,
        rfq_code: id,
        country: lead.deliveryCountry || lead.country || null,
        industry: lead.industry ?? null,
        status: 'NEW',
        source: `${SITE_HOST}/cotizacion`,
        payload: lead,
        message: [
          lead.application,
          lead.dimensions,
          lead.material,
          lead.country && `Origen: ${lead.city || ''} ${lead.country}`.trim(),
          lead.deliveryCountry &&
            `Entrega: ${lead.deliveryCity || ''} ${lead.deliveryCountry}`.trim(),
          lead.mensaje,
        ]
          .filter(Boolean)
          .join('\n'),
      });
      persisted = !error;
      if (error) console.error('[lead] supabase', error.message);
    } catch (err) {
      console.error('[lead] supabase unavailable', err);
    }
  }

  const webhook = process.env.N8N_WEBHOOK_URL;
  let forwarded = false;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          rfqId: id,
          persisted,
          source: `${SITE_HOST}/cotizacion`,
          receivedAt: new Date().toISOString(),
        }),
      });
      forwarded = res.ok;
    } catch {
      forwarded = false;
    }
  }

  // Email / WhatsApp remain the commercial channels. Persistence failure is
  // logged, never thrown: the buyer already has the RFQ id in the response.
  return NextResponse.json({
    ok: true,
    rfqId: id,
    persisted,
    forwarded,
  });
}
