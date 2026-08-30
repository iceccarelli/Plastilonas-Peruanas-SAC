import type { Metadata } from 'next';
import { SITE, HORARIO } from '@/lib/site';
import { FABRICACION_PROPIA_COUNT, YEARS_OPERATING } from '@/lib/facts';
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
import HeroMensaje from '@/components/HeroMensaje';
import { novedades, tipoLabels } from '@/lib/novedades';
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
  const fabricacionPropia = FABRICACION_PROPIA_COUNT;
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
    { display: 'L–V', label: 'Atención comercial', sub: HORARIO.tarjeta },
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
      {/* ===== 1 · HERO — patrón AWS: tarjeta clara flotante sobre la
           fotografía. La tarjeta es opaca (bg-white/95, adrede NO bg-white:
           la capa de modo oscuro remapea .bg-white y esta tarjeta debe seguir
           clara en ambos temas, como la de aws.amazon.com), así que el texto
           nunca compite con la foto. Dentro de la tarjeta los colores van en
           hexadecimal por la misma razón: la capa oscura remapea las
           utilidades .text-gray-* y volvería tinta clara un texto que vive
           sobre superficie clara. Sin carrusel, sin Ken Burns. ===== */}
      <section className="relative bg-[#0A2540] overflow-hidden">
        <div className="absolute inset-0">
          <HeroImagen />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-24 md:pt-24 md:pb-36">
          <Reveal>
            <div className="max-w-xl bg-white/95 backdrop-blur rounded-3xl shadow-2xl shadow-black/25 p-7 md:p-10">
              {/* Texto vivo: 15 bloques con los mismos hechos, rotados cada
                  ~10 s; solo el H1 se teclea. Los botones y los chips de
                  abajo son el marco constante. SSR sirve el primer bloque
                  completo — el H1 canónico de los rastreadores. */}
              <HeroMensaje />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7">
                <Link href="/cotizacion" className="group inline-flex items-center justify-center gap-2 bg-[#0A2540] text-white hover:bg-[#047857] font-semibold px-6 py-3.5 rounded-full transition-colors">Cotizar proyecto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                <Link href="/productos" className="inline-flex items-center justify-center gap-2 border border-[#0A2540]/25 text-[#0A2540] hover:border-[#047857] hover:text-[#047857] font-semibold px-6 py-3.5 rounded-full transition-colors">Ver catálogo</Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#0A2540]/10 pt-5 text-xs text-[#64748B]">
                {trust.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5"><t.icon className="w-3.5 h-3.5 text-[#059669]" /> {t.text}</div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 1b · LÁMINA BLANCA (patrón AWS): el contenido sube sobre el
           hero con esquinas redondeadas grandes. Dentro: las cifras derivadas
           del catálogo en banda plana y las novedades reales del registro
           fechado — el «What's new» de AWS, con enlaces que existen. ===== */}
      <section className="relative z-10 -mt-12 rounded-t-[2.5rem] bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
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

          <div className="py-14 md:py-16">
            <Reveal>
              <SectionHeading eyebrow="Registro fechado" title="Novedades" className="mb-8" action={<Link href="/novedades" className="hidden md:flex items-center gap-2 py-2 -my-2 text-sm font-medium text-[#059669] hover:underline">Ver todo el registro <ArrowRight className="w-4 h-4" /></Link>} />
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {novedades.slice(0, 3).map((n, i) => (
                <Reveal key={n.slug} delay={0.04 * i}>
                  <Link href={`/novedades/${n.slug}`} className="group flex flex-col h-full bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-6 transition-colors">
                    <div className="font-mono text-[11px] tracking-wide text-gray-500 mb-3">{tipoLabels[n.tipo]} · {n.fecha}</div>
                    <div className="font-semibold text-gray-900 leading-snug mb-2">{n.titulo}</div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{n.resumen}</p>
                    <ArrowRight className="w-4 h-4 mt-auto text-gray-400 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2 · CATÁLOGO ===== */}
      {/* section-lift ya no hace falta aquí: la lámina 1b es la que sube
          sobre el hero; este bloque continúa sobre el mismo fondo blanco. */}
      <section className="bg-white section-pad">
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
