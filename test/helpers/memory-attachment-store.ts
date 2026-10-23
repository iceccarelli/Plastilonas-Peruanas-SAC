import { randomBytes } from 'node:crypto';
import type { AttachmentStore } from '@/lib/attachment-store';
import { buildPath, parseRef } from '@/lib/attachments';

/** Modela el comportamiento observable: solo rutas emitidas y existentes, una sola vez. */
export function memoryAttachmentStore() {
  const objects = new Set<string>();
  const attached = new Map<string, string>(); // path -> quoteId
  const store: AttachmentStore & { objects: Set<string>; attached: typeof attached } = {
    objects, attached,
    async createUpload(filename) {
      const path = buildPath(randomBytes(16).toString('hex'), filename);
      return { path, token: 't' };
    },
    async attach(quoteId, refs) {
      let ok = 0; let bad = 0;
      for (const r of refs) {
        const p = parseRef(r);
        if (!p || !objects.has(p.path) || attached.has(p.path)) { bad++; continue; }
        attached.set(p.path, quoteId); ok++;
      }
      return { attached: ok, rejected: bad };
    },
    async purgeAbandoned() { return { removed: 0 }; },
  };
  return store;
}
