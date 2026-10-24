import { describe, it, expect, vi, afterEach } from 'vitest';
import { matchesSignature, MAX_BYTES } from '@/lib/attachments';
import { supabaseAttachmentStore } from '@/lib/attachment-store';
import { readBoundedText } from '@/lib/http-limits';

const bytes = (...v: (number | string)[]) =>
  Uint8Array.from(v.flatMap((x) => (typeof x === 'string' ? [...x].map((c) => c.charCodeAt(0)) : [x])));

describe('firma del archivo contra su extensión', () => {
  it('acepta cabeceras legítimas', () => {
    expect(matchesSignature('pdf', bytes('%PDF-1.7\n'))).toBe(true);
    expect(matchesSignature('pdf', bytes('\n\n', '%PDF-1.4'))).toBe(true);
    expect(matchesSignature('jpg', bytes(0xff, 0xd8, 0xff, 0xe0))).toBe(true);
    expect(matchesSignature('png', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe(true);
    expect(matchesSignature('dwg', bytes('AC1032', 0, 0))).toBe(true);
    expect(matchesSignature('dxf', bytes('  0\r\nSECTION\r\n  2\r\nHEADER'))).toBe(true);
  });
  it('rechaza HTML, scripts y ejecutables renombrados', () => {
    const html = bytes('<html><script>alert(1)</script>');
    const exe = bytes('MZ', 0x90, 0, 3, 0);
    for (const ext of ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'dxf']) {
      expect(matchesSignature(ext, html), `html como ${ext}`).toBe(false);
      expect(matchesSignature(ext, exe), `exe como ${ext}`).toBe(false);
    }
  });
  it('un DXF binario con NUL que no es AutoCAD se rechaza; vacío y extensión ajena también', () => {
    expect(matchesSignature('dxf', bytes('  0\nSECTION', 0, 1))).toBe(false);
    expect(matchesSignature('pdf', new Uint8Array())).toBe(false);
    expect(matchesSignature('svg', bytes('<svg'))).toBe(false);
  });
});

/** Cliente Supabase mínimo: un bucket con un objeto y la tabla de adjuntos. */
function fakeDb(objects: Record<string, { size: number }>) {
  const inserted: unknown[] = [];
  const db = {
    storage: {
      from: () => ({
        list: async (dir: string) => ({
          data: Object.entries(objects)
            .filter(([p]) => p.startsWith(`${dir}/`))
            .map(([p, m]) => ({ name: p.slice(dir.length + 1), metadata: { size: m.size, mimetype: 'application/pdf' } })),
          error: null,
        }),
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://storage.test/${path}` }, error: null }),
      }),
    },
    from: () => ({ insert: async (row: unknown) => { inserted.push(row); return { error: null }; } }),
  };
  return { db: db as never, inserted };
}

describe('attach: el contenido manda, no lo que el cliente declaró', () => {
  afterEach(() => vi.unstubAllGlobals());
  const dir = `incoming/${'c'.repeat(32)}`;
  const ref = (n: string) => `${dir}/${n}`;

  it('asocia un PDF real, rechaza un HTML con extensión .pdf y el que excede el tope', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      new Response(url.endsWith('real.pdf') ? '%PDF-1.7 ...' : '<html>', { status: 206 })));
    const { db, inserted } = fakeDb({
      [ref('real.pdf')]: { size: 1000 },
      [ref('falso.pdf')]: { size: 1000 },
      [ref('enorme.pdf')]: { size: MAX_BYTES + 1 },
    });
    const r = await supabaseAttachmentStore(db).attach('q1', [ref('real.pdf'), ref('falso.pdf'), ref('enorme.pdf')]);
    expect(r).toEqual({ attached: 1, rejected: 2 });
    expect(inserted).toHaveLength(1);
  });

  it('falla cerrado si no se puede leer la cabecera', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('red'); }));
    const { db, inserted } = fakeDb({ [ref('real.pdf')]: { size: 10 } });
    expect(await supabaseAttachmentStore(db).attach('q1', [ref('real.pdf')])).toEqual({ attached: 0, rejected: 1 });
    expect(inserted).toHaveLength(0);
  });
});

describe('lectura de cuerpo con tope real', () => {
  const req = (body: BodyInit | null, headers: Record<string, string> = {}) =>
    new Request('https://x.test/', { method: 'POST', body, headers, duplex: 'half' } as RequestInit);

  it('lee cuerpos dentro del tope', async () => {
    expect(await readBoundedText(req('{"a":1}'), 100)).toEqual({ ok: true, text: '{"a":1}' });
  });
  it('corta un cuerpo por trozos que supera el tope aunque no declare Content-Length', async () => {
    let pulled = 0;
    const stream = new ReadableStream({
      pull(c) { pulled++; c.enqueue(new Uint8Array(1024)); if (pulled > 1000) c.close(); },
    });
    const r = await readBoundedText(req(stream), 4096);
    expect(r).toEqual({ ok: false, reason: 'too_large' });
    expect(pulled).toBeLessThan(20); // no se leyó el flujo entero
  });
  it('rechaza por Content-Length declarado sin leer', async () => {
    expect(await readBoundedText(req('x', { 'content-length': '999999' }), 100)).toEqual({ ok: false, reason: 'too_large' });
  });
});
