import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface Captured { method: string; url: string; headers: IncomingMessage['headers']; body: string }

/**
 * Proveedor de correo FALSO y local (compatible con POST /emails de Resend):
 * captura lo que se enviaría y responde con el guion que se le indique.
 * Ningún mensaje de estas pruebas sale a Internet ni a un cliente real.
 */
export async function captureServer(script: (n: number, req: Captured) => { status?: number; body?: unknown; hang?: boolean } = () => ({})) {
  const seen: Captured[] = [];
  const server: Server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const cap = { method: req.method ?? '', url: req.url ?? '', headers: req.headers, body };
      seen.push(cap);
      const r = script(seen.length, cap);
      if (r.hang) return; // nunca responde: simula tiempo de espera agotado
      res.writeHead(r.status ?? 200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(r.body ?? { id: `msg_${seen.length}` }));
    });
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    base, seen,
    close: () => new Promise<void>((ok) => { server.closeAllConnections?.(); server.close(() => ok()); }),
  };
}
