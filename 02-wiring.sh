#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
echo "→ repo: $(pwd)  branch: $(git rev-parse --abbrev-ref HEAD)"

# ── 1. tailwind.config.ts : enable class-based dark mode ───────────────────
python3 - <<'PY'
p = 'tailwind.config.ts'
s = open(p).read()
if 'darkMode' in s:
    print('  tailwind.config.ts: darkMode already set, skipping')
else:
    s = s.replace("const config: Config = {\n  content: [",
                  "const config: Config = {\n  darkMode: 'class',\n  content: [", 1)
    open(p, 'w').write(s)
    print('  tailwind.config.ts: added darkMode: class')
PY

# ── 2. app/layout.tsx : no-flash script + token-driven body ────────────────
python3 - <<'PY'
p = 'app/layout.tsx'
s = open(p).read()

s = s.replace(
  '    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>\n'
  '      <body className="font-sans antialiased bg-white text-[#0A2540]">',
  '    <html\n'
  '      lang="es"\n'
  '      className={`${inter.variable} ${playfair.variable}`}\n'
  '      suppressHydrationWarning\n'
  '    >\n'
  '      <head>\n'
  '        {/* Aplica el tema antes del primer pintado. Sin esto, una carga en\n'
  '            modo oscuro parpadea en blanco. Debe ir sincrónico en <head>. */}\n'
  '        <script\n'
  '          dangerouslySetInnerHTML={{\n'
  "            __html:\n"
  '              "try{var t=localStorage.getItem(\'theme\')||(window.matchMedia(\'(prefers-color-scheme:dark)\').matches?\'dark\':\'light\');if(t===\'dark\')document.documentElement.classList.add(\'dark\')}catch(e){}",\n'
  '          }}\n'
  '        />\n'
  '      </head>\n'
  '      {/* bg/text vienen de los tokens en globals.css: las utilidades de\n'
  '          Tailwind (0,1,0) ganaban al selector body (0,0,1) y anulaban .dark */}\n'
  '      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">',
  1)
open(p, 'w').write(s)
print('  app/layout.tsx: no-flash script + token body')
PY

# ── 3. app/api/chat/route.ts : page-aware context (Claude preserved) ───────
python3 - <<'PY'
p = 'app/api/chat/route.ts'
s = open(p).read()
s = s.replace(
  "    const { messages } = await req.json();",
  "    const { messages, currentPage } = await req.json();\n\n"
  "    // Contexto de página, opcional y retrocompatible: si el cliente no lo\n"
  "    // envía, el prompt queda exactamente como estaba.\n"
  "    const pageContext =\n"
  "      typeof currentPage === 'string' && currentPage.length > 0\n"
  "        ? `\\n\\nContexto: el usuario está viendo la página ${currentPage}. ` +\n"
  "          'Si es una ficha de producto, céntrate en sus especificaciones y en ' +\n"
  "          'qué datos necesitas para cotizarlo. Si es el catálogo, ayúdale a ' +\n"
  "          'filtrar por sector. Si es la portada, ofrece un panorama por sector.'\n"
  "        : '';", 1)
s = s.replace("      system: SYSTEM_PROMPT,", "      system: SYSTEM_PROMPT + pageContext,", 1)
open(p, 'w').write(s)
print('  app/api/chat/route.ts: optional currentPage context')
PY

echo "→ writing components/Navbar.tsx"
cat > components/Navbar.tsx <<'NAVBAR_EOF'
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
import { ThemeToggle } from './ThemeToggle';

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
        {/* Barra utilitaria superior (estilo AWS).
            El acceso a la cuenta vive SOLO en la barra principal: antes se
            duplicaba aquí y en las acciones de la derecha, y ambos se
            mostraban a partir de md. */}
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
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[var(--surface-raised)]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            {/* gap-4 + shrink-0 en los tres bloques: sin esto flex encogía la
                navegación hasta solaparla con el buscador a 1280px. */}
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 bg-[#0A2540] dark:bg-[var(--brand)] rounded-xl flex items-center justify-center group-hover:bg-[#059669] transition-colors shrink-0">
                <span className="text-white font-bold text-2xl tracking-tighter">PP</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight text-[#0A2540] dark:text-[var(--text)] whitespace-nowrap">
                  Plastilonas Peruanas
                </div>
                <div className="text-[10px] text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium whitespace-nowrap">
                  SAC • DESDE 2009
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
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
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                        {productCategories.map((cat, index) => (
                          <Link
                            key={index}
                            href={cat.href}
                            className="group flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-all"
                            onClick={() => setShowMegaMenu(false)}
                          >
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-gray-300 group-hover:text-[#059669] transition-colors">→</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <div className="text-gray-500 dark:text-[var(--text-muted)]">¿Buscas algo específico?</div>
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
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Buscador: la etiqueta sólo aparece a partir de xl, para que a
                  1280px no compita por espacio con la navegación. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account — única instancia */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] border border-gray-200 dark:border-[var(--border)] hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
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
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[var(--brand)] hover:bg-[#059669] dark:hover:bg-[var(--brand-hover)] text-white px-5 xl:px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4 shrink-0" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
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
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
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
                <div className="pt-4 border-t dark:border-[var(--border)]">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[var(--brand)] text-white py-3.5 rounded-2xl font-semibold"
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
                <div className="pt-2"><ThemeToggle /></div>
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
NAVBAR_EOF

echo
echo "→ verifying"
grep -q "darkMode: 'class'" tailwind.config.ts && echo "  ✓ darkMode: class"
grep -q "classList.add" app/layout.tsx           && echo "  ✓ no-flash script"
grep -q 'bg-\[var(--surface)\]' app/layout.tsx   && echo "  ✓ token-driven body"
grep -q "ThemeToggle" components/Navbar.tsx      && echo "  ✓ ThemeToggle mounted"
test "$(grep -c 'Iniciar sesión' components/Navbar.tsx)" = "2" && echo "  ✓ login de-duplicated (1 desktop + 1 mobile)"
grep -q "currentPage" app/api/chat/route.ts      && echo "  ✓ chat page context (Claude preserved)"
grep -q "@ai-sdk/anthropic" app/api/chat/route.ts && echo "  ✓ still on @ai-sdk/anthropic"

echo
echo "→ npm run build && npm test"
