'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/products';
import { toast } from 'sonner';
import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  empresa: z.string().min(2, 'Ingrese el nombre de su empresa'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  telefono: z.string().min(9, 'Ingrese un número de teléfono válido').regex(/^[0-9+\s()-]+$/, 'Formato de teléfono inválido'),
  producto: z.string().optional(),
  cantidad: z.string().optional(),
  fechaNecesaria: z.string().optional(),
  mensaje: z.string().min(15, 'Por favor describa su requerimiento con más detalle (mínimo 15 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

interface CotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProduct?: string;
}

export default function CotizacionModal({ open, onOpenChange, preselectedProduct }: CotizacionModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: preselectedProduct || '',
    },
  });

  React.useEffect(() => {
    if (preselectedProduct) {
      setValue('producto', preselectedProduct);
    }
  }, [preselectedProduct, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Envío real: abrimos WhatsApp con la solicitud estructurada, lista para
    // enviar al equipo comercial. Sin backend intermedio que pueda fallar.
    const message = buildQuoteMessage({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: [data.mensaje, data.fechaNecesaria ? `Fecha requerida: ${data.fechaNecesaria}` : '']
        .filter(Boolean)
        .join(' — '),
    });

    saveQuoteLocally({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: data.mensaje,
    });

    openWhatsApp(message);

    setIsSubmitting(false);
    setIsSuccess(true);

    toast.success('Su solicitud está lista en WhatsApp', {
      description: 'Pulse enviar en la ventana de WhatsApp para que nuestro equipo comercial la reciba de inmediato.',
      duration: 7000,
    });

    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      reset();
    }, 2200);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="bg-white w-full max-w-[620px] max-h-[calc(100dvh-2rem)] rounded-3xl shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540]">Solicitar Cotización</h2>
                <p className="text-sm text-gray-500 mt-0.5">Atención directa por WhatsApp en horario comercial</p>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-[#059669]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#0A2540] mb-3">¡Gracias por confiar en nosotros!</h3>
                <p className="text-gray-600 max-w-sm mx-auto">Su solicitud quedó lista en WhatsApp: pulse enviar en esa ventana y un especialista de Plastilonas Peruanas le responderá.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                    <input 
                      {...register('nombre')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Juan Pérez García" 
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1.5">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa / Razón Social *</label>
                    <input 
                      {...register('empresa')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Minera XYZ S.A.C." 
                    />
                    {errors.empresa && <p className="text-red-500 text-xs mt-1.5">{errors.empresa.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input 
                      {...register('email')} 
                      type="email" 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="ventas@suempresa.com" 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono / WhatsApp *</label>
                    <input 
                      {...register('telefono')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="+51 998 117 065" 
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1.5">{errors.telefono.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Producto de interés</label>
                    <select 
                      {...register('producto')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669] bg-white"
                    >
                      <option value="">Seleccione un producto (opcional)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad aproximada</label>
                    <input 
                      {...register('cantidad')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Ej: 50 unidades / 2000 m²" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha requerida (aprox.)</label>
                  <input 
                    {...register('fechaNecesaria')} 
                    type="date" 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Describa su proyecto o requerimiento *</label>
                  <textarea 
                    {...register('mensaje')} 
                    rows={4} 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-y min-h-[110px] focus:border-[#059669]" 
                    placeholder="Necesito 80 big bags de 1 tonelada para transporte de concentrado de cobre. Requiero tratamiento antiestático y entrega en mina en Arequipa para el 15 de agosto..."
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1.5">{errors.mensaje.message}</p>}
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-400 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985]"
                  >
                    {isSubmitting ? (
                      <>Enviando solicitud...</>
                    ) : (
                      <>Enviar Solicitud de Cotización <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-center t-micro text-gray-400 pt-1">
                  Sus datos se envían directamente a nuestro equipo comercial por WhatsApp. No los compartimos con terceros.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
