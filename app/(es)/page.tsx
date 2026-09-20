import type { Metadata } from 'next';
import { SITE, HORARIO } from '@/lib/site';
import { FABRICACION_PROPIA_COUNT, YEARS_OPERATING } from '@/lib/facts';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, MapPin, Truck, FileText, Plus } from 'lucide-react';
import { products, productFamilies, sectors, productosPrioritarios } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import SectorTicker from '@/components/SectorTicker';
import ExplorarCatalogo, { type FamiliaResumen } from '@/components/ExplorarCatalogo';
import PorQueAcordeon from '@/components/PorQueAcordeon';
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
import LonaConfigurador from '@/components/LonaConfigurador';
import { novedades, tipoLabels } from '@/lib/novedades';
import { cunas } from '@/lib/cunas';
import SectionHeading from '@/components/SectionHeading';
import MachineryGallery from '@/components/MachineryGallery';
import { Reveal } from '@/components/Reveal';
import { OG_IMAGEN } from '@/lib/meta';
import { ACCIONES } from '@/lib/acciones';
import CinePlayer from '@/components/CinePlayer';
import { PIEZA_PORTADA, RUTA_CINE } from '@/lib/cine';

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
    images: OG_IMAGEN,
    title: `${SITE.name} | Fabricante de soluciones textiles industriales en el Perú`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
    type: 'website',
  },
};

/**
 * ISR: la portada se regenera como mucho cada hora. Sus datos (catálogo,
 * novedades) cambian con los deploys; una hora de caché en CDN elimina el
 * render por visita sin arriesgar frescura.
 */
export const revalidate = 3600;

export default function Home() {
  // Novedades de portada: SOLO briefs de comprador. El changelog de las
  // superficies para agentes (/ai.txt, método editorial) vive en /novedades.
  const novedadesComprador = novedades.filter((n) => n.audiencia !== 'operacion');
  /**
   * Las 11 familias con sus líneas destacadas, resueltas AQUÍ (servidor) y no
   * en el componente: el conteo y la selección salen del propio catálogo, que
   * es la única fuente que puede saberlos. `featured` manda; si una familia no
   * tiene ninguna marcada, se toman sus primeras líneas, que es mejor que un
   * panel vacío. Máximo tres: el panel es un índice, no un catálogo.
   */
  const familiasResumen: FamiliaResumen[] = productFamilies.map((fam) => {
    const deLaFamilia = products.filter((p) => p.category === fam.name);
    const destacados = [...deLaFamilia]
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .slice(0, 3)
      .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));
    return { name: fam.name, slug: fam.slug, tagline: fam.tagline, total: deLaFamilia.length, destacados };
  });
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
  // Las cuatro líneas que la empresa prioriza para comprador y agente de IA
  // por igual: mismo dato que consumen el mega menú, la ficha de producto,
  // el chatbot y /llms.txt. Server-rendered aquí a propósito — ningún
  // rastreador ni comprador sin JS debe depender de una pestaña o un hover
  // para verlas.
  const prioritarios = productosPrioritarios();
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
   * El tipo se declara a mano a propósito: sin él, TypeScript infiere la unión
   * de las formas que HAY en el arreglo y una propiedad opcional desaparece en
   * cuanto la última tarjeta que la usa se retira. Declarar el contrato lo
   * vuelve estable frente a cualquier tarjeta que se añada o quite después.
   */
  type Stat = { to?: number; suffix?: string; display?: string; label: string; sub: string };
  const stats: Stat[] = [
    { to: fabricacionPropia, label: 'Líneas de fabricación propia', sub: `De ${products.length} en catálogo, confeccionadas aquí` },
    { to: products.length, label: 'Soluciones', sub: `En ${productFamilies.length} líneas de producto` },
    { to: anios, label: 'Años fabricando', sub: `En el Perú desde ${SITE.foundingYear}` },
    { display: 'L–V', label: 'Atención comercial', sub: HORARIO.tarjeta },
  ];
  // Franja de legitimidad: datos verificables, no repite las cifras de arriba.
  // El número de RUC vive en /contacto y /confianza (regla de la Etapa 1):
  // aquí basta la afirmación verificable, con su página de respaldo a un clic.
  const trust = [
    { icon: ShieldCheck, text: 'Empresa registrada en SUNAT desde 2009' },
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
              {/* H1 ÚNICO, ESTÁTICO Y EN FLUJO. El rotor anterior tecleaba la
                  frase sobre un triple <span> (reserva invisible + sr-only +
                  copia animada): tres copias del mismo texto y un hero que un
                  rastreador con presupuesto corto podía capturar a medio
                  teclear. El primer HTML ahora ES el mensaje. */}
              <div className="text-xs tracking-[2px] text-[#047857] font-semibold uppercase mb-4">
                Fabricante peruano de textil industrial
              </div>
              <h1 className="text-3xl md:text-[2.75rem] md:leading-[1.08] font-semibold tracking-tight text-[#0A2540] mb-4">
                Lonas para camión, mangas de ventilación y big bags, a medida
              </h1>
              <p className="text-base md:text-lg text-[#334155] mb-7">
                Fabricamos en Chorrillos desde 2009. Cotización con ficha técnica.
                Diga producto, medidas y ciudad. Respondemos en horario L–V 8:00–18:00.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7">
                <Link href="/cotizacion" className="group btn btn-lg btn-primary w-full sm:w-auto">Cotizar proyecto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                <Link href="/productos" className="btn btn-lg btn-ghost w-full sm:w-auto border-[#0A2540]/25">{ACCIONES.catalogo.label}</Link>
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
                {/* Texto real en el primer HTML: sin contador desde 0. La cifra
                    que lee un rastreador y la que ve una persona son la misma. */}
                <div className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#0A2540] tabular-nums">
                  {stat.display ?? `${stat.to}${stat.suffix ?? ''}`}
                </div>
                <div className="text-xs text-gray-700 mt-1.5 font-medium tracking-wide">{stat.label}</div>
                <div className="t-micro text-gray-400 mt-1 leading-snug">{stat.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== 1b-2 · LAS CUATRO LÍNEAS PRIORITARIAS — el frente comercial
           inmediato de la portada, antes que el catálogo completo o las tres
           cuñas profundas de abajo. Server-rendered con <ProductCard>, el
           mismo componente que usa el catálogo: un comprador o un rastreador
           sin JavaScript las ve en el primer HTML, no tras un hover o una
           pestaña. ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Prioridad comercial"
              title="4 líneas que puede cotizar hoy con Plastilonas"
              className="mb-9"
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {prioritarios.map((p, i) => (
              <Reveal key={p.slug} delay={0.04 * i}>
                <ProductCard product={p} showSector={false} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 1c · LOS TRES FRENTES — la historia de la portada. El catálogo
           completo sigue abajo; estas tres cuñas son la oferta con la que la
           empresa quiere ser la respuesta por defecto. ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Tres frentes, un fabricante" title="Lo que más nos piden, con página propia" className="mb-8" />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {cunas.map((c, i) => (
              <Reveal key={c.slug} delay={0.04 * i}>
                <Link href={`/${c.slug}`} className="group flex flex-col h-full bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-7 transition-colors">
                  <div className="font-semibold text-lg text-[#0A2540] leading-snug mb-2 group-hover:text-[#059669]">{c.titulo}</div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{c.descripcion}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#059669]">Ver especificación y cotizar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2 · EXPLORAR CATÁLOGO — UN bloque donde había dos.
           «Explore el catálogo por familia» (carrusel de familias) y
           «Nuestras líneas insignia» (baraja de las 36 fichas) hacían la misma
           pregunta dos veces, las dos rotaban solas y ninguna contestaba a la
           otra. Ahora la familia que se elige DECIDE qué líneas se ven. Lo que
           se fue es la repetición: todas las familias de `productFamilies`,
           sus taglines y las líneas destacadas siguen aquí, y el recuento de
           cada una sale del propio catálogo. Ver ExplorarCatalogo.tsx. ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Todo lo que necesita, en un solo lugar" title="Explorar catálogo" size="compact" className="mb-6" action={<Link href="/productos" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#059669] hover:underline">Ver catálogo completo <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <Reveal delay={0.05}>
            <SectorTicker items={sectorStats} />
          </Reveal>
          <Reveal delay={0.1}>
            <ExplorarCatalogo familias={familiasResumen} />
          </Reveal>
          <p className="text-xs text-gray-400 mt-6 text-center">Fabricación propia, importación directa y líneas especializadas por proyecto — con ficha técnica y respaldo en cada cotización.</p>
        </div>
      </section>

      {/* ===== 2a · CONFIGURADOR DE LONA — la línea que más se pide, especificable
           aquí mismo. Va después del catálogo porque primero se elige familia y
           luego se especifica; y va en la portada porque un RFQ con gramaje,
           ancho y confección dentro vale más que uno que dice «necesito lonas».
           El despiece y las cuatro preguntas viven dentro del componente. ===== */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Especifique antes de pedir"
              title="Arme su lona capa por capa"
              description="Material, gramaje, ancho, color, acabado, confección y tratamientos. El resumen viaja al RFQ tal cual: no calcula precio."
              className="mb-9"
              /* Estaba en `hidden md:flex`: invisible justamente en el teléfono,
                 que es donde una pared de píldoras más cansa y donde más falta
                 hace el atajo a la página completa. Ahora acompaña al título en
                 todos los anchos, como el «ver todo» del resto de secciones. */
              action={<Link href="/configurador/lona" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#059669] hover:underline">Abrir el configurador completo <ArrowRight className="w-4 h-4" /></Link>}
            />
          </Reveal>
          {/* EL CONFIGURADOR SE ABRE, NO SE IMPONE.
              Medido a 390 px antes de esta entrega: 4733 px de los 17237 que
              medía la portada entera. Un 27 % del desplazamiento del teléfono
              para una herramienta de siete pasos que el comprador usa cuando
              YA decidió especificar, no mientras hojea. Nada se retira: el
              encabezado, la descripción y el enlace al configurador completo
              siguen siempre visibles, y el despiece está a un toque. Cerrado
              también en escritorio, a propósito: la portada debe tener la
              misma forma en los dos sitios, sólo más densa cuanto más ancha.
              `<details>` nativo — sin JavaScript, con teclado y lector de
              pantalla ya resueltos. */}
          <Reveal delay={0.05}>
            <details className="group rounded-2xl border border-gray-100 bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 min-h-[64px]">
                <span className="min-w-0">
                  <span className="block font-semibold text-[#0A2540]">Arme su lona paso a paso</span>
                  <span className="mt-0.5 block text-sm text-gray-500">Siete decisiones — material, gramaje, ancho, color, acabado, confección y tratamientos.</span>
                </span>
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-200 text-[#0A2540] transition-transform duration-200 group-open:rotate-45">
                  <Plus className="w-4 h-4" />
                </span>
              </summary>
              <div className="border-t border-gray-100 p-6 md:p-9">
                <LonaConfigurador />
              </div>
            </details>
          </Reveal>
        </div>
      </section>

      {/* ===== 2b · PROCESO — cómo se fabrica y qué servicios lo rodean ===== */}
      <MachineryGallery />

      {/* ===== 4 · SERVICIOS — explorador por pestañas (patrón AWS) ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            {/* `size="compact"`: este título tiene 39 caracteres y a 390 px
                caía en TRES líneas de 28 px — 92 px de tipografía antes de
                que apareciera la primera pestaña, con las pestañas ya por
                debajo del pliegue. No se bajó `.t-h2` para todo el sitio:
                ver el comentario de SectionHeading.tsx. */}
            <SectionHeading eyebrow="Más que fabricación" title="Servicios integrales, de principio a fin" size="compact" className="mb-6 md:mb-10" />
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

      {/* ===== 3 · POR QUÉ — banda oscura de alto contraste ===== */}
      <section className="bg-[#0A2540] text-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-xs tracking-[2px] text-[#10B981] font-semibold mb-3">POR QUÉ ELEGIRNOS</div>
            <h2 className="t-h2-compact font-semibold leading-tight max-w-3xl mb-3">La ventaja de un solo proveedor, sin intermediarios</h2>
            <p className="text-white/60 max-w-2xl leading-relaxed mb-8">Desde 2009 fabricamos e instalamos con equipo propio. Una sola responsabilidad, del diseño a la obra.</p>
          </Reveal>
          {/* Cuatro argumentos plegados en vez de cuatro tarjetas altas: la
              sección medía 1156 px a 390 px, un segundo bloque de altura
              completa después del de servicios. El texto no se toca —sigue
              entero en el HTML— sólo deja de estar desplegado por defecto.
              Ver PorQueAcordeon.tsx. */}
          <Reveal delay={0.05}>
            <PorQueAcordeon items={whyus} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <p className="text-white/70 text-sm max-w-xl">Compromiso real con la calidad y el cliente satisfecho — desde 2009 en el Perú.</p>
              <Link href="/nosotros" className="btn border border-white/30 text-white hover:bg-white/10 shrink-0">Conozca nuestra historia <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 3b · LA TRILOGÍA — UNA sola presencia en la portada, y es un
           cartel con botón de reproducir, no un bucle de fondo.

           Por qué cartel y no bucle. La toma muda más ligera pesa 12,6 MB.
           Ponerla a reproducirse sola detrás del hero costaría más que todo el
           resto de la portada junta, en un país donde buena parte del tráfico
           entra por datos móviles, y a cambio de una decoración que nadie pidió.
           El cartel es una imagen que el optimizador sirve en AVIF a la medida
           de la pantalla, y el archivo de 18 MB sólo se toca si alguien pulsa.

           Y NO compite por el LCP: `prioridadCartel` se queda en false, así
           que la única imagen prioritaria de la portada sigue siendo la
           fotografía del hero (lib/hero-imagenes.ts). ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <CinePlayer pieza={PIEZA_PORTADA} />
            </Reveal>
            <Reveal delay={0.05}>
              <div className="max-w-md">
                <div className="text-xs tracking-[2px] text-[#047857] font-semibold uppercase mb-3">
                  Trilogía
                </div>
                <h2 className="t-h2 font-semibold tracking-tight text-[#0A2540] mb-4">
                  {PIEZA_PORTADA.titulo}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">{PIEZA_PORTADA.sinopsis}</p>
                <Link
                  href={RUTA_CINE}
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#059669] hover:underline"
                >
                  Ver las tres piezas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 4 · NOVEDADES — solo briefs de comprador (el changelog de
           /ai.txt y del método editorial vive en /novedades). ===== */}
      <section className="bg-white section-pad">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading eyebrow="Registro fechado" title="Novedades" className="mb-8" action={<Link href="/novedades" className="hidden md:flex items-center gap-2 py-2 -my-2 text-sm font-medium text-[#059669] hover:underline">Ver todo el registro <ArrowRight className="w-4 h-4" /></Link>} />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {novedadesComprador.slice(0, 3).map((n, i) => (
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
      </section>

      {/* ===== 5 · FRANJA DE CONFIANZA — el cierre: identidad verificable ===== */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="font-semibold text-[#0A2540] mb-1">Lo que este sitio afirma se puede verificar</div>
            <p className="text-sm text-gray-600">
              Empresa registrada en SUNAT, planta en Chorrillos y una regla editorial: ninguna
              cifra sin fuente, ningún proyecto sin autorización. El RUC y el método completo
              están publicados.
            </p>
          </div>
          <div role="group" aria-label="Cómo comprobar lo que publicamos" className="flex flex-wrap gap-3 shrink-0">
            <Link href="/confianza" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#0A2540] hover:border-[#059669] transition-colors">Centro de confianza</Link>
            <Link href="/metodo" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#0A2540] hover:border-[#059669] transition-colors">Cómo se publica este sitio</Link>
          </div>
        </div>
      </section>

      {/* end-home */}
    </div>
  );
}
