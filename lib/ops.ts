/**
 * Operación: latido del cron, evaluación de condiciones, alertas sin ruido y
 * preparación (readiness) por función. Nada aquí contiene datos de clientes:
 * solo nombres de condición, contadores y marcas de tiempo.
 */
import { assertPublicDestination } from '@/lib/outbound';
import { limitKey, type RpcClient } from '@/lib/rate-limit';
import { buildStamp } from '@/lib/version';

type Env = Record<string, string | undefined>;

export const HEARTBEAT_RETRY = 'lead-retry';
/** Sin latido correcto en este tiempo, el proceso de reintentos se considera detenido. */
export const HEARTBEAT_STALE_S = 3 * 3600;
export const ALERT_COOLDOWN_S = 6 * 3600;
export const BACKLOG_WARN_S = 3600;
export const ANOMALY_PER_HOUR = 50;

export type Severity = 'warn' | 'error';
export interface Condition { id: string; severity: Severity; summary: string }

export const CONDITION_IDS = [
  'rfq_dead_letters', 'rfq_retry_backlog', 'quote_dead_letters', 'quote_blocked', 'quote_retry_backlog',
  'quote_integrity', 'retry_stale', 'staff_denied_burst', 'oferta_invalid_burst', 'run_failed',
] as const;

const call = async (db: RpcClient, fn: string, args: Record<string, unknown> = {}) => {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};

/** Cuenta un evento de seguridad en una ventana de 1 h (best-effort: jamás rompe la petición). */
export async function bumpCounter(db: RpcClient, name: string): Promise<void> {
  try {
    await db.rpc('rate_limit_hit', { p_key: limitKey(`sec-${name}`, 'all'), p_window_seconds: 3600, p_max: 1_000_000 });
  } catch { /* contador de observabilidad: el fallo no importa */ }
}
export async function readCounter(db: RpcClient, name: string): Promise<number> {
  return Number(await call(db, 'rate_limit_peek', { p_key: limitKey(`sec-${name}`, 'all'), p_window_seconds: 3600 })) || 0;
}

export async function recordHeartbeat(db: RpcClient, ok: boolean, detail: Record<string, unknown> = {}): Promise<void> {
  await call(db, 'ops_heartbeat', { p_name: HEARTBEAT_RETRY, p_ok: ok, p_detail: detail });
}

export interface Backlog { dead: number; blocked?: number; oldestDueAgeSec: number | null }

/** Evalúa TODAS las condiciones. Cada lectura que falla se informa; ninguna se supone sana. */
export async function evaluateConditions(
  db: RpcClient,
  src: { leads: () => Promise<Backlog>; quotes: () => Promise<Backlog> },
  opts: { includeHeartbeat?: boolean } = {},
): Promise<{ active: Condition[]; unknown: string[] }> {
  const active: Condition[] = [];
  const unknown: string[] = [];
  const guard = async (id: string, f: () => Promise<void>) => { try { await f(); } catch { unknown.push(id); } };

  await guard('rfq', async () => {
    const l = await src.leads();
    if (l.dead > 0) active.push({ id: 'rfq_dead_letters', severity: 'error', summary: `${l.dead} entrega(s) de RFQ agotaron los reintentos (dead-letter): recuperar desde /staff.` });
    if ((l.oldestDueAgeSec ?? 0) > BACKLOG_WARN_S) active.push({ id: 'rfq_retry_backlog', severity: 'warn', summary: `Entregas de RFQ vencidas hace más de ${Math.round((l.oldestDueAgeSec ?? 0) / 60)} min.` });
  });
  await guard('quotes', async () => {
    const q = await src.quotes();
    if (q.dead > 0) active.push({ id: 'quote_dead_letters', severity: 'error', summary: `${q.dead} cotización(es) emitida(s) NO llegaron al cliente (agotaron reintentos o rebotaron).` });
    if ((q.blocked ?? 0) > 0) active.push({ id: 'quote_blocked', severity: 'error', summary: `${q.blocked} cotización(es) emitida(s) bloqueada(s) por configuración (correo o secreto del enlace): el cliente no las ha recibido.` });
    if ((q.oldestDueAgeSec ?? 0) > BACKLOG_WARN_S) active.push({ id: 'quote_retry_backlog', severity: 'warn', summary: `Envíos de cotización vencidos hace más de ${Math.round((q.oldestDueAgeSec ?? 0) / 60)} min.` });
  });
  await guard('integrity', async () => {
    const r = (await call(db, 'quote_integrity_report')) as { hashMismatch?: number; issuedWithoutSnapshot?: number };
    const bad = Number(r?.hashMismatch ?? 0) + Number(r?.issuedWithoutSnapshot ?? 0);
    if (bad > 0) active.push({ id: 'quote_integrity', severity: 'error', summary: `${bad} oferta(s) emitida(s) con instantánea alterada o ausente: investigar antes de enviar nada más.` });
  });
  await guard('anomalies', async () => {
    const staff = await readCounter(db, 'staff-denied');
    if (staff > ANOMALY_PER_HOUR) active.push({ id: 'staff_denied_burst', severity: 'warn', summary: `${staff} accesos denegados al área del personal en la última hora.` });
    const oferta = await readCounter(db, 'oferta-invalid');
    if (oferta > ANOMALY_PER_HOUR * 2) active.push({ id: 'oferta_invalid_burst', severity: 'warn', summary: `${oferta} intentos con enlaces de oferta inválidos o rechazados en la última hora.` });
  });
  if (opts.includeHeartbeat) {
    await guard('heartbeat', async () => {
      const age = (await call(db, 'ops_heartbeat_age', { p_name: HEARTBEAT_RETRY })) as number | null;
      if (age === null || age > HEARTBEAT_STALE_S) {
        active.push({ id: 'retry_stale', severity: 'error', summary: age === null ? 'El proceso de reintentos nunca se ha ejecutado correctamente.' : `El proceso de reintentos no corre bien desde hace ${Math.round(age / 3600)} h.` });
      }
    });
  }
  return { active, unknown };
}

export interface AlertPayload {
  text: string; severity: Severity | 'info'; condition: string; event: 'alert' | 'recovery' | 'test';
  service: string; environment: string; commit: string; at: string;
}

export function alertConfigured(env: Env = process.env): boolean {
  return Boolean(env.ALERT_WEBHOOK_URL?.trim());
}

export async function sendAlert(
  p: Pick<AlertPayload, 'text' | 'severity' | 'condition' | 'event'>, env: Env = process.env,
): Promise<{ ok: boolean; reason?: string; http?: number }> {
  const url = env.ALERT_WEBHOOK_URL?.trim();
  if (!url) return { ok: false, reason: 'not_configured' };
  const dest = await assertPublicDestination(url, env);
  if (!dest.ok) return { ok: false, reason: dest.reason };
  const stamp = buildStamp();
  const body: AlertPayload = {
    ...p, service: 'plastilonas-web', environment: stamp.entorno || 'unknown', commit: stamp.commitShort, at: new Date().toISOString(),
  };
  const prefix = p.event === 'recovery' ? '✅ Recuperado' : p.event === 'test' ? '🧪 Prueba' : p.severity === 'error' ? '🚨 Alerta' : '⚠️ Aviso';
  try {
    const res = await fetch(dest.url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // `text` es el campo que leen Slack/Teams/n8n; el resto es para automatizar.
      body: JSON.stringify({ ...body, text: `${prefix} · Plastilonas · ${p.text}` }),
      signal: AbortSignal.timeout(5000), redirect: 'error',
    });
    return res.ok ? { ok: true, http: res.status } : { ok: false, reason: 'http_error', http: res.status };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export interface DispatchResult { sent: string[]; recovered: string[]; suppressed: string[]; failed: string[] }

/** Avisa lo nuevo, repite tras el enfriamiento y notifica la recuperación una sola vez. */
export async function dispatchAlerts(
  db: RpcClient, active: Condition[], unknown: string[] = [], env: Env = process.env, send: typeof sendAlert = sendAlert,
): Promise<DispatchResult> {
  const out: DispatchResult = { sent: [], recovered: [], suppressed: [], failed: [] };
  const ids = new Set(active.map((c) => c.id));
  for (const c of active) {
    const claim = await call(db, 'ops_alert_claim', { p_condition: c.id, p_severity: c.severity, p_cooldown_seconds: ALERT_COOLDOWN_S });
    if (!claim) { out.suppressed.push(c.id); continue; }
    const r = await send({ text: c.summary, severity: c.severity, condition: c.id, event: 'alert' }, env);
    if (r.ok) out.sent.push(c.id);
    else {
      out.failed.push(c.id);
      // El aviso no salió: se libera la reserva para reintentar en la siguiente ejecución, en vez de callar 6 h.
      await call(db, 'ops_alert_resolve', { p_condition: c.id }).catch(() => undefined);
    }
  }
  // Una lectura que falló NO cuenta como recuperada: no se sabe.
  const dark = unknown.length > 0;
  for (const id of CONDITION_IDS) {
    if (ids.has(id) || (dark && id !== 'run_failed')) continue;
    const wasActive = await call(db, 'ops_alert_resolve', { p_condition: id });
    if (wasActive) {
      const r = await send({ text: `La condición «${id}» volvió a la normalidad.`, severity: 'info', condition: id, event: 'recovery' }, env);
      (r.ok ? out.recovered : out.failed).push(id);
    }
  }
  return out;
}

// ─────────────────────────────── preparación por función ───────────────────────────────
export type ReadyFunction = 'rfq' | 'quote' | 'upload';
export type CheckState = 'ok' | 'fail' | 'skip';
export interface Readiness {
  status: 'ready' | 'degraded' | 'not_ready';
  function: ReadyFunction;
  checks: Record<string, CheckState>;
}

/**
 * ¿Puede el sitio SERVIR esta función ahora? Comprueba dependencias de verdad
 * (escribe en la base, mira el esquema, el bucket y el latido); no se fía de
 * que existan variables. Respuesta pública: solo estados, ningún detalle.
 */
export async function readiness(
  fn: ReadyFunction, db: RpcClient | null, env: Env,
  storage: () => Promise<{ exists: boolean; isPublic: boolean }> = async () => ({ exists: false, isPublic: false }),
): Promise<Readiness> {
  const checks: Record<string, CheckState> = {};
  const finish = (): Readiness => {
    const critical = fn === 'rfq' ? ['database', 'migrations'] : fn === 'quote' ? ['database', 'migrations', 'email', 'link_secret'] : ['database', 'migrations', 'storage'];
    const crit = critical.some((k) => checks[k] !== 'ok');
    const soft = Object.entries(checks).some(([k, v]) => !critical.includes(k) && v === 'fail');
    return { status: crit ? 'not_ready' : soft ? 'degraded' : 'ready', function: fn, checks };
  };
  if (!db) { checks.database = 'skip'; checks.migrations = 'skip'; return finish(); }

  try {
    await call(db, 'ops_write_probe');
    checks.database = 'ok';
  } catch { checks.database = 'fail'; checks.migrations = 'skip'; return finish(); }

  try {
    const m = (await call(db, 'ops_schema_markers')) as Record<string, boolean>;
    const need = fn === 'rfq' ? ['pipeline'] : fn === 'quote' ? ['pipeline', 'quotations', 'quote_journey'] : ['pipeline', 'attachments'];
    checks.migrations = need.every((k) => m?.[k] === true) ? 'ok' : 'fail';
  } catch { checks.migrations = 'fail'; }

  if (fn === 'upload') {
    try { const b = await storage(); checks.storage = b.exists && !b.isPublic ? 'ok' : 'fail'; } catch { checks.storage = 'fail'; }
  }
  if (fn === 'quote') {
    checks.email = env.RESEND_API_KEY?.trim() ? 'ok' : 'fail';
    checks.link_secret = (env.QUOTE_LINK_SECRET?.trim().length ?? 0) >= 32 ? 'ok' : 'fail';
  }
  if (env.CRON_SECRET?.trim()) {
    try {
      const age = (await call(db, 'ops_heartbeat_age', { p_name: HEARTBEAT_RETRY })) as number | null;
      // Sin latido todavía (despliegue nuevo) no es fallo: el primer cron lo crea. Un latido VIEJO sí.
      checks.retries = age === null ? 'skip' : age <= HEARTBEAT_STALE_S ? 'ok' : 'fail';
    } catch { checks.retries = 'fail'; }
  }
  return finish();
}
