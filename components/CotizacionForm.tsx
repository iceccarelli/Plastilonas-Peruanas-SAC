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
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle, Paperclip, X } from 'lucide-react';
import { products } from '@/lib/products';
import { toast } from 'sonner';
import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';
import { trackQuoteRequest, trackQuoteStarted } from '@/lib/analytics';
import { postLead } from '@/lib/lead';
import { errorRuc, normalizarRuc } from '@/lib/ruc';
import { supabaseBrowser } from '@/lib/supabase';

/** Copia del SLA — verbatim, no editar sin decisión comercial. */
export const SLA_COTIZACION =
  'Respondemos en horario comercial en ≤2 horas hábiles con ficha técnica o con las preguntas que falten.';

const EXTENSIONES = ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'dxf'];
const MAX_ARCHIVOS = 5;
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const BORRADOR_KEY = 'pp_rfq_borrador';

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

interface Props {
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

export default function CotizacionForm({ preselectedProduct, slugOrigen, preselectedMessage }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [archivos, setArchivos] = React.useState<File[]>([]);
  const [errorArchivos, setErrorArchivos] = React.useState<string | null>(null);
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
      setErrorArchivos(`Máximo ${MAX_ARCHIVOS} archivos.`);
      return;
    }
    for (const f of nuevos) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!EXTENSIONES.includes(ext)) {
        setErrorArchivos(`Formato no admitido: ${f.name}. Use PDF, JPG, PNG, DWG o DXF.`);
        return;
      }
      if (f.size > MAX_BYTES) {
        setErrorArchivos(`${f.name} supera los 20 MB.`);
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

    await postLead({
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
    });

    openWhatsApp(message);
    trackQuoteRequest(data.producto, slugOrigen);

    try {
      window.localStorage.removeItem(BORRADOR_KEY);
    } catch {
      /* best-effort */
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success('Su solicitud está lista en WhatsApp', {
      description:
        'Pulse enviar en la ventana de WhatsApp para que nuestro equipo comercial la reciba de inmediato.',
      duration: 7000,
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
        <div className="text-xl font-semibold text-[#0A2540]">Solicitud lista</div>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Se abrió WhatsApp con su solicitud estructurada: pulse enviar ahí y quedará en manos del
          equipo comercial. {SLA_COTIZACION}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rfq-nombre" className={etiqueta}>Nombre y apellido *</label>
          <input id="rfq-nombre" {...register('nombre')} placeholder="Juan Pérez García" className={campo} autoComplete="name" />
          {errors.nombre && <p className={error}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-empresa" className={etiqueta}>Empresa *</label>
          <input id="rfq-empresa" {...register('empresa')} placeholder="Minera XYZ S.A.C." className={campo} autoComplete="organization" />
          {errors.empresa && <p className={error}>{errors.empresa.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-ruc" className={etiqueta}>RUC (opcional)</label>
          <input id="rfq-ruc" {...register('ruc')} placeholder="20123456789" inputMode="numeric" className={campo} />
          {errors.ruc && <p className={error}>{errors.ruc.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-email" className={etiqueta}>Correo *</label>
          <input id="rfq-email" type="email" {...register('email')} placeholder="compras@suempresa.com" className={campo} autoComplete="email" />
          {errors.email && <p className={error}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-telefono" className={etiqueta}>Teléfono *</label>
          {/* Placeholder genérico a propósito: NUNCA el número de la empresa. */}
          <input id="rfq-telefono" type="tel" {...register('telefono')} placeholder="+51 9XX XXX XXX" className={campo} autoComplete="tel" />
          {errors.telefono && <p className={error}>{errors.telefono.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-producto" className={etiqueta}>
            Producto {productoObligatorio ? '*' : '(opcional)'}
          </label>
          <select id="rfq-producto" {...register('producto')} className={campo}>
            <option value="">Seleccione un producto…</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>{p.name}</option>
            ))}
          </select>
          {errors.producto && <p className={error}>{errors.producto.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-cantidad" className={etiqueta}>Medidas / cantidad</label>
          <input id="rfq-cantidad" {...register('cantidad')} placeholder="Ej: 2 500 m² · 40 mangas Ø600 · 12 toldos" className={campo} />
        </div>
        <div>
          <label htmlFor="rfq-ciudad" className={etiqueta}>Ciudad de entrega *</label>
          <input id="rfq-ciudad" {...register('ciudadEntrega')} placeholder="Arequipa" className={campo} autoComplete="address-level2" />
          {errors.ciudadEntrega && <p className={error}>{errors.ciudadEntrega.message}</p>}
        </div>
        <div>
          <label htmlFor="rfq-fecha" className={etiqueta}>Fecha en que lo necesita</label>
          {/* type="date": el navegador lo presenta dd/mm/aaaa en es-PE. */}
          <input id="rfq-fecha" type="date" lang="es-PE" {...register('fechaNecesaria')} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="rfq-mensaje" className={etiqueta}>Descripción del requerimiento *</label>
          <textarea
            id="rfq-mensaje"
            rows={4}
            {...register('mensaje')}
            placeholder="Ej: Necesitamos 40 big bags de 1 tonelada con faldón y descarga, para concentrado. Entrega en Arequipa la primera semana del mes."
            className={campo}
          />
          {errors.mensaje && <p className={error}>{errors.mensaje.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <span className={etiqueta}>Planos o fotos (opcional)</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-[var(--border)] px-4 py-3 text-sm text-gray-600 hover:border-[#059669]">
            <Paperclip className="h-4 w-4" />
            PDF, JPG, PNG, DWG o DXF · hasta {MAX_ARCHIVOS} archivos · máx. 20 MB c/u
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
                    aria-label={`Quitar ${f.name}`}
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
        {isSubmitting ? 'Preparando su solicitud…' : 'Enviar solicitud de cotización'}
      </button>

      {/* SLA — verbatim. */}
      <p className="mt-4 text-center text-sm text-gray-600">{SLA_COTIZACION}</p>
      <p className="mt-2 text-center text-xs text-gray-400">
        Su solicitud se abre en WhatsApp lista para enviar y llega también a nuestro registro
        comercial. Sin listas de precios en líneas a medida: cada RFQ se responde con especificación.
      </p>
    </form>
  );
}
