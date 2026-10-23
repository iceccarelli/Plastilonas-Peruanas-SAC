import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { checkUpload, parseRef, sanitizeFilename, MAX_BYTES, buildPath } from '@/lib/attachments';
import { canTransition, transitionError, allowedTransitions, normalizeStatus, STATUSES } from '@/lib/lead-workflow';
import { isStaff, staffEmails } from '@/lib/staff-policy';
import { submitLead, _resetBurst } from '@/lib/lead-service';
import { memoryLeadStore } from './helpers/memory-lead-store';
import { memoryAttachmentStore } from './helpers/memory-attachment-store';

const lead = (over: Record<string, unknown> = {}) => ({
  nombre: 'QA', email: 'qa@example.com', telefono: '999000111', mensaje: 'sintético', ...over,
});

describe('validación de adjuntos', () => {
  it('acepta los formatos del formulario y rechaza ejecutables, scripts y SVG', () => {
    expect(checkUpload('plano.pdf', 'application/pdf', 1000)).toMatchObject({ ok: true, filename: 'plano.pdf' });
    expect(checkUpload('foto.JPG', 'image/jpeg', 1000).ok).toBe(true);
    expect(checkUpload('plano.dwg', '', 1000).ok).toBe(true);
    for (const [n, t] of [['x.exe', 'application/octet-stream'], ['x.html', 'text/html'], ['x.svg', 'image/svg+xml'], ['x.php', 'text/plain'], ['sin-extension', 'application/pdf']] as const) {
      expect(checkUpload(n, t, 10), n).toEqual({ ok: false, error: 'type' });
    }
  });
  it('rechaza extensión que no coincide con el tipo declarado (pdf declarado como html)', () => {
    expect(checkUpload('a.pdf', 'text/html', 10)).toEqual({ ok: false, error: 'type' });
  });
  it('rechaza vacíos y archivos sobre 20 MB', () => {
    expect(checkUpload('a.pdf', 'application/pdf', 0)).toEqual({ ok: false, error: 'empty' });
    expect(checkUpload('a.pdf', 'application/pdf', MAX_BYTES + 1)).toEqual({ ok: false, error: 'size' });
  });
  it('el nombre se reconstruye: sin rutas, sin traversal, sin caracteres raros', () => {
    expect(sanitizeFilename('../../etc/pass wd.pdf')).toBe('etc_pass_wd.pdf');
    expect(sanitizeFilename('Plano ñandú (final) v2.PDF')).toMatch(/^[\w-]+\.pdf$/);
    expect(sanitizeFilename('a'.repeat(300) + '.png').length).toBeLessThanOrEqual(64);
  });
  it('solo se aceptan referencias con la forma exacta que emite el servidor', () => {
    const ok = buildPath('a'.repeat(32), 'plano.pdf');
    expect(parseRef(ok)?.path).toBe(ok);
    for (const bad of ['plano.pdf (adjuntar por correo)', '../incoming/' + 'a'.repeat(32) + '/x.pdf', 'incoming/XYZ/x.pdf', `incoming/${'a'.repeat(32)}/../x.pdf`, `web-123/x.pdf`, `incoming/${'a'.repeat(32)}/x/y.pdf`]) {
      expect(parseRef(bad), bad).toBeNull();
    }
  });
});

describe('adjuntos en el contrato de recepción', () => {
  beforeEach(() => _resetBurst());
  it('asocia solo objetos existentes y cuenta los que no llegaron', async () => {
    const att = memoryAttachmentStore();
    const real = buildPath('b'.repeat(32), 'plano.pdf');
    att.objects.add(real);
    const r = await submitLead(
      lead({ archivos: [real, 'foto.png (no se pudo subir — adjuntar por correo)', buildPath('c'.repeat(32), 'fantasma.pdf')] }),
      '20.0.0.1', { store: memoryLeadStore(), attachments: att, env: {} },
    );
    expect(r.body.accepted).toBe(true);
    expect(r.body.attachments).toEqual({ requested: 3, attached: 1 });
  });
  it('una misma ruta no se puede asociar a dos solicitudes', async () => {
    const att = memoryAttachmentStore();
    const real = buildPath('d'.repeat(32), 'plano.pdf');
    att.objects.add(real);
    const store = memoryLeadStore();
    const a = await submitLead(lead({ archivos: [real], mensaje: 'uno' }), '20.0.0.2', { store, attachments: att, env: {} });
    const b = await submitLead(lead({ archivos: [real], mensaje: 'dos' }), '20.0.0.2', { store, attachments: att, env: {} });
    expect(a.body.attachments?.attached).toBe(1);
    expect(b.body.attachments?.attached).toBe(0);
  });
  it('si el almacenamiento falla, el lead sigue aceptado y el adjunto figura como no asociado', async () => {
    const att = memoryAttachmentStore();
    att.attach = async () => { throw new Error('storage down'); };
    const r = await submitLead(lead({ archivos: [buildPath('e'.repeat(32), 'a.pdf')] }), '20.0.0.3', { store: memoryLeadStore(), attachments: att, env: {} });
    expect(r.body.accepted).toBe(true);
    expect(r.body.attachments).toEqual({ requested: 1, attached: 0 });
  });
});

describe('flujo comercial', () => {
  it('permite solo las transiciones del proceso real', () => {
    expect(allowedTransitions('NEW')).toEqual(['ASSIGNED', 'LOST']);
    expect(canTransition('NEW', 'QUOTED')).toBe(false);   // no se salta la calificación
    expect(canTransition('QUALIFIED', 'QUOTE_PREPARATION')).toBe(true);
    expect(canTransition('QUOTED', 'WON')).toBe(true);
    expect(canTransition('WON', 'LOST')).toBe(false);     // un ganado es final
    expect(canTransition('LOST', 'NEW')).toBe(true);      // reabrir
  });
  it('perder exige motivo', () => {
    expect(transitionError('ASSIGNED', 'LOST', '  ')).toBe('reason_required');
    expect(transitionError('ASSIGNED', 'LOST', 'sin presupuesto')).toBeNull();
    expect(transitionError('NEW', 'WON')).toBe('invalid_transition');
  });
  it('estados legados o desconocidos se tratan como NEW', () => {
    expect(normalizeStatus('new')).toBe('NEW');
    expect(normalizeStatus('TECHNICAL_REVIEW')).toBe('NEW');
    expect(normalizeStatus(null)).toBe('NEW');
    expect(STATUSES).toContain('QUOTE_PREPARATION');
  });
});

describe('autorización del personal', () => {
  const env = { STAFF_EMAILS: ' Ventas@Plastilonas.com ,gerencia@plastilonas.com' };
  it('lista cerrada, normalizada', () => {
    expect(staffEmails(env)).toEqual(['ventas@plastilonas.com', 'gerencia@plastilonas.com']);
    expect(staffEmails({})).toEqual([]);
  });
  it('exige correo en la lista Y proveedor Google', () => {
    expect(isStaff({ email: 'ventas@plastilonas.com', provider: 'google' }, env)).toBe(true);
    expect(isStaff({ email: 'VENTAS@plastilonas.com', provider: 'google' }, env)).toBe(true);
    expect(isStaff({ email: 'ventas@plastilonas.com', provider: 'facebook' }, env)).toBe(false); // correo no verificado
    expect(isStaff({ email: 'intruso@gmail.com', provider: 'google' }, env)).toBe(false);
    expect(isStaff({ email: null, provider: 'google' }, env)).toBe(false);
    expect(isStaff(null, env)).toBe(false);
  });
  it('sin STAFF_EMAILS nadie es personal (no hay acceso por defecto)', () => {
    expect(isStaff({ email: 'ventas@plastilonas.com', provider: 'google' }, {})).toBe(false);
  });
});

describe('compuerta HTTP del personal', () => {
  beforeEach(() => { vi.resetModules(); });
  const post = (headers: Record<string, string> = {}) =>
    new Request('https://plastilonas.com/api/staff/leads/x/status', { method: 'POST', headers: { host: 'plastilonas.com', ...headers } }) as never;

  it('rechaza POST de otro origen (CSRF) antes de mirar la sesión', async () => {
    const requireStaff = vi.fn(async () => 'ventas@plastilonas.com');
    vi.doMock('@/lib/staff', () => ({ requireStaff, staffEmails: () => [] }));
    const { staffGate } = await import('@/lib/staff-http');
    const g = await staffGate(post({ origin: 'https://evil.example' }), { write: true });
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(403);
    expect(requireStaff).not.toHaveBeenCalled();
  });
  it('sin sesión de personal responde 404 (no revela que existe)', async () => {
    vi.doMock('@/lib/staff', () => ({ requireStaff: async () => null, staffEmails: () => [] }));
    const { staffGate } = await import('@/lib/staff-http');
    const g = await staffGate(post({ origin: 'https://plastilonas.com' }), { write: true });
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(404);
  });
  it('con personal pero sin base de datos configurada responde 503, no 500', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.doMock('@/lib/staff', () => ({ requireStaff: async () => 'ventas@plastilonas.com', staffEmails: () => [] }));
    const { staffGate } = await import('@/lib/staff-http');
    const g = await staffGate(post({ origin: 'https://plastilonas.com' }), { write: true });
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(503);
    vi.unstubAllEnvs();
  });
});

describe('POST /api/lead/upload-url (validación previa a Storage)', () => {
  const call = async (body: unknown) => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:9');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');
    const { POST } = await import('@/app/api/lead/upload-url/route');
    return POST(new Request('http://localhost/api/lead/upload-url', { method: 'POST', body: JSON.stringify(body), headers: { 'x-real-ip': '30.0.0.' + Math.floor(Math.random() * 250) } }) as never);
  };
  it('rechaza tipos no permitidos, vacíos y sobre el límite sin tocar Storage', async () => {
    expect((await call({ name: 'virus.exe', type: 'application/octet-stream', size: 100 })).status).toBe(400);
    expect((await call({ name: 'a.pdf', type: 'application/pdf', size: MAX_BYTES + 1 })).status).toBe(400);
    expect((await call({ name: 'a.pdf', type: 'application/pdf', size: 0 })).status).toBe(400);
    expect((await call({ nope: true })).status).toBe(400);
  });
  it('sin Supabase configurado responde 503 explícito', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const { POST } = await import('@/app/api/lead/upload-url/route');
    const res = await POST(new Request('http://localhost/x', { method: 'POST', body: '{}' }) as never);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('storage_not_configured');
  });
});

describe('migración de adjuntos y auditoría (Postgres real)', () => {
  const sql = (f: string) => readFileSync(f, 'utf8');
  let db: PGlite;
  beforeEach(async () => {
    db = new PGlite();
    await db.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
    await db.exec(sql('supabase/schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
    await db.exec(sql('supabase/migrations/20261023000000_rfq_durable_pipeline.sql'));
    await db.exec(sql('supabase/migrations/20261023010000_rfq_attachments_staff.sql'));
  });
  const quote = async () => ((await db.query(`insert into public.quotes(customer_email, rfq_code) values ('a@b.co', 'R-' || gen_random_uuid()) returning id`)).rows[0] as { id: string }).id;

  it('es idempotente y no falla sin el esquema storage', async () => {
    await db.exec(sql('supabase/migrations/20261023010000_rfq_attachments_staff.sql'));
  });
  it('una ruta de adjunto es única en todo el sistema', async () => {
    const a = await quote(); const b = await quote();
    await db.query(`insert into public.lead_attachments(quote_id, path, filename) values ($1, 'incoming/x/a.pdf', 'a.pdf')`, [a]);
    await expect(db.query(`insert into public.lead_attachments(quote_id, path, filename) values ($1, 'incoming/x/a.pdf', 'a.pdf')`, [b])).rejects.toThrow();
  });
  it('la auditoría solo admite acciones conocidas y se borra con la solicitud', async () => {
    const a = await quote();
    await db.query(`insert into public.lead_events(quote_id, actor, action, to_value) values ($1,'v@p.com','status','QUALIFIED')`, [a]);
    await expect(db.query(`insert into public.lead_events(quote_id, actor, action) values ($1,'v@p.com','hack')`, [a])).rejects.toThrow();
    await db.query(`delete from public.quotes where id=$1`, [a]);
    expect((await db.query(`select 1 from public.lead_events`)).rows).toHaveLength(0);
  });
  it('RLS activa y sin políticas en las dos tablas nuevas', async () => {
    for (const t of ['lead_attachments', 'lead_events']) {
      const r = await db.query(`select relrowsecurity from pg_class where relname=$1`, [t]);
      expect((r.rows[0] as { relrowsecurity: boolean }).relrowsecurity).toBe(true);
      expect((await db.query(`select 1 from pg_policies where tablename=$1`, [t])).rows).toHaveLength(0);
    }
  });
});
