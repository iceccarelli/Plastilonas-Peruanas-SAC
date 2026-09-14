import type { IncomingMessage, ServerResponse } from 'node:http';
import { LIMITE_PETICIONES } from './config';

/**
 * SERVIDOR SIN DEPENDENCIAS.
 *
 * Este servicio no instala ni un solo paquete en tiempo de ejecución: sólo
 * `node:http`. No es purismo. Es que lo que se despliega aquí responde a
 * agentes y a sistemas de compras de terceros, y cada dependencia es una
 * superficie que hay que auditar, actualizar y explicar. Un enrutador de
 * ochenta líneas se lee entero en cinco minutos; un framework, no.
 */

export type Manejador = (ctx: Contexto) => Promise<void> | void;

export interface Contexto {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  /** Segmentos capturados de la ruta: /v1/calculos/:slug → { slug }. */
  params: Record<string, string>;
  cuerpo: unknown;
  ip: string;
}

interface Ruta {
  metodo: string;
  patron: string[];
  manejador: Manejador;
}

const rutas: Ruta[] = [];

export function registrar(metodo: string, ruta: string, manejador: Manejador): void {
  rutas.push({ metodo, patron: ruta.split('/').filter(Boolean), manejador });
}

export const obtener = (ruta: string, m: Manejador) => registrar('GET', ruta, m);
export const enviar = (ruta: string, m: Manejador) => registrar('POST', ruta, m);

function emparejar(metodo: string, camino: string): { ruta: Ruta; params: Record<string, string> } | null {
  const partes = camino.split('/').filter(Boolean);
  for (const ruta of rutas) {
    if (ruta.metodo !== metodo || ruta.patron.length !== partes.length) continue;
    const params: Record<string, string> = {};
    let casa = true;
    for (let i = 0; i < ruta.patron.length; i += 1) {
      const p = ruta.patron[i] as string;
      const v = partes[i] as string;
      if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(v);
      else if (p !== v) { casa = false; break; }
    }
    if (casa) return { ruta, params };
  }
  return null;
}

export function json(res: ServerResponse, estado: number, cuerpo: unknown, cabeceras: Record<string, string> = {}): void {
  const texto = JSON.stringify(cuerpo, null, 2);
  res.writeHead(estado, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(texto),
    // La API es pública a propósito: un agente que la consulta desde el
    // navegador de un comprador no puede negociar cabeceras.
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400',
    ...cabeceras,
  });
  res.end(texto);
}

export function html(res: ServerResponse, estado: number, cuerpo: string): void {
  res.writeHead(estado, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(cuerpo),
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
  });
  res.end(cuerpo);
}

/**
 * Errores con forma. Un agente que recibe `{"error":{"codigo":"…"}}` puede
 * decidir; uno que recibe una página de error en HTML, no.
 */
export function fallo(res: ServerResponse, estado: number, codigo: string, mensaje: string, detalle?: unknown): void {
  json(res, estado, { error: { codigo, mensaje, detalle } }, { 'Cache-Control': 'no-store' });
}

const cubos = new Map<string, { n: number; t: number }>();
const VENTANA = 10 * 60 * 1000;

export function limitado(ip: string, tope = LIMITE_PETICIONES): boolean {
  const ahora = Date.now();
  const hit = cubos.get(ip);
  if (!hit || ahora - hit.t > VENTANA) {
    cubos.set(ip, { n: 1, t: ahora });
    return false;
  }
  hit.n += 1;
  return hit.n > tope;
}

function ipDe(req: IncomingMessage): string {
  const reenviada = req.headers['fly-client-ip'] || req.headers['x-forwarded-for'];
  const bruta = Array.isArray(reenviada) ? reenviada[0] : reenviada;
  return (bruta || req.socket.remoteAddress || 'desconocida').split(',')[0]!.trim();
}

async function leerCuerpo(req: IncomingMessage): Promise<unknown> {
  const trozos: Buffer[] = [];
  let bytes = 0;
  for await (const t of req) {
    bytes += (t as Buffer).length;
    // 256 kB: un RFQ con notas largas cabe de sobra; un intento de agotar
    // memoria, no.
    if (bytes > 262144) throw new Error('cuerpo demasiado grande');
    trozos.push(t as Buffer);
  }
  if (!trozos.length) return undefined;
  return JSON.parse(Buffer.concat(trozos).toString('utf8'));
}

export async function atender(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', 'http://interno');
  const ip = ipDe(req);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const encontrada = emparejar(req.method || 'GET', url.pathname);
  if (!encontrada) {
    fallo(res, 404, 'ruta_desconocida', `No existe ${req.method} ${url.pathname}. La lista completa está en ${'/openapi.json'}.`);
    return;
  }

  if (limitado(ip)) {
    fallo(res, 429, 'demasiadas_peticiones', 'Límite por IP alcanzado. Escriba a ventas@plastilonas.com si necesita un volumen mayor: se concede.');
    return;
  }

  let cuerpo: unknown;
  try {
    cuerpo = req.method === 'POST' ? await leerCuerpo(req) : undefined;
  } catch {
    fallo(res, 400, 'cuerpo_invalido', 'El cuerpo debe ser JSON y pesar menos de 256 kB.');
    return;
  }

  try {
    await encontrada.ruta.manejador({ req, res, url, params: encontrada.params, cuerpo, ip });
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'error desconocido';
    fallo(res, 500, 'error_interno', 'La petición no se pudo completar.', mensaje);
  }
}
