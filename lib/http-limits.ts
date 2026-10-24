/**
 * Lectura de cuerpos con tope REAL. `Content-Length` lo declara el cliente (o
 * falta con transferencia por trozos), así que comprobarlo no basta: se corta
 * la lectura en cuanto se superan los bytes permitidos, sin acumular el resto.
 */
export type BoundedBody = { ok: true; text: string } | { ok: false; reason: 'too_large' | 'unreadable' };

export async function readBoundedText(req: Request, maxBytes: number): Promise<BoundedBody> {
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > maxBytes) return { ok: false, reason: 'too_large' };
  if (!req.body) return { ok: true, text: '' };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: 'too_large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
  const all = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.byteLength; }
  return { ok: true, text: new TextDecoder().decode(all) };
}
