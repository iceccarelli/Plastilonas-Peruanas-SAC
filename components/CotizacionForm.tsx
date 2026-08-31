'use client';

/**
 * FORMULARIO DE COTIZACIÓN — página completa (el modal queda como opción).
 *
 * Decisiones que este componente encarna:
 *  · CIUDAD DE ENTREGA es obligatoria: sin ella no hay flete ni plazo, y era
 *    el dato que el equipo comercial pedía en la primera respuesta el 100% de
 *    las veces. Pedirlo aquí ahorra esa ida y vuelta (el SLA de ≤2 horas
 *    hábiles depende de que el RFQ llegue completo).
 *  · El placeholder del teléfono NO es el número de la empresa: medio mundo
 *    lo copiaba tal cual y el comercial terminaba llamándose a sí mismo.
 *  · BORRADOR en localStorage: un RFQ industrial se interrumpe (buscar una
 *    medida, pedir un dato a planta). Volver y encontrar el formulario vacío
 *    es perder el lead. Se restaura al volver y se limpia al enviar.
 *  · Adjuntos (plano, croquis, foto): validados en el navegador
 *    (PDF/JPG/PNG/DWG/DXF, ≤20 MB, hasta 5). Si Supabase Storage está
 *    configurado se suben directo desde el navegador (sin pasar por el límite
 *    de la función serverless); si no, viajan como lista de nombres en el
 *    lead y el archivo se pide por correo. Ver docs/HUMAN-GATES.md.
 *  · UTM + ruta + slug viajan ocultos: el comercial sabe QUÉ página produjo
 *    el lead sin preguntárselo al visitante.
 *  · NO IMPORTA `lib/products`: el catálogo son 92 KB de fuente —descripciones,
 *    especificaciones, galerías— y este es un componente de cliente, así que
 *    importarlo entero enviaba TODO ese JSON al navegador para llenar un
 *    <select> que solo necesita slug y nombre. La página (servidor) pasa la
 *    lista mínima por props.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { buildQuoteMessage, openWhatsApp, saveQuoteLocally, whatsappUrl } from '@/lib/whatsapp';
import { trackQuoteRequest, trackQuoteStarted } from '@/lib/analytics';
import { postLead } from '@/lib/lead';
import { errorRuc, normalizarRuc } from '@/lib/ruc';
import { supabaseBrowser } from '@/lib/supabase';

const EXTENSIONES = ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'dxf'];
const MAX_ARCHIVOS = 5;
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const BORRADOR_KEY = 'pp_rfq_borrador';

/** Copia del SLA — verbatim, no editar sin decisión comercial. */
export const SLA_COTIZACION =
  'Respondemos en horario comercial en ≤2 horas hábiles con ficha técnica o con las preguntas que falten.';

/** Su equivalente en inglés. Dice lo MISMO: mismo plazo, misma condición. */
export const SLA_QUOTE_EN =
  'We reply within business hours in ≤2 working hours with a technical datasheet, or with the questions still missing.';

export type Idioma = 'es' | 'en';

/**
 * CADENAS DEL FORMULARIO, EN DOS IDIOMAS.
 *
 * Viven en ESTE archivo a propósito, no en un lib de traducciones. Dos
 * motivos, y el segundo importa más:
 *
 *  1. Son las cadenas de un solo componente; sacarlas obligaría a saltar
 *     entre dos archivos para leer un formulario.
 *  2. Varias pruebas afirman la copia en español LITERALMENTE —el SLA, el
 *     placeholder del teléfono que no puede ser el de la empresa, los
 *     formatos de adjunto—. Manteniéndolas aquí, esas pruebas siguen
 *     protegiendo el camino en español, que es el que produce el negocio.
 *
 * El español es byte a byte el que ya estaba: esta traducción no toca una
 * sola coma del formulario que ya funciona.
 */
const T = {
  es: {
    nombre: 'Nombre y apellido *', nombrePh: 'Juan Pérez García',
    empresa: 'Empresa *', empresaPh: 'Minera XYZ S.A.C.',
    ruc: 'RUC (opcional)', rucPh: '20123456789',
    email: 'Correo *', emailPh: 'compras@suempresa.com',
    telefono: 'Teléfono *', telefonoPh: '+51 9XX XXX XXX',
    producto: 'Producto', productoOpc: '(opcional)', productoPh: 'Seleccione un producto…',
    cantidad: 'Medidas / cantidad', cantidadPh: 'Ej: 2 500 m² · 40 mangas Ø600 · 12 toldos',
    ciudad: 'Ciudad de entrega *', ciudadPh: 'Arequipa',
    fecha: 'Fecha en que lo necesita',
    mensaje: 'Descripción del requerimiento *',
    mensajePh: 'Ej: Necesitamos 40 big bags de 1 tonelada con faldón y descarga, para concentrado. Entrega en Arequipa la primera semana del mes.',
    adjuntos: 'Planos o fotos (opcional)',
    adjuntosNota: `PDF, JPG, PNG, DWG o DXF · hasta ${MAX_ARCHIVOS} archivos · máx. 20 MB c/u`,
    quitar: (n: string) => `Quitar ${n}`,
    enviar: 'Enviar solicitud de cotización', enviando: 'Preparando su solicitud…',
    sla: SLA_COTIZACION,
    nota: 'Su solicitud se abre en WhatsApp lista para enviar y llega también a nuestro registro comercial. Sin listas de precios en líneas a medida: cada RFQ se responde con especificación.',
    okTitulo: 'Solicitud registrada',
    okCodigo: 'Código de su solicitud:',
    okAbrio: 'Se abrió WhatsApp con su solicitud estructurada: pulse enviar ahí y quedará en manos del equipo comercial.',
    okBloqueado: 'Su navegador bloqueó la ventana de WhatsApp, pero la solicitud ya entró en nuestro registro comercial.',
    okEnlace: 'Abrir WhatsApp con mi solicitud',
    errMax: `Máximo ${MAX_ARCHIVOS} archivos.`,
    errTipo: (n: string) => `Formato no admitido: ${n}. Use PDF, JPG, PNG, DWG o DXF.`,
    errPeso: (n: string) => `${n} supera los 20 MB.`,
    toastOk: 'Su solicitud está lista en WhatsApp',
    toastOkDesc: 'Pulse enviar en la ventana de WhatsApp para que nuestro equipo comercial la reciba de inmediato.',
    toastBloq: 'Su solicitud quedó registrada',
    toastBloqDesc: 'El navegador bloqueó la ventana de WhatsApp. Su solicitud ya entró en nuestro registro; abajo tiene el enlace para enviarla también por WhatsApp.',
  },
  en: {
    nombre: 'Full name *', nombrePh: 'Jane Doe',
    empresa: 'Company *', empresaPh: 'Acme Mining Ltd.',
    ruc: 'Tax ID (optional)', rucPh: '20123456789',
    email: 'Email *', emailPh: 'procurement@yourcompany.com',
    telefono: 'Phone *', telefonoPh: '+1 555 000 0000',
    producto: 'Product', productoOpc: '(optional)', productoPh: 'Select a product…',
    cantidad: 'Dimensions / quantity', cantidadPh: 'e.g. 2,500 m² · 40 ducts Ø600 · 12 tarpaulins',
    ciudad: 'Delivery city or port *', ciudadPh: 'Callao · Valparaíso · Houston',
    fecha: 'Date you need it',
    mensaje: 'Describe your requirement *',
    mensajePh: 'e.g. We need 40 one-tonne big bags with skirt and discharge spout, for concentrate. Delivery FOB Callao in the first week of the month.',
    adjuntos: 'Drawings or photos (optional)',
    adjuntosNota: `PDF, JPG, PNG, DWG or DXF · up to ${MAX_ARCHIVOS} files · max. 20 MB each`,
    quitar: (n: string) => `Remove ${n}`,
    enviar: 'Send request for quotation', enviando: 'Preparing your request…',
    sla: SLA_QUOTE_EN,
    nota: 'Your request opens in WhatsApp ready to send and also reaches our commercial record. No price lists on made-to-measure lines: every RFQ is answered with a specification.',
    okTitulo: 'Request registered',
    okCodigo: 'Your request reference:',
    okAbrio: 'WhatsApp opened with your structured request: press send there and it reaches the sales team.',
    okBloqueado: 'Your browser blocked the WhatsApp window, but the request already reached our commercial record.',
    okEnlace: 'Open WhatsApp with my request',
    errMax: `Maximum ${MAX_ARCHIVOS} files.`,
    errTipo: (n: string) => `Unsupported format: ${n}. Use PDF, JPG, PNG, DWG or DXF.`,
    errPeso: (n: string) => `${n} exceeds 20 MB.`,
    toastOk: 'Your request is ready in WhatsApp',
    toastOkDesc: 'Press send in the WhatsApp window so our sales team receives it right away.',
    toastBloq: 'Your request was registered',
    toastBloqDesc: 'The browser blocked the WhatsApp window. Your request already reached our record; the link below sends it via WhatsApp too.',
  },
} as const;

function esquema(productoObligatorio: boolean) {
  return z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    empresa: z.string().min(2, 'Ingrese el nombre de su empresa'),
    ruc: z
      .string()
      .optional()
      .superRefine((v, ctx) => {
        const msg = errorRuc(v ?? '');
        if (msg) ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
      }),
    email: z.string().email('Ingrese un correo electrónico válido'),
    telefono: z
      .string()
      .min(9, 'Ingrese un número de teléfono válido')
      .regex(/^[0-9+\s()-]+$/, 'Formato de teléfono inválido'),
    producto: productoObligatorio
      ? z.string().min(1, 'Indique el producto que quiere cotizar')
      : z.string().optional(),
    cantidad: z.string().optional(),
    ciudadEntrega: z.string().min(2, 'Indique la ciudad de entrega'),
    fechaNecesaria: z.string().optional(),
    mensaje: z
      .string()
      .min(15, 'Describa su requerimiento con más detalle (mínimo 15 caracteres)'),
  });
}

type FormData = z.infer<ReturnType<typeof esquema>>;

/** Lo mínimo que el <select> necesita: nada de especificaciones ni galerías. */
export interface OpcionProducto {
  slug: string;
  name: string;
}

interface Props {
  /** Catálogo reducido, resuelto en el servidor. */
  opciones: OpcionProducto[];
  /** Idioma de la interfaz. 'es' por defecto: el camino que produce el negocio. */
  idioma?: Idioma;
  /** Nombre de producto preseleccionado (de ?producto= o comparativa). */
  preselectedProduct?: string;
  /** Slug del producto de origen, si el enlace lo trajo. */
  slugOrigen?: string;
  /** Texto inicial del mensaje (p. ej. comparativa). */
  preselectedMessage?: string;
}

function leerUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = q.get(k);
    if (v) out[k] = v;
  }
  return out;
}

export default function CotizacionForm({ opciones, idioma = 'es', preselectedProduct, slugOrigen, preselectedMessage }: Props) {
  const t = T[idioma];
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [archivos, setArchivos] = React.useState<File[]>([]);
  const [errorArchivos, setErrorArchivos] = React.useState<string | null>(null);
  /** Acuse de recibo: código RFQ, si la ventana de WhatsApp abrió, y el enlace. */
  const [acuse, setAcuse] = React.useState<{ rfqId?: string; abrio: boolean; href: string } | null>(null);
  const productoObligatorio = Boolean(preselectedProduct);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(esquema(productoObligatorio)),
    defaultValues: {
      producto: preselectedProduct || '',
      mensaje: preselectedMessage || '',
    },
  });

  // ── Borrador: restaurar al montar, guardar al escribir ──────────────────
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BORRADOR_KEY);
      if (raw) {
        const borrador = JSON.parse(raw) as Partial<FormData>;
        (Object.keys(borrador) as (keyof FormData)[]).forEach((k) => {
          const v = borrador[k];
          // Lo que trae la URL manda sobre el borrador.
          if (v && !(k === 'producto' && preselectedProduct) && !(k === 'mensaje' && preselectedMessage)) {
            setValue(k, v);
          }
        });
      }
    } catch {
      /* sin localStorage no hay borrador; el formulario funciona igual */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const sub = watch((valores) => {
      try {
        window.localStorage.setItem(BORRADOR_KEY, JSON.stringify(valores));
      } catch {
        /* best-effort */
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    if (preselectedProduct) setValue('producto', preselectedProduct);
  }, [preselectedProduct, setValue]);
  React.useEffect(() => {
    if (preselectedMessage) setValue('mensaje', preselectedMessage);
  }, [preselectedMessage, setValue]);
  React.useEffect(() => {
    trackQuoteStarted('pagina', preselectedProduct, slugOrigen);
  }, [preselectedProduct, slugOrigen]);

  // ── Adjuntos ─────────────────────────────────────────────────────────────
  const onArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevos = Array.from(e.target.files ?? []);
    setErrorArchivos(null);
    const todos = [...archivos, ...nuevos];
    if (todos.length > MAX_ARCHIVOS) {
      setErrorArchivos(t.errMax);
      return;
    }
    for (const f of nuevos) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!EXTENSIONES.includes(ext)) {
        setErrorArchivos(t.errTipo(f.name));
        return;
      }
      if (f.size > MAX_BYTES) {
        setErrorArchivos(t.errPeso(f.name));
        return;
      }
    }
    setArchivos(todos);
    e.target.value = '';
  };

  /**
   * Sube los adjuntos directo del navegador a Supabase Storage (bucket
   * `rfq-adjuntos`) si está configurado. Devuelve la lista de referencias
   * (ruta subida o solo el nombre si no hay almacenamiento).
   * TODO(HUMAN): crear el bucket `rfq-adjuntos` (privado, escritura anónima
   * vía política RLS de INSERT) en Supabase — ver docs/HUMAN-GATES.md.
   */
  async function subirArchivos(rfqRef: string): Promise<string[]> {
    if (archivos.length === 0) return [];
    const sb = supabaseBrowser();
    if (!sb) return archivos.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB — adjuntar por correo)`);
    const refs: string[] = [];
    for (const f of archivos) {
      const ruta = `${rfqRef}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, '_')}`;
      const { error } = await sb.storage.from('rfq-adjuntos').upload(ruta, f);
      refs.push(error ? `${f.name} (no se pudo subir — adjuntar por correo)` : ruta);
    }
    return refs;
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const ruc = normalizarRuc(data.ruc ?? '') || undefined;
    const rfqRef = `web-${Date.now().toString(36)}`;

    let refsArchivos: string[] = [];
    try {
      refsArchivos = await subirArchivos(rfqRef);
    } catch {
      refsArchivos = archivos.map((f) => f.name);
    }

    const detalle = [
      data.mensaje,
      `Ciudad de entrega: ${data.ciudadEntrega}`,
      data.fechaNecesaria ? `Fecha requerida: ${data.fechaNecesaria}` : '',
      archivos.length ? `Adjuntos: ${archivos.map((f) => f.name).join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' — ');

    const message = buildQuoteMessage({
      nombre: data.nombre,
      empresa: data.empresa,
      ruc,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: detalle,
    });

    saveQuoteLocally({
      nombre: data.nombre,
      empresa: data.empresa,
      ruc,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: detalle,
    });

    const resultado = await postLead({
      nombre: data.nombre,
      empresa: data.empresa,
      ruc,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      fechaNecesaria: data.fechaNecesaria,
      deliveryCity: data.ciudadEntrega,
      mensaje: data.mensaje,
      ...leerUtm(),
      path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined,
      slug: slugOrigen,
      archivos: refsArchivos,
      language: idioma,
    });

    const abrio = openWhatsApp(message);
    trackQuoteRequest(data.producto, slugOrigen);
    setAcuse({ rfqId: resultado.rfqId, abrio, href: whatsappUrl(message) });

    try {
      window.localStorage.removeItem(BORRADOR_KEY);
    } catch {
      /* best-effort */
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success(abrio ? t.toastOk : t.toastBloq, {
      description: abrio ? t.toastOkDesc : t.toastBloqDesc,
      duration: 9000,
    });
  };

  const campo =
    'w-full rounded-2xl border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[#059669] transition-colors';
  const etiqueta = 'block text-sm font-medium text-[#0A2540] dark:text-[var(--text)] mb-1.5';
  const error = 'mt-1 text-xs text-red-600';

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-10 w-10 text-[#059669]" />
        <div className="text-xl font-semibold text-[#0A2540]">{t.okTitulo}</div>

        {/* ACUSE DE RECIBO. El código RFQ lo emite /api/lead y hasta ahora se
            descartaba en el cliente: el comprador se iba sin nada que citar si
            quería preguntar por su solicitud. */}
        {acuse?.rfqId && (
          <p className="mt-3 font-mono text-sm text-[#0A2540]">
            {t.okCodigo} <strong>{acuse.rfqId}</strong>
          </p>
        )}

        <p className="mx-auto mt-3 max-w-md text-sm text-gray-600">
          {acuse?.abrio ? t.okAbrio : t.okBloqueado}{' '}
          {t.sla}
        </p>

        {/* Salida manual: un window.open bloqueado dejaba al comprador mirando
            un mensaje que hablaba de una ventana que nunca se abrió. */}
        {acuse && !acuse.abrio && (
          <a
            href={acuse.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            {t.okEnlace}
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rfq-nombre" className={etiqueta}>{t.nombre}</label>
          <input id="rfq-nombre" {...register('nombre')} placeholder={t.nombrePh} className={campo} autoComplete="name" />
          {errors.nombre && <p className={error}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-empresa" className={etiqueta}>{t.empresa}</label>
          <input id="rfq-empresa" {...register('empresa')} placeholder={t.empresaPh} className={campo} autoComplete="organization" />
          {errors.empresa && <p className={error}>{errors.empresa.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-ruc" className={etiqueta}>{t.ruc}</label>
          <input id="rfq-ruc" {...register('ruc')} placeholder={t.rucPh} inputMode="numeric" className={campo} />
          {errors.ruc && <p className={error}>{errors.ruc.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-email" className={etiqueta}>{t.email}</label>
          <input id="rfq-email" type="email" {...register('email')} placeholder={t.emailPh} className={campo} autoComplete="email" />
          {errors.email && <p className={error}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-telefono" className={etiqueta}>{t.telefono}</label>
          {/* Placeholder genérico a propósito: NUNCA el número de la empresa. */}
          <input id="rfq-telefono" type="tel" {...register('telefono')} placeholder={t.telefonoPh} className={campo} autoComplete="tel" />
          {errors.telefono && <p className={error}>{errors.telefono.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-producto" className={etiqueta}>
            {t.producto} {productoObligatorio ? '*' : t.productoOpc}
          </label>
          <select id="rfq-producto" {...register('producto')} className={campo}>
            <option value="">{t.productoPh}</option>
            {opciones.map((p) => (
              <option key={p.slug} value={p.name}>{p.name}</option>
            ))}
          </select>
          {errors.producto && <p className={error}>{errors.producto.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-cantidad" className={etiqueta}>{t.cantidad}</label>
          <input id="rfq-cantidad" {...register('cantidad')} placeholder={t.cantidadPh} className={campo} />
        </div>
        <div>
          <label htmlFor="rfq-ciudad" className={etiqueta}>{t.ciudad}</label>
          <input id="rfq-ciudad" {...register('ciudadEntrega')} placeholder={t.ciudadPh} className={campo} autoComplete="address-level2" />
          {errors.ciudadEntrega && <p className={error}>{errors.ciudadEntrega.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-fecha" className={etiqueta}>{t.fecha}</label>
          {/* type="date": el navegador lo presenta dd/mm/aaaa en es-PE. */}
          <input id="rfq-fecha" type="date" lang="es-PE" {...register('fechaNecesaria')} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="rfq-mensaje" className={etiqueta}>{t.mensaje}</label>
          <textarea
            id="rfq-mensaje"
            rows={4}
            {...register('mensaje')}
            placeholder={t.mensajePh}
            className={campo}
          />
          {errors.mensaje && <p className={error}>{errors.mensaje.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <span className={etiqueta}>{t.adjuntos}</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-[var(--border)] px-4 py-3 text-sm text-gray-600 hover:border-[#059669]">
            <Paperclip className="h-4 w-4" />
            {t.adjuntosNota}
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
              onChange={onArchivos}
              className="sr-only"
            />
          </label>
          {errorArchivos && <p className={error}>{errorArchivos}</p>}
          {archivos.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              {archivos.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                  <span className="truncate">{f.name}</span>
                  <span className="text-gray-400">{Math.round(f.size / 1024)} KB</span>
                  <button
                    type="button"
                    aria-label={t.quitar(f.name)}
                    onClick={() => setArchivos(archivos.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-8 py-4 font-semibold text-white transition-all hover:bg-[#059669] active:scale-[0.985] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? t.enviando : t.enviar}
      </button>

      {/* SLA — verbatim. */}
      <p className="mt-4 text-center text-sm text-gray-600">{t.sla}</p>
      <p className="mt-2 text-center text-xs text-gray-400">{t.nota}</p>
    </form>
  );
}
