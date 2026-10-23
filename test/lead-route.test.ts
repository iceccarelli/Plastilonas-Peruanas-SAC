import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

// Sin Supabase configurado y sin canales: el handler real debe negarse a
// confirmar recepción. (Entorno limpio para que las variables locales no filtren.)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
vi.stubEnv('CRM_WEBHOOK_URL', '');
vi.stubEnv('N8N_WEBHOOK_URL', '');
vi.stubEnv('RESEND_API_KEY', '');

const { POST } = await import('@/app/api/lead/route');

const req = (body: string, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/lead', {
    method: 'POST', body, headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.9', ...headers },
  }) as never;

describe('POST /api/lead (handler real)', () => {
  it('no confirma recepción cuando no existe dónde guardarla', async () => {
    const res = await POST(req(JSON.stringify({ email: 'qa@example.com', telefono: '999000111', nombre: 'QA' })));
    expect(res.status).toBe(503);
    const j = await res.json();
    expect(j).toMatchObject({ ok: false, accepted: false, customerAction: 'send_via_whatsapp' });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('rechaza cuerpos enormes con 413 sin parsearlos', async () => {
    const res = await POST(req(JSON.stringify({ mensaje: 'x'.repeat(40_000) })));
    expect(res.status).toBe(413);
  });

  it('JSON inválido: 400', async () => {
    const res = await POST(req('{no es json'));
    expect(res.status).toBe(400);
  });
});

describe('el formulario no declara éxito sin recepción', () => {
  const form = readFileSync('components/CotizacionForm.tsx', 'utf8');
  it('usa resultado.accepted para el aviso y conserva el enlace de WhatsApp', () => {
    expect(form).toContain('resultado.accepted');
    expect(form).toContain('noRegTitulo');
    expect(form).toContain('(!acuse.abrio || !acuse.aceptada)');
  });
  it('envía una clave de idempotencia por formulario', () => {
    expect(form).toContain('idempotencyKey');
  });
});
