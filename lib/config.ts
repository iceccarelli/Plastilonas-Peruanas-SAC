import { estadoMigracion } from './site';
/**
 * Contrato único de configuración de integraciones.
 *
 * Una variable de entorno presente NO es una integración conectada. Este módulo
 * describe, para cada integración: qué variables necesita, qué pasa si falta y
 * en qué estado está AHORA. Los estados son:
 *
 *   disabled       ninguna variable: la función está apagada (degradación explícita).
 *   misconfigured  variables a medias o en conflicto: NO funciona y hay que corregirlo.
 *   configured     variables completas; sin evidencia de conexión todavía.
 *
 * «verified» lo añade /api/health?deep=1 solo con una señal real (consulta a la
 * base, última entrega confirmada). Jamás se devuelven valores de variables.
 */
export type EnvLike = Record<string, string | undefined>;
export type ConfigState = 'disabled' | 'misconfigured' | 'configured';

export interface IntegrationDef {
  id: string;
  label: string;
  /** Todas deben existir juntas (si existe alguna y faltan otras: misconfigured). */
  all?: string[];
  /** Al menos una (alias heredados). */
  anyOf?: string[];
  optional?: string[];
  /** Qué ocurre cuando está apagada: la promesa honesta al operador. */
  whenOff: string;
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'database', label: 'Supabase (leads, adjuntos, personal)',
    all: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    whenOff: 'Los RFQ no se guardan: /api/lead responde 503 y el comprador usa WhatsApp.',
  },
  {
    id: 'crm', label: 'Webhook de CRM',
    anyOf: ['CRM_WEBHOOK_URL', 'N8N_WEBHOOK_URL'], optional: ['CRM_WEBHOOK_SECRET'],
    whenOff: 'Los leads no se reenvían a un CRM; quedan solo en la base.',
  },
  {
    id: 'email', label: 'Correo de ventas (Resend)',
    all: ['RESEND_API_KEY'], optional: ['LEAD_EMAIL_TO', 'LEAD_EMAIL_FROM'],
    whenOff: 'No se envía copia del RFQ por correo.',
  },
  {
    id: 'quotes', label: 'Envío de cotizaciones al cliente (enlace seguro)',
    all: ['QUOTE_LINK_SECRET'], optional: ['RESEND_WEBHOOK_SECRET'],
    whenOff: 'Las cotizaciones emitidas quedan guardadas pero NO se envían: la entrega aparece «bloqueada» en /staff.',
  },
  {
    id: 'retries', label: 'Reintentos de entrega (cron)',
    all: ['CRON_SECRET'],
    whenOff: 'Las entregas fallidas no se reintentan solas y /api/cron/lead-deliveries responde 503.',
  },
  {
    id: 'staff', label: 'Área del personal (/staff)',
    all: ['STAFF_EMAILS', 'AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET'],
    whenOff: 'Nadie puede entrar a /staff.',
  },
  {
    id: 'ai', label: 'Asistente (Anthropic)',
    all: ['ANTHROPIC_API_KEY'],
    whenOff: 'El asistente ofrece WhatsApp en lugar de responder.',
  },
  {
    id: 'payments', label: 'Pagos (Stripe)',
    all: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    whenOff: 'El checkout está apagado; el negocio opera por cotización.',
  },
  {
    id: 'search', label: 'Verificación de buscadores e IndexNow',
    anyOf: ['GOOGLE_SITE_VERIFICATION', 'BING_SITE_VERIFICATION', 'INDEXNOW_KEY'],
    whenOff: 'Sin etiquetas de verificación ni envío IndexNow.',
  },
];

const has = (env: EnvLike, k: string) => Boolean((env[k] ?? '').trim());

export interface IntegrationStatus {
  id: string;
  label: string;
  state: ConfigState;
  /** Nombres (nunca valores) de las variables que faltan o chocan. */
  missing: string[];
  optionalMissing: string[];
  note: string;
}

export function integrationStatus(def: IntegrationDef, env: EnvLike): IntegrationStatus {
  const present = (def.all ?? []).filter((k) => has(env, k));
  const missing = (def.all ?? []).filter((k) => !has(env, k));
  const anyPresent = (def.anyOf ?? []).some((k) => has(env, k));
  let state: ConfigState = 'disabled';
  let miss: string[] = [];
  if (def.all) {
    if (missing.length === 0) state = 'configured';
    else if (present.length > 0) { state = 'misconfigured'; miss = missing; }
    else miss = missing;
  } else if (def.anyOf) {
    state = anyPresent ? 'configured' : 'disabled';
    if (!anyPresent) miss = def.anyOf;
  }
  // Un secreto de firma sin URL de webhook es una configuración incompleta, no «apagada».
  if (def.id === 'crm' && has(env, 'CRM_WEBHOOK_SECRET') && !anyPresent) {
    state = 'misconfigured';
    miss = ['CRM_WEBHOOK_URL'];
  }
  // Un secreto de enlace corto es adivinable por fuerza bruta offline: no cuenta como configurado.
  if (def.id === 'quotes' && state === 'configured' && (env.QUOTE_LINK_SECRET ?? '').trim().length < 32) {
    state = 'misconfigured';
    miss = ['QUOTE_LINK_SECRET (mínimo 32 caracteres)'];
  }
  return {
    id: def.id, label: def.label, state, missing: state === 'configured' ? [] : miss,
    optionalMissing: state === 'configured' ? (def.optional ?? []).filter((k) => !has(env, k)) : [],
    note: state === 'configured' ? 'Variables completas; sin verificar conexión.' : def.whenOff,
  };
}

function hostOf(raw: string | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  try { return new URL(v).hostname.toLowerCase(); } catch { return `invalid:${v.slice(0, 0)}`; }
}

/**
 * Dominio: lib/site.ts y middleware.ts leen NEXT_PUBLIC_CANONICAL_HOST y, por
 * compatibilidad, CANONICAL_ORIGIN. Si ambas existen y difieren, el sitio usa
 * una y el middleware otra: no se «arregla» una a ciegas, se avisa.
 */
export function domainStatus(env: EnvLike): IntegrationStatus {
  const a = hostOf(env.NEXT_PUBLIC_CANONICAL_HOST);
  const b = hostOf(env.CANONICAL_ORIGIN);
  const problems: string[] = [];
  if (a?.startsWith('invalid:') || b?.startsWith('invalid:')) problems.push('canonical_host_invalid');
  if (a && b && a !== b) problems.push('NEXT_PUBLIC_CANONICAL_HOST≠CANONICAL_ORIGIN');
  if (env.ENFORCE_BRAND_DOMAIN === 'true' && !a && !b) problems.push('ENFORCE_BRAND_DOMAIN sin dominio canónico');
  const configurado = estadoMigracion(env);
  if (configurado === 'invalida') problems.push('host canónico distinto de www (el apex lo redirige Vercel a www: bucle)');
  const set = Boolean(a || b);
  return {
    id: 'domain', label: 'Dominio canónico',
    state: problems.length ? 'misconfigured' : set ? 'configured' : 'disabled',
    missing: problems, optionalMissing: [],
    note: problems.length
      ? 'Contrato de dominio inconsistente: resolver ANTES de tocar DNS o redirecciones (docs/mudanza-plastilonas-com.md §6).'
      : set ? 'Dominio de marca declarado; la redirección dura sigue su propio interruptor.'
      : 'Sin dominio de marca: el sitio vive en el host de Vercel, indexable.',
  };
}

export function configReport(env: EnvLike = process.env): IntegrationStatus[] {
  return [...INTEGRATIONS.map((d) => integrationStatus(d, env)), domainStatus(env)];
}

/** ¿Puede el negocio capturar un RFQ de forma durable con esta configuración? */
export function canCaptureLeads(env: EnvLike = process.env): boolean {
  return integrationStatus(INTEGRATIONS[0], env).state === 'configured';
}
