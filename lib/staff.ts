/**
 * Autorización del personal. No hay registro público: el acceso es una lista
 * cerrada de correos (STAFF_EMAILS) Y exige haber iniciado sesión con Google,
 * único proveedor configurado cuyo correo llega verificado.
 */
import { getSafeSession } from '@/auth';
import { isStaff } from '@/lib/staff-policy';

export { isStaff, staffEmails } from '@/lib/staff-policy';

/** Devuelve el correo del miembro del personal, o null si no está autorizado. */
export async function requireStaff(): Promise<string | null> {
  const session = await getSafeSession();
  const user = session?.user
    ? { email: session.user.email, provider: (session as unknown as { provider?: string }).provider }
    : null;
  return isStaff(user) ? user!.email!.trim().toLowerCase() : null;
}
