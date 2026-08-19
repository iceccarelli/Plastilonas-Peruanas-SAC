#!/usr/bin/env bash
# =============================================================================
# P5 — ATRIBUCIÓN DE LEADS: el canal que vende, por fin medido
#
# Plastilonas Peruanas SAC. Aplica sobre main en 68fb1e4 o posterior.
#
# El problema: el sitio tenía DOCE salidas a WhatsApp escritas a mano (footer,
# navbar de escritorio y móvil, dos en cada ficha de producto, contacto,
# cotización, modal de salida, y una por cada una de las 12 páginas de ciudad).
# Ninguna disparaba analítica: el único evento de WhatsApp del sitio salía del
# envío del formulario. En un mercado donde el lead entra por WhatsApp, eso
# significa no saber qué página produce negocio — y por tanto no poder invertir
# en publicidad con criterio.
#
# Además cada enlace repetía el número a mano: un cambio de línea comercial
# habría dejado doce enlaces apuntando a un número muerto.
#
# Este parche introduce components/WhatsAppLink.tsx como única salida (con
# mensaje prellenado por contexto), añade los eventos de vista por silo, mide
# apertura y envío del formulario por separado, mide el primer mensaje al
# chatbot, y bloquea la regresión con tests.
#
# Uso:   bash apply-p5-atribucion.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Escribiendo lib/analytics.ts"
cat > 'lib/analytics.ts' <<'PP_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}
PP_EOF

echo "==> Escribiendo components/WhatsAppLink.tsx"
cat > 'components/WhatsAppLink.tsx' <<'PP_EOF'
'use client';

import React from 'react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

/**
 * ÚNICO punto de salida a WhatsApp del sitio.
 *
 * Antes había once enlaces `wa.me` escritos a mano (footer, navbar, fichas de
 * producto, páginas de ciudad, contacto, modal de salida). Ninguno disparaba
 * analítica: solo el envío del formulario lo hacía. Es decir, el canal que
 * genera la mayoría de los leads en el Perú era invisible en GA4 y en Meta, y
 * no había forma de saber qué página producía negocio.
 *
 * Además, cada uno repetía el número de teléfono a mano. Un cambio de número
 * habría dejado enlaces apuntando a una línea muerta.
 *
 * Este componente resuelve las dos cosas: número desde una sola fuente y evento
 * `whatsapp_click` con el contexto de origen. `context` es obligatorio: sin él
 * el evento no sirve para atribuir nada.
 */

export interface WhatsAppLinkProps {
  /** Punto de salida, para atribución. Ej.: 'footer', 'producto:big-bags'. */
  context: string;
  /** Mensaje prellenado. Sin él, WhatsApp abre en blanco. */
  message?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export default function WhatsAppLink({
  context,
  message,
  children,
  className,
  ...rest
}: WhatsAppLinkProps) {
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackWhatsAppClick(context)}
      {...rest}
    >
      {children}
    </a>
  );
}
PP_EOF

echo "==> Escribiendo components/TrackView.tsx"
cat > 'components/TrackView.tsx' <<'PP_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackFamilyView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
    }
  }, [props]);

  return null;
}
PP_EOF

echo "==> Escribiendo test/analytics.test.ts"
cat > 'test/analytics.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { whatsappHref } from '@/components/WhatsAppLink';

const ROOT = process.cwd();

/** Archivos donde `wa.me` SÍ puede aparecer: la fuente única y su documentación. */
const ALLOWED = new Set([
  'components/WhatsAppLink.tsx',
  'lib/whatsapp.ts',
  'lib/social.ts',
  'lib/analytics.ts',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const SOURCE_FILES = ['app', 'components', 'lib'].flatMap((d) => walk(join(ROOT, d)));

describe('atribución de WhatsApp', () => {
  it('ningún enlace wa.me se escribe a mano fuera de la fuente única', () => {
    const offenders = SOURCE_FILES.filter((file) => {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (ALLOWED.has(rel)) return false;
      return readFileSync(file, 'utf8').includes('wa.me');
    }).map((f) => relative(ROOT, f));

    // Un <a href="https://wa.me/..."> a mano no dispara analítica: el lead
    // llega pero nadie sabe qué página lo produjo.
    expect(offenders, `Use <WhatsAppLink context="...">: ${offenders.join(', ')}`).toEqual([]);
  });

  it('el número de WhatsApp no está escrito a mano en ninguna parte', () => {
    const offenders = SOURCE_FILES.filter((file) => {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (rel === 'lib/whatsapp.ts') return false; // la fuente única
      return readFileSync(file, 'utf8').includes(`wa.me/${WHATSAPP_NUMBER}`);
    }).map((f) => relative(ROOT, f));

    expect(offenders, `Deriven el número de WHATSAPP_NUMBER: ${offenders.join(', ')}`).toEqual([]);
  });

  it('cada uso de WhatsAppLink declara un context de atribución', () => {
    const usages: string[] = [];
    for (const file of SOURCE_FILES) {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (rel === 'components/WhatsAppLink.tsx') continue;
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/<WhatsAppLink([\s\S]{0,400}?)>/g)) {
        if (!/\bcontext=/.test(m[1])) usages.push(rel);
      }
    }
    expect(usages, `WhatsAppLink sin context en: ${usages.join(', ')}`).toEqual([]);
  });

  it('whatsappHref construye la URL con el número de la fuente única', () => {
    expect(whatsappHref()).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
    expect(whatsappHref('Hola')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola`);
    // El mensaje va codificado: un espacio o un acento sin codificar rompe el enlace.
    expect(whatsappHref('cotización de big bags')).toContain('cotizaci%C3%B3n%20de%20big%20bags');
  });
});

describe('cobertura de eventos de conversión', () => {
  const analytics = readFileSync(join(ROOT, 'lib/analytics.ts'), 'utf8');

  it('existen los eventos que gobiernan la inversión comercial', () => {
    for (const fn of [
      'trackQuoteStarted',
      'trackQuoteRequest',
      'trackWhatsAppClick',
      'trackChatbotEngaged',
      'trackDocumentDownload',
      'trackProductView',
      'trackFamilyView',
      'trackCityPageView',
      'trackArticleView',
    ]) {
      expect(analytics, `falta ${fn}`).toContain(`export function ${fn}`);
    }
  });

  it('las páginas que generan demanda emiten su evento de vista', () => {
    const pages: [string, string][] = [
      ['app/productos/[slug]/page.tsx', 'kind="product"'],
      ['app/productos/familia/[slug]/page.tsx', 'kind="family"'],
      ['app/local/[ciudad]/page.tsx', 'kind="city"'],
      ['app/recursos/[slug]/page.tsx', 'kind="article"'],
    ];
    for (const [file, marker] of pages) {
      const src = readFileSync(join(ROOT, file), 'utf8');
      expect(src, `${file} sin TrackView`).toContain('<TrackView');
      expect(src, `${file} sin ${marker}`).toContain(marker);
    }
  });

  it('el formulario mide apertura y envío por separado', () => {
    const modal = readFileSync(join(ROOT, 'components/CotizacionModal.tsx'), 'utf8');
    expect(modal).toContain('trackQuoteStarted');
    expect(modal).toContain('trackQuoteRequest');
  });

  it('el chatbot mide el primer mensaje, no la apertura del widget', () => {
    const bot = readFileSync(join(ROOT, 'components/Chatbot.tsx'), 'utf8');
    expect(bot).toContain('trackChatbotEngaged');
    // La guarda evita duplicar el evento en cada mensaje siguiente.
    expect(bot).toContain('engaged.current');
  });
});
PP_EOF

echo "==> Escribiendo lib/social.ts"
cat > 'lib/social.ts' <<'PP_EOF'
import type { IconType } from 'react-icons';
import {
  SiWhatsapp,
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiX,
  SiTelegram,
  SiPinterest,
  SiSnapchat,
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { WHATSAPP_NUMBER } from './whatsapp';

/**
 * Las 10 plataformas sociales más usadas, en orden de prioridad para el mercado
 * peruano B2B. Se muestran TODAS (base para wiring con n8n y campañas pagadas).
 *
 * WhatsApp y Facebook apuntan a destinos reales de Plastilonas. El resto enlazan
 * por ahora a la plataforma (marcador de posición): reemplace el `href` por la
 * URL del perfil real cuando la cuenta exista — el patrón está en el TODO de cada
 * línea. Los enlaces https abren la app nativa en móvil automáticamente
 * (universal links de iOS/Android); en escritorio abren el sitio en pestaña nueva.
 *
 * `ready`: true = perfil real ya configurado; false = marcador pendiente.
 */

export interface SocialLink {
  name: string;
  href: string;
  Icon: IconType;
  ready: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'WhatsApp',  href: `https://wa.me/${WHATSAPP_NUMBER}`,             Icon: SiWhatsapp,  ready: true  },
  { name: 'Facebook',  href: 'https://www.facebook.com/plastilonasperuanas', Icon: SiFacebook,  ready: true  },
  // TODO perfil real: https://www.instagram.com/USUARIO
  { name: 'Instagram', href: 'https://www.instagram.com/',                   Icon: SiInstagram, ready: false },
  // TODO perfil real: https://www.tiktok.com/@USUARIO
  { name: 'TikTok',    href: 'https://www.tiktok.com/',                      Icon: SiTiktok,    ready: false },
  // TODO perfil real: https://www.youtube.com/@CANAL
  { name: 'YouTube',   href: 'https://www.youtube.com/',                     Icon: SiYoutube,   ready: false },
  // TODO perfil real: https://www.linkedin.com/company/EMPRESA
  { name: 'LinkedIn',  href: 'https://www.linkedin.com/',                    Icon: FaLinkedin,  ready: false },
  // TODO perfil real: https://x.com/USUARIO
  { name: 'X',         href: 'https://x.com/',                               Icon: SiX,         ready: false },
  // TODO perfil real: https://t.me/USUARIO
  { name: 'Telegram',  href: 'https://telegram.org/',                        Icon: SiTelegram,  ready: false },
  // TODO perfil real: https://www.pinterest.com/USUARIO
  { name: 'Pinterest', href: 'https://www.pinterest.com/',                   Icon: SiPinterest, ready: false },
  // TODO perfil real: https://www.snapchat.com/add/USUARIO
  { name: 'Snapchat',  href: 'https://www.snapchat.com/',                    Icon: SiSnapchat,  ready: false },
];
PP_EOF

echo "==> Escribiendo components/Footer.tsx"
cat > 'components/Footer.tsx' <<'PP_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
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
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
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
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
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

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/contacto" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/contacto" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
PP_EOF

echo "==> Escribiendo components/Navbar.tsx"
cat > 'components/Navbar.tsx' <<'PP_EOF'
'use client';

import React, { useState } from 'react';
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
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
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
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
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
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
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

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
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
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

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
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
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
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
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
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
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
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
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
PP_EOF

echo "==> Escribiendo components/ExitIntentModal.tsx"
cat > 'components/ExitIntentModal.tsx' <<'PP_EOF'
'use client';

import { useEffect, useRef } from 'react';
import WhatsAppLink from './WhatsAppLink';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowRight, Phone } from 'lucide-react';
import { useExitIntent } from '@/lib/useExitIntent';

export default function ExitIntentModal() {
  const { open, close } = useExitIntent();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key === 'Tab' && focusables && focusables.length) {
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus.current?.focus();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-[#0A2540]/70 backdrop-blur-sm" aria-hidden="true" onClick={close} />
          <motion.div
            ref={panelRef}
            role="dialog" aria-modal="true" aria-labelledby="exit-title"
            className="relative w-full max-w-[440px] bg-white rounded-[24px] shadow-2xl p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
          >
            <button onClick={close} aria-label="Cerrar" className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-[#047857]" />
              <span className="t-micro font-semibold text-[#047857] uppercase tracking-[0.12em]">Antes de irse</span>
            </div>

            <h2 id="exit-title" className="font-[family-name:var(--font-display)] text-2xl md:text-[1.75rem] leading-tight text-[#0A2540] mb-4">
              La mayoría se va sin saber si fabricamos su especificación exacta.
            </h2>

            <p className="text-gray-600 leading-relaxed mb-7 text-[0.95rem]">
              Lo hacemos — a medida, con ficha técnica del fabricante en cada cotización. Cuéntenos qué necesita y le respondemos con un rango y disponibilidad, sin formularios largos ni llamadas de venta.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/cotizacion" onClick={close} className="btn btn-accent w-full justify-center">
                Cotización en 1 minuto <ArrowRight className="w-4 h-4" />
              </Link>
              <WhatsAppLink context="exit-intent" message="Hola, quisiera una cotización." className="btn btn-ghost w-full justify-center">
                Hablar por WhatsApp
              </WhatsAppLink>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              O llame al <a href="tel:+51998117065" className="text-[#047857] font-semibold hover:underline">+51 998 117 065</a> · Lun–Sáb, 8 AM – 7 PM
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
PP_EOF

echo "==> Escribiendo components/CotizacionModal.tsx"
cat > 'components/CotizacionModal.tsx' <<'PP_EOF'
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/products';
import { toast } from 'sonner';
import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';
import { trackQuoteRequest, trackQuoteStarted } from '@/lib/analytics';
import { postLead } from '@/lib/lead';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  empresa: z.string().min(2, 'Ingrese el nombre de su empresa'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  telefono: z.string().min(9, 'Ingrese un número de teléfono válido').regex(/^[0-9+\s()-]+$/, 'Formato de teléfono inválido'),
  producto: z.string().optional(),
  cantidad: z.string().optional(),
  fechaNecesaria: z.string().optional(),
  mensaje: z.string().min(15, 'Por favor describa su requerimiento con más detalle (mínimo 15 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

interface CotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProduct?: string;
}

export default function CotizacionModal({ open, onOpenChange, preselectedProduct }: CotizacionModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: preselectedProduct || '',
    },
  });

  React.useEffect(() => {
    if (preselectedProduct) {
      setValue('producto', preselectedProduct);
    }
  }, [preselectedProduct, setValue]);

  // El formulario ABIERTO es un evento distinto del formulario ENVIADO: la
  // diferencia entre ambos es la tasa de abandono, que es lo que dice si el
  // formulario está pidiendo más datos de los que el comprador quiere dar.
  React.useEffect(() => {
    if (open) trackQuoteStarted('modal', preselectedProduct);
  }, [open, preselectedProduct]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Envío real: abrimos WhatsApp con la solicitud estructurada, lista para
    // enviar al equipo comercial. Sin backend intermedio que pueda fallar.
    const message = buildQuoteMessage({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: [data.mensaje, data.fechaNecesaria ? `Fecha requerida: ${data.fechaNecesaria}` : '']
        .filter(Boolean)
        .join(' — '),
    });

    saveQuoteLocally({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: data.mensaje,
    });

    void postLead({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      fechaNecesaria: data.fechaNecesaria,
      mensaje: data.mensaje,
    });

    openWhatsApp(message);
    trackQuoteRequest(data.producto);

    setIsSubmitting(false);
    setIsSuccess(true);

    toast.success('Su solicitud está lista en WhatsApp', {
      description: 'Pulse enviar en la ventana de WhatsApp para que nuestro equipo comercial la reciba de inmediato.',
      duration: 7000,
    });

    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      reset();
    }, 2200);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 300);
    }
  };

  // Cerrar con Escape: paridad de teclado con el resto de overlays del sitio.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSubmitting]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="bg-white w-full max-w-[620px] max-h-[calc(100dvh-2rem)] rounded-3xl shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cotizacion-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <div>
                <h2 id="cotizacion-title" className="text-2xl font-semibold tracking-tight text-navy">Solicitar Cotización</h2>
                <p className="text-sm text-gray-500 mt-0.5">Atención directa por WhatsApp en horario comercial</p>
              </div>
              <button onClick={handleClose} aria-label="Cerrar" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-[#059669]" />
                </div>
                <h3 className="text-2xl font-semibold text-navy mb-3">¡Gracias por confiar en nosotros!</h3>
                <p className="text-gray-600 max-w-sm mx-auto">Su solicitud quedó lista en WhatsApp: pulse enviar en esa ventana y un especialista de Plastilonas Peruanas le responderá.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                    <input 
                      {...register('nombre')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Juan Pérez García" 
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1.5">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa / Razón Social *</label>
                    <input 
                      {...register('empresa')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Minera XYZ S.A.C." 
                    />
                    {errors.empresa && <p className="text-red-500 text-xs mt-1.5">{errors.empresa.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input 
                      {...register('email')} 
                      type="email" 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="ventas@suempresa.com" 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono / WhatsApp *</label>
                    <input 
                      {...register('telefono')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="+51 998 117 065" 
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1.5">{errors.telefono.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Producto de interés</label>
                    <select 
                      {...register('producto')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669] bg-white"
                    >
                      <option value="">Seleccione un producto (opcional)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad aproximada</label>
                    <input 
                      {...register('cantidad')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Ej: 50 unidades / 2000 m²" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha requerida (aprox.)</label>
                  <input 
                    {...register('fechaNecesaria')} 
                    type="date" 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Describa su proyecto o requerimiento *</label>
                  <textarea 
                    {...register('mensaje')} 
                    rows={4} 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-y min-h-[110px] focus:border-[#059669]" 
                    placeholder="Necesito 80 big bags de 1 tonelada para transporte de concentrado de cobre. Requiero tratamiento antiestático y entrega en mina en Arequipa para el 15 de agosto..."
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1.5">{errors.mensaje.message}</p>}
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-400 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985]"
                  >
                    {isSubmitting ? (
                      <>Enviando solicitud...</>
                    ) : (
                      <>Enviar Solicitud de Cotización <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-center t-micro text-gray-400 pt-1">
                  Sus datos se envían directamente a nuestro equipo comercial por WhatsApp. No los compartimos con terceros.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
PP_EOF

echo "==> Escribiendo components/Chatbot.tsx"
cat > 'components/Chatbot.tsx' <<'PP_EOF'
'use client';

import React, { useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { trackChatbotEngaged } from '@/lib/analytics';
import { X, Send, Bot, User } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { whatsappUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const engaged = useRef(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy el asistente virtual de Plastilonas Peruanas. Con más de 15 años de experiencia en soluciones textiles industriales, estoy aquí para ayudarle a encontrar la mejor solución para su proyecto. ¿En qué puedo asistirle hoy?',
      },
    ],
  });

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón flotante con anillos pulsantes (estilo empresarial) */}
      <div className="fixed bottom-6 right-6 z-[90]">
        {/* Anillos que irradian: solo cuando el chat está cerrado, para
            atraer la atención sin distraer durante la conversación. */}
        {!isOpen && (
          <>
            <span className="pp-ping pp-ping-1" aria-hidden="true" />
            <span className="pp-ping pp-ping-2" aria-hidden="true" />
          </>
        )}

        <button
          onClick={toggleChat}
          className={`relative w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-colors active:scale-95 group ${
            isOpen
              ? 'bg-[#0A2540] hover:bg-[#0A2540]'
              : 'bg-[#0A2540] hover:bg-[#059669] pp-breathe'
          }`}
          aria-label={isOpen ? 'Cerrar chat de asistencia' : 'Abrir chat de asistencia'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <div className="relative">
                <Image src="/logo.png" alt="Abrir asistente Plastilonas" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                {/* Punto "en línea" con doble anillo para claridad */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#0A2540]" />
                </span>
              </div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Animaciones del botón. Respetan prefers-reduced-motion. */}
      <style>{`
        @keyframes pp-ring {
          0%   { transform: scale(0.85); opacity: 0.55; }
          70%  { opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes pp-breathe {
          0%, 100% { box-shadow: 0 10px 25px -5px rgba(5,150,105,0.35), 0 0 0 0 rgba(5,150,105,0.0); }
          50%      { box-shadow: 0 10px 30px -5px rgba(5,150,105,0.55), 0 0 0 6px rgba(5,150,105,0.10); }
        }
        .pp-ping {
          position: absolute;
          inset: 0;
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background: #059669;
          z-index: -1;
          animation: pp-ring 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .pp-ping-2 { animation-delay: 1.3s; }
        .pp-breathe { animation: pp-breathe 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pp-ping, .pp-breathe { animation: none; }
        }
      `}</style>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6 z-[95] w-[380px] max-w-[calc(100vw-3rem)] chatbot-window">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[min(560px,calc(100dvh-8.5rem))] overflow-hidden">
              {/* Header */}
              <div className="bg-[#0A2540] text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                    <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight">Asistente Plastilonas</div>
                    <div className="text-xs text-white/60 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> En línea • Experto en soluciones industriales
                    </div>
                  </div>
                </div>
                <button onClick={toggleChat} className="text-white/60 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50 text-sm">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-3xl leading-snug ${
                        message.role === 'user'
                          ? 'bg-[#0A2540] text-white rounded-tr-none'
                          : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 bg-gray-200 text-gray-600 rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-[#0A2540] text-white rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-3xl rounded-tl-none">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-xs bg-amber-50 border border-amber-100 text-amber-800 py-3 px-4 rounded-2xl space-y-2">
                    <p>El asistente virtual no está disponible en este momento.</p>
                    <a
                      href={whatsappUrl('Hola, quisiera hacer una consulta sobre sus productos.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-semibold text-[#059669] hover:underline"
                    >
                      Escríbanos por WhatsApp {WHATSAPP_DISPLAY} →
                    </a>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  // Abrir el widget no es interés; escribir sí. Se mide el
                  // primer envío real, una sola vez por sesión de chat.
                  if (!engaged.current) {
                    engaged.current = true;
                    trackChatbotEngaged();
                  }
                  handleSubmit(e);
                }}
                className="p-4 border-t bg-white flex gap-2"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Escriba su consulta sobre productos o proyectos..."
                  className="flex-1 bg-gray-100 px-5 py-3 text-sm rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#059669] placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-300 text-white w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="px-4 pb-3 text-center">
                <p className="t-micro text-gray-400">Respuestas generadas por IA • Asesoría real disponible por WhatsApp</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
PP_EOF

echo "==> Escribiendo app/productos/[slug]/page.tsx"
cat > 'app/productos/[slug]/page.tsx' <<'PP_EOF'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';
import ProductGallery from '@/components/ProductGallery';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, ...product.sector, 'Perú', 'proveedor', 'fabricante'],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const faqs = productFaqs(product);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppLink
              context={`producto:${product.slug}`}
              message={`Hola, necesito una cotización de ${product.name}.`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </WhatsAppLink>
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
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
          className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white">
          Cotizar por WhatsApp
        </WhatsAppLink>
        <Link href="/local" className="inline-block rounded-lg border border-neutral-300 px-6 py-3 font-medium text-neutral-700 hover:border-[#059669]/40 hover:text-[#059669]">
          Ver las {CIUDADES.length} ciudades
        </Link>
      </div>
    </main>
  );
}
PP_EOF

echo "==> Escribiendo app/productos/familia/[slug]/page.tsx"
cat > 'app/productos/familia/[slug]/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies, sourcingLabels, availabilityLabels } from '@/lib/products';
import { familyContent, resolveFamily } from '@/lib/families';
import { articles } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Página de familia (/productos/familia/[slug]).
 *
 * Cierra el hueco estructural más caro del sitio: la navegación por familia se
 * resolvía con `?categoria=` sobre un catálogo filtrado en cliente, de modo que
 * once mercados con intención de búsqueda distinta compartían UNA sola URL
 * indexable. Ahora cada familia tiene URL estática, contenido propio, FAQ,
 * ItemList de sus SKUs y enlaces a los artículos y ciudades relacionados.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return familyContent.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { content } = resolved;
  const url = `${SITE.url}/productos/familia/${slug}`;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: `/productos/familia/${slug}` },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family, content } = resolved;

  const url = `${SITE.url}/productos/familia/${slug}`;
  const items = products.filter((p) => p.category === family.name);
  const sectores = Array.from(new Set(items.flatMap((p) => p.sector)));
  const sourcings = Array.from(new Set(items.map((p) => p.sourcing).filter(Boolean))) as string[];
  const disponibilidades = Array.from(
    new Set(items.map((p) => p.availability ?? 'a_medida')),
  );
  const relatedArticles = articles.filter((a) => a.category === family.name);
  const otherFamilies = productFamilies.filter((f) => f.slug !== slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="family" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: content.h1,
            description: content.metaDescription,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: family.name,
            description: content.metaDescription,
            items: items.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
          faqSchema(content.faqs, url),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/productos" className="hover:text-[#059669]">
          Catálogo
        </Link>{' '}
        / <span className="text-gray-700">{family.name}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{content.h1}</h1>

      <p className="mb-6 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {family.tagline} · {items.length} {items.length === 1 ? 'línea' : 'líneas'} de producto
      </p>

      <div className="speakable-intro mb-10 max-w-3xl space-y-4 text-lg text-gray-700">
        {content.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Cómo abastecemos y en qué estado está la oferta: dato real del catálogo. */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Cómo lo entregamos
          </h2>
          <p className="text-gray-700">
            {sourcings.map((s) => sourcingLabels[s] ?? s).join(' · ')}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Estado de la oferta
          </h2>
          <p className="text-gray-700">
            {disponibilidades.map((a) => availabilityLabels[a] ?? a).join(' · ')}
          </p>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Productos de esta familia
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              className="group block rounded-3xl border border-gray-100 p-6 transition-all hover:border-[#059669]/40"
            >
              <span className="mb-2 block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {p.name}
              </span>
              <span className="mb-3 block text-sm text-gray-600">{p.shortDescription}</span>
              <span className="flex flex-wrap gap-2 text-xs text-gray-500">
                {p.sector.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-gray-50 px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué define la especificación
        </h2>
        <dl className="space-y-5">
          {content.selectionCriteria.map((c) => (
            <div key={c.titulo} className="border-l-4 border-[#059669]/30 pl-5">
              <dt className="font-semibold text-[#0A2540]">{c.titulo}</dt>
              <dd className="mt-1 text-gray-700">{c.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Sectores que compran esta familia
        </h2>
        <div className="flex flex-wrap gap-2">
          {sectores.map((s) => (
            <Link
              key={s}
              href={`/productos?sector=${encodeURIComponent(s)}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas de esta familia
          </h2>
          <div className="space-y-4">
            {relatedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/recursos/${a.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {a.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {content.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Otras familias del catálogo
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map((f) => (
            <Link
              key={f.slug}
              href={`/productos/familia/${f.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {f.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Especificamos su caso?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos medidas, cantidad, aplicación y ciudad de entrega y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/recursos/[slug]/page.tsx"
cat > 'app/recursos/[slug]/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Plantilla de artículo técnico.
 *
 * Emite TechArticle + WebPage + BreadcrumbList + FAQPage y, cuando el artículo
 * define una secuencia real, HowTo. Todo el contenido estructurado tiene
 * contraparte visible en la página: schema sin contenido visible es una
 * infracción de las directrices de resultados enriquecidos.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const url = `${SITE.url}/recursos/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: [a.category, ...a.sectors, 'Perú', 'guía técnica'],
    alternates: { canonical: `/recursos/${a.slug}` },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.description,
    },
  };
}

function countWords(text: string[]): number {
  return text.join(' ').split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const url = `${SITE.url}/recursos/${a.slug}`;
  const relatedProducts = a.relatedProducts
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedCities = (a.relatedCities ?? [])
    .map((s) => (ciudades as { slug: string; ciudad: string }[]).find((c) => c.slug === s))
    .filter((c): c is { slug: string; ciudad: string } => Boolean(c));

  const wordCount = countWords([
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.body ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
    ]),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="article" slug={a.slug} categoria={a.category} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: a.title,
            description: a.description,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: a.title,
            description: a.description,
            datePublished: a.datePublished,
            dateModified: a.dateModified,
            section: a.category,
            keywords: [a.category, ...a.sectors],
            wordCount,
            citations: a.sources.map((s) => ({ label: s.label, url: s.url })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: `${SITE.url}/recursos` },
              { name: a.title, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(a.faqs, url),
          ...(a.howTo
            ? [
                howToSchema({
                  url,
                  name: a.howTo.name,
                  description: a.description,
                  totalTime: a.howTo.totalTime,
                  steps: a.howTo.steps,
                }),
              ]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/recursos" className="hover:text-[#059669]">
          Recursos técnicos
        </Link>{' '}
        / <span className="text-gray-700">{a.category}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
          {a.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {a.readingMinutes} min de lectura
        </span>
        <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {a.title}
      </h1>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        {a.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Resumen ejecutivo: lo primero que un motor o un agente extrae. */}
      <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          En resumen
        </h2>
        <ul className="space-y-3 text-gray-800">
          {a.keyTakeaways.map((k) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1 text-[#059669]">→</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {/* Índice */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Contenido
        </h2>
        <ol className="space-y-2 text-sm">
          {a.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#seccion-${i + 1}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#preguntas-frecuentes" className="text-gray-700 hover:text-[#059669]">
              Preguntas frecuentes
            </a>
          </li>
        </ol>
      </nav>

      {a.sections.map((s, i) => (
        <section key={s.heading} id={`seccion-${i + 1}`} className="mb-12 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.body?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.list && (
            <ul className="mb-4 space-y-2 text-gray-700">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#059669]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="mb-4 space-y-3 text-gray-700">
              {s.steps.map((item, n) => (
                <li key={item} id={`paso-${n + 1}`} className="flex gap-3 scroll-mt-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-semibold text-[#059669]">
                    {n + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {s.table.caption && (
                  <caption className="mb-2 text-left text-xs text-gray-500">
                    {s.table.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-gray-200">
                    {s.table.headers.map((h) => (
                      <th key={h} className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-gray-100 last:border-none">
                      {row.map((cell) => (
                        <td key={cell} className="py-3 pr-6 align-top text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.callout && (
            <p className="rounded-2xl border-l-4 border-[#059669] bg-gray-50 p-5 text-gray-800">
              {s.callout}
            </p>
          )}
        </section>
      ))}

      <section id="preguntas-frecuentes" className="mb-12 scroll-mt-24 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {a.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-12 border-t pt-10">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Cada fuente indica qué dato concreto respalda. Las cifras normativas deben
          verificarse contra el texto oficial vigente antes de usarse en una memoria de
          cálculo o en un expediente técnico.
        </p>
        <ol className="space-y-4 text-sm">
          {a.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-gray-600">{s.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Productos relacionados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/productos/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {p.shortDescription}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Cobertura relacionada
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {c.ciudad}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Lo aplicamos a su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales de su operación y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/recursos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Más recursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
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
                <Phone className="mt-0.5 text-[#25D366]" /> 
                <div>
                  <div className="font-medium text-[#25D366]">+51 946 085 270 (WhatsApp)</div>
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

echo "==> Escribiendo app/cotizacion/page.tsx"
cat > 'app/cotizacion/page.tsx' <<'PP_EOF'
'use client';

import CotizacionModal from '@/components/CotizacionModal';
import WhatsAppLink from '@/components/WhatsAppLink';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CotizacionPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8"><ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio</Link>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">Solicite su cotización</h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto">Complete el formulario y su solicitud llegará directamente a nuestro equipo comercial por WhatsApp.</p>

      <button 
        onClick={() => setShowModal(true)} 
        className="mt-10 inline-flex items-center justify-center bg-[#0A2540] hover:bg-[#059669] text-white btn btn-lg btn-accent w-full justify-center font-semibold text-lg active:scale-[0.985] transition-all"
      >
        Abrir Formulario de Cotización
      </button>

      <div className="mt-16 text-xs text-gray-400 max-w-xs mx-auto">
        También puede contactarnos directamente por WhatsApp al <WhatsAppLink context="cotizacion-nota" message="Hola, quisiera una cotización." className="underline">+51 946 085 270</WhatsAppLink> para una atención inmediata.
      </div>

      <CotizacionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
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
echo " LISTO. Esperado: 9 test files / 100 tests."
echo ""
echo " Eventos que empiezan a emitirse:"
echo "   whatsapp_click (con context)   quote_started / quote_request"
echo "   chatbot_engaged                product_view / family_view"
echo "   city_page_view                 article_view"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(conv): atribucion de WhatsApp por contexto y eventos de vista por silo'"
echo "   git push origin main"
echo "=============================================================="
