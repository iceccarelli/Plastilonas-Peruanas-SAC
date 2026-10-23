import { z } from 'zod';

/** Esquema del lead. Compartido por el handler y las pruebas. */
export const LeadSchema = z.object({
  nombre: z.string().trim().min(1).max(120).optional(),
  contact: z.string().trim().min(1).max(120).optional(),
  empresa: z.string().trim().max(160).optional().default(''),
  email: z.string().trim().email().max(180),
  telefono: z.string().trim().min(6).max(40),
  whatsapp: z.string().trim().max(40).optional(),
  producto: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(80).optional(),
  application: z.string().trim().max(240).optional(),
  cantidad: z.string().trim().max(80).optional(),
  dimensions: z.string().trim().max(120).optional(),
  material: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  deliveryCountry: z.string().trim().max(80).optional(),
  deliveryCity: z.string().trim().max(80).optional(),
  fechaNecesaria: z.string().trim().max(40).optional(),
  mensaje: z.string().trim().max(4000).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
  /** RUC ya normalizado (el formulario lo valida con módulo 11). */
  ruc: z.string().trim().regex(/^\d{11}$/).optional(),
  // ── Atribución: campos ocultos del formulario ────────────────────────────
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  path: z.string().trim().max(400).optional(),
  slug: z.string().trim().max(120).optional(),
  /** Superficie de origen: 'chat', 'configurador', 'calculadora'. */
  origen: z.string().trim().max(40).optional(),
  /** Referencias de adjuntos (ruta en Storage o nombre del archivo). */
  archivos: z.array(z.string().trim().max(300)).max(5).optional(),
  /** Clave generada por el navegador por envío: reintentos no duplican. */
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9_-]{16,64}$/).optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
