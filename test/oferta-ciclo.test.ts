import { describe, it, expect, beforeEach } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, rpcOver, seedLead } from './helpers/pglite-rpc';
import { quoteStore } from '@/lib/quote-store';
import { supabaseStaffStore } from '@/lib/staff-store';
import { QuoteDraftInput } from '@/lib/quotations';
import { hashToken, mintToken, expiryOf } from '@/lib/quote-token';
import { hit } from '@/lib/rate-limit';

/**
 * CICLO COMPLETO DE LA OFERTA contra Postgres real (PGlite), desde una base
 * VACÍA con schema.sql + todas las migraciones: crear → editar → emitir →
 * reemplazar → ver → aceptar/rechazar. El código de producción (quoteStore,
 * staff-store, rate-limit) corre sin cambios sobre un cliente `rpc` equivalente
 * al de PostgREST.
 */
const SECRET = 'x'.repeat(40);
const ISSUER = { name: 'Plastilonas Peruanas SAC' };
const input = (over: Record<string, unknown> = {}) =>
  QuoteDraftInput.parse({
    currency: 'PEN', validUntil: '2099-01-01', summary: 'Mangas Ø600 x 50 m, 12 unidades, entrega Arequipa',
    items: [{ description: 'Manga de ventilación Ø600 mm x 50 m', quantity: '12', unit: 'UND', unitPrice: '1042.00' }],
    taxTreatment: 'excluded', taxLabel: 'IGV 18% (no incluido)', taxAmount: '2250.72',
    terms: 'Pago 50% adelanto. Entrega a coordinar al confirmar el pedido.', notes: 'NOTA INTERNA: margen mínimo 22%', ...over,
  });

describe('ciclo de la oferta en Postgres real', () => {
  let db: PGlite;
  let rpc: ReturnType<typeof rpcOver>;
  let staff: ReturnType<typeof supabaseStaffStore>;
  let qs: ReturnType<typeof quoteStore>;
  beforeEach(async () => {
    db = await freshDb();
    rpc = rpcOver(db);
    staff = supabaseStaffStore(rpc as never);
    qs = quoteStore(rpc);
  });

  const draft = async (leadId: string, over: Record<string, unknown> = {}) => {
    const r = await staff.createQuote(leadId, 'ventas@p.com', input(over));
    expect(r, JSON.stringify(r)).toEqual({ ok: true });
    return ((await db.query(`select id from public.lead_quotes where quote_id=$1 order by version desc limit 1`, [leadId])).rows[0] as { id: string }).id;
  };
  const issue = async (id: string) => staff.issueQuote(id, 'ventas@p.com');
  const lq = async (id: string) => (await db.query(`select * from public.lead_quotes where id=$1`, [id])).rows[0] as Record<string, unknown>;
  const link = async (id: string, generation = 1) => {
    const token = mintToken(SECRET, id, generation);
    await qs.registerToken(id, hashToken(token), generation, expiryOf('2099-01-01'));
    return { token, hash: hashToken(token) };
  };
  const leadStatus = async (id: string) => ((await db.query(`select status, loss_reason from public.quotes where id=$1`, [id])).rows[0] as { status: string; loss_reason: string | null });

  describe('borrador', () => {
    it('guarda partidas, impuestos y condiciones; el total cuadra con las partidas', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id);
      expect(await lq(id)).toMatchObject({
        status: 'draft', amount_cents: 1475472, subtotal_cents: 1250400, tax_treatment: 'excluded', tax_cents: 225072,
      });
    });
    it('rechaza totales que no cuadran, impuesto adicional sin importe y leyenda vacía', async () => {
      const l = await seedLead(db);
      const items = JSON.stringify([{ description: 'x', quantity: '1', unit: 'u', unit_price_cents: 1000, amount_cents: 1000 }]);
      const call = (amount: number, tt: string | null, label: string | null, tax: number | null) =>
        db.query(`select public.lead_quote_create($1,'a@p.com',$2,'PEN','2099-01-01','Resumen suficiente',null,$3::jsonb,$4,$5,$6,null)`, [l.id, amount, items, tt, label, tax]);
      await expect(call(999, 'included', 'IGV incl.', null)).rejects.toThrow(/totals_mismatch/);
      await expect(call(1000, 'excluded', 'IGV', null)).rejects.toThrow(/tax_amount_required/);
      await expect(call(1000, 'included', '  ', null)).rejects.toThrow(/tax_label_required/);
      await expect(call(1180, 'excluded', 'IGV 18%', 180)).resolves.toBeTruthy();
    });
    it('se edita mientras es borrador; una emitida no se edita', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id);
      expect(await staff.updateQuote(id, 'ventas@p.com', input({ summary: 'Resumen corregido por la persona' }))).toEqual({ ok: true });
      expect((await lq(id)).summary).toBe('Resumen corregido por la persona');
      await issue(id);
      expect(await staff.updateQuote(id, 'ventas@p.com', input())).toEqual({ ok: false, error: 'quote_not_draft' });
    });
  });

  describe('emisión e instantánea inmutable', () => {
    it('no se emite sin tratamiento de impuestos explícito (no se presupone IGV)', async () => {
      const l = await seedLead(db);
      await db.query(`select public.lead_quote_create($1,'a@p.com',1000,'PEN','2099-01-01','Resumen suficiente',null)`, [l.id]);
      const id = ((await db.query(`select id from public.lead_quotes where quote_id=$1`, [l.id])).rows[0] as { id: string }).id;
      expect(await issue(id)).toEqual({ ok: false, error: 'tax_required' });
    });

    it('congela la instantánea con huella verificable; sin notas internas', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id);
      expect(await issue(id)).toEqual({ ok: true });
      const q = await lq(id);
      expect(q.status).toBe('issued');
      const snap = q.snapshot as Record<string, any>;
      expect(snap).toMatchObject({
        reference: `${l.rfq_code}-V1`, version: 1, currency: 'PEN', validUntil: '2099-01-01', totalCents: 1475472, subtotalCents: 1250400,
        customer: { company: 'Minera Andina SAC', ruc: '20123456786' }, request: { deliveryCity: 'Arequipa' },
        tax: { treatment: 'excluded', cents: 225072 }, terms: expect.stringContaining('50% adelanto'),
      });
      expect(snap.issuer.name).toBe('Plastilonas Peruanas SAC');
      expect(JSON.stringify(snap)).not.toMatch(/NOTA INTERNA|margen/);
      expect(q.snapshot_hash).toMatch(/^[0-9a-f]{64}$/);
      expect((await db.query(`select public.lead_quote_verify($1) as ok`, [id])).rows[0]).toEqual({ ok: true });
    });

    it('ninguna columna de la oferta emitida puede cambiar (ni por SQL directo)', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      for (const set of ["amount_cents = 1", "summary = 'otra cosa'", "valid_until = '2100-01-01'", "currency = 'USD'",
        "line_items = '[]'::jsonb", "tax_label = 'x'", "customer_terms = 'x'", "snapshot = '{}'::jsonb", "snapshot_hash = repeat('0',64)", "notes = 'x'"]) {
        await expect(db.query(`update public.lead_quotes set ${set} where id=$1`, [id]), set).rejects.toThrow(/quote_immutable/);
      }
      expect((await db.query(`select public.lead_quote_verify($1) as ok`, [id])).rows[0]).toEqual({ ok: true });
    });

    it('si la instantánea se manipulara por fuera, la verificación lo detecta', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      // Simula un acceso privilegiado que apaga el guardia: la huella delata el cambio.
      await db.exec(`alter table public.lead_quotes disable trigger lead_quotes_guard_trg`);
      await db.query(`update public.lead_quotes set snapshot = jsonb_set(snapshot, '{totalCents}', '1') where id=$1`, [id]);
      expect((await db.query(`select public.lead_quote_verify($1) as ok`, [id])).rows[0]).toEqual({ ok: false });
    });

    it('una oferta reemplazada no resucita y el estado solo avanza por las vías permitidas', async () => {
      const l = await seedLead(db);
      const a = await draft(l.id); await issue(a);
      const b = await draft(l.id); await issue(b);
      expect((await lq(a)).status).toBe('superseded');
      await expect(db.query(`update public.lead_quotes set status='issued' where id=$1`, [a])).rejects.toThrow(/quote_status_invalid|one_issued/);
      await expect(db.query(`update public.lead_quotes set status='accepted' where id=$1`, [a])).rejects.toThrow(/quote_status_invalid/);
    });

    it('al emitir queda UNA intención de entrega en cola, en la misma transacción', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      const d = await db.query(`select status, attempts, channel from public.quote_deliveries where lead_quote_id=$1`, [id]);
      expect(d.rows).toEqual([{ status: 'queued', attempts: 0, channel: 'email' }]);
    });

    it('reemplazar revoca los enlaces anteriores y la entrega vieja deja de enviarse', async () => {
      const l = await seedLead(db);
      const a = await draft(l.id); await issue(a);
      const t1 = await link(a);
      const b = await draft(l.id); await issue(b);
      expect(await qs.publicView(t1.hash)).toEqual({ state: 'revoked', reason: 'superseded' });
      const claimed = await qs.claimDeliveries(10);
      expect(claimed.map((c) => c.leadQuoteId)).toEqual([b]); // la de la v1 se descarta
      expect((await db.query(`select last_error, status from public.quote_deliveries where lead_quote_id=$1`, [a])).rows[0]).toEqual({ status: 'dead', last_error: 'not_current' });
    });
  });

  describe('vista pública del cliente', () => {
    it('estados: inexistente, abierta, vencida, revocada manualmente', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      expect(await qs.publicView(hashToken('no-existe'))).toEqual({ state: 'not_found' });
      const t = await link(id);
      const v = await qs.publicView(t.hash);
      expect(v).toMatchObject({ state: 'open', outcome: null });
      if (v.state === 'open') {
        expect(v.snapshot.reference).toBe(`${l.rfq_code}-V1`);
        expect(JSON.stringify(v)).not.toMatch(/NOTA INTERNA|margen|created_by|ventas@p\.com/);
      }
      await db.query(`update public.quote_access_tokens set expires_at = now() - interval '1 minute' where token_hash=$1`, [t.hash]);
      expect(await qs.publicView(t.hash)).toEqual({ state: 'expired' });
      await db.query(`update public.quote_access_tokens set expires_at = now() + interval '1 day', revoked_at = now(), revoked_reason='manual' where token_hash=$1`, [t.hash]);
      expect(await qs.publicView(t.hash)).toEqual({ state: 'revoked', reason: 'manual' });
    });

    it('un token no abre la oferta de OTRO cliente', async () => {
      const l1 = await seedLead(db, { company: 'Cliente Uno' });
      const l2 = await seedLead(db, { company: 'Cliente Dos' });
      const a = await draft(l1.id); await issue(a);
      const b = await draft(l2.id); await issue(b);
      const ta = await link(a);
      const v = await qs.publicView(ta.hash);
      expect(v.state === 'open' && v.snapshot.customer.company).toBe('Cliente Uno');
      expect(JSON.stringify(v)).not.toContain('Cliente Dos');
    });

    it('solo se registra el hash: el token en claro no está en ninguna tabla', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      const t = await link(id);
      const dump = JSON.stringify((await db.query(`select * from public.quote_access_tokens`)).rows);
      expect(dump).toContain(t.hash);
      expect(dump).not.toContain(t.token);
    });

    it('el registro del enlace exige oferta vigente', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id);
      await expect(qs.registerToken(id, hashToken('x'), 1, new Date(Date.now() + 1e9))).rejects.toThrow(/quote_not_issued/);
    });
  });

  describe('decisión del cliente', () => {
    const KEY = 'k'.repeat(22);
    const setup = async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      const t = await link(id);
      return { l, id, t };
    };

    it('aceptar: registra una vez, el lead pasa a WON y queda el rastro', async () => {
      const { l, id, t } = await setup();
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toMatchObject({ ok: true, outcome: 'accepted', replayed: false });
      expect(await leadStatus(l.id)).toEqual({ status: 'WON', loss_reason: null });
      expect(await lq(id)).toMatchObject({ status: 'accepted', resolved_via: 'customer', resolution_request_key: KEY });
      const ev = (await db.query(`select actor, to_value from public.lead_events where quote_id=$1 and action='quote' order by created_at, id`, [l.id])).rows;
      expect(ev.at(-1)).toEqual({ actor: 'cliente (enlace seguro)', to_value: 'v1 accepted' });
      expect(await qs.publicView(t.hash)).toMatchObject({ state: 'resolved', outcome: 'accepted' });
    });

    it('doble envío / repetición: sigue siendo UNA aceptación y no se re-audita', async () => {
      const { l, t } = await setup();
      await qs.decide(t.hash, 'accepted', null, KEY);
      const before = (await db.query(`select count(*)::int as n from public.lead_events where quote_id=$1`, [l.id])).rows[0];
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toMatchObject({ ok: true, outcome: 'accepted', replayed: true });
      expect(await qs.decide(t.hash, 'accepted', null, 'otra-clave-distinta-1234')).toMatchObject({ ok: true, replayed: true });
      expect((await db.query(`select count(*)::int as n from public.lead_events where quote_id=$1`, [l.id])).rows[0]).toEqual(before);
    });

    it('una respuesta DISTINTA después de resolver se rechaza y no cambia nada', async () => {
      const { l, t } = await setup();
      await qs.decide(t.hash, 'accepted', null, KEY);
      expect(await qs.decide(t.hash, 'rejected', 'cambié de idea', KEY)).toEqual({ ok: false, error: 'already_resolved' });
      expect(await leadStatus(l.id)).toEqual({ status: 'WON', loss_reason: null });
    });

    it('rechazar exige motivo; lo guarda como motivo de pérdida', async () => {
      const { l, t } = await setup();
      expect(await qs.decide(t.hash, 'rejected', '   ', KEY)).toEqual({ ok: false, error: 'reason_required' });
      expect(await leadStatus(l.id)).toMatchObject({ status: 'QUOTED' });
      expect(await qs.decide(t.hash, 'rejected', 'Precio superior al presupuesto', KEY)).toMatchObject({ ok: true, outcome: 'rejected' });
      expect(await leadStatus(l.id)).toEqual({ status: 'LOST', loss_reason: 'Precio superior al presupuesto' });
    });

    it('carreras simultáneas: aceptar y rechazar a la vez → exactamente una gana', async () => {
      const { l, t } = await setup();
      const rs = await Promise.all([
        qs.decide(t.hash, 'accepted', null, 'a'.repeat(20)),
        qs.decide(t.hash, 'rejected', 'motivo suficiente', 'b'.repeat(20)),
        qs.decide(t.hash, 'accepted', null, 'c'.repeat(20)),
      ]);
      const wins = rs.filter((r) => r.ok && !r.replayed);
      expect(wins).toHaveLength(1);
      const qrow = (await db.query(`select id from public.lead_quotes where quote_id=$1`, [l.id])).rows[0] as { id: string };
      const final = (await lq(qrow.id)).status;
      expect(['accepted', 'rejected']).toContain(final);
      for (const r of rs) if (r.ok) expect(r.outcome).toBe(final);
      expect((await leadStatus(l.id)).status).toBe(final === 'accepted' ? 'WON' : 'LOST');
    });

    it('el personal reemplaza la oferta mientras el cliente decide: la reemplazada NO se puede aceptar', async () => {
      const { l, t } = await setup();
      const b = await draft(l.id);
      await issue(b);
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toEqual({ ok: false, error: 'link_revoked' });
      expect((await leadStatus(l.id)).status).toBe('QUOTED'); // sin cambio comercial
    });

    it('enlace vencido, oferta vencida y token inventado no cambian nada', async () => {
      const { l, id, t } = await setup();
      expect(await qs.decide(hashToken('inventado'), 'accepted', null, KEY)).toEqual({ ok: false, error: 'link_invalid' });
      await db.query(`update public.quote_access_tokens set expires_at = now() - interval '1 second' where token_hash=$1`, [t.hash]);
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toEqual({ ok: false, error: 'link_expired' });
      await db.query(`update public.quote_access_tokens set expires_at = now() + interval '1 day' where token_hash=$1`, [t.hash]);
      await db.exec(`alter table public.lead_quotes disable trigger lead_quotes_guard_trg`);
      await db.query(`update public.lead_quotes set valid_until = '2000-01-01' where id=$1`, [id]);
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toEqual({ ok: false, error: 'offer_expired' });
      expect((await lq(id)).status).toBe('issued');
      expect((await leadStatus(l.id)).status).toBe('QUOTED');
    });

    it('entradas inválidas: resultado desconocido, clave corta, motivo larguísimo', async () => {
      const { t } = await setup();
      expect(await qs.decide(t.hash, 'maybe' as never, null, KEY)).toEqual({ ok: false, error: 'invalid_outcome' });
      expect(await qs.decide(t.hash, 'accepted', null, 'corta')).toEqual({ ok: false, error: 'invalid_request' });
      expect(await qs.decide(t.hash, 'rejected', 'x'.repeat(501), KEY)).toEqual({ ok: false, error: 'reason_too_long' });
    });

    it('rotar el enlace revoca el anterior y encola el nuevo con otra generación', async () => {
      const { id, t } = await setup();
      expect(await qs.rotateLink(id, 'ventas@p.com')).toEqual({ ok: true });
      expect(await qs.publicView(t.hash)).toEqual({ state: 'revoked', reason: 'manual' });
      expect(await qs.decide(t.hash, 'accepted', null, KEY)).toEqual({ ok: false, error: 'link_revoked' });
      const d = (await db.query(`select status, generation from public.quote_deliveries where lead_quote_id=$1`, [id])).rows[0];
      expect(d).toEqual({ status: 'queued', generation: 2 });
      const t2 = await link(id, 2);
      expect(await qs.decide(t2.hash, 'accepted', null, KEY)).toMatchObject({ ok: true });
    });
  });

  describe('cola de entrega', () => {
    it('reclamar es exclusivo: dos ejecuciones simultáneas no toman la misma entrega', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      const [a, b] = await Promise.all([qs.claimDeliveries(5), qs.claimDeliveries(5)]);
      expect(a.length + b.length).toBe(1);
      expect(await qs.claimDeliveries(5)).toHaveLength(0); // arrendada 3 min
    });
    it('una confirmación del proveedor no se degrada; rebote mata; el evento repetido no hace nada', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      const [c] = await qs.claimDeliveries(1);
      await qs.recordDelivery(c.id, 'sent', 1, null, 200, 'msg_1', null);
      expect(await qs.providerEvent('evt_1', 'msg_1', 'email.delivered')).toEqual({ claimed: true, updated: true });
      expect(await qs.providerEvent('evt_1', 'msg_1', 'email.delivered')).toEqual({ claimed: false, updated: false }); // replay
      await qs.recordDelivery(c.id, 'failed', 2, 'timeout', null, null, new Date());
      expect((await db.query(`select status from public.quote_deliveries where id=$1`, [c.id])).rows[0]).toEqual({ status: 'confirmed' });
      expect(await qs.providerEvent('evt_2', 'msg_otro', 'email.delivered')).toEqual({ claimed: true, updated: false });
      expect(await qs.providerEvent('evt_3', 'msg_1', 'email.bounced')).toEqual({ claimed: true, updated: true });
      expect((await db.query(`select status, last_error from public.quote_deliveries where id=$1`, [c.id])).rows[0]).toEqual({ status: 'dead', last_error: 'bounced' });
    });
    it('el reintento manual solo mueve entregas bloqueadas, fallidas o muertas', async () => {
      const l = await seedLead(db);
      const id = await draft(l.id); await issue(id);
      expect(await qs.requeueDelivery(id, 'ventas@p.com')).toEqual({ ok: true, requeued: false }); // ya está en cola
      const [c] = await qs.claimDeliveries(1);
      await qs.recordDelivery(c.id, 'dead', 6, 'http_5xx', 500, null, null);
      expect(await qs.requeueDelivery(id, 'ventas@p.com')).toEqual({ ok: true, requeued: true });
      expect((await qs.health()).queued).toBe(1);
    });
  });

  describe('límite de tasa compartido', () => {
    it('cuenta de forma atómica entre "instancias" simultáneas', async () => {
      const rule = { scope: 't', subject: '203.0.113.7', windowSeconds: 60, max: 5 };
      // 12 golpes concurrentes desde clientes independientes sobre la misma base.
      const rs = await Promise.all(Array.from({ length: 12 }, () => hit(rpcOver(db), rule, 'closed')));
      expect(rs.filter((r) => r.allowed)).toHaveLength(5);
      expect(rs.filter((r) => !r.allowed)).toHaveLength(7);
    });
    it('la ventana se reinicia y las claves son independientes', async () => {
      const a = { scope: 't', subject: 'a', windowSeconds: 60, max: 1 };
      expect((await hit(rpc, a, 'closed')).allowed).toBe(true);
      expect((await hit(rpc, a, 'closed')).allowed).toBe(false);
      expect((await hit(rpc, { ...a, subject: 'b' }, 'closed')).allowed).toBe(true);
      await db.exec(`update public.rate_limits set window_start = now() - interval '2 minutes'`);
      expect((await hit(rpc, a, 'closed')).allowed).toBe(true);
      expect((await db.query(`select public.rate_limit_purge(1) as n`)).rows[0]).toBeTruthy();
    });
    it('la base nunca guarda el sujeto (IP) en claro', async () => {
      await hit(rpc, { scope: 't', subject: '198.51.100.23', windowSeconds: 60, max: 3 }, 'closed');
      expect(JSON.stringify((await db.query(`select * from public.rate_limits`)).rows)).not.toContain('198.51.100.23');
    });
    it('si la dependencia falla: cerrado niega, abierto deja pasar', async () => {
      const broken = { rpc: async () => ({ data: null, error: { message: 'down' } }) };
      const rule = { scope: 't', subject: 'x', windowSeconds: 60, max: 1 };
      expect(await hit(broken, rule, 'closed')).toMatchObject({ allowed: false, unavailable: true });
      expect(await hit(broken, rule, 'open')).toMatchObject({ allowed: true });
    });
  });

  it('la migración completa es idempotente (se puede re-aplicar sin error ni pérdida)', async () => {
    const l = await seedLead(db);
    const id = await draft(l.id); await issue(id);
    const { readFileSync, readdirSync } = await import('node:fs');
    for (const f of readdirSync('supabase/migrations').sort()) await db.exec(readFileSync(`supabase/migrations/${f}`, 'utf8'));
    expect(await lq(id)).toMatchObject({ status: 'issued' });
    expect((await db.query(`select public.lead_quote_verify($1) as ok`, [id])).rows[0]).toEqual({ ok: true });
  });

  it('actualización de una base en uso: la oferta emitida ANTES de esta migración sigue pudiendo resolverse', async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const { readFileSync, readdirSync } = await import('node:fs');
    const sql = (f: string) => readFileSync(`supabase/${f}`, 'utf8');
    const old = new PGlite();
    await old.exec(`create schema auth; create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;`);
    await old.exec(sql('schema.sql').replace(/create extension if not exists "pgcrypto";/, ''));
    const files = readdirSync('supabase/migrations').sort();
    for (const f of files) if (f <= '20261023020000_rfq_quotations.sql') await old.exec(sql(`migrations/${f}`));
    const l = (await old.query(`insert into public.quotes(customer_email, status, rfq_code, payload) values ('a@b.co','QUALIFIED','RFQ-OLD-1','{}'::jsonb) returning id`)).rows[0] as { id: string };
    await old.query(`select * from public.lead_quote_create($1,'v@p.com',5000,'PEN','2099-01-01','Oferta heredada completa',null)`, [l.id]);
    const q = (await old.query(`select id from public.lead_quotes`)).rows[0] as { id: string };
    await old.query(`select * from public.lead_quote_issue($1,'v@p.com')`, [q.id]);

    for (const f of files) if (f > '20261023020000_rfq_quotations.sql') await old.exec(sql(`migrations/${f}`));
    expect((await old.query(`select status, amount_cents::int as a from public.lead_quotes`)).rows[0]).toEqual({ status: 'issued', a: 5000 });
    // Sin instantánea (se emitió antes), pero el personal puede registrar el resultado como siempre.
    const r = await rpcOver(old).rpc('lead_quote_resolve', { p_id: q.id, p_actor: 'v@p.com', p_outcome: 'accepted', p_reason: null });
    expect(r.error).toBeNull();
    expect((await old.query(`select status from public.quotes`)).rows[0]).toEqual({ status: 'WON' });
  });

  it('RLS activa y sin políticas en las tablas nuevas', async () => {
    for (const t of ['quote_access_tokens', 'quote_deliveries', 'webhook_events', 'rate_limits']) {
      expect((await db.query(`select relrowsecurity from pg_class where relname=$1`, [t])).rows[0], t).toEqual({ relrowsecurity: true });
      expect((await db.query(`select 1 from pg_policies where tablename=$1`, [t])).rows, t).toHaveLength(0);
    }
  });
});
