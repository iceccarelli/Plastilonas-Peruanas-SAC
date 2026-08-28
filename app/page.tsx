import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { YEARS_OPERATING } from '@/lib/facts';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, MapPin, Truck, FileText } from 'lucide-react';
import { products, productFamilies, sectors } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import FeaturedDeck from '@/components/FeaturedDeck';
import SectorTicker from '@/components/SectorTicker';
import FamilyCarousel from '@/components/FamilyCarousel';
import ServiceTabs from '@/components/ServiceTabs';
import { tomasDe } from '@/lib/galeria';

/**
 * Foto base de cada servicio. Vivía dentro de ServiceTabs, que es un
 * componente de cliente y por tanto no podía comprobar si el archivo existe.
 * Aquí sí: esta página es de servidor.
 */
const FOTO_SERVICIO: Record<string, string> = {
  ruler: '/images/servicio-fabricacion.webp',
  hardhat: '/images/servicio-instalacion.webp',
  ship: '/images/servicio-importacion.webp',
  lightbulb: '/images/servicio-asesoria.webp',
};
import HeroImagen from '@/components/HeroImagen';
import SectionHeading from '@/components/SectionHeading';
import MachineryGallery from '@/components/MachineryGallery';
import { Reveal } from '@/components/Reveal';
import CountUp from '@/components/CountUp';

/**
 * Metadata propia de la home. Sin esto heredaba el title/description por
 * defecto del layout y no declaraba canonical — dos páginas con la misma
 * descripción compiten entre sí y el canonical queda a criterio de Google.
 */
/**
 * hreflang — se declara SOLO entre estas tres páginas.
 *
 * `/en` y `/pt` no son traducciones del sitio: son una página de identidad y
 * RFQ por idioma. hreflang significa «el mismo contenido en otro idioma», así
 * que declararlo en las 275 páginas apuntaría cada ficha de producto a una
 * portada en inglés que no la traduce. Google descarta el clúster entero
 * cuando el destino no corresponde, y de paso se pierde el caso en que sí
 * corresponde. Aquí corresponde: las tres son la puerta de entrada al mismo
 * proveedor, cada una en su idioma. x-default apunta al español porque es el
 * idioma real del catálogo.
 */
const ALTERNOS = {
  'es-PE': '/',
  en: '/en',
  'pt-BR': '/pt',
  'x-default': '/',
} as const;

export const metadata: Metadata = {
  title: 'Fabricante de big bags, lonas, geomembranas y mallas en Perú',
  description:
    `Fabricamos e instalamos a medida desde ${SITE.foundingYear}: big bags FIBC, lonas, geomembranas, carpas, ventilación minera y mallas. Un solo proveedor, despacho nacional.`,
  alternates: { canonical: '/', languages: ALTERNOS },
  openGraph: {
    title: `${SITE.name} | Fabricante de soluciones textiles industriales en el Perú`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function Home() {
  const featuredProducts = [...products].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  // Conteo REAL de soluciones por sector (se recalcula solo al editar el catálogo).
  const sectorStats = sectors
    .map((sec) => ({ sector: sec, count: products.filter((p) => p.sector.includes(sec)).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
  // Años reales fabricando. YEARS_OPERATING los deriva de SITE.foundingYear:
  // el día que se corrija el año de constitución, esta cifra y la de abajo
  // cambian solas. Escribirlo a mano fue lo que hizo que la portada dijera
  // «desde 2009» mientras lib/site.ts era la única fuente que podía saberlo.
  const anios = YEARS_OPERATING;
  /**
   * Líneas que se confeccionan en la planta de Chorrillos, contadas del propio
   * catálogo. Sustituye a un «100% a medida» escrito a mano que el catálogo
   * desmentía: 16 de las 36 líneas son importación directa y una es de aliado
   * técnico, y el sitio entero —el campo `sourcing`, el badge de cada ficha, el
   * prompt del chatbot— existe para declararlo. Una cifra falsa sentada junto a
   * dos verdaderas les roba la credibilidad a las dos.
   */
  const fabricacionPropia = products.filter((p) => p.sourcing === 'fabricacion_propia').length;
  /**
   * Cifras calculadas del catálogo: nunca quedan desfasadas ni se inventan.
   *
   * El tipo se declara a mano a propósito. Sin él, TypeScript infiere la unión
   * de las formas que HAY en el arreglo, de modo que `stat.suffix` sólo compila
   * mientras alguna tarjeta lleve `suffix`. Al retirar la de «100 %» —que era
   * la única— la propiedad desapareció de la unión y el build se cayó en
   * `CountUp suffix={stat.suffix}`, con las pruebas en verde: es un fallo que
   * sólo ve `tsc`. Declarar el contrato lo vuelve estable frente a cualquier
   * tarjeta que se añada o se quite después.
   */
  type Stat = { to?: number; suffix?: string; display?: string; label: string; sub: string };
  const stats: Stat[] = [
    { to: fabricacionPropia, label: 'Líneas de fabricación propia', sub: `De ${products.length} en catálogo, confeccionadas aquí` },
    { to: products.length, label: 'Soluciones', sub: `En ${productFamilies.length} líneas de producto` },
    { to: anios, label: 'Años fabricando', sub: `En el Perú desde ${SITE.foundingYear}` },
    { display: 'L–V', label: 'Atención comercial', sub: '8:00–18:00 · sábados 8:00–13:00' },
  ];
  // Franja de legitimidad: datos verificables, no repite las cifras de arriba.
  const trust = [
    { icon: ShieldCheck, text: `RUC ${SITE.ruc}` },
    { icon: MapPin, text: 'Chorrillos, Lima — Perú' },
    { icon: Truck, text: 'Entrega a todo el país' },
    { icon: FileText, text: 'Ficha técnica en cada cotización' },
  ];
  const whyus = [
    { title: 'Fabricación e instalación propias', content: 'Confeccionamos e instalamos con nuestro propio equipo: una sola responsabilidad, del diseño a la obra.' },
    { title: 'Un solo proveedor para todo', content: 'Envases, lonas, estructuras, mallas, ventilación y geosintéticos en un mismo lugar. Menos coordinación, menos riesgo.' },
    { title: 'Respuesta directa por WhatsApp', content: 'Su solicitud llega directo a nuestro equipo comercial en horario de atención, y se despacha a todo el país desde la planta de Chorrillos.' },
    { title: 'Asesoría técnica real', content: 'Le ayudamos a elegir el material y la especificación correcta antes de comprar, no después.' },
  ];
  const services = [
    { title: 'Fabricación a Medida', desc: 'Diseñamos y confeccionamos según sus especificaciones técnicas, dimensiones y acabados exactos.' },
    { title: 'Instalación Propia', desc: 'Equipo técnico propio para instalar carpas, geomembranas, estructuras y sistemas completos en obra.' },
    { title: 'Importación Directa', desc: 'Materiales y líneas especializadas importadas directamente, con ficha técnica del fabricante en cada cotización.' },
    { title: 'Asesoría Técnica', desc: 'Hable directamente con quienes fabrican su producto y decida con criterio de ingeniería.' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ===== 1 · HERO — panel sólido a la izquierda, UNA foto quieta a la derecha.
           El texto nunca se superpone a la fotografía: cada plano es legible
           por sí solo. Sin carrusel, sin Ken Burns, sin cifras sobre la foto. ===== */}
      <section className="relative bg-[#0A2540] text-white">
        <div className="mx-auto grid lg:grid-cols-[minmax(0,46rem)_minmax(0,1fr)] min-h-[70vh] md:min-h-[82vh]">
          {/* Columna de texto: fondo sólido, una idea por línea. */}
          <div className="flex flex-col justify-center px-6 py-16 md:py-20 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-14">
            <Reveal>
              <div className="text-xs tracking-[2px] text-[#10B981] font-semibold uppercase mb-5">
                Fabricante e instalador · Chorrillos, Lima — Perú
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="t-display font-semibold mb-4">Textil técnico a medida, con instalación propia.</h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-lg md:text-xl text-white/85 mb-3">Un solo proveedor para cubrir, contener y ventilar.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-sm md:text-base text-white/60 mb-9">
                Big bags, lonas, geomembranas, mallas y ventilación minera. Cotización con ficha técnica y despacho a todo el país.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                <Link href="/cotizacion" className="group btn btn-lg bg-white text-[#0A2540] hover:bg-[#047857] hover:text-white shadow-lg shadow-black/20 justify-center">Cotizar proyecto <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
                <Link href="/productos" className="btn btn-lg border border-white/40 text-white hover:bg-white/10 hover:border-white/60 justify-center">Ver catálogo</Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-xs text-white/55">
                {trust.map((t, i) => (
                  <div key={i} className="flex items-center gap-2"><t.icon className="w-3.5 h-3.5 text-[#10B981]" /> {t.text}</div>
                ))}
              </div>
            </Reveal>
          </div>
          {/* Columna de fotografía: una obra real, quieta, sin texto encima. */}
          <div className="relative h-64 sm:h-80 lg:h-auto">
            <HeroImagen />
          </div>
        </div>
      </section>

      {/* ===== 1b · CIFRAS — banda plana bajo el hero, sobre fondo sólido.
           Las mismas cifras derivadas del catálogo, ahora legibles: nada de
           vidrio esmerilado sobre fotografía. ===== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {stats.map((stat, i) => (
              <div key={i} className="px-3 py-7 md:px-6 md:py-9 text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#0A2540] tabular-nums">
                  <CountUp to={stat.to} suffix={stat.suffix} display={stat.display} />
                </div>
                <div className="text-xs text-gray-700 mt-1.5 font-medium tracking-wide">{stat.label}</div>
                <div className="t-micro text-gray-400 mt-1 leading-snug">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2 · CATÁLOGO ===== */}
      <section className="bg-white section-pad section-lift">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Todo lo que necesita, en un solo lugar" title="Explore el catálogo por familia" className="mb-6" action={<Link href="/productos" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline">Ver todo el catálogo <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <Reveal delay={0.05}>
            <SectorTicker items={sectorStats} />
          </Reveal>
          <Reveal delay={0.1}>
            <FamilyCarousel families={productFamilies} />
          </Reveal>
          <p className="text-xs text-gray-400 mt-6 text-center">Fabricación propia, importación directa y líneas especializadas por proyecto — con ficha técnica y respaldo en cada cotización.</p>

          <Reveal className="mt-20">
            <SectionHeading eyebrow="Nuestras soluciones estrella" title="Nuestras líneas insignia" className="mb-9" action={<Link href="/productos" className="text-sm font-medium flex items-center gap-1.5 text-[#059669] hover:underline">Ver catálogo completo <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <Reveal delay={0.05}>
            <FeaturedDeck products={featuredProducts} />
          </Reveal>
        </div>
      </section>

      {/* ===== 3 · POR QUÉ — banda oscura de alto contraste ===== */}
      <section className="bg-[#0A2540] text-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-xs tracking-[2px] text-[#10B981] font-semibold mb-3">POR QUÉ ELEGIRNOS</div>
            <h2 className="t-h2 font-semibold leading-tight max-w-3xl mb-4">La ventaja de un solo proveedor, sin intermediarios</h2>
            <p className="text-white/60 max-w-2xl leading-relaxed mb-12">Desde 2009 fabricamos e instalamos con equipo propio. Una sola responsabilidad, del diseño a la obra.</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9 md:gap-8">
            {whyus.map((item, i) => (
              <Reveal key={i} delay={0.04 * i}>
                <div className="border-t border-white/15 pt-5">
                  <div className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#10B981] mb-3">0{i + 1}</div>
                  <div className="font-semibold text-base md:text-lg mb-2 leading-snug">{item.title}</div>
                  <p className="text-white/60 text-sm leading-relaxed">{item.content}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <p className="text-white/70 text-sm max-w-xl">Compromiso real con la calidad y el cliente satisfecho — desde 2009 en el Perú.</p>
              <Link href="/nosotros" className="btn border border-white/30 text-white hover:bg-white/10 shrink-0">Conozca nuestra historia <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CÓMO SE FABRICA — galería ilustrativa del proceso */}
      <MachineryGallery />

      {/* ===== 4 · SERVICIOS — explorador por pestañas (patrón AWS) ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Más que fabricación" title="Servicios integrales, de principio a fin" className="mb-10" />
          </Reveal>
          <Reveal delay={0.05}>
            <ServiceTabs
              services={services.map((sv, i) => {
                const icon = ['ruler', 'hardhat', 'ship', 'lightbulb'][i];
                // Las tomas se resuelven AQUÍ, en el servidor, porque es el
                // único sitio con acceso al disco. `tomasDe` devuelve la
                // primera foto más las secundarias que existan de verdad, ya
                // sin duplicados byte a byte.
                const base = FOTO_SERVICIO[icon];
                return { ...sv, icon, tomas: tomasDe(base) };
              })}
            />
          </Reveal>
        </div>
      </section>

      {/* end-home */}
    </div>
  );
}
