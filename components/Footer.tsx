import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import { SITE, TELEFONOS } from '@/lib/site';
import { FABRICACION_PROPIA_COUNT } from '@/lib/facts';
import { DATOS_PARA_COTIZAR } from '@/components/DatosParaCotizar';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';
import { products } from '@/lib/products';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  // Cifra honesta, contada del catálogo: la insignia decía «Fabricación 100%
  // a medida» mientras 16 de las 36 líneas son importación directa y una es
  // de aliado técnico. La misma mentira ya se retiró de la portada y del
  // prompt del asistente; el pie era el último lugar donde sobrevivía.
  const propias = FABRICACION_PROPIA_COUNT;

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'INDUSTRIAS', links: [
      { label: 'Minería', href: '/industria/mineria' },
      { label: 'Agroexportación', href: '/industria/agroexportacion' },
      { label: 'Transporte y logística', href: '/industria/transporte-logistica' },
      { label: 'Construcción e infraestructura', href: '/industria/construccion' },
      { label: 'Saneamiento y agua', href: '/industria/saneamiento-y-agua' },
      { label: 'Ver todos los sectores →', href: '/industria' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Informes del sector', href: '/informes' },
      { label: 'Indicadores del rubro', href: '/indicadores' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Calculadoras', href: '/calculadoras' },
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'INDUSTRIA E INTERNACIONAL', links: [
      { label: 'Hubs de industria', href: '/industria' },
      { label: 'Aplicaciones', href: '/aplicaciones' },
      { label: 'Biblioteca técnica', href: '/biblioteca' },
      { label: 'Proyectos', href: '/proyectos' },
      { label: 'Centro de compras', href: '/compras' },
      { label: 'Calidad', href: '/calidad' },
      { label: 'Configurador FIBC', href: '/configurador' },
      { label: 'Compradores internacionales', href: '/compradores' },
      { label: 'Exportación', href: '/exportacion' },
      { label: 'Distribuidores', href: '/distribuidores' },
      { label: 'Partners de ingeniería', href: '/socios' },
      { label: 'Centro de confianza', href: '/confianza' },
      { label: 'Cómo se publica este sitio', href: '/metodo' },
      { label: 'English', href: '/en' },
      { label: 'Português', href: '/pt' },
    ]},
    { title: 'CONTACTO', links: [
      { label: `${TELEFONOS.central.display} · Central`, href: TELEFONOS.central.tel, external: true },
      { label: SITE.email, href: `mailto:${SITE.email}`, external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-12 pb-8 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Fila de cierre (patrón AWS): el CTA principal y los idiomas
            reales del sitio. /en y /pt existen: son la puerta de entrada por
            idioma, no una traducción fingida. ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-10 mb-10 border-b border-white/10">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center bg-white text-[#0A2540] font-semibold px-7 py-3 rounded-full hover:bg-[#10B981] hover:text-white transition-colors"
          >
            Solicitar cotización
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-4 py-2 rounded-full border border-white/30 text-white">Español</span>
            <Link href="/en" className="px-4 py-2 rounded-full border border-white/15 text-white/70 hover:border-white/40 hover:text-white transition-colors">English</Link>
            <Link href="/pt" className="px-4 py-2 rounded-full border border-white/15 text-white/70 hover:border-white/40 hover:text-white transition-colors">Português</Link>
          </div>
        </div>
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. En el Perú desde 2009.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp comercial · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Fabricación e instalación de soluciones textiles industriales desde 2009. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> Desde 2009
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Confección en planta: {propias} de {products.length} líneas
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/informes" className="hover:text-white transition-colors">Informes del sector</Link></li>
              <li><Link href="/indicadores" className="hover:text-white transition-colors">Indicadores del rubro</Link></li>
              <li><Link href="/glosario" className="hover:text-white transition-colors">Glosario técnico</Link></li>
              <li><Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras</Link></li>
              <li><Link href="/descargas" className="hover:text-white transition-colors">Centro de documentación</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href={TELEFONOS.central.tel} className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>{TELEFONOS.central.display}</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">{TELEFONOS.whatsapp.display}</div>
                  <div className="text-xs text-white/50">WhatsApp comercial</div>
                </div>
              </WhatsAppLink>
              <a href={`mailto:${SITE.email}`} className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>{SITE.email}</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  {/* La urbanización ya viene en addressStreet: repetirla aquí
                      duplicaba «Urb. Los Huertos de Villa» y un agente que ve
                      una calle doblada inventa una segunda sede. */}
                  {SITE.addressStreet}<br />
                  {SITE.addressLocality}, {SITE.addressRegion}, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* «4 datos para cotizar»: el mismo checklist que gobierna /cotizacion
            y el mensaje de WhatsApp, visible en todo el sitio. Fuente única:
            components/DatosParaCotizar.tsx. */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="text-sm font-semibold text-white/90 mb-3">
            4 datos para cotizar sin idas y vueltas
          </div>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-white/60">
            {DATOS_PARA_COTIZAR.map((d, i) => (
              <li key={d.dato} className="flex gap-2">
                <span className="font-mono text-[#34D399]">{i + 1}.</span>
                <span><span className="text-white/80">{d.dato}</span> — {d.detalle}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 text-sm">
            <Link href="/cotizacion" className="text-[#34D399] hover:underline">Cotizar con estos datos →</Link>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} {SITE.legalName}. Todos los derechos reservados. RUC: {SITE.ruc}</div>
          <div className="flex items-center gap-x-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
