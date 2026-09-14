import { SITIO } from './config';
import { enlaceCotizacion } from './contrato';

/**
 * DONDE ESTO SE CONVIERTE EN DINERO.
 *
 * Todo lo anterior —catálogo, glosario, cálculo— sirve para una cosa: que una
 * solicitud llegue COMPLETA. Un RFQ que dice «necesito big bags» cuesta tres
 * correos de ida y vuelta antes de poder cotizar; uno que trae producto,
 * medidas, cantidad, destino y fecha se cotiza el mismo día.
 *
 * El lead NO se guarda aquí. Se reenvía a /api/lead del sitio, que ya tiene el
 * almacenamiento, el webhook al CRM y la atribución. Un segundo buzón sería un
 * segundo sitio donde perder una solicitud.
 */

export interface SolicitudEntrante {
  email?: unknown;
  telefono?: unknown;
  nombre?: unknown;
  empresa?: unknown;
  ruc?: unknown;
  producto?: unknown;
  cantidad?: unknown;
  medidas?: unknown;
  material?: unknown;
  sector?: unknown;
  aplicacion?: unknown;
  ciudad_entrega?: unknown;
  pais_entrega?: unknown;
  fecha_necesaria?: unknown;
  mensaje?: unknown;
  idioma?: unknown;
  /** De dónde viene: 'mcp', 'api', 'erp-cliente'. Se conserva para atribución. */
  origen?: unknown;
}

export class SolicitudInvalida extends Error {
  constructor(public campos: string[]) {
    super(`Faltan o son inválidos: ${campos.join(', ')}.`);
  }
}

const texto = (v: unknown, max: number): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
};

/** Un correo con forma de correo. No se verifica que exista: eso lo dice el rebote. */
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validar(s: SolicitudEntrante): {
  email: string;
  telefono: string;
  campos: Record<string, string | undefined>;
} {
  const faltan: string[] = [];
  const email = texto(s.email, 180);
  const telefono = texto(s.telefono, 40);

  if (!email || !CORREO.test(email)) faltan.push('email');
  // Seis dígitos es el mínimo con el que se puede devolver una llamada.
  if (!telefono || telefono.replace(/\D/g, '').length < 6) faltan.push('telefono');
  if (faltan.length) throw new SolicitudInvalida(faltan);

  return {
    email: email as string,
    telefono: telefono as string,
    campos: {
      nombre: texto(s.nombre, 120),
      empresa: texto(s.empresa, 160),
      ruc: (() => {
        const r = texto(s.ruc, 11);
        return r && /^\d{11}$/.test(r) ? r : undefined;
      })(),
      producto: texto(s.producto, 200),
      cantidad: texto(s.cantidad, 80),
      medidas: texto(s.medidas, 120),
      material: texto(s.material, 80),
      sector: texto(s.sector, 80),
      aplicacion: texto(s.aplicacion, 240),
      ciudad: texto(s.ciudad_entrega, 80),
      pais: texto(s.pais_entrega, 80),
      fecha: texto(s.fecha_necesaria, 40),
      mensaje: texto(s.mensaje, 4000),
      idioma: (() => {
        const i = texto(s.idioma, 2);
        return i === 'en' || i === 'pt' || i === 'es' ? i : 'es';
      })(),
      origen: texto(s.origen, 40) ?? 'api',
    },
  };
}

export interface SolicitudAceptada {
  aceptada: true;
  referencia: string;
  respuesta_estimada: string;
  resumen_enviado: string;
  seguimiento: string;
}

/**
 * Reenvía la solicitud al buzón del sitio. Devuelve la referencia que el sitio
 * emite; si el sitio no responde, se dice, y se entrega el enlace del
 * formulario para que la solicitud no se pierda en el camino.
 */
export async function registrar(s: SolicitudEntrante): Promise<SolicitudAceptada> {
  const { email, telefono, campos } = validar(s);

  const nota = [
    campos.medidas ? `Medidas: ${campos.medidas}` : null,
    campos.material ? `Material: ${campos.material}` : null,
    campos.aplicacion ? `Aplicación: ${campos.aplicacion}` : null,
    campos.mensaje,
  ]
    .filter(Boolean)
    .join(' · ');

  const carga = {
    email,
    telefono,
    nombre: campos.nombre,
    empresa: campos.empresa ?? '',
    ruc: campos.ruc,
    producto: campos.producto,
    cantidad: campos.cantidad,
    dimensions: campos.medidas,
    material: campos.material,
    industry: campos.sector,
    application: campos.aplicacion,
    deliveryCity: campos.ciudad,
    deliveryCountry: campos.pais,
    fechaNecesaria: campos.fecha,
    mensaje: nota || undefined,
    language: campos.idioma,
    path: '/cotizacion',
    origen: campos.origen,
  };

  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 10000);
  let referencia = '';
  try {
    const r = await fetch(`${SITIO}/api/lead`, {
      method: 'POST',
      signal: control.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(carga),
    });
    const cuerpo = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok) {
      throw new Error(
        typeof cuerpo.error === 'string' ? cuerpo.error : `el sitio respondió HTTP ${r.status}`,
      );
    }
    referencia = String(cuerpo.id ?? cuerpo.referencia ?? cuerpo.rfqId ?? '');
  } finally {
    clearTimeout(corte);
  }

  return {
    aceptada: true,
    referencia: referencia || 'sin-referencia',
    respuesta_estimada: 'En horario comercial de Lima (GMT-5), lunes a viernes.',
    resumen_enviado: [campos.producto, campos.cantidad, campos.medidas, campos.ciudad]
      .filter(Boolean)
      .join(' · ') || 'solicitud sin especificación: se responderá preguntando lo que falta',
    seguimiento: enlaceCotizacion({
      producto: campos.producto,
      nota: nota || undefined,
      origen: campos.origen ?? 'api',
    }),
  };
}

/** Los cinco datos sin los cuales una cotización industrial no se puede emitir. */
export const DATOS_QUE_EVITAN_REPREGUNTAR = [
  'producto — o la familia, si aún no está decidido',
  'medidas o especificación — gramaje, espesor, diámetro, capacidad',
  'cantidad — unidades, metros o rollos, y si es recurrente',
  'ciudad o puerto de entrega — y el país, si sale del Perú',
  'fecha en que se necesita en destino',
];
