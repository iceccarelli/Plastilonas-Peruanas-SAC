import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Verifica el comportamiento del route handler de pago SIN tocar la red:
 *  - degradación limpia cuando no hay clave de Stripe (503)
 *  - rechazo de productos que no existen o no son comprables (400)
 *  - validación de payload vacío (400)
 * Todos estos caminos ocurren ANTES de llamar a la API de Stripe.
 */

function post(body: unknown): Request {
  return new Request('http://localhost/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('POST /api/checkout/stripe — guardas', () => {
  it('devuelve 503 si Stripe no está configurado', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const { POST } = await import('@/app/api/checkout/stripe/route');
    const res = await POST(post({ items: [{ slug: 'x', quantity: 1 }], shipping: { email: 'a@b.co' } }));
    expect(res.status).toBe(503);
  });

  it('rechaza (400) un slug inexistente aunque haya clave — anti-tampering', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const { POST } = await import('@/app/api/checkout/stripe/route');
    const res = await POST(
      post({ items: [{ slug: 'producto-que-no-existe', quantity: 1 }], shipping: { email: 'a@b.co' } })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toMatch(/no disponible/i);
  });

  it('rechaza (400) un carrito vacío', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const { POST } = await import('@/app/api/checkout/stripe/route');
    const res = await POST(post({ items: [], shipping: { email: 'a@b.co' } }));
    expect(res.status).toBe(400);
  });

  it('rechaza (400) si falta el email de envío', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const { POST } = await import('@/app/api/checkout/stripe/route');
    const res = await POST(post({ items: [{ slug: 'big-bags-bolsones-polipropileno', quantity: 1 }], shipping: {} }));
    expect(res.status).toBe(400);
  });
});
