/**
 * Política de acceso del personal (pura, sin Auth.js). No hay registro
 * público: el acceso es una lista cerrada de correos (STAFF_EMAILS) Y exige
 * haber iniciado sesión con Google, único proveedor cuyo correo llega verificado.
 */
export function staffEmails(env: Record<string, string | undefined> = process.env): string[] {
  return (env.STAFF_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isStaff(
  user: { email?: string | null; provider?: string | null } | null | undefined,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const email = user?.email?.trim().toLowerCase();
  if (!email || user?.provider !== 'google') return false;
  return staffEmails(env).includes(email);
}
