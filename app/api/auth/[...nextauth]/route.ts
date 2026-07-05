import type { NextRequest } from 'next/server';
import { handlers, authConfigured } from '@/auth';

// Si la autenticación aún no está configurada en el entorno, respondemos 503
// con un mensaje claro en lugar de un error críptico de NextAuth.
function guard(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    if (!authConfigured) {
      // El cliente de NextAuth consulta /session en cada carga: respondemos
      // "sin sesión" de forma silenciosa para no generar errores en consola.
      if (req.nextUrl.pathname.endsWith('/session')) {
        return Response.json(null);
      }
      return Response.json(
        {
          error:
            'El acceso de clientes aún no está habilitado. Configure AUTH_SECRET y las credenciales OAuth en Vercel.',
        },
        { status: 503 }
      );
    }
    return handler(req);
  };
}

export const GET = guard(handlers.GET);
export const POST = guard(handlers.POST);
