import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function ServiciosPage() {
  const services = [
    {
      title: "Fabricación a Medida",
      description: "Diseñamos y fabricamos productos textiles industriales exactamente según sus especificaciones técnicas, medidas y requerimientos de resistencia.",
      features: ["Asesoría técnica especializada", "Diseño CAD y prototipos", "Materiales premium importados", "Control de calidad riguroso", "Entrega en todo el Perú"],
      icon: "🛠️"
    },
    {
      title: "Instalación Profesional",
      description: "Contamos con un equipo técnico altamente capacitado para la instalación de carpas, estructuras, geomembranas y sistemas de ventilación en obra.",
      features: ["Instalación certificada", "Supervisión de calidad", "Capacitación al personal del cliente", "Mantenimiento preventivo", "Garantía de servicio"],
      icon: "🔧"
    },
    {
      title: "Importación Directa",
      description: "Accedemos directamente a los mejores proveedores internacionales de materiales técnicos, garantizando precios competitivos y calidad certificada.",
      features: ["Materiales de primera línea", "Precios sin intermediarios", "Trazabilidad completa", "Certificaciones internacionales", "Stock estratégico"],
      icon: "🌍"
    },
    {
      title: "Soluciones Personalizadas",
      description: "Desde el diagnóstico de su necesidad hasta la entrega final, le acompañamos en todo el proceso de desarrollo de soluciones textiles a medida.",
      features: ["Análisis de requerimientos", "Propuesta técnica y económica", "Seguimiento de proyecto", "Soporte post-venta", "Reposición y mantenimiento"],
      icon: "📋"
    }
  ];

  return (
    <div>
      <div className="bg-[#0A2540] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs tracking-[3px] text-white/50 mb-2">MÁS ALLÁ DE LA FABRICACIÓN</div>
          <h1 className="text-6xl tracking-tighter font-semibold">Servicios integrales de nivel premium</h1>
          <p className="mt-5 text-xl text-white/80 max-w-lg mx-auto">Acompañamos su proyecto desde la idea hasta la entrega final con estándares de clase mundial.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {services.map((service, index) => (
          <div key={index} className="grid md:grid-cols-12 gap-x-10 items-start">
            <div className="md:col-span-5 mb-8 md:mb-0">
              <div className="text-6xl mb-6 opacity-90">{service.icon}</div>
              <h2 className="text-4xl tracking-tighter font-semibold text-[#0A2540] leading-none">{service.title}</h2>
            </div>
            <div className="md:col-span-7">
              <p className="text-xl text-gray-600 leading-snug mb-8">{service.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-gray-700">
                    <Check className="w-4 h-4 text-[#059669] mt-1 flex-shrink-0" /> {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-3xl tracking-tight font-semibold mb-4">¿Tiene un proyecto especial?</h3>
          <p className="text-gray-600 mb-8">Nuestro equipo de ingeniería está listo para desarrollar la solución perfecta para su operación.</p>
          <Link href="/cotizacion" className="inline-flex items-center gap-3 bg-[#0A2540] text-white px-10 py-4 rounded-2xl font-semibold hover:bg-[#059669] transition-all">Iniciar mi proyecto <ArrowRight /></Link>
        </div>
      </div>
    </div>
  );
}
