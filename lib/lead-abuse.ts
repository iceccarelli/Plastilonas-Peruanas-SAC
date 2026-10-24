/**
 * Reglas de abuso del RFQ y de las subidas, en un solo sitio (los route.ts de
 * Next no pueden exportar nada que no sean handlers). Todas se cuentan en
 * Postgres con rate_limit_hit: atómicas y compartidas entre instancias.
 */
import type { Rule } from '@/lib/rate-limit';

/** URLs firmadas de subida: cada una reserva un objeto en Storage. */
export const UPLOAD_WINDOW_S = 600;
export const UPLOAD_MAX_PER_WINDOW = 20;
export const UPLOAD_MAX_PER_DAY = 60;
/** Último respaldo del almacenamiento. Alto a propósito: un tope global bajo permitiría a un atacante agotar el cupo de los compradores reales. */
export const UPLOAD_MAX_GLOBAL_PER_HOUR = 1500;

export function uploadRules(ipHash: string): Rule[] {
  return [
    { scope: 'upload-ip', subject: ipHash, windowSeconds: UPLOAD_WINDOW_S, max: UPLOAD_MAX_PER_WINDOW },
    { scope: 'upload-ip-dia', subject: ipHash, windowSeconds: 86_400, max: UPLOAD_MAX_PER_DAY },
    { scope: 'upload-global', subject: 'all', windowSeconds: 3600, max: UPLOAD_MAX_GLOBAL_PER_HOUR },
  ];
}

/** RFQ: por IP y por correo. SIN tope global: bloquearía a los compradores reales durante un ataque. */
export const LEAD_WINDOW_S = 600;
export const LEAD_MAX_PER_IP = 12;
export const LEAD_MAX_PER_EMAIL_HOUR = 8;

export function leadRules(ipHash: string, email: string): Rule[] {
  return [
    { scope: 'lead-ip', subject: ipHash, windowSeconds: LEAD_WINDOW_S, max: LEAD_MAX_PER_IP },
    { scope: 'lead-email', subject: email.trim().toLowerCase(), windowSeconds: 3600, max: LEAD_MAX_PER_EMAIL_HOUR },
  ];
}
