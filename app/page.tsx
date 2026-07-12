import Link from 'next/link';
import { ArrowRight, Award, Users, Clock, Shield, Phone, Wrench, Layers } from 'lucide-react';
import { products, productFamilies } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import SectionHeading from '@/components/SectionHeading';

export default function Home() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const stats = [
    { number: '34+', label: 'Soluciones en catálogo' },
    { number: '11', label: 'Líneas de producto' },
    { number: '15+', label: 'Años de experiencia' },
    { number: 'Perú', label: 'Entrega a todo el país' },
  ];
  const sectores = [
    { name: 'Minería', icon: '⛏️' },
    { name: 'Agricultura', icon: '🌱' },
    { name: 'Construcción', icon: '🏗️' },
    { name: 'Transporte', icon: '🚚' },
    { name: 'Industrial', icon: '🏭' },
    { name: 'Saneamiento', icon: '🚰' },
    { name: 'Infraestructura', icon: '🛣️' },
    { name: 'Logística', icon: '📦' },
  ];

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center justify-center bg-[#0A2540] text-white">
        <HeroCarousel />
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs tracking-[2px] font-medium px-5 py-2 rounded-full mb-6 border border-white/20">SOLUCIONES TEXTILES E INDUSTRIALES INTEGRALES EN EL PERÚ</div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.08] md:leading-[1.05] mb-6">Fabricación 100% a medida.<br />Instalación propia.<br />Un solo proveedor.</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10">Big Bags, geomembranas, estructuras, mallas, ventilación, geosintéticos y más: el portafolio industrial más completo del Perú, fabricado e instalado por nuestro propio equipo.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/productos" className="group inline-flex items-center justify-center gap-3 bg-white text-[#0A2540] hover:bg-[#059669] hover:text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.985]">Explorar Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" /></Link>
            <Link href="/cotizacion" className="inline-flex items-center justify-center gap-3 border border-white/40 hover:bg-white/10 px-9 py-4 rounded-2xl font-semibold text-lg transition-all">Solicitar Cotización</Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs tracking-widest text-white/50">
            <div>RUC 20523135385</div>
            <div>CHORRILLOS, LIMA</div>
            <div>WHATSAPP 24/7</div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs tracking-[3px] text-white/40">DESCUBRA NUESTRAS SOLUCIONES <ArrowRight className="w-3 h-3 rotate-90" /></div>
      </section>

      {/* TRUST BAR */}
      <div className="border-b bg-white py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-x-10 gap-y-4 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-[#059669]" /> Fabricación e instalación propias</div>
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-[#059669]" /> Portafolio integral, un solo proveedor</div>
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

      {/* CATÁLOGO POR FAMILIA */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        <SectionHeading eyebrow="Todo lo que necesita, en un solo lugar" title="Explore el catálogo por familia" className="mb-8" action={<Link href="/productos" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline">Ver todo el catálogo <ArrowRight className="w-4 h-4" /></Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productFamilies.map((fam) => (
            <Link key={fam.slug} href={`/productos?categoria=${encodeURIComponent(fam.name)}`} className="group bg-white border border-gray-100 hover:border-[#059669] rounded-3xl p-6 flex items-center justify-between gap-4 transition-all active:scale-[0.99]">
              <div>
                <div className="font-semibold text-lg tracking-tight text-[#0A2540] group-hover:text-[#059669] transition-colors">{fam.name}</div>
                <div className="text-sm text-gray-500 mt-1">{fam.tagline}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#059669] group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center">Fabricación propia, importación directa y líneas especializadas bajo pedido — con ficha técnica y respaldo en cada cotización.</p>
      </section>

      {/* SECTORES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Experiencia por industria" title="Sectores que atendemos" className="mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectores.map((cat, index) => (
              <Link key={index} href={`/productos?sector=${encodeURIComponent(cat.name)}`} className="group bg-white border border-gray-100 hover:border-[#059669] rounded-3xl p-6 flex flex-col items-center text-center transition-all active:scale-[0.985]">
                <div className="text-4xl mb-4 opacity-90 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="font-semibold text-lg tracking-tight text-[#0A2540] group-hover:text-[#059669]">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeading eyebrow="Nuestras soluciones estrella" title="Productos más solicitados" className="mb-9" action={<Link href="/productos" className="text-sm font-medium flex items-center gap-1.5 text-[#059669] hover:underline">Ver catálogo completo <ArrowRight className="w-4 h-4" /></Link>} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Más que fabricación" title="Servicios integrales, de principio a fin" className="mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Fabricación a Medida', desc: 'Diseñamos y confeccionamos exactamente según sus especificaciones técnicas, dimensiones y acabados.' },
              { title: 'Instalación Propia', desc: 'Equipo técnico propio para instalar carpas, geomembranas, estructuras y sistemas completos en obra.' },
              { title: 'Importación Directa', desc: 'Acceso a materiales premium y líneas especializadas de proveedores internacionales, con respaldo técnico.' },
              { title: 'Asesoría Técnica', desc: 'Hable con quienes fabrican su producto: le ayudamos a elegir el material correcto antes de cotizar.' },
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#059669]/30 group transition-all">
                <div className="font-semibold text-xl tracking-tight mb-4 group-hover:text-[#059669] transition-colors">{service.title}</div>
                <p className="text-gray-600 leading-relaxed text-[15px]">{service.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/servicios" className="inline-flex items-center text-sm font-medium text-[#059669] hover:underline">Conocer todos nuestros servicios <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Por qué elegirnos" title="La ventaja de un solo proveedor, sin intermediarios" className="mb-10" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Fabricación e instalación propias', content: 'Confeccionamos e instalamos con nuestro propio equipo: una sola responsabilidad, del diseño a la obra.' },
            { title: 'Un solo proveedor para todo', content: 'Envases, lonas, estructuras, mallas, ventilación y geosintéticos en un mismo lugar. Menos coordinación, menos riesgo.' },
            { title: 'Rapidez y WhatsApp 24/7', content: 'Su solicitud llega directo a nuestro equipo comercial y recibe respuesta ágil, con entregas a todo el Perú.' },
            { title: 'Asesoría técnica real', content: 'Le ayudamos a elegir el material y la especificación correcta antes de comprar, no después.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100">
              <div className="w-10 h-10 bg-emerald-50 text-[#059669] rounded-2xl flex items-center justify-center font-bold mb-5">{i + 1}</div>
              <div className="font-semibold text-lg text-[#0A2540] mb-3">{item.title}</div>
              <p className="text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LA EMPRESA */}
      <section className="bg-[#0A2540] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionHeading eyebrow="Desde 2009" title="Compromiso real con la calidad y el cliente satisfecho." description="En Plastilonas Peruanas fabricamos con orgullo soluciones que superan las expectativas de los sectores más exigentes del país. Calidad, precio justo y atención personalizada son nuestra firma." align="center" tone="light" />
          <div className="mt-9">
            <Link href="/nosotros" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 px-8 py-3 rounded-2xl text-sm font-medium transition-all">Conozca nuestra historia <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] py-20 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SectionHeading title="¿Listo para su próximo proyecto?" description="Reciba una cotización personalizada según las especificaciones de su proyecto." align="center" tone="light" className="mb-9" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotizacion" className="inline-flex justify-center items-center bg-white text-[#059669] hover:bg-white/90 px-14 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.985]">Solicitar Cotización Ahora</Link>
            <a href="https://wa.me/51946085270" target="_blank" className="inline-flex justify-center items-center gap-3 border border-white/40 hover:bg-white/10 px-9 py-4 rounded-2xl font-semibold text-lg transition-all"><Phone className="w-5 h-5" /> Chatear por WhatsApp</a>
          </div>
        </div>
      </section>
      {/* end-home */}
    </div>
  );
}
