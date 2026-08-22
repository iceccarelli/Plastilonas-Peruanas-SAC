'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import { INDUSTRIAS } from '@/lib/industrias';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

/**
 * NAVEGACIÓN — agrupada por decisión de compra, no por orden de creación.
 *
 * La barra llegó a tener once entradas de primer nivel (Productos, Servicios,
 * Recursos, Soluciones, Informes, Indicadores, Glosario, Marco, Novedades,
 * Nosotros, Contacto). Medido con Chromium, ese conjunto se recortaba en TODOS
 * los anchos entre 1024 y 1920 px: en Full HD el botón «Solicitar Cotización»
 * terminaba en x=2038 sobre un viewport de 1920, es decir, el CTA principal del
 * sitio era invisible en la resolución de escritorio más común del mundo.
 *
 * El arreglo no es mover el breakpoint —eso sería cambiar una suposición por
 * otra— sino reducir el conjunto a seis entradas y agrupar bajo ellas lo que
 * pertenece junto:
 *
 *   Productos    → el catálogo, por categoría y por sector (mega-menú)
 *   Industrias   → los hubs sectoriales, que hasta ahora no estaban en el menú
 *   Soluciones   → conjuntos de ingeniería, no piezas sueltas
 *   Servicios    → fabricación e instalación
 *   Recursos     → todo el conocimiento: guías, informes, indicadores,
 *                  glosario, marco, calculadoras, descargas, novedades
 *   Nosotros     → la empresa
 *
 * «Contacto» sale del menú principal porque ya vive en la barra utilitaria
 * superior y en el pie: repetirlo tres veces gastaba ancho sin ganar nada.
 *
 * Los paneles desplegables se renderizan SIEMPRE en el DOM y se ocultan por
 * CSS, no montándolos al pasar el ratón. Un rastreador que no ejecuta eventos
 * de puntero ve así los enlaces de sector y de recurso igual que una persona.
 */
interface EntradaHija {
  href: string;
  label: string;
  nota?: string;
}

type Entrada =
  | { tipo: 'mega'; href: string; label: string }
  | { tipo: 'grupo'; href: string; label: string; hijos: EntradaHija[] }
  | { tipo: 'enlace'; href: string; label: string };

const NAV: Entrada[] = [
  { tipo: 'mega', href: '/productos', label: 'Productos' },
  {
    tipo: 'grupo',
    href: '/industria',
    label: 'Industrias',
    // Se derivan del catálogo: añadir un sector en lib/industrias.ts lo pone
    // en el menú sin tocar este archivo.
    hijos: INDUSTRIAS.map((i) => ({ href: `/industria/${i.slug}`, label: i.nombre })),
  },
  { tipo: 'enlace', href: '/soluciones', label: 'Soluciones' },
  { tipo: 'enlace', href: '/servicios', label: 'Servicios' },
  {
    tipo: 'grupo',
    href: '/recursos',
    label: 'Recursos',
    hijos: [
      { href: '/recursos', label: 'Guías técnicas', nota: 'Cómo se especifica cada familia' },
      { href: '/calculadoras', label: 'Calculadoras', nota: 'Predimensionado con método publicado' },
      { href: '/informes', label: 'Informes', nota: 'Sector y formación de precio' },
      { href: '/indicadores', label: 'Indicadores', nota: 'Datos con fuente oficial' },
      { href: '/glosario', label: 'Glosario', nota: 'El vocabulario de compra' },
      { href: '/marco', label: 'Marco de evaluación', nota: 'Cómo comparar proveedores' },
      { href: '/descargas', label: 'Descargas', nota: 'Fichas y catálogos en PDF' },
      { href: '/novedades', label: 'Novedades', nota: 'Qué ha cambiado en el sitio' },
    ],
  },
  { tipo: 'enlace', href: '/nosotros', label: 'Nosotros' },
];

/** Todos los enlaces del menú, aplanados. Lo usa el menú móvil y «Más». */
const TODAS_LAS_RUTAS: EntradaHija[] = NAV.flatMap((e) =>
  e.tipo === 'grupo' ? [{ href: e.href, label: e.label }, ...e.hijos] : [{ href: e.href, label: e.label }],
);

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) => familyHrefByName(name);
const sectorHref = (name: string) => `/productos?sector=${encodeURIComponent(name)}`;

/**
 * ¿Cuántas entradas caben de verdad?
 *
 * No lo decide un breakpoint. Una fila oculta —absoluta, no participa en el
 * layout— contiene siempre las entradas a su ancho natural; de ahí se leen las
 * medidas reales y se compara contra el ancho disponible del contenedor
 * flexible. Lo que no entra se repliega en «Más», que conserva los enlaces.
 *
 * Se recalcula ante: cambio de tamaño del contenedor, cambio de la fila de
 * medida (por ejemplo cuando termina de cargar la tipografía, que altera cada
 * ancho) y al completarse document.fonts. Por eso no depende de adivinar
 * cuánto ocupa «Indicadores» en Inter frente a la fuente de reserva.
 */
function useEntradasQueCaben(
  contenedor: React.RefObject<HTMLDivElement | null>,
  regla: React.RefObject<HTMLDivElement | null>,
  total: number,
) {
  const [visibles, setVisibles] = useState(total);

  const recalcular = useCallback(() => {
    const cont = contenedor.current;
    const filaRegla = regla.current;
    if (!cont || !filaRegla) return;

    const disponible = cont.clientWidth;
    if (disponible === 0) return;

    const separacion = parseFloat(getComputedStyle(filaRegla).columnGap || '24') || 24;
    const anchos = Array.from(filaRegla.children).map((c) => (c as HTMLElement).offsetWidth);
    const anchoMas = filaRegla.dataset.anchoMas ? Number(filaRegla.dataset.anchoMas) : 84;

    let usado = 0;
    let n = 0;
    for (let i = 0; i < anchos.length; i++) {
      const conEste = usado + anchos[i] + (i > 0 ? separacion : 0);
      const faltanPorColocar = i < anchos.length - 1;
      // Si aún quedan entradas por colocar hay que reservar sitio para «Más»;
      // si esta es la última, no hace falta.
      const reserva = faltanPorColocar ? separacion + anchoMas : 0;
      if (conEste + reserva > disponible) break;
      usado = conEste;
      n++;
    }
    setVisibles(n);
  }, [contenedor, regla]);

  useLayoutEffect(() => {
    recalcular();
    const cont = contenedor.current;
    const filaRegla = regla.current;
    if (!cont || !filaRegla) return;

    const observador = new ResizeObserver(recalcular);
    observador.observe(cont);
    observador.observe(filaRegla);
    window.addEventListener('resize', recalcular);
    window.addEventListener('orientationchange', recalcular);
    // La tipografía web cambia todos los anchos al cargar.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(recalcular).catch(() => {});
    }
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', recalcular);
      window.removeEventListener('orientationchange', recalcular);
    };
  }, [recalcular, contenedor, regla]);

  return visibles;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileGrupo, setMobileGrupo] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const zonaNav = useRef<HTMLDivElement>(null);
  const reglaNav = useRef<HTMLDivElement>(null);
  const visibles = useEntradasQueCaben(zonaNav, reglaNav, NAV.length);

  const inline = NAV.slice(0, visibles);
  const replegadas = NAV.slice(visibles);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const grupoActivo = (e: Entrada) =>
    isActive(e.href) || (e.tipo === 'grupo' && e.hijos.some((h) => isActive(h.href)));

  // Cerrar cualquier desplegable con Escape y al cambiar de ruta.
  useEffect(() => {
    setAbierto(null);
    setIsOpen(false);
  }, [pathname]);
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setAbierto(null); setIsOpen(false); }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

  /**
   * `py-1` no es decorativo: sin él la caja del enlace mide 20px de alto y
   * queda por debajo del mínimo de 24×24 que pide WCAG 2.5.8. En un portátil
   * con panel táctil o en un iPad en horizontal —donde este menú sí se muestra—
   * eso se nota al intentar acertar.
   */
  const claseEnlace = (activo: boolean) =>
    `inline-flex items-center min-h-[24px] py-1 whitespace-nowrap transition-colors hover:text-[#059669] ${
      activo ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'
    }`;

  /** Panel de un grupo. Siempre en el DOM; se oculta por CSS, no se desmonta. */
  const Panel = ({ e }: { e: Extract<Entrada, { tipo: 'grupo' }> }) => (
    <div
      className={`absolute top-full left-0 mt-3 w-[min(320px,calc(100vw-3rem))] max-h-[70dvh] overflow-y-auto rounded-2xl border border-gray-100 dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)] p-3 shadow-xl ${
        abierto === e.label ? 'block' : 'hidden'
      }`}
      role="menu"
      aria-label={e.label}
    >
      <Link
        href={e.href}
        className="block rounded-xl px-3 py-2 text-sm font-semibold text-[#0A2540] hover:bg-gray-50 dark:text-[var(--text)] dark:hover:bg-[var(--surface-muted)]"
        onClick={() => setAbierto(null)}
      >
        Ver {e.label.toLowerCase()} →
      </Link>
      <div className="my-2 border-t border-gray-100 dark:border-[var(--border)]" />
      <div className="flex flex-col">
        {e.hijos.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            onClick={() => setAbierto(null)}
            className="group flex flex-col rounded-xl px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)]"
          >
            <span className={`text-sm font-medium ${isActive(h.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669]'}`}>
              {h.label}
            </span>
            {h.nota && (
              <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">{h.nota}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta".
          El padding lateral respeta el recorte de pantalla en horizontal
          (iPhone con muesca girado), donde el área segura no es cero. */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {/* Barra utilitaria superior (estilo AWS). Las áreas táctiles se
            dimensionan a 24px de alto como mínimo: WCAG 2.5.8. */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-end gap-5">
            <a href="tel:+51998117065" className="inline-flex items-center min-h-[24px] px-1 hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="inline-flex items-center min-h-[24px] px-1 hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="inline-flex items-center min-h-[24px] px-1 hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 xl:gap-6 h-20">
            {/* Logo. `min-w-0` permite que el rótulo ceda antes de empujar
                al resto fuera de la pantalla. */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="font-semibold text-lg xl:text-xl tracking-tight truncate text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Zona de navegación: es la única que cede ancho. `min-w-0` es lo
                que permite que se encoja en lugar de desbordar; sin él, un
                hijo con whitespace-nowrap fuerza el ancho del padre y el
                contenido se sale de la pantalla. Ese era exactamente el fallo. */}
            <div ref={zonaNav} className="relative hidden lg:block flex-1 min-w-0">
              <div className="flex items-center gap-6 text-sm font-medium">
                {inline.map((e) =>
                  e.tipo === 'mega' ? (
                    <div
                      key={e.href}
                      className="relative shrink-0"
                      onMouseEnter={() => setAbierto('Productos')}
                      onMouseLeave={() => setAbierto(null)}
                    >
                      <button
                        className={`gap-1.5 ${claseEnlace(isActive('/productos'))}`}
                        onClick={() => setAbierto(abierto === 'Productos' ? null : 'Productos')}
                        aria-expanded={abierto === 'Productos'}
                        aria-haspopup="true"
                      >
                        Productos
                        <ChevronDown className={`w-4 h-4 transition-transform ${abierto === 'Productos' ? 'rotate-180' : ''}`} />
                      </button>
                      <MegaProductos
                        visible={abierto === 'Productos'}
                        cerrar={() => setAbierto(null)}
                        abrirBuscador={() => { setAbierto(null); setShowCommand(true); }}
                      />
                    </div>
                  ) : e.tipo === 'grupo' ? (
                    <div
                      key={e.href}
                      className="relative shrink-0"
                      onMouseEnter={() => setAbierto(e.label)}
                      onMouseLeave={() => setAbierto(null)}
                    >
                      <button
                        className={`gap-1.5 ${claseEnlace(grupoActivo(e))}`}
                        onClick={() => setAbierto(abierto === e.label ? null : e.label)}
                        aria-expanded={abierto === e.label}
                        aria-haspopup="true"
                      >
                        {e.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${abierto === e.label ? 'rotate-180' : ''}`} />
                      </button>
                      <Panel e={e} />
                    </div>
                  ) : (
                    <Link key={e.href} href={e.href} className={`shrink-0 ${claseEnlace(isActive(e.href))}`}>
                      {e.label}
                    </Link>
                  ),
                )}

                {/* «Más»: recoge lo que no cupo. Nunca desaparece un enlace. */}
                {replegadas.length > 0 && (
                  <div
                    className="relative shrink-0"
                    onMouseEnter={() => setAbierto('__mas')}
                    onMouseLeave={() => setAbierto(null)}
                  >
                    <button
                      className={`gap-1.5 ${claseEnlace(replegadas.some(grupoActivo))}`}
                      onClick={() => setAbierto(abierto === '__mas' ? null : '__mas')}
                      aria-expanded={abierto === '__mas'}
                      aria-haspopup="true"
                      aria-label="Más secciones"
                    >
                      Más
                      <ChevronDown className={`w-4 h-4 transition-transform ${abierto === '__mas' ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`absolute top-full right-0 mt-3 w-[min(300px,calc(100vw-3rem))] max-h-[70dvh] overflow-y-auto rounded-2xl border border-gray-100 dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)] p-3 shadow-xl ${
                        abierto === '__mas' ? 'block' : 'hidden'
                      }`}
                      role="menu"
                    >
                      {replegadas.map((e) => (
                        <div key={e.href} className="mb-1 last:mb-0">
                          <Link
                            href={e.href}
                            onClick={() => setAbierto(null)}
                            className={`block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] ${isActive(e.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                          >
                            {e.label}
                          </Link>
                          {e.tipo === 'grupo' &&
                            e.hijos.map((h) => (
                              <Link
                                key={h.href}
                                href={h.href}
                                onClick={() => setAbierto(null)}
                                className={`block rounded-lg px-3 py-1.5 pl-6 text-sm hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] ${isActive(h.href) ? 'text-[#059669]' : 'text-gray-600 dark:text-[var(--text-muted)]'}`}
                              >
                                {h.label}
                              </Link>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fila de medida. Absoluta e invisible: no ocupa sitio en el
                  layout, pero el motor sí calcula el ancho natural de cada
                  entrada, que es lo que se compara arriba. aria-hidden y sin
                  foco: no existe para lectores de pantalla ni para el tabulador. */}
              <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
                <div
                  ref={reglaNav}
                  data-ancho-mas="84"
                  className="pointer-events-none absolute left-0 top-0 flex w-max items-center gap-6 text-sm font-medium"
                >
                  {NAV.map((e) => (
                    <span key={e.href} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                      {e.label}
                      {e.tipo !== 'enlace' && <ChevronDown className="w-4 h-4" />}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones de la derecha. Se reducen antes de que la barra se
                quede sin sitio: por debajo de xl el buscador pierde el rótulo,
                «Iniciar sesión» pasa al menú y el CTA acorta su texto. */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0 ml-auto lg:ml-0">
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden lg:flex items-center gap-2 px-2.5 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden 2xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden 2xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {user ? (
                <Link
                  href="/dashboard"
                  aria-label="Mi cuenta"
                  className="hidden xl:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden xl:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* CTA principal. El texto se acorta antes de recortarse: en
                  Full HD llegó a terminar en x=2038 sobre 1920 px de viewport. */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#0A2540] px-4 xl:px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.985] hover:bg-[#059669] dark:bg-[#10B981] dark:text-[#0A2540] dark:hover:bg-[#34D399]"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Solicitar Cotización</span>
                <span className="xl:hidden">Cotizar</span>
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil. Altura acotada con dvh —no vh— porque en iOS la barra
            del navegador cambia de alto al desplazarse y vh se queda con la
            medida grande, dejando el final del menú bajo la interfaz del
            sistema. El relleno inferior respeta la barra de gestos. */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)] overflow-hidden"
            >
              <div
                className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain px-5 sm:px-6 py-6 flex flex-col gap-1 text-base font-medium"
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
              >
                {/* Productos con submenú de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between min-h-[44px] py-1"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 mb-2 pl-3 flex flex-col text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center min-h-[44px] hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center min-h-[44px] text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* El resto del menú, con los mismos grupos que en escritorio:
                    un comprador que cambia de móvil a portátil encuentra la
                    misma estructura, no dos sitios distintos. */}
                {NAV.filter((e) => e.tipo !== 'mega').map((e) =>
                  e.tipo === 'grupo' ? (
                    <div key={e.href}>
                      <button
                        onClick={() => setMobileGrupo(mobileGrupo === e.label ? null : e.label)}
                        className="w-full flex items-center justify-between min-h-[44px] py-1"
                        aria-expanded={mobileGrupo === e.label}
                      >
                        <span className={grupoActivo(e) ? 'text-[#059669]' : ''}>{e.label}</span>
                        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${mobileGrupo === e.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileGrupo === e.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 mb-2 pl-3 flex flex-col text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                              <Link
                                href={e.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center min-h-[44px] text-[#059669] font-medium"
                              >
                                Ver {e.label.toLowerCase()} →
                              </Link>
                              {e.hijos.map((h) => (
                                <Link
                                  key={h.href}
                                  href={h.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center min-h-[44px] hover:text-[#059669] ${isActive(h.href) ? 'text-[#059669]' : ''}`}
                                >
                                  {h.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={e.href}
                      href={e.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center min-h-[44px] ${isActive(e.href) ? 'text-[#059669]' : ''}`}
                    >
                      {e.label}
                    </Link>
                  ),
                )}

                <Link
                  href="/contacto"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center min-h-[44px] ${isActive('/contacto') ? 'text-[#059669]' : ''}`}
                >
                  Contacto
                </Link>

                <div className="pt-4 mt-2 border-t dark:border-[var(--border)]">
                  <button
                    onClick={() => { setIsOpen(false); setShowCotizacion(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] min-h-[48px] py-3.5 rounded-2xl font-semibold"
                  >
                    <Award className="w-4 h-4" />
                    Solicitar Cotización
                  </button>
                </div>

                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2 min-h-[44px]">
                  <ShoppingCart className="w-4 h-4 shrink-0" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink
                  context="navbar-movil"
                  message="Hola, quisiera información sobre sus productos."
                  className="flex items-center gap-2 min-h-[44px] text-[#059669]"
                >
                  <Phone className="w-4 h-4 shrink-0" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria,
          que ahora mide 40px para que sus enlaces cumplan el mínimo táctil. */}
      <div className="h-20 md:h-[120px]" aria-hidden="true" />

      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}

/**
 * Mega-menú del catálogo. Dos ejes: por categoría y por sector.
 *
 * Se renderiza siempre en el DOM (oculto por CSS) en lugar de montarse al
 * pasar el ratón: así los once enlaces de familia y los sectores existen en el
 * HTML servido, que es lo único que ve un rastreador que no simula un puntero.
 * El ancho se acota con `min()` para que nunca sobresalga en pantallas donde
 * 860px no caben.
 */
function MegaProductos({
  visible,
  cerrar,
  abrirBuscador,
}: {
  visible: boolean;
  cerrar: () => void;
  abrirBuscador: () => void;
}) {
  return (
    <div
      className={`mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(860px,calc(100vw-3rem))] max-h-[75dvh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 xl:p-8 shadow-xl dark:border-[var(--border)] dark:bg-[var(--surface-raised)] ${
        visible ? 'block' : 'hidden'
      }`}
      role="menu"
      aria-label="Catálogo de productos"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
            Por categoría
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {productFamilies.map((fam) => (
              <Link
                key={fam.slug}
                href={familyHref(fam.name)}
                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                onClick={cerrar}
              >
                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                  {fam.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                  {fam.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-[var(--border)] pt-6 md:pt-0 md:pl-8">
          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
            Por sector
          </div>
          <div className="flex flex-col gap-1">
            {sectors.map((sector) => (
              <Link
                key={sector}
                href={sectorHref(sector)}
                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                onClick={cerrar}
              >
                {sector}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between gap-4 text-xs">
        <Link href="/productos" onClick={cerrar} className="text-[#059669] hover:underline font-medium">
          Ver todo el catálogo →
        </Link>
        <button onClick={abrirBuscador} className="flex items-center gap-2 text-[#059669] hover:underline font-medium">
          <Search className="w-3.5 h-3.5 shrink-0" /> Buscar en catálogo
        </button>
      </div>
    </div>
  );
}
