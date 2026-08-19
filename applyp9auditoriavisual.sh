#!/usr/bin/env bash
# =============================================================================
# P9 — AUDITORÍA VISUAL AUTOMÁTICA Y LAS 6 FALLAS QUE ENCONTRÓ
#
# Plastilonas Peruanas SAC. Aplica sobre main en 1a74812 o posterior.
#
# Los fallos de interfaz no los detectan TypeScript, el linter ni los tests
# unitarios: se detectan mirando. Este parche añade un script que mira por
# nosotros —52 vistas: 13 rutas x claro/oscuro x escritorio/movil, midiendo el
# contraste WCAG real de cada nodo de texto— y corrige lo que encontró:
#
#   1.81:1  cuerpo de texto de las 12 paginas de ciudad (escala neutral-* sin
#           mapear en oscuro: practicamente invisible)
#   1.01:1  titulo del formulario de cotizacion (text-navy sin mapear)
#   2.87:1  verde de marca: en claro se oscurece a #047857 por accesibilidad,
#           y esa misma correccion lo hunde sobre fondo oscuro
#   2.54:1  tarjetas-enlace que se quedaban blancas mientras su texto interior
#           se remapeaba a la paleta oscura
#   1.98:1  verde de WhatsApp #25D366 usado como color de TEXTO en /contacto
#   3.30:1  CTA de ciudad en bg-green-600, fuera del sistema de diseño
#
# Resultado medido: claro 4 -> 1 clases con fallo, oscuro 35 -> 1.
# Cero desbordamiento horizontal, cero imagenes sin alt, en las 52 vistas.
#
# El script queda como TRINQUETE: docs/ui-audit-baseline.json fija la linea
# base y la auditoria falla si alguien la empeora.
#
# Uso:   bash apply-p9-auditoria-visual.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -f app/globals.css ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Creando directorios"
mkdir -p scripts docs

echo "==> Escribiendo app/globals.css"
cat > 'app/globals.css' <<'PP_EOF'
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
  animation: kenburns 22s ease-in-out infinite alternate;
  transform-origin: center;
  will-change: transform;
}
.ken-burns-wrap:nth-of-type(3n) .ken-burns   { animation-duration: 26s; animation-delay: -6s; transform-origin: top left; }
.ken-burns-wrap:nth-of-type(3n+1) .ken-burns { animation-duration: 20s; animation-delay: -3s; transform-origin: bottom right; }
@keyframes kenburns {
  from { transform: scale(1.02) translate(0, 0); }
  to   { transform: scale(1.14) translate(-1.5%, 1.5%); }
}
/* En hover intensifica un pelín la sensación de vida */
.group:hover .ken-burns { animation-duration: 12s; }

@media (prefers-reduced-motion: reduce) {
  .ken-burns { animation: none !important; transform: scale(1.02); }
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
PP_EOF

echo "==> Escribiendo app/contacto/page.tsx"
cat > 'app/contacto/page.tsx' <<'PP_EOF'
'use client';

import Link from 'next/link';
import WhatsAppLink from '@/components/WhatsAppLink';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { buildContactMessage, openWhatsApp } from '@/lib/whatsapp';

const contactSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  telefono: z.string().min(9),
  asunto: z.string().min(5),
  mensaje: z.string().min(20),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    // Envío real vía WhatsApp: el mensaje llega de verdad al equipo comercial.
    openWhatsApp(
      buildContactMessage({
        nombre: data.nombre,
        email: data.email,
        asunto: data.asunto,
        mensaje: `${data.mensaje} (Tel: ${data.telefono})`,
      })
    );
    toast.success('Su mensaje está listo en WhatsApp', {
      description: 'Pulse enviar en la ventana de WhatsApp para completar el envío.',
    });
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="max-w-2xl mb-12">
        <h1 className="t-display font-semibold text-[#0A2540]">Hablemos de su proyecto</h1>
        <p className="mt-4 text-xl text-gray-600">Estamos listos para ayudarle. Complete el formulario o contáctenos directamente por los canales preferidos.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-x-16 gap-y-14">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <input {...register('nombre')} placeholder="Nombre completo" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <input {...register('email')} type="email" placeholder="Correo electrónico" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <input {...register('telefono')} placeholder="Teléfono / WhatsApp" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>}
              </div>
              <div>
                <input {...register('asunto')} placeholder="Asunto de su consulta" className="form-input w-full px-5 py-3.5 border border-gray-200 rounded-2xl" />
                {errors.asunto && <p className="text-xs text-red-500 mt-1">{errors.asunto.message}</p>}
              </div>
            </div>

            <div>
              <textarea {...register('mensaje')} rows={6} placeholder="Cuéntenos sobre su proyecto o consulta..." className="form-input w-full px-5 py-4 border border-gray-200 rounded-3xl resize-y" />
              {errors.mensaje && <p className="text-xs text-red-500 mt-1">{errors.mensaje.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-400 transition-all text-white px-14 py-4 rounded-2xl font-semibold text-sm active:scale-[0.985]">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-8 text-sm">
          <div>
            <div className="font-semibold tracking-tight text-lg mb-4 text-[#0A2540]">Información de contacto</div>
            
            <div className="space-y-5">
              <a href="tel:+51998117065" className="flex gap-4 group">
                <Phone className="mt-0.5 text-[#059669]" /> 
                <div>
                  <div className="font-medium">+51 998 117 065</div>
                  <div className="text-xs text-gray-500">Central telefónica</div>
                </div>
              </a>
              <WhatsAppLink context="contacto" message="Hola, quisiera información sobre sus productos." className="flex gap-4 group">
                <Phone className="mt-0.5 text-[#047857]" /> 
                <div>
                  <div className="font-medium text-[#047857]">+51 946 085 270 (WhatsApp)</div>
                  <div className="text-xs text-gray-500">Atención inmediata 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex gap-4 group">
                <Mail className="mt-0.5 text-[#059669]" /> 
                <div>ventas@plastilonas.com</div>
              </a>
            </div>
          </div>

          <div>
            <div className="font-semibold tracking-tight text-lg mb-4 text-[#0A2540]">Ubicación</div>
            <div className="flex gap-4">
              <MapPin className="mt-0.5 text-[#059669] flex-shrink-0" />
              <div className="text-gray-600 leading-snug">
                Calle Alameda del Remero Mz - V, Lt - 2<br />
                Urb. Los Huertos de Villa, Chorrillos<br />
                Lima, Perú
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-4 text-xs text-gray-500">
              <Clock className="mt-0.5" /> 
              <div>Horario de atención: Lunes a Viernes 8:00 am - 6:00 pm<br />Sábados 8:00 am - 1:00 pm</div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/cotizacion" className="block text-center bg-[#059669] hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-semibold text-sm">Ir al formulario de cotización →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/local/[ciudad]/page.tsx"
cat > 'app/local/[ciudad]/page.tsx' <<'PP_EOF'
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ciudades from "@/data/ciudades.json";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import { breadcrumbSchema, faqSchema, serviceSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import WhatsAppLink from "@/components/WhatsAppLink";
import TrackView from "@/components/TrackView";

type Ciudad = { slug: string; ciudad: string; departamento: string; region: string;
  clima: string; contextoLocal: string; usosPrincipales: string[]; sectoresDemanda: string[]; };
const CIUDADES = ciudades as Ciudad[];

export const revalidate = 86400;   // ISR: daily
export const dynamicParams = false; // only curated cities exist — no thin doorway pages

export function generateStaticParams() { return CIUDADES.map((c) => ({ ciudad: c.slug })); }
function get(slug: string) { return CIUDADES.find((c) => c.slug === slug); }

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params; const c = get(ciudad); if (!c) return {};
  const title = `Plastilonas y mantas plásticas en ${c.ciudad} | ${SITE.name}`;
  const description = `Fabricación y venta de plastilonas, lonas, cobertores e impermeabilización en ${c.ciudad}, ${c.departamento}. ${c.usosPrincipales.slice(0,2).join(", ")} y más. Cotiza por WhatsApp.`;
  const url = `${SITE.url}/local/${c.slug}`;
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, locale: "es_PE", type: "website" } };
}

function faqsFor(c: Ciudad) {
  return [
    { q: `¿Venden plastilonas y cobertores en ${c.ciudad}?`,
      a: `Sí. Atendemos pedidos en ${c.ciudad} y todo ${c.departamento} con despacho nacional. Escríbenos por WhatsApp para cotizar medidas y cantidades.` },
    { q: `¿Qué productos se usan más en ${c.ciudad}?`,
      a: `Predominan usos como ${c.usosPrincipales.join(", ").toLowerCase()}. Contexto local: ${c.clima.toLowerCase()}` },
    { q: `¿Hacen medidas a pedido?`,
      a: `Sí, fabricamos a medida. Las especificaciones exactas (espesor, color, resistencia UV) se confirman por cotización según disponibilidad.` },
  ];
}

export default async function CiudadPage({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params; const c = get(ciudad); if (!c) notFound();
  const url = `${SITE.url}/local/${c.slug}`; const faqs = faqsFor(c);
  // Enlazado interno real: productos cuyos sectores coinciden con la demanda
  // documentada de la ciudad. Sin coincidencia se cae a los destacados.
  const porSector = products.filter((p) => p.sector.some((s) => c.sectoresDemanda.includes(s)));
  const relacionados = (porSector.length ? porSector : products.filter((p) => p.featured)).slice(0, 6);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <TrackView kind="city" ciudad={c.ciudad} />
      <JsonLd data={[
        // Un solo nodo LocalBusiness vive en components/StructuredData.tsx; aquí
        // se referencia. Antes se redeclaraba con @id propio (#localbusiness),
        // fragmentando la entidad. La señal local correcta es Service+areaServed.
        webPageSchema({ url, name: `Plastilonas, lonas y cobertores en ${c.ciudad}`,
          description: c.contextoLocal, speakable: [".speakable-intro"],
          breadcrumbId: `${url}#breadcrumb` }),
        serviceSchema({
          name: `Fabricación y despacho de soluciones textiles industriales en ${c.ciudad}`,
          description: `Plastilonas, lonas, cobertores, geosintéticos y mallas fabricados a medida y despachados a ${c.ciudad}, ${c.departamento}. ${c.contextoLocal}`,
          url, cityName: c.ciudad, regionName: c.departamento,
          serviceTypes: c.usosPrincipales,
        }),
        breadcrumbSchema([{ name: "Inicio", url: `${SITE.url}/` },
          { name: "Cobertura local", url: `${SITE.url}/local` }, { name: c.ciudad, url }],
          `${url}#breadcrumb`),
        faqSchema(faqs, url),
      ]} />
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link> /{" "}
        <Link href="/local" className="hover:text-[#059669]">Cobertura local</Link> /{" "}
        <span>{c.ciudad}</span>
      </nav>
      <h1 className="mb-4 text-3xl font-bold">Plastilonas, lonas y cobertores en {c.ciudad}</h1>
      <p className="speakable-intro mb-6 text-lg">{SITE.name} fabrica y suministra plastilonas, mantas
        plásticas, cobertores e impermeabilización para {c.ciudad}, {c.departamento}. {c.contextoLocal}</p>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Usos más frecuentes en {c.ciudad}</h2>
        <ul className="list-disc space-y-1 pl-6">{c.usosPrincipales.map((u) => <li key={u}>{u}</li>)}</ul></section>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Sectores que atendemos</h2>
        <p>{c.sectoresDemanda.join(" · ")}</p><p className="mt-2 text-neutral-600">Clima local: {c.clima}</p></section>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Preguntas frecuentes</h2>
        <dl className="space-y-4">{faqs.map((f) => (<div key={f.q}>
          <dt className="font-semibold">{f.q}</dt><dd className="text-neutral-700">{f.a}</dd></div>))}</dl></section>
      {relacionados.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">Productos más solicitados en {c.ciudad}</h2>
          <p className="mb-4 text-neutral-600">
            Seleccionados por los sectores que concentran la demanda local
            ({c.sectoresDemanda.join(", ")}). Todos se fabrican a medida y se despachan a {c.departamento}.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {relacionados.map((p) => (
              <li key={p.slug}>
                <Link href={`/productos/${p.slug}`}
                  className="group block rounded-2xl border border-neutral-200 p-4 transition-colors hover:border-[#059669]/40">
                  <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">{p.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-neutral-600">{p.shortDescription}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <WhatsAppLink context={`ciudad:${c.slug}`}
          message={`Hola, necesito una cotización de plastilonas en ${c.ciudad}.`}
          className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]">
          Cotizar por WhatsApp
        </WhatsAppLink>
        <Link href="/local" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]">
          Ver las {CIUDADES.length} ciudades
        </Link>
      </div>
    </main>
  );
}
PP_EOF

echo "==> Escribiendo test/dark-mode.test.ts"
cat > 'test/dark-mode.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

/**
 * El modo oscuro del sitio funciona con una capa de compatibilidad en
 * globals.css: los componentes escriben utilidades literales (bg-white,
 * text-gray-800…) y esa capa las remapea a los tokens del tema dentro de
 * <main>. Si la capa no cubre un tipo de elemento, ese elemento se queda
 * BLANCO sobre página oscura y su texto desaparece.
 *
 * Ocurrió de verdad: el encabezado y la primera columna de las tablas
 * comparativas (th) y el bloque "En resumen" de las guías (text-gray-800)
 * quedaban ilegibles. Estos tests fijan la cobertura.
 */
describe('modo oscuro: cobertura de la capa de compatibilidad', () => {
  const surfaceRule =
    css.match(/\.dark main :is\(([^)]*)\)\.bg-white \{/)?.[1] ?? '';

  it('la regla de superficie cubre tablas, celdas, chips y párrafos', () => {
    for (const tag of ['div', 'section', 'article', 'li', 'p', 'span', 'th', 'td', 'table', 'tr']) {
      expect(surfaceRule, `falta ${tag} en la capa oscura`).toContain(tag);
    }
  });

  it('bg-gray-50 y bg-gray-100 tienen la misma cobertura que bg-white', () => {
    const grayRule = css.match(/\.dark main :is\(([^)]*)\)\.bg-gray-50/)?.[1] ?? '';
    for (const tag of ['th', 'td', 'span', 'p']) {
      expect(grayRule, `falta ${tag} en bg-gray-50`).toContain(tag);
    }
  });

  it('text-gray-800 es tinta principal, no secundaria', () => {
    // Mapearla a --text-muted dejaba el resumen de cada guía casi ilegible.
    expect(css).toMatch(/\.dark main :is\(\.text-gray-800, \.text-gray-900\) \{ color: var\(--text\)/);
  });

  it('text-gray-400 sigue siendo tenue pero legible', () => {
    expect(css).toMatch(/\.dark main :is\(\.text-gray-400, \.text-neutral-400\)/);
  });

  it('la escala neutral está cubierta igual que la gray', () => {
    // Las 12 páginas de ciudad usan neutral-*: sin esto, su cuerpo de texto
    // quedaba en 1.81:1 sobre fondo oscuro.
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-500, \.text-neutral-600, \.text-neutral-700\)/);
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-800, \.text-neutral-900\)/);
    expect(css).toContain('.border-neutral-300');
  });

  it('la capa oscura iguala la fuerza de la capa AA de modo claro', () => {
    // La capa AA de claro usa !important. Sin !important, las reglas oscuras
    // perdían y el texto conservaba el color pensado para fondo blanco.
    const oscuras = css.match(/\.dark main :is\(\.text-gray-500[^\n]*/)?.[0] ?? '';
    expect(oscuras).toContain('!important');
  });

  it('el verde de marca se aclara en oscuro en vez de oscurecerse', () => {
    // #047857 cumple AA sobre blanco y falla (2.87:1) sobre la página oscura.
    expect(css).toMatch(/\.dark main :is\(\.text-\\\[\\#059669\\\]/);
    expect(css).toContain('var(--brand-hover) !important');
  });

  it('la excepción del CTA blanco exige la tinta navy en el PROPIO elemento', () => {
    // Con selector por descendencia, las tarjetas-enlace forzaban su título a
    // navy sobre superficie oscura (1.01:1).
    expect(css).not.toMatch(/\.dark main :is\(a, button\)\.bg-white \.text-/);
  });

  it('los CTA blancos sobre bloques oscuros siguen siendo blancos', () => {
    // Esta excepción debe ir DESPUÉS de la regla general o el botón blanco
    // del hero y de los CTA se volvería una superficie oscura.
    const generic = css.indexOf('.dark main :is(div, section, article, aside, li, p, span');
    const exception = css.indexOf('.dark main :is(a, button).bg-white');
    expect(generic).toBeGreaterThan(-1);
    expect(exception).toBeGreaterThan(generic);
  });
});
PP_EOF

echo "==> Escribiendo scripts/audit-ui.mjs"
cat > 'scripts/audit-ui.mjs' <<'PP_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
PP_EOF

echo "==> Escribiendo docs/ui-audit-baseline.json"
cat > 'docs/ui-audit-baseline.json' <<'PP_EOF'
{
  "contrasteClaro": 1,
  "contrasteOscuro": 1,
  "desbordamiento": 0,
  "imagenesSinAlt": 0
}
PP_EOF

echo "==> Escribiendo DESIGN-CONSISTENCY-AUDIT.md"
cat > 'DESIGN-CONSISTENCY-AUDIT.md' <<'PP_EOF'
# Auditoría de Consistencia de Diseño — Plastilonas Peruanas SAC

Análisis medido del sistema visual del sitio, con un plan de remediación por
fases y calificado por riesgo. El objetivo es una interfaz perfectamente
alineada (botones, encabezados, colores, espaciado, footer) en móvil y web —
sin romper el trabajo de accesibilidad y modo oscuro ya logrado.

---

## 1. Hallazgos (medidos, no estimados)

| # | Inconsistencia | Magnitud | Qué ve el cliente |
|---|----------------|----------|-------------------|
| 1 | **Literales de color hex** en vez de tokens | **298 usos en 39 archivos** | Nada visible hoy (una capa `!important` los normaliza), pero el color puede desviarse en cada edición |
| 2 | **Padding de botones** ad-hoc | **12+ combinaciones** (`px-4 py-3`, `px-6 py-3`, `px-8 py-3`, `px-9 py-4`…) | Botones de distinta altura/ancho entre secciones |
| 3 | **Ritmo vertical de sección** | **4 valores** (`py-20` ×7, `py-16` ×7, `py-24` ×5, `py-12` ×2) | Espaciado desigual entre bloques |
| 4 | **Radio de esquinas** | **5 valores** (`rounded-2xl` ×68, `rounded-3xl` ×32, `rounded-xl` ×11, `rounded-lg` ×2, `rounded-full` ×50) | Tarjetas con esquinas que no combinan |
| 5 | **`globals.css` por acumulación** | 542 líneas, bloques `@media` duplicados | Mantenimiento frágil; reglas que se pisan |
| 6 | **Bug de mayúsculas en color** | `#34d399` vs `#34D399` | Dos clases CSS para el mismo color |

## 2. La restricción crítica (por esto NO se migra a ciegas)

Los literales de color **son estructurales**. La capa de overrides en
`globals.css` se ancla a los nombres de clase literales exactos:

```css
.text-\[\#059669\] { color: #047857 !important; }         /* corrige contraste WCAG AA */
.dark main .text-\[\#0A2540\] { color: var(--text); }      /* adapta a modo oscuro */
```

Consecuencia: cambiar `text-[#059669]` → `text-brand` en un componente
**revierte silenciosamente la corrección de contraste** (vuelve a 3.77:1, falla
AA) y `text-[#0A2540]` → `text-navy` dentro de `<main>` **rompe el modo
oscuro** (texto navy sobre fondo oscuro). Una refactorización masiva y a ciegas
dañaría el sitio. La migración debe hacerse por componente, retirando el
override correspondiente en el mismo paso, y verificando en `dev`.

## 3. Lo que ya se corrigió (en este parche — seguro y verificado)

- **Deduplicado `globals.css`**: eliminado el bloque `@media (max-width:640px)`
  duplicado y el trío `.product-card` repetido. Las reglas sobreviven en su
  primera aparición → **cero cambio visual** (542 → 526 líneas).
- **Bug de mayúsculas**: `#34d399` → `#34D399` en `MachineryGallery.tsx`.
- **Paleta de tokens completa** en `tailwind.config.ts` (aditivo, sin riesgo):
  `navy`, `brand` (+`brand.text` = `#047857` con contraste AA verificado,
  +`brand.emerald`), `amber`, `whatsapp`. Es el **destino** de la migración.
- Verificado: `tsc` limpio, 27 tests pasan, `next build` exit 0, 69 páginas.

## 4. Plan de remediación por fases (calificado por riesgo)

### Fase 1 — Fundación de tokens · RIESGO BAJO · *hecho en este parche*
Paleta en config + `brand.text` accesible. No cambia nada renderizado; da a los
componentes un token correcto al cual migrar.

### Fase 2 — Migración de color por componente · RIESGO MEDIO · *siguiente*
Por cada componente, en un solo paso atómico y verificado en `dev`:
1. `text-[#0A2540]` → `text-navy dark:text-white`
2. `text-[#059669]` → `text-brand-text` (ya es `#047857`, retira el override)
3. `bg-[#0A2540]` → `bg-navy`, etc.
4. Retirar la regla `!important`/`dark main` correspondiente de `globals.css`.
5. Comparar en `dev` claro y oscuro antes de pasar al siguiente.

Orden sugerido (de menor a mayor riesgo): `SectionHeading` (2 literales, es el
encabezado unificado) → `Footer` → `ProductCard` → `Navbar` → `page.tsx`.

### Fase 3 — Unificación de forma · RIESGO MEDIO
- Botones: migrar los 12+ patrones a `.btn` / `.btn-sm` / `.btn-lg`
  (una definición, altura táctil 44px uniforme). Migrar por página, revisando
  que ningún tamaño intencional se rompa.
- Secciones: `py-16/20/24` → `.section-pad` (2 valores: desktop 5rem, móvil 3rem).
- Radios: estandarizar a 2 valores — tarjetas `rounded-2xl`, acciones `rounded-full`.

### Fase 4 — Cumplimiento automático · RIESGO BAJO
Regla ESLint que prohíbe nuevos literales `-[#...]` en `className`, para que la
consistencia no se vuelva a erosionar. Convierte la disciplina en garantía de CI.

## 5. Por qué este orden gana el mercado

La capa `!important` de hoy funciona pero es deuda: cada nueva página exige otro
override. Al mover la verdad a tokens, el modo oscuro, el contraste AA y la
identidad de marca quedan garantizados por construcción — el sitio se ve
impecable en móvil y web, y **escala** sin volver a introducir inconsistencias.
La consistencia deja de ser una tarea de limpieza recurrente y pasa a ser una
propiedad del sistema.

---

## 6. Auditoría automática de interfaz (añadido)

Los fallos visuales no los detectan TypeScript, el linter ni los tests
unitarios: se detectan mirando. `scripts/audit-ui.mjs` mira por nosotros.

Recorre 13 rutas representativas en **claro y oscuro**, en **escritorio y
móvil** (52 vistas), y en cada una mide el contraste WCAG real de cada nodo de
texto contra su fondo efectivo, además de desbordamiento horizontal, objetivos
táctiles diminutos e imágenes sin `alt`.

```bash
npm i -D playwright && npx playwright install chromium   # una sola vez
npm run build && npx next start -p 3100 &
BASE=http://localhost:3100 npm run audit:ui
```

`docs/ui-audit-baseline.json` guarda la línea base. El script **falla** si el
número de clases con fallo sube por encima de ella: es un trinquete, la
interfaz solo puede mejorar. Para bajar la línea base tras una corrección:
`npm run audit:ui -- --update`.

### Lo que encontró en su primera ejecución

| Hallazgo | Medida | Dónde |
|---|---|---|
| Cuerpo de texto en `neutral-*` sin mapear en oscuro | **1.81:1** | 12 páginas de ciudad |
| Título del formulario de cotización (`text-navy`) | **1.01:1** | /cotizacion, oscuro |
| Verde de marca oscurecido también en tema oscuro | **2.87:1** | home, catálogo |
| Tarjetas-enlace blancas con tinta clara dentro | **2.54:1** | home, oscuro |
| WhatsApp `#25D366` como color de texto | **1.98:1** | /contacto, claro |
| CTA de ciudad en `bg-green-600` | **3.30:1** | 12 páginas de ciudad |

Resultado tras la corrección: **claro 4 → 1 clases, oscuro 35 → 1**, sin
desbordamiento horizontal y sin imágenes sin `alt` en ninguna de las 52 vistas.

### La lección que dejó

La capa AA de modo claro usa `!important`. Cualquier regla del tema oscuro que
la contradiga **debe llevar `!important` también**, o pierde en silencio: el
texto conserva el color calculado para fondo blanco. Y la excepción del CTA
blanco debe exigir la tinta navy en el **propio** elemento; con selector por
descendencia arrastra a las tarjetas-enlace y las rompe.
PP_EOF

echo "==> Registrando el script npm run audit:ui"
node - <<'PP_EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.scripts['audit:ui']) {
  console.log('   = package.json: ya registrado');
} else {
  pkg.scripts['audit:ui'] = 'node scripts/audit-ui.mjs';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('   + package.json: audit:ui');
}
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 12 test files / 133 tests."
echo ""
echo " La auditoría visual es OPCIONAL y no se instala sola"
echo " (descarga un navegador). Cuando quiera ejecutarla:"
echo "   npm i -D playwright && npx playwright install chromium"
echo "   npx next start -p 3100 &"
echo "   BASE=http://localhost:3100 npm run audit:ui"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'fix(ui): contraste WCAG en claro y oscuro + auditoria visual automatica'"
echo "   git push origin main"
echo "=============================================================="
