import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';

/**
 * Autenticación de clientes — Auth.js v5 (JWT, sin base de datos).
 *
 * Los proveedores se activan SOLO si sus credenciales existen en el entorno
 * Y si AUTH_SECRET está definido. Sin AUTH_SECRET no se registra ningún
 * proveedor, por lo que el secreto de relleno es inerte (nunca se emiten
 * sesiones). Esto permite desplegar el sitio sin romper nada mientras las
 * credenciales OAuth se configuran en Vercel.
 *
 * Variables requeridas para activar login (ver .env.example):
 *   AUTH_SECRET                                  (obligatorio, `npx auth secret`)
 *   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET          (Google)
 *   AUTH_FACEBOOK_ID / AUTH_FACEBOOK_SECRET      (Facebook)
 *   AUTH_TWITTER_ID / AUTH_TWITTER_SECRET        (X / Twitter, OAuth 2.0)
 */

const hasSecret = Boolean(process.env.AUTH_SECRET);

const providers: Provider[] = [];

if (hasSecret) {
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.AUTH_FACEBOOK_ID,
        clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      })
    );
  }
  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    providers.push(
      Twitter({
        clientId: process.env.AUTH_TWITTER_ID,
        clientSecret: process.env.AUTH_TWITTER_SECRET,
      })
    );
  }
}

/** IDs de proveedores activos, para renderizar solo botones que funcionan. */
export const enabledProviders: { id: string; name: string }[] = providers.map(
  (p) => {
    const data = typeof p === 'function' ? p() : p;
    return { id: data.id, name: data.name };
  }
);

export const authConfigured = hasSecret && providers.length > 0;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Con cero proveedores el secreto de relleno nunca firma nada.
  secret: process.env.AUTH_SECRET ?? 'inert-placeholder-no-providers-enabled',
  trustHost: true,
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
});

/** Sesión segura: nunca lanza excepción aunque la config esté incompleta. */
export async function getSafeSession() {
  if (!authConfigured) return null;
  try {
    return await auth();
  } catch {
    return null;
  }
}
