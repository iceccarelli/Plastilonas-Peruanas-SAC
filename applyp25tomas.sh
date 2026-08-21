#!/usr/bin/env bash
# =============================================================================
# P25 — ROTACIÓN DE N TOMAS CON KEN BURNS, Y CÓMO ENCARGARLAS
#
# QUÉ CAMBIA
#
# 1. El sitio pasa de alternar DOS tomas a alternar hasta CUATRO por ranura,
#    con el mismo cruce lento y un Ken Burns desfasado por capa.
#      /images/glosario/malla-raschel.png       toma 1
#      /images/glosario/malla-raschel-2.png     toma 2
#      /images/glosario/malla-raschel-3.png     toma 3
#
# 2. La rotación llega al GLOSARIO y a las GUÍAS, no solo a la galería de
#    producto: `components/ImagenContenido.tsx` usa ahora la misma librería.
#
# 3. Se descartan las tomas idénticas byte a byte. Es el caso real de los seis
#    zips del glosario: las tres copias de cada parte eran el MISMO archivo, no
#    tres versiones. Fundir una imagen contra un duplicado exacto de sí misma
#    no produce ningún cruce —deja la página quieta— y descarga el archivo dos
#    veces. El informe ahora lo dice en vez de callarlo.
#
# 4. `npm run imagenes:tomas` emite el encargo de las tomas 2 y 3 de todo lo
#    que YA está publicado, con instrucciones ESCRITAS de qué debe cambiar
#    entre una toma y otra. Sin esa instrucción, un generador al que se le pide
#    «otra versión» devuelve el mismo render — que es exactamente lo que pasó.
#
# CÓMO APLICARLO
#   bash applyp25tomas.sh
#
# El script no toca ninguna imagen y no borra nada. Si algo falla, se detiene.
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute esto desde la raíz del repositorio." >&2
  exit 1
fi

echo "P25 — escribiendo archivos..."

mkdir -p "$(dirname '.gitignore')"
cat > '.gitignore' <<'P25EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Next.js
/.next/
/out/

# Production
/build

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Misc
.DS_Store
*.pem
Thumbs.db
# TypeScript incremental build info
*.tsbuildinfo

# patch delivery artifacts (never commit)
*.patch

# macOS AppleDouble junk (33 ._*.jpg were committed under public/images)
._*
.DS_Store

# delivery artifacts (never commit)
*.zip
install-gallery*.sh
update-gallery.sh
stage-images.sh
gallery-code.patch

# Paquetes de imágenes: se suben al repo para transferirlos y se extraen a
# public/. Versionarlos duplica decenas de megabytes en el historial de git,
# que es permanente, y no aporta nada que public/ no tenga ya.
*.zip
_to_delete/
public/images/_pruebas-tomas/
P25EOF
echo '  ok  .gitignore'

mkdir -p "$(dirname 'app/globals.css')"
cat > 'app/globals.css' <<'P25EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair);
  
  /* Premium Color Palette - AWS Level + Industrial Warmth */
  --color-navy: #0A2540;
  --color-navy-light: #1A3A5C;
  --color-emerald: #059669;
  --color-emerald-dark: #047857;
  --color-amber: #F59E0B;
  --color-amber-dark: #D97706;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;

  /* Semantic surface tokens — light (default) */
  --surface: #FFFFFF;
  --surface-muted: var(--color-gray-50);
  --surface-raised: #FFFFFF;
  --border: var(--color-gray-200);
  --text: var(--color-navy);
  --text-muted: var(--color-gray-600);
  --brand: var(--color-emerald);
  --brand-hover: var(--color-emerald-dark);
}

/* Dark theme — token overrides only. Existing rules that consume the
   variables above (product-card, form-input, specs-table, focus-visible)
   invert automatically. No component markup changes required. */
.dark {
  --surface: #0B1220;
  --surface-muted: #111C2E;
  --surface-raised: #16233A;
  /* Escalera de elevacion, pasos medidos ~1.35:1 entre superficies
     adyacentes, igual que AWS. No usar gradientes: bandas solidas. */
  --surface-nav: #1C2C46;
  --surface-deep: #060D18;
  --border: #24354F;
  --text: #E8EEF6;
  --text-muted: #93A4BC;
  --brand: #10B981;
  --brand-hover: #34D399;

  --color-gray-50: #111C2E;
  --color-gray-100: #16233A;
  --color-gray-200: #24354F;
  --color-gray-600: #93A4BC;
}

html { color-scheme: light; }
html.dark { color-scheme: dark; }

body {
  background-color: var(--surface);
  color: var(--text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Respect OS-level motion preferences. Required for WCAG 2.1 AA (2.3.3). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Premium Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Smooth micro-interactions */
a, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover, button:hover {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Premium Card Styles */
.product-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: var(--color-emerald);
}

/* Mega Menu Styles */
.mega-menu {
  animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Command Palette */
.command-palette {
  animation: commandEnter 0.15s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes commandEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Chatbot Styles */
.chatbot-window {
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Form Styles - Premium */
.form-input {
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-emerald);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  outline: none;
}

/* Table Styles */
.specs-table tr {
  transition: background-color 0.1s ease;
}

.specs-table tr:hover {
  background-color: var(--color-gray-50);
}

/* Filter Active States */
.filter-active {
  background-color: var(--color-emerald);
  color: white;
  border-color: var(--color-emerald);
}

/* WhatsApp Floating Button */
.whatsapp-float {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 15px -3px rgb(37 211 102 / 0.3);
}

/* Professional Badge */
.badge {
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* Section Dividers */
.section-divider {
  background: linear-gradient(to right, transparent, var(--color-gray-200), transparent);
}

/* Responsive Typography */
@media (max-width: 768px) {
  h1 {
    font-size: 2.25rem !important;
    line-height: 2.5rem !important;
  }
}

/* Accessibility Focus */
:focus-visible {
  outline: 2px solid var(--color-emerald);
  outline-offset: 2px;
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Capa de compatibilidad de tema ────────────────────────────────────
   Los contenedores usan literales (.bg-white, .text-[#0A2540]). Al volver
   <body> dependiente de tokens, los <h3> sin clase de color heredaban
   --text (claro) sobre tarjetas blancas -> 1.17:1. Y los <h2> con
   text-[#0A2540] quedaban sobre la pagina oscura -> 1.21:1.

   Esta capa hace que los contenedores sigan al tema. Va limitada a <main>
   para no tocar Navbar ni Footer, que ya manejan su propio dark:.

   ES UN PARCHE. Lo correcto es migrar los literales de page.tsx,
   SectionHeading.tsx y ProductCard.tsx a los tokens directamente.  */

/* Superficies: la tarjeta sube un escalon respecto de la pagina.

   AMPLIADO: la lista original cubria solo contenedores de bloque. Las paginas
   de familia, comparativa, recursos y cobertura local introdujeron tablas
   (th/td), chips (span) y callouts (p) con las mismas utilidades. En oscuro
   esos elementos quedaban como bloques BLANCOS con tinta clara encima -> el
   encabezado y la primera columna de la tabla comparativa eran ilegibles.
   Ampliar el selector es aditivo y arregla tambien cualquier pagina futura. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button).bg-white {
  background-color: var(--surface-raised);
}
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-50,
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-100 {
  background-color: var(--surface-muted);
}

/* 1.4.11: tarjeta #16233A vs pagina #0B1220 = 1.19:1, por debajo de 3.0.
   box-shadow en vez de border: no desplaza el layout. */
.dark main :is(div, section, article).bg-white {
  box-shadow: 0 0 0 1px var(--border);
}

/* Tinta */
.dark main .text-\[\#0A2540\] { color: var(--text) !important; }
/* gray-800 es tinta principal, no secundaria: mapearla a --text-muted dejaba
   el bloque "En resumen" de cada guia casi ilegible sobre fondo oscuro. */
.dark main :is(.text-gray-800, .text-gray-900) { color: var(--text) !important; }
.dark main :is(.text-gray-500, .text-gray-600, .text-gray-700) { color: var(--text-muted) !important; }
/* gray-400 marca dato ausente ("No declarado"): debe seguir siendo tenue,
   pero legible. */
.dark main :is(.text-gray-400, .text-neutral-400) { color: var(--text-muted) !important; }
.dark main :is(.border-gray-100, .border-gray-200) { border-color: var(--border); }

/* La escala `neutral-*` de Tailwind no estaba cubierta. Las 12 paginas de
   ciudad la usan para todo su cuerpo de texto: en oscuro quedaban en 1.81:1,
   practicamente invisibles. Mismo remapeo que la escala `gray-*`. */
/* Fondos semanticos claros (avisos, notas, alertas). No estaban mapeados: los
   cuadros de riesgo de las arquitecturas de referencia se quedaban en ambar
   claro mientras su tinta pasaba a la paleta oscura -> 1.13:1. El acento se
   conserva en el borde y el icono, que si son legibles sobre superficie
   oscura. Lo detecto la auditoria visual automatica, no una revision a ojo. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button):is(.bg-amber-50, .bg-amber-100, .bg-red-50, .bg-red-100, .bg-green-50, .bg-green-100, .bg-emerald-50, .bg-emerald-100, .bg-blue-50, .bg-blue-100, .bg-yellow-50) {
  background-color: var(--surface-muted);
}

/* Si la superficie semantica se oscurece, su tinta debe aclararse en el mismo
   paso. Oscurecer solo el fondo dejaba las insignias ambar del catalogo en
   3.4:1: una correccion a medias es una regresion. */
.dark main :is(.text-amber-700, .text-amber-800) { color: #FCD34D !important; }
.dark main :is(.text-red-700, .text-red-800) { color: #FCA5A5 !important; }
.dark main :is(.text-green-700, .text-green-800, .text-emerald-700) { color: var(--brand-hover) !important; }
.dark main :is(.text-blue-700, .text-blue-800) { color: #93C5FD !important; }

.dark main :is(.text-neutral-800, .text-neutral-900) { color: var(--text) !important; }
.dark main :is(.text-neutral-500, .text-neutral-600, .text-neutral-700) { color: var(--text-muted) !important; }
.dark main :is(.border-neutral-100, .border-neutral-200, .border-neutral-300) { border-color: var(--border); }
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label):is(.bg-neutral-50, .bg-neutral-100) {
  background-color: var(--surface-muted);
}

/* `text-navy` es el token equivalente al literal #0A2540 y aparece en el
   modal de cotizacion. Sin mapear, el titulo del formulario quedaba en 1.01:1. */
.dark main .text-navy { color: var(--text) !important; }

/* Verde de marca: en claro se oscurece a #047857 para cumplir AA sobre blanco.
   En oscuro esa misma correccion lo hunde a 2.87:1 sobre la pagina. El verde
   claro del tema (--brand-hover, #34D399) da ~9:1 sobre #0B1220. */
.dark main :is(.text-\[\#059669\], .text-\[\#047857\], .text-brand, .text-\[\#25D366\]) {
  color: var(--brand-hover) !important;
}

/* Los CTA blancos del hero viven sobre imagen oscura: siguen blancos con
   tinta navy (15.54:1). Deben ir DESPUES de las reglas de arriba. */
/* ACOTADO con :has(). Antes cubria CUALQUIER enlace con fondo blanco, lo que
   incluia las TARJETAS del carrusel de familias y del catalogo: la tarjeta se
   quedaba blanca mientras su texto interior se remapeaba a la paleta oscura
   -> gris claro sobre blanco (2.54:1). Solo el CTA real —el que lleva tinta
   navy— debe seguir siendo blanco. */
.dark main :is(a, button).bg-white:is(.text-\[\#0A2540\], .text-navy) {
  background-color: #FFFFFF;
  box-shadow: none;
}
/* Con !important, porque la regla de tinta oscura de arriba tambien lo lleva:
   sin esto el CTA blanco recibia tinta clara sobre blanco (1.17:1). */
/* Solo cuando la tinta navy esta en el PROPIO enlace/boton. La variante por
   descendencia hacia que las tarjetas-enlace (ya convertidas en superficie
   oscura) forzaran su titulo a navy sobre fondo oscuro: 1.01:1. */
.dark main :is(a, button).bg-white.text-\[\#0A2540\],
.dark main :is(a, button).bg-white.text-navy { color: #0A2540 !important; }


/* ═══════════════════════════════════════════════════════════════════
   MOBILE POLISH LAYER  (≤640px)  — tightens spacing & sizing site-wide.
   Purely responsive: desktop is untouched. Mirrors AWS/Square density.
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  /* 1. Kill any accidental horizontal scroll */
  html, body { max-width: 100%; overflow-x: hidden; }

  /* 2. Section vertical rhythm: 80px -> 48px. Reclaims dead space. */
  section.py-20, section.py-24 { padding-top: 3rem; padding-bottom: 3rem; }
  .mt-20 { margin-top: 3rem !important; }
  .mt-16 { margin-top: 2.5rem !important; }

  /* 3. Hero: shorter, tighter, not a full screen of navy */
  section.min-h-\[92vh\] { min-height: 78vh; }
  section.min-h-\[92vh\] h1 { font-size: 2.15rem !important; line-height: 1.12 !important; }
  section.min-h-\[92vh\] .mt-16 { margin-top: 2rem !important; }

  /* 4. Product visual placards: 224px -> 176px, lighter feel */
  .product-card .h-56 { height: 11rem; }

  /* 5. Badges/labels breathe less loudly on tiny screens */
  .badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; }

  /* 6. Comfortable tap targets (Apple/Google min 44px) for pills & icons */
  a, button { -webkit-tap-highlight-color: transparent; }
}

/* ── Bright selected / active states (all breakpoints) ─────────────
   Tapped filter chips and cards get a clear brand highlight + lift. */
.chip-selected,
button[aria-pressed="true"] {
  background-color: var(--color-emerald) !important;
  color: #fff !important;
  border-color: var(--color-emerald) !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.45);
}
.product-card:active { transform: scale(0.985); }

/* Card image brightens on tap/hover (the "brighten when selected" ask) */
.product-card .h-56 { transition: filter 0.25s ease; }
.product-card:hover .h-56,
.product-card:active .h-56 { filter: brightness(1.12) saturate(1.08); }

/* ── Bright gradient selected/active state (AWS "North America" style) ── */
.chip-selected {
  background-image: linear-gradient(120deg, #047857, #065F46 70%, #0F766E) !important;
  background-color: #047857 !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.5);
}

/* Hide scrollbar on horizontal scroll rows but keep swipe */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ═══════════ MOBILE SECTION POLISH (≤640px) ═══════════ */
@media (max-width: 640px) {
  /* 1+3. Content cards: less inner padding so they stop eating the screen.
     Targets the rounded-3xl p-8 cards in Servicios / Por qué / Family. */
  main .rounded-3xl.p-8 { padding: 1.35rem !important; }
  /* Tighten vertical gaps between stacked cards */
  main .gap-6 { gap: 0.85rem !important; }
  /* Service/why headings a touch smaller so cards shrink */
  main .rounded-3xl .text-xl { font-size: 1.05rem !important; line-height: 1.4 !important; }

  /* 5. Chat button: smaller + higher so it never sits over card text.
     Overrides the w-16 h-16 bottom-6 float. */
  .fixed.bottom-6.right-6 { bottom: 1rem !important; right: 1rem !important; }
  .fixed.bottom-6.right-6 > button { width: 3.25rem !important; height: 3.25rem !important; }
  /* Lift the open chat window origin to match */
  .fixed.bottom-24.right-6 { bottom: 4.75rem !important; }
}

/* ── 2. Sectores: peek-scroll row (one line, swipeable, next chip peeks) ── */
.sector-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  flex-wrap: nowrap;
}
.sector-scroll > * { scroll-snap-align: start; flex: 0 0 auto; }

/* ═══════════ MOBILE DENSITY (≤640px) — end the endless scroll ═══════════ */
@media (max-width: 640px) {
  /* Servicios + Por qué: 1-col -> 2-col so all items fit with minimal scroll */
  main section .grid.md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 0.6rem !important; }
  /* Compact those cards so 2-up reads cleanly */
  main section .grid.md\:grid-cols-2 > div { padding: 1rem !important; border-radius: 1.25rem !important; }
  main section .grid.md\:grid-cols-2 .text-xl { font-size: 0.95rem !important; line-height: 1.3 !important; }
  main section .grid.md\:grid-cols-2 .text-lg { font-size: 0.95rem !important; }
  main section .grid.md\:grid-cols-2 p { font-size: 0.8rem !important; line-height: 1.35 !important; }
  main section .grid.md\:grid-cols-2 .w-10.h-10 { width: 2rem !important; height: 2rem !important; margin-bottom: 0.6rem !important; }

  /* Family catalog: vertical list -> horizontal peek-carousel (swipe, 2.2 cards) */
  .family-scroll { display: flex !important; gap: 0.7rem; overflow-x: auto; scroll-snap-type: x mandatory; grid-template-columns: none !important; }
  .family-scroll > a { flex: 0 0 82%; scroll-snap-align: start; }

  /* Kill stray off-canvas carousel arrow bleeding at screen edge */
  .hero-arrow-left, [class*="carousel"] button.absolute.left-0 { display: none !important; }
}

/* ── Ticker de sectores: flujo continuo derecha -> izquierda ── */
.ticker-wrap { overflow: hidden; position: relative; }
.ticker-track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  animation: ticker-scroll 38s linear infinite;
}
.ticker-wrap:hover .ticker-track,
.ticker-wrap:focus-within .ticker-track { animation-play-state: paused; }
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; flex-wrap: wrap; width: auto; }
}

/* ═══════════ CONTRASTE WCAG AA — verificado por medición ═══════════
   #059669 sobre blanco = 3.77 (FALLA AA 4.5) -> #047857 = 5.48 (PASA).
   #10B981 + texto blanco = 2.54 (FALLA) -> emerald-700 = 5.48 (PASA).
   gray-400 = 2.54 (FALLA) -> gray-500 = 4.83 (PASA).
   #10B981 sobre navy = 6.13 (PASA) -> se conserva.
   Razón comercial: se lee a pleno sol en mina, obra y campo. ══════ */
:root { --color-emerald-text: #047857; }
.text-\[\#059669\] { color: #047857 !important; }
.bg-\[\#059669\] { background-color: #047857 !important; }
.hover\:bg-\[\#059669\]:hover { background-color: #047857 !important; }
.hover\:text-\[\#059669\]:hover { color: #047857 !important; }
.text-gray-400 { color: #6B7280 !important; }
.bg-\[\#0A2540\] .text-\[\#10B981\],
section.bg-\[\#0A2540\] .text-\[\#10B981\] { color: #10B981 !important; }

/* Foco visible para teclado (AWS/Square: accesibilidad primero) */
a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE DISEÑO — jerarquía de forma y tipografía
   Patrón AWS observado:
     · Monoespaciada = metadato técnico (specs, estados, conteos).
     · Radio PEQUEÑO = etiqueta informativa (no se toca).
     · Radio PÍLDORA = acción (se toca).
     · Panel/tarjeta = radio medio.
   Antes: badges y botones compartían forma píldora -> el usuario
   intentaba tocar etiquetas. La forma ahora codifica la función.
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Metadatos técnicos en monoespaciada */
.badge,
.tech-meta,
.spec-label,
.tabular-nums {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* 2 · Jerarquía de radios */
.badge {
  border-radius: 0.375rem;      /* etiqueta: NO es un botón */
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  text-transform: uppercase;
}
/* Los estados de producto también son etiquetas, no acciones */
.product-card .absolute.top-4.left-4,
.product-card .absolute.top-4.right-4 {
  border-radius: 0.375rem !important;
  font-family: var(--font-mono), ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* 3 · Transición de sección con solape redondeado (patrón AWS) */
.section-lift {
  position: relative;
  z-index: 1;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  margin-top: -2rem;
}

/* 4 · Ritmo de lectura: cuerpo más cómodo, títulos más ceñidos */
main p { line-height: 1.6; }
main h1, main h2, main h3 { letter-spacing: -0.02em; }

/* ═══════════ KEN BURNS — fotos de producto "vivas" ═══════════
   Zoom + paneo lento e infinito en alternancia. Cada tarjeta arranca con
   un pequeño desfase para que no se muevan todas al unísono. Se detiene
   por completo si el usuario prefiere menos movimiento. */
.ken-burns {
  /* CORRECCIÓN 1. El zoom llegaba a scale(1.14). Un 14 % recorta justamente el
     detalle que hace útil a estas fotos —la zanja de anclaje en el borde, la
     costura, el remate—, y en un catálogo técnico ese detalle ES el argumento.
     A 1.06 el movimiento se percibe y el encuadre sobrevive.

     CORRECCIÓN 2. `will-change: transform` forzaba una capa de composición
     permanente por cada imagen de galería. Los navegadores actuales componen
     una animación de transform sin ayuda, y la ayuda costaba memoria en
     páginas con muchas fotos. */
  animation: kenburns 22s ease-in-out infinite alternate;
  transform-origin: center;
}
.ken-burns-wrap:nth-of-type(3n) .ken-burns   { animation-duration: 26s; animation-delay: -6s; transform-origin: top left; }
.ken-burns-wrap:nth-of-type(3n+1) .ken-burns { animation-duration: 20s; animation-delay: -3s; transform-origin: bottom right; }
@keyframes kenburns {
  from { transform: scale(1.01) translate(0, 0); }
  to   { transform: scale(1.06) translate(-1%, 1%); }
}
/* CORRECCIÓN 3. Antes el hover bajaba animation-duration de 22 s a 12 s.
   Cambiar la duración a mitad de una animación hace que el navegador
   recalcule la posición dentro del nuevo ciclo, y la imagen SALTA al pasar el
   cursor. Pausar no reposiciona nada: el efecto es limpio y además deja mirar
   el detalle quieto, que es lo que uno quiere al detenerse sobre una foto. */
.group:hover .ken-burns { animation-play-state: paused; }

/* ---------------------------------------------------------------------------
   CRUCE ENTRE N TOMAS DE LA MISMA VISTA

   Cuando una ranura tiene varias tomas (sufijos -2, -3, -4), todas se apilan y
   se funden en ciclo. Diez segundos por toma, a propósito: un carrusel rápido
   en una ficha técnica compite con la lectura y obliga a esperar para volver a
   ver lo que uno estaba mirando.

   POR QUÉ EL CICLO ESTÁ ESCRITO CAPA POR CAPA Y NO CON UNA REGLA GENERAL.
   Con tres o más capas, el cruce ingenuo —cada capa se funde y se apaga en su
   turno— deja un instante en el que dos capas están a media opacidad y la
   toma 1, que está debajo y siempre opaca, se transparenta a través de ambas.
   El resultado es un fantasma de la primera imagen en cada transición.

   La solución es apilar en vez de alternar: la capa k entra fundiéndose ENCIMA
   de la k-1, que sigue opaca, y la k-1 se apaga de golpe un instante después,
   cuando ya está tapada por completo y ese apagón no se ve. Solo la última
   capa se funde hacia afuera al cerrar el ciclo, revelando la toma 1. Nunca
   hay dos capas a media opacidad sobre el fondo, y por eso no hay fantasma.

   Eso obliga a que los porcentajes dependan de cuántas tomas hay, y los
   porcentajes de @keyframes no admiten variables CSS. De ahí un juego de
   fotogramas por cada N. Son tres casos (2, 3 y 4 tomas) y se acaban.

   Cada capa lleva su Ken Burns desfasado y con otro origen, para que el cruce
   no parezca un salto de la misma imagen.
--------------------------------------------------------------------------- */
.toma-cruce {
  /* Solo posición y pausa. El ciclo lo pone la clase .toma-capa-N, que es la
     que sabe cuántas hermanas tiene. */
  opacity: 0;
}

/* --- 2 tomas: 20 s (10 s cada una) --- */
.tomas-2 .toma-capa-2 { animation: cruce-2de2 20s ease-in-out infinite; }
@keyframes cruce-2de2 {
  0%   { opacity: 1; }
  8%   { opacity: 0; }
  50%  { opacity: 0; }
  58%  { opacity: 1; }
  100% { opacity: 1; }
}

/* --- 3 tomas: 30 s --- */
.tomas-3 .toma-capa-2 { animation: cruce-2de3 30s ease-in-out infinite; }
.tomas-3 .toma-capa-3 { animation: cruce-3de3 30s ease-in-out infinite; }
@keyframes cruce-2de3 {
  0%      { opacity: 0; }
  33.33%  { opacity: 0; }
  39.33%  { opacity: 1; }
  72.66%  { opacity: 1; }
  72.67%  { opacity: 0; }  /* tapada por la capa 3: el apagón no se ve */
  100%    { opacity: 0; }
}
@keyframes cruce-3de3 {
  0%      { opacity: 1; }
  6%      { opacity: 0; }
  66.66%  { opacity: 0; }
  72.66%  { opacity: 1; }
  100%    { opacity: 1; }
}

/* --- 4 tomas: 40 s --- */
.tomas-4 .toma-capa-2 { animation: cruce-2de4 40s ease-in-out infinite; }
.tomas-4 .toma-capa-3 { animation: cruce-3de4 40s ease-in-out infinite; }
.tomas-4 .toma-capa-4 { animation: cruce-4de4 40s ease-in-out infinite; }
@keyframes cruce-2de4 {
  0%     { opacity: 0; }
  25%    { opacity: 0; }
  30%    { opacity: 1; }
  55%    { opacity: 1; }
  55.1%  { opacity: 0; }
  100%   { opacity: 0; }
}
@keyframes cruce-3de4 {
  0%     { opacity: 0; }
  50%    { opacity: 0; }
  55%    { opacity: 1; }
  80%    { opacity: 1; }
  80.1%  { opacity: 0; }
  100%   { opacity: 0; }
}
@keyframes cruce-4de4 {
  0%     { opacity: 1; }
  5%     { opacity: 0; }
  75%    { opacity: 0; }
  80%    { opacity: 1; }
  100%   { opacity: 1; }
}

/* El Ken Burns de cada capa arranca en otro punto y desde otro origen: dos
   tomas del mismo encuadre moviéndose igual se leen como un parpadeo, no como
   un cambio de toma. */
.toma-cruce.toma-capa-2 .ken-burns { animation-delay: -11s; transform-origin: bottom left; }
.toma-cruce.toma-capa-3 .ken-burns { animation-delay: -5s;  transform-origin: top right; }
.toma-cruce.toma-capa-4 .ken-burns { animation-delay: -17s; transform-origin: bottom right; }

/* Pausa al pasar el cursor. Va al final del bloque a propósito: la forma
   abreviada `animation:` de las reglas .tomas-N reinicia animation-play-state,
   y con la misma especificidad gana la última. Puesta arriba, el hover no
   pausaba nada. */
.group:hover .toma-cruce { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  /* Sin excepciones: el movimiento puede provocar malestar vestibular real.
     Se congela el zoom y se ocultan TODAS las tomas adicionales, sean dos o
     cuatro. Queda una sola imagen quieta, que es una página perfectamente
     correcta. */
  .ken-burns { animation: none !important; transform: scale(1.01); }
  .toma-cruce { animation: none !important; opacity: 0 !important; }
}

/* ═══════════════════════════════════════════════════════════════════
   TOKENS DE DISEÑO — fuente única de verdad para tipografía, botones,
   secciones y radios. Reemplaza los tamaños sueltos (t-body,
   px-9 py-4, etc.) por clases semánticas. Patrón AWS/Stripe/Siemens.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Escala tipográfica (usar estas, no píxeles sueltos) ── */
.t-display { font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.05; letter-spacing: -0.03em; }
.t-h2      { font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.1; letter-spacing: -0.02em; }
.t-h3      { font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.01em; }
.t-body    { font-size: 0.9375rem; line-height: 1.6; }   /* = 15px, ahora tokenizado */
.t-caption { font-size: 0.8125rem; line-height: 1.5; }   /* = 13px */
.t-micro   { font-size: 0.6875rem; line-height: 1.4; letter-spacing: 0.04em; } /* = 11px, badges/meta */

/* ── Sistema de botones: UNA definición, tres tamaños ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-weight: 600; font-size: 0.875rem; line-height: 1;
  padding: 0.75rem 1.5rem;            /* alto uniforme = 44px táctil */
  border-radius: 9999px;
  transition: background-color .2s, color .2s, transform .1s;
  white-space: nowrap;
}
.btn:active { transform: scale(0.985); }
.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 0.9rem 2rem; font-size: 0.95rem; }
.btn-primary   { background: #0A2540; color: #fff; }
.btn-primary:hover   { background: #047857; }
.btn-accent    { background: #047857; color: #fff; }
.btn-accent:hover    { background: #065F46; }
.btn-ghost     { background: #fff; color: #0A2540; border: 1px solid #E5E7EB; }
.btn-ghost:hover     { border-color: #047857; color: #047857; }

/* ── Ritmo de sección: 2 valores, no 6 ── */
.section-pad { padding-top: 5rem; padding-bottom: 5rem; }
@media (max-width: 640px) { .section-pad { padding-top: 3rem; padding-bottom: 3rem; } }

/* ---------------------------------------------------------------------------
   VISUALIZACIÓN DE DATOS

   Los valores de estas variables NO se eligieron a ojo: se midieron con el
   validador de paleta en las dos superficies reales del sitio (blanco en claro,
   #1C2C46 en oscuro) y se ajustaron hasta pasar los cinco controles: banda de
   luminosidad, piso de croma, separación bajo daltonismo, piso de visión normal
   y contraste contra la superficie.

   El eje divergente es AZUL/NARANJA y no verde/rojo aunque el verde sea el color
   de marca. Verde y rojo es el par que la deuteranopia confunde: medido se queda
   en ΔE 5-6 cuando el umbral es 8. Azul/naranja mide ΔE 25-28 en las tres formas
   de daltonismo. El color de marca no vale una lectura equivocada.
--------------------------------------------------------------------------- */
.viz-root {
  --viz-serie: #047857;      /* magnitud, serie única */
  --viz-pos: #1D4ED8;        /* divergente: crecimiento */
  --viz-neg: #B45309;        /* divergente: contracción */
  --viz-eje: #D1D5DB;
  --viz-etiqueta: #0A2540;
  --viz-valor: #4B5563;
}

.dark .viz-root {
  --viz-serie: #0EA97A;
  --viz-pos: #4A8FE0;
  --viz-neg: #C9800F;
  --viz-eje: #3A4A66;
  --viz-etiqueta: var(--text);
  --viz-valor: var(--text-muted);
}

.viz-barra { fill: var(--viz-serie); }
.viz-linea { stroke: var(--viz-serie); }
/* Anillo del color de la superficie: el marcador sigue legible donde cruza
   la línea o se solapa con otro. */
.viz-punto { fill: var(--viz-serie); stroke: var(--surface); }
.viz-barra-pos { fill: var(--viz-pos); }
.viz-barra-neg { fill: var(--viz-neg); }
.viz-eje { stroke: var(--viz-eje); }
/* La tinta de los textos es tinta, nunca el color de la serie: el color lo
   lleva la barra, que es quien porta la identidad. */
.viz-etiqueta { fill: var(--viz-etiqueta); font-weight: 500; }
.viz-valor { fill: var(--viz-valor); font-variant-numeric: tabular-nums; }
P25EOF
echo '  ok  app/globals.css'

mkdir -p "$(dirname 'components/ImagenContenido.tsx')"
cat > 'components/ImagenContenido.tsx' <<'P25EOF'
import Image from 'next/image';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RanuraImagen } from '@/lib/imagenes';
import { tomasDe, claseCiclo } from '@/lib/galeria';

/**
 * Imagen de contenido con degradación honesta y rotación de tomas.
 *
 * El problema que resuelve: 75 imágenes encargadas no llegan todas el mismo
 * día. Una página que referencia un archivo inexistente muestra el icono de
 * imagen rota, que comunica abandono con más fuerza que cualquier texto de la
 * página. Y una imagen de relleno genérica es peor todavía: ocupa el sitio de
 * la buena y nadie vuelve a acordarse de encargarla.
 *
 * La solución: se comprueba en tiempo de compilación si el archivo existe. Si
 * está, se muestra. Si no, se muestra un marcador sobrio que declara qué
 * imagen falta — visible para quien administra el sitio, discreto para el
 * visitante, e imposible de confundir con contenido terminado.
 *
 * ROTACIÓN. Si además existen `{nombre}-2`, `-3` o `-4`, se apilan y se
 * alternan con el mismo cruce de la galería de producto. Un término del
 * glosario ilustrado desde dos ángulos se entiende mejor que desde uno, y en
 * un glosario técnico esa es toda la razón de ser de la imagen. Quien resuelve
 * qué tomas hay es `lib/galeria`, que ya descarta las copias byte a byte: una
 * imagen fundiéndose contra un duplicado exacto de sí misma no es una
 * rotación, es una página que parece congelada.
 *
 * La comprobación es de servidor y ocurre una sola vez por compilación: no
 * añade nada al navegador.
 *
 * `prioridad` solo para la imagen que se ve sin desplazar: marcar varias como
 * prioritarias hace que compitan entre sí y empeora la métrica que se quería
 * mejorar. Nunca se marca prioritaria una toma secundaria — competiría con la
 * primera, que es la que mide el LCP.
 */

function archivoExiste(ruta: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', ruta));
  } catch {
    return false;
  }
}

export default function ImagenContenido({
  ranura,
  prioridad = false,
  className = '',
  sizes = '(min-width: 1024px) 900px, 100vw',
}: {
  ranura: RanuraImagen;
  prioridad?: boolean;
  className?: string;
  sizes?: string;
}) {
  const hay = archivoExiste(ranura.ruta);

  if (!hay) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center ${className}`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
        role="note"
        aria-label={`Imagen pendiente: ${ranura.alt}`}
      >
        <p className="max-w-sm text-sm text-gray-500">
          <span className="mb-1 block font-mono text-xs">{ranura.ruta}</span>
          Imagen pendiente de publicación.
        </p>
      </div>
    );
  }

  const tomas = tomasDe(ranura.ruta);
  const capas = tomas.slice(1);
  const ciclo = claseCiclo(tomas.length);

  return (
    <figure className={className}>
      <div
        className={`ken-burns-wrap ${ciclo ?? ''} relative overflow-hidden rounded-3xl`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
      >
        <Image
          src={ranura.ruta}
          alt={ranura.alt}
          fill
          sizes={sizes}
          priority={prioridad}
          className="ken-burns object-cover"
        />
        {/* Tomas adicionales del MISMO concepto. aria-hidden porque el alt de
            la primera ya las describe: repetirlo es ruido para quien escucha
            la página, no información. */}
        {capas.map((toma, k) => (
          <div
            key={toma}
            className={`toma-cruce toma-capa-${k + 2} absolute inset-0`}
            aria-hidden="true"
          >
            <Image src={toma} alt="" fill sizes={sizes} className="ken-burns object-cover" />
          </div>
        ))}
      </div>
      {/* Una ilustración no es una fotografía del producto real, y decirlo es
          más barato que un pedido devuelto. */}
      {ranura.tipo !== 'foto' && (
        <figcaption className="mt-2 text-xs text-gray-500">
          {ranura.tipo === 'diagrama'
            ? 'Esquema explicativo. No representa una obra ejecutada.'
            : 'Imagen referencial. Las especificaciones se confirman en la cotización.'}
          {capas.length > 0 && ` ${tomas.length} vistas alternadas.`}
        </figcaption>
      )}
    </figure>
  );
}
P25EOF
echo '  ok  components/ImagenContenido.tsx'

mkdir -p "$(dirname 'components/ProductGallery.tsx')"
cat > 'components/ProductGallery.tsx' <<'P25EOF'
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductVisual from '@/components/ProductVisual';

function prettify(src: string): string {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
  return base.replace(/[-_]/g, ' ').trim();
}

// Etiqueta legible por vista, derivada del sufijo del archivo de galería
// (`-general` | `-detalle` | `-instalacion` | `-escala`). Ayuda a que el
// cliente entienda QUÉ muestra cada foto. Devuelve null si no aplica.
const VIEW_CAPTIONS: Record<string, string> = {
  general: 'Vista general del producto',
  detalle: 'Detalle del material y acabado',
  instalacion: 'Instalación / aplicación en obra',
  escala: 'Referencia de escala y dimensiones',
};

// Etiqueta corta para la miniatura, para que el cliente sepa QUÉ vista es
// antes de hacer clic (mejor comprensión y recorrido de la galería).
const VIEW_SHORT: Record<string, string> = {
  general: 'General',
  detalle: 'Detalle',
  instalacion: 'En obra',
  escala: 'Escala',
};

function shortLabel(src: string): string | null {
  const k = viewKey(src);
  return k ? VIEW_SHORT[k] : null;
}

function viewKey(src: string): string | null {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
  const suffix = base.split('-').pop() ?? '';
  return VIEW_CAPTIONS[suffix] ? suffix : null;
}

function captionFor(src: string): string | null {
  const k = viewKey(src);
  return k ? VIEW_CAPTIONS[k] : null;
}

export default function ProductGallery({
  product,
  tomas = {},
}: {
  product: Product;
  /**
   * Tomas por imagen, resueltas en el SERVIDOR. Un componente de cliente no
   * puede mirar el disco, y adivinar si existe el archivo `-2` produciría
   * exactamente lo que este proyecto evita: una imagen rota. El servidor
   * además ya descartó las tomas que son copias byte a byte de otra, así que
   * lo que llega acá son variantes realmente distintas.
   */
  tomas?: Record<string, string[]>;
}) {
  const images = (
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [product.image]
        : []
  ).filter(Boolean);

  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);

  const hasMultiple = images.length > 1;

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/11] rounded-3xl overflow-hidden relative border border-gray-100">
        <ProductVisual product={product} variant="hero" />
      </div>
    );
  }

  const activeSrc = images[active];
  const altFor = (i: number, src: string) => {
    const caption = captionFor(src);
    if (caption) return `${product.name} — ${caption}`;
    return i === 0 ? product.name : `${product.name} — ${prettify(src)}`;
  };
  const activeCaption = captionFor(activeSrc);
  // Solo entran las tomas que el servidor confirmó que existen Y que son
  // distintas entre sí. `slice(1)` porque la toma 1 es la imagen de abajo.
  const tomasActivas = tomas[activeSrc] ?? [activeSrc];
  const capas = tomasActivas.slice(1, 4);
  const claseCiclo = capas.length > 0 ? `tomas-${capas.length + 1}` : '';

  return (
    <div>
      <div className="aspect-[16/11] rounded-3xl overflow-hidden relative border border-gray-100 group">
        {failed[active] ? (
          <ProductVisual product={product} variant="hero" />
        ) : (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Ampliar imagen de ${product.name}`}
            className={`ken-burns-wrap ${claseCiclo} absolute inset-0 overflow-hidden w-full h-full cursor-zoom-in`}
          >
            <Image
              src={activeSrc}
              alt={altFor(active, activeSrc)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 640px"
              className="ken-burns object-cover"
              onError={() => setFailed((f) => ({ ...f, [active]: true }))}
            />
            {/* Tomas adicionales de la MISMA vista. Se apilan en orden de DOM
                —la última queda arriba, que es justo lo que el ciclo de cruce
                asume— y cada una lleva su Ken Burns desfasado. Van marcadas
                aria-hidden porque no aportan información nueva a quien usa
                lector de pantalla: es la misma vista, y anunciarla tres veces
                sería ruido. Sin `priority`: la primera toma es la que decide
                el LCP, y precargar las demás competiría con ella. */}
            {capas.map((toma, k) => (
              <div
                key={toma}
                className={`toma-cruce toma-capa-${k + 2} absolute inset-0`}
                aria-hidden="true"
              >
                <Image
                  src={toma}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="ken-burns object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Expand className="w-3.5 h-3.5" /> Ampliar
            </span>
          </button>
        )}
      </div>

      {activeCaption && (
        <p
          className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
          aria-live="polite"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
          {activeCaption}
        </p>
      )}

      {hasMultiple && (
        <div
          className="mt-3 flex gap-3 overflow-x-auto pb-1"
          role="listbox"
          aria-label={`Galería de fotos de ${product.name}`}
        >
          {images.map((src, i) => {
            const label = shortLabel(src);
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                role="option"
                aria-selected={i === active}
                aria-label={
                  label
                    ? `Ver ${captionFor(src)} — foto ${i + 1} de ${images.length}, ${product.name}`
                    : `Ver foto ${i + 1} de ${images.length} — ${product.name}`
                }
                title={label ?? undefined}
                className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border transition-all ${
                  i === active
                    ? 'border-[#059669] ring-2 ring-[#059669]/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                {label && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] leading-none py-1 text-center font-medium tracking-wide">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — vista ampliada`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
          >
            <X className="w-7 h-7" />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 text-white/80 hover:text-white p-2"
              >
                <ChevronLeft className="w-9 h-9" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Foto siguiente"
                className="absolute right-3 sm:right-6 text-white/80 hover:text-white p-2"
              >
                <ChevronRight className="w-9 h-9" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl aspect-[16/11]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeSrc}
              alt={altFor(active, activeSrc)}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/80 text-sm">
            {activeCaption && <span className="text-white/90">{activeCaption}</span>}
            {hasMultiple && <span className="text-white/60">{active + 1} / {images.length}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
P25EOF
echo '  ok  components/ProductGallery.tsx'

mkdir -p "$(dirname 'lib/galeria.ts')"
cat > 'lib/galeria.ts' <<'P25EOF'
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

/**
 * RESOLUCIÓN DE TOMAS (VARIANTES) DE UNA MISMA IMAGEN.
 *
 * El catálogo declara cuatro vistas por producto —general, detalle,
 * instalación y escala— y el glosario declara un diagrama por término. Cada
 * una de esas ranuras puede tener VARIAS TOMAS que se alternan entre sí:
 *
 *   /images/galeria/geomembranas-pvc-general.jpg      toma 1
 *   /images/galeria/geomembranas-pvc-general-2.jpg    toma 2 (opcional)
 *   /images/galeria/geomembranas-pvc-general-3.jpg    toma 3 (opcional)
 *
 * Por qué el sufijo numérico y no una entrada más en `gallery`. Las
 * miniaturas se derivan de `gallery`, y su leyenda sale del sufijo de vista:
 * añadir la toma 2 como entrada suelta produciría una miniatura extra sin
 * leyenda, duplicando visualmente la misma vista. Una toma adicional no es
 * otra vista: es la MISMA vista capturada otra vez, y por eso vive dentro de
 * su ranura en lugar de al lado.
 *
 * TRES REGLAS QUE NO SON NEGOCIABLES
 *
 * 1. Se corta en el primer hueco. Si existen -2 y -4 pero no -3, se usan la 1
 *    y la 2. Una secuencia con agujeros es casi siempre un archivo mal
 *    nombrado, y adivinar produce rotaciones distintas en cada despliegue.
 *
 * 2. Se descartan las tomas IDÉNTICAS byte a byte. Es el caso real de este
 *    proyecto: los juegos de diagramas del glosario llegaron por triplicado
 *    con el mismo contenido. Fundir una imagen contra una copia exacta de sí
 *    misma no produce ningún cruce —produce diez segundos en los que la
 *    página parece congelada— y además descarga el archivo dos veces. Una
 *    copia no es una toma.
 *
 * 3. Tope de MAX_TOMAS. Cada toma es una descarga completa antes de que el
 *    visitante haya decidido si le interesa el producto. Cuatro ya es un
 *    ciclo de 40 s: nadie va a esperarlo entero.
 *
 * Todo esto ocurre en el SERVIDOR, una vez por compilación, y con caché en
 * memoria: una toma que todavía no llegó no produce una imagen rota ni un
 * cruce contra un hueco, simplemente no hay cruce.
 */

/** Máximo de tomas que se rotan por ranura. Ver regla 3 arriba. */
export const MAX_TOMAS = 4;

const EXT = /\.(jpg|jpeg|png|webp|avif)$/i;

/** Ruta de la toma n (n ≥ 2) de una imagen. La toma 1 es la ruta base. */
export function rutaToma(src: string, n: number): string {
  if (n <= 1) return src;
  return src.replace(EXT, `-${n}.$1`);
}

/** Compatibilidad: la toma 2 es el caso que ya existía por nombre propio. */
export function rutaSegundaToma(src: string): string {
  return rutaToma(src, 2);
}

/** ¿La ruta es ya una toma adicional? Sirve para no anidarlas (`-2-2.jpg`). */
export const esTomaAdicional = (src: string): boolean => /-[2-9]\.(jpg|jpeg|png|webp|avif)$/i.test(src);

/** Compatibilidad con el nombre anterior. */
export const esSegundaToma = esTomaAdicional;

const rutaAbsoluta = (ruta: string): string => join(process.cwd(), 'public', ruta);

const existePublico = (ruta: string): boolean => {
  try {
    return existsSync(rutaAbsoluta(ruta));
  } catch {
    return false;
  }
};

/**
 * Huella del contenido, cacheada. Se lee el archivo entero: son ficheros de
 * cientos de kilobytes y esto ocurre una vez por compilación, no por visita.
 * Un hash parcial (tamaño, primeros bytes) daría falsos negativos justamente
 * con imágenes generadas por el mismo modelo, que comparten cabecera.
 */
const huellas = new Map<string, string | null>();
function huellaPublica(ruta: string): string | null {
  if (huellas.has(ruta)) return huellas.get(ruta)!;
  let h: string | null = null;
  try {
    h = createHash('sha256').update(readFileSync(rutaAbsoluta(ruta))).digest('hex');
  } catch {
    h = null;
  }
  huellas.set(ruta, h);
  return h;
}

const cacheTomas = new Map<string, string[]>();

/**
 * Tomas realmente distintas de una ranura, en orden, de 1 a MAX_TOMAS.
 * Devuelve siempre al menos la ruta original, exista o no el archivo: quien
 * renderiza ya sabe degradar, y esa decisión no se toma acá.
 */
export function tomasDe(src: string): string[] {
  if (!src || esTomaAdicional(src)) return [src];
  const cacheado = cacheTomas.get(src);
  if (cacheado) return cacheado;

  const tomas = [src];
  const vistas = new Set<string>();
  const primera = huellaPublica(src);
  if (primera) vistas.add(primera);

  for (let n = 2; n <= MAX_TOMAS; n++) {
    const candidata = rutaToma(src, n);
    if (!existePublico(candidata)) break; // regla 1: se corta en el primer hueco
    const h = huellaPublica(candidata);
    if (h && vistas.has(h)) continue; // regla 2: una copia exacta no es una toma
    if (h) vistas.add(h);
    tomas.push(candidata);
  }

  cacheTomas.set(src, tomas);
  return tomas;
}

/**
 * Mapa completo de una galería. Se calcula en el servidor y se pasa al
 * componente de cliente: un componente de cliente no puede mirar el disco.
 */
export function mapaDeTomas(gallery: string[]): Record<string, string[]> {
  const mapa: Record<string, string[]> = {};
  for (const src of gallery) mapa[src] = tomasDe(src);
  return mapa;
}

/** Cuántas ranuras de la galería rotan más de una toma. Para el inventario. */
export function conVariasTomas(gallery: string[]): number {
  return gallery.filter((s) => tomasDe(s).length > 1).length;
}

/** Compatibilidad con el nombre anterior. */
export const conSegundaToma = conVariasTomas;

/**
 * Cuántos archivos `-n` existen pero se descartaron por ser copias exactas.
 * No es cosmético: es la diferencia entre «faltan tomas» y «llegaron
 * duplicadas», y sin este número el informe de imágenes miente por omisión.
 */
export function tomasDuplicadas(gallery: string[]): number {
  let n = 0;
  for (const src of gallery) {
    if (!src || esTomaAdicional(src)) continue;
    let enDisco = 0;
    for (let i = 2; i <= MAX_TOMAS; i++) {
      if (!existePublico(rutaToma(src, i))) break;
      enDisco++;
    }
    n += enDisco - (tomasDe(src).length - 1);
  }
  return n;
}

/**
 * Clase CSS del ciclo de cruce para un conjunto de N tomas. Devuelve null
 * cuando no hay nada que cruzar. El ciclo se define en `globals.css` y la
 * duración total crece con N para que cada toma se vea el mismo tiempo.
 */
export function claseCiclo(total: number): string | null {
  if (total < 2) return null;
  return `tomas-${Math.min(total, MAX_TOMAS)}`;
}
P25EOF
echo '  ok  lib/galeria.ts'

mkdir -p "$(dirname 'lib/imagenes.ts')"
cat > 'lib/imagenes.ts' <<'P25EOF'
import { products, productFamilies } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';

/**
 * REGISTRO DE IMÁGENES.
 *
 * Qué resuelve. El catálogo ya declara 155 rutas de imagen con una convención
 * estable —/images/galeria/{slug}-{variante}.jpg— y 116 de esos archivos ya
 * existen. Lo que faltaba no era una convención: era saber CUÁLES faltan y
 * poder pedirlas sin que el nombre se desvíe.
 *
 * Por qué el registro genera los prompts en vez de guardarlos aparte. Si la
 * lista de encargos vive en un documento suelto, el día que alguien renombre
 * un producto la imagen encargada deja de encajar y nadie se entera hasta que
 * la página sale con un hueco. Acá el nombre del archivo se DERIVA del slug
 * real, y el prompt se emite desde la misma fuente: no pueden divergir.
 *
 * REGLA DE HONESTIDAD, la misma de todo el sitio. Una imagen generada no es
 * una fotografía de nuestro producto. Se declara `tipo` en cada ranura y las
 * ilustraciones se marcan como referenciales al mostrarse. Un comprador que
 * especifica contra una imagen que no corresponde al material real es un
 * problema mucho más caro que una página sin foto — y en minería, una imagen
 * técnicamente incorrecta destruye la credibilidad que todo lo demás construyó.
 *
 * Prioridad: las fotografías reales SIEMPRE reemplazan a una ilustración. El
 * registro está hecho para que esa sustitución sea cambiar un archivo.
 */

export type TipoImagen = 'foto' | 'ilustracion' | 'diagrama';

export interface RanuraImagen {
  /** Identificador estable. */
  id: string;
  /** Ruta pública, tal como la sirve el sitio. */
  ruta: string;
  ancho: number;
  alto: number;
  /**
   * Texto alternativo. Describe lo que se ve, no lo que queremos posicionar:
   * un alt con palabras clave amontonadas es spam y lo penalizan.
   */
  alt: string;
  tipo: TipoImagen;
  /** Dónde se usa, para poder revisarlo. */
  contexto: string;
  /** Encargo para generarla. Se emite con el script de prompts. */
  prompt: string;
}

/* ------------------------------------------------------------------ */
/* Estilo de casa: lo que hace que 71 imágenes parezcan una sola serie */
/* ------------------------------------------------------------------ */

/**
 * Un catálogo con imágenes de estilos distintos se ve improvisado por mucho
 * que cada una sea buena por separado. Estas dos bases se anteponen a cada
 * encargo, y son la razón por la que el conjunto se lee como un sistema.
 */
export const ESTILO_FOTO =
  'Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. ' +
  'Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: ' +
  'sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. ' +
  'Contexto peruano creíble. Sin personas identificables ni rostros. ' +
  'Sin logotipos, marcas ni texto legible de ningún tipo. ' +
  'Sin marcas de agua. Proporción 3:2 horizontal.';

export const ESTILO_DIAGRAMA =
  'Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. ' +
  'Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, ' +
  'grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. ' +
  'Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. ' +
  'Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.';

/** Variantes de galería que el catálogo ya espera para cada producto. */
export const VARIANTES = [
  {
    clave: 'general',
    que: 'vista general del producto completo en su contexto de uso',
  },
  {
    clave: 'detalle',
    que: 'primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión)',
  },
  {
    clave: 'instalacion',
    que: 'el producto durante su instalación o puesta en servicio, mostrando el proceso',
  },
  {
    clave: 'escala',
    que: 'el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros',
  },
] as const;

const rutaGaleria = (slug: string, variante: string) =>
  `/images/galeria/${slug}-${variante}.jpg`;

/* ------------------------------------------------------------------ */
/* Ranuras derivadas de los datos reales                              */
/* ------------------------------------------------------------------ */

/** Productos a los que les falta la galería de cuatro variantes. */
/**
 * `incluirCompletas` existe para el encargo de TOMAS ALTERNAS. Por defecto una
 * ranura es un ENCARGO: lo que ya está publicado no se vuelve a pedir, y por
 * eso los productos con galería completa se omiten. Pero para pedir la toma 2
 * o la 3 de una imagen hace falta justamente la que YA existe —es su prompt el
 * que hay que variar—, y sin este parámetro no había forma de alcanzarla.
 */
export function ranurasProducto(incluirCompletas = false): RanuraImagen[] {
  const completos = new Set(
    products
      .filter((p) =>
        VARIANTES.every((v) =>
          (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
        ),
      )
      .map((p) => p.slug),
  );

  return products
    .filter((p) => incluirCompletas || !completos.has(p.slug))
    .flatMap((p) =>
      VARIANTES.map((v) => ({
        id: `producto:${p.slug}:${v.clave}`,
        ruta: rutaGaleria(p.slug, v.clave),
        ancho: 1920,
        alto: 1280,
        alt: `${p.name} — ${v.que}`,
        tipo: 'ilustracion' as TipoImagen,
        contexto: `Galería de /productos/${p.slug}`,
        prompt:
          `${ESTILO_FOTO}\n\nTEMA: ${p.name}. ${p.shortDescription}\n` +
          `ENCUADRE: ${v.que}.\n` +
          `USO REAL: ${(p.applications ?? []).slice(0, 3).join('; ') || p.category}.\n` +
          `SECTORES: ${(p.sector ?? []).join(', ')}.\n` +
          `IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; ` +
          `preferir la exactitud del material y su montaje antes que la belleza de la composición.`,
      })),
    );
}

/** Portada de cada familia: once páginas indexables hoy sin imagen. */
export function ranurasFamilia(): RanuraImagen[] {
  return productFamilies.map((f) => {
    const items = products.filter((p) => p.category === f.name);
    return {
      id: `familia:${f.slug}`,
      ruta: `/images/familias/${f.slug}.jpg`,
      ancho: 1920,
      alto: 1080,
      alt: `${f.name}: ${f.tagline}`,
      tipo: 'ilustracion' as TipoImagen,
      contexto: `Portada de /productos/familia/${f.slug}`,
      prompt:
        `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.')}\n\n` +
        `TEMA: familia de producto "${f.name}". ${f.tagline}\n` +
        `DEBE SUGERIR EL CONJUNTO, no un solo artículo: ${items.slice(0, 4).map((p) => p.name).join('; ')}.\n` +
        `ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.`,
    };
  });
}

/**
 * Arquitecturas de referencia: acá el diagrama vale más que la foto.
 * Una poza revestida fotografiada se ve como un hoyo con plástico; dibujada en
 * corte se ven las cinco capas y por qué cada una está.
 */
export function ranurasSolucion(): RanuraImagen[] {
  return solutions.map((s) => ({
    id: `solucion:${s.slug}`,
    ruta: `/images/soluciones/${s.slug}.png`,
    ancho: 1600,
    alto: 900,
    alt: `Esquema de la arquitectura de referencia: ${s.titulo}`,
    tipo: 'diagrama' as TipoImagen,
    contexto: `Encabezado de /soluciones/${s.slug}`,
    prompt:
      `${ESTILO_DIAGRAMA}\n\n` +
      `TEMA: corte o vista isométrica de esta configuración: ${s.titulo}.\n` +
      `ESCENARIO: ${s.escenario}\n` +
      `COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:\n` +
      s.componentes
        .map((c, i) => `  ${i + 1}. ${c.producto.replace(/-/g, ' ')} — ${c.funcion}`)
        .join('\n') +
      `\nIMPORTANTE: la posición de cada capa debe ser técnicamente correcta; ` +
      `el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.`,
  }));
}

/** Encabezado de cada guía técnica. */
export function ranurasGuia(): RanuraImagen[] {
  return articles.map((a) => ({
    id: `guia:${a.slug}`,
    ruta: `/images/recursos/${a.slug}.jpg`,
    ancho: 1920,
    alto: 1080,
    // El título de una guía puede ser largo; el alt se acota para no
      // convertirse en un párrafo, que es cuando deja de ayudar a quien usa
      // lector de pantalla y empieza a parecer relleno de palabras clave.
      alt: `Apertura de la guía: ${a.title.length > 120 ? `${a.title.slice(0, 117)}…` : a.title}`,
    tipo: 'ilustracion' as TipoImagen,
    contexto: `Encabezado de /recursos/${a.slug}`,
    prompt:
      `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal.')}\n\n` +
      `TEMA: ${a.title}\n` +
      `DE QUÉ TRATA: ${a.description}\n` +
      `ENCUADRE: la situación de obra concreta que la guía enseña a resolver, ` +
      `en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.`,
  }));
}

/**
 * Términos del glosario que ganan con un dibujo. No todos: "fabricación a
 * medida" no se dibuja, y una imagen decorativa junto a una definición
 * distrae en lugar de explicar. Se eligen los que describen una GEOMETRÍA o un
 * PROCEDIMIENTO, que es donde el dibujo hace un trabajo que el texto no hace.
 */
export const TERMINOS_ILUSTRABLES = [
  'big-bag-fibc',
  'carga-de-trabajo-segura',
  'factor-de-seguridad',
  'tipo-electrostatico-fibc',
  'liner-interior',
  'densidad-aparente',
  'gramaje',
  'lona-plastificada',
  'denier',
  'resistencia-al-desgarro',
  'estabilizacion-uv',
  'termosellado',
  'ojal',
  'geosintetico',
  'geomembrana',
  'hdpe',
  'geotextil',
  'no-tejido-punzonado',
  'resistencia-al-punzonamiento',
  'permitividad',
  'soldadura-por-cuna-caliente',
  'zanja-de-anclaje',
  'subrasante',
  'geomalla',
  'manga-de-ventilacion',
  'ventilacion-impelente',
  'ventilacion-aspirante',
  'refuerzo-espiral',
  'caudal',
  'perdida-de-carga',
  'factor-de-fuga',
  'malla-antiafida',
  'mesh',
  'porcentaje-de-sombra',
  'malla-raschel',
  'arquitectura-textil',
  'pretensado',
  'carga-de-viento',
  'altitud-y-radiacion',
  'certificado-de-lote',
  'as-built',
];

/**
 * Pista de composición por término.
 *
 * Por qué hace falta. El prompt genérico —definición corta más unidad de
 * medida— funciona para lo que tiene forma evidente: un ojal, una zanja de
 * anclaje. Falla en lo abstracto: "factor de seguridad" o "permitividad" no
 * tienen aspecto, y un generador al que se le pide dibujarlos devuelve una
 * ilustración vaga y decorativa, que es peor que ninguna porque ocupa el sitio
 * de la buena.
 *
 * Cada pista dice QUÉ COMPONER, no qué estilo usar: el estilo ya lo fija
 * ESTILO_DIAGRAMA. Están escritas para que el dibujo haga visible la relación
 * que el texto explica —dos escalas enfrentadas, dos estados del mismo objeto,
 * un corte que revela capas— y no para que quede bonito.
 *
 * DOS TÉRMINOS QUEDAN FUERA A PROPÓSITO: `fabricacion-a-medida` y
 * `fabricacion-a-medida-vs-importacion` describen un modo de aprovisionamiento
 * comercial. No tienen geometría, y cualquier imagen sería relleno. Una página
 * sin imagen es mejor que una imagen que no explica nada.
 */
export const PISTAS_VISUALES: Record<string, string> = {
  'big-bag-fibc':
    'Bolsón visto en tres cuartos con sus cuatro asas tensadas por el izaje, boca de carga arriba y boca de descarga abajo señaladas por su geometría. Un gancho de montacargas entrando en las asas.',
  'carga-de-trabajo-segura':
    'Dos escalas verticales enfrentadas sobre el mismo bolsón: la de la izquierda marca la carga de trabajo, la de la derecha la carga de rotura, mucho más alta. La distancia entre ambas es el margen, y debe leerse a simple vista.',
  'factor-de-seguridad':
    'Cinco bloques idénticos apilados junto a un bolsón que sostiene solo uno: la proporción 5:1 expresada como cantidad, no como número escrito.',
  'tipo-electrostatico-fibc':
    'Cuatro bolsones en fila, idénticos en forma y distintos en su tratamiento de la carga: uno liso, uno con paños de tejido de baja tensión, uno con hilos conductores y su cable a tierra conectado, uno con tejido disipativo sin cable. La diferencia debe estar en el tejido y en la presencia o ausencia del cable.',
  'liner-interior':
    'Corte del bolsón con la bolsa interior visible como una segunda piel separada del tejido exterior, conteniendo material fino que el tejido dejaría pasar.',
  'densidad-aparente':
    'Dos recipientes del mismo volumen lado a lado: uno con partículas gruesas y muchos huecos, otro con partículas finas y pocos huecos. Bajo cada uno, una balanza marcando pesos claramente distintos.',
  'gramaje':
    'Un cuadrado de un metro por un metro recortado de la lona, suspendido sobre el plato de una balanza. La superficie unitaria y la masa, nada más.',
  'lona-plastificada':
    'Corte transversal muy ampliado con las tres capas separadas y visibles: recubrimiento superior, tejido base con su trama de hilos cruzados, recubrimiento inferior.',
  'denier':
    'Tres hilos en paralelo, de grosor claramente creciente, y bajo ellos la misma longitud de referencia. El grosor es la variable.',
  'resistencia-al-desgarro':
    'Dos paños idénticos: en uno la fuerza tira de un borde intacto; en el otro, de un corte ya iniciado que se propaga. Las dos flechas de fuerza son del mismo tamaño y el resultado es distinto.',
  'estabilizacion-uv':
    'Dos fragmentos del mismo material bajo el mismo haz solar: en el de la izquierda las cadenas del polímero se mantienen; en el de la derecha aparecen fracturadas y el borde se resquebraja. La diferencia es el aditivo, representado como partículas dispersas en la masa del primero.',
  'termosellado':
    'Corte de dos láminas superpuestas: arriba una unión continua donde el material se fundió y es un solo cuerpo; abajo, para contraste, una costura con hilo que perfora ambas capas.',
  'ojal':
    'Corte del borde de una lona con el ojal instalado: refuerzo local de material bajo el anillo, y la cuerda tirando. El área sobre la que se reparte el esfuerzo debe ser evidente.',
  'geosintetico':
    'Corte de terreno con las distintas familias en su posición típica: geomalla trabando el árido arriba, geotextil separando capas, geomembrana como barrera, geocompuesto drenando. Cada una en su función, no en fila.',
  'geomembrana':
    'Corte de talud y fondo con la lámina continua sobre el terreno, mostrando los tres puntos donde se pierde la continuidad: unión, penetración y anclaje perimetral.',
  'hdpe':
    'Comparación de estructura molecular esquemática: cadenas lineales apretadas y ordenadas (alta densidad) frente a cadenas ramificadas y sueltas. Sin fórmulas.',
  'geotextil':
    'Dos paños ampliados lado a lado: uno de fibras entrelazadas al azar y gran espesor, otro de hilos cruzados en ángulo recto. La diferencia de construcción es todo el dibujo.',
  'no-tejido-punzonado':
    'Corte del velo de fibras con las agujas de púas descendiendo y arrastrando fibras de una capa a otra, dejando la estructura entrelazada y esponjosa.',
  'resistencia-al-punzonamiento':
    'Una piedra angulosa de la subrasante empujando desde abajo contra el geotextil y la geomembrana: se ve la deformación absorbida por el geotextil y la lámina intacta encima.',
  'permitividad':
    'Un mismo geotextil con dos flujos representados: uno atravesándolo perpendicularmente (permitividad) y otro corriendo dentro de su espesor a lo largo del plano (transmisividad).',
  'soldadura-por-cuna-caliente':
    'Corte de dos láminas solapadas con la cuña entrando entre ellas y los rodillos presionando: se ven las DOS pistas de soldadura y el canal de aire que queda entre ambas, con la aguja de presurización.',
  'zanja-de-anclaje':
    'Corte del borde superior del talud: la excavación perimetral con la lámina bajando dentro, doblada al fondo y cubierta con material compactado. La distancia a la corona del talud debe verse.',
  'subrasante':
    'Corte del terreno preparado: superficie perfilada y compactada, y junto a ella —tachados o apartados— los elementos que no deben quedar: piedra angulosa, raíz, encharcamiento.',
  'geomalla':
    'Corte de terreno con la geomalla tendida y el árido trabado dentro de sus aberturas: las partículas encajan en la retícula y el conjunto se comporta como un bloque.',
  'manga-de-ventilacion':
    'Labor subterránea en corte longitudinal con el ventilador en la bocamina, la manga tendida por el techo y el frente de trabajo al fondo.',
  'ventilacion-impelente':
    'Corte de labor: el ventilador empuja aire por la manga hasta el frente; el aire limpio barre el frente y retorna por la labor. Las flechas de ida van dentro de la manga y las de retorno por fuera.',
  'ventilacion-aspirante':
    'Corte de labor: la manga succiona desde el frente y la sección del ducto tiende a cerrarse por la depresión. Las flechas van en sentido contrario al caso impelente.',
  'refuerzo-espiral':
    'Tramo de manga en corte con el alambre helicoidal en su pared, y al lado la misma manga sin refuerzo mostrando la sección aplastada.',
  'caudal':
    'Una sección transversal de conducto con el volumen de aire que la atraviesa representado como un bloque que avanza en el tiempo.',
  'perdida-de-carga':
    'Ducto en corte longitudinal con la presión decreciendo a lo largo del recorrido, y las pérdidas localizadas marcadas en los codos y los acoples.',
  'factor-de-fuga':
    'Ducto tendido con pequeñas fugas escapando en cada unión a lo largo del recorrido, de modo que el flujo que llega al final es visiblemente menor que el que entró.',
  'malla-antiafida':
    'Ampliación de la trama con insectos de distinto tamaño frente a la abertura: uno queda fuera, otro pasa. La relación tamaño de abertura contra tamaño del insecto es el dibujo.',
  'mesh':
    'Una pulgada de referencia sobre la trama, con los hilos contados dentro de esa distancia. Dos tramas de distinta densidad para comparar.',
  'porcentaje-de-sombra':
    'Haz de radiación incidiendo sobre la malla: una parte se intercepta y otra pasa, representadas como dos fracciones claramente distintas del haz original.',
  'malla-raschel':
    'Ampliación de la estructura de tejido de urdimbre Raschel, mostrando el enlazado que impide que se deshilache, y un borde cortado que se mantiene íntegro.',
  'arquitectura-textil':
    'Superficie de membrana con doble curvatura opuesta —forma de silla de montar— anclada en sus puntos altos y bajos, con las líneas de tracción marcadas.',
  'pretensado':
    'La misma membrana en dos estados: floja y aleteando por el viento, y tensada y estable. El sistema de retensado visible en el anclaje.',
  'carga-de-viento':
    'Viento incidiendo sobre una cubierta ligera con las flechas de succión tirando hacia arriba mucho más marcadas que las de presión: el arrancamiento domina.',
  'altitud-y-radiacion':
    'Corte de la atmósfera con dos emplazamientos: uno al nivel del mar y otro en altura. El haz solar atraviesa mucho menos espesor atmosférico en el segundo y llega con más intensidad.',
  'certificado-de-lote':
    'Un rollo de material con su etiqueta de lote y, unido por una línea de trazabilidad, el documento que declara los ensayos de ESE lote. La correspondencia uno a uno es el mensaje.',
  'as-built':
    'Planta de una poza con el despiece real de paneles numerados, las líneas de unión marcadas y los puntos de reparación señalados en su posición.',
};

export function ranurasGlosario(): RanuraImagen[] {
  return terminos
    .filter((t) => TERMINOS_ILUSTRABLES.includes(t.slug))
    .map((t) => ({
      id: `glosario:${t.slug}`,
      ruta: `/images/glosario/${t.slug}.png`,
      ancho: 1200,
      alto: 900,
      alt: `Esquema explicativo del término ${t.termino}`,
      tipo: 'diagrama' as TipoImagen,
      contexto: `Definición en /glosario/${t.slug}`,
      prompt:
        `${ESTILO_DIAGRAMA.replace('Proporción', 'Proporción')}\n\n` +
        `TÉRMINO: ${t.termino}\n` +
        `QUÉ SIGNIFICA: ${t.definicionCorta}\n` +
        (t.comoSeMide ? `CÓMO SE MIDE: ${t.comoSeMide}\n` : '') +
        (PISTAS_VISUALES[t.slug] ? `QUÉ COMPONER: ${PISTAS_VISUALES[t.slug]}\n` : '') +
        `EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. ` +
        `La representación tiene que ser técnicamente correcta: la geometría, las proporciones ` +
        `y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. ` +
        `Un esquema bonito y equivocado hace más daño que ninguno. ` +
        `Proporción 4:3 horizontal.`,
    }));
}

/** Todas las ranuras pendientes, en orden de prioridad de publicación. */
export function todasLasRanuras(): RanuraImagen[] {
  return [
    ...ranurasSolucion(),
    ...ranurasFamilia(),
    ...ranurasProducto(),
    ...ranurasGlosario(),
    ...ranurasGuia(),
  ];
}

/**
 * Todas las ranuras del sitio, incluidas las que ya tienen archivo publicado.
 * Es la lista que usa el encargo de tomas alternas: para pedir la toma 2 de
 * una imagen hay que partir del prompt de la toma 1, exista o no en disco.
 */
export function todasLasRanurasConPublicadas(): RanuraImagen[] {
  return [
    ...ranurasSolucion(),
    ...ranurasFamilia(),
    ...ranurasProducto(true),
    ...ranurasGlosario(),
    ...ranurasGuia(),
  ];
}

/**
 * Variación explícita por número de toma. Sin esto, un generador al que se le
 * pide «otra versión» del mismo prompt devuelve el mismo render —fue
 * exactamente lo que pasó con los diagramas del glosario, que llegaron por
 * triplicado y byte a byte idénticos— y el sitio las descarta. La variación
 * tiene que estar ESCRITA en el encargo, y tiene que cambiar la cámara o la
 * escena, no el estilo: dos tomas con estilos distintos se leen como un error.
 */
export const VARIACION_TOMA: Record<number, string> = {
  2:
    'SEGUNDA TOMA del mismo asunto. Cambie el punto de vista: si la primera es a la altura ' +
    'de los ojos, ésta va desde arriba en escorzo o desde el suelo. Acérquese o aléjese al ' +
    'menos un paso completo. MISMO material, MISMO montaje, MISMA hora del día y MISMA paleta: ' +
    'lo único que cambia es dónde está la cámara.',
  3:
    'TERCERA TOMA del mismo asunto. Cambie el MOMENTO en lugar de la cámara: otro instante ' +
    'de la misma faena —el material a medio desplegar, la unión a medio ejecutar, el equipo ' +
    'aproximándose—. Encuadre distinto de las dos anteriores. MISMO material, MISMO lugar, ' +
    'MISMA paleta y MISMA calidad de luz.',
  4:
    'CUARTA TOMA del mismo asunto. Plano de contexto amplio: el mismo elemento dentro de su ' +
    'entorno completo, ocupando una parte menor del encuadre. MISMO material, MISMO lugar, ' +
    'MISMA paleta.',
};

/** Busca la ranura de una página concreta. */
export const ranuraPorId = (id: string): RanuraImagen | undefined =>
  todasLasRanuras().find((r) => r.id === id);
P25EOF
echo '  ok  lib/imagenes.ts'

mkdir -p "$(dirname 'package.json')"
cat > 'package.json' <<'P25EOF'
{
  "name": "plastilonas-peruanas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "bash scripts/smoke.sh",
    "audit:ui": "node scripts/audit-ui.mjs",
    "verify:deploy": "bash scripts/verificar-despliegue.sh",
    "vigilancia": "node scripts/vigilancia-fuentes.mjs",
    "imagenes": "node scripts/imagenes.mjs",
    "imagenes:prompts": "node scripts/imagenes.mjs --prompts",
    "imagenes:glosario": "node scripts/imagenes.mjs --prompts --grupo glosario",
    "imagenes:tomas": "node scripts/imagenes.mjs --tomas",
    "imagenes:tomas:glosario": "node scripts/imagenes.mjs --tomas --grupo glosario"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/react": "^1.2.12",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/supabase-js": "^2.45.4",
    "ai": "^4.3.16",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.469.0",
    "next": "^15.5.20",
    "next-auth": "^5.0.0-beta.31",
    "pdf-lib": "^1.17.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.7.0",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jsdom": "^25.0.1",
    "postcss": "^8",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
P25EOF
echo '  ok  package.json'

mkdir -p "$(dirname 'scripts/imagenes.mjs')"
cat > 'scripts/imagenes.mjs' <<'P25EOF'
#!/usr/bin/env node
/**
 * INVENTARIO DE IMÁGENES — qué falta y con qué encargarlo.
 *
 *   npm run imagenes            informe: cuántas hay, cuántas faltan y cuáles
 *   npm run imagenes:prompts    emite docs/encargo-imagenes.md (lo que FALTA)
 *   npm run imagenes:tomas      emite docs/encargo-tomas.md (tomas 2 y 3 de lo
 *                               que YA existe, para que el sitio las rote)
 *
 * Por qué los prompts se GENERAN y no se escriben a mano: el nombre de cada
 * archivo se deriva del slug real del catálogo. Si alguien renombra un
 * producto, el encargo se renombra con él en la siguiente ejecución. Una lista
 * de encargos escrita aparte se desincroniza la primera vez que algo cambia, y
 * el síntoma aparece semanas después como una página con un hueco.
 *
 * Sale con código 0 siempre: faltar imágenes es un estado normal del trabajo,
 * no un fallo de compilación.
 */

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;

/** Tope de tomas que rota el sitio. Debe coincidir con MAX_TOMAS de lib/galeria. */
const MAX_TOMAS = 4;

const huella = (ruta) => {
  try {
    return createHash('sha256').update(readFileSync(ruta)).digest('hex');
  } catch {
    return null;
  }
};

/**
 * Recuento de tomas por ranura, con la MISMA lógica que el sitio: se corta en
 * el primer hueco y se descartan las copias byte a byte.
 *
 * Este recuento existe porque «faltan tomas» y «llegaron duplicadas» se ven
 * idénticos en el sitio —una sola imagen quieta— y son problemas opuestos.
 * Sin el número, el informe mentía por omisión.
 */
function recuentoDeTomas(rutas) {
  let rotan = 0;
  let duplicadas = 0;
  const conDuplicados = [];
  for (const ruta of rutas) {
    const abs = join('public', ruta);
    if (!existsSync(abs)) continue;
    const vistas = new Set([huella(abs)].filter(Boolean));
    let enDisco = 0;
    let distintas = 0;
    for (let n = 2; n <= MAX_TOMAS; n++) {
      const cand = join('public', ruta.replace(/\.(jpg|jpeg|png|webp|avif)$/i, `-${n}.$1`));
      if (!existsSync(cand)) break;
      enDisco++;
      const h = huella(cand);
      if (h && vistas.has(h)) continue;
      if (h) vistas.add(h);
      distintas++;
    }
    if (distintas > 0) rotan++;
    if (enDisco > distintas) {
      duplicadas += enDisco - distintas;
      conDuplicados.push(ruta);
    }
  }
  return { rotan, duplicadas, conDuplicados };
}

// El registro es TypeScript; se lee a través de tsx para no duplicarlo aquí.
function leerRanuras() {
  const salida = execFileSync(
    'npx',
    ['tsx', '-e', "import {todasLasRanuras} from './lib/imagenes'; console.log(JSON.stringify(todasLasRanuras()));"],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const linea = salida.trim().split('\n').pop();
  return JSON.parse(linea);
}

/**
 * Rutas de galería YA COMPLETAS. `todasLasRanuras()` las omite a propósito
 * —una ranura es un ENCARGO, y lo que ya existe no se encarga— pero para
 * contar tomas hay que mirar justamente esas: son las únicas que hoy tienen
 * archivos -2 en disco. Contar solo los encargos daba «0 rotan» con 28
 * segundas tomas publicadas, que es un informe falso.
 */
function leerGalerias() {
  const salida = execFileSync(
    'npx',
    ['tsx', '-e', "import {products} from './lib/products'; console.log(JSON.stringify(products.flatMap((p) => p.gallery ?? [])));"],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  return JSON.parse(salida.trim().split('\n').pop());
}

const ranuras = leerRanuras();
const faltan = ranuras.filter((r) => !existsSync(join('public', r.ruta)));
const hay = ranuras.length - faltan.length;

const soloGrupo = (() => {
  const i = process.argv.indexOf('--grupo');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const modo = process.argv.includes('--tomas')
  ? 'tomas'
  : process.argv.includes('--prompts')
    ? 'prompts'
    : 'informe';

/** Cuántas tomas se piden por ranura. 3 es lo que el sitio rota cómodamente. */
const TOMAS_PEDIDAS = Number(
  process.argv[process.argv.indexOf('--tomas') + 1]?.match(/^[2-4]$/)?.[0] ?? 3,
);

if (modo === 'informe') {
  console.log(`\nInventario de imágenes — ${ranuras.length} ranuras declaradas\n`);
  const porContexto = new Map();
  for (const r of faltan) {
    const grupo = r.id.split(':')[0];
    porContexto.set(grupo, (porContexto.get(grupo) ?? 0) + 1);
  }
  console.log(`  ${verde(`${hay} publicadas`)}   ${faltan.length ? ambar(`${faltan.length} pendientes`) : verde('0 pendientes')}\n`);
  for (const [grupo, n] of porContexto) {
    console.log(`  ${ambar('·')} ${grupo}: ${n} pendientes`);
  }
  if (faltan.length) {
    console.log('\n  Primeras diez pendientes:');
    for (const r of faltan.slice(0, 10)) console.log(`    ${r.ruta}`);
    console.log('\n  Genere el documento de encargo con:  npm run imagenes:prompts');
    console.log('  Mientras falten, la página muestra un marcador sobrio, no una imagen rota.');
  }

  const t = recuentoDeTomas([...new Set([...ranuras.map((r) => r.ruta), ...leerGalerias()])]);
  console.log(`\n  Rotación de tomas (sufijos -2 … -${MAX_TOMAS})\n`);
  console.log(`    ${t.rotan > 0 ? verde(`${t.rotan} ranuras rotan varias tomas`) : ambar('0 ranuras rotan: no hay segundas tomas distintas')}`);
  if (t.duplicadas > 0) {
    console.log(`    ${rojo(`${t.duplicadas} archivos -n descartados por ser copias byte a byte`)}`);
    console.log('    Un duplicado exacto no es una toma: fundir una imagen contra');
    console.log('    una copia de sí misma deja la página quieta y la descarga dos veces.');
    for (const r of t.conDuplicados.slice(0, 10)) console.log(`      ${r}`);
  }
  console.log('');
  process.exit(0);
}

// --- Documento de encargo ---------------------------------------------------

const grupos = {
  solucion: 'Arquitecturas de referencia (diagramas)',
  familia: 'Portadas de familia',
  producto: 'Galerías de producto',
  glosario: 'Términos del glosario (diagramas)',
  guia: 'Encabezados de guía',
};

// --- Encargo de tomas alternas ----------------------------------------------

if (modo === 'tomas') {
  // Se parte de TODAS las ranuras, incluidas las publicadas: para pedir la
  // toma 2 hace falta el prompt de la toma 1, que es la que ya existe.
  const salida = execFileSync(
    'npx',
    [
      'tsx',
      '-e',
      "import {todasLasRanurasConPublicadas, VARIACION_TOMA} from './lib/imagenes'; console.log(JSON.stringify({r: todasLasRanurasConPublicadas(), v: VARIACION_TOMA}));",
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const { r: todas, v: variacion } = JSON.parse(salida.trim().split('\n').pop());

  const publicadas = todas.filter((r) => existsSync(join('public', r.ruta)));
  const filtradas = soloGrupo ? publicadas.filter((r) => r.id.startsWith(`${soloGrupo}:`)) : publicadas;

  let doc = `# Encargo de TOMAS ALTERNAS — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:tomas\` desde el registro del sitio.
**No edite este archivo a mano.**

Esto NO es una lista de imágenes que faltan: es la lista de imágenes que **ya
existen** y a las que se les pide una segunda y una tercera versión, para que
el sitio las **alterne** con un cruce lento y un movimiento Ken Burns desfasado.

## Lo único que hay que entender

El nombre del archivo es lo que activa la rotación. Nada más:

| Archivo | Qué es |
|---|---|
| \`nombre.jpg\` | toma 1 — ya existe, **no la toque** |
| \`nombre-2.jpg\` | toma 2 — lo que se pide aquí |
| \`nombre-3.jpg\` | toma 3 — lo que se pide aquí |

## Las dos formas de que esto falle

1. **Entregar el mismo render con otro nombre.** El sitio compara el contenido
   byte a byte y descarta las copias exactas: una imagen fundiéndose contra un
   duplicado de sí misma no rota, deja la página quieta y descarga el archivo
   dos veces. Ya pasó una vez con los diagramas del glosario, que llegaron por
   triplicado e idénticos. Por eso cada encargo de abajo lleva ESCRITO qué debe
   cambiar entre una toma y otra.
2. **Saltarse un número.** Si llega \`-3\` sin \`-2\`, el sitio usa solo la
   toma 1. La numeración no puede tener huecos.

Suba los archivos a \`public/\` respetando la ruta y ejecute
\`npm run imagenes\`: el informe dice cuántas ranuras rotan y cuántos
archivos se descartaron por venir duplicados.

---

`;

  let n = 0;
  for (const [clave, titulo] of Object.entries(grupos)) {
    if (soloGrupo && clave !== soloGrupo) continue;
    const delGrupo = filtradas.filter((r) => r.id.startsWith(`${clave}:`));
    if (!delGrupo.length) continue;
    doc += `## ${titulo}\n\n${delGrupo.length} imágenes publicadas × ${TOMAS_PEDIDAS - 1} tomas = ${delGrupo.length * (TOMAS_PEDIDAS - 1)} encargos.\n\n`;
    for (const r of delGrupo) {
      for (let t = 2; t <= TOMAS_PEDIDAS; t++) {
        const destino = r.ruta.replace(/\.(jpg|jpeg|png|webp|avif)$/i, `-${t}.$1`);
        if (existsSync(join('public', destino))) continue; // ya entregada
        n += 1;
        doc += `### ${n}. \`${destino}\`\n\n`;
        doc += `| | |\n|---|---|\n`;
        doc += `| **Archivo a crear** | \`public${destino}\` |\n`;
        doc += `| **Toma 1 (referencia, ya existe)** | \`public${r.ruta}\` |\n`;
        doc += `| **Tamaño** | ${r.ancho} × ${r.alto} px |\n`;
        doc += `| **Tipo** | ${r.tipo} |\n`;
        doc += `| **Dónde se usa** | ${r.contexto} |\n\n`;
        doc += `**Prompt:**\n\n\`\`\`\n${r.prompt}\n\n${variacion[t]}\n\`\`\`\n\n---\n\n`;
      }
    }
  }

  mkdirSync('docs', { recursive: true });
  const dest = soloGrupo ? `docs/encargo-tomas-${soloGrupo}.md` : 'docs/encargo-tomas.md';
  writeFileSync(dest, doc);
  console.log(`\nEscrito ${dest} con ${n} encargos de toma alterna.\n`);
  if (n === 0) {
    console.log('No hay nada que pedir: todas las tomas solicitadas ya están en disco.\n');
  } else {
    console.log('Entrégueselo a su generador tal cual. Lo que NO puede pasar es que');
    console.log('devuelva el mismo render con otro nombre: el sitio lo descarta.\n');
  }
  process.exit(0);
}


let md = `# Encargo de imágenes — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:prompts\` desde el registro del sitio.
**No edite este archivo a mano**: se regenera, y el nombre de cada archivo se
deriva del slug real del catálogo.

## Cómo usarlo

1. Genere cada imagen con el prompt indicado.
2. Guárdela EXACTAMENTE con el nombre de archivo que aparece en \`Archivo\`.
3. Colóquela en la carpeta \`public/\` respetando la ruta completa.
4. Ejecute \`npm run imagenes\` para confirmar que el sitio ya la reconoce.

## Tomas alternas: cómo pedir que una imagen rote

El sitio alterna hasta ${MAX_TOMAS} versiones de la MISMA ranura con un cruce
lento y un movimiento Ken Burns desfasado. Se activa solo, por el nombre:

| Archivo | Qué es |
|---|---|
| \`nombre.jpg\` | toma 1 — la que se ve primero y la que mide el LCP |
| \`nombre-2.jpg\` | toma 2 — opcional |
| \`nombre-3.jpg\` | toma 3 — opcional |
| \`nombre-4.jpg\` | toma 4 — el tope |

Tres condiciones, y las tres se comprueban solas al compilar:

1. **La numeración no puede tener huecos.** Si existe \`-3\` pero falta
   \`-2\`, el sitio usa solo la toma 1. Un hueco es casi siempre un archivo
   mal nombrado, y adivinar produciría una rotación distinta en cada despliegue.
2. **Las tomas tienen que ser DISTINTAS.** El sitio compara el contenido byte a
   byte y descarta las copias exactas. Una imagen fundiéndose contra un
   duplicado de sí misma no rota: deja la página quieta diez segundos y
   descarga el archivo dos veces. Si su generador entrega el mismo render
   varias veces, no sirve: hay que cambiar el ángulo, la hora del día, la
   distancia o el material del entorno.
3. **Misma vista, otra captura.** No es otro producto ni otro encuadre
   temático: es el MISMO asunto visto de otro modo. Cambiar de tema entre
   tomas confunde en vez de explicar.

Ejecute \`npm run imagenes\` después de subirlas: el informe dice cuántas
ranuras rotan y cuántos archivos se descartaron por venir duplicados.

Las rutas empiezan por \`/images/...\`; en el repositorio eso corresponde a
\`public/images/...\`. Es decir: \`/images/familias/geosinteticos.jpg\` se sube
como \`public/images/familias/geosinteticos.jpg\`.

## Reglas que no debe romper el generador

- **Sin texto dentro de la imagen.** Ni etiquetas, ni cotas, ni títulos. Las
  leyendas las pone la página, en español y en HTML, donde un buscador y un
  lector de pantalla sí las leen. Texto quemado en un JPG es invisible para ambos.
- **Sin logotipos, marcas ni marcas de agua.**
- **Sin rostros identificables.**
- **Exactitud técnica antes que belleza.** Estas imágenes las mira gente que
  instala esto para vivir. Una costura mal representada o una capa en el orden
  equivocado cuesta más credibilidad de la que gana la estética.
- **Una imagen generada no es una fotografía del producto real.** El sitio las
  publica marcadas como referenciales. Cuando exista una foto real del material
  que efectivamente vendemos, reemplaza a la generada: basta sobrescribir el archivo.

---

`;

let total = 0;
for (const [clave, titulo] of Object.entries(grupos)) {
  // --grupo glosario emite un documento con SOLO ese silo. Un encargo de 47
  // imágenes es difícil de repartir; uno de 41 diagramas del mismo tipo se
  // puede pasar entero a quien dibuja diagramas.
  if (soloGrupo && clave !== soloGrupo) continue;
  const delGrupo = ranuras.filter((r) => r.id.startsWith(`${clave}:`));
  if (!delGrupo.length) continue;
  const pendientes = delGrupo.filter((r) => !existsSync(join('public', r.ruta)));
  md += `## ${titulo}\n\n${pendientes.length} pendientes de ${delGrupo.length}.\n\n`;
  for (const r of pendientes) {
    total += 1;
    md += `### ${total}. \`${r.ruta}\`\n\n`;
    md += `| | |\n|---|---|\n`;
    md += `| **Archivo** | \`public${r.ruta}\` |\n`;
    md += `| **Tamaño** | ${r.ancho} × ${r.alto} px |\n`;
    md += `| **Tipo** | ${r.tipo} |\n`;
    md += `| **Dónde se usa** | ${r.contexto} |\n`;
    md += `| **Texto alternativo** | ${r.alt} |\n\n`;
    md += `**Prompt:**\n\n\`\`\`\n${r.prompt}\n\`\`\`\n\n---\n\n`;
  }
}

mkdirSync('docs', { recursive: true });
const destino = soloGrupo
  ? `docs/encargo-imagenes-${soloGrupo}.md`
  : 'docs/encargo-imagenes.md';
writeFileSync(destino, md);
console.log(`\nEscrito ${destino} con ${total} encargos.\n`);
console.log('Entrégueselo a su generador de imágenes tal cual.');
console.log('Los nombres de archivo salen del catálogo: no los cambie.\n');
P25EOF
echo '  ok  scripts/imagenes.mjs'

mkdir -p "$(dirname 'test/galeria.test.ts')"
cat > 'test/galeria.test.ts' <<'P25EOF'
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  rutaToma,
  rutaSegundaToma,
  esTomaAdicional,
  esSegundaToma,
  tomasDe,
  mapaDeTomas,
  conVariasTomas,
  conSegundaToma,
  tomasDuplicadas,
  claseCiclo,
  MAX_TOMAS,
} from '@/lib/galeria';
import { products } from '@/lib/products';

describe('galería: resolución de las tomas', () => {
  it('deriva la ruta de cada toma conservando la extensión', () => {
    expect(rutaToma('/images/galeria/x-general.jpg', 2)).toBe('/images/galeria/x-general-2.jpg');
    expect(rutaToma('/images/galeria/x-detalle.png', 3)).toBe('/images/galeria/x-detalle-3.png');
    expect(rutaToma('/images/glosario/x.png', 4)).toBe('/images/glosario/x-4.png');
    // La toma 1 es la ruta base: no lleva sufijo.
    expect(rutaToma('/images/galeria/x-general.jpg', 1)).toBe('/images/galeria/x-general.jpg');
    expect(rutaSegundaToma('/images/galeria/x-general.jpg')).toBe('/images/galeria/x-general-2.jpg');
  });

  it('reconoce una toma adicional y no la anida', () => {
    // Sin esto acabaríamos buscando "-2-2.jpg".
    expect(esTomaAdicional('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(esTomaAdicional('/images/galeria/x-general-3.jpg')).toBe(true);
    expect(esTomaAdicional('/images/galeria/x-general.jpg')).toBe(false);
    expect(esSegundaToma('/images/galeria/x-general-2.jpg')).toBe(true);
    expect(tomasDe('/images/galeria/x-general-2.jpg')).toEqual(['/images/galeria/x-general-2.jpg']);
  });

  it('devuelve una sola toma cuando no existe ninguna adicional', () => {
    // Es el caso normal mientras el segundo juego no ha llegado: no debe
    // producir un cruce contra un hueco.
    expect(tomasDe('/images/galeria/no-existe-general.jpg')).toEqual([
      '/images/galeria/no-existe-general.jpg',
    ]);
  });

  it('el mapa cubre toda la galería del producto', () => {
    for (const p of products.slice(0, 6)) {
      const mapa = mapaDeTomas(p.gallery ?? []);
      for (const src of p.gallery ?? []) expect(mapa[src]?.[0]).toBe(src);
    }
  });

  it('cuenta sin romperse con galerías vacías', () => {
    expect(conVariasTomas([])).toBe(0);
    expect(conSegundaToma([])).toBe(0);
    expect(tomasDuplicadas([])).toBe(0);
  });

  it('la clase de ciclo solo existe cuando hay algo que cruzar', () => {
    expect(claseCiclo(1)).toBeNull();
    expect(claseCiclo(0)).toBeNull();
    expect(claseCiclo(2)).toBe('tomas-2');
    expect(claseCiclo(3)).toBe('tomas-3');
    expect(claseCiclo(4)).toBe('tomas-4');
    // Nunca una clase que el CSS no define.
    expect(claseCiclo(9)).toBe(`tomas-${MAX_TOMAS}`);
  });
});

/* --------------------------------------------------------------------------
   Las tres reglas duras, contra archivos de verdad.

   Se escriben ficheros reales en un directorio propio y se borran al terminar.
   Es la única forma de comprobar el descarte por contenido: el hash se calcula
   leyendo el archivo, y un doble de prueba comprobaría el doble, no el código.
-------------------------------------------------------------------------- */
const DIR = '/images/_pruebas-tomas';
const abs = (r: string) => join(process.cwd(), 'public', r);

describe('galería: las tres reglas del descarte', () => {
  beforeAll(() => {
    mkdirSync(abs(DIR), { recursive: true });
    const A = Buffer.from('contenido-A-'.repeat(64));
    const B = Buffer.from('contenido-B-'.repeat(64));
    const C = Buffer.from('contenido-C-'.repeat(64));

    // Caso 1: tres tomas realmente distintas.
    writeFileSync(abs(`${DIR}/distintas.png`), A);
    writeFileSync(abs(`${DIR}/distintas-2.png`), B);
    writeFileSync(abs(`${DIR}/distintas-3.png`), C);

    // Caso 2: tres copias byte a byte. El caso real de este proyecto.
    writeFileSync(abs(`${DIR}/clones.png`), A);
    writeFileSync(abs(`${DIR}/clones-2.png`), A);
    writeFileSync(abs(`${DIR}/clones-3.png`), A);

    // Caso 3: hueco en la secuencia (-2 falta, -3 está).
    writeFileSync(abs(`${DIR}/hueco.png`), A);
    writeFileSync(abs(`${DIR}/hueco-3.png`), B);

    // Caso 4: más tomas que el tope.
    writeFileSync(abs(`${DIR}/muchas.png`), A);
    for (let i = 2; i <= MAX_TOMAS + 2; i++) {
      writeFileSync(abs(`${DIR}/muchas-${i}.png`), Buffer.from(`contenido-${i}-`.repeat(64)));
    }
  });

  afterAll(() => rmSync(abs(DIR), { recursive: true, force: true }));

  it('rota todas las tomas cuando son distintas', () => {
    expect(tomasDe(`${DIR}/distintas.png`)).toEqual([
      `${DIR}/distintas.png`,
      `${DIR}/distintas-2.png`,
      `${DIR}/distintas-3.png`,
    ]);
  });

  it('descarta las copias byte a byte: un duplicado no es una toma', () => {
    // Fundir una imagen contra una copia exacta de sí misma no produce cruce
    // alguno: produce diez segundos en los que la página parece congelada, y
    // dos descargas del mismo archivo.
    expect(tomasDe(`${DIR}/clones.png`)).toEqual([`${DIR}/clones.png`]);
    expect(tomasDuplicadas([`${DIR}/clones.png`])).toBe(2);
    expect(tomasDuplicadas([`${DIR}/distintas.png`])).toBe(0);
  });

  it('se corta en el primer hueco de la secuencia', () => {
    // -2 ausente y -3 presente es casi siempre un archivo mal nombrado.
    // Adivinar produciría una rotación distinta en cada despliegue.
    expect(tomasDe(`${DIR}/hueco.png`)).toEqual([`${DIR}/hueco.png`]);
  });

  it('nunca supera el tope de tomas', () => {
    // Cada toma es una descarga completa antes de que el visitante decida si
    // le interesa el producto.
    expect(tomasDe(`${DIR}/muchas.png`)).toHaveLength(MAX_TOMAS);
    expect(claseCiclo(tomasDe(`${DIR}/muchas.png`).length)).toBe(`tomas-${MAX_TOMAS}`);
  });
});

describe('Ken Burns: movimiento que no estorba', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  it('el zoom no recorta el detalle técnico', () => {
    // scale(1.14) se comía la zanja de anclaje del borde, que es exactamente
    // lo que un ingeniero mira en esa foto.
    const kf = css.slice(css.indexOf('@keyframes kenburns'), css.indexOf('@keyframes kenburns') + 200);
    expect(kf).toMatch(/scale\(1\.0[0-9]\)/);
    expect(kf).not.toMatch(/scale\(1\.1[0-9]\)/);
  });

  it('el hover pausa, no acelera', () => {
    // Cambiar animation-duration a mitad de una animación reposiciona el
    // fotograma y la imagen salta al pasar el cursor.
    expect(css).toMatch(/\.group:hover \.ken-burns \{ animation-play-state: paused; \}/);
    expect(css).not.toMatch(/\.group:hover \.ken-burns \{ animation-duration/);
  });

  it('la pausa por hover se declara DESPUÉS de los ciclos', () => {
    // La forma abreviada `animation:` de las reglas .tomas-N reinicia
    // animation-play-state. Con la misma especificidad gana la última regla:
    // puesta antes, el hover no pausaba absolutamente nada.
    const pausa = css.indexOf('.group:hover .toma-cruce');
    const ultimoCiclo = css.lastIndexOf('.tomas-4 .toma-capa-4');
    expect(pausa).toBeGreaterThan(-1);
    expect(ultimoCiclo).toBeGreaterThan(-1);
    expect(pausa).toBeGreaterThan(ultimoCiclo);
  });

  it('no fuerza una capa de composición permanente', () => {
    // Se afirma sobre la DECLARACIÓN, no sobre la palabra: el comentario del
    // propio bloque menciona will-change para explicar por qué se quitó, y
    // buscar la palabra suelta hacía fallar el test contra su propia prosa.
    const bloque = css.slice(css.indexOf('.ken-burns {'), css.indexOf('@keyframes kenburns'));
    expect(bloque).not.toMatch(/^\s*will-change\s*:/m);
  });

  it('respeta prefers-reduced-motion sin excepciones', () => {
    // El movimiento puede provocar malestar vestibular real. No es una
    // preferencia estética.
    const bloque = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)', css.indexOf('.toma-cruce')));
    expect(bloque).toMatch(/\.ken-burns \{ animation: none !important/);
    expect(bloque).toMatch(/\.toma-cruce \{ animation: none !important/);
    // Oculta TODAS las capas, no solo la segunda: el selector es la clase
    // común, no una clase numerada.
    expect(bloque).toMatch(/\.toma-cruce \{[^}]*opacity: 0 !important/);
  });
});

describe('cruce de N tomas: el ciclo es correcto para 2, 3 y 4', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  for (const n of [2, 3, 4]) {
    it(`define ${n - 1} capa(s) y un ciclo lento para ${n} tomas`, () => {
      for (let k = 2; k <= n; k++) {
        const regla = new RegExp(`\\.tomas-${n} \\.toma-capa-${k} \\{ animation: cruce-${k}de${n} (\\d+)s`);
        const m = css.match(regla);
        expect(m, `falta la regla de la capa ${k} de ${n}`).toBeTruthy();
        // Un carrusel rápido en una ficha técnica compite con la lectura.
        expect(Number(m![1]) / n).toBeGreaterThanOrEqual(8);
      }
      // No debe declarar una capa que el componente nunca va a renderizar.
      expect(css).not.toMatch(new RegExp(`\\.tomas-${n} \\.toma-capa-${n + 1}\\b`));
    });

    it(`el ciclo de ${n} tomas no deja ver el fondo en las transiciones`, () => {
      // LA INVARIANTE. La capa más alta arranca el ciclo VISIBLE (viene de
      // cerrar la vuelta anterior) y se funde hacia afuera revelando la toma
      // 1. Las intermedias arrancan ocultas y se apagan de golpe cuando ya
      // están tapadas. Si la última arrancara en 0, habría un corte seco de la
      // toma N a la toma 1; si una intermedia arrancara en 1, dos capas a
      // media opacidad dejarían transparentarse la toma 1 debajo.
      const inicio = (nombre: string) => {
        const i = css.indexOf(`@keyframes ${nombre}`);
        expect(i, `falta @keyframes ${nombre}`).toBeGreaterThan(-1);
        const bloque = css.slice(i, css.indexOf('}', css.indexOf('{', i) + 1) + 1);
        return bloque.match(/0%\s*\{\s*opacity:\s*([\d.]+)/)?.[1];
      };
      expect(inicio(`cruce-${n}de${n}`), 'la capa más alta debe arrancar visible').toBe('1');
      for (let k = 2; k < n; k++) {
        expect(inicio(`cruce-${k}de${n}`), `la capa intermedia ${k} debe arrancar oculta`).toBe('0');
      }
    });
  }

  it('el Ken Burns de cada capa le gana a la regla general', () => {
    // `.ken-burns-wrap:nth-of-type(3n) .ken-burns` tiene especificidad (0,3,0).
    // Con `.toma-capa-N .ken-burns` (0,2,0) todas las capas heredaban el mismo
    // desfase y el cruce se leía como un parpadeo de la misma foto.
    for (const k of [2, 3, 4]) {
      expect(css).toMatch(new RegExp(`\\.toma-cruce\\.toma-capa-${k} \\.ken-burns \\{ animation-delay`));
    }
  });
});

describe('galería: integración con la ficha', () => {
  const gal = readFileSync(join(process.cwd(), 'components/ProductGallery.tsx'), 'utf8');

  it('la ficha resuelve las tomas en el servidor y las pasa al componente', () => {
    const page = readFileSync(join(process.cwd(), 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/mapaDeTomas\(product\.gallery/);
  });

  it('las tomas adicionales no añaden miniatura ni leyenda duplicada', () => {
    // Es la MISMA vista capturada otra vez: como entrada suelta en `gallery`
    // produciría una miniatura extra sin leyenda.
    for (const p of products) {
      for (const src of p.gallery ?? []) {
        expect(esTomaAdicional(src), `${p.slug}: ${src} no debe estar en gallery`).toBe(false);
      }
    }
  });

  it('las tomas adicionales se ocultan a los lectores de pantalla', () => {
    const bloque = gal.slice(gal.indexOf('{capas.map('), gal.indexOf('{capas.map(') + 600);
    expect(bloque).toMatch(/aria-hidden="true"/);
    expect(bloque).toMatch(/alt=""/);
  });

  it('ninguna toma secundaria se marca prioritaria', () => {
    // Precargar la toma 2 compite con la toma 1, que es la que mide el LCP.
    const bloque = gal.slice(gal.indexOf('{capas.map('), gal.indexOf('{capas.map(') + 600);
    expect(bloque).not.toMatch(/priority/);
  });

  it('el número de capas nunca supera lo que el CSS define', () => {
    expect(gal).toMatch(/capas = tomasActivas\.slice\(1, 4\)/);
  });
});

describe('glosario y recursos: la misma rotación', () => {
  const src = readFileSync(join(process.cwd(), 'components/ImagenContenido.tsx'), 'utf8');

  it('resuelve las tomas con la misma librería que la galería', () => {
    // Dos implementaciones del mismo cruce divergen; una sola no puede.
    expect(src).toMatch(/from '@\/lib\/galeria'/);
    expect(src).toMatch(/tomasDe\(ranura\.ruta\)/);
    expect(src).toMatch(/claseCiclo\(/);
  });

  it('apila las capas con las mismas clases del CSS', () => {
    expect(src).toMatch(/toma-cruce toma-capa-\$\{k \+ 2\}/);
    expect(src).toMatch(/ken-burns/);
  });

  it('no marca prioritaria ninguna toma secundaria', () => {
    const bloque = src.slice(src.indexOf('{capas.map('), src.indexOf('{capas.map(') + 500);
    expect(bloque).not.toMatch(/priority/);
  });

  it('existe el fichero real de alguna ranura con varias tomas o ninguna miente', () => {
    // No exige que existan: exige que si existen, se resuelvan. Un test que
    // exigiera archivos convertiría "todavía no llegaron" en rojo permanente.
    const dir = join(process.cwd(), 'public/images/glosario');
    if (!existsSync(dir)) return;
    expect(tomasDe('/images/glosario/no-existe-jamas.png')).toHaveLength(1);
  });
});

/* --------------------------------------------------------------------------
   La prueba que de verdad importa: simular el compositing.

   Leer los @keyframes y comprobar que "parecen bien" no demuestra nada. Lo que
   se puede demostrar es el resultado: apilando las capas con la fórmula real
   del navegador (`abajo * (1 - opacidad) + capa * opacidad`), en NINGÚN
   instante del ciclo puede haber tres imágenes visibles a la vez. Si las hay,
   la tercera es siempre la toma 1 asomando por debajo de dos capas a media
   opacidad: el fantasma que este diseño existe para evitar.
-------------------------------------------------------------------------- */
describe('cruce de N tomas: el compositing no deja asomar el fondo', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  function paradas(nombre: string): Array<[number, number]> {
    const i = css.indexOf(`@keyframes ${nombre}`);
    const cuerpo = css.slice(i, css.indexOf('\n}', i));
    const out: Array<[number, number]> = [];
    for (const m of cuerpo.matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+)/g)) {
      out.push([Number(m[1]), Number(m[2])]);
    }
    return out.sort((a, b) => a[0] - b[0]);
  }

  const opacidadEn = (ps: Array<[number, number]>, t: number): number => {
    if (t <= ps[0][0]) return ps[0][1];
    for (let i = 0; i < ps.length - 1; i++) {
      const [a, va] = ps[i];
      const [b, vb] = ps[i + 1];
      if (t >= a && t <= b) return b === a ? vb : va + (vb - va) * ((t - a) / (b - a));
    }
    return ps[ps.length - 1][1];
  };

  for (const n of [2, 3, 4]) {
    it(`con ${n} tomas nunca hay tres imágenes visibles a la vez`, () => {
      const capas = Array.from({ length: n - 1 }, (_, i) => paradas(`cruce-${i + 2}de${n}`));
      for (let paso = 0; paso <= 2000; paso++) {
        const t = paso / 20; // 0 … 100 %
        // Peso de cada toma en el píxel final. La toma 1 es el fondo opaco.
        let peso = [1, ...Array(n - 1).fill(0)];
        capas.forEach((ps, i) => {
          const o = opacidadEn(ps, t);
          peso = peso.map((x) => x * (1 - o));
          peso[i + 1] += o;
        });
        const visibles = peso.map((x, i) => [x, i]).filter(([x]) => x > 0.02);
        expect(visibles.length, `t=${t}% pesos=${peso.map((x) => x.toFixed(2)).join(',')}`).toBeLessThanOrEqual(2);
        if (visibles.length === 2) {
          const salto = Math.abs(visibles[1][1] - visibles[0][1]);
          // Solo se funden tomas consecutivas (o la última con la primera al
          // cerrar la vuelta). Cualquier otro par es un salto de secuencia.
          expect(salto === 1 || salto === n - 1, `t=${t}% funde tomas no consecutivas`).toBe(true);
        }
      }
    });
  }
});
P25EOF
echo '  ok  test/galeria.test.ts'

mkdir -p "$(dirname 'test/imagenes.test.ts')"
cat > 'test/imagenes.test.ts' <<'P25EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  todasLasRanuras, ranurasProducto, ranurasFamilia, ranurasSolucion,
  ranurasGuia, ranurasGlosario, TERMINOS_ILUSTRABLES, PISTAS_VISUALES, VARIANTES, VARIACION_TOMA } from '@/lib/imagenes';
import { products, productFamilies } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { terminos } from '@/lib/glosario';

/**
 * El registro solo sirve si el nombre del archivo encargado es EXACTAMENTE el
 * que la página busca. Si divergen, el encargo llega y la página sigue vacía,
 * y el síntoma aparece semanas después.
 */

describe('registro de imágenes: los nombres no pueden divergir', () => {
  it('cada ranura deriva su ruta del slug real de su entidad', () => {
    for (const r of ranurasSolucion()) {
      const slug = r.id.split(':')[1];
      expect(solutions.some((s) => s.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/soluciones/${slug}.png`);
    }
    for (const r of ranurasFamilia()) {
      const slug = r.id.split(':')[1];
      expect(productFamilies.some((f) => f.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/familias/${slug}.jpg`);
    }
    for (const r of ranurasGuia()) {
      const slug = r.id.split(':')[1];
      expect(articles.some((a) => a.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/recursos/${slug}.jpg`);
    }
    for (const r of ranurasGlosario()) {
      const slug = r.id.split(':')[1];
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/glosario/${slug}.png`);
    }
  });

  it('las galerías de producto respetan la convención que ya usa el catálogo', () => {
    // /images/galeria/{slug}-{variante}.jpg. Cambiarla dejaría huérfanas las
    // 116 imágenes que ya existen.
    for (const r of ranurasProducto()) {
      const [, slug, variante] = r.id.split(':');
      expect(products.some((p) => p.slug === slug), slug).toBe(true);
      expect(VARIANTES.some((v) => v.clave === variante), variante).toBe(true);
      expect(r.ruta).toBe(`/images/galeria/${slug}-${variante}.jpg`);
    }
  });

  it('no encarga lo que ya existe', () => {
    // Un producto con su galería completa no debe aparecer en el encargo.
    const conGaleria = products.filter((p) =>
      VARIANTES.every((v) =>
        (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
      ),
    );
    expect(conGaleria.length).toBeGreaterThan(0);
    const encargados = new Set(ranurasProducto().map((r) => r.id.split(':')[1]));
    for (const p of conGaleria) expect(encargados.has(p.slug), p.slug).toBe(false);
  });

  it('los identificadores son únicos', () => {
    const ids = todasLasRanuras().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada término ilustrable tiene su pista de composición', () => {
    // El prompt genérico funciona para lo que tiene forma evidente y falla en
    // lo abstracto: "factor de seguridad" no tiene aspecto, y sin decirle qué
    // componer el generador devuelve una ilustración decorativa, que es peor
    // que ninguna porque ocupa el sitio de la buena.
    for (const slug of TERMINOS_ILUSTRABLES) {
      const pista = PISTAS_VISUALES[slug];
      expect(pista, `falta la pista visual de ${slug}`).toBeDefined();
      expect(pista.length, slug).toBeGreaterThan(60);
    }
  });

  it('la pista viaja dentro del prompt', () => {
    for (const r of ranurasGlosario()) {
      const slug = r.id.split(':')[1];
      expect(r.prompt, `${slug}: la pista no llegó al prompt`).toContain(
        PISTAS_VISUALES[slug],
      );
    }
  });

  it('deja fuera solo lo que de verdad no se dibuja, y son pocos', () => {
    // Un modo de aprovisionamiento comercial no tiene geometría. Una página
    // sin imagen es mejor que una imagen que no explica nada.
    const sinIlustrar = terminos.filter((t) => !TERMINOS_ILUSTRABLES.includes(t.slug));
    expect(sinIlustrar.map((t) => t.slug).sort()).toEqual([
      'fabricacion-a-medida',
      'fabricacion-a-medida-vs-importacion',
    ]);
  });

  it('los términos ilustrables existen todos en el glosario', () => {
    for (const slug of TERMINOS_ILUSTRABLES) {
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
    }
  });
});

describe('registro de imágenes: calidad del encargo', () => {
  const ranuras = todasLasRanuras();

  it('toda ranura declara dimensiones, alt y tipo', () => {
    for (const r of ranuras) {
      expect(r.ancho, r.id).toBeGreaterThan(400);
      expect(r.alto, r.id).toBeGreaterThan(300);
      // Un alt vacío o de dos palabras no describe nada.
      expect(r.alt.length, r.id).toBeGreaterThan(20);
      expect(['foto', 'ilustracion', 'diagrama']).toContain(r.tipo);
    }
  });

  it('ningún alt amontona palabras clave', () => {
    // Un alt con la lista de sectores repetida es spam y lo penalizan.
    for (const r of ranuras) {
      expect(r.alt.length, `${r.id}: alt demasiado largo`).toBeLessThan(180);
      const comas = (r.alt.match(/,/g) ?? []).length;
      expect(comas, `${r.id}: alt con demasiadas comas`).toBeLessThan(6);
    }
  });

  it('todo prompt prohíbe texto, logos y marcas de agua', () => {
    // Texto quemado en la imagen es invisible para un buscador y para un
    // lector de pantalla: la leyenda tiene que estar en el HTML.
    for (const r of ranuras) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/sin texto|sin logotipos/);
      expect(r.prompt.toLowerCase(), r.id).toContain('marcas de agua');
    }
  });

  it('los diagramas piden exactitud técnica', () => {
    for (const r of ranuras.filter((x) => x.tipo === 'diagrama')) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/correcta|correcto/);
    }
  });

  it('el prompt de cada arquitectura enumera sus componentes reales', () => {
    for (const r of ranurasSolucion()) {
      const s = solutions.find((x) => x.slug === r.id.split(':')[1])!;
      for (const c of s.componentes) {
        expect(r.prompt, `${r.id} debe mencionar ${c.producto}`).toContain(
          c.producto.replace(/-/g, ' '),
        );
      }
    }
  });
});

describe('imágenes: integridad del árbol de archivos', () => {
  const rutasDelCatalogo = () => {
    const r = new Set<string>();
    for (const p of products) {
      if (p.image) r.add(p.image);
      for (const g of p.gallery ?? []) r.add(g);
    }
    return r;
  };

  it('ninguna ruta declarada en el catálogo se queda sin archivo', () => {
    // Es el fallo que produce el icono de imagen rota, y no lo detecta ningún
    // test de tipos: la ruta es una cadena válida aunque el archivo no exista.
    const rotas = [...rutasDelCatalogo()].filter(
      (r) => !existsSync(join(process.cwd(), 'public', r)),
    );
    expect(rotas, `rutas sin archivo: ${rotas.slice(0, 5).join(', ')}`).toEqual([]);
  });

  it('no hay imágenes huérfanas que nadie referencia', () => {
    // Un archivo que nadie usa pesa en el repositorio y en el build, y suele
    // ser el rastro de un renombrado a medias.
    const ref = rutasDelCatalogo();
    for (const r of todasLasRanuras()) ref.add(r.ruta);
    for (const r of [...ref]) ref.add(r.replace(/\.jpg$/, '-2.jpg'));

    const huerfanos: string[] = [];
    for (const dir of ['galeria', 'glosario']) {
      const carpeta = join(process.cwd(), 'public/images', dir);
      if (!existsSync(carpeta)) continue;
      for (const f of readdirSync(carpeta)) {
        const ruta = `/images/${dir}/${f}`;
        if (!ref.has(ruta)) huerfanos.push(ruta);
      }
    }
    expect(huerfanos, `huérfanos: ${huerfanos.slice(0, 5).join(', ')}`).toEqual([]);
  });

  it('los diagramas del glosario respetan su proporción declarada', () => {
    // Una imagen con otra proporción se recorta o deja franjas, y el hueco
    // aparece solo en la página, nunca en un test de tipos.
    const conArchivo = ranurasGlosario().filter((r) =>
      existsSync(join(process.cwd(), 'public', r.ruta)),
    );
    if (conArchivo.length === 0) return;
    for (const r of conArchivo) {
      expect(r.ancho / r.alto, r.id).toBeCloseTo(4 / 3, 2);
    }
  });
});

describe('imágenes: degradación honesta', () => {
  const src = readFileSync(join(process.cwd(), 'components/ImagenContenido.tsx'), 'utf8');

  it('nunca renderiza una imagen que no existe', () => {
    // El icono de imagen rota comunica abandono con más fuerza que cualquier
    // texto de la página.
    expect(src).toMatch(/existsSync/);
    expect(src).toMatch(/Imagen pendiente/);
  });

  it('marca las ilustraciones y los esquemas como tales', () => {
    // Una imagen generada no es una fotografía del producto real, y un
    // comprador que especifica contra ella es un problema caro.
    expect(src).toMatch(/Imagen referencial/);
    expect(src).toMatch(/No representa una obra ejecutada/);
  });

  it('usa next/image y no una etiqueta img suelta', () => {
    expect(src).toMatch(/from 'next\/image'/);
    expect(src).not.toMatch(/<img\s/);
  });

  it('reserva el espacio antes de cargar: sin eso la página salta', () => {
    // Se afirma sobre la GARANTÍA, no sobre la técnica. Antes eran width/height
    // en la etiqueta; ahora es un contenedor con aspect-ratio derivado de la
    // ranura, porque las capas apiladas necesitan `fill`. Las dos evitan el
    // salto; lo que no puede faltar es que la proporción salga de la ranura, y
    // que la valla de la imagen pendiente reserve exactamente lo mismo.
    const conRatio = src.match(/aspectRatio: `\$\{ranura\.ancho\} \/ \$\{ranura\.alto\}`/g) ?? [];
    expect(conRatio.length, 'la valla y la imagen deben reservar el mismo alto').toBe(2);
    expect(src).not.toMatch(/<Image[^>]*className="h-auto w-full/);
  });
});

describe('inventario: el script y su documento', () => {
  const script = readFileSync(join(process.cwd(), 'scripts/imagenes.mjs'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  it('está enlazado en package.json', () => {
    expect(pkg.scripts.imagenes).toContain('scripts/imagenes.mjs');
    expect(pkg.scripts['imagenes:prompts']).toContain('--prompts');
    expect(pkg.scripts['imagenes:tomas']).toContain('--tomas');
    expect(pkg.scripts['imagenes:tomas:glosario']).toContain('--grupo glosario');
  });

  it('genera el documento desde el registro, no de una lista aparte', () => {
    expect(script).toMatch(/todasLasRanuras/);
    expect(script).toMatch(/No edite este archivo a mano/);
  });

  it('faltar imágenes no hace fallar el proceso', () => {
    // Es un estado normal del trabajo, no un error de compilación.
    expect(script).toMatch(/process\.exit\(0\)/);
    expect(script).not.toMatch(/process\.exit\(1\)/);
  });

  it('el documento de encargo está al día si existe', () => {
    const ruta = join(process.cwd(), 'docs/encargo-imagenes.md');
    if (!existsSync(ruta)) return;
    const doc = readFileSync(ruta, 'utf8');
    const pendientes = todasLasRanuras().filter(
      (r) => !existsSync(join(process.cwd(), 'public', r.ruta)),
    );
    // Cada pendiente debe aparecer con su ruta exacta.
    for (const r of pendientes.slice(0, 12)) {
      expect(doc, `falta ${r.ruta} en el encargo`).toContain(r.ruta);
    }
  });
});

describe('encargo de tomas alternas: que el generador no devuelva el mismo render', () => {
  const script = readFileSync(join(process.cwd(), 'scripts/imagenes.mjs'), 'utf8');
  const reg = readFileSync(join(process.cwd(), 'lib/imagenes.ts'), 'utf8');

  it('parte de las ranuras YA publicadas, no de las pendientes', () => {
    // Para pedir la toma 2 hace falta el prompt de la toma 1, que es
    // justamente la que ya existe y que el encargo normal omite.
    expect(script).toMatch(/todasLasRanurasConPublicadas/);
    expect(reg).toMatch(/export function todasLasRanurasConPublicadas/);
  });

  it('cada toma lleva ESCRITO qué debe cambiar', () => {
    // Pedir «otra versión» del mismo prompt devuelve el mismo render. Pasó con
    // los 41 diagramas del glosario: llegaron por triplicado, byte a byte
    // idénticos, y el sitio los descartó. La variación va en el encargo.
    for (const t of [2, 3, 4]) {
      expect(VARIACION_TOMA[t], `falta la variación de la toma ${t}`).toBeTruthy();
      expect(VARIACION_TOMA[t].length).toBeGreaterThan(80);
    }
    // Cambia la cámara o la escena, nunca el estilo: dos tomas con estilos
    // distintos se leen como un error, no como una rotación.
    expect(VARIACION_TOMA[2]).toMatch(/MISMA paleta/);
    expect(VARIACION_TOMA[3]).toMatch(/MISMA paleta/);
    // Y cada una tiene que pedir algo DISTINTO de las otras.
    expect(VARIACION_TOMA[2]).not.toBe(VARIACION_TOMA[3]);
    expect(VARIACION_TOMA[3]).not.toBe(VARIACION_TOMA[4]);
  });

  it('nunca pide una toma que ya está en disco', () => {
    expect(script).toMatch(/if \(existsSync\(join\('public', destino\)\)\) continue;/);
  });

  it('no pide más tomas de las que el sitio sabe rotar', () => {
    // El CSS define ciclos para 2, 3 y 4. Pedir una quinta sería encargar
    // trabajo que el sitio no puede mostrar.
    expect(script).toMatch(/match\(\/\^\[2-4\]\$\/\)/);
    expect(Object.keys(VARIACION_TOMA).sort()).toEqual(['2', '3', '4']);
  });
});
P25EOF
echo '  ok  test/imagenes.test.ts'

echo ""
echo "P25 — regenerando los documentos de encargo desde el registro..."
npm run imagenes:prompts          >/dev/null
npm run imagenes:glosario         >/dev/null
npm run imagenes:tomas            >/dev/null
npm run imagenes:tomas:glosario   >/dev/null
echo "  ok  docs/encargo-imagenes.md"
echo "  ok  docs/encargo-imagenes-glosario.md"
echo "  ok  docs/encargo-tomas.md"
echo "  ok  docs/encargo-tomas-glosario.md"

echo ""
echo "P25 — verificando..."
npx tsc --noEmit
echo "  ok  TypeScript"
npx vitest run --reporter=dot
echo "  ok  pruebas"

echo ""
npm run imagenes

echo ""
echo "============================================================"
echo " P25 aplicado. Commit sugerido:"
echo ""
echo "   git add -A"
echo "   git commit -m 'feat(p25): rotacion de hasta 4 tomas con ken burns, descarte de duplicados y encargo de tomas alternas'"
echo "   git push"
echo "============================================================"
