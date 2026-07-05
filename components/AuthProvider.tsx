'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * La sesión se hidrata en el cliente para que todas las páginas de marketing
 * sigan siendo 100% estáticas (rendimiento tipo AWS/Vercel). Solo /dashboard
 * se protege en el servidor.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
