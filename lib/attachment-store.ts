/**
 * Almacenamiento privado de adjuntos del RFQ (Supabase Storage + lead_attachments).
 *
 * Ciclo de vida:
 *   1. createUpload   -> URL firmada de un solo uso para UNA ruta incoming/<id>/<archivo>.
 *   2. (navegador sube directo; el bucket no tiene política anónima)
 *   3. attach         -> al enviar el RFQ el servidor verifica que el objeto EXISTE, que
 *                        no excede el tope y que su cabecera coincide con la extensión,
 *                        y lo asocia a la solicitud; rutas que no emitió él se rechazan.
 *   4. purgeAbandoned -> borra lo subido y nunca asociado tras N días.
 */
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import {
  BUCKET, MAX_BYTES, SIGNATURE_BYTES, buildPath, extensionOf, matchesSignature, parseRef,
} from '@/lib/attachments';

export interface AttachResult {
  attached: number;
  rejected: number;
}

export interface AttachmentStore {
  createUpload(filename: string): Promise<{ path: string; token: string }>;
  attach(quoteId: string, refs: string[]): Promise<AttachResult>;
  purgeAbandoned(maxAgeDays: number, maxFolders?: number): Promise<{ removed: number }>;
}

export function supabaseAttachmentStore(db: SupabaseClient = supabaseAdmin()): AttachmentStore {
  const bucket = () => db.storage.from(BUCKET);

  /** Primeros bytes del objeto, por URL firmada y Range. null si no se pudo leer. */
  async function head(path: string): Promise<Uint8Array | null> {
    try {
      const { data } = await bucket().createSignedUrl(path, 60);
      if (!data?.signedUrl) return null;
      const res = await fetch(data.signedUrl, {
        headers: { Range: `bytes=0-${SIGNATURE_BYTES - 1}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return new Uint8Array(await res.arrayBuffer()).subarray(0, SIGNATURE_BYTES);
    } catch {
      return null;
    }
  }

  return {
    async createUpload(filename) {
      const path = buildPath(randomBytes(16).toString('hex'), filename);
      const { data, error } = await bucket().createSignedUploadUrl(path);
      if (error || !data) throw new Error(`signed upload failed: ${error?.name ?? 'unknown'}`);
      return { path, token: data.token };
    },

    async attach(quoteId, refs) {
      let attached = 0;
      let rejected = 0;
      for (const ref of refs) {
        const p = parseRef(ref);
        if (!p) { rejected++; continue; }
        const { data: objs, error } = await bucket().list(p.dir, { limit: 10 });
        const obj = objs?.find((o) => o.name === p.filename);
        if (error || !obj) { rejected++; continue; }
        const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
        if (typeof meta.size === 'number' && (meta.size <= 0 || meta.size > MAX_BYTES)) { rejected++; continue; }
        // Fallo cerrado: si no se puede leer la cabecera, el archivo no se asocia.
        const bytes = await head(p.path);
        if (!bytes || !matchesSignature(extensionOf(p.filename), bytes)) { rejected++; continue; }
        const { error: insErr } = await db.from('lead_attachments').insert({
          quote_id: quoteId, path: p.path, filename: p.filename,
          size_bytes: meta.size ?? null, mime_type: meta.mimetype ?? null,
        });
        // 23505: la misma ruta ya estaba asociada a otra solicitud -> no se reutiliza.
        if (insErr) rejected++; else attached++;
      }
      return { attached, rejected };
    },

    async purgeAbandoned(maxAgeDays, maxFolders = 100) {
      const cutoff = Date.now() - maxAgeDays * 86_400_000;
      const { data: folders } = await bucket().list('incoming', { limit: maxFolders });
      let removed = 0;
      for (const f of folders ?? []) {
        const dir = `incoming/${f.name}`;
        const { data: files } = await bucket().list(dir, { limit: 20 });
        const old = (files ?? []).filter((o) => o.created_at && new Date(o.created_at).getTime() < cutoff);
        if (!old.length) continue;
        const paths = old.map((o) => `${dir}/${o.name}`);
        const { data: used } = await db.from('lead_attachments').select('path').in('path', paths);
        const usedSet = new Set((used ?? []).map((u: { path: string }) => u.path));
        const orphans = paths.filter((x) => !usedSet.has(x));
        if (!orphans.length) continue;
        const { error } = await bucket().remove(orphans);
        if (!error) removed += orphans.length;
      }
      return { removed };
    },
  };
}
