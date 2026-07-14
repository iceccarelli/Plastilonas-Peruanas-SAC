import Link from 'next/link';
import { ArrowRight, Phone, Wrench, Layers, Clock, Award } from 'lucide-react';
import { products, productFamilies, sectors } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import FeaturedDeck from '@/components/FeaturedDeck';
import HeroCarousel from '@/components/HeroCarousel';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const stats = [
    { number: '34+', label: 'Soluciones en catálogo' },
    { number: '11', label: 'Líneas de producto' },
    { number: '15+', label: 'Años de experiencia' },
    { number: 'Perú', label: 'Entrega nacional' },
  ];
  const trust = [
    { icon: Wrench, text: 'Fabricación e instalación propias' },
    { icon: Layers, text: 'Portafolio integral, un solo proveedor' },
    { icon: Clock, text: 'Entregas en todo el Perú' },
    { icon: Award, text: '+15 años de trayectoria' },
  ];
  const whyus = [
    { title: 'Fabricación e instalación propias', content: 'Confeccionamos e instalamos con nuestro propio equipo: una sola responsabilidad, del diseño a la obra.' },
    { title: 'Un solo proveedor para todo', content: 'Envases, lonas, estructuras, mallas, ventilación y geosintéticos en un mismo lugar. Menos coordinación, menos riesgo.' },
    { title: 'Rapidez y WhatsApp 24/7', content: 'Su solicitud llega directo a nuestro equipo comercial y recibe respuesta ágil, con entregas a todo el país.' },
    { title: 'Asesoría técnica real', content: 'Le ayudamos a elegir el material y la especificación correcta antes de comprar, no después.' },
  ];
  const services = [
    { title: 'Fabricación a Medida', desc: 'Diseñamos y confeccionamos según sus especificaciones técnicas, dimensiones y acabados exactos.' },
    { title: 'Instalación Propia', desc: 'Equipo técnico propio para instalar carpas, geomembranas, estructuras y sistemas completos en obra.' },
    { title: 'Importación Directa', desc: 'Acceso a materiales premium y líneas especializadas internacionales, con respaldo técnico y ficha en cotización.' },
    { title: 'Asesoría Técnica', desc: 'Hable directamente con quienes fabrican su producto y decida con criterio de ingeniería.' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ===== 1 · HERO ===== */}
      <section className="relative min-h-[78vh] md:min-h-[92vh] flex flex-col items-center justify-center bg-[#0A2540] text-white py-16 md:py-0">
        <HeroCarousel />
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10 pt-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs tracking-[2px] font-medium px-5 py-2 rounded-full mb-6 border border-white/20">SOLUCIONES TEXTILES E INDUSTRIALES INTEGRALES EN EL PERÚ</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.08] md:leading-[1.05] mb-6">Fabricación 100% a medida.<br />Instalación propia.<br />Un solo proveedor.</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10">Big Bags, geomembranas, estructuras, mallas, ventilación y geosintéticos: el portafolio industrial más completo del Perú, fabricado e instalado por nuestro propio equipo.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/productos" className="group inline-flex items-center justify-center gap-3 bg-white text-[#0A2540] hover:bg-[#059669] hover:text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/20">Explorar Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
              <Link href="/cotizacion" className="inline-flex items-center justify-center gap-3 border border-white/40 hover:bg-white/10 hover:border-white/60 px-9 py-4 rounded-2xl font-semibold text-lg transition-all duration-300">Solicitar Cotización</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-10 md:mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 px-6 py-7 text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tighter text-white">{stat.number}</div>
                <div className="text-xs text-white/60 mt-1.5 font-medium tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="relative z-10 mt-10 mb-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/50">
          {trust.map((t, i) => (
            <div key={i} className="flex items-center gap-2"><t.icon className="w-3.5 h-3.5 text-[#10B981]" /> {t.text}</div>
          ))}
        </div>
      </section>

      {/* ===== 2 · CATÁLOGO ===== */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Todo lo que necesita, en un solo lugar" title="Explore el catálogo por familia" className="mb-6" action={<Link href="/productos" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline">Ver todo el catálogo <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex flex-wrap gap-2 mb-8">
              {sectors.map((s) => (
                <Link key={s} href={`/productos?sector=${encodeURIComponent(s)}`} className="px-4 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:border-[#059669] hover:text-[#059669] transition-colors">{s}</Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productFamilies.map((fam) => (
                <Link key={fam.slug} href={`/productos?categoria=${encodeURIComponent(fam.name)}`} className="group bg-white border border-gray-100 hover:border-[#059669] hover:shadow-lg hover:shadow-gray-100 rounded-3xl p-6 flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5">
                  <div>
                    <div className="font-semibold text-lg tracking-tight text-[#0A2540] group-hover:text-[#059669] transition-colors">{fam.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{fam.tagline}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#059669] group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </Reveal>
          <p className="text-xs text-gray-400 mt-6 text-center">Fabricación propia, importación directa y líneas especializadas bajo pedido — con ficha técnica y respaldo en cada cotización.</p>

          <Reveal className="mt-20">
            <SectionHeading eyebrow="Nuestras soluciones estrella" title="Productos más solicitados" className="mb-9" action={<Link href="/productos" className="text-sm font-medium flex items-center gap-1.5 text-[#059669] hover:underline">Ver catálogo completo <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <Reveal delay={0.05}>
            <FeaturedDeck products={featuredProducts} />
          </Reveal>
        </div>
      </section>

      {/* ===== 3 · POR QUÉ + SERVICIOS ===== */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Por qué elegirnos" title="La ventaja de un solo proveedor, sin intermediarios" className="mb-10" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyus.map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#059669]/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-emerald-50 text-[#059669] rounded-2xl flex items-center justify-center font-bold mb-5">{i + 1}</div>
                  <div className="font-semibold text-lg text-[#0A2540] mb-3">{item.title}</div>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{item.content}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="mt-16">
            <SectionHeading eyebrow="Más que fabricación" title="Servicios integrales, de principio a fin" className="mb-10" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#059669]/30 group transition-all duration-300">
                  <div className="font-semibold text-xl tracking-tight mb-4 group-hover:text-[#059669] transition-colors">{service.title}</div>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{service.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <div className="bg-[#0A2540] text-white rounded-3xl px-8 py-12 md:px-14 md:py-14 text-center">
              <div className="text-xs tracking-[2px] text-[#10B981] font-semibold mb-3">DESDE 2009</div>
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 max-w-3xl mx-auto">Compromiso real con la calidad y el cliente satisfecho.</h3>
              <p className="text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">En Plastilonas Peruanas fabricamos con orgullo soluciones que superan las expectativas de los sectores más exigentes del país. Calidad, precio justo y atención personalizada son nuestra firma.</p>
              <Link href="/nosotros" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 px-8 py-3 rounded-2xl text-sm font-medium transition-all">Conozca nuestra historia <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* end-home */}
    </div>
  );
}
