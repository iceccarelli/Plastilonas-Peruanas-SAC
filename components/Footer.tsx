import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Award, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl tracking-tighter">PP</span>
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed text-[15px]">
              Más de 15 años fabricando soluciones textiles industriales de la más alta calidad para los sectores más exigentes del Perú. Compromiso, calidad y precio justo.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos?categoria=Big%20Bags" className="hover:text-white transition-colors">Big Bags y Bolsones</Link></li>
              <li><Link href="/productos?categoria=Geomembranas" className="hover:text-white transition-colors">Geomembranas de PVC</Link></li>
              <li><Link href="/productos?categoria=Carpas%20y%20Estructuras" className="hover:text-white transition-colors">Carpas y Estructuras Metálicas</Link></li>
              <li><Link href="/productos?categoria=Mangas%20de%20Ventilaci%C3%B3n" className="hover:text-white transition-colors">Mangas de Ventilación</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><a href="https://wa.me/51946085270" target="_blank" className="hover:text-white transition-colors">WhatsApp Directo</a></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <a href="https://wa.me/51946085270" target="_blank" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </a>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <span>Política de Privacidad</span>
            <span>Términos y Condiciones</span>
            <span className="hidden md:inline">Diseño premium • Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
