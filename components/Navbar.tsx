'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import CartButton from './CartButton';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

const productCategories = [
  { name: 'Big Bags / Bolsones', href: '/productos?categoria=Big%20Bags' },
  { name: 'Geomembranas de PVC', href: '/productos?categoria=Geomembranas' },
  { name: 'Carpas y Estructuras', href: '/productos?categoria=Carpas%20y%20Estructuras' },
  { name: 'Mangas de Ventilación', href: '/productos?categoria=Mangas%20de%20Ventilaci%C3%B3n' },
  { name: 'Mallas Antiáfidas', href: '/productos?categoria=Mallas%20Agr%C3%ADcolas' },
  { name: 'Mantas para Transporte', href: '/productos?categoria=Mantas%20para%20Transporte' },
  { name: 'Ver todo el catálogo', href: '/productos' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] text-white/80 text-xs">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <a
              href="https://wa.me/51946085270"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </a>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
            <Link
              href={user ? '/dashboard' : '/login'}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {user ? (user.name?.split(' ')[0] ?? 'Mi cuenta') : 'Iniciar sesión'}
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-[#0A2540] rounded-xl flex items-center justify-center group-hover:bg-[#059669] transition-colors">
                <span className="text-white font-bold text-2xl tracking-tighter">PP</span>
              </div>
              <div>
                <div className="font-semibold text-xl tracking-tight text-[#0A2540]">Plastilonas Peruanas</div>
                <div className="text-[10px] text-gray-500 -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-9 text-sm font-medium">
              {/* Mega Menu Productos */}
              <div 
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button 
                  className={`flex items-center gap-1.5 transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
                    >
                      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                        {productCategories.map((cat, index) => (
                          <Link
                            key={index}
                            href={cat.href}
                            className="group flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-gray-50 text-[#0A2540] hover:text-[#059669] transition-all"
                            onClick={() => setShowMegaMenu(false)}
                          >
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-gray-300 group-hover:text-[#059669] transition-colors">→</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t flex items-center justify-between text-xs">
                        <div className="text-gray-500">¿Buscas algo específico?</div>
                        <button 
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#0A2540] border border-gray-200 hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Buscar productos</span>
                <kbd className="hidden lg:block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 rounded">⌘K</kbd>
              </button>

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
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
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 bg-[#0A2540] hover:bg-[#059669] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540]"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-white"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] text-white py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <a href="https://wa.me/51946085270" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
