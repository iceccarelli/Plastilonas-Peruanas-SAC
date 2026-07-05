'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const contactSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  telefono: z.string().min(9),
  asunto: z.string().min(5),
  mensaje: z.string().min(20),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    await new Promise(r => setTimeout(r, 1200));
    console.log('Contacto:', data);
    toast.success('Mensaje enviado correctamente', { description: 'Nos pondremos en contacto con usted a la brevedad.' });
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="max-w-2xl mb-12">
        <h1 className="text-6xl tracking-tighter font-semibold text-[#0A2540]">Hablemos de su proyecto</h1>
        <p className="mt-4 text-xl text-gray-600">Estamos listos para ayudarle. Complete el formulario o contáctenos directamente por los canales preferidos.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-x-16 gap-y-14">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <input {...register('nombre')} placeholder="Nombre completo" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <input {...register('email')} type="email" placeholder="Correo electrónico" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <input {...register('telefono')} placeholder="Teléfono / WhatsApp" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>}
              </div>
              <div>
                <input {...register('asunto')} placeholder="Asunto de su consulta" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.asunto && <p className="text-xs text-red-500 mt-1">{errors.asunto.message}</p>}
              </div>
            </div>

            <div>
              <textarea {...register('mensaje')} rows={6} placeholder="Cuéntenos sobre su proyecto o consulta..." className="form-input w-full px-5 py-4 border border-gray-200 rounded-3xl resize-y" />
              {errors.mensaje && <p className="text-xs text-red-500 mt-1">{errors.mensaje.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-400 transition-all text-white px-14 py-4 rounded-2xl font-semibold text-sm active:scale-[0.985]">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-8 text-sm">
          <div>
            <div className="font-semibold tracking-tight text-lg mb-4 text-[#0A2540]">Información de contacto</div>
            
            <div className="space-y-5">
              <a href="tel:+51998117065" className="flex gap-4 group">
                <Phone className="mt-0.5 text-[#059669]" /> 
                <div>
                  <div className="font-medium">+51 998 117 065</div>
                  <div className="text-xs text-gray-500">Central telefónica</div>
                </div>
              </a>
              <a href="https://wa.me/51946085270" target="_blank" className="flex gap-4 group">
                <Phone className="mt-0.5 text-[#25D366]" /> 
                <div>
                  <div className="font-medium text-[#25D366]">+51 946 085 270 (WhatsApp)</div>
                  <div className="text-xs text-gray-500">Atención inmediata 24/7</div>
                </div>
              </a>
              <a href="mailto:ventas@plastilonas.com" className="flex gap-4 group">
                <Mail className="mt-0.5 text-[#059669]" /> 
                <div>ventas@plastilonas.com</div>
              </a>
            </div>
          </div>

          <div>
            <div className="font-semibold tracking-tight text-lg mb-4 text-[#0A2540]">Ubicación</div>
            <div className="flex gap-4">
              <MapPin className="mt-0.5 text-[#059669] flex-shrink-0" />
              <div className="text-gray-600 leading-snug">
                Calle Alameda del Remero Mz - V, Lt - 2<br />
                Urb. Los Huertos de Villa, Chorrillos<br />
                Lima, Perú
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-4 text-xs text-gray-500">
              <Clock className="mt-0.5" /> 
              <div>Horario de atención: Lunes a Viernes 8:00 am - 6:00 pm<br />Sábados 8:00 am - 1:00 pm</div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/cotizacion" className="block text-center bg-[#059669] hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-semibold text-sm">Ir al formulario de cotización →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
