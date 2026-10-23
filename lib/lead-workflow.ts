/**
 * Estados COMERCIALES del lead y sus transiciones. Separados a propósito de
 * los estados de ENTREGA (lead_deliveries): un lead puede estar CALIFICADO con
 * el correo caído, y viceversa.
 *
 * Solo existen los estados que corresponden a pasos reales de operación. Un
 * lead aceptado ya está persistido, por eso no hay un estado «PERSISTED».
 */
export const STATUSES = [
  'NEW', 'ASSIGNED', 'QUALIFIED', 'QUOTE_PREPARATION', 'QUOTED', 'WON', 'LOST',
] as const;
export type LeadStatus = (typeof STATUSES)[number];

const NEXT: Record<LeadStatus, LeadStatus[]> = {
  NEW: ['ASSIGNED', 'LOST'],
  ASSIGNED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['QUOTE_PREPARATION', 'LOST'],
  QUOTE_PREPARATION: ['QUOTED', 'LOST'],
  QUOTED: ['WON', 'LOST', 'QUOTE_PREPARATION'], // revisión de la cotización
  WON: [],
  LOST: ['NEW'], // reabrir
};

export function normalizeStatus(raw: string | null | undefined): LeadStatus {
  const s = (raw ?? '').toUpperCase();
  return (STATUSES as readonly string[]).includes(s) ? (s as LeadStatus) : 'NEW';
}

export function allowedTransitions(from: string | null | undefined): LeadStatus[] {
  return NEXT[normalizeStatus(from)];
}

export function canTransition(from: string | null | undefined, to: string): boolean {
  return (allowedTransitions(from) as string[]).includes(to);
}

/** Perder un lead exige un motivo: sin él no se aprende por qué se pierden. */
export function transitionError(from: string | null | undefined, to: string, reason?: string): string | null {
  if (!canTransition(from, to)) return 'invalid_transition';
  if (to === 'LOST' && !(reason ?? '').trim()) return 'reason_required';
  return null;
}
