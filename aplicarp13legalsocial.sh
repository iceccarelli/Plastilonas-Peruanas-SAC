#!/usr/bin/env bash
# =============================================================================
#  P13 — Perfiles reales y avisos legales que existen
#  Plastilonas Peruanas SAC
#
#  Tres defectos de código preexistente, encontrados leyendo el HTML servido
#  en producción:
#
#  1. OCHO PERFILES SOCIALES FALSOS en las 157 páginas. lib/social.ts tenía un
#     campo `ready` para distinguir perfil real de marcador, y el componente lo
#     ignoraba: Instagram, TikTok, YouTube, LinkedIn, X, Telegram, Pinterest y
#     Snapchat enlazaban a la PORTADA de cada plataforma. Quien hacía clic en
#     "LinkedIn" aterrizaba en linkedin.com. Rompía la confianza del comprador
#     en el pie, mandaba ocho enlaces salientes genéricos desde cada página y
#     emitía eventos social_click sin significado. Ahora sólo se renderizan
#     WhatsApp y Facebook — los dos destinos reales.
#
#  2. "Política de Privacidad" y "Términos y Condiciones" ENLAZABAN A
#     /contacto. No existían las páginas. El sitio carga GA4, Meta Pixel y GTM,
#     recibe leads y cobra con Stripe sin publicar un aviso de tratamiento.
#     Se publican /privacidad y /terminos redactados desde lo que el código
#     realmente hace, con el origen de cada afirmación documentado en
#     lib/legal.ts. Cero cláusulas inventadas: ningún plazo de garantía,
#     ninguna política de devolución, ninguna certificación.
#
#  3. El enlace "Volver arriba" apuntaba a #top y no existía ningún elemento
#     con ese id: no hacía nada.
#
#  Los tres quedan fijados por 13 tests nuevos.
#
#  IMPORTANTE: los avisos legales describen el comportamiento del sitio con
#  precisión, pero conviene que su abogado los revise antes de considerarlos
#  definitivos. Es más seguro tenerlos que no tenerlos; no sustituyen asesoría.
#
#  Uso:
#    ls aplicar*p13*
#    bash aplicarp13legalsocial.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/social.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/social.ts" <<'P13_EOF'
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
 * Perfiles sociales. SOLO se renderizan los que apuntan a una cuenta real.
 *
 * Por qué. Esta lista se mostraba entera, incluidos ocho marcadores que
 * enlazaban a la portada de la plataforma: quien hacía clic en "LinkedIn"
 * aterrizaba en linkedin.com, no en la empresa. Eso es tres defectos a la vez —
 * rompe la confianza del comprador justo en el pie de página, manda ocho
 * enlaces salientes a portadas genéricas desde las 157 páginas del sitio, y
 * emite eventos `social_click` que no significan nada.
 *
 * Es la misma regla que ya gobierna `SITE.sameAs`: un perfil ausente es
 * infinitamente mejor que uno falso. La lista de marcadores se conserva como
 * dato — con el patrón de URL real en cada TODO — para que el día que exista
 * la cuenta baste cambiar el href y poner `ready: true`. Un test impide que
 * un marcador vuelva a renderizarse.
 *
 * Los enlaces https abren la app nativa en móvil (universal links de
 * iOS/Android); en escritorio abren el sitio en pestaña nueva.
 *
 * `ready`: true = perfil real verificado; false = marcador, NO se renderiza.
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

/**
 * Los únicos enlaces que el sitio puede mostrar. Toda superficie que pinte
 * iconos sociales debe consumir ESTA función, nunca SOCIAL_LINKS directamente.
 */
export const readySocialLinks = (): SocialLink[] => SOCIAL_LINKS.filter((l) => l.ready);

/** Marcadores pendientes de cuenta real. Existe para que los tests los vigilen. */
export const pendingSocialLinks = (): SocialLink[] => SOCIAL_LINKS.filter((l) => !l.ready);
P13_EOF

# -----------------------------------------------------------------------------
# components/SocialIcons.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/SocialIcons.tsx" <<'P13_EOF'
"use client";

import { readySocialLinks } from "@/lib/social";
import { trackSocialClick } from "@/lib/analytics";

interface Props {
  variant?: "dark" | "light";
  className?: string;
}

export default function SocialIcons({ variant = "dark", className = "" }: Props) {
  const base =
    variant === "dark"
      ? "text-white/50 hover:text-white hover:bg-white/10 border-white/10"
      : "text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 border-gray-200";

  const links = readySocialLinks();
  // Sin ningún perfil real no se pinta el contenedor: una fila de iconos vacía
  // deja un hueco en el pie que parece un fallo de carga.
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-social={name.toLowerCase()}
          onClick={() => trackSocialClick(name)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${base}`}
          title={name}
          aria-label={name}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# lib/legal.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/legal.ts" <<'P13_EOF'
import { SITE } from './site';

/**
 * AVISOS LEGALES — descripción factual del comportamiento real del sitio.
 *
 * REGLA QUE GOBIERNA ESTE ARCHIVO: cada afirmación describe algo que el código
 * hace hoy y que se puede verificar leyéndolo. No se declara ninguna práctica
 * de tratamiento que el sitio no ejecute, ningún plazo de garantía, ninguna
 * política de devolución y ninguna certificación. Inventar una cláusula de
 * privacidad es peor que no tenerla: promete un tratamiento que nadie
 * implementó.
 *
 * Origen de cada dato declarado, para que la revisión sea posible:
 *  - Formulario de cotización → components/CotizacionModal.tsx y lib/lead.ts
 *  - Reenvío del lead          → app/api/lead/route.ts (webhook n8n)
 *  - Pago con tarjeta          → app/api/checkout/stripe/route.ts y lib/peru.ts
 *  - Analítica y consentimiento→ components/Analytics.tsx, ConsentBanner.tsx
 *  - Asistente de IA           → app/api/chat/route.ts
 *  - Autoevaluación del marco  → lib/framework-brief.ts (se genera en el navegador)
 *
 * LEY APLICABLE citada: Ley N.º 29733, Ley de Protección de Datos Personales
 * (Perú), y su reglamento. Se cita la norma, no un número de artículo que no
 * pudiéramos respaldar.
 *
 * FECHA: se actualiza a mano cuando cambia el tratamiento, no en cada
 * despliegue. Un aviso legal con fecha automática no acredita nada.
 */

export const LEGAL_UPDATED = '2026-08-19';

export interface LegalSection {
  heading: string;
  body?: string[];
  list?: string[];
}

export const privacidad: LegalSection[] = [
  {
    heading: 'Quién trata sus datos',
    body: [
      `${SITE.legalName}, con RUC ${SITE.ruc} y domicilio en ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú, es responsable del tratamiento de los datos personales que usted proporcione a través de este sitio.`,
      `Cualquier consulta sobre este aviso o sobre sus datos se atiende en ${SITE.email} o en el ${SITE.phoneCentral}.`,
    ],
  },
  {
    heading: 'Qué datos recogemos y para qué',
    body: [
      'Este sitio no exige registro para leer nada. El catálogo, las guías técnicas, las fichas en PDF, el Marco de Especificación y las arquitecturas de referencia son de acceso libre y no piden ningún dato.',
      'Los datos se recogen únicamente en tres momentos, y en cada uno usted decide entregarlos:',
    ],
    list: [
      'Solicitud de cotización: nombre, empresa, correo electrónico, teléfono, producto de interés, cantidad y el mensaje que usted escriba. Se usan para preparar y enviarle la cotización solicitada.',
      'Compra con pago en línea: nombre, correo, teléfono, RUC si lo indica, dirección, distrito, provincia, departamento y las referencias de entrega que agregue. Se usan para emitir el comprobante y despachar el pedido.',
      'Conversación con el asistente del sitio: el texto que usted escriba en el chat, para responder su consulta durante esa sesión.',
    ],
  },
  {
    heading: 'Qué NO recogemos',
    list: [
      'No pedimos ni almacenamos números de tarjeta. El pago se procesa íntegramente en la plataforma de Stripe: los datos de la tarjeta se introducen en su entorno y este sitio nunca los recibe.',
      'La autoevaluación del Marco de Especificación se ejecuta enteramente en su navegador. Sus respuestas y el brief que descarga no se envían a ningún servidor, ni al nuestro ni a terceros.',
      'No compramos, vendemos ni alquilamos bases de datos de contactos.',
    ],
  },
  {
    heading: 'Con quién se comparten',
    body: [
      'Los datos se comparten únicamente con los proveedores necesarios para prestar el servicio que usted pidió, y solo con ese fin:',
    ],
    list: [
      'La solicitud de cotización se reenvía a nuestro sistema interno de gestión de pedidos para que un asesor la atienda.',
      'El pago con tarjeta se procesa en Stripe, que actúa como pasarela de pago y aplica sus propias condiciones.',
      'La conversación del asistente se procesa mediante un modelo de lenguaje de Anthropic para generar la respuesta.',
      'El sitio se aloja en la infraestructura de Vercel, que registra datos técnicos de conexión propios de cualquier servidor web.',
      'Si usted nos escribe por WhatsApp, esa conversación ocurre dentro de WhatsApp y se rige por las condiciones de esa plataforma, no por este aviso.',
    ],
  },
  {
    heading: 'Analítica y cookies',
    body: [
      'El sitio puede cargar herramientas de medición de tráfico (Google Analytics, Meta Pixel, Google Tag Manager) para entender qué contenido es útil. Estas herramientas usan cookies e identificadores del navegador.',
      'Cuando el sitio opera con banner de consentimiento activo, ninguna de estas herramientas se carga hasta que usted acepta: su decisión se guarda en el almacenamiento local de su navegador y puede revocarla borrando los datos del sitio.',
      'La preferencia de tema claro u oscuro también se guarda en su navegador y no se envía a ningún servidor.',
    ],
  },
  {
    heading: 'Cuánto tiempo se conservan',
    body: [
      'Las solicitudes de cotización y los datos de pedidos se conservan mientras dure la relación comercial y por el plazo que exige la normativa tributaria y contable peruana para el sustento de operaciones.',
      'Si desea que dejemos de tratar sus datos antes de ese plazo, escríbanos y le indicaremos qué información estamos obligados a conservar y por qué.',
    ],
  },
  {
    heading: 'Sus derechos',
    body: [
      'La Ley N.º 29733, Ley de Protección de Datos Personales, le reconoce los derechos de acceso, rectificación, cancelación y oposición sobre sus datos personales.',
      `Para ejercerlos escriba a ${SITE.email} indicando su nombre y el dato al que se refiere. Le responderemos por el mismo medio. Si considera que su solicitud no fue atendida adecuadamente, puede acudir a la Autoridad Nacional de Protección de Datos Personales.`,
    ],
  },
  {
    heading: 'Cambios en este aviso',
    body: [
      'Si cambia la forma en que tratamos los datos, actualizamos este aviso y su fecha. La fecha se modifica solo cuando cambia el tratamiento: un aviso legal cuya fecha se mueve en cada despliegue no acredita nada.',
    ],
  },
];

export const terminos: LegalSection[] = [
  {
    heading: 'Qué son estas condiciones',
    body: [
      `Estas condiciones describen cómo funciona la relación comercial con ${SITE.legalName} (RUC ${SITE.ruc}) a través de este sitio. No sustituyen a la cotización: lo que se pacta por escrito en cada cotización prevalece sobre cualquier texto general de esta página.`,
    ],
  },
  {
    heading: 'Venta por cotización',
    body: [
      'La mayor parte del catálogo es fabricación a medida y venta entre empresas. Por eso no publicamos precios de lista: cada proyecto se cotiza según especificación, metraje, cantidad y logística de entrega.',
      'El precio, el plazo de entrega, las condiciones de pago y el alcance de la garantía son los que consten en la cotización escrita que reciba. Ninguna cifra publicada en este sitio, en un buscador o en un tercero constituye una oferta de precio.',
    ],
  },
  {
    heading: 'Especificaciones técnicas',
    body: [
      'Las especificaciones, aplicaciones y sectores publicados en cada ficha se mantienen actualizados desde nuestro catálogo y son referenciales para preseleccionar. La especificación definitiva de su proyecto se confirma en la cotización.',
      'Las guías técnicas, el Marco de Especificación y las arquitecturas de referencia son material de consulta: describen criterios de ingeniería y métodos de prediseño reproducibles. No son una memoria de cálculo firmada ni sustituyen la revisión de un profesional responsable de la obra.',
      'Las fichas técnicas y los certificados del fabricante correspondientes al lote suministrado se entregan con la cotización o con el despacho, según corresponda.',
    ],
  },
  {
    heading: 'Compra en línea',
    body: [
      'Las líneas que admiten compra directa se pagan a través de Stripe. La confirmación del pedido y el comprobante se emiten a nombre de los datos que usted registre en el proceso de compra.',
      'Para pedidos a medida, por volumen o con requisitos de entrega en obra, el canal correcto es la cotización, no el carrito.',
    ],
  },
  {
    heading: 'Contenido del sitio',
    body: [
      'Los textos, guías, fichas, criterios y arquitecturas publicados son propiedad de la empresa y pueden citarse indicando la fuente y el enlace. Su reproducción íntegra con fines comerciales requiere autorización escrita.',
      'El Marco de Especificación es de consulta pública y libre, incluso para evaluar propuestas de otros proveedores. Esa es su razón de ser.',
    ],
  },
  {
    heading: 'Disponibilidad del sitio',
    body: [
      'Procuramos que el sitio esté disponible de forma continua, pero no garantizamos ausencia de interrupciones por mantenimiento o por causas ajenas a nuestro control. El canal comercial siempre disponible es el WhatsApp y la central telefónica publicados.',
    ],
  },
  {
    heading: 'Ley aplicable',
    body: [
      'Estas condiciones se rigen por la legislación peruana. Cualquier controversia se somete a los jueces y tribunales del distrito judicial de Lima, salvo pacto distinto en la cotización o el contrato correspondiente.',
    ],
  },
];
P13_EOF

# -----------------------------------------------------------------------------
# lib/legal-page.tsx
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/legal-page.tsx" <<'P13_EOF'
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { SITE } from '@/lib/site';
import { LEGAL_UPDATED, type LegalSection } from '@/lib/legal';

/**
 * Plantilla compartida de los avisos legales.
 *
 * /privacidad y /terminos tienen la misma estructura; duplicar el marcado
 * garantiza que dentro de seis meses uno de los dos se quede sin la fecha de
 * actualización o sin el breadcrumb.
 */

export function LegalPage({
  path,
  h1,
  intro,
  sections,
  breadcrumbName,
}: {
  path: string;
  h1: string;
  intro: string;
  sections: LegalSection[];
  breadcrumbName: string;
}) {
  const url = `${SITE.url}${path}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: h1,
            description: intro,
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: breadcrumbName, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">{breadcrumbName}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{h1}</h1>

      <p className="mb-3 text-lg text-gray-700">{intro}</p>

      <p className="mb-12 font-mono text-sm text-gray-500">
        Última actualización: {LEGAL_UPDATED} · {SITE.legalName} · RUC {SITE.ruc}
      </p>

      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
              {s.heading}
            </h2>
            {s.body?.map((p) => (
              <p key={p} className="mb-4 text-gray-700">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-2 space-y-3">
                {s.list.map((li) => (
                  <li key={li} className="border-l-4 border-[#059669]/30 pl-5 text-gray-700">
                    {li}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-gray-100 p-8">
        <p className="mb-5 text-gray-700">
          ¿Alguna consulta sobre este aviso, sobre sus datos o sobre las condiciones de
          una cotización? Escríbanos y le respondemos por el mismo medio.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Contacto
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </div>
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# app/privacidad/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/privacidad"
cat > "app/privacidad/page.tsx" <<'P13_EOF'
import type { Metadata } from 'next';
import { privacidad } from '@/lib/legal';
import { LegalPage } from '@/lib/legal-page';
import { SITE } from '@/lib/site';

const TITLE = 'Política de privacidad';
const INTRO = `Qué datos recoge este sitio, con qué finalidad, con quién se comparten y cómo ejercer sus derechos. Describe el comportamiento real del sitio, no un texto genérico.`;

export const metadata: Metadata = {
  title: TITLE,
  description: `Política de privacidad de ${SITE.legalName} (RUC ${SITE.ruc}): datos recogidos en cotizaciones y pedidos, encargados de tratamiento, cookies de analítica y derechos bajo la Ley N.º 29733.`,
  alternates: { canonical: '/privacidad' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: INTRO,
    url: `${SITE.url}/privacidad`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      path="/privacidad"
      h1={TITLE}
      intro={INTRO}
      sections={privacidad}
      breadcrumbName="Privacidad"
    />
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# app/terminos/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/terminos"
cat > "app/terminos/page.tsx" <<'P13_EOF'
import type { Metadata } from 'next';
import { terminos } from '@/lib/legal';
import { LegalPage } from '@/lib/legal-page';
import { SITE } from '@/lib/site';

const TITLE = 'Términos y condiciones';
const INTRO = `Cómo funciona la relación comercial: venta por cotización, alcance de las especificaciones publicadas, compra en línea y uso del contenido técnico del sitio.`;

export const metadata: Metadata = {
  title: TITLE,
  description: `Términos y condiciones de ${SITE.legalName}: venta B2B por cotización sin precios de lista, alcance de las fichas y guías técnicas, compra en línea y ley aplicable.`,
  alternates: { canonical: '/terminos' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: INTRO,
    url: `${SITE.url}/terminos`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function TerminosPage() {
  return (
    <LegalPage
      path="/terminos"
      h1={TITLE}
      intro={INTRO}
      sections={terminos}
      breadcrumbName="Términos y condiciones"
    />
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# test/legal-social.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/legal-social.test.ts" <<'P13_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOCIAL_LINKS, readySocialLinks, pendingSocialLinks } from '@/lib/social';
import { privacidad, terminos, LEGAL_UPDATED } from '@/lib/legal';
import { SITE } from '@/lib/site';
import sitemap from '@/app/sitemap';

/**
 * Dos defectos que este archivo impide que vuelvan:
 *  1. Ocho perfiles sociales falsos renderizados en las 157 páginas.
 *  2. "Política de Privacidad" y "Términos y Condiciones" enlazando a /contacto.
 */

/** Portadas de plataforma: si un href es una de estas, no es un perfil. */
const PORTADAS = [
  'https://www.instagram.com/',
  'https://www.tiktok.com/',
  'https://www.youtube.com/',
  'https://www.linkedin.com/',
  'https://x.com/',
  'https://telegram.org/',
  'https://www.pinterest.com/',
  'https://www.snapchat.com/',
  'https://www.facebook.com/',
];

describe('perfiles sociales: ninguno falso a la vista', () => {
  it('ningún enlace renderizado apunta a la portada de la plataforma', () => {
    for (const l of readySocialLinks()) {
      expect(PORTADAS.includes(l.href), `${l.name} → ${l.href}`).toBe(false);
    }
  });

  it('todo enlace renderizado está marcado como perfil real', () => {
    for (const l of readySocialLinks()) expect(l.ready).toBe(true);
    expect(readySocialLinks().length).toBeGreaterThan(0);
  });

  it('los marcadores pendientes siguen existiendo como dato, sin renderizarse', () => {
    // Se conservan con su TODO para que activarlos sea cambiar una línea.
    const pendientes = pendingSocialLinks();
    expect(pendientes.length + readySocialLinks().length).toBe(SOCIAL_LINKS.length);
    for (const l of pendientes) expect(readySocialLinks()).not.toContain(l);
  });

  it('el componente consume readySocialLinks, nunca la lista completa', () => {
    const src = readFileSync(join(process.cwd(), 'components/SocialIcons.tsx'), 'utf8');
    expect(src).toMatch(/readySocialLinks/);
    expect(src).not.toMatch(/SOCIAL_LINKS\.map/);
  });

  it('cada perfil real aparece también en SITE.sameAs, salvo el enlace de WhatsApp', () => {
    // sameAs describe la entidad; un perfil visible que no está en el grafo es
    // una señal desperdiciada. wa.me es un canal de contacto, no un perfil.
    for (const l of readySocialLinks()) {
      if (l.href.startsWith('https://wa.me/')) continue;
      expect(SITE.sameAs, l.name).toContain(l.href);
    }
  });

  it('SITE.sameAs no contiene portadas de plataforma', () => {
    for (const u of SITE.sameAs) expect(PORTADAS.includes(u), u).toBe(false);
  });
});

describe('avisos legales: existen y describen el sitio real', () => {
  it('el pie enlaza a las páginas legales, no a /contacto', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    expect(footer).toMatch(/href="\/privacidad"/);
    expect(footer).toMatch(/href="\/terminos"/);
    // El fallo original: ambos enlaces legales apuntaban al formulario.
    expect(footer).not.toMatch(/href="\/contacto"[^>]*>\s*Política de Privacidad/);
  });

  it('el ancla "Volver arriba" tiene destino real', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
    if (footer.includes('href="#top"')) expect(layout).toMatch(/id="top"/);
  });

  it('ambos avisos tienen secciones con contenido', () => {
    for (const doc of [privacidad, terminos]) {
      expect(doc.length).toBeGreaterThan(3);
      for (const s of doc) {
        expect(s.heading.length).toBeGreaterThan(3);
        expect((s.body?.length ?? 0) + (s.list?.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });

  it('la identidad declarada sale de lib/site.ts y no está escrita a mano', () => {
    const texto = [...privacidad, ...terminos]
      .flatMap((s) => [...(s.body ?? []), ...(s.list ?? [])])
      .join(' ');
    expect(texto).toContain(SITE.ruc);
    expect(texto).toContain(SITE.email);
    expect(texto).toContain(SITE.legalName);
  });

  it('no se prometen plazos, garantías ni certificaciones inventadas', () => {
    // La regla de la casa: la cotización manda. Un plazo publicado que nadie
    // puede cumplir es peor que no publicar ninguno.
    const texto = [...privacidad, ...terminos]
      .flatMap((s) => [...(s.body ?? []), ...(s.list ?? [])])
      .join(' ');
    expect(texto).not.toMatch(/\b\d+\s*(días|dias|meses|años|anios)\s+de\s+(garantía|garantia|devoluci)/i);
    expect(texto).not.toMatch(/certificad[oa]s?\s+(ISO|bajo la norma)/i);
    expect(texto).not.toMatch(/entrega en \d+ (días|dias|horas)/i);
  });

  it('la fecha del aviso es ISO y no se mueve en cada despliegue', () => {
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const legal = readFileSync(join(process.cwd(), 'lib/legal.ts'), 'utf8');
    expect(legal).not.toMatch(/new Date\(\)/);
  });

  it('el sitemap publica ambas páginas legales con la fecha del aviso', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    for (const path of ['/privacidad', '/terminos']) {
      const lastMod = urls.get(`${SITE.url}${path}`);
      expect(lastMod, path).toBeDefined();
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(LEGAL_UPDATED);
    }
  });
});
P13_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P13_EOF'
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
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
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
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
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
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# app/layout.tsx
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/layout.tsx" <<'P13_EOF'
import ExitIntentModal from '@/components/ExitIntentModal';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';
import StructuredData from '@/components/StructuredData';
import { SITE } from '@/lib/site';
import Analytics from '@/components/Analytics';
import WebPush from '@/components/WebPush';
import ConsentBanner from '@/components/ConsentBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});

// Mono para metadatos técnicos (specs, estados, conteos).
// Patrón AWS: la monoespaciada señala "dato de ingeniería", no marketing.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    template: '%s | Plastilonas Peruanas SAC',
  },
  description: 'Más de 15 años fabricando e instalando soluciones industriales a medida en el Perú: big bags, lonas y cobertores, geosintéticos, estructuras y arquitectura textil, mallas agrícolas, ventilación industrial y más. Un solo proveedor, fabricación propia e instalación.',
  keywords: [
    'plastilonas peruanas',
    'big bags lima',
    'geomembranas perú',
    'carpas industriales',
    'mantas para camiones',
    'lona plastificada',
    'soluciones textiles industriales',
    'fabricación a medida perú',
    'big bags minería',
    'geomembrana pvc',
  ],
  authors: [{ name: 'Plastilonas Peruanas SAC' }],
  creator: 'Plastilonas Peruanas SAC',
  publisher: 'Plastilonas Peruanas SAC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.
  metadataBase: new URL(SITE.url),
  // Verificación de propiedad en Search Console y Bing Webmaster Tools.
  // Se emiten SOLO si la variable existe: una meta de verificación vacía o
  // inventada no verifica nada y ensucia el <head>.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    title: 'Plastilonas Peruanas SAC | Soluciones Textiles Industriales — Fabricación e Importación Directa',
    description: 'Portafolio integral de soluciones textiles industriales en el Perú: big bags, geosintéticos, estructuras y arquitectura textil, mallas, ventilación y lonas a medida. Fabricación propia, instalación e importación directa.',
    // og:image lo genera app/opengraph-image.tsx (antes apuntaba a un archivo
    // inexistente /images/og-image.jpg y las vistas previas salían en blanco).
    locale: 'es_PE',
    type: 'website',
  },
  // Favicon y apple-touch-icon estáticos: app/icon.png y app/apple-icon.png
  // (Next los detecta automáticamente).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Feed del registro fechado, declarado en TODO el sitio. Va como JSX
            y no en `metadata.alternates`: cada página declara su propio
            `alternates.canonical`, y Next reemplaza el objeto entero, de modo
            que el enlace del feed desaparecía en todas menos en /novedades. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Novedades — ${SITE.name}`}
          href={`${SITE.url}/novedades/rss.xml`}
        />
        {/* Aplica el tema antes del primer pintado: sin esto, una carga en
            modo oscuro parpadea en blanco. Debe ser sincrono y estar en <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      {/* bg/text salen de los tokens de globals.css: las utilidades de Tailwind
          (0,1,0) ganaban al selector body (0,0,1) y anulaban .dark */}
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        {/* Destino del enlace "Volver arriba" del pie: apuntaba a #top y no
            existía ningún elemento con ese id, de modo que no hacía nada. */}
        <span id="top" aria-hidden="true" />
        <StructuredData />
        <Analytics />
        <WebPush />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Chatbot />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
              <ExitIntentModal />
        <ConsentBanner />
      </body>
    </html>
  );
}
P13_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P13_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P13_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P13_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Política de privacidad](${base}/privacidad)
- [Términos y condiciones](${base}/terminos)
- [Novedades](${base}/novedades)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P13_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P13_EOF'
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
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['novedades', '/novedades'],
  ['privacidad', '/privacidad'],
  ['terminos', '/terminos'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
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
P13_EOF

# -----------------------------------------------------------------------------
echo ""
echo "P13 aplicado."
echo "  nuevos      lib/legal.ts, lib/legal-page.tsx"
echo "              app/privacidad/page.tsx, app/terminos/page.tsx"
echo "              test/legal-social.test.ts"
echo "  modificados lib/social.ts, components/SocialIcons.tsx,"
echo "              components/Footer.tsx, app/layout.tsx, app/sitemap.ts,"
echo "              app/llms.txt/route.ts, scripts/audit-ui.mjs"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 207 tests en 16 archivos)"
