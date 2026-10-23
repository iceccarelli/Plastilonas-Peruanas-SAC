import { describe, it, expect, vi, afterEach } from 'vitest';
import { configReport, integrationStatus, INTEGRATIONS, domainStatus, canCaptureLeads } from '@/lib/config';

const by = (r: ReturnType<typeof configReport>, id: string) => r.find((x) => x.id === id)!;

describe('contrato de configuración', () => {
  it('entorno vacío: todo apagado y nada «a medias»', () => {
    const r = configReport({});
    expect(r.every((x) => x.state === 'disabled')).toBe(true);
    expect(canCaptureLeads({})).toBe(false);
  });

  it('variables a medias se reportan como misconfigured, con los nombres que faltan', () => {
    const r = configReport({ NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a' });
    expect(by(r, 'database')).toMatchObject({ state: 'misconfigured', missing: ['SUPABASE_SERVICE_ROLE_KEY'] });
    expect(canCaptureLeads({ NEXT_PUBLIC_SUPABASE_URL: 'u', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a' })).toBe(false);
  });

  it('completas = configured, y configured NO dice «verificada»', () => {
    const env = { NEXT_PUBLIC_SUPABASE_URL: 'u', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a', SUPABASE_SERVICE_ROLE_KEY: 's' };
    const s = by(configReport(env), 'database');
    expect(s.state).toBe('configured');
    expect(s.note).toMatch(/sin verificar/i);
    expect(canCaptureLeads(env)).toBe(true);
  });

  it('el alias heredado N8N_WEBHOOK_URL activa el CRM; un secreto sin URL es un error', () => {
    expect(by(configReport({ N8N_WEBHOOK_URL: 'https://n8n/x' }), 'crm').state).toBe('configured');
    expect(by(configReport({ CRM_WEBHOOK_SECRET: 's' }), 'crm')).toMatchObject({ state: 'misconfigured', missing: ['CRM_WEBHOOK_URL'] });
  });

  it('variables en blanco cuentan como ausentes', () => {
    expect(by(configReport({ RESEND_API_KEY: '   ' }), 'email').state).toBe('disabled');
  });

  it('el informe nunca contiene valores de variables', () => {
    const env = { SUPABASE_SERVICE_ROLE_KEY: 'sb-secret-VALUE-123', CRON_SECRET: 'cron-secret-VALUE-456', RESEND_API_KEY: 're_VALUE_789', ANTHROPIC_API_KEY: 'sk-ant-VALUE-000', STAFF_EMAILS: 'jefe@empresa.pe' };
    const json = JSON.stringify(configReport(env));
    for (const v of Object.values(env)) expect(json).not.toContain(v);
  });

  it('cada integración declara qué ocurre cuando está apagada', () => {
    for (const d of INTEGRATIONS) expect(d.whenOff.length, d.id).toBeGreaterThan(20);
    expect(integrationStatus(INTEGRATIONS[0], {}).note).toMatch(/WhatsApp/);
  });
});

describe('contrato de dominio', () => {
  it('detecta las dos variables canónicas en conflicto', () => {
    const d = domainStatus({ NEXT_PUBLIC_CANONICAL_HOST: 'https://www.plastilonas.com', CANONICAL_ORIGIN: 'https://plastilonas.com' });
    expect(d.state).toBe('misconfigured');
    expect(d.missing.join()).toContain('≠');
  });
  it('la misma variable en las dos formas no es conflicto', () => {
    expect(domainStatus({ NEXT_PUBLIC_CANONICAL_HOST: 'https://www.plastilonas.com', CANONICAL_ORIGIN: 'https://www.plastilonas.com/' }).state).toBe('configured');
  });
  it('ENFORCE_BRAND_DOMAIN sin dominio canónico es un error (el middleware no haría nada)', () => {
    expect(domainStatus({ ENFORCE_BRAND_DOMAIN: 'true' }).state).toBe('misconfigured');
  });
  it('sin dominio de marca declarado el sitio sigue indexable (apagado, no error)', () => {
    expect(domainStatus({}).state).toBe('disabled');
  });
});

describe('GET /api/health', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
  const req = (qs = '', auth?: string) => {
    const url = new URL(`http://localhost/api/health${qs}`);
    return Object.assign(new Request(url, { headers: auth ? { authorization: auth } : {} }), { nextUrl: url }) as never;
  };

  it('el estado público solo dice que responde y qué commit sirve', async () => {
    const { GET } = await import('@/app/api/health/route');
    const res = await GET(req());
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.status).toBe('ok');
    expect(j).not.toHaveProperty('integrations');
  });

  it('?deep=1 sin credencial: 401; sin CRON_SECRET configurado también (no hay puerta abierta)', async () => {
    const { GET } = await import('@/app/api/health/route');
    expect((await GET(req('?deep=1'))).status).toBe(401);
    expect((await GET(req('?deep=1', 'Bearer cualquiera'))).status).toBe(401);
  });

  it('?deep=1 con credencial: informe de integraciones sin valores y 503 si algo está mal', async () => {
    vi.stubEnv('CRON_SECRET', 'cron-VALUE-xyz');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('RESEND_API_KEY', 're_VALUE_abc');
    vi.stubEnv('CRM_WEBHOOK_SECRET', 'solo-secreto');
    const { GET } = await import('@/app/api/health/route');
    const res = await GET(req('?deep=1', 'Bearer cron-VALUE-xyz'));
    const text = await res.text();
    expect(res.status).toBe(503); // CRM mal configurado
    expect(text).not.toContain('cron-VALUE-xyz');
    expect(text).not.toContain('re_VALUE_abc');
    const j = JSON.parse(text);
    expect(j.status).toBe('degraded');
    expect(j.integrations.find((i: { id: string }) => i.id === 'crm').state).toBe('misconfigured');
    expect(j.checks[0]).toMatchObject({ id: 'database', status: 'skip' });
  });
});
