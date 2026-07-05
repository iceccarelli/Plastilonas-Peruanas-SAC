import Link from 'next/link';
import { ArrowRight, Award, Users, Clock, Shield, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import CotizacionModal from '@/components/CotizacionModal';

export default function Home() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const stats = [
    { number: '15+', label: 'Años de experiencia' },
    { number: '6', label: 'Sectores atendidos' },
    { number: '100%', label: 'Fabricación a medida' },
    { number: 'Perú', label: 'Envíos a todo el país' },
  ];

  return (
    <div className="overflow-hidden">
      {/* HERO - Premium Impact */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-[#0A2540] text-white pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:5px_5px] opacity-40" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs tracking-[2px] font-medium px-5 py-2 rounded-full mb-6 border border-white/20">
            LÍDER EN SOLUCIONES TEXTILES INDUSTRIALES EN PERÚ
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.08] md:leading-[1.05] mb-6">
            Soluciones industriales<br />de clase mundial<br />para el Perú.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10">
            Más de 15 años fabricando Big Bags, Geomembranas, Carpas industriales y lonas a medida con la más alta calidad y compromiso.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/productos" 
              className="group inline-flex items-center justify-center gap-3 bg-white text-[#0A2540] hover:bg-[#059669] hover:text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.985]"
            >
              Explorar Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link 
              href="/cotizacion" 
              className="inline-flex items-center justify-center gap-3 border border-white/40 hover:bg-white/10 px-9 py-4 rounded-2xl font-semibold text-lg transition-all"
            >
              Solicitar Cotización
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs tracking-widest text-white/50">
            <div>RUC 20523135385</div>
            <div>CHORRILLOS, LIMA</div>
            <div>WHATSAPP 24/7</div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs tracking-[3px] text-white/40">
          DESCUBRA NUESTRAS SOLUCIONES <ArrowRight className="w-3 h-3 rotate-90" />
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-b bg-white py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-x-10 gap-y-4 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#059669]" /> Materiales de alta resistencia</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#059669]" /> Atención personalizada</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#059669]" /> Entregas en todo el Perú</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#059669]" /> +15 años de trayectoria</div>
        </div>
      </div>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-3xl overflow-hidden">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white px-8 py-9 text-center border-r border-gray-100 last:border-r-0">
              <div className="text-3xl md:text-5xl font-semibold tracking-tighter text-[#0A2540]">{stat.number}</div>
              <div className="text-sm text-gray-500 mt-2 font-medium tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="uppercase text-xs tracking-[2px] text-[#059669] font-semibold">EXPERTOS EN</div>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-semibold text-[#0A2540]">Soluciones por sector</h2>
          </div>
          <Link href="/productos" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline">
            Ver todo el catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Minería', icon: '⛏️', href: '/productos?sector=Minería' },
            { name: 'Agricultura', icon: '🌱', href: '/productos?sector=Agricultura' },
            { name: 'Construcción', icon: '🏗️', href: '/productos?sector=Construcción' },
            { name: 'Transporte', icon: '🚚', href: '/productos?sector=Transporte' },
            { name: 'Industrial', icon: '🏭', href: '/productos?sector=Industrial' },
            { name: 'Logística', icon: '📦', href: '/productos?sector=Logística' },
          ].map((cat, index) => (
            <Link 
              key={index} 
              href={cat.href}
              className="group bg-white border border-gray-100 hover:border-[#059669] rounded-3xl p-6 flex flex-col items-center text-center transition-all active:scale-[0.985]"
            >
              <div className="text-4xl mb-4 opacity-90 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="font-semibold text-lg tracking-tight text-[#0A2540] group-hover:text-[#059669]">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-9">
            <div>
              <div className="text-xs uppercase tracking-[2px] text-[#059669] font-semibold mb-1">NUESTRAS SOLUCIONES ESTRELLA</div>
              <h2 className="text-4xl tracking-tighter font-semibold">Productos más solicitados</h2>
            </div>
            <Link href="/productos" className="text-sm font-medium flex items-center gap-1.5 text-[#059669] hover:underline">
              Ver catálogo completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[2px] text-[#059669] font-semibold">MÁS QUE FABRICACIÓN</div>
          <h2 className="text-4xl tracking-tighter font-semibold mt-2">Servicios integrales de clase premium</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Fabricación a Medida', desc: 'Diseñamos y fabricamos exactamente según sus especificaciones técnicas y medidas.' },
            { title: 'Instalación Profesional', desc: 'Equipo técnico especializado para instalación de carpas, geomembranas y sistemas completos.' },
            { title: 'Importación Directa', desc: 'Acceso a materiales premium de los mejores proveedores internacionales con precios competitivos.' },
            { title: 'Soluciones Personalizadas', desc: 'Asesoría técnica completa desde el diseño hasta la entrega final de su proyecto.' },
          ].map((service, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#059669]/30 group transition-all">
              <div className="font-semibold text-xl tracking-tight mb-4 group-hover:text-[#059669] transition-colors">{service.title}</div>
              <p className="text-gray-600 leading-relaxed text-[15px]">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/servicios" className="inline-flex items-center text-sm font-medium text-[#059669] hover:underline">
            Conocer todos nuestros servicios <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* LA EMPRESA - SHORT */}
      <section className="bg-[#0A2540] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="uppercase tracking-[3px] text-xs text-white/50 mb-3">DESDE 2009</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-6">Compromiso real con la calidad y el cliente satisfecho.</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">En Plastilonas Peruanas fabricamos con orgullo productos que superan las expectativas de los sectores más exigentes del país. Calidad, precio justo y atención personalizada son nuestra firma.</p>
          
          <div className="mt-9">
            <Link href="/nosotros" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 px-8 py-3 rounded-2xl text-sm font-medium transition-all">
              Conozca nuestra historia <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="text-xs tracking-widest text-[#059669] font-semibold">POR QUÉ ELEGIRNOS</div>
          <h2 className="text-4xl tracking-tighter font-semibold text-[#0A2540] mt-2">Fabricación directa, sin intermediarios</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Fabricación a medida", content: "Cada Big Bag, geomembrana o carpa se confecciona según las especificaciones exactas de su proyecto: dimensiones, resistencia y acabados." },
            { title: "Asesoría técnica real", content: "Hable directamente con quienes fabrican su producto. Le ayudamos a elegir el material correcto antes de cotizar, no después de comprar." },
            { title: "Atención inmediata por WhatsApp", content: "Sin formularios que caen al vacío: su solicitud llega directo a nuestro equipo comercial y recibe respuesta en horario de atención." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="w-10 h-10 bg-emerald-50 text-[#059669] rounded-2xl flex items-center justify-center font-bold mb-5">{i + 1}</div>
              <div className="font-semibold text-lg text-[#0A2540] mb-3">{item.title}</div>
              <p className="text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] py-20 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">¿Listo para su próximo proyecto?</h2>
          <p className="text-white/90 text-xl mb-9">Reciba una cotización personalizada según las especificaciones de su proyecto.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotizacion" className="inline-flex justify-center items-center bg-white text-[#059669] hover:bg-white/90 px-14 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.985]">
              Solicitar Cotización Ahora
            </Link>
            <a href="https://wa.me/51946085270" target="_blank" className="inline-flex justify-center items-center gap-3 border border-white/40 hover:bg-white/10 px-9 py-4 rounded-2xl font-semibold text-lg transition-all">
              <Phone className="w-5 h-5" /> Chatear por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
