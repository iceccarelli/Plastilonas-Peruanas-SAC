import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, serviceSchema, webPageSchema } from '@/lib/schema';

const URL_SERVICIOS = `${SITE.url}/servicios`;

const TITLE = 'Servicios: fabricación e instalación';
const DESCRIPTION =
  'Fabricación a medida, instalación en obra con equipo propio, asesoría técnica y mantenimiento de lonas, geomembranas, estructuras textiles y mangas de ventilación en todo el Perú.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/servicios' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/servicios`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function ServiciosPage() {
  const services = [
    {
      title: "Fabricación a Medida",
      description: "Diseñamos y fabricamos productos textiles industriales exactamente según sus especificaciones técnicas, medidas y requerimientos de resistencia.",
      features: ["Asesoría técnica especializada", "Diseño CAD y prototipos", "Materiales importados con ficha técnica", "Control de calidad en cada lote", "Entrega en todo el Perú"],
      foto: '/images/servicio-fabricacion.jpg',
      alt: 'Corte y confección de textil técnico industrial en planta.',
    },
    {
      title: "Instalación Profesional",
      description: "Contamos con un equipo técnico altamente capacitado para la instalación de carpas, estructuras, geomembranas y sistemas de ventilación en obra.",
      features: ["Instalación profesional", "Supervisión de calidad", "Capacitación al personal del cliente", "Mantenimiento preventivo", "Soporte post-venta"],
      foto: '/images/servicio-instalacion.jpg',
      alt: 'Montaje en obra de una estructura textil por personal propio.',
    },
    {
      title: "Importación Directa",
      description: "Accedemos directamente a proveedores internacionales de materiales técnicos, con precios competitivos y ficha técnica del material en cada cotización.",
      features: ["Materiales de primera línea", "Precios sin intermediarios", "Trazabilidad completa", "Ficha técnica del fabricante", "Stock estratégico"],
      foto: '/images/servicio-importacion.jpg',
      alt: 'Rollos de material técnico importado, almacenados en planta.',
    },
    {
      title: "Soluciones Personalizadas",
      description: "Desde el diagnóstico de su necesidad hasta la entrega final, le acompañamos en todo el proceso de desarrollo de soluciones textiles a medida.",
      features: ["Análisis de requerimientos", "Propuesta técnica y económica", "Seguimiento de proyecto", "Soporte post-venta", "Reposición y mantenimiento"],
      foto: '/images/servicio-asesoria.jpg',
      alt: 'Revisión de especificación técnica sobre plano antes de cotizar.',
    }
  ];

  return (
    <div>
      {/* Esta página no emitía ningún dato estructurado. Un fabricante que
          además instala tiene que declararlo como Service: es la diferencia
          entre aparecer como tienda y aparecer como proveedor de obra. */}
      <JsonLd
        data={[
          webPageSchema({
            url: URL_SERVICIOS,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            breadcrumbId: `${URL_SERVICIOS}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Servicios', url: URL_SERVICIOS },
            ],
            `${URL_SERVICIOS}#breadcrumb`,
          ),
          serviceSchema({
            name: 'Fabricación a medida e instalación de textiles industriales',
            description: DESCRIPTION,
            url: URL_SERVICIOS,
            cityName: SITE.addressLocality,
            regionName: SITE.addressRegion,
            serviceTypes: services.map((s) => s.title),
          }),
          itemListSchema({
            url: URL_SERVICIOS,
            name: 'Servicios',
            items: services.map((s) => ({ name: s.title, url: URL_SERVICIOS })),
          }),
        ]}
      />
      <div className="bg-[#0A2540] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs tracking-[0.15em] text-white/50 mb-2">MÁS ALLÁ DE LA FABRICACIÓN</div>
          <h1 className="t-display font-semibold">Fabricación e instalación, de principio a fin</h1>
          <p className="mt-5 text-xl text-white/80 max-w-lg mx-auto">Fabricamos en planta propia en Chorrillos e instalamos en obra con personal propio. Cuatro servicios, y lo que cubre cada uno.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {services.map((service, index) => (
          <div key={index} className="grid md:grid-cols-12 gap-x-10 items-start">
            <div className="md:col-span-5 mb-8 md:mb-0">
              {/* Cuatro fotografías propias que ya vivían en el repositorio y
                  solo se usaban en la portada. Aquí sustituyen a un emoji de
                  6xl, que es lo que ocupaba este sitio: la página de servicios
                  de un fabricante llegaba al rastreador sin una sola imagen. */}
              <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-100">
                <Image
                  src={service.foto}
                  alt={service.alt}
                  fill
                  sizes="(min-width: 768px) 460px, 100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
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
          <h3 className="t-h2 font-semibold mb-4">¿Tiene un proyecto especial?</h3>
          <p className="text-gray-600 mb-8">Escríbanos con la aplicación, las medidas y la ciudad de entrega. Con eso se puede cotizar; sin eso, no.</p>
          <Link href="/cotizacion" className="btn btn-lg btn-primary hover:bg-[#047857]">Iniciar mi proyecto <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}
