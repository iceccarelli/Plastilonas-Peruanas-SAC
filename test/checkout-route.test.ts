import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/stripe/route';

/**
 * Verifica el comportamiento del route handler de pago SIN tocar la red:
 *  - degradación limpia cuando no hay clave de Stripe (503)
 *  - rechazo de productos que no existen o no son comprables (400)
 *  - validación de payload vacío (400)
 * Todos estos caminos ocurren ANTES de llamar a la API de Stripe.
 *
 * POR QUÉ EL HANDLER SE IMPORTA UNA VEZ, ARRIBA.
 *
 * La versión anterior hacía `vi.resetModules()` en cada caso y volvía a
 * importar la ruta dentro de cada `it`. Eso no aportaba nada —`getStripe()`
 * lee `STRIPE_SECRET_KEY` EN CADA LLAMADA, no al cargar el módulo, así que
 * `vi.stubEnv` surte efecto sin reimportar— y sí costaba: cuatro
 * instanciaciones del grafo completo `route → lib/stripe → stripe` (el SDK de
 * Stripe es el paquete más grande del servidor), más `lib/products`,
 * `lib/orders` y `lib/supabase`.
 *
 * En una máquina de dos núcleos —un Codespace, el runner de CI cargado— esas
 * cuatro pasadas pasaron de 900 ms a 16 s y dos casos reventaron el límite de
 * 5 s de vitest. El gate de scripts/aplicar-entrega.sh corre con `set -e`: la
 * suite roja detuvo la entrega ANTES del push, con el código ya commiteado en
 * local. Una prueba que falla por el reloj de la máquina y no por el código
 * bloquea entregas correctas y enseña a ignorar el rojo, que es peor.
 *
 * Con una sola importación, los cuatro casos miden milisegundos y comprueban
 * exactamente lo mismo. Si algún día el handler leyera la clave al cargar el
 * módulo, habría que volver a aislar — y entonces el reset iría en un archivo
 * propio, no en los cuatro casos.
 */

function post(body: unknown): Request {
  return new Request('http://localhost/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/checkout/stripe — guardas', () => {
  it('devuelve 503 si Stripe no está configurado', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const res = await POST(post({ items: [{ slug: 'x', quantity: 1 }], shipping: { email: 'a@b.co' } }));
    expect(res.status).toBe(503);
  });

  it('rechaza (400) un slug inexistente aunque haya clave — anti-tampering', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const res = await POST(
      post({ items: [{ slug: 'producto-que-no-existe', quantity: 1 }], shipping: { email: 'a@b.co' } })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toMatch(/no disponible/i);
  });

  it('rechaza (400) un carrito vacío', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const res = await POST(post({ items: [], shipping: { email: 'a@b.co' } }));
    expect(res.status).toBe(400);
  });

  it('rechaza (400) si falta el email de envío', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const res = await POST(post({ items: [{ slug: 'big-bags-bolsones-polipropileno', quantity: 1 }], shipping: {} }));
    expect(res.status).toBe(400);
  });

  it('la clave no se lee al cargar el módulo, sino en cada llamada', async () => {
    // Esta es la propiedad que permite importar el handler una sola vez.
    // Si alguien mueve la lectura de STRIPE_SECRET_KEY al cuerpo del módulo,
    // este caso falla y explica por qué, en vez de dejar que los otros cuatro
    // empiecen a depender del orden de importación.
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_tests');
    const conClave = await POST(post({ items: [], shipping: { email: 'a@b.co' } }));
    expect(conClave.status).toBe(400);
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const sinClave = await POST(post({ items: [], shipping: { email: 'a@b.co' } }));
    expect(sinClave.status).toBe(503);
  });
});
